---
name: build-shiny-module
locale: wenyan
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

# 建 Shiny 之模

建可復之 Shiny UI/server 模對，以 NS() 正隔名空，通以 reactive，組可複。

## 用時

- 自成長之 Shiny 應取可復之件
- 建多處所用之 UI 物
- 以清介封繁 reactive 邏
- 自小可測之元組大應

## 入

- **必要**：模之旨與功述
- **必要**：入出契（模所受與所返）
- **可選**：模是否嵌他模（默：否）
- **可選**：框脈（golem、rhino、或 vanilla）

## 法

### 第一步：定模之介

書碼前，定模所受與所返：

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**得：** 清契，明 reactive 入、reactive 出、UI 元。

**敗則：** 若介不明，模或太泛。分為單責之小模。

### 第二步：建模之 UI 函

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

要律：
- 函名循 `<name>UI` 之規
- 首參恆為 `id`
- 頂立 `ns <- NS(id)`
- 諸 `inputId` 與 `outputId` 皆裹以 `ns()`
- 返 `tagList()` 以容彈置

**得：** UI 函建名空之入出元。

**敗則：** 若模二用而 ID 衝，察諸 ID 皆以 `ns()` 裹。常失：於 `renderUI()` 或 `uiOutput()` 內之 ID——亦須 `ns()`。

### 第三步：建模之 server 函

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

要律：
- 函名循 `<name>Server` 之規
- 首參恆為 `id`
- 餘參為 reactive 式或靜值
- 用 `moduleServer(id, function(input, output, session) { ... })`
- server 內動 UI 用 `session$ns`
- 明返 reactive 值

**得：** server 函處入而返 reactive 出。

**敗則：** 若 reactive 不更，察動 UI 之入用 `session$ns`（非外 `ns`）。若模返 NULL，確 `return()` 為 `moduleServer()` 內末式。

### 第四步：連模於父應

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

**得：** 模現於 UI，所返 reactive 流於下游。

**敗則：** 若模 UI 不渲，驗 UI 與 server 呼間之 `id` 合。若所返 reactive 為 NULL，察 server 函實返值。

### 第五步：組嵌模（選）

含他模之模：

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

要律：UI 中以 `ns("inner_id")` 嵌。server 中呼以 `"inner_id"` 而已——`moduleServer` 自處名空之串。

**得：** 內模於外模之名空正渲。

**敗則：** 若內模 UI 不現，或忘於外 UI 函中裹 `ns()` 於內模 ID。若 server 通斷，察內模 ID 合（server 呼中無 `ns()`）。

### 第六步：獨測模

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

**得：** 模於至簡測應中正行。

**敗則：** 若模獨敗而全應中行（或反），察隱依於全變或父 session 態。

## 驗

- [ ] 模 UI 函首受 `id` 而用 `NS(id)`
- [ ] UI 中諸入出 ID 皆以 `ns()` 裹
- [ ] 模 server 用 `moduleServer(id, function(input, output, session) { ... })`
- [ ] server 內動 UI 用 `session$ns` 為 ID
- [ ] 模可多例而 ID 不衝
- [ ] reactive 返值可於父應取
- [ ] 模於至簡獨測應中行

## 陷

- **忘 `renderUI()` 中之 `ns()`**：server 內建之動 UI 必用 `session$ns`——外 `ns` 於 `moduleServer()` 內不可用
- **傳非 reactive 資料**：模參隨時變者必為 reactive 式。傳 `reactive(data)`，勿 `data`
- **ID 不合**：UI 呼之 `id` 串必全合 server 呼之 `id`
- **未返 reactive**：若模算父所須之值，必 `return()` 一 reactive。忘之為默蟲
- **嵌模之名空**：UI 用 `ns("inner_id")`。server 用 `"inner_id"`。混之致名空雙裹或前綴缺

## 參

- `scaffold-shiny-app` — 加模前立應構
- `test-shiny-app` — 以 testServer() 單測模
- `design-shiny-ui` — 模 UI 之 bslib 佈與主題
- `optimize-shiny-performance` — 模中緩與異模式
