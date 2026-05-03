---
name: setup-docker-compose
locale: wenyan-ultra
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

配 Docker Compose 為多容 R 開境。

## 用

- R 行於他服旁（庫、API）→用
- 設可重 R 開境→用
- 排 R 之 MCP 服容→用
- 管環變與卷掛→用

## 入

- **必**：R 服 Dockerfile
- **必**：所掛項目
- **可**：他服（庫、緩、網服）
- **可**：環變配

## 行

### 一：建 docker-compose.yml

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

得：`docker-compose.yml` 存含 R 服定、含項目與 renv 緩之卷掛、與 R 庫徑之環變。

敗：YAML 語誤→`docker compose config` 驗。確縮用空（非定）、特字串值引號。

### 二：加他服（如需）

```yaml
services:
  r-dev:
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

得：他服（如 PostgreSQL）定含自卷、環變、口映。R 服 `depends_on` 引新服。

敗：庫服啟敗→察 `docker compose logs postgres` 為始誤。驗如 `POSTGRES_PASSWORD_FILE` 之環變指有效密、或開境改 `POSTGRES_PASSWORD`。

### 三：配網

需 localhost 達之服（如 MCP 服）：

```yaml
services:
  r-dev:
    network_mode: "host"
```

隔網：

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

得：網宜配：`host` 模為需 localhost 之服（MCP）、橋網含顯口映為隔服。

敗：服不能通→驗於同網。橋網用服名為主機（如 `postgres` 非 `localhost`）。host 模用 `localhost` 確口無衝。

### 四：管環變

建 `.env`（git 忽）：

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

得：`.env` 存（git 忽）含項變、`docker-compose.yml` 經 `env_file` 或 `${VAR}` 引。

敗：變未解→確 `.env` 於 `docker-compose.yml` 同目。`docker compose config` 行察解配含諸變展。

### 五：建行

```bash
docker compose build

docker compose up -d

docker compose exec r-dev R

docker compose logs -f r-dev

docker compose down
```

得：諸服啟、R 會可達。

敗：察 `docker compose logs` 為啟誤。常：口衝、缺環變。

### 六：建覆為開

建 `docker-compose.override.yml` 為地開設：

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

此自合於 `docker-compose.yml`。

得：`docker-compose.override.yml` 存含開特設（額卷、除錯旗）行 `docker compose up` 時自施。

敗：覆無效→驗檔名正為 `docker-compose.override.yml`。`docker compose config` 確合。顯覆檔→`docker compose -f docker-compose.yml -f custom-override.yml up`。

## 驗

- [ ] `docker compose build` 成無誤
- [ ] `docker compose up` 啟諸服
- [ ] 卷掛正共主機與容檔
- [ ] 環變於容內可
- [ ] 諸服可通
- [ ] `docker compose down` 潔停諸

## 忌

- **卷掛權**：Linux 容可生根檔。用 `user:` 指或修權
- **口衝**：察主機已用同口之服
- **Docker Desktop vs CLI**：`docker compose`（v2）vs `docker-compose`（v1）。用 v2
- **WSL 徑**：自 WSL 掛 Windows 目用 `/mnt/c/...`
- **名卷 vs 綁掛**：名卷跨建持；綁掛即映主機變

## 參

- `create-r-dockerfile`
- `containerize-mcp-server`
- `optimize-docker-build-cache`
