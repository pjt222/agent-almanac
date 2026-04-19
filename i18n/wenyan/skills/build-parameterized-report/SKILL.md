---
name: build-parameterized-report
locale: wenyan
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

# 建參之報

建受參之報，以諸入自一範生諸變。

## 用時

- 為異部、區、時段生同報
- 自範建客特之報
- 建篩至特子集之盤
- 以異入自動化週期報

## 入

- **必要**：報範（Quarto 或 R Markdown）
- **必要**：參定（名、類、默）
- **可選**：批生之參值列
- **可選**：輸出報之目

## 法

### 第一步：於 YAML 定參

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

**得：** YAML 頭含 `params:` 塊，諸名參各有正類之默值。

**敗則：** 若渲失以「object 'params' not found」，確 `params:` 塊正縮於 YAML 頭。Quarto 中 `params` 必居 YAML 頂級，非嵌 `format:` 下。

### 第二步：於碼用參

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

**得：** 碼塊以 `params$name` 引參，條件塊用 `#| eval: !expr params$flag`（Quarto）。內聯 R 表如 `` `r params$region` `` 生動文。

**敗則：** 若 `params$name` 返 NULL，驗參名於 YAML 與碼引全合（別大小）。察默值之類正。

### 第三步：以自訂參渲

單渲：

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

**得：** 單報以自訂參值覆 YAML 默而成渲。輸出檔建於所指之路。

**敗則：** Quarto 敗者，察 `quarto` CLI 已裝且於 PATH。R Markdown 敗者，驗 `rmarkdown` 已裝。確 `execute_params`（Quarto）或 `params`（R Markdown）中參名全合 YAML 定。

### 第四步：批渲諸報

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

**得：** 每區年之合生一 HTML 檔。

**敗則：** 察 YAML 與碼間參名全合。確諸參值有效。

### 第五步：加參之驗

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**得：** 驗碼塊於各渲之始行，若參逾範或類誤則以明錯止。

**敗則：** 若 `stopifnot()` 之錯言不明，改為明 `if (!cond) stop("message")` 以清診。

### 第六步：組輸出

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

**得：** 輸出檔書於日戳之子目，含述名（如 `reports/2025-06/report-europe.html`）。

**敗則：** 若 `dir.create()` 敗，察父目存而可書。Windows 上驗路不過 260 字。

## 驗

- [ ] 報以默參成渲
- [ ] 報以諸自訂參集成渲
- [ ] 參於處前已驗
- [ ] 輸出檔以述名名之
- [ ] 條件段依參正渲
- [ ] 批生於諸合皆畢

## 陷

- **參名不合**：YAML 名必全合碼中 `params$name` 之引
- **型強轉**：YAML 或解 `year: 2025` 為整而碼望字。宜明
- **條件估**：Quarto 用 `#| eval: !expr params$flag`，非 `eval = params$flag`
- **檔覆寫**：無獨輸名，每渲覆前
- **批模之記**：久批或累記。考用 `callr::r()` 以隔

## 參

- `create-quarto-report` - 基 Quarto 檔立
- `generate-statistical-tables` - 適參之表
- `format-apa-report` - 參之學報
