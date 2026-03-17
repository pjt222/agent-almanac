---
name: build-shiny-module
description: >
  使用 NS() 构建具有正确命名空间隔离的可复用 Shiny 模块。涵盖模块 UI/server
  对、响应式返回值、模块间通信及嵌套模块组合。适用于从不断增长的 Shiny 应用中
  提取可复用组件、构建在多处使用的 UI 小部件、将复杂响应式逻辑封装在清晰接口后，
  或从更小的可测试单元组合更大的应用。
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
  translator: claude
  translation_date: "2026-03-17"
---

# 构建 Shiny 模块

创建具有正确命名空间隔离、响应式通信和可组合性的可复用 Shiny UI/server 模块对。

## 适用场景

- 从不断增长的 Shiny 应用中提取可复用组件
- 构建将在多处使用的 UI 小部件
- 将复杂的响应式逻辑封装在清晰的接口后
- 从更小的可测试单元组合更大的应用

## 输入

- **必需**：模块用途和功能描述
- **必需**：输入/输出契约（模块接收和返回什么）
- **可选**：模块是否嵌套其他模块（默认：否）
- **可选**：框架上下文（golem、rhino 或原生）

## 步骤

### 第 1 步：定义模块接口

在编写代码之前，定义模块接受什么和返回什么：

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**预期结果：** 清晰的契约，指定响应式输入、响应式输出和 UI 元素。

**失败处理：** 如果接口不清晰，模块可能过于宽泛。将其拆分为职责单一的更小模块。

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
- 函数名遵循 `<name>UI` 约定
- 第一个参数始终是 `id`
- 在顶部创建 `ns <- NS(id)`
- 用 `ns()` 包裹每个 `inputId` 和 `outputId`
- 返回 `tagList()` 以允许灵活放置

**预期结果：** 创建命名空间化输入/输出元素的 UI 函数。

**失败处理：** 如果两次使用模块时 ID 冲突，检查每个 ID 是否都用 `ns()` 包裹。常见遗漏：`renderUI()` 或 `uiOutput()` 内部的 ID——这些也需要 `ns()`。

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
- 函数名遵循 `<name>Server` 约定
- 第一个参数始终是 `id`
- 附加参数是响应式表达式或静态值
- 使用 `moduleServer(id, function(input, output, session) { ... })`
- 在 server 内部创建的动态 UI 使用 `session$ns`
- 显式返回响应式值

**预期结果：** 处理输入并返回响应式输出的 server 函数。

**失败处理：** 如果响应式值不更新，检查动态 UI 的输入是否使用 `session$ns`（而非外部 `ns`）。如果模块返回 NULL，确保 `return()` 是 `moduleServer()` 内部的最后一个表达式。

### 第 4 步：将模块接入父应用

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

**预期结果：** 模块出现在 UI 中，其返回的响应式流入下游输出。

**失败处理：** 如果模块 UI 不渲染，验证 UI 和 server 调用之间的 `id` 字符串是否匹配。如果返回的响应式为 NULL，检查 server 函数是否确实返回了值。

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

关键规则：在 UI 中，使用 `ns("inner_id")` 嵌套。在 server 中，只用 `"inner_id"` 调用——`moduleServer` 处理命名空间链接。

**预期结果：** 内部模块在外部模块的命名空间内正确渲染。

**失败处理：** 如果内部模块的 UI 不出现，你可能忘记了在外部 UI 函数中用 `ns()` 包裹内部模块的 ID。如果 server 通信断开，检查内部模块 ID 是否匹配（server 调用中不用 `ns()`）。

### 第 6 步：隔离测试模块

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

**失败处理：** 如果模块在隔离环境中失败但在完整应用中工作（或反之），检查是否存在对全局变量或父会话状态的隐式依赖。

## 验证清单

- [ ] 模块 UI 函数接受 `id` 作为第一个参数并使用 `NS(id)`
- [ ] UI 中的每个输入/输出 ID 都用 `ns()` 包裹
- [ ] 模块 server 使用 `moduleServer(id, function(input, output, session) { ... })`
- [ ] server 中的动态 UI 使用 `session$ns` 作为 ID
- [ ] 模块可以多次实例化而不产生 ID 冲突
- [ ] 响应式返回值可被父应用访问
- [ ] 模块在最小独立测试应用中工作

## 常见问题

- **在 `renderUI()` 中忘记 `ns()`**：在 server 内部创建的动态 UI 必须使用 `session$ns`——外部 `ns` 在 `moduleServer()` 内部不可用
- **传递非响应式数据**：随时间变化的模块参数必须是响应式表达式。传递 `reactive(data)` 而非 `data`
- **ID 不匹配**：UI 调用中的 `id` 字符串必须与 server 调用中的 `id` 完全匹配
- **未返回响应式**：如果模块计算了父级需要的内容，它必须 `return()` 一个响应式。遗忘这一点是一个隐性 bug
- **嵌套模块中的命名空间**：在 UI 中：`ns("inner_id")`。在 server 中：只用 `"inner_id"`。混淆这些会导致命名空间双重包裹或缺少前缀

## 相关技能

- `scaffold-shiny-app` — 在添加模块之前设置应用结构
- `test-shiny-app` — 使用 testServer() 单元测试测试模块
- `design-shiny-ui` — 模块 UI 的 bslib 布局和主题设置
- `optimize-shiny-performance` — 模块内的缓存和异步模式
