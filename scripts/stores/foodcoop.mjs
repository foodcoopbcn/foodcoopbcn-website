/*
 * FoodCoop BCN — the co-op's own Odoo shop (botiga.foodcoopbcn.cat).
 *
 * An anonymous visitor sees the public price list, which is what we want: the member
 * price is derived at render time from `membership.discount`. Product cards carry
 * schema.org microdata, so a regex over `itemprop="name"` / `itemprop="price"` is enough;
 * the product-template id is the trailing number of the product URL.
 */
import { getText } from '../lib/http.mjs';
import { isEcoName } from '../lib/units.mjs';

const BASE = 'https://botiga.foodcoopbcn.cat';
const DEFAULT_SEARCH = 'BÀSICA';
const PAGES = 3;

export const CARD_RE =
  /itemprop="name" href="(\/shop\/([^"?]+?)-(\d+))(?:\?[^"]*)?"[^>]*>([^<]+)<[\s\S]*?itemprop="price"[^>]*>([\d.]+)</g;

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

/** Fetches a shop search (the "C. BÀSICA" range by default) once and indexes it by template id. */
async function catalogue(ctx, search = DEFAULT_SEARCH) {
  ctx.cache.foodcoop ??= {};
  if (ctx.cache.foodcoop[search]) return ctx.cache.foodcoop[search];
  const byId = new Map();
  for (let page = 1; page <= PAGES; page++) {
    const html = await getText(`${BASE}/shop?search=${encodeURIComponent(search)}&page=${page}`);
    for (const m of html.matchAll(CARD_RE)) {
      const [, path, , id, name, price] = m;
      byId.set(id, { productId: id, name: decode(name), url: BASE + path, packPrice: Number(price) });
    }
  }
  if (byId.size === 0) throw new Error(`foodcoop: no product cards parsed for "${search}" — has the shop markup changed?`);
  ctx.cache.foodcoop[search] = byId;
  return byId;
}

export default {
  id: 'foodcoop',

  async find(query, ctx) {
    const q = query.toLowerCase();
    return [...(await catalogue(ctx)).values()]
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({ ...p, brand: '', packQty: NaN, unit: '?', eco: isEcoName(p.name) }));
  },

  /** cfg: { productId, packQty, unit, brand, nameMustInclude?, eco?, search? } */
  async fetchItem(cfg, ctx) {
    const p = (await catalogue(ctx, cfg.search)).get(String(cfg.productId));
    if (!p) throw new Error(`product ${cfg.productId} not in the "${cfg.search ?? DEFAULT_SEARCH}" listing`);
    if (cfg.nameMustInclude && !p.name.toLowerCase().includes(cfg.nameMustInclude.toLowerCase())) {
      throw new Error(`name guard failed: "${p.name}" lacks "${cfg.nameMustInclude}"`);
    }
    return {
      productId: p.productId,
      name: p.name.replace(/^C\.\s*BÀSICA\s*-\s*/i, ''),
      brand: cfg.brand ?? '',
      url: p.url,
      image: null,
      packPrice: p.packPrice,
      packQty: cfg.packQty,
      unit: cfg.unit,
      eco: cfg.eco ?? isEcoName(p.name),
    };
  },
};
