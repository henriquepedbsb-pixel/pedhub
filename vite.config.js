import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Content-Security-Policy — injetada APENAS no build de produção. Em dev o
// Vite injeta scripts inline de HMR/React Refresh que uma CSP estrita
// bloquearia; por isso o plugin roda só com `apply: 'build'`.
//
// 'sha256-…' libera exatamente o script inline de tema do index.html (evita
// flash claro/escuro). Ao EDITAR aquele script, recalcule o hash:
//   node -e 'r=require;h=r("crypto").createHash("sha256");h.update(r("fs").readFileSync("dist/index.html","utf8").match(/<script>([\s\S]*?)<\/script>/)[1]);console.log("sha256-"+h.digest("base64"))'
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'sha256-q7ubeEkq1fHdAwV1sUWDsW4Yr4RcYmYcYC/AEaNYANM=' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",   // <style> do hub + style="" no HTML estático dos módulos
  "img-src 'self' data:",
  "font-src 'self'",                     // fontes DM self-hospedadas
  "connect-src 'self' https://cloudflareinsights.com",  // beacon do Cloudflare Analytics
  "manifest-src 'self'",
  "worker-src 'self'",                   // service worker do PWA
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

function cspPlugin() {
  return {
    name: 'pedhub-csp',
    apply: 'build',
    transformIndexHtml() {
      return [{
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
        injectTo: 'head-prepend',
      }]
    },
  }
}

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
    cspPlugin(),
    VitePWA({
      registerType: 'autoUpdate',      // atualiza sozinho: ao abrir, se houver versão nova, aplica e recarrega
      injectRegister: 'script',        // registro do SW como arquivo externo (same-origin) → compatível com CSP estrita

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
