import { build } from 'vite';
import wrapAAPlugin from './wrapAAPlugin.js';

// Build the library
await build({
  configFile: false,
  plugins: [wrapAAPlugin()],
  build: {
    lib: {
      entry: 'src/art.js',
      name: 'SigilGrid',
      formats: ['iife'],
      fileName: () => 'art-core-sigil-grid-25.js'
    },
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        exports: 'named'
      }
    }
  }
}); 