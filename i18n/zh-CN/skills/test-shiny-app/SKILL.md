---
name: test-shiny-app
description: >
  使用 shinytest2 进行端到端浏览器测试，以及使用 testServer() 对模块 server
  逻辑进行单元测试。涵盖快照测试、CI 集成和外部服务模拟。适用于为现有 Shiny
  应用添加测试、为新 Shiny 项目设置测试策略、在重构 Shiny 代码前编写回归测试，
  或将 Shiny 应用测试集成到 CI/CD 流水线。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, testing, shinytest2, testServer, snapshot, CI
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 测试 Shiny 应用

使用 shinytest2（端到端）和 testServer()（单元测试）为 Shiny 应用程序设置全面测试。

## 适用场景

- 为现有 Shiny 应用添加测试
- 为新 Shiny 项目设置测试策略
- 在重构 Shiny 代码前编写回归测试
- 将 Shiny 应用测试集成到 CI/CD 流水线

## 输入

- **必需**：Shiny 应用路径
- **必需**：测试范围（单元测试、端到端，或两者）
- **可选**：是否使用快照测试（默认：端到端测试是）
- **可选**：CI 平台（GitHub Actions、GitLab CI）
- **可选**：要单独测试的模块

## 步骤

### 第 1 步：安装测试依赖项

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

**预期结果：** shinytest2 已安装，testthat 目录结构就绪。

**失败处理：** shinytest2 需要 chromote（无头 Chrome）。在系统上安装 Chrome/Chromium。WSL 上：`sudo apt install -y chromium-browser`。使用 `chromote::find_chrome()` 验证。

### 第 2 步：用 testServer() 为模块编写单元测试

创建 `tests/testthat/test-mod_dashboard.R`：

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

关键模式：
- `testServer()` 无需浏览器测试模块 server 逻辑
- 通过 `args` 列表传递响应式参数
- 使用 `session$setInputs()` 模拟用户交互
- 直接按名称访问响应式返回值
- 测试边界情况：空数据、NULL 输入、无效值

**预期结果：** 模块测试通过 `devtools::test()`。

**失败处理：** 如果 `testServer()` 报错"不是模块 server 函数"，确保函数内部使用了 `moduleServer()`。如果 `session$setInputs()` 没有触发响应式，在设置输入后添加 `session$flushReact()`。

### 第 3 步：编写 shinytest2 端到端测试

创建 `tests/testthat/test-app-e2e.R`：

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

关键模式：
- `AppDriver$new()` 在无头 Chrome 中启动应用
- 始终使用 `on.exit(app$stop())` 进行清理
- 模块输入 ID 使用格式 `"moduleId-inputId"`
- `app$expect_values()` 创建/比较快照文件
- `app$wait_for_idle()` 确保响应式更新完成

**预期结果：** 端到端测试在 `tests/testthat/_snaps/` 中创建快照文件。

**失败处理：** 如果找不到 Chrome，将 `CHROMOTE_CHROME` 环境变量设置为 Chrome 二进制文件路径。如果快照在 CI 上失败但本地通过，检查平台相关的渲染差异——使用 `app$expect_values()` 进行数据快照而非 `app$expect_screenshot()` 进行视觉快照。

### 第 4 步：交互式录制测试（可选）

```r
shinytest2::record_test("path/to/app")
```

这会在带有录制面板的浏览器中打开应用。与应用交互，然后单击"保存测试"以自动生成测试代码。

**预期结果：** 在 `tests/testthat/` 中生成包含录制交互的测试文件。

**失败处理：** 如果录制器未打开，先用 `shiny::runApp()` 确认应用能正常运行。录制器需要工作正常的应用。

### 第 5 步：设置快照管理

对于基于快照的测试，管理期望值：

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

将快照目录添加到版本控制：

```
tests/testthat/_snaps/    # Committed — contains expected values
```

**预期结果：** 快照文件在 git 中被跟踪，用于回归检测。

**失败处理：** 如果快照意外更改，运行 `testthat::snapshot_review()` 查看差异。使用 `testthat::snapshot_accept()` 接受有意更改。

### 第 6 步：与 CI 集成

添加到 `.github/workflows/R-CMD-check.yaml` 或创建专用工作流：

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

对于 golem 应用，确保在测试前安装应用包：

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**预期结果：** 测试在 CI 上以无头 Chrome 通过。

**失败处理：** 常见 CI 问题：Chrome 未安装（添加 apt-get 步骤）、显示服务器缺失（shinytest2 默认使用无头模式，通常不是问题）、或慢速运行器上超时（增加 `AppDriver$new()` 中的 `timeout`）。

## 验证清单

- [ ] `devtools::test()` 运行所有测试无错误
- [ ] testServer() 测试覆盖模块 server 逻辑
- [ ] shinytest2 测试覆盖关键用户工作流
- [ ] 快照文件已提交到版本控制
- [ ] 测试在 CI 环境中通过
- [ ] 测试了边界情况（空数据、NULL 输入、错误状态）

## 常见问题

- **测试 UI 渲染而非逻辑**：优先用 `testServer()` 测试逻辑，用 `app$expect_values()` 测试数据。只在视觉外观重要时使用 `app$expect_screenshot()`——截图在不同平台上易碎。
- **端到端测试中的模块 ID 格式**：通过 AppDriver 设置模块输入时，使用 `"moduleId-inputId"` 格式（连字符分隔），而非 `"moduleId.inputId"`。
- **不稳定的时序**：在 `app$set_inputs()` 后始终调用 `app$wait_for_idle()`。否则，断言可能在响应式更新完成前运行。
- **快照漂移**：不要提交在不同平台（Mac vs Linux）上生成的快照。以 CI 平台为标准生成快照。
- **CI 上缺少 Chrome**：shinytest2 需要 Chrome/Chromium。在 CI 工作流中始终包含安装步骤。

## 相关技能

- `build-shiny-module` — 创建具有清晰接口的可测试模块
- `scaffold-shiny-app` — 设置带测试基础设施的应用结构
- `write-testthat-tests` — R 包的通用 testthat 模式
- `setup-github-actions-ci` — R 包的 CI/CD 设置（golem 应用）
