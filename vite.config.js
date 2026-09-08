import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function geminiProxyMiddleware(server) {
  server.middlewares.use('/api/gemini', async (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: { message: 'Method Not Allowed' } }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
        const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            error: {
              code: 401,
              message: 'Gemini API key not configured on server. Add GEMINI_API_KEY to your server .env file.'
            }
          }));
          return;
        }

        const parsedBody = JSON.parse(body || '{}');
        const model = parsedBody.model || 'gemini-3.6-flash';
        const payload = parsedBody.payload || parsedBody;
        delete payload.model;

        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.text();
        res.statusCode = response.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { message: err.message || 'Internal proxy error' } }));
      }
    });
  });
}

function geminiProxyPlugin() {
  return {
    name: 'gemini-proxy',
    configureServer(server) {
      geminiProxyMiddleware(server);
    },
    configurePreviewServer(server) {
      geminiProxyMiddleware(server);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiProxyPlugin()],
})
