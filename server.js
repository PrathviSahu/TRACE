import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleGeminiProxy } from "./server/geminiProxy.js";
import { resolveSafeStaticPath } from "./server/pathUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5174;
const DIST_DIR = path.resolve(__dirname, "dist");

// Load .env strictly server-side
function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
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
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff2":"font/woff2",
  ".woff": "font/woff",
  ".ttf":  "font/ttf"
};

const server = http.createServer(async (req, res) => {
  // ── 1. Unified Gemini Proxy Route (/api/gemini) with Sliding Window Limiter ──
  if (req.url === "/api/gemini") {
    return handleGeminiProxy(req, res, () => process.env.GEMINI_API_KEY);
  }

  // ── 2. Serve Static Assets with Encapsulated Path Traversal Resolver ──
  const { safeFilePath, isInsideDist, isMalformed } = resolveSafeStaticPath(DIST_DIR, req.url);

  if (isMalformed) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request");
    return;
  }

  if (!isInsideDist || !safeFilePath) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden: Path traversal is not permitted.");
    return;
  }

  let finalTarget = safeFilePath;
  if (fs.existsSync(finalTarget) && fs.statSync(finalTarget).isDirectory()) {
    finalTarget = path.join(finalTarget, "index.html");
  }

  if (!fs.existsSync(finalTarget)) {
    finalTarget = path.join(DIST_DIR, "index.html");
  }

  if (fs.existsSync(finalTarget)) {
    const ext = path.extname(finalTarget).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(finalTarget).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found. Please run `npm run build` first.");
  }
});

server.listen(PORT, () => {
  console.log(`TRACE production server running at http://localhost:${PORT}`);
});
