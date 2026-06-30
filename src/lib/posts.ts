import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type PostType = 'news' | 'recipes';
export type AnyPost = CollectionEntry<'news'> | CollectionEntry<'recipes'>;

const isProd = import.meta.env.PROD;

/** Entry ids are `<lang>/<slug>`; derive both. */
export function entryLang(id: string): Lang {
  return id.startsWith('es/') ? 'es' : 'ca';
}
export function entrySlug(id: string): string {
  return id.replace(/^(ca|es)\//, '');
}

function visible(entry: AnyPost): boolean {
  return !(isProd && entry.data.draft);
}

/** All posts of a type for a language, newest first. */
export async function getPosts(type: PostType, lang: Lang): Promise<AnyPost[]> {
  const all = (await getCollection(type)) as AnyPost[];
  return all
    .filter((e) => entryLang(e.id) === lang && visible(e))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** News + recipes merged, newest first (for the unified index + search). */
export async function getAllPosts(lang: Lang): Promise<{ type: PostType; entry: AnyPost }[]> {
  const [news, recipes] = await Promise.all([getPosts('news', lang), getPosts('recipes', lang)]);
  return [
    ...news.map((entry) => ({ type: 'news' as const, entry })),
    ...recipes.map((entry) => ({ type: 'recipes' as const, entry })),
  ].sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());
}

/** Category slugs in use for a language, with counts. */
export async function getCategoryCounts(lang: Lang): Promise<{ slug: string; count: number }[]> {
  const posts = await getAllPosts(lang);
  const map = new Map<string, number>();
  for (const { entry } of posts) {
    const c = entry.data.category;
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  return [...map.entries()].map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
}

/** Resolve a human label for a category slug from the categories collection. */
export async function getCategoryLabels(lang: Lang): Promise<Record<string, string>> {
  const cats = await getCollection('categories');
  const out: Record<string, string> = {};
  for (const c of cats) {
    const slug = entrySlug(c.id);
    out[slug] = lang === 'ca' ? c.data.name_ca : c.data.name_es;
  }
  return out;
}

export function postPath(type: PostType, lang: Lang, slug: string): string {
  const base = type === 'recipes' ? '/actualitat/receptes' : '/actualitat';
  return lang === 'ca' ? `${base}/${slug}` : `/es${base}/${slug}`;
}
