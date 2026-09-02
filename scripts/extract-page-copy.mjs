/*
 * Lift a page's bilingual copy out of its .astro frontmatter and into the
 * content collection, so the co-op can edit it at /keystatic instead of asking
 * for a deploy.
 *
 * Why a script rather than copy-and-paste: there are roughly a thousand lines of
 * Catalan and Spanish prose across thirteen page components. Retyping that by
 * hand is how a stray apostrophe or a dropped sentence gets shipped, and neither
 * would fail a build. Extracting it mechanically means the text in the YAML is
 * the same text that was in the component, character for character.
 *
 * How it works
 * ------------
 * Every one of these pages is written the same way:
 *
 *     const c = {
 *       ca: { ... },
 *       es: { ... },
 *     }[lang];
 *
 * so the block can be sliced out by its opening `const c = {` and its closing
 * `}[lang];`, both of which sit at a known column, and evaluated.
 *
 * The interesting part is the interpolations. The copy is full of
 * `${m.capital}` and `${m.quota.reduced}`, deliberately, so figures cannot drift
 * from src/config/site.ts. Those must survive into the YAML as tokens rather
 * than as baked-in numbers, otherwise moving the copy to the CMS would quietly
 * turn every live figure into a stale literal.
 *
 * So the block is evaluated with `m` and `org` replaced by proxies that return
 * their own path as a token string: reading `m.quota.reduced` yields the string
 * "{quotaReduced}". The template literals then interpolate the tokens for us,
 * and `eur(m.capital)` comes out as "{capital} €" because the formatter's
 * `.replace('.', ',')` finds no decimal point in a token. The token names match
 * the table that was already in FaqsPage.astro, now shared in src/lib/copy.ts.
 *
 * Usage:  node scripts/extract-page-copy.mjs <PageName>[ <PageName>...]
 *         node scripts/extract-page-copy.mjs --all
 *
 * It only writes src/content/copy/{ca,es}/<slug>.yaml and prints the shape. It
 * never edits the component: rewiring is a six-line change made by hand, and
 * the acceptance test is that the built HTML is byte-identical afterwards.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';

const require = createRequire(import.meta.url);

/** yaml ships as a transitive dependency; resolve it the way build-photos.mjs does. */
function loadYaml() {
  try {
    return require('yaml');
  } catch {
    const dir = 'node_modules/.pnpm';
    const hit = readdirSync(dir).find((d) => /^yaml@2\./.test(d));
    if (!hit) throw new Error('yaml not installed — run `pnpm install` first.');
    return require(resolve(dir, hit, 'node_modules/yaml'));
  }
}
const YAML = loadYaml();

const PAGES_DIR = 'src/components/pages';
const OUT_DIR = 'src/content/copy';

/** Component file name -> the slug the collection is addressed by. */
const SLUGS = {
  ComFuncionaPage: 'com-funciona',
  ComparativaPage: 'comparativa',
  ContactePage: 'contacte',
  ElSuperPage: 'el-super',
  FesteSociaPage: 'fes-te-socia',
  NotFoundPage: 'not-found',
  PremsaPage: 'premsa',
  PreusPage: 'preus',
  ProductesPage: 'productes',
  QuiSomPage: 'qui-som',
  SignupPage: 'signup',
  TornsPage: 'torns',
  TransparenciaPage: 'transparencia',
};

/*
 * Keys whose children are tokens in their own right, so `m.quota.reduced`
 * becomes {quotaReduced} rather than {quota}. `address` is flattened instead —
 * org.address.street is {street}, matching the names FaqsPage already used.
 */
const CAMEL = ['quota', 'delivery'];
const FLATTEN = ['address'];

function tokenProxy(prefix = '') {
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (typeof key !== 'string') return undefined;
        if (key === 'toString' || key === Symbol.toPrimitive) return () => `{${prefix}}`;
        if (CAMEL.includes(key)) return tokenProxy(prefix + key);
        if (FLATTEN.includes(key)) return tokenProxy(prefix);
        const name = prefix ? prefix + key[0].toUpperCase() + key.slice(1) : key;
        return `{${name}}`;
      },
    },
  );
}

/** The euro formatter PreusPage defines inline; a token has no decimal point to swap. */
const eur = (n) => `${String(n).replace('.', ',')} €`;

/*
 * A few CTA hrefs inside the copy blocks are wrapped in localizePath(). Those
 * are routing, not prose. The stub stores the canonical (Catalan) path, which is
 * the same convention the homepage blocks already use: content holds "/qui-som"
 * and the renderer adds the /es prefix. The component has to localise them on
 * the way out — see link() in HomePage.astro.
 */
const localizePath = (path) => path;

function extract(name) {
  const file = join(PAGES_DIR, `${name}.astro`);
  const src = readFileSync(file, 'utf8');
  const slugFor = SLUGS[name] ?? name.toLowerCase();

  const start = src.indexOf('\nconst c = {');
  const end = src.indexOf('\n}[lang];', start);

  /*
   * Once a page has been migrated its component no longer holds the copy, so
   * re-running this to refresh the schemas reads the YAML instead. After the
   * migration the content collection is the source of truth, not the component.
   */
  if (start < 0 || end < 0) {
    const shape = YAML.parse(readFileSync(join(OUT_DIR, 'ca', `${slugFor}.yaml`), 'utf8'));
    const seen = new Set();
    const walk = (v) => {
      if (typeof v === 'string') for (const t of v.matchAll(/\{(\w+)\}/g)) seen.add(t[1]);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(shape);
    console.log(`  (already migrated — schema refreshed from YAML)`);
    console.log(`  shape:  ${describe(shape)}\n`);
    return { name, slug: slugFor, shape, tokens: [...seen] };
  }

  const objectSrc = src.slice(start + '\nconst c = '.length, end + 2); // include the closing }

  const build = new Function('m', 'org', 'eur', 'localizePath', 'lang', `return ${objectSrc}`);
  const both = build(tokenProxy(), tokenProxy(), eur, localizePath, 'ca');

  const langs = Object.keys(both);
  if (langs.join(',') !== 'ca,es') throw new Error(`${name}: expected ca,es — got ${langs}`);

  const slug = SLUGS[name] ?? name.toLowerCase();
  const tokens = new Set();
  const walk = (v) => {
    if (typeof v === 'string') for (const t of v.matchAll(/\{(\w+)\}/g)) tokens.add(t[1]);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(both);

  for (const lang of langs) {
    mkdirSync(join(OUT_DIR, lang), { recursive: true });
    const out = join(OUT_DIR, lang, `${slug}.yaml`);
    writeFileSync(out, YAML.stringify(both[lang], { lineWidth: 0, defaultStringType: 'QUOTE_SINGLE' }));
    console.log(`  ${out}`);
  }

  console.log(`  tokens: ${[...tokens].sort().join(', ') || '—'}`);
  console.log(`  shape:  ${describe(both.ca)}\n`);
  return { name, slug, shape: both.ca, tokens: [...tokens] };
}

/*
 * Schema generation.
 *
 * The Zod schema (build-time validation) and the Keystatic schema (the editor
 * form) describe the same shape, so both are generated from the extracted
 * object rather than written twice by hand and left to drift. This runs once,
 * as part of the migration; afterwards the emitted files are ordinary source.
 *
 * Every field is optional with a fallback, matching the posture already taken in
 * content.config.ts: a volunteer's edit should be able to look wrong, never to
 * fail the deploy.
 */
const LONG = /^(intro|text|note|d|a|answer|desc|story|.*Text|.*Note|.*Intro)$/;

/*
 * A TypeScript type per page, so a component that reads `c.tpyo` still fails
 * `astro check` after the copy moves out of the component. The content
 * collection's own schema stays permissive on purpose — a volunteer's edit
 * should never be able to fail the deploy — so this is where the shape is
 * actually enforced, at the call site.
 */
function tsType(v, indent = '  ') {
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  if (Array.isArray(v)) {
    /*
     * Item shapes are merged across the WHOLE array, not read off element zero.
     * Several of these lists mark one entry with `featured: true` and leave the
     * key off the others, so taking the first item's shape both loses the key
     * and mistypes the ones that do have it.
     */
    const keys = new Map();
    for (const item of v) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return `${tsType(v[0], indent)}[]`;
      for (const [k, val] of Object.entries(item)) if (!keys.has(k)) keys.set(k, val);
    }
    const inner = [...keys]
      .map(([k, val]) => {
        const everywhere = v.every((item) => k in item);
        return `${indent}  ${k}${everywhere ? '' : '?'}: ${tsType(val, indent + '  ')};`;
      })
      .join('\n');
    return `{\n${inner}\n${indent}}[]`;
  }
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .map(([k, val]) => `${indent}  ${k}: ${tsType(val, indent + '  ')};`)
      .join('\n');
    return `{\n${inner}\n${indent}}`;
  }
  return 'string';
}

const pascal = (slug) => slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

function keystatic(v, key = '', indent = '    ') {
  if (typeof v === 'boolean') return `fields.checkbox({ label: '${label(key)}', defaultValue: ${v} })`;
  if (typeof v === 'number') return `fields.integer({ label: '${label(key)}' })`;
  if (typeof v === 'string') {
    const multiline = LONG.test(key) || v.length > 90;
    return `fields.text({ label: '${label(key)}'${multiline ? ', multiline: true' : ''} })`;
  }
  if (Array.isArray(v)) {
    /* Merge every item's keys, so a flag only one entry carries still gets a field. */
    let sample = v[0];
    if (v.every((i) => i && typeof i === 'object' && !Array.isArray(i))) {
      sample = {};
      for (const item of v) for (const [k, val] of Object.entries(item)) if (!(k in sample)) sample[k] = val;
    }
    const itemLabelKey = sample && typeof sample === 'object'
      ? Object.keys(sample).find((k) => /^(t|title|q|label|name)$/.test(k))
      : null;
    const itemLabel = itemLabelKey ? `, itemLabel: (p) => p.fields.${itemLabelKey}.value` : '';
    return `fields.array(${keystatic(sample, key, indent + '  ')}, { label: '${label(key)}'${itemLabel} })`;
  }
  if (v && typeof v === 'object') {
    const inner = Object.entries(v)
      .map(([k, val]) => `${indent}  ${k}: ${keystatic(val, k, indent + '  ')},`)
      .join('\n');
    return `fields.object(\n${indent}  {\n${inner}\n${indent}  },\n${indent}  { label: '${label(key)}' },\n${indent})`;
  }
  return `fields.text({ label: '${label(key)}' })`;
}

const label = (k) =>
  (k || 'Camp').replace(/([A-Z])/g, ' $1').replace(/^./, (m) => m.toUpperCase()).trim();

/** A one-line sketch of the object, to sanity-check against the component. */
function describe(v, depth = 0) {
  if (Array.isArray(v)) return `[${v.length} × ${describe(v[0], depth + 1)}]`;
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (depth > 1) return `{${keys.length} keys}`;
    return `{ ${keys.map((k) => `${k}: ${describe(v[k], depth + 1)}`).join(', ')} }`;
  }
  return typeof v;
}

const args = process.argv.slice(2);
const names = args.includes('--all') ? Object.keys(SLUGS) : args;
if (!names.length) {
  console.error('usage: node scripts/extract-page-copy.mjs <PageName>... | --all');
  process.exit(1);
}

const done = [];
for (const name of names) {
  console.log(name);
  try {
    done.push(extract(name));
  } catch (err) {
    console.log(`  SKIPPED — ${err.message}\n`);
  }
}

/* --- the two schemas, emitted once ------------------------------------------ */

const typeSrc = `/*
 * GENERATED once by scripts/extract-page-copy.mjs, then maintained by hand.
 *
 * The shape of each page's copy, mirroring the Keystatic singletons in
 * keystatic.copy.ts. The content collection itself validates loosely, so this is
 * what keeps a component honest about the fields it reads.
 */

${done.map((d) => `export interface ${pascal(d.slug)}Copy ${tsType(d.shape)}`).join('\n\n')}
`;
writeFileSync('src/lib/copy-types.ts', typeSrc);
console.log('wrote src/lib/copy-types.ts');

const ksSrc = `/*
 * GENERATED once by scripts/extract-page-copy.mjs, then maintained by hand.
 *
 * One Keystatic singleton per page, so the co-op can edit the prose that used to
 * live in .astro frontmatter. Figures stay as {tokens} and are substituted at
 * render by src/lib/copy.ts, so a number can never be typed into a sentence and
 * then drift from src/config/site.ts.
 */
import { fields, singleton } from '@keystatic/core';

type Schema = Parameters<typeof singleton>[0]['schema'];

const page = (label: string, path: \`\${string}/\${string}\`, schema: Schema) =>
  singleton({ label, path, format: { data: 'yaml' }, schema });

export const copySingletons = {
${done
  .flatMap((d) =>
    ['ca', 'es'].map(
      (lang) => `  copy_${d.slug.replace(/-/g, '_')}_${lang}: page(
    'Text: ${d.slug} (${lang.toUpperCase()})',
    'src/content/copy/${lang}/${d.slug}',
    {
${Object.entries(d.shape).map(([k, v]) => `      ${k}: ${keystatic(v, k, '      ')},`).join('\n')}
    },
  ),`,
    ),
  )
  .join('\n')}
};
`;
writeFileSync('keystatic.copy.ts', ksSrc);
console.log('wrote keystatic.copy.ts');
console.log(`\nall tokens used: ${[...new Set(done.flatMap((d) => d.tokens))].sort().join(', ')}`);
