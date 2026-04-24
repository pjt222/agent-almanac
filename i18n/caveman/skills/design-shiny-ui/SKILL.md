---
name: design-shiny-ui
locale: caveman
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

Responsive, accessible Shiny UI. bslib theming, modern layout primitives, custom CSS.

## When Use

- Build new Shiny app UI from scratch
- Modernize existing Shiny app: fluidPage → bslib
- Apply brand theming (colors, fonts) to Shiny app
- Make Shiny app responsive across screen sizes
- Improve accessibility

## Inputs

- **Required**: App purpose + target audience
- **Required**: Layout type (sidebar, navbar, fillable, dashboard)
- **Optional**: Brand colors + fonts
- **Optional**: Use custom CSS/SCSS? (default: bslib only)
- **Optional**: Accessibility needs (WCAG level)

## Steps

### Step 1: Pick Page Layout

bslib has several page constructors:

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

**Got:** Page layout matches app's navigation + content needs.

**If fail:** Layout wrong? Check you use `page_sidebar()` / `page_navbar()` (bslib), not `fluidPage()` / `navbarPage()` (base shiny). bslib has better defaults + theming.

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

Use interactive theme editor during dev:

```r
bslib::bs_theme_preview(my_theme)
```

**Got:** App renders with consistent brand colors, fonts, Bootstrap 5 components.

**If fail:** Fonts don't load? Check internet (Google Fonts needs it) or switch to system fonts: `font_collection("system-ui", "-apple-system", "Segoe UI")`. Theme vars don't apply? Check `theme` is passed to page func.

### Step 3: Build Layout with Cards + Columns

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

Key layout primitives:
- `layout_columns()` — responsive grid with `col_widths`
- `card()` — content container, optional header/footer
- `value_box()` — KPI display, icon + theme
- `layout_sidebar()` — nested sidebar inside cards
- `navset_card_tab()` — tabbed cards

**Got:** Responsive grid adapts to screen size.

**If fail:** Columns stack odd on wide screens? `col_widths` sum must = 12 (Bootstrap grid). Cards overlap? Set `fill = FALSE` on non-filling rows.

### Step 4: Add Dynamic UI

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

**Got:** UI updates dynamically from user selections + data.

**If fail:** Dynamic UI flickers? Use `conditionalPanel()` (CSS-based) not `renderUI()` where possible. Dynamic inputs lose values on re-render? Add `session$sendInputMessage()` to restore state.

### Step 5: Custom CSS/SCSS (Optional)

For styles beyond bslib theme vars:

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

SCSS integration with bslib:

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

**Got:** Custom styles applied. bslib theming not broken.

**If fail:** Custom CSS conflicts with bslib? Use Bootstrap CSS vars (`var(--bs-primary)`) not hardcoded colors. Theme changes then propagate.

### Step 6: Ensure Accessibility

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

**Got:** App meets WCAG 2.1 AA: color contrast, keyboard nav, screen reader compat.

**If fail:** Test with browser dev tools accessibility audit (Lighthouse). Check color contrast with WebAIM's checker. All interactive elements keyboard-focusable.

## Checks

- [ ] Page layout renders right on desktop + mobile widths
- [ ] bslib theme applies consistently
- [ ] Value boxes display right themes + icons
- [ ] Cards resize in responsive grid
- [ ] Custom CSS uses Bootstrap vars, not hardcoded values
- [ ] All plots have alt text
- [ ] Color contrast ≥ WCAG AA (4.5:1 for text)
- [ ] Interactive elements keyboard accessible

## Pitfalls

- **Mixing old + new Shiny UI**: Don't mix `fluidPage()` with bslib components. Use `page_sidebar()`, `page_navbar()`, or `page_fillable()` only.
- **Hardcoded colors in CSS**: Use `var(--bs-primary)` not `#2c3e50`. Hardcoded colors break when theme changes.
- **Missing `fill = FALSE` on non-filling rows**: Value box + summary rows usually shouldn't stretch. Set `fill = FALSE`.
- **Google Fonts in offline env**: App deploys to air-gapped network? Use system fonts or self-hosted font files, not `font_google()`.
- **Ignoring mobile**: Test with browser responsive mode. `layout_columns` auto-stacks on narrow screens, custom CSS may not.

## See Also

- `scaffold-shiny-app` — initial app setup incl theme config
- `build-shiny-module` — modular UI components
- `optimize-shiny-performance` — perf-conscious rendering
- `review-web-design` — visual design review: layout, typography, colour
- `review-ux-ui` — usability + accessibility review
