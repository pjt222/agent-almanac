---
name: write-vignette
locale: wenyan
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

# 書 vignette

為 R 包立長文 vignette。

## 用時

- 為包加「始入」之教程
- 錄跨多函之複流
- 立域特之指南（如統計法）
- CRAN 呈需逾函助之用戶向文

## 入

- **必要**：含函欲錄之 R 包
- **必要**：vignette 之題與題
- **可選**：式（R Markdown 或 Quarto，默 R Markdown）
- **可選**：vignette 是否需外數或 API

## 法

### 第一步：立 vignette 文

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

得：`vignettes/getting-started.Rmd` 立附 YAML 額。`knitr` 與 `rmarkdown` 加於 DESCRIPTION 之 Suggests。`vignettes/` 域存。

敗則：`usethis::use_vignette()` 敗者，驗工目為包根（含 `DESCRIPTION`）。`knitr` 未裝者，先行 `install.packages("knitr")`。手立者，立 `vignettes/` 域與文，確 YAML 額含三 `%\Vignette*` 條。

### 第二步：書 vignette 之內

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

得：vignette Rmd 含 Introduction、Installation、Basic Usage、Advanced Features、Conclusion 段。碼例用包之出函生顯出。

敗則：例不行者，驗包以 `devtools::install()` 已裝。確例於 `library()` 用包名（非 `devtools::load_all()`）。需外資之函者，用 `eval=FALSE` 示碼而不執。

### 第三步：設碼塊

依用設塊：

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

得：附 `include=FALSE` 之設塊定全選（`collapse`、`comment`、`fig.width`、`fig.height`）。塊宜設：`eval=FALSE` 為示碼、`echo=FALSE` 為隱設、標塊為互例。

敗則：塊選不效者，驗語法用 `{r chunk-name, option=value}` 式（逗分、邏值無引）。確設塊先行，置文首。

### 第四步：處外依

需網或可選包之 vignette：

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

長算者，預算而存果：

```r
# Save pre-computed results to vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Load in vignette
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

得：外依正處：可選包以 `requireNamespace()` 條載、網依碼用 `eval=FALSE` 或 `tryCatch()`、貴算用預算 `.rds` 文。

敗則：vignette 於 CRAN 因可選包不可而敗者，以條變（如 `eval=has_suggested`）包之。預算果者，確 `.rds` 文於 `vignettes/` 域且以相對徑引。

### 第五步：建而試 vignette

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

得：vignette 建無訛。HTML 出可讀。

敗則：
- 缺 pandoc：於 `.Renviron` 設 `RSTUDIO_PANDOC`
- 包未裝：先行 `devtools::install()`
- 缺 Suggests：裝 DESCRIPTION 中 Suggests 列之包

### 第六步：於包察驗

```r
devtools::check()
```

vignette 相關察：建正、不過久、無訛。

得：`devtools::check()` 過無 vignette 相關訛或警。vignette 於 CRAN 時限內建（常 < 60 秒）。

敗則：vignette 致察敗者，常修：加缺 Suggests 包於 DESCRIPTION、以 `eval=FALSE` 於慢塊減建時、確 `VignetteIndexEntry` 配題。獨行 `devtools::build_vignettes()` 以孤 vignette 特訛。

## 驗

- [ ] vignette 經 `devtools::build_vignettes()` 無訛建
- [ ] 諸碼塊正執
- [ ] VignetteIndexEntry 配題
- [ ] `devtools::check()` 過無 vignette 警
- [ ] vignette 現於 pkgdown 文之 articles（若用）
- [ ] 建時合理（CRAN < 60 秒）

## 陷

- **VignetteIndexEntry 不配**：YAML 中索條必配 `vignette(package = "pkg")` 中所欲用者見
- **缺 `vignette` YAML 塊**：三 `%\Vignette*` 行皆需
- **vignette 對 CRAN 過慢**：預算果或於貴操用 `eval=FALSE`
- **pandoc 不見**：確 `RSTUDIO_PANDOC` 環變設
- **自引包**：vignette 中用 `library(packagename)` 非 `devtools::load_all()`

## 參

- `write-roxygen-docs` - 函級文補 vignette 教程
- `build-pkgdown-site` - vignette 於 pkgdown 站為 articles
- `submit-to-cran` - CRAN 有特 vignette 要
- `create-quarto-report` - Quarto 為 R Markdown vignette 之別
