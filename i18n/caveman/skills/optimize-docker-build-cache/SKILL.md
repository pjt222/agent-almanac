---
name: optimize-docker-build-cache
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Optimize Docker build times using layer caching, multi-stage builds,
  BuildKit features, dependency-first copy patterns. Applicable to R,
  Node.js, Python projects. Use when Docker builds slow due to repeated
  package installations, when rebuilds reinstall all deps on every code
  change, when image sizes unnecessarily large, or when CI/CD pipeline
  builds are bottleneck.
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

Cut Docker build times through effective layer caching and build optimization.

## When Use

- Docker builds slow due to repeated package installations
- Rebuilds reinstall all deps on every code change
- Image sizes unnecessarily large
- CI/CD pipeline builds are bottleneck

## Inputs

- **Required**: Existing Dockerfile to optimize
- **Optional**: Target build time improvement
- **Optional**: Target image size reduction

## Steps

### Step 1: Order Layers by Change Frequency

Place least-changing layers first:

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

**Key principle**: Docker caches each layer. When layer changes, all subsequent layers rebuilt. Dependency installation should come before source code copy.

**Got:** Dockerfile layers ordered from least-changing (base image, system deps) to most-changing (source code), with dependency lockfiles copied before full source.

**If fail:** Builds still reinstall deps on every code change? Verify `COPY . .` comes after dependency installation `RUN` command, not before.

### Step 2: Separate Dependency Installation from Code

**Bad** (rebuilds packages on every code change):

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**Good** (only rebuilds packages when lockfile changes):

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Same pattern for Node.js:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**Got:** Dependency lockfile (`renv.lock`, `package-lock.json`, `requirements.txt`) copied and installed in separate layer before full source `COPY . .`.

**If fail:** Lockfile copy fails? Ensure file exists in build context, not excluded by `.dockerignore`.

### Step 3: Use Multi-Stage Builds

Separate build dependencies from runtime:

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

**Got:** Dockerfile has builder stage with dev tools and runtime stage with only production deps. Final image significantly smaller than single-stage build.

**If fail:** `COPY --from=builder` fails to find libraries? Verify install path matches between stages. Use `docker build --target builder .` to debug build stage independently.

### Step 4: Combine RUN Commands

Each `RUN` creates layer. Combine related commands:

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

**Got:** Related `apt-get` or package install commands combined into single `RUN` instructions, each ending with cache cleanup (`rm -rf /var/lib/apt/lists/*`).

**If fail:** Combined `RUN` fails midway? Temporarily split to identify failing command, recombine after fixing.

### Step 5: Use .dockerignore

Prevent unnecessary files from entering build context:

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

**Got:** `.dockerignore` exists in project root excluding `.git`, `node_modules`, `renv/library`, build artifacts, environment files. Build context size noticeably smaller.

**If fail:** Needed files missing in container? Check `.dockerignore` for overly broad patterns. Use `docker build` verbose output to verify which files sent to daemon.

### Step 6: Enable BuildKit

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

Or in `docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

With `COMPOSE_DOCKER_CLI_BUILD=1` and `DOCKER_BUILDKIT=1` environment variables.

BuildKit enables:
- Parallel stage builds
- Better cache management
- `--mount=type=cache` for persistent package caches

**Got:** Builds run with BuildKit enabled (indicated by `#1 [internal] load build definition` style output). Multi-stage builds execute stages in parallel where possible.

**If fail:** BuildKit not active? Verify env vars exported before build command. On older Docker versions, upgrade Docker Engine to 18.09+ for BuildKit support.

### Step 7: Use Cache Mounts for Package Managers

```dockerfile
# R packages with persistent cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm with persistent cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**Got:** Subsequent builds reuse cached packages from mount, dramatically reducing install times even when layer invalidated. Cache persists across builds.

**If fail:** `--mount=type=cache` not recognized? Ensure BuildKit enabled (`DOCKER_BUILDKIT=1`). Syntax requires BuildKit, not supported by legacy builder.

## Checks

- [ ] Rebuilds after code-only changes significantly faster
- [ ] Dependency installation layer cached when lockfile unchanged
- [ ] `.dockerignore` excludes unnecessary files
- [ ] Image size reduced compared to unoptimized build
- [ ] Multi-stage build (if used) separates build and runtime deps

## Pitfalls

- **Copying all files before installing deps**: Invalidates dependency cache on every code change
- **Forgetting `.dockerignore`**: Large build contexts slow every build
- **Too many layers**: Each `RUN`, `COPY`, `ADD` creates layer. Combine where logical.
- **Not cleaning apt cache**: Always end apt-get installs with `&& rm -rf /var/lib/apt/lists/*`
- **Platform-specific caches**: Cache layers platform-specific. CI runners may not benefit from local caches.

## See Also

- `create-r-dockerfile` - initial Dockerfile creation
- `setup-docker-compose` - compose build configuration
- `containerize-mcp-server` - apply optimizations to MCP server builds
