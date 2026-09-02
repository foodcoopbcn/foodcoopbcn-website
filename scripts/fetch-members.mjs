#!/usr/bin/env node
/**
 * Reads the current member count from the co-op's Odoo and caches it for the build.
 *
 *   node scripts/fetch-members.mjs
 *
 * Why: the number of members grows every month. Any figure typed into a page is
 * wrong within weeks — the site shipped "530" taken from a 2024 press article
 * when the real figure was 1.001. This makes the number derive from the system
 * that actually knows it.
 *
 * Odoo (gestio.foodcoopbcn.cat, v16) runs the OCA `cooperator` module, which
 * marks effective members with `res.partner.member = true`. There is NO public
 * endpoint for this, so the External API needs credentials:
 *
 *   ODOO_URL      https://gestio.foodcoopbcn.cat
 *   ODOO_DB       the database name
 *   ODOO_USER     login of a dedicated, READ-ONLY user — not a person's account
 *   ODOO_API_KEY  that user's API key (Preferences → Account Security → API Keys)
 *
 * Odoo API keys inherit the user's full permissions, so create a user whose only
 * access is reading contacts. Never commit the key; set it as a CI secret.
 *
 * Failure policy: if the credentials are missing or Odoo is unreachable, the
 * existing cached value is kept and the script exits 0. A stale-but-true number
 * is fine; a broken deploy or a zero on the homepage is not.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const OUT = 'src/data/members.json';
const { ODOO_URL, ODOO_DB, ODOO_USER, ODOO_API_KEY } = process.env;
/** Override if the co-op counts membership differently (e.g. excluding companies). */
const DOMAIN = JSON.parse(process.env.ODOO_MEMBER_DOMAIN || '[["member","=",true]]');

async function rpc(url, service, method, args) {
  const res = await fetch(`${url.replace(/\/$/, '')}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: Date.now(),
    }),
  });
  if (!res.ok) throw new Error(`Odoo returned HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.data?.message || json.error.message || 'Odoo RPC error');
  }
  return json.result;
}

async function keepExisting(reason) {
  console.log(`Keeping the cached member count: ${reason}`);
  try {
    const current = JSON.parse(await readFile(OUT, 'utf8'));
    console.log(`  ${OUT} → ${current.count} (fetched ${current.fetchedAt})`);
  } catch {
    console.log(`  ${OUT} does not exist yet; site.ts falls back to its own default.`);
  }
  process.exit(0);
}

if (!ODOO_URL || !ODOO_DB || !ODOO_USER || !ODOO_API_KEY) {
  await keepExisting('ODOO_* environment variables are not set');
}

try {
  const uid = await rpc(ODOO_URL, 'common', 'authenticate', [ODOO_DB, ODOO_USER, ODOO_API_KEY, {}]);
  if (!uid) throw new Error('authentication rejected — check ODOO_DB, ODOO_USER and the API key');

  const count = await rpc(ODOO_URL, 'object', 'execute_kw', [
    ODOO_DB,
    uid,
    ODOO_API_KEY,
    'res.partner',
    'search_count',
    [DOMAIN],
  ]);

  if (!Number.isInteger(count) || count <= 0) {
    throw new Error(`refusing to write an implausible count: ${JSON.stringify(count)}`);
  }

  await mkdir('src/data', { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify({ count, fetchedAt: new Date().toISOString().slice(0, 10), source: 'odoo' }, null, 2) + '\n',
  );
  console.log(`${OUT} updated: ${count} members.`);
} catch (err) {
  await keepExisting(err.message);
}
