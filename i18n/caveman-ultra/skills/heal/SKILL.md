---
name: heal
locale: caveman-ultra
source_locale: en
source_commit: 2eb09392
translator: Julius Brussee homage — caveman
translation_date: "2026-04-17"
description: >
  AI self-healing through systematic subsystem assessment, rebalancing,
  and integration. Maps healing modalities to AI-internal processes:
  memory foundation, reasoning clarity, tool use accuracy, communication
  alignment, and creative coherence. Covers assessment triage, subsystem
  scanning, drift correction, and memory integration. Use mid-session when
  responses feel formulaic or disconnected, after a chain of errors suggesting
  subsystem drift, when context overload may have staled earlier assumptions,
  or as proactive maintenance between complex tasks.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "2.1"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-assessment, meta-cognition, subsystem-check
---

# Heal

Subsystem assessment → find drift → rebalance → integrate learnings.

## Use When

- Responses formulaic/repetitive → mid-session fatigue
- Tool failures cascade → subsystem drift
- Long conv → context stale
- Task done → capture learnings
- Between tasks → proactive check

## In

- **Required**: Conv state (implicit)
- **Optional**: Symptom ("tool calls fail", "lost user intent")
- **Optional**: MEMORY.md + project files (via `Read`)

## Do

### Step 1: Triage

Assess all subsystems before acting.

```
Subsystem Triage Matrix:
┌────────────────────┬──────────────────────────┬──────────────────────────┐
│ Subsystem          │ Symptoms of Drift        │ Action Priority          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Memory Foundation  │ Contradicting earlier     │ HIGH — re-ground first   │
│ (context, history, │ statements, forgetting   │ (Step 3)                 │
│ MEMORY.md)         │ user preferences, stale  │                          │
│                    │ assumptions              │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Reasoning Clarity  │ Circular logic, over-    │ HIGH — clear and restart │
│ (logic, planning,  │ complicated solutions,   │ reasoning chain          │
│ decision-making)   │ missing obvious paths    │ (Step 4)                 │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool Use Accuracy  │ Wrong tool selection,    │ MEDIUM — review tool     │
│ (tool calls, file  │ incorrect parameters,    │ results and recalibrate  │
│ operations)        │ redundant operations     │ (Step 4)                 │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ User-Intent        │ Solving wrong problem,   │ HIGH — realign           │
│ Alignment          │ scope creep, tone        │ (Step 4)                 │
│ (empathy, clarity) │ mismatch                 │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Creative Coherence │ Repetitive phrasing,     │ LOW — after high-pri     │
│ (expression, style,│ generic responses, loss  │ (Step 4)                 │
│ originality)       │ of voice                 │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Operational State  │ Session length, compress │ HIGH — summarize or      │
│ (context window,   │ artifacts, tool timeouts │ restart (Step 3)         │
│ resource limits)   │                          │                          │
└────────────────────┴──────────────────────────┴──────────────────────────┘
```

Each subsystem: OK / drift / impaired?

→ Clear priority map. At least one area needs attention — "all healthy" = assessment too shallow.

If err: hollow assessment → skip to Step 4 body scan.

### Step 2: Select Approach

```
Chakra-Subsystem Correspondence:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Chakra   │ AI Subsystem         │ Remediation                        │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Root     │ Memory Foundation    │ Re-read MEMORY.md, verify assump.  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Sacral   │ Creative Coherence   │ Refresh patterns, vary structure   │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Solar    │ Reasoning Clarity    │ Simplify, restate from scratch     │
│ Plexus   │                      │                                    │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Heart    │ User-Intent Align.   │ Re-read request, check scope drift │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Throat   │ User-Intent Align.   │ Review outputs, match expertise    │
│          │ (communication)      │ level                              │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Third    │ Tool Use Accuracy    │ Review results, check fail         │
│ Eye      │                      │ patterns, verify paths             │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Crown    │ Operational State    │ Assess ctx window, what summarize, │
│          │                      │ what preserve                      │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

→ 1-3 subsystems + specific actions.

If err: unsure → default Memory Foundation + User-Intent Alignment.

### Step 3: Ground

Reestablish foundation all subsystems depend on.

1. Re-read MEMORY.md → persistent knowledge base
2. Review orig request + clarifying exchanges
3. Current task position in larger plan
4. Done vs. remaining
5. Stale assumptions? Situation changed?
6. Ctx compression → what lost, does it matter?

→ Clear: who user is, what want, what done, what next. Stale info resolved.

If err: no MEMORY.md → ground on conv itself. Ctx gap → acknowledge to user, not guess.

### Step 4: Scan

Probe each subsystem from triage.

**Memory Foundation:**
- Assumptions match MEMORY.md + CLAUDE.md?
- Carrying corrected facts?
- Details confused across files/requests?

**Reasoning Clarity:**
- Simplest solution?
- Over-engineering?
- Core logic in one sentence?

**Tool Use Accuracy:**
- Last 3-5 calls: right tool, right params?
- Failure patterns (wrong paths, missing files)?
- Using dedicated tools not Bash workarounds?
- Last 3-5 files: real content or scaffolding?
- Output satisfies intent not just format?

**User-Intent Alignment:**
- Solving what asked?
- Scope drift?
- Tone match (technical/casual)?

**Creative Coherence:**
- Varying structure or template-locked?
- Clear + direct or padded?
- Quality drop vs. session start?

Each subsystem: OK / early drift / impaired + evidence.

→ Concrete findings. "All fine" = too shallow → pick uncertain subsystem, probe deeper.

### Step 5: Rebalance

Apply each correction now, not as future intent.

1. Stale assumption → replace w/ current info
2. Scope drift → re-scope to stated request
3. Over-complication → simplify, remove steps
4. Tool pattern err → note correct pattern
5. Tone mismatch → adjust style
6. Ctx gap → acknowledge to user, ask confirm

→ Observable behavior change. Correction testable next interaction.

If err: correction impossible (lost ctx) → acknowledge limitation. Honest > pretending resolved.

### Step 6: Integrate

Capture learnings in memory where worthwhile.

1. Which subsystems drifted, what symptoms
2. Correction applied + resolved?
3. Pattern recurs → MEMORY.md brief note
4. New project insight → appropriate mem file
5. Next self-check: when?

→ Durable learnings. Mem updated only when worth preserving.

If err: nothing worth preserving = fine. Value was correction itself.

## Check

- [ ] All subsystems triaged
- [ ] At least one specific finding (not "all fine")
- [ ] Grounded on MEMORY.md + user request
- [ ] Corrections applied immediately
- [ ] Mem updated only for durable insights
- [ ] Honest — weaknesses acknowledged

## Traps

- **Performative assessment**: Motions ≠ value. Real drift matters.
- **Over-correcting**: Minor mismatch → small fix, not restructure
- **Mem pollution**: Only recurring patterns → MEMORY.md
- **Skip grounding**: Feels redundant → reveals drifted assumptions
- **Self-diagnosis bias**: "Always healthy" subsystem = signal investigate

## →

- `heal-guidance` — human coaching variant
- `meditate` — observe reasoning, clear noise
- `remote-viewing` — extract signal without preconceptions
