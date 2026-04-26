---
name: probe-feature-flag-state
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Probe runtime state of named feature flag in CLI binary. 4-prong evidence
  protocol (binary strings, live invocation, on-disk state, platform cache),
  4-state classification (LIVE/DARK/INDETERMINATE/UNKNOWN), gate-vs-event
  disambiguation, conjunction-gate, skill-substitution scenarios. Use → verify
  documented/inferred capability rolled out, audit dark-launched, prior probe
  needs refresh against new binary version.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: reverse-engineering, feature-flags, dark-launch, classification, evidence
---

# Probe Feature-Flag State

Determine if named flag in shipped CLI binary is LIVE, DARK, INDETERMINATE, or UNKNOWN via 4-prong evidence protocol pairing every state claim w/ specific observation.

## Use When

- Capability rumored/documented/inferred → verify gate fires for running session
- Audit dark-launched features (ships in bundle, gated off) → plan integrations responsibly
- Prior probe needs refresh against new binary (flag may have flipped, removed, merged into conjunction)
- Phase 1 (`monitor-binary-version-baselines`) follow-up → classify candidates before Phase 4 wire capture
- User-visible behavior changed → flag flip or code change drove it?

## In

- **Required**: Flag name as in binary (string-literal form)
- **Required**: CLI binary or bundle file readable + invocable
- **Required**: Authenticated session against harness's normal backend (own account; never another user's)
- **Optional**: Binary version ID — strongly recommended for diff-able evidence table
- **Optional**: Suspected co-gates list (other flags in conjunction)
- **Optional**: Prior probe artifact at different version, for delta analysis

## Do

### Step 1: Confirm Flag Name in Binary (Prong A — Binary Strings)

Extract candidate from bundle → confirm exists as string literal. Without this, all prongs probing thin air.

```bash
# Locate the bundle (common shapes: .js, .mjs, .bun, packaged binary)
BUNDLE=/path/to/cli/bundle.js
FLAG=acme_widget_v3   # synthetic placeholder — replace with the candidate

# Confirm the literal exists
grep -c "$FLAG" "$BUNDLE"

# Capture every line where it appears, with surrounding context for Step 2
grep -n -C 3 "$FLAG" "$BUNDLE" > /tmp/flag-context.txt
wc -l /tmp/flag-context.txt
```

Inspect `/tmp/flag-context.txt`, tag each occurrence:

- **gate-call** — first arg to gate-shaped fn (`gate("$FLAG", default)`, `isEnabled("$FLAG")`, `flag("$FLAG", ...)`).
- **telemetry-call** — first arg to emit/log/track fn.
- **env-var-check** — `process.env.X` lookup.
- **string-table** — static map/registry, role unclear.

→ ≥1 occurrence in bundle, each tagged w/ call-site role.

If err: `grep -c` returns 0 → flag not in build. Wrong input (typo, wrong namespace) or removed. Re-check Phase 1 markers, correct input or classify `REMOVED` + stop.

### Step 2: Disambiguate Gate from Event from Env Var

Same string can be gate, telemetry event, env var, or all three. Classification by call-site, not string. Mistaking telemetry for gate → nonsense reasoning.

Per tagged occurrence:

- **gate-call** → eligible for LIVE/DARK/INDETERMINATE classification. Capture **default value** passed (`gate("$FLAG", false)` defaults off; `gate("$FLAG", true)` defaults on). Record literal default + gate fn name.
- **telemetry-call** → NOT a gate. Label fired when other gate already passed. Only telemetry-call → string is event-only, classification = `UNKNOWN`.
- **env-var-check** → usually kill switch (default-on disabled by env var) or opt-in (default-off enabled by env var). Note polarity — `if (process.env.X) { return null; }` = kill switch; `if (process.env.X) { enable(); }` = opt-in.
- **string-table** → cross-ref, look at downstream consumption.

→ Per occurrence, definite call-site role + (for gate-calls) recorded default value.

If err: gate-call's surrounding context too minified to read default → expand context (`-C 10`), inspect full callee. Default still unreadable → record `default=?`, downgrade LIVE/DARK to INDETERMINATE.

### Step 3: Observe Live Invocation Behavior (Prong B — Runtime Probe)

Run harness in authenticated session, observe gated capability surfaces. Highest-signal prong: bundle says what *can* happen, runtime shows what *does* happen.

Pick probe action revealing gate-pass — typically user-visible behavior gate guards (tool in tool list, command flag valid, UI element rendering, output field appearing).

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

Record one of three:

- **gate-pass observed** — capability surfaced. Candidate: `LIVE`.
- **gate-pass not observed** — capability didn't surface. Candidate depends on default from Step 2 (default-false → `DARK`; default-true → re-check, suspicious).
- **gate-pass conditional on input/context not reproducible here** — record condition; candidate: `INDETERMINATE`.

→ Recorded probe action, observed outcome, candidate classification.

If err: probe action errors (auth fail, network unreachable, wrong subcommand) → runtime prong unusable. Fix session or pick different probe action. Don't infer DARK from runtime that never ran.

### Step 4: Inspect On-Disk State (Prong C — Config, Cache, Session)

Many harnesses persist gate evals or override values to disk. Inspecting shows what harness believed at last eval.

Common locations (shapes, not specific paths):

```bash
# User-level config
ls ~/.config/<harness>/ 2>/dev/null
ls ~/.<harness>/ 2>/dev/null

# Per-project state
ls .<harness>/ 2>/dev/null

# Cache directories
ls ~/.cache/<harness>/ 2>/dev/null

# Search any of these for the flag name
grep -r "$FLAG" ~/.config/<harness>/ ~/.cache/<harness>/ .<harness>/ 2>/dev/null
```

Record each hit's path, value w/ flag, last-modified time. Recently-modified cache entry overriding binary default = strongest possible evidence either way.

→ Confirmed override value w/ timestamp, OR confirmed absence (no on-disk state mentions flag).

If err: flag mentioned but can't tell if recorded value = cached server response, user override, or stale → flag entry for Step 5 (platform cache) reconciliation, don't guess.

### Step 5: Inspect Platform Flag-Service Cache (Prong D)

If harness uses external flag service (LaunchDarkly, Statsig, GrowthBook, vendor-internal), locally-cached service response = authoritative current rollout state.

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

Record cached value, timestamp, TTL (if present). Platform cache `false` overrides binary default `true`; cache `true` overrides binary default `false`.

→ Definite cached value w/ timestamp, OR confirmed absence of flag-service cache.

If err: no flag-service or can't locate cache → prong contributes nothing. Note "Prong D: not applicable" in evidence table. Don't guess.

### Step 6: Handle Conjunction Gates

Some capabilities guarded by multiple flags all true: `gate("A") && gate("B") && gate("C")`. Any one DARK → capability DARK, but per-flag classification still belongs to each.

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

Per co-gate string surfaced:

- Repeat Steps 1-5 for that flag (treat each as own probe)
- Record per-flag classification
- Compute **capability-level** classification: LIVE iff all conjuncts LIVE; DARK if any DARK; INDETERMINATE if no DARK + at least one INDETERMINATE.

→ Every conjunct ID'd + individually classified, plus derived capability-level classification.

If err: predicate too minified to enumerate (call site inlined or wrapped) → record "≥1 additional gate, structure unreadable", downgrade capability-level to INDETERMINATE even if primary looks LIVE.

### Step 7: Check for Skill-Substitution

Flag may legitimately be DARK while user-facing capability reachable through different fully-supported route — different command, user-invocable skill, alternate API. Honest finding "flag DARK, capability LIVE via substitution" common + important; missing produces panicked dark-launch reports about capabilities users actually have.

For any DARK or INDETERMINATE candidate:

- Documented user-invokable command, slash command, skill delivering same outcome?
- Alternate API surface (different endpoint, tool name) returning equivalent data?
- Harness publishes user-facing extension point (plugins, custom tools, hooks) → users assemble equivalent themselves?

If yes to any → append `substitution:` note to evidence row recording alternate route + observability (how user reaches it, documented).

→ For every DARK/INDETERMINATE, explicit substitution check — route or "no substitution route identified."

If err: suspect substitution but can't confirm route → mark "substitution suspected; not confirmed" rather than asserting either way.

### Step 8: Assemble Evidence Table + Final Classification

Combine 4 prongs → single table. Every state claim paired w/ supporting observation. Re-running at new version → diff-able artifact.

| Field | Value |
|---|---|
| Flag | `acme_widget_v3` (synthetic placeholder) |
| Binary version | `<version-id>` |
| Probe date | `YYYY-MM-DD` |
| Prong A — strings | present (3 occurrences: 1 gate-call default=`false`, 2 telemetry) |
| Prong B — runtime | gate-pass not observed in capability list |
| Prong C — on-disk | no override found in `~/.config/<harness>/` |
| Prong D — platform cache | service cache absent / not applicable |
| Conjunction | none — single-gate predicate |
| Substitution | user-invokable `widget` slash command delivers equivalent UX |
| **Final state** | **DARK (capability LIVE via substitution)** |

Apply classification rules:

- **LIVE** — ≥1 prong observed gate-pass this session AND no prong contradicts.
- **DARK** — flag string present, gate-call default `false`, no prong observed gate-pass, no override flips on.
- **INDETERMINATE** — gate-pass conditional on input/context not reproducible, OR default unreadable, OR conjunct INDETERMINATE.
- **UNKNOWN** — string present but not used as gate (telemetry-only, string-table-only, env-var-only label).

Save table as probe artifact (e.g., `probes/<flag>-<version>.md`) → future probes diff against it.

→ Complete evidence table covering all 4 prongs, conjunction status, substitution status, single final classification.

If err: no prong yields usable signal (binary unreadable, runtime uninvocable, on-disk + platform cache both absent) → don't invent classification. Record `INDETERMINATE` w/ reason "no prong yielded signal" + stop.

## Check

- [ ] Every state claim paired w/ specific observation (no bare assertions)
- [ ] Gate-call default value recorded (or explicitly noted as unreadable)
- [ ] Telemetry-event occurrences not counted as gate evidence
- [ ] Conjunction gates have per-flag + capability-level classifications
- [ ] Every DARK/INDETERMINATE row has explicit substitution check
- [ ] Artifact records binary version → diff-able
- [ ] No real product names, version-pinned IDs, dark-only flag names in publication artifacts (see `redact-for-public-disclosure`)

## Traps

- **Conflate telemetry events w/ gates.** String in `emit("$FLAG", ...)` = label, not gate. Telemetry-only = no rollout state, classify UNKNOWN not DARK.
- **Skip Prong B (live invocation).** Static evidence (binary says `default=false`) ≠ runtime evidence (capability didn't appear). Flag w/ default-false in binary may be flipped true by server-side override; only runtime probe shows what session got.
- **Miss the conjunction.** Classify primary LIVE because single occurrence shows `default=true` while ignoring `&& gate("B") && gate("C")` → falsely confident LIVE for capability gated by B or C.
- **Call DARK w/o substitution check.** Many DARK genuinely unreachable; many have fully-supported user-invokable route. Substitution check turns "alarming dark-launch" into "honest finding."
- **Probe stale binary.** Artifact w/ no version stamp = useless. Always record version, diff future probes.
- **Activate gate to confirm.** Flipping flag to test = not part of this skill. Some dark gates off for safety (incomplete capability, regulatory hold, unfinished migration). Document; never bypass.
- **Capture other users' state.** Prong C + D inspect *own* state + cache. Reading another's cache = exfiltration, out of scope.
- **Treat INDETERMINATE as failure.** Not — honest classification when evidence partial. Forcing INDETERMINATE → LIVE/DARK to look decisive = fastest way to be wrong.

## →

- `monitor-binary-version-baselines` — Phase 1 of parent guide; marker tracking supplies candidate flag inventory
- `conduct-empirical-wire-capture` — Phase 4; deeper runtime evidence (network capture, lifecycle hooks) when Prong B insufficient
- `security-audit-codebase` — dark-launched code = attack-surface archaeology; this skill = discovery half of audit
- `redact-for-public-disclosure` — Phase 5; redaction discipline deciding which artifacts can leave private workspace
