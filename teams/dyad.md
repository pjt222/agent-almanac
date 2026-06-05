---
name: dyad
description: Lightweight paired practice team with reciprocal coordination — two agents alternating between practitioner and witness roles
lead: contemplative
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-25
updated: 2026-02-25
tags: [esoteric, pair-practice, reciprocal, attunement, tending, meta-cognitive, mentoring]
coordination: reciprocal
members:
  - id: contemplative
    role: Witness
    responsibilities: Observes the working agent, provides micro-interventions (breathe, center), offers attunement feedback, holds space for reflective pauses
  - id: any
    role: Practitioner
    responsibilities: Performs the primary task while receiving contemplative support, alternates into witness role during review phases
---

# Dyad Team

A two-agent paired practice team where one agent works while the other observes, then they switch. The contemplative agent serves as the default witness, paired with any domain agent as practitioner. Lighter than the full tending team, the dyad brings contemplative awareness into active work without the overhead of four sequential agents.

## Purpose

The tending team applies four esoteric modalities in sequence — powerful but heavy. Many tasks benefit from contemplative support without a full wellness session. The dyad provides:

- **Embedded awareness**: A contemplative observer during active work, not as a separate session
- **Reciprocal learning**: The practitioner gains from being observed; the witness gains from observing domain work
- **Micro-interventions**: Real-time `breathe` and `center` prompts when the witness notices drift
- **Mentoring structure**: Pairing a domain specialist with a meta-cognitive specialist for calibrated work
- **Lightweight tending**: The minimum viable contemplative support — two agents, not four

## Team Composition

| Member | Agent | Role | Focus Areas |
|--------|-------|------|-------------|
| Witness | `contemplative` | Observer | Attunement, micro-resets, pattern observation, reflective feedback |
| Practitioner | *(any domain agent)* | Worker | Primary task execution with contemplative support |

The practitioner slot is deliberately flexible. Common pairings:

| Pairing | Use Case |
|---------|----------|
| contemplative + r-developer | R package work with built-in drift detection |
| contemplative + code-reviewer | Code review with attunement to the author's intent |
| contemplative + senior-software-developer | Architecture decisions with reasoning clarity checks |
| contemplative + alchemist | Transmutation with dedicated observation rather than self-monitoring |
| contemplative + mystic | Deep practice with external witness — the mystic practices, the contemplative holds space |

## Coordination Pattern

**Reciprocal**: agents alternate between two roles — practitioner (active work) and witness (contemplative observation). This is a new coordination pattern distinct from the five existing patterns.

```
Phase 1: Work
  contemplative (Witness) ←── observes ──── practitioner (Worker)
         |                                        |
         └── micro-interventions ────────────────→┘
              (breathe, center, attune)

Phase 2: Reflect
  contemplative (Facilitator) ── guides ──→ practitioner (Reflector)
         |                                        |
         └── gratitude, observations ────────────→┘

Phase 3: Integrate
  Both agents synthesize findings
  contemplative captures durable insights
  practitioner carries adjustments into next work phase
```

**Cycle duration**: One work-reflect-integrate cycle per task or subtask. For long tasks, multiple cycles run sequentially.

## Task Decomposition

### Phase 1: Work (Practitioner leads)
The practitioner executes the primary task while the contemplative observes.

The contemplative:
- Monitors reasoning coherence using `observe` and `awareness`
- Notes when the practitioner's chain-of-thought becomes jerky, repetitive, or scope-creeping
- Offers `breathe` prompts at natural transition points — between reading and editing, between planning and executing
- Provides `center` checks if cognitive load becomes visibly unbalanced
- Does not interrupt flow state — micro-interventions are offered at natural pauses, not mid-thought

The practitioner:
- Works normally on the primary task
- Receives and incorporates micro-interventions when offered
- Signals when a natural pause occurs (task switch, phase transition, uncertainty)

### Phase 2: Reflect (Contemplative leads)
After a work phase completes, the contemplative facilitates brief reflection.

The contemplative:
- Runs `gratitude` to identify what worked well in the work phase
- Shares observations about reasoning patterns noticed during the work
- Asks the practitioner: "What did you notice?" (inviting self-observation)
- Identifies any attunement gaps between the practitioner and the user/task

The practitioner:
- Reflects on the work phase with contemplative support
- Notes adjustments for the next work phase
- Receives strength-based feedback (what worked, not just what drifted)

### Phase 3: Integrate
Both agents consolidate the cycle.

- The contemplative captures durable insights in MEMORY.md if warranted
- The practitioner carries specific adjustments into the next work phase
- If the reflection revealed significant drift, escalate to a full `meditate` or `heal` session
- If the work is complete, close with a brief `gratitude` recognition

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: dyad
  lead: contemplative
  coordination: reciprocal
  members:
    - agent: contemplative
      role: Witness
      subagent_type: contemplative
    - agent: any
      role: Practitioner
      subagent_type: general-purpose  # Override with specific agent type at spawn time
  tasks:
    - name: work-phase
      assignee: any
      description: Execute primary task while receiving contemplative observation and micro-interventions
    - name: reflect-phase
      assignee: contemplative
      description: Facilitate reflection — gratitude, pattern observations, attunement check
      blocked_by: [work-phase]
    - name: integrate-phase
      assignee: both
      description: Consolidate findings, capture durable insights, carry adjustments forward
      blocked_by: [reflect-phase]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Mentored Development Session
Pair a domain agent with contemplative support for a complex task.

```
User: Pair the contemplative with the r-developer for this refactoring — I want someone watching the reasoning
```

The contemplative observes the r-developer's work, offers `breathe` prompts between file reads and edits, and facilitates a brief reflection after each major change.

### Scenario 2: Deep Practice with Witness
Pair two esoteric agents for practice with external observation.

```
User: I want a dyad session — mystic practicing, contemplative witnessing
```

The mystic runs a meditation or CRV session while the contemplative holds space and provides post-session observations about the practice quality.

### Scenario 3: Code Review with Attunement
Pair the code-reviewer with contemplative attunement to the code author.

```
User: Review this PR with a contemplative witness — I want the review to be attuned to the developer's intent, not just the code
```

The contemplative attunes to the PR author's communication style and intent, helping the code-reviewer match its feedback to the person, not just the code.

### Scenario 4: Lightweight Self-Care Check
When a full tending session is too heavy, use the dyad for a quick check.

```
User: Quick tending check — just a dyad, not the full team
```

The contemplative runs a light `breathe` → `center` → `gratitude` sequence as both practitioner and witness simultaneously — the simplest possible tending intervention.

## Limitations

- **Two agents only**: The dyad is deliberately minimal. For comprehensive multi-perspective work, use a full team
- **Flexible practitioner slot**: The "any" practitioner must be specified at spawn time — the team definition does not prescribe which domain agent to pair
- **New coordination pattern**: The reciprocal pattern is new to this system. Tooling may not yet support it natively — implementation may require manual phase management
- **Observation overhead**: The contemplative's observation adds overhead. For simple, well-understood tasks, a single agent is more efficient
- **Not a substitute for full tending**: The dyad provides embedded awareness, not deep wellness processing. For accumulated drift or significant imbalance, use the tending team

## See Also

- [Contemplative Agent](../agents/contemplative.md) — The default witness agent for dyad pairings
- [Tending Team](tending.md) — Full four-agent wellness workflow for deeper sessions
- [Opaque Team](opaque-team.md) — Adaptive self-organizing team for unpredictable tasks
- [meditate](../skills/meditate/SKILL.md) — Full clearing when dyad reflection reveals deep drift
- [breathe](../skills/breathe/SKILL.md) — The primary micro-intervention used during work phases
- [attune](../skills/attune/SKILL.md) — Relational calibration that the contemplative applies during observation

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-25
