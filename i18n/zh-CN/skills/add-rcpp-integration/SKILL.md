---
name: add-rcpp-integration
description: >
  向 R 包添加 Rcpp 或 RcppArmadillo 集成以实现高性能 C++ 代码。涵盖设置、编写
  C++ 函数、RcppExports 生成、编译代码测试和调试。适用于 R 函数过慢且性能分析
  确认存在瓶颈时、需要与现有 C/C++ 库交互时，或实现受益于编译代码的算法（循环、
  递归、线性代数）时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 添加 Rcpp 集成

使用 Rcpp 将 C++ 代码集成到 R 包中，用于性能关键操作。

## 适用场景

- R 函数过慢且性能分析确认存在瓶颈
- 需要与现有 C/C++ 库交互
- 实现受益于编译代码的算法（循环、递归）
- 添加 RcppArmadillo 用于线性代数操作

## 输入

- **必需**：现有 R 包
- **必需**：需要用 C++ 替换或增强的 R 函数
- **可选**：要交互的外部 C++ 库
- **可选**：是否使用 RcppArmadillo（默认：纯 Rcpp）

## 步骤

### 第 1 步：设置 Rcpp 基础设施

```r
usethis::use_rcpp()
```

此操作会：
- 创建 `src/` 目录
- 在 DESCRIPTION 中将 `Rcpp` 添加到 LinkingTo 和 Imports
- 创建包含 `@useDynLib` 和 `@importFrom Rcpp sourceCpp` 的 `R/packagename-package.R`
- 更新 `.gitignore` 以排除编译文件

对于 RcppArmadillo：

```r
usethis::use_rcpp_armadillo()
```

**预期结果：** `src/` 目录已创建，DESCRIPTION 中 `Rcpp` 已添加到 LinkingTo 和 Imports，`R/packagename-package.R` 包含 `@useDynLib` 指令。

**失败处理：** 如果 `usethis::use_rcpp()` 失败，手动创建 `src/`，在 DESCRIPTION 中添加 `LinkingTo: Rcpp` 和 `Imports: Rcpp`，并在包级文档文件中添加 `#' @useDynLib packagename, .registration = TRUE` 和 `#' @importFrom Rcpp sourceCpp`。

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

对于 RcppArmadillo：

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

**预期结果：** C++ 源文件存在于 `src/my_function.cpp`，具有有效的 `// [[Rcpp::export]]` 注解和 roxygen 风格的 `//'` 文档注释。

**失败处理：** 验证文件使用 `#include <Rcpp.h>`（或 Armadillo 使用 `<RcppArmadillo.h>`），导出注解位于函数签名正上方的单独行，且返回类型映射到有效的 Rcpp 类型。

### 第 3 步：生成 RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**预期结果：** `R/RcppExports.R` 和 `src/RcppExports.cpp` 自动生成。

**失败处理：** 检查 C++ 语法错误。确保每个导出函数上方都有 `// [[Rcpp::export]]` 标签。

### 第 4 步：验证编译

```r
devtools::load_all()
```

**预期结果：** 包编译并加载，无错误。

**失败处理：** 检查编译器输出中的错误。常见问题：
- 缺少系统头文件：安装开发库
- 语法错误：C++ 编译器消息指向具体行
- RcppArmadillo 缺少 `Rcpp::depends` 属性

### 第 5 步：编写编译代码的测试

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

**预期结果：** 测试通过，确认 C++ 函数产生与 R 等价物相同的结果，并正确处理边界情况（空向量、NA 值）。

**失败处理：** 如果 NA 处理测试失败，在 C++ 代码中使用 `NumericVector::is_na()` 添加显式 NA 检查。如果空输入测试失败，在函数顶部添加零长度向量的保护子句。

### 第 6 步：添加清理脚本

创建 `src/Makevars`：

```makefile
PKG_CXXFLAGS = -O2
```

在包根目录创建 `cleanup`（用于 CRAN）：

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

设为可执行：`chmod +x cleanup`

**预期结果：** `src/Makevars` 设置编译器标志，`cleanup` 脚本删除编译对象。两个文件都存在于包根目录级别。

**失败处理：** 验证 `cleanup` 具有执行权限（`chmod +x cleanup`），且如果添加 Makefile 风格的规则，`Makevars` 使用制表符（而非空格）缩进。

### 第 7 步：更新 .Rbuildignore

确保编译产物被正确处理：

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**预期结果：** `.Rbuildignore` 模式阻止编译对象文件被包含在包 tarball 中，同时保留源文件和 Makevars。

**失败处理：** 运行 `devtools::check()` 并查找关于 `src/` 中意外文件的 NOTE。调整 `.Rbuildignore` 模式以仅排除 `.o`、`.so` 和 `.dll` 文件。

## 验证清单

- [ ] `devtools::load_all()` 编译无警告
- [ ] 编译函数产生正确结果
- [ ] 边界情况测试通过（NA、空、大输入）
- [ ] `R CMD check` 通过，无编译警告
- [ ] RcppExports 文件已生成并提交
- [ ] 基准测试确认性能改进

## 常见问题

- **忘记 `compileAttributes()`**：更改 C++ 文件后必须重新生成 RcppExports
- **整数溢出**：对于大数值使用 `double` 而不是 `int`
- **内存管理**：Rcpp 自动处理 Rcpp 类型的内存；不要手动 `delete`
- **NA 处理**：C++ 不了解 R 的 NA。使用 `Rcpp::NumericVector::is_na()` 检查
- **平台可移植性**：避免平台特定的 C++ 特性。在 Windows、macOS 和 Linux 上测试
- **缺少 `@useDynLib`**：包级文档必须包含 `@useDynLib packagename, .registration = TRUE`

## 相关技能

- `create-r-package` — 添加 Rcpp 之前的包设置
- `write-testthat-tests` — 测试编译函数
- `setup-github-actions-ci` — CI 必须有 C++ 工具链
- `submit-to-cran` — 编译包需要额外的 CRAN 检查
