import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5174;
const DIST_DIR = path.join(__dirname, 'dist');

const ALLOWED_MODELS = new Set(['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
const MAX_REQUEST_BYTES = 1024 * 1024; // 1MB max request size
const REQUEST_TIMEOUT_MS = 30000;      // 30 seconds timeout

// Load .env strictly server-side
function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadDotEnv();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf'
};

const server = http.createServer(async (req, res) => {
  // ── Handle /api/gemini proxy ──
  if (req.url === '/api/gemini') {
    // 1. Method verification: POST only
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 405, message: 'Method Not Allowed. POST is required.' } }));
      return;
    }

    let body = '';
    let byteLength = 0;
    let isTooLarge = false;

    // 2. Request-size limit (max 1MB)
    req.on('data', chunk => {
      if (isTooLarge) return;
      byteLength += chunk.length;
      if (byteLength > MAX_REQUEST_BYTES) {
        isTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
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
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 400, message: 'Malformed JSON in request body.' } }));
        return;
      }

      const payload = parsedBody.payload || parsedBody;
      if (!payload || !Array.isArray(payload.contents) || payload.contents.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 400, message: 'Invalid payload: "contents" array is required.' } }));
        return;
      }

      const requestedModel = parsedBody.model || 'gemini-3.6-flash';
      const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-3.6-flash';
      delete payload.model;

      // 4. Server environment key check
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
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
        const apiRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
        });

        const dataText = await apiRes.text();
        let jsonResponse;
        try {
          jsonResponse = JSON.parse(dataText);
        } catch {
          jsonResponse = { error: { message: 'Invalid JSON from upstream AI service.' } };
        }

        if (!apiRes.ok) {
          const rawMsg = jsonResponse?.error?.message || `Upstream API error (${apiRes.status})`;
          const sanitizedMsg = rawMsg.replace(/key=[^&\s]+/g, 'key=[REDACTED]');
          res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { code: apiRes.status, message: sanitizedMsg } }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(jsonResponse));
      } catch (err) {
        const isTimeout = err.name === 'TimeoutError';
        res.writeHead(isTimeout ? 504 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: {
            code: isTimeout ? 504 : 500,
            message: isTimeout ? 'Request timed out after 30 seconds.' : 'Internal proxy communication error.'
          }
        }));
      }
    });
    return;
  }

  // ── Serve Static Assets from dist/ (SPA fallback to index.html) ──
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found. Please run `npm run build` first.');
  }
});

server.listen(PORT, () => {
  console.log(`TRACE production server running at http://localhost:${PORT}`);
});
