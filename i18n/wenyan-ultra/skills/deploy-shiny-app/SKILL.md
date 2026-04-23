---
name: deploy-shiny-app
locale: wenyan-ultra
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

部 Shiny 至 shinyapps.io、Posit Connect、或 Docker。

## 用

- 發 Shiny 予內外用戶
- 本地開發→託管
- Shiny→K8s/Docker 容器化
- 立自動化部署管線

## 入

- **必**：Shiny 應路徑
- **必**：目標（shinyapps.io、Posit Connect、Docker）
- **可**：帳號+令牌
- **可**：實例規格
- **可**：自定域/URL

## 法

### 一：備應用

確自足可部：

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

驗此檔存：
- `app.R`（或 `ui.R` + `server.R`）
- `renv.lock`（宜，利重現部署）
- `.Rprofile` 生產勿調 `mcptools::mcp_session()`

**得：** 應用本地無錯跑，依賴齊。

**敗：** `appDependencies()` 報缺包→裝並更 `renv.lock`。用系統庫（gdal、curl）→記為 Docker 路用。

### 二甲：部 shinyapps.io

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

憑證存 `.Renviron`（勿入碼）：

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**得：** 應部署，於 `https://your-account.shinyapps.io/my-app/` 可達。

**敗：** 認證失→於 shinyapps.io 儀板 > Account > Tokens 重生令牌。服務器裝包失→查諸包於 CRAN，默認不裝 GitHub 包。

### 二乙：部 Posit Connect

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

**得：** 應於 Posit Connect 實例可達。

**敗：** 拒連→驗 API 鑰+服務器 URL。裝包失→查 Connect 可訪需倉（CRAN、內部類 CRAN）。

### 二丙：Docker 部署

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

構建+跑：

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**得：** 應於 `http://localhost:3838` 可達。

**敗：** 裝包時構建失→加缺系統庫至 `apt-get install`。應不載→察 Shiny Server 日誌：`docker exec <container> cat /var/log/shiny-server/*.log`。

### 三：驗部署

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

手動驗清單：
1. 應無錯載
2. 諸交互元響應
3. 數據連於部署環工作
4. 認證/授權工作（若適）

**得：** 應以 HTTP 200 應，諸功能工作。

**敗：** 察特定部署平台之服務器日誌。常見：生產環境變量未設、數據庫連用 localhost 代生產 URL、僅本地存之檔路。

### 四：配監（可選）

#### shinyapps.io

於儀板 `https://www.shinyapps.io/admin/#/applications` 監。

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

Dockerfile 加健康檢：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**得：** 監配於目標部署。

**敗：** 健康檢斷續失→增超時。Shiny 應初載可慢。

## 驗

- [ ] 應部署無錯
- [ ] 部署 URL 以 HTTP 200 應
- [ ] 諸交互功能生產工作
- [ ] 環境變量/密鑰已配（非硬編碼）
- [ ] 憑證存 `.Renviron` 或 CI 密鑰，非入碼
- [ ] renv.lock 提交以利重現

## 忌

- **硬編碼檔路**：替絕對路以 `system.file()`（包數據）或環境變量（外資源）。
- **僅開發之依賴**：勿部署載 `mcptools::mcp_session()` 或 `devtools` 之 `.Rprofile`。用條件載或分離剖面。
- **Docker 缺系統庫**：sf、curl、xml2 需系統庫。加至 Dockerfile `apt-get install`。
- **shinyapps.io 僅 CRAN**：默認僅 CRAN。僅 GitHub 包需 `remotes` 包+明示裝。
- **忘環境變量**：數據庫憑證、API 鑰、其密須於部署環單獨配，非入碼。

## 參

- `scaffold-shiny-app`
- `create-r-dockerfile`
- `setup-docker-compose`
- `setup-github-actions-ci`
- `optimize-shiny-performance`
