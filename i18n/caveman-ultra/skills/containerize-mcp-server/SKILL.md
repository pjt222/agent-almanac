---
name: containerize-mcp-server
locale: caveman-ultra
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

# Containerize MCP Server

Package R MCP server into Docker container → portable deployment.

## Use When

- Deploying R MCP server w/o local R install req'd
- Creating reproducible MCP server env
- Running MCP servers alongside other containerized services
- Distributing MCP server to other devs

## In

- **Required**: R MCP server impl (mcptools-based or custom)
- **Required**: Docker installed + running
- **Optional**: Additional R pkgs server needs
- **Optional**: Transport mode (stdio or HTTP)

## Do

### Step 1: Create Dockerfile for MCP Server

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

**→** `Dockerfile` exists in project root w/ `rocker/r-ver` base image, sys deps, mcptools install, MCP server as default cmd.

**If err:** Valid. base image tag matches R ver. `remotes::install_github` fails → check `git` + `libgit2-dev` in sys deps layer.

### Step 2: Create docker-compose.yml

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

Using `network_mode: "host"` ensures MCP server ports accessible on localhost.

**→** `docker-compose.yml` in project root w/ MCP server service, vol mounts for project files + renv cache, `stdin_open`/`tty` enabled for stdio transport.

**If err:** Vol paths invalid → adjust `/path/to/projects` to actual project dir. Windows/WSL → use `/mnt/c/...` or `/mnt/d/...` paths.

### Step 3: Build + Start

```bash
docker compose build
docker compose up -d
```

**→** Container starts w/ MCP server running.

**If err:** Check logs w/ `docker compose logs mcp-server`. Common issues:
- Missing R pkgs: Add to Dockerfile RUN install step
- Port already in use: Change exposed port or stop conflicting service

### Step 4: Connect Claude Code to Container

Stdio transport (container must stay running w/ stdin):

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

HTTP transport (if MCP server supports):

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

**→** Claude Code's MCP config includes `r-mcp-docker` server entry, `claude mcp list` shows new server.

**If err:** Stdio transport → ensure container name matches (`r-mcp-server`) + container running w/ `docker ps`. HTTP transport → valid. port exposed + reachable w/ `curl http://localhost:3000/mcp`.

### Step 5: Verify Connection

```bash
# Check container is running
docker ps | grep mcp-server

# Test R session inside container
docker exec -it r-mcp-server R -e "sessionInfo()"

# Verify mcptools is available
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**→** `docker ps` shows `r-mcp-server` container running, `sessionInfo()` returns expected R ver, `library(mcptools)` loads w/o err.

**If err:** Container not running → check `docker compose logs mcp-server` for startup errs. mcptools fails to load → rebuild image to ensure pkg installed correct.

### Step 6: Add Custom MCP Tools

Add project-specific MCP tools → mount R scripts:

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

Load in CMD:

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**→** Custom R scripts accessible inside container at `/mcp-tools/`, MCP server loads them on startup alongside default tools.

**If err:** Valid. vol mount path correct w/ `docker exec -it r-mcp-server ls /mcp-tools/`. Scripts fail to source → check missing pkg deps in custom tools.

## Check

- [ ] Container builds w/o errs
- [ ] MCP server starts inside container
- [ ] Claude Code can connect to containerized server
- [ ] MCP tools respond correct to reqs
- [ ] Container restarts clean
- [ ] Vol mounts allow access to project files

## Traps

- **stdin/tty req's**: MCP stdio transport requires `stdin_open: true` + `tty: true`
- **Network isolation**: Default Docker networking may prevent localhost access. Use `network_mode: "host"` or expose specific ports.
- **Pkg vers**: Pin mcptools to specific commit for reproducibility
- **Large image size**: mcptools + deps can be large. Consider multi-stage builds for prod.
- **Windows Docker paths**: Running Docker Desktop on Windows w/ WSL → path mapping differs

## →

- `create-r-dockerfile` - base Dockerfile patterns for R
- `setup-docker-compose` - compose config details
- `configure-mcp-server` - MCP server config w/o Docker
- `troubleshoot-mcp-connection` - debugging MCP connectivity issues
