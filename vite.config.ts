import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Relative base + single-file JS/CSS: the built dist/index.html works on any static host
// and can also be opened straight from disk. Weapon images stay as separate files in dist/weapons.
export default defineConfig({
  base: './',
  plugins: [svelte(), viteSingleFile({ removeViteModuleLoader: true })],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
});
