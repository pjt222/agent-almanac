---
name: probe-feature-flag-state
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Probe the runtime state of a named feature flag in a CLI binary. Covers
  the four-pronged evidence protocol (binary strings, live invocation,
  on-disk state, platform cache), the four-state classification (LIVE /
  DARK / INDETERMINATE / UNKNOWN), gate-vs-event disambiguation,
  conjunction-gate handling, and skill-substitution scenarios where a
  flag appears DARK but the capability is delivered by other means. Use
  when verifying whether a documented or inferred capability has rolled
  out, when auditing dark-launched features, or when a prior probe's
  conclusions need refreshing against a new binary version.
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

Determine if named feature flag in shipped CLI binary is LIVE, DARK, INDETERMINATE, or UNKNOWN. Use four-pronged evidence protocol — pair every state claim with specific observation.

## When Use

- Capability rumored, documented, or inferred — need verify if gate actually fires for running session.
- Auditing dark-launched features — code that ships in bundle but is gated off — to plan integrations responsibly.
- Prior probe's conclusions need refreshing against new binary version (flag may have flipped, been removed, or merged into conjunction).
- Following up Phase 1 (`monitor-binary-version-baselines`) markers — need classify each candidate flag's rollout state before moving to Phase 4 wire capture.
- User-visible behavior changed — need know if flag flip or code change drove it.

## Inputs

- **Required**: Flag name as it appears in binary (string-literal form).
- **Required**: CLI binary or bundle file you can read and invoke.
- **Required**: Authenticated session against harness's normal backend (your own account; never another user's).
- **Optional**: Binary version identifier — strongly recommended so evidence table is diff-able against future probes.
- **Optional**: List of suspected co-gates (other flag names that may participate in conjunction with this one).
- **Optional**: Prior probe artifact for same flag at different version — for delta analysis.

## Steps

### Step 1: Confirm Flag Name Present in Binary (Prong A — Binary Strings)

Extract candidate flag name from bundle. Confirm it actually exists as string literal. Without this, all later prongs probe thin air.

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

Inspect `/tmp/flag-context.txt`. Tag each occurrence as one of:

- **gate-call** — appears as first argument to gate-shaped function (`gate("$FLAG", default)`, `isEnabled("$FLAG")`, `flag("$FLAG", ...)`).
- **telemetry-call** — appears as first argument to emit/log/track function.
- **env-var-check** — appears in `process.env.X` (or equivalent) lookup.
- **string-table** — appears in static map or registry whose role is unclear.

**Got:** At least one occurrence of flag string in bundle. Each occurrence tagged with its call-site role.

**If fail:** `grep -c` returns 0? Flag not in this build. Either input name wrong (typo, wrong namespace) or flag removed in this version. Re-check Phase 1 marker output. Either correct input or classify as `REMOVED` and stop.

### Step 2: Disambiguate Gate from Event from Env Var

Same string can appear as gate, telemetry event name, env var, or all three. Classification depends on call-site, not on string. Mistaking telemetry name for gate produces nonsense reasoning ("this gate must be off") about something that was never a gate.

For each tagged occurrence from Step 1:

- A **gate-call** occurrence makes this string eligible for LIVE / DARK / INDETERMINATE classification. Capture **default value** passed to gate (`gate("$FLAG", false)` defaults flag to off; `gate("$FLAG", true)` defaults flag to on). Record both literal default and gate function name.
- A **telemetry-call** occurrence does NOT make string a gate. It is label fired when some other gate has already passed. *Only* occurrences are telemetry-call? String is event-only, final classification is `UNKNOWN` (name present but not a gate).
- An **env-var-check** occurrence usually indicates kill switch (default-on capability disabled by env var) or explicit opt-in (default-off capability enabled by env var). Note polarity — `if (process.env.X) { return null; }` is kill switch; `if (process.env.X) { enable(); }` is opt-in.
- A **string-table** occurrence must be cross-referenced — look at how table is consumed downstream.

**Got:** For every occurrence, definite call-site role and (for gate-calls) recorded default value.

**If fail:** Gate-call's surrounding context too minified to read default? Expand grep context (`-C 10`) and inspect full callee. Default still can't be determined? Record as `default=?`. Downgrade any LIVE/DARK conclusion to INDETERMINATE.

### Step 3: Observe Live Invocation Behavior (Prong B — Runtime Probe)

Run harness in authenticated session you control. Observe if gated capability surfaces. This is single highest-signal prong: bundle says what *can* happen, runtime shows what *does* happen.

Pick probe action that would reveal gate-pass — usually user-visible behavior gate guards (tool appearing in tool list, command flag becoming valid, UI element rendering, output field appearing in response).

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

Record one of three outcomes:

- **gate-pass observed** — capability surfaced in session. Classification candidate: `LIVE`.
- **gate-pass not observed** — capability did not surface. Classification candidate depends on default from Step 2 (default-false → `DARK`; default-true → re-check, this is suspicious).
- **gate-pass conditional on specific input or context not reproducible here** — record condition; classification candidate: `INDETERMINATE`.

**Got:** Recorded probe action, observed outcome, candidate classification it points to.

**If fail:** Probe action itself errors (auth failure, network unreachable, wrong subcommand)? Runtime prong unusable for this round. Fix session or pick different probe action. Don't infer DARK from runtime that never ran.

### Step 4: Inspect On-Disk State (Prong C — Config, Cache, Session)

Many harnesses persist gate evaluations or override values to disk so they need not be re-fetched. Inspecting this state shows what harness believed about flag at last evaluation.

Common locations (adapt to harness — these are shapes, not specific paths):

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

Record each hit's path, value associated with flag, and file's last-modified time. Recently-modified cache entry overriding binary default is strongest possible evidence either way.

**Got:** Either confirmed override value with timestamp, or confirmed absence (no on-disk state mentions this flag).

**If fail:** Find flag mentioned but can't tell if recorded value is cached server response, user override, or stale value? Flag entry for Step 5 (platform cache) reconciliation rather than guessing.

### Step 5: Inspect Platform Flag-Service Cache (Prong D)

Harness uses external feature-flag service (LaunchDarkly, Statsig, GrowthBook, vendor-internal, etc.)? Locally-cached service response is authoritative current rollout state. Inspect it where available.

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

Record cached value, cache timestamp, and (if present) cache TTL. Platform cache that says `false` overrides binary default of `true`. Platform cache that says `true` overrides binary default of `false`.

**Got:** Either definite cached value with timestamp, or confirmed absence of flag-service cache for this harness.

**If fail:** Harness has no flag-service or you can't locate cache? This prong contributes nothing — that's acceptable. Note "Prong D: not applicable" in evidence table. Don't guess.

### Step 6: Handle Conjunction Gates

Some capabilities guarded by multiple flags that must all be true: `gate("A") && gate("B") && gate("C")`. Any one being DARK is sufficient to make capability DARK. But per-flag classification still belongs to each flag individually.

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

For each co-gate string surfaced:

- Repeat Steps 1–5 for that flag (treat each as own probe).
- Record per-flag classification.
- Compute **capability-level** classification: LIVE iff all conjuncts are LIVE; DARK if any conjunct is DARK; INDETERMINATE if no conjunct is DARK and at least one is INDETERMINATE.

**Got:** Every conjunct identified and individually classified. Derived capability-level classification.

**If fail:** Predicate too minified to enumerate cleanly (call site inlined or wrapped)? Record conjunction as "≥1 additional gate, structure unreadable". Downgrade capability-level classification to INDETERMINATE even if primary flag looks LIVE.

### Step 7: Check for Skill-Substitution

Flag may legitimately be DARK while user-facing capability it would unlock is reachable through different, fully-supported route — different command, user-invocable skill, alternate API. Honest finding "flag DARK, capability LIVE via substitution" is common and important. Missing it produces panicked dark-launch reports about capabilities users actually have.

For any candidate classification of DARK or INDETERMINATE, ask:

- Is there documented user-invokable command, slash command, or skill that delivers same end-user outcome?
- Is there alternate API surface (different endpoint, different tool name) that returns equivalent data?
- Does harness publish user-facing extension point (plugins, custom tools, hooks) allowing users to assemble equivalent themselves?

If yes to any, append `substitution:` note to evidence row recording alternate route and its observability (how user reaches it, whether it is documented).

**Got:** For every DARK / INDETERMINATE classification, explicit substitution check — either route, or explicit note "no substitution route identified."

**If fail:** Suspect substitution exists but can't confirm route? Mark "substitution suspected; not confirmed" rather than asserting either way.

### Step 8: Assemble Evidence Table and Final Classification

Combine four prongs into single table. Every state claim must be paired with observation that supports it. Re-running probe at new version produces diff-able artifact.

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

- **LIVE** — at least one prong observed gate-pass this session AND no prong contradicts.
- **DARK** — flag string present, gate-call default is `false`, no prong observed gate-pass, no override flips it on.
- **INDETERMINATE** — gate-pass conditional on input or context not reproducible in this probe, OR gate's default could not be determined, OR conjunct is INDETERMINATE.
- **UNKNOWN** — string present but not used as gate (telemetry-only, string-table-only, env-var-only label).

Save table as probe artifact (e.g. `probes/<flag>-<version>.md`) so future probes diff against it.

**Got:** Complete evidence table covering all four prongs, conjunction status, substitution status, single final classification.

**If fail:** No prong yields usable signal (binary can't be read, runtime can't be invoked, on-disk and platform cache both absent)? Don't invent classification. Record `INDETERMINATE` with reason "no prong yielded signal" and stop.

## Checks

- [ ] Every state claim in evidence table paired with specific observation (no bare assertions).
- [ ] Flag's gate-call default value recorded (or explicitly noted as unreadable).
- [ ] Telemetry-event occurrences not counted as gate evidence.
- [ ] Conjunction gates have per-flag classifications **and** capability-level classification.
- [ ] Every DARK / INDETERMINATE row has explicit substitution check.
- [ ] Artifact records binary version so future probes are diff-able.
- [ ] No real product names, version-pinned identifiers, or dark-only flag names appear in any artifact intended for publication (see `redact-for-public-disclosure`).

## Pitfalls

- **Conflate telemetry events with gates.** String that appears in `emit("$FLAG", ...)` is label, not gate. Flag that is "telemetry-only" has no rollout state and should be classified UNKNOWN, not DARK.
- **Skip Prong B (live invocation).** Static evidence alone (binary says `default=false`) is not same as runtime evidence (capability did not appear). Flag with default-false in binary may be flipped to true by server-side override. Only runtime probe shows what session actually got.
- **Miss the conjunction.** Classifying primary flag as LIVE because its single occurrence shows `default=true` while ignoring surrounding `&& gate("B") && gate("C")` produces falsely confident LIVE for capability that's actually gated by B or C.
- **Call DARK without substitution check.** Many DARK flags are genuinely unreachable. Many others have fully-supported user-invokable route. Substitution check turns "alarming dark-launch" into "honest finding."
- **Probe stale binary version.** Probe artifact with no version stamp is useless — you can't tell if it reflects current state or last quarter's state. Always record version. Diff future probes against artifact.
- **Activate gate to confirm it.** Flipping flag to test it is not part of this skill. Some dark gates are off for safety reasons (incomplete capability, regulatory hold, unfinished migration). Document. Never bypass.
- **Capture other users' state.** Prong C and Prong D inspect *your own* on-disk state and *your own* cache. Reading another user's cache is exfiltration — out of scope.
- **Treat INDETERMINATE as failure.** Not failure — it is honest classification when evidence is partial. Forcing INDETERMINATE results into LIVE or DARK to make report look decisive is fastest way to be wrong.

## See Also

- `monitor-binary-version-baselines` — Phase 1 of parent guide. Marker tracking this skill builds on supplies candidate flag inventory.
- `conduct-empirical-wire-capture` — Phase 4. Deeper runtime evidence (network capture, lifecycle hooks) when Prong B's surface-level probe insufficient.
- `security-audit-codebase` — Dark-launched code is part of attack-surface archaeology. This skill is discovery half of that audit.
- `redact-for-public-disclosure` — Phase 5. Redaction discipline that decides which probe artifacts can leave private workspace.
