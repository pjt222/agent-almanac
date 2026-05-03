---
name: scaffold-shiny-app
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Make new Shiny app with prod-ready structure. Use golem, rhino, or vanilla scaffolding.

## When Use

- Start new interactive web app in R
- Make dashboard or data explorer prototype
- Set up prod Shiny app as R package (golem)
- Bootstrap enterprise Shiny project (rhino)

## Inputs

- **Required**: App name
- **Required**: Framework choice (golem, rhino, vanilla)
- **Optional**: Module scaffolding (default: yes)
- **Optional**: renv for dep management (default: yes)
- **Optional**: Deploy target (shinyapps.io, Posit Connect, Docker)

## Steps

### Step 1: Choose Framework

Judge project needs to pick framework.

| Framework | Best For | Structure |
|-----------|----------|-----------|
| **golem** | Production apps shipped as R packages | R package with DESCRIPTION, tests, vignettes |
| **rhino** | Enterprise apps with JS/CSS build pipeline | box modules, Sass, JS bundling, rhino::init() |
| **vanilla** | Quick prototypes and learning | Single app.R or ui.R/server.R pair |

**Got:** Clear framework decision based on scope, team needs.

**If fail:** Unsure? Default to golem — most structure, can simplify later. Vanilla only for throwaway prototypes.

### Step 2: Scaffold Project

#### Golem Path

```r
golem::create_golem("myapp", package_name = "myapp")
```

Creates.
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

Creates.
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

Create `app.R`.

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

**Got:** Project dir made with all scaffolding files.

**If fail:** Golem? Ensure golem package installed: `install.packages("golem")`. Rhino? Install from GitHub: `remotes::install_github("Appsilon/rhino")`. Vanilla? Ensure shiny + bslib installed.

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

Deps managed in `dependencies.R`.

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**Got:** All deps recorded in DESCRIPTION (golem) or dependencies.R (rhino), locked with renv.

**If fail:** renv::init() fails? Check write perms. Packages fail to install? Check R version compat.

### Step 4: Create First Module

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

Creates `R/mod_dashboard.R` and `tests/testthat/test-mod_dashboard.R`.

#### Rhino

Make `app/view/dashboard.R`.

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

Add module functions to separate file `R/mod_dashboard.R`.

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

**Got:** Module file made with UI + server functions using proper namespacing.

**If fail:** Ensure module uses `NS(id)` for all input/output IDs in UI function. Without namespacing, IDs collide when module used multiple times.

### Step 5: Run Application

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**Got:** App launches in browser without errors.

**If fail:** Check R console for error msgs. Common: missing packages (install), port in use (specify different port `port = 3839`), syntax errors in UI/server.

## Checks

- [ ] App dir has correct structure for chosen framework
- [ ] `shiny::runApp()` launches without errors
- [ ] At least one module scaffolded with UI + server functions
- [ ] Deps recorded (DESCRIPTION or dependencies.R)
- [ ] renv.lock captures all package versions
- [ ] Module uses `NS(id)` for proper namespace isolation

## Pitfalls

- **Choose vanilla for prod**: Vanilla lacks testing, docs, deploy tooling. Use golem or rhino for anything beyond prototypes.
- **Missing namespace in modules**: Every `inputId` and `outputId` in module UI must be wrapped with `ns()`. Forget = silent ID collisions.
- **golem without devtools workflow**: golem apps are R packages. Use `devtools::load_all()`, `devtools::test()`, `devtools::document()` — not `source()`.
- **rhino without box**: rhino uses box for module imports. Do not fall back to `library()` calls — use `box::use()` for explicit imports.

## See Also

- `build-shiny-module` — make reusable Shiny modules with proper namespace isolation
- `test-shiny-app` — set up shinytest2 and testServer() tests
- `deploy-shiny-app` — deploy to shinyapps.io, Posit Connect, Docker
- `design-shiny-ui` — bslib theming + responsive layout design
- `create-r-package` — R package scaffolding (golem apps are R packages)
- `manage-renv-dependencies` — detailed renv dep management
