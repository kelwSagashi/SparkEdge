import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()], // Habilita o suporte aos aliases do tsconfig.json
  test: {
    globals: true, // Permite usar 'describe', 'it', 'expect' sem importar
    // Procura por arquivos de teste em todo o workspace
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/frontend/**',
        '**/dist/**',
        '**/node_modules/**'
      ],
    },
  },
});