/*
 * Condis — its storefront searches through Empathy.co's public search API.
 * `store=718` is the default store an anonymous Barcelona visitor is assigned.
 */
import { getJson } from '../lib/http.mjs';
import { isEcoName, parseSize, round } from '../lib/units.mjs';

const SITE = 'https://compraonline.condis.es';
const API = 'https://api.empathy.co/search/v1/query/condis/search';
const STORE = '718';

/* "0,99€/Litro", "3,20€/Kg", "0,25€/Unidad", "2,99€/Docena" */
const PUM = { litro: ['l', 1], kilo: ['kg', 1], kg: ['kg', 1], unidad: ['unit', 1], ud: ['unit', 1], docena: ['unit', 12] };

export function normalise(p) {
  const packPrice = Number(p.price?.current ?? p.price?.regular);
  const m = String(p.pum ?? '').match(/([\d.,]+)\s*€\s*\/\s*(\d+)?\s*([a-zA-Z]+)/);
  let packQty;
  let unit;
  if (m && PUM[m[3].toLowerCase()]) {
    const perUnit = Number(m[1].replace(',', '.'));
    const [u, mult] = PUM[m[3].toLowerCase()];
    unit = u;
    packQty = round((packPrice / perUnit) * mult * (m[2] ? Number(m[2]) : 1));
  } else {
    const s = parseSize(p.description ?? p.name);
    if (!s) throw new Error(`condis ${p.id}: cannot derive pack size from "${p.pum}"`);
    ({ qty: packQty, unit } = s);
  }
  const name = p.description ?? p.name ?? '';
  return {
    productId: String(p.id),
    name,
    brand: /^(sin|sense) marca$/i.test(p.brand ?? '') ? '' : (p.brand ?? ''),
    url: `${SITE}${p.url}`,
    image: p.images?.[0] ? String(p.images[0]).replace(/^(?!https?:)/, 'https://cdn.condis.es') : null,
    packPrice,
    packQty,
    unit,
    eco: Boolean(p.isEco) || isEcoName(name),
    warn: null,
  };
}

async function search(query, rows = 12) {
  const j = await getJson(`${API}?query=${encodeURIComponent(query)}&lang=es&rows=${rows}&start=0&store=${STORE}`);
  return j.catalog?.content ?? [];
}

export default {
  id: 'condis',
  async find(query) {
    return (await search(query)).map((p) => {
      try {
        return normalise(p);
      } catch {
        return { productId: String(p.id), name: p.description ?? p.name, packPrice: NaN, packQty: NaN, unit: '?' };
      }
    });
  },
  async fetchItem(cfg) {
    const hit = (await search(cfg.query, 40)).find((p) => String(p.id) === String(cfg.productId));
    if (!hit) throw new Error(`product ${cfg.productId} not among results for "${cfg.query}"`);
    return normalise(hit);
  },
};
