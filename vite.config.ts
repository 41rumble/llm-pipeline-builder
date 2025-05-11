import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
  // Define environment variables to be exposed to the client
  define: {
    'import.meta.env.VITE_OPENWEBUI_URL': JSON.stringify(env.VITE_OPENWEBUI_URL || 'http://localhost:3005'),
    'import.meta.env.VITE_OPENWEBUI_TOKEN': JSON.stringify(env.VITE_OPENWEBUI_TOKEN || ''),
    'import.meta.env.VITE_OLLAMA_SERVER_URL': JSON.stringify(env.VITE_OLLAMA_SERVER_URL || 'http://localhost:11434'),
  }
}
})
