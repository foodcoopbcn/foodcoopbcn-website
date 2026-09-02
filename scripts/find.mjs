#!/usr/bin/env node
/* Dev helper: `node scripts/find.mjs <store> "<query>"` lists candidate products to pin in basket.mjs. */
import { ADAPTERS } from './lib/stores.mjs';

const [store, ...q] = process.argv.slice(2);
const adapter = ADAPTERS[store];
if (!adapter || q.length === 0) {
  console.error(`usage: node scripts/find.mjs <${Object.keys(ADAPTERS).join('|')}> "<query>"`);
  process.exit(2);
}
const ctx = { cache: {} };
const hits = await adapter.find(q.join(' '), ctx);
for (const h of hits) {
  const per = h.packPrice / h.packQty;
  console.log(
    [h.productId, h.name, h.brand ?? '', `${h.packPrice} €`, `${h.packQty} ${h.unit}`, Number.isFinite(per) ? `${per.toFixed(3)} €/${h.unit}` : '?', h.eco ? 'ECO' : ''].join(' | '),
  );
}
