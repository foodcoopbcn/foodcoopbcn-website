/*
 * Editor-owned page copy.
 *
 * The prose for the interior pages used to live in each component's frontmatter
 * as a `const c = { ca: {...}, es: {...} }` object, which meant the co-op could
 * not change a sentence without a developer and a deploy. It now lives in
 * src/content/copy/{lang}/{slug}.yaml and is edited at /keystatic.
 *
 * Figures are the reason this file exists rather than a plain getEntry() call.
 * The copy is full of amounts and hour counts that must match src/config/site.ts
 * — they are asked about constantly and are wrong the moment they disagree with
 * the FAQs. So they stay in the text as {tokens} and are substituted here. A
 * number can be typed into a sentence in the CMS, but it will not survive: the
 * token is what renders.
 *
 * The token table was already in FaqsPage.astro; it lives here now so the FAQs
 * and the page copy cannot drift apart.
 */
import { getEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { useTranslations } from '../i18n/utils';
import { membership as m, org, hours, dayKey, formatRanges } from '../config/site';

/*
 * The whole week on one line, so an answer that mentions the opening hours can
 * never contradict the footer. Identical to what FaqsPage built inline.
 */
function hoursLine(lang: Lang): string {
  const t = useTranslations(lang);
  return hours
    .map((h) => `${t(dayKey(h.day))} ${formatRanges(h.ranges, lang === 'ca' ? 'tancat' : 'cerrado')}`)
    .join('; ');
}

export function copyTokens(lang: Lang): Record<string, string | number> {
  return {
    capital: m.capital,
    discount: m.discount,
    entityCapital: m.entityCapital,
    entityStaffDiscount: m.entityStaffDiscount,
    shiftHours: m.shiftHours,
    shiftCycleWeeks: m.shiftCycleWeeks,
    flexibleChanges: m.flexibleChanges,
    welcomeSessionMinutes: m.welcomeSessionMinutes,
    quotaStandard: m.quota.standard,
    quotaReduced: m.quota.reduced,
    deliveryThreshold: m.delivery.threshold,
    /* Catalan and Spanish both write the decimal comma. */
    deliveryCheap: String(m.delivery.cheap).replace('.', ','),
    deliveryStandard: m.delivery.standard,
    street: org.address.street,
    postalCode: org.address.postalCode,
    locality: org.address.locality,
    legalName: org.legalName,
    /* Live from Odoo — see scripts/fetch-members.mjs. */
    members: org.members.toLocaleString(lang === 'ca' ? 'ca-ES' : 'es-ES'),
    hours: hoursLine(lang),
  };
}

/** Replace {tokens} in a string. An unknown token is left visible on purpose. */
export function fillText(text: string, tokens: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, key) => String(tokens[key] ?? whole));
}

/** Walk anything the CMS can produce — strings, arrays, nested objects. */
export function fillDeep<T>(value: T, tokens: Record<string, string | number>): T {
  if (typeof value === 'string') return fillText(value, tokens) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, tokens)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, fillDeep(v, tokens)]),
    ) as T;
  }
  return value;
}

/*
 * Read one page's copy, with the figures substituted.
 *
 * Throws rather than rendering a blank page: a missing file is a build error the
 * developer sees, not a silently empty page the co-op discovers in production.
 */
export async function pageCopy<T>(lang: Lang, slug: string): Promise<T> {
  const entry = await getEntry('copy', `${lang}/${slug}`);
  if (!entry) throw new Error(`Missing src/content/copy/${lang}/${slug}.yaml`);
  return fillDeep(entry.data as T, copyTokens(lang));
}
