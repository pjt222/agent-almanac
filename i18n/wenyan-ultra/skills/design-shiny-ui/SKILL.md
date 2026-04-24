---
name: design-shiny-ui
locale: wenyan-ultra
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

# 設 Shiny UI

以 bslib 題、現代布局原、自定 CSS 設響、可訪 Shiny 介。

## 用

- 從始建新 Shiny UI
- 舊 app 由 fluidPage 現代化至 bslib
- 施品題（色、字）於 Shiny
- 使 Shiny 於諸屏響
- 改 Shiny 可訪

## 入

- **必**：app 用與目眾
- **必**：布類（sidebar、navbar、fillable、dashboard）
- **可**：品色與字
- **可**：用自定 CSS/SCSS（默：僅 bslib）
- **可**：可訪求（WCAG 級）

## 行

### 一：擇頁布

bslib 供諸頁構：

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

得：布符 app 之導航與內容需。

敗：布不適→查用 `page_sidebar()` / `page_navbar()`（bslib），非 `fluidPage()` / `navbarPage()`（base shiny）。bslib 默認更佳且支題。

### 二：配 bslib 題

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

開發時用互動題編：

```r
bslib::bs_theme_preview(my_theme)
```

得：app 以一致品色、字、Bootstrap 5 組件現。

敗：字不載→查網（Google Fonts 需之）或換系字：`font_collection("system-ui", "-apple-system", "Segoe UI")`。題變量不施→查 `theme` 傳至頁函。

### 三：以卡與列建布

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

諸布原：
- `layout_columns()` — 響格，含 `col_widths`
- `card()` — 內容器，可選頭／尾
- `value_box()` — KPI 顯，含徽與題
- `layout_sidebar()` — 卡內嵌 sidebar
- `navset_card_tab()` — 有頁標之卡

得：響格布應屏尺。

敗：寬屏列意外堆→查 `col_widths` 和為 12（Bootstrap 格）。卡重疊→非填列宜 `fill = FALSE`。

### 四：添動 UI 素

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

得：UI 素依使擇及數動更。

敗：動 UI 閃→用 `conditionalPanel()`（CSS 基）代 `renderUI()`。動入於再渲失值→加 `session$sendInputMessage()` 復態。

### 五：添自定 CSS/SCSS（可選）

求 bslib 題變量外之樣：

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

SCSS 與 bslib 整合：

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

得：自定樣施而不破 bslib 題。

敗：自定 CSS 與 bslib 衝→用 Bootstrap CSS 變量（`var(--bs-primary)`）代硬編色→題變則自定樣傳播。

### 六：保可訪

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

得：app 符 WCAG 2.1 AA 之色對、鍵導、屏讀相容。

敗：用瀏覽器開發工具 Lighthouse 可訪審試。以 WebAIM 對比查色對。保諸互動素可鍵焦。

## 驗

- [ ] 頁布於桌與手寬皆正渲
- [ ] bslib 題一致施於諸組件
- [ ] value box 以正題及徽顯
- [ ] 卡於響格正縮
- [ ] 自定 CSS 用 Bootstrap 變量，非硬編
- [ ] 諸圖有 alt 文為屏讀
- [ ] 色對符 WCAG AA（文 4.5:1）
- [ ] 互動素可鍵訪

## 忌

- **混新舊 Shiny UI**：勿混 `fluidPage()` 與 bslib 組件→專用 `page_sidebar()`、`page_navbar()`、或 `page_fillable()`
- **CSS 硬編色**：用 `var(--bs-primary)` 代 `#2c3e50`→硬編色題變則破
- **非填列忘 `fill = FALSE`**：value box 列與摘列常不宜伸→設 `fill = FALSE`
- **離網境之 Google Fonts**：部至隔網→用系字或自寓字檔代 `font_google()`
- **略手機**：以瀏覽器響模試。`layout_columns` 窄屏自動堆，自定 CSS 則或否

## 參

- `scaffold-shiny-app`
- `build-shiny-module`
- `optimize-shiny-performance`
- `review-web-design`
- `review-ux-ui`
