---
name: deploy-searxng
locale: wenyan
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

以 Docker Compose 與 Nginx 部自宿之 SearXNG 元搜索引擎。

## 用時

- 立私人自宿搜索引擎
- 匯多供商之結果而不跟蹤
- 為團隊或組織行搜索實例
- 去單一搜索供商之賴

## 入

- **必要**：已裝 Docker 之伺或機
- **可選**：供公訪之域名
- **可選**：SSL 證書或 Let's Encrypt 設
- **可選**：自定引擎之偏好

## 法

### 第一步：建項目結構

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### 第二步：書 Docker Compose 文件

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

### 第三步：配 SearXNG 設定

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

### 第四步：配 Nginx 前端

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

### 第五步：配限流

`config/limiter.toml`：

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### 第六步：部署並驗

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

**得：** SearXNG 經 Nginx 於 8080 端應。搜索返匯總結果。

**敗則：** 察 `docker compose logs searxng` 以尋配錯。驗 `settings.yml` YAML 法。

### 第七步：加 SSL（產）

供公部署宜加 SSL 終止。更新 `docker-compose.yml`：

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

詳見 `configure-nginx` 技能之全 SSL Nginx 配。

### 第八步：更新與維護

```bash
# Pull latest image
docker compose pull searxng

# Restart with new image
docker compose up -d

# Backup configuration
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 驗

- [ ] SearXNG 啟日誌無錯
- [ ] 搜索由所配引擎返結果
- [ ] 圖代理可行（圖由 SearXNG 載）
- [ ] 限流阻過量請求
- [ ] 配置越容器重啟而存
- [ ] Nginx 正代理請求

## 陷

- **無 secret_key**：settings.yml 無 `secret_key` 則 SearXNG 拒啟。
- **配權限**：SearXNG 寫入配目錄。卷宜 `:rw` 非 `:ro`。
- **引擎阻**：某些引擎阻伺 IP 之請求。輪換引擎或用圖代理。
- **YAML 縮進**：`settings.yml` 對縮進敏。部前以 YAML linter 驗。
- **基 URL 不合**：`SEARXNG_BASE_URL` 宜合用者實際訪之 URL，含協議與尾斜。
- **Docker 中 DNS 解析**：用 Google/Bing 之引擎或需主機網或正 DNS。默 Docker DNS 常可。

## Related Skills

- `setup-compose-stack` - 此處所用 Docker Compose 通模式
- `configure-nginx` - Nginx 之 SSL 與安全頭配
- `configure-reverse-proxy` - Nginx 前端之進階代理模式
