---
name: optimize-docker-build-cache
locale: wenyan-ultra
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

# 省 Docker 構快取

藉層快取、多階構、BuildKit、依先模減 Docker 構時。

## 用

- 構緩、復裝包
- 改碼即重裝諸依
- 像過大
- CI/CD 構為瓶

## 入

- **必**：現 Dockerfile
- **可**：構時改善標
- **可**：像縮減標

## 行

### 一：依變率排層

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

**要則**：Docker 各層皆快取。一層變則諸後重構。依裝必先於碼複。

**得：** 層由少變至多變、依鎖文於全源前。

**敗：** 改碼仍重裝→確 `COPY . .` 在 `RUN` 裝後、非前。

### 二：依與碼分

**劣**（碼變則重裝）：

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**優**（鎖變乃重裝）：

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Node.js 同理：

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**得：** 鎖文（renv.lock、package-lock.json、requirements.txt）於 `COPY . .` 前獨層複裝。

**敗：** 鎖複敗→確文在構境且未為 `.dockerignore` 排。

### 三：用多階構

構依與運分：

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

**得：** Dockerfile 有 builder 階+運階、終像顯小於單階。

**敗：** `COPY --from=builder` 不見庫→確兩階裝路同。`docker build --target builder .` 獨調 builder。

### 四：合 RUN 命

各 `RUN` 生層。合相關：

**劣**（3 層、apt 快取留）：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**優**（1 層、淨快取）：

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**得：** 相關 `apt-get` 或裝命合一 `RUN`、皆以快取清（`rm -rf /var/lib/apt/lists/*`）終。

**敗：** 合 `RUN` 中敗→暫拆識敗命、修後再合。

### 五：用 .dockerignore

阻無謂文入構境：

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

**得：** 根有 `.dockerignore`、排 `.git`、`node_modules`、`renv/library`、構物、環文。構境顯小。

**敗：** 容器內缺需文→查 `.dockerignore` 之過寬模。`docker build` 詳輸驗送 daemon 之文。

### 六：啟 BuildKit

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

配 `COMPOSE_DOCKER_CLI_BUILD=1` + `DOCKER_BUILDKIT=1` 環變。

BuildKit 啟：
- 並行階構
- 快取管優
- `--mount=type=cache` 為持包快取

**得：** 構以 BuildKit（輸示 `#1 [internal] load build definition`）。多階盡能並行。

**敗：** BuildKit 未行→確環變於構命前已導。Docker 舊版→升至 18.09+。

### 七：包管用 cache mount

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**得：** 後構用 mount 快取、層失效裝時亦速。快取跨構持。

**敗：** `--mount=type=cache` 不識→確 BuildKit 啟（`DOCKER_BUILDKIT=1`）—舊構器不支。

## 驗

- [ ] 但碼變後重構顯速
- [ ] 鎖未變時依層自快取
- [ ] `.dockerignore` 排無謂文
- [ ] 像比未省者小
- [ ] 多階（如用）構↔運分

## 忌

- **裝依前複全文**：每碼變使依快取失效
- **忘 `.dockerignore`**：構境大則諸構皆緩
- **層過多**：各 `RUN`/`COPY`/`ADD` 為一層—邏輯處合之
- **不淨 apt 快取**：`apt-get install` 必以 `&& rm -rf /var/lib/apt/lists/*` 終
- **平台特快取**：層快取依平台—CI 工或不得益於本地快取

## 參

- `create-r-dockerfile`
- `setup-docker-compose`
- `containerize-mcp-server`
