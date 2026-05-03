---
name: scaffold-shiny-app
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new Shiny application using golem (production R package),
  rhino (enterprise), or vanilla (quick prototype) structure. Covers
  framework selection, project initialization, and first module creation.
  Use when starting a new interactive web application in R, creating a
  dashboard or data explorer prototype, setting up a production Shiny app as
  an R package with golem, or bootstrapping an enterprise Shiny project with
  rhino.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, web-app, reactive
---

# 構建 Shiny 應用腳手架

以 golem、rhino 或 vanilla 腳手架建立生產就緒結構之 Shiny 應用。

## 適用時機

- 新建 R 之互動式網頁應用
- 建立儀表板或資料探索原型
- 以 golem 設置生產 Shiny 應用作為 R 套件
- 以 rhino 啟動企業 Shiny 項目

## 輸入

- **必要**：應用名
- **必要**：框架選擇（golem、rhino 或 vanilla）
- **選擇性**：是否含模組腳手架（預設：是）
- **選擇性**：是否用 renv 作依賴管理（預設：是）
- **選擇性**：部署目標（shinyapps.io、Posit Connect、Docker）

## 步驟

### 步驟一：選擇框架

評估項目需求以選適當之框架：

| 框架 | 最適 | 結構 |
|-----------|----------|-----------|
| **golem** | 以 R 套件交付之生產應用 | R 套件含 DESCRIPTION、tests、vignettes |
| **rhino** | 含 JS/CSS 建構管道之企業應用 | box 模組、Sass、JS 打包、rhino::init() |
| **vanilla** | 快速原型與學習 | 單一 app.R 或 ui.R/server.R 對 |

**預期：** 依項目範圍與團隊需求作明確之框架決定。

**失敗時：** 若不確定，預設 golem——其提供最多結構且日後可簡化。Vanilla 僅適合一次性原型。

### 步驟二：搭建項目腳手架

#### Golem 路徑

```r
golem::create_golem("myapp", package_name = "myapp")
```

此建立：
```
myapp/
├── DESCRIPTION
├── NAMESPACE
├── R/
│   ├── app_config.R
│   ├── app_server.R
│   ├── app_ui.R
│   └── run_app.R
├── dev/
│   ├── 01_start.R
│   ├── 02_dev.R
│   ├── 03_deploy.R
│   └── run_dev.R
├── inst/
│   ├── app/www/
│   └── golem-config.yml
├── man/
├── tests/
│   ├── testthat.R
│   └── testthat/
└── vignettes/
```

#### Rhino 路徑

```r
rhino::init("myapp")
```

此建立：
```
myapp/
├── app/
│   ├── js/
│   ├── logic/
│   ├── static/
│   ├── styles/
│   ├── view/
│   └── main.R
├── tests/
│   ├── cypress/
│   └── testthat/
├── .github/
├── app.R
├── dependencies.R
├── rhino.yml
└── renv.lock
```

#### Vanilla 路徑

建立 `app.R`：

```r
library(shiny)
library(bslib)

ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar(
    sliderInput("n", "Sample size", 10, 1000, 100)
  ),
  card(
    card_header("Output"),
    plotOutput("plot")
  )
)

server <- function(input, output, session) {
  output$plot <- renderPlot({
    hist(rnorm(input$n), main = "Random Normal")
  })
}

shinyApp(ui, server)
```

**預期：** 項目目錄已建，含所有腳手架文件。

**失敗時：** 對 golem，確保 golem 套件已安裝：`install.packages("golem")`。對 rhino，從 GitHub 安裝：`remotes::install_github("Appsilon/rhino")`。對 vanilla，確保 shiny 與 bslib 已安裝。

### 步驟三：配置依賴

#### Golem/Vanilla

```r
# Initialize renv
renv::init()

# Add core dependencies
usethis::use_package("shiny")
usethis::use_package("bslib")
usethis::use_package("DT")         # if using data tables
usethis::use_package("plotly")     # if using interactive plots

# Snapshot
renv::snapshot()
```

#### Rhino

依賴於 `dependencies.R` 中管理：

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**預期：** 所有依賴記錄於 DESCRIPTION（golem）或 dependencies.R（rhino）並以 renv 鎖定。

**失敗時：** 若 renv::init() 失敗，檢查寫入權限。若套件安裝失敗，檢查 R 版本相容性。

### 步驟四：建立首模組

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

此建立 `R/mod_dashboard.R` 與 `tests/testthat/test-mod_dashboard.R`。

#### Rhino

建立 `app/view/dashboard.R`：

```r
box::use(
  shiny[moduleServer, NS, tagList, h3, plotOutput, renderPlot],
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

#### Vanilla

於另一文件 `R/mod_dashboard.R` 加模組函數：

```r
dashboardUI <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

dashboardServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

**預期：** 模組文件已建，含使用適當命名空間之 UI 與伺服器函數。

**失敗時：** 確保模組於 UI 函數中所有輸入/輸出 ID 皆用 `NS(id)`。無命名空間時，模組多次使用會導致 ID 衝突。

### 步驟五：執行應用

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**預期：** 應用於瀏覽器無錯啟動。

**失敗時：** 檢查 R 控制台之錯誤訊息。常見問題：缺套件（安裝之）、連接埠已用（以 `port = 3839` 指定不同連接埠）或 UI/server 代碼之語法錯誤。

## 驗證

- [ ] 應用目錄具所選框架之正確結構
- [ ] `shiny::runApp()` 無錯啟動
- [ ] 至少一模組已腳手架，含 UI 與伺服器函數
- [ ] 依賴已記錄（DESCRIPTION 或 dependencies.R）
- [ ] renv.lock 捕捉所有套件版本
- [ ] 模組用 `NS(id)` 作適當之命名空間隔離

## 常見陷阱

- **生產選 vanilla**：Vanilla 結構缺測試基礎設施、文件與部署工具。原型外用 golem 或 rhino。
- **模組中缺命名空間**：模組 UI 中每 `inputId` 與 `outputId` 須以 `ns()` 包裝。遺忘者引發靜默 ID 衝突。
- **無 devtools 工作流之 golem**：golem 應用為 R 套件。用 `devtools::load_all()`、`devtools::test()`、`devtools::document()`——非 `source()`。
- **無 box 之 rhino**：rhino 用 box 作模組引入。勿退回 `library()` 呼叫——用 `box::use()` 作明確引入。

## 相關技能

- `build-shiny-module` — 建立含適當命名空間隔離之可重用 Shiny 模組
- `test-shiny-app` — 設置 shinytest2 與 testServer() 測試
- `deploy-shiny-app` — 部署至 shinyapps.io、Posit Connect 或 Docker
- `design-shiny-ui` — bslib 主題化與響應式佈局設計
- `create-r-package` — R 套件腳手架（golem 應用為 R 套件）
- `manage-renv-dependencies` — 詳細之 renv 依賴管理
