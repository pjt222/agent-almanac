---
name: scaffold-shiny-app
description: >
  Scaffold a new Shiny application using golem (production R package),
  rhino (enterprise), or vanilla (quick prototype) structure. Covers
  framework selection, project initialization, and first module creation.
  Use when starting a new interactive web application in R, creating a
  dashboard or data explorer prototype, setting up a production Shiny app as
  an R package with golem, or bootstrapping an enterprise Shiny project with
  rhino.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, web-app, reactive
---

# Scaffold Shiny App

Create a new Shiny application with production-ready structure using golem, rhino, or vanilla scaffolding.

## When to Use

- Starting a new interactive web application in R
- Creating a dashboard or data explorer prototype
- Setting up a production Shiny app as an R package (golem)
- Bootstrapping an enterprise Shiny project (rhino)

## Inputs

- **Required**: Application name
- **Required**: Framework choice (golem, rhino, or vanilla)
- **Optional**: Whether to include module scaffolding (default: yes)
- **Optional**: Whether to use renv for dependency management (default: yes)
- **Optional**: Deployment target (shinyapps.io, Posit Connect, Docker)

## Procedure

### Step 1: Choose Framework

Evaluate the project requirements to select the appropriate framework:

| Framework | Best For | Structure |
|-----------|----------|-----------|
| **golem** | Production apps shipped as R packages | R package with DESCRIPTION, tests, vignettes |
| **rhino** | Enterprise apps with JS/CSS build pipeline | box modules, Sass, JS bundling, rhino::init() |
| **vanilla** | Quick prototypes and learning | Single app.R or ui.R/server.R pair |

**Expected:** Clear framework decision based on project scope and team needs.

**On failure:** If unsure, default to golem — it provides the most structure and can be simplified later. Vanilla is only appropriate for throwaway prototypes.

### Step 2: Scaffold the Project

#### Golem Path

```r
golem::create_golem("myapp", package_name = "myapp")
```

This creates:
```
myapp/
├── DESCRIPTION
├── NAMESPACE
├── R/
│   ├── app_config.R
│   ├── app_server.R
│   ├── app_ui.R
│   └── run_app.R
├── dev/
│   ├── 01_start.R
│   ├── 02_dev.R
│   ├── 03_deploy.R
│   └── run_dev.R
├── inst/
│   ├── app/www/
│   └── golem-config.yml
├── man/
├── tests/
│   ├── testthat.R
│   └── testthat/
└── vignettes/
```

#### Rhino Path

```r
rhino::init("myapp")
```

This creates:
```
myapp/
├── app/
│   ├── js/
│   ├── logic/
│   ├── static/
│   ├── styles/
│   ├── view/
│   └── main.R
├── tests/
│   ├── cypress/
│   └── testthat/
├── .github/
├── app.R
├── dependencies.R
├── rhino.yml
└── renv.lock
```

#### Vanilla Path

Create `app.R`:

```r
library(shiny)
library(bslib)

ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar(
    sliderInput("n", "Sample size", 10, 1000, 100)
  ),
  card(
    card_header("Output"),
    plotOutput("plot")
  )
)

server <- function(input, output, session) {
  output$plot <- renderPlot({
    hist(rnorm(input$n), main = "Random Normal")
  })
}

shinyApp(ui, server)
```

**Expected:** Project directory created with all scaffolding files.

**On failure:** For golem, ensure the golem package is installed: `install.packages("golem")`. For rhino, install from GitHub: `remotes::install_github("Appsilon/rhino")`. For vanilla, ensure shiny and bslib are installed.

### Step 3: Configure Dependencies

#### Golem/Vanilla

```r
# Initialize renv
renv::init()

# Add core dependencies
usethis::use_package("shiny")
usethis::use_package("bslib")
usethis::use_package("DT")         # if using data tables
usethis::use_package("plotly")     # if using interactive plots

# Snapshot
renv::snapshot()
```

#### Rhino

Dependencies are managed in `dependencies.R`:

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**Expected:** All dependencies recorded in DESCRIPTION (golem) or dependencies.R (rhino) and locked with renv.

**On failure:** If renv::init() fails, check write permissions. If packages fail to install, check R version compatibility.

### Step 4: Create First Module

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

This creates `R/mod_dashboard.R` and `tests/testthat/test-mod_dashboard.R`.

#### Rhino

Create `app/view/dashboard.R`:

```r
box::use(
  shiny[moduleServer, NS, tagList, h3, plotOutput, renderPlot],
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

#### Vanilla

Add module functions to a separate file `R/mod_dashboard.R`:

```r
dashboardUI <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

dashboardServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

**Expected:** Module file created with UI and server functions using proper namespacing.

**On failure:** Ensure the module uses `NS(id)` for all input/output IDs in the UI function. Without namespacing, IDs will collide when the module is used multiple times.

### Step 5: Run the Application

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**Expected:** Application launches in the browser without errors.

**On failure:** Check the R console for error messages. Common issues: missing packages (install them), port already in use (specify a different port with `port = 3839`), or syntax errors in UI/server code.

## Validation

- [ ] Application directory has correct structure for chosen framework
- [ ] `shiny::runApp()` launches without errors
- [ ] At least one module is scaffolded with UI and server functions
- [ ] Dependencies are recorded (DESCRIPTION or dependencies.R)
- [ ] renv.lock captures all package versions
- [ ] Module uses `NS(id)` for proper namespace isolation

## Common Pitfalls

- **Choosing vanilla for production**: Vanilla structure lacks testing infrastructure, documentation, and deployment tooling. Use golem or rhino for anything beyond prototypes.
- **Missing namespace in modules**: Every `inputId` and `outputId` in a module UI must be wrapped with `ns()`. Forgetting this causes silent ID collisions.
- **golem without devtools workflow**: golem apps are R packages. Use `devtools::load_all()`, `devtools::test()`, and `devtools::document()` — not `source()`.
- **rhino without box**: rhino uses box for module imports. Don't fall back to `library()` calls — use `box::use()` for explicit imports.

## Related Skills

- `build-shiny-module` — create reusable Shiny modules with proper namespace isolation
- `test-shiny-app` — set up shinytest2 and testServer() tests
- `deploy-shiny-app` — deploy to shinyapps.io, Posit Connect, or Docker
- `design-shiny-ui` — bslib theming and responsive layout design
- `create-r-package` — R package scaffolding (golem apps are R packages)
- `manage-renv-dependencies` — detailed renv dependency management
