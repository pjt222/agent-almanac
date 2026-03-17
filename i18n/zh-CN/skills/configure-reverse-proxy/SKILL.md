---
name: configure-reverse-proxy
description: >
  配置多种工具的反向代理模式，包括 Nginx、Traefik 和 ShinyProxy。涵盖 WebSocket 代理、
  基于路径和基于主机的路由、SSL 终止以及 Docker 标签自动发现。适用于将多个服务路由到
  单一入口点、代理 WebSocket 连接（Shiny、Socket.IO）、使用 Traefik 标签自动发现
  Docker 服务，或为不原生处理 TLS 的服务添加 SSL 终止。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: reverse-proxy, traefik, nginx, websocket, routing, shinyproxy, ssl
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 配置反向代理

使用 Nginx、Traefik 或 ShinyProxy 设置反向代理模式，将流量路由到后端服务。

## 适用场景

- 将多个服务路由到单一入口点后面
- 代理 WebSocket 连接（Shiny、Socket.IO、实时重载）
- 使用 Traefik 标签自动发现 Docker 服务
- 基于路径或基于主机的路由到不同后端
- 为不处理 TLS 的服务添加 SSL 终止

## 输入

- **必需**：需要代理的后端服务（host:port）
- **必需**：路由策略（基于路径、基于主机或两者兼用）
- **可选**：代理工具偏好（Nginx、Traefik）
- **可选**：用于基于主机路由的域名
- **可选**：需要代理的 WebSocket 端点

## 步骤

### 第 1 步：选择代理工具

| 功能 | Nginx | Traefik |
|------|-------|---------|
| 配置方式 | 静态文件 | Docker 标签 / 动态 |
| 自动发现 | 否（手动） | 是（Docker 提供者） |
| Let's Encrypt | 通过 certbot | 内置 ACME |
| 仪表板 | 否（第三方） | 内置 |
| WebSocket | 手动配置 | 自动 |
| 最适合 | 静态配置、高流量 | 动态 Docker 环境 |

### 第 2 步：Nginx — 基于路径的路由

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

**注意：** `proxy_pass` 上的尾部 `/` 会去除 location 前缀。`proxy_pass http://api:8000/;` 配合 `location /api/` 会将 `/api/users` 转发为 `/users`。

### 第 3 步：Nginx — 基于主机的路由

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

### 第 4 步：Nginx — WebSocket 代理

WebSocket 需要升级头。对于 Shiny、Socket.IO 和实时重载至关重要：

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

专门针对 Shiny 应用：

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

**预期结果：** WebSocket 连接建立并保持。

**失败处理：** 检查是否设置了 `proxy_http_version 1.1`。验证 `Upgrade` 和 `Connection` 头。

### 第 5 步：Traefik — Docker 标签自动发现

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

**预期结果：** Traefik 通过标签自动发现服务，自动配置 SSL 证书。

### 第 6 步：Traefik — 使用标签的基于路径路由

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

### 第 7 步：Traefik — 速率限制和安全头

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### 第 8 步：验证代理配置

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

**预期结果：** 请求路由到正确的后端。WebSocket 升级成功。

## 验证清单

- [ ] HTTP 请求根据路径或主机路由到正确的后端
- [ ] WebSocket 连接建立并保持
- [ ] SSL 终止正常工作（如已配置）
- [ ] 后端服务接收到正确的 `Host`、`X-Real-IP`、`X-Forwarded-For` 头
- [ ] Traefik 通过标签自动发现新服务（如使用 Traefik）
- [ ] 配置在 `docker compose restart` 后依然有效

## 常见问题

- **尾部斜杠不匹配**：`proxy_pass http://app/` 与 `http://app` 在 Nginx 路径去除方面行为不同
- **WebSocket 超时**：默认 `proxy_read_timeout` 为 60 秒。长连接的 WebSocket 需要设置为 `86400`（24小时）
- **Docker socket 安全**：在 Traefik 中挂载 `/var/run/docker.sock` 给予其完整的 Docker 访问权限。使用 `ro` 挂载并考虑使用 socket 代理
- **DNS 解析**：Nginx 在启动时解析上游。对于动态服务使用 `resolver 127.0.0.11` 来使用 Docker 内部 DNS
- **缺少 `proxy_buffering off`**：Shiny 和 SSE 端点需要 `proxy_buffering off` 以实现实时流式传输

## 相关技能

- `configure-nginx` — 详细的 Nginx 配置，包含 SSL 和安全头
- `deploy-shinyproxy` — 用于容器化 Shiny 应用托管的 ShinyProxy
- `setup-compose-stack` — 使用反向代理的 compose 栈
- `configure-api-gateway` — 使用 Kong 和 Traefik 的 API 网关模式
