# Entry point for R tests
if (!requireNamespace("testthat", quietly = TRUE)) {
  stop("testthat is required to run tests. Install with: install.packages('testthat')")
}
testthat::test_dir("tests/testthat")
