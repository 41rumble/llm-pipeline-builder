import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 51781, // Using the provided port
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  // Ensure JSON files are properly handled
  assetsInclude: ['**/*.json'],
  // Optimize dependencies
  optimizeDeps: {
    include: ['reactflow', 'zustand', 'handlebars', 'uuid'],
  },
  // Ensure proper build settings
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})