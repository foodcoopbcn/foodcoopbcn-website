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
  },
});
