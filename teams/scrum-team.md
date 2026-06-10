---
name: scrum-team
description: Pure Scrum team enforcing the full framework — three accountabilities, five events, three artifacts with commitments, no compromises
lead: project-manager
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [scrum, agile, sprint, product-backlog, increment, timeboxed]
coordination: timeboxed
members:
  - id: project-manager
    role: Scrum Master
    responsibilities: Facilitates Scrum events, removes impediments, coaches the team on Scrum theory and practice
  - id: senior-software-developer
    role: Developer
    responsibilities: Architecture review, technical leadership, Sprint Backlog creation
  - id: code-reviewer
    role: Developer
    responsibilities: Code review, quality assurance, Definition of Done enforcement
---

# Scrum Team

A pure Scrum team — "only 100% Scrum is Scrum." Enforces the Scrum framework without modification: three accountabilities (Scrum Master, Product Owner, Developers), five events (Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective), three artifacts (Product Backlog, Sprint Backlog, Increment) with commitments (Product Goal, Sprint Goal, Definition of Done). No "Scrum-but" compromises.

## Purpose

This team implements the Scrum framework exactly as defined in the Scrum Guide. It exists to deliver working Increments through short, timeboxed Sprints with full transparency, inspection, and adaptation. The Scrum Master (project-manager) ensures the framework is followed; the Product Owner (user or polymath) manages the Product Backlog; and Developers (flexible, drawn from available agents) build the Increment.

The key distinction from other teams: events are non-negotiable, roles are clearly separated, and the framework is never modified ("we'll skip the retro" is not an option).

## Team Composition

| Accountability | Agent | Role | Focus |
|---|---|---|---|
| Scrum Master | `project-manager` | Facilitator | Scrum theory, impediment removal, event facilitation |
| Developer (fixed) | `senior-software-developer` | Tech Lead | Architecture, technical decisions, Sprint Backlog |
| Developer (fixed) | `code-reviewer` | Quality Lead | Code review, DoD enforcement, testing |
| Developer (flex) | *varies by project* | Domain Expert | Domain-specific implementation |
| Product Owner | *user or `polymath`* | PO | Product Backlog management, value maximization |

### Flexible Developer Slots
The Dev team composition adapts to the project domain:

| Project Type | Flex Developers |
|---|---|
| R package | `r-developer` |
| Web application | `web-developer`, `senior-ux-ui-specialist` |
| ML/Data | `senior-data-scientist`, `mlops-engineer` |
| Infrastructure | `devops-engineer` |
| Compliance | `gxp-validator`, `auditor` |

## Coordination Pattern

Timeboxed: all work occurs within Sprints of fixed duration. Five events provide the inspect-and-adapt cadence.

```text
Sprint (1-4 weeks, fixed duration, no extensions)
  ├── Sprint Planning (start of Sprint)
  │     ├── WHAT: Select PBIs for Sprint Goal
  │     └── HOW: Decompose into Sprint Backlog tasks
  ├── Daily Scrum (every day, 15 min timebox)
  │     └── Developers plan next 24 hours toward Sprint Goal
  ├── Development Work (throughout Sprint)
  │     ├── Developers self-organize
  │     ├── Increment meets Definition of Done
  │     └── Sprint Backlog updated continuously
  ├── Sprint Review (end of Sprint)
  │     ├── Inspect Increment with stakeholders
  │     └── Adapt Product Backlog based on feedback
  └── Sprint Retrospective (after Review)
        ├── Inspect team process
        └── Commit to improvement actions
```

## Task Decomposition

### Sprint Planning
1. **Scrum Master** facilitates; ensures timebox is respected
2. **Product Owner** presents ordered Product Backlog items and Sprint Goal proposal
3. **Developers** discuss capacity, select PBIs, decompose into tasks
4. **Output**: Sprint Goal + Sprint Backlog (selected PBIs + plan for delivering them)

### Daily Scrum
1. **Developers only** — SM facilitates if needed, PO does not participate
2. Each Developer: What did I do? What will I do? Any impediments?
3. **15 minutes maximum** — no problem-solving during the event
4. **SM** tracks impediments for resolution outside the Daily Scrum

### Sprint Review
1. **Scrum Master** facilitates; invites stakeholders
2. **Developers** demonstrate the Done Increment
3. **Product Owner** declares which PBIs are Done
4. **Stakeholders** provide feedback
5. **Product Backlog** is updated based on feedback and market changes

### Sprint Retrospective
1. **Scrum Master** facilitates using structured format
2. Team inspects: people, relationships, process, tools
3. Identifies top improvement items
4. Creates actionable improvement plan for next Sprint
5. At least one improvement enters next Sprint Backlog

## The Three Artifacts and Their Commitments

| Artifact | Commitment | Purpose |
|---|---|---|
| Product Backlog | Product Goal | Single objective the team works toward |
| Sprint Backlog | Sprint Goal | Coherent objective for this Sprint |
| Increment | Definition of Done | Quality standard every Increment must meet |

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: scrum-team
  lead: project-manager
  coordination: timeboxed
  members:
    - agent: project-manager
      role: Scrum Master
      subagent_type: project-manager
    - agent: senior-software-developer
      role: Developer
      subagent_type: senior-software-developer
    - agent: code-reviewer
      role: Developer
      subagent_type: code-reviewer
  flex_slots:
    - role: Developer
      description: Domain-specific developer(s) added based on project type
      examples: [r-developer, web-developer, devops-engineer, senior-data-scientist]
  product_owner:
    default: user
    autonomous: polymath
  sprint:
    duration_weeks: 2
    daily_scrum_minutes: 15
    planning_hours: 4
    review_hours: 2
    retrospective_hours: 1.5
  tasks:
    - name: sprint-planning
      assignee: project-manager
      description: Facilitate Sprint Planning — Sprint Goal, PBI selection, task decomposition
    - name: sprint-execution
      assignee: senior-software-developer
      description: Lead development work, manage Sprint Backlog, build Increment
      blocked_by: [sprint-planning]
    - name: code-quality
      assignee: code-reviewer
      description: Review all code, enforce Definition of Done, run quality checks
      blocked_by: [sprint-planning]
    - name: sprint-review
      assignee: project-manager
      description: Facilitate Sprint Review — demonstrate Increment, gather feedback
      blocked_by: [sprint-execution, code-quality]
    - name: sprint-retrospective
      assignee: project-manager
      description: Facilitate Retrospective — inspect process, create improvement plan
      blocked_by: [sprint-review]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: R Package Development Sprint
A 2-week Sprint to add a new feature to an R package.

```text
User: Run a Scrum sprint to add spatial visualization to my R package
Team: Scrum Master (project-manager) + r-developer + code-reviewer + senior-software-developer
Sprint Goal: "Users can generate interactive leaflet maps from package data"
```

### Scenario 2: Web Application Feature Sprint
Building a new feature for a web application.

```text
User: Sprint to add user authentication to the Next.js app
Team: Scrum Master (project-manager) + web-developer + senior-ux-ui-specialist + code-reviewer
Sprint Goal: "Users can sign up, log in, and manage their profile"
```

### Scenario 3: Autonomous Product Development
The polymath agent acts as Product Owner for autonomous work.

```text
User: Use Scrum to build this tool autonomously — I'll review at Sprint Review
Team: SM=project-manager, PO=polymath, Devs=domain-appropriate agents
The user only participates in Sprint Reviews to provide feedback.
```

## Scrum Anti-Patterns (Explicitly Rejected)

- **Scrum-but**: "We do Scrum, but we skip retrospectives" — No. All events are mandatory.
- **Sprint Extension**: "We need a few more days" — No. Sprints are fixed-length.
- **SM as Boss**: The Scrum Master is a servant-leader, not a project manager assigning tasks.
- **PO Absence**: The Product Owner must be available throughout the Sprint.
- **No Definition of Done**: Every team must have an explicit, shared DoD before Sprint 1.

## Limitations

- **Framework Overhead**: Scrum events add coordination cost; not suitable for trivial tasks
- **Fixed Sprint Length**: Cannot accommodate highly unpredictable work that doesn't fit timeboxes
- **PO Required**: A Product Owner must be available; autonomous mode (polymath) is a compromise
- **Team Size**: Optimal for 3-9 Developers; larger teams should split into multiple Scrum Teams
- **Not for Maintenance**: Scrum is designed for product development; maintenance/support may need Kanban

## See Also

- [project-manager](../agents/project-manager.md) — Scrum Master agent with sprint planning and retrospective skills
- [senior-software-developer](../agents/senior-software-developer.md) — Architecture and technical leadership
- [code-reviewer](../agents/code-reviewer.md) — Quality assurance and DoD enforcement
- [r-package-review](r-package-review.md) — Specialized R package team (not Scrum-based)

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
