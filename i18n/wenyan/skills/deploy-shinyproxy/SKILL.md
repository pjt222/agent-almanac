---
name: deploy-shinyproxy
locale: wenyan
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

# 部署 ShinyProxy

部 ShinyProxy 以宿多容器化之 Shiny 應用，具認證與用量跟蹤。

## 用時

- 於單入口宿多 Shiny 應用
- 需各應用獨之認證與訪問控
- 部 Shiny 應用為獨立 Docker 容器
- 擴至單應用部署（shinyapps.io 或獨立 Docker）之上
- 需用量析與審計日誌

## 入

- **必要**：一或多 Shiny 應用以部
- **必要**：已裝 Docker 之伺
- **可選**：認證供應者（LDAP、OpenID、社交）
- **可選**：域名與 SSL 證書
- **可選**：容器編排者（Docker 或 Kubernetes）

## 法

### 第一步：建 Shiny 應用 Docker 鏡像

各 Shiny 應用需其自鏡像。Shiny 應用之 `Dockerfile` 例：

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

建並測各應用：

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**得：** 各 Shiny 應用於其自容器獨立行。

### 第二步：配 ShinyProxy

`application.yml`：

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

### 第三步：以 Docker Compose 部 ShinyProxy

`docker-compose.yml`：

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

**得：** ShinyProxy 於 8080 端啟，示登錄頁，列所配之應用。

**敗則：** 察 `docker compose logs shinyproxy`。驗應用鏡像本地可得（`docker images`）。

### 第四步：配認證

#### 簡（內建）

如第二步示之 `authentication: simple` 與行內用者。

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

#### OpenID Connect（Keycloak、Auth0 等）

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

### 第五步：以 Nginx 加反向代理

於產，宜置 Nginx 於 ShinyProxy 前：

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

WebSocket 支持至要——ShinyProxy 與 Shiny 重用 WebSocket。

### 第六步：用量跟蹤

ShinyProxy 將用量事件記入日誌。欲結構化跟蹤，配 InfluxDB：

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

於 compose 棧加 InfluxDB：

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

### 第七步：應用資源限

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

### 第八步：驗部署

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**得：** 健端返 `UP`。登錄成。應用於獨容器啟。

## 驗

- [ ] ShinyProxy 啟且示登錄頁
- [ ] 認證為諸所配用者可行
- [ ] 各 Shiny 應用於其自容器啟
- [ ] WebSocket 連可（Shiny 反應性可行）
- [ ] 訪問組正限應用可見
- [ ] 用者離時容器清理可行
- [ ] 日誌捕用量事件

## 陷

- **Docker socket 權限**：ShinyProxy 需 Docker socket 以啟容器。以 `docker` 組之用者行，或掛 socket。
- **網絡不合**：應用容器宜與 ShinyProxy 同 Docker 網（specs 中 `container-network` 宜合）。
- **WebSocket 代理**：ShinyProxy 前之 Nginx 或他代理須轉 WebSocket 升級頭。
- **鏡像不見**：應用鏡像宜於 Docker 主預裝或預建，而後 ShinyProxy 始用。
- **容器清理**：若 ShinyProxy 崩，孤兒應用容器或留。以 `docker ps` 察且清之。
- **內存限**：Shiny 應用或耗大內存。設 `container-memory-limit` 以防一應用餓他者。

## Related Skills

- `deploy-shiny-app` - 單應用部至 shinyapps.io、Posit Connect 或 Docker
- `configure-reverse-proxy` - 反向代理模式含 WebSocket 代理
- `create-dockerfile` - 通用應用鏡像 Dockerfile 建
- `create-r-dockerfile` - 用 rocker 鏡之 R 特定 Dockerfile
