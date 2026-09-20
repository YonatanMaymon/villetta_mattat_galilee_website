import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The API runs as its own process in development (npm run dev:api). In production the site and the API
// are served from the same origin, so /api needs no proxy there.
const proxy = { '/api': { target: 'http://localhost:8787', changeOrigin: true } }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
})
