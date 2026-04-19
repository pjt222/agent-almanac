---
name: install-putior
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Install and configure the putior R package for workflow visualization.
  Covers CRAN and GitHub installation, optional dependencies (mcptools,
  ellmer, shiny, shinyAce, logger, plumber2), and verification of the
  complete annotation-to-diagram pipeline. Use when setting up putior for
  the first time, preparing a machine for workflow visualization tasks, when
  a downstream skill requires putior to be installed, or restoring an
  environment after an R version upgrade or renv wipe.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: basic
  language: R
  tags: putior, install, workflow, mermaid, visualization, R
---

# Install putior

Install the putior R package and its optional dependencies so the annotation-to-diagram pipeline is ready to use.

## When to Use

- Setting up putior for the first time in a project or environment
- Preparing a machine for workflow visualization tasks
- A downstream skill (analyze-codebase-workflow, generate-workflow-diagram) requires putior to be installed
- Restoring an environment after an R version upgrade or renv wipe

## Inputs

- **Required**: Access to an R installation (>= 4.1.0)
- **Optional**: Whether to install from CRAN (default) or GitHub dev version
- **Optional**: Which optional dependency groups to install: MCP (`mcptools`, `ellmer`), interactive (`shiny`, `shinyAce`), logging (`logger`), ACP (`plumber2`)

## Procedure

### Step 1: Verify R Installation

Confirm R is available and meets the minimum version requirement.

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**Expected:** R version string printed, >= 4.1.0.

**On failure:** Install or upgrade R. On Windows, download from https://cran.r-project.org/bin/windows/base/. On Linux, use `sudo apt install r-base`.

### Step 2: Install putior

Install from CRAN (stable) or GitHub (dev).

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**Expected:** Package installs without errors. `library(putior)` loads silently.

**On failure:** If CRAN installation fails with "not available for this version of R", use the GitHub version. If GitHub fails, check that `remotes` is installed: `install.packages("remotes")`.

### Step 3: Install Optional Dependencies

Install optional packages based on required functionality.

```r
# MCP server integration (for AI assistant access)
remotes::install_github("posit-dev/mcptools")
install.packages("ellmer")

# Interactive sandbox
install.packages("shiny")
install.packages("shinyAce")

# Structured logging
install.packages("logger")

# ACP server (agent-to-agent communication)
install.packages("plumber2")
```

**Expected:** Each package installs without errors.

**On failure:** For `mcptools`, ensure `remotes` is installed first. For system dependency errors on Linux, install the required libraries (e.g., `sudo apt install libcurl4-openssl-dev` for httr2 dependency).

### Step 4: Verify Installation

Run the basic pipeline to confirm everything works.

```r
library(putior)

# Check package version
packageVersion("putior")

# Verify core functions are available
stopifnot(
  is.function(put),
  is.function(put_auto),
  is.function(put_diagram),
  is.function(put_generate),
  is.function(put_merge),
  is.function(put_theme)
)

# Test basic pipeline with a temp file
tmp <- tempfile(fileext = ".R")
writeLines("# put id:'test', label:'Hello putior'", tmp)
cat(put_diagram(put(tmp)))
```

**Expected:** Mermaid flowchart code printed to console containing `test` and `Hello putior`.

> **Key defaults**: All scan functions (`put()`, `put_auto()`, `put_generate()`, `put_merge()`) default to `recursive = TRUE`, scanning subdirectories automatically. This is a breaking change from pre-0.2.0 versions where the default was `FALSE`. All scan functions also accept an `exclude` parameter for regex-based file filtering (e.g., `put("./src/", exclude = "test_")`).

If the optional `shiny` package is installed, try the interactive sandbox:

```r
putior::run_sandbox()
```

This launches a browser-based editor where you can experiment with PUT annotation syntax and see diagrams rendered in real time.

**On failure:** If `put` is not found, the package did not install correctly. Reinstall with `install.packages("putior", dependencies = TRUE)`. If the diagram is empty, verify the temp file was created and the annotation syntax uses single quotes inside double quotes.

## Validation

- [ ] `library(putior)` loads without errors
- [ ] `packageVersion("putior")` returns a valid version
- [ ] `put()` with a file containing a valid PUT annotation returns a data frame with one row
- [ ] `put_diagram()` produces Mermaid code starting with `flowchart`
- [ ] All requested optional dependencies load without errors

## Common Pitfalls

- **Wrong quote nesting**: PUT annotations use single quotes inside the annotation: `id:'name'`, not `id:"name"` (which conflicts with the comment string delimiter in some contexts).
- **Missing Pandoc for vignettes**: If you plan to build putior's vignettes locally, ensure `RSTUDIO_PANDOC` is set in `.Renviron`.
- **renv isolation**: If the project uses renv, you must install putior inside the renv library. Run `renv::install("putior")` instead of `install.packages("putior")`.
- **GitHub rate limits**: Installing `mcptools` from GitHub may fail without a `GITHUB_PAT`. Set one via `usethis::create_github_token()`.

## Related Skills

- `analyze-codebase-workflow` — next step after installation to survey a codebase
- `configure-putior-mcp` — set up the MCP server after installing optional deps
- `manage-renv-dependencies` — manage putior within an renv environment
- `configure-mcp-server` — general MCP server configuration
