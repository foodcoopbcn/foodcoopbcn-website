import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postBase = z.object({
  title: z.string(),
  date: z.coerce.date(),
  excerpt: z.string(),
  cover: z.string().optional(),
  /** Alt text for the cover. Without it a decorative alt="" is used. */
  coverAlt: z.string().optional(),
  category: z.string(),
  draft: z.boolean().default(false),
  /*
   * Ties the Catalan and Spanish versions of one post together.
   *
   * Slugs differ per language ("millores-2025" / "mejoras-2025"), so the site
   * cannot guess the counterpart by string-swapping the locale prefix — doing
   * that produced hreflang links and a language switcher that 404'd on every
   * article. Give both files the same key and the pair resolves properly; leave
   * it out and the post is simply treated as untranslated.
   */
  translationKey: z.string().optional(),
});

/** News posts. Files live in src/content/news/{ca,es}/*.md (lang from folder). */
const news = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,mdoc}', base: './src/content/news' }),
  schema: postBase,
});

/** Recipes — same shape plus optional structured fields for Recipe JSON-LD. */
const recipes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx,mdoc}', base: './src/content/recipes' }),
  schema: postBase.extend({
    servings: z.string().optional(),
    time: z.string().optional(),
    ingredients: z.array(z.string()).default([]),
  }),
});

/** Editable taxonomy for categories (label per language). */
const categories = defineCollection({
  loader: glob({ pattern: '**/*.{md,json}', base: './src/content/categories' }),
  schema: z.object({
    name_ca: z.string(),
    name_es: z.string(),
    order: z.number().default(0),
  }),
});

/*
 * Composed pages — an ordered list of sections editors add/remove/reorder in Keystatic.
 *
 * This schema MIRRORS keystatic.config.ts and must not drift from it. Keystatic's
 * `fields.blocks` is array(conditional(select, schema)), so each section is stored as
 * `{ discriminant, value }`; `fields.select` only supports string values, which is why
 * `columns` arrives as '4' rather than 4.
 *
 * Two rules keep a volunteer's edit from breaking the production deploy:
 *  - `.nullish()`, never `.optional()`, on anything clearable — a cleared field can arrive
 *    as null, and `.optional()` rejects null.
 *  - `.catch()` on every enum/number, so a bad value degrades to a default instead of failing
 *    the build. Required strings are deliberately left uncaught — a missing title should be loud.
 */
const optionalText = () => z.string().nullish().transform((v) => v ?? '');

/** Keystatic always writes the CTA object; an empty label is how an editor hides the button. */
const cta = z
  .object({ label: z.string().nullish(), href: z.string().nullish() })
  .nullish()
  .transform((c) => (c?.label ? { label: c.label, href: c.href || '/' } : undefined));

const block = <T extends string, S extends z.ZodRawShape>(discriminant: T, value: S) =>
  z.object({ discriminant: z.literal(discriminant), value: z.object(value) });

const heroSection = block('hero', {
  eyebrow: optionalText(),
  title: z.string(),
  highlights: z.array(z.string()).default([]),
  text: optionalText(),
  image: optionalText(),
  imageAlt: optionalText(),
  primaryCta: cta,
  secondaryCta: cta,
});

const featureGridSection = block('featureGrid', {
  eyebrow: optionalText(),
  title: optionalText(),
  intro: optionalText(),
  tone: z.enum(['paper', 'soft', 'green']).catch('paper'),
  columns: z
    .enum(['2', '3', '4'])
    .catch('3')
    .transform((v) => Number(v) as 2 | 3 | 4),
  features: z
    .array(z.object({ icon: optionalText(), title: z.string(), text: z.string() }))
    .default([]),
});

const splitCardsSection = block('splitCards', {
  eyebrow: optionalText(),
  title: optionalText(),
  intro: optionalText(),
  tone: z.enum(['paper', 'soft', 'green']).catch('soft'),
  options: z
    .array(
      z.object({
        badge: optionalText(),
        title: z.string(),
        text: z.string(),
        points: z.array(z.string()).default([]),
        cta,
        featured: z.boolean().catch(false),
      }),
    )
    .default([]),
});

const statsSection = block('stats', {
  title: optionalText(),
  tone: z.enum(['paper', 'soft', 'green', 'ink']).catch('ink'),
  stats: z
    .array(z.object({ value: z.string(), label: z.string(), icon: optionalText() }))
    .default([]),
  cta,
});

const infoStripSection = block('infoStrip', {
  addressLabel: optionalText(),
});

const mediaSplitSection = block('mediaSplit', {
  eyebrow: optionalText(),
  title: z.string(),
  text: optionalText(),
  image: optionalText(),
  imageAlt: optionalText(),
  reverse: z.boolean().catch(false),
  tone: z.enum(['paper', 'soft', 'green']).catch('paper'),
  cta,
});

const comparisonTableSection = block('comparisonTable', {
  eyebrow: optionalText(),
  title: z.string(),
  intro: optionalText(),
  tone: z.enum(['paper', 'soft', 'green']).catch('soft'),
  columns: z
    .array(z.object({ label: z.string(), featured: z.boolean().catch(false) }))
    .default([]),
  rows: z
    .array(z.object({ label: z.string(), values: z.array(z.string()).default([]) }))
    .default([]),
  primaryCta: cta,
  secondaryCta: cta,
});

const photoCardsSection = block('photoCards', {
  eyebrow: optionalText(),
  title: optionalText(),
  intro: optionalText(),
  layout: z.enum(['tile', 'card']).catch('card'),
  columns: z
    .enum(['2', '3', '4', '6'])
    .catch('3')
    .transform((v) => Number(v) as 2 | 3 | 4 | 6),
  tone: z.enum(['paper', 'soft', 'green']).catch('paper'),
  items: z
    .array(
      z.object({
        image: optionalText(),
        imageAlt: optionalText(),
        title: z.string(),
        text: optionalText(),
        cta,
      }),
    )
    .default([]),
});

/** Post cards are generated from the news/recipes collections — only the heading is editable. */
const newsTeaserSection = block('newsTeaser', {
  title: z.string(),
  limit: z.number().int().min(1).max(6).catch(3),
  tone: z.enum(['paper', 'soft', 'green']).catch('paper'),
});

/*
 * A teaser for the price comparison, which lives on its own page at /comparativa.
 * The full five-column table used to sit on the homepage; it is ~70 KB of HTML and
 * far more detail than a first visit needs. Only the heading is editable — the
 * product shown is chosen from live data by pickHighlight().
 */
const priceTeaserSection = block('priceTeaser', {
  eyebrow: optionalText(),
  title: optionalText(),
  tone: z.enum(['paper', 'soft', 'green']).catch('soft'),
});

const ctaSectionSchema = block('ctaSection', {
  title: z.string(),
  text: optionalText(),
  primaryCta: cta,
  secondaryCta: cta,
});

/**
 * Keystatic singletons write to <path>/index.yaml, so files live at
 * src/content/pages/{ca,es}/home/index.yaml. generateId strips the /index suffix to keep
 * ids as `<lang>/<page>`, matching the folder-based lang convention used by news/recipes.
 */
const pages = defineCollection({
  loader: glob({
    pattern: '**/index.yaml',
    base: './src/content/pages',
    generateId: ({ entry }) => entry.replace(/\/index\.yaml$/, ''),
  }),
  schema: z.object({
    sections: z
      .array(
        z.discriminatedUnion('discriminant', [
          heroSection,
          featureGridSection,
          splitCardsSection,
          statsSection,
          infoStripSection,
          mediaSplitSection,
          comparisonTableSection,
          photoCardsSection,
          newsTeaserSection,
          priceTeaserSection,
          ctaSectionSchema,
        ]),
      )
      .default([]),
  }),
});

export const collections = { news, recipes, categories, pages };
