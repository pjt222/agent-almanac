---
name: write-roxygen-docs
locale: wenyan-ultra
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

# 書 Roxygen 文

立 R 包函、數、類之全 roxygen2 文。

## 用

- 為新出函加文→用
- 錄內輔函→用
- 錄包數→用
- 錄 S3/S4/R6 類與法→用
- 修文相關 `R CMD check` 註→用

## 入

- **必**：欲錄之 R 函、數、類
- **可**：交參之關函（`@family`、`@seealso`）
- **可**：函是否出

## 行

### 一：書函文

置 roxygen 註於函上：

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

得：完 roxygen 塊含題、述、各參之 `@param`、`@return`、`@examples`、`@export`。

敗：標不確→察 `?roxygen2::rd_roclet`。常漏為 `@return`，CRAN 對諸出函要。

### 二：要標參

| 標 | 用 | 出函必？ |
|----|-----|---------|
| `#' Title` | 首行、一句 | 是 |
| `#' Description` | 空行後段 | 是 |
| `@param` | 參文 | 是 |
| `@return` | 返值述 | 是（CRAN）|
| `@examples` | 用例 | 強薦 |
| `@export` | 加 NAMESPACE | 是，公 API |
| `@family` | 關函組 | 薦 |
| `@seealso` | 交參 | 可 |
| `@keywords internal` | 標內 | 為非出文 |

得：函型須標皆辨。出函至少有 `@param`、`@return`、`@examples`、`@export`。

敗：標未識→參 [roxygen2 文](https://roxygen2.r-lib.org/articles/rd.html) 之用與法。

### 三：錄數

建 `R/data.R`：

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

得：`R/data.R` 含每數之 roxygen 塊附述構之 `@format` 與述源之 `@source`。

敗：`R CMD check` 警未錄數→確引串（如 `"city_temperatures"`）精配 `usethis::use_data()` 存物名。

### 四：錄包

建 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

得：`R/packagename-package.R` 存附 `@keywords internal` 與 `"_PACKAGE"` 標。`devtools::document()` 生 `man/packagename-package.Rd`。

敗：`R CMD check` 報缺包文→驗檔名為 `R/<packagename>-package.R` 且含 `"_PACKAGE"` 串。

### 五：應特例

**含點函**（S3 法）：

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**復用文** 以 `@inheritParams`：

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**無見綁修** 用 `.data` 代詞：

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

得：特例（S3 法、繼參、`.data` 代詞）正錄。`@rdname` 組 S3 法。`@inheritParams` 復用參文無重。

敗：`R CMD check` 警「no visible binding for global variable」→加 `#' @importFrom rlang .data` 或末計用 `utils::globalVariables()`。

### 六：生文

```r
devtools::document()
```

得：`man/` 目更附每錄物之 `.Rd` 檔。`NAMESPACE` 重生附正出與入。

敗：察 roxygen 法誤。常疾：`\describe{}` 中括未閉、行缺 `#'` 前綴、無效標名。修後再行 `devtools::document()`。

## 驗

- [ ] 每出函有 `@param`、`@return`、`@examples`
- [ ] `devtools::document()` 行無誤
- [ ] `devtools::check()` 無文警
- [ ] `@family` 標正組關函
- [ ] 例行無誤（以 `devtools::run_examples()` 試）

## 忌

- **缺 `@return`**：CRAN 要諸出函錄返值
- **例需網/認**：以 `\dontrun{}` 包附註釋以何
- **慢例**：CRAN 過長之有效例用 `\donttest{}`
- **roxygen 中 markdown**：DESCRIPTION 中啟 `Roxygen: list(markdown = TRUE)`
- **忘行 `devtools::document()`**：man 頁為生、非手書

## 參

- `create-r-package` - 包設始含 roxygen 配
- `write-testthat-tests` - 試所錄函
- `write-vignette` - 函參之外長文
- `submit-to-cran` - CRAN 之文要
