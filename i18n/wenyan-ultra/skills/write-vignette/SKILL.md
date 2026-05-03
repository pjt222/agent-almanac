---
name: write-vignette
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Create R package vignettes using R Markdown or Quarto. Covers
  vignette setup, YAML configuration, code chunk options, building
  and testing, and CRAN requirements for vignettes. Use when adding a
  Getting Started tutorial, documenting complex workflows spanning multiple
  functions, creating domain-specific guides, or when CRAN submission
  requires user-facing documentation beyond function help pages.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, vignette, rmarkdown, documentation, tutorial
---

# 書示例

立 R 包之長文示例。

## 用

- 為包加「速啟」教→用
- 錄跨多函之複工流→用
- 立域指（如統法）→用
- CRAN 呈須超函助頁之用面文→用

## 入

- **必**：含欲錄函之 R 包
- **必**：示例題與目
- **可**：式（R Markdown 或 Quarto，默 R Markdown）
- **可**：示例需外數或 API 否

## 行

### 一：建示例檔

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

得：`vignettes/getting-started.Rmd` 建附 YAML 前綴。`knitr` 與 `rmarkdown` 加 DESCRIPTION 之 Suggests。`vignettes/` 目存。

敗：`usethis::use_vignette()` 敗→驗工目為包根（含 `DESCRIPTION`）。`knitr` 未裝→先 `install.packages("knitr")`。手建：手建 `vignettes/` 目與檔，確 YAML 前綴含三 `%\Vignette*` 條。

### 二：書示例容

```markdown
---
title: "Getting Started with packagename"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Getting Started with packagename}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

## Introduction

Brief overview of what the package does and who it's for.

## Installation

```r
install.packages("packagename")
library(packagename)
```

## Basic Usage

Walk through the primary workflow:

```r
# Load example data
data <- example_data()

# Process
result <- main_function(data, option = "default")

# Inspect
summary(result)
```

## Advanced Features

Cover optional or advanced functionality.

## Conclusion

Summarize and point to other vignettes or resources.
```

得：示例 Rmd 含 Introduction、Installation、Basic Usage、Advanced Features、Conclusion 節。碼例用包出函生可見出。

敗：例行敗→驗包以 `devtools::install()` 裝。確例用包名於 `library()`（非 `devtools::load_all()`）。須外資函用 `eval=FALSE` 示碼不行。

### 三：配碼塊

按用之塊選：

```r
# Standard evaluated chunk
{r example-basic}
result <- compute_something(1:10)
result

# Show code but don't run (for illustrative purposes)
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# Run but hide code (show only output)
{r hidden-setup, echo=FALSE}
library(packagename)

# Set global options
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

得：設塊附 `include=FALSE` 設全選（`collapse`、`comment`、`fig.width`、`fig.height`）。塊宜配：`eval=FALSE` 為示碼、`echo=FALSE` 為隱設、標塊為交互例。

敗：塊選未生效→驗法用 `{r chunk-name, option=value}`（逗分、邏值無引）。設塊置文頂以先行。

### 四：理外依

需網或可包之示例：

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

長算：預算存果：

```r
# Save pre-computed results to vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Load in vignette
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

得：外依優處：可包以 `requireNamespace()` 條載、網依碼用 `eval=FALSE` 或 `tryCatch()`、貴算用預算 `.rds` 檔。

敗：示例於 CRAN 因可包不存敗→以條變（如 `eval=has_suggested`）包之。預算果→確 `.rds` 檔含於 `vignettes/` 目附相對路。

### 五：建試示例

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

得：示例建無誤。HTML 出可讀。

敗：
- 缺 pandoc：`.Renviron` 設 `RSTUDIO_PANDOC`
- 包未裝：先 `devtools::install()`
- 缺 Suggests：裝 DESCRIPTION Suggests 中包

### 六：包察驗

```r
devtools::check()
```

示例察：建正、不過久、無誤。

得：`devtools::check()` 過無示例誤或警。示例於 CRAN 時內建（典 60 秒內）。

敗：示例致察敗→常修：DESCRIPTION 加缺 Suggests、慢塊 `eval=FALSE` 減建時、確 `VignetteIndexEntry` 配題。別行 `devtools::build_vignettes()` 隔示例特誤。

## 驗

- [ ] 示例以 `devtools::build_vignettes()` 建無誤
- [ ] 諸碼塊行正
- [ ] VignetteIndexEntry 配題
- [ ] `devtools::check()` 過無示例警
- [ ] 示例於 pkgdown 站文現（若應）
- [ ] 建時合理（CRAN < 60 秒）

## 忌

- **VignetteIndexEntry 不配**：YAML 中索引條須配欲用見於 `vignette(package = "pkg")` 者
- **缺 `vignette` YAML 塊**：三 `%\Vignette*` 行皆須
- **示例 CRAN 過慢**：預算或貴行用 `eval=FALSE`
- **Pandoc 未尋**：確 `RSTUDIO_PANDOC` 環變設
- **自參包**：示例用 `library(packagename)` 非 `devtools::load_all()`

## 參

- `write-roxygen-docs` - 函級文補示例教
- `build-pkgdown-site` - 示例現於 pkgdown 站為文
- `submit-to-cran` - CRAN 有特示例要
- `create-quarto-report` - Quarto 為 R Markdown 示例之替
