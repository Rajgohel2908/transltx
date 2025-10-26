import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'  // <-- add this

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- add this
    },
  },
  // server: {
  //   host: '10.165.246.194', // Your IP
  //   port: 5173,            // Your custom port
  // },
})
