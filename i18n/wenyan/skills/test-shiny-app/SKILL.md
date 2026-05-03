---
name: test-shiny-app
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Test Shiny applications using shinytest2 for end-to-end browser tests
  and testServer() for unit-testing module server logic. Covers snapshot
  testing, CI integration, and mocking external services. Use when adding
  tests to an existing Shiny application, setting up a testing strategy for
  a new Shiny project, writing regression tests before refactoring Shiny
  code, or integrating Shiny app tests into CI/CD pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, testing, shinytest2, testServer, snapshot, CI
---

# 試 Shiny 之應

立 Shiny 應之全試，用 shinytest2（端至端）與 testServer()（單元）。

## 用時

- 加試於既存之 Shiny 應乃用
- 為新 Shiny 項立試策乃用
- 重構 Shiny 之碼前撰回試乃用
- 合 Shiny 應試於 CI/CD 流乃用

## 入

- **必要**：Shiny 應之路
- **必要**：試之範（單元、端至端、或兼）
- **可選**：是否用快照試（默：e2e 為是）
- **可選**：CI 之臺（GitHub Actions、GitLab CI）
- **可選**：獨試之模組

## 法

### 第一步：裝試之依

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

得：shinytest2 已裝，testthat 之目構已立。

敗則：shinytest2 須 chromote（無頭 Chrome）。於系裝 Chrome/Chromium。WSL 上：`sudo apt install -y chromium-browser`。以 `chromote::find_chrome()` 驗。

### 第二步：撰 testServer() 之單元試於模組

立 `tests/testthat/test-mod_dashboard.R`：

```r
test_that("dashboard module filters data correctly", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris),
    columns = c("Species", "Sepal.Length")
  ), {
    # Set inputs
    session$setInputs(column = "Species")
    session$setInputs(value_select = "setosa")
    session$setInputs(apply = 1)

    # Check output
    result <- filtered()
    expect_equal(nrow(result), 50)
    expect_true(all(result$Species == "setosa"))
  })
})

test_that("dashboard module handles empty data", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris[0, ]),
    columns = c("Species")
  ), {
    # Module should not error on empty data
    expect_no_error(session$setInputs(column = "Species"))
  })
})
```

要之模：
- `testServer()` 試模組之服邏無瀏覽器
- 經 `args` 列傳反應之參
- 用 `session$setInputs()` 仿用之交互
- 直接以名取反應之返值
- 試邊例：空資、NULL 入、無效值

得：模組試以 `devtools::test()` 過。

敗則：若 `testServer()` 誤於「not a module server function」，確函內用 `moduleServer()`。若 `session$setInputs()` 不觸反應，於設入後加 `session$flushReact()`。

### 第三步：撰 shinytest2 之端至端試

立 `tests/testthat/test-app-e2e.R`：

```r
test_that("app loads and displays initial state", {
  # For golem apps
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "initial-load",
    height = 800,
    width = 1200
  )
  on.exit(app$stop(), add = TRUE)

  # Wait for app to load
  app$wait_for_idle(timeout = 10000)

  # Check that key elements exist
  app$expect_values()
})

test_that("filter interaction updates the table", {
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "filter-interaction"
  )
  on.exit(app$stop(), add = TRUE)

  # Interact with the app
  app$set_inputs(`filter1-column` = "cyl")
  app$wait_for_idle()

  app$set_inputs(`filter1-apply` = "click")
  app$wait_for_idle()

  # Snapshot the output values
  app$expect_values(output = "table")
})
```

要之模：
- `AppDriver$new()` 啟應於無頭 Chrome
- 恆用 `on.exit(app$stop())` 以清
- 模組入 ID 用 `"moduleId-inputId"` 之格
- `app$expect_values()` 立／比快照之文
- `app$wait_for_idle()` 確反應之新成

得：端至端試於 `tests/testthat/_snaps/` 立快照之文。

敗則：若 Chrome 未尋，設 `CHROMOTE_CHROME` 環變於 Chrome 二進之路。若快照於 CI 敗而本機過，察臺依繪之異——用 `app$expect_values()` 為資快照而非 `app$expect_screenshot()` 為視之。

### 第四步：互動錄試（可選）

```r
shinytest2::record_test("path/to/app")
```

此於瀏覽器開應與錄板。與應交，按「Save test」自生試碼。

得：試文於 `tests/testthat/` 生，含所錄之交互。

敗則：若錄不開，先察應以 `shiny::runApp()` 行成。錄須可行之應。

### 第五步：立快照之治

為快照試，治期值：

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

加快照之目於版控：

```
tests/testthat/_snaps/    # Committed — contains expected values
```

得：快照之文追於 git 為回之察。

敗則：若快照不期變，行 `testthat::snapshot_review()` 以見差。以 `testthat::snapshot_accept()` 受意之變。

### 第六步：合於 CI

加於 `.github/workflows/R-CMD-check.yaml` 或立專流：

```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y chromium-browser

- name: Set Chrome path
  run: echo "CHROMOTE_CHROME=$(which chromium-browser)" >> $GITHUB_ENV

- name: Run tests
  run: |
    Rscript -e 'devtools::test()'
```

為 golem 應，試前確應之包已裝：

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

得：試於 CI 過，用無頭 Chrome。

敗則：常 CI 之患：Chrome 未裝（加 apt-get 步）、顯服缺（shinytest2 默無頭模故常無此患）、慢機之超時（`AppDriver$new()` 中加 `timeout`）。

## 驗

- [ ] `devtools::test()` 行諸試而無誤
- [ ] testServer() 試覆模組之服邏
- [ ] shinytest2 試覆要用流
- [ ] 快照之文已交於版控
- [ ] 試於 CI 境過
- [ ] 邊例已試（空資、NULL 入、誤態）

## 陷

- **試 UI 繪而非邏**：邏宜 `testServer()`，資宜 `app$expect_values()`。視外當要時方用 `app$expect_screenshot()`——截圖跨臺脆。
- **e2e 中模組 ID 之格**：經 AppDriver 設模組入時，用 `"moduleId-inputId"` 之格（連字符），非 `"moduleId.inputId"`。
- **時序之脆**：`app$set_inputs()` 後恆呼 `app$wait_for_idle()`。否則斷或於反應新成前行。
- **快照漂**：勿交於異臺生之快照（Mac vs Linux）。標於 CI 之臺為快照之生。
- **CI 中無 Chrome**：shinytest2 須 Chrome/Chromium。CI 流恆含裝步。

## 參

- `build-shiny-module` — 立可試之模組與明介
- `scaffold-shiny-app` — 立應構與試之基
- `write-testthat-tests` — R 包之通 testthat 模
- `setup-github-actions-ci` — R 包（golem 應）之 CI/CD 立
