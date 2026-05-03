---
name: write-testthat-tests
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write comprehensive testthat (edition 3) tests for R package functions.
  Covers test organization, expectations, fixtures, mocking, snapshot
  tests, parameterized tests, and achieving high coverage. Use when adding
  tests for new package functions, increasing test coverage for existing
  code, writing regression tests for bug fixes, or setting up test
  infrastructure for a package that lacks it.
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

# 書 testthat 試

立 R 包函全試以 testthat edition 3。

## 用

- 為新包函加試→用
- 增現碼試覆→用
- 為錯修書回歸試→用
- 為新包設試基→用

## 入

- **必**：欲試之 R 函
- **必**：期為與邊例
- **可**：試夾或樣數
- **可**：目覆百（默 80%）

## 行

### 一：設試基

未為先：

```r
usethis::use_testthat(edition = 3)
```

此建 `tests/testthat.R` 與 `tests/testthat/` 目。

得：`tests/testthat.R` 與目建。DESCRIPTION 設 `Config/testthat/edition: 3`。

敗：usethis 缺→手建 `tests/testthat.R` 含 `library(testthat); library(packagename); test_check("packagename")` 並加 `tests/testthat/` 目。

### 二：建試檔

```r
usethis::use_test("function_name")
```

此建 `tests/testthat/test-function_name.R` 附模。

得：試檔建於 `tests/testthat/test-function_name.R` 附 `test_that()` 占位塊待填。

敗：`usethis::use_test()` 缺→手建檔。從名規 `test-<function_name>.R`。

### 三：書基試

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

得：基試蓋典入正出、NA 處為、入驗誤訊。

敗：試即敗→驗函載（`devtools::load_all()`）。誤訊不配→於 `expect_error()` 用正則代精串。

### 四：試邊例

```r
test_that("weighted_mean handles edge cases", {
  # Empty input
  expect_error(weighted_mean(numeric(0), numeric(0)))

  # Single value
  expect_equal(weighted_mean(5, 1), 5)

  # Zero weights
  expect_true(is.nan(weighted_mean(1:3, c(0, 0, 0))))

  # Very large values
  expect_equal(weighted_mean(c(1e15, 1e15), c(1, 1)), 1e15)

  # Negative weights
  expect_error(weighted_mean(1:3, c(-1, 1, 1)))
})
```

得：邊例覆：空入、單值、零權、極值、違入。各邊例有清期為。

敗：函邊例為非期→決修函或調試。含混例錄期為。

### 五：複試用夾

建 `tests/testthat/fixtures/` 為試數：

```r
# tests/testthat/helper.R (loaded automatically)
create_test_data <- function() {
  data.frame(
    x = c(1, 2, 3, NA, 5),
    group = c("a", "a", "b", "b", "b")
  )
}
```

```r
# In test file
test_that("process_data works with grouped data", {
  test_data <- create_test_data()
  result <- process_data(test_data)
  expect_s3_class(result, "data.frame")
  expect_equal(nrow(result), 2)
})
```

得：夾予多試檔一致數。`tests/testthat/helper.R` 中輔函由 testthat 自動載。

敗：輔函未尋→確檔名 `helper.R`（非 `helpers.R`）且於 `tests/testthat/`。需要時重啟 R 會。

### 六：模外依

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

得：外依（API、庫、網召）模使試行無真接。模返值煉函數處邏。

敗：`local_mocked_bindings()` 敗→確所模函於試範可訪。他包之函用 `.package` 參。

### 七：複出之快照試

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

得：快照檔建於 `tests/testthat/_snaps/`。首行建基線；後行較之。

敗：意改後快照敗→以 `testthat::snapshot_accept()` 更。跨台異→用 `variant` 參維台特快照。

### 八：用略條

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

得：須特境（網、庫、多核）之試以略條護。試本地行而於 CRAN 或限 CI 略。

敗：CRAN 或 CI 敗本地過→於 `test_that()` 塊頂加應 `skip_on_cran()`、`skip_on_os()`、`skip_if_not()` 護。

### 九：行試察覆

```r
# Run all tests
devtools::test()

# Run specific test file
devtools::test_active_file()  # in RStudio
testthat::test_file("tests/testthat/test-function_name.R")

# Check coverage
covr::package_coverage()
covr::report()
```

得：諸試以 `devtools::test()` 過。覆報示達目百（>80%）。

敗：試敗→讀試出特斷敗。覆下目→以 `covr::report()` 辨未試碼路加試。

## 驗

- [ ] 諸試以 `devtools::test()` 過
- [ ] 覆超目百
- [ ] 每出函至少一試
- [ ] 誤條試
- [ ] 邊例覆（NA、NULL、空、界值）
- [ ] 試不依外態或行序

## 忌

- **試相依**：每 `test_that()` 塊須獨
- **硬編檔路**：用 `testthat::test_path()` 為試夾
- **浮點較**：用 `expect_equal()`（有容差）非 `expect_identical()`
- **試私函**：可時經公 API 試。少用 `:::`
- **CI 中快照試**：快照台敏。用 `variant` 參跨台
- **忘 `skip_on_cran()`**：須網、庫、長時之試須於 CRAN 略

## 例

```r
# Pattern: test file mirrors R/ file
# R/weighted_mean.R -> tests/testthat/test-weighted_mean.R

# Pattern: descriptive test names
test_that("weighted_mean returns NA when na.rm = FALSE and input contains NA", {
  result <- weighted_mean(c(1, NA), c(1, 1), na.rm = FALSE)
  expect_true(is.na(result))
})

# Pattern: testing warnings
test_that("deprecated_function emits deprecation warning", {
  expect_warning(deprecated_function(), "deprecated")
})
```

## 參

- `create-r-package` - 設試基為包建之部
- `write-roxygen-docs` - 錄所試函
- `setup-github-actions-ci` - 推時自動行試
- `submit-to-cran` - CRAN 要試於諸台過
