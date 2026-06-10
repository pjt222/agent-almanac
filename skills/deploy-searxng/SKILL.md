---
name: deploy-searxng
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

Deploy a self-hosted SearXNG meta search engine with Docker Compose and Nginx.

## When to Use

- Setting up a private, self-hosted search engine
- Aggregating results from multiple search providers without tracking
- Running a search instance for a team or organization
- Replacing reliance on a single search provider

## Inputs

- **Required**: Server or machine with Docker installed
- **Optional**: Domain name for public access
- **Optional**: SSL certificate or Let's Encrypt setup
- **Optional**: Custom engine preferences

## Procedure

### Step 1: Create Project Structure

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### Step 2: Write Docker Compose File

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

### Step 3: Configure SearXNG Settings

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

Generate a secret key:

```bash
openssl rand -hex 32
```

### Step 4: Configure Nginx Frontend

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

### Step 5: Configure Rate Limiting

`config/limiter.toml`:

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### Step 6: Deploy and Verify

```bash
# Start the stack
docker compose up -d

# Check logs
docker compose logs -f searxng

# Verify it's running
curl -s http://localhost:8080 | head -5

# Test a search
curl -s "http://localhost:8080/search?q=test&format=json" | head -20
```

**Expected:** SearXNG responds on port 8080 through Nginx. Search queries return aggregated results.

**On failure:** Check `docker compose logs searxng` for config errors. Verify `settings.yml` YAML syntax.

### Step 7: Add SSL (Production)

For public deployments, add SSL termination. Update `docker-compose.yml`:

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

See `configure-nginx` skill for the full SSL Nginx configuration.

### Step 8: Updates and Maintenance

```bash
# Pull latest image
docker compose pull searxng

# Restart with new image
docker compose up -d

# Backup configuration
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## Validation

- [ ] SearXNG starts without errors in logs
- [ ] Search queries return results from configured engines
- [ ] Image proxy works (images load through SearXNG)
- [ ] Rate limiter blocks excessive requests
- [ ] Configuration persists across container restarts
- [ ] Nginx proxies requests correctly

## Common Pitfalls

- **Missing secret_key**: SearXNG will refuse to start without a `secret_key` in settings.yml.
- **Config permissions**: SearXNG writes to the config directory. The volume must be `:rw` not `:ro`.
- **Engine blocks**: Some engines may block requests from server IPs. Rotate engines or use image proxy.
- **YAML indentation**: `settings.yml` is sensitive to indentation. Validate with a YAML linter before deploying.
- **Base URL mismatch**: `SEARXNG_BASE_URL` must match the actual URL users access, including protocol and trailing slash.
- **DNS resolution in Docker**: Engines that use Google/Bing may need host network or proper DNS. Default Docker DNS usually works.

## Related Skills

- `setup-compose-stack` - general Docker Compose patterns used here
- `configure-nginx` - Nginx configuration for SSL and security headers
- `configure-reverse-proxy` - advanced proxy patterns for the Nginx frontend
