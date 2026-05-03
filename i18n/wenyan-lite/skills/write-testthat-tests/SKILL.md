---
name: write-testthat-tests
locale: wenyan-lite
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

# 撰寫 testthat 測試

用 testthat edition 3 為 R 套件函式建立全面測試。

## 適用時機

- 為新套件函式加測試
- 為既有代碼提升測試覆蓋率
- 為錯誤修復撰寫回歸測試
- 為新套件建立測試基礎設施

## 輸入

- **必要**：欲測試之 R 函式
- **必要**：預期行為與邊緣情況
- **選擇性**：測試夾具或樣本資料
- **選擇性**：目標覆蓋率百分比（預設 80%）

## 步驟

### 步驟一：設置測試基礎設施

若尚未完成：

```r
usethis::use_testthat(edition = 3)
```

此建立 `tests/testthat.R` 與 `tests/testthat/` 目錄。

**預期：** `tests/testthat.R` 與 `tests/testthat/` 目錄已建立。DESCRIPTION 設有 `Config/testthat/edition: 3`。

**失敗時：** 若 usethis 不可用,手動建立 `tests/testthat.R`,內含 `library(testthat); library(packagename); test_check("packagename")`,並加 `tests/testthat/` 目錄。

### 步驟二：建立測試文件

```r
usethis::use_test("function_name")
```

此建立 `tests/testthat/test-function_name.R`,含範本。

**預期：** 測試文件建於 `tests/testthat/test-function_name.R`,含可填入之占位 `test_that()` 區塊。

**失敗時：** 若 `usethis::use_test()` 不可用,手動建文件。遵循命名慣例 `test-<function_name>.R`。

### 步驟三：撰寫基本測試

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

**預期：** 基本測試涵蓋典型輸入之正確輸出、NA 處理行為與輸入驗證錯誤訊息。

**失敗時：** 若測試立即失敗,驗證函式已載入（`devtools::load_all()`）。若錯誤訊息不匹配,於 `expect_error()` 中用正則模式而非確切字串。

### 步驟四：測試邊緣情況

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

**預期：** 邊緣情況皆涵蓋：空輸入、單值、零權重、極端值與無效輸入。每邊緣情況有清晰之預期行為。

**失敗時：** 若函式未如預期處理邊緣情況,決定修函式或調測試。對含糊情況記錄預期行為。

### 步驟五：複雜測試用夾具

於 `tests/testthat/fixtures/` 建立測試資料：

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

**預期：** 夾具於多個測試文件提供一致之測試資料。`tests/testthat/helper.R` 中之輔助函式由 testthat 自動載入。

**失敗時：** 若找不到輔助函式,確保文件名為 `helper.R`（非 `helpers.R`）且位於 `tests/testthat/`。若需,重啟 R 會話。

### 步驟六：模擬外部依賴

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

**預期：** 外部依賴（API、資料庫、網路呼叫）得模擬,使測試無真實連線即可運行。模擬之返回值鍛鍊函式之資料處理邏輯。

**失敗時：** 若 `local_mocked_bindings()` 失敗,確保被模擬之函式於測試範圍可存取。對其他套件中之函式,用 `.package` 引數。

### 步驟七：複雜輸出之快照測試

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

**預期：** 快照文件建於 `tests/testthat/_snaps/`。首次運行建立基線；後續運行對其比較。

**失敗時：** 若有意變更後快照失敗,以 `testthat::snapshot_accept()` 更新之。對跨平台差異,用 `variant` 參數維持平台特定快照。

### 步驟八：用 skip 條件

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

**預期：** 需特殊環境（網路、資料庫、多核）之測試適當以 skip 條件守護。這些測試本地運行,但於 CRAN 或受限 CI 環境中跳過。

**失敗時：** 若測試於 CRAN 或 CI 失敗但本地通過,於 `test_that()` 區塊頂端加適當之 `skip_on_cran()`、`skip_on_os()` 或 `skip_if_not()` 守護。

### 步驟九：跑測試並檢查覆蓋率

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

**預期：** 所有測試以 `devtools::test()` 通過。覆蓋率報告顯示目標百分比已達（目標 >80%）。

**失敗時：** 若測試失敗,讀測試輸出以察具體斷言失敗。若覆蓋率低於目標,用 `covr::report()` 辨識未測試之代碼路徑並為之加測試。

## 驗證

- [ ] 所有測試以 `devtools::test()` 通過
- [ ] 覆蓋率超過目標百分比
- [ ] 每匯出函式至少有一測試
- [ ] 錯誤條件已測試
- [ ] 邊緣情況已涵蓋（NA、NULL、空、邊界值）
- [ ] 無測試依賴外部狀態或執行順序

## 常見陷阱

- **測試彼此依賴**：各 `test_that()` 區塊須獨立
- **硬編碼文件路徑**：對測試夾具用 `testthat::test_path()`
- **浮點比較**：用 `expect_equal()`（有容差）非 `expect_identical()`
- **測試私人函式**：盡可能透過公共 API 測試。`:::` 慎用
- **CI 中之快照測試**：快照對平台敏感。對跨平台用 `variant` 參數
- **忘 `skip_on_cran()`**：需網路、資料庫或長運行之測試須於 CRAN 跳過

## 範例

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

## 相關技能

- `create-r-package` — 將測試基礎設施作為套件建立之一部分
- `write-roxygen-docs` — 文檔化所測試之函式
- `setup-github-actions-ci` — 推送時自動跑測試
- `submit-to-cran` — CRAN 要求測試於所有平台通過
