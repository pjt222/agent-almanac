---
name: write-vignette
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Long-form doc vignettes for R pkgs.

## Use When

- "Getting Started" tutorial for pkg
- Doc complex workflows across multi fns
- Domain-specific guides (stat methodology)
- CRAN submission requires user-facing docs beyond fn help

## In

- **Required**: R pkg w/ fns to doc
- **Required**: Vignette title + topic
- **Optional**: Format (R Markdown or Quarto, default: R Markdown)
- **Optional**: Vignette needs external data|APIs?

## Do

### Step 1: Vignette File

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**Got:** `vignettes/getting-started.Rmd` created w/ YAML frontmatter. `knitr` + `rmarkdown` added to DESCRIPTION Suggests. `vignettes/` dir exists.

**If err:** `usethis::use_vignette()` fails → verify cwd is pkg root (contains `DESCRIPTION`). `knitr` not installed → `install.packages("knitr")` first. Manual: create `vignettes/` dir + file by hand, ensure YAML has all 3 `%\Vignette*` entries.

### Step 2: Content

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

**Got:** Vignette Rmd has Intro, Install, Basic Usage, Advanced, Conclusion. Code uses pkg's exported fns + produces visible out.

**If err:** Examples fail to run → verify pkg installed `devtools::install()`. Examples use pkg name in `library()` (not `devtools::load_all()`). Fns requiring external resources → `eval=FALSE` to show w/o exec.

### Step 3: Code Chunks

Per chunk options:

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

**Got:** Setup chunk w/ `include=FALSE` sets global opts (`collapse`, `comment`, `fig.width`, `fig.height`). Chunks configured: `eval=FALSE` for illustrative, `echo=FALSE` for hidden setup, std for interactive examples.

**If err:** Chunk opts not taking effect → verify syntax `{r chunk-name, option=value}` (comma-separated, no quotes around logicals). Setup chunk runs first → place at top.

### Step 4: External Deps

Vignettes needing net access|optional pkgs:

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

Long-running computations → pre-compute + save:

```r
# Save pre-computed results to vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Load in vignette
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**Got:** External deps handled gracefully: optional pkgs conditional via `requireNamespace()`, net-dep code uses `eval=FALSE`|`tryCatch()`, expensive computations use pre-computed `.rds`.

**If err:** Vignette fails on CRAN due to unavail optional pkgs → wrap w/ conditional var (`eval=has_suggested`). Pre-computed → ensure `.rds` in `vignettes/` + ref'd via relative path.

### Step 5: Build + Test

```r
# Build single vignette
devtools::build_vignettes()

# Build and check (catches vignette issues)
devtools::check()
```

**Got:** Vignette builds no errs. HTML out readable.

**If err:**
- Missing pandoc: Set `RSTUDIO_PANDOC` in `.Renviron`
- Pkg not installed: `devtools::install()` first
- Missing Suggests: Install pkgs in DESCRIPTION Suggests

### Step 6: Verify in Pkg Check

```r
devtools::check()
```

Vignette-related checks: builds correctly, doesn't take too long, no errs.

**Got:** `devtools::check()` passes no vignette-related errs|warnings. Vignette builds within CRAN time limits (typically < 60 sec).

**If err:** Vignette causes check failures → common fixes: add missing Suggests to DESCRIPTION, reduce build time w/ `eval=FALSE` on slow chunks, ensure `VignetteIndexEntry` matches title. Run `devtools::build_vignettes()` separately to isolate.

## Check

- [ ] Vignette builds no errs via `devtools::build_vignettes()`
- [ ] All code chunks exec correctly
- [ ] VignetteIndexEntry matches title
- [ ] `devtools::check()` passes no vignette warnings
- [ ] Vignette appears in pkgdown site articles (if applicable)
- [ ] Build time reasonable (< 60 sec for CRAN)

## Traps

- **VignetteIndexEntry mismatch**: Index entry in YAML must match what users see in `vignette(package = "pkg")`
- **Missing `vignette` YAML block**: All 3 `%\Vignette*` lines required
- **Vignette too slow for CRAN**: Pre-compute results or `eval=FALSE` for expensive ops
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` env var set
- **Self-referencing pkg**: `library(packagename)` not `devtools::load_all()` in vignettes

## →

- `write-roxygen-docs` — fn-level docs complement vignette tutorials
- `build-pkgdown-site` — vignettes appear as articles on pkgdown
- `submit-to-cran` — CRAN has specific vignette reqs
- `create-quarto-report` — Quarto as alt to R Markdown vignettes
