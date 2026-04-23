---
name: deploy-shinyproxy
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy ShinyProxy for hosting multiple containerized Shiny applications.
  Covers ShinyProxy Docker deployment, application.yml configuration,
  Shiny app Docker images, authentication, container backends, usage
  tracking, and scaling. Use when hosting multiple Shiny apps behind a single
  entry point, needing per-app authentication and access control, deploying
  Shiny apps as isolated Docker containers, or scaling beyond single-app
  deployment with usage analytics and audit logging.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shinyproxy, shiny, docker, deployment, multi-app, authentication, self-hosted
---

# Deploy ShinyProxy

Multi Shiny apps, containerized, w/ auth + usage tracking.

## Use When

- Multi Shiny apps, single entry
- Per-app auth + access ctrl
- Apps as isolated Docker containers
- Beyond single-app (shinyapps.io / standalone Docker)
- Usage analytics + audit logging

## In

- **Required**: ≥1 Shiny apps
- **Required**: Server w/ Docker
- **Optional**: Auth provider (LDAP, OpenID, social)
- **Optional**: Domain + SSL
- **Optional**: Orchestrator (Docker or K8s)

## Do

### Step 1: Shiny app Docker images

Each app → own image:

```dockerfile
FROM rocker/shiny:4.5.0

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'dplyr'), \
    repos='https://cloud.r-project.org/')"

COPY app/ /srv/shiny-server/app/

RUN chown -R shiny:shiny /srv/shiny-server/app

USER shiny
EXPOSE 3838
CMD ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
```

Build + test:

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

→ Each app runs in own container.

### Step 2: Config ShinyProxy

`application.yml`:

```yaml
proxy:
  title: "Shiny Applications"
  port: 8080
  container-backend: docker
  docker:
    internal-networking: true
  authentication: simple
  admin-groups: admins

  users:
    - name: admin
      password: admin_password
      groups: admins
    - name: analyst
      password: analyst_password
      groups: users

  specs:
    - id: dashboard
      display-name: "Analytics Dashboard"
      description: "Interactive data analysis dashboard"
      container-image: myorg/dashboard:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins, users]

    - id: report-builder
      display-name: "Report Builder"
      description: "Generate custom reports"
      container-image: myorg/report-builder:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins]

logging:
  file:
    name: /opt/shinyproxy/log/shinyproxy.log

server:
  forward-headers-strategy: native
```

### Step 3: Deploy w/ Compose

`docker-compose.yml`:

```yaml
services:
  shinyproxy:
    image: openanalytics/shinyproxy:3.1.1
    container_name: shinyproxy
    ports:
      - "8080:8080"
    volumes:
      - ./application.yml:/opt/shinyproxy/application.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - shinyproxy-logs:/opt/shinyproxy/log
    networks:
      - shinyproxy-net
    restart: unless-stopped

networks:
  shinyproxy-net:
    name: shinyproxy-net
    driver: bridge

volumes:
  shinyproxy-logs:
```

```bash
# Create the network first (ShinyProxy spawns containers on this network)
docker network create shinyproxy-net

# Start ShinyProxy
docker compose up -d

# Check logs
docker compose logs -f shinyproxy
```

→ Starts on :8080, login page, lists apps.

If err: `docker compose logs shinyproxy`. Images local (`docker images`).

### Step 4: Auth

#### Simple (built-in)

Step 2 `authentication: simple` + inline users.

#### LDAP

```yaml
proxy:
  authentication: ldap
  ldap:
    url: ldap://ldap.example.com:389/dc=example,dc=com
    manager-dn: cn=admin,dc=example,dc=com
    manager-password: ldap_admin_password
    user-search-base: ou=users
    user-search-filter: (uid={0})
    group-search-base: ou=groups
    group-search-filter: (member={0})
```

#### OpenID Connect (Keycloak, Auth0, etc.)

```yaml
proxy:
  authentication: openid
  openid:
    auth-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/auth
    token-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/token
    jwks-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/certs
    client-id: shinyproxy
    client-secret: your_client_secret
    roles-claim: realm_access.roles
```

### Step 5: Nginx reverse proxy

Prod → Nginx front:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name shiny.example.com;

    ssl_certificate /etc/letsencrypt/live/shiny.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shiny.example.com/privkey.pem;

    location / {
        proxy_pass http://shinyproxy:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_buffering off;
    }
}
```

WebSocket critical → ShinyProxy + Shiny use WS heavily.

### Step 6: Usage tracking

Logs → file. Structured → InfluxDB:

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

Add InfluxDB:

```yaml
services:
  influxdb:
    image: influxdb:1.8
    environment:
      INFLUXDB_DB: shinyproxy
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: admin_password
    volumes:
      - influxdata:/var/lib/influxdb
    networks:
      - shinyproxy-net

volumes:
  influxdata:
```

### Step 7: App resource limits

```yaml
specs:
  - id: dashboard
    container-image: myorg/dashboard:latest
    container-memory-limit: 1g
    container-cpu-limit: 1.0
    max-instances: 5
    container-env:
      R_MAX_MEM_SIZE: 768m
```

### Step 8: Verify

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

→ Health `UP`, login OK, apps launch in isolated containers.

## Check

- [ ] Starts + login page
- [ ] Auth OK all users
- [ ] Each app → own container
- [ ] WS conns work (reactivity)
- [ ] Access groups restrict
- [ ] Container cleanup on disconnect
- [ ] Logs capture usage

## Traps

- **Docker socket perms**: Needs socket access → user in `docker` group or mount socket
- **Network mismatch**: Apps + ShinyProxy same Docker net (`container-network` in specs)
- **WS proxy**: Nginx must forward WS upgrade headers
- **Image not found**: Pull/build local on host before ShinyProxy uses
- **Container cleanup**: ShinyProxy crash → orphan containers. `docker ps` check.
- **Mem limits**: Shiny consumes → `container-memory-limit` prevents starving

## →

- `deploy-shiny-app` — single-app deploy
- `configure-reverse-proxy` — WS proxying patterns
- `create-dockerfile` — Dockerfile creation
- `create-r-dockerfile` — R-specific w/ rocker
