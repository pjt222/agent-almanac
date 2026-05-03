---
name: setup-compose-stack
locale: wenyan
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

# 設 Compose 之棧

為多服應用之棧配 Docker Compose，附庫、緩、工。

## 用時

- 行網應附庫與/或緩乃用
- 設多服之開發境乃用
- 並 API 與後台工乃用
- 跨團需可重之多服境乃用

## 入

- **必要**：應之服（語、端口、入點）
- **必要**：所需之輔服（庫、緩、隊等）
- **可選**：開發 vs 生產之配
- **可選**：自定服之既 Dockerfile

## 法

### 第一步：定核之棧

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

得：`docker compose up` 啟諸服，應俟健庫。

### 第二步：增健察

健察使 `depends_on` 可用 `condition: service_healthy`：

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

### 第三步：配網

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

此隔庫於外直訪，而應橋二網。

### 第四步：管環境變

立 `.env` 文件（git-ignored）：

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

於 compose 引：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

立 `.env.example`（提交於 git）：

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### 第五步：增工服

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

### 第六步：以 profile 為選服

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

### 第七步：為開發立 override

`docker-compose.override.yml` 自動合並：

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

### 第八步：建而行

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

得：諸服啟，健察過，應連庫與緩。

敗則：察 `docker compose logs <service>`。常患：端口衝、缺環變、健察超時。

## 驗

- [ ] `docker compose up` 啟諸服而無誤
- [ ] 庫與緩之健察過
- [ ] 應連諸依服
- [ ] 命名卷跨重啟存數
- [ ] `.env` 入 git-ignore；`.env.example` 已提交
- [ ] `docker compose down` 潔止諸物
- [ ] profile 分開發器與生產服

## 陷

- **無健察**：`depends_on` 而無 `condition: service_healthy` 唯俟容啟，非俟備
- **硬編密於 compose**：用 `.env` 或 Docker secret。永勿提交密
- **卷掛蓋**：掛 `.:/app` 蓋鏡中所建之 `node_modules`。用匿之卷：`/app/node_modules`
- **端口衝**：察 `docker compose ps` 與 `lsof -i :<port>` 為衝
- **`version:` 鍵**：Compose V2 忽 `version:` 鍵。新設略之
- **WSL 徑之患**：自 WSL 掛 Windows 目用 `/mnt/c/...` 徑

## 參

- `setup-docker-compose` — R 特之 Docker Compose 配
- `create-dockerfile` — 寫 compose 所引之 Dockerfile
- `create-multistage-dockerfile` — 為棧建優之像
- `configure-nginx` — 加 Nginx 反向代理於棧
