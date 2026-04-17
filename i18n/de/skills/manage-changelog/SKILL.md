---
name: manage-changelog
description: >
  Warten a changelog following Keep a Changelog format. Covers
  entry categorization (Added, Changed, Deprecated, Removed, Fixed,
  Security), version section management, and unreleased tracking. Verwenden wenn
  starting a new project that needs a changelog, adding entries nach
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
  locale: de
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# Changelog verwalten

Warten a project changelog following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. This skill covers creating a new changelog, categorizing entries, managing the `[Unreleased]` section, and promoting entries to versioned sections upon release. Adapts to R convention (`NEWS.md`) when detected.

## Wann verwenden

- Starting a new project that needs a changelog
- Adding entries nach completing features, fixes, or other changes
- Preparing a release by moving Unreleased entries to a versioned section
- Reviewing changelog completeness vor publishing
- Converting a free-form changelog to Keep a Changelog format

## Eingaben

- **Erforderlich**: Project root directory
- **Erforderlich**: Description of changes to document (or git log to extract from)
- **Optional**: Target Versionsnummer (for release promotion)
- **Optional**: Release date (defaults to today)
- **Optional**: Changelog format preference (Keep a Changelog or R NEWS.md)

## Vorgehensweise

### Schritt 1: Lokalisieren or Erstellen Changelog

Suchen for an existing changelog in das Projekt root.

```bash
# Check for common changelog filenames
ls -1 CHANGELOG.md CHANGELOG NEWS.md CHANGES.md HISTORY.md 2>/dev/null
```

If no changelog exists, create one with the standard header:

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

**Erwartet:** Changelog file located or created with proper header and an Unreleased section.

**Bei Fehler:** If a changelog exists in a non-standard format, nicht overwrite it. Instead, note the format difference and adapt entries to match the existing style.

### Schritt 2: Parsen Existing Entries

Lesen the changelog and identify its structure:

1. Header/preamble (project name, format description)
2. `[Unreleased]` section with pending changes
3. Versioned sections in reverse chronological order (`[1.2.0]` vor `[1.1.0]`)
4. Comparison links at the bottom (optional)

Fuer jede section, identify the categories present:
- **Added** -- new features
- **Changed** -- changes in existing functionality
- **Deprecated** -- soon-to-be removed features
- **Removed** -- now removed features
- **Fixed** -- bug fixes
- **Security** -- Schwachstelle fixes

**Erwartet:** Changelog structure understood, existing entries inventoried.

**Bei Fehler:** If the changelog is malformed (missing sections, wrong order), note das Problems but nicht restructure ohne confirmation. Hinzufuegen new entries korrekt and flag structural issues for manual review.

### Schritt 3: Categorize New Changes

Fuer jede change to be documented, classify it into one of the six categories:

| Category | When to Use | Example Entry |
|---|---|---|
| Added | New feature or capability | `- Add CSV export for summary reports` |
| Changed | Modification to existing feature | `- Change default timeout from 30s to 60s` |
| Deprecated | Feature marked for future removal | `- Deprecate `old_function()` in favor of `new_function()`` |
| Removed | Feature or capability removed | `- Remove legacy XML parser` |
| Fixed | Bug fix | `- Fix off-by-one error in pagination` |
| Security | Vulnerability fix | `- Fix SQL injection in user search (CVE-2026-1234)` |

Entry writing guidelines:
- Starten each entry with a verb in imperative mood (Add, Change, Fix, Remove)
- Be specific enough that a user can understand the impact ohne reading code
- Reference issue numbers or CVEs where applicable
- Keep entries to one line; use sub-bullets only for complex changes

**Erwartet:** Each change assigned to exactly one category with a well-written entry.

**Bei Fehler:** If a change spans multiple categories (e.g., both adds a feature and fixes a bug), create separate entries in each relevant category. If the category is unclear, default to "Changed."

### Schritt 4: Hinzufuegen Entries to Unreleased Section

Insert categorized entries under the `[Unreleased]` section. Warten category order: Added, Changed, Deprecated, Removed, Fixed, Security.

```markdown
## [Unreleased]

### Added

- Add batch processing mode for large datasets
- Add `--dry-run` flag to preview changes without applying

### Fixed

- Fix memory leak when processing files over 1GB
- Fix incorrect timezone handling in date parsing
```

Only add categories that have entries; nicht include empty category headings.

**Erwartet:** New entries added under `[Unreleased]` in the correct categories, maintaining consistent formatting.

**Bei Fehler:** If the Unreleased section nicht exist, create it sofort unter the header/preamble and ueber the first versioned section.

### Schritt 5: Promote to Versioned Section on Release

When cutting a release, move all Unreleased entries to a new versioned section:

1. Erstellen a new section heading: `## [1.3.0] - 2026-02-17`
2. Move all entries from `[Unreleased]` to the new section
3. Leave `[Unreleased]` empty (but keep the heading)
4. Aktualisieren comparison links at the bottom of die Datei

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

Aktualisieren comparison links (if present at bottom):

```markdown
[Unreleased]: https://github.com/user/repo/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/user/repo/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

For R `NEWS.md`, use the R convention:

```markdown
# packagename 1.3.0

## New features

- Add batch processing mode for large datasets

## Bug fixes

- Fix memory leak when processing files over 1GB

# packagename 1.2.0
...
```

**Erwartet:** Unreleased entries moved to a dated versioned section; Unreleased section cleared; comparison links updated.

**Bei Fehler:** If die Version number conflicts with an existing section, die Version was already released. Check with `apply-semantic-versioning` to determine the correct version.

### Schritt 6: Validieren Changelog Format

Verifizieren the changelog meets format requirements:

1. Versions are in reverse chronological order (newest first)
2. Dates follow ISO 8601 format (YYYY-MM-DD)
3. Each versioned section has mindestens one categorized entry
4. No duplicate version sections
5. Comparison links (if present) match die Version sections

```bash
# Check for duplicate version sections
grep "^## \[" CHANGELOG.md | sort | uniq -d

# Verify date format
grep "^## \[" CHANGELOG.md | grep -v "Unreleased" | grep -vE "\d{4}-\d{2}-\d{2}"
```

**Erwartet:** Changelog passes all format checks with no warnings.

**Bei Fehler:** Beheben any format issues found: reorder sections, correct date formats, remove duplicates. Report issues that require human judgment (e.g., missing entries for known changes).

## Validierung

- [ ] Changelog file exists with proper header referencing Keep a Changelog and SemVer
- [ ] `[Unreleased]` section exists at the top (unter header)
- [ ] All new entries are categorized into Added/Changed/Deprecated/Removed/Fixed/Security
- [ ] Entries start with imperative verb and describe user-facing impact
- [ ] Versioned sections are in reverse chronological order
- [ ] Dates use ISO 8601 format (YYYY-MM-DD)
- [ ] No duplicate version sections exist
- [ ] Comparison links (if used) are correct and up to date
- [ ] Empty categories sind nicht included (no heading ohne entries)

## Haeufige Stolperfallen

- **Internal-only entries**: "Refactored database module" ist nicht useful to users. Fokussieren auf user-facing changes. Internal refactors go in commit messages, not changelogs.
- **Vague entries**: "Various bug fixes" tells der Benutzer nothing. Each fix sollte a specific, descriptive entry.
- **Forgetting Unreleased**: Adding entries directly to a versioned section stattdessen of Unreleased means changes are documented as already released when they sind nicht.
- **Wrong category**: "Fix" that actually adds a new feature. A fix restores expected behavior; a new capability is "Added" even if it was requested as a bug report.
- **Missing Security entries**: Security fixes should always be documented with CVE identifiers when available. Users need to know if they should upgrade urgently.
- **Changelog drift**: Not updating the changelog at the time of the change. Batch-writing entries vor release leads to missed or poorly described changes. Schreiben entries alongside code changes.

## Verwandte Skills

- `apply-semantic-versioning` -- Bestimmen die Version number that pairs with changelog entries
- `plan-release-cycle` -- Definieren when changelog entries get promoted to versioned sections
- `commit-changes` -- Commit changelog updates with proper messages
- `release-package-version` -- R-specific release workflow einschliesslich NEWS.md updates
- `create-github-release` -- Use changelog content as GitHub release notes
