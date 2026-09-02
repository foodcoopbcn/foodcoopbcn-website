#!/usr/bin/env node
/**
 * Builds the raster brand assets that social networks and iOS require.
 *
 *   node scripts/gen-social-assets.mjs
 *
 * Why this exists: the site shipped an SVG Open Graph image, and WhatsApp,
 * Telegram, X and LinkedIn all refuse to render SVG — every shared link appeared
 * with no image at all. It also referenced an apple-touch-icon.png that was never
 * created, so every iOS visit logged a 404.
 *
 * Everything is derived from public/logo_foodcoop.png, so the favicon and the
 * share card actually look like the co-op's badge instead of an unrelated leaf.
 */
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);

/*
 * sharp ships with Astro but pnpm does not hoist it to the top-level
 * node_modules, so a bare require fails. Fall back to the store path.
 */
function loadSharp() {
  try {
    return require('sharp');
  } catch {
    const dir = 'node_modules/.pnpm';
    const hit = readdirSync(dir).find((d) => d.startsWith('sharp@'));
    if (!hit) throw new Error('sharp not installed — run `npm install` first.');
    return require(resolve(dir, hit, 'node_modules/sharp'));
  }
}
const sharp = loadSharp();

const BRAND = '#009739';
const LOGO = 'public/logo_foodcoop.png';

/* --- Open Graph card: 1200x630, the size every network crops to. ----------- */
const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06402a"/>
      <stop offset="100%" stop-color="${BRAND}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1140" cy="560" r="230" fill="#feec3f" opacity="0.14"/>
  <text x="90" y="330" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-weight="700" font-size="86" fill="#feec3f">Supermercat cooperatiu</text>
  <text x="90" y="428" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-weight="700" font-size="86" fill="#ffffff">de Barcelona</text>
  <text x="94" y="512" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-weight="400" font-size="34" fill="#e9fbe5">Passatge d’Aragó, 9 · Obert a tothom</text>
</svg>`);

const logo = await readFile(LOGO);
const badge = await sharp(logo).resize(210, 210).png().toBuffer();

await sharp(card)
  .composite([{ input: badge, top: 62, left: 900 }])
  .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
  .toFile('public/og-default.jpg');

/* --- Icons, all cropped from the real badge. ------------------------------- */
const icon = async (size, file, pad = 0) =>
  sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: size >= 180 ? BRAND : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(logo)
          .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        top: pad,
        left: pad,
      },
    ])
    .png()
    .toFile(file);

await icon(180, 'public/apple-touch-icon.png', 14); // iOS home screen, opaque
await icon(32, 'public/favicon-32.png');
await icon(192, 'public/favicon-192.png');
await icon(512, 'public/favicon-512.png');

await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'FoodCoop BCN',
      short_name: 'FoodCoop',
      description: 'El primer supermercat cooperatiu, participatiu i sense ànim de lucre de Barcelona.',
      start_url: '/',
      display: 'browser',
      background_color: '#ffffff',
      theme_color: BRAND,
      icons: [
        { src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);

console.log('Wrote og-default.jpg, apple-touch-icon.png, favicon-{32,192,512}.png, site.webmanifest');
