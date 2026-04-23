---
name: deploy-shiny-app
locale: wenyan-lite
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

# Deploy Shiny App

部署 Shiny 應用於 shinyapps.io、Posit Connect 或 Docker 容器。

## 適用時機

- 為外部或內部用戶發布 Shiny 應用
- 自本地開發遷至託管環境
- 為 Kubernetes 或 Docker 部署將 Shiny 應用容器化
- 設自動化部署管線

## 輸入

- **必需**：Shiny 應用之路徑
- **必需**：部署目標（shinyapps.io、Posit Connect 或 Docker）
- **可選**：帳戶名與令牌（供 shinyapps.io/Connect）
- **可選**：實例大小偏好
- **可選**：自定網域或 URL 路徑

## 步驟

### 步驟一：備應用

確保應用自足且可部署：

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

驗此等檔案存在：
- `app.R`（或 `ui.R` + `server.R`）
- `renv.lock`（建議以供可重現之部署）
- `.Rprofile` 於生產中不調 `mcptools::mcp_session()`

**預期：** 應用於本地無誤執行，所有依賴已捕獲。

**失敗時：** 若 `appDependencies()` 報缺失套件，裝之並更 `renv.lock`。若應用用系統函式庫（如 gdal、curl），記之以供 Docker 路徑。

### 步驟二 a：部署至 shinyapps.io

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

將憑證存於 `.Renviron`（絕不於程式碼中）：

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**預期：** 應用已部署，可於 `https://your-account.shinyapps.io/my-app/` 存取。

**失敗時：** 若認證失敗，於 shinyapps.io 儀表板 > Account > Tokens 重生令牌。若伺服器上套件安裝失敗，查所有套件於 CRAN 可得——shinyapps.io 預設無法自 GitHub 安裝。

### 步驟二 b：部署至 Posit Connect

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

**預期：** 應用已部署，可於 Posit Connect 實例上存取。

**失敗時：** 若伺服器拒絕連線，驗 API 金鑰與伺服器 URL。若套件安裝失敗，查 Connect 可達所需之儲存庫（CRAN、內部類 CRAN 之儲存庫）。

### 步驟二 c：以 Docker 部署

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

建並執行：

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**預期：** 應用於 `http://localhost:3838` 可達。

**失敗時：** 若於套件安裝時建置失敗，加缺失之系統函式庫於 `apt-get install` 行。若應用未載，查 Shiny Server 日誌：`docker exec <container> cat /var/log/shiny-server/*.log`。

### 步驟三：驗證部署

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

人工驗證清單：
1. 應用載入無誤
2. 所有互動元素皆回應
3. 資料連線於部署環境中運作
4. 認證/授權運作（若有）

**預期：** 應用以 HTTP 200 回應，所有功能運作。

**失敗時：** 查特定部署平台之伺服器日誌。常見問題：生產中環境變數未設、資料庫連線用 localhost 而非生產 URL、或僅於本地存在之檔案路徑。

### 步驟四：配監控（可選）

#### shinyapps.io

於儀表板 `https://www.shinyapps.io/admin/#/applications` 監之。

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

於 Dockerfile 加健康檢查：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**預期：** 部署目標之監控已配。

**失敗時：** 若健康檢查間歇失敗，增超時值。Shiny 應用於初始載入時可能回應慢。

## 驗證

- [ ] 應用部署無誤
- [ ] 部署之 URL 以 HTTP 200 回應
- [ ] 生產中所有互動功能運作
- [ ] 環境變數/秘鑰已配（非硬編碼）
- [ ] 憑證存於 `.Renviron` 或 CI 秘鑰，非於程式碼
- [ ] renv.lock 已提交以供可重現之依賴解析

## 常見陷阱

- **硬編碼檔案路徑**：以 `system.file()`（供套件資料）或環境變數（供外部資源）替絕對路徑。
- **僅限開發之依賴**：不部署載 `mcptools::mcp_session()` 或 `devtools` 之 `.Rprofile`。用條件載入或分離設定檔。
- **Docker 中缺系統函式庫**：sf、curl、xml2 等 R 套件需系統函式庫。加之於 Dockerfile 之 `apt-get install`。
- **shinyapps.io 僅限 CRAN 套件**：shinyapps.io 預設僅自 CRAN 安裝。僅限 GitHub 之套件需 `remotes` 套件與部署中之顯式安裝。
- **遺忘環境變數**：資料庫憑證、API 金鑰等秘鑰須於部署環境中與程式碼分離地配置。

## 相關技能

- `scaffold-shiny-app` — 部署前建應用結構
- `create-r-dockerfile` — R 專案之詳細 Docker 配置
- `setup-docker-compose` — Shiny 與資料庫之多容器設定
- `setup-github-actions-ci` — 含自動化部署之 CI/CD
- `optimize-shiny-performance` — 部署至生產前之性能調優
