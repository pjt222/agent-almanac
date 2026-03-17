---
title: "Creating Agents and Teams"
description: "Designing agent personas, composing teams, and choosing coordination patterns"
category: workflow
agents: [skill-reviewer]
teams: []
skills: [create-skill]
---

# Creating Agents and Teams

Agents define *who* handles a task. Teams define *who works together*. This guide covers designing effective agent personas, assigning them skills, composing them into teams, and selecting the right coordination pattern.

## Table of Contents
1. [When to Use This Guide](#when-to-use-this-guide)
2. [Prerequisites](#prerequisites)
3. [Workflow Overview](#workflow-overview)
4. [Designing an Agent](#designing-an-agent)
5. [Designing a Team](#designing-a-team)
6. [Registry Updates](#registry-updates)
7. [Agent-Team Relationship](#agent-team-relationship)
8. [Troubleshooting](#troubleshooting)
9. [Related Resources](#related-resources)

## When to Use This Guide

- **Creating a new specialized agent** for a domain not covered by existing agents
- **Composing agents into a team** for workflows that benefit from multiple perspectives
- **Choosing between agent types** (model, priority, tool set) for a particular use case
- **Understanding coordination patterns** to decide how team members interact

To create a new skill (the procedure an agent follows), see `skills/create-skill/SKILL.md`.

## Prerequisites

Familiarity with the four content types (guides, skills, agents, teams), how `_registry.yml` files catalog each type, and basic YAML frontmatter syntax. Review [CLAUDE.md](../CLAUDE.md) for an architectural overview.

## Workflow Overview

```
1. Design agent  -->  2. Assign skills  -->  3. Compose team  -->  4. Select coordination
       |                     |                      |                        |
  _template.md         _registry.yml          _template.md            Pattern choice
  (agents/)            (skills/)              (teams/)             (hub-and-spoke, etc.)
```

**Key files:**
- Agent template: `agents/_template.md` | Team template: `teams/_template.md`
- Registries: `agents/_registry.yml`, `teams/_registry.yml`, `skills/_registry.yml`

You do not need a team for every agent. Many agents operate independently.

## Designing an Agent

### Step 1: Copy the Template

```bash
cp agents/_template.md agents/your-agent-name.md
```

Use kebab-case for the filename. The name should clearly communicate the domain: `security-analyst`, `r-developer`, `mycologist`.

### Step 2: Fill in Frontmatter

```yaml
---
name: data-engineer                    # kebab-case, matches filename
description: >-
  Designs and builds data pipelines,   # 1-2 sentences, active voice,
  ETL workflows, and data warehouses   # specific about domain
tools: [Read, Write, Edit, Bash, Grep, Glob]  # only what's needed
model: sonnet                          # sonnet (default), opus (complex), haiku (simple)
version: "1.0.0"
author: Your Name
created: 2026-02-19
updated: 2026-02-19
tags: [data-engineering, etl, pipelines]
priority: normal                       # normal | high | critical
max_context_tokens: 200000
skills:
  - build-data-pipeline
  - optimize-query-performance
---
```

**Required fields**: `name`, `description`, `tools`, `model`, `version`, `author`, `tags`, `priority`.
**Optional fields**: `skills` (skill IDs from registry), `mcp_servers` (MCP dependencies), `max_context_tokens` (default 200000).

#### Priority Guidelines

- **critical**: Always selected first when domain matches. Use sparingly -- currently only `security-analyst` carries this because security review should never be skipped.
- **high**: Preferred over normal-priority agents in overlapping domains. Example: `r-developer` for R tasks.
- **normal**: Default. Selected when explicitly invoked or when the task clearly matches.

#### Tool Selection

Only include tools the agent actually needs (principle of least privilege):

```yaml
# Read-only analysis (security-analyst, code-reviewer)
tools: [Read, Grep, Glob, Bash, WebFetch]

# Full development (r-developer, web-developer)
tools: [Read, Write, Edit, Bash, Grep, Glob]

# Minimal (librarian -- classifies and catalogs)
tools: [Read, Grep, Glob]
```

A security analyst does not need `Write` or `Edit` because it reviews rather than modifies. A librarian does not need `Bash` because it organizes information rather than running commands.

### Step 3: Write the Body Sections

Every agent should include these sections:

- **Purpose** -- What specific problem does this agent solve? One to two paragraphs.
- **Capabilities** -- Bullet list of concrete abilities. Be specific: "Identifies SQL injection vulnerabilities" not "finds security issues."
- **Available Skills** -- Skills from the frontmatter with brief descriptions using bare skill IDs.
- **Usage Scenarios** -- Two or three realistic scenarios showing when to invoke this agent.
- **Examples** -- Concrete input/output pairs demonstrating the agent in action.
- **Limitations** -- What the agent cannot or should not do.

```markdown
## Available Skills

- `build-data-pipeline` -- Design and implement ETL pipelines with validation
- `optimize-query-performance` -- Profile and optimize slow SQL queries
```

### Step 4: Handle Default Skills

All agents automatically inherit two default skills from the registry:

- `meditate` -- Meta-cognitive meditation for task focus and reasoning clarity
- `heal` -- AI self-healing for subsystem assessment and drift correction

Do **not** list these in your frontmatter or Available Skills section. They are inherited.

**Exception**: If a default skill is core to the agent's methodology (as with `mystic`, `alchemist`, `gardener`, `shaman`), list it explicitly with a note:

```markdown
- `meditate` -- Core to contemplative practice methodology (listed explicitly)
```

### Step 5: Review Checklist

- [ ] Name is kebab-case matching the filename
- [ ] Description is 1-2 sentences in active voice
- [ ] Tool list is minimal but sufficient
- [ ] Skills reference valid IDs from `skills/_registry.yml`
- [ ] Priority is justified (most agents should be `normal`)
- [ ] All sections present: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations
- [ ] Default skills not listed (unless core methodology)
- [ ] YAML frontmatter parses without errors

## Designing a Team

### Step 1: Copy the Template

```bash
cp teams/_template.md teams/your-team-name.md
```

### Step 2: Fill in Frontmatter

```yaml
---
name: data-platform-review
description: Multi-agent team for reviewing data pipeline architecture and quality
lead: data-engineer
version: "1.0.0"
author: Your Name
created: 2026-02-19
updated: 2026-02-19
tags: [data-engineering, review, architecture]
coordination: hub-and-spoke
members:
  - id: data-engineer
    role: Lead
    responsibilities: Distributes review tasks, checks pipeline patterns, synthesizes report
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: Evaluates system design, dependency management, scalability
  - id: security-analyst
    role: Security Reviewer
    responsibilities: Audits data access controls, credential handling, injection risks
---
```

### Step 3: Choose a Coordination Pattern

| Pattern | Flow | When to Use | Examples |
|---------|------|-------------|----------|
| **Hub-and-spoke** | Lead distributes, collects, synthesizes | Review workflows needing merged perspectives | `r-package-review`, `gxp-compliance-validation` |
| **Sequential** | A -> B -> C -> D | Pipeline where each step depends on the previous | `fullstack-web-dev`, `tending` |
| **Parallel** | Members work independently, lead merges | Independent subtasks that can run concurrently | `devops-platform-engineering` |
| **Timeboxed** | Fixed-duration iterative cycles | Ongoing projects with inspect-and-adapt cadence | `scrum-team` |
| **Adaptive** | Self-organizing, no fixed structure | Exploratory tasks where work shape is unknown | `opaque-team` |
| **Wave-parallel** | Dependency waves; parallel within, sequential between | Batch work where later waves depend on earlier wave terminology | `translation-campaign` |
| **Reciprocal** | Two agents alternate — one acts, one holds space | Deep dyadic work requiring a witness | `dyad` |
| **Synoptic** | All members perceive shared workspace simultaneously | Cross-domain synthesis where interactions matter more than individual depth | `synoptic-mind` |

Visual patterns:

```
Hub-and-spoke:       Sequential:        Parallel:
     Lead            A-->B-->C-->D       Lead --> A
    / | \                                     --> B
   A  B  C                                    --> C
                                              --> merge
```

### Step 4: Write the CONFIG Block

Every team includes a machine-readable YAML block between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` markers. This block must be consistent with the frontmatter:

```yaml
team:
  name: data-platform-review
  lead: data-engineer
  coordination: hub-and-spoke
  members:
    - agent: data-engineer
      role: Lead
    - agent: senior-software-developer
      role: Architecture Reviewer
    - agent: security-analyst
      role: Security Reviewer
  tasks:
    - name: pipeline-review
      assignee: data-engineer
      description: Review pipeline patterns and data flow
    - name: architecture-review
      assignee: senior-software-developer
      description: Evaluate system design and scalability
```

### Step 5: Team Size and Composition

- **3-5 members** recommended. Fewer than 3 rarely justifies a team. More than 5 increases coordination overhead.
- Exactly one **lead** per team. The lead orchestrates, distributes, and synthesizes.
- Members should have **complementary** expertise. If two members would do the same work, consolidate.

### Step 6: Write the Body

Follow the template: Purpose, Team Composition (table), Coordination Pattern (with diagram), Task Decomposition, Configuration (CONFIG block), Usage Scenarios, Limitations.

## Registry Updates

After creating an agent or team, update the corresponding registry.

### Adding an Agent

Edit `agents/_registry.yml`: increment `total_agents`, add entry alphabetically under `agents:`.

```yaml
  - id: data-engineer
    path: agents/data-engineer.md
    description: Designs and builds data pipelines, ETL workflows, and data warehouses
    tags: [data-engineering, etl, pipelines]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - build-data-pipeline
      - optimize-query-performance
```

### Adding a Team

Edit `teams/_registry.yml`: increment `total_teams`, add entry under `teams:`.

```yaml
  - id: data-platform-review
    path: teams/data-platform-review.md
    description: Multi-agent team for reviewing data pipeline architecture and quality
    lead: data-engineer
    members: [data-engineer, senior-software-developer, security-analyst]
    coordination: hub-and-spoke
    tags: [data-engineering, review, architecture]
```

### Regenerate READMEs

```bash
npm run update-readmes
```

CI also runs this automatically on pushes to main.

## Agent-Team Relationship

An agent can participate in multiple teams. For example, `security-analyst` appears in four:

| Team | Role |
|------|------|
| `r-package-review` | Security Reviewer |
| `gxp-compliance-validation` | Security Auditor |
| `fullstack-web-dev` | Security Reviewer |
| `devops-platform-engineering` | Security Reviewer |

The agent definition is separate from any team. Teams reference agents by ID; agents do not need to know which teams include them.

### Choosing a Team Lead

The lead should be the **strongest domain expert** for the team's primary workflow:

- `r-package-review` led by `r-developer` -- workflow centers on R package conventions
- `gxp-compliance-validation` led by `gxp-validator` -- compliance is the primary concern
- `devops-platform-engineering` led by `devops-engineer` -- infrastructure is the primary domain

The lead does not need to be the highest-priority agent. It needs to be the agent best positioned to decompose work, distribute tasks, and synthesize results.

## Troubleshooting

**Agent is too broad** -- Description uses vague terms like "helps with development." Fix: narrow the scope to a specific domain. Split into two focused agents if needed.

**Too many tools** -- Agent lists every available tool. Fix: ask "Does this agent write files? Run commands? Fetch URLs?" Remove tools it does not need.

**Registry out of sync** -- Agent/team file exists but does not appear in discovery or READMEs. Fix: add entry to `_registry.yml`, increment count, run `npm run update-readmes`.

**Team without clear lead** -- No obvious lead, or lead's responsibilities overlap with members. Fix: choose the member whose domain best matches the team's primary purpose.

**Wrong coordination pattern** -- Sequential team where members do not depend on each other, or parallel team where order matters. Fix: re-evaluate task dependencies. Independent tasks use parallel/hub-and-spoke; dependent chains use sequential.

**Skills not found** -- Agent references skill IDs absent from `skills/_registry.yml`. Fix: create the missing skill or remove the reference.

## Related Resources

- **Agent template**: [agents/_template.md](../agents/_template.md)
- **Team template**: [teams/_template.md](../teams/_template.md)
- **Agent best practices**: [Agent Best Practices](agent-best-practices.md)
- **Skill creation**: [skills/create-skill/SKILL.md](../skills/create-skill/SKILL.md)
- **Agent registry**: [agents/_registry.yml](../agents/_registry.yml)
- **Team registry**: [teams/_registry.yml](../teams/_registry.yml)
- **Skills registry**: [skills/_registry.yml](../skills/_registry.yml)
- **Project architecture**: [CLAUDE.md](../CLAUDE.md)
