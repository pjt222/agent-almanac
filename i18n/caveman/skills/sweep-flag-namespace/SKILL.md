---
name: sweep-flag-namespace
description: >
  Bulk-extract every candidate flag from binary namespace, build extraction
  inventory with occurrence counts and call-type tags, cross-reference
  against documented set, track completeness across probe campaigns until
  undocumented remainder hits zero. Covers namespace prefix harvest,
  gate-vs-telemetry split at call-site level, completeness metrics,
  DEFAULT-TRUE population report, final completion confirmation scan. Use
  upstream of probe-feature-flag-state when need complete catalog not
  sample, or when prior wave campaign needs verifiable end condition.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, completeness, sweep, inventory
  locale: caveman
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Sweep Flag Namespace

Pull every flag candidate from binary namespace, split gate calls from telemetry, track completeness against running documented set until undocumented remainder hits zero. Where `probe-feature-flag-state` classifies one flag at time, this skill makes catalog those probes work against — and confirms when catalog complete.

## When Use

- Flag-discovery campaign mid-flight, need verifiable stop condition not guess at "enough" flags.
- Binary flag namespace big (hundreds of candidates), sample approach risks missing real gates.
- Need to report DEFAULT-TRUE flags separate from DEFAULT-FALSE — high-signal subset of any namespace.
- Running multi-wave documentation against binary, want each wave's completion metric in writing.
- Suspect prior campaign ended too early, need fresh sweep to confirm or refute.

## Inputs

- **Required**: binary or bundle file readable.
- **Required**: namespace prefix (synthetic: `acme_*`) identifying flags of system under study.
- **Required**: working documentation set — running list of flag write-ups campaign produced so far.
- **Optional**: gate-reader function names (synthetic: `gate(...)`, `flag(...)`, `isEnabled(...)`) — precomputing speeds Step 2.
- **Optional**: telemetry/emit function names — same reason, opposite sign.
- **Optional**: prior sweep output for this binary at earlier version, for delta analysis.

## Steps

### Step 1: Harvest All Strings Matching Namespace Prefix

Pull every literal in binary matching namespace prefix, regardless of call-site role. Goal here: *coverage*, not classification.

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

**Got:** dedup candidate list and frequency-sorted occurrence file. High counts (≥10) hint at gate-heavy strings; single-occurrence strings more likely telemetry event names or static labels.

**If fail:** unique count 0 means prefix wrong (typo, namespace boundary mismatch, harness uses different convention than expected). Count over ~5000 means prefix too broad — narrow before continuing or inventory becomes unmanageable.

### Step 2: Split Gate Calls from Telemetry from Static Labels

Same string, different role. Splitting roles at call-site makes inventory actionable. Reuse split discipline from `probe-feature-flag-state` Step 2.

For each candidate, classify each occurrence:

- **gate-call** — string is first arg to gate-reader function (`gate("$FLAG", default)`, `flag("$FLAG", ...)`, `isEnabled("$FLAG")`, etc.).
- **telemetry-call** — string is first arg to emit/log/track function.
- **env-var-check** — string appears in `process.env.X` lookup or equivalent.
- **static-label** — string appears in registry, map, or comment with no behavioral hookup.

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

**Got:** inventory record per unique string of form `{flag, total_occurrences, gate_call_count, telemetry_count, static_label_count, env_var_count}`. Gate-call count is actionable column; rest are noise filters.

**If fail:** if every candidate has zero gate-call hits, gate-reader pattern wrong. Either binary uses reader function this regex misses, or namespace is pure telemetry (not flag namespace at all). Run `decode-minified-js-gates` on few candidates to learn actual reader names before re-running.

### Step 3: Build Extraction Inventory

Consolidate per-string records into one inventory artifact. CSV or JSONL — pick one, stick to it for diffing across waves.

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

- **`total_unique`**: every string prefix matched (before gate filter)
- **`gate_calls`**: subset with at least one gate-call occurrence — working set for campaign

**Got:** inventory file with one record per unique gate-bearing flag. Gate count typically a fraction of `total_unique` (commonly 5–20%), so two numbers should differ noticeably.

**If fail:** if inventory empty or `gate_calls` ≈ `total_unique`, gate-vs-telemetry split in Step 2 producing meaningless splits. Revisit reader-name regex.

### Step 4: Cross-Reference Against Documented Set

Completeness metric depends on documented set — flags campaign already wrote up in research artifacts. Cross-reference, then report what remains.

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

Completeness metric is `remaining` — when hits 0, documented set covers every gate-bearing flag in namespace.

**Got:** three counts. Early in campaign, `remaining` should be big fraction of `extracted`. Each wave drops `remaining` until converges to 0. Track trajectory across waves to spot plateau (stalled wave that keeps re-investigating documented flags).

**If fail:** if `documented` exceeds `extracted`, documented set has stale entries (flags removed in this binary version). Compute `comm -13` instead to surface obsolete documented names; archive as REMOVED in next campaign artifact.

### Step 5: Report DEFAULT-TRUE Population

Within gate-bearing flag set, split flags whose binary default is `true` from those whose default is `false` (or non-boolean). DEFAULT-TRUE flags are on for all users without server-side override — highest-signal subset.

```bash
# Heuristic: gate-call shape `gate("flag_name", true)` indicates DEFAULT-TRUE
DEFAULT_TRUE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*!?true\b'
grep -oE "$DEFAULT_TRUE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-true.txt

DEFAULT_FALSE_PATTERN='(gate|flag|isEnabled)\(\s*"acme_[a-zA-Z0-9_]+",\s*false\b'
grep -oE "$DEFAULT_FALSE_PATTERN" "$BUNDLE" | grep -oE '"acme_[a-zA-Z0-9_]+"' | sort -u > /tmp/sweep-default-false.txt

echo "DEFAULT-TRUE:  $(wc -l < /tmp/sweep-default-true.txt)"
echo "DEFAULT-FALSE: $(wc -l < /tmp/sweep-default-false.txt)"
```

For flags with non-boolean defaults (config objects, TTL readers, async readers), use `decode-minified-js-gates` to classify reader variant — they make different default-shape and should report in own bucket.

**Got:** typical split is 10–20% DEFAULT-TRUE, 80–90% DEFAULT-FALSE. Binary at extremes (90%+ TRUE or 90%+ FALSE) unusual and worth investigating — may signal release-stage convention (everything default-on for testing, everything default-off for staged rollout).

**If fail:** if DEFAULT-TRUE and DEFAULT-FALSE counts together don't cover gate-bearing inventory, remainder uses non-boolean readers. Run `decode-minified-js-gates` against gap to classify reader variants in use.

### Step 6: Confirm Completion

When `remaining = 0` from Step 4, run final scan: search for gate-call occurrences of namespace-matching strings NOT in documented set. Catches any flag missed by harvest in Step 1 (e.g., string concatenation hiding literal from simple grep).

```bash
# Search for gate-call shapes containing the namespace prefix, not constrained
# to literal-string occurrences. Loosens Step 1's grep to catch dynamic forms.
DYNAMIC_PATTERN='(gate|flag|isEnabled)\(\s*[^"]*"acme_'
grep -nE "$DYNAMIC_PATTERN" "$BUNDLE" | head -50

# Alternative: ripgrep with multiline for split-string concatenation
rg -U "(gate|flag|isEnabled)\(\s*\"acme_(\\\\\"|[a-zA-Z0-9_])+\"" "$BUNDLE"
```

Compare gate-call hits against `/tmp/sweep-documented.txt`. If any hit references flag not in documented set, return to Step 1 with refined extraction (e.g., handle dynamic-construction case). If empty: campaign complete.

**Got:** final scan returns either empty result (campaign complete) or small remainder (typically <5 flags, usually surfacing dynamic constructions or alternate readers).

**If fail:** if final scan returns big remainder when Step 4 said `remaining = 0`, Step 1 systematically under-extracted. Investigate patterns missed (dynamic strings, alternate quote chars, alternate reader functions) and re-run from Step 1 with tighter regex.

## Checks

- [ ] Step 1 unique count non-zero and within order of magnitude of expectation
- [ ] Step 2 produces meaningful gate-vs-telemetry split (gate-call count is fraction, not all or none, of total occurrences)
- [ ] Step 3 inventory is one record per gate-bearing flag, in CSV or JSONL
- [ ] Step 4 reports `total_unique`, `gate_calls`, `documented`, `remaining` — and metric reaches 0 by end of campaign
- [ ] Step 5 DEFAULT-TRUE and DEFAULT-FALSE reported separately
- [ ] Step 6 final scan returns empty before declaring campaign complete
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate(...)`, etc.); no real flag names or reader names leaked into artifact
- [ ] Sweep output diff-able against prior version's sweep (same shape, same fields)

## Pitfalls

- **Stop at sample, not sweep**: campaign that ends after "documented enough flags" without computing `remaining` is sampling, not sweeping. Whole point of this skill is verifiable end condition.
- **Confuse gate-bearing with all extracted**: most strings in namespace are not gates. Reporting `total_unique` as campaign denominator inflates work and depresses apparent completion rate. Use `gate_calls` as denominator.
- **Trust one regex pattern across versions**: gate-reader function names sometimes change between major versions. Re-validate Step 2 pattern when starting new sweep against new binary.
- **Skip Step 6**: declaring completion at `remaining = 0` without final dynamic-scan can miss flags built via string concatenation. Final scan cheap and catches embarrassment.
- **Leak real names**: easy to accidentally paste real flag name from inventory into skill's worked examples. Placeholder discipline (`acme_*`) exists for reason — keep methodology distinct from findings.
- **Cross-reference against stale documented set**: if documented set built against older binary, removed flags appear "documented" but no longer extracted, while genuinely undocumented flags appear remaining. Refresh documented set against current binary before cross-reference.

## See Also

- `probe-feature-flag-state` — per-flag classification (downstream of this skill's inventory)
- `decode-minified-js-gates` — when reader-variant classification needed mid-sweep
- `monitor-binary-version-baselines` — longitudinal tracking across binary versions; sweeps re-run against each baseline
- `redact-for-public-disclosure` — how to publish sweep methodology without leaking inventory itself
- `conduct-empirical-wire-capture` — empirical validation of flags surfaced by sweep
