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
  /** FoodCoop only: the member price. */
  memberPrice?: string;
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
      if (s.id === 'foodcoop') cell.memberPrice = money(lang, priceValue * (1 - discount / 100));
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
      memberTotal: total === null || s.id !== 'foodcoop' ? null : money(lang, total * (1 - discount / 100)),
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
