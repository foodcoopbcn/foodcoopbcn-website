/*
 * FoodCoop BCN — the co-op's own Odoo shop (botiga.foodcoopbcn.cat).
 *
 * The shop publishes TWO price lists and lets anyone switch between them from a
 * dropdown, no login required: "Tarifa PÚBLIC" (id 1) and "Tarifa SÒCIA" (id 7).
 *
 * We read both. An earlier version read only the public list and derived the
 * member price by subtracting `membership.discount`, which was wrong: the member
 * tariff is a real price list, not a flat percentage. The ground coffee is
 * 4,65 € public and 4,25 € for members — 8.6%, not 12% — so the site was
 * publishing a saving the co-op does not actually give.
 *
 * Switching lists is session state (`/shop/change_pricelist/<id>` sets a cookie),
 * so this module keeps its own cookie jar rather than teaching the shared fetch
 * helper about cookies.
 *
 * Product cards carry schema.org microdata, so a regex over `itemprop="name"` /
 * `itemprop="price"` is enough; the product-template id is the trailing number of
 * the product URL.
 */
import { request, getText } from '../lib/http.mjs';
import { isEcoName } from '../lib/units.mjs';

const BASE = 'https://botiga.foodcoopbcn.cat';
const DEFAULT_SEARCH = 'BÀSICA';
const PAGES = 3;

/** Odoo price list ids, taken from the shop's own switcher. */
export const PRICELIST = { public: 1, member: 7 };

export const CARD_RE =
  /itemprop="name" href="(\/shop\/([^"?]+?)-(\d+))(?:\?[^"]*)?"[^>]*>([^<]+)<[\s\S]*?itemprop="price"[^>]*>([\d.]+)</g;

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();

/* --- a minimal cookie jar, enough for one Odoo session ---------------------- */

function jar() {
  const cookies = new Map();
  return {
    header: () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; '),
    absorb(res) {
      for (const line of res.headers.getSetCookie?.() ?? []) {
        const [pair] = line.split(';');
        const idx = pair.indexOf('=');
        if (idx > 0) cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
      }
    },
  };
}

/** Opens a session and selects a price list. Returns the cookie header to reuse. */
async function session(pricelistId) {
  const cookies = jar();
  cookies.absorb(await request(`${BASE}/shop`, { headers: { cookie: cookies.header() } }));
  cookies.absorb(
    await request(`${BASE}/shop/change_pricelist/${pricelistId}`, {
      headers: { cookie: cookies.header() },
    }),
  );
  return cookies.header();
}

/** All cards in one search, for one price list, indexed by product-template id. */
async function listing(search, pricelistId) {
  const cookie = await session(pricelistId);
  const byId = new Map();
  for (let page = 1; page <= PAGES; page++) {
    const html = await getText(`${BASE}/shop?search=${encodeURIComponent(search)}&page=${page}`, {
      headers: { cookie },
    });
    for (const m of html.matchAll(CARD_RE)) {
      const [, path, , id, name, price] = m;
      byId.set(id, { productId: id, name: decode(name), url: BASE + path, price: Number(price) });
    }
  }
  return byId;
}

/**
 * Both price lists for one search, merged.
 *
 * If the member list comes back empty or missing a product we leave
 * `memberPackPrice` null: the site then shows the public price only. Guessing it
 * is what caused the problem this module exists to fix.
 */
async function catalogue(ctx, search = DEFAULT_SEARCH) {
  ctx.cache.foodcoop ??= {};
  if (ctx.cache.foodcoop[search]) return ctx.cache.foodcoop[search];

  const [pub, member] = [await listing(search, PRICELIST.public), await listing(search, PRICELIST.member)];
  if (pub.size === 0) {
    throw new Error(`foodcoop: no product cards parsed for "${search}" — has the shop markup changed?`);
  }

  const byId = new Map();
  for (const [id, p] of pub) {
    const m = member.get(id);
    byId.set(id, {
      productId: id,
      name: p.name,
      url: p.url,
      packPrice: p.price,
      /* Only trust it if it is actually cheaper; an identical figure means the
         switch did not take effect and we would be inventing a 0% discount. */
      memberPackPrice: m && m.price < p.price ? m.price : null,
    });
  }
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
      memberPackPrice: p.memberPackPrice,
      packQty: cfg.packQty,
      unit: cfg.unit,
      eco: cfg.eco ?? isEcoName(p.name),
    };
  },
};
