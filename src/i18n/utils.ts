import { ui, defaultLang, type Lang, type UiKey } from './ui';

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
 * Build a locale-aware path. ca (default) has no prefix; es is prefixed with /es.
 * localizePath('/qui-som', 'es') -> '/es/qui-som'
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+/, '');
  if (lang === defaultLang) return clean === '/' ? '/' : clean;
  return clean === '/' ? '/es/' : `/es${clean}`;
}

/** Strip the locale prefix from a pathname to get the canonical route key. */
export function stripLocale(pathname: string): string {
  const p = pathname.replace(/^\/es(?=\/|$)/, '');
  return p === '' ? '/' : p;
}

/** The opposite locale, for the language toggle. */
export function otherLang(lang: Lang): Lang {
  return lang === 'ca' ? 'es' : 'ca';
}
