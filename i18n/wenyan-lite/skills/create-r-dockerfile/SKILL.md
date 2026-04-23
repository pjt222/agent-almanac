---
name: create-r-dockerfile
locale: wenyan-lite
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

# 造 R 之 Dockerfile

以 rocker 基礎映像建 R 項目之 Dockerfile，含當之依賴管理。

## 適用時機

- 容器化 R 應用或分析
- 造可重現之 R 環境
- 部署 R 基礎之服務（Shiny、Plumber、MCP 伺服器）
- 立一致之開發環境

## 輸入

- **必要**：含依賴之 R 項目（DESCRIPTION 或 renv.lock）
- **必要**：目的（開發、生產、或服務）
- **選擇性**：R 版本（預設：最新穩定）
- **選擇性**：所需之他系統庫

## 步驟

### 步驟一：擇基礎映像

| 用例 | 基礎映像 | 大小 |
|----------|-----------|------|
| 最小 R 執行 | `rocker/r-ver:4.5.0` | ~800MB |
| 含 tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| 含 RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny 伺服 | `rocker/shiny-verse:4.5.0` | ~2GB |

**預期：** 擇一合項目需、無不必要膨脹之基礎映像。

**失敗時：** 疑用何映像，始於 `rocker/r-ver`（最小），按需加套件。全映像目錄見 [rocker-org](https://github.com/rocker-org/rocker-versioned2)。

### 步驟二：寫 Dockerfile

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

**預期：** Dockerfile 成建：`docker build -t myproject .`

**失敗時：** 若於 `apt-get install` 時敗，察目標發行版（Debian）之套件名。若 `renv::restore()` 敗，確保 `renv.lock` 與 `renv/activate.R` 於恢復步前已複。

### 步驟三：造 .dockerignore

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

**預期：** `.dockerignore` 排 Git 歷史、IDE 檔、本地 renv 庫、建構構件於 Docker 脈絡外。

**失敗時：** 若 Docker 建構仍複不欲檔，驗 `.dockerignore` 與 Dockerfile 同目錄且用正確 glob 模式。

### 步驟四：建並測

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**預期：** 容器啟，R 版本正確，所有套件可得。`sessionInfo()` 輸出證所期 R 版本。

**失敗時：** 察建構日誌之系統依賴誤。於 `apt-get install` 層加缺之 `-dev` 套件。

### 步驟五：為生產優化

生產部署用多階段建構：

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

**預期：** 多階段建構產較小之終映像。執行階段僅含編譯之 R 套件，無建構工具。

**失敗時：** 若套件於執行階段載敗，確保 `COPY --from=builder` 之庫路合 R 裝套件之處。於兩階段以 `R -e ".libPaths()"` 察之。

## 驗證

- [ ] `docker build` 完而無誤
- [ ] 容器啟且 R 會話行
- [ ] 所有所需套件可得
- [ ] `.dockerignore` 排非必要檔
- [ ] 映像大小合用例
- [ ] 程式改時重建快（層快取有效）

## 常見陷阱

- **缺系統依賴**：含編譯程式之 R 套件需 `-dev` 庫。察 `install.packages()` 時之誤訊
- **層快取失效**：於裝套件前複所有檔令每改程式皆失快取。先複鎖檔
- **大映像**：於 `apt-get install` 後用 `rm -rf /var/lib/apt/lists/*`。考慮多階段建構
- **時區問題**：加 `ENV TZ=UTC` 或裝 `tzdata` 以行時區感知之操作
- **以 root 執**：生產加非 root 用戶：`RUN useradd -m appuser && USER appuser`

## 範例

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## 相關技能

- `setup-docker-compose` - 編排多容器
- `containerize-mcp-server` - MCP R 伺服之特別案例
- `optimize-docker-build-cache` - 進階快取策略
- `manage-renv-dependencies` - renv.lock 餵入 Docker 建構
