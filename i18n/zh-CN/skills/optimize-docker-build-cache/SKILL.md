---
name: optimize-docker-build-cache
description: >
  使用层缓存、多阶段构建、BuildKit 功能和依赖优先复制模式优化 Docker
  构建时间。适用于 R、Node.js 和 Python 项目。适用于 Docker 构建因重复
  包安装而缓慢、每次代码更改都重新安装所有依赖、镜像大小不必要地过大，
  或 CI/CD 流水线构建成为瓶颈时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, cache, optimization, multi-stage, buildkit
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 优化 Docker 构建缓存

通过有效的层缓存和构建优化减少 Docker 构建时间。

## 适用场景

- Docker 构建因重复包安装而缓慢
- 每次代码更改都重新安装所有依赖
- 镜像大小不必要地过大
- CI/CD 流水线构建成为瓶颈

## 输入

- **必需**：要优化的现有 Dockerfile
- **可选**：目标构建时间改善
- **可选**：目标镜像大小缩减

## 步骤

### 第 1 步：按变更频率排列层

将最少变更的层放在最前面：

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

**核心原则**：Docker 缓存每一层。当某一层发生变更时，所有后续层都会被重建。依赖安装应在源代码复制之前。

**预期结果：** Dockerfile 各层从最少变更（基础镜像、系统依赖）到最频繁变更（源代码）排列，依赖 lockfile 在完整源代码之前被复制。

**失败处理：** 如果构建仍然在每次代码更改时重新安装依赖，验证 `COPY . .` 在依赖安装的 `RUN` 命令之后，而非之前。

### 第 2 步：将依赖安装与代码分离

**错误做法**（每次代码更改都重建包）：

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**正确做法**（仅在 lockfile 更改时重建包）：

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Node.js 的相同模式：

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**预期结果：** 依赖 lockfile（`renv.lock`、`package-lock.json`、`requirements.txt`）在完整源代码 `COPY . .` 之前的单独层中被复制和安装。

**失败处理：** 如果 lockfile 复制失败，确保文件存在于构建上下文中且未被 `.dockerignore` 排除。

### 第 3 步：使用多阶段构建

将构建依赖与运行时分离：

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

**预期结果：** Dockerfile 有一个包含开发工具的构建阶段和一个仅包含生产依赖的运行时阶段。最终镜像明显小于单阶段构建。

**失败处理：** 如果 `COPY --from=builder` 找不到库，验证两个阶段之间的安装路径匹配。使用 `docker build --target builder .` 独立调试构建阶段。

### 第 4 步：合并 RUN 命令

每个 `RUN` 创建一个层。合并相关命令：

**错误做法**（3 层，apt 缓存持续存在）：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**正确做法**（1 层，清理缓存）：

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**预期结果：** 相关的 `apt-get` 或包安装命令合并为单个 `RUN` 指令，每个以缓存清理结束（`rm -rf /var/lib/apt/lists/*`）。

**失败处理：** 如果合并的 `RUN` 命令中途失败，临时拆分以定位失败的命令，修复后重新合并。

### 第 5 步：使用 .dockerignore

防止不必要的文件进入构建上下文：

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

**预期结果：** 项目根目录存在 `.dockerignore` 文件，排除 `.git`、`node_modules`、`renv/library`、构建产物和环境文件。构建上下文大小明显减小。

**失败处理：** 如果容器中缺少所需文件，检查 `.dockerignore` 是否有过于宽泛的模式。使用 `docker build` 详细输出验证哪些文件被发送到守护进程。

### 第 6 步：启用 BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

或在 `docker-compose.yml` 中：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

配合 `COMPOSE_DOCKER_CLI_BUILD=1` 和 `DOCKER_BUILDKIT=1` 环境变量。

BuildKit 启用了：
- 并行阶段构建
- 更好的缓存管理
- 用于持久化包缓存的 `--mount=type=cache`

**预期结果：** 构建使用 BuildKit 运行（通过 `#1 [internal] load build definition` 样式的输出识别）。多阶段构建在可能的情况下并行执行各阶段。

**失败处理：** 如果 BuildKit 未激活，验证环境变量在构建命令之前已导出。在较旧的 Docker 版本上，将 Docker Engine 升级到 18.09+ 以获得 BuildKit 支持。

### 第 7 步：使用包管理器的缓存挂载

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**预期结果：** 后续构建重用挂载中缓存的包，即使层失效也能大幅减少安装时间。缓存在多次构建间持久化。

**失败处理：** 如果 `--mount=type=cache` 未被识别，确保 BuildKit 已启用（`DOCKER_BUILDKIT=1`）。该语法需要 BuildKit，传统构建器不支持。

## 验证清单

- [ ] 仅代码更改后的重建明显更快
- [ ] lockfile 未更改时依赖安装层被缓存
- [ ] `.dockerignore` 排除了不必要的文件
- [ ] 与未优化构建相比镜像大小减小
- [ ] 多阶段构建（如使用）分离了构建和运行时依赖

## 常见问题

- **在安装依赖前复制所有文件**：每次代码更改都使依赖缓存失效
- **忘记 `.dockerignore`**：大构建上下文拖慢每次构建
- **层太多**：每个 `RUN`、`COPY`、`ADD` 创建一个层。在逻辑上合并。
- **未清理 apt 缓存**：始终在 apt-get install 末尾加上 `&& rm -rf /var/lib/apt/lists/*`
- **平台特定缓存**：缓存层是平台特定的。CI 运行器可能无法受益于本地缓存。

## 相关技能

- `create-r-dockerfile` - 初始 Dockerfile 创建
- `setup-docker-compose` - compose 构建配置
- `containerize-mcp-server` - 将优化应用于 MCP 服务器构建
