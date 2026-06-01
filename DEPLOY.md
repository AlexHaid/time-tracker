# Time Tracker — Deployment Guide

## Quick Start (Docker)

The easiest way to deploy. Works on any VPS with Docker installed.

```bash
# 1. Clone or upload the project
# 2. Generate a secure secret
openssl rand -base64 32

# 3. Create .env from template
cp .env.example .env
# Edit .env: set the generated secret as NEXTAUTH_SECRET

# 4. Build and start
docker compose up -d --build

# 5. Open http://your-server:3000
# First visit → Create Password screen
```

The SQLite database is persisted in a Docker volume — survives container restarts and rebuilds.

**Useful commands:**
```bash
docker compose logs -f        # View logs
docker compose down            # Stop
docker compose up -d --build   # Rebuild after code changes
docker volume ls               # Check volumes
```

---

## VPS Deployment (without Docker)

For a bare-metal VPS with Node.js 22+.

```bash
# 1. Upload project to /opt/time-tracker
# 2. Install bun (if not installed)
curl -fsSL https://bun.sh/install | bash

# 3. Create .env
cp .env.example .env
nano .env  # Set NEXTAUTH_SECRET

# 4. Run the start script
chmod +x start.sh
./start.sh
```

### Run as a systemd service

Create `/etc/systemd/system/time-tracker.service`:

```ini
[Unit]
Description=Time Tracker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/time-tracker
ExecStart=/usr/bin/node /opt/time-tracker/.next/standalone/server.js
EnvironmentFile=/opt/time-tracker/.env
Environment=NODE_ENV=production
Environment=PORT=3000
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable time-tracker
sudo systemctl start time-tracker
sudo systemctl status time-tracker
```

---

## HTTPS with Caddy

Install [Caddy](https://caddyserver.com/) and use the provided `Caddyfile.prod`:

```bash
# 1. Copy the production Caddyfile
cp Caddyfile.prod /etc/caddy/Caddyfile

# 2. Edit and set your domain
nano /etc/caddy/Caddyfile

# 3. Start Caddy
sudo systemctl restart caddy
```

Caddy automatically provisions Let's Encrypt certificates.

---

## Hosting Options (RU Region)

| Provider | Type | Min Price | Notes |
|----------|------|-----------|-------|
| [Timeweb Cloud](https://timeweb.cloud) | VPS / App Platform | ~200₽/mo | RU payment, App Platform has easy deploy |
| [Selectel](https://selectel.ru) | VPS | ~250₽/mo | Good network, RU payment |
| [Reg.ru VPS](https://reg.ru) | VPS | ~200₽/mo | Simple, RU payment |
| [Beget VPS](https://beget.com) | VPS | ~250₽/mo | RU payment, good support |
| [Yandex Cloud](https://cloud.yandex.ru) | Compute | ~300₽/mo | S3, IAM, free tier available |
| [RUVDS](https://ruvds.com) | VPS | ~150₽/mo | Budget option |
| [Aéza](https://aeza.net) | VPS | ~200₽/mo | Multiple RU locations |

**Recommended:** Timeweb Cloud App Platform — supports Docker, auto-deploy from git, starts at ~200₽/mo.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | SQLite path, e.g. `file:./db/time-tracker.db` |
| `NEXTAUTH_SECRET` | Yes | — | JWT signing key. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_TRUST_HOST` | Yes | `true` | Trust reverse proxy headers (required behind Caddy/Nginx) |
| `NODE_ENV` | Yes | — | Set to `production` |
| `PORT` | No | `3000` | Server port |

---

## Database Backup

SQLite is a single file. Simple backup:

```bash
# Manual backup
cp db/time-tracker.db backups/time-tracker-$(date +%Y%m%d).db

# Cron job (daily at 3am)
0 3 * * * cp /opt/time-tracker/db/time-tracker.db /opt/time-tracker/backups/time-tracker-$(date +\%Y\%m\%d).db
```

For Docker:
```bash
docker compose exec app sqlite3 /app/data/time-tracker.db ".backup /app/data/backup.db"
docker compose cp app:/app/data/backup.db ./backups/time-tracker-$(date +%Y%m%d).db
```

---

## Reset Password

If you forget your password, delete the hash from the database:

```bash
# Local
npx prisma db execute --stdin <<< "DELETE FROM AppSetting WHERE key = 'password_hash'; DELETE FROM User;"

# Docker
docker compose exec app npx prisma db execute --stdin <<< "DELETE FROM AppSetting WHERE key = 'password_hash'; DELETE FROM User;"
```

Next visit will show the "Create Password" screen again.

---

## Architecture

```
User → Caddy (HTTPS, :443) → Next.js (:3000) → SQLite (file)
```

- **Single-user** password lock (no registration)
- **JWT sessions** stored in HttpOnly cookies (30-day expiry)
- **Rate limited** login (10 attempts per 15 minutes per IP)
- **Standalone output** — no Node_modules at runtime, just `server.js`
