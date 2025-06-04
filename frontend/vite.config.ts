// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()], 
  server: {
    proxy: {
      '/health': {
        target: 'http://localhost:1515',
        changeOrigin: true,
      },
      '/maincheck': {
        target: 'http://localhost:1515',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:1515',
        changeOrigin: true,
      }
    }
  }
})
