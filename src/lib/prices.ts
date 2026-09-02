/*
 * Turns src/data/prices.json (written daily by scripts/fetch-prices.mjs) into what the
 * "Compara FoodCoop BCN amb altres supermercats" section renders.
 *
 * Nothing here judges: it rescales every product to the basket quantity, formats numbers
 * for the locale, and drops anything older than MAX_AGE_DAYS so a broken collector can
 * never leave a wrong price on the page for long.
 */
import raw from '../data/prices.json';
import { BASKET, STORES } from '../../scripts/lib/basket.mjs';
import { PricesSchema } from '../../scripts/lib/prices-schema.mjs';
import { membership } from '../config/site';
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
  total: string | null;
  memberTotal: string | null;
  /** Basket items this store has no fresh price for (labels). */
  missing: string[];
}

export interface CompareView {
  stores: CompareStore[];
  items: { id: string; label: string; basis: string; cells: (CompareCell | null)[] }[];
  /** How many items the totals add up (those present in every shown store). */
  totalCount: number;
  /** Stores hidden because their data is too old or absent. */
  hiddenStores: string[];
  /** Newest data point shown, formatted. */
  updatedAt: string;
  discount: number;
}

const locale = (lang: Lang) => (lang === 'ca' ? 'ca-ES' : 'es-ES');

const money = (lang: Lang, n: number) =>
  new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'EUR' }).format(n);

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

/** Returns null when FoodCoop's own data is missing or stale — then the section is not shown. */
export function buildCompareView(lang: Lang, now: Date = new Date()): CompareView | null {
  const data = PricesSchema.parse(raw);
  const discount = membership.discount;
  const unitLabel = lang === 'ca' ? 'u.' : 'ud.';

  /* Which stores have anything fresh to show. FoodCoop first, always. */
  const shown = STORES.filter((s) => {
    const store = data.stores[s.id];
    return store && Object.values(store.items).some((i) => isFresh(i.fetchedAt, now));
  });
  const foodcoop = data.stores.foodcoop;
  const freshFoodcoop = BASKET.filter((b) => isFresh(foodcoop?.items[b.id]?.fetchedAt, now)).length;
  if (!foodcoop || freshFoodcoop < 6 || shown[0]?.id !== 'foodcoop') return null;

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
       * derived. Deriving it from `membership.discount` published figures the
       * co-op does not charge: the shop's member tariff runs about 8.5% below
       * its public one, not 12%. If the member list had no entry for this
       * product we simply show no member price.
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

  /* Totals only over items every shown store has, so columns add up the same list. */
  const complete = items.filter((it) => it.cells.every(Boolean));
  const stores: CompareStore[] = shown.map((s, col) => {
    const fresh = BASKET.map((b) => data.stores[s.id]?.items[b.id]).filter((p) => p && isFresh(p.fetchedAt, now));
    const oldest = fresh.map((p) => p!.fetchedAt).sort()[0];
    const total = complete.length ? complete.reduce((sum, it) => sum + it.cells[col]!.priceValue, 0) : null;
    return {
      id: s.id,
      label: s.label,
      featured: Boolean(s.featured),
      updatedAt: date(lang, oldest),
      total: total === null ? null : money(lang, total),
      memberTotal:
        total === null || s.id !== 'foodcoop'
          ? null
          : complete.every((it) => it.cells[col]!.memberPriceValue !== undefined)
            ? money(lang, complete.reduce((sum, it) => sum + it.cells[col]!.memberPriceValue!, 0))
            : null,
      missing: items.filter((it) => !it.cells[col]).map((it) => it.label),
    };
  });

  const newest = Object.values(data.stores)
    .flatMap((s) => Object.values(s.items).map((i) => i.fetchedAt))
    .filter((d) => isFresh(d, now))
    .sort()
    .at(-1)!;

  return {
    stores,
    items,
    totalCount: complete.length,
    hiddenStores: STORES.filter((s) => !shown.some((x) => x.id === s.id)).map((s) => s.label),
    updatedAt: date(lang, newest),
    discount,
  };
}


/** One product, priced at the co-op and at the cheapest of the other shops. */
export interface PriceHighlight {
  label: string;
  basis: string;
  /** FoodCoop's member price, and the public one below it. */
  memberPrice: string;
  publicPrice: string;
  eco: boolean;
  /** The cheapest comparable price found elsewhere today. */
  rivalLabel: string;
  rivalPrice: string;
  rivalEco: boolean;
  /** How much less the member price is, in whole percent. */
  savingPct: number;
  updatedAt: string;
}

/**
 * Picks one product for the homepage teaser: the one where the member price beats
 * the cheapest of the other shops by the widest margin.
 *
 * This is deliberately a *favourable example*, not an average — so whatever
 * renders it has to say so and link to the full table. It is chosen from live
 * data rather than hard-coded, which means it can never claim a saving that has
 * stopped being true: if no product is cheaper today, this returns null and the
 * teaser disappears rather than quietly showing a stale win.
 */
export function pickHighlight(lang: Lang, now: Date = new Date()): PriceHighlight | null {
  const view = buildCompareView(lang, now);
  if (!view) return null;

  const fcIndex = view.stores.findIndex((s) => s.featured);
  if (fcIndex < 0) return null;

  let best: PriceHighlight | null = null;

  for (const item of view.items) {
    const ours = item.cells[fcIndex];
    if (!ours?.memberPrice) continue;

    /* Compare like with like: an eco product is only measured against eco ones. */
    const rivals = item.cells
      .map((cell, i) => ({ cell, store: view.stores[i] }))
      .filter((r) => r.cell && !r.store.featured && r.cell.eco === ours.eco);
    if (!rivals.length) continue;

    const cheapest = rivals.reduce((a, b) => (a.cell!.priceValue <= b.cell!.priceValue ? a : b));
    const memberValue = ours.memberPriceValue!;
    const savingPct = Math.round((1 - memberValue / cheapest.cell!.priceValue) * 100);
    if (savingPct < 1) continue;

    if (!best || savingPct > best.savingPct) {
      best = {
        label: item.label,
        basis: item.basis,
        memberPrice: ours.memberPrice,
        publicPrice: ours.price,
        eco: ours.eco,
        rivalLabel: cheapest.store.label,
        rivalPrice: cheapest.cell!.price,
        rivalEco: cheapest.cell!.eco,
        savingPct,
        updatedAt: view.updatedAt,
      };
    }
  }

  return best;
}
