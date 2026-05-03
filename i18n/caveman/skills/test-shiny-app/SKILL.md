---
name: test-shiny-app
locale: caveman
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

# Test Shiny App

Set up comprehensive testing for Shiny applications using shinytest2 (end-to-end) and testServer() (unit tests).

## When Use

- Add tests to existing Shiny application
- Set up testing strategy for new Shiny project
- Write regression tests before refactoring Shiny code
- Integrate Shiny app tests into CI/CD pipelines

## Inputs

- **Required**: Path to Shiny application
- **Required**: Test scope (unit tests, end-to-end, or both)
- **Optional**: Whether to use snapshot testing (default: yes for e2e)
- **Optional**: CI platform (GitHub Actions, GitLab CI)
- **Optional**: Modules to test in isolation

## Steps

### Step 1: Install Testing Dependencies

```r
install.packages("shinytest2")

# For golem apps, add as a Suggests dependency
usethis::use_package("shinytest2", type = "Suggests")

# Set up testthat infrastructure if not present
usethis::use_testthat(edition = 3)
```

**Got:** shinytest2 installed, testthat directory structure in place.

**If fail:** shinytest2 needs chromote (headless Chrome). Install Chrome/Chromium on system. WSL: `sudo apt install -y chromium-browser`. Verify with `chromote::find_chrome()`.

### Step 2: Write testServer() Unit Tests for Modules

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

Key patterns:
- `testServer()` tests module server logic without a browser
- Pass reactive arguments via the `args` list
- Use `session$setInputs()` to simulate user interactions
- Access reactive return values directly by name
- Test edge cases: empty data, NULL inputs, invalid values

**Got:** Module tests pass with `devtools::test()`.

**If fail:** `testServer()` errors with "not a module server function"? Ensure function uses `moduleServer()` internally. `session$setInputs()` doesn't trigger reactives? Add `session$flushReact()` after setting inputs.

### Step 3: Write shinytest2 End-to-End Tests

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

Key patterns:
- `AppDriver$new()` launches the app in headless Chrome
- Always use `on.exit(app$stop())` to clean up
- Module input IDs use the format `"moduleId-inputId"`
- `app$expect_values()` creates/compares snapshot files
- `app$wait_for_idle()` ensures reactive updates complete

**Got:** End-to-end tests create snapshot files in `tests/testthat/_snaps/`.

**If fail:** Chrome not found? Set `CHROMOTE_CHROME` environment variable to Chrome binary path. Snapshots fail on CI but pass local? Check for platform-dependent rendering differences — use `app$expect_values()` for data snapshots rather than `app$expect_screenshot()` for visual ones.

### Step 4: Record Test Interactively (Optional)

```r
shinytest2::record_test("path/to/app")
```

This opens the app in a browser with a recording panel. Interact with the app, then click "Save test" to auto-generate test code.

**Got:** Test file generated in `tests/testthat/` with recorded interactions.

**If fail:** Recorder doesn't open? Check app runs successful with `shiny::runApp()` first. Recorder needs working app.

### Step 5: Set Up Snapshot Management

For snapshot-based tests, manage expected values:

```r
# Accept new/changed snapshots after review
testthat::snapshot_accept("test-app-e2e")

# Review snapshot differences
testthat::snapshot_review("test-app-e2e")
```

Add snapshot directories to version control:

```
tests/testthat/_snaps/    # Committed — contains expected values
```

**Got:** Snapshot files tracked in git for regression detection.

**If fail:** Snapshots change unexpected? Run `testthat::snapshot_review()` to see diffs. Accept intentional changes with `testthat::snapshot_accept()`.

### Step 6: Integrate with CI

Add to `.github/workflows/R-CMD-check.yaml` or create a dedicated workflow:

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

For golem apps, ensure the app package is installed before testing:

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**Got:** Tests pass in CI with headless Chrome.

**If fail:** Common CI issues: Chrome not installed (add apt-get step), display server missing (shinytest2 uses headless mode default so usually not issue), or timeout on slow runners (increase `timeout` in `AppDriver$new()`).

## Checks

- [ ] `devtools::test()` runs all tests without errors
- [ ] testServer() tests cover module server logic
- [ ] shinytest2 tests cover key user workflows
- [ ] Snapshot files committed to version control
- [ ] Tests pass in CI environment
- [ ] Edge cases tested (empty data, NULL inputs, error states)

## Pitfalls

- **Test UI rendering instead of logic**: Prefer `testServer()` for logic and `app$expect_values()` for data. Only use `app$expect_screenshot()` when visual appearance matters — screenshots brittle across platforms.
- **Module ID format in e2e tests**: Setting module inputs via AppDriver? Use `"moduleId-inputId"` format (hyphen-separated), not `"moduleId.inputId"`.
- **Flaky timing**: Always call `app$wait_for_idle()` after `app$set_inputs()`. Without it, assertions may run before reactive updates complete.
- **Snapshot drift**: Never commit snapshots generated on different platforms (Mac vs Linux). Standardize on CI platform for snapshot generation.
- **Missing Chrome on CI**: shinytest2 needs Chrome/Chromium. Always include installation step in CI workflows.

## See Also

- `build-shiny-module` — create testable modules with clear interfaces
- `scaffold-shiny-app` — set up app structure with testing infrastructure
- `write-testthat-tests` — general testthat patterns for R packages
- `setup-github-actions-ci` — CI/CD setup for R packages (golem apps)
