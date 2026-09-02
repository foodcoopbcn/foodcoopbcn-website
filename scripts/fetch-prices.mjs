#!/usr/bin/env node
/*
 * Collects today's prices for the basket in scripts/lib/basket.mjs and writes
 * src/data/prices.json, which the site renders at build time.
 *
 * Safety over freshness: a store or item that cannot be fetched (network, WAF, changed
 * markup, implausible price) keeps its last good value and its old `fetchedAt`; the site
 * hides anything older than a week. The run only fails when FoodCoop's own data is
 * unusable, since a comparison without the co-op's prices is pointless.
 *
 *   node scripts/fetch-prices.mjs            # fetch and write
 *   node scripts/fetch-prices.mjs --dry-run  # fetch, print, write nothing
 *   node scripts/fetch-prices.mjs --store mercadona
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { BASKET, STORES } from './lib/basket.mjs';
import { ADAPTERS } from './lib/stores.mjs';
import { PricesSchema, emptyPrices } from './lib/prices-schema.mjs';
import { isEcoName } from './lib/units.mjs';

const OUT = new URL('../src/data/prices.json', import.meta.url);
const MIN_FOODCOOP_ITEMS = 6;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const only = args.includes('--store') ? args[args.indexOf('--store') + 1] : null;
const inCI = Boolean(process.env.GITHUB_ACTIONS);

const warnings = [];
const warn = (msg) => {
  warnings.push(msg);
  console.warn(inCI ? `::warning::${msg}` : `warning: ${msg}`);
};

async function loadPrevious() {
  try {
    return PricesSchema.parse(JSON.parse(await readFile(OUT, 'utf8')));
  } catch {
    return emptyPrices();
  }
}

/** Rejects numbers that cannot be right, comparing with yesterday's value when we have one. */
function sanity(storeId, item, product, previous) {
  if (!(product.packPrice > 0) || !(product.packQty > 0)) throw new Error('non-positive price or pack size');
  if (product.unit !== item.unit) throw new Error(`unit ${product.unit} does not match basket unit ${item.unit}`);
  if (previous && previous.productId === product.productId) {
    const ratio = product.packPrice / previous.packPrice;
    if (ratio < 0.2 || ratio > 5) throw new Error(`price ${product.packPrice} is implausible vs previous ${previous.packPrice}`);
  }
  const cfgEco = item.stores[storeId].eco;
  if (cfgEco === undefined && isEcoName(product.name) !== product.eco) {
    warn(`${storeId}/${item.id}: eco flag ${product.eco} disagrees with the name "${product.name}"`);
  }
}

async function collectStore(store, previous, now) {
  const adapter = ADAPTERS[store.id];
  const prev = previous.stores[store.id] ?? { fetchedAt: null, lastAttemptAt: null, lastError: null, items: {} };
  const ctx = { cache: {} };
  const items = { ...prev.items };
  let ok = 0;
  let failed = 0;
  const report = {};
  for (const item of BASKET) {
    const cfg = item.stores[store.id];
    if (!cfg || !cfg.productId) {
      report[item.id] = 'not configured';
      continue;
    }
    try {
      const product = await adapter.fetchItem(cfg, ctx);
      if (cfg.eco !== undefined) product.eco = cfg.eco;
      if (store.id !== 'foodcoop' && cfg.packQty) Object.assign(product, { packQty: cfg.packQty, unit: cfg.unit ?? product.unit });
      /* Adapter cross-checks are advisory (drained weights, tea by bag…): log, don't annotate. */
      if (product.warn && !cfg.packQty) console.log(`  note ${store.id}/${item.id}: ${product.warn}`);
      delete product.warn;
      sanity(store.id, item, product, prev.items[item.id]);
      items[item.id] = { fetchedAt: now, ...product };
      ok++;
      report[item.id] = `${product.packPrice.toFixed(2)} € / ${product.packQty} ${product.unit}`;
    } catch (err) {
      failed++;
      report[item.id] = `FAILED (${err.message})`;
      warn(`${store.id}/${item.id}: ${err.message}${prev.items[item.id] ? ' — keeping previous value' : ''}`);
    }
  }
  const storeFailed = ok === 0 && failed > 0;
  return {
    block: {
      fetchedAt: ok > 0 ? now : prev.fetchedAt,
      lastAttemptAt: now,
      lastError: storeFailed ? report[Object.keys(report).find((k) => report[k].startsWith('FAILED'))] : null,
      items,
    },
    ok,
    failed,
    report,
  };
}

const now = new Date().toISOString();
const previous = await loadPrevious();
const next = { version: 1, generatedAt: now, stores: { ...previous.stores } };
const summary = [];

for (const store of STORES) {
  if (only && store.id !== only) continue;
  console.log(`\n# ${store.label}`);
  const { block, ok, failed, report } = await collectStore(store, previous, now);
  next.stores[store.id] = block;
  for (const [id, line] of Object.entries(report)) console.log(`  ${id.padEnd(20)} ${line}`);
  console.log(`  → ${ok} ok, ${failed} failed`);
  summary.push({ store: store.label, ok, failed, report });
}

const parsed = PricesSchema.parse(next);
const freshFoodcoop = Object.values(parsed.stores.foodcoop?.items ?? {}).filter((i) => i.fetchedAt === now).length;

if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = BASKET.map((b) => `| ${b.id} | ${summary.map((s) => s.report[b.id] ?? '—').join(' | ')} |`);
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    `## Basket prices ${now.slice(0, 10)}\n\n| item | ${summary.map((s) => s.store).join(' | ')} |\n|---|${summary.map(() => '---').join('|')}|\n${rows.join('\n')}\n\n${warnings.length ? `Warnings:\n${warnings.map((w) => `- ${w}`).join('\n')}` : 'No warnings.'}\n`,
  );
}

if (!only && freshFoodcoop < MIN_FOODCOOP_ITEMS) {
  console.error(inCI ? `::error::only ${freshFoodcoop} FoodCoop items fetched today; not writing` : `error: only ${freshFoodcoop} FoodCoop items fetched today; not writing`);
  process.exit(1);
}

if (dryRun) {
  console.log('\n--dry-run: nothing written');
} else {
  await writeFile(OUT, JSON.stringify(parsed, null, 2) + '\n');
  console.log(`\nwrote ${OUT.pathname}`);
}
