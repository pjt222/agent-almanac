---
name: optimize-shiny-performance
description: >
  使用 profvis、bindCache、memoise、async/promises、debounce/throttle 和
  ExtendedTask 分析并优化 Shiny 应用性能。适用于应用在用户交互时感觉缓慢或
  无响应、并发负载下服务器资源耗尽、特定操作形成瓶颈，或为具有大量并发用户
  的生产部署准备应用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shiny, performance, profiling, caching, async, promises, optimization
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 优化 Shiny 性能

通过缓存、异步操作和响应式图优化对 Shiny 应用性能进行分析、诊断和优化。

## 适用场景

- Shiny 应用在用户交互时感觉缓慢或无响应
- 并发用户负载下服务器资源耗尽
- 特定操作（数据加载、绘图、计算）形成瓶颈
- 为有大量用户的生产部署准备应用

## 输入

- **必需**：Shiny 应用路径
- **必需**：性能问题描述（加载慢、交互卡顿、内存占用高）
- **可选**：预期并发用户数
- **可选**：可用服务器资源（RAM、CPU 核心数）
- **可选**：应用是否使用数据库或外部 API

## 步骤

### 第 1 步：分析应用性能

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

识别主要瓶颈：
1. **数据加载**：初始数据获取需要多长时间？
2. **响应式重算**：哪些响应式触发最频繁？
3. **渲染**：哪些输出渲染时间最长？
4. **外部调用**：数据库查询、API 请求、文件 I/O？

使用响应式日志进行响应式图分析：

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

**预期结果：** 明确识别出 2-3 个最大瓶颈。

**失败处理：** 如果 profvis 未显示有用细节，用 `profvis::profvis()` 包裹特定代码段。如果 reactlog 信息过多，每次专注于一个交互。

### 第 2 步：优化响应式图

减少不必要的响应式失效：

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

使用 `isolate()` 防止不必要的失效：

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

对高频输入使用 `debounce()` 和 `throttle()`：

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**预期结果：** 响应式图只触发必要的重算。

**失败处理：** 如果移除某个依赖项破坏了功能，使用 `req()` 添加显式守卫，而非依赖隐式响应式依赖。

### 第 3 步：实现缓存

#### 对 Shiny 输出使用 bindCache

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` 使用输入值作为缓存键。当相同输入再次出现时，立即返回缓存结果。

#### 对函数使用 memoise

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### 应用级数据预计算

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

**预期结果：** 重复操作使用缓存结果；响应时间显著下降。

**失败处理：** 如果缓存增长过大，设置 `max_age` 或 `max_size` 限制。如果缓存值过期，减少 `max_age` 或添加清除缓存按钮。如果 `bindCache` 导致错误，确保缓存键输入可序列化。

### 第 4 步：为长时操作添加异步

使用 `ExtendedTask`（Shiny >= 1.8.1）处理长时运行计算：

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

对于 Shiny < 1.8.1 的应用，直接使用 promises：

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

**预期结果：** 长时操作不阻塞 UI；计算运行期间其他用户可以继续交互。

**失败处理：** 如果 `future_promise` 报错，检查是否设置了 `plan(multisession)`。如果变量在 future 中不可用，显式传递它们——future 在单独的 R 进程中运行。

### 第 5 步：优化渲染

减少渲染开销：

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

**预期结果：** 渲染操作更快且不阻塞 UI。

**失败处理：** 如果 plotly 在大数据集上较慢，使用 `toWebGL()` 进行 WebGL 渲染，或在绘图前对数据降采样。

### 第 6 步：验证性能改进

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

**预期结果：** 响应时间和/或并发用户容量有可测量的改善。

**失败处理：** 如果性能未改善，重新分析以找到下一个瓶颈。性能优化是迭代过程——先修复最大瓶颈，再重新测量。

## 验证清单

- [ ] 分析识别出具体瓶颈（而非猜测）
- [ ] 响应式图没有不必要的失效链
- [ ] 昂贵操作使用缓存（bindCache 或 memoise）
- [ ] 长时运行计算使用异步（ExtendedTask 或 promises）
- [ ] 高频输入使用 debounce/throttle
- [ ] 大数据集使用服务端处理
- [ ] 性能改善可测量（前后计时对比）

## 常见问题

- **过早优化**：先分析。瓶颈很少在你认为的地方。
- **缓存失效 bug**：如果用户看到过期数据，缓存键没有包含所有相关输入。将缺失的依赖项添加到 `bindCache()`。
- **future 变量作用域**：`future_promise` 在单独进程中运行。全局变量、数据库连接和响应式值必须显式捕获。
- **响应式意大利面**：如果响应式图复杂到难以理解，应用需要架构重构（模块），而不仅仅是缓存。
- **过度缓存**：缓存所有内容会浪费内存。只缓存昂贵且有重复输入模式的操作。

## 相关技能

- `build-shiny-module` — 可维护响应式代码的模块化架构
- `scaffold-shiny-app` — 从一开始选择合适的应用框架
- `deploy-shiny-app` — 以适当服务器资源部署优化后的应用
- `test-shiny-app` — 性能回归测试
