---
name: deploy-shinyproxy
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
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# ShinyProxyのデプロイ

Deploy ShinyProxy to host multiple containerized Shiny applications with authentication and usage tracking.

## 使用タイミング

- Hosting multiple Shiny apps behind a single entry point
- Need per-app authentication and access control
- Deploying Shiny apps as isolated Docker containers
- Scaling beyond single-app deployment (shinyapps.io or standalone Docker)
- Requiring usage analytics and audit logging

## 入力

- **必須**: One or more Shiny apps to deploy
- **必須**: Server with Docker installed
- **任意**: Authentication provider (LDAP, OpenID, social)
- **任意**: Domain name and SSL certificate
- **任意**: Container orchestrator (Docker or Kubernetes)

## 手順

### ステップ1: Create Shiny App Docker Images

Each Shiny app needs its own Docker image. Example `Dockerfile` for a Shiny app:

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

Build and test each app:

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**期待結果:** Each Shiny app runs independently in its own container.

### ステップ2: Configure ShinyProxy

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

### ステップ3: Deploy ShinyProxy with Docker Compose

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

**期待結果:** ShinyProxy starts on port 8080, shows login page, and lists configured apps.

**失敗時:** Check `docker compose logs shinyproxy`. Verify app images are available locally (`docker images`).

### ステップ4: Configure Authentication

#### Simple (built-in)

As shown in Step 2 with `authentication: simple` and inline users.

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

### ステップ5: Add Reverse Proxy with Nginx

For production, place Nginx in front of ShinyProxy:

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

WebSocket support is critical — ShinyProxy and Shiny use WebSockets heavily.

### ステップ6: Usage Tracking

ShinyProxy logs usage events to its log file. For structured tracking, configure InfluxDB:

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

Add InfluxDB to the compose stack:

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

### ステップ7: App Resource Limits

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

### ステップ8: Verify Deployment

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**期待結果:** Health endpoint returns `UP`. Login succeeds. Apps launch in isolated containers.

## バリデーション

- [ ] ShinyProxy starts and shows login page
- [ ] Authentication works for all configured users
- [ ] Each Shiny app launches in its own container
- [ ] WebSocket connections work (Shiny reactivity functions)
- [ ] Access groups restrict app visibility correctly
- [ ] Container cleanup works when users disconnect
- [ ] Logs capture usage events

## よくある落とし穴

- **Docker socket permissions**: ShinyProxy needs Docker socket access to launch containers. Run as a user in the `docker` group or mount the socket.
- **Network mismatch**: App containers must be on the same Docker network as ShinyProxy (`container-network` in specs must match).
- **WebSocket proxy**: Nginx or other proxies in front of ShinyProxy must forward WebSocket upgrade headers.
- **Image not found**: App images must be pulled or built locally on the Docker host before ShinyProxy tries to use them.
- **Container cleanup**: If ShinyProxy crashes, orphaned app containers may remain. Use `docker ps` to check and clean up.
- **Memory limits**: Shiny apps can consume significant memory. Set `container-memory-limit` to prevent a single app from starving others.

## 関連スキル

- `deploy-shiny-app` - single-app deployment to shinyapps.io, Posit Connect, or Docker
- `configure-reverse-proxy` - reverse proxy patterns including WebSocket proxying
- `create-dockerfile` - general Dockerfile creation for app images
- `create-r-dockerfile` - R-specific Dockerfiles with rocker images
