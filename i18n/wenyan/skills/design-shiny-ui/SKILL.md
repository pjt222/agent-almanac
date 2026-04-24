---
name: design-shiny-ui
locale: wenyan
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

# Shiny UI 之設

用 bslib 主題化、現代化佈局原語、自定義 CSS，設響應且可及之 Shiny 應用界面。

## 用時

- 自始構 Shiny 應用 UI
- 將既有 Shiny 應用由 fluidPage 現代化為 bslib
- 應用品牌主題（色、字）於 Shiny 應用
- 使 Shiny 應用於諸屏尺寸下響應
- 改 Shiny 應用之可及性

## 入

- **必要**：應用之用與目標受眾
- **必要**：佈局類型（sidebar、navbar、fillable、dashboard）
- **可選**：品牌色與字
- **可選**：是否用自定義 CSS/SCSS（默認：僅 bslib）
- **可選**：可及性之要（WCAG 等級）

## 法

### 第一步：擇頁面佈局

bslib 提諸頁構造器：

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

**得：** 頁面佈局合應用之導航與內容之需。

**敗則：** 佈局不如所願則察用 `page_sidebar()`/`page_navbar()`（bslib）而非 `fluidPage()`/`navbarPage()`（base shiny）。bslib 版本有更佳默認與主題支持。

### 第二步：設 bslib 主題

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

開發時用交互主題編輯器：

```r
bslib::bs_theme_preview(my_theme)
```

**得：** 應用以一致之品牌色、字、Bootstrap 5 組件渲染。

**敗則：** 字不載則察互聯網（Google Fonts 需之）或改用系統字：`font_collection("system-ui", "-apple-system", "Segoe UI")`。主題變量不應用則察是否傳 `theme` 予頁函數。

### 第三步：以卡片與列建佈局

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

要原語：
- `layout_columns()` — 響應式網格，配 `col_widths`
- `card()` — 內容容器，可選 header/footer
- `value_box()` — KPI 顯示，帶圖示與主題
- `layout_sidebar()` — 卡片內嵌側欄
- `navset_card_tab()` — 選項卡式卡片

**得：** 響應式網格佈局，能隨屏尺寸而變。

**敗則：** 寬屏上列意外堆疊則察 `col_widths` 之和等於 12（Bootstrap 網格）。卡片相疊則確保非填充行 `fill = FALSE`。

### 第四步：加動態 UI 元素

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

**得：** UI 元素隨用者所擇與資料而動態更新。

**敗則：** 動態 UI 閃爍則盡用 `conditionalPanel()`（基於 CSS）代 `renderUI()`。動態輸入重渲染時失值則加 `session$sendInputMessage()` 以復其狀。

### 第五步：加自定義 CSS/SCSS（可選）

欲越 bslib 主題變量之樣式：

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

**得：** 自定義樣式已施，未破 bslib 主題。

**敗則：** 自定義 CSS 與 bslib 衝突則用 Bootstrap CSS 變量（`var(--bs-primary)`）代硬編碼色。如此主題變更可傳至自定義樣式。

### 第六步：確保可及性

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

**得：** 應用合 WCAG 2.1 AA 之色差、鍵盤導航、屏讀相容。

**敗則：** 以瀏覽器開發工具之可及性審計（Lighthouse）測。以 WebAIM 對比檢查器察色差比。確保諸交互元素可由鍵盤聚焦。

## 驗

- [ ] 頁面佈局於桌面與移動寬度下皆正渲染
- [ ] bslib 主題一致施於諸組件
- [ ] 值框以正確之主題與圖示顯示
- [ ] 卡片於響應式網格中正確縮放
- [ ] 自定義 CSS 用 Bootstrap 變量，非硬編碼
- [ ] 諸圖皆有屏讀者所用之替代文本
- [ ] 色對比合 WCAG AA（文本 4.5:1）
- [ ] 交互元素可由鍵盤訪問

## 陷

- **新舊 Shiny UI 相混**：勿將 `fluidPage()` 與 bslib 組件相混。專用 `page_sidebar()`、`page_navbar()` 或 `page_fillable()`
- **CSS 中硬編碼色**：用 `var(--bs-primary)` 代 `#2c3e50`。硬編碼色於主題變更時破
- **非填充行缺 `fill = FALSE`**：值框行與摘要行常不宜填滿可用空間。設 `fill = FALSE`
- **離線環境用 Google Fonts**：應用部署於隔離網絡則用系統字或自托管字文件代 `font_google()`
- **略移動**：以瀏覽器響應模式測。`layout_columns` 於窄屏自動堆疊，然自定義 CSS 或不能

## 參

- `scaffold-shiny-app` — 初始應用搭建含主題設置
- `build-shiny-module` — 建模塊化 UI 組件
- `optimize-shiny-performance` — 注重性能之渲染
- `review-web-design` — 佈局、字體、色彩之視覺設計評議
- `review-ux-ui` — 可用性與可及性評議
