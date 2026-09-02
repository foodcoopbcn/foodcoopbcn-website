// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// The Keystatic admin UI is only mounted when explicitly enabled (local editing).
// Production builds omit it entirely — no /keystatic route, no GitHub App required.
// The public site is unaffected: content collections read the Markdown files directly.
const enableKeystatic = process.env.ENABLE_KEYSTATIC === 'true';

// https://astro.build/config
export default defineConfig({
  /* Lets the desktop app's preview pick a free port; astro dev ignores PORT otherwise. */
  server: { port: Number(process.env.PORT) || 4321 },
  site: 'https://foodcoopbcn.cat',
  // Pages are static by default (great SEO, zero CSR).
  output: 'static',
  adapter: netlify(),
  i18n: {
    locales: ['ca', 'es'],
    defaultLocale: 'ca',
    routing: {
      prefixDefaultLocale: false, // ca at "/", es at "/es/"
    },
  },
  integrations: [
    mdx(),
    markdoc(),
    ...(enableKeystatic ? [react(), keystatic()] : []),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
    // @keystatic/astro 6 reads its GitHub App secrets via `getSecret` from the
    // `astro:env/server` virtual module. The integration also lists its own
    // `@keystatic/astro/api` entry in optimizeDeps.entries, so Vite's esbuild
    // scanner tries to pre-bundle that import and dies on the unresolvable
    // `astro:` specifier — which aborts the whole dep-optimize run and leaves
    // every /.vite/deps/* request (React included) 404ing. Excluding the entry
    // keeps it out of the scan; Astro resolves it normally at request time.
    // Only needed while the admin UI is mounted. Drop when upstream fixes it.
    ...(enableKeystatic ? { optimizeDeps: { exclude: ['@keystatic/astro/api'] } } : {}),
  },
});
