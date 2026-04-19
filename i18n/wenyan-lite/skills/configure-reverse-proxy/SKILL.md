---
name: configure-reverse-proxy
locale: wenyan-lite
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

# 配置反向代理

以 Nginx、Traefik、或 ShinyProxy 設反向代理模式以路由流量至後端服務。

## 適用時機

- 將多服務置於單一入口之後
- 代理 WebSocket 連接（Shiny、Socket.IO、即時重載）
- 以 Traefik 標籤自動發現 Docker 服務
- 路徑式或主機式路由至不同後端
- 為不自處 TLS 之服務加 SSL 終結

## 輸入

- **必要**：待代理之後端服務（host:port）
- **必要**：路由策（路徑式、主機式、或兩者）
- **選擇性**：代理工具偏好（Nginx、Traefik）
- **選擇性**：主機式路由之域名
- **選擇性**：待代理之 WebSocket 端點

## 步驟

### 步驟一：擇代理工具

| Feature | Nginx | Traefik |
|---------|-------|---------|
| Configuration | Static files | Docker labels / dynamic |
| Auto-discovery | No (manual) | Yes (Docker provider) |
| Let's Encrypt | Via certbot | Built-in ACME |
| Dashboard | No (3rd party) | Built-in |
| WebSocket | Manual config | Automatic |
| Best for | Static config, high traffic | Dynamic Docker environments |

### 步驟二：Nginx — 路徑式路由

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

**註：** `proxy_pass` 尾 `/` 剝位置前綴。`proxy_pass http://api:8000/;` 配 `location /api/` 將 `/api/users` 轉為 `/users`。

### 步驟三：Nginx — 主機式路由

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

### 步驟四：Nginx — WebSocket 代理

WebSocket 需升級頭。對 Shiny、Socket.IO、即時重載必需：

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

Shiny 應用特定：

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

**預期：** WebSocket 連接建且持。

**失敗時：** 查 `proxy_http_version 1.1` 已設。驗 `Upgrade` 與 `Connection` 頭。

### 步驟五：Traefik — Docker 標籤自動發現

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

**預期：** Traefik 經標籤自動發現服務，行 SSL 憑證供給。

### 步驟六：Traefik — 以標籤行路徑式路由

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

### 步驟七：Traefik — 速率限與頭

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### 步驟八：驗代理配置

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

**預期：** 請求路由至正確後端。WebSocket 升級成。

## 驗證

- [ ] HTTP 請求依路徑或主機路由至正確後端
- [ ] WebSocket 連接建且持
- [ ] SSL 終結運（若已配）
- [ ] 後端服務收正確之 `Host`、`X-Real-IP`、`X-Forwarded-For` 頭
- [ ] Traefik 經標籤自動發現新服務（若用 Traefik）
- [ ] 配置於 `docker compose restart` 後仍存

## 常見陷阱

- **尾斜線不符**：`proxy_pass http://app/` vs `http://app` 於 Nginx 中路徑剝之行為不同
- **WebSocket 超時**：預 `proxy_read_timeout` 為 60s。長駐 WebSocket 連接需 `86400`（24 時）
- **Docker socket 安全**：於 Traefik 掛 `/var/run/docker.sock` 予其全 Docker 存取。用 `ro` 掛並慮 socket 代理
- **DNS 解析**：Nginx 於啟時解上游。用 `resolver 127.0.0.11` 以 Docker 內部 DNS 行動態服務
- **缺 `proxy_buffering off`**：Shiny 與 SSE 端點需 `proxy_buffering off` 以行即時串流

## 相關技能

- `configure-nginx` - 含 SSL 與安全頭之詳細 Nginx 配置
- `deploy-shinyproxy` - 容器化 Shiny 應用之 ShinyProxy 主機
- `setup-compose-stack` - 用反向代理之 compose 棧
- `configure-api-gateway` - 含 Kong 與 Traefik 之 API 閘道模式
