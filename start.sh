#!/usr/bin/env bash
# ============================================
# Time Tracker — Deploy as Static Site
# ============================================
#
# No Node.js, no server, no database needed.
# Just build HTML/CSS/JS and serve with any web server.
#
# Usage:
#   chmod +x start.sh
#   ./start.sh

set -e

echo "=== Time Tracker — Static Build ==="

# Install dependencies if needed
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  bun install --frozen-lockfile
fi

# Build static export
echo "🔨 Building static site..."
bun run build

echo ""
echo "✅ Static site built in ./out/"
echo ""
echo "Deploy options:"
echo "  1. Copy ./out/ to any web server (Nginx, Caddy, Apache)"
echo "  2. Upload to any static hosting (GitHub Pages, Netlify, etc.)"
echo "  3. Quick test: npx serve out"
echo "  4. Docker: docker compose up -d --build"
echo ""
echo "⚠️  Data is stored in browser localStorage."
echo "    Use the Import/Export buttons to back up your data."
