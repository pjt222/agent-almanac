---
name: create-github-release
locale: caveman-ultra
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

Tag + notes + artifacts → GitHub release.

## Use When

- Mark stable ver for distrib
- Publish lib/app ver
- Release notes for stakeholders
- Distrib artifacts (bins, tarballs)

## In

- **Required**: Ver # (semver)
- **Required**: Changes summary
- **Optional**: Build artifacts
- **Optional**: Pre-release flag

## Do

### Step 1: Ver #

Semver (`MAJOR.MINOR.PATCH`):

| Change | Example | When |
|--------|---------|------|
| MAJOR | 1.0.0 -> 2.0.0 | Breaking |
| MINOR | 1.0.0 -> 1.1.0 | New feat, backward compat |
| PATCH | 1.0.0 -> 1.0.1 | Bug fix only |

**Got:** Ver matches change scope.

**If err:** Doubt breaking → review public API diff. Any removal / signature change of exported fn → breaking → MAJOR.

### Step 2: Ver in Project Files

- `DESCRIPTION` (R pkgs)
- `package.json` (Node)
- `Cargo.toml` (Rust)
- `pyproject.toml` (Python)

**Got:** Ver updated + committed.

**If err:** Already updated (`usethis::use_version()`) → verify match.

### Step 3: Notes

Changelog by cat:

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

**Got:** Notes by cat (feat/fix/breaking) + issue/PR refs.

**If err:** Hard to categorize → `git log v1.0.0..HEAD --oneline` → reconstruct.

### Step 4: Tag

```bash
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

**Got:** Tag local + remote. `git tag -l` shows.

**If err:** Tag exists → `git tag -d v1.1.0 && git push origin :refs/tags/v1.1.0` + recreate. Push rejected → check write access.

### Step 5: Release

**`gh` CLI (rec)**:

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --notes-file CHANGELOG.md
```

Artifacts:

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

**Got:** Release on GitHub w/ tag + notes + artifacts.

**If err:** `gh` not auth → `gh auth login`. Tag not on remote → `git push origin v1.1.0`.

### Step 6: Auto-Gen Notes

```bash
gh release create v1.1.0 \
  --title "v1.1.0" \
  --generate-notes
```

Cats in `.github/release.yml`:

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

**Got:** Notes from merged PR titles by label. `.github/release.yml` → cats.

**If err:** Empty notes → PRs merged (not closed) + labels. Manual fallback.

### Step 7: Verify

```bash
# List releases
gh release list

# View specific release
gh release view v1.1.0
```

**Got:** List shows. View shows correct title/tag/notes/assets.

**If err:** Missing → check Actions workflows. Verify tag: `git tag -l`.

## Check

- [ ] Ver tag = semver
- [ ] Tag = correct commit
- [ ] Notes accurate
- [ ] Artifacts attached + downloadable
- [ ] Release visible on repo page
- [ ] Pre-release flag correct

## Traps

- **Wrong commit tag**: Verify `git log` pre-tag. Tag after ver-bump commit.
- **No push tags**: `git push` doesn't. Use `git push --tags` / `git push origin v1.1.0`.
- **Ver fmt inconsist**: `v1.0.0` vs `1.0.0` → pick + stick.
- **Empty notes**: Always meaningful. Users need "what changed".
- **Delete+recreate tags**: Avoid. Create new ver instead.

## →

- `commit-changes` — stage + commit
- `manage-git-branches` — branch mgmt for release prep
- `release-package-version` — R-specific
- `configure-git-repository` — git setup
- `setup-github-actions-ci` — auto releases via CI
