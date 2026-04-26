---
name: optimize-docker-build-cache
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Optimize Docker build times using layer caching, multi-stage builds,
  BuildKit features, and dependency-first copy patterns. Applicable to R,
  Node.js, and Python projects. Use when Docker builds are slow due to
  repeated package installations, when rebuilds reinstall all dependencies
  on every code change, when image sizes are unnecessarily large, or when
  CI/CD pipeline builds are a bottleneck.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, cache, optimization, multi-stage, buildkit
---

# 優化 Docker 構建快取

以層快取、多階段構建與構建優化，減 Docker 構建時間。

## 適用時機

- Docker 構建因重複套件安裝而慢
- 每次代碼變即重新安裝所有依賴
- 鏡像大小不必要地大
- CI/CD 管道構建為瓶頸

## 輸入

- **必要**：欲優化之既有 Dockerfile
- **選擇性**：目標構建時間之改進
- **選擇性**：目標鏡像大小之減少

## 步驟

### 步驟一：依變更頻率排序層

最少變更之層置於最先：

```dockerfile
# 1. Base image (rarely changes)
FROM rocker/r-ver:4.5.0

# 2. System dependencies (change occasionally)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Dependency files only (change when deps change)
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R
RUN R -e "renv::restore()"

# 4. Source code (changes frequently)
COPY . .
```

**關鍵原則**：Docker 對每層快取。一層變則所有後續層重建。依賴安裝當在源碼複製之前。

**預期：** Dockerfile 之層由最少變更（基礎鏡像、系統依賴）至最多變更（源碼）排序，依賴鎖檔於完整源之前複製。

**失敗時：** 若構建仍每次代碼變重新安裝依賴，驗 `COPY . .` 在依賴安裝之 `RUN` 命令之後，非之前。

### 步驟二：分依賴安裝與代碼

**劣**（每次代碼變重建套件）：

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**佳**（但於鎖檔變時重建套件）：

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Node.js 同模式：

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**預期：** 依賴鎖檔（`renv.lock`、`package-lock.json`、`requirements.txt`）於完整源碼 `COPY . .` 之前以獨立層複製並安裝。

**失敗時：** 若鎖檔複製敗，確檔存於構建上下文中，且未被 `.dockerignore` 排除。

### 步驟三：用多階段構建

分構建依賴與運行時：

```dockerfile
# Build stage - includes dev tools
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev libssl-dev build-essential
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# Runtime stage - minimal image
FROM rocker/r-ver:4.5.0
RUN apt-get update && apt-get install -y \
    libcurl4 libssl3 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**預期：** Dockerfile 有附開發工具之 builder 階段與但有生產依賴之運行時階段。終鏡像顯小於單階段構建。

**失敗時：** 若 `COPY --from=builder` 找不到函式庫，驗安裝路徑於諸階段間相符。用 `docker build --target builder .` 獨立除錯構建階段。

### 步驟四：合併 RUN 命令

每 `RUN` 創一層。合併相關命令：

**劣**（3 層，apt 快取留存）：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**佳**（1 層，清快取）：

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**預期：** 相關 `apt-get` 或套件安裝命令合於單一 `RUN` 指令，每以快取清理（`rm -rf /var/lib/apt/lists/*`）作結。

**失敗時：** 若合併之 `RUN` 命令於中途敗，暫拆之以辨失敗命令，修後再合。

### 步驟五：用 .dockerignore

防不必要之檔入構建上下文：

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
node_modules
docs/
*.tar.gz
.env
```

**預期：** 專案根存 `.dockerignore` 檔，排除 `.git`、`node_modules`、`renv/library`、構建產物與環境檔。構建上下文大小顯小。

**失敗時：** 若容器中缺所需檔，查 `.dockerignore` 中過廣之模式。用 `docker build` 詳細輸出驗何檔送至守護程序。

### 步驟六：啟 BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

或於 `docker-compose.yml`：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

連同 `COMPOSE_DOCKER_CLI_BUILD=1` 與 `DOCKER_BUILDKIT=1` 之環境變數。

BuildKit 啟用：
- 平行階段構建
- 更佳之快取管理
- `--mount=type=cache` 以持久套件快取

**預期：** 構建以 BuildKit 啟用運行（由 `#1 [internal] load build definition` 風之輸出示之）。多階段構建可並行則並行。

**失敗時：** 若 BuildKit 未啟，驗構建命令前已匯出環境變數。舊版 Docker，升級 Docker Engine 至 18.09+ 以支援 BuildKit。

### 步驟七：為套件管理器用快取掛載

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**預期：** 後續構建自掛載重用快取套件，縱層失效亦顯減安裝時間。快取跨構建持久。

**失敗時：** 若 `--mount=type=cache` 不被識，確 BuildKit 已啟（`DOCKER_BUILDKIT=1`）。語法需 BuildKit，舊式構建器不支援。

## 驗證

- [ ] 但代碼變後之重建顯快
- [ ] 鎖檔未變時依賴安裝層被快取
- [ ] `.dockerignore` 排除不必要之檔
- [ ] 鏡像大小較未優化構建減少
- [ ] 多階段構建（若用）分構建與運行時依賴

## 常見陷阱

- **裝依賴前複製所有檔**：每次代碼變即使依賴快取失效
- **忘 `.dockerignore`**：大構建上下文減慢每次構建
- **層過多**：每 `RUN`、`COPY`、`ADD` 創一層。合理處合併之
- **不清 apt 快取**：apt-get 安裝恆以 `&& rm -rf /var/lib/apt/lists/*` 作結
- **平台特定快取**：快取層為平台特定。CI runner 或不能受益於本地快取

## 相關技能

- `create-r-dockerfile` - 初始 Dockerfile 創建
- `setup-docker-compose` - compose 構建配置
- `containerize-mcp-server` - 對 MCP server 構建施優化
