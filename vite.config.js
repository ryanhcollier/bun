import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bun/',
  plugins: [react()],
  server: {
    proxy: {
      '/remote-assets': {
        target: 'https://reil.studio',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/remote-assets/, '/bun/images')
      }
    }
  }
})
