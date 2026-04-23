---
name: create-r-dockerfile
locale: caveman
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

Build Dockerfile for R projects using rocker base images. Proper dependency management.

## When Use

- Containerizing R application or analysis
- Making reproducible R environments
- Deploying R-based services (Shiny, Plumber, MCP server)
- Setting up consistent dev environments

## Inputs

- **Required**: R project with dependencies (DESCRIPTION or renv.lock)
- **Required**: Purpose (development, production, or service)
- **Optional**: R version (default: latest stable)
- **Optional**: Extra system libraries needed

## Steps

### Step 1: Choose Base Image

| Use Case | Base Image | Size |
|----------|-----------|------|
| Minimal R runtime | `rocker/r-ver:4.5.0` | ~800MB |
| With tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| With RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny server | `rocker/shiny-verse:4.5.0` | ~2GB |

**Got:** Base image picked matches project's needs. No extra bloat.

**If fail:** Unsure which image to use? Start with `rocker/r-ver` (minimal), add packages as needed. Check [rocker-org](https://github.com/rocker-org/rocker-versioned2) for full image catalog.

### Step 2: Write Dockerfile

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

**Got:** Dockerfile builds fine with `docker build -t myproject .`

**If fail:** Build fails during `apt-get install`? Check package names for target distro (Debian). `renv::restore()` fails? Confirm `renv.lock` and `renv/activate.R` copied before restore step.

### Step 3: Create .dockerignore

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

**Got:** `.dockerignore` drops Git history, IDE files, local renv library, build artifacts from Docker context.

**If fail:** Docker build still copies unwanted files? Verify `.dockerignore` in same dir as Dockerfile. Check glob patterns.

### Step 4: Build and Test

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**Got:** Container starts with right R version and all packages available. `sessionInfo()` output confirms R version.

**If fail:** Check build logs for system dependency errors. Add missing `-dev` packages to `apt-get install` layer.

### Step 5: Optimize for Production

For production deployments, use multi-stage builds:

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

**Got:** Multi-stage build makes smaller final image. Runtime stage has only compiled R packages, no build tools.

**If fail:** Packages fail to load in runtime stage? Confirm library path in `COPY --from=builder` matches where R installed packages. Check with `R -e ".libPaths()"` in both stages.

## Checks

- [ ] `docker build` finishes without errors
- [ ] Container starts and R session works
- [ ] All required packages available
- [ ] `.dockerignore` drops unneeded files
- [ ] Image size reasonable for use case
- [ ] Rebuilds fast when only code changes (layer caching works)

## Pitfalls

- **Missing system dependencies**: R packages with compiled code need `-dev` libraries. Check error messages during `install.packages()`
- **Layer cache invalidation**: Copying all files before installing packages invalidates cache on every code change. Copy lockfile first.
- **Large images**: Use `rm -rf /var/lib/apt/lists/*` after `apt-get install`. Consider multi-stage builds.
- **Timezone issues**: Add `ENV TZ=UTC` or install `tzdata` for timezone-aware operations
- **Running as root**: Add non-root user for production: `RUN useradd -m appuser && USER appuser`

## Examples

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## See Also

- `setup-docker-compose` - orchestrate multiple containers
- `containerize-mcp-server` - special case for MCP R servers
- `optimize-docker-build-cache` - advanced caching strategies
- `manage-renv-dependencies` - renv.lock feeds into Docker builds
