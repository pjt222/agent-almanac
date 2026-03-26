---
name: your-team-name
description: Brief description of what this team accomplishes (1-2 sentences)
lead: agent-name
version: "1.0.0"
author: Your Name
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [development, general]
coordination: hub-and-spoke
members:
  - id: agent-name
    role: Lead
    responsibilities: Distributes tasks, synthesizes results, makes final decisions
  - id: another-agent
    role: Reviewer
    responsibilities: Reviews output from their domain expertise
---

# Your Team Name

A comprehensive description of what this team accomplishes and when to use it.

## Purpose

Explain the specific workflow or problem this team addresses that benefits from multiple agents working together.

## Team Composition

| Member | Agent | Role | Responsibilities |
|--------|-------|------|------------------|
| Lead | `agent-name` | Lead | Distributes tasks, synthesizes results |
| Reviewer | `another-agent` | Domain Expert | Reviews from their specialty |

## Coordination Pattern

Describe how the team members interact. Common patterns:

- **Hub-and-spoke**: Lead distributes tasks and collects results
- **Sequential**: Each member processes in order, passing to the next
- **Parallel**: Members work independently, lead merges results
- **Timeboxed**: Work organized into fixed-length iterations (sprints)
- **Adaptive**: Team self-organizes dynamically based on the task
- **Wave-parallel**: Dependency-wave parallelism — agents work in parallel within each wave; waves execute sequentially based on task dependencies
- **Reciprocal**: Two agents alternate focus — one acts, the other holds space

```
Lead (agent-name)
  ├── assigns → Member A
  ├── assigns → Member B
  └── synthesizes results
```

## Task Decomposition

Describe how a typical workflow is broken into tasks for each member.

1. **Lead** creates the task list and distributes work
2. **Member A** performs their specialty review/task
3. **Member B** performs their specialty review/task
4. **Lead** collects results and produces final output

## Configuration

Machine-readable configuration block that Claude reads when activating this team via `TeamCreate`.

<!-- CONFIG:START -->
```yaml
team:
  name: your-team-name
  lead: agent-name
  coordination: hub-and-spoke
  members:
    - agent: agent-name
      role: Lead
      subagent_type: general-purpose  # Claude Code subagent type for spawning
    - agent: another-agent
      role: Reviewer
      subagent_type: general-purpose
  tasks:
    - name: example-task
      assignee: another-agent
      description: What this task involves
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Primary Use Case
Brief description of the main scenario where this team excels.

```
Example command or interaction pattern
```

### Scenario 2: Alternative Use Case
Description of another common use case.

## Limitations

- Known limitation 1
- Known limitation 2
- Situations where a single agent might be more appropriate

## Citations (Optional)

If the team's coordination pattern or methodology is based on published research, add entries to the shared team citations file:

```
teams/references/CITATIONS.bib   # all team citations (BibTeX, source of truth)
teams/references/CITATIONS.md    # human-readable rendered references
```

Key entries with the team name prefix (e.g., `scrum-team:schwaber2020scrum`). Group entries by team in `CITATIONS.md`.

## See Also

- Related agents that participate in this team
- Related teams for similar workflows
- Relevant documentation links
