---
name: deploy-searxng
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Deploy a self-hosted SearXNG meta search engine via Docker Compose.
  Covers settings.yml configuration, engine selection, result proxying,
  Nginx frontend, persistence, and updates. Use when setting up a private
  search engine without tracking, aggregating results from multiple providers,
  running a shared search instance for a team or organisation, or replacing
  reliance on a single search provider.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: searxng, self-hosted, search-engine, privacy, docker-compose, meta-search
---

# Deploy SearXNG

Self-host SearXNG meta search → Docker Compose + Nginx.

## Use When

- Private self-host search
- Aggregate multi-provider → no track
- Team/org shared instance
- Replace single provider

## In

- **Required**: Server w/ Docker
- **Optional**: Domain
- **Optional**: SSL/Let's Encrypt
- **Optional**: Engine prefs

## Do

### Step 1: Scaffold

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### Step 2: Compose File

`docker-compose.yml`:

```yaml
services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    volumes:
      - ./config:/etc/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://search.example.com/
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    restart: unless-stopped
    networks:
      - searxng

  nginx:
    image: nginx:1.27-alpine
    container_name: searxng-nginx
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - searxng
    restart: unless-stopped
    networks:
      - searxng

networks:
  searxng:
    driver: bridge
```

### Step 3: Config SearXNG

`config/settings.yml`:

```yaml
use_default_settings: true

general:
  instance_name: "My SearXNG"
  privacypolicy_url: false
  contact_url: false

search:
  safe_search: 0
  autocomplete: "google"
  default_lang: "en"

server:
  secret_key: "generate-a-random-secret-key-here"
  limiter: true
  image_proxy: true
  port: 8080
  bind_address: "0.0.0.0"

ui:
  static_use_hash: true
  default_theme: simple
  infinite_scroll: true

engines:
  - name: google
    engine: google
    shortcut: g
    disabled: false

  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
    disabled: false

  - name: wikipedia
    engine: wikipedia
    shortcut: wp
    disabled: false

  - name: github
    engine: github
    shortcut: gh
    disabled: false

  - name: stackoverflow
    engine: stackoverflow
    shortcut: so
    disabled: false

  - name: arxiv
    engine: arxiv
    shortcut: arx
    disabled: false
```

Gen secret:

```bash
openssl rand -hex 32
```

### Step 4: Nginx Front

`nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;

        location / {
            proxy_pass http://searxng:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_buffering off;
        }

        location /static/ {
            proxy_pass http://searxng:8080/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Step 5: Rate Limit

`config/limiter.toml`:

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### Step 6: Deploy + Verify

```bash
# Start stack
docker compose up -d

# Logs
docker compose logs -f searxng

# Check running
curl -s http://localhost:8080 | head -5

# Test search
curl -s "http://localhost:8080/search?q=test&format=json" | head -20
```

→ SearXNG on 8080 via Nginx. Queries → aggregated results.

If err: `docker compose logs searxng` → config err. Verify `settings.yml` YAML.

### Step 7: SSL (Prod)

Public deploy → SSL termination. Update `docker-compose.yml`:

```yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - certbot-certs:/etc/letsencrypt:ro
      - certbot-webroot:/var/www/certbot:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-certs:/etc/letsencrypt
      - certbot-webroot:/var/www/certbot

volumes:
  certbot-certs:
  certbot-webroot:
```

See `configure-nginx` → full SSL Nginx config.

### Step 8: Update + Maint

```bash
# Pull latest
docker compose pull searxng

# Restart w/ new img
docker compose up -d

# Backup config
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## Check

- [ ] SearXNG starts → no err logs
- [ ] Queries → results from configured engines
- [ ] Image proxy works
- [ ] Rate limiter blocks excess
- [ ] Config persists across restarts
- [ ] Nginx proxies correctly

## Traps

- **No secret_key**: SearXNG refuses start w/o `secret_key` in settings.yml.
- **Config perms**: SearXNG writes to config dir → volume `:rw` not `:ro`.
- **Engine blocks**: Some engines block server IPs → rotate or image proxy.
- **YAML indent**: `settings.yml` indent-sensitive → lint before deploy.
- **Base URL mismatch**: `SEARXNG_BASE_URL` must match actual URL, incl protocol + trailing slash.
- **Docker DNS**: Google/Bing engines may need host net or proper DNS. Default Docker DNS OK.

## →

- `setup-compose-stack` — general Docker Compose patterns
- `configure-nginx` — Nginx SSL + security headers
- `configure-reverse-proxy` — advanced proxy patterns
