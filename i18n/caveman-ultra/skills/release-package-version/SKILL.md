---
name: release-package-version
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Release new R pkg ver → ver bump, NEWS.md updates, git tag, GitHub release,
  post-release dev ver setup. Use → ready for patch/minor/major, after CRAN
  accept → matching GH release, or set dev ver bump immediately after release.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, versioning, release, git-tags, changelog
---

# Release Package Version

Execute full ver release cycle for R pkg.

## Use When

- Ready to release new ver (bug fix, feature, breaking)
- After CRAN accept → matching GH release
- Set up post-release dev ver

## In

- **Required**: Pkg w/ changes ready
- **Required**: Release type: patch (0.1.0 → 0.1.1), minor (0.1.0 → 0.2.0), major (0.1.0 → 1.0.0)
- **Optional**: Submit to CRAN? (default no, use `submit-to-cran` separate)

## Do

### Step 1: Determine Bump

Follow semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fixes only | Patch | 0.1.0 -> 0.1.1 |
| New features (backward compatible) | Minor | 0.1.0 -> 0.2.0 |
| Breaking changes | Major | 0.1.0 -> 1.0.0 |

→ Correct bump (patch/minor/major) determined by changes since last release.

If err: unsure → review `git log` since last tag + classify each change. Any breaking API → major.

### Step 2: Update Ver

```r
usethis::use_version("minor")  # or "patch" or "major"
```

Updates `Version` in DESCRIPTION + adds heading to NEWS.md.

→ DESCRIPTION ver updated. NEWS.md has new section header for release ver.

If err: `usethis::use_version()` not available → manual update `Version` in DESCRIPTION + add `# packagename x.y.z` heading to NEWS.md.

### Step 3: Update NEWS.md

Fill release notes under new ver heading:

```markdown
# packagename 0.2.0

## New Features
- Added `new_function()` for processing data (#42)
- Support for custom themes in `plot_results()` (#45)

## Bug Fixes
- Fixed crash when input contains all NAs (#38)
- Corrected off-by-one error in `window_calc()` (#41)

## Minor Improvements
- Improved error messages for invalid input types
- Updated documentation examples
```

Use issue/PR numbers → traceability.

→ NEWS.md has complete summary of user-facing changes by category, w/ issue/PR numbers.

If err: changes hard reconstruct → `git log --oneline v<previous>..HEAD` lists all commits since last release + categorize.

### Step 4: Final Checks

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

→ `devtools::check()` returns 0 errors, 0 warnings, 0 notes. Spell + URL clean.

If err: fix all errs + warns before release. Add false-positives to `inst/WORDLIST`. Replace broken URLs.

### Step 5: Commit Release

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

→ Single commit w/ ver bump in DESCRIPTION + updated NEWS.md.

If err: other uncommitted changes → stage only DESCRIPTION + NEWS.md. Release commits = ver-related only.

### Step 6: Tag Release

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

→ Annotated tag `v0.2.0` created + pushed. `git tag -l` local; `git ls-remote --tags origin` confirms remote.

If err: push fails → check write access. Tag exists → verify points to correct commit `git show v0.2.0`.

### Step 7: GitHub Release

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

Or:

```r
usethis::use_github_release()
```

→ GH release created w/ notes visible on Releases page.

If err: `gh release create` fails → ensure `gh` auth (`gh auth status`). `usethis::use_github_release()` fails → create manual on GH.

### Step 8: Set Dev Ver

After release, bump to dev:

```r
usethis::use_dev_version()
```

Changes ver to `0.2.0.9000` → indicates dev.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

→ DESCRIPTION ver = `0.2.0.9000`. NEWS.md has new heading for dev ver. Pushed.

If err: `usethis::use_dev_version()` not available → manual change to `x.y.z.9000` in DESCRIPTION + add `# packagename (development version)` heading to NEWS.md.

## Check

- [ ] Ver in DESCRIPTION matches intended
- [ ] NEWS.md complete + accurate
- [ ] `R CMD check` passes
- [ ] Git tag matches ver (e.g. `v0.2.0`)
- [ ] GH release exists w/ notes
- [ ] Post-release dev ver set (x.y.z.9000)

## Traps

- **Forget push tags**: `git push` alone no push tags. Use `--tags` or `git push origin v0.2.0`
- **NEWS.md format**: Markdown headers matching pkgdown/CRAN format
- **Tag wrong commit**: Always tag after ver-bump commit, not before
- **CRAN ver already exists**: CRAN won't accept dup. Always increment.
- **Dev ver in release**: Never submit `.9000` to CRAN

## →

- `submit-to-cran` — CRAN submission after release
- `create-github-release` — general GH release creation
- `setup-github-actions-ci` — triggers pkgdown rebuild on release
- `build-pkgdown-site` — docs site reflects new ver
