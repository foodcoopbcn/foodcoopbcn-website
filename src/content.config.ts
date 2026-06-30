import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postBase = z.object({
  title: z.string(),
  date: z.coerce.date(),
  excerpt: z.string(),
  cover: z.string().optional(),
  category: z.string(),
  draft: z.boolean().default(false),
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

export const collections = { news, recipes, categories };
