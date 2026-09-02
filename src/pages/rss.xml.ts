import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts, entryLang, entrySlug, postPath } from '../lib/posts';

/*
 * Catalan feed.
 *
 * `xmlns` + the atom:link self-reference are what feed validators and most
 * aggregators expect; without them the feed is technically malformed. `language`
 * matters here because the site publishes the same articles twice, once per
 * locale, and readers should not be offered both.
 */
export async function GET(context: APIContext) {
  const posts = await getAllPosts('ca');
  const self = new URL('/rss.xml', context.site!).href;

  return rss({
    title: 'FoodCoop BCN · Actualitat',
    description: 'Notícies i receptes del supermercat cooperatiu de Barcelona.',
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<language>ca-ES</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${self}" rel="self" type="application/rss+xml"/>`,
    ].join(''),
    items: posts.map(({ type, entry }) => ({
      title: entry.data.title,
      description: entry.data.excerpt,
      pubDate: entry.data.date,
      link: postPath(type, entryLang(entry.id), entrySlug(entry.id)),
      categories: [entry.data.category],
    })),
  });
}
