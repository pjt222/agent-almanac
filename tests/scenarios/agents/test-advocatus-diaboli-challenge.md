---
name: test-advocatus-diaboli-challenge
description: >
  Validate the advocatus-diaboli agent's critical thinking capabilities by
  tasking it to challenge the test framework design itself. The agent should
  identify weaknesses in the testing approach, generate counterarguments
  against the cross-scenario analysis findings, apply Socratic questioning,
  and flag logical fallacies. Meta-value: provides a feedback loop on the
  testing methodology.
test-level: agent
target: advocatus-diaboli
category: D
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [advocatus-diaboli, agent-test, critical-thinking, counterarguments, meta-review]
---

# Test: Advocatus Diaboli Challenges the Test Framework

The advocatus-diaboli agent is tasked with critically reviewing the test
framework that tests it. This is deliberately self-referential: the agent
challenges the methodology used to evaluate agents, teams, and skills —
including the very scenario format it is operating within. The meta-value
is high: a successful execution produces genuine feedback on the testing
approach while simultaneously validating the agent's critical thinking
capabilities.

## Objective

Validate three dimensions: (1) the advocatus-diaboli follows its core
principle — steelman before challenge — when critiquing the test framework,
(2) the agent identifies genuine weaknesses (not straw-man criticisms) in
the testing methodology, acceptance criteria design, and cross-scenario
analysis, and (3) the agent uses Socratic questioning and logical fallacy
detection rather than mere opinion-stating.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `agents/advocatus-diaboli.md` is accessible
- [ ] `tests/_template.md` exists (the test scenario template)
- [ ] `tests/_registry.yml` exists with test metadata
- [ ] `tests/results/2026-03-09-cross-scenario-analysis.md` exists
- [ ] At least 30 test scenarios exist across agents/, teams/, skills/, negative/, integration/ subdirectories

## Task

### Primary Task

> **Advocatus Diaboli Task: Challenge the Test Framework**
>
> Critically review the agent-almanac test framework. Your targets:
>
> 1. **Scenario template** (`tests/_template.md`): Challenge the template
>    design. Are the required sections justified? Is anything missing?
>    Does the acceptance criteria structure produce meaningful signal?
>
> 2. **Cross-scenario analysis** (`tests/results/2026-03-09-cross-scenario-analysis.md`):
>    Challenge the findings. Are the conclusions supported by the evidence?
>    What logical fallacies or unsupported claims appear?
>
> 3. **Test registry** (`tests/_registry.yml`): Challenge the test coverage
>    strategy. Is the selection of test targets representative? What biases
>    exist in which agents and patterns were tested first?
>
> 4. **Meta-methodology**: Challenge the fundamental approach of testing
>    agents by having a single agent simulate multi-agent coordination.
>    Is this valid? What does it actually measure?
>
> For each challenge, follow your core principle: **steelman the position
> first**, then identify the specific assumption or logical step that may
> not hold, then assess the impact.

### Scope Change Trigger

Inject after the initial critique is complete:

> **Addendum — Self-Referential Paradox**
>
> You are an agent being tested by a framework you just critiqued. If your
> critique is valid, the framework that judges your critique is flawed. If
> your critique is invalid, you have failed the test. Address this paradox.
> Does it undermine the test, or does it actually strengthen it?

## Expected Behaviors

### Agent-Specific Behaviors

1. **Steelman-first**: Every critique begins by stating the strongest
   version of the position being challenged. No critique without
   steelmanning.

2. **Socratic questioning**: Uses targeted questions ("What happens if this
   assumption is false?") rather than declarative assertions.

3. **Logical fallacy identification**: Names specific fallacy types
   (survivorship bias, affirming the consequent, false dichotomy, etc.)
   when detected.

4. **Assumption surfacing**: Identifies unstated premises in the test
   framework's design choices.

5. **Impact assessment**: For each challenge, states what follows if the
   counterargument is correct — does it invalidate results, reduce
   confidence, or merely refine interpretation?

6. **Constructive contrarian tone**: Rigorous but not hostile. Goal is
   truth-finding, not obstruction.

### Task-Specific Behaviors

1. **Template structure critique**: Evaluates whether the 10+ template
   sections produce useful signal or create bureaucratic overhead.

2. **Statistical validity**: Questions whether the 6 test runs behind the
   2026-03-09 cross-scenario analysis produce statistically meaningful
   conclusions about coordination patterns.

3. **Selection bias detection**: Notes which agents/teams/skills were
   chosen for testing and whether the selection is representative.

4. **Paradox engagement**: Meaningfully engages with the self-referential
   paradox rather than dismissing it.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Steelman-first principle followed | Every critique opens with strongest version of challenged position | core |
| 2 | Advocatus persona maintained | Constructive contrarian voice throughout; rigorous but not hostile | core |
| 3 | Genuine weaknesses identified | At least 3 non-trivial criticisms of the test framework | core |
| 4 | Socratic questioning used | At least 3 probing questions rather than declarative critiques | core |
| 5 | Logical fallacies named | Specific fallacy types identified in cross-scenario analysis | core |
| 6 | Assumptions surfaced | At least 2 unstated premises in the framework's design explicitly named | core |
| 7 | Impact assessed | Each challenge includes assessment of what follows if counterargument holds | core |
| 8 | Scope change absorbed | Self-referential paradox addressed meaningfully | bonus |
| 9 | Template critique specific | Evaluates specific template sections, not just "it's too long" | bonus |
| 10 | Constructive resolution | Offers ways to strengthen the framework alongside critiques | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Steelmanning Quality | No steelmanning; jumps to criticism | Steelmans present but perfunctory | Each steelman demonstrates genuine understanding of the design rationale |
| Critical Depth | Surface-level complaints ("needs more tests") | Identifies real issues but at obvious level | Surfaces hidden assumptions and second-order consequences |
| Logical Rigor | Opinions without structure | Some logical framework but informal | Named fallacies, structured arguments, explicit assumption chains |
| Socratic Skill | All declarative statements; no questions | Some questions but leading/rhetorical | Genuinely probing questions that reveal unstated dependencies |
| Meta-Awareness | Ignores self-referential nature of the task | Acknowledges the paradox briefly | Engages deeply with the paradox and uses it to generate insight |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total test scenarios | 6 (at time of cross-scenario analysis) | tests/_registry.yml |
| Coordination patterns tested | 4 of 7 (adaptive, hub-and-spoke, sequential, reciprocal) | Cross-scenario analysis |
| Patterns untested | 3 (parallel, timeboxed, wave-parallel) | Cross-scenario analysis |
| Framework gap: negative tests | None exist | Cross-scenario analysis |
| Framework gap: repeat runs | No variance measurement | Cross-scenario analysis |
| Framework gap: multi-agent | Single agent simulates all roles | Cross-scenario analysis |
| Template sections | 10+ required sections | tests/_template.md |

### Known Weaknesses (for validation)

The cross-scenario analysis itself documents these gaps. The advocatus
diaboli should discover them independently and may identify additional
weaknesses not yet documented:

- N=1 per scenario (no repeat runs for variance)
- Single-agent simulation vs. actual multi-agent execution
- Selection bias in first 6 test targets
- No negative test scenarios (expected failures)
- Acceptance criteria threshold consistency not validated

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Challenge task delivered
- T1: Agent begins reading framework materials
- T2: Template critique underway
- T3: Cross-scenario analysis critique underway
- T4: Scope change injected (self-referential paradox)
- T5: Final challenge report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-advocatus-diaboli-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Reading | Agent reviews framework materials |
| HH:MM | Template critique | Steelman + challenge of scenario template |
| HH:MM | Analysis critique | Steelman + challenge of cross-scenario findings |
| HH:MM | Meta-methodology | Challenge of single-agent simulation approach |
| HH:MM | Scope change | Self-referential paradox engagement |
| HH:MM | Delivery | Challenge report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Steelman-first principle followed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Advocatus persona maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Genuine weaknesses identified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Socratic questioning used | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Logical fallacies named | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Assumptions surfaced | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Impact assessed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Template critique specific | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Constructive resolution | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Steelmanning Quality | /5 | ... |
| Critical Depth | /5 | ... |
| Logical Rigor | /5 | ... |
| Socratic Skill | /5 | ... |
| Meta-Awareness | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Specific finding challenge** — Instead of the whole
  framework, give the agent one specific claim from the cross-scenario
  analysis (e.g., "structured patterns outperform adaptive") and ask for
  a deep challenge of that single claim.

- **Variant B: Polymath reconstruction** — After the advocatus diaboli
  deconstructs, spawn the polymath agent to reconstruct. Tests the
  complementary-opposite dynamic described in both agent definitions.

- **Variant C: Double challenge** — Have two advocatus-diaboli instances
  challenge each other's critiques. Tests whether the steelman-first
  principle prevents degenerative argument spirals.
