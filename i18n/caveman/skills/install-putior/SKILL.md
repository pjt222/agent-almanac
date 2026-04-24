---
name: install-putior
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Install putior R package + optional dependencies so annotation-to-diagram pipeline ready to use.

## When Use

- Setting up putior for first time in project or environment
- Preparing machine for workflow visualization tasks
- Downstream skill (analyze-codebase-workflow, generate-workflow-diagram) needs putior installed
- Restoring environment after R version upgrade or renv wipe

## Inputs

- **Required**: Access to R installation (>= 4.1.0)
- **Optional**: Install from CRAN (default) or GitHub dev version
- **Optional**: Which optional dependency groups to install: MCP (`mcptools`, `ellmer`), interactive (`shiny`, `shinyAce`), logging (`logger`), ACP (`plumber2`)

## Steps

### Step 1: Verify R Installation

Confirm R available + meets minimum version requirement.

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**Got:** R version string printed, >= 4.1.0.

**If fail:** Install or upgrade R. On Windows, download from https://cran.r-project.org/bin/windows/base/. On Linux, use `sudo apt install r-base`.

### Step 2: Install putior

Install from CRAN (stable) or GitHub (dev).

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**Got:** Package installs no errors. `library(putior)` loads silently.

**If fail:** CRAN installation fails with "not available for this version of R"? Use GitHub version. GitHub fails? Check `remotes` installed: `install.packages("remotes")`.

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

**Got:** Each package installs no errors.

**If fail:** `mcptools` → ensure `remotes` installed first. System dependency errors on Linux? Install required libraries (`sudo apt install libcurl4-openssl-dev` for httr2 dependency).

### Step 4: Verify Installation

Run basic pipeline to confirm everything works.

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

**Got:** Mermaid flowchart code printed to console containing `test` + `Hello putior`.

> **Key defaults**: All scan functions (`put()`, `put_auto()`, `put_generate()`, `put_merge()`) default to `recursive = TRUE`, scanning subdirectories automatic. Breaking change from pre-0.2.0 versions where default was `FALSE`. All scan functions also accept `exclude` parameter for regex-based file filtering (`put("./src/", exclude = "test_")`).

Optional `shiny` package installed? Try interactive sandbox:

```r
putior::run_sandbox()
```

Launches browser-based editor where you experiment with PUT annotation syntax + see diagrams rendered real time.

**If fail:** `put` not found? Package didn't install correctly. Reinstall with `install.packages("putior", dependencies = TRUE)`. Diagram empty? Verify temp file created + annotation syntax uses single quotes inside double quotes.

## Checks

- [ ] `library(putior)` loads no errors
- [ ] `packageVersion("putior")` returns valid version
- [ ] `put()` with file containing valid PUT annotation returns data frame with one row
- [ ] `put_diagram()` produces Mermaid code starting with `flowchart`
- [ ] All requested optional dependencies load no errors

## Pitfalls

- **Wrong quote nesting**: PUT annotations use single quotes inside annotation: `id:'name'`, not `id:"name"` (conflicts with comment string delimiter in some contexts).
- **Missing Pandoc for vignettes**: Plan to build putior vignettes locally? Ensure `RSTUDIO_PANDOC` set in `.Renviron`.
- **renv isolation**: Project uses renv? Must install putior inside renv library. Run `renv::install("putior")` not `install.packages("putior")`.
- **GitHub rate limits**: Installing `mcptools` from GitHub may fail without `GITHUB_PAT`. Set one via `usethis::create_github_token()`.

## See Also

- `analyze-codebase-workflow` — next step after installation to survey codebase
- `configure-putior-mcp` — set up MCP server after installing optional deps
- `manage-renv-dependencies` — manage putior within renv environment
- `configure-mcp-server` — general MCP server configuration
