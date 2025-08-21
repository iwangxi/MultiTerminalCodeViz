/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MultiTerminalCodeViz/', // GitHub Pages 部署路径
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional: if you have a setup file
    css: true, // if you want to test CSS
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
