---
name: build-pkgdown-site
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build and deploy a pkgdown documentation site for an R package to
  GitHub Pages. Covers _pkgdown.yml configuration, theming, article
  organization, reference index customization, and deployment methods.
  Use when creating a documentation site for a new or existing package,
  customizing layout or navigation, fixing 404 errors on a deployed site,
  or migrating between branch-based and GitHub Actions deployment methods.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, pkgdown, documentation, github-pages, website
---

# Build pkgdown Site

Configure and deploy pkgdown documentation website for R package.

## When Use

- Creating documentation site for R package
- Customizing pkgdown layout, theme, navigation
- Fixing 404 errors on deployed pkgdown site
- Migrating between deployment methods

## Inputs

- **Required**: R package with roxygen2 documentation
- **Required**: GitHub repository
- **Optional**: Custom theme or branding
- **Optional**: Vignettes to include as articles

## Steps

### Step 1: Initialize pkgdown

```r
usethis::use_pkgdown()
```

Creates `_pkgdown.yml`, adds pkgdown to `.Rbuildignore`.

**Got:** `_pkgdown.yml` exists in project root. `.Rbuildignore` contains pkgdown-related entries.

**If fail:** Install pkgdown with `install.packages("pkgdown")`. `_pkgdown.yml` already exists? Function updates `.Rbuildignore` without overwriting config.

### Step 2: Configure `_pkgdown.yml`

```yaml
url: https://username.github.io/packagename/

development:
  mode: release

template:
  bootstrap: 5
  bootswatch: flatly

navbar:
  structure:
    left: [intro, reference, articles, news]
    right: [search, github]
  components:
    github:
      icon: fa-github
      href: https://github.com/username/packagename

reference:
  - title: Core Functions
    desc: Primary package functionality
    contents:
      - main_function
      - helper_function
  - title: Utilities
    desc: Helper and utility functions
    contents:
      - starts_with("util_")

articles:
  - title: Getting Started
    contents:
      - getting-started
  - title: Advanced Usage
    contents:
      - advanced-features
      - customization
```

**Critical**: Set `development: mode: release`. Default `mode: auto` causes 404 errors on GitHub Pages — appends `/dev/` to URLs.

**Got:** `_pkgdown.yml` contains valid YAML with `url`, `template`, `navbar`, `reference`, `articles` sections appropriate for package.

**If fail:** Validate YAML syntax with online YAML linter. Ensure all function names in `reference.contents` match actual exported functions.

### Step 3: Build Locally

```r
pkgdown::build_site()
```

**Got:** `docs/` directory created with complete site including `index.html`, function reference pages, articles.

**If fail:** Common issues: missing pandoc (set `RSTUDIO_PANDOC` in `.Renviron`), missing vignette dependencies (install suggested packages), broken examples (fix or wrap in `\dontrun{}`).

### Step 4: Preview Site

```r
pkgdown::preview_site()
```

Verify navigation, function reference, articles, search work correctly.

**Got:** Site opens in browser at localhost. All navigation links work, function reference pages render, search returns results.

**If fail:** Preview doesn't open? Manually open `docs/index.html` in browser. Pages missing? Check `devtools::document()` was run before building site.

### Step 5: Deploy to GitHub Pages

**Method A: GitHub Actions (Recommended)**

See `setup-github-actions-ci` skill for pkgdown workflow.

**Method B: Manual Branch Deployment**

```bash
# Build site
Rscript -e "pkgdown::build_site()"

# Create gh-pages branch if it doesn't exist
git checkout --orphan gh-pages
git rm -rf .
cp -r docs/* .
git add .
git commit -m "Deploy pkgdown site"
git push origin gh-pages

# Switch back to main
git checkout main
```

**Got:** `gh-pages` branch exists on remote with site files at root level.

**If fail:** Push rejected? Ensure you have write access to repository. Using GitHub Actions deployment instead? Skip this step, follow `setup-github-actions-ci` skill.

### Step 6: Configure GitHub Pages

1. Go to repository Settings > Pages
2. Set Source to "Deploy from a branch"
3. Select `gh-pages` branch, `/ (root)` folder
4. Save

**Got:** Site available at `https://username.github.io/packagename/` within a few minutes.

**If fail:** Site returns 404? Verify Pages source matches deployment method (branch deployment requires "Deploy from a branch"). Check `development: mode: release` set in `_pkgdown.yml`.

### Step 7: Add URL to DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**Got:** DESCRIPTION `URL` field contains both pkgdown site URL and GitHub repository URL, separated by comma.

**If fail:** `R CMD check` warns about invalid URLs? Verify pkgdown site actually deployed and accessible before adding URL.

## Checks

- [ ] Site builds locally without errors
- [ ] All function reference pages render correctly
- [ ] Articles/vignettes accessible and render properly
- [ ] Search functionality works
- [ ] Navigation links correct
- [ ] Site deploys successfully to GitHub Pages
- [ ] No 404 errors on deployed site
- [ ] `development: mode: release` set in `_pkgdown.yml`

## Pitfalls

- **404 errors after deployment**: Almost always caused by `development: mode: auto` (default). Change to `mode: release`.
- **Missing reference pages**: Functions must be exported and documented. Run `devtools::document()` first.
- **Broken vignette links**: Use `vignette("name")` syntax in cross-references, not file paths.
- **Logo not showing**: Place logo at `man/figures/logo.png`, reference in `_pkgdown.yml`.
- **Search not working**: Requires `url` field in `_pkgdown.yml` set correctly.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

## See Also

- `setup-github-actions-ci` - automated pkgdown deployment workflow
- `write-roxygen-docs` - function documentation appearing on site
- `write-vignette` - articles appearing in site navigation
- `release-package-version` - trigger site rebuild on release
