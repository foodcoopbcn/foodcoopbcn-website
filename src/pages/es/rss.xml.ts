import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts, entryLang, entrySlug, postPath } from '../../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getAllPosts('es');
  return rss({
    title: 'FoodCoop BCN · Actualidad',
    description: 'Noticias y recetas del supermercado cooperativo de Barcelona.',
    site: context.site!,
    items: posts.map(({ type, entry }) => ({
      title: entry.data.title,
      description: entry.data.excerpt,
      pubDate: entry.data.date,
      link: postPath(type, entryLang(entry.id), entrySlug(entry.id)),
    })),
  });
}
