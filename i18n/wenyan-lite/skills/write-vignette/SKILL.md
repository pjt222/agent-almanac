---
name: write-vignette
locale: wenyan-lite
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

# 撰寫 Vignette

為 R 套件建立長篇文檔 vignette。

## 適用時機

- 為套件加「Getting Started」教學
- 記錄跨多個函式之複雜工作流
- 建立領域特定指引（如統計方法）
- CRAN 遞交需面向用戶之文檔,超出函式說明頁

## 輸入

- **必要**：含欲文檔化函式之 R 套件
- **必要**：vignette 標題與主題
- **選擇性**：格式（R Markdown 或 Quarto,預設 R Markdown）
- **選擇性**：vignette 是否需外部資料或 API

## 步驟

### 步驟一：建立 vignette 文件

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**預期：** `vignettes/getting-started.Rmd` 已建立,含 YAML frontmatter。`knitr` 與 `rmarkdown` 加至 DESCRIPTION 之 Suggests 欄位。`vignettes/` 目錄存在。

**失敗時：** 若 `usethis::use_vignette()` 失敗,驗證工作目錄為套件根（含 `DESCRIPTION`）。若 `knitr` 未安裝,先跑 `install.packages("knitr")`。手動建立時,親手建 `vignettes/` 目錄與文件,確保 YAML frontmatter 含全部三個 `%\Vignette*` 條目。

### 步驟二：撰寫 vignette 內容

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

**預期：** vignette Rmd 文件含 Introduction、Installation、Basic Usage、Advanced Features 與 Conclusion 段。代碼範例用套件之匯出函式並產生可見輸出。

**失敗時：** 若範例無法運行,驗證套件已以 `devtools::install()` 安裝。確保範例於 `library()` 呼叫中用套件名（非 `devtools::load_all()`）。對需外部資源之函式,用 `eval=FALSE` 顯示代碼但不執行。

### 步驟三：配置代碼區塊

依不同用途用區塊選項：

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

**預期：** 含 `include=FALSE` 之設置區塊設全局選項（`collapse`、`comment`、`fig.width`、`fig.height`）。區塊適當配置：說明性代碼用 `eval=FALSE`、隱藏設置用 `echo=FALSE`、互動範例用標準區塊。

**失敗時：** 若區塊選項不生效,驗證語法用 `{r chunk-name, option=value}` 格式（逗號分隔、邏輯值無引號）。確保設置區塊先運行,將之置於文件頂端。

### 步驟四：處理外部依賴

對需網路存取或選擇性套件之 vignette：

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

對長運行計算,預計算並儲存結果：

```r
# Save pre-computed results to vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Load in vignette
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**預期：** 外部依賴得優雅處理：選擇性套件以 `requireNamespace()` 條件載入、依網路之代碼用 `eval=FALSE` 或 `tryCatch()`、昂貴計算用預計算之 `.rds` 文件。

**失敗時：** 若 vignette 於 CRAN 因不可用之選擇性套件失敗,將那些段以條件變數包裹（如 `eval=has_suggested`）。對預計算結果,確保 `.rds` 文件納入 `vignettes/` 目錄,以相對路徑引用之。

### 步驟五：建構並測試 vignette

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

**預期：** vignette 建構無錯誤。HTML 輸出可讀。

**失敗時：**
- 缺 pandoc：於 `.Renviron` 設 `RSTUDIO_PANDOC`
- 套件未安裝：先跑 `devtools::install()`
- 缺 Suggests：安裝 DESCRIPTION 之 Suggests 中所列套件

### 步驟六：於套件檢查中驗證

```r
devtools::check()
```

vignette 相關檢查：建構正確、不耗時太久、無錯誤。

**預期：** `devtools::check()` 通過,無 vignette 相關錯誤或警告。vignette 於 CRAN 時間限制內建構（典型 60 秒以下）。

**失敗時：** 若 vignette 致檢查失敗,常見修復含：將缺失之 Suggests 套件加至 DESCRIPTION、以 `eval=FALSE` 縮短建構時間（對慢區塊）、確保 `VignetteIndexEntry` 匹配標題。獨立跑 `devtools::build_vignettes()` 以隔離 vignette 特定錯誤。

## 驗證

- [ ] vignette 經 `devtools::build_vignettes()` 建構無錯誤
- [ ] 所有代碼區塊正確執行
- [ ] VignetteIndexEntry 匹配標題
- [ ] `devtools::check()` 通過,無 vignette 警告
- [ ] vignette 出現於 pkgdown 站之文章中（若適用）
- [ ] 建構時間合理（CRAN 用 < 60 秒）

## 常見陷阱

- **VignetteIndexEntry 不匹配**：YAML 中之索引條目須匹配欲用戶於 `vignette(package = "pkg")` 中所見者
- **缺 `vignette` YAML 區塊**：全部三個 `%\Vignette*` 行皆必要
- **vignette 對 CRAN 太慢**：對昂貴操作預計算結果或用 `eval=FALSE`
- **pandoc 找不到**：確保 `RSTUDIO_PANDOC` 環境變數已設
- **自引用套件**：vignette 中用 `library(packagename)`,非 `devtools::load_all()`

## 相關技能

- `write-roxygen-docs` — 函式級文檔補 vignette 教學
- `build-pkgdown-site` — vignette 於 pkgdown 站作為文章呈現
- `submit-to-cran` — CRAN 有特定 vignette 要求
- `create-quarto-report` — Quarto 作為 R Markdown vignette 之替代
