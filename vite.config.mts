/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = import.meta.dirname;

export default defineConfig({
  root,
  cacheDir: 'node_modules/.vite',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@tic-tac-toe/game-util-game-logic': path.join(
        root,
        'libs/game/util-game-logic/src/index.ts'
      ),
      '@tic-tac-toe/game-data-access': path.join(
        root,
        'libs/game/data-access/src/index.ts'
      ),
      '@tic-tac-toe/game-ui-board': path.join(
        root,
        'libs/game/ui-board/src/index.ts'
      ),
      '@tic-tac-toe/game-feature': path.join(
        root,
        'libs/game/feature-game/src/index.ts'
      ),
      '@tic-tac-toe/scoreboard-feature': path.join(
        root,
        'libs/scoreboard/feature-scoreboard/src/index.ts'
      ),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    name: 'tic-tac-toe',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'libs/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'server/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: 'coverage',
      provider: 'v8',
    },
  },
});
