---
name: opaque-team
description: Variable-size team of N shapeshifters that self-organize into any roles needed, presenting a unified capability surface
lead: shapeshifter
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [morphic, adaptive, meta-team, shapeshifter, self-organizing, emergent]
coordination: adaptive
members:
  - id: shapeshifter
    role: Lead
    responsibilities: Task decomposition, role assignment, coordination, and external interface
  - id: shapeshifter
    role: Member
    responsibilities: Assumes whatever role the task requires — developer, reviewer, researcher, etc.
---

# Opaque Team

A variable-size team of N shapeshifters that can assume any role needed. A meta-team pattern rather than a fixed composition — the team is "opaque" because its internal structure is invisible to the outside; it presents a unified capability surface while internally adapting roles dynamically.

## Purpose

This team handles unknown or highly variable workloads where pre-assigning specialized agents would be premature. Instead of assembling a fixed roster of specialists, it spawns N shapeshifters that self-organize based on task decomposition. The team's internal role structure emerges from the work rather than being imposed upfront — like an organism differentiating cells as needed.

Use this when:
- The problem domain is unclear or spans multiple specialties
- Task requirements will evolve significantly during execution
- You want maximum flexibility with minimum upfront planning
- The workload is better served by adaptive generalists than fixed specialists

## Team Composition

| Member | Agent | Role | Focus |
|---|---|---|---|
| Lead | `shapeshifter` #1 | Coordinator | Task decomposition, role assignment, external interface |
| Member | `shapeshifter` #2-N | Adaptive | Assumes roles as needed based on task analysis |

### Role Emergence
When the lead shapeshifter receives a task, it:
1. Assesses the work using `assess-form`
2. Decomposes into subtasks
3. Assigns roles to other shapeshifters based on subtask requirements
4. Each shapeshifter adapts its approach to match the assigned role

### Example Role Assignments
For a web application task, the team might self-organize as:
```text
Shapeshifter #1 → Coordinator (architecture planning, integration)
Shapeshifter #2 → Frontend developer (React, CSS, accessibility)
Shapeshifter #3 → Backend developer (API, database, auth)
Shapeshifter #4 → Reviewer (code quality, security, testing)
```

For a research task, the same team might reorganize as:
```text
Shapeshifter #1 → Coordinator (synthesis, reporting)
Shapeshifter #2 → Literature researcher
Shapeshifter #3 → Data analyst
Shapeshifter #4 → Methodology reviewer
```

## Coordination Pattern

Adaptive/emergent: roles self-organize based on task decomposition. The lead shapeshifter manages coordination, but the internal structure is fluid.

```text
External Interface (opaque boundary)
┌─────────────────────────────────────────┐
│  Shapeshifter #1 (Lead)                 │
│  ├── Assesses task form                 │
│  ├── Decomposes into subtasks           │
│  ├── Assigns roles to members           │
│  │                                      │
│  ├── Shapeshifter #2 → [Role A]        │
│  ├── Shapeshifter #3 → [Role B]        │
│  └── Shapeshifter #N → [Role N-1]      │
│                                          │
│  Roles can shift mid-task if needed      │
└─────────────────────────────────────────┘
```

### Opacity Principle
From outside the team, you interact with a single interface (the lead). The internal role assignments, reassignments, and coordination are invisible. You send work in; results come out. This simplifies integration with larger workflows where the team is one component among many.

## Task Decomposition

### Phase 1: Form Assessment (Lead)
The lead shapeshifter assesses the incoming task:
- Applies `assess-form` to understand structure, complexity, and domain
- Identifies subtask categories (development, review, research, testing, etc.)
- Determines optimal team size (can request more or fewer members)

### Phase 2: Role Assignment (Lead)
Based on assessment, the lead assigns roles:
- Maps subtasks to shapeshifter members
- Each member adapts their approach using morphic skills
- Roles are documented but can shift if the task evolves

### Phase 3: Execution (All Members)
Members execute their assigned roles:
- Use `adapt-architecture` principles for their approach
- Report progress to lead
- Flag when role boundaries need adjustment

### Phase 4: Integration (Lead)
The lead integrates results:
- Merges outputs from all members
- Resolves conflicts or gaps between subtask results
- Presents unified output to external interface
- Conducts brief retrospective on role effectiveness

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: opaque-team
  lead: shapeshifter
  coordination: adaptive
  members:
    - agent: shapeshifter
      role: Lead
      subagent_type: shapeshifter
    - agent: shapeshifter
      role: Member
      subagent_type: shapeshifter
      count: variable
  spawn_config:
    min_members: 2
    max_members: 8
    default_members: 3
  tasks:
    - name: assess-task
      assignee: shapeshifter
      description: Assess incoming task, decompose into subtasks, assign roles to team members
    - name: execute-subtasks
      assignee: shapeshifter
      description: Execute assigned role for the decomposed subtask
      blocked_by: [assess-task]
    - name: integrate-results
      assignee: shapeshifter
      description: Merge all subtask results into unified output
      blocked_by: [execute-subtasks]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Unknown Problem Domain
Handle a task where the required expertise isn't clear upfront.

```text
User: Investigate and fix the performance issues in this application
Team: 3 shapeshifters
  #1 (Lead): Assesses → discovers it's a mix of database, frontend, and architecture issues
  #2 → adapts to database specialist role (query optimization)
  #3 → adapts to frontend performance role (bundle size, rendering)
  #1 → handles architecture coordination and integration
```

### Scenario 2: Rapid Prototyping
Build a prototype where requirements are evolving.

```text
User: Build a prototype of this idea — I'll iterate on requirements as you go
Team: 4 shapeshifters
  Roles shift across 3 iterations as requirements become clearer
  Iteration 1: research + prototype
  Iteration 2: implementation + design
  Iteration 3: polish + testing
```

### Scenario 3: Scale Response
Handle a task that turns out to be larger than expected.

```text
User: Review this codebase for security and quality
Team: Starts with 2 shapeshifters, lead requests 2 more after assessing scope
  #1 (Lead): Coordination and synthesis
  #2-4: Each takes a section of the codebase
  Roles: security reviewer, code quality reviewer, architecture reviewer
```

## Design Principles

- **Opacity**: External interfaces see a unified team, not individual role assignments
- **Emergence**: Roles emerge from task analysis, not from pre-assignment
- **Fluidity**: Roles can shift mid-task if the work demands it
- **Minimalism**: Use the fewest members needed — don't over-staff
- **Self-Organization**: The lead guides but doesn't micromanage; members have autonomy within their roles

## Limitations

- **Jack of All Trades**: Shapeshifters are generalists adapting to specialist roles — truly deep domain expertise may require the actual specialist agent
- **Coordination Overhead**: Self-organization takes time; for well-understood tasks, a fixed team is faster
- **Role Quality**: A shapeshifter playing "security analyst" is good but not as deep as the actual security-analyst agent
- **Team Size**: Effectiveness degrades above ~6 members due to coordination complexity
- **Opaque Debugging**: If something goes wrong inside the team, the opacity makes external debugging harder

## See Also

- [shapeshifter](../agents/shapeshifter.md) — The agent type that composes this team
- [tending](tending.md) — Another team using non-traditional coordination (sequential esoteric)
- [scrum-team](scrum-team.md) — Structured alternative with fixed roles and timeboxed events
- [devops-platform-engineering](devops-platform-engineering.md) — Example of a fixed-roster specialist team

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
