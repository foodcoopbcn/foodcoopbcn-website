import { config, fields, collection, singleton } from '@keystatic/core';

/**
 * Tiny git-based CMS. Content is committed to the repo as Markdown — no database.
 * Local dev: visit /keystatic. Production: set storage.kind = 'github' with the
 * repo, so editors authenticate with GitHub and edits land as commits/PRs.
 */

/* ---------------------------------------------------------------------------
 * Composed pages — the section builder.
 *
 * `fields.blocks` is sugar for array(conditional(select, schemas)), so it writes
 * each section as `{ discriminant: <type>, value: {...} }` and gives editors
 * add / remove / drag-to-reorder. The Zod mirror lives in src/content.config.ts
 * and must match this shape; src/components/pages/HomePage.astro renders it.
 * ------------------------------------------------------------------------ */

/** Routing, not copy: a typo here is a 404 an editor cannot see. Canonical (ca) paths —
 *  localizePath() adds the /es prefix at render, so an ES page cannot link to a CA route. */
const ROUTES = [
  '/',
  '/qui-som',
  '/el-super',
  '/fes-te-socia',
  '/fes-te-socia/persona',
  '/fes-te-socia/entitat',
  '/productes',
  '/actualitat',
  '/contacte',
  '/faqs',
];

/** Scoped to the real keys in src/components/ui/Icon.astro — an unknown name renders empty. */
const ICONS = ['leaf', 'heart', 'vote', 'user', 'basket', 'clock', 'pin', 'globe', 'mail', 'phone'];

const opts = (values: string[]) => values.map((v) => ({ label: v, value: v }));

/** Leave the label empty to hide the button — the renderer drops CTAs with no label. */
const cta = (label: string) =>
  fields.object(
    {
      label: fields.text({ label: 'Text del botó', description: 'Deixa-ho buit per amagar el botó.' }),
      href: fields.select({ label: 'Enllaç', options: opts(ROUTES), defaultValue: '/' }),
    },
    { label },
  );

const toneField = (values: string[], defaultValue: string) =>
  fields.select({ label: 'Fons', options: opts(values), defaultValue });

const sectionBlocks = {
  hero: {
    label: 'Hero',
    itemLabel: (props: any) => `Hero — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      highlights: fields.array(fields.text({ label: 'Punt' }), {
        label: 'Punts destacats',
        itemLabel: (props) => props.value,
      }),
      text: fields.text({ label: 'Text', multiline: true }),
      primaryCta: cta('Botó principal'),
      secondaryCta: cta('Botó secundari'),
    }),
  },
  featureGrid: {
    label: 'Graella de valors',
    itemLabel: (props: any) => `Graella — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      intro: fields.text({ label: 'Introducció', multiline: true }),
      tone: toneField(['paper', 'soft', 'green'], 'paper'),
      columns: fields.select({
        label: 'Columnes',
        options: [
          { label: '2', value: '2' },
          { label: '3', value: '3' },
          { label: '4', value: '4' },
        ],
        defaultValue: '4',
      }),
      features: fields.array(
        fields.object({
          icon: fields.select({ label: 'Icona', options: opts(ICONS), defaultValue: 'leaf' }),
          title: fields.text({ label: 'Títol' }),
          text: fields.text({ label: 'Text', multiline: true }),
        }),
        { label: 'Valors', itemLabel: (props) => props.fields.title.value },
      ),
    }),
  },
  splitCards: {
    label: 'Targetes comparatives',
    itemLabel: (props: any) => `Targetes — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      intro: fields.text({ label: 'Introducció', multiline: true }),
      tone: toneField(['paper', 'soft', 'green'], 'soft'),
      options: fields.array(
        fields.object({
          badge: fields.text({ label: 'Distintiu' }),
          title: fields.text({ label: 'Títol' }),
          text: fields.text({ label: 'Text', multiline: true }),
          points: fields.array(fields.text({ label: 'Punt' }), {
            label: 'Punts',
            itemLabel: (props) => props.value,
          }),
          featured: fields.checkbox({ label: 'Destacada', defaultValue: false }),
          cta: cta('Botó'),
        }),
        { label: 'Opcions', itemLabel: (props) => props.fields.title.value },
      ),
    }),
  },
  stats: {
    label: 'Xifres',
    schema: fields.object({
      tone: toneField(['paper', 'soft', 'green', 'ink'], 'ink'),
      stats: fields.array(
        fields.object({
          value: fields.text({ label: 'Xifra' }),
          label: fields.text({ label: 'Etiqueta' }),
        }),
        { label: 'Xifres', itemLabel: (props) => `${props.fields.value.value} ${props.fields.label.value}` },
      ),
    }),
  },
  newsTeaser: {
    label: 'Actualitat (automàtic)',
    schema: fields.object({
      title: fields.text({ label: 'Títol' }),
      tone: toneField(['paper', 'soft', 'green'], 'paper'),
      limit: fields.integer({
        label: "Nombre d'articles",
        defaultValue: 3,
        validation: { min: 1, max: 6 },
      }),
    }),
  },
  ctaSection: {
    label: "Crida a l'acció",
    itemLabel: (props: any) => `Crida — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      title: fields.text({ label: 'Títol' }),
      text: fields.text({ label: 'Text', multiline: true }),
      primaryCta: cta('Botó principal'),
      secondaryCta: cta('Botó secundari'),
    }),
  },
};

/** One singleton per language — editors can reorder sections but not invent pages
 *  (Astro routes are file-based in src/pages, so a new file would have no route). */
function homePage(lang: 'ca' | 'es', label: string) {
  return singleton({
    label,
    path: `src/content/pages/${lang}/home/`,
    format: { data: 'yaml' },
    schema: {
      sections: fields.blocks(sectionBlocks, {
        label: 'Seccions',
        description: 'Arrossega per reordenar. Afegeix-ne de noves amb el botó de sota.',
      }),
    },
  });
}
function postSchema(folder: 'news' | 'recipes') {
  return {
    title: fields.slug({ name: { label: 'Title' } }),
    date: fields.date({ label: 'Date', defaultValue: { kind: 'today' } }),
    category: fields.text({ label: 'Category (slug)' }),
    excerpt: fields.text({ label: 'Excerpt', multiline: true }),
    cover: fields.image({
      label: 'Cover image',
      directory: `public/images/${folder}`,
      publicPath: `/images/${folder}/`,
    }),
    draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
    content: fields.markdoc({
      label: 'Content',
      options: {
        image: {
          directory: `public/images/${folder}`,
          publicPath: `/images/${folder}/`,
        },
      },
    }),
  };
}

// Local file editing in dev; GitHub commits/PRs in production.
// Optional chaining: import.meta.env only exists under Vite, and this config is also
// imported by plain Node tooling (e.g. Keystatic's reader API).
const storage = import.meta.env?.DEV
  ? ({ kind: 'local' } as const)
  : ({ kind: 'github', repo: { owner: 'foodcoopbcn', name: 'foodcoopbcn-website' } } as const);

export default config({
  storage,
  ui: {
    brand: { name: 'FoodCoop BCN' },
    navigation: {
      Pàgines: ['homeCa', 'homeEs'],
      Actualitat: ['newsCa', 'newsEs', 'recipesCa', 'recipesEs', 'categories'],
    },
  },
  singletons: {
    homeCa: homePage('ca', 'Inici (CA)'),
    homeEs: homePage('es', 'Inicio (ES)'),
  },
  collections: {
    newsCa: collection({
      label: 'Actualitat (CA)',
      slugField: 'title',
      path: 'src/content/news/ca/*',
      format: { contentField: 'content' },
      schema: postSchema('news'),
    }),
    newsEs: collection({
      label: 'Actualidad (ES)',
      slugField: 'title',
      path: 'src/content/news/es/*',
      format: { contentField: 'content' },
      schema: postSchema('news'),
    }),
    recipesCa: collection({
      label: 'Receptes (CA)',
      slugField: 'title',
      path: 'src/content/recipes/ca/*',
      format: { contentField: 'content' },
      schema: postSchema('recipes'),
    }),
    recipesEs: collection({
      label: 'Recetas (ES)',
      slugField: 'title',
      path: 'src/content/recipes/es/*',
      format: { contentField: 'content' },
      schema: postSchema('recipes'),
    }),
    categories: collection({
      label: 'Categories',
      slugField: 'name_ca',
      path: 'src/content/categories/*',
      format: { data: 'json' },
      schema: {
        name_ca: fields.slug({ name: { label: 'Nom (CA)' } }),
        name_es: fields.text({ label: 'Nombre (ES)' }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
  },
});
