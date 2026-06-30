import { config, fields, collection } from '@keystatic/core';

/**
 * Tiny git-based CMS. Content is committed to the repo as Markdown — no database.
 * Local dev: visit /keystatic. Production: set storage.kind = 'github' with the
 * repo, so editors authenticate with GitHub and edits land as commits/PRs.
 */
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
const storage = import.meta.env.DEV
  ? ({ kind: 'local' } as const)
  : ({ kind: 'github', repo: { owner: 'foodcoopbcn', name: 'foodcoopbcn-website' } } as const);

export default config({
  storage,
  ui: {
    brand: { name: 'FoodCoop BCN' },
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
