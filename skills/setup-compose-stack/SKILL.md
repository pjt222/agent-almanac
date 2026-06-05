---
name: setup-compose-stack
description: >
  Configure general-purpose Docker Compose stacks for common application
  patterns. Covers web app + database + cache + worker services, named
  volumes, networks, health checks, depends_on, environment management,
  and profiles. Use when running a web app with a database or cache,
  setting up a development environment with multiple services,
  orchestrating background workers alongside an API, or creating
  reproducible multi-service environments across teams.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, postgres, redis, multi-service, health-checks
---

# Set Up Compose Stack

Configure Docker Compose for multi-service application stacks with databases, caches, and workers.

## When to Use

- Running a web app with a database and/or cache
- Setting up a development environment with multiple services
- Orchestrating background workers alongside an API
- Needing reproducible multi-service environments across teams

## Inputs

- **Required**: Application service (language, port, entry point)
- **Required**: Supporting services needed (database, cache, queue, etc.)
- **Optional**: Development vs production configuration
- **Optional**: Existing Dockerfiles for custom services

## Procedure

### Step 1: Define Core Stack

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**Expected:** `docker compose up` starts all services with the app waiting for a healthy database.

### Step 2: Add Health Checks

Health checks enable `depends_on` with `condition: service_healthy`:

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Step 3: Configure Networks

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  nginx:
    networks:
      - frontend
    ports:
      - "80:80"

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

This isolates the database from direct external access while the app bridges both networks.

### Step 4: Manage Environment Variables

Create `.env` file (git-ignored):

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

Reference in compose:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

Create `.env.example` (committed to git):

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### Step 5: Add Worker Services

```yaml
services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["node", "src/worker.js"]
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2
```

### Step 6: Use Profiles for Optional Services

```yaml
services:
  app:
    # always starts
    build: .

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev
```

```bash
# Start core services only
docker compose up

# Start with dev tools
docker compose --profile dev up
```

### Step 7: Create Override for Development

`docker-compose.override.yml` is auto-merged:

```yaml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    command: ["npm", "run", "dev"]
```

### Step 8: Build and Run

```bash
# Build all images
docker compose build

# Start in background
docker compose up -d

# View logs
docker compose logs -f app

# Check service status
docker compose ps

# Stop and remove
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

**Expected:** All services start, health checks pass, app connects to database and cache.

**On failure:** Check `docker compose logs <service>`. Common issues: port conflicts, missing environment variables, health check timeouts.

## Validation

- [ ] `docker compose up` starts all services without errors
- [ ] Health checks pass for database and cache
- [ ] Application connects to all dependent services
- [ ] Named volumes persist data across restarts
- [ ] `.env` is git-ignored; `.env.example` is committed
- [ ] `docker compose down` cleanly stops everything
- [ ] Profiles separate dev tools from production services

## Common Pitfalls

- **No health checks**: `depends_on` without `condition: service_healthy` only waits for container start, not readiness.
- **Hardcoded passwords in compose**: Use `.env` files or Docker secrets. Never commit passwords.
- **Volume mount overwrites**: Mounting `.:/app` overwrites `node_modules` built in the image. Use an anonymous volume: `/app/node_modules`.
- **Port conflicts**: Check `docker compose ps` and `lsof -i :<port>` for conflicts.
- **`version:` key**: Compose V2 ignores the `version:` key. Omit it for modern setups.
- **WSL path issues**: Use `/mnt/c/...` paths when mounting Windows directories from WSL.

## Related Skills

- `setup-docker-compose` - R-specific Docker Compose configurations
- `create-dockerfile` - write the Dockerfile that compose references
- `create-multistage-dockerfile` - build optimized images for the stack
- `configure-nginx` - add an Nginx reverse proxy to the stack
