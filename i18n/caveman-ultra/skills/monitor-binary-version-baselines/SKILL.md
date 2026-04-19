---
name: monitor-binary-version-baselines
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Establish and maintain longitudinal baselines of CLI binary contents
  across versions. Covers marker selection by category (API / identity /
  config / telemetry / flag / function), weighted scoring, threshold-based
  system-presence detection, and per-version baseline records. Use when
  tracking a feature's lifecycle across releases, when probing for
  dark-launched or removed capabilities, or when verifying that a scanning
  tool itself still catches known-good markers on old binaries.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, baseline, binary-analysis, version-tracking, markers
---

# Monitor Binary Version Baselines

Build and maintain comparable, version-keyed records of which feature-system markers appear in a CLI harness binary, so additions, removals, and dark-launched capabilities can be detected mechanically across releases.

## When to Use

- Tracking a feature's lifecycle across multiple releases of a closed-source CLI harness
- Probing for dark-launched capabilities (shipped but gated off) or quietly-removed ones
- Verifying that a marker scanner still detects known-good markers on old binaries (regression-testing the scanner itself)
- Building the Phase 1 substrate that later phases (flag discovery, dark-launch detection, wire capture) consume
- Any context where ad-hoc `grep` answers "is X present today" but you actually need "how has the system composed of X, Y, Z moved across versions"

## Inputs

- **Required**: One or more installed binary versions of the same CLI harness (or extracted bundles)
- **Required**: A working catalog file for the marker definitions (created on first run, extended across versions)
- **Optional**: A previously-recorded baseline file from prior runs (extended in place, never rewritten)
- **Optional**: A list of versions known to be never-published (skipped releases, withdrawn builds)
- **Optional**: A list of feature-systems already under tracking, to extend rather than re-discover

## Procedure

### Step 1: Select Markers by Category

Choose strings that survive rebuilds. Pick stable, semantically meaningful identifiers — not minified names that the bundler will rename next release.

Six recommended categories:

- **API** — endpoint paths, method names exposed in the harness's network surface
- **Identity** — internal product names, codenames, version sentinels
- **Config** — recognized keys in user-facing configuration files
- **Telemetry** — event names emitted to the analytics pipeline
- **Flag** — feature-gate keys consumed by gate predicates
- **Function** — well-known string constants used inside specific handlers (error messages, log labels)

Avoid: short identifiers that look minified (e.g., `_a1`, `bX`, two-letter names followed by digits), inline literals that would change with any text revision, anything matching the bundler's own internal naming convention.

**Expected:** Each candidate marker has a category tag and a short justification ("appears in user-facing docs," "stable across N prior releases," etc.). A typical first pass yields 20-50 markers per system.

**On failure:** If markers vanish across consecutive minor versions, the catalog has captured rebuild-volatile strings rather than stable identifiers. Drop those entries; broaden to longer, more semantically anchored substrings.

### Step 2: Group Markers by Feature-System

Bundle markers into one **system table** per independently-evolving capability. A "system" is a coherent set of markers whose presence/absence moves together because they share a feature lifecycle (e.g., all markers belonging to a hypothetical `acme_widget_v3` capability).

Why grouping matters: per-system scoring prevents cross-contamination. The absence of one system's markers must not suppress detection of another, and aggregate counts across unrelated systems are uninformative.

A working catalog shape (pseudocode):

```
catalog:
  acme_widget_v3:
    markers:
      - { id: "acme_widget_v3_init",         category: function, weight: 10 }
      - { id: "acme.widget.v3.dialog.open",  category: telemetry, weight: 5 }
      - { id: "ACME_WIDGET_V3_DISABLE",      category: flag,     weight: 10 }
  acme_other_system:
    markers:
      - ...
```

**Expected:** Each system has its own marker list; no marker appears in two systems. Adding a new system means adding a new top-level entry — never moving markers between systems retroactively.

**On failure:** If markers are hard to assign to one system (overlap, ambiguity), the system definitions are too coarse. Split the system, or accept that some markers are "shared substrate" and exclude them from per-system scoring.

### Step 3: Weight Markers by Signal Strength

Assign each marker a weight reflecting how much its presence alone confirms the system:

- **10 = diagnostic-alone** — unique enough that finding this marker, by itself, is sufficient to confirm the system is present (e.g., a long, system-specific string that no other code path would emit)
- **3-5 = corroborating only** — too generic to confirm alone, but contributes to an aggregate score (e.g., a short telemetry suffix that the harness reuses across features)

Teach the convention, not the specific numbers. The spread between "diagnostic" and "corroborating" matters more than the exact integers chosen — what counts is that thresholds in step 5 can distinguish "one strong signal" from "many weak signals."

**Expected:** Each marker has a weight. The catalog's weight distribution skews toward corroborating markers (3-5), with a small number of diagnostic-alone markers (10) per system.

**On failure:** If every marker is weighted 10, the scoring loses resolution — partial-presence findings become impossible. Demote markers that recur across multiple systems or appear in unrelated handlers.

### Step 4: Record Per-Version Baselines

For each version scanned, record both **present** and **absent** markers, keyed by version. Both are evidence: an absent marker in version N is just as informative as a present one when version N+1 reintroduces it.

Baseline shape:

```
baselines:
  "1.4.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE"]
      absent:  ["acme.widget.v3.dialog.open"]
      score:   20
  "1.5.0":
    acme_widget_v3:
      present: ["acme_widget_v3_init", "ACME_WIDGET_V3_DISABLE", "acme.widget.v3.dialog.open"]
      absent:  []
      score:   25
  "1.4.1":
    _annotation: "never-published; skipped from upstream release timeline"
```

Never-published versions get an explicit annotation rather than silent omission. Silently-skipped versions look like data loss to the next reader.

**Expected:** Every version produces one record per tracked system, with `present`, `absent`, and `score` populated, or an explicit `_annotation` if never-published.

**On failure:** If a baseline scan yields zero markers for a system that was previously present, do not assume removal until you confirm the binary path was correct, the strings command produced output, and the marker IDs match the catalog exactly. False zeroes corrupt the longitudinal record.

### Step 5: Set Thresholds for Full and Partial Detection

Define two gates per system applied to the aggregate score:

- **`full`** — score above which the system is considered present-and-active in this version
- **`partial`** — score above which the system is considered shipped-but-incomplete (some markers present, but below the `full` threshold)

Below `partial` = absent (or not-yet-present, depending on direction of travel).

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

Choosing thresholds: set `full` to the sum of weights you would expect a healthy install to emit; set `partial` to one diagnostic marker plus a corroborating signal. Re-tune when you have several versions of evidence.

**Expected:** Each scan produces a labeled finding per system: `full | partial | absent`. Findings with `partial` warrant investigation — they are the dark-launch and removal candidates.

**On failure:** If every system reports `partial` across every version, the thresholds are too sensitive (likely set higher than the markers can ever sum to). Recalibrate against a known-good version where the system is verifiably live.

### Step 6: Scan with `strings -n 8`

Use `strings` with a minimum length filter as the extraction primitive. The `-n 8` floor filters most noise (short fragments, padding, address-table junk) without losing meaningful identifiers, which are almost always longer than 8 characters.

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

Then run the catalog match against `/tmp/binary-strings.txt` (any line-oriented matcher: `grep -F -f markers.txt`, `ripgrep`, or a small script).

Caveats:

- Lower minimums (`-n 4`, `-n 6`) flood output with binary garbage and minified-symbol noise; the diagnostic-to-corroborating distinction collapses
- Higher minimums (`-n 12+`) miss short flag identifiers and config keys
- Some bundlers compress or encode strings; if `strings` returns near-empty output, the binary may need bundle-extraction first (out of scope for this skill)

**Expected:** A line-per-string output of 1k-100k lines, depending on binary size. Manual inspection should reveal recognizable identifiers in the first 100 lines.

**On failure:** If the output is empty or unrecognizable, the binary is probably packed, encrypted, or shipped as a bytecode format `strings` cannot read. Stop and resolve at the extraction layer; do not record a baseline from an unreadable scan.

### Step 7: Extend Baselines Forward Without Rewriting Past Records

When a new system or marker is added to the catalog, **only forward versions** are scanned for it. Past version records remain as originally written.

Why: prior-version baselines are empirical evidence of what was scanned at the time, not a current model of what the past version contained. Retroactively rewriting them with newly-discovered markers conflates "what we know now" with "what we observed then." Both are useful; only one should live in the baseline file.

If a retroactive scan is genuinely needed (e.g., to test whether a new marker was present in version N-3), record it as a **separate addendum**:

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

The original `baselines["1.4.0"]` entry is untouched. The reader can see both the original record and the later retroactive scan, with their respective catalog revisions.

**Expected:** The baseline file grows monotonically forward; past records are append-only with optional addenda blocks. Catalog revisions are versioned so each scan can be tied back to the catalog state it used.

**On failure:** If you ever feel the urge to edit a past version's `present` list directly, stop. Add an addendum instead. Mutating past records loses the ability to detect scanner regressions (Step 8 of any later scanner-validation pass relies on the historical record being immutable).

## Validation

- [ ] Catalog has explicit category tags on every marker (one of API / identity / config / telemetry / flag / function)
- [ ] Every marker is assigned to exactly one system; no marker appears in two systems
- [ ] Weights span a real range (some 10s, some 3-5s); weights are not all identical
- [ ] Each scanned version has a record with `present`, `absent`, and `score` per tracked system
- [ ] Never-published versions are explicitly annotated, not silently omitted
- [ ] Each system has both `full` and `partial` thresholds; findings labeled accordingly
- [ ] `strings -n 8` is the extraction primitive (or documented equivalent for non-text binaries)
- [ ] Past version records are unchanged by the latest scan; new findings live in addenda blocks if retroactive

## Common Pitfalls

- **Recording specific findings as the catalog.** The catalog should describe marker categories and shapes, not enumerate version-pinned literals. Catalogs full of finding-shaped entries decay fast and are the highest leak risk if accidentally published.
- **Capturing minified identifiers.** Names like `_p3a` or `q9X` rename on every rebuild. Even if they match today, they are noise tomorrow. Stay with semantically meaningful identifiers.
- **Conflating telemetry events with feature flags.** They share naming conventions in many harnesses but play different roles. Tag them by category (Step 1) so per-category analysis stays clean.
- **Silently skipping never-published versions.** A gap in the version sequence with no annotation looks like a missed scan. Annotate explicitly: `_annotation: "never-published"`.
- **Setting thresholds before any baseline data exists.** First scan establishes the empirical weight totals; tune thresholds against that, not in advance.
- **Rewriting prior version records when the catalog grows.** Past records are evidence; addenda are the supported pattern for retroactive scans.
- **Trusting empty scan output.** Zero markers found does not always mean "absent." Confirm the binary is readable and the catalog IDs match exactly before declaring removal.
- **Treating `strings -n 4` as more thorough than `-n 8`.** Lower minimums add noise faster than signal. Diagnostic markers are essentially always 8+ characters.

## Related Skills

- `security-audit-codebase` — shared discipline; both pipelines treat marker presence as a finding, with different downstream consumers
- `audit-dependency-versions` — extends the same version-tracking rigor to external dependency manifests; this skill applies it to binary artifacts
- `probe-feature-flag-state` — Phase 2-3 follow-up; consumes baselines to classify flag rollout state (live / opt-in / dark / removed)
- `conduct-empirical-wire-capture` — Phase 4 follow-up; validates inferred behavior against actual harness traffic
- `redact-for-public-disclosure` — Phase 5 follow-up; governs which findings can leave the private workspace
