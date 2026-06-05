---
name: write-roxygen-docs
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

Create complete roxygen2 documentation for R package functions, datasets, and classes.

## When to Use

- Adding documentation to a new exported function
- Documenting internal helper functions
- Documenting package datasets
- Documenting S3/S4/R6 classes and methods
- Fixing documentation-related `R CMD check` notes

## Inputs

- **Required**: R function, dataset, or class to document
- **Optional**: Related functions for cross-referencing (`@family`, `@seealso`)
- **Optional**: Whether the function should be exported

## Procedure

### Step 1: Write Function Documentation

Place roxygen comments directly above the function:

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

**Expected:** Complete roxygen block with title, description, `@param` for each parameter, `@return`, `@examples`, and `@export`.

**On failure:** If unsure about a tag, check `?roxygen2::rd_roclet`. Common omission is `@return`, which is required by CRAN for all exported functions.

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

**Expected:** All required tags for the function type are identified. Exported functions have `@param`, `@return`, `@examples`, and `@export` at minimum.

**On failure:** If a tag is unfamiliar, consult the [roxygen2 documentation](https://roxygen2.r-lib.org/articles/rd.html) for usage and syntax.

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

**Expected:** `R/data.R` contains roxygen blocks for each dataset with `@format` describing the structure and `@source` providing data provenance.

**On failure:** If `R CMD check` warns about undocumented datasets, ensure the quoted string (e.g., `"city_temperatures"`) exactly matches the object name saved with `usethis::use_data()`.

### Step 4: Document the Package

Create `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Expected:** `R/packagename-package.R` exists with `@keywords internal` and the `"_PACKAGE"` sentinel. Running `devtools::document()` generates `man/packagename-package.Rd`.

**On failure:** If `R CMD check` reports a missing package documentation page, verify the file is named `R/<packagename>-package.R` and contains the `"_PACKAGE"` string.

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

**Expected:** Special cases (S3 methods, inherited params, `.data` pronoun) are documented correctly. `@rdname` groups S3 methods together. `@inheritParams` reuses parameter docs without duplication.

**On failure:** If `R CMD check` warns about "no visible binding for global variable," add `#' @importFrom rlang .data` or use `utils::globalVariables()` as a last resort.

### Step 6: Generate Documentation

```r
devtools::document()
```

**Expected:** `man/` directory updated with `.Rd` files for each documented object. `NAMESPACE` regenerated with correct exports and imports.

**On failure:** Check for roxygen syntax errors. Common issues: unclosed brackets in `\describe{}`, missing `#'` prefix on a line, or invalid tag names. Run `devtools::document()` again after fixing.

## Validation

- [ ] Every exported function has `@param`, `@return`, and `@examples`
- [ ] `devtools::document()` runs without errors
- [ ] `devtools::check()` shows no documentation warnings
- [ ] `@family` tags group related functions correctly
- [ ] Examples run without errors (test with `devtools::run_examples()`)

## Common Pitfalls

- **Missing `@return`**: CRAN requires all exported functions to document their return value
- **Examples that need internet/auth**: Wrap in `\dontrun{}` with a comment explaining why
- **Slow examples**: Use `\donttest{}` for examples that work but take too long for CRAN
- **Markdown in roxygen**: Enable with `Roxygen: list(markdown = TRUE)` in DESCRIPTION
- **Forgetting to run `devtools::document()`**: Man pages are generated, not hand-written

## Related Skills

- `create-r-package` - initial package setup including roxygen configuration
- `write-testthat-tests` - test the functions you document
- `write-vignette` - long-form documentation beyond function reference
- `submit-to-cran` - documentation requirements for CRAN
