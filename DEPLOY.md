# Time Tracker — Deployment Guide

Pure client-side app. No server, no database, no Node.js on the server.
Just static HTML/CSS/JS files that any web server can host.

---

## Quick Build

```bash
npm install
npm run build
# → Static files in ./out/
```

## Deploy to VPS (Easiest)

### Option A: Just copy files + Caddy

```bash
# On your machine:
npm run build
scp -r out/* user@your-vps:/var/www/time-tracker/

# On the VPS, install Caddy and use Caddyfile.prod:
# (see file contents — just set your domain)
```

### Option B: Docker

```bash
docker compose up -d --build   # Build & start on port 3000
docker compose logs -f          # View logs
docker compose down             # Stop
```

### Option C: Just Python (for testing)

```bash
cd out && python3 -m http.server 3000
```

---

## VPS Setup (Ubuntu 22.04)

```bash
# 1. Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# 2. Upload built files
mkdir -p /var/www/time-tracker
# (upload out/* to /var/www/time-tracker/)

# 3. Configure Caddy
# Edit /etc/caddy/Caddyfile with your domain (see Caddyfile.prod)

# 4. Start
sudo systemctl restart caddy
```

---

## Hosting Options (RU Region)

| Provider | Type | Min Price | Notes |
|----------|------|-----------|-------|
| [Timeweb Cloud](https://timeweb.cloud) | VPS / Static | ~200₽/mo | RU payment, easiest |
| [Selectel](https://selectel.ru) | VPS / Static | ~250₽/mo | Good network |
| [Reg.ru VPS](https://reg.ru) | VPS | ~200₽/mo | Simple setup |
| [Beget VPS](https://beget.com) | VPS | ~250₽/mo | Good support |
| [Yandex Cloud](https://cloud.yandex.ru) | Object Storage | ~100₽/mo | S3 static hosting |
| [RUVDS](https://ruvds.com) | VPS | ~150₽/mo | Budget option |

**Cheapest option:** Yandex Cloud Object Storage (~100₽/mo) — upload `out/` as static website. No VPS needed.

**Simplest VPS option:** Any VPS + Caddy. No Node.js, no Docker, just a 2MB binary serving your files.

---

## Data & Backups

**All data is stored in your browser's localStorage.** This means:
- ✅ No server database to manage
- ✅ Works offline after first load
- ✅ Instant reads/writes (no network)
- ⚠️ Data is tied to one browser/device
- ⚠️ Clearing browser data erases everything

**Use the Import/Export buttons** in the app header to:
- **Export** → Downloads a JSON file with all your data
- **Import** → Loads data from a previously exported JSON file
- **Clear All** → Deletes everything (with confirmation)

**Tip:** Export your data regularly. It's a small JSON file you can store anywhere.

---

## Architecture

```
Browser → Web Server (Caddy/Nginx) → Static Files (HTML/CSS/JS)
                ↕
         localStorage (in browser)
```

- **Zero server-side logic** — pure client-side React app
- **No cookies, no auth, no sessions** — single-user, single-device
- **Static export** — Next.js generates plain HTML/CSS/JS
- **~2MB total** — tiny footprint, fast to load
