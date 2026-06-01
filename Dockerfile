# ============================================
# Time Tracker — Production Dockerfile
# Multi-stage build: Bun for build, Node.js for runtime
# ============================================

# Stage 1: Build the Next.js app
FROM oven/bun:1.2 AS builder

WORKDIR /app

# Copy dependency manifests first (for layer caching)
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Build the Next.js standalone output
RUN bun run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
# Next.js standalone server listens on this port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Create data directory for SQLite DB and set ownership
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Use non-root user
USER nextjs

# Expose the app port
EXPOSE 3000

# Persistent volume for SQLite database
VOLUME ["/app/data"]

# Start the standalone Next.js server
CMD ["node", "server.js"]
