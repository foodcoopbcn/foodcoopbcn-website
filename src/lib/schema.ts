/*
 * schema.org builders.
 *
 * One place for structured data so the markup can never drift from what the
 * pages actually say. Everything is derived from src/config/site.ts.
 *
 * The site previously emitted a GroceryStore node with a name, an address and
 * two social links — and nothing else. Missing above all was
 * `openingHoursSpecification`, which is what lets Google answer the single most
 * common query about a shop ("are they open now?") directly in the results.
 */
import { org, social, hours, membership } from '../config/site';
import type { Lang } from '../i18n/ui';

const SITE = 'https://foodcoopbcn.cat';

/** Stable node ids, so other nodes can reference these instead of repeating them. */
export const ID = {
  org: `${SITE}/#organization`,
  store: `${SITE}/#store`,
  website: `${SITE}/#website`,
};

/** JS getDay() index → the schema.org day URL. */
const DAYS = [
  'https://schema.org/Sunday',
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
  'https://schema.org/Saturday',
];

/** One entry per opening range; a day the shop is closed simply has none. */
const openingHours = hours.flatMap((h) =>
  h.ranges.map(([opens, closes]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: DAYS[h.day],
    opens,
    closes,
  })),
);

const address = {
  '@type': 'PostalAddress',
  streetAddress: org.address.street,
  addressLocality: org.address.locality,
  postalCode: org.address.postalCode,
  addressRegion: 'Barcelona',
  addressCountry: org.address.country,
};

/** The cooperative as a legal entity. Referenced as publisher by every article. */
export const organization = (lang: Lang) => ({
  '@type': 'Organization',
  '@id': ID.org,
  name: org.name,
  legalName: org.legalName,
  url: SITE,
  email: org.email,
  telephone: org.phone,
  foundingDate: org.foundingDate,
  address,
  logo: { '@type': 'ImageObject', url: `${SITE}/favicon-512.png`, width: 512, height: 512 },
  image: `${SITE}/og-default.jpg`,
  /* Every channel we actually run — the old markup listed two of four. */
  sameAs: [...social.map((s) => s.href), 'https://ca.wikipedia.org/wiki/Foodcoop_BCN'],
  description:
    lang === 'ca'
      ? 'Supermercat cooperatiu, participatiu i sense ànim de lucre de Barcelona, propietat de les seves sòcies.'
      : 'Supermercado cooperativo, participativo y sin ánimo de lucro de Barcelona, propiedad de sus socias.',
});

/** The physical shop: this is the node that produces the local search result. */
export const groceryStore = (lang: Lang) => ({
  '@type': 'GroceryStore',
  '@id': ID.store,
  name: org.name,
  parentOrganization: { '@id': ID.org },
  url: SITE,
  email: org.email,
  telephone: org.phone,
  address,
  geo: { '@type': 'GeoCoordinates', latitude: org.geo.latitude, longitude: org.geo.longitude },
  hasMap: org.mapUrl,
  image: `${SITE}/og-default.jpg`,
  logo: `${SITE}/favicon-512.png`,
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  paymentAccepted: lang === 'ca' ? 'Efectiu, targeta' : 'Efectivo, tarjeta',
  openingHoursSpecification: openingHours,
  areaServed: { '@type': 'City', name: 'Barcelona' },
  publicAccess: true,
  isAccessibleForFree: true,
  sameAs: social.map((s) => s.href),
  description:
    lang === 'ca'
      ? `Supermercat cooperatiu obert a tothom al passatge d'Aragó, a l'Eixample. Més de 1.200 productes agroecològics i de proximitat. Les sòcies hi tenen un ${membership.discount}% de descompte.`
      : `Supermercado cooperativo abierto a todo el mundo en el pasaje de Aragó, en el Eixample. Más de 1.200 productos agroecológicos y de proximidad. Las socias tienen un ${membership.discount}% de descuento.`,
});

/** Lets search engines offer the site's own search box. */
export const webSite = (lang: Lang) => ({
  '@type': 'WebSite',
  '@id': ID.website,
  url: SITE,
  name: org.name,
  inLanguage: lang === 'ca' ? 'ca-ES' : 'es-ES',
  publisher: { '@id': ID.org },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE}${lang === 'ca' ? '' : '/es'}/actualitat/cerca?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/** Breadcrumb trail. Pass paths already localised. */
export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${SITE}${item.path.replace(/\/$/, '') || '/'}`,
  })),
});

/**
 * "40 min" is not a duration schema.org understands; it wants ISO 8601. Google's
 * recipe validator rejected the old value outright.
 */
export const isoDuration = (text?: string): string | undefined => {
  if (!text) return undefined;
  const h = text.match(/(\d+)\s*h/i);
  const m = text.match(/(\d+)\s*m(in)?/i);
  if (!h && !m) return undefined;
  return `PT${h ? `${h[1]}H` : ''}${m ? `${m[1]}M` : ''}`;
};

/** Wraps nodes in a single @graph so they can cross-reference by @id. */
export const graph = (...nodes: object[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
});
