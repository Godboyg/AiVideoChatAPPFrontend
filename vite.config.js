import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // plugins: [react()],
  plugins : [
    tailwindcss(),
    [react()]
  ],
  server : {
    proxy : {
      "/api" : {
        target : "https://aivediochatappbackend.onrender.com",
        changeOrigin: true,
        secure : false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
})
