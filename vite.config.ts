import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        entryFileNames: 'assets/bundle.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) =>
          assetInfo.names?.some((name) => name.endsWith('.css'))
            ? 'assets/bundle.css'
            : 'assets/[name][extname]',
      },
    },
  },
})
