---
name: test-shiny-app
locale: wenyan-lite
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

# 測試 Shiny 應用

以 shinytest2（端對端）與 testServer()（單元測試）為 Shiny 應用設立全面測試。

## 適用時機

- 為既有 Shiny 應用加測試
- 為新 Shiny 專案設立測試策略
- 重構 Shiny 碼前寫回歸測試
- 將 Shiny 應用測試整合入 CI/CD 管道

## 輸入

- **必要**：Shiny 應用之路徑
- **必要**：測試範圍（單元測試、端對端，或兩者）
- **選擇性**：是否用快照測試（預設：e2e 為 yes）
- **選擇性**：CI 平台（GitHub Actions、GitLab CI）
- **選擇性**：欲獨立測之模組

## 步驟

### 步驟一：安裝測試依賴

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

**預期：** shinytest2 已裝且 testthat 目錄結構就位。

**失敗時：** shinytest2 需 chromote（無頭 Chrome）。於系統裝 Chrome/Chromium。WSL 上：`sudo apt install -y chromium-browser`。以 `chromote::find_chrome()` 驗。

### 步驟二：為模組寫 testServer() 單元測試

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

關鍵模式：
- `testServer()` 無瀏覽器測模組伺服器邏輯
- 透過 `args` 列表傳反應參數
- 用 `session$setInputs()` 模擬用戶互動
- 直接以名存取反應回值
- 測邊界情況：空資料、NULL 輸入、無效值

**預期：** 模組測試以 `devtools::test()` 通過。

**失敗時：** 若 `testServer()` 報錯「不為模組伺服器函式」，確保函式內部用 `moduleServer()`。若 `session$setInputs()` 不觸發反應，於設輸入後加 `session$flushReact()`。

### 步驟三：寫 shinytest2 端對端測試

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

關鍵模式：
- `AppDriver$new()` 於無頭 Chrome 啟應用
- 永遠用 `on.exit(app$stop())` 清理
- 模組輸入 ID 用 `"moduleId-inputId"` 格式
- `app$expect_values()` 建／比對快照檔
- `app$wait_for_idle()` 確反應更新完成

**預期：** 端對端測試於 `tests/testthat/_snaps/` 建快照檔。

**失敗時：** 若找不到 Chrome，將 `CHROMOTE_CHROME` 環境變數設為 Chrome 二進位之路徑。若快照於 CI 失敗而本機過，檢平台依賴之渲染差——對資料快照用 `app$expect_values()`，而非對視覺者用 `app$expect_screenshot()`。

### 步驟四：互動式錄製測試（選擇性）

```r
shinytest2::record_test("path/to/app")
```

此於含錄製面板之瀏覽器中開應用。與應用互動，再點「Save test」自動產生測試碼。

**預期：** 一測試文件於 `tests/testthat/` 中產生，含所錄互動。

**失敗時：** 若錄製器不開，先檢應用以 `shiny::runApp()` 成功執。錄製器需可運作之應用。

### 步驟五：設立快照管理

對快照測試，管理預期值：

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

將快照目錄加入版本控制：

```
tests/testthat/_snaps/    # Committed — contains expected values
```

**預期：** 快照檔於 git 中追蹤以供回歸偵測。

**失敗時：** 若快照意外變化，跑 `testthat::snapshot_review()` 看差。以 `testthat::snapshot_accept()` 接受意圖之變。

### 步驟六：與 CI 整合

加入 `.github/workflows/R-CMD-check.yaml` 或建專屬工作流：

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

對 golem 應用，確應用套件於測前已裝：

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**預期：** 測試於 CI 中以無頭 Chrome 通過。

**失敗時：** 常見 CI 問題：Chrome 未裝（加 apt-get 步驟）、顯示伺服器缺（shinytest2 預設用無頭模式故通常非問題）、慢執行器逾時（增 `AppDriver$new()` 之 `timeout`）。

## 驗證

- [ ] `devtools::test()` 無錯執所有測試
- [ ] testServer() 測試含模組伺服器邏輯
- [ ] shinytest2 測試含關鍵用戶工作流
- [ ] 快照檔已提交至版本控制
- [ ] 測試於 CI 環境中通過
- [ ] 邊界情況已測（空資料、NULL 輸入、錯誤狀態）

## 常見陷阱

- **測 UI 渲染而非邏輯**：邏輯優先用 `testServer()`，資料用 `app$expect_values()`。僅當視覺外觀重要時用 `app$expect_screenshot()`——截圖跨平台脆弱。
- **e2e 測試中之模組 ID 格式**：透過 AppDriver 設模組輸入時，用 `"moduleId-inputId"` 格式（連字符分隔），非 `"moduleId.inputId"`。
- **時序不穩**：永遠於 `app$set_inputs()` 後叫 `app$wait_for_idle()`。否則斷言可能於反應更新完成前執。
- **快照漂移**：勿提交於不同平台（Mac vs Linux）所產之快照。將 CI 平台標準化為快照產生平台。
- **CI 缺 Chrome**：shinytest2 需 Chrome/Chromium。永遠於 CI 工作流中含安裝步驟。

## 相關技能

- `build-shiny-module` — 建可測之具清晰介面之模組
- `scaffold-shiny-app` — 設立含測試基礎建設之應用結構
- `write-testthat-tests` — R 套件之一般 testthat 模式
- `setup-github-actions-ci` — R 套件（golem 應用）之 CI/CD 設立
