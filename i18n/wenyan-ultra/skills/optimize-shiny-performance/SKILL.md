---
name: optimize-shiny-performance
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Profile and optimize Shiny application performance using profvis,
  bindCache, memoise, async/promises, debounce/throttle, and
  ExtendedTask for long-running computations. Use when the app feels slow
  or unresponsive during user interaction, when server resources are exhausted
  under concurrent load, when specific operations create bottlenecks, or when
  preparing an app for production deployment with many concurrent users.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shiny, performance, profiling, caching, async, promises, optimization
---

# 省 Shiny 性能

藉快取、async、應圖優之 Shiny 性能診省。

## 用

- 用時 Shiny 緩或不應
- 並用負下伺資源耗
- 某操（載、繪、算）為瓶
- 備多用之生產部署

## 入

- **必**：Shiny 用之路
- **必**：性能疾述（載緩、互滯、記憶高）
- **可**：預期並用數
- **可**：可用伺資（RAM、CPU）
- **可**：用否用庫或外 API

## 行

### 一：剖用

```r
# Profile with profvis
profvis::profvis({
  shiny::runApp("path/to/app", display.mode = "normal")
})

# Or profile specific operations
profvis::profvis({
  result <- expensive_computation(data)
})
```

識最瓶：
1. **載料**：初載幾時？
2. **應重算**：何應最頻發？
3. **渲**：何輸最久？
4. **外調**：庫詢、API、I/O？

用應日誌析應圖：

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

**得：** 明識 2-3 大瓶。

**敗：** profvis 不顯詳→於特段包 `profvis::profvis()`。reactlog 過繁→專注一互動。

### 二：省應圖

減無謂應失效：

```r
# BAD: Recomputes on ANY input change
output$plot <- renderPlot({
  data <- load_data()  # Runs every time
  filtered <- data[data$category == input$category, ]
  plot(filtered)
})

# GOOD: Isolate data loading from filtering
raw_data <- reactive({
  load_data()
}) |> bindCache()  # Cache the expensive part

filtered_data <- reactive({
  raw_data()[raw_data()$category == input$category, ]
})

output$plot <- renderPlot({
  plot(filtered_data())
})
```

用 `isolate()` 阻無謂失效：

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

高頻輸用 `debounce()` + `throttle()`：

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**得：** 應圖但發必算。

**敗：** 除依破能→用 `req()` 加明守、勿賴隱應依。

### 三：施快取

#### bindCache 為 Shiny 輸

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` 以輸值為鍵。同輸再現則即返快取。

#### memoise 為函

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### 用級預算

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

**得：** 復操用快取、應時顯減。

**敗：** 快取過大→設 `max_age` 或 `max_size`。值陳→減 `max_age` 或加清鈕。`bindCache` 誤→確鍵輸可序化。

### 四：長操加 async

長算用 `ExtendedTask`（Shiny ≥ 1.8.1）：

```r
server <- function(input, output, session) {
  # Define the extended task
  analysis_task <- ExtendedTask$new(function(data, params) {
    promises::future_promise({
      # This runs in a background process
      run_heavy_analysis(data, params)
    })
  }) |> bind_task_button("run_analysis")

  # Trigger the task
  observeEvent(input$run_analysis, {
    analysis_task$invoke(dataset(), input$params)
  })

  # Use the result
  output$result <- renderTable({
    analysis_task$result()
  })
}
```

舊版（< 1.8.1）直用 promises：

```r
library(promises)
library(future)
plan(multisession, workers = 4)

server <- function(input, output, session) {
  result <- eventReactive(input$compute, {
    future_promise({
      Sys.sleep(5)  # Simulate long computation
      expensive_analysis(isolate(input$params))
    })
  })

  output$table <- renderTable({
    result()
  })
}
```

**得：** 長操不阻 UI、他用算時可互動。

**敗：** `future_promise` 誤→確 `plan(multisession)` 已設。future 中不見變→須明傳—future 行於別 R 程。

### 五：省渲

減渲耗：

```r
# Use plotly for interactive plots instead of re-rendering
output$plot <- plotly::renderPlotly({
  plotly::plot_ly(filtered_data(), x = ~x, y = ~y, type = "scatter")
})

# Use server-side DT for large tables
output$table <- DT::renderDataTable({
  DT::datatable(large_data(), server = TRUE, options = list(
    pageLength = 25,
    processing = TRUE
  ))
})

# Conditional UI to avoid rendering hidden elements
output$details <- renderUI({
  req(input$show_details)
  expensive_details_ui()
})
```

**得：** 渲速、不阻 UI。

**敗：** plotly 對大料慢→用 `toWebGL()` 或先降採料。

### 六：驗性能改善

```r
# Before/after benchmarking
system.time({
  shiny::testServer(myModuleServer, args = list(...), {
    session$setInputs(category = "A")
    session$flushReact()
  })
})

# Load testing with shinyloadtest
shinyloadtest::record_session("http://localhost:3838")
shinyloadtest::shinycannon(
  "recording.log",
  "http://localhost:3838",
  workers = 10,
  loaded_duration_minutes = 5
)
shinyloadtest::shinyloadtest_report("recording.log")
```

**得：** 應時或並用容可量改。

**敗：** 未善→重剖覓次瓶。性能省為迭代—先修最瓶、再量。

## 驗

- [ ] 剖識具瓶（非猜）
- [ ] 應圖無無謂失效鏈
- [ ] 貴操用快取（bindCache 或 memoise）
- [ ] 長算用 async（ExtendedTask 或 promises）
- [ ] 高頻輸用 debounce/throttle
- [ ] 大料用伺端處
- [ ] 改善可量（前後計時）

## 忌

- **早省**：先剖—瓶罕在心想處
- **快取失效**：用見陳料→鍵未含諸相關輸—加缺依於 `bindCache()`
- **future 變範**：`future_promise` 行於別程—全變、庫連、應值須明捕
- **應糾纏**：應圖過雜難解→須架重構（模組）、非但快取
- **過快取**：皆快取耗記憶—惟貴+復現之操方快取

## 參

- `build-shiny-module`
- `scaffold-shiny-app`
- `deploy-shiny-app`
- `test-shiny-app`
