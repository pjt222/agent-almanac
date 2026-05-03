---
name: write-testthat-tests
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write comprehensive testthat (edition 3) tests for R package functions.
  Covers test organization, expectations, fixtures, mocking, snapshot
  tests, parameterized tests, achieving high coverage. Use when adding
  tests for new package functions, increasing test coverage for existing
  code, writing regression tests for bug fixes, or setting up test
  infrastructure for package that lacks it.
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

Create comprehensive tests for R package functions using testthat edition 3.

## When Use

- Adding tests for new package functions
- Increasing test coverage for existing code
- Writing regression tests for bug fixes
- Setting up test infrastructure for new package

## Inputs

- **Required**: R functions to test
- **Required**: Expected behavior and edge cases
- **Optional**: Test fixtures or sample data
- **Optional**: Target coverage percentage (default: 80%)

## Steps

### Step 1: Set Up Test Infrastructure

If not already done:

```r
usethis::use_testthat(edition = 3)
```

Creates `tests/testthat.R` and `tests/testthat/` directory.

**Got:** `tests/testthat.R` and `tests/testthat/` directory created. DESCRIPTION has `Config/testthat/edition: 3` set.

**If err:** usethis not available? Manually create `tests/testthat.R` containing `library(testthat); library(packagename); test_check("packagename")`. Add `tests/testthat/` directory.

### Step 2: Create Test File

```r
usethis::use_test("function_name")
```

Creates `tests/testthat/test-function_name.R` with template.

**Got:** Test file created at `tests/testthat/test-function_name.R` with placeholder `test_that()` block ready to fill in.

**If err:** `usethis::use_test()` not available? Manually create file. Follow naming convention `test-<function_name>.R`.

### Step 3: Write Basic Tests

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

**Got:** Basic tests cover correct output for typical inputs, NA handling behavior, input validation error messages.

**If err:** Tests fail immediately? Verify function loaded (`devtools::load_all()`). Error messages don't match? Use regex pattern in `expect_error()` instead of exact string.

### Step 4: Test Edge Cases

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

**Got:** Edge cases covered: empty input, single values, zero weights, extreme values, invalid inputs. Each edge case has clear expected behavior.

**If err:** Function doesn't handle edge case as expected? Decide whether to fix function or adjust test. Document intended behavior for ambiguous cases.

### Step 5: Use Fixtures for Complex Tests

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

**Got:** Fixtures provide consistent test data across multiple test files. Helper functions in `tests/testthat/helper.R` loaded automatic by testthat.

**If err:** Helper functions not found? Ensure file named `helper.R` (not `helpers.R`) and located in `tests/testthat/`. Restart R session if needed.

### Step 6: Mock External Dependencies

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

**Got:** External dependencies (APIs, databases, network calls) mocked so tests run without real connections. Mock return values exercise function's data processing logic.

**If err:** `local_mocked_bindings()` fails? Ensure function being mocked accessible in test scope. For functions in other packages, use `.package` argument.

### Step 7: Snapshot Tests for Complex Output

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

**Got:** Snapshot files created in `tests/testthat/_snaps/`. First run creates baseline. Subsequent runs compare against it.

**If err:** Snapshots fail after intentional change? Update with `testthat::snapshot_accept()`. For cross-platform differences, use `variant` parameter to maintain platform-specific snapshots.

### Step 8: Use Skip Conditions

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

**Got:** Tests requiring special environments (network, database, multiple cores) properly guarded with skip conditions. These tests run locally but skipped on CRAN or restricted CI environments.

**If err:** Tests fail on CRAN or CI but pass local? Add appropriate `skip_on_cran()`, `skip_on_os()`, or `skip_if_not()` guard at top of `test_that()` block.

### Step 9: Run Tests and Check Coverage

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

**Got:** All tests pass with `devtools::test()`. Coverage report shows target percentage met (aim for >80%).

**If err:** Tests fail? Read test output for specific assertion failures. Coverage below target? Use `covr::report()` to identify untested code paths. Add tests for them.

## Check

- [ ] All tests pass with `devtools::test()`
- [ ] Coverage exceeds target percentage
- [ ] Every exported function has at least one test
- [ ] Error conditions tested
- [ ] Edge cases covered (NA, NULL, empty, boundary values)
- [ ] No tests depend on external state or order of execution

## Pitfalls

- **Tests depend on each other**: Each `test_that()` block must be independent
- **Hardcoded file paths**: Use `testthat::test_path()` for test fixtures
- **Floating point comparison**: Use `expect_equal()` (has tolerance) not `expect_identical()`
- **Testing private functions**: Test through public API when possible. Use `:::` sparingly.
- **Snapshot tests in CI**: Snapshots platform-sensitive. Use `variant` parameter for cross-platform.
- **Forget `skip_on_cran()`**: Tests requiring network, databases, or long runtime must skip on CRAN

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

## See Also

- `create-r-package` - set up test infrastructure as part of package creation
- `write-roxygen-docs` - document functions you test
- `setup-github-actions-ci` - run tests automatically on push
- `submit-to-cran` - CRAN requires tests to pass on all platforms
