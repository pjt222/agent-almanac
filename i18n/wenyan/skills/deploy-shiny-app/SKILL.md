---
name: deploy-shiny-app
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy Shiny applications to shinyapps.io, Posit Connect, or Docker
  containers. Covers rsconnect configuration, manifest generation,
  Dockerfile creation, and deployment verification. Use when publishing a
  Shiny app for external or internal users, moving from local development to
  a hosted environment, containerizing a Shiny app for Kubernetes or Docker
  deployment, or setting up automated deployment pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps-io, posit-connect, docker, rsconnect
---

# 部署 Shiny 應用

將 Shiny 應用部至 shinyapps.io、Posit Connect 或 Docker 容器。

## 用時

- 為外或內用者發布 Shiny 應用
- 由本地開發移至宿主環境
- 將 Shiny 應用容器化供 Kubernetes 或 Docker 部署
- 立自動部署流水

## 入

- **必要**：Shiny 應用之路
- **必要**：部署目標（shinyapps.io、Posit Connect 或 Docker）
- **可選**：帳號名與令牌（供 shinyapps.io/Connect）
- **可選**：實例大小之偏好
- **可選**：自定域名或 URL 路

## 法

### 第一步：備應用

確應用自含可部：

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

驗此諸文件存：
- `app.R`（或 `ui.R` + `server.R`）
- `renv.lock`（宜有，供可重現部署）
- `.Rprofile` 於產中**不得**呼 `mcptools::mcp_session()`

**得：** 應用本地無錯而行，所有依賴已捕。

**敗則：** 若 `appDependencies()` 報缺包，裝之並更 `renv.lock`。若應用用系庫（如 gdal、curl），記之供 Docker 路。

### 第二步甲：部至 shinyapps.io

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

憑證存於 `.Renviron`（勿於碼）：

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**得：** 應用已部，可訪於 `https://your-account.shinyapps.io/my-app/`。

**敗則：** 若認證敗，於 shinyapps.io 控制臺 > Account > Tokens 重生令牌。若伺之包裝敗，察諸包皆於 CRAN——默認 shinyapps.io 不能由 GitHub 裝。

### 第二步乙：部至 Posit Connect

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

**得：** 應用已部，於 Posit Connect 實例可訪。

**敗則：** 若伺拒連，驗 API 鑰與伺 URL。若包裝敗，察 Connect 可訪所需庫（CRAN、內部 CRAN 樣庫）。

### 第二步丙：以 Docker 部

建 `Dockerfile`：

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

建 `shiny-server.conf`：

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

建並行：

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**得：** 應用於 `http://localhost:3838` 可訪。

**敗則：** 若建時包裝敗，於 `apt-get install` 加缺之系庫。若應用不載，察 Shiny Server 日誌：`docker exec <container> cat /var/log/shiny-server/*.log`。

### 第三步：驗部署

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

人手驗之單：
1. 應用無錯載
2. 所有交互元應
3. 部署環境中數據連可
4. 認證/授權可（若有）

**得：** 應用以 HTTP 200 應，諸能可行。

**敗則：** 察部署平臺之伺日誌。常見問題：產中環境變量未設；數據庫連用 localhost 而非產 URL；僅本地存之文件路。

### 第四步：配監視（可選）

#### shinyapps.io

經 `https://www.shinyapps.io/admin/#/applications` 之控制臺監。

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

於 Dockerfile 加健檢：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**得：** 監視已為部署目標配。

**敗則：** 若健檢時時敗，加超時。Shiny 應用初載或慢應。

## 驗

- [ ] 應用無錯部
- [ ] 部署 URL 以 HTTP 200 應
- [ ] 諸交互能於產可行
- [ ] 環境變量/秘密已配（非硬編）
- [ ] 憑證存於 `.Renviron` 或 CI 秘密，非碼
- [ ] renv.lock 已提交以求可重現之依賴解析

## 陷

- **硬編文件路**：以 `system.file()`（供包數據）或環境變量（供外資）替絕對路。
- **唯開發之依賴**：勿部載 `mcptools::mcp_session()` 或 `devtools` 之 `.Rprofile`。用條件載或分離配置。
- **Docker 中缺系庫**：sf、curl、xml2 等 R 包需系庫。於 Dockerfile 之 `apt-get install` 加之。
- **shinyapps.io 唯 CRAN 包**：shinyapps.io 默認唯由 CRAN 裝。唯 GitHub 之包需 `remotes` 包並於部署明裝。
- **忘環境變量**：數據庫憑證、API 鑰及他秘密必須於部署環境外碼獨配。

## Related Skills

- `scaffold-shiny-app` — 部前建應用結構
- `create-r-dockerfile` — R 項目之詳 Docker 配
- `setup-docker-compose` — Shiny 與數據庫之多容器設
- `setup-github-actions-ci` — CI/CD 含自動部署
- `optimize-shiny-performance` — 部至產前之性能調
