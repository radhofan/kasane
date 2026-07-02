import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~@vidstack': path.resolve(__dirname, 'node_modules/@vidstack'),
      '~@codecademy': path.resolve(__dirname, 'node_modules/@codecademy'),
    },
  },
})
