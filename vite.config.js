import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split recharts (largest dependency ~300KB) into its own chunk
          // Only loaded when dashboard/charts are needed
          recharts: ['recharts'],
          // Split React into its own chunk (cached across all pages)
          react: ['react', 'react-dom'],
        }
      }
    }
  }
})
