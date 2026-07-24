import { defineConfig } from 'vite';

export default defineConfig({
  base: '/agent-almanac/',
  publicDir: 'public',
  define: {
    // Stable per-build cache-bust token shared by locale + data fetches
    __BUILD_TIME__: JSON.stringify(String(Date.now())),
  },
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
