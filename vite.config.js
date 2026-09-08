import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const ALLOWED_MODELS = new Set(['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash']);
const MAX_REQUEST_BYTES = 1024 * 1024; // 1MB limit
const REQUEST_TIMEOUT_MS = 30000;      // 30 seconds

function geminiProxyMiddleware(server) {
  server.middlewares.use('/api/gemini', async (req, res) => {
    // 1. Method validation: POST only
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: { code: 405, message: 'Method Not Allowed. POST is required.' } }));
      return;
    }

    let body = '';
    let byteLength = 0;
    let isTooLarge = false;

    // 2. Request size limit (1MB)
    req.on('data', chunk => {
      if (isTooLarge) return;
      byteLength += chunk.length;
      if (byteLength > MAX_REQUEST_BYTES) {
        isTooLarge = true;
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { code: 413, message: 'Payload Too Large (max 1MB).' } }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', async () => {
      if (isTooLarge) return;

      // 3. JSON body validation
      let parsedBody;
      try {
        parsedBody = JSON.parse(body || '{}');
      } catch (e) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { code: 400, message: 'Malformed JSON in request body.' } }));
        return;
      }

      const payload = parsedBody.payload || parsedBody;
      if (!payload || !Array.isArray(payload.contents) || payload.contents.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { code: 400, message: 'Invalid payload: "contents" array is required.' } }));
        return;
      }

      const requestedModel = parsedBody.model || 'gemini-3.6-flash';
      const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-3.6-flash';
      delete payload.model;

      // 4. Server environment key check
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

      // 5. Upstream call with timeout and sanitized error handling
      try {
        const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        const dataText = await response.text();
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(dataText);
        } catch {
          jsonResponse = { error: { message: 'Invalid JSON from upstream AI service.' } };
        }

        if (!response.ok) {
          const rawMsg = jsonResponse?.error?.message || `Upstream API error (${response.status})`;
          const sanitizedMsg = rawMsg.replace(/key=[^&\s]+/g, 'key=[REDACTED]');
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { code: response.status, message: sanitizedMsg } }));
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonResponse));
      } catch (err) {
        const isTimeout = err.name === 'TimeoutError';
        res.statusCode = isTimeout ? 504 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          error: {
            code: isTimeout ? 504 : 500,
            message: isTimeout ? 'Request timed out after 30 seconds.' : 'Internal proxy communication error.'
          }
        }));
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
