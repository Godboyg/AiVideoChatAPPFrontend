import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // plugins: [react()],
  server : {
    proxy : {
      "/api" : {
        target : "https://aivediochatappbackend.onrender.com",
        secure : false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  plugins : [
    tailwindcss(),
    [react()]
  ],
})
