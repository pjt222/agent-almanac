---
name: probe-feature-flag-state
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Determine whether a named feature flag in a shipped CLI binary is LIVE, DARK, INDETERMINATE, or UNKNOWN, using a four-pronged evidence protocol that pairs every state claim with a specific observation.

## When to Use

- A capability is rumored, documented, or inferred and you need to verify whether the gate actually fires for the running session.
- You are auditing dark-launched features — code that ships in the bundle but is gated off — to plan integrations responsibly.
- A prior probe's conclusions need refreshing against a new binary version (the flag may have flipped, been removed, or been merged into a conjunction).
- You are following up Phase 1 (`monitor-binary-version-baselines`) markers and need to classify each candidate flag's rollout state before moving to Phase 4 wire capture.
- A user-visible behavior changed and you need to know whether a flag flip or a code change drove it.

## Inputs

- **Required**: the flag name as it appears in the binary (string-literal form).
- **Required**: the CLI binary or bundle file you can read and invoke.
- **Required**: an authenticated session against the harness's normal backend (your own account; never another user's).
- **Optional**: the binary version identifier — strongly recommended so the evidence table is diff-able against future probes.
- **Optional**: a list of suspected co-gates (other flag names that may participate in a conjunction with this one).
- **Optional**: a prior probe artifact for the same flag at a different version, for delta analysis.

## Procedure

### Step 1: Confirm the Flag Name Is Present in the Binary (Prong A — Binary Strings)

Extract the candidate flag name from the bundle to confirm it actually exists as a string literal. Without this, all later prongs are probing thin air.

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

Inspect `/tmp/flag-context.txt` and tag each occurrence as one of:

- **gate-call** — appears as the first argument to a gate-shaped function (`gate("$FLAG", default)`, `isEnabled("$FLAG")`, `flag("$FLAG", ...)`).
- **telemetry-call** — appears as the first argument to an emit/log/track function.
- **env-var-check** — appears in a `process.env.X` (or equivalent) lookup.
- **string-table** — appears in a static map or registry whose role is unclear.

**Expected:** at least one occurrence of the flag string in the bundle, and each occurrence tagged with its call-site role.

**On failure:** if `grep -c` returns 0, the flag is not in this build. Either the input name is wrong (typo, wrong namespace) or the flag was removed in this version. Re-check Phase 1 marker output, then either correct the input or classify as `REMOVED` and stop.

### Step 2: Disambiguate Gate from Event from Env Var

The same string can appear as a gate, a telemetry event name, an env var, or all three. The classification depends on call-site, not on the string. Mistaking a telemetry name for a gate produces nonsense reasoning ("this gate must be off") about something that was never a gate.

For each tagged occurrence from Step 1:

- A **gate-call** occurrence makes this string eligible for LIVE / DARK / INDETERMINATE classification. Capture the **default value** passed to the gate (`gate("$FLAG", false)` defaults the flag to off; `gate("$FLAG", true)` defaults it to on). Record both the literal default and the gate function name.
- A **telemetry-call** occurrence does **not** make the string a gate. It is a label fired when some other gate has already passed. If the *only* occurrences are telemetry-call, the string is event-only and final classification is `UNKNOWN` (name present but not a gate).
- An **env-var-check** occurrence usually indicates a kill switch (default-on capability disabled by an env var) or an explicit opt-in (default-off capability enabled by an env var). Note the polarity — `if (process.env.X) { return null; }` is a kill switch; `if (process.env.X) { enable(); }` is an opt-in.
- A **string-table** occurrence must be cross-referenced — look at how the table is consumed downstream.

**Expected:** for every occurrence, a definite call-site role and (for gate-calls) the recorded default value.

**On failure:** if a gate-call's surrounding context is too minified to read the default, expand the grep context (`-C 10`) and inspect the full callee. If the default still cannot be determined, record it as `default=?` and downgrade any LIVE/DARK conclusion to INDETERMINATE.

### Step 3: Observe Live Invocation Behavior (Prong B — Runtime Probe)

Run the harness in an authenticated session you control and observe whether the gated capability surfaces. This is the single highest-signal prong: the bundle says what *can* happen, the runtime shows what *does* happen.

Pick a probe action that would reveal the gate-pass — typically the user-visible behavior the gate guards (a tool appearing in a tool list, a command flag becoming valid, a UI element rendering, an output field appearing in a response).

```bash
# Example shape — adapt to the harness
$CLI --list-capabilities | grep -i widget         # does the gated capability appear?
$CLI --help 2>&1 | grep -i "$FLAG"                # is a flag-related option exposed?
$CLI run-some-command --debug 2>&1 | tee probe-runtime.log
```

Record one of three outcomes:

- **gate-pass observed** — the capability surfaced in the session. Classification candidate: `LIVE`.
- **gate-pass not observed** — the capability did not surface. Classification candidate depends on the default from Step 2 (default-false → `DARK`; default-true → re-check, this is suspicious).
- **gate-pass conditional on a specific input or context not reproducible here** — record the condition; classification candidate: `INDETERMINATE`.

**Expected:** a recorded probe action, the observed outcome, and the candidate classification it points to.

**On failure:** if the probe action itself errors (auth failure, network unreachable, wrong subcommand), the runtime prong is unusable for this round. Fix the session or pick a different probe action; do not infer DARK from a runtime that never ran.

### Step 4: Inspect On-Disk State (Prong C — Config, Cache, Session)

Many harnesses persist gate evaluations or override values to disk so they need not be re-fetched. Inspecting this state shows what the harness believed about the flag at last evaluation.

Common locations (adapt to the harness — these are shapes, not specific paths):

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

Record each hit's path, the value associated with the flag, and the file's last-modified time. A recently-modified cache entry overriding a binary default is the strongest possible evidence either way.

**Expected:** either a confirmed override value with timestamp, or a confirmed absence (no on-disk state mentions this flag).

**On failure:** if you find the flag mentioned but cannot tell whether the recorded value is a cached server response, a user override, or a stale value, flag the entry for Step 5 (platform cache) reconciliation rather than guessing.

### Step 5: Inspect Platform Flag-Service Cache (Prong D)

If the harness uses an external feature-flag service (LaunchDarkly, Statsig, GrowthBook, vendor-internal, etc.), the locally-cached service response is the authoritative current rollout state. Inspect it where available.

```bash
# Look for service-shaped cache files
find ~/.cache ~/.config -name "*flag*" -o -name "*feature*" -o -name "*config*" 2>/dev/null | head

# If a cache file is present, parse it for the flag name
jq ".[] | select(.key == \"$FLAG\")" ~/.cache/<harness>/flags.json 2>/dev/null
```

Record the cached value, the cache timestamp, and (if present) the cache TTL. A platform cache that says `false` overrides a binary default of `true`; a platform cache that says `true` overrides a binary default of `false`.

**Expected:** either a definite cached value with timestamp, or confirmed absence of a flag-service cache for this harness.

**On failure:** if the harness has no flag-service or you cannot locate the cache, this prong contributes nothing — that is acceptable. Note "Prong D: not applicable" in the evidence table; do not guess.

### Step 6: Handle Conjunction Gates

Some capabilities are guarded by multiple flags that must all be true: `gate("A") && gate("B") && gate("C")`. Any one being DARK is sufficient to make the capability DARK, but the per-flag classification still belongs to each flag individually.

```bash
# After finding the gate-call site for the primary flag in Step 2, scan the
# enclosing predicate for other gate(...) calls
grep -n -C 5 "$FLAG" "$BUNDLE" | grep -oE 'gate\("[^"]+"' | sort -u
```

For each co-gate string surfaced:

- Repeat Steps 1–5 for that flag (treat each as its own probe).
- Record the per-flag classification.
- Compute the **capability-level** classification: LIVE iff all conjuncts are LIVE; DARK if any conjunct is DARK; INDETERMINATE if no conjunct is DARK and at least one is INDETERMINATE.

**Expected:** every conjunct identified and individually classified, plus a derived capability-level classification.

**On failure:** if the predicate is too minified to enumerate cleanly (call site is inlined or wrapped), record the conjunction as "≥1 additional gate, structure unreadable" and downgrade the capability-level classification to INDETERMINATE even if the primary flag looks LIVE.

### Step 7: Check for Skill-Substitution

A flag may legitimately be DARK while the user-facing capability it would unlock is reachable through a different, fully-supported route — a different command, a user-invocable skill, an alternate API. The honest finding "flag DARK, capability LIVE via substitution" is common and important; missing it produces panicked dark-launch reports about capabilities users actually have.

For any candidate classification of DARK or INDETERMINATE, ask:

- Is there a documented user-invokable command, slash command, or skill that delivers the same end-user outcome?
- Is there an alternate API surface (different endpoint, different tool name) that returns equivalent data?
- Does the harness publish a user-facing extension point (plugins, custom tools, hooks) that allows users to assemble the equivalent themselves?

If yes to any, append a `substitution:` note to the evidence row recording the alternate route and its observability (how a user reaches it, whether it is documented).

**Expected:** for every DARK / INDETERMINATE classification, an explicit substitution check — either the route, or the explicit note "no substitution route identified."

**On failure:** if you suspect a substitution exists but cannot confirm the route, mark "substitution suspected; not confirmed" rather than asserting either way.

### Step 8: Assemble the Evidence Table and Final Classification

Combine the four prongs into a single table. Every state claim must be paired with the observation that supports it; re-running the probe at a new version produces a diff-able artifact.

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

Apply the classification rules:

- **LIVE** — at least one prong observed gate-pass this session AND no prong contradicts.
- **DARK** — flag string present, gate-call default is `false`, no prong observed gate-pass, no override flips it on.
- **INDETERMINATE** — gate-pass is conditional on an input or context not reproducible in this probe, OR the gate's default could not be determined, OR a conjunct is INDETERMINATE.
- **UNKNOWN** — string present but not used as a gate (telemetry-only, string-table-only, env-var-only label).

Save the table as a probe artifact (e.g., `probes/<flag>-<version>.md`) so future probes diff against it.

**Expected:** a complete evidence table covering all four prongs, conjunction status, substitution status, and a single final classification.

**On failure:** if no prong yields a usable signal (binary cannot be read, runtime cannot be invoked, on-disk and platform cache both absent), do not invent a classification. Record `INDETERMINATE` with the reason "no prong yielded signal" and stop.

## Validation

- [ ] Every state claim in the evidence table is paired with a specific observation (no bare assertions).
- [ ] The flag's gate-call default value is recorded (or explicitly noted as unreadable).
- [ ] Telemetry-event occurrences are not counted as gate evidence.
- [ ] Conjunction gates have per-flag classifications **and** a capability-level classification.
- [ ] Every DARK / INDETERMINATE row has an explicit substitution check.
- [ ] The artifact records the binary version so future probes are diff-able.
- [ ] No real product names, version-pinned identifiers, or dark-only flag names appear in any artifact intended for publication (see `redact-for-public-disclosure`).

## Common Pitfalls

- **Conflating telemetry events with gates.** A string that appears in `emit("$FLAG", ...)` is a label, not a gate. A flag that is "telemetry-only" has no rollout state and should be classified UNKNOWN, not DARK.
- **Skipping Prong B (live invocation).** Static evidence alone (the binary says `default=false`) is not the same as runtime evidence (the capability did not appear). A flag with default-false in the binary may be flipped to true by a server-side override; only the runtime probe shows what the session actually got.
- **Missing the conjunction.** Classifying the primary flag as LIVE because its single occurrence shows `default=true` while ignoring the surrounding `&& gate("B") && gate("C")` produces a falsely confident LIVE for a capability that is actually gated by B or C.
- **Calling DARK without a substitution check.** Many DARK flags are genuinely unreachable, but many others have a fully-supported user-invokable route. The substitution check is what turns "alarming dark-launch" into "honest finding."
- **Probing a stale binary version.** A probe artifact with no version stamp is useless — you cannot tell whether it reflects current state or last quarter's state. Always record the version, and diff future probes against the artifact.
- **Activating the gate to confirm it.** Flipping a flag to test it is not part of this skill. Some dark gates are off for safety reasons (incomplete capability, regulatory hold, unfinished migration). Document; never bypass.
- **Capturing other users' state.** Prong C and Prong D inspect *your own* on-disk state and *your own* cache. Reading another user's cache is exfiltration and is out of scope.
- **Treating INDETERMINATE as a failure.** It is not — it is the honest classification when evidence is partial. Forcing INDETERMINATE results into LIVE or DARK to make the report look decisive is the fastest way to be wrong.

## Related Skills

- `monitor-binary-version-baselines` — Phase 1 of the parent guide; the marker tracking this skill builds on supplies the candidate flag inventory.
- `conduct-empirical-wire-capture` — Phase 4; deeper runtime evidence (network capture, lifecycle hooks) when Prong B's surface-level probe is insufficient.
- `security-audit-codebase` — dark-launched code is part of attack-surface archaeology; this skill is the discovery half of that audit.
- `redact-for-public-disclosure` — Phase 5; the redaction discipline that decides which probe artifacts can leave the private workspace.
