---
name: add-rcpp-integration
description: >
  向 R 包添加 Rcpp 或 RcppArmadillo 集成以实现高性能 C++ 代码。
  涵盖设置、编写 C++ 函数、RcppExports 生成、测试编译代码及调试。
  适用于 R 函数过慢且性能分析确认存在瓶颈、需要与现有 C/C++ 库
  交互，或实现受益于编译代码的算法（循环、递归、线性代数）的场景。
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
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
---

# 添加 Rcpp 集成

使用 Rcpp 将 C++ 代码集成到 R 包中，用于性能关键的操作。

## 适用场景

- R 函数过慢且性能分析确认存在瓶颈
- 需要与现有 C/C++ 库交互
- 实现受益于编译代码的算法（循环、递归）
- 添加 RcppArmadillo 进行线性代数运算

## 输入

- **必需**：现有的 R 包
- **必需**：需要用 C++ 替换或增强的 R 函数
- **可选**：需要交互的外部 C++ 库
- **可选**：是否使用 RcppArmadillo（默认：普通 Rcpp）

## 步骤

### 第 1 步：搭建 Rcpp 基础设施

```r
usethis::use_rcpp()
```

此步骤会：
- 创建 `src/` 目录
- 在 DESCRIPTION 的 LinkingTo 和 Imports 中添加 `Rcpp`
- 创建包含 `@useDynLib` 和 `@importFrom Rcpp sourceCpp` 的 `R/packagename-package.R`
- 更新 `.gitignore` 以排除编译文件

若使用 RcppArmadillo：

```r
usethis::use_rcpp_armadillo()
```

**预期结果：** `src/` 目录已创建，DESCRIPTION 在 LinkingTo 和 Imports 中已添加 `Rcpp`，`R/packagename-package.R` 包含 `@useDynLib` 指令。

**失败处理：** 若 `usethis::use_rcpp()` 失败，手动创建 `src/`，在 DESCRIPTION 中添加 `LinkingTo: Rcpp` 和 `Imports: Rcpp`，并在包级文档文件中添加 `#' @useDynLib packagename, .registration = TRUE` 和 `#' @importFrom Rcpp sourceCpp`。

### 第 2 步：编写 C++ 函数

创建 `src/my_function.cpp`：

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

若使用 RcppArmadillo：

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

**预期结果：** C++ 源文件存在于 `src/my_function.cpp`，包含有效的 `// [[Rcpp::export]]` 注解和 roxygen 风格的 `//'` 文档注释。

**失败处理：** 确认文件使用 `#include <Rcpp.h>`（或 Armadillo 的 `<RcppArmadillo.h>`），导出注解在函数签名正上方单独一行，且返回类型映射到有效的 Rcpp 类型。

### 第 3 步：生成 RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**预期结果：** `R/RcppExports.R` 和 `src/RcppExports.cpp` 自动生成。

**失败处理：** 检查 C++ 语法错误。确认每个导出函数上方存在 `// [[Rcpp::export]]` 标签。

### 第 4 步：验证编译

```r
devtools::load_all()
```

**预期结果：** 包编译并加载无错误。

**失败处理：** 检查编译器输出中的错误。常见问题：
- 缺少系统头文件：安装开发库
- 语法错误：C++ 编译器消息指向具体行号
- RcppArmadillo 缺少 `Rcpp::depends` 属性

### 第 5 步：为编译代码编写测试

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

**预期结果：** 测试通过，确认 C++ 函数产生与 R 等效函数相同的结果，且正确处理边界情况（空向量、NA 值）。

**失败处理：** 若 NA 处理测试失败，在 C++ 代码中使用 `NumericVector::is_na()` 添加显式 NA 检查。若空输入测试失败，在函数顶部添加对零长度向量的保护子句。

### 第 6 步：添加清理脚本

创建 `src/Makevars`：

```makefile
PKG_CXXFLAGS = -O2
```

在包根目录创建 `cleanup` 文件（用于 CRAN）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

赋予执行权限：`chmod +x cleanup`

**预期结果：** `src/Makevars` 设置编译器标志，`cleanup` 脚本删除编译产物。两个文件均存在于包根目录。

**失败处理：** 确认 `cleanup` 具有执行权限（`chmod +x cleanup`），若添加 Makefile 风格规则，确认 `Makevars` 使用制表符而非空格缩进。

### 第 7 步：更新 .Rbuildignore

确保编译产物得到处理：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**预期结果：** `.Rbuildignore` 中的模式阻止编译目标文件被包含在包 tarball 中，同时保留源文件和 Makevars。

**失败处理：** 运行 `devtools::check()` 并查看 `src/` 中意外文件的注记。调整 `.Rbuildignore` 模式，仅排除 `.o`、`.so` 和 `.dll` 文件。

## 验证清单

- [ ] `devtools::load_all()` 编译无警告
- [ ] 编译函数产生正确结果
- [ ] 边界情况测试通过（NA、空值、大型输入）
- [ ] `R CMD check` 通过且无编译警告
- [ ] RcppExports 文件已生成并提交
- [ ] 通过基准测试确认性能提升

## 常见问题

- **忘记 `compileAttributes()`**：更改 C++ 文件后必须重新生成 RcppExports
- **整数溢出**：对大数值使用 `double` 而非 `int`
- **内存管理**：Rcpp 自动管理 Rcpp 类型的内存，不要手动调用 `delete`
- **NA 处理**：C++ 不了解 R 的 NA，使用 `Rcpp::NumericVector::is_na()` 检查
- **平台可移植性**：避免平台特定的 C++ 特性，在 Windows、macOS 和 Linux 上测试
- **缺少 `@useDynLib`**：包级文档必须包含 `@useDynLib packagename, .registration = TRUE`

## 相关技能

- `create-r-package` — 添加 Rcpp 前的包设置
- `write-testthat-tests` — 测试编译函数
- `setup-github-actions-ci` — CI 必须有 C++ 工具链
- `submit-to-cran` — 包含编译代码的包需要额外的 CRAN 检查
