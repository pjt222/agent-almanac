---
name: decode-minified-js-gates
description: >
  Classify gate call variants in a minified JavaScript bundle. Covers
  context-window extraction around a flag occurrence, identification of
  4–6 reader variants (sync boolean, sync config-object, bootstrap-aware
  TTL, truthy-only, async bootstrap, async bridge), default-value
  extraction (boolean / null / numeric / config-object literal),
  conjunction detection across `&&` predicates, kill-switch inversion
  detection, and production of a gate-mechanics record that feeds probe-
  feature-flag-state. Use when a flag's behavior cannot be inferred from
  its name alone, when the binary uses multiple reader libraries, or when
  config-object gates carry structured schemas distinct from boolean
  gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: caveman-lite
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

Read the call-site context around a flag string in a minified JavaScript bundle and produce a gate-mechanics record: which reader variant, what default, what conjunction, what role. Where `probe-feature-flag-state` answers "is this gate on or off?", this skill answers the prerequisite question — "what does this gate actually do?"

## When to Use

- A flag surfaced by `sweep-flag-namespace` cannot be classified from its name alone.
- The binary uses more than one gate-reader function and you need to know which one a flag invokes.
- A gate's "default" appears non-boolean (`{}`, `null`, a numeric literal) and you need to decode the actual reader variant.
- You suspect a kill-switch (inverted gate) but cannot confirm from the flag name.
- A predicate combines multiple gates with `&&` and you need to enumerate the co-gates before probing any of them.

## Inputs

- **Required**: a minified JavaScript bundle file (`.js`, `.mjs`, `.bun`).
- **Required**: a target flag string to decode, in literal form.
- **Optional**: a list of known reader function names from a prior decode pass — speeds Step 2.
- **Optional**: a context-window size override; default is 300 chars before, 200 chars after the flag occurrence.

## Procedure

### Step 1: Extract the Context Window

Locate the flag string and capture an asymmetric window around each occurrence. The pre-context (before the flag) is where the reader function name lives; the post-context (after) is where the default value and conjunction live.

```bash
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3                   # synthetic placeholder
PRE=300
POST=200

# All byte offsets where the flag string occurs
grep -boE "\"${FLAG}\"" "$BUNDLE" | cut -d: -f1 > /tmp/decode-offsets.txt
wc -l /tmp/decode-offsets.txt

# Capture an asymmetric window per occurrence
while read -r offset; do
  start=$((offset - PRE))
  [ "$start" -lt 0 ] && start=0
  length=$((PRE + POST))
  echo "=== offset $offset ==="
  dd if="$BUNDLE" bs=1 skip="$start" count="$length" 2>/dev/null
  echo
done < /tmp/decode-offsets.txt > /tmp/decode-windows.txt

less /tmp/decode-windows.txt
```

For a fast first pass, `grep -oE` with negative lookbehind via Perl-compatible regex catches the same windows in one pipe.

**Expected:** one or more context windows per flag occurrence, each ~500 chars. Multiple occurrences share the same reader function but may differ in default or conjunction — inspect each independently.

**On failure:** if the bundle is too large for `dd`-per-occurrence (binary > 100MB or many occurrences), use `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` for a structured-output approximation. If the windows look corrupted, the bundle may be UTF-16 or have non-ASCII delimiters; use `iconv` or treat as binary.

### Step 2: Identify the Reader Variant

Minified gate libraries commonly expose 4–6 reader variants with different semantics. The reader function name is the first cue; the call signature is the verifier.

The variant taxonomy (synthetic names — substitute the actual minified identifiers from your bundle):

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

Match each context window against the variant patterns:

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

If multiple variants appear for the same flag (rare but real — a flag read both sync at startup and async post-bootstrap), record each occurrence's variant separately. Probe results may differ.

**Expected:** every gate-call occurrence is tagged with one variant. Variant counts across the whole sweep produce a binary-level distribution (e.g., "60% sync boolean, 30% config-object, 10% TTL").

**On failure:** if a context window contains no recognizable reader pattern, the flag may not be gate-called — recheck the call-site classification from `sweep-flag-namespace` Step 2. If a window contains a reader name not in this taxonomy, document it as a new variant in your research artifacts and decide whether it warrants a separate handling path.

### Step 3: Extract the Default Value

The default is the second positional argument to the reader (or absent for truthy-only / async variants). Capture the exact literal — `false`, `true`, `null`, `0`, a string, or a JSON config object.

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

For config-object defaults, inspect the JSON structure — keys often hint at the gate's purpose (e.g., `{maxRetries: 3, timeoutMs: 5000}` is a retry-policy config, not a feature toggle).

**Expected:** an exact literal default per occurrence. Booleans are unambiguous; config-objects need a manual read of the structure.

**On failure:** if a config-object's matching brace falls outside the context window, increase the post-context size in Step 1. If a default appears to be a variable reference (e.g., `gate("flag", x)`), the default is computed at runtime — note this as DYNAMIC and probe the actual returned value via `probe-feature-flag-state`.

### Step 4: Detect Conjunctions and Kill Switches

Many gates participate in compound predicates. Conjunctions (`&&`) and inversions (`!`) change the gate's effective role.

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

For each detected conjunction, list the co-gate flag names. They are now part of the probe scope — if the target flag's evaluation depends on co-gates, probing the target alone produces incomplete state.

For each detected inversion, mark the flag as a kill switch in the gate-mechanics record. Kill switches flip the meaning of the default: a kill switch with `default=false` is "feature on by default" (because `!false === true`), while a normal gate with `default=false` is "feature off by default."

**Expected:** a conjunction list (possibly empty) and an inversion flag (boolean) per occurrence.

**On failure:** if a conjunction includes more than 2 co-gates, the predicate is complex enough that the regex misses the structure. Read the context window manually and document the predicate shape verbatim in the gate-mechanics record.

### Step 5: Classify the Gate's Role

Synthesize Steps 2–4 into a role classification. Roles drive different probe strategies and different integration risk.

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

**Expected:** every gate-call occurrence has exactly one primary role. Some flags appear in multiple roles across occurrences (e.g., a feature switch in one call site, a conjunction member in another) — record each role independently.

**On failure:** if a role does not fit the table, the binary is using a gate library not yet documented in this skill. Add a row with synthetic identifiers and contribute the variant back to the skill (or a project-specific extension) for future investigators.

### Step 6: Produce the Gate-Mechanics Record

Combine the per-flag findings into a structured record. JSONL is convenient because each flag becomes one line, easy to merge with `sweep-flag-namespace` inventory.

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

The gate-mechanics record feeds `probe-feature-flag-state` Step 2 (gate-vs-event disambiguation): the variant + role + conjunction list determines what observations count as evidence of LIVE / DARK / INDETERMINATE state.

**Expected:** one JSONL record per flag (or per flag-occurrence if a single flag has multiple distinct mechanics). The record is reproducible — running the procedure again against the same binary produces the same record.

**On failure:** if records vary across runs, an upstream step is non-deterministic. Most often this is the regex in Step 1 missing or over-matching occurrences. Lock the regexes for the duration of a campaign.

## Validation

- [ ] Step 1 produces one context window per flag occurrence; windows are ~500 chars
- [ ] Step 2 tags each occurrence with exactly one reader variant from the taxonomy
- [ ] Step 3 captures the exact default literal (boolean, config-object, or DYNAMIC)
- [ ] Step 4 surfaces all conjunctions and kill-switch inversions present in the windows
- [ ] Step 5 assigns one role per occurrence, drawn from the role table
- [ ] Step 6 produces a JSONL gate-mechanics record that diffs cleanly across re-runs
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate`, `fvReader`, etc.) — no real flag names, real reader names, or real config-object schemas
- [ ] The record is consumable by `probe-feature-flag-state` (same flag identifiers, compatible field names)

## Common Pitfalls

- **Reading "default" as "behavior"**: a gate with `default=true` is on by default *in this binary*, but server-side overrides may flip it. The default tells you the baseline; the runtime probe (`probe-feature-flag-state`) tells you the state.
- **Conflating config-object empty default with feature off**: `fvReader("flag", {})` returns an empty object as the default — but the flag is *on* (the gate evaluates to truthy). Treating `{}` as "off" misclassifies config-providers as feature switches.
- **Missing kill switches**: a leading `!` before the gate-call inverts the meaning. Skipping Step 4 produces a record that says "default=false, feature off by default" when the truth is "default=false, feature ON by default because of the inversion."
- **Probing one half of a conjunction**: if `acme_widget_v3 && acme_user_in_cohort` is the predicate, probing only `acme_widget_v3` and finding it LIVE does not mean the feature is live — the conjunction may still gate it off via the cohort flag.
- **Trusting reader names across versions**: minified identifiers can change between major versions. The taxonomy in Step 2 is by *signature* (call shape, return type, default position), not by name. When a binary version changes, re-derive the reader names from a fresh decode pass.
- **Window too narrow**: a 200/100 split misses config-object defaults that span 300+ chars. Defaults of 300/200 or 400/300 are safer; tighten only if the bundle is huge and the window cost matters.
- **Leaking real reader names**: minified reader names sometimes look like nonsense (`a`, `b`, `Yc1`) and feel safe to paste verbatim. They are still findings — substitute synthetic placeholders before publishing the methodology.

## Related Skills

- `probe-feature-flag-state` — uses the gate-mechanics record to interpret runtime observations
- `sweep-flag-namespace` — produces the candidate flag set this skill decodes
- `monitor-binary-version-baselines` — tracks reader-name changes across binary versions; re-derive Step 2 patterns when baselines flip
- `redact-for-public-disclosure` — how to publish gate-decoding methodology without exposing real reader names or schemas
- `conduct-empirical-wire-capture` — validates the gate-mechanics record against runtime behavior
