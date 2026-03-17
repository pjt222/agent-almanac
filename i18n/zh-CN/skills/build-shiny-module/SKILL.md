---
name: build-shiny-module
description: >
  使用 NS() 构建具有正确命名空间隔离的可复用 Shiny 模块。涵盖模块 UI/server
  对、响应式返回值、模块间通信及嵌套模块组合。适用于从不断增长的 Shiny 应用
  中提取可复用组件、构建多处使用的 UI 组件、将复杂响应式逻辑封装在简洁接口
  后面，或将大型应用从更小的可测试单元组合而成。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, modules, namespace, reactive, composition
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 构建 Shiny 模块

创建具有正确命名空间隔离、响应式通信和可组合性的可复用 Shiny UI/server 模块对。

## 适用场景

- 从不断增长的 Shiny 应用中提取可复用组件
- 构建将在多处使用的 UI 组件
- 将复杂响应式逻辑封装在简洁接口后面
- 将大型应用从更小的可测试单元组合而成

## 输入

- **必需**：模块用途和功能描述
- **必需**：输入/输出契约（模块接收和返回的内容）
- **可选**：模块是否嵌套其他模块（默认：否）
- **可选**：框架上下文（golem、rhino 或 vanilla）

## 步骤

### 第 1 步：定义模块接口

编写代码前，先定义模块接收和返回的内容：

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**预期结果：** 清晰的契约，指定响应式输入、响应式输出和 UI 元素。

**失败处理：** 如果接口不清晰，说明模块可能太宽泛。将其拆分为具有单一职责的更小模块。

### 第 2 步：创建模块 UI 函数

```r
#' Data Filter Module UI
#'
#' @param id Module namespace ID
#' @return A tagList of filter controls
#' @export
dataFilterUI <- function(id) {
  ns <- NS(id)
  tagList(
    selectInput(
      ns("column"),
      "Filter column",
      choices = NULL
    ),
    uiOutput(ns("filter_control")),
    actionButton(ns("apply"), "Apply Filter", class = "btn-primary")
  )
}
```

关键规则：
- 函数名遵循 `<名称>UI` 约定
- 第一个参数始终为 `id`
- 在顶部创建 `ns <- NS(id)`
- 用 `ns()` 包裹每个 `inputId` 和 `outputId`
- 返回 `tagList()` 以允许灵活放置

**预期结果：** UI 函数创建带命名空间的输入/输出元素。

**失败处理：** 如果两次使用模块时 ID 冲突，检查每个 ID 是否都用 `ns()` 包裹。常见遗漏：`renderUI()` 或 `uiOutput()` 内的 ID——这些也需要 `ns()`。

### 第 3 步：创建模块 Server 函数

```r
#' Data Filter Module Server
#'
#' @param id Module namespace ID
#' @param data Reactive expression returning a data frame
#' @param columns Character vector of filterable column names
#' @return Reactive expression returning the filtered data frame
#' @export
dataFilterServer <- function(id, data, columns) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # Update column choices when data changes
    observeEvent(data(), {
      available <- intersect(columns, names(data()))
      updateSelectInput(session, "column", choices = available)
    })

    # Dynamic filter control based on selected column
    output$filter_control <- renderUI({
      req(input$column)
      col_data <- data()[[input$column]]

      if (is.numeric(col_data)) {
        sliderInput(
          ns("value_range"),
          "Range",
          min = min(col_data, na.rm = TRUE),
          max = max(col_data, na.rm = TRUE),
          value = range(col_data, na.rm = TRUE)
        )
      } else {
        selectInput(
          ns("value_select"),
          "Values",
          choices = unique(col_data),
          multiple = TRUE,
          selected = unique(col_data)
        )
      }
    })

    # Return filtered data as a reactive
    filtered <- eventReactive(input$apply, {
      req(input$column)
      col <- input$column
      df <- data()

      if (is.numeric(df[[col]])) {
        req(input$value_range)
        df[df[[col]] >= input$value_range[1] &
           df[[col]] <= input$value_range[2], ]
      } else {
        req(input$value_select)
        df[df[[col]] %in% input$value_select, ]
      }
    }, ignoreNULL = FALSE)

    return(filtered)
  })
}
```

关键规则：
- 函数名遵循 `<名称>Server` 约定
- 第一个参数始终为 `id`
- 其他参数为响应式表达式或静态值
- 使用 `moduleServer(id, function(input, output, session) { ... })`
- 对 server 内部创建的动态 UI 使用 `session$ns`
- 显式返回响应式值

**预期结果：** server 函数处理输入并返回响应式输出。

**失败处理：** 如果响应式值不更新，检查动态 UI 中的输入是否使用 `session$ns`（而非外部 `ns`）。如果模块返回 NULL，确保 `return()` 是 `moduleServer()` 内的最后一个表达式。

### 第 4 步：将模块连接到父应用

```r
# In app_ui.R or ui
ui <- page_sidebar(
  title = "Analysis App",
  sidebar = sidebar(
    dataFilterUI("filter1")
  ),
  card(
    DT::dataTableOutput("table")
  )
)

# In app_server.R or server
server <- function(input, output, session) {
  # Raw data source
  raw_data <- reactive({ mtcars })

  # Call module — capture its return value
  filtered_data <- dataFilterServer(
    "filter1",
    data = raw_data,
    columns = c("cyl", "mpg", "hp", "wt")
  )

  # Use the module's returned reactive
  output$table <- DT::renderDataTable({
    filtered_data()
  })
}
```

**预期结果：** 模块出现在 UI 中，其返回的响应式值流入下游输出。

**失败处理：** 如果模块 UI 未渲染，验证 `id` 字符串在 UI 和 server 调用之间是否匹配。如果返回的响应式为 NULL，检查 server 函数是否实际返回了值。

### 第 5 步：组合嵌套模块（可选）

对于包含其他模块的模块：

```r
analysisUI <- function(id) {
  ns <- NS(id)
  tagList(
    dataFilterUI(ns("filter")),
    plotOutput(ns("plot"))
  )
}

analysisServer <- function(id, data) {
  moduleServer(id, function(input, output, session) {
    # Call inner module with namespaced ID
    filtered <- dataFilterServer("filter", data = data, columns = names(data()))

    output$plot <- renderPlot({
      req(filtered())
      plot(filtered())
    })

    return(filtered)
  })
}
```

关键规则：在 UI 中，用 `ns("inner_id")` 嵌套。在 server 中，用 `"inner_id"` 调用——`moduleServer` 处理命名空间链接。

**预期结果：** 内部模块在外部模块的命名空间内正确渲染。

**失败处理：** 如果内部模块的 UI 未出现，可能是在外部 UI 函数中忘记在内部模块 ID 周围加 `ns()`。如果 server 通信中断，检查内部模块 ID 是否匹配（server 调用中不加 `ns()`）。

### 第 6 步：单独测试模块

```r
# Quick test app for the module
if (interactive()) {
  shiny::shinyApp(
    ui = fluidPage(
      dataFilterUI("test"),
      DT::dataTableOutput("result")
    ),
    server = function(input, output, session) {
      data <- reactive(iris)
      filtered <- dataFilterServer("test", data, names(iris))
      output$result <- DT::renderDataTable(filtered())
    }
  )
}
```

**预期结果：** 模块在最小测试应用中正常工作。

**失败处理：** 如果模块单独失败但在完整应用中正常（或反之），检查是否隐式依赖全局变量或父 session 状态。

## 验证清单

- [ ] 模块 UI 函数以 `id` 为第一个参数并使用 `NS(id)`
- [ ] UI 中的每个输入/输出 ID 都用 `ns()` 包裹
- [ ] 模块 server 使用 `moduleServer(id, function(input, output, session) { ... })`
- [ ] server 中的动态 UI 使用 `session$ns` 处理 ID
- [ ] 模块可多次实例化而不产生 ID 冲突
- [ ] 响应式返回值对父应用可访问
- [ ] 模块在最小独立测试应用中正常工作

## 常见问题

- **忘记在 `renderUI()` 中使用 `ns()`**：server 内部创建的动态 UI 必须使用 `session$ns`——外部 `ns` 在 `moduleServer()` 内不可用。
- **传递非响应式数据**：随时间变化的模块参数必须是响应式表达式。传 `reactive(data)` 而非 `data`。
- **ID 不匹配**：UI 调用中的 `id` 字符串必须与 server 调用中的 `id` 完全匹配。
- **不返回响应式值**：如果模块计算了父应用需要的内容，必须 `return()` 一个响应式值。遗漏这一点是静默 bug。
- **嵌套模块中的命名空间**：UI 中：`ns("inner_id")`。server 中：仅 `"inner_id"`。混用会导致命名空间双重包裹或前缀缺失。

## 相关技能

- `scaffold-shiny-app` — 添加模块前设置应用结构
- `test-shiny-app` — 用 testServer() 单元测试模块
- `design-shiny-ui` — 模块 UI 的 bslib 布局和主题
- `optimize-shiny-performance` — 模块内的缓存和异步模式
