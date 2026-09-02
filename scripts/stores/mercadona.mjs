/*
 * Mercadona — the unofficial JSON behind tienda.mercadona.es (no auth, public).
 * Prices depend on the warehouse; `bcn1` serves Barcelona.
 */
import { getJson } from '../lib/http.mjs';
import { isEcoName, round } from '../lib/units.mjs';

const WH = 'bcn1';
const API = 'https://tienda.mercadona.es/api';
/* Public search-only Algolia credentials embedded in Mercadona's web app. Only used by --find. */
const ALGOLIA = { app: '7UZJKL1DJ0', key: '9d8f2e39e90df472b4f2e559a116fe17' };

const SIZE = { l: ['l', 1], ml: ['l', 1 / 1000], kg: ['kg', 1], g: ['kg', 1 / 1000], ud: ['unit', 1] };

export function normalise(p) {
  const pi = p.price_instructions;
  const size = SIZE[String(pi.size_format).toLowerCase()];
  if (!size) throw new Error(`mercadona ${p.id}: unknown size_format ${pi.size_format}`);
  const packPrice = Number(pi.unit_price);
  const packQty = round(Number(pi.unit_size) * size[1]);
  /* Cross-check against the shelf reference price (per L / KG / dozen). */
  const ref = Number(pi.reference_price);
  const refPerUnit = /^d[cz]$/i.test(String(pi.reference_format)) ? ref / 12 : ref; // dc/dz = docena
  const ours = packPrice / packQty;
  const warn =
    Number.isFinite(refPerUnit) && Math.abs(ours - refPerUnit) > 0.02
      ? `reference price mismatch: computed ${ours.toFixed(3)} vs shelf ${refPerUnit.toFixed(3)} per ${size[0]}`
      : null;
  return {
    productId: String(p.id),
    name: p.display_name,
    brand: p.brand ?? '',
    url: `https://tienda.mercadona.es/product/${p.id}/${p.slug ?? ''}`,
    image: p.thumbnail ?? p.photos?.[0]?.thumbnail ?? null,
    packPrice,
    packQty,
    unit: size[0],
    eco: isEcoName(p.display_name),
    warn,
  };
}

export default {
  id: 'mercadona',

  async find(query) {
    const res = await fetch(`https://${ALGOLIA.app}-dsn.algolia.net/1/indexes/products_prod_${WH}_es/query`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-algolia-application-id': ALGOLIA.app,
        'x-algolia-api-key': ALGOLIA.key,
      },
      body: JSON.stringify({ query, hitsPerPage: 12 }),
      signal: AbortSignal.timeout(15_000),
    });
    const { hits = [] } = await res.json();
    return hits.map((h) => {
      try {
        return normalise(h);
      } catch {
        return { productId: String(h.id), name: h.display_name, packPrice: NaN, packQty: NaN, unit: '?' };
      }
    });
  },

  async fetchItem(cfg) {
    const p = await getJson(`${API}/products/${cfg.productId}/?lang=es&wh=${WH}`);
    return normalise(p);
  },
};
