import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 4001,
      proxy: {
        // Proxy CKFinder assets and ASP.NET connector to IIS server
        '/ckfinder': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        // If CKFinder is mounted at root (e.g. /ckfinder.html, /ckfinder.js)
        '/ckfinder.html': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        '/ckfinder.js': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        // ASP.NET connector when base path is '/'
        '/connector': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        // CKFinder static asset folders when served at root (do NOT proxy '/src' to avoid conflict with Vite's app modules)
        '/libs': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        '/plugins': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        '/skins': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        '/lang': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
        '/userfiles': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          ws: false,
        },
      },
    },
    preview: {
      host: true,
      port: 4001,
    },
  }
})
