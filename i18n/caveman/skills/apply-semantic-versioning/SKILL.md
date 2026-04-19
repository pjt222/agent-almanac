---
name: apply-semantic-versioning
locale: caveman
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

Determine and apply correct semantic version bump by analyzing changes since last release. This skill reads version files, classifies changes as breaking (major), feature (minor), or fix (patch), computes new version number, updates appropriate files. Follows [SemVer 2.0.0](https://semver.org/) specification.

## When Use

- Preparing new release and need to determine correct version number
- After merging set of changes and before tagging release
- Evaluating whether change constitutes breaking change
- Adding pre-release identifiers (alpha, beta, rc) to version
- Resolving disagreement about what version bump appropriate

## Inputs

- **Required**: Project root directory containing version file (DESCRIPTION, package.json, Cargo.toml, pyproject.toml, or VERSION)
- **Required**: Git history since last release (tag or commit)
- **Optional**: Commit convention in use (Conventional Commits, free-form)
- **Optional**: Pre-release label to apply (alpha, beta, rc)
- **Optional**: Previous version if not readable from files

## Steps

### Step 1: Read Current Version

Locate and read version file in project root.

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

Parse current version into major.minor.patch components. Version contains pre-release suffix (e.g., `1.2.0-beta.1`)? Note it separately.

**Got:** Current version identified as `MAJOR.MINOR.PATCH[-PRERELEASE]`.

**If fail:** No version file found? Check for VERSION file or git tags (`git describe --tags --abbrev=0`). No version exists at all? Start at `0.1.0` for initial development or `1.0.0` if project has stable public API.

### Step 2: Analyze Changes Since Last Release

Retrieve list of changes since last tagged release.

```bash
# Find the last version tag
git describe --tags --abbrev=0

# List commits since that tag
git log --oneline v1.2.3..HEAD

# If using Conventional Commits, filter by type
git log --oneline v1.2.3..HEAD | grep -E "^[a-f0-9]+ (feat|fix|BREAKING)"
```

No tags exist? Compare against initial commit or known baseline.

**Got:** List of commits with messages that can be classified by change type.

**If fail:** Git history unavailable or tags missing? Ask developer to describe changes manually. Classify based on their description.

### Step 3: Classify Changes

Apply SemVer classification rules:

| Change Type | Version Bump | Examples |
|---|---|---|
| **Breaking** (incompatible API change) | MAJOR | Renamed/removed public function, changed return type, removed parameter, changed default behavior |
| **Feature** (new backwards-compatible functionality) | MINOR | New exported function, new parameter with default, new file format support |
| **Fix** (backwards-compatible bug fix) | PATCH | Bug fix, documentation correction, performance improvement with same API |

Classification rules:
1. ANY change is breaking? Bump is MAJOR (resets minor and patch to 0)
2. No breaking changes but ANY new features? Bump is MINOR (resets patch to 0)
3. Only fixes? Bump is PATCH

Special cases:
- **Pre-1.0.0**: During initial development (`0.x.y`), minor bumps may contain breaking changes. Document clearly.
- **Deprecation**: Deprecating function is MINOR change (it still works). Removing it is MAJOR.
- **Internal changes**: Refactoring that does not change public API is PATCH.

**Got:** Each change classified as breaking/feature/fix, overall bump level determined.

**If fail:** Changes ambiguous? Err on side of higher bump. Conservative major bump better than minor bump that breaks downstream code.

### Step 4: Compute New Version

Apply bump to current version:

| Current | Bump | New Version |
|---|---|---|
| 1.2.3 | MAJOR | 2.0.0 |
| 1.2.3 | MINOR | 1.3.0 |
| 1.2.3 | PATCH | 1.2.4 |
| 0.9.5 | MINOR | 0.10.0 |
| 2.0.0-rc.1 | (release) | 2.0.0 |

Pre-release label requested?
- `1.3.0-alpha.1` for first alpha of upcoming 1.3.0
- `1.3.0-beta.1` for first beta
- `1.3.0-rc.1` for first release candidate

Pre-release precedence: `alpha < beta < rc < (release)`.

**Got:** New version number computed following SemVer rules.

**If fail:** Current version malformed or non-SemVer? Normalize first. Example: `1.2` becomes `1.2.0`.

### Step 5: Update Version Files

Write new version to appropriate file(s).

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

Project has multiple files that reference version (e.g., `_pkgdown.yml`, `CITATION`, `codemeta.json`)? Update all of them.

**Got:** All version files updated consistently to new version number.

**If fail:** File update fails? Revert all changes to maintain consistency. Never leave version files in partially updated state.

### Step 6: Create Version Tag

After committing version bump, create git tag.

```bash
# Annotated tag (preferred)
git tag -a v1.3.0 -m "Release v1.3.0"

# Lightweight tag (acceptable)
git tag v1.3.0
```

Use project's established tag format:
- `v1.3.0` (most common)
- `1.3.0` (no prefix)
- `package-name@1.3.0` (monorepo)

**Got:** Git tag created matching new version.

**If fail:** Tag already exists? Version was not properly bumped. Check for duplicate tags with `git tag -l "v1.3*"` and resolve before proceeding.

## Checks

- [ ] Current version read from correct version file
- [ ] All commits since last release analyzed
- [ ] Each change classified as breaking, feature, or fix
- [ ] Bump level matches highest-severity change (breaking > feature > fix)
- [ ] New version follows SemVer 2.0.0 format: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`
- [ ] All version files in project updated consistently
- [ ] No version was skipped (e.g., 1.2.3 to 1.4.0 without 1.3.0 being released)
- [ ] Git tag matches new version and project's tag format convention
- [ ] Pre-release suffix, if used, follows correct precedence (alpha < beta < rc)

## Pitfalls

- **Skipping minor versions**: Going from 1.2.3 directly to 1.4.0 because "we added two features." Each release gets one bump; number of features does not determine version.
- **Treating deprecation as breaking**: Deprecating function (adding warning) is minor change. Only removing it is breaking change.
- **Forgetting pre-1.0.0 rules**: Before 1.0.0, API considered unstable. Some projects bump minor for breaking changes during this phase, but should be documented.
- **Inconsistent version files**: Updating package.json but not package-lock.json, or updating DESCRIPTION but not CITATION. All version references must stay in sync.
- **Build metadata confusion**: Build metadata (`+build.123`) does not affect version precedence. `1.0.0+build.1` and `1.0.0+build.2` have same precedence.
- **Not tagging releases**: Without git tags, future version bumps cannot determine baseline for change analysis.

## See Also

- `manage-changelog` -- Maintain changelog entries that pair with version bumps
- `plan-release-cycle` -- Plan release milestones that determine when version bumps occur
- `release-package-version` -- R-specific release workflow that includes version bumping
- `commit-changes` -- Commit version bump with proper message
- `create-github-release` -- Create GitHub release from version tag
