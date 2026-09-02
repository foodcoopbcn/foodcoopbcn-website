/*
 * Bonpreu / Esclat — compraonline.bonpreuesclat.cat search API (no auth).
 *
 * The site sits behind AWS WAF, which scores requests on browser-likeness. The header set
 * below is the one its own front end sends and is the only reason a plain client is let
 * through; it is deliberately confined to this file. If a runner still gets 403 the
 * fallback is a curl_cffi step (see .github/workflows/prices.yml).
 */
import { getJson } from '../lib/http.mjs';
import { isEcoName, parseSize, round } from '../lib/units.mjs';

const BASE = 'https://www.compraonline.bonpreuesclat.cat';
/* The WAF also rate-limits: a burst of searches gets challenged, spaced ones pass. */
const PACE_MS = 12_000;
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'accept-language': 'ca-ES,ca;q=0.9,es;q=0.8,en;q=0.7',
  referer: `${BASE}/`,
  origin: BASE,
  'apollographql-client-name': 'ecom-web',
  'ecom-request-source': 'web',
};

/* unitPrice.unitName → [basket unit, how many of it the unit price covers] */
const UNIT_NAME = {
  PER_LITRE: ['l', 1],
  PER_1L: ['l', 1],
  PER_100ML: ['l', 0.1],
  PER_KG: ['kg', 1],
  PER_1KG: ['kg', 1],
  PER_100G: ['kg', 0.1],
  PER_UNIT: ['unit', 1],
  PER_PIECE: ['unit', 1],
  PER_DOZEN: ['unit', 12],
  EACH: ['unit', 1],
};

export function normalise(p) {
  const packPrice = Number(p.price?.amount);
  const perUnit = Number(p.unitPrice?.price?.amount);
  const u = UNIT_NAME[p.unitPrice?.unitName];
  let packQty;
  let unit;
  const perPack = String(p.packSizeDescription ?? '').match(/^(\d+)\s+per\s+paquet/i);
  if (perPack) {
    unit = 'unit';
    packQty = Number(perPack[1]);
  } else if (u && perUnit > 0) {
    unit = u[0];
    packQty = round((packPrice / perUnit) * u[1]);
  } else {
    const s = parseSize(`${p.packSizeDescription ?? ''} ${p.name}`);
    if (!s) throw new Error(`bonpreu ${p.retailerProductId}: cannot derive pack size (${p.unitPrice?.unitName})`);
    ({ qty: packQty, unit } = s);
  }
  return {
    productId: String(p.retailerProductId),
    name: p.name,
    brand: p.brand ?? '',
    url: `${BASE}/products/${p.retailerProductId}/details`,
    image: p.image?.src ?? null,
    packPrice,
    packQty,
    unit,
    eco: isEcoName(p.name),
    warn: null,
  };
}

async function search(query, limit = 12) {
  const url =
    `${BASE}/api/webproductpagews/v6/product-pages/search?q=${encodeURIComponent(query)}` +
    `&maxProductsToDecorate=${limit}&maxPageSize=${limit}&tag=web`;
  const j = await getJson(url, { headers: HEADERS, pace: PACE_MS });
  return (j.productGroups ?? []).flatMap((g) => g.decoratedProducts ?? []);
}

export default {
  id: 'bonpreu',
  async find(query) {
    return (await search(query)).map((p) => {
      try {
        return normalise(p);
      } catch {
        return { productId: String(p.retailerProductId), name: p.name, packPrice: NaN, packQty: NaN, unit: '?' };
      }
    });
  },
  async fetchItem(cfg) {
    const hit = (await search(cfg.query, 30)).find((p) => String(p.retailerProductId) === String(cfg.productId));
    if (!hit) throw new Error(`product ${cfg.productId} not among results for "${cfg.query}"`);
    return normalise(hit);
  },
};
