---
name: write-testthat-tests
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

Create comprehensive tests for R package functions using testthat edition 3.

## When to Use

- Adding tests for new package functions
- Increasing test coverage for existing code
- Writing regression tests for bug fixes
- Setting up test infrastructure for a new package

## Inputs

- **Required**: R functions to test
- **Required**: Expected behavior and edge cases
- **Optional**: Test fixtures or sample data
- **Optional**: Target coverage percentage (default: 80%)

## Procedure

### Step 1: Set Up Test Infrastructure

If not already done:

```r
usethis::use_testthat(edition = 3)
```

This creates `tests/testthat.R` and `tests/testthat/` directory.

**Expected:** `tests/testthat.R` and `tests/testthat/` directory created. DESCRIPTION has `Config/testthat/edition: 3` set.

**On failure:** If usethis is not available, manually create `tests/testthat.R` containing `library(testthat); library(packagename); test_check("packagename")` and add `tests/testthat/` directory.

### Step 2: Create Test File

```r
usethis::use_test("function_name")
```

This creates `tests/testthat/test-function_name.R` with a template.

**Expected:** Test file created at `tests/testthat/test-function_name.R` with a placeholder `test_that()` block ready to fill in.

**On failure:** If `usethis::use_test()` is not available, manually create the file. Follow the naming convention `test-<function_name>.R`.

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

**Expected:** Basic tests cover correct output for typical inputs, NA handling behavior, and input validation error messages.

**On failure:** If tests fail immediately, verify the function is loaded (`devtools::load_all()`). If error messages do not match, use a regex pattern in `expect_error()` instead of an exact string.

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

**Expected:** Edge cases are covered: empty input, single values, zero weights, extreme values, and invalid inputs. Each edge case has a clear expected behavior.

**On failure:** If the function does not handle an edge case as expected, decide whether to fix the function or adjust the test. Document the intended behavior for ambiguous cases.

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

**Expected:** Fixtures provide consistent test data across multiple test files. Helper functions in `tests/testthat/helper.R` are loaded automatically by testthat.

**On failure:** If helper functions are not found, ensure the file is named `helper.R` (not `helpers.R`) and is located in `tests/testthat/`. Restart the R session if needed.

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

**Expected:** External dependencies (APIs, databases, network calls) are mocked so tests run without real connections. Mock return values exercise the function's data processing logic.

**On failure:** If `local_mocked_bindings()` fails, ensure the function being mocked is accessible in the test scope. For functions in other packages, use the `.package` argument.

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

**Expected:** Snapshot files are created in `tests/testthat/_snaps/`. First run creates the baseline; subsequent runs compare against it.

**On failure:** If snapshots fail after an intentional change, update them with `testthat::snapshot_accept()`. For cross-platform differences, use the `variant` parameter to maintain platform-specific snapshots.

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

**Expected:** Tests that require special environments (network, database, multiple cores) are properly guarded with skip conditions. These tests run locally but are skipped on CRAN or restricted CI environments.

**On failure:** If tests fail on CRAN or CI but pass locally, add the appropriate `skip_on_cran()`, `skip_on_os()`, or `skip_if_not()` guard at the top of the `test_that()` block.

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

**Expected:** All tests pass with `devtools::test()`. Coverage report shows the target percentage is met (aim for >80%).

**On failure:** If tests fail, read the test output for specific assertion failures. If coverage is below target, use `covr::report()` to identify untested code paths and add tests for them.

## Validation

- [ ] All tests pass with `devtools::test()`
- [ ] Coverage exceeds target percentage
- [ ] Every exported function has at least one test
- [ ] Error conditions are tested
- [ ] Edge cases are covered (NA, NULL, empty, boundary values)
- [ ] No tests depend on external state or order of execution

## Common Pitfalls

- **Tests depending on each other**: Each `test_that()` block must be independent
- **Hardcoded file paths**: Use `testthat::test_path()` for test fixtures
- **Floating point comparison**: Use `expect_equal()` (has tolerance) not `expect_identical()`
- **Testing private functions**: Test through the public API when possible. Use `:::` sparingly.
- **Snapshot tests in CI**: Snapshots are platform-sensitive. Use `variant` parameter for cross-platform.
- **Forgetting `skip_on_cran()`**: Tests requiring network, databases, or long runtime must skip on CRAN

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

## Related Skills

- `create-r-package` - set up test infrastructure as part of package creation
- `write-roxygen-docs` - document the functions you test
- `setup-github-actions-ci` - run tests automatically on push
- `submit-to-cran` - CRAN requires tests to pass on all platforms
