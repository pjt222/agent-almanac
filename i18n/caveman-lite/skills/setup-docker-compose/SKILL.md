---
name: setup-docker-compose
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Docker Compose for multi-container R development environments.
  Covers service definitions, volume mounts, networking, environment
  variables, and dev vs production configurations. Use to run R alongside
  other services (databases, APIs), set up a reproducible R dev environment,
  orchestrate an R-based MCP server container, or manage environment
  variables and volume mounts for R projects.
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

Configure Docker Compose for R development and deployment environments.

## When to Use

- Running R alongside other services (databases, APIs)
- Setting up a reproducible development environment
- Orchestrating an R-based MCP server container
- Managing environment variables and volume mounts

## Inputs

- **Required**: Dockerfile for the R service
- **Required**: Project directory to mount
- **Optional**: Additional services (database, cache, web server)
- **Optional**: Environment variable configuration

## Procedure

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

**Got:** A `docker-compose.yml` file with the R service defined, including volume mounts for the project directory and renv cache, and environment variables for R library paths.

**If fail:** With invalid YAML, validate using `docker compose config`. Ensure indentation uses spaces (not tabs) and all string values with special characters are quoted.

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

**Got:** The additional service (e.g., PostgreSQL) is defined with its own volume, environment variables, and port mapping. The R service has `depends_on` referencing the new service.

**If fail:** If the database service fails to start, check `docker compose logs postgres` for initialization errors. Verify that environment variables like `POSTGRES_PASSWORD_FILE` point to valid secrets or switch to `POSTGRES_PASSWORD` for development.

### Step 3: Configure Networking

For services that need localhost access (e.g., MCP servers):

```yaml
services:
  r-dev:
    network_mode: "host"
```

For isolated networking:

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

**Got:** Networking configured appropriately: `host` mode for services needing localhost access (MCP servers), or bridge networking with explicit port mappings for isolated services.

**If fail:** If services cannot communicate, verify they are on the same network. With bridge networking, use service names as hostnames (e.g., `postgres` not `localhost`). With host mode, use `localhost` and ensure ports do not conflict.

### Step 4: Manage Environment Variables

Create `.env` file (git-ignored):

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

Reference in compose:

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**Got:** A `.env` file (git-ignored) with project-specific variables, and `docker-compose.yml` references it via `env_file` or variable interpolation (`${VAR}`).

**If fail:** If variables are not resolving, ensure the `.env` file is in the same directory as `docker-compose.yml`. Run `docker compose config` to see the resolved configuration with all variables expanded.

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

**If fail:** Check `docker compose logs` for startup errors. Common: port conflicts, missing environment variables.

### Step 6: Create Override for Development

Create `docker-compose.override.yml` for local development settings:

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

This is automatically merged with `docker-compose.yml`.

**Got:** A `docker-compose.override.yml` file with development-specific settings (extra volumes, debug flags) automatically applied when running `docker compose up`.

**If fail:** If overrides are not taking effect, verify the filename is exactly `docker-compose.override.yml`. Run `docker compose config` to confirm the merge. For explicit override files, use `docker compose -f docker-compose.yml -f custom-override.yml up`.

## Validation

- [ ] `docker compose build` completes without errors
- [ ] `docker compose up` starts all services
- [ ] Volume mounts correctly share files between host and container
- [ ] Environment variables are available inside containers
- [ ] Services can communicate with each other
- [ ] `docker compose down` cleanly stops everything

## Pitfalls

- **Volume mount permissions**: Linux containers may create files as root. Use `user:` directive or fix permissions.
- **Port conflicts**: Check for services already using the same ports on the host
- **Docker Desktop vs CLI**: `docker compose` (v2) vs `docker-compose` (v1). Use v2.
- **WSL path mounts**: Use `/mnt/c/...` paths when mounting Windows directories from WSL
- **Named volumes vs bind mounts**: Named volumes persist across rebuilds; bind mounts reflect host changes immediately

## Related Skills

- `create-r-dockerfile` - create the Dockerfile that compose references
- `containerize-mcp-server` - compose configuration for MCP servers
- `optimize-docker-build-cache` - speed up compose builds
