---
name: deploy-shiny-app
description: >
  将 Shiny 应用程序部署到 shinyapps.io、Posit Connect 或 Docker 容器。涵盖
  rsconnect 配置、清单生成、Dockerfile 创建及部署验证。适用于为外部或内部
  用户发布 Shiny 应用、从本地开发迁移到托管环境、为 Kubernetes 或 Docker
  部署容器化 Shiny 应用，或设置自动化部署流水线。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps-io, posit-connect, docker, rsconnect
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 部署 Shiny 应用

将 Shiny 应用程序部署到 shinyapps.io、Posit Connect 或 Docker 容器。

## 适用场景

- 为外部或内部用户发布 Shiny 应用
- 从本地开发迁移到托管环境
- 为 Kubernetes 或 Docker 部署容器化 Shiny 应用
- 设置自动化部署流水线

## 输入

- **必需**：Shiny 应用路径
- **必需**：部署目标（shinyapps.io、Posit Connect 或 Docker）
- **可选**：账户名和令牌（用于 shinyapps.io/Connect）
- **可选**：实例大小偏好
- **可选**：自定义域名或 URL 路径

## 步骤

### 第 1 步：准备应用程序

确保应用程序是自包含且可部署的：

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

验证这些文件存在：
- `app.R`（或 `ui.R` + `server.R`）
- `renv.lock`（推荐用于可重现部署）
- `.Rprofile` 在生产中不调用 `mcptools::mcp_session()`

**预期结果：** 应用在本地运行无错误，所有依赖项已捕获。

**失败处理：** 如果 `appDependencies()` 报告缺少包，安装它们并更新 `renv.lock`。如果应用使用系统库（如 gdal、curl），记录它们以供 Docker 路径使用。

### 第 2 步 A：部署到 shinyapps.io

```r
# One-time account setup
rsconnect::setAccountInfo(
  name = "your-account",
  token = Sys.getenv("SHINYAPPS_TOKEN"),
  secret = Sys.getenv("SHINYAPPS_SECRET")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  appTitle = "My Application",
  account = "your-account",
  forceUpdate = TRUE
)
```

在 `.Renviron` 中存储凭据（永远不要放在代码中）：

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**预期结果：** 应用已部署，可在 `https://your-account.shinyapps.io/my-app/` 访问。

**失败处理：** 如果认证失败，在 shinyapps.io 控制台 > 账户 > 令牌 处重新生成令牌。如果服务器上包安装失败，检查所有包是否在 CRAN 上可用——shinyapps.io 默认无法从 GitHub 安装。

### 第 2 步 B：部署到 Posit Connect

```r
# Register server (one-time)
rsconnect::addServer(
  url = "https://connect.example.com",
  name = "production"
)

# Authenticate (one-time)
rsconnect::connectApiUser(
  account = "your-username",
  server = "production",
  apiKey = Sys.getenv("CONNECT_API_KEY")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  server = "production",
  account = "your-username"
)
```

**预期结果：** 应用已部署，可在 Posit Connect 实例上访问。

**失败处理：** 如果服务器拒绝连接，验证 API 密钥和服务器 URL。如果包安装失败，检查 Connect 是否有权访问所需仓库（CRAN、内部类 CRAN 仓库）。

### 第 2 步 C：使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM rocker/shiny-verse:4.4.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'plotly'))"

# Copy app
COPY . /srv/shiny-server/myapp/

# Configure Shiny Server
COPY shiny-server.conf /etc/shiny-server/shiny-server.conf

# Expose port
EXPOSE 3838

# Run
CMD ["/usr/bin/shiny-server"]
```

创建 `shiny-server.conf`：

```
run_as shiny;

server {
  listen 3838;

  location / {
    site_dir /srv/shiny-server/myapp;
    log_dir /var/log/shiny-server;
    directory_index on;
  }
}
```

构建并运行：

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**预期结果：** 应用在 `http://localhost:3838` 可访问。

**失败处理：** 如果构建时包安装失败，将缺少的系统库添加到 `apt-get install` 行。如果应用未加载，检查 Shiny Server 日志：`docker exec <container> cat /var/log/shiny-server/*.log`。

### 第 3 步：验证部署

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

手动验证清单：
1. 应用无错误加载
2. 所有交互元素响应正常
3. 数据连接在部署环境中正常工作
4. 认证/授权正常工作（如适用）

**预期结果：** 应用响应 HTTP 200，所有功能正常。

**失败处理：** 查看特定部署平台的服务器日志。常见问题：生产环境未设置环境变量、数据库连接使用 localhost 而非生产 URL，或文件路径仅在本地存在。

### 第 4 步：配置监控（可选）

#### shinyapps.io

通过 `https://www.shinyapps.io/admin/#/applications` 的控制台监控。

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

在 Dockerfile 中添加健康检查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**预期结果：** 已为部署目标配置监控。

**失败处理：** 如果健康检查间歇性失败，增加超时值。Shiny 应用在初始加载时响应可能较慢。

## 验证清单

- [ ] 应用部署无错误
- [ ] 部署 URL 响应 HTTP 200
- [ ] 所有交互功能在生产中正常工作
- [ ] 环境变量/密钥已配置（未硬编码）
- [ ] 凭据存储在 `.Renviron` 或 CI 密钥中，而非代码中
- [ ] renv.lock 已提交，用于可重现的依赖解析

## 常见问题

- **硬编码文件路径**：将绝对路径替换为 `system.file()`（用于包数据）或环境变量（用于外部资源）。
- **开发专用依赖项**：不要部署加载 `mcptools::mcp_session()` 或 `devtools` 的 `.Rprofile`。使用条件加载或单独的配置文件。
- **Docker 中缺少系统库**：sf、curl、xml2 等 R 包需要系统库。将它们添加到 Dockerfile 的 `apt-get install` 中。
- **shinyapps.io 上的非 CRAN 包**：shinyapps.io 默认只从 CRAN 安装。GitHub 专有包需要 `remotes` 包和部署时的显式安装。
- **忘记环境变量**：数据库凭据、API 密钥和其他密钥必须在部署环境中单独配置，与代码分离。

## 相关技能

- `scaffold-shiny-app` — 部署前创建应用结构
- `create-r-dockerfile` — R 项目的详细 Docker 配置
- `setup-docker-compose` — Shiny 与数据库的多容器设置
- `setup-github-actions-ci` — 包含自动化部署的 CI/CD
- `optimize-shiny-performance` — 部署到生产前的性能调优
