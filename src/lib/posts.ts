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

/**
 * Maps every post URL to the same post in the other language.
 *
 * Built once from `translationKey` and consumed by both BaseLayout (hreflang,
 * canonical) and LangToggle (the visible CA/ES switch), so the two can never
 * disagree. Paths are stored WITHOUT a trailing slash; look up with `alternateOf`.
 *
 * A post with no counterpart is deliberately absent from the map rather than
 * mapped to a guess: an hreflang pointing at a 404 makes Google discard the whole
 * annotation set, which is worse than having none.
 */
export async function getPostAlternates(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const type of ['news', 'recipes'] as PostType[]) {
    const all = (await getCollection(type)) as AnyPost[];
    const byKey = new Map<string, AnyPost[]>();
    for (const e of all) {
      const key = e.data.translationKey;
      if (!key || !visible(e)) continue;
      byKey.set(key, [...(byKey.get(key) ?? []), e]);
    }
    for (const group of byKey.values()) {
      if (group.length < 2) continue;
      for (const a of group) {
        for (const b of group) {
          if (entryLang(a.id) === entryLang(b.id)) continue;
          map.set(
            postPath(type, entryLang(a.id), entrySlug(a.id)),
            postPath(type, entryLang(b.id), entrySlug(b.id)),
          );
        }
      }
    }
  }
  return map;
}

/** Strip a trailing slash so `/a/` and `/a` are the same key. */
const norm = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

/**
 * The other-language URL for `pathname`.
 *
 * Returns `undefined` when this is a post with no translation — callers must
 * then omit the alternate link rather than fall back to a mirrored path.
 * For every non-post route the mirrored path is correct, so callers pass that in
 * as `fallback`.
 */
export async function alternateOf(
  pathname: string,
  fallback: string,
): Promise<string | undefined> {
  /* Excluded: the index, category archives, search, and paginated pages (/actualitat/2). */
  const isPost = /^\/(es\/)?actualitat\/(?!categoria\/|cerca\/|\d+\/|$)/.test(norm(pathname) + '/');
  if (!isPost) return fallback;
  const map = await getPostAlternates();
  return map.get(norm(pathname));
}
