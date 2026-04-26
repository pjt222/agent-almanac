---
name: monitor-binary-version-baselines
locale: caveman-ultra
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

Build + maintain comparable, version-keyed records of feature-system markers in CLI harness binary → additions/removals/dark-launched detected mechanically across releases.

## Use When

- Track feature lifecycle across releases of closed-source CLI harness
- Probe dark-launched (shipped but gated off) or quietly-removed
- Verify scanner still detects known-good markers on old binaries (regression-test scanner)
- Phase 1 substrate consumed by later phases (flag discovery, dark-launch detection, wire capture)
- Ad-hoc `grep` answers "X present today" but you need "how has system X+Y+Z moved across versions"

## In

- **Required**: ≥1 installed binary versions of same CLI harness (or extracted bundles)
- **Required**: Working catalog file for marker defs (created on first run, extended)
- **Optional**: Prior baseline file (extended in place, never rewritten)
- **Optional**: List of never-published versions (skipped, withdrawn)
- **Optional**: List of feature-systems already tracked, to extend not re-discover

## Do

### Step 1: Markers by Category

Pick stable semantically meaningful identifiers — not minified names bundler will rename next release.

Six categories:

- **API** — endpoint paths, method names exposed in network surface
- **Identity** — internal product names, codenames, version sentinels
- **Config** — recognized keys in user-facing config files
- **Telemetry** — event names emitted to analytics pipeline
- **Flag** — feature-gate keys consumed by gate predicates
- **Function** — well-known string constants in handlers (err msgs, log labels)

Avoid: short minified-looking (`_a1`, `bX`, two-letter+digits), inline literals that change w/ text revision, anything matching bundler's internal naming.

→ Each candidate has category tag + short justification ("appears in user-facing docs," "stable across N prior releases"). Typical first pass: 20-50 markers per system.

If err: markers vanish across consecutive minor versions → catalog captured rebuild-volatile not stable. Drop entries, broaden to longer semantically anchored substrings.

### Step 2: Group by Feature-System

Bundle markers per **system table** for independently-evolving capability. "System" = coherent marker set whose presence/absence moves together (shared lifecycle).

Why: per-system scoring prevents cross-contamination. Absence of one system's markers must not suppress detection of another. Aggregate counts across unrelated systems = uninformative.

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

→ Each system has own marker list; no marker in two systems. New system = new top-level entry, never move retroactively.

If err: hard to assign (overlap, ambiguity) → defs too coarse. Split system or accept "shared substrate", exclude from per-system scoring.

### Step 3: Weight by Signal Strength

Per marker:

- **10 = diagnostic-alone** — unique enough alone confirms (long, system-specific, no other code path emits)
- **3-5 = corroborating only** — too generic alone, contributes to aggregate (short telemetry suffix reused)

Convention not specific numbers. Spread "diagnostic" vs. "corroborating" matters more than exact integers. Thresholds Step 5 must distinguish "one strong signal" from "many weak signals."

→ Each marker weighted. Distribution skews toward corroborating (3-5), small number diagnostic-alone (10) per system.

If err: every marker = 10 → scoring loses resolution, partial-presence impossible. Demote markers recurring across systems or in unrelated handlers.

### Step 4: Per-Version Baselines

Per scanned version, record both **present** + **absent** keyed by version. Both = evidence: absent in N is informative when N+1 reintroduces.

Shape:

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

Never-published get explicit annotation, not silent omission. Silent skips look like data loss to next reader.

→ Every version has one record per tracked system: `present`, `absent`, `score` populated, or explicit `_annotation` if never-published.

If err: scan yields zero markers for previously-present system → don't assume removal until you confirm binary path correct, strings cmd produced output, marker IDs match catalog exactly. False zeroes corrupt longitudinal record.

### Step 5: Thresholds for Full + Partial Detection

Two gates per system on aggregate score:

- **`full`** — score above which system = present-and-active in this version
- **`partial`** — score above which system = shipped-but-incomplete (some markers, below `full`)

Below `partial` = absent (or not-yet-present, depending on direction).

```
thresholds:
  acme_widget_v3:
    full:    25
    partial: 10
```

Choose: `full` = sum of weights healthy install would emit; `partial` = one diagnostic + corroborating signal. Re-tune w/ several versions evidence.

→ Each scan: per-system finding `full | partial | absent`. `partial` warrants investigation — dark-launch + removal candidates.

If err: every system reports `partial` across every version → thresholds too sensitive (set higher than markers can sum). Recalibrate vs. known-good version where system verifiably live.

### Step 6: Scan w/ `strings -n 8`

`strings` w/ min length filter as extraction primitive. `-n 8` floor filters most noise (short fragments, padding, address-table junk) w/o losing meaningful identifiers (almost always >8 chars).

```bash
strings -n 8 path/to/binary > /tmp/binary-strings.txt
```

Then catalog match vs. `/tmp/binary-strings.txt` (any line-oriented matcher: `grep -F -f markers.txt`, `ripgrep`, small script).

Caveats:

- Lower (`-n 4`, `-n 6`) → flood w/ binary garbage + minified-symbol noise; diagnostic/corroborating collapses
- Higher (`-n 12+`) → miss short flag identifiers + config keys
- Some bundlers compress/encode → near-empty output → may need bundle-extraction first (out of scope)

→ Line-per-string out 1k-100k lines depending on binary size. Manual inspection reveals recognizable identifiers in first 100 lines.

If err: empty/unrecognizable → binary likely packed, encrypted, or bytecode format `strings` can't read. Stop, resolve at extraction layer. Don't record baseline from unreadable scan.

### Step 7: Extend Forward, Don't Rewrite Past Records

New system or marker added to catalog → **only forward versions** scanned. Past records remain as originally written.

Why: prior baselines = empirical evidence of what was scanned at the time, not current model of what past version contained. Retroactive rewriting conflates "what we know now" w/ "what we observed then." Both useful, only one in baseline file.

Retroactive scan genuinely needed (test if new marker was in N-3) → record as **separate addendum**:

```
addenda:
  "1.4.0":
    scan_date: "2026-04-15"
    catalog_revision: "v7"
    findings:
      acme_new_system:
        present: ["..."]
```

Original `baselines["1.4.0"]` untouched. Reader sees both original + later retroactive, w/ respective catalog revisions.

→ Baseline grows monotonically forward; past records append-only w/ optional addenda. Catalog revisions versioned so each scan tied back to catalog state used.

If err: urge to edit past version's `present` list directly → stop. Add addendum. Mutating past records loses ability to detect scanner regressions (later scanner-validation relies on historical record being immutable).

## Check

- [ ] Catalog has explicit category tags every marker (API/identity/config/telemetry/flag/function)
- [ ] Every marker assigned to exactly one system; no duplicates
- [ ] Weights span real range (some 10s, some 3-5); not all identical
- [ ] Each scanned version: `present` + `absent` + `score` per tracked system
- [ ] Never-published explicitly annotated, not silent omission
- [ ] Each system: `full` + `partial` thresholds; findings labeled
- [ ] `strings -n 8` extraction primitive (or documented equivalent for non-text binaries)
- [ ] Past version records unchanged by latest scan; new findings in addenda if retroactive

## Traps

- **Recording specific findings as catalog**: Catalog should describe marker categories + shapes, not enumerate version-pinned literals. Finding-shaped entries decay fast + highest leak risk if published.
- **Capturing minified identifiers**: `_p3a`, `q9X` rename every rebuild. Match today = noise tomorrow. Stay w/ semantically meaningful.
- **Conflating telemetry vs. flags**: Share naming conventions in many harnesses but different roles. Tag by category (Step 1) so per-category analysis stays clean.
- **Silent skip never-published**: Gap w/ no annotation looks like missed scan. Annotate: `_annotation: "never-published"`.
- **Thresholds before baseline data**: First scan establishes empirical weight totals; tune vs. that, not in advance.
- **Rewriting prior records when catalog grows**: Past records = evidence; addenda = supported pattern for retroactive.
- **Trust empty scan output**: Zero found ≠ "absent." Confirm binary readable + catalog IDs match exactly before declaring removal.
- **`strings -n 4` more thorough than `-n 8`**: Lower mins add noise faster than signal. Diagnostic markers essentially always 8+ chars.

## →

- `security-audit-codebase` — shared discipline; both treat marker presence as finding, different downstream consumers
- `audit-dependency-versions` — extends same version-tracking rigor to external dep manifests; this applies to binary artifacts
- `probe-feature-flag-state` — Phase 2-3 follow-up; consumes baselines to classify flag rollout state (live/opt-in/dark/removed)
- `conduct-empirical-wire-capture` — Phase 4 follow-up; validates inferred behavior vs. actual harness traffic
- `redact-for-public-disclosure` — Phase 5 follow-up; governs which findings can leave private workspace
