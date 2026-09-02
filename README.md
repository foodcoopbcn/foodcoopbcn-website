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
pnpm install
pnpm run dev          # http://localhost:4321
pnpm run build        # astro build + pagefind index → dist/
pnpm run check        # astro check (types)
pnpm run preview
```

**pnpm, not npm.** The repo carried both lockfiles for a while: CI installed with
`npm ci` from `package-lock.json` while Netlify auto-detected `pnpm-lock.yaml`,
so the two could resolve different trees. `package-lock.json` is gone.

The CMS lives at **`/keystatic`** and is **local-only**: `astro.config.mjs` omits
the integration unless `ENABLE_KEYSTATIC=true`, and CI never sets it, so there is
no `/keystatic` route in production. Editors run `pnpm run cms` and preview their
change on the pull request's Netlify deploy. (The `github` storage branch in
`keystatic.config.ts` is therefore unreachable today; wire the route into the
production build before relying on it.)

## The homepage section builder

Non-technical editors compose the homepage at **`/keystatic`** → *Pàgines* → *Inici (CA)* /
*Inicio (ES)*: add, remove, drag-to-reorder sections, and edit their text. No visual canvas —
it's a form with drag handles; preview via the Netlify deploy preview on the PR.

- Content: `src/content/pages/{ca,es}/home/index.yaml` — an ordered `sections` array.
- **Two files define the section types and must not drift**: `keystatic.config.ts` (what
  editors see) and `src/content.config.ts` (the Zod schema Astro validates).
  `src/components/pages/HomePage.astro` renders them.
- Adding a section type = a `fields.blocks` entry + a Zod variant + a `case` in the renderer.

Keystatic's `fields.blocks` is `array(conditional(select, schema))`, so each section is stored
as `{ discriminant, value }`. Two consequences that will bite otherwise:

- **`fields.select` only supports string values**, so `columns` round-trips as `'4'`, not `4`.
  The Zod schema coerces it back.
- **Keystatic omits empty strings on save**, so optional text fields must be `.nullish()`, not
  `.optional()` — `.optional()` would still pass here, but a cleared field can also arrive as
  `null`, which `.optional()` rejects and which would fail the production build.

Guardrails, because a volunteer's typo must never break the deploy:

- Every enum/number uses `.catch(default)` — a bad `tone` degrades instead of failing the build.
  Required strings are deliberately left uncaught: a missing title should be loud.
- CTA `href`s are a `select` of real routes (no free text → no 404s), stored as canonical `ca`
  paths and localised by `localizePath()` at render, so an ES page cannot link to a CA route.
- Icons are a `select` scoped to the real keys in `Icon.astro`.
- An empty CTA label hides the button — the renderer drops CTAs with no label.
- CI builds and runs `./scripts/check-no-client-js.sh` before deploying, so a schema-invalid
  edit or a stray `<script>` fails the PR instead of production.

**CTA labels are editable copy and live in the content files; `t()` still owns nav/footer
chrome.** So "Fes-te sòcia" exists in both `home/index.yaml` and `src/i18n/ui.ts` — renaming the
hero button will not rename the nav button. That's intended (different surfaces), but worth
saying out loud when handing over to editors.

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

## Price comparison ("Compara FoodCoop BCN amb altres supermercats")

The homepage `priceCompare` block renders `src/data/prices.json`, which
`scripts/fetch-prices.mjs` regenerates every morning from `.github/workflows/prices.yml`
(cron + `workflow_dispatch`; the run commits the file and dispatches `deploy.yml`).

- Basket and pinned product ids per shop: `scripts/lib/basket.mjs`. Find a product to pin
  with `node scripts/find.mjs <store> "<query>"`.
- Shop adapters: `scripts/stores/*.mjs` (FoodCoop's Odoo shop, Mercadona, Bonpreu/Esclat,
  Ametller Origen, Condis). Carrefour is not included: its site blocks plain HTTP clients.
- `npm run prices` collects and writes; `npm run prices -- --dry-run` only reports;
  `npm run prices:test` runs the offline parser tests (also part of CI).
- A shop that cannot be read keeps its last good value; `src/lib/prices.ts` hides any figure
  older than 7 days and the whole block if FoodCoop's own prices are stale. Bonpreu sits
  behind AWS WAF and may challenge a runner — check the workflow's step summary.

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
- **Still placeholders**: the illustrated SVGs under `public/images/assets/`.
  `docs/brief-fotografia.md` says exactly which photographs replace them and how
  they should look. The favicon, touch icon and Open Graph card are generated
  from the real badge by `scripts/gen-social-assets.mjs`, and the PDFs under
  `public/docs/` are the real ones.

## Live data

Two figures come from systems rather than from a page, so they cannot go stale
unnoticed:

- **Member count** — `scripts/fetch-members.mjs` reads it from the co-op's Odoo
  and caches it in `src/data/members.json`. Needs `ODOO_URL`, `ODOO_DB`,
  `ODOO_USER` and `ODOO_API_KEY`; without them the cached value stands. Refreshed
  on every deploy and weekly by `.github/workflows/refresh-members.yml`.
  The homepage stats band writes `{socies}` and the renderer substitutes it.
- **Prices** — `scripts/fetch-prices.mjs` collects the daily basket into
  `src/data/prices.json`. For FoodCoop it reads **both** of the shop's price
  lists (public and member) rather than deriving the member price: the member
  tariff is a real list, roughly 8.5% under the public one, not the advertised
  12%, and deriving it published figures the co-op does not charge.

## Guardrails

`./scripts/check-no-client-js.sh` runs in CI after the build. It scans every
page, counts executable inline scripts (JSON-LD is data and does not count),
caps the inline weight per page, and rejects any external script. The one
documented exception is `/actualitat/cerca`, which loads Pagefind's UI.

CI also runs `astro check` and a link check over `dist/`, which is the class of
bug that shipped here twice: hreflang tags pointing at slugs that do not exist,
and download buttons wired to missing PDFs.
