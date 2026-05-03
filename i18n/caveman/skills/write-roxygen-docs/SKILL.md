---
name: write-roxygen-docs
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write roxygen2 documentation for R package functions, datasets, and
  classes. Covers all standard tags, cross-references, examples,
  and generating NAMESPACE entries. Follows tidyverse documentation style.
  Use when adding documentation to new exported functions, documenting
  internal helpers or datasets, documenting S3/S4/R6 classes and methods,
  or fixing documentation-related R CMD check notes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, roxygen2, documentation, namespace
---

# Write Roxygen Documentation

Create complete roxygen2 documentation for R package functions, datasets, classes.

## When Use

- Adding documentation to new exported function
- Documenting internal helper functions
- Documenting package datasets
- Documenting S3/S4/R6 classes and methods
- Fixing documentation-related `R CMD check` notes

## Inputs

- **Required**: R function, dataset, or class to document
- **Optional**: Related functions for cross-referencing (`@family`, `@seealso`)
- **Optional**: Whether function should be exported

## Steps

### Step 1: Write Function Documentation

Place roxygen comments directly above function:

```r
#' Compute the weighted mean of a numeric vector
#'
#' Calculates the arithmetic mean of `x` weighted by `w`. Missing values
#' in either `x` or `w` are handled according to the `na.rm` parameter.
#'
#' @param x A numeric vector of values.
#' @param w A numeric vector of weights, same length as `x`.
#' @param na.rm Logical. Should missing values be removed? Default `FALSE`.
#'
#' @return A single numeric value representing the weighted mean.
#'
#' @examples
#' weighted_mean(1:5, rep(1, 5))
#' weighted_mean(c(1, 2, NA, 4), c(1, 1, 1, 1), na.rm = TRUE)
#'
#' @export
#' @family summary functions
#' @seealso [stats::weighted.mean()] for the base R equivalent
weighted_mean <- function(x, w, na.rm = FALSE) {
  # implementation
}
```

**Got:** Complete roxygen block with title, description, `@param` for each parameter, `@return`, `@examples`, `@export`.

**If err:** Unsure about a tag? Check `?roxygen2::rd_roclet`. Common omission is `@return`. Required by CRAN for all exported functions.

### Step 2: Essential Tags Reference

| Tag | Purpose | Required for export? |
|-----|---------|---------------------|
| `#' Title` | First line, one sentence | Yes |
| `#' Description` | Paragraph after blank line | Yes |
| `@param` | Parameter documentation | Yes |
| `@return` | Return value description | Yes (CRAN) |
| `@examples` | Usage examples | Strongly recommended |
| `@export` | Add to NAMESPACE | Yes, for public API |
| `@family` | Group related functions | Recommended |
| `@seealso` | Cross-references | Optional |
| `@keywords internal` | Mark as internal | For non-exported docs |

**Got:** All required tags for function type identified. Exported functions have `@param`, `@return`, `@examples`, `@export` at minimum.

**If err:** Tag unfamiliar? Consult [roxygen2 documentation](https://roxygen2.r-lib.org/articles/rd.html) for usage and syntax.

### Step 3: Document Datasets

Create `R/data.R`:

```r
#' Example dataset of city temperatures
#'
#' A dataset containing daily temperature readings for major cities.
#'
#' @format A data frame with 365 rows and 4 variables:
#' \describe{
#'   \item{date}{Date of observation}
#'   \item{city}{City name}
#'   \item{temp_c}{Temperature in Celsius}
#'   \item{humidity}{Relative humidity percentage}
#' }
#' @source \url{https://example.com/data}
"city_temperatures"
```

**Got:** `R/data.R` contains roxygen blocks for each dataset with `@format` describing structure and `@source` providing data provenance.

**If err:** `R CMD check` warns about undocumented datasets? Ensure quoted string (e.g., `"city_temperatures"`) exactly matches object name saved with `usethis::use_data()`.

### Step 4: Document Package

Create `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Got:** `R/packagename-package.R` exists with `@keywords internal` and `"_PACKAGE"` sentinel. Running `devtools::document()` generates `man/packagename-package.Rd`.

**If err:** `R CMD check` reports missing package documentation page? Verify file named `R/<packagename>-package.R` and contains `"_PACKAGE"` string.

### Step 5: Handle Special Cases

**Functions with dots in names** (S3 methods):

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**Reusing documentation** with `@inheritParams`:

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**No visible binding fix** using `.data` pronoun:

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**Got:** Special cases (S3 methods, inherited params, `.data` pronoun) documented correct. `@rdname` groups S3 methods together. `@inheritParams` reuses parameter docs without duplication.

**If err:** `R CMD check` warns about "no visible binding for global variable"? Add `#' @importFrom rlang .data` or use `utils::globalVariables()` as last resort.

### Step 6: Generate Documentation

```r
devtools::document()
```

**Got:** `man/` directory updated with `.Rd` files for each documented object. `NAMESPACE` regenerated with correct exports and imports.

**If err:** Check roxygen syntax errors. Common issues: unclosed brackets in `\describe{}`, missing `#'` prefix on line, or invalid tag names. Run `devtools::document()` again after fixing.

## Check

- [ ] Every exported function has `@param`, `@return`, `@examples`
- [ ] `devtools::document()` runs without errors
- [ ] `devtools::check()` shows no documentation warnings
- [ ] `@family` tags group related functions correct
- [ ] Examples run without errors (test with `devtools::run_examples()`)

## Pitfalls

- **Missing `@return`**: CRAN requires all exported functions to document their return value
- **Examples that need internet/auth**: Wrap in `\dontrun{}` with comment explaining why
- **Slow examples**: Use `\donttest{}` for examples that work but take too long for CRAN
- **Markdown in roxygen**: Enable with `Roxygen: list(markdown = TRUE)` in DESCRIPTION
- **Forget to run `devtools::document()`**: Man pages generated, not hand-written

## See Also

- `create-r-package` - initial package setup including roxygen configuration
- `write-testthat-tests` - test functions you document
- `write-vignette` - long-form documentation beyond function reference
- `submit-to-cran` - documentation requirements for CRAN
