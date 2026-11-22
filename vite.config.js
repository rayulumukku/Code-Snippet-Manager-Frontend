import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ include: '**/*.{jsx,tsx}' })],
  base: '/projects/code-snippet-manager/',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          icons: ['react-icons'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react-syntax-highlighter', 'react-syntax-highlighter/dist/esm/styles/prism'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false,
      },
    },
    fileParallelism: false,
    testTimeout: 15000,
  },
})
