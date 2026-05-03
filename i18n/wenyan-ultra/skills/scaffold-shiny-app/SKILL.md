---
name: scaffold-shiny-app
locale: wenyan-ultra
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

# 架 Shiny 應

建新 Shiny 應含產備結構用 golem、rhino、或素架。

## 用

- 始新互動 R 網應→用
- 建儀板或資探原型→用
- 設產 Shiny 應為 R 包（golem）→用
- 啟企 Shiny 項（rhino）→用

## 入

- **必**：應名
- **必**：框選（golem、rhino、素）
- **可**：含模架（默：是）
- **可**：用 renv 管依（默：是）
- **可**：釋標（shinyapps.io、Posit Connect、Docker）

## 行

### 一：擇框

按項需選宜框：

| 框 | 宜 | 結構 |
|----|---|-----|
| **golem** | 產應運為 R 包 | R 包含 DESCRIPTION、測、誌 |
| **rhino** | 企應含 JS/CSS 建管 | box 模、Sass、JS 包、rhino::init() |
| **素** | 速原型與學 | 單 app.R 或 ui.R/server.R 對 |

得：明框決於項範與組需。

敗：未定→默 golem—予最多結構可後簡。素僅宜棄原型。

### 二：架項

#### Golem 路

```r
golem::create_golem("myapp", package_name = "myapp")
```

建：
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
├── inst/
├── man/
├── tests/
└── vignettes/
```

#### Rhino 路

```r
rhino::init("myapp")
```

建：
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
├── app.R
├── dependencies.R
├── rhino.yml
└── renv.lock
```

#### 素路

建 `app.R`：

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

得：項目建含諸架檔。

敗：golem→確 golem 包裝（`install.packages("golem")`）。rhino→自 GitHub 裝（`remotes::install_github("Appsilon/rhino")`）。素→確 shiny、bslib 裝。

### 三：配依

#### Golem/素

```r
renv::init()

usethis::use_package("shiny")
usethis::use_package("bslib")
usethis::use_package("DT")
usethis::use_package("plotly")

renv::snapshot()
```

#### Rhino

依管於 `dependencies.R`：

```r
library(shiny)
library(bslib)
library(DT)
```

得：諸依錄於 DESCRIPTION（golem）或 dependencies.R（rhino）、renv 鎖。

敗：renv::init() 敗→查寫權。包裝敗→查 R 本相容。

### 四：建首模

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

建 `R/mod_dashboard.R` 與 `tests/testthat/test-mod_dashboard.R`。

#### Rhino

建 `app/view/dashboard.R`：

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

加模函至 `R/mod_dashboard.R`：

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

得：模檔建含 UI 與服函用正命空。

敗：確模 UI 函諸入/出 ID 用 `NS(id)`。無命空→ID 多用時撞。

### 五：行應

```r
golem::run_dev()
shiny::runApp()
shiny::runApp("app.R")
```

得：應於瀏無誤啟。

敗：察 R 控制台誤訊。常題：缺包（裝之）、口已用（`port = 3839`）、UI/服碼語誤。

## 驗

- [ ] 應目結構合所擇框
- [ ] `shiny::runApp()` 啟無誤
- [ ] ≥ 1 模架含 UI 與服函
- [ ] 依錄（DESCRIPTION 或 dependencies.R）
- [ ] renv.lock 捕諸包本
- [ ] 模用 `NS(id)` 命空隔

## 忌

- **產用素**：素無測施、文、釋工。原型外用 golem 或 rhino
- **模缺命空**：模 UI 諸 `inputId`、`outputId` 必裹 `ns()`。忘致默 ID 撞
- **golem 無 devtools 流**：golem 應為 R 包。用 `devtools::load_all()`、`devtools::test()`、`devtools::document()`，非 `source()`
- **rhino 無 box**：rhino 用 box 為模入。勿退 `library()`—用 `box::use()` 顯入

## 參

- `build-shiny-module`
- `test-shiny-app`
- `deploy-shiny-app`
- `design-shiny-ui`
- `create-r-package`
- `manage-renv-dependencies`
