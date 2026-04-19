---
name: build-shiny-module
locale: wenyan-ultra
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

# 建 Shiny 模

造可重用之 Shiny UI/server 模對附名間隔、反應通、可組。

## 用

- 自增長 Shiny 應取可重用件
- 建於多處用之 UI 件
- 以清介包繁反應邏
- 自小可試單組大應

## 入

- **必**：模旨與能述
- **必**：入/出契（模受與返何）
- **可**：模嵌他模否（默：否）
- **可**：框脈（golem、rhino、或原生）

## 行

### 一：定模介

書碼前→定模受何返何：

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**得：** 清契附反應入、反應出、UI 件。

**敗：** 介不清→模或過廣。分為單責之小模。

### 二：造模 UI 函

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
- 函名循 `<name>UI` 規
- 首參必為 `id`
- 首行造 `ns <- NS(id)`
- 每 `inputId` 與 `outputId` 以 `ns()` 包
- 返 `tagList()` 以允活置

**得：** UI 函造含名間隔之入/出件。

**敗：** 模二用 ID 撞→察每 ID 以 `ns()` 包。常遺：`renderUI()` 或 `uiOutput()` 中之 ID—此亦需 `ns()`。

### 三：造模 Server 函

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
- 函名循 `<name>Server` 規
- 首參必為 `id`
- 餘參為反應表或靜值
- 用 `moduleServer(id, function(input, output, session) { ... })`
- Server 內動 UI 用 `session$ns`
- 顯返反應值

**得：** server 函處入返反應出。

**敗：** 反應值不更→察動 UI 之入用 `session$ns`（非外 `ns`）。模返 NULL→確 `return()` 為 `moduleServer()` 內末表。

### 四：連模於父應

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

**得：** 模現 UI 且返反應流至下游出。

**敗：** 模 UI 不渲→驗 `id` 串於 UI 與 server 呼合。返反應 NULL→察 server 函實返值。

### 五：組嵌模（可選）

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

要律：UI 中以 `ns("inner_id")` 嵌。Server 中唯 `"inner_id"`—`moduleServer` 處名鏈。

**得：** 內模於外模名間正渲。

**敗：** 內模 UI 不現→或外 UI 函忘 `ns()` 包內模 ID。server 通破→察內模 ID 合（server 呼無 `ns()`）。

### 六：隔試模

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

**得：** 模於最簡試應正行。

**敗：** 模隔敗而全應行（或反）→察隱全變依或父會態。

## 驗

- [ ] 模 UI 函受 `id` 首參且用 `NS(id)`
- [ ] UI 中每入/出 ID 以 `ns()` 包
- [ ] 模 server 用 `moduleServer(id, function(input, output, session) { ... })`
- [ ] server 中動 UI 用 `session$ns` 於 ID
- [ ] 模可多實無 ID 撞
- [ ] 反應返值父應可達
- [ ] 模於最簡獨試應行

## 忌

- **`renderUI()` 中忘 `ns()`**：server 內造動 UI 必用 `session$ns`—外 `ns` 於 `moduleServer()` 內不可得。
- **傳非反應資**：經時變之模參必為反應表。傳 `reactive(data)` 非 `data`。
- **ID 不合**：UI 呼與 server 呼之 `id` 串必全合。
- **不返反應**：模算父所需→必 `return()` 反應。忘此為默誤。
- **嵌模名間**：UI：`ns("inner_id")`。server：唯 `"inner_id"`。混此致名重包或缺前。

## 參

- `scaffold-shiny-app` — 加模前設應構
- `test-shiny-app` — 以 testServer() 單試模
- `design-shiny-ui` — 模 UI 之 bslib 布與題
- `optimize-shiny-performance` — 模中快與異模
