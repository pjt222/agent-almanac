---
name: configure-nginx
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure Nginx as a web server and reverse proxy. Covers static file
  serving, reverse proxy to upstream services, SSL/TLS termination with
  Let's Encrypt, location blocks, load balancing, rate limiting, and
  security headers. Use when serving static files in production, reverse
  proxying to backend services (Node.js, Python, R/Shiny), terminating
  SSL/TLS, load balancing across instances, or adding rate limiting and
  security headers to harden an endpoint.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, reverse-proxy, ssl, tls, lets-encrypt, web-server, security-headers
---

# 配置 Nginx

設 Nginx 為 Web 伺服器與反向代理含 SSL 終結與安全強化。

## 適用時機

- 生產中提供靜態檔（HTML、CSS、JS）
- 反向代理至後端服務（Node.js、Python、Go、R/Shiny）
- 以 Let's Encrypt 憑證終結 SSL/TLS
- 跨多後端實例行負載均衡
- 加速率限與安全頭

## 輸入

- **必要**：部署目標（Docker 容器或裸金屬）
- **必要**：待代理之後端服務（host:port）
- **選擇性**：SSL 用之域名
- **選擇性**：靜態檔目錄

## 步驟

### 步驟一：基本反向代理

`nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Docker Compose 服務：

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

**預期：** 至 port 80 之請求轉至 app 服務。

### 步驟二：靜態檔提供

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 6M;
        add_header Cache-Control "public";
    }
}
```

### 步驟三：以 Let's Encrypt 行 SSL/TLS

以 certbot 之 webroot 法：

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Docker Compose 含 certbot：

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot-webroot:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-webroot:/var/www/certbot
      - certbot-certs:/etc/letsencrypt

volumes:
  certbot-webroot:
  certbot-certs:
```

首憑證：

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com --email admin@example.com --agree-tos
```

**預期：** HTTPS 以有效 Let's Encrypt 憑證運。

**失敗時：** 查 DNS 指向伺服器。驗 port 80 開以應 ACME 挑戰。

### 步驟四：安全頭

```nginx
server {
    # ... SSL config above ...

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # Hide Nginx version
    server_tokens off;
}
```

### 步驟五：速率限

```nginx
http {
    # Define rate limit zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
        }

        location /login {
            limit_req zone=login burst=5;
            proxy_pass http://app;
        }
    }
}
```

### 步驟六：負載均衡

```nginx
upstream app {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000 backup;
}
```

| Method | Directive | Behavior |
|--------|-----------|----------|
| Round robin | (default) | Equal distribution |
| Least connections | `least_conn` | Routes to least busy |
| IP hash | `ip_hash` | Sticky sessions |
| Weighted | `server app:3000 weight=3` | Proportional |

### 步驟七：測配置

```bash
# Test config syntax
docker compose exec nginx nginx -t

# Reload without downtime
docker compose exec nginx nginx -s reload

# Check response headers
curl -I https://example.com
```

**預期：** `nginx -t` 報語法 OK。頭含安全頭。

## 驗證

- [ ] `nginx -t` 報配置有效
- [ ] HTTP 重導至 HTTPS（若啟 SSL）
- [ ] 後端服務經代理可達
- [ ] 安全頭見於回應
- [ ] 速率限於過度請求時觸
- [ ] SSL Labs 測得 A+（若公開）

## 常見陷阱

- **缺 `proxy_set_header Host`**：後端收錯主機頭，破虛擬主機與重導
- **`location` 序要**：Nginx 用最具體匹配。精確（`=`）> 前綴（`^~`）> 正則（`~`）> 通用前綴
- **SSL 憑證更新**：設 cron 或計時器行 `certbot renew` 並重載 Nginx
- **大請求體**：預設 `client_max_body_size` 為 1MB。檔上傳增：`client_max_body_size 50m;`
- **WebSocket 代理**：需額外頭。模式見 `configure-reverse-proxy`

## 相關技能

- `configure-reverse-proxy` - 多工具代理模式含 WebSocket 與 Traefik
- `setup-compose-stack` - 含 Nginx 之 compose 棧
- `deploy-searxng` - 用 Nginx 為 SearXNG 之前端
- `configure-ingress-networking` - Kubernetes ingress（NGINX Ingress Controller）
