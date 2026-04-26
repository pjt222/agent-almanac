---
name: release-package-version
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Release new version of R package: version bump, NEWS.md update, git
  tag, GitHub release, post-release dev version setup. Use when package
  ready for new patch, minor, or major release; after CRAN acceptance to
  create matching GitHub release; or when set up dev version bump right
  after release.
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

Execute full version release cycle for R package.

## When Use

- Ready to release new version (bug fix, feature, or breaking change)
- After CRAN acceptance, create matching GitHub release
- Set up post-release dev version

## Inputs

- **Required**: Package with changes ready for release
- **Required**: Release type: patch (0.1.0 -> 0.1.1), minor (0.1.0 -> 0.2.0), or major (0.1.0 -> 1.0.0)
- **Optional**: Whether to submit to CRAN (default: no, use `submit-to-cran` skill separately)

## Steps

### Step 1: Determine Version Bump

Follow semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fixes only | Patch | 0.1.0 -> 0.1.1 |
| New features (backward compatible) | Minor | 0.1.0 -> 0.2.0 |
| Breaking changes | Major | 0.1.0 -> 1.0.0 |

**Got:** Correct bump type (patch, minor, or major) determined based on nature of changes since last release.

**If fail:** Unsure? Review `git log` since last tag and classify each change. Any breaking API change needs major bump.

### Step 2: Update Version

```r
usethis::use_version("minor")  # or "patch" or "major"
```

This updates `Version` field in DESCRIPTION and adds heading to NEWS.md.

**Got:** DESCRIPTION version updated. NEWS.md has new section header for release version.

**If fail:** `usethis::use_version()` not available? Manually update `Version` field in DESCRIPTION. Add `# packagename x.y.z` heading to NEWS.md.

### Step 3: Update NEWS.md

Fill in release notes under new version heading:

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

Use issue/PR numbers for traceability.

**Got:** NEWS.md has complete summary of user-facing changes organized by category. Issue/PR numbers for traceability.

**If fail:** Changes hard to reconstruct? Use `git log --oneline v<previous>..HEAD` to list all commits since last release. Categorize them.

### Step 4: Final Checks

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**Got:** `devtools::check()` returns 0 errors, 0 warnings, 0 notes. Spell check and URL check find no issues.

**If fail:** Fix all errors and warnings before release. Add false-positive words to `inst/WORDLIST` for spell checker. Replace broken URLs.

### Step 5: Commit Release

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**Got:** Single commit containing version bump in DESCRIPTION and updated NEWS.md.

**If fail:** Other uncommitted changes present? Stage only DESCRIPTION and NEWS.md. Release commits should contain only version-related changes.

### Step 6: Tag the Release

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**Got:** Annotated tag `v0.2.0` created and pushed to remote. `git tag -l` shows tag locally; `git ls-remote --tags origin` confirms it on remote.

**If fail:** Push fails? Check write access. Tag already exists? Verify it points to correct commit with `git show v0.2.0`.

### Step 7: Create GitHub Release

```bash
gh release create v0.2.0 \
  --title "packagename v0.2.0" \
  --notes-file NEWS.md
```

Or use:

```r
usethis::use_github_release()
```

**Got:** GitHub release created. Release notes visible on repository Releases page.

**If fail:** `gh release create` fails? Ensure `gh` CLI authenticated (`gh auth status`). `usethis::use_github_release()` fails? Create release manually on GitHub.

### Step 8: Set Development Version

After release, bump to dev version:

```r
usethis::use_dev_version()
```

Changes version to `0.2.0.9000` indicating development.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**Got:** DESCRIPTION version now `0.2.0.9000` (dev version). NEWS.md has new heading for dev version. Changes pushed to remote.

**If fail:** `usethis::use_dev_version()` not available? Manually change version to `x.y.z.9000` in DESCRIPTION. Add `# packagename (development version)` heading to NEWS.md.

## Checks

- [ ] Version in DESCRIPTION matches intended release
- [ ] NEWS.md has complete, accurate release notes
- [ ] `R CMD check` passes
- [ ] Git tag matches version (e.g., `v0.2.0`)
- [ ] GitHub release exists with release notes
- [ ] Post-release dev version set (x.y.z.9000)

## Pitfalls

- **Forget push tags**: `git push` alone no push tags. Use `--tags` or `git push origin v0.2.0`
- **NEWS.md format**: Use markdown headers matching pkgdown/CRAN expected format
- **Tag wrong commit**: Always tag after version-bump commit, not before
- **CRAN version already exists**: CRAN no accept version already published. Always increment.
- **Dev version in release**: Never submit `.9000` version to CRAN

## See Also

- `submit-to-cran` - CRAN submission after version release
- `create-github-release` - general GitHub release creation
- `setup-github-actions-ci` - triggers pkgdown rebuild on release
- `build-pkgdown-site` - documentation site reflects new version
