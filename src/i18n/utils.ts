import { ui, languages, defaultLang, type Lang, type UiKey } from './ui';

/** Every locale the site is built in, default first. */
export const allLangs = Object.keys(languages) as Lang[];

/** Resolve the active language from Astro.currentLocale (falls back to default). */
export function getLang(currentLocale: string | undefined): Lang {
  if (currentLocale && currentLocale in ui) return currentLocale as Lang;
  return defaultLang;
}

/** Returns a translator bound to a locale: const t = useTranslations(lang). */
export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Build a locale-aware path. The default locale has no prefix; every other one is
 * prefixed with its code.
 *
 *   localizePath('/qui-som', 'es') -> '/es/qui-som'
 *
 * Derived from `languages` rather than hard-coded, so adding a third locale is a
 * one-line change there plus the entry in astro.config.mjs.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+/, '');
  if (lang === defaultLang) return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** Matches any non-default locale prefix, e.g. /es or /en. */
const localePrefix = new RegExp(
  `^/(${allLangs.filter((l) => l !== defaultLang).join('|')})(?=/|$)`,
);

/** Strip the locale prefix from a pathname to get the canonical route key. */
export function stripLocale(pathname: string): string {
  const p = pathname.replace(localePrefix, '');
  return p === '' ? '/' : p;
}

/** Every locale except this one, in declared order. */
export function otherLangs(lang: Lang): Lang[] {
  return allLangs.filter((l) => l !== lang);
}

/**
 * The next locale, for anything that still assumes exactly two.
 * Prefer `otherLangs` in new code — this returns only the first alternative.
 */
export function otherLang(lang: Lang): Lang {
  return otherLangs(lang)[0] ?? lang;
}
