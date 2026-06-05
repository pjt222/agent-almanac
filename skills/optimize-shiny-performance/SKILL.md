---
name: optimize-shiny-performance
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

# Optimize Shiny Performance

Profile, diagnose, and optimize Shiny application performance through caching, async operations, and reactive graph optimization.

## When to Use

- Shiny app feels slow or unresponsive during user interaction
- Server resources are exhausted under concurrent user load
- Specific operations (data loading, plotting, computation) create bottlenecks
- Preparing an app for production deployment with many users

## Inputs

- **Required**: Path to the Shiny application
- **Required**: Description of the performance problem (slow load, laggy interaction, high memory)
- **Optional**: Number of expected concurrent users
- **Optional**: Available server resources (RAM, CPU cores)
- **Optional**: Whether the app uses a database or external API

## Procedure

### Step 1: Profile the Application

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

Identify the top bottlenecks:
1. **Data loading**: How long does initial data fetch take?
2. **Reactive recalculation**: Which reactives fire most often?
3. **Rendering**: Which outputs take the longest to render?
4. **External calls**: Database queries, API requests, file I/O?

Use the reactive log for reactive graph analysis:

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

**Expected:** Clear identification of the 2-3 biggest bottlenecks.

**On failure:** If profvis doesn't show useful detail, wrap specific sections with `profvis::profvis()`. If reactlog is overwhelming, focus on one interaction at a time.

### Step 2: Optimize Reactive Graph

Reduce unnecessary reactive invalidations:

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

Use `isolate()` to prevent unnecessary invalidations:

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

Use `debounce()` and `throttle()` for high-frequency inputs:

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**Expected:** Reactive graph fires only necessary recalculations.

**On failure:** If removing a dependency breaks functionality, use `req()` to add explicit guards instead of relying on implicit reactive dependencies.

### Step 3: Implement Caching

#### bindCache for Shiny Outputs

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` uses input values as cache keys. When the same inputs occur again, the cached result is returned immediately.

#### memoise for Functions

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### App-level Data Pre-computation

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

**Expected:** Repeated operations use cached results; response time drops significantly.

**On failure:** If cache grows too large, set `max_age` or `max_size` limits. If cached values are stale, reduce `max_age` or add a cache-clear button. If `bindCache` causes errors, ensure cache key inputs are serializable.

### Step 4: Add Async for Long Operations

Use `ExtendedTask` (Shiny >= 1.8.1) for long-running computations:

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

For apps on Shiny < 1.8.1, use promises directly:

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

**Expected:** Long operations don't block the UI; other users can interact while computation runs.

**On failure:** If `future_promise` errors, check that `plan(multisession)` is set. If variables aren't available in the future, pass them explicitly — futures run in separate R processes.

### Step 5: Optimize Rendering

Reduce rendering overhead:

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

**Expected:** Rendering operations are faster and don't block the UI.

**On failure:** If plotly is slow with large datasets, use `toWebGL()` for WebGL rendering or downsample data before plotting.

### Step 6: Validate Performance Improvements

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

**Expected:** Measurable improvement in response times and/or concurrent user capacity.

**On failure:** If performance didn't improve, re-profile to find the next bottleneck. Performance optimization is iterative — fix the biggest bottleneck first, then re-measure.

## Validation

- [ ] Profiling identifies specific bottlenecks (not guessing)
- [ ] Reactive graph has no unnecessary invalidation chains
- [ ] Expensive operations use caching (bindCache or memoise)
- [ ] Long-running computations use async (ExtendedTask or promises)
- [ ] High-frequency inputs use debounce/throttle
- [ ] Large datasets use server-side processing
- [ ] Performance improvement is measurable (before/after timing)

## Common Pitfalls

- **Premature optimization**: Profile first. The bottleneck is rarely where you think it is.
- **Cache invalidation bugs**: If users see stale data, the cache key doesn't include all relevant inputs. Add missing dependencies to `bindCache()`.
- **Future variable scoping**: `future_promise` runs in a separate process. Global variables, database connections, and reactive values must be captured explicitly.
- **Reactive spaghetti**: If the reactive graph is too complex to understand, the app needs architectural refactoring (modules), not just caching.
- **Over-caching**: Caching everything wastes memory. Only cache operations that are expensive AND have repeated input patterns.

## Related Skills

- `build-shiny-module` — modular architecture for maintainable reactive code
- `scaffold-shiny-app` — choose the right app framework from the start
- `deploy-shiny-app` — deploy optimized apps with appropriate server resources
- `test-shiny-app` — performance regression tests
