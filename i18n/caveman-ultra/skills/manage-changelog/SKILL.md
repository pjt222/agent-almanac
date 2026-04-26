---
name: manage-changelog
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Maintain changelog per Keep a Changelog. Entry categorization (Added,
  Changed, Deprecated, Removed, Fixed, Security), version section mgmt,
  Unreleased tracking. Use starting new project needing changelog, adding
  entries after features/fixes, prepping release by promoting Unreleased →
  versioned section, or converting free-form → Keep a Changelog format.
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

Maintain project changelog per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Create new, categorize entries, manage `[Unreleased]`, promote to versioned on release. Adapts R convention (`NEWS.md`) when detected.

## Use When

- Start new project needing changelog
- Add entries after features / fixes / other changes
- Prep release → move Unreleased → versioned section
- Review completeness before publish
- Convert free-form → Keep a Changelog format

## In

- **Req**: Project root dir
- **Req**: Change description (or git log to extract from)
- **Opt**: Target version # (release promotion)
- **Opt**: Release date (default today)
- **Opt**: Format pref (Keep a Changelog / R NEWS.md)

## Do

### Step 1: Locate / Create Changelog

Search existing changelog in project root.

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

None exists → create w/ std header:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
```

R pkgs → use `NEWS.md` w/ R convention:

```markdown
# packagename (development version)

## New features

## Bug fixes

## Minor improvements and fixes
```

→ Changelog located / created w/ proper header + Unreleased section.

**If err:** Exists in non-std format → don't overwrite. Note format diff + adapt entries to match existing style.

### Step 2: Parse Existing Entries

Read + ID structure:

1. Header/preamble (project name, format desc)
2. `[Unreleased]` w/ pending changes
3. Versioned in reverse chron order (`[1.2.0]` before `[1.1.0]`)
4. Comparison links at bottom (opt)

Per section → ID categories:
- **Added** — new features
- **Changed** — changes in existing fn
- **Deprecated** — soon-to-be removed
- **Removed** — now removed
- **Fixed** — bug fixes
- **Security** — vulnerability fixes

→ Structure understood, existing entries inventoried.

**If err:** Malformed (missing sections, wrong order) → note issues, don't restructure w/o confirmation. Add new correctly + flag structural issues for manual review.

### Step 3: Categorize New Changes

Per change → classify into 1 of 6:

| Category | When to Use | Example Entry |
|---|---|---|
| Added | New feature or capability | `- Add CSV export for summary reports` |
| Changed | Modification to existing feature | `- Change default timeout from 30s to 60s` |
| Deprecated | Feature marked for future removal | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | Feature or capability removed | `- Remove legacy XML parser` |
| Fixed | Bug fix | `- Fix off-by-one error in pagination` |
| Security | Vulnerability fix | `- Fix SQL injection in user search (CVE-2026-1234)` |

Entry writing guidelines:
- Start w/ imperative verb (Add, Change, Fix, Remove)
- Specific enough user understands impact w/o reading code
- Ref issue #s / CVEs where applicable
- One line; sub-bullets only for complex changes

→ Each change in exactly one category w/ well-written entry.

**If err:** Change spans multi categories (feature + bug fix) → separate entries per category. Unclear → default "Changed".

### Step 4: Add Entries to Unreleased

Insert under `[Unreleased]`. Maintain category order: Added, Changed, Deprecated, Removed, Fixed, Security.

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

Only add categories w/ entries; don't include empty category headings.

→ New entries added under `[Unreleased]` in correct categories, consistent formatting.

**If err:** Unreleased section missing → create immediately below header/preamble + above first versioned section.

### Step 5: Promote to Versioned on Release

Release cut → move Unreleased → new versioned section:

1. New heading: `## [1.3.0] - 2026-02-17`
2. Move all entries from `[Unreleased]` → new section
3. Leave `[Unreleased]` empty (keep heading)
4. Update comparison links at bottom

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

Update comparison links (if present):

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

R `NEWS.md` → use R convention:

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

→ Unreleased entries moved to dated versioned section; Unreleased cleared; comparison links updated.

**If err:** Version # conflicts w/ existing → already released. Check `apply-semantic-versioning` for correct version.

### Step 6: Validate Format

Verify meets format requirements:

1. Versions in reverse chron (newest first)
2. Dates ISO 8601 (YYYY-MM-DD)
3. Each versioned has ≥1 categorized entry
4. No dup version sections
5. Comparison links match version sections

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

→ Passes all format checks w/ no warnings.

**If err:** Fix format issues: reorder, correct dates, remove dups. Report issues requiring human judgment (missing entries for known changes).

## Check

- [ ] File exists w/ proper header ref Keep a Changelog + SemVer
- [ ] `[Unreleased]` at top (below header)
- [ ] All new entries categorized into Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] Entries start w/ imperative verb + describe user-facing impact
- [ ] Versioned sections reverse chron
- [ ] Dates ISO 8601 (YYYY-MM-DD)
- [ ] No dup version sections
- [ ] Comparison links (if used) correct + up to date
- [ ] Empty categories not included (no heading w/o entries)

## Traps

- **Internal-only entries**: "Refactored DB module" not useful to users. Focus on user-facing. Internal refactors → commit msgs, not changelogs.
- **Vague entries**: "Various bug fixes" tells user nothing. Each fix → specific descriptive entry.
- **Forget Unreleased**: Adding directly to versioned = changes documented as released when not.
- **Wrong category**: "Fix" actually adds feature. Fix restores expected behavior; new capability = "Added" even if requested as bug report.
- **Missing Security**: Security fixes always documented w/ CVE ids when avail. Users need to know if should upgrade urgently.
- **Changelog drift**: Not updating at time of change. Batch-writing before release → missed / poorly described changes. Write entries alongside code changes.

## →

- `apply-semantic-versioning` — determine version # pairing w/ entries
- `plan-release-cycle` — define when entries promoted to versioned
- `commit-changes` — commit changelog updates w/ proper msgs
- `release-package-version` — R-specific release workflow incl NEWS.md updates
- `create-github-release` — use changelog content as GitHub release notes
