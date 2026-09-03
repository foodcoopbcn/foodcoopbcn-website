/*
 * Turns src/data/prices.json (written daily by scripts/fetch-prices.mjs) into what the
 * "Compara FoodCoop BCN amb altres supermercats" section renders.
 *
 * It rescales every product to the basket quantity, formats numbers for the locale, and
 * drops anything older than MAX_AGE_DAYS so a broken collector can never leave a wrong
 * price on the page for long.
 *
 * The comparison is built PAIRWISE: FoodCoop against one shop at a time, over the rows
 * where that shop sells the same kind of product (organic against organic, conventional
 * against conventional). An all-shops-agree subset sounds fairer and is not: Mercadona
 * has no organic version of ten of these products, so requiring every shop to match
 * collapses the basket to the conventional rows and quietly compares the co-op's organic
 * range against industrial own-brands. Per shop, each comparison keeps its own row count,
 * which is printed next to it.
 */
import raw from '../data/prices.json';
import { BASKET, STORES } from '../../scripts/lib/basket.mjs';
import { PricesSchema } from '../../scripts/lib/prices-schema.mjs';
import type { Lang } from '../i18n/ui';

export const MAX_AGE_DAYS = 7;

type Unit = 'l' | 'kg' | 'unit';

export interface CompareCell {
  /** Price for the basket quantity, formatted. */
  price: string;
  priceValue: number;
  /** FoodCoop only: the member price, as published by the shop's member tariff. */
  memberPrice?: string;
  memberPriceValue?: number;
  name: string;
  brand: string;
  url: string;
  /** "750 g · 1,00 € · 1,33 €/kg" — the pack the price was taken from. */
  pack: string;
  eco: boolean;
  /** What to show next to the price: an ECO badge, a "no eco" mark, or nothing. */
  mark: 'eco' | 'noeco' | null;
}

export interface CompareStore {
  id: string;
  label: string;
  featured: boolean;
  updatedAt: string;
  /** What the whole basket costs here, over the items every shown store has. */
  total: string | null;
  /** FoodCoop only: the same basket at the member price. */
  memberTotal: string | null;
  /** Basket items this store has no fresh price for (labels). */
  missing: string[];
}

/**
 * FoodCoop against one supermarket, over the rows where both sell the same kind of
 * product. `excluded` is how many rows were left out for that reason, which is the
 * honest caption for a shop like Mercadona that stocks no organic equivalent.
 */
export interface ComparePair {
  id: string;
  label: string;
  /** Products compared: the whole basket, not a subset. */
  n: number;
  /** Of those, how many are organic here and not at that shop. */
  notEco: number;
  /** What the same shopping costs here, at the member price, and at that shop. */
  memberTotal: string;
  rivalTotal: string;
  /** fc ÷ rival - 1. Negative means the co-op is cheaper. */
  memberDelta: number;
  /** The difference with no sign: the verdict sentence carries the direction in words. */
  absLabel: string;
  verdict: 'same' | 'cheaper' | 'dearer';
}

/*
 * Below this, the two shops are quoting the same money and saying "cheaper" would
 * be reading noise as a result: a single product changing pack size moves a
 * seventeen-item basket by more than this.
 */
const SAME_BAND = 0.02;

export interface CompareView {
  stores: CompareStore[];
  /** Index of FoodCoop in `stores` and in every row's `cells`. */
  fcIndex: number;
  items: {
    id: string;
    label: string;
    basis: string;
    cells: (CompareCell | null)[];
  }[];
  /** One per non-featured store, in STORES order. Empty when no member price is available. */
  pairs: ComparePair[];
  /** Shared percent axis for the summary. */
  pairScale: { lo: number; hi: number };
  /** How many items the basket totals add up (those present in every shown store). */
  totalCount: number;
  /** Stores hidden because their data is too old or absent. */
  hiddenStores: string[];
  /** Newest data point shown, formatted. */
  updatedAt: string;
}

const locale = (lang: Lang) => (lang === 'ca' ? 'ca-ES' : 'es-ES');

const money = (lang: Lang, n: number) =>
  new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'EUR' }).format(n);

/** "27 %" — unsigned, because the sentence around it says which way. */
const percent = (lang: Lang, n: number) =>
  new Intl.NumberFormat(locale(lang), { style: 'percent', maximumFractionDigits: 0 }).format(Math.abs(n));

const date = (lang: Lang, iso: string) =>
  new Intl.DateTimeFormat(locale(lang), { dateStyle: 'long', timeZone: 'Europe/Madrid' }).format(new Date(iso));

/** "1 l", "500 g", "1,5 kg", "6 u." */
export function formatQty(lang: Lang, qty: number, unit: Unit): string {
  const nf = new Intl.NumberFormat(locale(lang), { maximumFractionDigits: 2 });
  if (unit === 'unit') return `${nf.format(qty)} u.`;
  if (unit === 'kg') return qty < 1 ? `${nf.format(Math.round(qty * 1000))} g` : `${nf.format(qty)} kg`;
  return qty < 1 ? `${nf.format(Math.round(qty * 1000))} ml` : `${nf.format(qty)} l`;
}

export function isFresh(iso: string | null | undefined, now: Date, maxAgeDays = MAX_AGE_DAYS): boolean {
  if (!iso) return false;
  const age = now.getTime() - new Date(iso).getTime();
  return age >= 0 && age <= maxAgeDays * 86_400_000;
}

/* ---------------------------------------------------------------------------
 * Geometry, pure and unit-free, so the summary places its marks from functions
 * whose numbers can be checked without rendering anything.
 * ------------------------------------------------------------------------- */

/**
 * Bounds for the shared percent axis of the basket chart, rounded outwards to a
 * multiple of ten and never tighter than ±25 %, so a day where every shop lands
 * within a point or two does not blow small differences up into big bars.
 */
export function pairScale(pairs: ComparePair[]): { lo: number; hi: number } {
  const deltas = pairs.map((p) => p.memberDelta * 100);
  const lo = Math.min(-25, ...deltas.map((d) => Math.floor(d / 10) * 10));
  const hi = Math.max(25, ...deltas.map((d) => Math.ceil(d / 10) * 10));
  return { lo, hi };
}

/** Position of a delta (as a fraction, e.g. -0.27) on the pair axis, in percent. */
export function pairX(delta: number, scale: { lo: number; hi: number }): number {
  return ((delta * 100 - scale.lo) / (scale.hi - scale.lo)) * 100;
}

/** Returns null when FoodCoop's own data is missing or stale — then the section is not shown. */
export function buildCompareView(lang: Lang, now: Date = new Date()): CompareView | null {
  const data = PricesSchema.parse(raw);
  const unitLabel = lang === 'ca' ? 'u.' : 'ud.';

  /* Which stores have anything fresh to show. FoodCoop first, always. */
  const shown = STORES.filter((s) => {
    const store = data.stores[s.id];
    return store && Object.values(store.items).some((i) => isFresh(i.fetchedAt, now));
  });
  const foodcoop = data.stores.foodcoop;
  const freshFoodcoop = BASKET.filter((b) => isFresh(foodcoop?.items[b.id]?.fetchedAt, now)).length;
  if (!foodcoop || freshFoodcoop < 6 || shown[0]?.id !== 'foodcoop') return null;
  const fcIndex = 0;

  const items = BASKET.map((b) => {
    const fcEco = foodcoop.items[b.id]?.eco ?? false;
    const cells = shown.map((s) => {
      const p = data.stores[s.id]?.items[b.id];
      if (!p || !isFresh(p.fetchedAt, now)) return null;
      const priceValue = (p.packPrice / p.packQty) * b.qty;
      const perUnit = p.packPrice / p.packQty;
      const per = p.unit === 'unit' ? `${money(lang, perUnit)}/${unitLabel}` : `${money(lang, perUnit)}/${p.unit}`;
      const samePack = Math.abs(p.packQty - b.qty) < 1e-6;
      const cell: CompareCell = {
        price: money(lang, priceValue),
        priceValue,
        name: p.name,
        brand: p.brand,
        url: p.url,
        pack: samePack ? per : `${formatQty(lang, p.packQty, p.unit as Unit)} · ${money(lang, p.packPrice)} · ${per}`,
        eco: p.eco,
        mark: p.eco ? 'eco' : fcEco ? 'noeco' : null,
      };
      /*
       * The member price is READ from the shop's "Tarifa SÒCIA" list, never
       * derived. Deriving it from a headline discount publishes figures the
       * co-op does not charge: the shop's member tariff runs about 9 % below
       * its public one. If the member list had no entry for this product we
       * simply show no member price.
       */
      if (s.id === 'foodcoop' && p.memberPackPrice) {
        cell.memberPriceValue = (p.memberPackPrice / p.packQty) * b.qty;
        cell.memberPrice = money(lang, cell.memberPriceValue);
      }
      return cell;
    });

    const basis = (b as { basis?: Record<Lang, string> }).basis?.[lang] ?? formatQty(lang, b.qty, b.unit as Unit);
    return { id: b.id, label: b.label[lang], basis, cells };
  });

  /* Basket totals, over items every shown store has, so the columns add the same list. */
  const complete = items.filter((it) => it.cells.every(Boolean));

  const stores: CompareStore[] = shown.map((s, col) => {
    const fresh = BASKET.map((b) => data.stores[s.id]?.items[b.id]).filter((p) => p && isFresh(p.fetchedAt, now));
    const oldest = fresh.map((p) => p!.fetchedAt).sort()[0];
    const total = complete.length ? complete.reduce((acc, it) => acc + it.cells[col]!.priceValue, 0) : null;
    const memberValues = complete.map((it) => it.cells[col]!.memberPriceValue);
    return {
      id: s.id,
      label: s.label,
      featured: Boolean(s.featured),
      updatedAt: date(lang, oldest),
      total: total === null ? null : money(lang, total),
      memberTotal:
        total === null || s.id !== 'foodcoop' || memberValues.some((v) => v === undefined)
          ? null
          : money(lang, memberValues.reduce((acc, v) => acc! + v!, 0)!),
      missing: items.filter((it) => !it.cells[col]).map((it) => it.label),
    };
  });

  /*
   * One comparison per supermarket, over the WHOLE basket: every row where both
   * shops have a fresh price and the co-op has a member price for it.
   *
   * Where a shop's version of a product is not organic and ours is, the row is
   * still counted and the difference is declared instead: `notEco` is printed
   * next to the result, so the reader can see how much of the gap is "cheaper"
   * and how much is "not the same thing". Dropping those rows silently would
   * compare a different basket for each shop.
   */
  const pairs: ComparePair[] = shown
    .map((s, col) => ({ s, col }))
    .filter(({ s }) => !s.featured)
    .map(({ s, col }) => {
      const rows = items.filter((it) => it.cells[fcIndex]?.memberPriceValue !== undefined && it.cells[col]);
      const sum = (pick: (it: (typeof rows)[number]) => number) => rows.reduce((acc, it) => acc + pick(it), 0);
      const member = sum((it) => it.cells[fcIndex]!.memberPriceValue!);
      const rival = sum((it) => it.cells[col]!.priceValue);
      const memberDelta = rival > 0 ? member / rival - 1 : 0;
      return {
        id: s.id,
        label: s.label,
        n: rows.length,
        notEco: rows.filter((it) => it.cells[fcIndex]!.eco && !it.cells[col]!.eco).length,
        memberTotal: money(lang, member),
        rivalTotal: money(lang, rival),
        memberDelta,
        absLabel: percent(lang, memberDelta),
        verdict:
          Math.abs(memberDelta) <= SAME_BAND ? 'same' : memberDelta < 0 ? 'cheaper' : 'dearer',
      } satisfies ComparePair;
    })
    /* Best result for the co-op first, worst last. */
    .sort((a, b) => a.memberDelta - b.memberDelta);

  const withRows = pairs.filter((p) => p.n > 0);

  const basketIds = new Set(BASKET.map((b) => b.id));
  const newest = Object.values(data.stores)
    .flatMap((s) => Object.entries(s.items).filter(([id]) => basketIds.has(id)).map(([, i]) => i.fetchedAt))
    .filter((d) => isFresh(d, now))
    .sort()
    .at(-1)!;

  return {
    stores,
    fcIndex,
    items,
    pairs: withRows.length ? pairs : [],
    pairScale: pairScale(withRows),
    totalCount: complete.length,
    hiddenStores: STORES.filter((s) => !shown.some((x) => x.id === s.id)).map((s) => s.label),
    updatedAt: date(lang, newest),
  };
}
