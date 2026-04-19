---
name: containerize-mcp-server
locale: wenyan-ultra
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

# 容器化 MCP 服

以 Docker 封 R MCP 服以可攜部。

## 用

- 部 R MCP 服而不須本地 R 裝
- 建可重現 MCP 服境
- 與他容器服並行 MCP 服
- 傳 MCP 服至他開發者

## 入

- **必**：R MCP 服實（mcptools 基或自）
- **必**：Docker 裝且行
- **可**：服須之附 R 包
- **可**：傳模（stdio 或 HTTP）

## 行

### 一：建 MCP 服之 Dockerfile

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

**得：** `Dockerfile` 於項根含 `rocker/r-ver` 基像、系依、mcptools 裝、MCP 服為默令。

**敗：** 驗基像 tag 合 R 版。`remotes::install_github` 敗→察 `git` 與 `libgit2-dev` 於系依層。

### 二：建 docker-compose.yml

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

用 `network_mode: "host"` 確 MCP 服埠於 localhost 可達。

**得：** `docker-compose.yml` 於項根含 MCP 服、項檔與 renv 緩之卷掛、stdio 傳啟 `stdin_open`/`tty`。

**敗：** 卷路誤→調 `/path/to/projects` 為實項目錄。Win/WSL 用 `/mnt/c/...` 或 `/mnt/d/...`。

### 三：建且啟

```bash
docker compose build
docker compose up -d
```

**得：** 容器啟含 MCP 服行。

**敗：** `docker compose logs mcp-server` 察日。常問：
- R 包缺：加於 Dockerfile 裝步
- 埠已佔：變露埠或停衝服

### 四：連 Claude Code 至容器

stdio 傳（容器須以 stdin 保行）：

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

HTTP 傳（若 MCP 服支）：

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

**得：** Claude Code MCP 配含 `r-mcp-docker` 項，`claude mcp list` 示新服。

**敗：** stdio 傳→確容器名合（`r-mcp-server`）且容器以 `docker ps` 行。HTTP 傳→驗埠已露且 `curl http://localhost:3000/mcp` 可達。

### 五：驗連

```bash
# Check container is running
docker ps | grep mcp-server

# Test R session inside container
docker exec -it r-mcp-server R -e "sessionInfo()"

# Verify mcptools is available
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**得：** `docker ps` 示 `r-mcp-server` 容器行，`sessionInfo()` 返期 R 版，`library(mcptools)` 無錯載。

**敗：** 容器未行→`docker compose logs mcp-server` 察啟錯。mcptools 載敗→重建像確包正裝。

### 六：加自 MCP 具

加項專 MCP 具→掛 R 腳：

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

於 CMD 載：

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**得：** 自 R 腳於容器內 `/mcp-tools/` 可達，MCP 服啟時載之含默具。

**敗：** `docker exec -it r-mcp-server ls /mcp-tools/` 驗卷掛路正。腳 source 敗→察自具缺依。

## 驗

- [ ] 容器無錯建
- [ ] MCP 服於容器內啟
- [ ] Claude Code 可連容器化服
- [ ] MCP 具正應求
- [ ] 容器淨重啟
- [ ] 卷掛容項檔存取

## 忌

- **stdin/tty 求**：MCP stdio 傳須 `stdin_open: true` 與 `tty: true`
- **網隔**：默 Docker 網或阻 localhost 存。用 `network_mode: "host"` 或露特埠。
- **包版**：釘 mcptools 至具體 commit 以重現
- **像大**：mcptools + 依可大。生產慮多階建。
- **Win Docker 路**：Win 上 Docker Desktop 含 WSL，路映異

## 參

- `create-r-dockerfile` - R 之基 Dockerfile 模
- `setup-docker-compose` - compose 配詳
- `configure-mcp-server` - 無 Docker 之 MCP 服配
- `troubleshoot-mcp-connection` - 除 MCP 連問
