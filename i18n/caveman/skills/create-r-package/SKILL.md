---
name: create-r-package
locale: caveman
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

Scaffold fully configured R package with modern tooling and best practices.

## When Use

- Starting new R package from scratch
- Converting loose R scripts into package
- Setting up package skeleton for collaborative development

## Inputs

- **Required**: Package name (lowercase, no special chars except `.`)
- **Required**: One-line description of package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Author info (name, email, ORCID)
- **Optional**: Whether to init renv (default: yes)

## Steps

### Step 1: Create Package Skeleton

```r
usethis::create_package("packagename")
setwd("packagename")
```

**Got:** Directory created with `DESCRIPTION`, `NAMESPACE`, `R/`, `man/` subdirectories.

**If fail:** Confirm usethis installed (`install.packages("usethis")`). Check directory does not already exist.

### Step 2: Configure DESCRIPTION

Edit `DESCRIPTION` with accurate metadata:

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

**Got:** Valid DESCRIPTION passing `R CMD check` with no metadata warnings.

**If fail:** `R CMD check` warns about DESCRIPTION fields? Verify `Title` in Title Case, `Description` more than one sentence, `Authors@R` uses valid `person()` syntax.

### Step 3: Set Up Infrastructure

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**Got:** LICENSE, README.md, NEWS.md, `tests/` directory, `.git/` initialized, `.github/workflows/` created.

**If fail:** Any `usethis::use_*()` function fails? Install missing dependency, rerun. `.git/` already exists? `use_git()` skips init.

### Step 4: Create Development Configuration

Create `.Rprofile`:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

Create `.Renviron.example`:

```
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

Create `.Rbuildignore` entries:

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

**Got:** `.Rprofile`, `.Renviron.example`, `.Rbuildignore` created. Development files dropped from built package.

**If fail:** `.Rprofile` causes startup errors? Check syntax. Confirm `requireNamespace()` guards stop failures when optional packages missing.

### Step 5: Initialize renv

```r
renv::init()
```

**Got:** `renv/` directory and `renv.lock` created. Project-local library active.

**If fail:** Install renv with `install.packages("renv")`. renv hangs during init? Check network. Set `options(timeout = 600)`.

### Step 6: Create Package Documentation File

Create `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Got:** `R/packagename-package.R` exists with `"_PACKAGE"` sentinel. Running `devtools::document()` generates package-level help.

**If fail:** Confirm filename matches pattern `R/<packagename>-package.R`. `"_PACKAGE"` string must be standalone expression, not inside function.

### Step 7: Create CLAUDE.md

Create `CLAUDE.md` in project root with project-specific instructions for AI assistants.

**Got:** `CLAUDE.md` exists in project root with project-specific editing conventions, build commands, architecture notes.

**If fail:** Unsure what to include? Start with package name, one-line description, common dev commands (`devtools::check()`, `devtools::test()`), any non-obvious conventions.

## Checks

- [ ] `devtools::check()` returns 0 errors, 0 warnings
- [ ] Package structure matches expected layout
- [ ] `.Rprofile` loads without errors
- [ ] `renv::status()` shows no issues
- [ ] Git repo initialized with right `.gitignore`
- [ ] GitHub Actions workflow file present

## Pitfalls

- **Package name conflicts**: Check CRAN with `available::available("packagename")` before committing to a name
- **Missing .Rbuildignore entries**: Development files (`.Rprofile`, `.Renviron`, `renv/`) must drop from built package
- **Forgetting Encoding**: Always include `Encoding: UTF-8` in DESCRIPTION
- **RoxygenNote mismatch**: Version in DESCRIPTION must match installed roxygen2

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

## See Also

- `write-roxygen-docs` - document functions you create
- `write-testthat-tests` - add tests for package
- `setup-github-actions-ci` - detailed CI/CD configuration
- `manage-renv-dependencies` - manage package dependencies
- `write-claude-md` - create effective AI assistant instructions
