---
name: setup-compose-stack
locale: wenyan-ultra
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

# 設 Compose 棧

配 Docker Compose 為多服應棧含庫、緩、工。

## 用

- 行網應含庫/緩→用
- 設多服開境→用
- 排背工於 API 旁→用
- 跨組需可重多服境→用

## 入

- **必**：應服（語、口、入點）
- **必**：所需輔服（庫、緩、隊等）
- **可**：開 vs 產配
- **可**：自服既 Dockerfile

## 行

### 一：定核棧

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

得：`docker compose up` 啟諸服、應待健庫。

### 二：加健察

健察使 `depends_on` 能用 `condition: service_healthy`：

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

### 三：配網

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

此隔庫於直外達、應跨兩網。

### 四：管環變

建 `.env`（git 忽）：

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

於 compose 用：

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

建 `.env.example`（提至 git）：

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### 五：加工服

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

### 六：用組為可選服

```yaml
services:
  app:
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

### 七：建覆為開

`docker-compose.override.yml` 自合：

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

### 八：建行

```bash
docker compose build

docker compose up -d

docker compose logs -f app

docker compose ps

docker compose down

docker compose down -v
```

得：諸服啟、健察過、應連庫與緩。

敗：察 `docker compose logs <service>`。常題：口衝、缺環變、健察超時。

## 驗

- [ ] `docker compose up` 啟諸服無誤
- [ ] 庫與緩健察過
- [ ] 應連諸依服
- [ ] 名卷跨啟保資
- [ ] `.env` git 忽、`.env.example` 提
- [ ] `docker compose down` 潔停諸
- [ ] 組分開工於產服

## 忌

- **無健察**：`depends_on` 無 `condition: service_healthy` 僅待容啟、非備
- **硬碼密於 compose**：用 `.env` 或 Docker secrets。永勿提密
- **卷掛覆**：掛 `.:/app` 覆像內 `node_modules`。用匿卷：`/app/node_modules`
- **口衝**：察 `docker compose ps` 與 `lsof -i :<port>` 衝
- **`version:` 鍵**：Compose V2 忽 `version:`。今設略之
- **WSL 徑問題**：自 WSL 掛 Windows 目用 `/mnt/c/...`

## 參

- `setup-docker-compose`
- `create-dockerfile`
- `create-multistage-dockerfile`
- `configure-nginx`
