---
name: deploy-shinyproxy
locale: wenyan-lite
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

部署 ShinyProxy 以託管多個容器化 Shiny 應用，具認證與使用追蹤。

## 適用時機

- 於單一入口後託管多 Shiny 應用
- 需每應用之認證與存取控制
- 將 Shiny 應用部署為隔離之 Docker 容器
- 擴展超越單應用部署（shinyapps.io 或獨立 Docker）
- 需使用分析與稽核日誌

## 輸入

- **必需**：一或多個待部署之 Shiny 應用
- **必需**：已裝 Docker 之伺服器
- **可選**：認證提供者（LDAP、OpenID、社群）
- **可選**：網域名與 SSL 憑證
- **可選**：容器編排器（Docker 或 Kubernetes）

## 步驟

### 步驟一：建 Shiny 應用 Docker 映像

每 Shiny 應用需其自之 Docker 映像。應用之 `Dockerfile` 例：

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

建並測每應用：

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**預期：** 每 Shiny 應用於其自之容器中獨立執行。

### 步驟二：配 ShinyProxy

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

### 步驟三：以 Docker Compose 部署 ShinyProxy

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

**預期：** ShinyProxy 於 8080 埠啟動，示登入頁，列已配之應用。

**失敗時：** 查 `docker compose logs shinyproxy`。驗應用映像於本地可得（`docker images`）。

### 步驟四：配認證

#### 簡易（內建）

如步驟二所示，`authentication: simple` 與行內用戶。

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

### 步驟五：以 Nginx 加反向代理

於生產中，置 Nginx 於 ShinyProxy 前：

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

WebSocket 支援至關重要——ShinyProxy 與 Shiny 大量使用 WebSocket。

### 步驟六：使用追蹤

ShinyProxy 將使用事件記於其日誌檔。為結構化追蹤，配 InfluxDB：

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

加 InfluxDB 至 compose 堆疊：

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

### 步驟七：應用資源限

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

### 步驟八：驗證部署

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**預期：** 健康端點返 `UP`。登入成功。應用於隔離容器中啟動。

## 驗證

- [ ] ShinyProxy 啟動並示登入頁
- [ ] 認證對所有已配用戶皆運作
- [ ] 每 Shiny 應用於其自之容器中啟動
- [ ] WebSocket 連線運作（Shiny 反應性功能）
- [ ] 存取群組正確限制應用可見性
- [ ] 用戶斷線時容器清理運作
- [ ] 日誌記使用事件

## 常見陷阱

- **Docker socket 權限**：ShinyProxy 需 Docker socket 存取以啟動容器。以 `docker` 群組用戶執行或掛載 socket。
- **網路不符**：應用容器須與 ShinyProxy 同 Docker 網路（specs 中之 `container-network` 須合）。
- **WebSocket 代理**：ShinyProxy 前之 Nginx 或其他代理須轉 WebSocket 升級標頭。
- **映像未得**：應用映像須於 ShinyProxy 試用前於 Docker 主機本地拉取或建置。
- **容器清理**：若 ShinyProxy 崩潰，孤立之應用容器可能殘留。用 `docker ps` 查並清理。
- **記憶體限**：Shiny 應用可耗大量記憶體。設 `container-memory-limit` 以防單一應用餓死他者。

## 相關技能

- `deploy-shiny-app` - 至 shinyapps.io、Posit Connect 或 Docker 之單應用部署
- `configure-reverse-proxy` - 含 WebSocket 代理之反向代理模式
- `create-dockerfile` - 應用映像之一般 Dockerfile 建置
- `create-r-dockerfile` - 以 rocker 映像之 R 專用 Dockerfile
