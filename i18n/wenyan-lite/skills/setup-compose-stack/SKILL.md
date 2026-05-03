---
name: setup-compose-stack
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure general-purpose Docker Compose stacks for common application
  patterns. Covers web app + database + cache + worker services, named
  volumes, networks, health checks, depends_on, environment management,
  and profiles. Use when running a web app with a database or cache,
  setting up a development environment with multiple services,
  orchestrating background workers alongside an API, or creating
  reproducible multi-service environments across teams.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, postgres, redis, multi-service, health-checks
---

# 設置 Compose 堆疊

為含資料庫、快取與工作者之多服務應用堆疊配置 Docker Compose。

## 適用時機

- 執行含資料庫與/或快取之網頁應用
- 設置含多服務之開發環境
- 與 API 一同編排背景工作者
- 跨團隊需可重現之多服務環境

## 輸入

- **必要**：應用服務（語言、連接埠、入口點）
- **必要**：所需支援服務（資料庫、快取、佇列等）
- **選擇性**：開發 vs 生產配置
- **選擇性**：自訂服務之既有 Dockerfile

## 步驟

### 步驟一：定義核心堆疊

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**預期：** `docker compose up` 啟動所有服務，應用等待健康之資料庫。

### 步驟二：加入健康檢查

健康檢查啟用 `depends_on` 之 `condition: service_healthy`：

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### 步驟三：配置網路

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  nginx:
    networks:
      - frontend
    ports:
      - "80:80"

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

此將資料庫與直接外部存取隔離，而應用橋接兩網路。

### 步驟四：管理環境變數

建立 `.env` 文件（git 已忽略）：

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

於 compose 中參照：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

建立 `.env.example`（已提交至 git）：

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### 步驟五：加入工作者服務

```yaml
services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["node", "src/worker.js"]
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2
```

### 步驟六：以設定檔處理選擇性服務

```yaml
services:
  app:
    # always starts
    build: .

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev
```

```bash
# Start core services only
docker compose up

# Start with dev tools
docker compose --profile dev up
```

### 步驟七：為開發建立覆蓋

`docker-compose.override.yml` 自動合併：

```yaml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    command: ["npm", "run", "dev"]
```

### 步驟八：建構並執行

```bash
# Build all images
docker compose build

# Start in background
docker compose up -d

# View logs
docker compose logs -f app

# Check service status
docker compose ps

# Stop and remove
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

**預期：** 所有服務啟動、健康檢查通過、應用連接至資料庫與快取。

**失敗時：** 檢查 `docker compose logs <service>`。常見問題：連接埠衝突、缺環境變數、健康檢查超時。

## 驗證

- [ ] `docker compose up` 無錯啟動所有服務
- [ ] 資料庫與快取之健康檢查通過
- [ ] 應用連接至所有依賴服務
- [ ] 命名卷跨重啟持久資料
- [ ] `.env` 已 git 忽略；`.env.example` 已提交
- [ ] `docker compose down` 乾淨停止所有
- [ ] 設定檔將開發工具與生產服務分隔

## 常見陷阱

- **無健康檢查**：無 `condition: service_healthy` 之 `depends_on` 僅等待容器啟動，非就緒。
- **compose 中硬編碼之密碼**：用 `.env` 文件或 Docker secrets。絕不提交密碼。
- **卷掛載覆寫**：掛載 `.:/app` 覆寫於映像中建之 `node_modules`。用匿名卷：`/app/node_modules`。
- **連接埠衝突**：以 `docker compose ps` 與 `lsof -i :<port>` 檢查衝突。
- **`version:` 鍵**：Compose V2 忽略 `version:` 鍵。對現代設置省略之。
- **WSL 路徑問題**：自 WSL 掛載 Windows 目錄時用 `/mnt/c/...` 路徑。

## 相關技能

- `setup-docker-compose` - R 特定之 Docker Compose 配置
- `create-dockerfile` - 撰寫 compose 參照之 Dockerfile
- `create-multistage-dockerfile` - 為堆疊建構優化映像
- `configure-nginx` - 對堆疊加入 Nginx 反向代理
