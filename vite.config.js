import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/project/code-snippet-manager/',
  optimizeDeps: {
    include: ['react-syntax-highlighter', 'react-syntax-highlighter/dist/esm/styles/prism'],
  },
})
