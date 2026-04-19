---
name: build-shiny-module
locale: caveman
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

Create reusable Shiny UI/server module pairs with proper namespace isolation, reactive communication, composability.

## When Use

- Extracting reusable component from growing Shiny app
- Building UI widget used in multiple places
- Encapsulating complex reactive logic behind clean interface
- Composing larger applications from smaller, testable units

## Inputs

- **Required**: Module purpose and functionality description
- **Required**: Input/output contract (what module receives and returns)
- **Optional**: Whether module nests other modules (default: no)
- **Optional**: Framework context (golem, rhino, vanilla)

## Steps

### Step 1: Define the Module Interface

Before writing code, define what module accepts and returns:

```
Module: data_filter
Inputs: reactive dataset, column names to filter on
Outputs: reactive filtered dataset
UI: filter controls (selectInput, sliderInput, dateRangeInput)
```

**Got:** Clear contract specifying reactive inputs, reactive outputs, UI elements.

**If fail:** Interface unclear? Module probably too broad. Split into smaller modules with single responsibilities.

### Step 2: Create the Module UI Function

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
- Function name follows `<name>UI` convention
- First argument is always `id`
- Create `ns <- NS(id)` at top
- Wrap every `inputId` and `outputId` with `ns()`
- Return `tagList()` to allow flexible placement

**Got:** UI function creating namespaced input/output elements.

**If fail:** IDs collide when using module twice? Check every ID wrapped with `ns()`. Common miss: IDs inside `renderUI()` or `uiOutput()` — these need `ns()` too.

### Step 3: Create the Module Server Function

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
- Function name follows `<name>Server` convention
- First argument is always `id`
- Additional arguments are reactive expressions or static values
- Use `moduleServer(id, function(input, output, session) { ... })`
- Use `session$ns` for dynamic UI created inside server
- Return reactive values explicitly

**Got:** Server function processing inputs and returning reactive output.

**If fail:** Reactive values don't update? Check inputs from dynamic UI use `session$ns` (not outer `ns`). Module returns NULL? Ensure `return()` is last expression inside `moduleServer()`.

### Step 4: Wire the Module into the Parent App

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

**Got:** Module appears in UI and its returned reactive flows into downstream outputs.

**If fail:** Module UI doesn't render? Verify `id` string matches between UI and server calls. Returned reactive is NULL? Check server function actually returns value.

### Step 5: Compose Nested Modules (Optional)

For modules containing other modules:

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

Key rule: In UI, nest with `ns("inner_id")`. In server, call with just `"inner_id"` — `moduleServer` handles namespace chaining.

**Got:** Inner module renders correctly within outer module's namespace.

**If fail:** Inner module's UI doesn't appear? Likely forgot `ns()` around inner module's ID in outer UI function. Server communication breaks? Check inner module ID matches (no `ns()` in server call).

### Step 6: Test the Module in Isolation

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

**Got:** Module works correctly in minimal test app.

**If fail:** Module fails in isolation but works in full app (or vice versa)? Check for implicit dependencies on global variables or parent session state.

## Checks

- [ ] Module UI function accepts `id` as first argument, uses `NS(id)`
- [ ] Every input/output ID in UI wrapped with `ns()`
- [ ] Module server uses `moduleServer(id, function(input, output, session) { ... })`
- [ ] Dynamic UI in server uses `session$ns` for IDs
- [ ] Module can be instantiated multiple times without ID collisions
- [ ] Reactive return values accessible to parent app
- [ ] Module works in minimal standalone test app

## Pitfalls

- **Forgetting `ns()` in `renderUI()`**: Dynamic UI created inside server must use `session$ns` — outer `ns` not available inside `moduleServer()`.
- **Passing non-reactive data**: Module arguments that change over time must be reactive expressions. Pass `reactive(data)` not `data`.
- **ID mismatch**: `id` string in UI call must exactly match `id` in server call.
- **Not returning reactives**: Module computes something parent needs? Must `return()` a reactive. Forgetting this is silent bug.
- **Namespace in nested modules**: In UI: `ns("inner_id")`. In server: just `"inner_id"`. Mixing these up causes namespace double-wrapping or missing prefixes.

## See Also

- `scaffold-shiny-app` — set up app structure before adding modules
- `test-shiny-app` — test modules with testServer() unit tests
- `design-shiny-ui` — bslib layout and theming for module UIs
- `optimize-shiny-performance` — cache and async patterns within modules
