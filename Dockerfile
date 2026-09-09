# ── Stage 1: Build the frontend assets ──
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (utilizing Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build production bundle into dist/
RUN npm run build

# ── Stage 2: Production lightweight runtime ──
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5174

# Copy production build and standalone server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json

# Use non-root node user for container hardening
USER node

# Expose default application port
EXPOSE 5174

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Start production server
CMD ["node", "server.js"]
