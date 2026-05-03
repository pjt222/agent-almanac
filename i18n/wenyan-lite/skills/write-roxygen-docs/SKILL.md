---
name: write-roxygen-docs
locale: wenyan-lite
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

# 撰寫 Roxygen 文檔

為 R 套件之函式、資料集與類別建立完整之 roxygen2 文檔。

## 適用時機

- 為新匯出函式加文檔
- 為內部輔助函式加文檔
- 為套件資料集加文檔
- 為 S3/S4/R6 類別與方法加文檔
- 修復文檔相關之 `R CMD check` 註

## 輸入

- **必要**：欲文檔化之 R 函式、資料集或類別
- **選擇性**：交叉引用之相關函式（`@family`、`@seealso`）
- **選擇性**：函式是否應匯出

## 步驟

### 步驟一：撰寫函式文檔

將 roxygen 註解直接置於函式上方：

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

**預期：** 完整之 roxygen 區塊,含標題、描述、各參數之 `@param`、`@return`、`@examples` 與 `@export`。

**失敗時：** 若不確某標籤,查 `?roxygen2::rd_roclet`。常見遺漏為 `@return`,CRAN 要求所有匯出函式皆需。

### 步驟二：必要標籤參考

| 標籤 | 用途 | 匯出時必要？ |
|-----|---------|---------------------|
| `#' Title` | 首行,一句 | 是 |
| `#' Description` | 空白行後之段落 | 是 |
| `@param` | 參數文檔 | 是 |
| `@return` | 返回值描述 | 是（CRAN）|
| `@examples` | 用法範例 | 強烈建議 |
| `@export` | 加至 NAMESPACE | 是,對公共 API |
| `@family` | 將相關函式分組 | 建議 |
| `@seealso` | 交叉引用 | 選擇性 |
| `@keywords internal` | 標為內部 | 對非匯出文檔 |

**預期：** 函式類型所需之所有標籤皆已辨識。匯出函式至少有 `@param`、`@return`、`@examples` 與 `@export`。

**失敗時：** 若不熟某標籤,參 [roxygen2 文檔](https://roxygen2.r-lib.org/articles/rd.html) 之用法與語法。

### 步驟三：文檔化資料集

建立 `R/data.R`：

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

**預期：** `R/data.R` 含各資料集之 roxygen 區塊,以 `@format` 描述結構,以 `@source` 提供資料來源。

**失敗時：** 若 `R CMD check` 警告未文檔化之資料集,確保引號中之字串（如 `"city_temperatures"`）精確匹配以 `usethis::use_data()` 儲存之物件名。

### 步驟四：文檔化套件

建立 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**預期：** `R/packagename-package.R` 存在,含 `@keywords internal` 與 `"_PACKAGE"` 標記。執行 `devtools::document()` 生成 `man/packagename-package.Rd`。

**失敗時：** 若 `R CMD check` 報缺套件文檔頁,驗證文件名為 `R/<packagename>-package.R` 且含 `"_PACKAGE"` 字串。

### 步驟五：處理特殊情況

**含點之函式名**（S3 方法）：

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**以 `@inheritParams` 重用文檔**：

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**用 `.data` 代詞之 no visible binding 修復**：

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**預期：** 特殊情況（S3 方法、繼承參數、`.data` 代詞）得正確文檔化。`@rdname` 將 S3 方法分組。`@inheritParams` 重用參數文檔而不重複。

**失敗時：** 若 `R CMD check` 警告「no visible binding for global variable」,加 `#' @importFrom rlang .data` 或最後手段用 `utils::globalVariables()`。

### 步驟六：生成文檔

```r
devtools::document()
```

**預期：** `man/` 目錄已更新,各文檔化物件有 `.Rd` 文件。`NAMESPACE` 已重新生成,含正確之匯出與匯入。

**失敗時：** 檢查 roxygen 語法錯誤。常見問題：`\describe{}` 中未閉之括號、行上缺 `#'` 前綴或無效標籤名。修復後再跑 `devtools::document()`。

## 驗證

- [ ] 每匯出函式皆有 `@param`、`@return` 與 `@examples`
- [ ] `devtools::document()` 運行無錯誤
- [ ] `devtools::check()` 無文檔警告
- [ ] `@family` 標籤正確將相關函式分組
- [ ] 範例運行無錯誤（以 `devtools::run_examples()` 測試）

## 常見陷阱

- **缺 `@return`**：CRAN 要求所有匯出函式皆文檔化其返回值
- **需網路/認證之範例**：以 `\dontrun{}` 包裹,並加註說明原因
- **慢範例**：對可運行但對 CRAN 太慢者用 `\donttest{}`
- **roxygen 中之 markdown**：於 DESCRIPTION 中以 `Roxygen: list(markdown = TRUE)` 啟用
- **忘跑 `devtools::document()`**：man 頁為生成,非手寫

## 相關技能

- `create-r-package` — 含 roxygen 配置之初始套件設置
- `write-testthat-tests` — 測試所文檔化之函式
- `write-vignette` — 函式參考之外之長篇文檔
- `submit-to-cran` — CRAN 之文檔要求
