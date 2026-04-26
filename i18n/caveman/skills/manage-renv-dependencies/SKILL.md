---
name: manage-renv-dependencies
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage R package dependencies using renv for reproducible environments.
  Covers initialization, snapshot/restore workflow, troubleshooting
  common issues, and CI/CD integration. Use when initializing dependency
  management for a new R project, adding or updating packages, restoring
  an environment on a new machine, troubleshooting restore failures, or
  integrating renv with CI/CD pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, renv, dependencies, reproducibility, lockfile
---

# Manage renv Dependencies

Set up and maintain reproducible R package environments using renv.

## When Use

- Initializing dependency management for new R project
- Adding or updating package dependencies
- Restoring project environment on new machine
- Troubleshooting renv restore failures
- Integrating renv with CI/CD pipelines

## Inputs

- **Required**: R project directory
- **Optional**: Existing `renv.lock` file (for restore)
- **Optional**: GitHub PAT for private packages

## Steps

### Step 1: Initialize renv

```r
renv::init()
```

This creates:
- `renv/` directory (library, settings, activation script)
- `renv.lock` (dependency snapshot)
- Updates `.Rprofile` to activate renv on load

**Got:** Project-local library created. `renv/` directory and `renv.lock` present. `.Rprofile` updated with activation script.

**If fail:** Hangs? Check network connectivity. Fails on specific package? Install that package manually first with `install.packages()` then rerun `renv::init()`.

### Step 2: Add Dependencies

Install packages as usual:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Then snapshot to record state:

```r
renv::snapshot()
```

**Got:** `renv.lock` updated with new packages and versions. `renv::status()` shows no out-of-sync packages.

**If fail:** `renv::snapshot()` reports validation errors? Run `renv::dependencies()` to check which packages actually used, then `renv::snapshot(force = TRUE)` to bypass validation.

### Step 3: Restore on Another Machine

```r
renv::restore()
```

**Got:** All packages installed at exact versions in `renv.lock`.

**If fail:** Common issues: GitHub packages fail (set `GITHUB_PAT` in `.Renviron`), system dependencies missing (install with `apt-get` on Linux), timeouts on large packages (set `options(timeout = 600)` before restore), binaries not available (renv compiles from source. Ensure build tools installed).

### Step 4: Update Dependencies

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

**Got:** Target packages updated to latest compatible versions. `renv.lock` reflects new versions after snapshot.

**If fail:** `renv::update()` fails for specific package? Try installing directly with `renv::install("package@version")` then snapshot.

### Step 5: Check Status

```r
renv::status()
```

**Got:** "No issues found" or clear list of out-of-sync packages with actionable guidance.

**If fail:** Status reports packages used but not recorded? Run `renv::snapshot()`. Packages recorded but not installed? Run `renv::restore()`.

### Step 6: Configure `.Rprofile` for Conditional Activation

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

Ensures project works even if renv isn't installed (CI environments, collaborators).

**Got:** R sessions activate renv automatically when starting in project directory. Sessions without renv installed still start without errors.

**If fail:** `.Rprofile` causes errors? Ensure `file.exists()` guard present. Never call `source("renv/activate.R")` unconditionally.

### Step 7: Git Configuration

Track these files:

```
renv.lock           # Always commit
renv/activate.R     # Always commit
renv/settings.json  # Always commit
.Rprofile           # Commit (contains renv activation)
```

Ignore these (already in renv's `.gitignore`):

```
renv/library/       # Machine-specific
renv/staging/       # Temporary
renv/cache/         # Machine-specific cache
```

**Got:** `renv.lock`, `renv/activate.R`, `renv/settings.json` tracked by Git. Machine-specific directories (`renv/library/`, `renv/cache/`) ignored.

**If fail:** `renv/library/` accidentally gets committed? Remove with `git rm -r --cached renv/library/` and add to `.gitignore`.

### Step 8: CI/CD Integration

In GitHub Actions, use renv cache action:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

Automatically restores from `renv.lock` with caching.

**Got:** CI pipeline restores packages from `renv.lock` with caching enabled. Subsequent runs faster due to cached packages.

**If fail:** CI restore fails? Check `renv.lock` is committed and up to date. For private GitHub packages, ensure `GITHUB_PAT` set as repository secret.

## Checks

- [ ] `renv::status()` reports no issues
- [ ] `renv.lock` committed to version control
- [ ] `renv::restore()` works on clean checkout
- [ ] `.Rprofile` conditionally activates renv
- [ ] CI/CD uses `renv.lock` for dependency resolution

## Pitfalls

- **Running `renv::init()` in wrong directory**: Always verify `getwd()` first
- **Mixing renv and system library**: After `renv::init()`, only use project library
- **Forgetting to snapshot**: After installing packages, always run `renv::snapshot()`
- **`--vanilla` flag**: `Rscript --vanilla` skips `.Rprofile`, so renv won't activate
- **Large lock files in diffs**: Normal — `renv.lock` designed to be diffable JSON
- **Bioconductor packages**: Use `renv::install("bioc::PackageName")` and ensure BiocManager configured

## See Also

- `create-r-package` - includes renv initialization
- `setup-github-actions-ci` - CI integration with renv
- `submit-to-cran` - dependency management for CRAN packages
