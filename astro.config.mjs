// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://foodcoopbcn.cat',
  // Pages are static by default (great SEO, zero CSR). Only the Keystatic
  // admin opts into on-demand rendering via `export const prerender = false`.
  output: 'static',
  adapter: netlify(),
  i18n: {
    locales: ['ca', 'es'],
    defaultLocale: 'ca',
    routing: {
      prefixDefaultLocale: false, // ca at "/", es at "/es/"
    },
  },
  integrations: [mdx(), markdoc(), react(), keystatic(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
