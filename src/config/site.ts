import type { Lang, UiKey } from '../i18n/ui';

/** Locale-independent organisation data (NAP, hours, socials, external links). */
export const org = {
  name: 'FoodCoop BCN',
  legalName: 'Foodcoop Barcelona SCCL',
  email: 'hola@foodcoopbcn.cat',
  phone: '+34 930 32 24 96',
  phoneDisplay: '930 32 24 96',
  address: {
    street: 'Ptge. d’Aragó, 9',
    locality: 'Barcelona',
    postalCode: '08025',
    country: 'ES',
  },
  // Member login portal + member-only online shop live in an external system.
  memberLoginUrl: 'https://botiga.foodcoopbcn.cat/',
  mapUrl: 'https://www.openstreetmap.org/search?query=Passatge%20d%27Arag%C3%B3%209%20Barcelona',
} as const;

export const social = [
  { name: 'Instagram', href: 'https://www.instagram.com/foodcoopbcn/', icon: 'instagram' },
  { name: 'Facebook', href: 'https://www.facebook.com/foodcoopbcn', icon: 'facebook' },
  { name: 'Telegram', href: 'https://t.me/foodcoopbcn', icon: 'telegram' },
  { name: 'Mastodon', href: 'https://mastodon.social/@foodcoopbcn', icon: 'mastodon' },
] as const;

/** Opening hours, in the site's own short form. */
export const hours: { day: UiKey | string; value: string }[] = [
  { day: 'Dilluns', value: '17:00–20:30' },
  { day: 'Dimarts', value: '10:00–14:00 · 17:00–20:30' },
  { day: 'Dimecres', value: '10:00–14:00 · 17:00–20:30' },
  { day: 'Dijous', value: '10:00–14:00 · 17:00–20:30' },
  { day: 'Divendres', value: '10:00–20:30' },
  { day: 'Dissabte', value: '10:00–14:00' },
  { day: 'Diumenge', value: '—' },
];

/** Main navigation. `key` is a UI string key; `path` is the canonical (ca) route. */
export const mainNav: {
  key: UiKey;
  path: string;
  children?: { key: UiKey; path: string }[];
}[] = [
  { key: 'nav.quisom', path: '/qui-som' },
  { key: 'nav.elsuper', path: '/el-super' },
  {
    key: 'nav.festesocia',
    path: '/fes-te-socia',
    children: [
      { key: 'nav.festesocia.persona', path: '/fes-te-socia/persona' },
      { key: 'nav.festesocia.entitat', path: '/fes-te-socia/entitat' },
    ],
  },
  { key: 'nav.productes', path: '/productes' },
  { key: 'nav.actualitat', path: '/actualitat' },
  { key: 'nav.contacte', path: '/contacte' },
  { key: 'nav.faqs', path: '/faqs' },
];

/** Footer "documentació" links. Labels are locale-specific. */
export const legalLinks: { label: Record<Lang, string>; path: string }[] = [
  { label: { ca: 'Estatuts', es: 'Estatutos' }, path: '/legal/estatuts' },
  { label: { ca: 'Memòria', es: 'Memoria' }, path: '/legal/memoria' },
  { label: { ca: 'Balanç social', es: 'Balance social' }, path: '/legal/balanc-social' },
  { label: { ca: 'Avís legal', es: 'Aviso legal' }, path: '/legal/avis-legal' },
  { label: { ca: 'Política de privacitat', es: 'Política de privacidad' }, path: '/legal/privacitat' },
  { label: { ca: 'Política de cookies', es: 'Política de cookies' }, path: '/legal/cookies' },
  { label: { ca: 'FAQs', es: 'FAQs' }, path: '/faqs' },
];
