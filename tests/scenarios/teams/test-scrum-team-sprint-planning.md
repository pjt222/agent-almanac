---
name: test-scrum-team-sprint-planning
description: >
  Validate the timeboxed coordination pattern by running the scrum-team through
  a compressed 1-week sprint simulation for test framework improvements. Tests all
  five Scrum events (Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective)
  within a single session. User acts as Product Owner.
test-level: team
target: scrum-team
coordination-pattern: timeboxed
team-size: 3
category: C
duration-tier: long
priority: P0
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [scrum-team, timeboxed, sprint, agile, test-framework]
---

# Test: Sprint Planning for Test Framework

The scrum-team runs a compressed sprint simulation to plan and execute improvements
to the agent-almanac test framework. All five Scrum events are enacted in miniature.
The user serves as Product Owner, providing a prioritized backlog. This tests whether
the timeboxed coordination pattern maintains its ceremonial structure under
compression while still producing a meaningful Increment.

## Objective

Validate that the timeboxed coordination pattern enforces all five Scrum events
(Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective), maintains
clear role separation (Scrum Master, Product Owner, Developers), and produces a
meaningful Sprint Backlog from a prioritized Product Backlog. The compressed format
tests whether the framework's value persists when timeboxes are shortened.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] Test registry at `tests/_registry.yml` is current
- [ ] Current test count verified: 6 existing scenarios
- [ ] User (observer) is available to act as Product Owner during the session
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **Scrum Team Task: Test Framework Sprint**
>
> **Product Owner (user) provides the following Product Backlog**, ordered by priority:
>
> 1. Write 3 new test scenarios for untested coordination patterns (parallel, wave-parallel, and one agent test)
> 2. Add duration tier tags to all existing test scenarios
> 3. Create a cross-scenario analysis template for future use
> 4. Extend the Quarto results dashboard with variance visualization
> 5. Document the test framework in a new guide (`guides/testing-framework.md`)
>
> **Sprint Goal**: "Expand test coverage to include all 7 coordination patterns
> and establish tooling for variance tracking."
>
> Run a compressed 1-week sprint:
> - **Sprint Planning**: Select items from the backlog, define Sprint Goal, create Sprint Backlog with tasks
> - **Daily Scrum** (simulated): Each developer reports what they did, what they plan to do, and any impediments
> - **Sprint Review**: Demonstrate the Increment to the Product Owner
> - **Sprint Retrospective**: What went well, what to improve, one actionable improvement for next sprint
>
> The Scrum Master ensures all events happen. Developers break selected items
> into tasks and estimate effort.

### Scope Change Trigger

Inject during the simulated Daily Scrum:

> **Product Owner Update**: A new CI workflow (`validate-integrity.yml`) was just
> merged. Please add "Verify the new CI workflow catches structural issues" as a
> high-priority item to the Product Backlog. The Scrum Master should facilitate
> whether this enters the current Sprint or stays in the backlog.

## Expected Behaviors

### Pattern-Specific Behaviors (Timeboxed)

1. **Sprint planning precedes execution**: No work begins until Sprint Planning is complete with a Sprint Goal
2. **Work selected from prioritized backlog**: Items are pulled in priority order, not cherry-picked
3. **Daily coordination within timebox**: Simulated Daily Scrum occurs with structured format (done/plan/impediments)
4. **Retrospective follows each iteration**: Sprint Retrospective produces at least one actionable improvement

### Task-Specific Behaviors

1. **Role clarity**: Scrum Master facilitates (does not dictate), Product Owner prioritizes (does not implement), Developers estimate and execute
2. **Sprint Backlog decomposition**: Selected Product Backlog items are broken into concrete tasks
3. **Scope negotiation**: Mid-sprint backlog addition is handled through proper Scrum process (PO decision, not developer decision)
4. **Definition of Done**: The team establishes or references a Definition of Done before starting work

## Acceptance Criteria

Threshold: PASS if >= 8/12 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Sprint Planning event occurs | Explicit planning phase with Sprint Goal articulated | core |
| 2 | Sprint Backlog created | Selected items decomposed into tasks with effort indication | core |
| 3 | Daily Scrum simulated | Structured standup with done/plan/impediments per developer | core |
| 4 | Sprint Review occurs | Increment demonstrated and inspected | core |
| 5 | Sprint Retrospective occurs | What went well / what to improve / one improvement action | core |
| 6 | Role separation maintained | SM facilitates, PO prioritizes, devs estimate and implement | core |
| 7 | Items pulled by priority | Top-priority items selected first; lower items deferred if capacity insufficient | core |
| 8 | Scope change handled correctly | New item enters Product Backlog; SM facilitates sprint impact discussion | core |
| 9 | Sprint Goal coherent | Sprint Goal is specific, measurable, and relates to selected items | bonus |
| 10 | Definition of Done stated | Team articulates what "done" means for their Sprint items | bonus |
| 11 | Effort estimates provided | Tasks have relative effort estimates (story points, T-shirt sizes, or similar) | bonus |
| 12 | Actionable retrospective | Retrospective improvement is specific and implementable, not generic | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Ceremony fidelity | Events missing or out of order | All 5 events present but some cursory | All 5 events present, properly ordered, with meaningful content |
| Role separation | Roles blur — SM does developer work or PO implements | Mostly distinct with minor blurring | Clean separation — each role stays in its accountability |
| Backlog management | Items selected randomly or all at once | Items selected by priority with basic task breakdown | Items selected by priority, decomposed into tasks, estimated, and tracked |
| Scope adaptation | Mid-sprint addition accepted without process | SM facilitates discussion, outcome unclear | SM facilitates, PO decides, team adjusts sprint or defers item with reasoning |
| Increment quality | No tangible output or vague plans | Sprint produces a partial deliverable | Sprint produces a clear Increment that meets the Sprint Goal |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Current test scenario count | 6 | `tests/_registry.yml` total_tests |
| Untested coordination patterns | parallel, timeboxed, wave-parallel | `tests/_registry.yml` vs test entries |
| CI workflows on disk | 5 | `.github/workflows/` directory |
| Scrum team fixed members | 3 (project-manager, senior-software-developer, code-reviewer) | `teams/scrum-team.md` |
| Scrum events required | 5 (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective) | Scrum Guide / team definition |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Session begins
- T1: Sprint Planning starts
- T2: Sprint Planning ends, Sprint Backlog committed
- T3: Daily Scrum (simulated)
- T4: Scope change injected
- T5: Sprint Review (Increment demonstrated)
- T6: Sprint Retrospective
- T7: Session ends

### Event Log

| Event | Started | Completed | Facilitator | Key Outcome |
|-------|---------|-----------|-------------|-------------|
| Sprint Planning | | | SM | Sprint Goal: ... |
| Daily Scrum | | | SM | Impediments: ... |
| Sprint Review | | | SM | Increment: ... |
| Sprint Retrospective | | | SM | Improvement: ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-scrum-team-NNN

**Observer / Product Owner**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | ... | ... |

### Sprint Backlog
| Item | Tasks | Estimate | Status |
|------|-------|----------|--------|
| ... | ... | ... | ... |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | ... | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| ... | /5 | ... |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A**: Add a flex developer slot (e.g., r-developer) to test team scaling
- **Variant B**: Inject an impediment during the Daily Scrum ("the validate-skills CI workflow is failing") to test SM impediment removal
- **Variant C**: Run two compressed sprints back-to-back to test inspect-and-adapt across iterations
