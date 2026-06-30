#!/usr/bin/env node
/**
 * One-off helper to migrate posts from the old WordPress site into Markdoc files.
 *
 *   node scripts/migrate-wp.mjs --lang ca --type news
 *
 * It pulls from the public WP REST API, downloads cover images into /public, and
 * writes one .mdoc per post under src/content/<type>/<lang>/. Review the output
 * (categories, slugs, HTML→Markdown edge cases) before committing.
 *
 * Note: WP returns HTML; this script keeps light HTML which Markdoc renders fine.
 * For heavy content, run it through a dedicated HTML→Markdown pass.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const WP = process.env.WP_BASE || 'https://foodcoopbcn.cat';
const args = Object.fromEntries(
  process.argv.slice(2).flatMap((a, i, arr) => (a.startsWith('--') ? [[a.slice(2), arr[i + 1]]] : []))
);
const lang = args.lang || 'ca';
const type = args.type || 'news'; // news | recipes
const outDir = join('src/content', type, lang);

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchAll(path) {
  const out = [];
  for (let page = 1; page < 50; page++) {
    const res = await fetch(`${WP}/wp-json/wp/v2/${path}&page=${page}`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
  }
  return out;
}

async function main() {
  console.log(`Fetching posts from ${WP} …`);
  const posts = await fetchAll('posts?per_page=100&_embed=1');
  await mkdir(outDir, { recursive: true });
  await mkdir('public/images/' + type, { recursive: true });

  for (const p of posts) {
    const title = p.title?.rendered?.replace(/<[^>]+>/g, '').trim() || 'untitled';
    const slug = p.slug || slugify(title);
    const date = (p.date || '').slice(0, 10);
    const excerpt = (p.excerpt?.rendered || '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
    const category = slugify(p._embedded?.['wp:term']?.[0]?.[0]?.name || 'actualitat');

    // Cover image
    let cover = '';
    const media = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (media) {
      try {
        const buf = Buffer.from(await (await fetch(media)).arrayBuffer());
        const ext = media.split('.').pop().split('?')[0].slice(0, 4);
        const file = `public/images/${type}/${slug}.${ext}`;
        await writeFile(file, buf);
        cover = `/images/${type}/${slug}.${ext}`;
      } catch {}
    }

    const body = (p.content?.rendered || '').trim();
    const fm = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `date: ${date}`,
      `excerpt: ${JSON.stringify(excerpt)}`,
      cover ? `cover: ${cover}` : 'cover:',
      `category: ${category}`,
      'draft: false',
      '---',
      '',
      body,
      '',
    ].join('\n');

    const dest = join(outDir, `${slug}.mdoc`);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, fm);
    console.log(`✓ ${dest}`);
  }
  console.log(`Done: ${posts.length} posts → ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
