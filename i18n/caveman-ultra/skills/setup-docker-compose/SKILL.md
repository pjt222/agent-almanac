---
name: setup-docker-compose
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Docker Compose for multi-container R dev envs. Service defs, volume mounts, networking, env vars, dev vs prod. Use → run R w/ other services (DBs, APIs), reproducible R dev env, orchestrate R-based MCP server, manage env vars + volume mounts for R projects.
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

Configure Docker Compose for R dev + deploy envs.

## Use When

- R + other services (DBs, APIs)
- Reproducible dev env
- Orchestrate R-based MCP server
- Manage env vars + volume mounts

## In

- **Required**: Dockerfile for R service
- **Required**: Project dir to mount
- **Optional**: Additional services (DB, cache, web)
- **Optional**: Env var config

## Do

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

→ `docker-compose.yml` exists w/ R service, volume mounts (project + renv cache), env vars for R lib paths.

If err: invalid YAML → `docker compose config` validate. Spaces (not tabs); special chars quoted.

### Step 2: Add Services (If Needed)

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

→ Service (PostgreSQL) defined w/ own volume, env vars, ports. R service `depends_on` references new.

If err: DB fails start → `docker compose logs postgres` for init errs. Verify env vars (`POSTGRES_PASSWORD_FILE` → valid secret) or switch `POSTGRES_PASSWORD` for dev.

### Step 3: Networking

For services needing localhost (MCP):

```yaml
services:
  r-dev:
    network_mode: "host"
```

Isolated:

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

→ Networking configured: `host` for localhost-needing (MCP), bridge w/ explicit ports for isolated.

If err: services can't comm → verify same net. Bridge → use service names as hostnames (`postgres` not `localhost`). Host → `localhost` + no port conflicts.

### Step 4: Env Vars

`.env` (git-ignored):

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

Reference:

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

→ `.env` exists git-ignored w/ project vars; compose references via `env_file`|`${VAR}`.

If err: vars not resolving → `.env` in same dir as `docker-compose.yml`. `docker compose config` shows resolved.

### Step 5: Build + Run

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

→ All start. R session accessible.

If err: `docker compose logs` → startup errs. Common: port conflicts, missing env vars.

### Step 6: Override for Dev

`docker-compose.override.yml`:

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

Auto-merged.

→ Override exists w/ dev settings (extra volumes, debug) auto-applied via `docker compose up`.

If err: not taking effect → verify exact `docker-compose.override.yml`. `docker compose config` confirms merge. Explicit: `docker compose -f docker-compose.yml -f custom-override.yml up`.

## Check

- [ ] `docker compose build` w/o errs
- [ ] `docker compose up` starts all
- [ ] Volume mounts share files host↔container
- [ ] Env vars available inside
- [ ] Services can comm
- [ ] `docker compose down` cleanly stops

## Traps

- **Volume mount perms**: Linux containers create files as root. `user:` directive or fix perms.
- **Port conflicts**: Check services using same ports on host.
- **Docker Desktop vs CLI**: `docker compose` (v2) vs `docker-compose` (v1). Use v2.
- **WSL path mounts**: `/mnt/c/...` for Windows dirs from WSL.
- **Named vs bind**: Named persist across rebuilds; bind reflects host immediately.

## →

- `create-r-dockerfile` — Dockerfile compose references
- `containerize-mcp-server` — compose for MCP
- `optimize-docker-build-cache` — speed up builds
