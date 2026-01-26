import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Stat Tracker',
        short_name: 'StatTracker',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1020',
        theme_color: '#0075ff',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
