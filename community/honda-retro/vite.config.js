import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: '/_dev.html',
  },
  build: {
    // Output directly to the skin root so Ghost can load index.html + script.js
    outDir: '.',
    emptyOutDir: false,
    rollupOptions: {
      // JS-only entry: index.html is maintained manually and never touched by the build
      input: './src/main.js',
      output: {
        entryFileNames: 'script.js',
        chunkFileNames: 'script.js',
        assetFileNames: ({ name }) =>
          name?.endsWith('.css') ? 'style.css' : (name ?? 'asset'),
        // IIFE: behaves exactly like other Ghost skins (classic script, no module cache)
        // CSS is injected as a <style> tag at runtime inside script.js
        format: 'iife',
        name: 'GhostSkin',
      },
    },
  },
})
