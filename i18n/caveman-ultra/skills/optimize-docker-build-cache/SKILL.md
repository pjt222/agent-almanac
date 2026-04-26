---
name: optimize-docker-build-cache
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Optimize Docker build times using layer caching, multi-stage builds,
  BuildKit features, and dependency-first copy patterns. Applicable to R,
  Node.js, and Python projects. Use when Docker builds are slow due to
  repeated package installations, when rebuilds reinstall all dependencies
  on every code change, when image sizes are unnecessarily large, or when
  CI/CD pipeline builds are a bottleneck.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, cache, optimization, multi-stage, buildkit
---

# Optimize Docker Build Cache

Cut build times via layer cache + opt.

## Use When

- Builds slow → repeated pkg installs
- Rebuilds reinstall all deps on code change
- Images too big
- CI/CD bottleneck

## In

- **Required**: Existing Dockerfile to optimize
- **Optional**: Target build time
- **Optional**: Target image size reduction

## Do

### Step 1: Order layers by change freq

Least-changing first.

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

**Key**: Docker caches each layer. Layer changes → all subsequent rebuild. Deps install BEFORE source copy.

→ Layers ordered least-changing → most-changing, lockfiles before full source.

If err: still reinstalls on code change → verify `COPY . .` AFTER `RUN` deps install, not before.

### Step 2: Separate deps from code

**Bad** (rebuild pkgs every code change):

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**Good** (rebuild only on lockfile change):

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Same for Node.js:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

→ Lockfile (`renv.lock`, `package-lock.json`, `requirements.txt`) copy + install in separate layer before full `COPY . .`.

If err: lockfile copy fails → verify file exists in build context, not excluded by `.dockerignore`.

### Step 3: Multi-stage builds

Split build vs runtime.

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

→ Builder stage (dev tools) + runtime (prod only). Final image much smaller than single-stage.

If err: `COPY --from=builder` can't find libs → verify install paths match. Debug w/ `docker build --target builder .`.

### Step 4: Combine RUN commands

Each `RUN` = layer. Combine related.

**Bad** (3 layers, apt cache persists):

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**Good** (1 layer, clean cache):

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

→ Related `apt-get` / pkg installs combined into single `RUN`, each ending w/ cleanup (`rm -rf /var/lib/apt/lists/*`).

If err: combined `RUN` fails midway → split temporarily to ID failing cmd, recombine after fix.

### Step 5: .dockerignore

Block unnecessary files from build context.

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

→ `.dockerignore` in root excludes `.git`, `node_modules`, `renv/library`, build artifacts, env files. Build context noticeably smaller.

If err: needed files missing in container → check `.dockerignore` for too-broad patterns. Verbose `docker build` output to verify what's sent.

### Step 6: BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

Or `docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

W/ `COMPOSE_DOCKER_CLI_BUILD=1` + `DOCKER_BUILDKIT=1` env vars.

BuildKit gives:
- Parallel stage builds
- Better cache mgmt
- `--mount=type=cache` for persistent pkg caches

→ BuildKit active (`#1 [internal] load build definition` style output). Multi-stage parallel where possible.

If err: BuildKit inactive → verify env vars exported pre-build. Old Docker → upgrade Engine 18.09+.

### Step 7: Cache mounts for pkg mgrs

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

→ Subsequent builds reuse cached pkgs from mount → dramatic install time cut even when layer invalidated. Cache persists across builds.

If err: `--mount=type=cache` not recognized → BuildKit needed (`DOCKER_BUILDKIT=1`). Legacy builder doesn't support.

## Check

- [ ] Code-only rebuilds significantly faster
- [ ] Deps layer cached when lockfile unchanged
- [ ] `.dockerignore` excludes unnecessary
- [ ] Image size reduced
- [ ] Multi-stage (if used) splits build/runtime

## Traps

- **Copy all before install**: invalidates cache every code change
- **No `.dockerignore`**: big context → every build slow
- **Too many layers**: each `RUN`/`COPY`/`ADD` = layer. Combine logically
- **No apt cache clean**: always end w/ `&& rm -rf /var/lib/apt/lists/*`
- **Platform-specific caches**: layers platform-specific. CI runners may not benefit from local

## →

- `create-r-dockerfile` — initial Dockerfile
- `setup-docker-compose` — compose build config
- `containerize-mcp-server` — apply opts to MCP servers
