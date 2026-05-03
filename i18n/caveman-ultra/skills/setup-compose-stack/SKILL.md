---
name: setup-compose-stack
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Docker Compose stacks for common app patterns. Web app + DB + cache + worker, named volumes, networks, health checks, depends_on, env mgmt, profiles. Use → run web app w/ DB|cache, dev env w/ multi services, bg workers w/ API, reproducible multi-service envs across teams.
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

Configure Docker Compose for multi-service stacks w/ DBs, caches, workers.

## Use When

- Web app + DB|cache
- Dev env w/ multi services
- Bg workers + API
- Reproducible multi-service envs

## In

- **Required**: App service (lang, port, entry)
- **Required**: Supporting services (DB, cache, queue)
- **Optional**: Dev vs prod config
- **Optional**: Existing Dockerfiles

## Do

### Step 1: Core Stack

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

→ `docker compose up` starts all, app waits for healthy DB.

### Step 2: Health Checks

Enable `depends_on` w/ `condition: service_healthy`:

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

### Step 3: Networks

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

Isolates DB from external; app bridges both.

### Step 4: Env Vars

`.env` (git-ignored):

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

Reference:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

`.env.example` (committed):

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### Step 5: Worker Services

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

### Step 6: Profiles for Optional

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

### Step 7: Override for Dev

`docker-compose.override.yml` auto-merged:

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

### Step 8: Build + Run

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

→ All services start, health checks pass, app connects DB+cache.

If err: `docker compose logs <service>`. Common: port conflicts, missing env vars, health check timeouts.

## Check

- [ ] `docker compose up` starts w/o errs
- [ ] Health checks pass DB+cache
- [ ] App connects all deps
- [ ] Named volumes persist across restarts
- [ ] `.env` git-ignored; `.env.example` committed
- [ ] `docker compose down` cleanly stops
- [ ] Profiles separate dev from prod

## Traps

- **No health checks**: `depends_on` w/o `condition: service_healthy` only waits for container start, not ready.
- **Hardcoded pwds**: `.env`|Docker secrets. Never commit pwds.
- **Volume mount overwrites**: Mounting `.:/app` overwrites image's `node_modules`. Anonymous volume: `/app/node_modules`.
- **Port conflicts**: `docker compose ps` + `lsof -i :<port>`.
- **`version:` key**: Compose V2 ignores. Omit for modern.
- **WSL path issues**: `/mnt/c/...` for Windows dirs from WSL.

## →

- `setup-docker-compose` — R-specific configs
- `create-dockerfile` — write Dockerfile
- `create-multistage-dockerfile` — optimized images
- `configure-nginx` — add Nginx reverse proxy
