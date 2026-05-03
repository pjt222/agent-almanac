---
name: test-shiny-app
locale: wenyan-ultra
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

# 測 Shiny 應

立全 Shiny 測——以 shinytest2 為端對端與 testServer() 為單測。

## 用

- 加測於既存 Shiny 應→用
- 為新 Shiny 案立測策→用
- 重構 Shiny 碼前書回歸測→用
- Shiny 應測整於 CI/CD→用

## 入

- **必**：Shiny 應路
- **必**：測範（單測、端對端、皆）
- **可**：是否用影測（默：e2e 為是）
- **可**：CI 臺（GitHub Actions、GitLab CI）
- **可**：所獨測之模

## 行

### 一：裝測依

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

得：shinytest2 裝、testthat 目構在。

敗：shinytest2 需 chromote（無頭 Chrome）。系裝 Chrome/Chromium。WSL 上：`sudo apt install -y chromium-browser`。以 `chromote::find_chrome()` 驗。

### 二：書 testServer() 模單測

建 `tests/testthat/test-mod_dashboard.R`：

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

要模：
- `testServer()` 測模服邏無瀏
- 經 `args` 傳反參
- 用 `session$setInputs()` 擬用交
- 直名訪反返值
- 測邊：空資、NULL 入、無效值

得：模測過於 `devtools::test()`。

敗：`testServer()` 誤「not a module server function」→確函內用 `moduleServer()`。`session$setInputs()` 不觸反→設後加 `session$flushReact()`。

### 三：書 shinytest2 端對端測

建 `tests/testthat/test-app-e2e.R`：

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

要模：
- `AppDriver$new()` 啟應於無頭 Chrome
- 常用 `on.exit(app$stop())` 清
- 模入 ID 用 `"moduleId-inputId"` 式
- `app$expect_values()` 建/比影檔
- `app$wait_for_idle()` 確反更畢

得：端對端測建影檔於 `tests/testthat/_snaps/`。

敗：Chrome 不在→設 `CHROMOTE_CHROME` 環變為 Chrome 二路。影 CI 敗本地過→察臺依繪差——資影用 `app$expect_values()` 而非視 `app$expect_screenshot()`。

### 四：交錄測（可）

```r
shinytest2::record_test("path/to/app")
```

此於瀏開應含錄面板。交應、後點「Save test」自生測碼。

得：測檔生於 `tests/testthat/` 含錄交。

敗：錄不開→先察應於 `shiny::runApp()` 行成。錄需行應。

### 五：立影管

影測管期值：

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

加影目於版控：

```
tests/testthat/_snaps/    # Committed — contains expected values
```

得：影檔於 git 為回歸偵。

敗：影不期變→行 `testthat::snapshot_review()` 見差。納意改以 `testthat::snapshot_accept()`。

### 六：整於 CI

加於 `.github/workflows/R-CMD-check.yaml` 或建專流：

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

golem 應→確應包先裝乃測：

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

得：測過於 CI 含無頭 Chrome。

敗：常 CI 患：Chrome 未裝（加 apt-get 步）、顯服缺（shinytest2 默用無頭、常非患）、緩行超時（增 `AppDriver$new()` 之 `timeout`）。

## 驗

- [ ] `devtools::test()` 行諸測無誤
- [ ] testServer() 測覆模服邏
- [ ] shinytest2 測覆要用流
- [ ] 影檔入版控
- [ ] 測過於 CI 境
- [ ] 邊測（空資、NULL 入、誤態）

## 忌

- **測 UI 繪非邏**：用 `testServer()` 為邏、`app$expect_values()` 為資。唯視覺重時用 `app$expect_screenshot()`——影脆於跨臺
- **e2e 模 ID 式**：經 AppDriver 設模入用 `"moduleId-inputId"`（連號分）、非 `"moduleId.inputId"`
- **時不穩**：`app$set_inputs()` 後常呼 `app$wait_for_idle()`。否則斷或行於反更前
- **影漂**：勿入異臺生影（Mac 對 Linux）。標 CI 臺生影
- **CI 無 Chrome**：shinytest2 需 Chrome/Chromium。常含裝步於 CI 流

## 參

- `build-shiny-module` — 建可測之明介模
- `scaffold-shiny-app` — 立應構含測基
- `write-testthat-tests` — R 包通 testthat 模
- `setup-github-actions-ci` — R 包（golem 應）CI/CD 立
