---
name: decode-minified-js-gates
description: >
  Classify gate call variants in minified JavaScript bundle. Covers
  context-window extraction around flag occurrence, identification of 4–6
  reader variants (sync boolean, sync config-object, bootstrap-aware TTL,
  truthy-only, async bootstrap, async bridge), default-value extraction
  (boolean / null / numeric / config-object literal), conjunction
  detection across `&&` predicates, kill-switch inversion detection, and
  production of gate-mechanics record feeding probe-feature-flag-state.
  Use when flag behavior cannot be inferred from name alone, when binary
  uses multiple reader libraries, or when config-object gates carry
  structured schemas distinct from boolean gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: caveman
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

Read call-site context around flag string in minified JavaScript bundle and produce gate-mechanics record: which reader variant, what default, what conjunction, what role. Where `probe-feature-flag-state` answers "is this gate on or off?", this skill answers prerequisite question — "what does this gate actually do?"

## When Use

- Flag surfaced by `sweep-flag-namespace` cannot be classified from name alone.
- Binary uses more than one gate-reader function, need to know which one flag invokes.
- Gate's "default" appears non-boolean (`{}`, `null`, numeric literal), need to decode actual reader variant.
- Suspect kill-switch (inverted gate) but cannot confirm from flag name.
- Predicate combines multiple gates with `&&`, need to enumerate co-gates before probing any.

## Inputs

- **Required**: minified JavaScript bundle file (`.js`, `.mjs`, `.bun`).
- **Required**: target flag string to decode, in literal form.
- **Optional**: list of known reader function names from prior decode pass — speeds Step 2.
- **Optional**: context-window size override; default is 300 chars before, 200 chars after flag occurrence.

## Steps

### Step 1: Extract Context Window

Locate flag string and capture asymmetric window around each occurrence. Pre-context (before flag) is where reader function name lives; post-context (after) is where default value and conjunction live.

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

For fast first pass, `grep -oE` with negative lookbehind via Perl-compatible regex catches same windows in one pipe.

**Got:** one or more context windows per flag occurrence, each ~500 chars. Multiple occurrences typically share same reader function but may differ in default or conjunction — inspect each independently.

**If fail:** if bundle too big for `dd`-per-occurrence (binary > 100MB or many occurrences), use `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` for structured-output approximation. If windows look corrupted, bundle may be UTF-16 or have non-ASCII delimiters; use `iconv` or treat as binary.

### Step 2: Identify Reader Variant

Minified gate libraries commonly expose 4–6 reader variants with different semantics. Reader function name is first cue; call signature is verifier.

Variant taxonomy (synthetic names — substitute actual minified identifiers from your bundle):

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

Match each context window against variant patterns:

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

If multiple variants appear for same flag (rare but real — flag read both sync at startup and async post-bootstrap), record each occurrence's variant separately. Probe results may differ.

**Got:** every gate-call occurrence tagged with one variant. Variant counts across whole sweep make binary-level distribution (e.g., "60% sync boolean, 30% config-object, 10% TTL").

**If fail:** if context window has no recognizable reader pattern, flag may not actually be gate-called — recheck call-site classification from `sweep-flag-namespace` Step 2. If window has reader name not in this taxonomy, document as new variant in research artifacts and decide whether warrants separate handling path.

### Step 3: Extract Default Value

Default is second positional arg to reader (or absent for truthy-only / async variants). Capture exact literal — `false`, `true`, `null`, `0`, string, or JSON config object.

```bash
# Boolean default extraction (sync boolean and TTL variants)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*(true|false)' /tmp/decode-windows.txt

# Config-object default — match the opening brace and capture until the
# matching brace at the same nesting depth. For minified bundles this is
# usually safe with a non-greedy match because objects rarely span lines.
grep -oE 'fvReader\("acme_widget_v3",\s*\{[^}]*\}' /tmp/decode-windows.txt

# Numeric default (rare but real for TTL or threshold gates)
grep -oE '\b(gate|ttlReader)\("acme_widget_v3",\s*[0-9]+' /tmp/decode-windows.txt
```

For config-object defaults, inspect JSON structure — keys often hint at gate's purpose (e.g., `{maxRetries: 3, timeoutMs: 5000}` is retry-policy config, not feature toggle).

**Got:** exact literal default per occurrence. Booleans unambiguous; config-objects need manual read of structure.

**If fail:** if config-object's matching brace falls outside context window, increase post-context size in Step 1. If default appears to be variable reference (e.g., `gate("flag", x)`), default computed at runtime — note as DYNAMIC and probe actual returned value via `probe-feature-flag-state`.

### Step 4: Detect Conjunctions and Kill Switches

Many gates participate in compound predicates. Conjunctions (`&&`) and inversions (`!`) change gate's effective role.

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

For each detected conjunction, list co-gate flag names. They are now part of probe scope — if target flag's evaluation depends on co-gates, probing target alone makes incomplete state.

For each detected inversion, mark flag as kill switch in gate-mechanics record. Kill switches flip meaning of default: kill switch with `default=false` is "feature on by default" (because `!false === true`), while normal gate with `default=false` is "feature off by default."

**Got:** conjunction list (possibly empty) and inversion flag (boolean) per occurrence.

**If fail:** if conjunction has more than 2 co-gates, predicate complex enough that regex misses structure. Read context window manually and document predicate shape verbatim in gate-mechanics record.

### Step 5: Classify Gate's Role

Synthesize Steps 2–4 into role classification. Roles drive different probe strategies and different integration risk.

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

**Got:** every gate-call occurrence has exactly one primary role. Some flags appear in multiple roles across occurrences (e.g., feature switch in one call site, conjunction member in another) — record each role independently.

**If fail:** if role does not fit table, binary uses gate library not yet documented in this skill. Add row with synthetic identifiers and contribute variant back to skill (or project-specific extension) for future investigators.

### Step 6: Produce Gate-Mechanics Record

Combine per-flag findings into structured record. JSONL convenient because each flag becomes one line, easy to merge with `sweep-flag-namespace` inventory.

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

Gate-mechanics record feeds `probe-feature-flag-state` Step 2 (gate-vs-event split): variant + role + conjunction list determines what observations count as evidence of LIVE / DARK / INDETERMINATE state.

**Got:** one JSONL record per flag (or per flag-occurrence if single flag has multiple distinct mechanics). Record reproducible — running procedure again against same binary makes same record.

**If fail:** if records vary across runs, upstream step non-deterministic. Most often regex in Step 1 missing or over-matching occurrences. Lock regexes for duration of campaign.

## Checks

- [ ] Step 1 produces one context window per flag occurrence; windows ~500 chars
- [ ] Step 2 tags each occurrence with exactly one reader variant from taxonomy
- [ ] Step 3 captures exact default literal (boolean, config-object, or DYNAMIC)
- [ ] Step 4 surfaces all conjunctions and kill-switch inversions present in windows
- [ ] Step 5 assigns one role per occurrence, drawn from role table
- [ ] Step 6 makes JSONL gate-mechanics record that diffs cleanly across re-runs
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate`, `fvReader`, etc.) — no real flag names, real reader names, or real config-object schemas
- [ ] Record consumable by `probe-feature-flag-state` (same flag identifiers, compatible field names)

## Pitfalls

- **Reading "default" as "behavior"**: gate with `default=true` is on by default *in this binary*, but server-side overrides may flip. Default tells baseline; runtime probe (`probe-feature-flag-state`) tells state.
- **Confuse config-object empty default with feature off**: `fvReader("flag", {})` returns empty object as default — but flag is *on* (gate evaluates to truthy). Treating `{}` as "off" misclassifies config-providers as feature switches.
- **Miss kill switches**: leading `!` before gate-call inverts meaning. Skipping Step 4 makes record that says "default=false, feature off by default" when truth is "default=false, feature ON by default because of inversion."
- **Probe one half of conjunction**: if `acme_widget_v3 && acme_user_in_cohort` is predicate, probing only `acme_widget_v3` and finding it LIVE does not mean feature is live — conjunction may still gate it off via cohort flag.
- **Trust reader names across versions**: minified identifiers can change between major versions. Taxonomy in Step 2 is by *signature* (call shape, return type, default position), not by name. When binary version changes, re-derive reader names from fresh decode pass.
- **Window too narrow**: 200/100 split misses config-object defaults that span 300+ chars. Defaults of 300/200 or 400/300 safer; tighten only if bundle huge and window cost matters.
- **Leak real reader names**: minified reader names sometimes look like nonsense (`a`, `b`, `Yc1`) and feel safe to paste verbatim. They are still findings — substitute synthetic placeholders before publishing methodology.

## See Also

- `probe-feature-flag-state` — uses gate-mechanics record to interpret runtime observations
- `sweep-flag-namespace` — makes candidate flag set this skill decodes
- `monitor-binary-version-baselines` — tracks reader-name changes across binary versions; re-derive Step 2 patterns when baselines flip
- `redact-for-public-disclosure` — how to publish gate-decoding methodology without exposing real reader names or schemas
- `conduct-empirical-wire-capture` — validates gate-mechanics record against runtime behavior
