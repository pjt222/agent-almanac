---
name: create-r-package
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Scaffold a new R package with complete structure including DESCRIPTION,
  NAMESPACE, testthat, roxygen2, renv, Git, GitHub Actions CI, and
  development configuration files (.Rprofile, .Renviron.example, CLAUDE.md).
  Follows usethis conventions and tidyverse style. Use when starting a new R
  package from scratch, converting loose R scripts into a structured package,
  or setting up a package skeleton for collaborative development.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
---

# Create R Package

Scaffold full R pkg w/ modern tools + best practices.

## Use When

- New R pkg from scratch
- Loose R scripts → pkg
- Pkg skeleton for collab dev

## In

- **Required**: Pkg name (lowercase, no special except `.`)
- **Required**: 1-line desc
- **Optional**: License (def: MIT)
- **Optional**: Author (name, email, ORCID)
- **Optional**: Init renv (def: yes)

## Do

### Step 1: Skeleton

```r
usethis::create_package("packagename")
setwd("packagename")
```

**Got:** Dir w/ `DESCRIPTION`, `NAMESPACE`, `R/`, `man/`.

**If err:** Install usethis (`install.packages("usethis")`). Dir must not exist.

### Step 2: DESCRIPTION

Edit w/ accurate metadata:

```
Package: packagename
Title: What the Package Does (Title Case)
Version: 0.1.0
Authors@R:
    person("First", "Last", , "email@example.com", role = c("aut", "cre"),
           comment = c(ORCID = "0000-0000-0000-0000"))
Description: One paragraph describing what the package does. Must be more
    than one sentence. Avoid starting with "This package".
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.2
URL: https://github.com/username/packagename
BugReports: https://github.com/username/packagename/issues
```

**Got:** Valid DESCRIPTION, `R CMD check` no metadata warns.

**If err:** Warns → Title Case, Description >1 sentence, `Authors@R` valid `person()`.

### Step 3: Infra

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**Got:** LICENSE, README.md, NEWS.md, `tests/`, `.git/`, `.github/workflows/`.

**If err:** `use_*()` fail → install missing dep + rerun. `.git/` exists → `use_git()` skips.

### Step 4: Dev Config

`.Rprofile`:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

`.Renviron.example`:

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

`.Rbuildignore`:

```
^\.Rprofile$
^\.Renviron$
^\.Renviron\.example$
^renv$
^renv\.lock$
^CLAUDE\.md$
^\.github$
^.*\.Rproj$
```

**Got:** `.Rprofile`, `.Renviron.example`, `.Rbuildignore` created. Dev files excluded from build.

**If err:** `.Rprofile` startup err → check syntax. `requireNamespace()` guards → prevent fail on missing pkgs.

### Step 5: Init renv

```r
renv::init()
```

**Got:** `renv/` + `renv.lock`. Local lib active.

**If err:** Install renv (`install.packages("renv")`). Hang → check network / `options(timeout = 600)`.

### Step 6: Pkg Doc File

`R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Got:** File w/ `"_PACKAGE"` sentinel. `devtools::document()` → pkg-level help.

**If err:** Filename = `R/<packagename>-package.R`. `"_PACKAGE"` standalone, not in fn.

### Step 7: CLAUDE.md

Create `CLAUDE.md` in root w/ proj-specific instructions for AI.

**Got:** `CLAUDE.md` in root w/ conventions + build cmds + arch notes.

**If err:** Unsure → pkg name, 1-line desc, dev cmds (`devtools::check()`, `devtools::test()`), non-obvious conventions.

## Check

- [ ] `devtools::check()` → 0 err, 0 warn
- [ ] Struct matches layout
- [ ] `.Rprofile` loads no err
- [ ] `renv::status()` OK
- [ ] Git init + `.gitignore`
- [ ] GH Actions workflow present

## Traps

- **Name conflicts**: Check CRAN `available::available("packagename")` pre-commit
- **Missing .Rbuildignore**: Dev files (`.Rprofile`, `.Renviron`, `renv/`) must be excluded
- **Forgot Encoding**: Always `Encoding: UTF-8` in DESCRIPTION
- **RoxygenNote mismatch**: Ver in DESCRIPTION = installed roxygen2

## Examples

```r
# Minimal creation
usethis::create_package("myanalysis")

# Full setup in one session
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## →

- `write-roxygen-docs` — doc fns
- `write-testthat-tests` — add tests
- `setup-github-actions-ci` — CI/CD config
- `manage-renv-dependencies` — deps mgmt
- `write-claude-md` — AI instr
