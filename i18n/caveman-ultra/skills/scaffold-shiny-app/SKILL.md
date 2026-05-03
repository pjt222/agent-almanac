---
name: scaffold-shiny-app
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold new Shiny app → golem (prod R pkg)|rhino (enterprise)|vanilla (quick proto). Framework select, init, first module. Use → new interactive R web app, dashboard|explorer proto, prod Shiny as R pkg w/ golem, enterprise Shiny w/ rhino.
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

Create new Shiny w/ prod-ready structure → golem|rhino|vanilla.

## Use When

- New interactive R web app
- Dashboard|data explorer proto
- Prod Shiny as R pkg (golem)
- Enterprise Shiny (rhino)

## In

- **Required**: App name
- **Required**: Framework (golem|rhino|vanilla)
- **Optional**: Module scaffold (default yes)
- **Optional**: renv (default yes)
- **Optional**: Deploy target (shinyapps.io|Posit Connect|Docker)

## Do

### Step 1: Choose Framework

| Framework | Best For | Structure |
|-----------|----------|-----------|
| **golem** | Production apps shipped as R packages | R package with DESCRIPTION, tests, vignettes |
| **rhino** | Enterprise apps with JS/CSS build pipeline | box modules, Sass, JS bundling, rhino::init() |
| **vanilla** | Quick prototypes and learning | Single app.R or ui.R/server.R pair |

→ Clear decision by scope + team needs.

If err: unsure → default golem (most structure, can simplify). Vanilla only for throwaway protos.

### Step 2: Scaffold

#### Golem

```r
golem::create_golem("myapp", package_name = "myapp")
```

Creates:
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

#### Rhino

```r
rhino::init("myapp")
```

Creates:
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

#### Vanilla

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

→ Project dir created w/ all scaffold files.

If err: golem → `install.packages("golem")`. Rhino → `remotes::install_github("Appsilon/rhino")`. Vanilla → ensure shiny+bslib installed.

### Step 3: Configure Deps

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

Deps managed in `dependencies.R`:

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

→ All deps recorded in DESCRIPTION (golem) | dependencies.R (rhino) + renv-locked.

If err: renv::init() fails → check write perms. Pkg install fails → check R ver compat.

### Step 4: First Module

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

Creates `R/mod_dashboard.R` + `tests/testthat/test-mod_dashboard.R`.

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

Add to `R/mod_dashboard.R`:

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

→ Module file w/ UI+server using proper namespacing.

If err: ensure `NS(id)` for all input/output IDs in UI fn. Without → IDs collide on multi-use.

### Step 5: Run

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

→ App launches in browser w/o errs.

If err: check R console. Common: missing pkgs (install), port in use (`port = 3839`), syntax errs in UI/server.

## Check

- [ ] App dir has correct structure for framework
- [ ] `shiny::runApp()` launches w/o errs
- [ ] ≥1 module w/ UI+server
- [ ] Deps recorded (DESCRIPTION|dependencies.R)
- [ ] renv.lock captures vers
- [ ] Module uses `NS(id)` for namespace isolation

## Traps

- **Vanilla for prod**: Lacks tests, docs, deploy tooling. Use golem|rhino beyond protos.
- **Missing namespace in modules**: Every `inputId`+`outputId` must wrap `ns()`. Forget → silent ID collisions.
- **golem w/o devtools**: golem apps are R pkgs. Use `devtools::load_all()`, `test()`, `document()` — not `source()`.
- **rhino w/o box**: rhino uses box for imports. Don't fall back to `library()` — use `box::use()`.

## →

- `build-shiny-module` — reusable modules w/ namespace isolation
- `test-shiny-app` — shinytest2 + testServer() tests
- `deploy-shiny-app` — deploy to shinyapps.io, Posit Connect, Docker
- `design-shiny-ui` — bslib theming + responsive
- `create-r-package` — R pkg scaffold (golem apps are R pkgs)
- `manage-renv-dependencies` — detailed renv mgmt
