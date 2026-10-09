import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  base: "./",   // 👈 QUAN TRỌNG NHẤT

  server: {
    proxy: {
      '/api': {
        target: 'https://api-rescue.purintech.id.vn',
        changeOrigin: true,
      },
    },
  },
})