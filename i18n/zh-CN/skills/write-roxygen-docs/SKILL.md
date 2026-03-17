---
name: write-roxygen-docs
description: >
  为 R 包函数、数据集和类编写 roxygen2 文档。涵盖所有标准标签、
  交叉引用、示例及 NAMESPACE 条目的生成，遵循 tidyverse 文档风格。
  适用于为新导出函数添加文档、记录内部辅助函数或数据集、记录
  S3/S4/R6 类及方法，或修复文档相关的 R CMD check 注记。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 编写 Roxygen 文档

为 R 包函数、数据集和类创建完整的 roxygen2 文档。

## 适用场景

- 为新导出函数添加文档
- 记录内部辅助函数
- 记录包数据集
- 记录 S3/S4/R6 类及方法
- 修复文档相关的 `R CMD check` 注记

## 输入

- **必需**：需要记录的 R 函数、数据集或类
- **可选**：用于交叉引用的相关函数（`@family`、`@seealso`）
- **可选**：函数是否应导出

## 步骤

### 第 1 步：编写函数文档

将 roxygen 注释直接放在函数上方：

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

**预期结果：** 完整的 roxygen 块，包含标题、描述、每个参数的 `@param`、`@return`、`@examples` 以及 `@export`。

**失败处理：** 若对某个标签不确定，查阅 `?roxygen2::rd_roclet`。常见遗漏是 `@return`，CRAN 要求所有导出函数必须包含此标签。

### 第 2 步：基本标签参考

| 标签 | 用途 | 导出时是否必需？ |
|-----|---------|---------------------|
| `#' Title` | 首行，一句话描述 | 是 |
| `#' Description` | 空行后的段落 | 是 |
| `@param` | 参数文档 | 是 |
| `@return` | 返回值描述 | 是（CRAN 要求） |
| `@examples` | 使用示例 | 强烈建议 |
| `@export` | 添加至 NAMESPACE | 是，用于公开 API |
| `@family` | 分组相关函数 | 建议 |
| `@seealso` | 交叉引用 | 可选 |
| `@keywords internal` | 标记为内部函数 | 用于不导出的文档 |

**预期结果：** 已识别适合该函数类型的所有必需标签。导出函数至少包含 `@param`、`@return`、`@examples` 和 `@export`。

**失败处理：** 若某标签不熟悉，查阅 [roxygen2 文档](https://roxygen2.r-lib.org/articles/rd.html) 了解用法和语法。

### 第 3 步：记录数据集

创建 `R/data.R`：

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

**预期结果：** `R/data.R` 包含每个数据集的 roxygen 块，`@format` 描述数据结构，`@source` 提供数据来源。

**失败处理：** 若 `R CMD check` 警告存在未记录的数据集，确保引号中的字符串（如 `"city_temperatures"`）与 `usethis::use_data()` 保存的对象名称完全匹配。

### 第 4 步：记录包本身

创建 `R/packagename-package.R`：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**预期结果：** `R/packagename-package.R` 存在，包含 `@keywords internal` 和 `"_PACKAGE"` 哨兵字符串。运行 `devtools::document()` 后生成 `man/packagename-package.Rd`。

**失败处理：** 若 `R CMD check` 报告缺少包文档页，确认文件命名为 `R/<packagename>-package.R` 且包含 `"_PACKAGE"` 字符串。

### 第 5 步：处理特殊情况

**带点号函数名**（S3 方法）：

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**使用 `@inheritParams` 复用文档**：

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**使用 `.data` 代词修复"无可见绑定"警告**：

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**预期结果：** 特殊情况（S3 方法、继承参数、`.data` 代词）的文档处理正确。`@rdname` 将 S3 方法合并，`@inheritParams` 复用参数文档而无需重复。

**失败处理：** 若 `R CMD check` 警告"no visible binding for global variable"，添加 `#' @importFrom rlang .data`，或作为最后手段使用 `utils::globalVariables()`。

### 第 6 步：生成文档

```r
devtools::document()
```

**预期结果：** `man/` 目录已用每个文档对象的 `.Rd` 文件更新。NAMESPACE 已重新生成，包含正确的导出和导入条目。

**失败处理：** 检查 roxygen 语法错误。常见问题：`\describe{}` 中括号未闭合、某行缺少 `#'` 前缀、标签名无效。修复后重新运行 `devtools::document()`。

## 验证清单

- [ ] 每个导出函数均有 `@param`、`@return` 和 `@examples`
- [ ] `devtools::document()` 运行无错误
- [ ] `devtools::check()` 无文档相关警告
- [ ] `@family` 标签正确分组相关函数
- [ ] 示例运行无错误（使用 `devtools::run_examples()` 测试）

## 常见问题

- **缺少 `@return`**：CRAN 要求所有导出函数记录返回值
- **示例需要网络或认证**：用 `\dontrun{}` 包裹并注释说明原因
- **示例过慢**：对能运行但对 CRAN 而言耗时过长的示例使用 `\donttest{}`
- **roxygen 中使用 Markdown**：在 DESCRIPTION 中启用 `Roxygen: list(markdown = TRUE)`
- **忘记运行 `devtools::document()`**：man 页面是生成的，而非手写的

## 相关技能

- `create-r-package` — 包含 roxygen 配置的包初始化
- `write-testthat-tests` — 为已记录的函数编写测试
- `write-vignette` — 函数参考之外的长篇文档
- `submit-to-cran` — CRAN 对文档的要求
