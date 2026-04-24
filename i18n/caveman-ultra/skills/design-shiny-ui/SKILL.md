---
name: design-shiny-ui
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design Shiny application UIs using bslib for theming, layout_columns
  for responsive grids, value boxes, cards, and custom CSS/SCSS.
  Covers page layouts, accessibility, and brand consistency. Use when
  building a new Shiny app UI from scratch, modernizing an existing app from
  fluidPage to bslib, applying brand theming, making a Shiny app responsive
  across screen sizes, or improving accessibility of a Shiny application.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, bslib, ui, theming, layout, css, accessibility, responsive
---

# Design Shiny UI

Responsive, accessible Shiny UI → bslib + modern layouts + custom CSS.

## Use When

- New Shiny UI from scratch
- Modernize app: fluidPage → bslib
- Brand theming (colors, fonts)
- Responsive across screens
- A11y improvements

## In

- **Required**: App purpose + audience
- **Required**: Layout type (sidebar, navbar, fillable, dashboard)
- **Optional**: Brand colors + fonts
- **Optional**: Custom CSS/SCSS (default: bslib only)
- **Optional**: A11y reqs (WCAG lvl)

## Do

### Step 1: Pick Page Layout

bslib page constructors:

```r
# Sidebar layout — most common for data apps
ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar("Controls here"),
  "Main content here"
)

# Navbar layout — for multi-page apps
ui <- page_navbar(
  title = "My App",
  nav_panel("Tab 1", "Content 1"),
  nav_panel("Tab 2", "Content 2"),
  nav_spacer(),
  nav_item(actionButton("help", "Help"))
)

# Fillable layout — content fills available space
ui <- page_fillable(
  card(
    full_screen = TRUE,
    plotOutput("plot")
  )
)

# Dashboard layout — grid of value boxes and cards
ui <- page_sidebar(
  title = "Dashboard",
  sidebar = sidebar(open = "closed", "Filters"),
  layout_columns(
    fill = FALSE,
    value_box("Revenue", "$1.2M", theme = "primary"),
    value_box("Users", "4,521", theme = "success"),
    value_box("Uptime", "99.9%", theme = "info")
  ),
  layout_columns(
    card(plotOutput("chart1")),
    card(plotOutput("chart2"))
  )
)
```

→ Layout matches nav + content needs.

If err: layout off → check using `page_sidebar()` / `page_navbar()` (bslib) not `fluidPage()` / `navbarPage()` (base shiny). bslib versions → better defaults + theming.

### Step 2: Config bslib Theme

```r
my_theme <- bslib::bs_theme(
  version = 5,                      # Bootstrap 5
  bootswatch = "flatly",            # Optional preset theme
  bg = "#ffffff",                   # Background color
  fg = "#2c3e50",                   # Foreground (text) color
  primary = "#2c3e50",              # Primary brand color
  secondary = "#95a5a6",            # Secondary color
  success = "#18bc9c",
  info = "#3498db",
  warning = "#f39c12",
  danger = "#e74c3c",
  base_font = bslib::font_google("Source Sans Pro"),
  heading_font = bslib::font_google("Source Sans Pro", wght = 600),
  code_font = bslib::font_google("Fira Code"),
  "navbar-bg" = "#2c3e50"
)

ui <- page_sidebar(
  theme = my_theme,
  title = "Themed App",
  # ...
)
```

Interactive theme editor during dev:

```r
bslib::bs_theme_preview(my_theme)
```

→ App renders w/ consistent brand colors + fonts + BS5 components.

If err: fonts don't load → check net (Google Fonts needs it) or sys fonts: `font_collection("system-ui", "-apple-system", "Segoe UI")`. Theme vars don't apply → check `theme` passed to page fn.

### Step 3: Cards + Columns Layout

```r
ui <- page_sidebar(
  theme = my_theme,
  title = "Analysis Dashboard",
  sidebar = sidebar(
    width = 300,
    title = "Filters",
    selectInput("dataset", "Dataset", choices = c("iris", "mtcars")),
    sliderInput("sample", "Sample %", 10, 100, 100, step = 10),
    hr(),
    actionButton("refresh", "Refresh", class = "btn-primary w-100")
  ),

  # KPI row — non-filling
  layout_columns(
    fill = FALSE,
    col_widths = c(4, 4, 4),
    value_box(
      title = "Observations",
      value = textOutput("n_obs"),
      showcase = bsicons::bs_icon("table"),
      theme = "primary"
    ),
    value_box(
      title = "Variables",
      value = textOutput("n_vars"),
      showcase = bsicons::bs_icon("columns-gap"),
      theme = "info"
    ),
    value_box(
      title = "Missing",
      value = textOutput("n_missing"),
      showcase = bsicons::bs_icon("exclamation-triangle"),
      theme = "warning"
    )
  ),

  # Main content row
  layout_columns(
    col_widths = c(8, 4),
    card(
      card_header("Distribution"),
      full_screen = TRUE,
      plotOutput("main_plot")
    ),
    card(
      card_header("Summary"),
      tableOutput("summary_table")
    )
  )
)
```

Key primitives:
- `layout_columns()` — responsive grid w/ `col_widths`
- `card()` — container + optional header/footer
- `value_box()` — KPI + icon + theme
- `layout_sidebar()` — nested sidebar in cards
- `navset_card_tab()` — tabbed cards

→ Responsive grid adapts to screen size.

If err: cols stack on wide screens → check `col_widths` sum = 12 (BS grid). Cards overlap → `fill = FALSE` on non-filling rows.

### Step 4: Dynamic UI

```r
server <- function(input, output, session) {
  output$dynamic_filters <- renderUI({
    data <- current_data()
    tagList(
      selectInput("col", "Column", choices = names(data)),
      if (is.numeric(data[[input$col]])) {
        sliderInput("range", "Range",
          min = min(data[[input$col]], na.rm = TRUE),
          max = max(data[[input$col]], na.rm = TRUE),
          value = range(data[[input$col]], na.rm = TRUE)
        )
      } else {
        selectInput("values", "Values",
          choices = unique(data[[input$col]]),
          multiple = TRUE
        )
      }
    )
  })

  # Conditional panels (no server round-trip)
  # In UI:
  # conditionalPanel(
  #   condition = "input.show_advanced == true",
  #   numericInput("alpha", "Alpha", 0.05)
  # )
}
```

→ UI updates based on user + data.

If err: dynamic UI flickers → `conditionalPanel()` (CSS) over `renderUI()` when poss. Dynamic inputs lose vals on re-render → `session$sendInputMessage()` restore state.

### Step 5: Custom CSS/SCSS (Optional)

Beyond bslib theme vars:

```r
# Inline CSS
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$style(HTML("
    .sidebar { border-right: 2px solid var(--bs-primary); }
    .card-header { font-weight: 600; }
    .value-box .value { font-size: 2.5rem; }
  "))),
  # ...
)

# External CSS file (place in www/ directory)
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$link(rel = "stylesheet", href = "custom.css")),
  # ...
)
```

SCSS + bslib:

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

→ Custom styles applied w/o breaking bslib theming.

If err: custom CSS conflicts → use BS CSS vars (`var(--bs-primary)`) over hardcoded colors. Ensures theme changes propagate.

### Step 6: A11y

```r
# Add ARIA labels to inputs
selectInput("category", "Category",
  choices = c("A", "B", "C")
) |> tagAppendAttributes(`aria-describedby` = "category-help")

# Add alt text to plots
output$plot <- renderPlot({
  plot(data(), main = "Distribution of Values")
}, alt = "Histogram showing the distribution of selected values")

# Ensure sufficient color contrast in theme
my_theme <- bslib::bs_theme(
  version = 5,
  bg = "#ffffff",      # White background
  fg = "#212529"       # Dark text — 15.4:1 contrast ratio
)

# Use semantic HTML
tags$main(
  role = "main",
  tags$h1("Dashboard"),
  tags$section(
    `aria-label` = "Key Performance Indicators",
    layout_columns(
      # value boxes...
    )
  )
)
```

→ App meets WCAG 2.1 AA: contrast + keyboard + screen reader.

If err: test browser a11y audit (Lighthouse). Contrast → WebAIM checker. All interactive → keyboard-focusable.

## Check

- [ ] Layout OK on desktop + mobile
- [ ] bslib theme consistent across components
- [ ] Value boxes → correct themes + icons
- [ ] Cards resize in grid
- [ ] Custom CSS → BS vars, not hardcoded
- [ ] Plots have alt text
- [ ] Contrast ≥ WCAG AA (4.5:1 text)
- [ ] Interactive → keyboard accessible

## Traps

- **Mix old + new Shiny UI**: No `fluidPage()` w/ bslib. Use `page_sidebar()` / `page_navbar()` / `page_fillable()` only.
- **Hardcoded colors**: Use `var(--bs-primary)` over `#2c3e50`. Hardcoded → breaks on theme change.
- **Missing `fill = FALSE`**: Value box + summary rows shouldn't stretch. `fill = FALSE`.
- **Google Fonts offline**: Air-gapped → sys fonts or self-hosted font files over `font_google()`.
- **Ignore mobile**: Test browser responsive. `layout_columns` auto-stacks, custom CSS may not.

## →

- `scaffold-shiny-app` — initial setup + theme config
- `build-shiny-module` — modular UI components
- `optimize-shiny-performance` — perf-conscious render
- `review-web-design` — visual review: layout + typo + color
- `review-ux-ui` — usability + a11y review
