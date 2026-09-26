import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'mock-jwks': resolve('./src/index.ts'),
    },
  },
})
