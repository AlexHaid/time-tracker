#!/usr/bin/env bash
# ============================================
# Time Tracker — Production Start Script
# ============================================
# Usage:
#   chmod +x start.sh
#   ./start.sh
#
# Prerequisites:
#   - Node.js 22+ installed
#   - bun installed (for building)
#   - .env file configured (see .env.example)

set -e

echo "=== Time Tracker — Production Start ==="

# Check for .env file
if [ ! -f .env ]; then
  echo "⚠️  No .env file found! Creating from .env.example..."
  cp .env.example .env
  echo "📝 Please edit .env and set your NEXTAUTH_SECRET before continuing."
  echo "   Generate a secret with: openssl rand -base64 32"
  exit 1
fi

# Check if NEXTAUTH_SECRET is still the default
if grep -q "change-me-to-a-random-string" .env; then
  echo "⚠️  NEXTAUTH_SECRET is still set to the default value!"
  echo "   Generate a secure secret with: openssl rand -base64 32"
  echo "   Then update .env and run this script again."
  exit 1
fi

# Ensure db directory exists
mkdir -p db

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  bun install --frozen-lockfile
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
bun run db:generate

# Build the app if standalone output doesn't exist
if [ ! -d .next/standalone ]; then
  echo "🔨 Building the app..."
  bun run build
fi

# Push DB schema (creates tables if they don't exist)
echo "🗄️  Ensuring database schema is up to date..."
bun run db:push

# Start the production server
echo "🚀 Starting Time Tracker on port 3000..."
NODE_ENV=production node .next/standalone/server.js
