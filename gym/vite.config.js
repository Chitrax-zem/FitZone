// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/styles/variables.scss";`
      }
    }
  },
  server: {
    host: 'localhost',
    port: 5173,          // serve the app on 5174
    strictPort: true,    // fail fast if taken (change to false to auto-increment)
    hmr: {
      host: 'localhost',
      port: 5173,        // HMR WS also uses 5174 to match the browser
      protocol: 'ws'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
