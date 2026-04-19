---
name: build-shiny-module
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build reusable Shiny modules with proper namespace isolation using NS().
  Covers module UI/server pairs, reactive return values, inter-module
  communication, and nested module composition. Use when extracting a reusable
  component from a growing Shiny app, building a UI widget used in multiple
  places, encapsulating complex reactive logic behind a clean interface, or
  composing larger applications from smaller, testable units.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, modules, namespace, reactive, composition
---

# Build Shiny Module

創具正命名空間隔離、反應式溝通、可組合之可復用 Shiny UI/server 模組對。

## 適用時機

- 自漸長之 Shiny 應用抽可復用組件
- 建多處可用之 UI 小部件
- 以潔介面封繁之反應邏輯
- 自更小可測之單位組大應用

## 輸入

- **必要**：模組之旨與功能描
- **必要**：輸入／輸出之合同（模組受何返何）
- **選擇性**：模組是否嵌他模組（預設：否）
- **選擇性**：框架脈絡（golem、rhino、或 vanilla）

## 步驟

### 步驟一：定模組介面

書代碼前，定模組所受所返：

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**預期：** 明之合同，指定反應輸入、反應輸出、UI 元素。

**失敗時：** 若介面不明，模組恐過廣。分為單責之小模組。

### 步驟二：創模組 UI 函

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

要則：
- 函名循 `<name>UI` 約定
- 首參恆為 `id`
- 於頂立 `ns <- NS(id)`
- 每 `inputId` 與 `outputId` 皆包於 `ns()`
- 返 `tagList()` 以允彈性置

**預期：** UI 函創命名空間之輸入／輸出元素。

**失敗時：** 若用模組二次時 ID 碰撞，查每 ID 皆包於 `ns()`。常漏：`renderUI()` 或 `uiOutput()` 內之 ID——此亦需 `ns()`。

### 步驟三：創模組伺服器函

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

要則：
- 函名循 `<name>Server` 約定
- 首參恆為 `id`
- 餘參為反應式表達或靜值
- 用 `moduleServer(id, function(input, output, session) { ... })`
- 伺服器內創之動態 UI 用 `session$ns`
- 明返反應值

**預期：** 伺服器函處輸入、返反應輸出。

**失敗時：** 若反應值不更，查動態 UI 之輸入用 `session$ns`（非外之 `ns`）。若模組返 NULL，確 `return()` 為 `moduleServer()` 內末表達。

### 步驟四：於父應用接模組

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

**預期：** 模組於 UI 顯，其所返反應流至下游輸出。

**失敗時：** 若模組 UI 不渲，驗 UI 與伺服器呼間 `id` 字串相符。若所返反應為 NULL，查伺服器函實返值。

### 步驟五：組嵌模組（選）

含他模組之模組：

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

要則：UI 中以 `ns("inner_id")` 嵌。伺服器中僅以 `"inner_id"` 呼——`moduleServer` 處命名空間之鏈。

**預期：** 內模組於外模組之命名空間中正渲。

**失敗時：** 若內模組 UI 不現，恐忘於外 UI 函中以 `ns()` 包內模組 ID。若伺服器溝通斷，查內模組 ID 相符（伺服器呼中無 `ns()`）。

### 步驟六：隔離測模組

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

**預期：** 模組於最小測應用中正工。

**失敗時：** 若模組於隔離敗而於全應用工（或反），查對全域變或父會話狀態之隱依。

## 驗證

- [ ] 模組 UI 函受 `id` 為首參且用 `NS(id)`
- [ ] UI 中每輸入／輸出 ID 皆包於 `ns()`
- [ ] 模組伺服器用 `moduleServer(id, function(input, output, session) { ... })`
- [ ] 伺服器中動態 UI 之 ID 用 `session$ns`
- [ ] 模組可實例化多次而無 ID 碰撞
- [ ] 反應返值可為父應用存取
- [ ] 模組於最小獨立測應用中工

## 常見陷阱

- **`renderUI()` 中忘 `ns()`**：伺服器內創之動態 UI 須用 `session$ns`——外之 `ns` 於 `moduleServer()` 內不可得
- **傳非反應數據**：隨時變之模組參須為反應式表達。傳 `reactive(data)` 非 `data`
- **ID 失配**：UI 呼中之 `id` 字串須與伺服器呼中之 `id` 完相符
- **不返反應**：若模組算父所需之物，須 `return()` 一反應。忘此為默錯
- **嵌模組之命名空間**：UI：`ns("inner_id")`。伺服器：僅 `"inner_id"`。混致雙包或漏前綴

## 相關技能

- `scaffold-shiny-app` — 加模組前立應用結構
- `test-shiny-app` — 以 testServer() 單元測測模組
- `design-shiny-ui` — 模組 UI 之 bslib 版型與主題
- `optimize-shiny-performance` — 模組內之快取與 async 模式
