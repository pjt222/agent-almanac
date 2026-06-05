---
name: manage-renv-dependencies
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

## When to Use

- Initializing dependency management for a new R project
- Adding or updating package dependencies
- Restoring a project environment on a new machine
- Troubleshooting renv restore failures
- Integrating renv with CI/CD pipelines

## Inputs

- **Required**: R project directory
- **Optional**: Existing `renv.lock` file (for restore)
- **Optional**: GitHub PAT for private packages

## Procedure

### Step 1: Initialize renv

```r
renv::init()
```

This creates:
- `renv/` directory (library, settings, activation script)
- `renv.lock` (dependency snapshot)
- Updates `.Rprofile` to activate renv on load

**Expected:** Project-local library created. `renv/` directory and `renv.lock` present. `.Rprofile` updated with activation script.

**On failure:** If it hangs, check network connectivity. If it fails on a specific package, install that package manually first with `install.packages()` and then rerun `renv::init()`.

### Step 2: Add Dependencies

Install packages as usual:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Then snapshot to record the state:

```r
renv::snapshot()
```

**Expected:** `renv.lock` updated with new packages and their versions. `renv::status()` shows no out-of-sync packages.

**On failure:** If `renv::snapshot()` reports validation errors, run `renv::dependencies()` to check which packages are actually used, then `renv::snapshot(force = TRUE)` to bypass validation.

### Step 3: Restore on Another Machine

```r
renv::restore()
```

**Expected:** All packages installed at the exact versions in `renv.lock`.

**On failure:** Common issues: GitHub packages fail (set `GITHUB_PAT` in `.Renviron`), system dependencies missing (install with `apt-get` on Linux), timeouts on large packages (set `options(timeout = 600)` before restore), or binaries not available (renv compiles from source; ensure build tools are installed).

### Step 4: Update Dependencies

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

**Expected:** Target packages are updated to their latest compatible versions. `renv.lock` reflects the new versions after snapshot.

**On failure:** If `renv::update()` fails for a specific package, try installing it directly with `renv::install("package@version")` and then snapshot.

### Step 5: Check Status

```r
renv::status()
```

**Expected:** "No issues found" or a clear list of out-of-sync packages with actionable guidance.

**On failure:** If status reports packages used but not recorded, run `renv::snapshot()`. If packages are recorded but not installed, run `renv::restore()`.

### Step 6: Configure `.Rprofile` for Conditional Activation

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

This ensures the project works even if renv isn't installed (CI environments, collaborators).

**Expected:** R sessions activate renv automatically when starting in the project directory. Sessions without renv installed still start without errors.

**On failure:** If `.Rprofile` causes errors, ensure the `file.exists()` guard is present. Never call `source("renv/activate.R")` unconditionally.

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

**Expected:** `renv.lock`, `renv/activate.R`, and `renv/settings.json` are tracked by Git. Machine-specific directories (`renv/library/`, `renv/cache/`) are ignored.

**On failure:** If `renv/library/` accidentally gets committed, remove it with `git rm -r --cached renv/library/` and add it to `.gitignore`.

### Step 8: CI/CD Integration

In GitHub Actions, use the renv cache action:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

This automatically restores from `renv.lock` with caching.

**Expected:** CI pipeline restores packages from `renv.lock` with caching enabled. Subsequent runs are faster due to cached packages.

**On failure:** If CI restore fails, check that `renv.lock` is committed and up to date. For private GitHub packages, ensure `GITHUB_PAT` is set as a repository secret.

## Validation

- [ ] `renv::status()` reports no issues
- [ ] `renv.lock` is committed to version control
- [ ] `renv::restore()` works on a clean checkout
- [ ] `.Rprofile` conditionally activates renv
- [ ] CI/CD uses `renv.lock` for dependency resolution

## Common Pitfalls

- **Running `renv::init()` in wrong directory**: Always verify `getwd()` first
- **Mixing renv and system library**: After `renv::init()`, only use the project library
- **Forgetting to snapshot**: After installing packages, always run `renv::snapshot()`
- **`--vanilla` flag**: `Rscript --vanilla` skips `.Rprofile`, so renv won't activate
- **Large lock files in diffs**: Normal — `renv.lock` is designed to be diffable JSON
- **Bioconductor packages**: Use `renv::install("bioc::PackageName")` and ensure BiocManager is configured

## Related Skills

- `create-r-package` - includes renv initialization
- `setup-github-actions-ci` - CI integration with renv
- `submit-to-cran` - dependency management for CRAN packages
