---
name: containerize-mcp-server
locale: wenyan-lite
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

# 容器化 MCP 伺服器

將 R MCP 伺服器包入 Docker 容器以便可攜部署。

## 適用時機

- 部署 R MCP 伺服器而無需本地 R 裝
- 建可重現之 MCP 伺服器環境
- 令 MCP 伺服器與他容器化服務並行
- 分發 MCP 伺服器予他開發者

## 輸入

- **必要**：R MCP 伺服器實作（以 mcptools 或自訂）
- **必要**：Docker 已裝且運行
- **選擇性**：伺服器需之額外 R 包
- **選擇性**：傳輸模式（stdio 或 HTTP）

## 步驟

### 步驟一：建 MCP 伺服器之 Dockerfile

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

**預期：** 項目根有 `Dockerfile` 含 `rocker/r-ver` 基底鏡、系統依賴、mcptools 之裝、MCP 伺服器為預命令。

**失敗時：** 驗基底鏡標合你之 R 版本。若 `remotes::install_github` 敗，查 `git` 與 `libgit2-dev` 於系統依賴層中。

### 步驟二：建 docker-compose.yml

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

用 `network_mode: "host"` 確 MCP 伺服器 port 於 localhost 可達。

**預期：** 項目根有 `docker-compose.yml` 含 MCP 伺服器服務、項目檔與 renv 快取之 volume 掛、為 stdio 傳輸而啟之 `stdin_open`/`tty`。

**失敗時：** 若 volume 路徑無效，將 `/path/to/projects` 調為實項目目錄。Windows/WSL 用 `/mnt/c/...` 或 `/mnt/d/...` 路徑。

### 步驟三：建並啟

```bash
docker compose build
docker compose up -d
```

**預期：** 容器啟含 MCP 伺服器運行。

**失敗時：** 以 `docker compose logs mcp-server` 查日誌。常見：
- 缺 R 包：加至 Dockerfile RUN install 步
- Port 已用：換 port 或止衝突之服務

### 步驟四：將 Claude Code 連至容器

stdio 傳輸（容器須保運行含 stdin）：

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

HTTP 傳輸（若 MCP 伺服器支）：

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

**預期：** Claude Code 之 MCP 配置含 `r-mcp-docker` 伺服器項，`claude mcp list` 顯新伺服器。

**失敗時：** stdio 則確容器名合（`r-mcp-server`）且容器以 `docker ps` 顯運行。HTTP 則驗 port 暴且以 `curl http://localhost:3000/mcp` 可達。

### 步驟五：驗連接

```bash
# Check container is running
docker ps | grep mcp-server

# Test R session inside container
docker exec -it r-mcp-server R -e "sessionInfo()"

# Verify mcptools is available
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**預期：** `docker ps` 顯 `r-mcp-server` 容器運行，`sessionInfo()` 返預期 R 版本，`library(mcptools)` 無誤載入。

**失敗時：** 若容器不運，以 `docker compose logs mcp-server` 查啟動錯。若 mcptools 載失，重建鏡以確包正確裝。

### 步驟六：加自訂 MCP 工具

加項目特定 MCP 工具，掛 R 腳本：

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

並於 CMD 中載：

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**預期：** 自訂 R 腳本於容器內 `/mcp-tools/` 可達，MCP 伺服器啟時連預設工具載之。

**失敗時：** 以 `docker exec -it r-mcp-server ls /mcp-tools/` 驗 volume 掛路徑正確。若腳本 source 敗，查自訂工具中缺之包依賴。

## 驗證

- [ ] 容器建而無誤
- [ ] MCP 伺服器於容器內啟
- [ ] Claude Code 可連至容器化伺服器
- [ ] MCP 工具正確回應請求
- [ ] 容器淨重啟
- [ ] Volume 掛允存取項目檔

## 常見陷阱

- **stdin/tty 要**：MCP stdio 傳輸需 `stdin_open: true` 與 `tty: true`
- **網路隔離**：預 Docker 網路或防 localhost 存取。用 `network_mode: "host"` 或暴指定 port
- **包版本**：釘 mcptools 於特定提交以求可重現
- **大鏡**：mcptools + 依賴可甚大。生產慮多階段建
- **Windows Docker 路徑**：Windows + WSL 下行 Docker Desktop 時路徑映射異

## 相關技能

- `create-r-dockerfile` - R 之基底 Dockerfile 模式
- `setup-docker-compose` - compose 配置細節
- `configure-mcp-server` - 無 Docker 之 MCP 伺服器配置
- `troubleshoot-mcp-connection` - 診 MCP 連通問題
