---
name: deploy-shinyproxy
description: >
  部署 ShinyProxy 以托管多个容器化 Shiny 应用程序。涵盖 ShinyProxy Docker
  部署、application.yml 配置、Shiny 应用 Docker 镜像、认证、容器后端、
  使用追踪和扩展。适用于在单一入口点后托管多个 Shiny 应用、需要按应用认证
  和访问控制、将 Shiny 应用作为隔离 Docker 容器部署，或以使用分析和审计日志
  扩展超出单应用部署范围。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shinyproxy, shiny, docker, deployment, multi-app, authentication, self-hosted
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 部署 ShinyProxy

部署 ShinyProxy 以托管多个容器化 Shiny 应用程序，并提供认证和使用追踪功能。

## 适用场景

- 在单一入口点后托管多个 Shiny 应用
- 需要按应用认证和访问控制
- 将 Shiny 应用作为隔离 Docker 容器部署
- 扩展超出单应用部署范围（shinyapps.io 或独立 Docker）
- 需要使用分析和审计日志

## 输入

- **必需**：一个或多个待部署的 Shiny 应用
- **必需**：安装了 Docker 的服务器
- **可选**：认证提供商（LDAP、OpenID、社交登录）
- **可选**：域名和 SSL 证书
- **可选**：容器编排器（Docker 或 Kubernetes）

## 步骤

### 第 1 步：创建 Shiny 应用 Docker 镜像

每个 Shiny 应用需要自己的 Docker 镜像。Shiny 应用的示例 `Dockerfile`：

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

构建并测试每个应用：

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**预期结果：** 每个 Shiny 应用在其自己的容器中独立运行。

### 第 2 步：配置 ShinyProxy

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

### 第 3 步：使用 Docker Compose 部署 ShinyProxy

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

**预期结果：** ShinyProxy 在端口 8080 上启动，显示登录页面，并列出已配置的应用。

**失败处理：** 检查 `docker compose logs shinyproxy`。验证应用镜像本地可用（`docker images`）。

### 第 4 步：配置认证

#### 简单认证（内置）

如第 2 步所示，使用 `authentication: simple` 和内联用户。

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

### 第 5 步：使用 Nginx 添加反向代理

生产环境中，在 ShinyProxy 前放置 Nginx：

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

WebSocket 支持至关重要——ShinyProxy 和 Shiny 大量使用 WebSocket。

### 第 6 步：使用追踪

ShinyProxy 将使用事件记录到日志文件。对于结构化追踪，配置 InfluxDB：

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

将 InfluxDB 添加到 compose 堆栈：

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

### 第 7 步：应用资源限制

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

### 第 8 步：验证部署

```bash
# Check ShinyProxy health
curl -s http://localhost:8080/actuator/health

# Test login
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# List apps via API
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**预期结果：** 健康端点返回 `UP`。登录成功。应用在隔离容器中启动。

## 验证清单

- [ ] ShinyProxy 启动并显示登录页面
- [ ] 所有配置用户的认证正常
- [ ] 每个 Shiny 应用在其自己的容器中启动
- [ ] WebSocket 连接正常（Shiny 响应性功能正常）
- [ ] 访问组正确限制应用可见性
- [ ] 用户断开连接时容器清理正常
- [ ] 日志捕获使用事件

## 常见问题

- **Docker socket 权限**：ShinyProxy 需要 Docker socket 访问来启动容器。以 `docker` 组中的用户运行或挂载 socket。
- **网络不匹配**：应用容器必须与 ShinyProxy 在同一 Docker 网络上（spec 中的 `container-network` 必须匹配）。
- **WebSocket 代理**：ShinyProxy 前的 Nginx 或其他代理必须转发 WebSocket 升级头。
- **镜像未找到**：应用镜像必须在 ShinyProxy 尝试使用之前在 Docker 主机上拉取或构建。
- **容器清理**：如果 ShinyProxy 崩溃，可能会留下孤立的应用容器。使用 `docker ps` 检查并清理。
- **内存限制**：Shiny 应用可能消耗大量内存。设置 `container-memory-limit` 以防止单个应用耗尽其他应用的资源。

## 相关技能

- `deploy-shiny-app` — 单应用部署到 shinyapps.io、Posit Connect 或 Docker
- `configure-reverse-proxy` — 包括 WebSocket 代理的反向代理模式
- `create-dockerfile` — 应用镜像的通用 Dockerfile 创建
- `create-r-dockerfile` — 使用 rocker 镜像的 R 专用 Dockerfiles
