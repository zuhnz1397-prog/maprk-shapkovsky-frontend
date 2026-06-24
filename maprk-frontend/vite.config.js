import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://maprk-shapkovsky-production.up.railway.app',
        changeOrigin: true,
      },
      '/static': {
        target: 'https://maprk-shapkovsky-production.up.railway.app',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
