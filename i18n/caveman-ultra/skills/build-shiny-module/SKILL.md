---
name: build-shiny-module
locale: caveman-ultra
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

Reusable Shiny UI/server module pairs w/ proper namespace isolation, reactive comm, composability.

## Use When

- Extract reusable component from growing Shiny app
- UI widget used in many places
- Encapsulate complex reactive logic behind clean interface
- Compose larger apps from smaller testable units

## In

- **Required**: Module purpose + fn desc
- **Required**: In/out contract (what module receives + returns)
- **Optional**: Whether module nests others (default: no)
- **Optional**: Framework ctx (golem, rhino, vanilla)

## Do

### Step 1: Define Interface

Before code, define accepts + returns:

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**→** Clear contract w/ reactive ins, reactive outs, UI elements.

**If err:** Interface unclear → module too broad. Split into smaller, single responsibilities.

### Step 2: Module UI Fn

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

Key rules:
- Fn name: `<name>UI` convention
- First arg always `id`
- `ns <- NS(id)` at top
- Wrap every `inputId` + `outputId` w/ `ns()`
- Return `tagList()` for flexible placement

**→** UI fn creates namespaced in/out elements.

**If err:** IDs collide when module used twice → check every ID wrapped w/ `ns()`. Common miss: IDs inside `renderUI()` or `uiOutput()` — also need `ns()`.

### Step 3: Module Server Fn

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

Key rules:
- Fn name: `<name>Server` convention
- First arg always `id`
- Additional args = reactive exprs or static values
- Use `moduleServer(id, function(input, output, session) { ... })`
- Use `session$ns` for dynamic UI inside server
- Return reactive values explicitly

**→** Server fn processes ins + returns reactive out.

**If err:** Reactives don't update → check ins from dynamic UI use `session$ns` (not outer `ns`). Module returns NULL → ensure `return()` is last expr in `moduleServer()`.

### Step 4: Wire Module into Parent

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

**→** Module appears in UI, returned reactive flows into downstream outs.

**If err:** UI doesn't render → verify `id` matches between UI + server calls. Returned reactive NULL → check server fn actually returns value.

### Step 5: Nested Modules (Optional)

Modules containing other modules:

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

Key: UI nests w/ `ns("inner_id")`. Server calls w/ just `"inner_id"` — `moduleServer` handles namespace chaining.

**→** Inner module renders correctly w/in outer's namespace.

**If err:** Inner UI doesn't appear → likely forgot `ns()` around inner ID in outer UI. Server comm breaks → check inner ID matches (no `ns()` in server call).

### Step 6: Test in Isolation

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

**→** Module works correctly in minimal test app.

**If err:** Fails in isolation but works in full app (or reverse) → implicit deps on global vars or parent session state.

## Check

- [ ] UI fn accepts `id` as first arg + uses `NS(id)`
- [ ] Every in/out ID in UI wrapped w/ `ns()`
- [ ] Server uses `moduleServer(id, function(input, output, session) { ... })`
- [ ] Dynamic UI in server uses `session$ns` for IDs
- [ ] Module instantiable many times w/o ID collisions
- [ ] Reactive returns accessible to parent
- [ ] Works in minimal standalone test

## Traps

- **Forget `ns()` in `renderUI()`**: Dynamic UI inside server must use `session$ns` — outer `ns` not available in `moduleServer()`
- **Non-reactive data**: Args that change over time must be reactive. Pass `reactive(data)` not `data`
- **ID mismatch**: `id` in UI call must exactly match `id` in server call
- **Not returning reactives**: Module computes something parent needs → must `return()` reactive. Silent bug
- **Nested namespace**: UI: `ns("inner_id")`. Server: just `"inner_id"`. Mixing → double-wrapping or missing prefixes

## →

- `scaffold-shiny-app` — set up app structure before adding modules
- `test-shiny-app` — test modules w/ testServer() unit tests
- `design-shiny-ui` — bslib layout + theming for module UIs
- `optimize-shiny-performance` — cache + async patterns w/in modules
