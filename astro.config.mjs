import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

//え GitHub Pages: проект доступен как https://superpirov.github.io/profistatus
// site + base обязательны для корректных canonical URL и ассетов.
export default defineConfig({
  site: 'https://superpirov.github.io',
  base: '/profistatus',
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
