---
name: sweep-flag-namespace
description: >
  Bulk-extract candidate flags from binary namespace → inventory w/ occurrence
  counts + call-type tags → cross-ref vs documented set → track completeness
  across probe campaigns until undocumented remainder = 0. Covers prefix
  harvest, gate-vs-telemetry disambig at call-site, completeness metrics,
  DEFAULT-TRUE pop report, final confirm scan. Use upstream of probe-feature-
  flag-state → complete catalog (not sample), or wave-based campaign needs
  verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: caveman-ultra
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

Exhaustive extract → every flag candidate from binary namespace. Split gates from telemetry. Track completeness vs documented set → undocumented remainder = 0. `probe-feature-flag-state` classifies one flag at a time → this skill makes catalog those probes work against, confirms catalog complete.

## Use When

- Flag-discovery campaign mid-flight → need verifiable stop condition, not guess "enough"
- Binary namespace large (hundreds of candidates) → sample risks missing gates
- Report DEFAULT-TRUE separate from DEFAULT-FALSE → high-signal subset
- Multi-wave docs vs binary → each wave's completion metric in writing
- Suspect prior campaign ended early → confirm/refute w/ fresh sweep

## In

- **Required**: binary/bundle file, readable
- **Required**: namespace prefix (synthetic: `acme_*`) → identifies flags in system
- **Required**: working doc set → running list of flag write-ups so far
- **Optional**: gate-reader fn names (synthetic: `gate(...)`, `flag(...)`, `isEnabled(...)`) → speeds Step 2
- **Optional**: telemetry/emit fn names → same reason, opposite sign
- **Optional**: prior sweep out for binary at earlier ver → delta analysis

## Do

### Step 1: Harvest All Strings Matching Prefix

Extract every literal in binary matching prefix, regardless of call-site role. Goal: *coverage*, not classification.

```bash
BUNDLE=/path/to/cli/bundle.js
PREFIX=acme_                       # synthetic placeholder

# Pull every quoted string starting with the prefix
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort -u > /tmp/sweep-candidates.txt
wc -l /tmp/sweep-candidates.txt    # unique candidate count

# Per-string occurrence count (gives a first hint at gate-call density)
grep -oE "\"${PREFIX}[a-zA-Z0-9_]+\"" "$BUNDLE" | sort | uniq -c | sort -rn > /tmp/sweep-occurrences.txt
head /tmp/sweep-occurrences.txt
```

→ deduped candidate list + freq-sorted occurrence file. High counts (≥10) → gate-heavy strings; single-occurrence → telemetry events or static labels.

If err: unique count = 0 → prefix wrong (typo, namespace mismatch, harness uses different convention). Count > ~5000 → prefix too broad → narrow first or inventory unmanageable.

### Step 2: Disambiguate Gate Calls vs Telemetry vs Static Labels

Same string, different role. Call-site role-split → inventory actionable. Reuse disambig discipline from `probe-feature-flag-state` Step 2.

Per candidate, classify each occurrence:

- **gate-call** → string is first arg to gate-reader fn (`gate("$FLAG", default)`, `flag("$FLAG", ...)`, `isEnabled("$FLAG")`, etc.)
- **telemetry-call** → string is first arg to emit/log/track fn
- **env-var-check** → string in `process.env.X` lookup or equiv
- **static-label** → string in registry, map, or comment, no behavioral hookup

```bash
# Count gate-call occurrences for the candidate set, using a synthetic
# reader-name pattern. Adapt the regex to the actual reader names found.
GATE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_'
grep -coE "$GATE_PATTERN" "$BUNDLE"

# Per-flag gate-call count
while read -r flag; do
  flag_no_quotes="${flag//\"/}"
  count=$(grep -coE "(gate|flag|isEnabled)\(\s*\"${flag_no_quotes}\"" "$BUNDLE")
  echo -e "${flag_no_quotes}\t${count}"
done < /tmp/sweep-candidates.txt > /tmp/sweep-gate-counts.tsv
```

→ inventory record per unique string: `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`. Gate-call count = actionable col; rest = noise filters.

If err: every candidate zero gate-call hits → gate-reader pattern wrong. Either binary uses reader fn this regex misses, or namespace pure telemetry (not flag namespace). Run `decode-minified-js-gates` vs few candidates → learn actual reader names → re-run step.

### Step 3: Build Extraction Inventory

Consolidate per-string records → one inventory artifact. CSV or JSONL — pick one, stick to it for diff across waves.

```bash
# JSONL inventory
{
  while IFS=$'\t' read -r flag gate_count; do
    [ "$gate_count" -gt 0 ] || continue   # skip strings with no gate-call evidence
    total=$(grep -c "\"${flag}\"" "$BUNDLE")
    telem=$((total - gate_count))         # rough; refine if other call types matter
    printf '{"flag":"%s","total":%d,"gate_calls":%d,"telemetry":%d,"documented":false}\n' \
      "$flag" "$total" "$gate_count" "$telem"
  done < /tmp/sweep-gate-counts.tsv
} > /tmp/sweep-inventory.jsonl

wc -l /tmp/sweep-inventory.jsonl    # gate-bearing flag count
```

Two derived counts matter:

- **`total_unique`** → every string prefix matched (pre gate filter)
- **`gate_calls`** → subset w/ ≥1 gate-call occurrence → working set for campaign

→ inventory file, one record per unique gate-bearing flag. Gate count = fraction of `total_unique` (commonly 5–20%) → numbers should differ noticeably.

If err: inventory empty or `gate_calls` ≈ `total_unique` → Step 2 disambig produces meaningless splits. Revisit reader-name regex.

### Step 4: Cross-Ref vs Documented Set

Completeness metric depends on documented set → flags campaign already wrote up. Cross-ref → report remainder.

```bash
DOCUMENTED=/path/to/research/documented-flags.txt   # one flag name per line

# Extract gate-bearing flag names from the inventory
jq -r '.flag' /tmp/sweep-inventory.jsonl | sort -u > /tmp/sweep-extracted.txt

# Compute the documented and remaining sets
sort -u "$DOCUMENTED" > /tmp/sweep-documented.txt
comm -23 /tmp/sweep-extracted.txt /tmp/sweep-documented.txt > /tmp/sweep-remaining.txt

echo "Extracted (gate-bearing):  $(wc -l < /tmp/sweep-extracted.txt)"
echo "Documented:                $(wc -l < /tmp/sweep-documented.txt)"
echo "Remaining (undocumented):  $(wc -l < /tmp/sweep-remaining.txt)"
```

Completeness metric = `remaining`. → 0 → documented set covers every gate-bearing flag in namespace.

→ three counts. Early campaign: `remaining` should be substantial fraction of `extracted`. Each wave reduces `remaining` → 0. Track trajectory across waves → detect plateau (stalled wave re-investigating documented flags).

If err: `documented` > `extracted` → documented set has stale entries (flags removed in this binary ver). Run `comm -13` instead → surface obsolete documented names; archive as REMOVED in next campaign artifact.

### Step 5: Report DEFAULT-TRUE Population

Within gate-bearing set, split flags w/ binary default `true` from default `false` (or non-bool). DEFAULT-TRUE = on for all users sans server override → highest-signal subset.

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

Flags w/ non-bool defaults (config objects, TTL readers, async readers) → use `decode-minified-js-gates` to classify reader variant. Different default-shape → own bucket.

→ typical split: 10–20% DEFAULT-TRUE, 80–90% DEFAULT-FALSE. Extreme binary (90%+ TRUE or 90%+ FALSE) unusual → investigate. May indicate release-stage convention (everything default-on for testing, default-off for staged rollout).

If err: DEFAULT-TRUE + DEFAULT-FALSE counts don't cover gate-bearing inventory → remainder uses non-bool readers. Run `decode-minified-js-gates` vs gap → classify reader variants in use.

### Step 6: Confirm Completion

When `remaining = 0` from Step 4 → final scan: search gate-call occurrences of namespace-matching strings NOT in documented set. Catches any flag missed by Step 1 harvest (e.g., string concat hides literal from simple grep).

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

Compare gate-call hits vs `/tmp/sweep-documented.txt`. Any hit refs flag not in documented set → return Step 1 w/ refined extraction (e.g., handle dynamic-construction case). Empty → campaign complete.

→ final scan returns empty (campaign complete) or small remainder (typically <5 flags, surfacing dynamic constructions or alt readers).

If err: final scan returns large remainder when Step 4 said `remaining = 0` → Step 1 systematically under-extracted. Investigate missed patterns (dynamic strings, alt quote chars, alt reader fns) → re-run from Step 1 w/ tighter regex.

## Check

- [ ] Step 1 unique count non-zero, within order of magnitude of expectation
- [ ] Step 2 produces meaningful gate-vs-telemetry split (gate-call count = fraction, not all-or-none, of total occurrences)
- [ ] Step 3 inventory: one record per gate-bearing flag, in CSV or JSONL
- [ ] Step 4 reports `total_unique`, `gate_calls`, `documented`, `remaining` → metric reaches 0 by end of campaign
- [ ] Step 5 DEFAULT-TRUE + DEFAULT-FALSE reported separately
- [ ] Step 6 final scan returns empty before declaring campaign complete
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate(...)`, etc.); no real flag names or reader names leaked into artifact
- [ ] Sweep out diff-able vs prior ver's sweep (same shape, same fields)

## Traps

- **Stop at sample, not sweep**: campaign ending after "documented enough flags" sans `remaining` = sampling, not sweeping. Whole point: verifiable end condition.
- **Conflate gate-bearing w/ all extracted**: most strings in namespace ≠ gates. Reporting `total_unique` as denominator inflates work, depresses completion rate. Use `gate_calls` as denominator.
- **Trust one regex pattern across vers**: gate-reader fn names sometimes change between major vers. Re-validate Step 2 pattern when starting new sweep vs new binary.
- **Skip Step 6**: declaring completion at `remaining = 0` sans final dynamic-scan → can miss flags built via string concat. Final scan cheap, catches embarrassment.
- **Leak real names**: easy to paste real flag name from inventory into worked examples. Placeholder discipline (`acme_*`) exists for reason → keep methodology distinct from findings.
- **Cross-ref vs stale documented set**: if documented set built vs older binary, removed flags appear "documented" but no longer extracted, while genuinely undocumented flags appear remaining. Refresh documented set vs current binary before cross-ref.

## →

- `probe-feature-flag-state` — per-flag classification (downstream of this skill's inventory)
- `decode-minified-js-gates` — when reader-variant classification needed mid-sweep
- `monitor-binary-version-baselines` — longitudinal tracking across binary versions; sweeps re-runnable vs each baseline
- `redact-for-public-disclosure` — how to publish methodology from sweep without leaking inventory itself
- `conduct-empirical-wire-capture` — empirical validation of flags surfaced by sweep
