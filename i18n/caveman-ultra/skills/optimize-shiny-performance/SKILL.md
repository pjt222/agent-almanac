---
name: optimize-shiny-performance
locale: caveman-ultra
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

# Optimize Shiny Performance

Profile + opt: caching, async, reactive graph.

## Use When

- Slow / unresponsive interaction
- Server resources exhausted under concurrent load
- Specific ops bottleneck (data load, plot, compute)
- Prep for prod w/ many users

## In

- **Required**: Path to Shiny app
- **Required**: Perf problem desc (slow load, laggy, high mem)
- **Optional**: Expected concurrent users
- **Optional**: Server resources (RAM, CPU cores)
- **Optional**: DB or API used?

## Do

### Step 1: Profile

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

ID top bottlenecks:
1. **Data load**: initial fetch time?
2. **Reactive recalc**: which reactives fire most?
3. **Render**: which outputs slowest?
4. **External**: DB queries, API, file I/O?

Reactive log for graph analysis:

```r
# Enable reactive logging
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Press Ctrl+F3 in the browser to view the reactive graph
```

→ Clear ID of 2-3 biggest bottlenecks.

If err: profvis not detailed → wrap specific sections w/ `profvis::profvis()`. Reactlog overwhelming → focus one interaction at a time.

### Step 2: Opt reactive graph

Cut unnecessary invalidations.

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

`isolate()` to prevent unnecessary invalidations:

```r
# Only recompute when the button is clicked, not on every input change
output$result <- renderText({
  input$compute  # Take dependency on button
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

`debounce()` + `throttle()` for high-freq inputs:

```r
# Debounce text input — wait 500ms after user stops typing
search_text <- reactive(input$search) |> debounce(500)

# Throttle slider — update at most every 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

→ Reactive graph fires only necessary recalcs.

If err: removing dep breaks → use `req()` for explicit guards instead of implicit reactive deps.

### Step 3: Caching

#### bindCache for outputs

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` uses inputs as cache keys. Same inputs → cached result returned immediately.

#### memoise for fns

```r
# Cache expensive function results
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### App-level pre-compute

```r
# In global.R or outside server function — computed once at app startup
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data and model are available to all sessions
  # without reloading
}
```

→ Repeated ops use cache; response time drops.

If err: cache too big → set `max_age` / `max_size`. Stale → reduce `max_age` or cache-clear button. `bindCache` errors → ensure cache key inputs serializable.

### Step 4: Async for long ops

`ExtendedTask` (Shiny ≥ 1.8.1):

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

For Shiny < 1.8.1, promises directly:

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

→ Long ops don't block UI; other users can interact during.

If err: `future_promise` errors → check `plan(multisession)` set. Vars unavailable in future → pass explicitly (separate R process).

### Step 5: Opt rendering

Cut render overhead.

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

→ Render faster, no UI block.

If err: plotly slow w/ big data → `toWebGL()` or downsample before plot.

### Step 6: Validate

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

→ Measurable improvement in response times / concurrent capacity.

If err: no improvement → re-profile for next bottleneck. Iterative — fix biggest first, re-measure.

## Check

- [ ] Profiling IDs specific bottlenecks (not guessing)
- [ ] Reactive graph: no unnecessary invalidation chains
- [ ] Expensive ops use cache (bindCache/memoise)
- [ ] Long ops use async (ExtendedTask/promises)
- [ ] High-freq inputs use debounce/throttle
- [ ] Big data → server-side
- [ ] Improvement measurable (before/after)

## Traps

- **Premature opt**: profile first. Bottleneck rarely where you think
- **Cache invalidation bugs**: stale data → cache key missing inputs. Add deps to `bindCache()`
- **Future variable scoping**: `future_promise` = separate process. Globals, DB conns, reactive vals → capture explicitly
- **Reactive spaghetti**: too complex graph → architectural refactor (modules), not just cache
- **Over-caching**: caching all = waste mem. Only expensive ops w/ repeated input patterns

## →

- `build-shiny-module` — modular arch for maintainable reactive code
- `scaffold-shiny-app` — pick right framework from start
- `deploy-shiny-app` — deploy optimized w/ proper resources
- `test-shiny-app` — perf regression tests
