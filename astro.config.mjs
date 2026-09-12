// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  // Required for canonical URLs, sitemap generation, and absolute OG image paths.
  site: 'https://handslearning.com',

  integrations: [sitemap()],

  // `/product` was the single product page before the catalog existed.
  // Preserve inbound links and any printed references.
  redirects: {
    '/product': '/kits/dna-rna-assembly-kit',
  },

  vite: { plugins: [tailwindcss()] },
})
