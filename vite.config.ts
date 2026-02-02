import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VeloxGrid',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'velox-grid.esm.js';
        if (format === 'umd') return 'velox-grid.js';
        if (format === 'iife') return 'velox-grid.iife.js';
        return `velox-grid.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'velox-grid.css';
          return assetInfo.name || 'asset';
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    cssMinify: true,
  },
  server: {
    open: '/examples/dev.html',
    hmr: true, // Hot Module Replacement 활성화
  },
});
