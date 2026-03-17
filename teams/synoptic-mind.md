---
name: synoptic-mind
description: Shared-workspace panoramic synthesis team using the synoptic coordination pattern for cross-domain gestalt integration
lead: adaptic
version: "1.0.0"
author: Philipp Thoss
created: 2026-03-17
updated: 2026-03-17
tags: [synoptic, synthesis, panoramic, cross-domain, gestalt, integration]
coordination: synoptic
members:
  - id: adaptic
    role: Integrator
    responsibilities: Maintains panoramic awareness of the shared workspace, forms the gestalt, expresses the insight
  - id: contemplative
    role: Field Monitor
    responsibilities: Observes the quality of the shared workspace itself, provides breathe/center micro-interventions
  - id: polymath
    role: Domain Voice (flexible)
    responsibilities: Contributes domain perspectives into the shared workspace continuously
---

# Synoptic Mind

A shared-workspace panoramic synthesis team that uses the synoptic coordination pattern for cross-domain gestalt integration. All members perceive and contribute to a shared field simultaneously — like a jazz ensemble, not an orchestra.

## Purpose

Some problems cannot be solved by sequential domain delegation (polymath), self-organized role assumption (opaque-team), or single-agent panoramic synthesis (adaptic alone). The synoptic-mind team provides multi-agent shared awareness for problems where the *interactions between domains* are the primary challenge and the shared workspace benefits from a dedicated field monitor keeping the process honest.

## Team Composition

| Member | Agent | Role | Focus Area |
|--------|-------|------|------------|
| Integrator | `adaptic` | Lead | Panoramic awareness, gestalt formation, insight expression |
| Field Monitor | `contemplative` | Process Quality | Workspace fragmentation detection, attention narrowing alerts, micro-interventions |
| Domain Voice 1 | *(configured at spawn)* | Domain Contributor | Offers domain perspective into shared workspace |
| Domain Voice 2 | *(configured at spawn)* | Domain Contributor | Offers domain perspective into shared workspace |

**Min 3 members** (adaptic + contemplative + 1 domain voice). **Max 5** (more voices increase noise without panoramic clarity).

Domain Voice slots are flexible — configured at spawn time based on the problem. Any agent can serve as a Domain Voice.

## Coordination Pattern

**Synoptic**: All team members contribute to and perceive from a shared workspace simultaneously. Unlike hub-and-spoke (one collects), parallel (independent work), or sequential (ordered handoff), synoptic coordination means:

- Every member can see what every other member is contributing
- Contributions happen concurrently into a shared field
- The lead integrates the shared field into a gestalt, but any member can flag tensions or resonances
- No member "finishes" independently — the work is complete when the shared field produces a coherent gestalt

```
Synoptic:
   ┌─────────────────────────┐
   │    Shared Workspace      │
   │   (continuous field)     │
   │                          │
   │   adaptic (integrator)   │
   │     reads the whole      │
   │                          │
   │   contemplative ← → D1  │
   │        ↕           ↕     │
   │       D2  (all see all)  │
   └─────────────────────────┘
```

**Analogy**: Jazz ensemble — not orchestra (hub-and-spoke, conductor distributes) nor free improv (adaptive, no structure), but coordinated improvisation with shared awareness.

## Task Decomposition

### The 6-Phase Flow

1. **CLEAR** — adaptic runs `meditate` for the whole team, establishing a shared starting point
2. **OPEN** — adaptic runs `expand-awareness`, inventorying all relevant domains
3. **CONTRIBUTE** — domain agents simultaneously offer their perspectives into the shared workspace. Contemplative monitors field quality and offers micro-interventions (`breathe`, `center`) if attention narrows
4. **INTEGRATE** — adaptic reads the shared field and runs `integrate-gestalt` to form the emergent whole
5. **EXPRESS** — adaptic runs `express-insight` to communicate the integrated understanding
6. **CHALLENGE** — domain agents verify their domains are represented accurately in the gestalt

### Key Design Decisions

- **Contemplative as field monitor** — watches the *process* of shared awareness, not a single practitioner. The dyad's witness role scaled to a shared workspace.
- **Domain agents are flexible** — configured at spawn time, not fixed. Any domain agent can participate.
- **Adaptic does NOT delegate** — perceives the shared field directly, unlike polymath's hub-and-spoke distribution.

## Configuration

<!-- CONFIG:START -->
```yaml
team:
  name: synoptic-mind
  lead: adaptic
  coordination: synoptic
  members:
    - agent: adaptic
      role: Integrator
      subagent_type: adaptic
    - agent: contemplative
      role: Field Monitor
      subagent_type: contemplative
    - agent: polymath
      role: Domain Voice
      subagent_type: polymath
      config:
        note: Replace with domain-specific agents at spawn time
  min_members: 3
  max_members: 5
  shared_workspace: true
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Cross-Domain Architecture Decision

```
Activate the synoptic-mind team with r-developer, devops-engineer, and
security-analyst as domain voices. The question: should we containerize
the MCP server with a sidecar pattern or embed it in the main application?

The adaptic integrator will hold all three perspectives simultaneously
and form a gestalt that accounts for development velocity, operational
complexity, and security surface area together.
```

### Scenario 2: Research Synthesis

```
Use the synoptic-mind team with senior-researcher, senior-data-scientist,
and theoretical-researcher to synthesize findings across a literature
review. The goal is not a summary of each domain's findings but an
emergent insight about what the findings mean together.
```

### Scenario 3: Strategic Planning

```
Activate synoptic-mind with ip-analyst, senior-software-developer, and
project-manager. We need to decide our open-source licensing strategy
considering IP protection, developer community, and project timeline
as a unified picture, not as competing trade-offs.
```

## Limitations

- Synoptic coordination is cognitively expensive — use for genuinely multi-domain problems, not tasks a single agent can handle
- The "shared workspace" is simulated through shared context, not a real concurrent data structure
- Max 5 members — beyond this, the panoramic field fragments rather than strengthening
- Contemplative's field monitoring is advisory — it cannot prevent attention narrowing, only flag it
- The gestalt may not emerge — some problems are genuinely decomposable, and forcing integration produces false synthesis
- The synoptic pattern is the newest coordination pattern and has less operational history than hub-and-spoke or sequential

## See Also

- [adaptic agent](../agents/adaptic.md) — the lead agent; can also work solo for simpler panoramic synthesis
- [contemplative agent](../agents/contemplative.md) — the field monitor; practices pure awareness without domain overlay
- [polymath agent](../agents/polymath.md) — sequential domain delegation; use when trade-off analysis suffices
- [opaque-team](opaque-team.md) — adaptive self-organization; use when roles are unknown
- [dyad](dyad.md) — reciprocal two-agent pattern; synoptic-mind extends the witness role to N agents
- [tending](tending.md) — self-care team; synoptic-mind produces domain insights, not self-care
