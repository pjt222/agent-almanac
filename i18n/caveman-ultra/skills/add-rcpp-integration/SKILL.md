---
name: add-rcpp-integration
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Integrate C++ into R pkg via Rcpp → perf-critical ops.

## Use When

- R fn too slow, profile confirms bottleneck
- Interface existing C/C++ libs
- Algos benefit compiled (loops, recursion)
- RcppArmadillo → linear algebra

## In

- **Required**: Existing R pkg
- **Required**: R fn to replace/augment w/ C++
- **Optional**: External C++ lib
- **Optional**: RcppArmadillo? (default: plain Rcpp)

## Do

### Step 1: Rcpp Infra Setup

```r
usethis::use_rcpp()
```

Does:
- Creates `src/` dir
- Adds `Rcpp` → LinkingTo + Imports in DESCRIPTION
- Creates `R/packagename-package.R` w/ `@useDynLib` + `@importFrom Rcpp sourceCpp`
- Updates `.gitignore` for compiled

RcppArmadillo:

```r
usethis::use_rcpp_armadillo()
```

**→** `src/` created, DESCRIPTION updated `Rcpp` LinkingTo + Imports, `R/packagename-package.R` has `@useDynLib`.

**If err:** `usethis::use_rcpp()` fails → manually create `src/`, add `LinkingTo: Rcpp` + `Imports: Rcpp`, add `#' @useDynLib packagename, .registration = TRUE` + `#' @importFrom Rcpp sourceCpp` to pkg doc file.

### Step 2: Write C++ Fn

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

RcppArmadillo:

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

**→** C++ src at `src/my_function.cpp` w/ valid `// [[Rcpp::export]]` + roxygen `//'` docs.

**If err:** Verify `#include <Rcpp.h>` (or `<RcppArmadillo.h>`), export annotation own line directly above signature, return types map valid Rcpp.

### Step 3: Generate RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**→** `R/RcppExports.R` + `src/RcppExports.cpp` auto-generated.

**If err:** Check C++ syntax. Ensure `// [[Rcpp::export]]` above each exported fn.

### Step 4: Verify Compilation

```r
devtools::load_all()
```

**→** Pkg compiles + loads no err.

**If err:** Check compiler out. Common:
- Missing system headers → install dev libs
- Syntax err → compiler msgs point to line
- Missing `Rcpp::depends` for RcppArmadillo

### Step 5: Tests for Compiled

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

**→** Tests pass → C++ identical to R + edge cases (empty, NA) correct.

**If err:** NA fail → add explicit NA checks via `NumericVector::is_na()`. Empty fail → guard clause zero-length at top.

### Step 6: Cleanup Script

Create `src/Makevars`:

```makefile
PKG_CXXFLAGS = -O2
```

Create `cleanup` in pkg root (CRAN):

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

Make executable: `chmod +x cleanup`

**→** `src/Makevars` sets compiler flags, `cleanup` removes objects. Both at pkg root.

**If err:** Verify `cleanup` has exec perms (`chmod +x cleanup`), `Makevars` tabs (not spaces) for Makefile rules.

### Step 7: Update .Rbuildignore

Handle compiled artifacts:

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**→** `.Rbuildignore` patterns prevent compiled objects in tarball, preserve src + Makevars.

**If err:** `devtools::check()` → NOTEs about unexpected files in `src/`. Adjust patterns → exclude only `.o`, `.so`, `.dll`.

## Check

- [ ] `devtools::load_all()` compiles no warn
- [ ] Compiled fn produces correct results
- [ ] Tests pass edge cases (NA, empty, large)
- [ ] `R CMD check` passes no compile warn
- [ ] RcppExports generated + committed
- [ ] Perf improvement via benchmarks

## Traps

- **Forget `compileAttributes()`**: Must regen RcppExports after C++ changes
- **Int overflow**: `double` not `int` for large numerics
- **Memory mgmt**: Rcpp auto-handles for Rcpp types; no manual `delete`
- **NA handling**: C++ doesn't know R's NA. Check `Rcpp::NumericVector::is_na()`
- **Platform portability**: Avoid platform-specific C++. Test Win, macOS, Linux.
- **Missing `@useDynLib`**: Pkg doc must `@useDynLib packagename, .registration = TRUE`

## →

- `create-r-package` — pkg setup before Rcpp
- `write-testthat-tests` — testing compiled fns
- `setup-github-actions-ci` — CI needs C++ toolchain
- `submit-to-cran` — compiled pkgs need extra CRAN checks
