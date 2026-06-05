---
name: release-package-version
description: >
  Release a new version of an R package including version bumping,
  NEWS.md updates, git tagging, GitHub release creation, and
  post-release development version setup. Use when a package is ready
  for a new patch, minor, or major release, after CRAN acceptance to
  create the corresponding GitHub release, or when setting up the
  development version bump immediately after a release.
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

Execute the full version release cycle for an R package.

## When to Use

- Ready to release a new version (bug fix, feature, or breaking change)
- After CRAN acceptance, creating a corresponding GitHub release
- Setting up post-release development version

## Inputs

- **Required**: Package with changes ready for release
- **Required**: Release type: patch (0.1.0 -> 0.1.1), minor (0.1.0 -> 0.2.0), or major (0.1.0 -> 1.0.0)
- **Optional**: Whether to submit to CRAN (default: no, use `submit-to-cran` skill separately)

## Procedure

### Step 1: Determine Version Bump

Follow semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Bug fixes only | Patch | 0.1.0 -> 0.1.1 |
| New features (backward compatible) | Minor | 0.1.0 -> 0.2.0 |
| Breaking changes | Major | 0.1.0 -> 1.0.0 |

**Expected:** The correct bump type (patch, minor, or major) is determined based on the nature of changes since the last release.

**On failure:** If unsure, review `git log` since the last tag and classify each change. Any breaking API change requires a major bump.

### Step 2: Update Version

```r
usethis::use_version("minor")  # or "patch" or "major"
```

This updates the `Version` field in DESCRIPTION and adds a heading to NEWS.md.

**Expected:** DESCRIPTION version updated. NEWS.md has a new section header for the release version.

**On failure:** If `usethis::use_version()` is not available, manually update the `Version` field in DESCRIPTION and add a `# packagename x.y.z` heading to NEWS.md.

### Step 3: Update NEWS.md

Fill in the release notes under the new version heading:

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

**Expected:** NEWS.md contains a complete summary of user-facing changes organized by category, with issue/PR numbers for traceability.

**On failure:** If changes are hard to reconstruct, use `git log --oneline v<previous>..HEAD` to list all commits since the last release and categorize them.

### Step 4: Final Checks

```r
devtools::check()
devtools::spell_check()
urlchecker::url_check()
```

**Expected:** `devtools::check()` returns 0 errors, 0 warnings, and 0 notes. Spell check and URL check find no issues.

**On failure:** Fix all errors and warnings before releasing. Add false-positive words to `inst/WORDLIST` for the spell checker. Replace broken URLs.

### Step 5: Commit Release

```bash
git add DESCRIPTION NEWS.md
git commit -m "Release packagename v0.2.0"
```

**Expected:** A single commit containing the version bump in DESCRIPTION and the updated NEWS.md.

**On failure:** If other uncommitted changes are present, stage only DESCRIPTION and NEWS.md. Release commits should contain only version-related changes.

### Step 6: Tag the Release

```bash
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin main --tags
```

**Expected:** Annotated tag `v0.2.0` created and pushed to the remote. `git tag -l` shows the tag locally; `git ls-remote --tags origin` confirms it on the remote.

**On failure:** If push fails, check that you have write access. If the tag already exists, verify it points to the correct commit with `git show v0.2.0`.

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

**Expected:** GitHub release created with release notes visible on the repository's Releases page.

**On failure:** If `gh release create` fails, ensure the `gh` CLI is authenticated (`gh auth status`). If `usethis::use_github_release()` fails, create the release manually on GitHub.

### Step 8: Set Development Version

After release, bump to development version:

```r
usethis::use_dev_version()
```

This changes version to `0.2.0.9000` indicating development.

```bash
git add DESCRIPTION NEWS.md
git commit -m "Begin development for next version"
git push
```

**Expected:** DESCRIPTION version is now `0.2.0.9000` (development version). NEWS.md has a new heading for the development version. Changes are pushed to the remote.

**On failure:** If `usethis::use_dev_version()` is not available, manually change the version to `x.y.z.9000` in DESCRIPTION and add a `# packagename (development version)` heading to NEWS.md.

## Validation

- [ ] Version in DESCRIPTION matches intended release
- [ ] NEWS.md has complete, accurate release notes
- [ ] `R CMD check` passes
- [ ] Git tag matches version (e.g., `v0.2.0`)
- [ ] GitHub release exists with release notes
- [ ] Post-release development version set (x.y.z.9000)

## Common Pitfalls

- **Forgetting to push tags**: `git push` alone doesn't push tags. Use `--tags` or `git push origin v0.2.0`
- **NEWS.md format**: Use markdown headers matching the pkgdown/CRAN expected format
- **Tagging wrong commit**: Always tag after the version-bump commit, not before
- **CRAN version already exists**: CRAN won't accept a version that's already been published. Always increment.
- **Development version in release**: Never submit a `.9000` version to CRAN

## Related Skills

- `submit-to-cran` - CRAN submission after version release
- `create-github-release` - general GitHub release creation
- `setup-github-actions-ci` - triggers pkgdown rebuild on release
- `build-pkgdown-site` - documentation site reflects new version
