import { config, fields, collection, singleton } from '@keystatic/core';
import { copySingletons } from './keystatic.copy';

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
  '/qui-som#valors',
  '/qui-som#historia',
  '/qui-som#governanca',
  '/el-super',
  '/el-super#espai',
  '/el-super#horaris',
  '/fes-te-socia',
  '/fes-te-socia/persona',
  '/fes-te-socia/entitat',
  '/productes',
  '/comparativa',
  '/actualitat',
  '/contacte',
  '/faqs',
  // The member shop is an external system; HomePage's href() passes non-"/" values through.
  'https://botiga.foodcoopbcn.cat/',
];

/** Scoped to the real keys in src/components/ui/Icon.astro — an unknown name renders empty. */
const ICONS = [
  'leaf', 'heart', 'vote', 'user', 'basket', 'clock', 'pin', 'globe', 'mail', 'phone',
  // Product and document vocabulary — see the second group in Icon.astro.
  'apple', 'jar', 'milk', 'bread', 'bottle', 'soap', 'doc', 'chart', 'scale',
];

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

/** Images are plain public/ paths everywhere in this project (astro:assets is not used). */
const imageField = (label = 'Imatge') =>
  fields.text({
    label,
    description: 'Ruta dins de public/, per exemple /images/assets/home-quisom.webp',
  });

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
      image: imageField('Foto de capçalera'),
      imageAlt: fields.text({ label: 'Text alternatiu de la foto' }),
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
      title: fields.text({ label: 'Títol', multiline: true }),
      tone: toneField(['paper', 'soft', 'green', 'ink'], 'ink'),
      stats: fields.array(
        fields.object({
          value: fields.text({ label: 'Xifra' }),
          label: fields.text({ label: 'Etiqueta' }),
          icon: fields.select({ label: 'Icona', options: opts(['', ...ICONS]), defaultValue: '' }),
        }),
        { label: 'Xifres', itemLabel: (props) => `${props.fields.value.value} ${props.fields.label.value}` },
      ),
      cta: cta('Botó'),
    }),
  },
  infoStrip: {
    label: 'Franja d’adreça i horari',
    schema: fields.object({
      addressLabel: fields.text({
        label: 'Adreça',
        description: 'Deixa-ho buit per fer servir l’adreça de la configuració del lloc.',
      }),
    }),
  },
  mediaSplit: {
    label: 'Foto + text',
    itemLabel: (props: any) => `Foto + text — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      text: fields.text({ label: 'Text', multiline: true }),
      image: imageField(),
      imageAlt: fields.text({ label: 'Text alternatiu' }),
      reverse: fields.checkbox({ label: 'Foto a la dreta', defaultValue: false }),
      tone: toneField(['paper', 'soft', 'green'], 'paper'),
      cta: cta('Botó'),
    }),
  },
  comparisonTable: {
    label: 'Taula comparativa',
    itemLabel: (props: any) => `Taula — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      intro: fields.text({ label: 'Introducció', multiline: true }),
      tone: toneField(['paper', 'soft', 'green'], 'soft'),
      columns: fields.array(
        fields.object({
          label: fields.text({ label: 'Columna' }),
          featured: fields.checkbox({ label: 'Destacada', defaultValue: false }),
        }),
        { label: 'Columnes', itemLabel: (props) => props.fields.label.value },
      ),
      rows: fields.array(
        fields.object({
          label: fields.text({ label: 'Fila' }),
          values: fields.array(
            fields.text({
              label: 'Valor',
              description: 'Escriu "yes" per un tic, "no" per un guió, o qualsevol altre text.',
            }),
            { label: 'Valors (un per columna, en ordre)', itemLabel: (props) => props.value },
          ),
        }),
        { label: 'Files', itemLabel: (props) => props.fields.label.value },
      ),
      primaryCta: cta('Botó principal'),
      secondaryCta: cta('Botó secundari'),
    }),
  },
  photoCards: {
    label: 'Targetes amb foto',
    itemLabel: (props: any) => `Targetes amb foto — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      intro: fields.text({ label: 'Introducció', multiline: true }),
      layout: fields.select({
        label: 'Format',
        options: [
          { label: 'Mosaic (foto + peu)', value: 'tile' },
          { label: 'Targeta (foto, títol, text i enllaç)', value: 'card' },
        ],
        defaultValue: 'card',
      }),
      columns: fields.select({
        label: 'Columnes',
        options: opts(['2', '3', '4', '6']),
        defaultValue: '3',
      }),
      tone: toneField(['paper', 'soft', 'green'], 'paper'),
      tight: fields.checkbox({ label: 'Enganxa a la secció de sobre', defaultValue: false }),
      items: fields.array(
        fields.object({
          image: imageField(),
          imageAlt: fields.text({ label: 'Text alternatiu' }),
          title: fields.text({ label: 'Títol' }),
          text: fields.text({ label: 'Text', multiline: true }),
          cta: cta('Enllaç'),
        }),
        { label: 'Elements', itemLabel: (props) => props.fields.title.value },
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
  priceTeaser: {
    label: 'Preus: la cistella botiga a botiga (automàtic)',
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta', description: 'Deixa-ho buit per al text per defecte.' }),
      title: fields.text({ label: 'Títol', description: 'Deixa-ho buit per al text per defecte.' }),
      tone: toneField(['paper', 'soft', 'green'], 'soft'),
    }),
  },
  showcaseBand: {
    label: 'Banda amb foto a tota amplada',
    itemLabel: (props: any) => `Banda amb foto — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      text: fields.text({ label: 'Text', multiline: true }),
      image: imageField('Fotografia de fons'),
      imageAlt: fields.text({ label: 'Text alternatiu' }),
      align: fields.select({
        label: 'Posició del text',
        options: [
          { label: 'A l’esquerra', value: 'left' },
          { label: 'Centrat', value: 'centre' },
        ],
        defaultValue: 'left',
      }),
      height: fields.select({
        label: 'Alçada',
        options: [
          { label: 'Mitjana', value: 'md' },
          { label: 'Alta', value: 'lg' },
        ],
        defaultValue: 'md',
      }),
      primaryCta: cta('Botó principal'),
      secondaryCta: cta('Botó secundari'),
    }),
  },
  stickySteps: {
    label: 'Passos (títol fix)',
    itemLabel: (props: any) => `Passos — ${props.fields.title.value || 'sense títol'}`,
    schema: fields.object({
      eyebrow: fields.text({ label: 'Etiqueta' }),
      title: fields.text({ label: 'Títol' }),
      intro: fields.text({ label: 'Introducció', multiline: true }),
      tone: toneField(['paper', 'soft', 'green'], 'paper'),
      steps: fields.array(
        fields.object({
          icon: fields.select({ label: 'Icona', options: opts(ICONS), defaultValue: 'basket' }),
          title: fields.text({ label: 'Títol' }),
          text: fields.text({ label: 'Text', multiline: true }),
        }),
        {
          label: 'Passos',
          description: 'Els números es generen sols: si els reordenes, es renumeren.',
          itemLabel: (props) => props.fields.title.value,
        },
      ),
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
    coverAlt: fields.text({
      label: 'Cover alt text',
      description:
        'What the photo shows, for people using a screen reader. Leave empty only if the image adds nothing the headline does not already say.',
    }),
    translationKey: fields.text({
      label: 'Translation key',
      description:
        'Give the Catalan and Spanish versions of the same post the SAME key so they link to each other. Slugs differ per language, so without it the language switch and the hreflang tags point at a 404.',
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

/*
 * FAQs. Answers may contain {capital}, {discount}, {hours}, {street} and the other
 * tokens listed below; the page substitutes them from src/config/site.ts, so never
 * type a figure straight into an answer — it would then drift from the rest of the
 * site the next time the co-op changes it.
 */
const faqSchema = {
  groups: fields.array(
    fields.object({
      title: fields.text({ label: 'Títol del grup' }),
      faqs: fields.array(
        fields.object({
          q: fields.text({ label: 'Pregunta' }),
          a: fields.text({
            label: 'Resposta',
            multiline: true,
            description:
              'Pots fer servir {capital}, {discount}, {quotaStandard}, {quotaReduced}, {entityCapital}, {shiftHours}, {shiftCycleWeeks}, {flexibleChanges}, {deliveryThreshold}, {deliveryCheap}, {deliveryStandard}, {street}, {postalCode} i {hours}.',
          }),
        }),
        { label: 'Preguntes', itemLabel: (p) => p.fields.q.value || 'Nova pregunta' },
      ),
    }),
    { label: 'Grups', itemLabel: (p) => p.fields.title.value || 'Nou grup' },
  ),
};

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
    faqsCa: {
      label: 'FAQs (CA)',
      path: 'src/content/faqs/ca/index',
      format: { data: 'yaml' },
      schema: faqSchema,
    },
    faqsEs: {
      label: 'FAQs (ES)',
      path: 'src/content/faqs/es/index',
      format: { data: 'yaml' },
      schema: faqSchema,
    },
    homeCa: homePage('ca', 'Inici (CA)'),
    homeEs: homePage('es', 'Inicio (ES)'),
    /*
     * One singleton per interior page per language. This is the copy that used
     * to be a `const c = { ca: {...}, es: {...} }` object in each component,
     * which meant a typo needed a developer and a deploy to fix.
     */
    ...copySingletons,
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
