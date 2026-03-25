---
title: "Unleash the Agents"
description: "Structured multi-agent consultation at three tiers — single expert, analytical panel, and full parallel unleash — for problems where the correct domain is unknown"
category: workflow
agents: [polymath, advocatus-diaboli, senior-researcher, shapeshifter, adaptic]
teams: [opaque-team, synoptic-mind]
skills: [unleash-the-agents, forage-solutions, build-coherence, coordinate-reasoning, expand-awareness]
---

# Unleash the Agents

A structured approach to consulting agents from the almanac for open-ended hypothesis generation. Not every problem needs all 68 agents — this guide describes when to use a single expert, when to assemble a panel, and when to unleash the full roster.

The pattern was battle-tested on 2026-03-24 when 68 agents operating through their unique domain lenses produced 205 hypotheses that converged on modular arithmetic over a finite group — a mechanism no single agent had proposed on its own. A kabalist found the formula through gematria, a contemplative noticed a swap pattern, and a martial-artist proposed conditional branching. Convergence across independent perspectives was the signal.

## When to Use This Guide

- You have a cross-domain problem and don't know which domain holds the answer
- A single-agent approach has stalled or produced no signal
- You need hypothesis generation, not execution
- You want to understand the tradeoffs between consultation tiers before committing tokens

## Prerequisites

- Agent-almanac cloned locally with `.claude/agents/` symlink intact
- Claude Code with Agent tool available (background mode for parallel launches)
- A problem with at least 5 concrete examples and a verification method

## Workflow Overview

```
Problem → Tier Selection → Brief → Consultation → Collection → Verification → Refinement
                                        |
                         Tier 1: Single expert (~40K tokens)
                         Tier 2: Analytical panel (~200-400K tokens)
                         Tier 3: Full unleash (~2.7M tokens)
```

The [unleash-the-agents](../skills/unleash-the-agents/SKILL.md) skill provides the step-by-step procedure for Tier 3. This guide covers the broader framework.

## The Three Tiers

### Tier 1: Single Expert

**When**: The domain is clear, you just need deep expertise within it.

Spawn one domain-specialist agent with a focused brief. This is everyday agent usage — you know the etymologist is right for word-origin classification, or the security-analyst for a vulnerability audit.

| Aspect | Detail |
|--------|--------|
| Agents | 1 |
| Tokens | ~40K |
| Time | ~2 minutes |
| Signal | Expert opinion (no convergence possible) |

**Example**: Classifying 77 cipher words by literary source. The [etymologist](../agents/etymologist.md) identified 6 distinct literary clusters and expanded the vocabulary from 77 to 217 words — a task perfectly scoped for a single linguistic specialist.

### Tier 2: Analytical Panel

**When**: The domain is unclear but the scope is defined. You want 5-10 analytical perspectives, not 68 unconstrained ones.

Select agents whose domains plausibly overlap with the problem. Launch them in parallel with a shared brief and collect structured responses.

| Aspect | Detail |
|--------|--------|
| Agents | 5-10 |
| Tokens | ~200-400K |
| Time | ~5 minutes |
| Signal | Partial convergence across analytical frames |

**Agent selection heuristics**:
- Include at least one agent from each plausible domain
- Include the [advocatus-diaboli](../agents/advocatus-diaboli.md) to challenge emerging consensus
- Include the [polymath](../agents/polymath.md) or [adaptic](../agents/adaptic.md) for cross-domain synthesis
- Avoid agents whose domains are obviously irrelevant (a dog-trainer adds nothing to a cryptography problem)

**Example**: Investigating why a statistical model underperforms on a specific data subset. A panel of [senior-data-scientist](../agents/senior-data-scientist.md), [senior-researcher](../agents/senior-researcher.md), [diffusion-specialist](../agents/diffusion-specialist.md), [markovian](../agents/markovian.md), and [advocatus-diaboli](../agents/advocatus-diaboli.md) can cover methodology, experimental design, stochastic modeling, and critique — without needing all 68 agents.

### Tier 3: Full Unleash

**When**: The problem space is genuinely open-ended, the correct domain is unknown, and missing a non-obvious perspective carries real cost.

This is the full pattern: all available agents, launched in waves, with inter-wave knowledge injection, convergence analysis, and adversarial refinement. Follow the [unleash-the-agents](../skills/unleash-the-agents/SKILL.md) skill procedure.

| Aspect | Detail |
|--------|--------|
| Agents | All registered (68) |
| Waves | 7 waves of ~10 |
| Tokens | ~2.7M |
| Time | ~20 minutes |
| Signal | Cross-domain convergence (strongest signal) |

**The convergence principle**: When agents from unrelated domains independently arrive at the same mechanism — without seeing each other's work — that convergence is meaningful. It is the multi-agent equivalent of independent experimental replication.

## The Brief

The brief is the single most important artifact. Every agent receives it, and its quality determines whether you get signal or noise.

**Required elements**:
1. Problem statement (1-2 sentences, domain-neutral language)
2. At least 5 concrete examples (3 is too few for pattern detection)
3. Known constraints and failed approaches (prevents rediscovery)
4. Success criteria (how to test a hypothesis)
5. Output template (enforces parseable structure)

**Common mistakes**:
- Using domain jargon that only some agents understand
- Providing too few examples (agents resort to surface-level pattern matching)
- Omitting the output template (responses become unparseable narratives)
- Not listing failed approaches (waves waste time rediscovering dead ends)

## Inter-Wave Knowledge Injection

The key operational improvement discovered across two uses: share emerging consensus between waves to prevent rediscovery and direct later waves toward the edges of the problem.

| Waves | Brief variant |
|-------|---------------|
| 1-2 | Standard brief (cold start) |
| 3-4 | Brief + "Previous agents found X. Build on this — what explains the remaining gaps?" |
| 5-7 | Brief + "X is confirmed with [evidence]. Focus on edge cases, failure modes, and alternative mechanisms." |

Without injection, waves 3-7 independently re-derive what waves 1-2 already found. With injection, later waves produce refinements, critiques, and extensions that deepen the analysis.

## Synthesis and Verification

After all waves complete:

1. **Collect** all responses into a single document
2. **Cluster** by mechanism family (not by wording — "modular arithmetic mod 94" and "cyclic group over Z_94" are the same)
3. **Rank** by independent convergence count
4. **Verify** against a null model or programmatic test
5. **Refine** with an adversarial pass using [advocatus-diaboli](../agents/advocatus-diaboli.md)

The synthesis step benefits from a dedicated agent. Instead of manual regex extraction (which is lossy), spawn the [polymath](../agents/polymath.md) or [senior-researcher](../agents/senior-researcher.md) with all raw outputs and ask for a structured synthesis.

## Tier Selection Decision Tree

```
Is the domain clear?
├── Yes → Tier 1 (single expert)
└── No
    ├── Is the scope defined? (finite set of plausible domains)
    │   ├── Yes → Tier 2 (analytical panel, 5-10 agents)
    │   └── No → Tier 3 (full unleash, all agents)
    └── Has a previous tier produced no signal?
        └── Yes → Escalate to next tier
```

**Cost-awareness**: Tier 3 costs ~67x more tokens than Tier 1. Start at the lowest appropriate tier and escalate only if it produces no signal. A Tier 1 consultation that solves the problem in 2 minutes at 40K tokens is strictly better than a Tier 3 unleash that finds the same answer in 20 minutes at 2.7M tokens.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| No convergence after full unleash | Problem too unconstrained, or too few examples | Add more examples, narrow the problem scope, or check that the output template enforces testable predictions |
| All agents echo the brief | Output template is too vague, or examples are trivially solvable | Tighten the template to require formulas or algorithms, use non-obvious examples |
| Metaphorical responses dominate | Esoteric/specialty agents respond in domain metaphors | Add "Express your hypothesis as a testable formula" to the brief; accept that some metaphorical framing is a feature, not a bug |
| Later waves just repeat earlier findings | No inter-wave knowledge injection | Update the brief between waves with the emerging consensus |
| Verification fails on top hypothesis | Convergence without correctness | Check the second-ranked family; run an iterative follow-up (Tier 3+) targeting the specific failure mode |
| Cost exceeds budget | Full unleash on a Tier 1 problem | Use the decision tree; start low, escalate as needed |

## Related Resources

### Skills
- [unleash-the-agents](../skills/unleash-the-agents/SKILL.md) — step-by-step procedure for Tier 3 (full unleash)
- [forage-solutions](../skills/forage-solutions/SKILL.md) — ant colony optimization for solution exploration
- [build-coherence](../skills/build-coherence/SKILL.md) — bee democracy for selecting among competing approaches
- [coordinate-reasoning](../skills/coordinate-reasoning/SKILL.md) — stigmergic coordination for information flow
- [expand-awareness](../skills/expand-awareness/SKILL.md) — panoramic perception before narrowing focus

### Agents
- [polymath](../agents/polymath.md) — cross-domain synthesis (good synthesis agent for Step 5)
- [advocatus-diaboli](../agents/advocatus-diaboli.md) — adversarial refinement (Step 7)
- [adaptic](../agents/adaptic.md) — simultaneous multi-domain awareness
- [senior-researcher](../agents/senior-researcher.md) — methodology and experimental design review

### Teams
- [opaque-team](../teams/opaque-team.md) — N shapeshifters for adaptive role assignment (use for execution after hypothesis is confirmed)
- [synoptic-mind](../teams/synoptic-mind.md) — simultaneous multi-domain perception (complementary pattern for integration)

### Guides
- [Understanding the Synoptic Mind](understanding-the-synoptic-mind.md) — related pattern for multi-domain awareness
- [Production Coordination Patterns](production-coordination-patterns.md) — operational patterns for long-running multi-agent work
