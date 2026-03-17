---
name: build-parameterized-report
description: >
  创建可接受不同输入参数的参数化 Quarto 或 R Markdown 报告，以生成多种变体。
  涵盖参数定义、编程式渲染和批量生成。适用于为不同部门、区域或时间段生成相同报告、
  从单一模板创建客户特定报告、构建过滤到特定子集的仪表板，或自动化具有不同输入的
  定期报告。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 构建参数化报告

创建接受参数的报告，从单一模板生成多个定制化变体。

## 适用场景

- 为不同部门、区域或时间段生成相同报告
- 从模板创建客户特定报告
- 构建过滤到特定子集的仪表板
- 自动化具有不同输入的定期报告

## 输入

- **必需**：报告模板（Quarto 或 R Markdown）
- **必需**：参数定义（名称、类型、默认值）
- **可选**：用于批量生成的参数值列表
- **可选**：生成报告的输出目录

## 步骤

### 第 1 步：在 YAML 中定义参数

对于 Quarto（`report.qmd`）：

```yaml
---
title: "Sales Report: `r params$region`"
params:
  region: "North America"
  year: 2025
  include_forecast: true
format:
  html:
    toc: true
---
```

对于 R Markdown（`report.Rmd`）：

```yaml
---
title: "Sales Report"
params:
  region: "North America"
  year: 2025
  include_forecast: true
output: html_document
---
```

**预期结果：** YAML 头部包含 `params:` 块，其中有命名参数，每个参数都有正确类型的默认值。

**失败处理：** 如果渲染失败并提示"object 'params' not found"，确保 `params:` 块在 YAML 前置元数据下正确缩进。对于 Quarto，`params` 必须在 YAML 的顶层，不能嵌套在 `format:` 下。

### 第 2 步：在代码中使用参数

````markdown
```{r}
#| label: filter-data

data <- full_dataset |>
  filter(region == params$region, year == params$year)

nrow(data)
```

## Overview for `r params$region`

This report covers the `r params$region` region for `r params$year`.

```{r}
#| label: forecast
#| eval: !expr params$include_forecast

# This chunk only runs when include_forecast is TRUE
forecast_model <- forecast::auto.arima(data$sales)
forecast::autoplot(forecast_model)
```
````

**预期结果：** 代码块通过 `params$name` 引用参数，条件代码块在 Quarto 中使用 `#| eval: !expr params$flag`。内联 R 表达式如 `` `r params$region` `` 渲染动态文本。

**失败处理：** 如果 `params$name` 返回 NULL，验证 YAML 定义和代码引用之间的参数名称是否完全匹配（区分大小写）。检查默认值的类型是否正确。

### 第 3 步：使用自定义参数渲染

单次渲染：

```r
# Quarto
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = "Europe", year = 2025)
)

# R Markdown
rmarkdown::render(
  "report.Rmd",
  params = list(region = "Europe", year = 2025),
  output_file = "report-europe-2025.html"
)
```

**预期结果：** 单个报告使用自定义参数值成功渲染，覆盖 YAML 默认值。输出文件在指定路径创建。

**失败处理：** 如果 Quarto 渲染失败，检查 `quarto` CLI 是否已安装并在 PATH 中。如果 R Markdown 渲染失败，验证 `rmarkdown` 是否已安装。确保 `execute_params`（Quarto）或 `params`（R Markdown）中的参数名称与 YAML 定义完全匹配。

### 第 4 步：批量渲染多份报告

```r
regions <- c("North America", "Europe", "Asia Pacific", "Latin America")
years <- c(2024, 2025)

# Generate all combinations
combinations <- expand.grid(region = regions, year = years, stringsAsFactors = FALSE)

# Render each
purrr::pwalk(combinations, function(region, year) {
  output_name <- sprintf("report-%s-%d.html",
    tolower(gsub(" ", "-", region)), year)

  quarto::quarto_render(
    "report.qmd",
    execute_params = list(region = region, year = year),
    output_file = output_name
  )
})
```

**预期结果：** 每个区域-年份组合生成一个 HTML 文件。

**失败处理：** 检查 YAML 和代码之间的参数名称是否完全匹配。确保所有参数值有效。

### 第 5 步：添加参数验证

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**预期结果：** 验证代码块在每次渲染开始时运行，如果任何参数超出范围或类型错误则以信息性错误停止。

**失败处理：** 如果 `stopifnot()` 产生不够清晰的错误消息，改用显式的 `if (!cond) stop("message")` 调用以获得更清晰的诊断信息。

### 第 6 步：组织输出

```r
# Create output directory
output_dir <- file.path("reports", format(Sys.Date(), "%Y-%m"))
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Render with output path
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = region),
  output_file = file.path(output_dir, paste0("report-", region, ".html"))
)
```

**预期结果：** 输出文件写入带日期戳的子目录，使用描述性名称（例如 `reports/2025-06/report-europe.html`）。

**失败处理：** 如果 `dir.create()` 失败，检查父目录是否存在且可写。在 Windows 上，验证路径长度不超过 260 个字符。

## 验证清单

- [ ] 报告使用默认参数渲染正常
- [ ] 报告使用每组自定义参数渲染正常
- [ ] 参数在处理前经过验证
- [ ] 输出文件命名具有描述性
- [ ] 条件部分根据参数正确渲染
- [ ] 批量生成对所有组合完成

## 常见问题

- **参数名称不匹配**：YAML 名称必须与代码中的 `params$name` 引用完全匹配
- **类型强制转换**：YAML 可能将 `year: 2025` 解析为整数，但代码期望字符。应明确指定
- **条件评估**：在 Quarto 中使用 `#| eval: !expr params$flag` 而非 `eval = params$flag`
- **文件覆盖**：没有唯一的输出名称，每次渲染会覆盖前一个
- **批量模式下的内存**：长时间的批量运行可能累积内存。考虑使用 `callr::r()` 进行隔离

## 相关技能

- `create-quarto-report` — 基础 Quarto 文档设置
- `generate-statistical-tables` — 适应参数的表格
- `format-apa-report` — 参数化学术报告
