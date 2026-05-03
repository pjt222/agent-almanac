---
name: setup-docker-compose
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Docker Compose for multi-container R development environments.
  Covers service definitions, volume mounts, networking, environment
  variables, and development vs production configurations. Use when running
  R alongside other services (databases, APIs), setting up a reproducible
  R development environment, orchestrating an R-based MCP server container,
  or managing environment variables and volume mounts for R projects.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, development, volumes
---

# 設 Docker Compose

為 R 多容開發與展之境配 Docker Compose。

## 用時

- R 與他服（庫、API）並行乃用
- 設可重之開發境乃用
- 為 R 之 MCP 服容編排乃用
- 管環境變與卷掛乃用

## 入

- **必要**：R 服之 Dockerfile
- **必要**：所掛之項目目
- **可選**：他服（庫、緩、網服）
- **可選**：環境變之配

## 法

### 第一步：立 docker-compose.yml

```yaml
version: '3.8'

services:
  r-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-dev
    image: r-dev:latest

    volumes:
      - .:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library
      - RENV_PATHS_CACHE=/workspace/renv/cache

    command: R

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

得：`docker-compose.yml` 存附 R 服之定，含項目目與 renv 緩之卷掛、與 R 庫徑之環境變。

敗則：YAML 語法誤，以 `docker compose config` 驗。確縮以空（非 tab），含特字之串值皆引。

### 第二步：增他服（若需）

```yaml
services:
  r-dev:
    # ... as above
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432

  postgres:
    image: postgres:16
    container_name: r-postgres
    environment:
      POSTGRES_DB: analysis
      POSTGRES_USER: ruser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  renv-cache:
  pgdata:
```

得：他服（如 PostgreSQL）已定附其卷、環境變、端映。R 服有 `depends_on` 指新服。

敗則：庫服啟敗，察 `docker compose logs postgres` 之初誤。驗 `POSTGRES_PASSWORD_FILE` 等指有效之密，或為開發改 `POSTGRES_PASSWORD`。

### 第三步：配網

為需 localhost 之服（如 MCP 服）：

```yaml
services:
  r-dev:
    network_mode: "host"
```

為隔之網：

```yaml
services:
  r-dev:
    networks:
      - app-network
    ports:
      - "3000:3000"

networks:
  app-network:
    driver: bridge
```

得：網配宜：`host` 模為需 localhost 之服（MCP 服），或橋網附明端映為隔之服。

敗則：服不能通，驗皆於同網。橋網用服名為主機名（如 `postgres`，非 `localhost`）。host 模用 `localhost` 確端口無衝。

### 第四步：管環境變

立 `.env` 文件（git-ignored）：

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

於 compose 引：

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

得：`.env` 文件存（git-ignored）附項目特之變，`docker-compose.yml` 引之以 `env_file` 或變插（`${VAR}`）。

敗則：變不解，確 `.env` 與 `docker-compose.yml` 同目。行 `docker compose config` 觀解後之配。

### 第五步：建而行

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Attach to R session
docker compose exec r-dev R

# View logs
docker compose logs -f r-dev

# Stop services
docker compose down
```

得：諸服啟。R 會話可訪。

敗則：察 `docker compose logs` 之啟誤。常患：端口衝、缺環境變。

### 第六步：為開發立 override

立 `docker-compose.override.yml` 為本地開發設：

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

此自合於 `docker-compose.yml`。

得：`docker-compose.override.yml` 存附開發特之設（額卷、調試旗），自施於 `docker compose up`。

敗則：override 不效，驗文名確為 `docker-compose.override.yml`。行 `docker compose config` 確合。明 override 文件用 `docker compose -f docker-compose.yml -f custom-override.yml up`。

## 驗

- [ ] `docker compose build` 成而無誤
- [ ] `docker compose up` 啟諸服
- [ ] 卷掛正共文件於主與容
- [ ] 環境變於容內可得
- [ ] 諸服可相通
- [ ] `docker compose down` 潔止諸物

## 陷

- **卷掛之權**：Linux 容或以 root 立文件。用 `user:` 指或修權
- **端口衝**：察主上既用同端之服
- **Docker Desktop vs CLI**：`docker compose`（v2）vs `docker-compose`（v1）。用 v2
- **WSL 徑掛**：自 WSL 掛 Windows 目用 `/mnt/c/...` 徑
- **命名卷 vs 綁掛**：命名卷跨重建持；綁掛即映主之變

## 參

- `create-r-dockerfile` — 立 compose 所引之 Dockerfile
- `containerize-mcp-server` — MCP 服之 compose 配
- `optimize-docker-build-cache` — 速 compose 之建
