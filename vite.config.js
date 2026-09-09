import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { handleGeminiProxy } from "./server/geminiProxy.js";

function geminiProxyPlugin() {
  return {
    name: "gemini-proxy",
    configureServer(server) {
      server.middlewares.use("/api/gemini", (req, res) => {
        const configDir = path.dirname(fileURLToPath(import.meta.url));
        const env = {
          ...loadEnv(process.env.NODE_ENV || "development", configDir, ""),
          ...loadEnv(process.env.NODE_ENV || "development", process.cwd(), "")
        };
        const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        handleGeminiProxy(req, res, () => apiKey);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/gemini", (req, res) => {
        handleGeminiProxy(req, res, () => process.env.GEMINI_API_KEY);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiProxyPlugin()],
});
