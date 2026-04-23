---
name: create-r-dockerfile
locale: caveman-ultra
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

# Create R Dockerfile

Dockerfile for R using rocker + dep mgmt.

## Use When

- Containerize R app / analysis
- Repro R env
- Deploy R svcs (Shiny, Plumber, MCP)
- Consistent dev env

## In

- **Required**: R proj + deps (DESCRIPTION / renv.lock)
- **Required**: Purpose (dev/prod/svc)
- **Optional**: R ver (def: latest stable)
- **Optional**: Extra sys libs

## Do

### Step 1: Base Img

| Use | Base | Size |
|----------|-----------|------|
| Min R | `rocker/r-ver:4.5.0` | ~800MB |
| Tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| RStudio Svr | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny | `rocker/shiny-verse:4.5.0` | ~2GB |

**Got:** Base matches reqs, no bloat.

**If err:** Unsure → `rocker/r-ver` (min) + add pkgs. See [rocker-org](https://github.com/rocker-org/rocker-versioned2) catalog.

### Step 2: Dockerfile

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

**Got:** `docker build -t myproject .` builds OK.

**If err:** `apt-get install` fail → check pkg names (Debian). `renv::restore()` fail → ensure `renv.lock` + `renv/activate.R` copied before restore.

### Step 3: .dockerignore

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

**Got:** `.dockerignore` excludes git, IDE, local renv lib, artifacts.

**If err:** Build still copies unwanted → verify `.dockerignore` in same dir as Dockerfile, correct glob.

### Step 4: Build + Test

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**Got:** Container starts, R ver correct, pkgs avail. `sessionInfo()` confirms.

**If err:** Check build logs for sys dep err. Add missing `-dev` pkgs.

### Step 5: Prod Optimize

Multi-stage:

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

**Got:** Multi-stage → smaller final img. Runtime = compiled R pkgs only.

**If err:** Pkgs fail load in runtime → lib path in `COPY --from=builder` must match R install path. Check: `R -e ".libPaths()"` in both.

## Check

- [ ] `docker build` no err
- [ ] Container starts, R works
- [ ] All req pkgs avail
- [ ] `.dockerignore` excludes junk
- [ ] Img size reasonable
- [ ] Fast rebuild on code-only change (cache works)

## Traps

- **Missing sys deps**: Compiled R pkgs need `-dev` libs. Check `install.packages()` err msgs
- **Cache invalidation**: Copy all files pre-install → cache invalidated on code change. Copy lockfile first.
- **Large imgs**: `rm -rf /var/lib/apt/lists/*` after `apt-get install`. Multi-stage.
- **Timezone**: `ENV TZ=UTC` / install `tzdata` for TZ-aware ops
- **Root user**: Add non-root prod: `RUN useradd -m appuser && USER appuser`

## Examples

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## →

- `setup-docker-compose` — orchestrate multi containers
- `containerize-mcp-server` — MCP R svrs
- `optimize-docker-build-cache` — cache strategies
- `manage-renv-dependencies` — renv.lock → Docker
