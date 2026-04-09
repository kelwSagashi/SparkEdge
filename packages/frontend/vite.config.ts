import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path';

// https://vite.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    exclude: ["react-resizable-panels"],
  },
  server: {
    watch: {
      // ignored: [
      //   '!**/node_modules/nmg8-workflow/**',
      //   '!**/node_modules/nmg8-db/**',
      //   '!**/node_modules/nmg8-nodes/**',
      //   '!**/node_modules/nmg8-core/**',
      // ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    }
  }
})
