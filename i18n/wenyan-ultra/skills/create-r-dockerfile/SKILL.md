---
name: create-r-dockerfile
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a Dockerfile for R projects using rocker base images. Covers
  system dependency installation, R package installation, renv
  integration, and optimized layer ordering for fast rebuilds. Use when
  containerizing an R application or analysis, creating reproducible R
  environments, deploying R-based services (Shiny, Plumber, MCP server),
  or setting up consistent development environments across machines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, r, rocker, container, reproducibility
---

# 造 R Dockerfile

用 rocker 基像構 R 案 Dockerfile 含正依理。

## 用

- 容器化 R 應或析
- 建可重 R 境
- 部 R 基服（Shiny、Plumber、MCP server）
- 設一致發境

## 入

- **必**：含依之 R 案（DESCRIPTION 或 renv.lock）
- **必**：目（發、產、或服）
- **可**：R 版（默：最新穩）
- **可**：所需額系庫

## 行

### 一：擇基像

| 用 | 基像 | 寸 |
|----------|-----------|------|
| 最小 R 行 | `rocker/r-ver:4.5.0` | ~800MB |
| 含 tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| 含 RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny server | `rocker/shiny-verse:4.5.0` | ~2GB |

**得：** 擇合案需而無冗之基像。

**敗：** 疑→始於 `rocker/r-ver`（最小）、需方加包。察 [rocker-org](https://github.com/rocker-org/rocker-versioned2) 全像錄。

### 二：書 Dockerfile

```dockerfile
FROM rocker/r-ver:4.5.0

# Install system dependencies
# Group by purpose for clarity
RUN apt-get update && apt-get install -y \
    # HTTP/SSL
    libcurl4-openssl-dev \
    libssl-dev \
    # XML processing
    libxml2-dev \
    # Git integration
    libgit2-dev \
    libssh2-1-dev \
    # Graphics
    libfontconfig1-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    # Utilities
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
# Order: least-changing first for cache efficiency
RUN R -e "install.packages(c( \
    'remotes', \
    'devtools', \
    'renv' \
    ), repos='https://cloud.r-project.org/')"

# Set working directory
WORKDIR /workspace

# Copy renv files first (cache layer)
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R

# Restore packages from lockfile
RUN R -e "renv::restore()"

# Copy project files
COPY . .

# Default command
CMD ["R"]
```

**得：** Dockerfile 以 `docker build -t myproject .` 成構。

**敗：** `apt-get install` 中敗→察包名合目發行（Debian）。`renv::restore()` 敗→保 `renv.lock` 與 `renv/activate.R` 復前已複。

### 三：建 .dockerignore

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
renv/staging
docs/
*.tar.gz
```

**得：** `.dockerignore` 自 Docker 脈除 Git 史、IDE 檔、地 renv 庫、構品。

**敗：** Docker 構仍複餘檔→驗 `.dockerignore` 於 Dockerfile 同目、用正 glob 模。

### 四：構與試

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**得：** 容器起含正 R 版與諸可用包。`sessionInfo()` 出確期 R 版。

**敗：** 察構誌之系依誤。加缺 `-dev` 包於 `apt-get install`。

### 五：優為產

產部用多段構：

```dockerfile
# Build stage
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y libcurl4-openssl-dev libssl-dev
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# Runtime stage
FROM rocker/r-ver:4.5.0
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**得：** 多段構生小終像。行段僅含編 R 包、非構具。

**敗：** 行段包載敗→保 `COPY --from=builder` 之庫路合 R 裝包處。兩段以 `R -e ".libPaths()"` 察。

## 驗

- [ ] `docker build` 無誤畢
- [ ] 容器起 R 段行
- [ ] 諸需包可用
- [ ] `.dockerignore` 除餘檔
- [ ] 像寸合用
- [ ] 僅碼變時重構速（層快行）

## 忌

- **缺系依**：R 含編碼之包需 `-dev` 庫。察 `install.packages()` 誤訊
- **層快失效**：諸檔於裝包前複→碼每變必失快。先複鎖檔
- **大像**：`apt-get install` 後 `rm -rf /var/lib/apt/lists/*`。考多段構
- **時區問**：加 `ENV TZ=UTC` 或裝 `tzdata` 為時區覺操
- **行為 root**：產加非 root 用：`RUN useradd -m appuser && USER appuser`

## 例

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## 參

- `setup-docker-compose` - 調多容器
- `containerize-mcp-server` - MCP R 服專
- `optimize-docker-build-cache` - 進快策
- `manage-renv-dependencies` - renv.lock 入 Docker 構
