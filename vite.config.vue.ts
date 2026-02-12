import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

/**
 * VeloxGrid Vue Wrapper 빌드 설정
 * Phase 17: Framework Wrappers
 */
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist/vue',
      include: ['src/vue/**/*.ts', 'src/vue/**/*.vue', 'src/types/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vue/index.ts'),
      name: 'VeloxGridVue',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js';
        return 'index.js';
      },
    },
    outDir: 'dist/vue',
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: false,
  },
});
