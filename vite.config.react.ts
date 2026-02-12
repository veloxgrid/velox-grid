import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

/**
 * VeloxGrid React Wrapper 빌드 설정
 * Phase 17: Framework Wrappers
 */
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist/react',
      include: ['src/react/**/*.ts', 'src/react/**/*.tsx', 'src/types/**/*.ts'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/react/index.ts'),
      name: 'VeloxGridReact',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js';
        return 'index.js';
      },
    },
    outDir: 'dist/react',
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    minify: 'esbuild',
    emptyOutDir: false,
  },
});
