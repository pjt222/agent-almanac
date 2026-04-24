---
name: install-putior
locale: caveman-ultra
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

Install putior R pkg + optional deps → annotation-to-diagram pipeline ready.

## Use When

- First-time setup in project/env
- Prep machine for workflow viz
- Downstream skill (analyze-codebase-workflow, generate-workflow-diagram) needs it
- Restore after R ver upgrade / renv wipe

## In

- **Required**: R install (≥4.1.0)
- **Optional**: CRAN (default) or GitHub dev ver
- **Optional**: opt deps: MCP (`mcptools`, `ellmer`), interactive (`shiny`, `shinyAce`), logging (`logger`), ACP (`plumber2`)

## Do

### Step 1: Verify R install

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

→ R version printed, ≥4.1.0.

**If err:** install/upgrade R. Windows → https://cran.r-project.org/bin/windows/base/. Linux → `sudo apt install r-base`.

### Step 2: Install putior

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

→ Installs no errors. `library(putior)` loads silently.

**If err:** CRAN fails "not available for R ver" → use GitHub. GitHub fails → check `remotes` installed: `install.packages("remotes")`.

### Step 3: Optional deps

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

→ Each installs no errors.

**If err:** `mcptools` → `remotes` first. Linux system dep errs → install libs (e.g., `sudo apt install libcurl4-openssl-dev` for httr2).

### Step 4: Verify

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

→ Mermaid flowchart w/ `test` + `Hello putior`.

> **Key defaults**: All scan fns (`put()`, `put_auto()`, `put_generate()`, `put_merge()`) default `recursive = TRUE`, scan subdirs auto. Breaking change from pre-0.2.0 where default was FALSE. All accept `exclude` param for regex file filtering (e.g., `put("./src/", exclude = "test_")`).

If `shiny` installed → interactive sandbox:

```r
putior::run_sandbox()
```

Browser-based editor for PUT annotation syntax + real-time diagrams.

**If err:** `put` not found → pkg didn't install correctly. Reinstall `install.packages("putior", dependencies = TRUE)`. Empty diagram → verify temp file + annotation uses single quotes inside double.

## Check

- [ ] `library(putior)` loads no errors
- [ ] `packageVersion("putior")` valid version
- [ ] `put()` on valid PUT annotation → DF w/ 1 row
- [ ] `put_diagram()` → Mermaid starting `flowchart`
- [ ] All requested opt deps load no errors

## Traps

- **Wrong quote nesting**: PUT uses single quotes inside annotation: `id:'name'` not `id:"name"` (conflicts w/ comment string delim).
- **Missing Pandoc for vignettes**: build local → set `RSTUDIO_PANDOC` in `.Renviron`.
- **renv isolation**: renv project → install inside renv lib: `renv::install("putior")` not `install.packages()`.
- **GitHub rate limits**: `mcptools` from GitHub may fail w/o `GITHUB_PAT`. Set via `usethis::create_github_token()`.

## →

- `analyze-codebase-workflow` — next step post-install
- `configure-putior-mcp` — MCP server after opt deps
- `manage-renv-dependencies` — putior within renv env
- `configure-mcp-server` — general MCP config
