---
name: add-rcpp-integration
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Add Rcpp or RcppArmadillo integration to an R package for
  high-performance C++ code. Covers setup, writing C++ functions,
  RcppExports generation, testing compiled code, and debugging. Use when
  an R function is too slow and profiling confirms a bottleneck, when you
  need to interface with existing C/C++ libraries, or when implementing
  algorithms (loops, recursion, linear algebra) that benefit from compiled code.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
---

# 納 Rcpp 整合

於 R 包以 Rcpp 納 C++ 碼，用於性能要之操作。

## 用時

- R 函過緩而剖析確認瓶頸乃用
- 需連既有 C/C++ 庫乃用
- 實益於編譯之算法（環、遞歸）乃用
- 增 RcppArmadillo 以行線性代數乃用

## 入

- **必要**：既存之 R 包
- **必要**：將以 C++ 代或增之 R 函
- **可選**：將連之外 C++ 庫
- **可選**：用 RcppArmadillo 乎（默：純 Rcpp）

## 法

### 第一步：設 Rcpp 基

```r
usethis::use_rcpp()
```

此舉：
- 建 `src/` 目
- 於 DESCRIPTION 之 LinkingTo 與 Imports 添 `Rcpp`
- 建 `R/packagename-package.R`，含 `@useDynLib` 與 `@importFrom Rcpp sourceCpp`
- 更 `.gitignore` 以避編譯檔

用 RcppArmadillo：

```r
usethis::use_rcpp_armadillo()
```

**得：** `src/` 目已建，DESCRIPTION 已更 LinkingTo 與 Imports 之 `Rcpp`，`R/packagename-package.R` 含 `@useDynLib` 指令。

**敗則：** 若 `usethis::use_rcpp()` 敗，手建 `src/`，於 DESCRIPTION 添 `LinkingTo: Rcpp` 與 `Imports: Rcpp`，於包級文檔添 `#' @useDynLib packagename, .registration = TRUE` 與 `#' @importFrom Rcpp sourceCpp`。

### 第二步：書 C++ 函

建 `src/my_function.cpp`：

```cpp
#include <Rcpp.h>
using namespace Rcpp;

//' Compute cumulative sum efficiently
//'
//' @param x A numeric vector
//' @return A numeric vector of cumulative sums
//' @export
// [[Rcpp::export]]
NumericVector cumsum_cpp(NumericVector x) {
  int n = x.size();
  NumericVector out(n);
  out[0] = x[0];
  for (int i = 1; i < n; i++) {
    out[i] = out[i - 1] + x[i];
  }
  return out;
}
```

用 RcppArmadillo：

```cpp
#include <RcppArmadillo.h>
// [[Rcpp::depends(RcppArmadillo)]]

//' Matrix multiplication using Armadillo
//'
//' @param A A numeric matrix
//' @param B A numeric matrix
//' @return The matrix product A * B
//' @export
// [[Rcpp::export]]
arma::mat mat_mult(const arma::mat& A, const arma::mat& B) {
  return A * B;
}
```

**得：** C++ 源檔存於 `src/my_function.cpp`，有 `// [[Rcpp::export]]` 注及 `//'` 之 roxygen 注。

**敗則：** 驗用 `#include <Rcpp.h>`（Armadillo 則 `<RcppArmadillo.h>`），導出注自成一行居函簽上，返型合於 Rcpp 型。

### 第三步：生 RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**得：** `R/RcppExports.R` 與 `src/RcppExports.cpp` 自生。

**敗則：** 察 C++ 之語法訛。確 `// [[Rcpp::export]]` 置各導出函之上。

### 第四步：驗編譯

```r
devtools::load_all()
```

**得：** 包編而載無訛。

**敗則：** 察編譯器之出。常患：
- 系統頭缺：裝開發庫
- 語法訛：編譯器指其行
- RcppArmadillo 缺 `Rcpp::depends` 注

### 第五步：書編碼之試

```r
test_that("cumsum_cpp matches base R", {
  x <- c(1, 2, 3, 4, 5)
  expect_equal(cumsum_cpp(x), cumsum(x))
})

test_that("cumsum_cpp handles edge cases", {
  expect_equal(cumsum_cpp(numeric(0)), numeric(0))
  expect_equal(cumsum_cpp(c(NA_real_, 1)), c(NA_real_, NA_real_))
})
```

**得：** 試皆過，確 C++ 函與 R 等，處邊例（空量、NA）正。

**敗則：** NA 試敗則於 C++ 中以 `NumericVector::is_na()` 明察。空入試敗則函首加長零之守。

### 第六步：添清理之本

建 `src/Makevars`：

```makefile
PKG_CXXFLAGS = -O2
```

建 `cleanup` 於包根（為 CRAN）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

授可執：`chmod +x cleanup`

**得：** `src/Makevars` 設編譯旗，`cleanup` 本除編譯物。二檔皆於包根。

**敗則：** 驗 `cleanup` 可執（`chmod +x cleanup`），`Makevars` 用 tab（非空格）縮以寫 Makefile 之則。

### 第七步：更 .Rbuildignore

確編譯物已處：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**得：** `.Rbuildignore` 之式避編譯物入包焰，而存源與 Makevars。

**敗則：** 行 `devtools::check()` 察 `src/` 未期之檔之 NOTE。調 `.Rbuildignore` 只排 `.o`、`.so`、`.dll`。

## 驗

- [ ] `devtools::load_all()` 編而無警
- [ ] 編函生正果
- [ ] 邊例（NA、空、大入）之試皆過
- [ ] `R CMD check` 過無編譯之警
- [ ] RcppExports 檔已生並提交
- [ ] 以基準確性能之進

## 陷

- **遺 `compileAttributes()`**：改 C++ 後必再生 RcppExports
- **整溢**：大數用 `double` 非 `int`
- **記憶之治**：Rcpp 自治其型之記憶；勿手 `delete`
- **NA 之處**：C++ 不識 R 之 NA。以 `Rcpp::NumericVector::is_na()` 察
- **平臺可攜**：避平臺特之 C++ 特性。試於 Windows、macOS、Linux
- **`@useDynLib` 闕**：包級文檔必含 `@useDynLib packagename, .registration = TRUE`

## 參

- `create-r-package` — 增 Rcpp 前之包設
- `write-testthat-tests` — 試編譯之函
- `setup-github-actions-ci` — CI 須有 C++ 之具
- `submit-to-cran` — 編譯包需額外 CRAN 之查
