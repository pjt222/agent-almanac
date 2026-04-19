---
name: containerize-mcp-server
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Containerize an R-based MCP (Model Context Protocol) server using Docker.
  Covers mcptools integration, port exposure, stdio vs HTTP transport,
  and connecting Claude Code to the containerized server. Use when deploying
  an R MCP server without requiring a local R installation, creating a
  reproducible MCP server environment, running MCP servers alongside other
  containerized services, or distributing an MCP server to other developers.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: advanced
  language: Docker
  tags: docker, mcp, mcptools, claude, container
---

# 容 MCP 伺

以 Docker 包 R MCP 伺為可移部。

## 用時

- 部 R MCP 伺而無本 R 裝
- 建可復之 MCP 伺境
- 與他容服並行 MCP 伺
- 分 MCP 伺於他開者

## 入

- **必**：R MCP 伺之實（mcptools 基或自）
- **必**：Docker 已裝行
- **可選**：伺所需他 R 包
- **可選**：傳之模（stdio 或 HTTP）

## 法

### 第一步：建 Dockerfile 為 MCP 伺

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

**得：** 項目根有 `Dockerfile` 附 `rocker/r-ver` 基像、系依、mcptools 裝、MCP 伺為默令。

**敗則：** 驗基像合汝 R 版。若 `remotes::install_github` 敗，察 `git` 與 `libgit2-dev` 於系依層。

### 第二步：建 docker-compose.yml

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

用 `network_mode: "host"` 保 MCP 伺埠於 localhost 可訪。

**得：** 項目根有 `docker-compose.yml` 附 MCP 伺服、項目檔與 renv 緩之卷掛、`stdin_open`/`tty` 啟為 stdio 傳。

**敗則：** 若卷徑誤，改 `/path/to/projects` 為實項徑。Windows/WSL 則用 `/mnt/c/...` 或 `/mnt/d/...` 徑。

### 第三步：建而啟

```bash
docker compose build
docker compose up -d
```

**得：** 容啟附 MCP 伺行。

**敗則：** 以 `docker compose logs mcp-server` 察誌。常問：
- 缺 R 包：加於 Dockerfile RUN 裝步
- 埠已用：改露埠或止衝服

### 第四步：連 Claude Code 於容

stdio 傳（容須附 stdin 續行）：

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

HTTP 傳（若 MCP 伺支）：

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

**得：** Claude Code 之 MCP 設含 `r-mcp-docker` 條，`claude mcp list` 示新伺。

**敗則：** stdio 傳則確容名合（`r-mcp-server`）且以 `docker ps` 察容行。HTTP 傳則驗埠露且可達以 `curl http://localhost:3000/mcp`。

### 第五步：驗連

```bash
# Check container is running
docker ps | grep mcp-server

# Test R session inside container
docker exec -it r-mcp-server R -e "sessionInfo()"

# Verify mcptools is available
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**得：** `docker ps` 示 `r-mcp-server` 容行，`sessionInfo()` 返期 R 版，`library(mcptools)` 載無誤。

**敗則：** 若容不行，察 `docker compose logs mcp-server` 啟誤。若 mcptools 載敗，重建像保包正裝。

### 第六步：加自定 MCP 具

加項特 MCP 具，掛 R 腳：

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

於 CMD 中載：

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**得：** 自 R 腳於容內 `/mcp-tools/` 可訪，MCP 伺啟時載之與默具並。

**敗則：** 驗卷掛徑以 `docker exec -it r-mcp-server ls /mcp-tools/`。若腳 source 敗，察自具之缺依。

## 驗

- [ ] 容建無誤
- [ ] 容內 MCP 伺啟
- [ ] Claude Code 可連於容伺
- [ ] MCP 具應請
- [ ] 容清重啟
- [ ] 卷掛許訪項檔

## 陷

- **stdin/tty 之需**：MCP stdio 傳需 `stdin_open: true` 與 `tty: true`
- **網隔**：默 Docker 網或阻 localhost 訪。用 `network_mode: "host"` 或露特埠。
- **包版**：固 mcptools 於特提交為可復
- **像大**：mcptools 附依可大。產考多階建。
- **Windows Docker 徑**：於 Windows 附 WSL 行 Docker Desktop 時徑映異

## 參

- `create-r-dockerfile` - R 之基 Dockerfile 式
- `setup-docker-compose` - compose 設詳
- `configure-mcp-server` - 無 Docker 之 MCP 伺設
- `troubleshoot-mcp-connection` - 察 MCP 連之問
