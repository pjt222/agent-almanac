---
name: build-pkgdown-site
locale: caveman-ultra
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

Config + deploy pkgdown doc site for R pkg.

## Use When

- Doc site for R pkg
- Customize pkgdown layout, theme, nav
- Fix 404s on deployed pkgdown site
- Migrate between deploy methods

## In

- **Required**: R pkg w/ roxygen2 docs
- **Required**: GitHub repo
- **Optional**: Custom theme/branding
- **Optional**: Vignettes to include as articles

## Do

### Step 1: Init pkgdown

```r
usethis::use_pkgdown()
```

Creates `_pkgdown.yml` + adds pkgdown to `.Rbuildignore`.

**→** `_pkgdown.yml` in project root. `.Rbuildignore` has pkgdown entries.

**If err:** Install pkgdown via `install.packages("pkgdown")`. `_pkgdown.yml` already exists → fn updates `.Rbuildignore` w/o overwriting config.

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

**Critical**: Set `development: mode: release`. Default `mode: auto` causes 404s on GitHub Pages (appends `/dev/` to URLs).

**→** `_pkgdown.yml` valid YAML w/ `url`, `template`, `navbar`, `reference`, `articles` appropriate for pkg.

**If err:** Validate YAML syntax w/ online linter. All fn names in `reference.contents` match actual exported fns.

### Step 3: Build Locally

```r
pkgdown::build_site()
```

**→** `docs/` dir created w/ complete site incl `index.html`, fn ref pages, articles.

**If err:** Common issues: missing pandoc (set `RSTUDIO_PANDOC` in `.Renviron`), missing vignette deps (install suggested pkgs), broken examples (fix or wrap in `\dontrun{}`).

### Step 4: Preview

```r
pkgdown::preview_site()
```

Verify nav, fn ref, articles, search work.

**→** Site opens in browser at localhost. Nav links work, ref pages render, search returns results.

**If err:** Preview doesn't open → manually open `docs/index.html`. Pages missing → check `devtools::document()` ran before build.

### Step 5: Deploy to GitHub Pages

**Method A: GitHub Actions (Recommended)**

See `setup-github-actions-ci` skill for pkgdown workflow.

**Method B: Manual Branch Deploy**

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

**→** `gh-pages` branch on remote w/ site files at root.

**If err:** Push rejected → ensure write access. Using GitHub Actions instead → skip + follow `setup-github-actions-ci`.

### Step 6: Configure GitHub Pages

1. Repo Settings > Pages
2. Source: "Deploy from a branch"
3. Select `gh-pages` branch, `/ (root)` folder
4. Save

**→** Site available at `https://username.github.io/packagename/` within min.

**If err:** 404 → verify Pages source matches deploy method (branch deploy needs "Deploy from a branch"). Check `development: mode: release` in `_pkgdown.yml`.

### Step 7: Add URL to DESCRIPTION

```
URL: https://username.github.io/packagename/, https://github.com/username/packagename
```

**→** DESCRIPTION `URL` has pkgdown site URL + GitHub repo URL, comma-separated.

**If err:** `R CMD check` warns invalid URLs → verify pkgdown site actually deployed + accessible before adding.

## Check

- [ ] Builds locally w/o errs
- [ ] All fn ref pages render
- [ ] Articles/vignettes accessible + render
- [ ] Search works
- [ ] Nav links correct
- [ ] Deploys to GitHub Pages
- [ ] No 404s
- [ ] `development: mode: release` set

## Traps

- **404 after deploy**: Almost always `development: mode: auto` (default). → `mode: release`
- **Missing ref pages**: Fns must be exported + documented. Run `devtools::document()` first
- **Broken vignette links**: Use `vignette("name")` syntax for cross-refs, not file paths
- **Logo not showing**: Place at `man/figures/logo.png`, ref in `_pkgdown.yml`
- **Search not working**: Needs `url` field in `_pkgdown.yml` set correctly
- **Wrong R binary hybrid sys**: WSL/Docker → `Rscript` may resolve to cross-platform wrapper vs native. Check `which Rscript && Rscript --version`. Prefer native (e.g., `/usr/local/bin/Rscript` on Linux/WSL). See [Setting Up Your Environment](../../guides/setting-up-your-environment.md)

## →

- `setup-github-actions-ci` — automated pkgdown deploy workflow
- `write-roxygen-docs` — fn docs that appear on site
- `write-vignette` — articles in site nav
- `release-package-version` — trigger rebuild on release
