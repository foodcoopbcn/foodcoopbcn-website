# FoodCoop BCN — website

Static rebuild of [foodcoopbcn.cat](https://foodcoopbcn.cat) (the cooperative,
participatory, non-profit supermarket of Barcelona), replacing the old WordPress
site. Built to be lightweight, SEO-first, fully pre-rendered (no client-side
rendering), bilingual (Catalan / Spanish), and easy to redesign or extend.

## Stack

| Concern | Choice |
|---|---|
| Framework | **Astro** (`output: 'static'`) — zero-JS by default, SSG |
| Styling / design system | **Tailwind CSS v4** + CSS design tokens (`src/styles/tokens.css`) |
| Content / blog | **Astro content collections** (Markdoc) + **Keystatic** git CMS |
| i18n | Astro routing — `ca` at `/`, `es` at `/es/` |
| Search | **Pagefind** (static index built at deploy) |
| Forms | **Netlify Forms** (contact + newsletter) |
| Hosting | **Netlify** (`netlify.toml`) |

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # astro build + pagefind index → dist/
npm run preview
```

The blog CMS lives at **`/keystatic`** (local mode in dev). For production, switch
`keystatic.config.ts` `storage` to `{ kind: 'github', repo: {...} }` so editors
authenticate with GitHub and edits land as commits/PRs.

## Project structure

- `src/styles/tokens.css` — **design tokens**; a redesign mostly means editing this file.
- `src/components/ui/` — primitives (Button, Card, Tag, Accordion, Icon, LangToggle).
- `src/components/sections/` — **composable page blocks** (Hero, FeatureGrid, SplitCards,
  Stats, CTASection, PageHeader). New landings = compose these.
- `src/components/layout/` — Header, Footer, Newsletter, CookieBanner.
- `src/components/pages/` — bilingual page compositions; thin route files in
  `src/pages/**` (ca) and `src/pages/es/**` render them.
- `src/content/{news,recipes,categories}/` — blog content (Markdoc/JSON).
- `src/i18n/` — UI strings + locale helpers. `src/config/site.ts` — nav, NAP, hours, social.
- `src/lib/posts.ts` — blog data layer.

## Adding things

- **A blog post**: use `/keystatic`, or drop a `.mdoc` in `src/content/news/<lang>/`.
- **A new page**: build a composition in `src/components/pages/`, add a route file in
  `src/pages/<slug>.astro` and `src/pages/es/<slug>.astro`, and a nav entry in
  `src/config/site.ts`.
- **A new section type**: add a component under `src/components/sections/`.

## Content migration from WordPress

```bash
node scripts/migrate-wp.mjs --lang ca --type news
node scripts/migrate-wp.mjs --lang es --type recipes
```

Pulls posts via the WP REST API, downloads cover images, and writes `.mdoc` files.
Review categories/slugs, then add 301 redirects from old permalinks in `netlify.toml`.

## Notes

- The member login portal and member-only online shop are an **external system**
  (`org.memberLoginUrl` in `src/config/site.ts`); the site links out to them.
- Content pages ship **no external JS**; only `/keystatic` (admin) and the search
  page load JS. Verify with “disable JavaScript” — navigation and content still work.
- Replace placeholders before launch: `public/favicon.svg`, `public/og-default.svg`,
  `src/components/layout/Logo.astro`, the blog cover images, and the PDFs under
  `public/docs/` (estatuts, memòria).
