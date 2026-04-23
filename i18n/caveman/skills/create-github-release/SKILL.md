---
name: create-github-release
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a GitHub release with proper tagging, release notes,
  and optional build artifacts. Covers semantic versioning,
  changelog generation, and GitHub CLI usage. Use when marking a stable
  version of software for distribution, publishing a new library or
  application version, creating release notes for stakeholders, or
  distributing build artifacts (binaries, tarballs).
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: github, release, git-tags, changelog, versioning
---

# Create GitHub Release

Create tagged GitHub release with release notes and optional artifacts.

## When Use

- Marking stable software version for distribution
- Publishing new version of library or app
- Creating release notes for stakeholders
- Distributing build artifacts (binaries, tarballs)

## Inputs

- **Required**: Version number (semantic versioning)
- **Required**: Summary of changes since last release
- **Optional**: Build artifacts to attach
- **Optional**: Whether this is a pre-release

## Steps

### Step 1: Determine Version Number

Follow semantic versioning (`MAJOR.MINOR.PATCH`):

| Change | Example | When |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | Breaking changes |
| MINOR | 1.0.0 -> 1.1.0 | New features, backward compatible |
| PATCH | 1.0.0 -> 1.0.1 | Bug fixes only |

**Got:** Version number chosen reflects scope of changes since last release.

**If fail:** Unsure if changes are breaking? Review public API diff. Any removal or signature change of exported function → breaking change needing MAJOR bump.

### Step 2: Update Version in Project Files

- `DESCRIPTION` (R packages)
- `package.json` (Node.js)
- `Cargo.toml` (Rust)
- `pyproject.toml` (Python)

**Got:** Version number updated in right project file and committed to version control.

**If fail:** Version already updated in earlier step (e.g., via `usethis::use_version()` in R)? Verify matches intended release version.

### Step 3: Write Release Notes

Create or update changelog. Organize by category:

```markdown
## What's Changed

### New Features
- Added user authentication (#42)
- Support for custom themes (#45)

### Bug Fixes
- Fixed crash on empty input (#38)
- Corrected date parsing in UTC (#41)

### Improvements
- Improved error messages
- Updated dependencies

### Breaking Changes
- `old_function()` renamed to `new_function()` (#50)

**Full Changelog**: https://github.com/user/repo/compare/v1.0.0...v1.1.0
```

**Got:** Release notes organized by category (features, fixes, breaking changes) with issue/PR references for traceability.

**If fail:** Changes hard to categorize? Review `git log v1.0.0..HEAD --oneline` to rebuild list of changes since last release.

### Step 4: Create Git Tag

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**Got:** Annotated tag `v1.1.0` exists locally and on remote. `git tag -l` shows tag.

**If fail:** Tag already exists? Delete with `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` and recreate. Push rejected? Confirm write access to remote.

### Step 5: Create GitHub Release

**Using GitHub CLI (recommended)**:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

With artifacts:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes "Release notes here" \
  build/app-v1.1.0.tar.gz \
  build/app-v1.1.0.zip
```

Pre-release:

```bash
gh release create v2.0.0-beta.1 \
  --title "v2.0.0 Beta 1" \
  --prerelease \
  --notes "Beta release for testing"
```

**Got:** Release visible on GitHub with tag, notes, attached artifacts (if any).

**If fail:** `gh` not authenticated? Run `gh auth login`. Tag does not exist on remote? Push it first with `git push origin v1.1.0`.

### Step 6: Auto-Generate Release Notes

GitHub can auto-generate notes from merged PRs:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

Configure categories in `.github/release.yml`:

```yaml
changelog:
  categories:
    - title: New Features
      labels:
        - enhancement
    - title: Bug Fixes
      labels:
        - bug
    - title: Documentation
      labels:
        - documentation
    - title: Other Changes
      labels:
        - "*"
```

**Got:** Release notes auto-generated from merged PR titles, categorized by label. `.github/release.yml` controls categories.

**If fail:** Auto-generated notes empty? Confirm PRs were merged (not closed) and had labels. Write notes by hand as fallback.

### Step 7: Verify Release

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**Got:** `gh release list` shows new release. `gh release view` displays right title, tag, notes, assets.

**If fail:** Release missing? Check Actions tab for release workflows that may have failed. Verify tag exists with `git tag -l`.

## Checks

- [ ] Version tag follows semantic versioning
- [ ] Git tag points to right commit
- [ ] Release notes accurately describe changes
- [ ] Artifacts (if any) attached and downloadable
- [ ] Release visible on GitHub repo page
- [ ] Pre-release flag set correctly

## Pitfalls

- **Tagging wrong commit**: Always verify `git log` before tagging. Tag after version-bump commit.
- **Forgetting to push tags**: `git push` doesn't push tags. Use `git push --tags` or `git push origin v1.1.0`.
- **Inconsistent version format**: Pick `v1.0.0` vs `1.0.0` and stick with it.
- **Empty release notes**: Always give meaningful notes. Users need to know what changed.
- **Deleting and recreating tags**: Dodge changing tags after push. If needed, create new version instead.

## See Also

- `commit-changes` - staging and committing workflow
- `manage-git-branches` - branch management for release prep
- `release-package-version` - R-specific release workflow
- `configure-git-repository` - Git setup prerequisite
- `setup-github-actions-ci` - automate releases via CI
