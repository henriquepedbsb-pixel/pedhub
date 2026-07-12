import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/pedhub/',
  build: {
    rollupOptions: {
      output: {
        // React/ReactDOM/Router num chunk "vendor" — raramente mudam, então
        // ficam em cache entre atualizações (só o código do app é rebaixado).
        // lucide-react NÃO entra aqui de propósito: seus ícones já são
        // divididos por módulo lazy; agrupá-los carregaria todos de uma vez.
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',          // avisa o usuário ("nova versão") em vez de atualizar em silêncio
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/pedhub/',
        name: 'PedHub — Ferramentas Clínicas',
        short_name: 'PedHub',
        description: 'Ferramentas clínicas de apoio à decisão para pediatras e neonatologistas.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/pedhub/',
        scope: '/pedhub/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1D4ED8',
        background_color: '#1D4ED8',
        categories: ['medical', 'health', 'education'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        navigateFallback: '/pedhub/index.html',
      },
      devOptions: {
        enabled: false,  // SW só no build de produção; não interfere no `npm run dev`
      },
    }),
  ],
})
