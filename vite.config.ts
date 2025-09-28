import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ensures correct asset paths for Vercel
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        // target: 'https://camp-backend-production.up.railway.app',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist', // default, but explicit is better
  },
});
