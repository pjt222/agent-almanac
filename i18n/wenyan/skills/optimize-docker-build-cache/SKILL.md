---
name: optimize-docker-build-cache
locale: wenyan
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

# 優 Docker 構建緩存

以層緩、多階構、BuildKit 諸能、與依賴先拷模減 Docker 構時。

## 用時

- 構慢因復裝包乃用
- 每碼變即重裝諸依乃用
- 像體無謂大乃用
- CI/CD 管之構為瓶頸乃用

## 入

- **必要**：欲優之 Dockerfile
- **可選**：構時改善目
- **可選**：像減目

## 法

### 第一步：依變頻排層

少變者先：

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

**要則**：Docker 緩各層。一層變則諸後重構。依裝宜先於源拷。

**得：** Dockerfile 諸層自最少變（基像、系依）至最多變（源）排，鎖文件先於全源拷。

**敗則：** 每碼變仍重裝依者，驗 `COPY . .` 在依裝 `RUN` 後，非前。

### 第二步：分依裝與碼

**惡**（每碼變重構包）：

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**善**（唯鎖變時重構包）：

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Node.js 同模：

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**得：** 鎖文件（`renv.lock`、`package-lock.json`、`requirements.txt`）獨層拷裝，先於全源 `COPY . .`。

**敗則：** 鎖拷敗者，確文件存於構脈絡中且未為 `.dockerignore` 所排。

### 第三步：用多階構

分構依與運：

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

**得：** Dockerfile 有附開發具之構階與唯生產依之運階。終像顯小於單階構。

**敗則：** `COPY --from=builder` 不能尋庫者，驗階間裝路徑合。用 `docker build --target builder .` 獨調構階。

### 第四步：合 RUN 命

各 `RUN` 生一層。合相關命：

**惡**（三層，apt 緩存留）：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**善**（一層，緩淨）：

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**得：** 相關 `apt-get` 或包裝命合於單 `RUN`，各以緩淨（`rm -rf /var/lib/apt/lists/*`）終。

**敗則：** 合之 `RUN` 中途敗者，暫分以識敗命，修後重合。

### 第五步：用 .dockerignore

防無謂文件入構脈絡：

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

**得：** 項目根有 `.dockerignore`，排 `.git`、`node_modules`、`renv/library`、構物、與環境文件。構脈絡顯小。

**敗則：** 容器中缺所需文件者，察 `.dockerignore` 過廣模。用 `docker build` 詳出驗何送守護。

### 第六步：啟 BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

或 `docker-compose.yml`：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

附 `COMPOSE_DOCKER_CLI_BUILD=1` 與 `DOCKER_BUILDKIT=1` 環境變量。

BuildKit 啟：
- 平行階構
- 更好之緩管
- `--mount=type=cache` 為持包緩

**得：** 構以 BuildKit 行（以 `#1 [internal] load build definition` 樣式出示）。多階構於可處平行行階。

**敗則：** BuildKit 未活者，驗環境變量於構命前已出。舊 Docker 者，升 Docker Engine 至 18.09+ 以支 BuildKit。

### 第七步：為包管器用緩掛

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**得：** 後構自掛重用緩包，即層失效裝時亦大減。緩跨構持。

**敗則：** `--mount=type=cache` 不識者，確 BuildKit 已啟（`DOCKER_BUILDKIT=1`）。語要 BuildKit，舊構不支。

## 驗

- [ ] 唯碼變後之重構顯快
- [ ] 鎖未變時依裝層緩
- [ ] `.dockerignore` 排無謂文件
- [ ] 像較未優構小
- [ ] 多階構（若用）分構與運依

## 陷

- **依裝前拷皆**：每碼變失依緩
- **忘 `.dockerignore`**：大構脈絡緩諸構
- **層過多**：各 `RUN`、`COPY`、`ADD` 生一層。可邏合處合之
- **不淨 apt 緩**：apt-get 裝必以 `&& rm -rf /var/lib/apt/lists/*` 終
- **平台特緩**：緩層平台特。CI 或不得本緩之益

## 參

- `create-r-dockerfile` - 初 Dockerfile 建
- `setup-docker-compose` - compose 構設
- `containerize-mcp-server` - 施優於 MCP 服務器構
