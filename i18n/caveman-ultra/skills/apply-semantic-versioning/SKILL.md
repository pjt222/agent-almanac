---
name: apply-semantic-versioning
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Apply semantic versioning (SemVer 2.0.0) to determine the correct
  version bump based on change analysis. Covers major/minor/patch
  classification, pre-release identifiers, build metadata, and
  breaking change detection. Use when preparing a new release to determine
  the correct version number, after merging changes before tagging, evaluating
  whether a change constitutes a breaking change, adding pre-release identifiers,
  or resolving disagreement about what version bump is appropriate.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: intermediate
  language: multi
  tags: versioning, semver, version-bump, breaking-changes
---

# Apply Semantic Versioning

Determine + apply correct ver bump via changes since last release. Read ver files, classify changes breaking (major)/feature (minor)/fix (patch), compute new ver, update files. [SemVer 2.0.0](https://semver.org/).

## Use When

- Prepare new release → correct ver num
- After merging, before tagging
- Eval change = breaking?
- Add pre-release (alpha, beta, rc)
- Resolve disagreement about ver bump

## In

- **Required**: Project root w/ ver file (DESCRIPTION, package.json, Cargo.toml, pyproject.toml, VERSION)
- **Required**: Git history since last release (tag or commit)
- **Optional**: Commit convention (Conventional Commits, free-form)
- **Optional**: Pre-release label (alpha, beta, rc)
- **Optional**: Previous ver if not readable

## Do

### Step 1: Read Current Ver

Locate + read ver file in project root.

```bash
# R packages
grep "^Version:" DESCRIPTION

# Node.js
grep '"version"' package.json

# Rust
grep '^version' Cargo.toml

# Python
grep 'version' pyproject.toml

# Plain file
cat VERSION
```

Parse → major.minor.patch. Pre-release suffix (e.g., `1.2.0-beta.1`) → note separately.

**→** Current ver = `MAJOR.MINOR.PATCH[-PRERELEASE]`.

**If err:** No ver file → check VERSION file or git tags (`git describe --tags --abbrev=0`). No ver → start `0.1.0` initial dev or `1.0.0` if stable public API.

### Step 2: Analyze Changes

Changes since last tagged release.

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

No tags → compare against initial commit or known baseline.

**→** List of commits w/ msgs classifiable by change type.

**If err:** Git history unavail or tags missing → ask dev describe changes manually. Classify per desc.

### Step 3: Classify Changes

Apply SemVer rules:

| Change Type | Bump | Examples |
|---|---|---|
| **Breaking** (incompatible API change) | MAJOR | Renamed/removed public fn, changed return type, removed param, changed default behavior |
| **Feature** (new backwards-compat) | MINOR | New exported fn, new param w/ default, new file format support |
| **Fix** (backwards-compat bug fix) | PATCH | Bug fix, doc correction, perf w/ same API |

Rules:
1. ANY breaking → MAJOR (resets minor + patch to 0)
2. No breaking + ANY features → MINOR (resets patch to 0)
3. Only fixes → PATCH

Special:
- **Pre-1.0.0**: During initial dev (`0.x.y`), minor bumps may contain breaking changes. Doc clearly.
- **Deprecation**: Deprecating a fn → MINOR (still works). Removing → MAJOR.
- **Internal changes**: Refactoring no public API change → PATCH.

**→** Each change classified breaking/feature/fix + overall bump level.

**If err:** Ambiguous → err on side of higher bump. Conservative major > minor breaking downstream.

### Step 4: Compute New Ver

Apply bump to current:

| Current | Bump | New Version |
|---|---|---|
| 1.2.3 | MAJOR | 2.0.0 |
| 1.2.3 | MINOR | 1.3.0 |
| 1.2.3 | PATCH | 1.2.4 |
| 0.9.5 | MINOR | 0.10.0 |
| 2.0.0-rc.1 | (release) | 2.0.0 |

Pre-release label requested:
- `1.3.0-alpha.1` first alpha of upcoming 1.3.0
- `1.3.0-beta.1` first beta
- `1.3.0-rc.1` first release candidate

Pre-release precedence: `alpha < beta < rc < (release)`.

**→** New ver num per SemVer rules.

**If err:** Current ver malformed or non-SemVer → normalize first. `1.2` → `1.2.0`.

### Step 5: Update Ver Files

Write new ver to file(s).

```r
# R: Update DESCRIPTION
# Change "Version: 1.2.3" to "Version: 1.3.0"
```

```json
// Node.js: Update package.json
// Change "version": "1.2.3" to "version": "1.3.0"
// Also update package-lock.json if present
```

```toml
# Rust: Update Cargo.toml
# Change version = "1.2.3" to version = "1.3.0"
```

Multi files ref ver (`_pkgdown.yml`, `CITATION`, `codemeta.json`) → update all.

**→** All ver files updated consistently → new ver.

**If err:** File update fails → revert all → maintain consistency. Never partially updated state.

### Step 6: Create Ver Tag

After committing ver bump, create git tag.

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

Project's tag format:
- `v1.3.0` (most common)
- `1.3.0` (no prefix)
- `package-name@1.3.0` (monorepo)

**→** Git tag matching new ver.

**If err:** Tag exists → ver not properly bumped. Check duplicate tags `git tag -l "v1.3*"` + resolve.

## Check

- [ ] Current ver read from correct file
- [ ] All commits since last release analyzed
- [ ] Each change classified breaking/feature/fix
- [ ] Bump matches highest-severity (breaking > feature > fix)
- [ ] New ver SemVer 2.0.0: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] All ver files updated consistently
- [ ] No ver skipped (1.2.3 → 1.4.0 no 1.3.0 released)
- [ ] Git tag matches new ver + project's format
- [ ] Pre-release suffix follows correct precedence (alpha < beta < rc)

## Traps

- **Skip minor versions**: 1.2.3 directly → 1.4.0 because "2 features." Each release = 1 bump; num features no determine ver.
- **Treat deprecation as breaking**: Deprecating (adding warn) = minor. Only removing = breaking.
- **Forget pre-1.0.0**: Before 1.0.0 API unstable. Some projects bump minor for breaking during this phase, but doc.
- **Inconsistent ver files**: Update package.json not package-lock.json, or DESCRIPTION not CITATION. All refs sync.
- **Build metadata confusion**: Build metadata (`+build.123`) no affect ver precedence. `1.0.0+build.1` + `1.0.0+build.2` same precedence.
- **Not tagging releases**: No git tags → future ver bumps can't determine baseline for change analysis.

## →

- `manage-changelog` — maintain changelog entries pair w/ ver bumps
- `plan-release-cycle` — plan release milestones → ver bumps
- `release-package-version` — R-specific release workflow includes ver bumping
- `commit-changes` — commit ver bump w/ proper msg
- `create-github-release` — create GitHub release from ver tag
