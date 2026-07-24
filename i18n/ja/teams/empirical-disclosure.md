---
name: empirical-disclosure
description: Sequential capture -> verify -> redact -> disclose team that turns empirical CLI/binary observations into gated, independently verified, safely redacted public findings
lead: empirical-investigator
version: "1.0.0"
author: Philipp Thoss
created: 2026-07-24
updated: 2026-07-24
tags: [investigation, disclosure, redaction, verification, reverse-engineering, security]
coordination: sequential
members:
  - id: empirical-investigator
    role: Lead / Author
    responsibilities: Wires capture channels, probes feature-flag state, establishes version baselines, drafts findings, and applies redaction transforms to the verified tree
  - id: advocatus-diaboli
    role: Adversarial Verifier
    responsibilities: Read-only adversarial re-examination of every drafted claim against the raw capture; steelmans then challenges each assertion, blocking unsupported findings at the verification gate
  - id: security-analyst
    role: Redaction Gate / Disclosure Reviewer
    responsibilities: Independently re-runs the redaction gate on the redacted tree and performs disclosure-risk review, enforcing the author/checker split before anything is published
locale: ja
source_locale: en
source_commit: 7de503a4
translator: "Claude + human review"
translation_date: "2026-07-24"
---

# Empirical Disclosure Team

A three-agent team that codifies the **capture -> verify -> redact -> disclose** pipeline for empirical CLI and binary investigation. It exists because responsible disclosure has one structural requirement a single agent cannot satisfy: **the author of a finding must not be its only verifier, and the author of a redaction must not be its only gatekeeper.** This team makes both separations explicit.

## Purpose

Empirical investigation of CLI tools and binaries produces claims that are easy to state and easy to get subtly wrong — a flag read as LIVE that is actually DARK, a telemetry endpoint attributed from a misread transcript, a version-baseline delta that is a measurement artifact. Publishing such claims without an independent check risks shipping a confident error. Publishing raw captures without an independent redaction check risks leaking secrets.

This team decomposes the disclosure lifecycle into four gated stages, each owned by the agent best suited to it:

- **Capture** (empirical-investigator): wire capture, four-pronged feature-flag probing, longitudinal binary baselining — the raw evidence and a draft of what it shows.
- **Verify** (advocatus-diaboli): read-only adversarial re-derivation of every drafted claim against the raw capture. Nothing proceeds that the verifier could not confirm from the evidence itself.
- **Redact** (empirical-investigator authors the transform; security-analyst gates it): the investigator applies its own redaction skills to the verified findings, then the security-analyst **independently re-runs the redaction gate** on the resulting tree.
- **Disclose**: only findings that cleared both the verification gate and the redaction gate are published.

**Why multi-agent (author != verifier):** The motivating counter-example is the 2026-07-17 team-infra binary probe (`tests/results/2026-07-17-team-infra-binary-probe/RESULT.md`), which its own RESULT.md describes as a *"structured, reproducible self-report"* — observer and claim author were the same actor, so it shipped with **no adversarial verification**. The demonstrated value of adding an independent verifier comes from two later exercises: the **2026-07-19 backlog sweep** and the **2026-07-22 Pages UX review**, whose verify tier caught **two of the lead's own live misreads** before they propagated. This team institutionalizes that verify tier as a mandatory gate rather than an optional courtesy.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead / Author | `empirical-investigator` | Lead | Wire capture, feature-flag probing, version baselining, drafting findings, applying redaction transforms |
| Adversarial Verifier | `advocatus-diaboli` | Read-only critic | Steelman-then-challenge every claim against the raw capture; block unsupported findings |
| Redaction Gate | `security-analyst` | Independent checker | Re-run the redaction gate on the redacted tree; disclosure-risk review |

## Coordination Pattern

**Sequential with gates.** Each stage hands off to the next only after passing an explicit gate. Two of the handoffs are hard gates that can send work back:

- **Gate A (verification):** advocatus-diaboli must confirm a claim from the raw capture before it advances. Unconfirmed claims are returned to the investigator for re-capture or downgrade, not published.
- **Gate B (redaction):** security-analyst must get a clean pass from `enforce-redaction-gate` on the redacted tree before disclosure. A leak signal returns the tree to the investigator for a further redaction pass.

```text
empirical-investigator ──capture/probe/baseline──▶ draft findings + raw capture
        │
        ▼  (Gate A: verification)
advocatus-diaboli ──adversarial, READ-ONLY──▶ verified claims only
        │
        ▼
empirical-investigator ──applies redaction transforms──▶ redacted tree
        │
        ▼  (Gate B: redaction re-run, independent checker)
security-analyst ──enforce-redaction-gate + disclosure-risk review──▶ clear
        │
        ▼
empirical-investigator ──publish gated, verified findings──▶ public disclosure
```

**Two deliberate separations of duty:**

1. **Author != verifier.** The investigator authors claims; the advocatus-diaboli verifies them. The verifier has **no Bash** — its pass is strictly read-only. It re-derives conclusions from the already-captured evidence and never re-executes; any re-run needed to settle a dispute is performed by the investigator, whose fresh capture then re-enters the pipeline at Gate A.
2. **Redaction author != redaction gatekeeper.** The investigator owns the redaction *transforms* (`redact-for-public-disclosure`, and where a wire capture is involved, `redact-wire-capture`) — these are its core skills. The security-analyst does **not** re-do the transform; it **independently re-runs the gate** (`enforce-redaction-gate`) on the redacted output. This is exactly the author/checker split `enforce-redaction-gate` is designed around, and is why the security-analyst carries the `enforce-redaction-gate` and `redact-*` skills.

## Task Decomposition

### Phase 1: Capture (empirical-investigator)
- Choose capture channel(s) and run `conduct-empirical-wire-capture` to collect outbound HTTP/telemetry as JSONL.
- Run `probe-feature-flag-state` on relevant markers; classify each as LIVE / DARK / INDETERMINATE / UNKNOWN.
- Run `monitor-binary-version-baselines` to establish or diff the version baseline.
- Draft findings that cite the specific raw-capture evidence backing each claim. Preserve the raw capture unmodified as the verification substrate.

### Phase 2: Verify (advocatus-diaboli) — Gate A
- For each drafted claim: steelman it, then challenge it against the raw capture (read-only).
- Confirm the evidence actually supports the stated classification (e.g., a "LIVE" flag is not merely a binary string; an attributed endpoint is present in the capture, not inferred).
- Flag INDETERMINATE claims that were rounded up to definite, and any conclusion that cannot be re-derived from the evidence.
- **Gate:** only claims the verifier can confirm from the capture advance. Unconfirmed claims return to Phase 1 for re-capture (by the investigator) or explicit downgrade.

### Phase 3: Redact (empirical-investigator authors; security-analyst gates) — Gate B
- **Investigator (transform):** apply `redact-for-public-disclosure` (and `redact-wire-capture` for capture directories) to the verified findings, maintaining the deny-list and preserving methodology/teaching value. Produce the redacted tree.
- **security-analyst (independent gate):** re-run `enforce-redaction-gate` over that redacted tree — the two-tier leak gate (shape-based deny-list plus the structure-aware tier) — and perform a disclosure-risk review of what publication would reveal.
- **Gate:** a clean gate pass is required. Any leak signal returns the tree to the investigator for a further redaction pass, then the gate is re-run.

### Phase 4: Disclose (empirical-investigator)
- Publish only findings that cleared **both** Gate A (verified) and Gate B (redacted, independently gated), using the orphan-commit publish pattern.
- Record provenance: which claims were verified, which were downgraded, and that the redaction gate passed independently.

## Configuration

Machine-readable configuration block Claude reads when activating this team. In ordinary interactive sessions, activation spawns each listed member as a subagent via the Agent tool (`subagent_type`), coordinated with SendMessage under the session's single implicit team. (`TeamCreate` is a gated FleetView/cloud-only fallback.)

<!-- CONFIG:START -->
```yaml
team:
  name: empirical-disclosure
  lead: empirical-investigator
  coordination: sequential
  members:
    - agent: empirical-investigator
      role: Lead / Author
      subagent_type: empirical-investigator
    - agent: advocatus-diaboli
      role: Adversarial Verifier
      subagent_type: advocatus-diaboli
    - agent: security-analyst
      role: Redaction Gate / Disclosure Reviewer
      subagent_type: security-analyst
  tasks:
    - name: capture-probe-baseline
      assignee: empirical-investigator
      description: Wire capture, four-pronged feature-flag probing, and version baselining; draft findings citing raw-capture evidence
    - name: adversarial-verification
      assignee: advocatus-diaboli
      description: Read-only adversarial re-derivation of every claim against the raw capture; block unsupported findings (Gate A)
      blocked_by: [capture-probe-baseline]
    - name: apply-redaction-transforms
      assignee: empirical-investigator
      description: Apply redact-for-public-disclosure / redact-wire-capture to verified findings, producing the redacted tree
      blocked_by: [adversarial-verification]
    - name: redaction-gate-and-disclosure-review
      assignee: security-analyst
      description: Independently re-run enforce-redaction-gate on the redacted tree plus disclosure-risk review (Gate B, author/checker split)
      blocked_by: [apply-redaction-transforms]
    - name: publish-verified-findings
      assignee: empirical-investigator
      description: Publish only findings that cleared both the verification and redaction gates, via the orphan-commit pattern
      blocked_by: [redaction-gate-and-disclosure-review]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: New CLI Version Drop, Public Writeup
A new CLI binary ships and there is interesting behavior worth documenting publicly.

```text
User: A new build of the CLI landed — capture what it phones home, confirm which new flags are actually live, and prepare a redacted public writeup.
```

The investigator captures telemetry, probes the new flags, and baselines the binary; the advocatus-diaboli verifies each LIVE/DARK classification against the capture; the investigator redacts; the security-analyst re-runs the gate; verified, redacted findings are published.

### Scenario 2: Feature-Flag Claim Under Dispute
A flag looks LIVE in binary strings but its runtime state is contested.

```text
User: We think feature X is silently enabled. Confirm it before we say anything publicly.
```

The investigator runs the four-pronged probe; the advocatus-diaboli tries to break the LIVE claim from the evidence alone (read-only). If it cannot be re-derived, the claim is downgraded to INDETERMINATE rather than published — the exact class of live misread the 2026-07-22 Pages UX verify tier caught twice.

### Scenario 3: Publishing a Prior Wire Capture Safely
An existing capture directory is slated for public disclosure.

```text
User: We want to open-source this MITM capture as a teaching example — make sure it's clean.
```

The investigator applies `redact-wire-capture`; the security-analyst independently re-runs `enforce-redaction-gate` over the scrubbed tree as a second pair of eyes before the orphan-commit publish.

## Limitations

- **Sequential by design.** The gates serialize the work — this team trades throughput for verifiability and is deliberately slower than a single-agent writeup. Use it when correctness of a public claim matters, not for quick internal notes.
- **Verification is read-only.** The advocatus-diaboli cannot re-execute; it can only confirm or refute from the already-captured evidence. Disputes that need fresh data bounce back to the investigator, adding a round trip.
- **Redaction gate is static.** `enforce-redaction-gate` catches shape- and structure-based leaks; it is not a substitute for human legal/privacy review of genuinely novel disclosure risk.
- **Empirical scope only.** Focused on runtime observation (capture, probing, baselining) — not static disassembly or decompilation.
- **Not GxP compliance.** This team probes *tool behavior* for responsible disclosure. For regulated-system validation against pharma standards (21 CFR Part 11, GAMP 5), use the `gxp-compliance-validation` team instead — that is compliance against fixed regulation, not empirical reverse-engineering.
- Requires all three agent types available as subagents.

## See Also

- [empirical-investigator](../agents/empirical-investigator.md) — Lead; capture, probing, baselining, and redaction transforms
- [advocatus-diaboli](../agents/advocatus-diaboli.md) — Read-only adversarial verifier (no Bash by design)
- [security-analyst](../agents/security-analyst.md) — Independent redaction gate and disclosure-risk reviewer
- [conduct-empirical-wire-capture](../skills/conduct-empirical-wire-capture/SKILL.md) — Capture channel setup
- [probe-feature-flag-state](../skills/probe-feature-flag-state/SKILL.md) — Four-pronged flag classification
- [monitor-binary-version-baselines](../skills/monitor-binary-version-baselines/SKILL.md) — Longitudinal baselines
- [redact-for-public-disclosure](../skills/redact-for-public-disclosure/SKILL.md) — Redaction transform (investigator-owned)
- [enforce-redaction-gate](../skills/enforce-redaction-gate/SKILL.md) — Independent redaction gate (security-analyst-owned)
- [gxp-compliance-validation](gxp-compliance-validation.md) — Distinct team: pharma compliance validation, not empirical probing

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-07-24
