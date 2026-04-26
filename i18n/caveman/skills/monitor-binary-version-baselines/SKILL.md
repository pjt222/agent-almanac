---
name: monitor-binary-version-baselines
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

Build + maintain comparable, version-keyed records of which feature-system markers appear in CLI harness binary, so additions, removals, dark-launched capabilities can be detected mechanically across releases.

## When Use

- Tracking feature's lifecycle across multiple releases of closed-source CLI harness
- Probing for dark-launched capabilities (shipped but gated off) or quietly-removed ones
- Verifying marker scanner still detects known-good markers on old binaries (regression-testing scanner itself)
- Building Phase 1 substrate that later phases (flag discovery, dark-launch detection, wire capture) consume
- Any context where ad-hoc `grep` answers "is X present today" but you actually need "how has system composed of X, Y, Z moved across versions"

## Inputs

- **Required**: One or more installed binary versions of same CLI harness (or extracted bundles)
- **Required**: Working catalog file for marker definitions (created on first run, extended across versions)
- **Optional**: Previously-recorded baseline file from prior runs (extended in place, never rewritten)
- **Optional**: List of versions known to be never-published (skipped releases, withdrawn builds)
- **Optional**: List of feature-systems already under tracking, to extend rather than re-discover

## Steps

### Step 1: Select Markers by Category

Choose strings surviving rebuilds. Pick stable, semantically meaningful identifiers — not minified names bundler will rename next release.

Six recommended categories:

- **API** — endpoint paths, method names exposed in harness's network surface
- **Identity** — internal product names, codenames, version sentinels
- **Config** — recognized keys in user-facing configuration files
- **Telemetry** — event names emitted to analytics pipeline
- **Flag** — feature-gate keys consumed by gate predicates
- **Function** — well-known string constants used inside specific handlers (error messages, log labels)

Avoid: short identifiers looking minified (e.g., `_a1`, `bX`, two-letter names followed by digits), inline literals changing with any text revision, anything matching bundler's own internal naming convention.

**Got:** Each candidate marker has category tag + short justification ("appears in user-facing docs," "stable across N prior releases," etc.). Typical first pass yields 20-50 markers per system.

**If fail:** Markers vanish across consecutive minor versions? Catalog has captured rebuild-volatile strings rather than stable identifiers. Drop those entries; broaden to longer, more semantically anchored substrings.

### Step 2: Group Markers by Feature-System

Bundle markers into one **system table** per independently-evolving capability. "System" is coherent set of markers whose presence/absence moves together because they share feature lifecycle (e.g., all markers belonging to hypothetical `acme_widget_v3` capability).

Why grouping matters: per-system scoring prevents cross-contamination. Absence of one system's markers must not suppress detection of another, + aggregate counts across unrelated systems are uninformative.

Working catalog shape (pseudocode):

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

**Got:** Each system has its own marker list; no marker appears in two systems. Adding new system means adding new top-level entry — never moving markers between systems retroactively.

**If fail:** Markers hard to assign to one system (overlap, ambiguity)? System definitions too coarse. Split system, or accept some markers are "shared substrate" + exclude them from per-system scoring.

### Step 3: Weight Markers by Signal Strength

Assign each marker weight reflecting how much its presence alone confirms system:

- **10 = diagnostic-alone** — unique enough that finding this marker, by itself, is sufficient to confirm system is present (e.g., long, system-specific string no other code path would emit)
- **3-5 = corroborating only** — too generic to confirm alone, but contributes to aggregate score (e.g., short telemetry suffix harness reuses across features)

Teach convention, not specific numbers. Spread between "diagnostic" + "corroborating" matters more than exact integers chosen — what counts is thresholds in step 5 can distinguish "one strong signal" from "many weak signals."

**Got:** Each marker has weight. Catalog's weight distribution skews toward corroborating markers (3-5), with small number of diagnostic-alone markers (10) per system.

**If fail:** Every marker weighted 10? Scoring loses resolution — partial-presence findings become impossible. Demote markers recurring across multiple systems or appearing in unrelated handlers.

### Step 4: Record Per-Version Baselines

For each version scanned, record both **present** and **absent** markers, keyed by version. Both are evidence: absent marker in version N is just as informative as present one when version N+1 reintroduces it.

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

Never-published versions get explicit annotation rather than silent omission. Silently-skipped versions look like data loss to next reader.

**Got:** Every version produces one record per tracked system, with `present`, `absent`, `score` populated, or explicit `_annotation` if never-published.

**If fail:** Baseline scan yields zero markers for system previously present? Do not assume removal until you confirm binary path correct, strings command produced output, marker IDs match catalog exactly. False zeroes corrupt longitudinal record.

### Step 5: Set Thresholds for Full + Partial Detection

Define two gates per system applied to aggregate score:

- **`full`** — score above which system considered present-and-active in this version
- **`partial`** — score above which system considered shipped-but-incomplete (some markers present, but below `full` threshold)

Below `partial` = absent (or not-yet-present, depending on direction of travel).

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

Choosing thresholds: set `full` to sum of weights you would expect healthy install to emit; set `partial` to one diagnostic marker plus corroborating signal. Re-tune when you have several versions of evidence.

**Got:** Each scan produces labeled finding per system: `full | partial | absent`. Findings with `partial` warrant investigation — they are dark-launch + removal candidates.

**If fail:** Every system reports `partial` across every version? Thresholds too sensitive (likely set higher than markers can ever sum to). Recalibrate against known-good version where system verifiably live.

### Step 6: Scan with `strings -n 8`

Use `strings` with minimum length filter as extraction primitive. `-n 8` floor filters most noise (short fragments, padding, address-table junk) without losing meaningful identifiers, which are almost always longer than 8 characters.

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

Then run catalog match against `/tmp/binary-strings.txt` (any line-oriented matcher: `grep -F -f markers.txt`, `ripgrep`, or small script).

Caveats:

- Lower minimums (`-n 4`, `-n 6`) flood output with binary garbage + minified-symbol noise; diagnostic-to-corroborating distinction collapses
- Higher minimums (`-n 12+`) miss short flag identifiers + config keys
- Some bundlers compress or encode strings; if `strings` returns near-empty output, binary may need bundle-extraction first (out of scope for this skill)

**Got:** Line-per-string output of 1k-100k lines, depending on binary size. Manual inspection should reveal recognizable identifiers in first 100 lines.

**If fail:** Output empty or unrecognizable? Binary probably packed, encrypted, or shipped as bytecode format `strings` cannot read. Stop + resolve at extraction layer; do not record baseline from unreadable scan.

### Step 7: Extend Baselines Forward Without Rewriting Past Records

When new system or marker added to catalog, **only forward versions** are scanned for it. Past version records remain as originally written.

Why: prior-version baselines are empirical evidence of what was scanned at time, not current model of what past version contained. Retroactively rewriting them with newly-discovered markers conflates "what we know now" with "what we observed then." Both useful; only one should live in baseline file.

If retroactive scan genuinely needed (e.g., to test whether new marker was present in version N-3), record as **separate addendum**:

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

Original `baselines["1.4.0"]` entry untouched. Reader can see both original record + later retroactive scan, with respective catalog revisions.

**Got:** Baseline file grows monotonically forward; past records are append-only with optional addenda blocks. Catalog revisions are versioned so each scan can be tied back to catalog state it used.

**If fail:** Ever feel urge to edit past version's `present` list directly? Stop. Add addendum instead. Mutating past records loses ability to detect scanner regressions (Step 8 of any later scanner-validation pass relies on historical record being immutable).

## Checks

- [ ] Catalog has explicit category tags on every marker (one of API / identity / config / telemetry / flag / function)
- [ ] Every marker assigned to exactly one system; no marker appears in two systems
- [ ] Weights span real range (some 10s, some 3-5s); weights not all identical
- [ ] Each scanned version has record with `present`, `absent`, `score` per tracked system
- [ ] Never-published versions explicitly annotated, not silently omitted
- [ ] Each system has both `full` + `partial` thresholds; findings labeled accordingly
- [ ] `strings -n 8` is extraction primitive (or documented equivalent for non-text binaries)
- [ ] Past version records unchanged by latest scan; new findings live in addenda blocks if retroactive

## Pitfalls

- **Recording specific findings as the catalog.** Catalog should describe marker categories + shapes, not enumerate version-pinned literals. Catalogs full of finding-shaped entries decay fast + are highest leak risk if accidentally published.
- **Capturing minified identifiers.** Names like `_p3a` or `q9X` rename on every rebuild. Even if they match today, they are noise tomorrow. Stay with semantically meaningful identifiers.
- **Conflating telemetry events with feature flags.** They share naming conventions in many harnesses but play different roles. Tag them by category (Step 1) so per-category analysis stays clean.
- **Silently skipping never-published versions.** Gap in version sequence with no annotation looks like missed scan. Annotate explicitly: `_annotation: "never-published"`.
- **Setting thresholds before any baseline data exists.** First scan establishes empirical weight totals; tune thresholds against that, not in advance.
- **Rewriting prior version records when catalog grows.** Past records are evidence; addenda are supported pattern for retroactive scans.
- **Trusting empty scan output.** Zero markers found does not always mean "absent." Confirm binary readable + catalog IDs match exactly before declaring removal.
- **Treating `strings -n 4` as more thorough than `-n 8`.** Lower minimums add noise faster than signal. Diagnostic markers are essentially always 8+ characters.

## See Also

- `security-audit-codebase` — shared discipline; both pipelines treat marker presence as finding, with different downstream consumers
- `audit-dependency-versions` — extends same version-tracking rigor to external dependency manifests; this skill applies it to binary artifacts
- `probe-feature-flag-state` — Phase 2-3 follow-up; consumes baselines to classify flag rollout state (live / opt-in / dark / removed)
- `conduct-empirical-wire-capture` — Phase 4 follow-up; validates inferred behavior against actual harness traffic
- `redact-for-public-disclosure` — Phase 5 follow-up; governs which findings can leave private workspace
