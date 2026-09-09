// ─────────────────────────────────────────────────────────────
//  TRACE — Shared Gemini API Proxy & True Sliding-Window Limiter
//  Unified proxy handler for Vite dev server and production server
// ─────────────────────────────────────────────────────────────

export const ALLOWED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro"
]);

export const DEFAULT_MODEL = "gemini-2.5-flash";
export const MAX_REQUEST_BYTES = 1024 * 1024; // 1MB limit
export const REQUEST_TIMEOUT_MS = 30000;      // 30 seconds
export const RATE_LIMIT_MAX = 30;             // 30 requests per window
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;// 60 seconds sliding window

// True Sliding Window: Map of IP address -> Array of epoch millisecond timestamps
const ipRequestTimestamps = new Map();

// Periodic prune of idle IPs to prevent memory growth
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, times] of ipRequestTimestamps.entries()) {
    const recent = times.filter(t => t > cutoff);
    if (recent.length === 0) {
      ipRequestTimestamps.delete(ip);
    } else {
      ipRequestTimestamps.set(ip, recent);
    }
  }
}, 60000).unref?.();

/**
 * True sliding-window rate limiter:
 * Retains timestamps within the last 60 seconds and computes exact reset time.
 */
export function checkRateLimit(ip, maxRequests = RATE_LIMIT_MAX, windowMs = RATE_LIMIT_WINDOW_MS) {
  const now = Date.now();
  const windowStart = now - windowMs;

  let timestamps = ipRequestTimestamps.get(ip) || [];
  timestamps = timestamps.filter(t => t > windowStart);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const resetInSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    ipRequestTimestamps.set(ip, timestamps);
    return {
      allowed: false,
      remaining: 0,
      resetInSec
    };
  }

  timestamps.push(now);
  ipRequestTimestamps.set(ip, timestamps);

  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    resetInSec: Math.ceil(windowMs / 1000)
  };
}

/**
 * Resolves client IP securely:
 * Only trusts X-Forwarded-For when TRUST_PROXY is explicitly enabled
 * or when deployed on known cloud edge proxies (Vercel).
 */
export function getClientIp(req, trustProxy = process.env.TRUST_PROXY === "true" || Boolean(process.env.VERCEL)) {
  if (trustProxy) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const client = forwarded.split(",")[0]?.trim();
      if (client) return client;
    }
    const realIp = req.headers["x-real-ip"];
    if (realIp) return String(realIp).trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
}

function sendResponse(res, statusCode, data, headers = {}) {
  const bodyStr = typeof data === "string" ? data : JSON.stringify(data);
  const responseHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  if (typeof res.writeHead === "function") {
    res.writeHead(statusCode, responseHeaders);
  } else if (typeof res.setHeader === "function") {
    res.statusCode = statusCode;
    for (const [k, v] of Object.entries(responseHeaders)) {
      res.setHeader(k, v);
    }
  }
  res.end(bodyStr);
}

export async function handleGeminiProxy(req, res, getApiKey) {
  // 1. Method verification: POST only
  if (req.method !== "POST") {
    sendResponse(res, 405, {
      error: { code: 405, message: "Method Not Allowed. POST is required." }
    });
    return;
  }

  // 2. IP Rate Limiting via True Sliding Window & Trusted-Proxy IP
  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(clientIp);

  if (!rateCheck.allowed) {
    sendResponse(
      res,
      429,
      {
        error: {
          code: 429,
          message: `Rate limit exceeded (${RATE_LIMIT_MAX} requests/minute). Try again in ${rateCheck.resetInSec} seconds.`
        }
      },
      { "Retry-After": String(rateCheck.resetInSec) }
    );
    return;
  }

  let body = "";
  let byteLength = 0;
  let isTooLarge = false;

  // 3. Request-size limit (max 1MB)
  req.on("data", (chunk) => {
    if (isTooLarge) return;
    byteLength += chunk.length;
    if (byteLength > MAX_REQUEST_BYTES) {
      isTooLarge = true;
      sendResponse(res, 413, {
        error: { code: 413, message: "Payload Too Large (max 1MB)." }
      });
      req.destroy();
      return;
    }
    body += chunk;
  });

  req.on("end", async () => {
    if (isTooLarge) return;

    // 4. JSON body validation
    let parsedBody;
    try {
      parsedBody = JSON.parse(body || "{}");
    } catch (e) {
      sendResponse(res, 400, {
        error: { code: 400, message: "Malformed JSON in request body." }
      });
      return;
    }

    const payload = parsedBody.payload || parsedBody;
    if (!payload || !Array.isArray(payload.contents) || payload.contents.length === 0) {
      sendResponse(res, 400, {
        error: { code: 400, message: "Invalid payload: 'contents' array is required." }
      });
      return;
    }

    const requestedModel = parsedBody.model || DEFAULT_MODEL;
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    delete payload.model;

    // 5. Server environment key check
    const apiKey = typeof getApiKey === "function" ? getApiKey() : process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendResponse(res, 401, {
        error: {
          code: 401,
          message: "ARIA is offline: GEMINI_API_KEY is not configured on the server."
        }
      });
      return;
    }

    // 6. Upstream call with timeout and key sanitization
    try {
      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const apiRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });

      const dataText = await apiRes.text();
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(dataText);
      } catch {
        jsonResponse = { error: { message: "Invalid JSON from upstream AI service." } };
      }

      if (!apiRes.ok) {
        const rawMsg = jsonResponse?.error?.message || `Upstream API error (${apiRes.status})`;
        const sanitizedMsg = rawMsg.replace(/key=[^&\s]+/g, "key=[REDACTED]");
        sendResponse(res, apiRes.status, { error: { code: apiRes.status, message: sanitizedMsg } });
        return;
      }

      sendResponse(res, 200, jsonResponse);
    } catch (err) {
      const isTimeout = err.name === "TimeoutError";
      sendResponse(res, isTimeout ? 504 : 500, {
        error: {
          code: isTimeout ? 504 : 500,
          message: isTimeout ? "Request timed out after 30 seconds." : "Internal proxy communication error."
        }
      });
    }
  });
}
