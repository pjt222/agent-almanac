---
name: build-parameterized-report
locale: wenyan-ultra
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

# 建參報

造受參之報，自一模生多客變。

## 用

- 為異部、域、期生同報
- 自模造客專報
- 建濾於具子之儀
- 自定期報附異入

## 入

- **必**：報模（Quarto 或 R Markdown）
- **必**：參定（名、類、默）
- **可**：批生之參值列
- **可**：生報之出目

## 行

### 一：YAML 定參

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

**得：** YAML 頭含 `params:` 塊附名參，各有正類默值。

**敗：** 渲敗報「object 'params' not found」→確 `params:` 塊於 YAML 首縮對。Quarto `params` 必於 YAML 頂，非 `format:` 下嵌。

### 二：碼中用參

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

**得：** 碼塊以 `params$name` 引參，條塊以 Quarto `#| eval: !expr params$flag`。行內 R 表如 `` `r params$region` `` 渲動文。

**敗：** `params$name` 返 NULL→驗參名於 YAML 與碼全合（區大小）。察默值類正。

### 三：以客參渲

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

**得：** 單報以客參值成渲，覆 YAML 默。出檔於所述徑造。

**敗：** Quarto 渲敗→察 `quarto` CLI 已裝且於 PATH。R Markdown 敗→驗 `rmarkdown` 已裝。確參名於 `execute_params`（Quarto）或 `params`（R Markdown）合 YAML 定。

### 四：批渲多報

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

**得：** 每域年組一 HTML。

**敗：** 察參名於 YAML 與碼全合。確諸參值有效。

### 五：加參驗

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**得：** 驗碼塊於每渲始行，若參出範或類誤則以清誤止。

**敗：** `stopifnot()` 生無益訊→換顯 `if (!cond) stop("message")` 呼以清診。

### 六：組出

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

**得：** 出檔書於日戳子目附述名（如 `reports/2025-06/report-europe.html`）。

**敗：** `dir.create()` 敗→察父目存且可書。Windows 上驗徑長不過 260 字。

## 驗

- [ ] 報以默參渲
- [ ] 報以每組客參渲
- [ ] 參處前驗
- [ ] 出檔命述
- [ ] 條段依參正渲
- [ ] 批生於諸組完

## 忌

- **參名不合**：YAML 名必全合碼 `params$name` 引
- **類強轉**：YAML 或解 `year: 2025` 為整，而碼候字元。必顯。
- **條評**：Quarto 用 `#| eval: !expr params$flag`，非 `eval = params$flag`
- **檔覆**：無唯出名→每渲覆前
- **批記**：久批或積記。宜用 `callr::r()` 為隔。

## 參

- `create-quarto-report` — 基 Quarto 文設
- `generate-statistical-tables` — 適參之表
- `format-apa-report` — 參化學術報
