---
name: manage-renv-dependencies
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage R pkg deps via renv → reproducible envs. Init, snapshot/restore
  workflow, troubleshoot common issues, CI/CD integration. Use init dep mgmt
  for new R project, add/update pkgs, restore env on new machine, troubleshoot
  restore fails, or integrate renv w/ CI/CD.
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

Setup + maintain reproducible R pkg envs via renv.

## Use When

- Init dep mgmt for new R project
- Add / update pkg deps
- Restore env on new machine
- Troubleshoot renv restore fails
- Integrate renv w/ CI/CD

## In

- **Req**: R project dir
- **Opt**: Existing `renv.lock` (for restore)
- **Opt**: GitHub PAT for private pkgs

## Do

### Step 1: Init renv

```r
renv::init()
```

Creates:
- `renv/` dir (library, settings, activation script)
- `renv.lock` (dep snapshot)
- Updates `.Rprofile` → activate renv on load

→ Project-local lib created. `renv/` dir + `renv.lock` present. `.Rprofile` updated w/ activation.

**If err:** Hangs → check network. Fails on specific pkg → install manually first w/ `install.packages()` + rerun `renv::init()`.

### Step 2: Add Deps

Install pkgs as usual:

```r
install.packages("dplyr")
renv::install("github-user/private-pkg")
```

Snapshot to record state:

```r
renv::snapshot()
```

→ `renv.lock` updated w/ new pkgs + vers. `renv::status()` shows no out-of-sync.

**If err:** Snapshot reports validation errs → `renv::dependencies()` to check which pkgs actually used → `renv::snapshot(force = TRUE)` to bypass validation.

### Step 3: Restore on Another Machine

```r
renv::restore()
```

→ All pkgs installed at exact vers in `renv.lock`.

**If err:** Common issues: GitHub pkgs fail (set `GITHUB_PAT` in `.Renviron`), sys deps missing (install w/ `apt-get` on Linux), timeouts on large pkgs (`options(timeout = 600)` before restore), or binaries not avail (renv compiles from source → ensure build tools installed).

### Step 4: Update Deps

```r
# Update a specific package
renv::update("dplyr")

# Update all packages
renv::update()

# Snapshot after updates
renv::snapshot()
```

→ Target pkgs updated to latest compatible vers. `renv.lock` reflects new vers after snapshot.

**If err:** Update fails for specific pkg → install directly w/ `renv::install("package@version")` + snapshot.

### Step 5: Check Status

```r
renv::status()
```

→ "No issues found" or clear list of out-of-sync pkgs w/ actionable guidance.

**If err:** Status reports pkgs used but not recorded → `renv::snapshot()`. Recorded but not installed → `renv::restore()`.

### Step 6: Config `.Rprofile` for Conditional Activation

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}
```

Ensures project works even if renv not installed (CI envs, collaborators).

→ R sessions activate renv auto when starting in project dir. Sessions w/o renv still start w/o errs.

**If err:** `.Rprofile` causes errs → ensure `file.exists()` guard present. Never call `source("renv/activate.R")` unconditionally.

### Step 7: Git Config

Track:

```
renv.lock           # Always commit
renv/activate.R     # Always commit
renv/settings.json  # Always commit
.Rprofile           # Commit (contains renv activation)
```

Ignore (already in renv's `.gitignore`):

```
renv/library/       # Machine-specific
renv/staging/       # Temporary
renv/cache/         # Machine-specific cache
```

→ `renv.lock`, `renv/activate.R`, `renv/settings.json` tracked by Git. Machine-specific dirs (`renv/library/`, `renv/cache/`) ignored.

**If err:** `renv/library/` accidentally committed → remove w/ `git rm -r --cached renv/library/` + add to `.gitignore`.

### Step 8: CI/CD Integration

GitHub Actions → renv cache action:

```yaml
- uses: r-lib/actions/setup-renv@v2
```

Automatically restores from `renv.lock` w/ caching.

→ CI pipeline restores pkgs from `renv.lock` w/ caching. Subsequent runs faster due to cached pkgs.

**If err:** CI restore fails → check `renv.lock` committed + up to date. Private GitHub pkgs → ensure `GITHUB_PAT` set as repo secret.

## Check

- [ ] `renv::status()` reports no issues
- [ ] `renv.lock` committed to VC
- [ ] `renv::restore()` works on clean checkout
- [ ] `.Rprofile` conditionally activates renv
- [ ] CI/CD uses `renv.lock` for dep resolution

## Traps

- **Run `renv::init()` in wrong dir**: Always verify `getwd()` first
- **Mix renv + sys library**: After init, only use project library
- **Forget to snapshot**: After installing, always `renv::snapshot()`
- **`--vanilla` flag**: `Rscript --vanilla` skips `.Rprofile` → renv won't activate
- **Large lock files in diffs**: Normal — `renv.lock` designed to be diffable JSON
- **Bioconductor pkgs**: Use `renv::install("bioc::PackageName")` + ensure BiocManager configured

## →

- `create-r-package` — includes renv init
- `setup-github-actions-ci` — CI integration w/ renv
- `submit-to-cran` — dep mgmt for CRAN pkgs
