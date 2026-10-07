import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix loads every var, not just VITE_*-prefixed ones. That distinction
  // is the whole point: Vite inlines VITE_* vars into the client bundle, so the
  // key must NOT carry that prefix. It stays here on the dev server.
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.DEEPSEEK_API_KEY

  if (!apiKey) {
    console.warn(
      '\n[inkling] DEEPSEEK_API_KEY is missing. Copy .env.example to .env.local and add your key,\n' +
        '          otherwise the Inkling page will fail with a 401.\n',
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // The browser calls /api/deepseek/chat/completions; the dev server
        // attaches the Authorization header and forwards to DeepSeek, so the
        // key is never sent to the client.
        '/api/deepseek': {
          target: 'https://api.deepseek.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/deepseek/, ''),
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        },
      },
    },
  }
})
