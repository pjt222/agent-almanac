---
name: write-testthat-tests
description: >
  为 R 包函数编写全面的 testthat（第 3 版）测试。涵盖测试组织、
  断言、固件、模拟、快照测试、参数化测试及高覆盖率的实现。
  适用于为新包函数添加测试、提升现有代码的测试覆盖率、为缺陷
  修复编写回归测试，或为缺少测试基础设施的包进行搭建。
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
  complexity: intermediate
  language: R
  tags: r, testthat, testing, unit-tests, coverage
---

# 编写 testthat 测试

使用 testthat 第 3 版为 R 包函数创建全面的测试。

## 适用场景

- 为新包函数添加测试
- 提升现有代码的测试覆盖率
- 为缺陷修复编写回归测试
- 为新包搭建测试基础设施

## 输入

- **必需**：需要测试的 R 函数
- **必需**：预期行为和边界情况
- **可选**：测试固件或示例数据
- **可选**：目标覆盖率百分比（默认：80%）

## 步骤

### 第 1 步：搭建测试基础设施

如尚未完成：

```r
usethis::use_testthat(edition = 3)
```

此步骤创建 `tests/testthat.R` 和 `tests/testthat/` 目录。

**预期结果：** `tests/testthat.R` 和 `tests/testthat/` 目录已创建。DESCRIPTION 中 `Config/testthat/edition: 3` 已设置。

**失败处理：** 若 usethis 不可用，手动创建 `tests/testthat.R`，内容为 `library(testthat); library(packagename); test_check("packagename")`，并创建 `tests/testthat/` 目录。

### 第 2 步：创建测试文件

```r
usethis::use_test("function_name")
```

此步骤在 `tests/testthat/test-function_name.R` 创建带有模板的测试文件。

**预期结果：** 测试文件在 `tests/testthat/test-function_name.R` 创建，包含待填写的 `test_that()` 占位块。

**失败处理：** 若 `usethis::use_test()` 不可用，手动创建文件，遵循 `test-<function_name>.R` 命名约定。

### 第 3 步：编写基础测试

```r
test_that("weighted_mean computes correct result", {
  expect_equal(weighted_mean(1:3, c(1, 1, 1)), 2)
  expect_equal(weighted_mean(c(10, 20), c(1, 3)), 17.5)
})

test_that("weighted_mean handles NA values", {
  expect_equal(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = TRUE), 2)
  expect_true(is.na(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = FALSE)))
})

test_that("weighted_mean validates input", {
  expect_error(weighted_mean("a", 1), "numeric")
  expect_error(weighted_mean(1:3, 1:2), "length")
})
```

**预期结果：** 基础测试涵盖典型输入的正确输出、NA 处理行为及输入验证错误信息。

**失败处理：** 若测试立即失败，确认函数已加载（`devtools::load_all()`）。若错误信息不匹配，在 `expect_error()` 中使用正则表达式模式而非精确字符串。

### 第 4 步：测试边界情况

```r
test_that("weighted_mean handles edge cases", {
  # 空输入
  expect_error(weighted_mean(numeric(0), numeric(0)))

  # 单一值
  expect_equal(weighted_mean(5, 1), 5)

  # 零权重
  expect_true(is.nan(weighted_mean(1:3, c(0, 0, 0))))

  # 极大值
  expect_equal(weighted_mean(c(1e15, 1e15), c(1, 1)), 1e15)

  # 负权重
  expect_error(weighted_mean(1:3, c(-1, 1, 1)))
})
```

**预期结果：** 边界情况已覆盖：空输入、单一值、零权重、极端值及无效输入。每个边界情况都有明确的预期行为。

**失败处理：** 若函数对某边界情况的处理与预期不符，决定是修复函数还是调整测试。对于存在歧义的情况，记录预期行为。

### 第 5 步：为复杂测试使用固件

创建 `tests/testthat/fixtures/` 存放测试数据：

```r
# tests/testthat/helper.R（自动加载）
create_test_data <- function() {
  data.frame(
    x = c(1, 2, 3, NA, 5),
    group = c("a", "a", "b", "b", "b")
  )
}
```

```r
# 在测试文件中
test_that("process_data works with grouped data", {
  test_data <- create_test_data()
  result <- process_data(test_data)
  expect_s3_class(result, "data.frame")
  expect_equal(nrow(result), 2)
})
```

**预期结果：** 固件为多个测试文件提供一致的测试数据。`tests/testthat/helper.R` 中的辅助函数由 testthat 自动加载。

**失败处理：** 若找不到辅助函数，确认文件名为 `helper.R`（而非 `helpers.R`）且位于 `tests/testthat/`。必要时重启 R 会话。

### 第 6 步：模拟外部依赖

```r
test_that("fetch_data handles API errors", {
  local_mocked_bindings(
    api_call = function(...) stop("Connection refused")
  )
  expect_error(fetch_data("endpoint"), "Connection refused")
})

test_that("fetch_data returns parsed data", {
  local_mocked_bindings(
    api_call = function(...) list(data = list(value = 42))
  )
  result <- fetch_data("endpoint")
  expect_equal(result$value, 42)
})
```

**预期结果：** 外部依赖（API、数据库、网络调用）已模拟，测试无需真实连接即可运行。模拟返回值用于检验函数的数据处理逻辑。

**失败处理：** 若 `local_mocked_bindings()` 失败，确认被模拟的函数在测试作用域内可访问。对于其他包中的函数，使用 `.package` 参数。

### 第 7 步：对复杂输出使用快照测试

```r
test_that("format_report produces expected output", {
  expect_snapshot(format_report(test_data))
})

test_that("plot_results creates expected plot", {
  expect_snapshot_file(
    save_plot(plot_results(test_data), "test-plot.png"),
    "expected-plot.png"
  )
})
```

**预期结果：** 快照文件创建于 `tests/testthat/_snaps/`。首次运行创建基准；后续运行与之对比。

**失败处理：** 若快照在有意更改后失败，使用 `testthat::snapshot_accept()` 更新它们。对于跨平台差异，使用 `variant` 参数维护平台特定的快照。

### 第 8 步：使用跳过条件

```r
test_that("database query works", {
  skip_on_cran()
  skip_if_not(has_db_connection(), "No database available")

  result <- query_db("SELECT 1")
  expect_equal(result[[1]], 1)
})

test_that("parallel computation works", {
  skip_on_os("windows")
  skip_if(parallel::detectCores() < 2, "Need multiple cores")

  result <- parallel_compute(1:100)
  expect_length(result, 100)
})
```

**预期结果：** 需要特殊环境（网络、数据库、多核）的测试已用跳过条件保护。这些测试在本地运行，但在 CRAN 或受限 CI 环境中跳过。

**失败处理：** 若测试在 CRAN 或 CI 上失败但本地通过，在 `test_that()` 块顶部添加适当的 `skip_on_cran()`、`skip_on_os()` 或 `skip_if_not()` 保护。

### 第 9 步：运行测试并检查覆盖率

```r
# 运行所有测试
devtools::test()

# 运行特定测试文件
devtools::test_active_file()  # 在 RStudio 中
testthat::test_file("tests/testthat/test-function_name.R")

# 检查覆盖率
covr::package_coverage()
covr::report()
```

**预期结果：** 所有测试通过 `devtools::test()`。覆盖率报告显示达到目标百分比（目标 >80%）。

**失败处理：** 若测试失败，查看测试输出中的具体断言失败信息。若覆盖率低于目标，使用 `covr::report()` 识别未测试的代码路径并为其补充测试。

## 验证清单

- [ ] 所有测试通过 `devtools::test()`
- [ ] 覆盖率超过目标百分比
- [ ] 每个导出函数至少有一个测试
- [ ] 错误条件已测试
- [ ] 边界情况已覆盖（NA、NULL、空值、边界值）
- [ ] 无测试依赖外部状态或执行顺序

## 常见问题

- **测试相互依赖**：每个 `test_that()` 块必须相互独立
- **硬编码文件路径**：对测试固件使用 `testthat::test_path()`
- **浮点数比较**：使用 `expect_equal()`（含容差）而非 `expect_identical()`
- **测试私有函数**：尽量通过公开 API 测试，谨慎使用 `:::`
- **CI 中的快照测试**：快照对平台敏感，跨平台时使用 `variant` 参数
- **忘记 `skip_on_cran()`**：需要网络、数据库或长时间运行的测试必须在 CRAN 上跳过

## 示例

```r
# 模式：测试文件与 R/ 文件对应
# R/weighted_mean.R -> tests/testthat/test-weighted_mean.R

# 模式：描述性测试名称
test_that("weighted_mean returns NA when na.rm = FALSE and input contains NA", {
  result <- weighted_mean(c(1, NA), c(1, 1), na.rm = FALSE)
  expect_true(is.na(result))
})

# 模式：测试警告
test_that("deprecated_function emits deprecation warning", {
  expect_warning(deprecated_function(), "deprecated")
})
```

## 相关技能

- `create-r-package` — 在创建包时搭建测试基础设施
- `write-roxygen-docs` — 为被测函数编写文档
- `setup-github-actions-ci` — 在推送时自动运行测试
- `submit-to-cran` — CRAN 要求测试在所有平台上通过
