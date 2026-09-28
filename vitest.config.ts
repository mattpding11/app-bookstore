import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate from vite.config.ts so `vite build`/`vite dev` never pick up test-only config
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 9,
        statements: 20
      }
    }
  },
})
