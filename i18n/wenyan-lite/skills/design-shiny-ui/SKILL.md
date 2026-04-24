---
name: design-shiny-ui
locale: wenyan-lite
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

# 設計 Shiny UI

以 bslib 主題、現代佈局原語、自訂 CSS 設計響應、可及之 Shiny 應用介面。

## 適用時機

- 自零建 Shiny 應用之新 UI
- 將既有 Shiny 應用由 fluidPage 現代化為 bslib
- 施品牌主題（色、字）於 Shiny 應用
- 使 Shiny 應用於各種屏幕尺寸皆響應
- 改善 Shiny 應用之可及性

## 輸入

- **必要**：應用之用途與目標受眾
- **必要**：佈局類型（側欄、導覽列、填充式、儀表板）
- **選擇**：品牌之色與字
- **選擇**：是否用自訂 CSS/SCSS（預設：僅用 bslib）
- **選擇**：可及性要求（WCAG 級別）

## 步驟

### 步驟一：擇頁面佈局

bslib 提供多種頁面構造器：

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

**預期：** 頁面佈局合於應用之導覽與內容所需。

**失敗時：** 佈局失當時，驗是否用 `page_sidebar()` / `page_navbar()`（bslib），而非 `fluidPage()` / `navbarPage()`（base shiny）。bslib 諸式預設更佳，主題支援亦優。

### 步驟二：配 bslib 主題

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

開發時用互動主題編輯器：

```r
bslib::bs_theme_preview(my_theme)
```

**預期：** 應用渲染時品牌色、字、Bootstrap 5 元件一致。

**失敗時：** 字型不載時，驗網路存取（Google Fonts 需之），或改用系統字型：`font_collection("system-ui", "-apple-system", "Segoe UI")`。主題變數不施時，驗 `theme` 是否傳至頁面函式。

### 步驟三：以卡與欄建佈局

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

主要之佈局原語：
- `layout_columns()` — 附 `col_widths` 之響應網格
- `card()` — 可有標頭/腳之內容容器
- `value_box()` — 附圖示與主題之 KPI 顯示
- `layout_sidebar()` — 卡片內嵌套之側欄
- `navset_card_tab()` — 具頁籤之卡片

**預期：** 響應網格佈局隨屏幕尺寸而適應。

**失敗時：** 寬屏下欄意外堆疊時，驗 `col_widths` 之和等於 12（Bootstrap 網格）。卡片重疊時，於非填充行設 `fill = FALSE`。

### 步驟四：加動態 UI 元素

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

**預期：** UI 元素依使用者選擇與數據動態更新。

**失敗時：** 動態 UI 閃爍時，可能處用 `conditionalPanel()`（基於 CSS）代 `renderUI()`。動態輸入重渲染時失值時，加 `session$sendInputMessage()` 以復狀態。

### 步驟五：加自訂 CSS/SCSS（選擇性）

需超 bslib 主題變數之樣式時：

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

**預期：** 自訂樣式施而不破 bslib 主題。

**失敗時：** 自訂 CSS 與 bslib 衝突時，用 Bootstrap CSS 變數（`var(--bs-primary)`）代硬寫之色。主題之變亦傳至自訂樣式矣。

### 步驟六：確保可及性

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

**預期：** 應用達 WCAG 2.1 AA 之色彩對比、鍵盤導覽、屏幕閱讀器相容之標準。

**失敗時：** 以瀏覽器開發工具之可及性審計測之（Lighthouse）。以 WebAIM 之對比檢查器驗色彩對比比。確保所有互動元素皆可鍵盤聚焦。

## 驗證

- [ ] 頁面佈局於桌面與移動寬度皆正確渲染
- [ ] bslib 主題一致施於所有元件
- [ ] Value boxes 以正確主題與圖示顯示
- [ ] 卡片於響應網格中正確縮放
- [ ] 自訂 CSS 用 Bootstrap 變數，非硬寫之值
- [ ] 所有圖皆有 alt 文字供屏幕閱讀器
- [ ] 色彩對比達 WCAG AA（文字 4.5:1）
- [ ] 互動元素可鍵盤存取

## 常見陷阱

- **新舊 Shiny UI 混用**：勿以 `fluidPage()` 與 bslib 元件混用。唯用 `page_sidebar()`、`page_navbar()` 或 `page_fillable()`。
- **CSS 中硬寫之色**：用 `var(--bs-primary)` 代 `#2c3e50`。硬寫之色於主題變時破。
- **非填充行未設 `fill = FALSE`**：Value box 行與摘要行常不宜伸展填充。設 `fill = FALSE`。
- **離線環境中之 Google Fonts**：應用部署於隔離網時，用系統字型或自託管字型檔案代 `font_google()`。
- **忽移動端**：以瀏覽器響應模式測之。`layout_columns` 於窄屏自動堆疊，自訂 CSS 則未必。

## 相關技能

- `scaffold-shiny-app` — 包含主題配置之應用初始建立
- `build-shiny-module` — 建模組化 UI 元件
- `optimize-shiny-performance` — 留意性能之渲染
- `review-web-design` — 對佈局、排版、色彩之視覺設計審
- `review-ux-ui` — 可用性與可及性之審
