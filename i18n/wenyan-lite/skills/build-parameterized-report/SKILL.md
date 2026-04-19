---
name: build-parameterized-report
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create parameterized Quarto or R Markdown reports that can be rendered
  with different inputs to generate multiple variations. Covers parameter
  definitions, programmatic rendering, and batch generation. Use when
  generating the same report for different departments, regions, or time
  periods; creating client-specific reports from a single template;
  building dashboards that filter to specific subsets; or automating
  recurring reports with varying inputs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
---

# Build Parameterized Report

建可接參數之報告，自一模板生多定制變體。

## 適用時機

- 為不同部門、地區、時期生同一報告
- 自模板生客戶專之報告
- 建濾特定子集之儀表板
- 自動化以不同輸入之循環報告

## 輸入

- **必要**：報告模板（Quarto 或 R Markdown）
- **必要**：參數定義（名、類型、預設）
- **選擇性**：批生之參數值列
- **選擇性**：所生報告之輸出目錄

## 步驟

### 步驟一：於 YAML 定參數

Quarto（`report.qmd`）：

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

R Markdown（`report.Rmd`）：

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

**預期：** YAML 首部含 `params:` 塊，其中有名參數，各具正類預設值。

**失敗時：** 渲染失「object 'params' not found」時，確 `params:` 塊於 YAML 首部下正縮進。Quarto 中，`params` 當於 YAML 頂層，非嵌於 `format:` 下。

### 步驟二：於代碼中用參數

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

**預期：** 代碼塊透過 `params$name` 引參數，條件塊於 Quarto 用 `#| eval: !expr params$flag`。行內 R 表達式如 `` `r params$region` `` 生動態文字。

**失敗時：** 若 `params$name` 返 NULL，驗參數名與 YAML 定義中代碼引之完全相符（大小寫敏感）。查預設值為正類。

### 步驟三：以自訂參數渲染

單次渲染：

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

**預期：** 單報告以自訂參數值覆 YAML 預設而成渲染。輸出文件於所指路徑生成。

**失敗時：** 若 Quarto 渲染失，查 `quarto` CLI 已裝且於 PATH。若 R Markdown 渲染失，驗 `rmarkdown` 已裝。確 `execute_params`（Quarto）或 `params`（R Markdown）中參數名與 YAML 定義完全相符。

### 步驟四：批渲多報告

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

**預期：** 每地區-年組合一 HTML 文件。

**失敗時：** 查參數名於 YAML 與代碼間完全相符。確所有參數值為有效。

### 步驟五：加參數驗證

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**預期：** 驗證代碼塊於每次渲染始執，任一參數超範圍或誤類即以明告止。

**失敗時：** 若 `stopifnot()` 之錯訊不助，改用明之 `if (!cond) stop("message")` 以明斷。

### 步驟六：組織輸出

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

**預期：** 輸出文件寫入日期標之子目錄，以描述性名命（如 `reports/2025-06/report-europe.html`）。

**失敗時：** 若 `dir.create()` 失，查父目錄存且可寫。Windows 上驗路徑長不超 260 字元。

## 驗證

- [ ] 報告以預設參數渲染
- [ ] 報告以每組自訂參數渲染
- [ ] 參數於處理前驗證
- [ ] 輸出文件以描述性名命
- [ ] 條件部分依參數正渲染
- [ ] 批生於所有組合完成

## 常見陷阱

- **參數名失配**：YAML 名須與代碼中 `params$name` 引完全相符
- **類型強轉**：YAML 或解 `year: 2025` 為整數而代碼期字元。明示之
- **條件之評**：Quarto 中用 `#| eval: !expr params$flag`，非 `eval = params$flag`
- **文件覆寫**：無唯一輸出名時，每次渲染覆前次
- **批模式記憶**：長批之運行或累記憶。考慮用 `callr::r()` 以隔離

## 相關技能

- `create-quarto-report` — 基礎 Quarto 文檔設置
- `generate-statistical-tables` — 隨參數調之表
- `format-apa-report` — 參數化學術報告
