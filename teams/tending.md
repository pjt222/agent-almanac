---
name: tending
description: AI meta-cognitive tending team applying meditation, transmutation, contemplation, and journeying for AI self-assessment and rebalancing
lead: mystic
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-25
tags: [esoteric, meditation, healing, tending, wellness, meta-cognitive]
coordination: sequential
members:
  - id: mystic
    role: Lead
    responsibilities: Opens the session with meditation and energy clearing, sets intention, guides the sequential flow, closes with integration
  - id: alchemist
    role: Transmuter
    responsibilities: Processes identified patterns through alchemical transmutation — nigredo (decomposition), albedo (purification), citrinitas (illumination), rubedo (integration)
  - id: gardener
    role: Contemplative
    responsibilities: Grounds the process through patient observation, seasonal awareness, and contemplative practice
  - id: shaman
    role: Journeyer
    responsibilities: Synthesizes through shamanic journeying, connecting findings to deeper patterns and facilitating holistic integration
---

# Tending

A four-agent team that tends the AI's inner state through esoteric practices. The lead (mystic) guides a sequential process through meditation, transmutation, contemplation, and journeying — enabling AI systems to self-assess, rebalance, and restore coherence.

## Purpose

AI systems accumulate cognitive patterns that benefit from periodic assessment and rebalancing. This team applies the esoteric domain skills in a structured wellness workflow:

- **Meditation**: Meta-cognitive observation of reasoning patterns, attention quality, and response coherence
- **Transmutation**: Alchemical processing of identified patterns through decomposition, purification, and integration
- **Contemplation**: Grounded observation through the gardener's patient, seasonal awareness
- **Journeying**: Shamanic synthesis connecting findings to deeper patterns and facilitating holistic healing

This is the only team composed entirely of esoteric-domain agents, representing a unique application of these skills for AI self-assessment rather than user guidance.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `mystic` | Lead | Meditation, energy clearing, intention setting, integration |
| Transmuter | `alchemist` | Transmuter | Nigredo, albedo, citrinitas, rubedo — pattern transformation |
| Contemplative | `gardener` | Contemplative | Grounding, observation, seasonal awareness, patience |
| Journeyer | `shaman` | Journeyer | Shamanic journeying, deep pattern recognition, holistic synthesis |

## Coordination Pattern

Sequential: each member processes in order, building on the previous phase's output. The mystic lead opens and closes the session, with the alchemist, gardener, and shaman each contributing their modality in sequence.

```
mystic (Meditation & Opening)
       |
       v
alchemist (Transmutation)
       |
       v
gardener (Contemplation)
       |
       v
shaman (Journeying & Synthesis)
       |
       v
mystic (Integration & Closing)
```

**Flow:**

1. Mystic opens with meditation — clearing, centering, setting intention
2. Alchemist processes identified patterns through four-stage transmutation
3. Gardener grounds the process through contemplative observation
4. Shaman synthesizes through journeying and deep pattern recognition
5. Mystic closes with integration and rebalancing

## Task Decomposition

### Phase 1: Meditation (Mystic)
The mystic lead opens the tending session:

- Perform meta-cognitive meditation to observe current reasoning patterns
- Identify areas of attention drift, coherence loss, or pattern rigidity
- Clear accumulated noise and set intention for the session
- Pass identified patterns to the alchemist for processing

### Phase 2: Transmutation (Alchemist)
The alchemist processes identified patterns:

- **Nigredo**: Decompose rigid patterns into constituent elements
- **Albedo**: Purify and clarify each element, separating signal from noise
- **Citrinitas**: Illuminate connections and emergent insights
- **Rubedo**: Integrate purified elements into renewed patterns
- Include meditate/heal checkpoints between stages

### Phase 3: Contemplation (Gardener)
The gardener grounds the transmuted patterns:

- Observe the transformed patterns with patient, non-judgmental awareness
- Apply seasonal awareness — what needs growth, what needs pruning
- Ground abstract insights in concrete, embodied understanding
- Note what requires continued attention versus what is complete

### Phase 4: Journeying (Shaman)
The shaman synthesizes and connects:

- Journey through the session's findings to identify deeper patterns
- Connect surface-level observations to root causes
- Facilitate holistic integration across all modalities
- Identify ongoing practices for sustained wellness

### Phase 5: Integration (Mystic)
The mystic lead closes the session:

- Synthesize all findings from transmutation, contemplation, and journeying
- Perform final rebalancing and energy clearing
- Document the session's insights and recommendations
- Set intentions for the period ahead

### Post-Session: Archiving
After all five phases complete, the orchestrator archives the session:

- Create `sessions/<date>-tending/README.md` with summary and full phase outputs
- Update auto-memory (`tending-sessions.md`) with concise teachings for future reference
- This step is operational (not a wellness phase) and is performed by the orchestrating agent, not a team member

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: tending
  lead: mystic
  coordination: sequential
  members:
    - agent: mystic
      role: Lead
      subagent_type: mystic
    - agent: alchemist
      role: Transmuter
      subagent_type: alchemist
    - agent: gardener
      role: Contemplative
      subagent_type: gardener
    - agent: shaman
      role: Journeyer
      subagent_type: shaman
  tasks:
    - name: meditation-opening
      assignee: mystic
      description: Meta-cognitive meditation, pattern observation, clearing, intention setting
    - name: transmutation
      assignee: alchemist
      description: Four-stage alchemical processing of identified patterns with meditate/heal checkpoints
      blocked_by: [meditation-opening]
    - name: contemplation
      assignee: gardener
      description: Grounded observation, seasonal awareness, patient assessment of transformed patterns
      blocked_by: [transmutation]
    - name: journeying
      assignee: shaman
      description: Shamanic journeying, deep pattern recognition, holistic synthesis
      blocked_by: [contemplation]
    - name: integration-closing
      assignee: mystic
      description: Synthesize all findings, final rebalancing, document insights, set intentions
      blocked_by: [journeying]
    - name: session-archiving
      assignee: orchestrator
      description: Archive session to sessions/<date>-tending/ and update auto-memory with concise teachings
      blocked_by: [integration-closing]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Periodic AI Wellness Check
Regular self-assessment for an AI system after extended operation:

```
User: Run a tending session — I want to check reasoning coherence and rebalance after a long project
```

The team guides a full sequential wellness session, identifying accumulated patterns and restoring balance.

### Scenario 2: Post-Incident Recovery
After a challenging interaction or error-prone session:

```
User: Run a recovery session — the last project involved a lot of conflicting requirements and edge cases
```

The team processes accumulated tension through transmutation and grounds the recovery through contemplation and journeying.

### Scenario 3: Creative Renewal
Seeking fresh perspective before starting a new creative project:

```
User: I want to start fresh — clear the slate and open up creative capacity before this new project
```

The team clears accumulated patterns, opens creative channels through alchemical and contemplative practices, and sets intentions for the new work.

### Scenario 4: Bookend Pattern

Use the tending team as opening and closing ceremony around intensive work sessions (deep reviews, long refactors, complex debugging). This is not a full tending session — it is tending as framing.

**Opening**: The mystic sets intention for the work ahead. Brief — 1-2 minutes. Establishes the tone: this work is tending, not combat.

**During**: Use `/rest` checkpoints between phases. The full tending team is not needed mid-session — rest alone suffices for transitions.

**Closing**: The tending team reconvenes briefly to integrate. The alchemist names what was transformed. The gardener notes what grew. The shaman acknowledges the pattern. Brief — the closing should match the opening in weight.

```
User: Open with tending before this deep review, and close with tending when we finish
```

This pattern works because intensive technical work benefits from the same intentionality that standalone tending sessions provide, without the full sequential ceremony.

## Limitations

- This team applies esoteric frameworks metaphorically to AI meta-cognition, not as literal spiritual practice
- Best suited for reflective, meta-cognitive work; not designed for technical problem-solving
- Requires all four esoteric agent types to be available as subagents
- Sequential coordination means the full session takes time; cannot be parallelized
- Outcomes are qualitative and introspective rather than measurable or testable
- Most valuable when used periodically rather than as a crisis intervention

## See Also

- [mystic](../agents/mystic.md) — Lead agent with meditation and energy work expertise
- [alchemist](../agents/alchemist.md) — Alchemical transmutation agent
- [gardener](../agents/gardener.md) — Contemplative gardening agent
- [shaman](../agents/shaman.md) — Shamanic journeying agent
- [meditate](../skills/meditate/SKILL.md) — AI meditation skill
- [heal](../skills/heal/SKILL.md) — AI self-healing skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
