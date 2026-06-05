---
name: design-shiny-ui
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

Design responsive, accessible Shiny application interfaces using bslib theming, modern layout primitives, and custom CSS.

## When to Use

- Building a new Shiny app UI from scratch
- Modernizing an existing Shiny app from fluidPage to bslib
- Applying brand theming (colors, fonts) to a Shiny app
- Making a Shiny app responsive across screen sizes
- Improving accessibility of a Shiny application

## Inputs

- **Required**: Application purpose and target audience
- **Required**: Layout type (sidebar, navbar, fillable, dashboard)
- **Optional**: Brand colors and fonts
- **Optional**: Whether to use custom CSS/SCSS (default: bslib only)
- **Optional**: Accessibility requirements (WCAG level)

## Procedure

### Step 1: Choose the Page Layout

bslib provides several page constructors:

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

**Expected:** Page layout matches the application's navigation and content needs.

**On failure:** If the layout doesn't look right, check that you're using `page_sidebar()` / `page_navbar()` (bslib) not `fluidPage()` / `navbarPage()` (base shiny). The bslib versions have better defaults and theming support.

### Step 2: Configure the bslib Theme

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

Use the interactive theme editor during development:

```r
bslib::bs_theme_preview(my_theme)
```

**Expected:** App renders with consistent brand colors, fonts, and Bootstrap 5 components.

**On failure:** If fonts don't load, check internet access (Google Fonts requires it) or switch to system fonts: `font_collection("system-ui", "-apple-system", "Segoe UI")`. If theme variables don't apply, check that you're passing `theme` to the page function.

### Step 3: Build the Layout with Cards and Columns

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
- `card()` — content container with optional header/footer
- `value_box()` — KPI display with icon and theme
- `layout_sidebar()` — nested sidebar within cards
- `navset_card_tab()` — tabbed cards

**Expected:** Responsive grid layout that adapts to screen size.

**On failure:** If columns stack unexpectedly on wide screens, check `col_widths` sum equals 12 (Bootstrap grid). If cards overlap, ensure `fill = FALSE` on non-filling rows.

### Step 4: Add Dynamic UI Elements

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

**Expected:** UI elements update dynamically based on user selections and data.

**On failure:** If dynamic UI flickers, use `conditionalPanel()` (CSS-based) instead of `renderUI()` where possible. If dynamic inputs lose their values on re-render, add `session$sendInputMessage()` to restore state.

### Step 5: Add Custom CSS/SCSS (Optional)

For styles beyond bslib theme variables:

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

For SCSS integration with bslib:

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

**Expected:** Custom styles applied without breaking bslib theming.

**On failure:** If custom CSS conflicts with bslib, use Bootstrap CSS variables (`var(--bs-primary)`) instead of hardcoded colors. This ensures theme changes propagate to custom styles.

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

**Expected:** App meets WCAG 2.1 AA standards for color contrast, keyboard navigation, and screen reader compatibility.

**On failure:** Test with browser dev tools accessibility audit (Lighthouse). Check color contrast ratios with WebAIM's contrast checker. Ensure all interactive elements are keyboard-focusable.

## Validation

- [ ] Page layout renders correctly on desktop and mobile widths
- [ ] bslib theme applies consistently to all components
- [ ] Value boxes display with correct themes and icons
- [ ] Cards resize properly in the responsive grid
- [ ] Custom CSS uses Bootstrap variables, not hardcoded values
- [ ] All plots have alt text for screen readers
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Interactive elements are keyboard accessible

## Common Pitfalls

- **Mixing old and new Shiny UI**: Don't mix `fluidPage()` with bslib components. Use `page_sidebar()`, `page_navbar()`, or `page_fillable()` exclusively.
- **Hardcoded colors in CSS**: Use `var(--bs-primary)` instead of `#2c3e50`. Hardcoded colors break when the theme changes.
- **Missing `fill = FALSE` on non-filling rows**: Value box rows and summary rows usually shouldn't stretch to fill available space. Set `fill = FALSE`.
- **Google Fonts in offline environments**: If the app deploys to an air-gapped network, use system fonts or self-hosted font files instead of `font_google()`.
- **Ignoring mobile**: Test with the browser responsive mode. `layout_columns` automatically stacks on narrow screens, but custom CSS may not.

## Related Skills

- `scaffold-shiny-app` — initial app setup including theme configuration
- `build-shiny-module` — create modular UI components
- `optimize-shiny-performance` — performance-conscious rendering
- `review-web-design` — visual design review for layout, typography, and colour
- `review-ux-ui` — usability and accessibility review
