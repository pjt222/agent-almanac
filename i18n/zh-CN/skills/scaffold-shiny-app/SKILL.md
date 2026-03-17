---
name: scaffold-shiny-app
description: >
  使用 golem（生产 R 包）、rhino（企业级）或 vanilla（快速原型）结构搭建新的
  Shiny 应用程序。涵盖框架选择、项目初始化及第一个模块创建。适用于在 R 中
  启动新的交互式 Web 应用、创建仪表盘或数据探索器原型、将生产 Shiny 应用
  以 golem 方式设置为 R 包，或用 rhino 引导企业级 Shiny 项目。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, web-app, reactive
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 搭建 Shiny 应用

使用 golem、rhino 或 vanilla 脚手架创建具有生产就绪结构的新 Shiny 应用程序。

## 适用场景

- 在 R 中启动新的交互式 Web 应用
- 创建仪表盘或数据探索器原型
- 将生产 Shiny 应用设置为 R 包（golem）
- 引导企业级 Shiny 项目（rhino）

## 输入

- **必需**：应用名称
- **必需**：框架选择（golem、rhino 或 vanilla）
- **可选**：是否包含模块脚手架（默认：是）
- **可选**：是否使用 renv 进行依赖管理（默认：是）
- **可选**：部署目标（shinyapps.io、Posit Connect、Docker）

## 步骤

### 第 1 步：选择框架

根据项目需求评估并选择合适的框架：

| 框架 | 最适用于 | 结构 |
|------|----------|------|
| **golem** | 以 R 包形式交付的生产应用 | 包含 DESCRIPTION、测试、vignette 的 R 包 |
| **rhino** | 带 JS/CSS 构建管道的企业应用 | box 模块、Sass、JS 打包、rhino::init() |
| **vanilla** | 快速原型和学习 | 单个 app.R 或 ui.R/server.R 对 |

**预期结果：** 基于项目范围和团队需求做出明确的框架决策。

**失败处理：** 如果不确定，默认选择 golem——它提供最多结构，后期可简化。vanilla 仅适用于一次性原型。

### 第 2 步：搭建项目

#### Golem 路径

```r
golem::create_golem("myapp", package_name = "myapp")
```

这会创建：
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

#### Rhino 路径

```r
rhino::init("myapp")
```

这会创建：
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

#### Vanilla 路径

创建 `app.R`：

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

**预期结果：** 项目目录已创建，包含所有脚手架文件。

**失败处理：** 对于 golem，确保已安装 golem 包：`install.packages("golem")`。对于 rhino，从 GitHub 安装：`remotes::install_github("Appsilon/rhino")`。对于 vanilla，确保 shiny 和 bslib 已安装。

### 第 3 步：配置依赖项

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

依赖项在 `dependencies.R` 中管理：

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**预期结果：** 所有依赖项记录在 DESCRIPTION（golem）或 dependencies.R（rhino）中，并用 renv 锁定。

**失败处理：** 如果 renv::init() 失败，检查写入权限。如果包安装失败，检查 R 版本兼容性。

### 第 4 步：创建第一个模块

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

这会创建 `R/mod_dashboard.R` 和 `tests/testthat/test-mod_dashboard.R`。

#### Rhino

创建 `app/view/dashboard.R`：

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

将模块函数添加到单独的文件 `R/mod_dashboard.R`：

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

**预期结果：** 模块文件已创建，包含使用正确命名空间的 UI 和 server 函数。

**失败处理：** 确保模块在 UI 函数中使用 `NS(id)` 处理所有输入/输出 ID。如果没有命名空间，多次使用该模块时 ID 会冲突。

### 第 5 步：运行应用程序

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**预期结果：** 应用程序在浏览器中启动，无错误。

**失败处理：** 检查 R 控制台中的错误消息。常见问题：缺少包（安装它们）、端口已被占用（用 `port = 3839` 指定不同端口），或 UI/server 代码中存在语法错误。

## 验证清单

- [ ] 应用目录具有所选框架的正确结构
- [ ] `shiny::runApp()` 启动无错误
- [ ] 至少搭建了一个具有 UI 和 server 函数的模块
- [ ] 依赖项已记录（DESCRIPTION 或 dependencies.R）
- [ ] renv.lock 捕获所有包版本
- [ ] 模块使用 `NS(id)` 进行正确的命名空间隔离

## 常见问题

- **为生产环境选择 vanilla**：vanilla 结构缺乏测试基础设施、文档和部署工具。原型之外的任何项目都应使用 golem 或 rhino。
- **模块中缺少命名空间**：模块 UI 中的每个 `inputId` 和 `outputId` 都必须用 `ns()` 包裹。遗漏会导致静默的 ID 冲突。
- **golem 缺少 devtools 工作流**：golem 应用是 R 包。使用 `devtools::load_all()`、`devtools::test()` 和 `devtools::document()`——而非 `source()`。
- **rhino 不使用 box**：rhino 使用 box 进行模块导入。不要回退到 `library()` 调用——使用 `box::use()` 进行显式导入。

## 相关技能

- `build-shiny-module` — 创建具有正确命名空间隔离的可复用 Shiny 模块
- `test-shiny-app` — 设置 shinytest2 和 testServer() 测试
- `deploy-shiny-app` — 部署到 shinyapps.io、Posit Connect 或 Docker
- `design-shiny-ui` — bslib 主题和响应式布局设计
- `create-r-package` — R 包脚手架（golem 应用是 R 包）
- `manage-renv-dependencies` — 详细的 renv 依赖管理
