---
name: manage-changelog
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Maintain a changelog following Keep a Changelog format. Covers
  entry categorization (Added, Changed, Deprecated, Removed, Fixed,
  Security), version section management, and unreleased tracking. Use when
  starting a new project that needs a changelog, adding entries after
  completing features or fixes, preparing a release by promoting Unreleased
  entries to a versioned section, or converting a free-form changelog to
  Keep a Changelog format.
license: MIT
allowed-tools: Read Write Edit Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: versioning
  complexity: basic
  language: multi
  tags: versioning, changelog, documentation, keep-a-changelog
---

# Manage Changelog

Maintain project changelog following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Covers creating new changelog, categorizing entries, managing `[Unreleased]` section, promoting entries to versioned sections upon release. Adapts to R convention (`NEWS.md`) when detected.

## When Use

- Starting new project needing changelog
- Adding entries after completing features, fixes, other changes
- Preparing release by moving Unreleased entries to versioned section
- Reviewing changelog completeness before publishing
- Converting free-form changelog to Keep a Changelog format

## Inputs

- **Required**: Project root directory
- **Required**: Description of changes to document (or git log to extract from)
- **Optional**: Target version number (for release promotion)
- **Optional**: Release date (defaults to today)
- **Optional**: Changelog format preference (Keep a Changelog or R NEWS.md)

## Steps

### Step 1: Locate or Create Changelog

Search for existing changelog in project root.

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

No changelog exists? Create one with standard header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

For R packages, use `NEWS.md` with R convention formatting:

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

**Got:** Changelog file located or created with proper header and Unreleased section.

**If fail:** Changelog exists in non-standard format? Do not overwrite. Note format difference, adapt entries to match existing style.

### Step 2: Parse Existing Entries

Read changelog, identify structure:

1. Header/preamble (project name, format description)
2. `[Unreleased]` section with pending changes
3. Versioned sections in reverse chronological order (`[1.2.0]` before `[1.1.0]`)
4. Comparison links at bottom (optional)

For each section, identify categories present:
- **Added** -- new features
- **Changed** -- changes in existing functionality
- **Deprecated** -- soon-to-be removed features
- **Removed** -- now removed features
- **Fixed** -- bug fixes
- **Security** -- vulnerability fixes

**Got:** Changelog structure understood. Existing entries inventoried.

**If fail:** Changelog malformed (missing sections, wrong order)? Note issues but do not restructure without confirmation. Add new entries correctly, flag structural issues for manual review.

### Step 3: Categorize New Changes

For each change to be documented, classify into one of six categories:

| Category | When to Use | Example Entry |
|---|---|---|
| Added | New feature or capability | `- Add CSV export for summary reports` |
| Changed | Modification to existing feature | `- Change default timeout from 30s to 60s` |
| Deprecated | Feature marked for future removal | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | Feature or capability removed | `- Remove legacy XML parser` |
| Fixed | Bug fix | `- Fix off-by-one error in pagination` |
| Security | Vulnerability fix | `- Fix SQL injection in user search (CVE-2026-1234)` |

Entry writing guidelines:
- Start each entry with verb in imperative mood (Add, Change, Fix, Remove)
- Be specific enough that user can understand impact without reading code
- Reference issue numbers or CVEs where applicable
- Keep entries to one line. Use sub-bullets only for complex changes

**Got:** Each change assigned to exactly one category with well-written entry.

**If fail:** Change spans multiple categories (e.g., both adds feature and fixes bug)? Create separate entries in each relevant category. Category unclear? Default to "Changed."

### Step 4: Add Entries to Unreleased Section

Insert categorized entries under `[Unreleased]` section. Maintain category order: Added, Changed, Deprecated, Removed, Fixed, Security.

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

Only add categories with entries. Do not include empty category headings.

**Got:** New entries added under `[Unreleased]` in correct categories, maintaining consistent formatting.

**If fail:** Unreleased section does not exist? Create immediately below header/preamble and above first versioned section.

### Step 5: Promote to Versioned Section on Release

When cutting release, move all Unreleased entries to new versioned section:

1. Create new section heading: `## [1.3.0] - 2026-02-17`
2. Move all entries from `[Unreleased]` to new section
3. Leave `[Unreleased]` empty (but keep heading)
4. Update comparison links at bottom of file

```markdown
## [Unreleased]

## [1.3.0] - 2026-02-17

### Added

- Add batch processing mode for large datasets

### Fixed

- Fix memory leak when processing files over 1GB

## [1.2.0] - 2026-01-15

### Added

- Add CSV export for summary reports
```

Update comparison links (if present at bottom):

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

For R `NEWS.md`, use R convention:

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

**Got:** Unreleased entries moved to dated versioned section. Unreleased section cleared. Comparison links updated.

**If fail:** Version number conflicts with existing section? Version was already released. Check with `apply-semantic-versioning` to determine correct version.

### Step 6: Validate Changelog Format

Verify changelog meets format requirements:

1. Versions in reverse chronological order (newest first)
2. Dates follow ISO 8601 format (YYYY-MM-DD)
3. Each versioned section has at least one categorized entry
4. No duplicate version sections
5. Comparison links (if present) match version sections

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

**Got:** Changelog passes all format checks with no warnings.

**If fail:** Fix any format issues found: reorder sections, correct date formats, remove duplicates. Report issues requiring human judgment (e.g., missing entries for known changes).

## Checks

- [ ] Changelog file exists with proper header referencing Keep a Changelog and SemVer
- [ ] `[Unreleased]` section exists at top (below header)
- [ ] All new entries categorized into Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] Entries start with imperative verb and describe user-facing impact
- [ ] Versioned sections in reverse chronological order
- [ ] Dates use ISO 8601 format (YYYY-MM-DD)
- [ ] No duplicate version sections exist
- [ ] Comparison links (if used) correct and up to date
- [ ] Empty categories not included (no heading without entries)

## Pitfalls

- **Internal-only entries**: "Refactored database module" not useful to users. Focus on user-facing changes. Internal refactors go in commit messages, not changelogs.
- **Vague entries**: "Various bug fixes" tells user nothing. Each fix should be specific, descriptive entry.
- **Forgetting Unreleased**: Adding entries directly to versioned section instead of Unreleased means changes documented as already released when not.
- **Wrong category**: "Fix" that actually adds new feature. Fix restores expected behavior. New capability is "Added" even if requested as bug report.
- **Missing Security entries**: Security fixes should always be documented with CVE identifiers when available. Users need to know if they should upgrade urgently.
- **Changelog drift**: Not updating changelog at time of change. Batch-writing entries before release → missed or poorly described changes. Write entries alongside code changes.

## See Also

- `apply-semantic-versioning` -- Determine version number that pairs with changelog entries
- `plan-release-cycle` -- Define when changelog entries get promoted to versioned sections
- `commit-changes` -- Commit changelog updates with proper messages
- `release-package-version` -- R-specific release workflow including NEWS.md updates
- `create-github-release` -- Use changelog content as GitHub release notes
