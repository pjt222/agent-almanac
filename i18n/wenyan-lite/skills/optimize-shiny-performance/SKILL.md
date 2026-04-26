---
name: optimize-shiny-performance
locale: wenyan-lite
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

# 優化 Shiny 性能

透過快取、非同步操作與反應圖優化，剖析、診斷並優化 Shiny 應用之性能。

## 適用時機

- Shiny 應用於用戶互動時感慢或無回應
- 並發用戶負載下伺服器資源耗盡
- 特定操作（資料載入、繪圖、計算）成瓶頸
- 為多用戶生產部署備應用

## 輸入

- **必要**：Shiny 應用之路徑
- **必要**：性能問題之描述（載入慢、互動卡、記憶體高）
- **選擇性**：預期並發用戶數
- **選擇性**：可用伺服器資源（RAM、CPU 核）
- **選擇性**：應用是否用資料庫或外部 API

## 步驟

### 步驟一：剖析應用

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

辨頂部瓶頸：
1. **資料載入**：初始資料抓取耗時多少？
2. **反應重算**：何反應觸發最頻？
3. **渲染**：何輸出渲染最久？
4. **外部呼叫**：資料庫查詢、API 請求、檔案 I/O？

用反應日誌分析反應圖：

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

**預期：** 清晰辨識 2-3 個最大瓶頸。

**失敗時：** 若 profvis 不顯有用之細節，以 `profvis::profvis()` 包特定段。若 reactlog 過繁，每次專一互動。

### 步驟二：優化反應圖

減不必要之反應失效：

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

用 `isolate()` 防不必要之失效：

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

對高頻輸入用 `debounce()` 與 `throttle()`：

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**預期：** 反應圖但觸發必要之重算。

**失敗時：** 若除依賴破壞功能，用 `req()` 加明確守衛而非靠隱式反應依賴。

### 步驟三：實施快取

#### bindCache 為 Shiny 輸出

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` 以輸入值為快取鍵。同輸入再現時即返快取結果。

#### memoise 為函式

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### 應用層資料預計算

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

**預期：** 重複操作用快取結果；回應時間顯減。

**失敗時：** 若快取過大，設 `max_age` 或 `max_size` 上限。若快取值陳舊，減 `max_age` 或加快取清除按鈕。若 `bindCache` 致錯，確快取鍵輸入可序列化。

### 步驟四：為長操作加非同步

對長計算用 `ExtendedTask`（Shiny >= 1.8.1）：

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

Shiny < 1.8.1 之應用，徑用 promises：

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

**預期：** 長操作不阻 UI；計算進行中其他用戶仍可互動。

**失敗時：** 若 `future_promise` 致錯，查 `plan(multisession)` 已設。若變數於 future 中不可得，明傳之——futures 於獨立 R 程序中運行。

### 步驟五：優化渲染

減渲染開銷：

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

**預期：** 渲染操作較快且不阻 UI。

**失敗時：** 若 plotly 對大資料集慢，用 `toWebGL()` 行 WebGL 渲染，或繪圖前下採樣。

### 步驟六：驗性能改進

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

**預期：** 回應時間及/或並發用戶容量有可量之改進。

**失敗時：** 若性能未改進，重剖析以找下一瓶頸。性能優化乃迭代——先修最大瓶頸，後重量。

## 驗證

- [ ] 剖析辨識具體瓶頸（非猜測）
- [ ] 反應圖無不必要之失效鏈
- [ ] 昂貴操作用快取（bindCache 或 memoise）
- [ ] 長計算用非同步（ExtendedTask 或 promises）
- [ ] 高頻輸入用 debounce/throttle
- [ ] 大資料集用伺服端處理
- [ ] 性能改進可量（前後計時）

## 常見陷阱

- **過早優化**：先剖析。瓶頸罕在你以為之處。
- **快取失效錯誤**：若用戶見陳舊資料，快取鍵未含所有相關輸入。將漏依賴加入 `bindCache()`。
- **Future 變數作用域**：`future_promise` 於獨立程序中運行。全域變數、資料庫連接、反應值須明捕之。
- **反應義大利麵**：若反應圖複雜難解，應用須架構重構（模組），非但快取。
- **過度快取**：快取一切浪費記憶體。但快取昂貴且具重複輸入模式之操作。

## 相關技能

- `build-shiny-module` — 為可維護反應代碼之模組化架構
- `scaffold-shiny-app` — 自始擇正確之應用框架
- `deploy-shiny-app` — 以適當伺服器資源部署優化應用
- `test-shiny-app` — 性能回歸測試
