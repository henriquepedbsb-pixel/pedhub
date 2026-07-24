import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Config separada da vite.config.js para NÃO carregar o plugin PWA nos testes.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      // Cobertura focada nas libs de cálculo puro (critério do T2c: ≥ 90%).
      include: ['src/lib/calc/**'],
      reporter: ['text', 'text-summary'],
    },
  },
})
