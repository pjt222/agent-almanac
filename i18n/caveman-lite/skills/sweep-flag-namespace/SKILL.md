---
name: sweep-flag-namespace
description: >
  Bulk-extract every candidate flag from a binary namespace, build an
  extraction inventory with occurrence counts and call-type tags, cross-
  reference against a documented set, and track completeness across probe
  campaigns until the undocumented remainder reaches zero. Covers namespace
  prefix harvesting, gate-vs-telemetry disambiguation at the call-site
  level, completeness metrics, DEFAULT-TRUE population reporting, and a
  final completion confirmation scan. Use upstream of probe-feature-flag-
  state when you need a complete catalog rather than a sample, or when a
  prior wave-based campaign needs a verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: caveman-lite
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

Exhaustively extract every flag candidate from a binary's namespace, separate gate calls from telemetry, and track completeness against a running documented set until undocumented remainder is zero. Where `probe-feature-flag-state` classifies one flag at a time, this skill produces the catalog those probes operate against — and confirms when the catalog is complete.

## When to Use

- A flag-discovery campaign is mid-flight and you need a verifiable stopping condition rather than guessing whether you have "enough" flags.
- A binary's flag namespace is large (hundreds of candidate strings) and a sample-based approach risks missing meaningful gates.
- You need to report DEFAULT-TRUE flags separately from DEFAULT-FALSE — the high-signal subset of any namespace.
- You are running multi-wave documentation against a binary and want each wave's completion metric in writing.
- You suspect a previous campaign ended prematurely and need to confirm or refute that with a fresh sweep.

## Inputs

- **Required**: binary or bundle file you can read.
- **Required**: namespace prefix (synthetic example: `acme_*`) that identifies flags belonging to the system under study.
- **Required**: working documentation set — running list of flag write-ups your campaign has produced so far.
- **Optional**: gate-reader function names (synthetic: `gate(...)`, `flag(...)`, `isEnabled(...)`) — precomputing these speeds Step 2.
- **Optional**: telemetry/emit function names — same reason, opposite sign.
- **Optional**: prior sweep output for this binary at an earlier version, for delta analysis.

## Procedure

### Step 1: Harvest All Strings Matching the Namespace Prefix

Extract every literal in the binary that matches the namespace prefix, regardless of call-site role. Goal at this step is *coverage*, not classification.

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

**Expected:** deduplicated candidate list and frequency-sorted occurrence file. Very high counts (≥10) suggest gate-heavy strings; single-occurrence strings are more likely telemetry event names or static labels.

**On failure:** if unique count is 0, the prefix is wrong (typo, namespace boundary mismatch, harness uses a different convention than expected). If count exceeds ~5000, the prefix is too broad — narrow it before continuing or the inventory becomes unmanageable.

### Step 2: Disambiguate Gate Calls from Telemetry from Static Labels

Same string, different role. Distinguishing roles at the call-site is what makes the inventory actionable. Reuse the disambiguation discipline from `probe-feature-flag-state` Step 2.

For each candidate, classify each occurrence:

- **gate-call** — string is the first argument to a gate-reader function (`gate("$FLAG", default)`, `flag("$FLAG", ...)`, `isEnabled("$FLAG")`, etc.).
- **telemetry-call** — string is the first argument to an emit/log/track function.
- **env-var-check** — string appears in a `process.env.X` lookup or equivalent.
- **static-label** — string appears in a registry, map, or comment with no behavioral hookup.

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

**Expected:** an inventory record per unique string of the form `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`. Gate-call count is the actionable column; the rest are noise filters.

**On failure:** if every candidate has zero gate-call hits, the gate-reader pattern is wrong. Either the binary uses a reader function this regex misses, or the namespace is purely telemetry (not a flag namespace at all). Run `decode-minified-js-gates` against a few candidates to learn the actual reader names before re-running this step.

### Step 3: Build the Extraction Inventory

Consolidate per-string records into one inventory artifact. CSV or JSONL — pick one and stick to it for diffing across waves.

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

- **`total_unique`**: every string the prefix matched (prior to gate filtering)
- **`gate_calls`**: subset that has at least one gate-call occurrence — this is the working set for the campaign

**Expected:** inventory file with one record per unique gate-bearing flag. Gate count is a fraction of `total_unique` (commonly 5–20%), so the two numbers should differ noticeably.

**On failure:** if inventory is empty or `gate_calls` ≈ `total_unique`, gate-vs-telemetry disambiguation in Step 2 is producing meaningless splits. Revisit the reader-name regex.

### Step 4: Cross-Reference Against the Documented Set

Completeness metric depends on a documented set — flags your campaign has already written up in research artifacts. Cross-reference, then report what remains.

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

Completeness metric is `remaining` — when it reaches 0, the documented set covers every gate-bearing flag in the namespace.

**Expected:** three counts. Early in a campaign, `remaining` should be a substantial fraction of `extracted`. Each wave reduces `remaining` until it converges to 0. Track the trajectory across waves to detect plateau (a stalled wave that keeps re-investigating documented flags).

**On failure:** if `documented` exceeds `extracted`, the documented set contains stale entries (flags removed in this binary version). Compute `comm -13` instead to surface the obsolete documented names; archive them as REMOVED in the next campaign artifact.

### Step 5: Report the DEFAULT-TRUE Population

Within the gate-bearing flag set, separate flags whose binary default is `true` from those whose default is `false` (or non-boolean). DEFAULT-TRUE flags are on for all users without server-side override, making them the highest-signal subset.

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

For flags with non-boolean defaults (config objects, TTL readers, async readers), use `decode-minified-js-gates` to classify the reader variant — they produce a different default-shape and should be reported in their own bucket.

**Expected:** typical split is 10–20% DEFAULT-TRUE, 80–90% DEFAULT-FALSE. A binary at the extremes (90%+ TRUE or 90%+ FALSE) is unusual and worth investigating — may indicate a release-stage convention (everything default-on for testing, everything default-off for staged rollout).

**On failure:** if DEFAULT-TRUE and DEFAULT-FALSE counts together don't cover the gate-bearing inventory, the remainder uses non-boolean readers. Run `decode-minified-js-gates` against the gap to classify the reader variants in use.

### Step 6: Confirm Completion

When `remaining = 0` from Step 4, run a final scan: search for gate-call occurrences of namespace-matching strings that are NOT in the documented set. This catches any flag missed by the harvest in Step 1 (e.g., string concatenation that hides the literal from a simple grep).

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

Compare gate-call hits against `/tmp/sweep-documented.txt`. If any hit references a flag not in the documented set, return to Step 1 with a refined extraction (e.g., handle the dynamic-construction case). If empty: the campaign is complete.

**Expected:** the final scan returns either an empty result (campaign complete) or a small remainder (typically <5 flags, surfacing dynamic constructions or alternate readers).

**On failure:** if the final scan returns a large remainder when Step 4 said `remaining = 0`, Step 1 systematically under-extracted. Investigate the patterns missed (dynamic strings, alternate quote chars, alternate reader functions) and re-run from Step 1 with a tighter regex.

## Validation

- [ ] Step 1 unique count is non-zero and within an order of magnitude of expectation
- [ ] Step 2 produces a meaningful gate-vs-telemetry split (gate-call count is a fraction, not all or none, of total occurrences)
- [ ] Step 3 inventory is one record per gate-bearing flag, in CSV or JSONL
- [ ] Step 4 reports `total_unique`, `gate_calls`, `documented`, `remaining` — and the metric reaches 0 by end of campaign
- [ ] Step 5 DEFAULT-TRUE and DEFAULT-FALSE are reported separately
- [ ] Step 6 final scan returns empty before declaring the campaign complete
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate(...)`, etc.); no real flag names or reader names leaked into the artifact
- [ ] Sweep output is diff-able against a prior version's sweep (same shape, same fields)

## Common Pitfalls

- **Stopping at sample, not sweep**: a campaign that ends after "we've documented enough flags" without computing `remaining` is sampling, not sweeping. The whole point of this skill is the verifiable end condition.
- **Conflating gate-bearing with all extracted**: most strings in a namespace are not gates. Reporting `total_unique` as the campaign denominator inflates the work and depresses the apparent completion rate. Use `gate_calls` as the denominator.
- **Trusting one regex pattern across versions**: gate-reader function names sometimes change between major versions. Re-validate the Step 2 pattern when starting a new sweep against a new binary.
- **Skipping Step 6**: declaring completion at `remaining = 0` without the final dynamic-scan can miss flags constructed via string concatenation. The final scan is cheap and catches the embarrassment.
- **Leaking real names**: it is easy to accidentally paste a real flag name from your inventory into the skill's worked examples. The placeholder discipline (`acme_*`) exists for a reason — keep methodology distinct from findings.
- **Cross-referencing against a stale documented set**: if the documented set was built against an older binary, flags that were removed will appear "documented" but no longer extracted, while genuinely undocumented flags appear remaining. Refresh the documented set against the current binary before the cross-reference.

## Related Skills

- `probe-feature-flag-state` — per-flag classification (downstream of this skill's inventory)
- `decode-minified-js-gates` — when reader-variant classification is needed mid-sweep
- `monitor-binary-version-baselines` — longitudinal tracking across binary versions; sweeps can be re-run against each baseline
- `redact-for-public-disclosure` — how to publish methodology from a sweep without leaking the inventory itself
- `conduct-empirical-wire-capture` — empirical validation of flags surfaced by the sweep
