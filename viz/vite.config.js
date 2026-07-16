import { defineConfig } from 'vite';

export default defineConfig({
  base: '/agent-almanac/',
  publicDir: 'public',
  resolve: {
    dedupe: ['three'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
