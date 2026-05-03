---
name: write-vignette
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Create R package vignettes using R Markdown or Quarto. Covers
  vignette setup, YAML configuration, code chunk options, building
  and testing, CRAN requirements for vignettes. Use when adding
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

## When Use

- Adding "Getting Started" tutorial for package
- Documenting complex workflows that span multiple functions
- Creating domain-specific guides (e.g., statistical methodology)
- CRAN submission needs user-facing documentation beyond function help

## Inputs

- **Required**: R package with functions to document
- **Required**: Vignette title and topic
- **Optional**: Format (R Markdown or Quarto, default: R Markdown)
- **Optional**: Whether vignette needs external data or APIs

## Steps

### Step 1: Create Vignette File

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**Got:** `vignettes/getting-started.Rmd` created with YAML frontmatter. `knitr` and `rmarkdown` added to DESCRIPTION Suggests field. `vignettes/` directory exists.

**If err:** `usethis::use_vignette()` fails? Verify working directory is package root (contains `DESCRIPTION`). `knitr` not installed? Run `install.packages("knitr")` first. For manual creation, create `vignettes/` directory and file by hand. Ensure YAML frontmatter includes all three `%\Vignette*` entries.

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

**Got:** Vignette Rmd file contains Introduction, Installation, Basic Usage, Advanced Features, Conclusion sections. Code examples use package's exported functions and produce visible output.

**If err:** Examples fail to run? Verify package installed with `devtools::install()`. Ensure examples use package name in `library()` calls (not `devtools::load_all()`). For functions requiring external resources, use `eval=FALSE` to show code without execution.

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

**Got:** Setup chunk with `include=FALSE` sets global options (`collapse`, `comment`, `fig.width`, `fig.height`). Chunks configured appropriate: `eval=FALSE` for illustrative code, `echo=FALSE` for hidden setup, standard chunks for interactive examples.

**If err:** Chunk options not taking effect? Verify syntax uses `{r chunk-name, option=value}` format (comma-separated, no quotes around logical values). Check setup chunk runs first by placing at top of document.

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

**Got:** External dependencies handled gracefully — optional packages conditionally loaded with `requireNamespace()`, network-dependent code uses `eval=FALSE` or `tryCatch()`, expensive computations use pre-computed `.rds` files.

**If err:** Vignette fails on CRAN due to unavailable optional packages? Wrap those sections with conditional variable (e.g., `eval=has_suggested`). For pre-computed results, ensure `.rds` file included in `vignettes/` directory and referenced with relative path.

### Step 5: Build and Test Vignette

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

**Got:** Vignette builds without errors. HTML output readable.

**If err:**
- Missing pandoc: Set `RSTUDIO_PANDOC` in `.Renviron`
- Package not installed: Run `devtools::install()` first
- Missing Suggests: Install packages listed in DESCRIPTION Suggests

### Step 6: Verify in Package Check

```r
devtools::check()
```

Vignette-related checks: builds correctly, doesn't take too long, no errors.

**Got:** `devtools::check()` passes with no vignette-related errors or warnings. Vignette builds within CRAN time limits (typically under 60 seconds).

**If err:** Vignette causes check failures? Common fixes: add missing Suggests packages to DESCRIPTION, reduce build time with `eval=FALSE` on slow chunks, ensure `VignetteIndexEntry` matches title. Run `devtools::build_vignettes()` separately to isolate vignette-specific errors.

## Check

- [ ] Vignette builds without errors via `devtools::build_vignettes()`
- [ ] All code chunks execute correctly
- [ ] VignetteIndexEntry matches title
- [ ] `devtools::check()` passes with no vignette warnings
- [ ] Vignette appears in pkgdown site articles (if applicable)
- [ ] Build time reasonable (< 60 seconds for CRAN)

## Pitfalls

- **VignetteIndexEntry mismatch**: Index entry in YAML must match what you want users to see in `vignette(package = "pkg")`
- **Missing `vignette` YAML block**: All three `%\Vignette*` lines required
- **Vignette too slow for CRAN**: Pre-compute results or use `eval=FALSE` for expensive operations
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` environment variable set
- **Self-referencing package**: Use `library(packagename)` not `devtools::load_all()` in vignettes

## See Also

- `write-roxygen-docs` - function-level docs complement vignette tutorials
- `build-pkgdown-site` - vignettes appear as articles on pkgdown site
- `submit-to-cran` - CRAN has specific vignette requirements
- `create-quarto-report` - Quarto as alternative to R Markdown vignettes
