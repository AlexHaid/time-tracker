# ============================================
# Time Tracker — Static Site Dockerfile
# Build with Bun, serve static files with Caddy
# ============================================

# Stage 1: Build the Next.js static export
FROM oven/bun:1.2 AS builder

WORKDIR /app

# Copy dependency manifests first (for layer caching)
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build static export → /app/out
RUN bun run build

# Stage 2: Serve static files with Caddy
FROM caddy:2-alpine

# Copy the static output
COPY --from=builder /app/out /app/out

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
