---
name: configure-nginx
locale: wenyan-ultra
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

# 配 Nginx

設 Nginx 為網服與反代，含 SSL 終與安固。

## 用

- 生產供靜檔（HTML、CSS、JS）
- 反代至後端（Node.js、Python、Go、R/Shiny）
- 以 Let's Encrypt 終 SSL/TLS
- 諸後端間負載平衡
- 加限率與安頭

## 入

- **必**：部目（Docker 容器或裸機）
- **必**：所代後端（host:port）
- **可**：SSL 域名
- **可**：靜檔目錄

## 行

### 一：基反代

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

Docker Compose 服：

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

**得：** 80 埠求轉至 app 服。

### 二：靜檔供

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

### 三：SSL/TLS 以 Let's Encrypt

以 certbot webroot 法：

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

初證：

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com --email admin@example.com --agree-tos
```

**得：** HTTPS 含有效 Let's Encrypt 證。

**敗：** 察 DNS 指服。驗 80 埠開以 ACME 挑戰。

### 四：安頭

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

### 五：限率

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

### 六：負載平衡

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

### 七：測配

```bash
# Test config syntax
docker compose exec nginx nginx -t

# Reload without downtime
docker compose exec nginx nginx -s reload

# Check response headers
curl -I https://example.com
```

**得：** `nginx -t` 報語正。頭含安頭。

## 驗

- [ ] `nginx -t` 報配有效
- [ ] HTTP 轉 HTTPS（若 SSL 啟）
- [ ] 後端服經代可達
- [ ] 響中現安頭
- [ ] 過求觸限率
- [ ] SSL Labs 測得 A+（若公）

## 忌

- **缺 `proxy_set_header Host`**：後端收誤主機頭→破虛主機與轉。
- **`location` 序要**：Nginx 用最具體匹。exact（`=`）> prefix（`^~`）> regex（`~`）> general prefix。
- **SSL 證更**：設 cron 或計時器以 `certbot renew` 且 Nginx 重載。
- **大求體**：默 `client_max_body_size` 1MB。檔上→`client_max_body_size 50m;`。
- **WebSocket 代**：須加頭。見 `configure-reverse-proxy`。

## 參

- `configure-reverse-proxy` - 多具代模含 WebSocket 與 Traefik
- `setup-compose-stack` - 含 Nginx 之 compose 堆
- `deploy-searxng` - 用 Nginx 為 SearXNG 前
- `configure-ingress-networking` - K8s ingress（NGINX Ingress 控）
