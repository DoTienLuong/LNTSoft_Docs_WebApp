import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://lntsoft.local'
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
    host: true,
    port: 4001,
    proxy: {
      // Proxy CKFinder assets and ASP.NET connector to IIS server
      '/ckfinder': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/ckfinder': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      // If CKFinder is mounted at root (e.g. /ckfinder.html, /ckfinder.js)
      '/ckfinder.html': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
      '/ckfinder.js': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/ckfinder.html': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
        '/docs/ckfinder.js': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      // ASP.NET connector when base path is '/'
      '/connector': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
      // CKFinder static asset folders when served at root (do NOT proxy '/src' to avoid conflict with Vite's app modules)
      '/libs': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/libs': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      '/plugins': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/plugins': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      '/skins': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/skins': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      '/lang': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/lang': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
        },
      '/userfiles': {
        target: proxyTarget,
        changeOrigin: true,
        ws: false,
      },
        '/docs/userfiles': {
        target: proxyTarget,
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
