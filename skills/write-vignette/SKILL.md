---
name: write-vignette
description: >
  Create R package vignettes using R Markdown or Quarto. Covers
  vignette setup, YAML configuration, code chunk options, building
  and testing, and CRAN requirements for vignettes. Use when adding a
  Getting Started tutorial, documenting complex workflows spanning multiple
  functions, creating domain-specific guides, or when CRAN submission
  requires user-facing documentation beyond function help pages.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, vignette, rmarkdown, documentation, tutorial
---

# Write Vignette

Create long-form documentation vignettes for R packages.

## When to Use

- Adding a "Getting Started" tutorial for a package
- Documenting complex workflows that span multiple functions
- Creating domain-specific guides (e.g., statistical methodology)
- CRAN submission requires user-facing documentation beyond function help

## Inputs

- **Required**: R package with functions to document
- **Required**: Vignette title and topic
- **Optional**: Format (R Markdown or Quarto, default: R Markdown)
- **Optional**: Whether the vignette needs external data or APIs

## Procedure

### Step 1: Create Vignette File

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**Expected:** `vignettes/getting-started.Rmd` created with YAML frontmatter. `knitr` and `rmarkdown` added to DESCRIPTION Suggests field. The `vignettes/` directory exists.

**On failure:** If `usethis::use_vignette()` fails, verify the working directory is the package root (contains `DESCRIPTION`). If `knitr` is not installed, run `install.packages("knitr")` first. For manual creation, create the `vignettes/` directory and file by hand, ensuring the YAML frontmatter includes all three `%\Vignette*` entries.

### Step 2: Write Vignette Content

```markdown
---
title: "Getting Started with packagename"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Getting Started with packagename}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

## Introduction

Brief overview of what the package does and who it's for.

## Installation

```r
install.packages("packagename")
library(packagename)
```

## Basic Usage

Walk through the primary workflow:

```r
# Load example data
data <- example_data()

# Process
result <- main_function(data, option = "default")

# Inspect
summary(result)
```

## Advanced Features

Cover optional or advanced functionality.

## Conclusion

Summarize and point to other vignettes or resources.
```

**Expected:** The vignette Rmd file contains Introduction, Installation, Basic Usage, Advanced Features, and Conclusion sections. Code examples use the package's exported functions and produce visible output.

**On failure:** If examples fail to run, verify the package is installed with `devtools::install()`. Ensure examples use the package name in `library()` calls (not `devtools::load_all()`). For functions requiring external resources, use `eval=FALSE` to show code without execution.

### Step 3: Configure Code Chunks

Use chunk options for different purposes:

```r
# Standard evaluated chunk
{r example-basic}
result <- compute_something(1:10)
result

# Show code but don't run (for illustrative purposes)
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# Run but hide code (show only output)
{r hidden-setup, echo=FALSE}
library(packagename)

# Set global options
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

**Expected:** A setup chunk with `include=FALSE` sets global options (`collapse`, `comment`, `fig.width`, `fig.height`). Chunks are configured appropriately: `eval=FALSE` for illustrative code, `echo=FALSE` for hidden setup, and standard chunks for interactive examples.

**On failure:** If chunk options are not taking effect, verify the syntax uses `{r chunk-name, option=value}` format (comma-separated, no quotes around logical values). Check that the setup chunk runs first by placing it at the top of the document.

### Step 4: Handle External Dependencies

For vignettes that need network access or optional packages:

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

For long-running computations, pre-compute and save results:

```r
# Save pre-computed results to vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Load in vignette
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**Expected:** External dependencies are handled gracefully: optional packages are conditionally loaded with `requireNamespace()`, network-dependent code uses `eval=FALSE` or `tryCatch()`, and expensive computations use pre-computed `.rds` files.

**On failure:** If the vignette fails on CRAN due to unavailable optional packages, wrap those sections with a conditional variable (e.g., `eval=has_suggested`). For pre-computed results, ensure the `.rds` file is included in the `vignettes/` directory and referenced with a relative path.

### Step 5: Build and Test Vignette

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

**Expected:** Vignette builds without errors. HTML output is readable.

**On failure:**
- Missing pandoc: Set `RSTUDIO_PANDOC` in `.Renviron`
- Package not installed: Run `devtools::install()` first
- Missing Suggests: Install packages listed in DESCRIPTION Suggests

### Step 6: Verify in Package Check

```r
devtools::check()
```

Vignette-related checks: builds correctly, doesn't take too long, no errors.

**Expected:** `devtools::check()` passes with no vignette-related errors or warnings. The vignette builds within CRAN time limits (typically under 60 seconds).

**On failure:** If the vignette causes check failures, common fixes include: adding missing Suggests packages to DESCRIPTION, reducing build time with `eval=FALSE` on slow chunks, and ensuring `VignetteIndexEntry` matches the title. Run `devtools::build_vignettes()` separately to isolate vignette-specific errors.

## Validation

- [ ] Vignette builds without errors via `devtools::build_vignettes()`
- [ ] All code chunks execute correctly
- [ ] VignetteIndexEntry matches the title
- [ ] `devtools::check()` passes with no vignette warnings
- [ ] Vignette appears in pkgdown site articles (if applicable)
- [ ] Build time is reasonable (< 60 seconds for CRAN)

## Common Pitfalls

- **VignetteIndexEntry mismatch**: The index entry in YAML must match what you want users to see in `vignette(package = "pkg")`
- **Missing `vignette` YAML block**: All three `%\Vignette*` lines are required
- **Vignette too slow for CRAN**: Pre-compute results or use `eval=FALSE` for expensive operations
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` environment variable is set
- **Self-referencing package**: Use `library(packagename)` not `devtools::load_all()` in vignettes

## Related Skills

- `write-roxygen-docs` - function-level docs complement vignette tutorials
- `build-pkgdown-site` - vignettes appear as articles on pkgdown site
- `submit-to-cran` - CRAN has specific vignette requirements
- `create-quarto-report` - Quarto as an alternative to R Markdown vignettes
