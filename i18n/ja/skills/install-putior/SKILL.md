---
name: install-putior
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
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Putiorのインストール

Install the putior R package and its optional dependencies so the annotation-to-diagram pipeline is ready to use.

## 使用タイミング

- Setting up putior for the first time in a project or environment
- Preparing a machine for workflow visualization tasks
- A downstream skill (analyze-codebase-workflow, generate-workflow-diagram) requires putior to be installed
- Restoring an environment after an R version upgrade or renv wipe

## 入力

- **必須**: Access to an R installation (>= 4.1.0)
- **任意**: Whether to install from CRAN (default) or GitHub dev version
- **任意**: Which optional dependency groups to install: MCP (`mcptools`, `ellmer`), interactive (`shiny`, `shinyAce`), logging (`logger`), ACP (`plumber2`)

## 手順

### ステップ1: Verify R Installation

Confirm R is available and meets the minimum version requirement.

```r
R.Version()$version.string
# Must be >= 4.1.0
```

```bash
# From WSL with Windows R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**期待結果:** R version string printed, >= 4.1.0.

**失敗時:** Install or upgrade R. On Windows, download from https://cran.r-project.org/bin/windows/base/. On Linux, use `sudo apt install r-base`.

### ステップ2: Install putior

Install from CRAN (stable) or GitHub (dev).

```r
# CRAN (recommended)
install.packages("putior")

# GitHub dev version (if latest features needed)
remotes::install_github("pjt222/putior")
```

**期待結果:** Package installs without errors. `library(putior)` loads silently.

**失敗時:** If CRAN installation fails with "not available for this version of R", use the GitHub version. If GitHub fails, check that `remotes` is installed: `install.packages("remotes")`.

### ステップ3: Install Optional Dependencies

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

**期待結果:** Each package installs without errors.

**失敗時:** For `mcptools`, ensure `remotes` is installed first. For system dependency errors on Linux, install the required libraries (e.g., `sudo apt install libcurl4-openssl-dev` for httr2 dependency).

### ステップ4: Verify Installation

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

**期待結果:** Mermaid flowchart code printed to console containing `test` and `Hello putior`.

**失敗時:** If `put` is not found, the package did not install correctly. Reinstall with `install.packages("putior", dependencies = TRUE)`. If the diagram is empty, verify the temp file was created and the annotation syntax uses single quotes inside double quotes.

## バリデーション

- [ ] `library(putior)` loads without errors
- [ ] `packageVersion("putior")` returns a valid version
- [ ] `put()` with a file containing a valid PUT annotation returns a data frame with one row
- [ ] `put_diagram()` produces Mermaid code starting with `flowchart`
- [ ] All requested optional dependencies load without errors

## よくある落とし穴

- **Wrong quote nesting**: PUT annotations use single quotes inside the annotation: `id:'name'`, not `id:"name"` (which conflicts with the comment string delimiter in some contexts).
- **Missing Pandoc for vignettes**: If you plan to build putior's vignettes locally, ensure `RSTUDIO_PANDOC` is set in `.Renviron`.
- **renv isolation**: If the project uses renv, you must install putior inside the renv library. Run `renv::install("putior")` instead of `install.packages("putior")`.
- **GitHub rate limits**: Installing `mcptools` from GitHub may fail without a `GITHUB_PAT`. Set one via `usethis::create_github_token()`.

## 関連スキル

- `analyze-codebase-workflow` — next step after installation to survey a codebase
- `configure-putior-mcp` — set up the MCP server after installing optional deps
- `manage-renv-dependencies` — manage putior within an renv environment
- `configure-mcp-server` — general MCP server configuration
