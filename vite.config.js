import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',   // app servido na raiz de app.pedhub.app.br
  build: {
    rollupOptions: {
      output: {
        // React/ReactDOM/Router num chunk "vendor" - raramente mudam, entao
        // ficam em cache entre atualizacoes (so o codigo do app e rebaixado).
        // lucide-react NAO entra aqui de proposito: seus icones ja sao
        // divididos por modulo lazy; agrupa-los carregaria todos de uma vez.
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
      registerType: 'autoUpdate',      // atualiza sozinho: ao abrir, se houver versao nova, aplica e recarrega
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'PedHub \u2014 Ferramentas Cl\u00ednicas',
        short_name: 'PedHub',
        description: 'Ferramentas cl\u00ednicas de apoio \u00e0 decis\u00e3o para pediatras e neonatologistas.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
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
        navigateFallback: '/index.html',
      },
      devOptions: {
        enabled: false,  // SW so no build de producao; nao interfere no `npm run dev`
      },
    }),
  ],
})
