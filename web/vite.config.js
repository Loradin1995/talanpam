import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// Konfigirasyon Vite pwòp platfòm nan — pa gen okenn depandans Base44 ankò.
export default defineConfig({
  logLevel: 'error',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Pandan devlopman, rout API yo redireksyone bay backend Node lokal la.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
