import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'mock-jwks': resolve('./src/index.ts'),
    },
  },
})
