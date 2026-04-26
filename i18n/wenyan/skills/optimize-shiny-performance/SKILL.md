---
name: optimize-shiny-performance
locale: wenyan
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

# 優 Shiny 性能

以剖、緩、異、與反應圖優 Shiny 應之性能。

## 用時

- Shiny 應於用者互時覺緩或不應乃用
- 並發負下服務資源耗盡乃用
- 具操作（載據、繪、計）成瓶頸乃用
- 備多用者生產部署乃用

## 入

- **必要**：Shiny 應之徑
- **必要**：性能患之述（載緩、互滯、高記）
- **可選**：預期並發用者數
- **可選**：可用服務資源（RAM、CPU 核）
- **可選**：用庫或外 API 否

## 法

### 第一步：剖應

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

識諸瓶頸：
1. **載據**：初取據耗時幾何？
2. **反應重算**：何反應最頻發？
3. **渲**：何輸最久？
4. **外調**：庫詢、API 請、文件 I/O？

用反應日誌析反應圖：

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

**得：** 明識 2-3 大瓶頸。

**敗則：** profvis 不示有用細者，以 `profvis::profvis()` 包具節。reactlog 過繁者，焦於一互一時。

### 第二步：優反應圖

減無謂反應失效：

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

用 `isolate()` 防無謂失效：

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

用 `debounce()` 與 `throttle()` 為高頻入：

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**得：** 反應圖唯需重算時發。

**敗則：** 去依致敗者，用 `req()` 加明守而非賴隱反應依。

### 第三步：行緩

#### 用 bindCache 為 Shiny 輸出

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` 以入值為緩鍵。同入再現時即返緩果。

#### 用 memoise 為函

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### 應級據先算

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

**得：** 復作用緩果；應時顯減。

**敗則：** 緩過大者，設 `max_age` 或 `max_size` 限。緩值陳者，減 `max_age` 或加緩清鈕。`bindCache` 致誤者，確緩鍵入可序。

### 第四步：為長作加異

用 `ExtendedTask`（Shiny >= 1.8.1）為長計：

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

Shiny < 1.8.1 之應，直用 promises：

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

**得：** 長作不阻 UI；計時他用者可互。

**敗則：** `future_promise` 誤者，察 `plan(multisession)` 已設。變量於 future 不可得者，明傳——future 行於別 R 程。

### 第五步：優渲

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

**得：** 渲操更快不阻 UI。

**敗則：** plotly 大據時緩者，用 `toWebGL()` 為 WebGL 渲或繪前下採。

### 第六步：驗性能改

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

**得：** 應時或並發容量可量改。

**敗則：** 性能未改者，重剖以尋下一瓶頸。性能優為迭——先修最大瓶頸，再量。

## 驗

- [ ] 剖識具瓶頸（非猜）
- [ ] 反應圖無無謂失效鏈
- [ ] 耗作用緩（bindCache 或 memoise）
- [ ] 長計用異（ExtendedTask 或 promises）
- [ ] 高頻入用 debounce/throttle
- [ ] 大據用服務側處
- [ ] 性能改可量（前後計時）

## 陷

- **早優**：先剖。瓶頸常非所想處
- **緩失效誤**：用者見陳據者，緩鍵未含諸相關入。加缺依於 `bindCache()`
- **future 變量範**：`future_promise` 行於別程。全變、庫連、反應值須明捕
- **反應糾纏**：反應圖過繁不能解者，應需架構重構（模塊），非僅緩
- **過緩**：皆緩費記。唯緩耗且有復入模之作

## 參

- `build-shiny-module` — 為可維反應碼之模架構
- `scaffold-shiny-app` — 始即選宜應框
- `deploy-shiny-app` — 以宜服資部優應
- `test-shiny-app` — 性能退試
