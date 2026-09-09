export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed. POST is required.' } });
  }

  const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash']);
  const body = req.body || {};
  const payload = body.payload || body;

  if (!payload || !Array.isArray(payload.contents) || payload.contents.length === 0) {
    return res.status(400).json({ error: { message: 'Invalid payload: "contents" array is required.' } });
  }

  const requestedModel = body.model || 'gemini-2.0-flash';
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : 'gemini-2.0-flash';
  delete payload.model;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: 'Gemini API key not configured on server. Add GEMINI_API_KEY to environment variables.'
      }
    });
  }

  try {
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    const isTimeout = err.name === 'TimeoutError';
    return res.status(isTimeout ? 504 : 500).json({
      error: { message: isTimeout ? 'Request timed out after 30s.' : (err.message || 'Internal proxy error') }
    });
  }
}
