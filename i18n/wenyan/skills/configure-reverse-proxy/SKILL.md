---
name: configure-reverse-proxy
locale: wenyan
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

# 設反代

以 Nginx、Traefik、ShinyProxy 設路流於後服之反代式。

## 用時

- 路多服於單入
- 代 WebSocket 連（Shiny、Socket.IO、即載）
- 以 Traefik 標自發 Docker 服
- 徑或主之路於異後
- 加 SSL 終於不治 TLS 之服

## 入

- **必**：代之後服（host:port）
- **必**：路之策（徑、主、或二）
- **可選**：代具之好（Nginx、Traefik）
- **可選**：主路之域名
- **可選**：代之 WebSocket 端

## 法

### 第一步：擇代具

| Feature | Nginx | Traefik |
|---------|-------|---------|
| Configuration | Static files | Docker labels / dynamic |
| Auto-discovery | No (manual) | Yes (Docker provider) |
| Let's Encrypt | Via certbot | Built-in ACME |
| Dashboard | No (3rd party) | Built-in |
| WebSocket | Manual config | Automatic |
| Best for | Static config, high traffic | Dynamic Docker environments |

### 第二步：Nginx——徑路

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

**注：** `proxy_pass` 之尾 `/` 剝位前綴。`location /api/` 附 `proxy_pass http://api:8000/;` 將 `/api/users` 轉為 `/users`。

### 第三步：Nginx——主路

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

### 第四步：Nginx——WebSocket 代

WebSocket 需升頭。於 Shiny、Socket.IO、即載為要：

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

專於 Shiny 應：

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

**得：** WebSocket 連立且持。

**敗則：** 察 `proxy_http_version 1.1` 已設。驗 `Upgrade` 與 `Connection` 頭。

### 第五步：Traefik——Docker 標自發

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

**得：** Traefik 以標自發服，供 SSL 證。

### 第六步：Traefik——徑路以標

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

### 第七步：Traefik——率限與頭

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### 第八步：驗代設

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

**得：** 請依徑或主路於正後。WebSocket 升成。

## 驗

- [ ] HTTP 請依徑或主路於正後
- [ ] WebSocket 連立且持
- [ ] SSL 終行（若設）
- [ ] 後受正 `Host`、`X-Real-IP`、`X-Forwarded-For` 頭
- [ ] Traefik 以標自發新服（若用 Traefik）
- [ ] 設於 `docker compose restart` 後存

## 陷

- **尾 `/` 不合**：Nginx 中 `proxy_pass http://app/` 對 `http://app` 於徑剝行異。
- **WebSocket 超時**：默 `proxy_read_timeout` 六十秒。長 WebSocket 連需 `86400`（二十四時）。
- **Docker 符安**：於 Traefik 掛 `/var/run/docker.sock` 予其全 Docker 訪。用 `ro` 掛且慎思符代。
- **DNS 解**：Nginx 於啟時解上。動服用 `resolver 127.0.0.11` 為 Docker 內 DNS。
- **缺 `proxy_buffering off`**：Shiny 與 SSE 端需 `proxy_buffering off` 為實時流。

## 參

- `configure-nginx` - Nginx 詳設附 SSL 與安頭
- `deploy-shinyproxy` - ShinyProxy 為容 Shiny 應載
- `setup-compose-stack` - 用反代之 compose 棧
- `configure-api-gateway` - Kong 與 Traefik 之 API 門式
