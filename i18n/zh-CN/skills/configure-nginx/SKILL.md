---
name: configure-nginx
description: >
  配置 Nginx 作为 Web 服务器和反向代理。涵盖静态文件服务、到上游服务的反向代理、
  使用 Let's Encrypt 的 SSL/TLS 终止、location 块、负载均衡、速率限制和安全头。
  适用于在生产环境中提供静态文件服务、反向代理到后端服务（Node.js、Python、
  R/Shiny）、终止 SSL/TLS、跨实例负载均衡，或添加速率限制和安全头以加固端点。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, reverse-proxy, ssl, tls, lets-encrypt, web-server, security-headers
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 配置 Nginx

设置 Nginx 作为具有 SSL 终止和安全加固的 Web 服务器和反向代理。

## 适用场景

- 在生产环境中提供静态文件（HTML、CSS、JS）服务
- 反向代理到后端服务（Node.js、Python、Go、R/Shiny）
- 使用 Let's Encrypt 证书终止 SSL/TLS
- 跨多个后端实例负载均衡
- 添加速率限制和安全头

## 输入

- **必需**：部署目标（Docker 容器或裸金属服务器）
- **必需**：需要代理的后端服务（host:port）
- **可选**：用于 SSL 的域名
- **可选**：静态文件目录

## 步骤

### 第 1 步：基本反向代理

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

Docker Compose 服务：

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

**预期结果：** 端口 80 的请求被转发到 app 服务。

### 第 2 步：静态文件服务

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

### 第 3 步：使用 Let's Encrypt 的 SSL/TLS

使用 certbot 的 webroot 方式：

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

Docker Compose 配合 certbot：

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

初始证书申请：

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com --email admin@example.com --agree-tos
```

**预期结果：** HTTPS 使用有效的 Let's Encrypt 证书正常工作。

**失败处理：** 检查 DNS 是否指向服务器。验证端口 80 是否对 ACME 挑战开放。

### 第 4 步：安全头

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

### 第 5 步：速率限制

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

### 第 6 步：负载均衡

```nginx
upstream app {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000 backup;
}
```

| 方法 | 指令 | 行为 |
|------|------|------|
| 轮询 | （默认） | 平均分配 |
| 最少连接 | `least_conn` | 路由到最空闲的 |
| IP 哈希 | `ip_hash` | 粘性会话 |
| 加权 | `server app:3000 weight=3` | 按比例分配 |

### 第 7 步：测试配置

```bash
# Test config syntax
docker compose exec nginx nginx -t

# Reload without downtime
docker compose exec nginx nginx -s reload

# Check response headers
curl -I https://example.com
```

**预期结果：** `nginx -t` 报告语法正确。头部包含安全头。

## 验证清单

- [ ] `nginx -t` 报告配置有效
- [ ] HTTP 重定向到 HTTPS（如启用 SSL）
- [ ] 后端服务可通过代理访问
- [ ] 响应中存在安全头
- [ ] 速率限制在请求过多时触发
- [ ] SSL Labs 测试获得 A+ 评级（如公开访问）

## 常见问题

- **缺少 `proxy_set_header Host`**：后端接收到错误的主机头，导致虚拟主机和重定向失效
- **`location` 顺序很重要**：Nginx 使用最具体的匹配。精确匹配（`=`）> 前缀匹配（`^~`）> 正则匹配（`~`）> 一般前缀
- **SSL 证书续期**：设置 cron 或 timer 运行 `certbot renew` 并重载 Nginx
- **大请求体**：默认 `client_max_body_size` 为 1MB。对文件上传增大：`client_max_body_size 50m;`
- **WebSocket 代理**：需要额外头。参见 `configure-reverse-proxy` 获取模式

## 相关技能

- `configure-reverse-proxy` — 包括 WebSocket 和 Traefik 的多工具代理模式
- `setup-compose-stack` — 包含 Nginx 的 compose 栈
- `deploy-searxng` — 使用 Nginx 作为 SearXNG 的前端
- `configure-ingress-networking` — Kubernetes 入口（NGINX Ingress Controller）
