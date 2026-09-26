import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs'],
  platform: 'node',
  dts: true,
  sourcemap: true,
  exports: true,
  outputOptions: { exports: 'named' },
})
