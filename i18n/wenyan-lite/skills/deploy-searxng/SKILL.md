---
name: deploy-searxng
locale: wenyan-lite
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

# Deploy SearXNG

以 Docker Compose 與 Nginx 部署自託管 SearXNG 元搜尋引擎。

## 適用時機

- 建私人、自託管之搜尋引擎
- 聚合多搜尋提供者之結果而不追蹤
- 為團隊或組織運行搜尋實例
- 取代對單一搜尋提供者之依賴

## 輸入

- **必需**：已裝 Docker 之伺服器或機器
- **可選**：供公開訪問之網域名
- **可選**：SSL 憑證或 Let's Encrypt 設定
- **可選**：自定之引擎偏好

## 步驟

### 步驟一：建專案結構

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### 步驟二：寫 Docker Compose 檔

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

### 步驟三：配 SearXNG 設定

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

### 步驟四：配 Nginx 前端

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

### 步驟五：配速率限制

`config/limiter.toml`：

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### 步驟六：部署並驗證

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

**預期：** SearXNG 透過 Nginx 於 8080 埠回應。搜尋查詢返回聚合結果。

**失敗時：** 查 `docker compose logs searxng` 有無配置錯誤。驗 `settings.yml` YAML 語法。

### 步驟七：加 SSL（生產）

公開部署宜加 SSL 終止。更 `docker-compose.yml`：

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

完整 SSL Nginx 配置，見 `configure-nginx` 技能。

### 步驟八：更新與維護

```bash
# Pull latest image
docker compose pull searxng

# Restart with new image
docker compose up -d

# Backup configuration
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 驗證

- [ ] SearXNG 啟動，日誌無誤
- [ ] 搜尋查詢返回已配引擎之結果
- [ ] 圖片代理運作（圖片透過 SearXNG 載入）
- [ ] 速率限制器阻過量請求
- [ ] 配置於容器重啟後仍存
- [ ] Nginx 正確代理請求

## 常見陷阱

- **缺 secret_key**：SearXNG 若無 settings.yml 中之 `secret_key` 則拒啟動。
- **配置權限**：SearXNG 寫入配置目錄。卷宗須為 `:rw` 非 `:ro`。
- **引擎封鎖**：某些引擎可能阻伺服器 IP 之請求。輪換引擎或用圖片代理。
- **YAML 縮排**：`settings.yml` 對縮排敏感。部署前以 YAML 檢查器驗之。
- **基礎 URL 不符**：`SEARXNG_BASE_URL` 須合用戶實際訪問之 URL，含協定與末尾斜線。
- **Docker 內 DNS 解析**：用 Google/Bing 之引擎可能需主機網路或合適之 DNS。預設 Docker DNS 通常可。

## 相關技能

- `setup-compose-stack` - 此處所用之一般 Docker Compose 模式
- `configure-nginx` - SSL 與安全標頭之 Nginx 配置
- `configure-reverse-proxy` - Nginx 前端之高級代理模式
