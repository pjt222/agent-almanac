---
name: test-shiny-app
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Test Shiny apps via shinytest2 for e2e browser tests + testServer() for
  unit-testing module server logic. Snapshot testing, CI integration,
  mock external services. Use → add tests to existing Shiny app, set up
  testing strategy for new project, regression tests before refactor,
  integrate into CI/CD.
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

# Test Shiny App

Comprehensive testing: shinytest2 (e2e) + testServer() (unit).

## Use When

- Add tests to existing Shiny app
- Set up strategy for new Shiny project
- Regression tests before refactor
- Integrate into CI/CD

## In

- **Required**: Path to Shiny app
- **Required**: Test scope (unit, e2e, both)
- **Optional**: Snapshot testing (default: yes for e2e)
- **Optional**: CI platform (GH Actions, GitLab CI)
- **Optional**: Modules to test in isolation

## Do

### Step 1: Install Test Deps

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

**Got:** shinytest2 installed + testthat dir structure in place.

**If err:** shinytest2 needs chromote (headless Chrome). Install Chrome/Chromium. WSL: `sudo apt install -y chromium-browser`. Verify w/ `chromote::find_chrome()`.

### Step 2: testServer() Unit Tests

Create `tests/testthat/test-mod_dashboard.R`:

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

Patterns:
- `testServer()` tests module server logic w/o browser
- Pass reactive args via `args` list
- `session$setInputs()` simulates user
- Access reactive returns directly by name
- Test edge: empty data, NULL inputs, invalid values

**Got:** Module tests pass `devtools::test()`.

**If err:** `testServer()` errs "not a module server function" → fn must use `moduleServer()` internally. `session$setInputs()` doesn't trigger reactives → add `session$flushReact()` after.

### Step 3: shinytest2 E2E Tests

Create `tests/testthat/test-app-e2e.R`:

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

Patterns:
- `AppDriver$new()` launches in headless Chrome
- Always `on.exit(app$stop())` for cleanup
- Module input IDs: `"moduleId-inputId"`
- `app$expect_values()` creates/cmps snapshot files
- `app$wait_for_idle()` ensures reactive updates complete

**Got:** E2E tests create snapshot files in `tests/testthat/_snaps/`.

**If err:** Chrome not found → set `CHROMOTE_CHROME` env to path. Snapshots fail CI but pass local → platform-dep rendering diffs; use `app$expect_values()` for data, not `app$expect_screenshot()` for visual.

### Step 4: Record Test Interactively (Optional)

```r
shinytest2::record_test("path/to/app")
```

Opens app in browser w/ recording panel. Interact, click "Save test" → auto-gen test code.

**Got:** Test file generated in `tests/testthat/` w/ recorded interactions.

**If err:** Recorder doesn't open → check app runs w/ `shiny::runApp()` first. Recorder needs working app.

### Step 5: Snapshot Mgmt

For snapshot tests, manage expected:

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

Add snapshot dirs to VCS:

```
tests/testthat/_snaps/    # Committed — contains expected values
```

**Got:** Snapshot files tracked in git for regression detection.

**If err:** Snapshots change unexpectedly → run `testthat::snapshot_review()` for diffs. Accept intentional changes w/ `testthat::snapshot_accept()`.

### Step 6: CI Integration

Add to `.github/workflows/R-CMD-check.yaml` | dedicated workflow:

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

Golem apps → install pkg before testing:

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**Got:** Tests pass in CI w/ headless Chrome.

**If err:** Common: Chrome not installed (add apt-get), display server missing (shinytest2 headless default so usually no issue), timeout on slow runners (↑ `timeout` in `AppDriver$new()`).

## Check

- [ ] `devtools::test()` runs all w/o errors
- [ ] testServer() covers module server logic
- [ ] shinytest2 covers key user workflows
- [ ] Snapshot files committed
- [ ] Tests pass in CI
- [ ] Edge cases tested (empty data, NULL inputs, errs)

## Traps

- **Test UI rendering vs logic**: Prefer `testServer()` for logic + `app$expect_values()` for data. Only `app$expect_screenshot()` when visual matters — screenshots brittle across platforms.
- **Module ID format e2e**: AppDriver uses `"moduleId-inputId"` (hyphen), NOT `"moduleId.inputId"`.
- **Flaky timing**: Always `app$wait_for_idle()` after `app$set_inputs()`. Without → assertions may run before reactive updates.
- **Snapshot drift**: Don't commit snapshots from diff platforms (Mac vs Linux). Standardize on CI platform.
- **Missing Chrome on CI**: shinytest2 needs Chrome/Chromium. Always include install step.

## →

- `build-shiny-module` — create testable modules w/ clear interfaces
- `scaffold-shiny-app` — set up app structure w/ testing infra
- `write-testthat-tests` — general testthat patterns for R pkgs
- `setup-github-actions-ci` — CI/CD setup for R pkgs (golem apps)
