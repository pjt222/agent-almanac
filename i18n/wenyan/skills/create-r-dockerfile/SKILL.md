---
name: create-r-dockerfile
locale: wenyan
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

# 建 R Dockerfile

為 R 項目以 rocker 基像建 Dockerfile，含正依管。

## 用時

- 將 R 應用或析入容器
- 建可重現之 R 境
- 布 R 服（Shiny、Plumber、MCP 服）
- 建一致之開發境

## 入

- **必要**：有依之 R 項目（DESCRIPTION 或 renv.lock）
- **必要**：志（開發、產、服）
- **可選**：R 版（默最新穩）
- **可選**：所需他系庫

## 法

### 第一步：擇基像

| 用案 | 基像 | 尺 |
|----------|-----------|------|
| 最小 R 運 | `rocker/r-ver:4.5.0` | ~800MB |
| 含 tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| 含 RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny 服 | `rocker/shiny-verse:4.5.0` | ~2GB |

**得：** 擇合項需之基像而無贅。

**敗則：** 若疑用何像，始於 `rocker/r-ver`（最小），需時加包。全像目參 [rocker-org](https://github.com/rocker-org/rocker-versioned2)。

### 第二步：書 Dockerfile

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

**得：** Dockerfile 以 `docker build -t myproject .` 成建。

**敗則：** 若 `apt-get install` 建時敗，察目標發行（Debian）之包名。若 `renv::restore()` 敗，確 `renv.lock` 與 `renv/activate.R` 於 restore 前已複。

### 第三步：建 .dockerignore

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

**得：** `.dockerignore` 排 Git 史、IDE 文件、本 renv 庫、建物於 Docker 脈之外。

**敗則：** 若 Docker 仍複不欲之文件，驗 `.dockerignore` 與 Dockerfile 同目錄，用正 glob 式。

### 第四步：建而試

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**得：** 容器起，R 版正而諸包可用。`sessionInfo()` 驗期 R 版。

**敗則：** 察建誌之系依訛。加缺 `-dev` 包於 `apt-get install` 層。

### 第五步：為產優化

產布宜用多階建：

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

**得：** 多階建生更小之終像。運階唯含編譯之 R 包，無建具。

**敗則：** 若包於運階加載敗，確 `COPY --from=builder` 之庫路合 R 所裝處。於二階以 `R -e ".libPaths()"` 察。

## 驗

- [ ] `docker build` 無訛而畢
- [ ] 容器起而 R 會話行
- [ ] 諸需包可得
- [ ] `.dockerignore` 排無謂之文件
- [ ] 像尺合用案
- [ ] 唯碼變時重建速（層緩行）

## 陷

- **缺系依**：有編譯碼之 R 包需 `-dev` 庫。察 `install.packages()` 之誤
- **層緩失效**：裝包前複諸文件則每變碼而失緩。宜先複 lockfile。
- **大像**：`apt-get install` 後用 `rm -rf /var/lib/apt/lists/*`。考多階建。
- **時區問**：加 `ENV TZ=UTC` 或裝 `tzdata` 以時區感操作
- **根運**：產境加非根用者：`RUN useradd -m appuser && USER appuser`

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

- `setup-docker-compose` — 協多容器
- `containerize-mcp-server` — MCP R 服之特例
- `optimize-docker-build-cache` — 進階緩策
- `manage-renv-dependencies` — renv.lock 饋入 Docker 建
