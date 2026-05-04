---
name: decode-minified-js-gates
description: >
  Classify gate call variants in minified JS bundle. Covers ctx-window
  extraction around flag occurrence, ID of 4–6 reader variants (sync bool,
  sync config-object, bootstrap-aware TTL, truthy-only, async bootstrap,
  async bridge), default-value extraction (bool / null / numeric / config-
  object literal), conjunction detection across `&&` predicates, kill-switch
  inversion detection, gate-mechanics record → feeds probe-feature-flag-state.
  Use when flag behavior unclear from name, when binary uses multiple reader
  libs, or when config-object gates carry structured schemas distinct from
  bool gates.
license: MIT
allowed-tools: Read Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, minified-js, gate-decoding, classification
  locale: caveman-ultra
  source_locale: en
  source_commit: 90b159ab
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-05-04"
---

# Decode Minified JS Gates

Read call-site ctx around flag string in minified JS bundle → produce gate-mechanics record: which reader variant, what default, what conjunction, what role. `probe-feature-flag-state` answers "is gate on/off?" → this skill answers prerequisite: "what does gate actually do?"

## Use When

- Flag surfaced by `sweep-flag-namespace` unclassifiable from name alone
- Binary uses >1 gate-reader fn → need to know which a flag invokes
- Gate "default" non-bool (`{}`, `null`, numeric literal) → decode actual reader variant
- Suspect kill-switch (inverted gate) but can't confirm from name
- Predicate combines gates w/ `&&` → enumerate co-gates before probing

## In

- **Required**: minified JS bundle file (`.js`, `.mjs`, `.bun`)
- **Required**: target flag string to decode, literal form
- **Optional**: known reader fn names from prior decode pass → speeds Step 2
- **Optional**: ctx-window size override; default 300 chars before, 200 chars after flag occurrence

## Do

### Step 1: Extract Ctx Window

Locate flag string → capture asymmetric window around each occurrence. Pre-ctx (before flag) → reader fn name. Post-ctx (after) → default value + conjunction.

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

Fast first pass: `grep -oE` w/ negative lookbehind via PCRE catches same windows in one pipe.

→ one or more ctx windows per flag occurrence, ~500 chars each. Multi-occurrences typically share reader fn but may differ in default or conjunction → inspect each independently.

If err: bundle too large for `dd`-per-occurrence (binary >100MB or many occurrences) → use `rg -B 5 -A 3 "$FLAG" "$BUNDLE"` for structured-output approx. Windows look corrupt → bundle may be UTF-16 or have non-ASCII delimiters → use `iconv` or treat as binary.

### Step 2: ID Reader Variant

Minified gate libs commonly expose 4–6 reader variants w/ different semantics. Reader fn name = first cue; call signature = verifier.

Variant taxonomy (synthetic names — substitute actual minified IDs from your bundle):

| Variant | Synthetic shape | Returns | Common usage |
|---|---|---|---|
| **Sync boolean** | `gate("flag", false)` or `gate("flag", true)` | `boolean` | Standard on/off feature switches |
| **Sync config-object** | `fvReader("flag", {key: value})` | JSON object | Structured config (delays, allowlists, model names) |
| **Bootstrap-aware TTL** | `ttlReader("flag", default, ttlMs)` | `boolean` (cached) | Startup-path gates before remote config arrives |
| **Truthy-only** | `truthyReader("flag")` | truthy/falsy | Quick checks; no explicit default |
| **Async bootstrap** | `asyncReader("flag")` | `Promise<boolean>` | Gates resolved post-bootstrap |
| **Async bridge** | `bridgeReader("flag")` | `Promise<boolean>` | Bridge/relay-channel gates with separate evaluation path |

Match each ctx window vs variant patterns:

```bash
# Test for variant patterns. Replace the synthetic reader names with the
# actual minified identifiers found in the bundle.
grep -oE '\b(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt | sort | uniq -c
```

Multi-variants for same flag (rare but real — flag read both sync at startup + async post-bootstrap) → record each occurrence's variant separately. Probe results may differ.

→ every gate-call occurrence tagged w/ one variant. Variant counts across whole sweep produce binary-level distribution (e.g., "60% sync bool, 30% config-object, 10% TTL").

If err: ctx window has no recognizable reader pattern → flag may not actually be gate-called → recheck call-site classification from `sweep-flag-namespace` Step 2. Window has reader name not in taxonomy → document as new variant in research artifacts → decide whether warrants separate handling.

### Step 3: Extract Default Value

Default = second positional arg to reader (or absent for truthy-only / async variants). Capture exact literal — `false`, `true`, `null`, `0`, string, or JSON config object.

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

Config-object defaults → inspect JSON structure. Keys often hint at gate's purpose (e.g., `{maxRetries: 3, timeoutMs: 5000}` = retry-policy config, not feature toggle).

→ exact literal default per occurrence. Bools unambiguous; config-objects need manual read of structure.

If err: config-object's matching brace falls outside ctx window → increase post-ctx size in Step 1. Default appears as var ref (e.g., `gate("flag", x)`) → default computed at runtime → note as DYNAMIC, probe actual returned value via `probe-feature-flag-state`.

### Step 4: Detect Conjunctions + Kill Switches

Many gates participate in compound predicates. Conjunctions (`&&`) + inversions (`!`) change gate's effective role.

```bash
# Conjunction detection: gate-call followed by `&&` and another gate-call
# within the same predicate window
grep -oE '(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"[^)]*\)\s*&&\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_[a-zA-Z0-9_]+"' /tmp/decode-windows.txt

# Kill-switch detection: leading `!` before the gate-call
grep -oE '!\s*(gate|fvReader|ttlReader|truthyReader|asyncReader|bridgeReader)\("acme_widget_v3"' /tmp/decode-windows.txt
```

Each detected conjunction → list co-gate flag names. Now part of probe scope. Target flag's eval depends on co-gates → probing target alone produces incomplete state.

Each detected inversion → mark flag as kill switch in gate-mechanics record. Kill switches flip meaning of default: kill switch w/ `default=false` = "feature on by default" (since `!false === true`), normal gate w/ `default=false` = "feature off by default."

→ conjunction list (possibly empty) + inversion flag (bool) per occurrence.

If err: conjunction has >2 co-gates → predicate complex enough regex misses structure. Read ctx window manually → document predicate shape verbatim in gate-mechanics record.

### Step 5: Classify Gate's Role

Synthesize Steps 2–4 → role classification. Roles drive different probe strategies + integration risk.

| Role | Signature | Implication |
|---|---|---|
| **Feature switch** | sync boolean, no inversion, no conjunction | Standard on/off; probe directly |
| **Config provider** | sync config-object (`fvReader`) | Read returned object; default-empty `{}` ≠ feature off |
| **Lifecycle guard** | bootstrap-aware TTL or async bootstrap | State depends on bootstrap timing; probe at multiple points |
| **Kill switch** | inverted gate, default-false | Feature on for users by default; flag flips it OFF |
| **Conjunction member** | any variant with `&&` co-gate | Cannot evaluate alone; co-gates are part of the probe scope |
| **Bridge gate** | async bridge variant | Probe must occur over the bridge channel, not the main path |

→ every gate-call occurrence has exactly one primary role. Some flags appear in multiple roles across occurrences (e.g., feature switch in one call site, conjunction member in another) → record each role independently.

If err: role doesn't fit table → binary uses gate lib not yet documented in skill. Add row w/ synthetic IDs → contribute variant back to skill (or project-specific extension) for future investigators.

### Step 6: Produce Gate-Mechanics Record

Combine per-flag findings → structured record. JSONL convenient → each flag = one line, easy merge w/ `sweep-flag-namespace` inventory.

```jsonl
{"flag":"acme_widget_v3","variant":"sync_boolean","default":false,"role":"feature_switch","conjunctions":[],"inverted":false,"occurrences":3}
{"flag":"acme_retry_policy","variant":"sync_config_object","default":{"maxRetries":3,"timeoutMs":5000},"role":"config_provider","conjunctions":[],"inverted":false,"occurrences":1}
{"flag":"acme_legacy_path","variant":"sync_boolean","default":false,"role":"kill_switch","conjunctions":[],"inverted":true,"occurrences":2}
{"flag":"acme_beta_feature","variant":"sync_boolean","default":false,"role":"conjunction_member","conjunctions":["acme_beta_program_active"],"inverted":false,"occurrences":1}
```

Gate-mechanics record feeds `probe-feature-flag-state` Step 2 (gate-vs-event disambig): variant + role + conjunction list determines what observations count as evidence of LIVE / DARK / INDETERMINATE state.

→ one JSONL record per flag (or per flag-occurrence if single flag has multiple distinct mechanics). Record reproducible — running proc again vs same binary produces same record.

If err: records vary across runs → upstream step non-deterministic. Most often: regex in Step 1 missing or over-matching occurrences. Lock regexes for duration of campaign.

## Check

- [ ] Step 1 produces one ctx window per flag occurrence; windows ~500 chars
- [ ] Step 2 tags each occurrence w/ exactly one reader variant from taxonomy
- [ ] Step 3 captures exact default literal (bool, config-object, or DYNAMIC)
- [ ] Step 4 surfaces all conjunctions + kill-switch inversions in windows
- [ ] Step 5 assigns one role per occurrence, drawn from role table
- [ ] Step 6 produces JSONL gate-mechanics record diffing cleanly across re-runs
- [ ] All worked examples use synthetic placeholders (`acme_*`, `gate`, `fvReader`, etc.) — no real flag names, reader names, or config-object schemas
- [ ] Record consumable by `probe-feature-flag-state` (same flag IDs, compatible field names)

## Traps

- **Read "default" as "behavior"**: gate w/ `default=true` = on by default *in this binary*, but server overrides may flip. Default = baseline; runtime probe (`probe-feature-flag-state`) = state.
- **Conflate config-object empty default w/ feature off**: `fvReader("flag", {})` returns empty object as default — but flag = *on* (gate evals truthy). Treating `{}` as "off" misclassifies config-providers as feature switches.
- **Miss kill switches**: leading `!` before gate-call inverts meaning. Skipping Step 4 → record says "default=false, feature off by default" when truth = "default=false, feature ON by default due to inversion."
- **Probe one half of conjunction**: if `acme_widget_v3 && acme_user_in_cohort` = predicate, probing only `acme_widget_v3` and finding LIVE ≠ feature live → conjunction may still gate off via cohort flag.
- **Trust reader names across vers**: minified IDs change between major vers. Step 2 taxonomy by *signature* (call shape, return type, default position), not name. Binary ver changes → re-derive reader names from fresh decode pass.
- **Window too narrow**: 200/100 split misses config-object defaults spanning 300+ chars. Defaults of 300/200 or 400/300 safer; tighten only if bundle huge + window cost matters.
- **Leak real reader names**: minified reader names sometimes look like nonsense (`a`, `b`, `Yc1`) → feel safe to paste verbatim. Still findings → substitute synthetic placeholders before publishing methodology.

## →

- `probe-feature-flag-state` — uses gate-mechanics record to interpret runtime observations
- `sweep-flag-namespace` — produces candidate flag set this skill decodes
- `monitor-binary-version-baselines` — tracks reader-name changes across binary versions; re-derive Step 2 patterns when baselines flip
- `redact-for-public-disclosure` — how to publish gate-decoding methodology without exposing real reader names or schemas
- `conduct-empirical-wire-capture` — validates gate-mechanics record vs runtime behavior
