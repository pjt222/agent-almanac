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

Configure and deploy a pkgdown documentation website for an R package.

## When to Use

- Creating a documentation site for an R package
- Customizing pkgdown layout, theme, or navigation
- Fixing 404 errors on a deployed pkgdown site
- Migrating between deployment methods

## Inputs

- **Required**: R package with roxygen2 documentation
- **Required**: GitHub repository
- **Optional**: Custom theme or branding
- **Optional**: Vignettes to include as articles

## Procedure

### Step 1: Initialize pkgdown

```r
usethis::use_pkgdown()
```

This creates `_pkgdown.yml` and adds pkgdown to `.Rbuildignore`.

**Expected:** `_pkgdown.yml` exists in the project root. `.Rbuildignore` contains pkgdown-related entries.

**On failure:** Install pkgdown with `install.packages("pkgdown")`. If `_pkgdown.yml` already exists, the function will update `.Rbuildignore` without overwriting the config.

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

**Critical**: Set `development: mode: release`. The default `mode: auto` causes 404 errors on GitHub Pages because it appends `/dev/` to URLs.

**Expected:** `_pkgdown.yml` contains valid YAML with `url`, `template`, `navbar`, `reference`, and `articles` sections appropriate for the package.

**On failure:** Validate YAML syntax with an online YAML linter. Ensure all function names in `reference.contents` match actual exported functions.

### Step 3: Build Locally

```r
pkgdown::build_site()
```

**Expected:** `docs/` directory created with a complete site including `index.html`, function reference pages, and articles.

**On failure:** Common issues: missing pandoc (set `RSTUDIO_PANDOC` in `.Renviron`), missing vignette dependencies (install suggested packages), or broken examples (fix or wrap in `\dontrun{}`).

### Step 4: Preview Site

```r
pkgdown::preview_site()
```

Verify navigation, function reference, articles, and search work correctly.

**Expected:** Site opens in the browser at localhost. All navigation links work, function reference pages render, and search returns results.

**On failure:** If the preview does not open, manually open `docs/index.html` in a browser. If pages are missing, check that `devtools::document()` was run before building the site.

### Step 5: Deploy to GitHub Pages

**Method A: GitHub Actions (Recommended)**

See `setup-github-actions-ci` skill for the pkgdown workflow.

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

**Expected:** The `gh-pages` branch exists on the remote with the site files at the root level.

**On failure:** If the push is rejected, ensure you have write access to the repository. If using GitHub Actions deployment instead, skip this step and follow the `setup-github-actions-ci` skill.

### Step 6: Configure GitHub Pages

1. Go to repository Settings > Pages
2. Set Source to "Deploy from a branch"
3. Select `gh-pages` branch, `/ (root)` folder
4. Save

**Expected:** Site available at `https://username.github.io/packagename/` within a few minutes.

**On failure:** If the site returns 404, verify the Pages source matches the deployment method (branch deployment requires "Deploy from a branch"). Check that `development: mode: release` is set in `_pkgdown.yml`.

### Step 7: Add URL to DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**Expected:** DESCRIPTION `URL` field contains both the pkgdown site URL and the GitHub repository URL, separated by a comma.

**On failure:** If `R CMD check` warns about invalid URLs, verify the pkgdown site is actually deployed and accessible before adding the URL.

## Validation

- [ ] Site builds locally without errors
- [ ] All function reference pages render correctly
- [ ] Articles/vignettes are accessible and render properly
- [ ] Search functionality works
- [ ] Navigation links are correct
- [ ] Site deploys successfully to GitHub Pages
- [ ] No 404 errors on the deployed site
- [ ] `development: mode: release` is set in `_pkgdown.yml`

## Common Pitfalls

- **404 errors after deployment**: Almost always caused by `development: mode: auto` (the default). Change to `mode: release`.
- **Missing reference pages**: Functions must be exported and documented. Run `devtools::document()` first.
- **Broken vignette links**: Use `vignette("name")` syntax in cross-references, not file paths.
- **Logo not showing**: Place logo at `man/figures/logo.png` and reference in `_pkgdown.yml`.
- **Search not working**: Requires `url` field in `_pkgdown.yml` to be set correctly.
- **Wrong R binary on hybrid systems**: On WSL or Docker, `Rscript` may resolve to a cross-platform wrapper instead of native R. Check with `which Rscript && Rscript --version`. Prefer the native R binary (e.g., `/usr/local/bin/Rscript` on Linux/WSL) for reliability. See [Setting Up Your Environment](../../guides/setting-up-your-environment.md) for R path configuration.

## Related Skills

- `setup-github-actions-ci` - automated pkgdown deployment workflow
- `write-roxygen-docs` - function documentation that appears on the site
- `write-vignette` - articles that appear in the site navigation
- `release-package-version` - trigger site rebuild on release
