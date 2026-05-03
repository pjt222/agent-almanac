---
name: write-roxygen-docs
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write roxygen2 documentation for R package functions, datasets, and
  classes. Covers all standard tags, cross-references, examples,
  and generating NAMESPACE entries. Follows tidyverse documentation style.
  Use when adding documentation to new exported functions, documenting
  internal helpers or datasets, documenting S3/S4/R6 classes and methods,
  or fixing documentation-related R CMD check notes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, roxygen2, documentation, namespace
---

# 書 roxygen 文

立全 roxygen2 文於 R 包之函、數、類。

## 用時

- 加文於新出之函
- 錄內助函
- 錄包之數
- 錄 S3/S4/R6 類與法
- 修文相關之 `R CMD check` 注

## 入

- **必要**：欲錄之 R 函、數、或類
- **可選**：相關函以互引（`@family`、`@seealso`）
- **可選**：函是否宜出

## 法

### 第一步：書函之文

置 roxygen 注於函之上：

```r
#' Compute the weighted mean of a numeric vector
#'
#' Calculates the arithmetic mean of `x` weighted by `w`. Missing values
#' in either `x` or `w` are handled according to the `na.rm` parameter.
#'
#' @param x A numeric vector of values.
#' @param w A numeric vector of weights, same length as `x`.
#' @param na.rm Logical. Should missing values be removed? Default `FALSE`.
#'
#' @return A single numeric value representing the weighted mean.
#'
#' @examples
#' weighted_mean(1:5, rep(1, 5))
#' weighted_mean(c(1, 2, NA, 4), c(1, 1, 1, 1), na.rm = TRUE)
#'
#' @export
#' @family summary functions
#' @seealso [stats::weighted.mean()] for the base R equivalent
weighted_mean <- function(x, w, na.rm = FALSE) {
  # implementation
}
```

得：全 roxygen 塊含題、述、各參之 `@param`、`@return`、`@examples`、與 `@export`。

敗則：標不確者，察 `?roxygen2::rd_roclet`。常忽 `@return`，CRAN 為諸出函所必。

### 第二步：要標參

| 標 | 用 | 出必乎？ |
|-----|---------|---------------------|
| `#' Title` | 首行、一句 | 是 |
| `#' Description` | 空行後一段 | 是 |
| `@param` | 參之文 | 是 |
| `@return` | 返值述 | 是（CRAN）|
| `@examples` | 用例 | 強推 |
| `@export` | 加於 NAMESPACE | 是，公 API |
| `@family` | 群相關函 | 推 |
| `@seealso` | 互引 | 可選 |
| `@keywords internal` | 標為內 | 為非出文 |

得：諸函類所需標皆識。出函至少含 `@param`、`@return`、`@examples`、與 `@export`。

敗則：標陌者，查 [roxygen2 之文](https://roxygen2.r-lib.org/articles/rd.html) 為用與語法。

### 第三步：錄數

立 `R/data.R`：

```r
#' Example dataset of city temperatures
#'
#' A dataset containing daily temperature readings for major cities.
#'
#' @format A data frame with 365 rows and 4 variables:
#' \describe{
#'   \item{date}{Date of observation}
#'   \item{city}{City name}
#'   \item{temp_c}{Temperature in Celsius}
#'   \item{humidity}{Relative humidity percentage}
#' }
#' @source \url{https://example.com/data}
"city_temperatures"
```

得：`R/data.R` 含每數之 roxygen 塊，附 `@format` 述結構與 `@source` 供數源。

敗則：`R/CMD check` 警未錄之數者，確引串（如 `"city_temperatures"`）精配 `usethis::use_data()` 所存物名。

### 第四步：錄包

立 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

得：`R/packagename-package.R` 存附 `@keywords internal` 與 `"_PACKAGE"` 哨。行 `devtools::document()` 生 `man/packagename-package.Rd`。

敗則：`R CMD check` 報缺包文頁者，驗文名為 `R/<packagename>-package.R` 且含 `"_PACKAGE"` 串。

### 第五步：處特例

**名含點之函**（S3 法）：

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**重用文** 以 `@inheritParams`：

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**「無可見綁」修** 用 `.data` 代名：

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

得：特例（S3 法、繼參、`.data` 代名）正錄。`@rdname` 群 S3 法。`@inheritParams` 重用參文無重複。

敗則：`R CMD check` 警「無可見綁全變」者，加 `#' @importFrom rlang .data` 或末用 `utils::globalVariables()`。

### 第六步：生其文

```r
devtools::document()
```

得：`man/` 域更附每錄物之 `.Rd` 文。`NAMESPACE` 重生附正出與入。

敗則：察 roxygen 語法訛。常見：`\describe{}` 中括未閉、行缺 `#'` 首、或標名無效。修後再行 `devtools::document()`。

## 驗

- [ ] 諸出函有 `@param`、`@return`、`@examples`
- [ ] `devtools::document()` 無訛行
- [ ] `devtools::check()` 無文警
- [ ] `@family` 標正群相關函
- [ ] 例無訛行（試 `devtools::run_examples()`）

## 陷

- **缺 `@return`**：CRAN 諸出函必錄返值
- **例需網/證**：`\dontrun{}` 包之附注釋故
- **慢例**：`\donttest{}` 為運而 CRAN 過久之例
- **roxygen 中 markdown**：DESCRIPTION 中 `Roxygen: list(markdown = TRUE)` 啟之
- **忘行 `devtools::document()`**：man 頁為生，非手書

## 參

- `create-r-package` - 包初設含 roxygen 設
- `write-testthat-tests` - 試所錄之函
- `write-vignette` - 函參外之長文
- `submit-to-cran` - CRAN 之文要
