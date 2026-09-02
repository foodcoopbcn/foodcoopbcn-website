#!/usr/bin/env node
/**
 * Turns selected originals from the photo bank into web-ready images.
 *
 *   node scripts/build-photos.mjs
 *
 * The bank (banc_fotos_foodcoop/) is working material: 2 GB of full-resolution
 * originals, gitignored and never published. This script is the only bridge
 * between it and the site — it crops to the aspect each slot needs, resizes to
 * the widths that slot actually renders at, and writes AVIF plus WebP.
 *
 * Rules of thumb applied here:
 *  - AVIF first, WebP as the fallback. No JPEG: every browser we care about
 *    takes at least WebP, and the site already ships zero JS to feature-detect.
 *  - Widths are per slot, not global. A 220px product tile has no business
 *    downloading a 1600px file.
 *  - `position: 'attention'` lets sharp keep the salient part when cropping to a
 *    different aspect, which matters because most of these are 3:2 originals
 *    being squared off.
 *
 * Re-run it after changing the manifest; it is deterministic and overwrites.
 */
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, join, basename, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
function loadSharp() {
  try {
    return require('sharp');
  } catch {
    const dir = 'node_modules/.pnpm';
    const hit = readdirSync(dir).find((d) => d.startsWith('sharp@'));
    if (!hit) throw new Error('sharp not installed — run `pnpm install` first.');
    return require(resolve(dir, hit, 'node_modules/sharp'));
  }
}
const sharp = loadSharp();

const BANK = 'banc_fotos_foodcoop';
const OUT = 'public/images/photos';

const M = `${BANK}/20231109 Fotos Carlos Montañés`;
const B = `${BANK}/Bestof_ fotos_foodcoop`;
const P = `${BANK}/01_Fotos_pendents_classificar`;
const A = `${BANK}/20240222_Assemblea_22_febrer`;
const PR = `${BANK}/2023 Productes`;
const R = `${BANK}/20241123_Fotos_recurs_supermercat_Josep_Maria_Serra`;

/**
 * slug        name used on the site
 * src         original in the bank
 * ratio       target aspect (width / height)
 * widths      the sizes this slot actually renders at, largest last
 * position    crop anchor; 'attention' finds the salient region
 */
const PHOTOS = [
  // --- Hero and other full-bleed banners -----------------------------------
  /* Centre, not 'attention': the salient-region crop cut both women off at the
     knees. This band keeps them whole and leaves the doorway and badge on the right. */
  { slug: 'hero-entrada', src: `${M}/_F1A5337.jpg`, ratio: 16 / 9, widths: [768, 1280, 1920], position: 'centre' },
/* A 16:9 frame inside a tall phone viewport crops the sides away and leaves
     mostly glass. This portrait cut keeps the doorway and a person in shot. */
  { slug: 'hero-entrada-tall', src: `${M}/_F1A5337.jpg`, ratio: 4 / 5, widths: [480, 720, 960], position: 'centre' },
  { slug: 'banner-assemblea', src: `${A}/035.jpg`, ratio: 16 / 9, widths: [768, 1280, 1920], position: 'attention' },

  // --- Half-width editorial images ------------------------------------------
  { slug: 'socies-davantal', src: `${B}/Super-01.tif`, ratio: 4 / 5, widths: [420, 720], position: 'attention' },
  { slug: 'grup-comunitat', src: `${B}/photo_2024-03-04 11.17.01 (1).jpeg`, ratio: 3 / 2, widths: [520, 900] },
  { slug: 'torn-caixa', src: `${M}/_F1A5497 copia.jpg`, ratio: 3 / 2, widths: [520, 900, 1200], position: 'attention' },
  { slug: 'torn-reposant', src: `${M}/_F1A5313 copia.jpg`, ratio: 3 / 2, widths: [520, 900, 1200], position: 'attention' },
  { slug: 'passatge-rotul', src: `${P}/IMG_1804.HEIC`, ratio: 4 / 3, widths: [420, 720, 1000], position: 'attention' },

  // --- Product family tiles: small squares, six across ----------------------
  { slug: 'fam-fruita-verdura', src: `${PR}/photo_2023-07-21_08-41-30.jpg`, ratio: 1, widths: [240, 400, 560] },
  { slug: 'fam-frescos', src: `${M}/_F1A5345.jpg`, ratio: 1, widths: [240, 400, 560], position: 'attention' },
  { slug: 'fam-rebost', src: `${M}/_F1A5399 copia.jpg`, ratio: 1, widths: [240, 400, 560], position: 'attention' },
  /* The dispensers, not jars on a shelf: it is the thing that visually says
     "bulk", and it has someone using it. */
  { slug: 'fam-granel', src: `${R}/P1240024.JPG`, ratio: 1, widths: [240, 400, 560], position: 'attention' },
  { slug: 'fam-forn', src: `${PR}/Pa de kilo/Varios.jpg`, ratio: 1, widths: [240, 400, 560], position: 'attention' },
  { slug: 'fam-llar-cura', src: `${P}/Foodcop_4.jpg`, ratio: 1, widths: [240, 400, 560], position: 'attention' },

  // --- Three feature cards ---------------------------------------------------
  { slug: 'card-cistella', src: `${M}/_F1A5455 copia.jpg`, ratio: 4 / 3, widths: [400, 700, 960], position: 'attention' },
  { slug: 'card-proveidors', src: `${M}/_F1A5298 copia.jpg`, ratio: 4 / 3, widths: [400, 700, 960], position: 'attention' },
  { slug: 'card-criteris', src: `${B}/IMG_5251.jpg`, ratio: 4 / 3, widths: [400, 700, 960] },

  // --- Open Graph card art ---------------------------------------------------
  { slug: 'og-base', src: `${M}/_F1A5337.jpg`, ratio: 1200 / 630, widths: [1200], position: 'centre' },
];

mkdirSync(OUT, { recursive: true });

/*
 * Some originals are HEIC, which this sharp build cannot decode. macOS ships
 * `sips`, which can, so they are transcoded once into a scratch directory.
 * Running this on Linux would need libheif instead — it is a curation tool run
 * by hand on a laptop, not part of the site build.
 */
const SCRATCH = '/tmp/foodcoop-heic';
mkdirSync(SCRATCH, { recursive: true });
function decodable(path) {
  if (extname(path).toLowerCase() !== '.heic') return path;
  const out = join(SCRATCH, basename(path).replace(/\.heic$/i, '.jpg'));
  if (!existsSync(out)) {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', path, '--out', out], {
      stdio: 'ignore',
    });
  }
  return out;
}

const kb = (p) => Math.round(statSync(p).size / 1024);
let total = 0;

for (const photo of PHOTOS) {
  const { slug, src, ratio, widths, position = 'centre' } = photo;
  for (const w of widths) {
    const h = Math.round(w / ratio);
    const base = sharp(decodable(src), { failOn: 'none' })
      .rotate()
      .resize(w, h, { fit: 'cover', position });

    const avif = join(OUT, `${slug}-${w}.avif`);
    const webp = join(OUT, `${slug}-${w}.webp`);
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(avif);
    await base.clone().webp({ quality: 76, effort: 5 }).toFile(webp);
    total += statSync(avif).size + statSync(webp).size;
    console.log(`  ${slug}-${w}  ${String(kb(avif)).padStart(4)} KB avif  ${String(kb(webp)).padStart(4)} KB webp`);
  }
}

/*
 * A manifest, so Photo.astro can build a srcset without guessing which widths
 * exist. Generated rather than hand-maintained: the two can never disagree.
 */
const manifest = Object.fromEntries(
  PHOTOS.map((p) => [p.slug, { widths: p.widths, ratio: Number(p.ratio.toFixed(4)) }]),
);
writeFileSync('src/data/photos.json', JSON.stringify(manifest, null, 2) + '\n');

console.log(`\n${PHOTOS.length} photos, ${Math.round(total / 1024)} KB total written to ${OUT}/`);
console.log('src/data/photos.json updated');
