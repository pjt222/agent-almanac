---
name: create-r-dockerfile
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

Build a Dockerfile for R projects using rocker base images with proper dependency management.

## When to Use

- Containerizing an R application or analysis
- Creating reproducible R environments
- Deploying R-based services (Shiny, Plumber, MCP server)
- Setting up consistent development environments

## Inputs

- **Required**: R project with dependencies (DESCRIPTION or renv.lock)
- **Required**: Purpose (development, production, or service)
- **Optional**: R version (default: latest stable)
- **Optional**: Additional system libraries needed

## Procedure

### Step 1: Choose Base Image

| Use Case | Base Image | Size |
|----------|-----------|------|
| Minimal R runtime | `rocker/r-ver:4.5.0` | ~800MB |
| With tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| With RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny server | `rocker/shiny-verse:4.5.0` | ~2GB |

**Expected:** A base image is selected that matches the project's requirements without unnecessary bloat.

**On failure:** If unsure which image to use, start with `rocker/r-ver` (minimal) and add packages as needed. Check [rocker-org](https://github.com/rocker-org/rocker-versioned2) for the full image catalog.

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

**Expected:** Dockerfile builds successfully with `docker build -t myproject .`

**On failure:** If the build fails during `apt-get install`, check package names for the target distro (Debian). If `renv::restore()` fails, ensure `renv.lock` and `renv/activate.R` are copied before the restore step.

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

**Expected:** `.dockerignore` excludes Git history, IDE files, local renv library, and build artifacts from the Docker context.

**On failure:** If the Docker build still copies unwanted files, verify `.dockerignore` is in the same directory as the Dockerfile and uses correct glob patterns.

### Step 4: Build and Test

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**Expected:** Container starts with correct R version and all packages available. `sessionInfo()` output confirms the expected R version.

**On failure:** Check build logs for system dependency errors. Add missing `-dev` packages to the `apt-get install` layer.

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

**Expected:** Multi-stage build produces a smaller final image. Runtime stage contains only compiled R packages, not build tools.

**On failure:** If packages fail to load in the runtime stage, ensure the library path in `COPY --from=builder` matches where R installed packages. Check with `R -e ".libPaths()"` in both stages.

## Validation

- [ ] `docker build` completes without errors
- [ ] Container starts and R session works
- [ ] All required packages are available
- [ ] `.dockerignore` excludes unnecessary files
- [ ] Image size is reasonable for the use case
- [ ] Rebuilds are fast when only code changes (layer caching works)

## Common Pitfalls

- **Missing system dependencies**: R packages with compiled code need `-dev` libraries. Check error messages during `install.packages()`
- **Layer cache invalidation**: Copying all files before installing packages invalidates cache on every code change. Copy lockfile first.
- **Large images**: Use `rm -rf /var/lib/apt/lists/*` after `apt-get install`. Consider multi-stage builds.
- **Timezone issues**: Add `ENV TZ=UTC` or install `tzdata` for timezone-aware operations
- **Running as root**: Add a non-root user for production: `RUN useradd -m appuser && USER appuser`

## Examples

```bash
# Development container with mounted source
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber API service
docker run -d -p 8000:8000 r-api:latest

# Shiny app
docker run -d -p 3838:3838 r-shiny:latest
```

## Related Skills

- `setup-docker-compose` - orchestrate multiple containers
- `containerize-mcp-server` - special case for MCP R servers
- `optimize-docker-build-cache` - advanced caching strategies
- `manage-renv-dependencies` - renv.lock feeds into Docker builds
