---
name: deploy-searxng
description: >
  通过 Docker Compose 部署自托管的 SearXNG 元搜索引擎。涵盖 settings.yml 配置、
  搜索引擎选择、结果代理、Nginx 前端、持久化和更新。适用于搭建无追踪的私有搜索引擎、
  聚合多个搜索提供者的结果、为团队或组织运行共享搜索实例，或替代对单一搜索提供者的依赖。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: searxng, self-hosted, search-engine, privacy, docker-compose, meta-search
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 部署 SearXNG

使用 Docker Compose 和 Nginx 部署自托管的 SearXNG 元搜索引擎。

## 适用场景

- 搭建私有的自托管搜索引擎
- 在无追踪的情况下聚合多个搜索提供者的结果
- 为团队或组织运行搜索实例
- 替代对单一搜索提供者的依赖

## 输入

- **必需**：已安装 Docker 的服务器或机器
- **可选**：用于公开访问的域名
- **可选**：SSL 证书或 Let's Encrypt 设置
- **可选**：自定义搜索引擎偏好

## 步骤

### 第 1 步：创建项目结构

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### 第 2 步：编写 Docker Compose 文件

`docker-compose.yml`：

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

### 第 3 步：配置 SearXNG 设置

`config/settings.yml`：

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

生成密钥：

```bash
openssl rand -hex 32
```

### 第 4 步：配置 Nginx 前端

`nginx/nginx.conf`：

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

### 第 5 步：配置速率限制

`config/limiter.toml`：

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### 第 6 步：部署和验证

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

**预期结果：** SearXNG 通过 Nginx 在端口 8080 上响应。搜索查询返回聚合结果。

**失败处理：** 检查 `docker compose logs searxng` 中的配置错误。验证 `settings.yml` 的 YAML 语法。

### 第 7 步：添加 SSL（生产环境）

对于公开部署，添加 SSL 终止。更新 `docker-compose.yml`：

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

完整的 SSL Nginx 配置请参见 `configure-nginx` 技能。

### 第 8 步：更新和维护

```bash
# Pull latest image
docker compose pull searxng

# Restart with new image
docker compose up -d

# Backup configuration
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 验证清单

- [ ] SearXNG 启动时日志无错误
- [ ] 搜索查询从已配置的引擎返回结果
- [ ] 图片代理正常工作（图片通过 SearXNG 加载）
- [ ] 速率限制器阻止过多请求
- [ ] 配置在容器重启后持久保存
- [ ] Nginx 正确代理请求

## 常见问题

- **缺少 secret_key**：SearXNG 没有 `settings.yml` 中的 `secret_key` 将拒绝启动
- **配置权限**：SearXNG 写入配置目录。卷必须是 `:rw` 而非 `:ro`
- **引擎封锁**：某些引擎可能会封锁来自服务器 IP 的请求。轮换引擎或使用图片代理
- **YAML 缩进**：`settings.yml` 对缩进敏感。部署前使用 YAML 检查器验证
- **基础 URL 不匹配**：`SEARXNG_BASE_URL` 必须与用户实际访问的 URL 匹配，包括协议和尾部斜杠
- **Docker 中的 DNS 解析**：使用 Google/Bing 的引擎可能需要主机网络或正确的 DNS。默认 Docker DNS 通常可用

## 相关技能

- `setup-compose-stack` — 此处使用的通用 Docker Compose 模式
- `configure-nginx` — Nginx 的 SSL 和安全头配置
- `configure-reverse-proxy` — Nginx 前端的高级代理模式
