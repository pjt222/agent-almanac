---
name: setup-docker-compose
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Docker Compose for multi-container R development environments.
  Covers service definitions, volume mounts, networking, environment
  variables, and development vs production configurations. Use when running
  R alongside other services (databases, APIs), setting up a reproducible
  R development environment, orchestrating an R-based MCP server container,
  or managing environment variables and volume mounts for R projects.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, development, volumes
---

# Set Up Docker Compose

Configure Docker Compose for R dev + deployment envs.

## When Use

- Running R alongside other services (databases, APIs)
- Setting up reproducible dev env
- Orchestrating R-based MCP server container
- Managing env vars + volume mounts

## Inputs

- **Required**: Dockerfile for R service
- **Required**: Project dir to mount
- **Optional**: Additional services (database, cache, web server)
- **Optional**: Env var config

## Steps

### Step 1: Create docker-compose.yml

```yaml
version: '3.8'

services:
  r-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-dev
    image: r-dev:latest

    volumes:
      - .:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library
      - RENV_PATHS_CACHE=/workspace/renv/cache

    command: R

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

**Got:** `docker-compose.yml` file exists with R service defined, volume mounts for project + renv cache, env vars for R library paths.

**If fail:** YAML syntax invalid? Validate with `docker compose config`. Indentation must use spaces (not tabs), all string values with special chars quoted.

### Step 2: Add Additional Services (If Needed)

```yaml
services:
  r-dev:
    # ... as above
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432

  postgres:
    image: postgres:16
    container_name: r-postgres
    environment:
      POSTGRES_DB: analysis
      POSTGRES_USER: ruser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  renv-cache:
  pgdata:
```

**Got:** Additional service (e.g., PostgreSQL) defined with own volume, env vars, port mapping. R service has `depends_on` referencing new service.

**If fail:** Database service fails to start? Check `docker compose logs postgres` for init errors. Verify env vars like `POSTGRES_PASSWORD_FILE` point to valid secrets or switch to `POSTGRES_PASSWORD` for dev.

### Step 3: Configure Networking

For services needing localhost access (MCP servers).

```yaml
services:
  r-dev:
    network_mode: "host"
```

For isolated networking.

```yaml
services:
  r-dev:
    networks:
      - app-network
    ports:
      - "3000:3000"

networks:
  app-network:
    driver: bridge
```

**Got:** Networking configured: `host` mode for services needing localhost (MCP servers), or bridge with explicit port mappings for isolated services.

**If fail:** Services cannot communicate? Verify same network. With bridge, use service names as hostnames (`postgres` not `localhost`). With host mode, use `localhost`, ensure ports do not conflict.

### Step 4: Manage Environment Variables

Make `.env` file (git-ignored).

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

Reference in compose.

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**Got:** `.env` file exists (git-ignored) with project-specific variables, `docker-compose.yml` references via `env_file` or variable interpolation (`${VAR}`).

**If fail:** Variables not resolving? Ensure `.env` in same dir as `docker-compose.yml`. Run `docker compose config` to see resolved config with all vars expanded.

### Step 5: Build and Run

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# Attach to R session
docker compose exec r-dev R

# View logs
docker compose logs -f r-dev

# Stop services
docker compose down
```

**Got:** All services start. R session accessible.

**If fail:** Check `docker compose logs` for startup errors. Common: port conflicts, missing env vars.

### Step 6: Create Override for Development

Make `docker-compose.override.yml` for local dev settings.

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

Auto merged with `docker-compose.yml`.

**Got:** `docker-compose.override.yml` exists with dev-specific settings (extra volumes, debug flags), auto applied when running `docker compose up`.

**If fail:** Overrides not taking effect? Verify filename exactly `docker-compose.override.yml`. Run `docker compose config` to confirm merge. For explicit override files, use `docker compose -f docker-compose.yml -f custom-override.yml up`.

## Checks

- [ ] `docker compose build` completes without errors
- [ ] `docker compose up` starts all services
- [ ] Volume mounts share files between host + container
- [ ] Env vars available inside containers
- [ ] Services can communicate with each other
- [ ] `docker compose down` cleanly stops everything

## Pitfalls

- **Volume mount permissions**: Linux containers may create files as root. Use `user:` directive or fix permissions.
- **Port conflicts**: Check for services already using same ports on host
- **Docker Desktop vs CLI**: `docker compose` (v2) vs `docker-compose` (v1). Use v2.
- **WSL path mounts**: Use `/mnt/c/...` paths when mounting Windows dirs from WSL
- **Named volumes vs bind mounts**: Named volumes persist across rebuilds; bind mounts reflect host changes immediately

## See Also

- `create-r-dockerfile` - create Dockerfile compose references
- `containerize-mcp-server` - compose config for MCP servers
- `optimize-docker-build-cache` - speed up compose builds
