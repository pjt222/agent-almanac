---
name: write-roxygen-docs
locale: caveman-ultra
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

# Write Roxygen Docs

Complete roxygen2 docs → R fns, datasets, classes.

## Use When

- New exported fn → docs
- Internal helper fns
- Pkg datasets
- S3/S4/R6 classes + methods
- Fix doc-related `R CMD check` notes

## In

- **Required**: R fn|dataset|class to doc
- **Optional**: Related fns → cross-ref (`@family`, `@seealso`)
- **Optional**: Export fn?

## Do

### Step 1: Fn Docs

Roxygen comments directly above fn:

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

**Got:** Complete roxygen w/ title, desc, `@param` per param, `@return`, `@examples`, `@export`.

**If err:** Unsure tag → `?roxygen2::rd_roclet`. Common omission `@return` → CRAN required for all exports.

### Step 2: Essential Tags

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

**Got:** Required tags ID'd. Exports have `@param`, `@return`, `@examples`, `@export` minimum.

**If err:** Tag unfamiliar → [roxygen2 docs](https://roxygen2.r-lib.org/articles/rd.html) for usage + syntax.

### Step 3: Doc Datasets

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

**Got:** `R/data.R` has roxygen blocks per dataset w/ `@format` describing structure + `@source` for provenance.

**If err:** `R CMD check` warns undocumented dataset → ensure quoted string (`"city_temperatures"`) exactly matches obj name saved w/ `usethis::use_data()`.

### Step 4: Doc Pkg

Create `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Got:** `R/packagename-package.R` exists w/ `@keywords internal` + `"_PACKAGE"` sentinel. `devtools::document()` generates `man/packagename-package.Rd`.

**If err:** `R CMD check` reports missing pkg doc page → verify file `R/<packagename>-package.R` + contains `"_PACKAGE"`.

### Step 5: Special Cases

**Fns w/ dots in names** (S3 methods):

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**Reuse docs** w/ `@inheritParams`:

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**No visible binding fix** w/ `.data` pronoun:

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**Got:** Special cases (S3 methods, inherited params, `.data` pronoun) documented correctly. `@rdname` groups S3 methods. `@inheritParams` reuses params w/o duplicate.

**If err:** `R CMD check` warns "no visible binding for global variable" → `#' @importFrom rlang .data` or `utils::globalVariables()` last resort.

### Step 6: Generate Docs

```r
devtools::document()
```

**Got:** `man/` updated w/ `.Rd` files per documented obj. `NAMESPACE` regenerated w/ correct exports + imports.

**If err:** Roxygen syntax errs. Common: unclosed brackets in `\describe{}`, missing `#'` prefix, invalid tag names. Re-run `devtools::document()` after fix.

## Check

- [ ] Every exported fn has `@param`, `@return`, `@examples`
- [ ] `devtools::document()` runs no errs
- [ ] `devtools::check()` no doc warnings
- [ ] `@family` tags group correctly
- [ ] Examples run no errs (`devtools::run_examples()`)

## Traps

- **Missing `@return`**: CRAN requires all exports doc return value
- **Examples need internet/auth**: Wrap `\dontrun{}` w/ comment why
- **Slow examples**: `\donttest{}` for examples that work but slow for CRAN
- **Markdown in roxygen**: Enable `Roxygen: list(markdown = TRUE)` in DESCRIPTION
- **Forget `devtools::document()`**: Man pages generated, not hand-written

## →

- `create-r-package` — initial pkg setup including roxygen config
- `write-testthat-tests` — test fns you doc
- `write-vignette` — long-form docs beyond fn ref
- `submit-to-cran` — doc requirements for CRAN
