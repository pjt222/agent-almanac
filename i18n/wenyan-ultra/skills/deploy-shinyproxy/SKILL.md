---
name: deploy-shinyproxy
locale: wenyan-ultra
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

部 ShinyProxy 托多容器化 Shiny 應用，含認證+用量跟蹤。

## 用

- 多 Shiny 應於單入口
- 需每應認證+訪問控
- Shiny→隔離 Docker 容器
- 超單應部署（shinyapps.io/獨立 Docker）擴展
- 需用量分析+審計日誌

## 入

- **必**：一或多 Shiny 應
- **必**：有 Docker 之機
- **可**：認證供應（LDAP、OpenID、社交）
- **可**：域名+SSL
- **可**：容器編排（Docker/K8s）

## 法

### 一：建 Shiny 應 Docker 像

每應需自像。`Dockerfile` 例：

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

構建+測每應：

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**得：** 每 Shiny 應於自容器獨跑。

### 二：配 ShinyProxy

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

### 三：以 Docker Compose 部 ShinyProxy

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

**得：** ShinyProxy 於 8080 啟，示登錄頁，列配置應。

**敗：** 察 `docker compose logs shinyproxy`。驗應像本地存（`docker images`）。

### 四：配認證

#### 簡單（內建）

如步二，`authentication: simple` 內聯用戶。

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

### 五：以 Nginx 反向代理

生產置 Nginx 於 ShinyProxy 前：

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

WebSocket 支持要緊——ShinyProxy 與 Shiny 大用 WebSocket。

### 六：用量跟蹤

ShinyProxy 記用量事件至日誌。欲結構化，配 InfluxDB：

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

加 InfluxDB 至 compose 棧：

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

### 七：應資源限

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

### 八：驗部署

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**得：** 健康端點返 `UP`。登錄成。應於隔離容器啟。

## 驗

- [ ] ShinyProxy 啟並示登錄頁
- [ ] 認證諸配用戶工作
- [ ] 每 Shiny 應於自容器啟
- [ ] WebSocket 連工作（Shiny 反應性）
- [ ] 訪問組正確限應可見
- [ ] 用戶斷時容器清理工作
- [ ] 日誌錄用量事件

## 忌

- **Docker socket 權限**：ShinyProxy 需 Docker socket 啟容器。以 `docker` 組用戶跑或掛載 socket。
- **網絡不匹**：應容器須於同 Docker 網絡（specs 之 `container-network` 須匹）。
- **WebSocket 代理**：ShinyProxy 前之 Nginx 或其代理須轉 WebSocket 升級頭。
- **像不存**：應像須於 Docker 主機本地拉或構建後 ShinyProxy 始可用。
- **容器清理**：ShinyProxy 崩→孤應容器可留。`docker ps` 查並清。
- **內存限**：Shiny 應可耗大內存。設 `container-memory-limit` 防一應餓諸應。

## 參

- `deploy-shiny-app`
- `configure-reverse-proxy`
- `create-dockerfile`
- `create-r-dockerfile`
