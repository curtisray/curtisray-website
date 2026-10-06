// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://www.curtisray.me',
  integrations: [react()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    // Warm both Motion entry points before deferred islands request shared chunks.
    optimizeDeps: { include: ['motion', 'motion/react'] },
  },
});
