---
name: write-testthat-tests
locale: wenyan
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

# 書 testthat 之試

以 testthat 第三版為 R 包之函立全試。

## 用時

- 為新包函加試
- 增現碼之試覆
- 為訛修書回歸試
- 為新包設試基設

## 入

- **必要**：欲試之 R 函
- **必要**：期行與邊例
- **可選**：試之夾或樣數
- **可選**：目覆百分（默：80%）

## 法

### 第一步：設試基設

若未行：

```r
usethis::use_testthat(edition = 3)
```

此立 `tests/testthat.R` 與 `tests/testthat/` 域。

得：`tests/testthat.R` 與 `tests/testthat/` 域已立。DESCRIPTION 含 `Config/testthat/edition: 3`。

敗則：usethis 不可得者，手立 `tests/testthat.R` 含 `library(testthat); library(packagename); test_check("packagename")` 並加 `tests/testthat/` 域。

### 第二步：立試文

```r
usethis::use_test("function_name")
```

此立 `tests/testthat/test-function_name.R` 附模。

得：試文立於 `tests/testthat/test-function_name.R`，附待充之 `test_that()` 塊。

敗則：`usethis::use_test()` 不可得者，手立文。從名約 `test-<function_name>.R`。

### 第三步：書基試

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

得：基試覆典入之正出、NA 處之行、入驗訛辭。

敗則：試即敗者，驗函已載（`devtools::load_all()`）。訛辭不配者，於 `expect_error()` 中用 regex 模代精串。

### 第四步：試邊例

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

得：邊例皆覆：空入、單值、零權、極值、無效入。每邊例有明期行。

敗則：函處邊例不如所期者，定修函抑調試。錄歧例之意行。

### 第五步：用夾為複試

立 `tests/testthat/fixtures/` 為試數：

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

得：夾予多試文一致數。`tests/testthat/helper.R` 中助函由 testthat 自載。

敗則：助函不見者，確文名 `helper.R`（非 `helpers.R`）且於 `tests/testthat/`。需者重 R 會。

### 第六步：模外依

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

得：外依（API、庫、網呼）模之，試無實連而行。模返值行函之數處邏。

敗則：`local_mocked_bindings()` 敗者，確被模函於試範可達。他包之函者，用 `.package` 參。

### 第七步：複出之快照試

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

得：快照文立於 `tests/testthat/_snaps/`。首行立基線；後行對之較。

敗則：意變後快照敗者，以 `testthat::snapshot_accept()` 更之。跨平差者，用 `variant` 參守平特快照。

### 第八步：用略條

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

得：需特境（網、庫、多核）之試正以略條守。本地行而於 CRAN 或限 CI 略。

敗則：CRAN 或 CI 上敗而本地過者，於 `test_that()` 塊首加宜 `skip_on_cran()`、`skip_on_os()`、或 `skip_if_not()` 守。

### 第九步：行試而察覆

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

得：諸試以 `devtools::test()` 過。覆報示已達目百分（目 >80%）。

敗則：試敗者，讀試出求特斷敗。覆下目者，用 `covr::report()` 識未試碼徑而為加試。

## 驗

- [ ] 諸試以 `devtools::test()` 過
- [ ] 覆逾目百分
- [ ] 諸出函至少有一試
- [ ] 訛條已試
- [ ] 邊例覆（NA、NULL、空、界值）
- [ ] 試不賴外態或行序

## 陷

- **試相依**：每 `test_that()` 塊必獨立
- **硬編文徑**：用 `testthat::test_path()` 為試夾
- **浮點較**：用 `expect_equal()`（有容）非 `expect_identical()`
- **試私函**：可時經公 API 試。`:::` 慎用
- **CI 中快照試**：快照平敏。跨平用 `variant` 參
- **忘 `skip_on_cran()`**：需網、庫、長時之試於 CRAN 必略

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

- `create-r-package` - 為包立試基設為包立之部
- `write-roxygen-docs` - 錄所試之函
- `setup-github-actions-ci` - 推時自行試
- `submit-to-cran` - CRAN 需試於諸平過
