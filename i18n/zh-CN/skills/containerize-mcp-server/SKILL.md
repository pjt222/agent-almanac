---
name: containerize-mcp-server
description: >
  使用 Docker 容器化基于 R 的 MCP（Model Context Protocol）服务器。
  涵盖 mcptools 集成、端口暴露、stdio 与 HTTP 传输方式，以及将
  Claude Code 连接到容器化服务器。适用于无需本地 R 安装即可部署
  R MCP 服务器、创建可重现的 MCP 服务器环境、将 MCP 服务器与其他
  容器化服务一起运行，或向其他开发者分发 MCP 服务器。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: advanced
  language: Docker
  tags: docker, mcp, mcptools, claude, container
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 容器化 MCP 服务器

将 R MCP 服务器打包到 Docker 容器中，实现可移植部署。

## 适用场景

- 无需本地 R 安装即可部署 R MCP 服务器
- 创建可重现的 MCP 服务器环境
- 将 MCP 服务器与其他容器化服务一起运行
- 向其他开发者分发 MCP 服务器

## 输入

- **必需**：R MCP 服务器实现（基于 mcptools 或自定义）
- **必需**：已安装并运行的 Docker
- **可选**：服务器需要的额外 R 包
- **可选**：传输模式（stdio 或 HTTP）

## 步骤

### 第 1 步：为 MCP 服务器创建 Dockerfile

```dockerfile
FROM rocker/r-ver:4.5.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    libssh2-1-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c( \
    'remotes', \
    'ellmer' \
    ), repos='https://cloud.r-project.org/')"

# Install mcptools
RUN R -e "remotes::install_github('posit-dev/mcptools')"

# Set working directory
WORKDIR /workspace

# Expose MCP server ports
EXPOSE 3000 3001 3002

# Environment variables
ENV R_LIBS_USER=/workspace/renv/library
ENV RENV_PATHS_CACHE=/workspace/renv/cache

# Default: start MCP server
CMD ["R", "-e", "mcptools::mcp_server()"]
```

**预期结果：** 项目根目录存在一个 `Dockerfile`，使用 `rocker/r-ver` 基础镜像，包含系统依赖、mcptools 安装，以及 MCP 服务器作为默认命令。

**失败处理：** 验证基础镜像标签与你的 R 版本匹配。如果 `remotes::install_github` 失败，检查系统依赖层中是否包含 `git` 和 `libgit2-dev`。

### 第 2 步：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-mcp-server
    image: r-mcp-server:latest

    volumes:
      - /path/to/projects:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    network_mode: "host"

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

使用 `network_mode: "host"` 确保 MCP 服务器端口在 localhost 上可访问。

**预期结果：** 项目根目录存在 `docker-compose.yml` 文件，包含 MCP 服务器服务、项目文件和 renv 缓存的卷挂载，以及为 stdio 传输启用的 `stdin_open`/`tty`。

**失败处理：** 如果卷路径无效，将 `/path/to/projects` 调整为实际项目目录。在 Windows/WSL 上使用 `/mnt/c/...` 或 `/mnt/d/...` 路径。

### 第 3 步：构建和启动

```bash
docker compose build
docker compose up -d
```

**预期结果：** 容器以 MCP 服务器运行启动。

**失败处理：** 使用 `docker compose logs mcp-server` 检查日志。常见问题：
- 缺少 R 包：添加到 Dockerfile 的 RUN install 步骤
- 端口已被占用：更改暴露端口或停止冲突服务

### 第 4 步：将 Claude Code 连接到容器

对于 stdio 传输（容器必须保持运行且接受 stdin）：

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

对于 HTTP 传输（如果 MCP 服务器支持）：

```json
{
  "mcpServers": {
    "r-mcp-docker": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**预期结果：** Claude Code 的 MCP 配置包含 `r-mcp-docker` 服务器条目，`claude mcp list` 显示新服务器。

**失败处理：** 对于 stdio 传输，确保容器名称匹配（`r-mcp-server`）且容器正在运行，使用 `docker ps` 检查。对于 HTTP 传输，验证端口已暴露且可通过 `curl http://localhost:3000/mcp` 访问。

### 第 5 步：验证连接

```bash
# Check container is running
docker ps | grep mcp-server

# Test R session inside container
docker exec -it r-mcp-server R -e "sessionInfo()"

# Verify mcptools is available
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**预期结果：** `docker ps` 显示 `r-mcp-server` 容器正在运行，`sessionInfo()` 返回预期的 R 版本，`library(mcptools)` 加载无错误。

**失败处理：** 如果容器未运行，检查 `docker compose logs mcp-server` 获取启动错误。如果 mcptools 加载失败，重建镜像以确保包正确安装。

### 第 6 步：添加自定义 MCP 工具

要添加项目特定的 MCP 工具，挂载你的 R 脚本：

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

并在 CMD 中加载它们：

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**预期结果：** 自定义 R 脚本在容器内的 `/mcp-tools/` 路径可访问，MCP 服务器在启动时加载它们以及默认工具。

**失败处理：** 使用 `docker exec -it r-mcp-server ls /mcp-tools/` 验证卷挂载路径正确。如果脚本 source 失败，检查自定义工具中缺失的包依赖。

## 验证清单

- [ ] 容器构建无错误
- [ ] MCP 服务器在容器内启动
- [ ] Claude Code 可以连接到容器化服务器
- [ ] MCP 工具正确响应请求
- [ ] 容器重启干净
- [ ] 卷挂载允许访问项目文件

## 常见问题

- **stdin/tty 要求**：MCP stdio 传输需要 `stdin_open: true` 和 `tty: true`
- **网络隔离**：默认 Docker 网络可能阻止 localhost 访问。使用 `network_mode: "host"` 或暴露特定端口。
- **包版本**：将 mcptools 固定到特定提交以实现可重现性
- **镜像过大**：mcptools + 依赖可能很大。考虑生产环境使用多阶段构建。
- **Windows Docker 路径**：在 Windows 上使用 Docker Desktop 与 WSL 时，路径映射有所不同

## 相关技能

- `create-r-dockerfile` - R 的基础 Dockerfile 模式
- `setup-docker-compose` - compose 配置详情
- `configure-mcp-server` - 不使用 Docker 的 MCP 服务器配置
- `troubleshoot-mcp-connection` - 调试 MCP 连接问题
