---
name: write-testthat-tests
locale: caveman-ultra
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

# Write testthat Tests

Comprehensive tests for R pkg fns via testthat ed 3.

## Use When

- New pkg fns
- Increase coverage for existing
- Regression tests for bug fixes
- Setup test infra for new pkg

## In

- **Required**: R fns to test
- **Required**: Expected behavior + edge cases
- **Optional**: Test fixtures|sample data
- **Optional**: Target coverage % (default: 80%)

## Do

### Step 1: Setup Test Infra

If not done:

```r
usethis::use_testthat(edition = 3)
```

Creates `tests/testthat.R` + `tests/testthat/` dir.

**Got:** `tests/testthat.R` + `tests/testthat/` dir created. DESCRIPTION has `Config/testthat/edition: 3`.

**If err:** usethis unavail → manually create `tests/testthat.R` w/ `library(testthat); library(packagename); test_check("packagename")` + add `tests/testthat/`.

### Step 2: Test File

```r
usethis::use_test("function_name")
```

Creates `tests/testthat/test-function_name.R` w/ template.

**Got:** Test file at `tests/testthat/test-function_name.R` w/ placeholder `test_that()` ready to fill.

**If err:** `usethis::use_test()` unavail → manual. Naming: `test-<function_name>.R`.

### Step 3: Basic Tests

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

**Got:** Basic tests cover correct out for typical inputs, NA handling, input valid err msgs.

**If err:** Tests fail immediately → verify fn loaded (`devtools::load_all()`). Err msgs don't match → regex pattern in `expect_error()` not exact string.

### Step 4: Edge Cases

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

**Got:** Edge cases covered: empty, single vals, zero weights, extreme, invalid. Each w/ clear expected behavior.

**If err:** Fn doesn't handle edge case as expected → fix fn or adjust test. Doc intended behavior for ambiguous.

### Step 5: Fixtures for Complex

Create `tests/testthat/fixtures/` for test data:

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

**Got:** Fixtures provide consistent test data across files. Helpers in `tests/testthat/helper.R` loaded auto by testthat.

**If err:** Helpers not found → ensure file `helper.R` (not `helpers.R`) + located in `tests/testthat/`. Restart R sess if needed.

### Step 6: Mock External Deps

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

**Got:** External deps (APIs, DBs, net calls) mocked → tests run w/o real connections. Mock returns exercise data processing logic.

**If err:** `local_mocked_bindings()` fails → ensure mocked fn accessible in test scope. Other pkgs → use `.package` arg.

### Step 7: Snapshot Tests for Complex Out

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

**Got:** Snapshot files created in `tests/testthat/_snaps/`. First run creates baseline; subsequent compare.

**If err:** Snapshots fail after intentional change → update w/ `testthat::snapshot_accept()`. Cross-platform diffs → `variant` param to maintain platform-specific.

### Step 8: Skip Conditions

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

**Got:** Tests requiring special env (net, DB, multi cores) guarded w/ skip. Run locally, skip on CRAN|restricted CI.

**If err:** Tests fail on CRAN|CI but pass locally → add `skip_on_cran()`, `skip_on_os()`, `skip_if_not()` at top of `test_that()`.

### Step 9: Run + Coverage

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

**Got:** All tests pass `devtools::test()`. Coverage report shows target met (aim > 80%).

**If err:** Tests fail → read out for assertion failures. Coverage below target → `covr::report()` to ID untested paths + add tests.

## Check

- [ ] All tests pass `devtools::test()`
- [ ] Coverage > target %
- [ ] Every exported fn has 1+ test
- [ ] Err conditions tested
- [ ] Edge cases covered (NA, NULL, empty, boundary)
- [ ] No tests depend on external state|order

## Traps

- **Tests depend on each other**: Each `test_that()` independent
- **Hardcoded paths**: `testthat::test_path()` for fixtures
- **Float compare**: `expect_equal()` (tolerance) not `expect_identical()`
- **Test private fns**: Test through public API. `:::` sparingly.
- **Snapshot in CI**: Platform-sensitive. `variant` for cross-platform.
- **Forget `skip_on_cran()`**: Net|DB|long runtime → skip on CRAN

## Examples

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

## →

- `create-r-package` — setup test infra as part of pkg creation
- `write-roxygen-docs` — doc fns you test
- `setup-github-actions-ci` — auto run tests on push
- `submit-to-cran` — CRAN requires tests pass on all platforms
