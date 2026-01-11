import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [solid()],
  server: {
    fs: {
      allow: ['.', './data'],
    },
  },
  resolve: {
    alias: {
      '@data': resolve(__dirname, 'data'),
    },
  },
})
