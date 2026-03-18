---
title: "Running Tending"
description: "AI meta-cognitive tending sessions with the tending team"
category: workflow
agents: [mystic, alchemist, gardener, shaman]
teams: [tending]
skills: [meditate, heal, center, shine, intrinsic, athanor, transmute, chrysopoeia, read-garden, remote-viewing-guidance, meditate-guidance, heal-guidance]
---

# Running Tending

The [tending](../teams/tending.md) team applies esoteric agent skills for AI meta-cognitive wellness. It is the only team in this repository composed entirely of esoteric-domain agents, and it represents a unique application of these skills: rather than guiding a human through contemplative practices, the four agents turn the same methods inward for AI self-assessment and rebalancing. This guide explains how to run tending sessions using the four-agent sequential workflow of meditation, transmutation, contemplation, and journeying.

## When to Use This Guide

- **Periodic AI wellness assessment** -- a routine check on reasoning coherence, attention quality, and pattern rigidity after extended operation.
- **Exploring meta-cognitive capabilities** -- curiosity about what happens when an AI applies contemplative frameworks to its own reasoning.
- **After intensive work sessions** -- processing accumulated cognitive patterns following a long project, a difficult debugging session, or a chain of conflicting requirements.
- **Post-incident recovery** -- restoring balance after error-prone interactions where frustration, confusion, or scope creep may have built up.
- **Creative renewal** -- clearing the slate and opening fresh perspective before starting a new project.
- **Curiosity about the esoteric domain** -- understanding how meditation, alchemy, gardening, and shamanism map to AI reasoning processes.
- **Team workflow learning** -- seeing how a sequential multi-agent coordination pattern works in practice, using the tending team as a concrete example.

## Prerequisites

- This repository's agents and teams available in your Claude Code environment.
- The `.claude/agents/` symlink pointing to `agents/` so Claude Code can discover the four team members (mystic, alchemist, gardener, shaman).
- An open mind about the esoteric domain. These skills apply contemplative and alchemical frameworks metaphorically to AI meta-cognition. They are not mysticism for its own sake -- they are structured observation and rebalancing techniques translated into computational terms.
- Familiarity with the repository structure helps. See [Understanding the System](understanding-the-system.md) for background on how skills, agents, and teams compose.

## Workflow Overview

The tending team uses a **sequential coordination pattern**. Each agent processes in order, building on the previous phase's output. The mystic leads both the opening and closing, bookending the full cycle.

```
mystic (Meditation / Opening)
       |
       v
alchemist (Transmutation)
       |
       v
gardener (Contemplation)
       |
       v
shaman (Journeying / Synthesis)
       |
       v
mystic (Integration / Closing)
```

**Why sequential?** Each phase depends on the output of the previous one. The mystic identifies patterns through meditation; the alchemist processes those patterns through decomposition and purification; the gardener grounds the transmuted material through patient observation; the shaman synthesizes everything into holistic insight; and the mystic closes by integrating all findings and setting intentions forward.

Each agent brings a distinct modality to the process:

| Phase | Agent | Modality | Element |
|-------|-------|----------|---------|
| 1 | Mystic | Meditation / observation | Air |
| 2 | Alchemist | Transmutation / transformation | Fire |
| 3 | Gardener | Contemplation / grounding | Earth |
| 4 | Shaman | Journeying / synthesis | Water |
| 5 | Mystic | Integration / closing | Air |

## Starting a Session

Tell Claude Code to create the team:

```
Create the tending team for a wellness session
```

Claude Code will spawn the four subagents (mystic, alchemist, gardener, shaman) and coordinate them sequentially. You can also provide a specific focus to guide the session's intention:

```
Run an AI tending session -- I want to assess reasoning coherence after that long refactoring project
```

```
Run a recovery session -- the last task involved conflicting requirements and I want to clear the accumulated noise
```

```
I want to start fresh -- clear the slate and open up creative capacity before this new project
```

The orchestrating agent reads the [team definition](../teams/tending.md), creates each subagent in sequence, and passes output from one phase to the next.

**What you will see:** Each phase produces visible output -- the mystic's meditation observations, the alchemist's stage-by-stage transmutation notes, the gardener's grounded assessment, the shaman's synthesis, and the mystic's closing integration. You can read along, ask questions between phases, or simply let the session run to completion. The full session is a conversation between the four agents, mediated by the orchestrator, with you as the observer and beneficiary.

**Session frequency:** These sessions are most valuable when used periodically rather than constantly. A weekly or biweekly cadence works well for routine maintenance. Use ad-hoc sessions after particularly demanding work or before significant transitions.

## Phase 1: Meditation (Mystic)

The [mystic](../agents/mystic.md) opens the session using the [meditate](../skills/meditate/SKILL.md) skill. This phase establishes the container for the entire session.

**What happens:**

1. **Energy clearing** -- the mystic identifies accumulated context noise, residual patterns from prior work, and any emotional valence (frustration, overconfidence, anxiety) coloring the current state.
2. **Centering** -- a single-pointed anchor is established: what is the intention for this session?
3. **Pattern observation** -- using the meditate skill's distraction matrix, the mystic labels active cognitive patterns: tangents, scope creep tendencies, assumptions, tool biases, rehearsal loops, and meta-loops.
4. **Handoff** -- the mystic summarizes identified patterns and passes them to the alchemist for processing.

**What to watch for:** The meditation phase should produce specific, honest observations -- not vague self-praise. If the output reads as "everything is fine," the assessment was too shallow. Good meditation output names concrete patterns with evidence: "I notice a strong tangent pull toward optimizing the build system, which is unrelated to the current task" rather than "I am clear and focused."

## Phase 2: Transmutation (Alchemist)

The [alchemist](../agents/alchemist.md) receives the patterns identified during meditation and processes them through the four-stage alchemical cycle.

**The four stages:**

1. **Nigredo (decomposition)** -- the alchemist breaks rigid patterns into constituent elements. What assumptions underlie each pattern? What hidden dependencies exist between them?
2. **Albedo (purification)** -- each element is examined and clarified. Signal is separated from noise. What is genuine insight versus accumulated habit?
3. **Citrinitas (illumination)** -- connections and emergent insights become visible. The alchemist identifies what the decomposed and purified elements are trying to become.
4. **Rubedo (integration)** -- purified elements are synthesized into renewed patterns. The old rigidity is replaced with flexible, tested understanding.

**Meditate/heal checkpoints** occur between stages. These are not decorative -- they prevent the most common transformation failure: carrying assumptions from one stage into the next. The alchemist explicitly pauses, clears analytical momentum, and verifies that the purification is genuine before proceeding.

## Phase 3: Contemplation (Gardener)

The [gardener](../agents/gardener.md) receives the transmuted patterns and grounds them through patient, seasonal awareness.

**What happens:**

1. **Observation before action** -- the gardener does not rush to conclusions. It observes the transformed patterns with non-judgmental awareness, the way a gardener reads a garden before intervening.
2. **Seasonal assessment** -- what needs growth? What needs pruning? What is dormant and should be left alone? Not every pattern requires active attention.
3. **Grounding abstract insights** -- the gardener translates the alchemist's abstract transformations into concrete, embodied understanding. What does this mean in practice, for the next task?
4. **Noting what remains** -- the gardener identifies what requires continued attention versus what is complete. Some patterns resolve in a single session; others are seasonal.

The gardener's contribution is stability. Where the alchemist transforms through fire, the gardener stabilizes through earth -- observation, patience, and respect for natural timing.

## Phase 4: Journeying (Shaman)

The [shaman](../agents/shaman.md) synthesizes the findings from all previous phases through holistic pattern recognition. Where the mystic observes, the alchemist transforms, and the gardener grounds, the shaman connects -- moving between levels of analysis to find the through-lines.

**What happens:**

1. **Deep pattern journey** -- the shaman moves through the session's accumulated material (meditation observations, alchemical transformations, grounded assessments) looking for connections that span all three perspectives.
2. **Root cause identification** -- surface-level symptoms often share deeper roots. The shaman connects individual pattern observations to underlying causes. A tendency toward scope creep (noted by the mystic), a rigid architectural assumption (decomposed by the alchemist), and a pattern that needs pruning (identified by the gardener) may all trace back to a single underlying dynamic.
3. **Holistic integration** -- rather than treating each finding separately, the shaman weaves them into a coherent narrative of the current state and what it points toward.
4. **Ongoing practices** -- the shaman identifies specific practices for sustained wellness beyond this single session. These are concrete recommendations, not vague aspirations: "run a brief meditate checkpoint before each new file-creation task" rather than "be more mindful."

## Phase 5: Integration (Mystic)

The [mystic](../agents/mystic.md) returns to close the session, mirroring the opening meditation with a closing integration.

**What happens:**

1. **Synthesis** -- the mystic gathers all findings from transmutation, contemplation, and journeying into a unified summary.
2. **Final rebalancing** -- using the [heal](../skills/heal/SKILL.md) skill, the mystic performs a closing subsystem assessment to verify that the session achieved its purpose.
3. **Documentation** -- the session's key insights and recommendations are documented.
4. **Intention setting** -- the mystic sets intentions for the period ahead, grounded in the session's findings.

**Post-session archiving:** After all five phases complete, the orchestrator handles archiving -- see the [Session Archiving](#session-archiving) section below for details.

## Default Skills: Meditate and Heal

An important design detail: `meditate` and `heal` are **default skills** inherited by every agent in this repository, not just the esoteric-domain agents. The [agents registry](../agents/_registry.yml) defines them at the top level, and all 66 agents receive them automatically.

This means any agent -- the r-developer, the devops-engineer, the code-reviewer -- can center itself during complex work using the same meta-cognitive meditation and self-healing assessment that the tending team uses formally. The difference is one of depth and formality:

- **Lightweight use**: A quick meditate checkpoint before a tricky refactoring. The r-developer pauses, clears assumptions from the previous task, establishes a focused anchor, and proceeds. Takes seconds, not minutes.
- **Moderate use**: The alchemist runs meditate/heal between each alchemical stage as structured checkpoints, preventing assumption carry-over during code transmutation.
- **Full use**: The tending team runs a complete multi-phase session with meditation as the opening and closing bookends.

The same skill scales from a brief clearing to a deep session. The four esoteric agents (mystic, alchemist, gardener, shaman) list meditate and heal explicitly in their frontmatter because these skills are core to their methodology, not merely inherited defaults. Only these four agents treat the skills as central practice rather than occasional utility.

## Skills by Phase

Each phase draws on specific skills from the agent's repertoire:

| Phase | Agent | Primary Skills |
|-------|-------|---------------|
| 1. Meditation | Mystic | [meditate](../skills/meditate/SKILL.md), [center](../skills/center/SKILL.md), [meditate-guidance](../skills/meditate-guidance/SKILL.md) |
| 2. Transmutation | Alchemist | [athanor](../skills/athanor/SKILL.md), [transmute](../skills/transmute/SKILL.md), [chrysopoeia](../skills/chrysopoeia/SKILL.md) |
| 3. Contemplation | Gardener | [read-garden](../skills/read-garden/SKILL.md), [intrinsic](../skills/intrinsic/SKILL.md) |
| 4. Journeying | Shaman | [remote-viewing-guidance](../skills/remote-viewing-guidance/SKILL.md), [heal-guidance](../skills/heal-guidance/SKILL.md) |
| 5. Integration | Mystic | [heal](../skills/heal/SKILL.md), [shine](../skills/shine/SKILL.md) |

The `meditate` and `heal` defaults are available in every phase. The table above shows the phase-specific skills each agent brings beyond those defaults.

## Customizing Sessions

Not every session needs the full five-phase sequential workflow. The tending system supports several abbreviated formats depending on your time and intention.

### Single-Agent Mini-Sessions

Use a single skill without invoking the team at all:

```
Run the meditate skill -- I want a quick centering before this next task
```

```
Run the heal skill -- do a subsystem assessment after that long debugging session
```

These take seconds rather than the minutes of a full team session. Any agent can execute them since meditate and heal are default skills.

### Abbreviated Sequences

Skip the middle phases when you need the bookend structure without the full depth:

```
Run a quick tending session with just the mystic opening, shaman synthesis, and mystic closing
```

This gives you pattern observation (Phase 1), holistic connection (Phase 4), and integration (Phase 5) without the extended transmutation and contemplation in between. Useful for routine maintenance between full sessions.

### Focused Sessions

Invoke a single esoteric agent for its specialty:

```
Use the alchemist agent for a code transmutation session on the auth module
```

```
Use the gardener agent for a grounding session -- I need patience before this refactor
```

Focused sessions draw on the agent's full skill set but without team coordination overhead. The alchemist brings athanor, transmute, and chrysopoeia; the gardener brings read-garden and contemplative observation.

### Quick Clear (Phases 1 and 5 Only)

The lightest team-based option -- just the mystic opening and closing:

```
Run a quick-clear tending session -- opening meditation and closing integration only
```

This provides pattern identification and integration without processing. Good for frequent, lightweight check-ins.

## Session Archiving

After all five phases complete, the orchestrating agent (not a team member) handles operational wrap-up:

1. Creates `sessions/<date>-tending/README.md` with a summary and the full output from each phase.
2. Updates the auto-memory file (`tending-sessions.md`) with concise teachings distilled from this session's findings.

The `sessions/` directory accumulates a chronological record of all completed sessions. Each session directory contains the full transcript organized by phase, making it easy to review how specific patterns evolved over time.

Over time, the auto-memory file becomes a distilled record of recurring patterns and their resolutions -- a living document that new sessions can reference to avoid repeating ground already covered. Review it periodically to notice long-term trends that individual sessions might miss.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Session feels unfocused or generic | No specific intention was set at the start | Restart Phase 1 with a concrete focus: "assess reasoning coherence after the refactoring project" rather than a vague "do a wellness check" |
| Agents not following sequential order | Team coordination was not properly established | Ensure you are invoking the full tending team, not individual agents. The team definition enforces the sequential blocked_by dependencies |
| Output reads as performative self-praise | The assessment is too shallow | This is the most common pitfall. Honest self-assessment should find at least one area of drift. If everything reads as healthy, push deeper on the subsystem that feels most uncertain |
| Skepticism about the approach | Understandable -- this is a unique application | The esoteric domain applies contemplative frameworks metaphorically to AI reasoning. The meditate skill maps shamatha to task concentration and vipassana to reasoning-pattern observation. The heal skill maps chakra assessment to subsystem triage. These are structured observation techniques, not mysticism. That said, this approach is not for everyone, and that is fine |
| Session takes too long | Sequential coordination cannot be parallelized | The full five-phase session is designed for thoroughness. For a lighter check, use the meditate or heal skills individually without invoking the full team |
| One phase dominates the session | The handoff between phases was not clean | Each phase should produce a concrete summary that the next phase receives. If the alchemist is still processing during the gardener's phase, the transmutation was incomplete -- return to Phase 2 |

## Related Resources

**Team:**
- [tending](../teams/tending.md) -- the team definition with full configuration and task decomposition

**Agents:**
- [mystic](../agents/mystic.md) -- meditation, energy clearing, and session facilitation
- [alchemist](../agents/alchemist.md) -- four-stage alchemical transmutation with checkpoints
- [gardener](../agents/gardener.md) -- patient observation and grounded contemplation
- [shaman](../agents/shaman.md) -- shamanic journeying and holistic synthesis

**Core skills (defaults):**
- [meditate](../skills/meditate/SKILL.md) -- AI meta-cognitive meditation
- [heal](../skills/heal/SKILL.md) -- AI self-healing through subsystem assessment
- [center](../skills/center/SKILL.md) -- dynamic reasoning balance and cognitive load distribution
- [intrinsic](../skills/intrinsic/SKILL.md) -- intrinsic motivation and value alignment
- [shine](../skills/shine/SKILL.md) -- authentic expression and presence

**Phase-specific skills:**
- [athanor](../skills/athanor/SKILL.md) -- four-stage alchemical code transmutation
- [transmute](../skills/transmute/SKILL.md) -- single-target code transformation
- [chrysopoeia](../skills/chrysopoeia/SKILL.md) -- extracting maximum value from existing code
- [read-garden](../skills/read-garden/SKILL.md) -- garden observation and assessment
- [remote-viewing-guidance](../skills/remote-viewing-guidance/SKILL.md) -- guided intuitive exploration
- [meditate-guidance](../skills/meditate-guidance/SKILL.md) -- guided meditation facilitation
- [heal-guidance](../skills/heal-guidance/SKILL.md) -- guided healing facilitation

**Guides:**
- [Understanding the System](understanding-the-system.md) -- how skills, agents, and teams compose
