import type { Lang, UiKey } from '../i18n/ui';
import membersData from '../data/members.json';

/** Locale-independent organisation data (NAP, hours, socials, external links). */
export const org = {
  name: 'FoodCoop BCN',
  legalName: 'Foodcoop Barcelona SCCL',
  email: 'hola@foodcoopbcn.cat',
  phone: '+34 930 32 24 96',
  phoneDisplay: '930 32 24 96',
  address: {
    street: 'Passatge d’Aragó, 9',
    locality: 'Barcelona',
    postalCode: '08011',
    country: 'ES',
  },
  /** Opening day of the shop — used by the Organization JSON-LD. */
  foundingDate: '2022-02-08',
  /*
   * Members, read from src/data/members.json.
   *
   * The number grows every month, so it is not typed into any page: it is pulled
   * from Odoo — the only system that knows it — by scripts/fetch-members.mjs and
   * cached in that file. If the fetch cannot run, the last cached value stands.
   *
   * Never replace this with a figure from a press article: the site shipped "530"
   * that way, taken from 2024 coverage, when the real number was 1.001.
   */
  members: membersData.count,
  membersAsOf: membersData.fetchedAt,
  /**
   * Approximate coordinates of Ptge. d'Aragó 9. VERIFY against the co-op's Google
   * Business Profile before launch: schema.org geo and GBP must agree.
   */
  geo: { latitude: 41.3866, longitude: 2.1547 },
  /*
   * Two different external systems, and they are not interchangeable:
   * `memberLoginUrl` is the Odoo back office members sign in to, `shopUrl` is the
   * member-only online shop. Sending "Accés sòcies" to the shop logs nobody in.
   */
  memberLoginUrl: 'https://gestio.foodcoopbcn.cat/web/login',
  shopUrl: 'https://botiga.foodcoopbcn.cat/',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Passatge+d%27Arag%C3%B3+9+08011+Barcelona',
} as const;

/**
 * Membership figures — the single source of truth for every euro amount and hour
 * count on the site. They were missing from the rebuild entirely, which left the
 * #1 question ("how much does it cost?") unanswered on every page.
 */
export const membership = {
  /** One-off, refundable share capital for a consumer member. */
  capital: 40,
  /** Permanent member discount, in percent. Confirmed by the co-op, Sep 2026. */
  discount: 12,
  /** A shift is this long, once every `shiftCycleWeeks` weeks. */
  shiftHours: '2-2,5',
  shiftCycleWeeks: 4,
  /** Flexible shift changes allowed per year. */
  flexibleChanges: 13,
  /** Quarterly fee for members who cannot commit to a shift. */
  quota: { standard: 20, reduced: 10 },
  /** Share capital for an organisation ("entitat amiga"): one-off or per year. */
  entityCapital: 150,
  /** Discount for the staff of a member organisation, in percent. */
  entityStaffDiscount: 5,
  /** Bike delivery fee: cheaper above the threshold. */
  delivery: { threshold: 120, cheap: 2.5, standard: 5 },
  /** The welcome session new members attend, in minutes. */
  welcomeSessionMinutes: 45,
  /**
   * Where "start the sign-up" points. Today it is our own Netlify-form page.
   * ⚠️ Swap for the co-op's real sign-up URL (Odoo?) as soon as it is confirmed —
   * this is the single link the whole conversion funnel depends on.
   */
  signupPath: '/fes-te-socia/alta',
} as const;

/**
 * Audience measurement.
 *
 * `null` means the site sets no non-essential cookies at all — and so it shows no
 * consent banner. It previously showed one asking permission for "anonymous
 * statistics" that were never installed and that nothing listened for, which is
 * both untrue and, under AEPD guidance, a dark pattern in its own right: a site
 * with nothing to consent to should not interrupt anyone.
 *
 * To turn measurement on, set a provider here. Prefer a cookieless one
 * (Plausible, Umami) or server-side Netlify Analytics, which need no banner at
 * all. Only pick a cookie-based provider if you genuinely need it — that is what
 * brings the banner, and the consent gate, back.
 */
export const analytics: { provider: 'plausible' | 'umami'; src: string; site: string } | null = null;

export const social = [
  { name: 'Instagram', href: 'https://www.instagram.com/foodcoopbcn/', icon: 'instagram' },
  { name: 'Facebook', href: 'https://www.facebook.com/foodcoopbcn', icon: 'facebook' },
  { name: 'Telegram', href: 'https://t.me/foodcoopbcn', icon: 'telegram' },
  { name: 'Mastodon', href: 'https://mastodon.social/@foodcoopbcn', icon: 'mastodon' },
] as const;

/**
 * Opening hours, structured so they can be indexed by weekday.
 *
 * `day` is the JS `Date#getDay()` index (0 = Sunday), which is what lets the footer and the
 * homepage strip show *today's* row; `ranges: []` means closed. Day names are translated —
 * they live in src/i18n/ui.ts under `day.0`…`day.6`, not here.
 *
 * Listed Monday-first, which is the order they are displayed in.
 */
export type HoursDay = { day: number; ranges: [string, string][] };

export const hours: HoursDay[] = [
  { day: 1, ranges: [['17:00', '20:30']] },
  { day: 2, ranges: [['10:00', '14:00'], ['17:00', '20:30']] },
  { day: 3, ranges: [['10:00', '14:00'], ['17:00', '20:30']] },
  { day: 4, ranges: [['10:00', '14:00'], ['17:00', '20:30']] },
  { day: 5, ranges: [['10:00', '20:30']] },
  { day: 6, ranges: [['10:00', '14:00']] },
  { day: 0, ranges: [] },
];

/** `day.0`…`day.6` — the UI key holding the name of a weekday index. */
export const dayKey = (day: number) => `day.${day}` as UiKey;

/** Format one day's ranges for display: "10:00-14:00 · 17:00-20:30". */
export const formatRanges = (ranges: [string, string][], closed = '—') =>
  ranges.length ? ranges.map(([from, to]) => `${from}-${to}`).join(' · ') : closed;

type NavItem = {
  key: UiKey;
  path: string;
  /** Links out of the site: no locale prefix, opens in a new tab. */
  external?: boolean;
  /** Rendered as a pill button rather than a plain link. */
  highlight?: boolean;
  children?: { key: UiKey; path: string }[];
};

/**
 * Main navigation.
 *
 * Five entries, one of which is the conversion action. It used to carry seven
 * plain links plus two competing pills (a green "Fes-te sòcia" next to a yellow
 * "Botiga online"), which left nothing obviously primary — and it ranked the
 * member login, used weekly by the ~500 people already in, above the action
 * aimed at everyone who is not. Support links moved to `utilityNav`.
 *
 * `key` is a UI string key; `path` is the canonical (ca) route — localizePath()
 * adds the /es prefix at render. Anchor children point at ids on the target page.
 */
export const mainNav: NavItem[] = [
  {
    key: 'nav.quisom',
    path: '/qui-som',
    children: [
      { key: 'nav.quisom.projecte', path: '/qui-som' },
      { key: 'nav.quisom.governanca', path: '/qui-som#governanca' },
      { key: 'nav.quisom.transparencia', path: '/qui-som/transparencia' },
      { key: 'nav.premsa', path: '/premsa' },
    ],
  },
  {
    key: 'nav.elsuper',
    path: '/el-super',
    children: [
      { key: 'nav.elsuper.horaris', path: '/el-super' },
      { key: 'nav.productes', path: '/productes' },
      { key: 'nav.comfunciona', path: '/com-funciona' },
      { key: 'nav.comparativa', path: '/comparativa' },
    ],
  },
  {
    key: 'nav.festesocia',
    path: '/fes-te-socia',
    highlight: true,
    children: [
      { key: 'nav.festesocia.persona', path: '/fes-te-socia/persona' },
      { key: 'nav.festesocia.entitat', path: '/fes-te-socia/entitat' },
      { key: 'nav.festesocia.torns', path: '/fes-te-socia/torns' },
      { key: 'nav.festesocia.preus', path: '/fes-te-socia/preus' },
    ],
  },
  {
    key: 'nav.actualitat',
    path: '/actualitat',
    children: [
      { key: 'nav.actualitat.noticies', path: '/actualitat' },
      { key: 'nav.actualitat.receptes', path: '/actualitat/categoria/receptes' },
    ],
  },
  /* The shop is a destination, not a section: marked external so it opens out. */
  { key: 'nav.botiga', path: org.shopUrl, external: true },
];

/**
 * Utility navigation — the thin row above the main bar.
 *
 * Everything here is either for people who are already members, or support. It
 * scrolls away; only the main bar stays pinned.
 */
export const utilityNav: NavItem[] = [
  { key: 'nav.espaisocia', path: org.memberLoginUrl, external: true },
  { key: 'nav.faqs', path: '/faqs' },
  { key: 'nav.contacte', path: '/contacte' },
  { key: 'nav.newsletter', path: '/#newsletter' },
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
