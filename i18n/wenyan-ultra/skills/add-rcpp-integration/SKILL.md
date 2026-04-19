---
name: add-rcpp-integration
locale: wenyan-ultra
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

# 接 Rcpp

入 C++ 於 R 包以速關行。

## 用

- R 函慢、剖證瓶→用
- 接既有 C/C++ 庫→用
- 算（環、遞）益於編→用
- 增 RcppArmadillo 為線代→用

## 入

- **必**：既存 R 包
- **必**：欲代或補之 R 函
- **可**：欲接之外 C++ 庫
- **可**：用 RcppArmadillo 否（默純 Rcpp）

## 行

### 一：設 Rcpp 基

```r
usethis::use_rcpp()
```

此：

- 建 `src/`
- 入 `Rcpp` 於 LinkingTo 與 Imports
- 建 `R/packagename-package.R` 含 `@useDynLib` 與 `@importFrom Rcpp sourceCpp`
- 更 `.gitignore` 避編檔

RcppArmadillo：

```r
usethis::use_rcpp_armadillo()
```

得：`src/` 已建，DESCRIPTION 含 `Rcpp` 於 LinkingTo 與 Imports，`R/packagename-package.R` 含 `@useDynLib`。

敗：`usethis::use_rcpp()` 敗→手建 `src/`、入 `LinkingTo: Rcpp` 與 `Imports: Rcpp` 於 DESCRIPTION，入 `#' @useDynLib packagename, .registration = TRUE` 與 `#' @importFrom Rcpp sourceCpp` 於包級文。

### 二：書 C++ 函

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

RcppArmadillo：

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

得：C++ 源於 `src/my_function.cpp`，含有效 `// [[Rcpp::export]]` 與 `//'` 註。

敗：驗檔用 `#include <Rcpp.h>`（Armadillo 用 `<RcppArmadillo.h>`），出註於函簽前獨行，返型映 Rcpp 有效型。

### 三：生 RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

得：`R/RcppExports.R` 與 `src/RcppExports.cpp` 自生。

敗：察 C++ 語誤。確 `// [[Rcpp::export]]` 標於各出函上。

### 四：驗編

```r
devtools::load_all()
```

得：包編、載而無誤。

敗：察編出。常症：缺系頭→裝開發庫；語誤→C++ 編訊指行；缺 `Rcpp::depends` 屬於 RcppArmadillo。

### 五：書測編

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

得：測過，證 C++ 函果同 R 等且妥處邊例（空向、NA）。

敗：NA 測敗→於 C++ 加 `NumericVector::is_na()` 之檢。空入測敗→於函首加零長守。

### 六：增清腳

建 `src/Makevars`：

```makefile
PKG_CXXFLAGS = -O2
```

建 `cleanup` 於包根（為 CRAN）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

可行：`chmod +x cleanup`

得：`src/Makevars` 設編旗，`cleanup` 去編對。皆於包根。

敗：驗 `cleanup` 有可行權（`chmod +x cleanup`），`Makevars` 用製表（非空）若加 Makefile 規。

### 七：更 .Rbuildignore

確編產妥處：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

得：`.Rbuildignore` 紋阻編對檔入包包，存源檔與 Makevars。

敗：行 `devtools::check()` 察 NOTE 關 `src/` 中意外檔。調紋唯排 `.o`、`.so`、`.dll`。

## 驗

- [ ] `devtools::load_all()` 編無警
- [ ] 編函出正果
- [ ] 邊例（NA、空、巨）測過
- [ ] `R CMD check` 過無編警
- [ ] RcppExports 已生且提
- [ ] 性能改以基準證

## 忌

- **忘 `compileAttributes()`**：改 C++ 後須重生 RcppExports
- **整溢**：大數用 `double` 非 `int`
- **記理**：Rcpp 自理 Rcpp 型；勿手 `delete`
- **NA 處**：C++ 不知 R 之 NA。用 `Rcpp::NumericVector::is_na()` 檢
- **跨台**：避台專 C++ 特。測於 Windows、macOS、Linux
- **缺 `@useDynLib`**：包級文須含 `@useDynLib packagename, .registration = TRUE`

## 參

- `create-r-package` — 增 Rcpp 前包設
- `write-testthat-tests` — 測編函
- `setup-github-actions-ci` — CI 須有 C++ 工
- `submit-to-cran` — 編包需 CRAN 加察
