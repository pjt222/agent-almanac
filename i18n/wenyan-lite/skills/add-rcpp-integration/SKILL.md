---
name: add-rcpp-integration
locale: wenyan-lite
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

# 整合 Rcpp

藉 Rcpp 將 C++ 碼整合入 R 套件，以應對效能關鍵之操作。

## 適用時機

- R 函式過慢且剖析確認瓶頸
- 須與既有 C/C++ 函式庫對接
- 實作可受益於編譯碼之演算法（迴圈、遞迴）
- 為線性代數操作加入 RcppArmadillo

## 輸入

- **必要**：既有之 R 套件
- **必要**：欲以 C++ 替換或補強之 R 函式
- **選擇性**：欲對接之外部 C++ 函式庫
- **選擇性**：是否使用 RcppArmadillo（預設：純 Rcpp）

## 步驟

### 步驟一：設置 Rcpp 基礎建設

```r
usethis::use_rcpp()
```

此舉：
- 建立 `src/` 目錄
- 於 DESCRIPTION 之 LinkingTo 與 Imports 加入 `Rcpp`
- 建立 `R/packagename-package.R`，含 `@useDynLib` 與 `@importFrom Rcpp sourceCpp`
- 為已編譯檔案更新 `.gitignore`

若用 RcppArmadillo：

```r
usethis::use_rcpp_armadillo()
```

**預期：** `src/` 目錄已建，DESCRIPTION 已更新，於 LinkingTo 與 Imports 含 `Rcpp`，且 `R/packagename-package.R` 含 `@useDynLib` 指令。

**失敗時：** 若 `usethis::use_rcpp()` 失敗，手動建立 `src/`，於 DESCRIPTION 加入 `LinkingTo: Rcpp` 與 `Imports: Rcpp`，並於套件層級文件檔加入 `#' @useDynLib packagename, .registration = TRUE` 與 `#' @importFrom Rcpp sourceCpp`。

### 步驟二：撰寫 C++ 函式

建立 `src/my_function.cpp`：

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

若用 RcppArmadillo：

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

**預期：** C++ 源檔存於 `src/my_function.cpp`，含有效之 `// [[Rcpp::export]]` 註記與 roxygen 風 `//'` 文件註解。

**失敗時：** 驗證檔案使用 `#include <Rcpp.h>`（或 Armadillo 用 `<RcppArmadillo.h>`），輸出註記須獨立一行並緊接函式簽名之上，且回傳型別須對應有效之 Rcpp 型別。

### 步驟三：生成 RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**預期：** `R/RcppExports.R` 與 `src/RcppExports.cpp` 自動生成。

**失敗時：** 查 C++ 語法錯誤。確保 `// [[Rcpp::export]]` 標籤位於各輸出函式之上。

### 步驟四：驗證編譯

```r
devtools::load_all()
```

**預期：** 套件編譯並載入而無誤。

**失敗時：** 查編譯器輸出之錯誤。常見問題：
- 缺系統標頭：安裝開發函式庫
- 語法錯誤：C++ 編譯訊息會指出該行
- RcppArmadillo 缺 `Rcpp::depends` 屬性

### 步驟五：為已編譯碼撰寫測試

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

**預期：** 測試通過，確認 C++ 函式與 R 等效之函式產出相同結果，並正確處理邊界情況（空向量、NA 值）。

**失敗時：** 若測試於 NA 處理失敗，於 C++ 碼中以 `NumericVector::is_na()` 加入明確之 NA 檢查。若於空輸入失敗，於函式頂端加入零長向量之防衛子句。

### 步驟六：加入清理腳本

建立 `src/Makevars`：

```makefile
PKG_CXXFLAGS = -O2
```

於套件根目錄建立 `cleanup`（為 CRAN）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

賦予執行權：`chmod +x cleanup`

**預期：** `src/Makevars` 設編譯器旗標，`cleanup` 腳本移除已編譯物件。二檔皆存於套件根目錄。

**失敗時：** 驗證 `cleanup` 具執行權（`chmod +x cleanup`），且若加入 Makefile 風規則，`Makevars` 之縮排用 tab 而非空格。

### 步驟七：更新 .Rbuildignore

確保已編譯產物受處理：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**預期：** `.Rbuildignore` 之模式可阻止已編譯物件檔被納入套件 tarball，同時保留源檔與 Makevars。

**失敗時：** 行 `devtools::check()`，查 `src/` 中關於非預期檔案之 NOTE。調整 `.Rbuildignore` 模式以僅排除 `.o`、`.so`、`.dll` 檔。

## 驗證

- [ ] `devtools::load_all()` 編譯而無警告
- [ ] 已編譯函式產正確結果
- [ ] 測試於邊界情況（NA、空、大輸入）通過
- [ ] `R CMD check` 通過而無編譯警告
- [ ] RcppExports 檔已生成並提交
- [ ] 效能改進已以基準確認

## 常見陷阱

- **遺忘 `compileAttributes()`**：變更 C++ 檔後須重新生成 RcppExports
- **整數溢位**：對大型數值用 `double` 而非 `int`
- **記憶體管理**：Rcpp 對 Rcpp 型別自動處理記憶體；勿手動 `delete`
- **NA 處理**：C++ 不識 R 之 NA。以 `Rcpp::NumericVector::is_na()` 檢查
- **平台可攜**：避用平台特有之 C++ 特性。於 Windows、macOS、Linux 皆測試
- **缺 `@useDynLib`**：套件層級文件須含 `@useDynLib packagename, .registration = TRUE`

## 相關技能

- `create-r-package` — 加入 Rcpp 前之套件設置
- `write-testthat-tests` — 測試已編譯函式
- `setup-github-actions-ci` — CI 須具 C++ 工具鏈
- `submit-to-cran` — 已編譯套件需額外之 CRAN 檢查
