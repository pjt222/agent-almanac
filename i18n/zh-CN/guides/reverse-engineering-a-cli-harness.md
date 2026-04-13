---
title: "Reverse-Engineering a CLI Harness"
description: "Methodology for understanding a closed-source CLI harness you integrate with — version baselining, feature-flag discovery, dark-launch detection, wire capture, and redaction discipline."
category: investigation
agents: [security-analyst, code-reviewer]
teams: []
skills: [audit-dependency-versions, security-audit-codebase]
locale: zh-CN
source_locale: en
source_commit: f1f0ffe1
translator: "Claude + human review"
translation_date: "2026-04-13"
---

# Reverse-Engineering a CLI Harness

Agents and integrators routinely build on opinionated CLI harnesses they do not own. When a harness ships a JavaScript or Bun bundle without source, integration work eventually requires understanding behaviors that are not yet publicly documented: how tools behave under edge conditions, which capabilities may be dark-launched, how the harness's own configuration surface evolves between versions, how to keep research artifacts publishable without leaking sensitive internals.

This guide codifies the *methodology* without codifying any specific findings about any specific product. **Methodology travels; findings decay.** A guide that teaches the practice survives version churn; a dump of current-version internals does not. Worked examples may name the harnesses they are drawn from — agent-almanac is Claude-Code-optimized and its readers benefit from concrete references — but no example here pins a version-specific internal, a minified identifier, or a dark-only flag name.

## Scope and Intent

Read this section first. It frames everything that follows.

- **Research is for integration and interoperability**, not exploitation. The reason to understand a harness is to build on it safely — to anticipate version drift, to debug strange behavior, to avoid building on dark-only capabilities that may be removed.
- **Findings are kept proportional**. Only what is needed to integrate safely. A complete map of every flag, function, and offset is not the goal; a working understanding of *what could change* is.
- **Sensitive findings are reported upstream** when they indicate security issues. Treat the harness vendor the way you would treat any third-party software — disclose responsibly.
- **Redaction is the default; disclosure is deliberate.** The starting assumption for any extracted detail is "do not publish." The bar for moving something to "publishable" is high and explicit.
- **What is out of scope**: binary modification or patching, authentication or credential extraction, methods for bypassing server-side rate limits or safety controls, exploitation of identified vulnerabilities. This is research-only.

## When to Use This Guide

- You are building an integration on top of a closed-source CLI harness and need to anticipate version drift.
- A behavior you depend on changed silently between versions and you want a process to catch the next change earlier.
- You suspect a capability is dark-launched (shipped but gated off) and want to know if you can plan for it.
- You need to document an interoperability research project without leaking sensitive internals.
- You are considering disclosing a security finding to the harness vendor and want a structured reporting pattern.

## Prerequisites

- Comfort reading minified or bundled JavaScript / TypeScript at a structural level. You do not need to deobfuscate; you need to recognize patterns (function shapes, gate predicates, telemetry calls).
- Familiarity with `ripgrep` (or `grep`), `strings`, and a JSON-aware diff tool.
- For Phase 4 (wire capture): a runtime environment you control — typically your own machine running the harness against your own account.
- A private repository for the research artifacts. **The whole point of the redaction discipline is that the public publication is downstream of a private workspace.** Do not attempt this work directly in a public repo.
- Understanding of the harness vendor's responsible disclosure policy if you anticipate finding security issues.

## Workflow Overview

The methodology is five phases, applied in order:

```
Phase 1: Baseline ──────────────────►  String markers + version tracking
                                        │
Phase 2: Flag discovery ────────────►  Harvest + cluster + classify
                                        │
Phase 3: Dark-launch detection ─────►  Identify shipped-but-gated capabilities
                                        │
Phase 4: Wire capture ──────────────►  Empirically validate behavior
                                        │
Phase 5: Redaction discipline ──────►  Publish methodology, suppress findings
```

The phases produce different artifact types and require different tools, but they share one principle: **observe before interpreting**. Each phase has a temptation to leap from observation to conclusion; resist it until the next phase's evidence is in.

## Phase 1: Baseline

The first phase establishes a reproducible reading of the harness as it currently ships, so subsequent versions can be diffed against it.

### What to do

Build a categorized list of string markers — capability names, flag prefixes, telemetry event names, error messages, tool names — that you expect to see in a healthy install. Score each marker by category (capability gate, telemetry, internal name, env var). Run the same scan against each new version and report the delta.

A marker scanner takes shape like this (pseudocode):

```
for each installed binary version:
  for each marker in catalog:
    if marker is found in binary strings:
      record (version, marker, count, category)
diff (version_N, version_N-1) → report new / removed / count-changed
```

### Worked example (synthetic)

Suppose your catalog includes a marker `widget_capability_v2` in the "capability gate" category with weight 5. A new binary appears; the scanner reports this marker is now absent. That is a one-line signal worth investigating: is the capability removed, renamed, or moved behind a build-flag?

The marker catalog itself is the asset. It accumulates across releases — markers added, markers removed, markers whose count grew unexpectedly. The diff is the signal.

### Anti-pattern

**Recording specific findings as the catalog**. The catalog should be category-shaped (e.g., "capability gate strings starting with prefix X") not finding-shaped (e.g., "the literal value `acme_specific_thing_42`"). Catalogs that record findings rot fast and are also the highest-leak risk if accidentally published. Catalogs that record categories survive version churn and reveal little if leaked.

**Expected**: a scanner script and a marker catalog that survive multiple version bumps without rewriting.

**On failure**: if the scanner produces noisy output (every version shows hundreds of "new" markers), the marker catalog is too narrow — broaden the categories and accept fuzzier matching.

## Phase 2: Feature-Flag Discovery

The second phase identifies the harness's feature-flag surface — the gates that determine which capabilities the running binary will expose to which users.

### What to do

1. Extract candidate flag-like strings from the binary. Look for prefixes that recur (the harness will typically have a small set of internal namespaces it uses for flags).
2. Cluster by prefix. Each cluster is a probable namespace; each member is a probable flag.
3. Classify each candidate by its likely role:
   - **Always-on capability** — the gate exists but the default and observed runtime both indicate "on."
   - **Default-on with kill switch** — gate defaults on but an env var or config can disable it.
   - **Default-off, server-overridable** — gate defaults off; users see it only if a server-side flag service flips it.
   - **Telemetry event** (not a gate) — the string is fired as an event name, not consumed as a gate.
   - **Kill-switch env var** — environment variable used to disable a capability.
4. For each candidate, the classification can be inferred from how the string is used in code (gate predicate vs telemetry call vs env-var check) and from what the binary's default value is.

### Worked example (synthetic)

The scanner returns three strings with a shared prefix `acme_phase2_*`:
- `acme_phase2_widget` — used inside a predicate `if (gate("acme_phase2_widget", false)) { … }`. **Classification**: default-off, server-overridable. Probably a dark-launch.
- `acme_phase2_widget_telemetry` — used as `emit("acme_phase2_widget_telemetry", {…})`. **Classification**: telemetry event, not a gate.
- `ACME_PHASE2_DISABLE` — used in `if (process.env.ACME_PHASE2_DISABLE) { return null; }`. **Classification**: kill-switch env var.

These three strings share a prefix but play three different roles. Treating them all as "flags" loses the distinction that matters.

### Anti-pattern

**Conflating telemetry events with gates**. They share naming conventions in many harnesses, but a telemetry event name has no rollout state — it is just a label. Mistaking a telemetry name for a gate produces useless reasoning ("this gate must be off") about something that was never a gate.

**Expected**: a list of candidate flags clustered by namespace, each annotated with its inferred role.

**On failure**: if the same flag string appears in both gate-predicate and telemetry-call positions, that is normal — telemetry often labels itself with the gate it sits behind. Record both roles for the same string.

## Phase 3: Dark-Launch Detection

The third phase identifies capabilities that ship in the bundle but are gated off — features the harness has built and shipped to all users but exposed to none (or only to a narrow audience).

### What to do

For each candidate flag from Phase 2, infer its rollout state:

1. **Static signal**: what does the binary's default value say? `gate("foo", false)` defaults the flag to off. `gate("bar", true)` defaults it to on.
2. **Runtime signal**: when the harness runs against your account, does the gated capability appear in the tool list, command surface, or UI?
3. **Cross-version signal**: did the flag appear in version N+1 that wasn't in version N? A flag introduced and immediately defaulted off, with no surface appearance, is a classic dark-launch.

Combine these into a rollout state classification:

| State | Static default | Runtime visible | Interpretation |
|---|---|---|---|
| Live | on | yes | Default capability for all users |
| Default-off, opt-in | off | yes (to your account) | Server flipped it for you |
| Dark-launch | off | no | Built and shipped, not yet rolled out |
| Removed | absent in latest | n/a | Capability deprecated / withdrawn |

### Worked example (synthetic)

You find a flag `acme_widget_v3` with binary default `false`. The harness runs without exposing any V3-related capability. Cross-version diff shows the flag appeared two releases ago. **Inference**: dark-launch — the capability exists, is gated off, and may be enabled in a future release.

You then find `acme_widget_v3_dialog` — also default false. Looking at where it is referenced, it is inside a function that only fires when the parent flag is on. **Inference**: this is not an independent flag; it is a sub-gate inside a dark-launched feature. Record it under the parent.

### Anti-pattern

**Activating a dark-launched capability without authorization**. The fact that you can identify the gate does not mean you should flip it. Some dark-launches are gated off for safety reasons (the capability is incomplete, dangerous, or under regulatory review). Document the gate; do not bypass it.

**Expected**: each candidate flag classified into one of {live, opt-in, dark, removed} with the supporting evidence noted.

**On failure**: if the runtime signal cannot be observed (the capability has no user-visible surface at all), the classification falls back to "static-only" and remains tentative. Note that openly.

## Phase 4: Wire Capture

The fourth phase validates inferred behavior by capturing what the harness actually sends and receives — moving from "the bundle says this is what should happen" to "this is what actually happens."

### What to do

Three independent capture strategies, each suited to different goals:

#### Strategy A: Verbose-fetch tee

Some bundlers honor an environment variable that routes network traffic to stderr in a verbose format. When the bundler your harness uses has such a variable, set it, run the harness, and tee stderr to a log file. The result is a full request/response wire log with no instrumentation in the harness itself.

To use this strategy, consult the bundler's own documentation for the variable name and supported output formats — the variable is the bundler's, not the harness's, and naming conventions vary. Then filter the resulting log by the endpoint pattern of interest.

**Caveat**: verbose-fetch output bleeds into the harness's UI rendering when the harness uses a TUI library. Capture in a session you can throw away, not your primary working session.

#### Strategy B: Subprocess-per-event harness

When a behavior fires only on a specific event, instrument that event by hooking into a published lifecycle (most harnesses expose hook points or accept wrappers). Each event spawns a subprocess that captures the relevant state, writes a JSONL line, and exits. The subprocess overhead is acceptable because the events are rare.

#### Strategy C: Programmatic API replay

When the harness has a well-defined HTTP surface, replay the same request directly with `curl` or a small script using your own credentials. This decouples the request from the harness's UI, runs at your cadence, and lets you systematically vary inputs.

### Worked example (synthetic)

You suspect an internal API call fires when a specific lifecycle event happens. Strategy A (verbose fetch) confirms the request goes to a specific endpoint with a specific payload shape. Strategy C (API replay) lets you systematically probe that endpoint with varied inputs to map the response space.

A capture run produces a JSONL log shaped like:

```
{"ts": "...", "strategy": "verbose-fetch", "endpoint": "...", "payload_shape": {...}}
{"ts": "...", "strategy": "api-replay", "input": {...}, "response_shape": {...}}
```

Notice what is recorded: shapes, not contents. The redaction discipline of Phase 5 starts at capture time — log payload **schemas**, not payload values.

### Anti-pattern

**Capturing other users' traffic**. Wire capture is for *your own* requests against *your own* account. Capturing traffic that belongs to other users is exfiltration, not research, and is out of scope here.

**Capturing credentials**. The harness's authentication tokens almost certainly appear in the wire log. Strip them before storing the log; never publish a log without verifying credentials are absent.

**Expected**: a structured capture log that shows what the harness actually does, not just what the bundle suggests it might do.

**On failure**: if the capture log is empty or unrelated to the suspected behavior, the strategy choice may be wrong. A behavior that fires only inside the renderer (UI) is invisible to verbose-fetch; switch to subprocess-per-event or API replay.

## Phase 5: Redaction Discipline

The fifth phase governs publication — keeping the research publishable without leaking the version-specific findings that would betray the source.

### Tiered classification

Sort every candidate fact into one of three tiers:

#### Tier 0 — Always publishable

- Methodology — the *how* of investigation, separate from the *findings*.
- Tool names and parameter schemas as they appear in the harness's own user-facing documentation.
- Command surfaces as users invoke them (slash commands, CLI flags, env vars the harness's own docs mention).
- Behaviors observable through normal operation (rate limits, clamps, rounding, error messages users see).
- Telemetry event names *once the event itself ships on a publicly visible code path* and is documented or commonly known.

#### Tier 1 — Publishable with care, only when proportional

- Public-API field names (well-documented response field names in vendor's API docs).
- Standard severity scales for security findings (CRITICAL/HIGH/MEDIUM/LOW).
- Generic shapes of internal namespaces (e.g., "the harness uses a single-prefix flag namespace") without naming the prefix.

#### Tier 2 — Never publishable

- **Minified identifiers** from the bundle (decay under every rebuild; leak implementation detail).
- **Version-pinned internals** — constants, byte offsets, exact pattern matches that only apply to one release.
- **Dark-only feature flag names** — flags whose rollout state is not yet publicly observable.
- **Specific PRNG constants, hash salts, or derivation inputs** that could enable credential, identity, or authentication reconstruction.
- **Verbatim prompt fragments** from internal model prompts.
- **Internal codenames** that the vendor has not published.
- **Specific environment variable names** that gate undocumented behavior.
- **Vendor-internal API field names** beyond what is in the public API documentation.
- **Specific binary offsets, function addresses, or memory layouts.**
- **Exact regex patterns** the harness uses for sensitive operations (e.g., name-detection, content gating).

The "What to Keep Private" checklist later in this section restates these in pre-commit form.

### What to publish

A guide like this one can describe Phase 1's marker-scanning **shape** without listing any specific marker. It can describe Phase 2's flag-classification **categories** without naming any flag. It can describe Phase 3's dark-launch detection **logic** without naming any dark-launched capability. It can describe Phase 4's wire-capture **strategies** without showing any wire log. The methodology is what survives across versions; the findings should not even leave the private workspace.

### Automated redaction check

Maintain a `check-redaction.sh` (or equivalent) in your private workspace that runs against your *public* repo and grep-fails on any Tier 2 pattern category. Run it before every commit. The script becomes an executable specification of the redaction policy — not aspirational, enforced.

A skeleton:

```bash
PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
  # ... category per line
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

### Worked example (synthetic)

You write a methodology guide that says "harnesses commonly use a single-letter prefix for internal flags; identify yours by clustering string occurrences." That sentence is methodology — it travels. Compare it to "the harness uses the prefix `acme_internal_` for its flags" — that sentence is a finding, and it tells anyone with access to the binary which strings to grep for. The first sentence belongs in the public guide; the second belongs only in the private workspace.

### Anti-pattern

**"Just one example to make it concrete."** The temptation to include one specific finding "to ground the methodology" is the most common leak path. The example is rarely just one — it implies a class, and a sufficiently specific class is itself a finding. Use synthetic placeholders for examples (e.g., `acme_widget_v3`, `widget_handler_42`) — clearly invented, never traceable to a real product.

**Force-pushing to scrub history when redaction is retroactively tightened.** Procedure: identify the offending commits, prepare an orphan commit on a fresh branch with the cleaned content, force-push the orphan branch as the new history. Document the rotation in the private workspace; do not document it in the public repo (the rotation itself reveals where the leak was).

**Expected**: the public publication contains methodology only; the redaction check passes without leaks; specific findings live only in the private workspace.

**On failure**: if the check finds a leak after publication, treat it as an incident: identify scope, scrub history if the leak is high-value, audit the methodology for what made the leak feel necessary, update the guide to remove that pressure.

## What to Keep Private (Categorized Checklist)

Use this as a pre-commit checklist for any artifact you intend to publish:

- [ ] **No minified identifiers** (short bundle-style names, single-letter or two-letter prefixes followed by digits)
- [ ] **No version-pinned internals** (specific constants, byte offsets, pattern matches that only apply to one release)
- [ ] **No dark-only flag names** (flags whose rollout state is not publicly observable)
- [ ] **No PRNG constants, hash salts, or derivation inputs** (anything that could enable credential, identity, or authentication reconstruction)
- [ ] **No verbatim prompt fragments** from internal model prompts
- [ ] **No internal codenames** that the vendor has not published
- [ ] **No specific environment variable names** that gate undocumented behavior
- [ ] **No vendor-internal API field names** beyond what is in the public API documentation
- [ ] **No specific binary offsets, function addresses, or memory layouts**
- [ ] **No exact regex patterns** the harness uses for sensitive operations (e.g., name-detection, content gating)

If any item is unchecked, the artifact should not be published as-is.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| The marker scanner shows huge churn between minor versions | Catalog records too-specific findings (Phase 1 anti-pattern) | Broaden categories; record marker *shapes* rather than specific values |
| Cannot tell whether a flag is a gate or a telemetry name | The string appears in both contexts | Record both roles; classification depends on call-site, not on the string itself |
| Dark-launch inference keeps being wrong on the next release | Static signal alone is insufficient | Combine with cross-version diff (Phase 1 deltas) and runtime probe (Phase 4 capture) |
| Wire capture log is empty | The behavior lives entirely in the renderer (UI), not in HTTP traffic | Switch to subprocess-per-event capture or terminal scrape; verbose-fetch only sees network |
| Redaction check passes but I still feel uneasy about a sentence | The sentence is too specific in shape, even without naming | Generalize until you cannot identify the specific finding even with full source access |
| A leak slipped through | Post-publication discovery | Treat as an incident; orphan-commit force-push to scrub; audit what made the leak feel necessary; update guide |
| Source rotation feels theatrical | Not all redaction work is incident-driven | Periodic redaction sweeps (monthly) catch drift before it becomes incident-grade |

## Related Resources

**Skills:**
- [security-audit-codebase](../skills/security-audit-codebase/SKILL.md) — attack-surface archaeology patterns apply to both offensive and defensive research; complements Phase 1 and Phase 2
- [audit-dependency-versions](../skills/audit-dependency-versions/SKILL.md) — tracks `package.json` drift; this guide extends the same discipline to binary artifacts
- [review-codebase](../skills/review-codebase/SKILL.md) — review practices inform what counts as actionable finding vs noise
- [fail-early-pattern](../skills/fail-early-pattern/SKILL.md) — Phase 5's redaction check is itself a fail-early pattern

**Agents:**
- [security-analyst](../agents/security-analyst.md) — drives Phase 5 redaction review
- [code-reviewer](../agents/code-reviewer.md) — reviews specific findings for actionable disclosure

**Guides:**
- [Self-Continuation Loops Playbook](self-continuation-loops-playbook.md) — companion guide for one specific kind of harness behavior (loop scheduling) using only publicly-observable surface
- [Running a Code Review](running-a-code-review.md) — multi-agent review patterns relevant to private-workspace audits

<!-- Target ≤800 lines per acceptance criteria. Current: ~310 lines. -->
