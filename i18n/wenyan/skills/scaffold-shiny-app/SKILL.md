---
name: scaffold-shiny-app
locale: wenyan
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

# 搭 Shiny 應用

以 golem、rhino、或素本之搭，立新 Shiny 應用，附生產可用之結構。

## 用時

- 立新 R 之交互網應用乃用
- 立儀表或數探索之原型乃用
- 立生產 Shiny 為 R 包（golem）乃用
- 啟企業 Shiny 之項目（rhino）乃用

## 入

- **必要**：應用之名
- **必要**：框架之擇（golem、rhino、或素本）
- **可選**：是否含模之搭（默：是）
- **可選**：是否用 renv 管依（默：是）
- **可選**：展之目標（shinyapps.io、Posit Connect、Docker）

## 法

### 第一步：擇框架

依項目之求擇宜之框：

| 框架 | 宜於 | 結構 |
|-----------|----------|-----------|
| **golem** | 生產應用以 R 包散 | R 包附 DESCRIPTION、試、vignette |
| **rhino** | 企業應用附 JS/CSS 之建管線 | box 模、Sass、JS 打包、rhino::init() |
| **素** | 速原型與學 | 一 app.R 或 ui.R/server.R 對 |

得：依範與團之需明擇框。

敗則：不知何擇，默用 golem——其結構最備，可後簡之。素唯宜於棄之原型。

### 第二步：搭項目

#### Golem 之路

```r
golem::create_golem("myapp", package_name = "myapp")
```

此立：

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

#### Rhino 之路

```r
rhino::init("myapp")
```

此立：

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

#### 素之路

立 `app.R`：

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

得：項目目已建，諸搭文件皆存。

敗則：golem 者，確 golem 已裝：`install.packages("golem")`。rhino 者，自 GitHub 裝：`remotes::install_github("Appsilon/rhino")`。素者，確 shiny 與 bslib 已裝。

### 第三步：配依

#### Golem/素

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

依管於 `dependencies.R`：

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

得：諸依錄於 DESCRIPTION（golem）或 dependencies.R（rhino），且以 renv 鎖。

敗則：renv::init() 敗，察寫之權。包裝敗，察 R 之版合否。

### 第四步：立首模

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

此立 `R/mod_dashboard.R` 與 `tests/testthat/test-mod_dashboard.R`。

#### Rhino

立 `app/view/dashboard.R`：

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

#### 素

於別文件 `R/mod_dashboard.R` 增模函：

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

得：模文件已立，UI 與 server 函皆用正之命名空。

敗則：確模於 UI 函之諸入/出 ID 皆用 `NS(id)` 包之。無命名空，模多用則 ID 衝。

### 第五步：行應用

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

得：應用於瀏覽器啟而無誤。

敗則：察 R 控台之誤辭。常患：包缺（裝之）、端口被用（以 `port = 3839` 指他端）、UI/server 之語法誤。

## 驗

- [ ] 應用目附所擇框之正結構
- [ ] `shiny::runApp()` 啟而無誤
- [ ] 至少一模已搭，附 UI 與 server 函
- [ ] 諸依已錄（DESCRIPTION 或 dependencies.R）
- [ ] renv.lock 捕諸包之版
- [ ] 模用 `NS(id)` 為命名空之隔

## 陷

- **生產用素**：素無試之基、無文檔、無展之器。原型外宜用 golem 或 rhino
- **模缺命名空**：模 UI 之每 `inputId` 與 `outputId` 必以 `ns()` 包。忘者默致 ID 衝
- **golem 不用 devtools 之流**：golem 應用乃 R 包。用 `devtools::load_all()`、`devtools::test()`、`devtools::document()`——非 `source()`
- **rhino 不用 box**：rhino 用 box 為模引。勿退至 `library()`——用 `box::use()` 為明引

## 參

- `build-shiny-module` — 立可重用之 Shiny 模附正命名空之隔
- `test-shiny-app` — 設 shinytest2 與 testServer() 之試
- `deploy-shiny-app` — 展於 shinyapps.io、Posit Connect、或 Docker
- `design-shiny-ui` — bslib 之主題與響應之布
- `create-r-package` — R 包之搭（golem 應用乃 R 包）
- `manage-renv-dependencies` — 詳之 renv 依管
