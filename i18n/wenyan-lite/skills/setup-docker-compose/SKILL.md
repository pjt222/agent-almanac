---
name: setup-docker-compose
locale: wenyan-lite
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

# 設置 Docker Compose

為 R 開發與部署環境配置 Docker Compose。

## 適用時機

- 與其他服務（資料庫、API）一同執行 R
- 設置可重現之開發環境
- 編排 R 為基礎之 MCP 伺服器容器
- 管理環境變數與卷掛載

## 輸入

- **必要**：R 服務之 Dockerfile
- **必要**：欲掛載之項目目錄
- **選擇性**：附加服務（資料庫、快取、網頁伺服器）
- **選擇性**：環境變數配置

## 步驟

### 步驟一：建立 docker-compose.yml

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

**預期：** `docker-compose.yml` 文件已存，定義 R 服務含項目目錄與 renv 快取之卷掛載及 R 函式庫路徑之環境變數。

**失敗時：** 若 YAML 語法無效，以 `docker compose config` 驗證。確保縮排用空格（非 tab）且所有含特殊字元之字串值已加引號。

### 步驟二：加入附加服務（如需）

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

**預期：** 附加服務（如 PostgreSQL）已定義含其自有卷、環境變數與連接埠對應。R 服務之 `depends_on` 參照新服務。

**失敗時：** 若資料庫服務啟動失敗，檢查 `docker compose logs postgres` 以查初始化錯誤。驗證 `POSTGRES_PASSWORD_FILE` 之環境變數指向有效之 secrets 或開發用切至 `POSTGRES_PASSWORD`。

### 步驟三：配置網路

對需 localhost 存取（如 MCP 伺服器）之服務：

```yaml
services:
  r-dev:
    network_mode: "host"
```

對隔離網路：

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

**預期：** 網路已適切配置：對需 localhost 存取之服務（MCP 伺服器）用 `host` 模式，或對隔離服務用橋接網路含明確連接埠對應。

**失敗時：** 若服務無法通訊，驗證其於同網路。橋接網路時用服務名作主機名（如 `postgres` 而非 `localhost`）。host 模式時用 `localhost` 並確保連接埠不衝突。

### 步驟四：管理環境變數

建立 `.env` 文件（git 已忽略）：

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

於 compose 中參照：

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**預期：** `.env` 文件已存（git 已忽略），含項目特定變數，`docker-compose.yml` 透過 `env_file` 或變數插值（`${VAR}`）參照之。

**失敗時：** 若變數未解析，確保 `.env` 文件與 `docker-compose.yml` 於同目錄。執行 `docker compose config` 以見所有變數已展開之解析配置。

### 步驟五：建構並執行

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

**預期：** 所有服務啟動。R 會話可存取。

**失敗時：** 檢查 `docker compose logs` 以查啟動錯誤。常見：連接埠衝突、缺環境變數。

### 步驟六：為開發建立覆蓋

建立 `docker-compose.override.yml` 以提供本地開發設定：

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

此自動與 `docker-compose.yml` 合併。

**預期：** `docker-compose.override.yml` 文件已存，含開發特定設定（額外卷、除錯旗標），執行 `docker compose up` 時自動套用。

**失敗時：** 若覆蓋無效，驗證文件名確為 `docker-compose.override.yml`。執行 `docker compose config` 以確認合併。對明確之覆蓋文件用 `docker compose -f docker-compose.yml -f custom-override.yml up`。

## 驗證

- [ ] `docker compose build` 無錯完成
- [ ] `docker compose up` 啟動所有服務
- [ ] 卷掛載正確於主機與容器間共享文件
- [ ] 環境變數於容器內可用
- [ ] 服務間可相互通訊
- [ ] `docker compose down` 乾淨停止所有

## 常見陷阱

- **卷掛載權限**：Linux 容器可能以 root 建立文件。用 `user:` 指令或修權限。
- **連接埠衝突**：檢查主機上已用相同連接埠之服務
- **Docker Desktop 對 CLI**：`docker compose`（v2）對 `docker-compose`（v1）。用 v2。
- **WSL 路徑掛載**：自 WSL 掛載 Windows 目錄時用 `/mnt/c/...` 路徑
- **命名卷對綁定掛載**：命名卷跨重建持久；綁定掛載立即反映主機變更

## 相關技能

- `create-r-dockerfile` - 建立 compose 參照之 Dockerfile
- `containerize-mcp-server` - MCP 伺服器之 compose 配置
- `optimize-docker-build-cache` - 加速 compose 建構
