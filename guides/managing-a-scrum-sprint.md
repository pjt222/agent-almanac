---
title: "Managing a Scrum Sprint"
description: "Running Scrum sprints with the scrum-team: planning, dailies, review, and retro"
category: workflow
agents: [project-manager, senior-software-developer, code-reviewer]
teams: [scrum-team]
skills: [plan-sprint, manage-backlog, conduct-retrospective, generate-status-report]
---

# Managing a Scrum Sprint

The [scrum-team](../teams/scrum-team.md) implements pure Scrum -- three accountabilities, five events, three artifacts with commitments, no compromises. This guide shows how to run a Sprint using Claude Code's multi-agent team infrastructure. It covers every ceremony from Sprint Planning through the Sprint Retrospective, with concrete examples of how agents, skills, and human participation fit together.

If you are new to Scrum, this guide includes brief definitions of key terms. If you are experienced, skip to [Setting Up the Sprint](#setting-up-the-sprint).

## When to Use This Guide

- Running a structured development sprint with clearly defined work items and priorities
- Managing multiple work items across agents with a shared Sprint Goal
- Tracking progress through Scrum ceremonies (Planning, Daily Scrum, Review, Retrospective)
- Using timeboxed development with inspect-and-adapt feedback loops
- Coordinating a team of Claude Code agents on a multi-day or multi-week effort

Do **not** use Scrum for trivial tasks (single file edits, quick fixes) or purely exploratory work with no defined scope. For those, work directly with individual agents instead.

## Prerequisites

### Project Requirements

- A project with a backlog of work items (or enough scope to create one)
- Claude Code running in your terminal
- Familiarity with the agents and skills directories in this repository

### Key Scrum Terms

| Term | Definition |
|------|-----------|
| **Sprint** | A fixed-length iteration (1-4 weeks) during which a Done Increment is created |
| **Product Backlog** | An ordered list of everything needed in the product, managed by the Product Owner |
| **Sprint Backlog** | The set of Product Backlog items selected for the Sprint, plus the plan for delivering them |
| **Increment** | The sum of all completed Product Backlog items during a Sprint, meeting the Definition of Done |
| **Sprint Goal** | A single objective for the Sprint that provides focus and coherence |
| **Definition of Done** | A shared quality standard that every Increment must meet before it is considered complete |
| **Product Goal** | A long-term objective for the product that the team works toward across multiple Sprints |

## Workflow Overview

A Sprint follows a fixed cadence. Every event is mandatory and timeboxed.

```
Sprint (1-4 weeks, fixed duration)
  |
  +-- Sprint Planning (start of Sprint)
  |     Product Owner presents priorities
  |     Developers select items, create Sprint Backlog
  |     Team agrees on Sprint Goal
  |
  +-- Daily Scrum (every day, 15 min)
  |     Developers inspect progress toward Sprint Goal
  |     Plan next 24 hours of work
  |
  +-- Development Work (throughout Sprint)
  |     Developers self-organize to deliver the Increment
  |     Sprint Backlog updated continuously
  |
  +-- Sprint Review (end of Sprint)
  |     Inspect the Increment with stakeholders
  |     Adapt Product Backlog based on feedback
  |
  +-- Sprint Retrospective (after Review)
        Inspect team process
        Commit to improvement actions for next Sprint
```

### The Three Accountabilities

| Accountability | Agent | Responsibility |
|---------------|-------|---------------|
| **Scrum Master** | `project-manager` | Facilitates events, removes impediments, coaches the team on Scrum theory |
| **Product Owner** | Human user (or `polymath` for autonomous mode) | Manages the Product Backlog, maximizes value, defines Sprint Goal |
| **Developers** | `senior-software-developer`, `code-reviewer`, plus flex developers | Build the Increment, self-organize, maintain quality |

The Scrum Master does not assign tasks. The Product Owner does not dictate how work is done. Developers do not change the Sprint Goal mid-Sprint.

## Setting Up the Sprint

### Step 1: Activate the Scrum Team

Tell Claude Code to use the scrum-team for your project. Specify the sprint duration and any flex developers needed for your domain.

```
You: Create the scrum-team for a 2-week sprint on the putior R package.
     Add r-developer as a flex developer.
```

The Scrum Master (`project-manager`) will initialize the team with:

- `senior-software-developer` as Tech Lead (architecture, Sprint Backlog creation)
- `code-reviewer` as Quality Lead (code review, Definition of Done enforcement)
- `r-developer` as flex Developer (R package implementation)

### Step 2: Choose Flex Developer Slots

The scrum-team has fixed members and flex slots that adapt to your project domain.

| Project Type | Recommended Flex Developers |
|-------------|---------------------------|
| R package | `r-developer` |
| Web application | `web-developer`, `senior-ux-ui-specialist` |
| ML/Data science | `senior-data-scientist`, `mlops-engineer` |
| Infrastructure | `devops-engineer` |
| Compliance | `gxp-validator`, `auditor` |

You can request multiple flex developers. The optimal Scrum team size is 3-9 Developers total.

### Step 3: Define the Product Backlog

Before Sprint Planning can begin, you need a Product Backlog. If one does not exist, use the `manage-backlog` skill to create it.

```
You: Create a product backlog for putior with these features:
     - Add spatial visualization with leaflet
     - Refactor data validation layer
     - Write vignette for new users
     - Fix timezone handling bug (#42)
```

The Scrum Master will invoke [manage-backlog](../skills/manage-backlog/SKILL.md) to produce a `BACKLOG.md` with prioritized items, acceptance criteria, and estimates. Items without acceptance criteria are marked "New" and cannot enter a Sprint.

## Sprint Planning

Sprint Planning is the first event. It answers two questions: **What** can be delivered this Sprint, and **How** will the work be done?

### How It Works

1. **Scrum Master facilitates.** The `project-manager` agent opens the planning session, enforces the timebox, and ensures the output is a valid Sprint Plan.

2. **Product Owner presents the backlog.** You (or `polymath` in autonomous mode) present the prioritized Product Backlog items and propose a Sprint Goal.

3. **Developers select items.** The `senior-software-developer` and other Developers assess capacity, select items from the top of the backlog, and decompose them into tasks.

4. **Sprint Goal is agreed.** The team commits to a single Sprint Goal -- one sentence describing the valuable outcome.

### Example Interaction

```
You: Let's do Sprint Planning. The Sprint Goal should be:
     "Users can generate interactive leaflet maps from putior data."
     I've prioritized the backlog -- spatial visualization is the top item.

Scrum Master (project-manager): Starting Sprint Planning for Sprint 1.
  Sprint duration: 2 weeks (2026-02-19 to 2026-03-05).

  I'll use the plan-sprint skill to build the Sprint Plan.

  [Reads BACKLOG.md]
  [Calculates team capacity: 3 developers x 10 days x 0.8 = 24 person-days]
  [Selects top backlog items up to capacity]
  [Decomposes into tasks with 2-8 hour estimates]
  [Writes SPRINT-PLAN-S001.md]

  Sprint Plan created:
  - Sprint Goal: "Users can generate interactive leaflet maps from putior data"
  - Selected items: B-001 (8 pts), B-004 (3 pts), B-002 (5 pts)
  - Total: 16 story points against capacity of 20
  - 13 tasks across 3 developers
```

The [plan-sprint](../skills/plan-sprint/SKILL.md) skill produces a `SPRINT-PLAN-S001.md` file containing the Sprint Goal, selected items, task breakdown, capacity allocation, and risks.

### Planning Tips

- **Do not exceed capacity.** Plan to 70-80% of theoretical maximum. The remaining buffer absorbs unplanned work, meetings, and context-switching.
- **Every item needs acceptance criteria.** Items without testable criteria cannot be verified as Done.
- **Tasks should be 2-8 hours.** Larger tasks hide complexity and make progress tracking unreliable.
- **Carry-over items consume capacity.** If work from the previous Sprint was not finished, account for the remaining effort.

## Daily Scrum

The Daily Scrum is a 15-minute event for Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog.

### Structure

Each Developer answers three questions:

1. What did I complete since the last Daily Scrum?
2. What will I work on next?
3. Are there any impediments blocking my progress?

The Scrum Master tracks impediments for resolution **outside** the Daily Scrum. Problem-solving does not happen during the event itself.

### How It Works with the Team

In practice, the Daily Scrum corresponds to reviewing the task list and updating statuses. The `project-manager` agent checks on each Developer's progress.

```
Scrum Master: Daily Scrum -- Day 3 of Sprint 1.

  senior-software-developer:
    Done: Implemented leaflet map rendering (B-001, Task 2)
    Next: Add layer controls for data overlays (B-001, Task 3)
    Impediments: None

  code-reviewer:
    Done: Reviewed leaflet integration PR, requested changes
    Next: Review revised PR, begin test coverage for B-004
    Impediments: None

  r-developer:
    Done: Set up leaflet dependency, wrote example data
    Next: Implement coordinate projection utilities (B-001, Task 4)
    Impediments: Waiting on API decision for coordinate format (blocking Task 5)

  Action: Scrum Master will resolve coordinate format decision with PO today.
```

### When to Run Dailies

For multi-day Sprints, run a Daily Scrum at the start of each working session. For shorter Sprints (1 week or less), you may consolidate into fewer check-ins, but never skip them entirely. The Daily Scrum keeps impediments visible.

## Sprint Execution

During the Sprint, Developers self-organize to deliver the Increment. No one outside the team tells Developers how to do their work.

### Agent Responsibilities During Execution

| Agent | Focus During Sprint |
|-------|-------------------|
| `senior-software-developer` | Architecture decisions, technical leadership, builds core functionality |
| `code-reviewer` | Reviews all code changes, enforces the Definition of Done, writes tests |
| `r-developer` (or other flex) | Domain-specific implementation, documentation, examples |
| `project-manager` (Scrum Master) | Removes impediments, tracks Sprint Backlog, protects the team from interruptions |

### Definition of Done

The Definition of Done (DoD) is enforced by the `code-reviewer`. A typical DoD for an R package Sprint might be:

- Code passes `devtools::check()` with 0 errors, 0 warnings, 0 notes
- All new functions have roxygen2 documentation with examples
- Test coverage for new code exceeds 80%
- Code reviewed and approved by `code-reviewer`
- No new linting violations

Work that does not meet the DoD is not included in the Increment and returns to the Product Backlog.

### Managing the Sprint Backlog

The Sprint Backlog is a living artifact. Tasks move through statuses as work progresses:

```
To Do  -->  In Progress  -->  Done
```

The Scrum Master updates `SPRINT-PLAN-S001.md` as tasks complete. If the team discovers that a task is larger than estimated, they can decompose it further or remove scope -- but the Sprint Goal does not change.

### Handling Scope Changes Mid-Sprint

- **No new items are added to the Sprint** unless the Sprint Goal becomes obsolete.
- If the Product Owner identifies urgent work, it goes to the Product Backlog for the next Sprint.
- If the team finishes early, they pull the next highest-priority item from the Product Backlog.

## Sprint Review

The Sprint Review is held at the end of the Sprint to inspect the Increment and adapt the Product Backlog.

### Structure

1. **Scrum Master facilitates** and presents what was planned vs. what was delivered.
2. **Developers demonstrate** the Done Increment -- working functionality, not slides.
3. **Product Owner (you) accepts or rejects** each item based on the Definition of Done and acceptance criteria.
4. **Product Backlog is updated** based on feedback, new insights, and changed priorities.

### Example Sprint Review

```
Scrum Master: Sprint 1 Review.
  Sprint Goal: "Users can generate interactive leaflet maps from putior data"
  Result: ACHIEVED

  Completed (Done):
    B-001: Spatial visualization with leaflet (8 pts) -- DONE
    B-004: Fix timezone handling bug (3 pts) -- DONE

  Not Completed:
    B-002: Refactor data validation (5 pts) -- 3 of 5 tasks done, returning to backlog

  Increment: putior v0.3.0-dev with leaflet map support and timezone fix.
  Velocity: 11 story points.

You: Accepted. The leaflet maps look good. For next Sprint, I want to
     prioritize the data validation refactor and the new user vignette.

Scrum Master: Updating Product Backlog with your new priorities.
```

### What to Look For

- Does the Increment meet the Sprint Goal?
- Does each completed item satisfy its acceptance criteria?
- Are there "almost done" items that do not meet the DoD? (These return to the backlog, not counted as done.)
- Has anything changed in business context that should reprioritize the backlog?

## Sprint Retrospective

The Sprint Retrospective is held after the Sprint Review. The team inspects its own process and commits to improvements.

### How It Works

The Scrum Master uses the [conduct-retrospective](../skills/conduct-retrospective/SKILL.md) skill to facilitate. The skill reads Sprint artifacts, calculates metrics, and structures the discussion.

```
Scrum Master: Sprint 1 Retrospective.

  Period: Sprint 1 (2026-02-19 to 2026-03-05)
  Planned: 16 pts (3 items) | Completed: 11 pts (2 items) | Velocity: 11

  What Went Well:
  | # | Observation | Evidence |
  |---|------------|---------|
  | 1 | Leaflet integration was smooth | B-001 completed on day 7 of 10 |
  | 2 | Code review caught 2 regressions early | PR review comments on B-001 |
  | 3 | Daily Scrums kept impediments visible | Coordinate format blocker resolved in 4 hours |

  What Needs Improvement:
  | # | Observation | Evidence | Impact |
  |---|------------|---------|--------|
  | 1 | Data validation refactor underestimated | 5 pts planned, only 60% done | 5 pts carry-over |
  | 2 | No acceptance criteria for B-002 tasks | Tasks lacked testable conditions | Slowed review |

  Improvement Actions:
  | ID | Action | Owner | Due | Success Criteria |
  |----|--------|-------|-----|-----------------|
  | A-001 | Add estimation review step to grooming | SM | Sprint 2 Planning | All items re-estimated before selection |
  | A-002 | Require acceptance criteria on all tasks | code-reviewer | Sprint 2 Day 1 | 0 tasks without criteria in Sprint Plan |

  Writing RETRO-2026-03-05.md.
```

### Retrospective Rules

- Inspect processes and practices, not people. Frame issues as systemic.
- Review previous actions before creating new ones. Recurring issues (3+ retrospectives) need escalation.
- Limit improvement actions to 2-4. At least one enters the next Sprint Backlog.

## Generating Reports

Use the [generate-status-report](../skills/generate-status-report/SKILL.md) skill to produce formal status reports during or after a Sprint.

```
You: Generate a status report for Sprint 1.

Scrum Master: Generating status report using project artifacts.
  [Reads SPRINT-PLAN-S001.md, BACKLOG.md, RETRO-2026-03-05.md]
  [Calculates velocity, completion %, backlog burn-down]
  [Assigns RAG indicators]
  [Writes STATUS-REPORT-2026-03-05.md]
```

The status report includes RAG indicators (Red/Amber/Green) for schedule, scope, budget, and quality; velocity and burn-down metrics with trend comparisons; blockers and risks with owners; accomplishments and next-period plan; and decisions needed from stakeholders.

For ongoing projects, compare velocity across Sprints to establish a trend. A declining velocity signals problems that should surface in the Retrospective.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Sprint scope keeps growing | Product Owner adds items mid-Sprint | Enforce the rule: no new items unless Sprint Goal is obsolete. New requests go to the Product Backlog for next Sprint. |
| Tasks are blocked and not progressing | External dependency or unresolved decision | Scrum Master must resolve impediments outside the Daily Scrum. Escalate to the Product Owner if a business decision is needed. |
| Agent not producing output | Subagent timed out or lost context | Re-invoke the agent with the relevant Sprint Plan context. Break the task into smaller pieces. |
| Sprint is too long (losing focus) | Duration chosen is too ambitious | Shorten to 1-week Sprints. Shorter Sprints increase feedback frequency and reduce risk. |
| Sprint is too short (nothing gets done) | Duration is too tight for the work | Extend to 2-week Sprints, or reduce the scope of individual backlog items by splitting them. |
| Velocity is unpredictable | Inconsistent estimation or unplanned work | Track unplanned work separately. Use the Retrospective to calibrate estimates against actuals. |
| Definition of Done is unclear | Team has no shared quality standard | Define the DoD explicitly before Sprint 1. Write it into the Sprint Plan. The `code-reviewer` enforces it. |
| Retrospective actions are never completed | Actions lack owners or due dates | Every action must have an owner, a due date, and success criteria. Review previous actions at the start of each Retrospective. |

## Related Resources

### Team

- [scrum-team](../teams/scrum-team.md) -- the team definition with composition, coordination pattern, and machine-readable configuration

### Agents

- [project-manager](../agents/project-manager.md) -- Scrum Master agent with sprint planning and retrospective skills
- [senior-software-developer](../agents/senior-software-developer.md) -- architecture and technical leadership
- [code-reviewer](../agents/code-reviewer.md) -- quality assurance and Definition of Done enforcement

### Skills

- [plan-sprint](../skills/plan-sprint/SKILL.md) -- select backlog items, calculate capacity, decompose into tasks
- [manage-backlog](../skills/manage-backlog/SKILL.md) -- create and maintain the Product Backlog
- [conduct-retrospective](../skills/conduct-retrospective/SKILL.md) -- review execution and generate improvement actions
- [generate-status-report](../skills/generate-status-report/SKILL.md) -- produce RAG-rated status reports with metrics

### Guides

- [Setting Up Your Environment](setting-up-your-environment.md) -- prerequisite environment setup for Claude Code
- [R Package Development](r-package-development.md) -- relevant when running Scrum Sprints on R packages
