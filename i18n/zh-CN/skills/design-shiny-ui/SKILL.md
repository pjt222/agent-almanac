---
name: design-shiny-ui
description: >
  使用 bslib 进行主题设计、layout_columns 实现响应式网格、值框、卡片及
  自定义 CSS/SCSS 设计 Shiny 应用 UI。涵盖页面布局、可访问性和品牌一致性。
  适用于从零构建新 Shiny 应用 UI、将现有应用从 fluidPage 升级到 bslib、
  应用品牌主题、使 Shiny 应用在不同屏幕尺寸上响应式显示，或改善 Shiny
  应用的可访问性。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, bslib, ui, theming, layout, css, accessibility, responsive
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 设计 Shiny UI

使用 bslib 主题、现代布局原语和自定义 CSS 设计响应式、无障碍的 Shiny 应用界面。

## 适用场景

- 从零构建新 Shiny 应用 UI
- 将现有 Shiny 应用从 fluidPage 升级到 bslib
- 为 Shiny 应用应用品牌主题（颜色、字体）
- 使 Shiny 应用在不同屏幕尺寸上响应式显示
- 改善 Shiny 应用的可访问性

## 输入

- **必需**：应用用途和目标受众
- **必需**：布局类型（侧边栏、导航栏、可填充、仪表盘）
- **可选**：品牌颜色和字体
- **可选**：是否使用自定义 CSS/SCSS（默认：仅 bslib）
- **可选**：可访问性要求（WCAG 级别）

## 步骤

### 第 1 步：选择页面布局

bslib 提供多种页面构造函数：

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

**预期结果：** 页面布局与应用的导航和内容需求匹配。

**失败处理：** 如果布局看起来不对，检查是否使用了 `page_sidebar()` / `page_navbar()`（bslib）而非 `fluidPage()` / `navbarPage()`（基础 shiny）。bslib 版本有更好的默认值和主题支持。

### 第 2 步：配置 bslib 主题

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

开发时使用交互式主题编辑器：

```r
bslib::bs_theme_preview(my_theme)
```

**预期结果：** 应用以一致的品牌颜色、字体和 Bootstrap 5 组件渲染。

**失败处理：** 如果字体未加载，检查网络访问（Google Fonts 需要联网）或切换到系统字体：`font_collection("system-ui", "-apple-system", "Segoe UI")`。如果主题变量未应用，检查是否将 `theme` 传递给了页面函数。

### 第 3 步：用卡片和列构建布局

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

关键布局原语：
- `layout_columns()` — 带 `col_widths` 的响应式网格
- `card()` — 可选头部/尾部的内容容器
- `value_box()` — 带图标和主题的 KPI 显示
- `layout_sidebar()` — 卡片内嵌套侧边栏
- `navset_card_tab()` — 带标签页的卡片

**预期结果：** 响应式网格布局适应屏幕尺寸。

**失败处理：** 如果列在宽屏上意外堆叠，检查 `col_widths` 之和是否等于 12（Bootstrap 网格）。如果卡片重叠，确保非填充行设置了 `fill = FALSE`。

### 第 4 步：添加动态 UI 元素

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

**预期结果：** UI 元素根据用户选择和数据动态更新。

**失败处理：** 如果动态 UI 闪烁，尽可能使用 `conditionalPanel()`（基于 CSS）而非 `renderUI()`。如果动态输入在重渲染后丢失值，添加 `session$sendInputMessage()` 恢复状态。

### 第 5 步：添加自定义 CSS/SCSS（可选）

对于超出 bslib 主题变量的样式：

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

使用 bslib 集成 SCSS：

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

**预期结果：** 自定义样式已应用且不破坏 bslib 主题。

**失败处理：** 如果自定义 CSS 与 bslib 冲突，使用 Bootstrap CSS 变量（`var(--bs-primary)`）代替硬编码颜色。这样主题更改时自定义样式也会随之更新。

### 第 6 步：确保可访问性

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

**预期结果：** 应用满足 WCAG 2.1 AA 标准的颜色对比度、键盘导航和屏幕阅读器兼容性。

**失败处理：** 使用浏览器开发者工具的可访问性审计（Lighthouse）进行测试。使用 WebAIM 的对比度检查器验证颜色对比度。确保所有交互元素可通过键盘聚焦。

## 验证清单

- [ ] 页面布局在桌面和移动宽度上正确渲染
- [ ] bslib 主题一致应用于所有组件
- [ ] 值框以正确的主题和图标显示
- [ ] 卡片在响应式网格中正确调整大小
- [ ] 自定义 CSS 使用 Bootstrap 变量而非硬编码值
- [ ] 所有图表有屏幕阅读器的替代文本
- [ ] 颜色对比度满足 WCAG AA（文本 4.5:1）
- [ ] 交互元素可通过键盘访问

## 常见问题

- **混用旧版和新版 Shiny UI**：不要将 `fluidPage()` 与 bslib 组件混用。专用 `page_sidebar()`、`page_navbar()` 或 `page_fillable()`。
- **CSS 中硬编码颜色**：使用 `var(--bs-primary)` 而非 `#2c3e50`。主题更改时硬编码颜色会失效。
- **非填充行缺少 `fill = FALSE`**：值框行和摘要行通常不应拉伸填充可用空间。设置 `fill = FALSE`。
- **离线环境中的 Google Fonts**：如果应用部署到隔离网络，使用系统字体或自托管字体文件而非 `font_google()`。
- **忽略移动端**：使用浏览器响应式模式测试。`layout_columns` 在窄屏上自动堆叠，但自定义 CSS 可能不会。

## 相关技能

- `scaffold-shiny-app` — 包含主题配置的初始应用设置
- `build-shiny-module` — 创建模块化 UI 组件
- `optimize-shiny-performance` — 注重性能的渲染
- `review-web-design` — 布局、排版和配色的视觉设计评审
- `review-ux-ui` — 可用性和可访问性评审
