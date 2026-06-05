---
name: add-rcpp-integration
description: >
  Add Rcpp or RcppArmadillo integration to an R package for
  high-performance C++ code. Covers setup, writing C++ functions,
  RcppExports generation, testing compiled code, and debugging. Use when
  an R function is too slow and profiling confirms a bottleneck, when you
  need to interface with existing C/C++ libraries, or when implementing
  algorithms (loops, recursion, linear algebra) that benefit from compiled code.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
---

# Add Rcpp Integration

Integrate C++ code into an R package using Rcpp for performance-critical operations.

## When to Use

- R function is too slow and profiling confirms a bottleneck
- Need to interface with existing C/C++ libraries
- Implementing algorithms that benefit from compiled code (loops, recursion)
- Adding RcppArmadillo for linear algebra operations

## Inputs

- **Required**: Existing R package
- **Required**: R function to replace or augment with C++
- **Optional**: External C++ library to interface with
- **Optional**: Whether to use RcppArmadillo (default: plain Rcpp)

## Procedure

### Step 1: Set Up Rcpp Infrastructure

```r
usethis::use_rcpp()
```

This:
- Creates `src/` directory
- Adds `Rcpp` to LinkingTo and Imports in DESCRIPTION
- Creates `R/packagename-package.R` with `@useDynLib` and `@importFrom Rcpp sourceCpp`
- Updates `.gitignore` for compiled files

For RcppArmadillo:

```r
usethis::use_rcpp_armadillo()
```

**Expected:** `src/` directory created, DESCRIPTION updated with `Rcpp` in LinkingTo and Imports, and `R/packagename-package.R` contains `@useDynLib` directive.

**On failure:** If `usethis::use_rcpp()` fails, manually create `src/`, add `LinkingTo: Rcpp` and `Imports: Rcpp` to DESCRIPTION, and add `#' @useDynLib packagename, .registration = TRUE` and `#' @importFrom Rcpp sourceCpp` to the package-level documentation file.

### Step 2: Write C++ Function

Create `src/my_function.cpp`:

```cpp
#include <Rcpp.h>
using namespace Rcpp;

//' Compute cumulative sum efficiently
//'
//' @param x A numeric vector
//' @return A numeric vector of cumulative sums
//' @export
// [[Rcpp::export]]
NumericVector cumsum_cpp(NumericVector x) {
  int n = x.size();
  NumericVector out(n);
  out[0] = x[0];
  for (int i = 1; i < n; i++) {
    out[i] = out[i - 1] + x[i];
  }
  return out;
}
```

For RcppArmadillo:

```cpp
#include <RcppArmadillo.h>
// [[Rcpp::depends(RcppArmadillo)]]

//' Matrix multiplication using Armadillo
//'
//' @param A A numeric matrix
//' @param B A numeric matrix
//' @return The matrix product A * B
//' @export
// [[Rcpp::export]]
arma::mat mat_mult(const arma::mat& A, const arma::mat& B) {
  return A * B;
}
```

**Expected:** C++ source file exists at `src/my_function.cpp` with valid `// [[Rcpp::export]]` annotation and roxygen-style `//'` documentation comments.

**On failure:** Verify the file uses `#include <Rcpp.h>` (or `<RcppArmadillo.h>` for Armadillo), that the export annotation is on its own line directly above the function signature, and that return types map to valid Rcpp types.

### Step 3: Generate RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**Expected:** `R/RcppExports.R` and `src/RcppExports.cpp` generated automatically.

**On failure:** Check C++ syntax errors. Ensure `// [[Rcpp::export]]` tag is present above each exported function.

### Step 4: Verify Compilation

```r
devtools::load_all()
```

**Expected:** Package compiles and loads without errors.

**On failure:** Check compiler output for errors. Common issues:
- Missing system headers: Install development libraries
- Syntax errors: C++ compiler messages point to the line
- Missing `Rcpp::depends` attribute for RcppArmadillo

### Step 5: Write Tests for Compiled Code

```r
test_that("cumsum_cpp matches base R", {
  x <- c(1, 2, 3, 4, 5)
  expect_equal(cumsum_cpp(x), cumsum(x))
})

test_that("cumsum_cpp handles edge cases", {
  expect_equal(cumsum_cpp(numeric(0)), numeric(0))
  expect_equal(cumsum_cpp(c(NA_real_, 1)), c(NA_real_, NA_real_))
})
```

**Expected:** Tests pass, confirming the C++ function produces identical results to the R equivalent and handles edge cases (empty vectors, NA values) correctly.

**On failure:** If tests fail on NA handling, add explicit NA checks in the C++ code using `NumericVector::is_na()`. If tests fail on empty input, add a guard clause for zero-length vectors at the top of the function.

### Step 6: Add Cleanup Script

Create `src/Makevars`:

```makefile
PKG_CXXFLAGS = -O2
```

Create `cleanup` in package root (for CRAN):

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

Make executable: `chmod +x cleanup`

**Expected:** `src/Makevars` sets compiler flags and `cleanup` script removes compiled objects. Both files exist at the package root level.

**On failure:** Verify `cleanup` has execute permissions (`chmod +x cleanup`) and that `Makevars` uses tabs (not spaces) for indentation if adding Makefile-style rules.

### Step 7: Update .Rbuildignore

Ensure compiled artifacts are handled:

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**Expected:** `.Rbuildignore` patterns prevent compiled object files from being included in the package tarball, while preserving source files and Makevars.

**On failure:** Run `devtools::check()` and look for NOTEs about unexpected files in `src/`. Adjust `.Rbuildignore` patterns to exclude only `.o`, `.so`, and `.dll` files.

## Validation

- [ ] `devtools::load_all()` compiles without warnings
- [ ] Compiled function produces correct results
- [ ] Tests pass for edge cases (NA, empty, large inputs)
- [ ] `R CMD check` passes with no compilation warnings
- [ ] RcppExports files are generated and committed
- [ ] Performance improvement confirmed with benchmarks

## Common Pitfalls

- **Forgetting `compileAttributes()`**: Must regenerate RcppExports after changing C++ files
- **Integer overflow**: Use `double` instead of `int` for large numeric values
- **Memory management**: Rcpp handles memory automatically for Rcpp types; don't manually `delete`
- **NA handling**: C++ doesn't know about R's NA. Check with `Rcpp::NumericVector::is_na()`
- **Platform portability**: Avoid platform-specific C++ features. Test on Windows, macOS, and Linux.
- **Missing `@useDynLib`**: The package-level doc must include `@useDynLib packagename, .registration = TRUE`

## Related Skills

- `create-r-package` - package setup before adding Rcpp
- `write-testthat-tests` - testing compiled functions
- `setup-github-actions-ci` - CI must have C++ toolchain
- `submit-to-cran` - compiled packages need extra CRAN checks
