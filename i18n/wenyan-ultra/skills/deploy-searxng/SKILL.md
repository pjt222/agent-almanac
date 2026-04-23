---
name: deploy-searxng
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# 部署 SearXNG

以 Docker Compose+Nginx 部自託 SearXNG 元搜索。

## 用

- 建私人自託搜索
- 聚合多源無跟蹤
- 團隊/組織共享搜索
- 替單一搜索提供商

## 入

- **必**：有 Docker 之機
- **可**：域名
- **可**：SSL/Let's Encrypt
- **可**：自定引擎偏好

## 法

### 一：建項目結構

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### 二：書 Docker Compose

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

### 三：配 SearXNG 設定

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

生密鑰：

```bash
openssl rand -hex 32
```

### 四：配 Nginx 前端

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

### 五：配限流

`config/limiter.toml`：

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### 六：部署並驗

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

**得：** SearXNG 於 8080 經 Nginx 應。查詢返聚合結果。

**敗：** 察 `docker compose logs searxng` 覓配錯。驗 `settings.yml` YAML 語法。

### 七：加 SSL（生產）

公開部署加 SSL。更 `docker-compose.yml`：

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

SSL Nginx 全配見 `configure-nginx` 技能。

### 八：更新與維護

```bash
# Pull latest image
docker compose pull searxng

# Restart with new image
docker compose up -d

# Backup configuration
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 驗

- [ ] SearXNG 啟無錯於日誌
- [ ] 查詢返配置引擎之結果
- [ ] 圖代理工作（圖經 SearXNG 載）
- [ ] 限流擋過量請求
- [ ] 配置跨容器重啟持久
- [ ] Nginx 正確代理

## 忌

- **缺 secret_key**：無此 SearXNG 拒啟。
- **配權限**：SearXNG 寫配目錄。卷須 `:rw` 非 `:ro`。
- **引擎封**：某引擎擋服務器 IP。輪替或用圖代理。
- **YAML 縮進**：`settings.yml` 縮進敏感。部前以 YAML linter 驗。
- **Base URL 不匹**：`SEARXNG_BASE_URL` 須匹用戶實訪 URL，含協議+尾斜線。
- **Docker DNS 解析**：用 Google/Bing 引擎或需主機網絡或正 DNS。默認 Docker DNS 通常可。

## 參

- `setup-compose-stack`
- `configure-nginx`
- `configure-reverse-proxy`
