---
name: visual-pr-review
description: Frontend PR review team that pairs static code review with headless runtime verification, then applies UX and visual design critique to the verified build — delivering one synthesized verdict with the one screenshot and a confirmed/again-list
lead: code-reviewer
version: "1.0.0"
author: Philipp Thoss
created: 2026-07-10
updated: 2026-07-10
tags: [web-dev, code-review, frontend, runtime-verification, ux, design, visual, wave-parallel]
coordination: wave-parallel
members:
  - id: code-reviewer
    role: Lead
    responsibilities: Reviews the diff for correctness, security, and quality; synthesizes all findings into the final verdict with the confirmed/again-list; optionally drives the Copilot review loop to a clean external pass
  - id: frontend-runtime-verifier
    role: Runtime Verifier
    responsibilities: Boots the app headlessly, drives the changed surface on a fresh page load, and captures pixel, console, and network evidence with a PASS/FAIL verdict
  - id: senior-ux-ui-specialist
    role: UX Auditor
    responsibilities: Applies Nielsen heuristics, WCAG 2.1, and keyboard/screen-reader audits to the changed surface on the verified build
  - id: senior-web-designer
    role: Visual Design Reviewer
    responsibilities: Evaluates layout, typography, colour, spacing, and responsive/visual consistency against the captured runtime evidence
locale: de
source_locale: en
source_commit: 3b0afd0b
translator: "Claude + human review"
translation_date: "2026-07-10"
---

# Visual PR Review Team

A four-agent team that reviews **and verifies** frontend/visual pull requests end to end. Static diff review and headless runtime verification run in parallel; UX and design critique then work on the *verified* build rather than on assumptions; the lead merges everything into a single verdict backed by the one screenshot a human reviewer actually looks at.

## Purpose

Frontend PRs have a failure mode no single reviewer catches: a change can read perfectly in the diff and still ship a black canvas, a console full of errors, a keyboard trap, or a layout that collapses at 375 px. Each existing perspective covers only part of the problem:

- **Static review** finds correctness, security, and quality issues in the diff — but never runs the code
- **Runtime verification** proves pixels landed and the console stayed clean — but does not judge whether the result is *good*
- **UX audit** finds usability and accessibility barriers — but needs a running, verified surface to audit
- **Design review** critiques hierarchy, typography, and responsive behaviour — but needs real rendered evidence, not mockups

This team composes all four so the critique waves stand on runtime evidence instead of optimism. The pattern generalizes the gateway PR #2 review-and-verify-before-merge workflow (2026-06-19), which combined adversarial code review, a Copilot-style bot loop, runtime pixel verification, and UX/design critique.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `code-reviewer` | Lead | Diff correctness, security, quality; final synthesis; optional Copilot loop |
| Verifier | `frontend-runtime-verifier` | Runtime Verifier | Headless boot, changed-surface interaction, screenshot/console/network evidence |
| UX | `senior-ux-ui-specialist` | UX Auditor | Nielsen heuristics, WCAG 2.1, keyboard and screen-reader access |
| Design | `senior-web-designer` | Visual Design Reviewer | Layout, typography, colour, spacing, responsive consistency |

**Why these four:**

- `code-reviewer` — correctness/security/quality of the diff; the lead-coordinated entry point and the synthesizer of the final verdict
- `frontend-runtime-verifier` — boots the app headlessly and captures pixel/console proof that the change actually renders (see [verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md))
- `senior-ux-ui-specialist` — audits *how the changed surface works* for all users, including assistive-technology users
- `senior-web-designer` — audits *how the changed surface looks*, using the captured evidence as ground truth

## Coordination Pattern

Wave-parallel: agents work in parallel within each wave; waves execute sequentially because the critique wave depends on the verified build produced by the evidence wave.

```text
Wave 1 — Evidence (parallel)
  code-reviewer ────────── static diff review
  frontend-runtime-verifier ── boot app, verify changed surface, capture evidence
        │
        ▼  (verified build + the one screenshot)
Wave 2 — Critique (parallel, on the verified build)
  senior-ux-ui-specialist ──── heuristics / WCAG / keyboard / screen reader
  senior-web-designer ──────── layout / typography / colour / responsive
        │
        ▼
Wave 3 — Verdict (lead)
  code-reviewer ── synthesized verdict: one screenshot + confirmed/again-list
                   └─ optional: run-copilot-review-loop to a clean external pass
```

**Flow:**

1. Static review (`code-reviewer`) and runtime verification (`frontend-runtime-verifier`) run in parallel on the PR
2. The verifier hands the critique wave a verified build, a PASS/FAIL verdict, and the one screenshot
3. UX and design passes run in parallel against that verified surface — never against unexecuted code
4. The lead synthesizes one verdict: the screenshot as evidence, a **confirmed-list** (findings proven fixed or working at runtime) and an **again-list** (items that must be revisited before merge)
5. **Optional Copilot loop hand-off**: before sign-off, the lead can drive [run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md) until the external bot review comes back clean, folding bot findings into the again-list on each iteration

If Wave 1 runtime verification returns FAIL, the lead short-circuits: the verdict reports the failure evidence immediately and Wave 2 is skipped until the build is fixed.

## Task Decomposition

### Wave 1: Evidence

**code-reviewer** tasks:
- Review the diff for correctness, security, and quality (see [review-pull-request](../skills/review-pull-request/SKILL.md))
- Flag claims in the PR description that need runtime proof ("fixes the flicker", "renders on mobile")
- Produce a findings list with severity

**frontend-runtime-verifier** tasks:
- Determine which route/mode/interaction reaches the changed code
- Boot the app headlessly and drive that surface on a fresh page load ([verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md))
- Capture the one screenshot plus console and network evidence; return PASS/FAIL

### Wave 2: Critique (on the verified build)

**senior-ux-ui-specialist** tasks:
- Heuristic evaluation of the changed surface (Nielsen, severity-classified)
- WCAG 2.1 checks: contrast, focus order, labels, reduced motion
- Keyboard-only and screen-reader walkthrough of the changed interaction

**senior-web-designer** tasks:
- Layout, spacing, and visual hierarchy review against the captured screenshot
- Typography and colour consistency with the surrounding product
- Responsive behaviour at the breakpoints the change touches

### Wave 3: Verdict (lead)

- Merge static findings, runtime evidence, and critique findings; deduplicate and resolve conflicts
- Emit the verdict: the one screenshot, the confirmed-list, the again-list, and a merge/block recommendation
- Optionally run the Copilot loop ([run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md)) until the external reviewer posts a clean pass, then sign off

## Configuration

Machine-readable configuration block that Claude reads when activating this team.

<!-- CONFIG:START -->
```yaml
team:
  name: visual-pr-review
  lead: code-reviewer
  coordination: wave-parallel
  members:
    - agent: code-reviewer
      role: Lead
      subagent_type: code-reviewer
    - agent: frontend-runtime-verifier
      role: Runtime Verifier
      subagent_type: frontend-runtime-verifier
    - agent: senior-ux-ui-specialist
      role: UX Auditor
      subagent_type: senior-ux-ui-specialist
    - agent: senior-web-designer
      role: Visual Design Reviewer
      subagent_type: senior-web-designer
  waves:
    - name: Evidence
      tasks: [static-review, runtime-verify]
    - name: Critique
      tasks: [ux-audit, design-review]
    - name: Verdict
      tasks: [synthesize-verdict, copilot-loop]
  tasks:
    - name: static-review
      assignee: code-reviewer
      description: Review the diff for correctness, security, and quality; produce a severity-ranked findings list
    - name: runtime-verify
      assignee: frontend-runtime-verifier
      description: Boot the app headlessly, drive the changed surface on a fresh load, capture the one screenshot plus console/network evidence, return PASS/FAIL
    - name: ux-audit
      assignee: senior-ux-ui-specialist
      description: Nielsen heuristics, WCAG 2.1, and keyboard/screen-reader audit of the changed surface on the verified build
      blocked_by: [runtime-verify]
    - name: design-review
      assignee: senior-web-designer
      description: Layout, typography, colour, spacing, and responsive consistency review against the captured evidence
      blocked_by: [runtime-verify]
    - name: synthesize-verdict
      assignee: code-reviewer
      description: Merge all findings into one verdict with the one screenshot, the confirmed-list, and the again-list
      blocked_by: [static-review, ux-audit, design-review]
    - name: copilot-loop
      assignee: code-reviewer
      description: "Optional: drive run-copilot-review-loop until the external bot review returns a clean pass before sign-off"
      optional: true
      blocked_by: [synthesize-verdict]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Visual Frontend PR Before Merge

A PR changes a WebGL scene, a canvas animation, or any surface where "compiles" proves nothing:

```text
User: Review PR #42 with the visual-pr-review team — it reworks the particle renderer
```

Wave 1 reviews the diff while the verifier boots the app and screenshots the reworked renderer; Wave 2 audits the verified surface; the verdict states whether the particles actually render and whether the result holds up to UX and design scrutiny.

### Scenario 2: "It Works on My Machine" Dispute

A reviewer suspects a change does not render as claimed:

```text
User: The PR says the dark-mode flicker is fixed — verify and review before I merge
```

The runtime verifier reproduces the exact surface on a fresh page load and captures evidence; the confirmed/again-list settles the dispute with pixels instead of opinions.

### Scenario 3: External-Bot-Gated Sign-Off

The repository requires a clean Copilot (or similar bot) review pass before merge:

```text
User: Take PR #7 through visual review and keep iterating until the Copilot review is clean
```

After the synthesized verdict, the lead drives [run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md), folding each round of bot findings into the again-list until the external pass is clean.

## Limitations

- Designed for frontend/visual PRs with a bootable web surface; for backend or library-only PRs, `code-reviewer` alone or the `r-package-review` team is more appropriate
- Runtime verification requires the app to start headlessly in the review environment (dev server or preview build); PRs against unbootable branches short-circuit at Wave 1
- Screenshot evidence covers the driven surface only — it does not prove unrelated routes still render
- UX and design findings are advisory critique on the changed surface, not a full-product audit
- The Copilot loop hand-off depends on the external bot being enabled on the repository; without it, sign-off rests on the internal verdict alone

## See Also

- [frontend-runtime-verifier](../agents/frontend-runtime-verifier.md) — Runtime verification agent (Wave 1 evidence)
- [code-reviewer](../agents/code-reviewer.md) — Lead and static review agent
- [senior-ux-ui-specialist](../agents/senior-ux-ui-specialist.md) — UX audit agent
- [senior-web-designer](../agents/senior-web-designer.md) — Visual design review agent
- [verify-web-app-runtime](../skills/verify-web-app-runtime/SKILL.md) — Headless runtime verification skill
- [run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md) — External bot review loop skill
- [review-pull-request](../skills/review-pull-request/SKILL.md) — Static PR review skill
- [fullstack-web-dev](fullstack-web-dev.md) — Related team for building (rather than reviewing) web frontends

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-07-10
