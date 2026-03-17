---
name: create-r-dockerfile
description: >
  为 R 项目创建基于 rocker 基础镜像的 Dockerfile。涵盖系统依赖安装、
  R 包安装、renv 集成以及优化的层排序以实现快速重建。适用于容器化 R
  应用程序或分析、创建可重现的 R 环境、部署基于 R 的服务（Shiny、
  Plumber、MCP 服务器），或在多台机器间建立一致的开发环境。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, r, rocker, container, reproducibility
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 创建 R Dockerfile

使用 rocker 基础镜像为 R 项目构建 Dockerfile，实现规范的依赖管理。

## 适用场景

- 容器化 R 应用程序或分析
- 创建可重现的 R 环境
- 部署基于 R 的服务（Shiny、Plumber、MCP 服务器）
- 建立一致的开发环境

## 输入

- **必需**：带有依赖的 R 项目（DESCRIPTION 或 renv.lock）
- **必需**：用途（开发、生产或服务）
- **可选**：R 版本（默认：最新稳定版）
- **可选**：所需的额外系统库

## 步骤

### 第 1 步：选择基础镜像

| 用途 | 基础镜像 | 大小 |
|------|----------|------|
| 最小 R 运行时 | `rocker/r-ver:4.5.0` | ~800MB |
| 包含 tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| 包含 RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny 服务器 | `rocker/shiny-verse:4.5.0` | ~2GB |

**预期结果：** 选择了与项目需求匹配且无不必要膨胀的基础镜像。

**失败处理：** 如果不确定使用哪个镜像，从 `rocker/r-ver`（最小化）开始，按需添加包。请查看 [rocker-org](https://github.com/rocker-org/rocker-versioned2) 获取完整的镜像目录。

### 第 2 步：编写 Dockerfile

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

**预期结果：** Dockerfile 使用 `docker build -t myproject .` 成功构建。

**失败处理：** 如果在 `apt-get install` 期间构建失败，请检查目标发行版（Debian）的包名称。如果 `renv::restore()` 失败，请确保 `renv.lock` 和 `renv/activate.R` 在 restore 步骤之前被复制。

### 第 3 步：创建 .dockerignore

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

**预期结果：** `.dockerignore` 从 Docker 上下文中排除了 Git 历史、IDE 文件、本地 renv 库和构建产物。

**失败处理：** 如果 Docker 构建仍然复制了不需要的文件，请验证 `.dockerignore` 与 Dockerfile 位于同一目录，并使用了正确的 glob 模式。

### 第 4 步：构建和测试

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**预期结果：** 容器以正确的 R 版本启动，所有包可用。`sessionInfo()` 输出确认预期的 R 版本。

**失败处理：** 检查构建日志中的系统依赖错误。向 `apt-get install` 层添加缺失的 `-dev` 包。

### 第 5 步：为生产优化

对于生产部署，使用多阶段构建：

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

**预期结果：** 多阶段构建生成更小的最终镜像。运行时阶段仅包含已编译的 R 包，不包含构建工具。

**失败处理：** 如果包在运行时阶段无法加载，请确保 `COPY --from=builder` 中的库路径与 R 安装包的位置匹配。在两个阶段中使用 `R -e ".libPaths()"` 检查。

## 验证清单

- [ ] `docker build` 无错误完成
- [ ] 容器启动且 R 会话正常工作
- [ ] 所有必需的包可用
- [ ] `.dockerignore` 排除了不必要的文件
- [ ] 镜像大小对于用例来说是合理的
- [ ] 仅代码更改时重建速度快（层缓存有效）

## 常见问题

- **缺少系统依赖**：含编译代码的 R 包需要 `-dev` 库。检查 `install.packages()` 期间的错误消息
- **层缓存失效**：在安装包之前复制所有文件会导致每次代码更改都使缓存失效。先复制 lockfile。
- **镜像过大**：在 `apt-get install` 后使用 `rm -rf /var/lib/apt/lists/*`。考虑多阶段构建。
- **时区问题**：添加 `ENV TZ=UTC` 或安装 `tzdata` 以支持时区感知操作
- **以 root 运行**：为生产环境添加非 root 用户：`RUN useradd -m appuser && USER appuser`

## 示例

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## 相关技能

- `setup-docker-compose` - 编排多个容器
- `containerize-mcp-server` - MCP R 服务器的特殊场景
- `optimize-docker-build-cache` - 高级缓存策略
- `manage-renv-dependencies` - renv.lock 作为 Docker 构建的输入
