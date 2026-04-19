---
name: configure-reverse-proxy
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure reverse proxy patterns across multiple tools including Nginx,
  Traefik, and ShinyProxy. Covers WebSocket proxying, path-based and
  host-based routing, SSL termination, and Docker label auto-discovery.
  Use when routing multiple services behind a single entry point, proxying
  WebSocket connections (Shiny, Socket.IO), auto-discovering Docker services
  with Traefik labels, or adding SSL termination to services that don't
  handle TLS natively.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: reverse-proxy, traefik, nginx, websocket, routing, shinyproxy, ssl
---

# 配反代

以 Nginx、Traefik 或 ShinyProxy 設反代路流至後端。

## 用

- 多服於單入點後
- 代 WebSocket 連（Shiny、Socket.IO、live reload）
- 以 Traefik 標自發 Docker 服
- 依路徑或主機路至異後
- 無 TLS 本能之服加 SSL 終

## 入

- **必**：所代後端（host:port）
- **必**：路策（路徑、主機、俱）
- **可**：代具好（Nginx、Traefik）
- **可**：主機路之域名
- **可**：所代 WebSocket 端

## 行

### 一：擇代具

| Feature | Nginx | Traefik |
|---------|-------|---------|
| Configuration | Static files | Docker labels / dynamic |
| Auto-discovery | No (manual) | Yes (Docker provider) |
| Let's Encrypt | Via certbot | Built-in ACME |
| Dashboard | No (3rd party) | Built-in |
| WebSocket | Manual config | Automatic |
| Best for | Static config, high traffic | Dynamic Docker environments |

### 二：Nginx——路徑路

```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /app/ {
        proxy_pass http://webapp:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**注：** `proxy_pass` 尾 `/` 削 location 前綴。`proxy_pass http://api:8000/;` 配 `location /api/` 將 `/api/users` 轉為 `/users`。

### 三：Nginx——主機路

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://webapp:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 四：Nginx——WebSocket 代

WebSocket 須升級頭。Shiny、Socket.IO、live reload 必：

```nginx
location /ws/ {
    proxy_pass http://app:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

Shiny 專用：

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    location / {
        proxy_pass http://shiny:3838;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_buffering off;
    }
}
```

**得：** WebSocket 連建且持。

**敗：** 察 `proxy_http_version 1.1` 已設。驗 `Upgrade` 與 `Connection` 頭。

### 五：Traefik——Docker 標自發

`docker-compose.yml`：

```yaml
services:
  traefik:
    image: traefik:v3.2
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  api:
    image: myapi:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8000"

  webapp:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webapp.rule=Host(`app.example.com`)"
      - "traefik.http.routers.webapp.entrypoints=websecure"
      - "traefik.http.routers.webapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.webapp.loadbalancer.server.port=3000"

volumes:
  letsencrypt:
```

**得：** Traefik 經標自發服、備 SSL 證。

### 六：Traefik——含標之路徑路

```yaml
services:
  api:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.api.middlewares=strip-api"
      - "traefik.http.middlewares.strip-api.stripprefix.prefixes=/api"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
```

### 七：Traefik——限率與頭

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### 八：驗代配

```bash
# Nginx: test config
docker compose exec nginx nginx -t

# Check routing
curl -H "Host: api.example.com" http://localhost/health

# Check WebSocket (needs wscat: npm install -g wscat)
wscat -c ws://localhost/ws/

# Traefik dashboard (if enabled)
# http://localhost:8080/dashboard/
```

**得：** 求路至正後端。WebSocket 升成。

## 驗

- [ ] HTTP 求依路徑或主機路至正後端
- [ ] WebSocket 連建且持
- [ ] SSL 終行（若配）
- [ ] 後端收正 `Host`、`X-Real-IP`、`X-Forwarded-For` 頭
- [ ] Traefik 經標自發新服（若用）
- [ ] 配於 `docker compose restart` 後留

## 忌

- **尾斜線不合**：`proxy_pass http://app/` vs `http://app` 於 Nginx 路徑削行異。
- **WebSocket 超時**：默 `proxy_read_timeout` 60s。長連 WebSocket 須 `86400`（24h）。
- **Docker socket 安**：於 Traefik 掛 `/var/run/docker.sock` 予其全 Docker 取。用 `ro` 掛且慮 socket 代。
- **DNS 解**：Nginx 啟時解上游。動服→用 `resolver 127.0.0.11` 以 Docker 內 DNS。
- **缺 `proxy_buffering off`**：Shiny 與 SSE 端須 `proxy_buffering off` 以即時流。

## 參

- `configure-nginx` - Nginx 詳配含 SSL 與安頭
- `deploy-shinyproxy` - 容器 Shiny 應託 ShinyProxy
- `setup-compose-stack` - 用反代之 compose 堆
- `configure-api-gateway` - Kong 與 Traefik API 閘模
