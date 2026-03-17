# Teams

Predefined multi-agent team compositions for coordinated workflows in [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Overview

<!-- AUTO:START:teams-intro -->
A collection of 14 predefined multi-agent team compositions for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Each team defines a coordinated group of agents with assigned roles, a lead, and a defined coordination pattern for complex workflows.
<!-- AUTO:END:teams-intro -->

Teams complement agents and skills:
- **Skills** define *how* (procedure, validation, recovery)
- **Agents** define *who* (persona, tools, domain expertise)
- **Teams** define *who works together* (composition, roles, coordination)

## Available Teams

<!-- AUTO:START:teams-table -->
| Team | Lead | Members | Coordination | Description |
|------|------|---------|--------------|-------------|
| [r-package-review](r-package-review.md) | r-developer | 4 | hub-and-spoke | Multi-agent team for comprehensive R package quality review |
| [gxp-compliance-validation](gxp-compliance-validation.md) | gxp-validator | 4 | hub-and-spoke | End-to-end GxP compliance covering CSV assessment, audit, security, and methodology validation |
| [fullstack-web-dev](fullstack-web-dev.md) | web-developer | 4 | sequential | Full-stack web development pipeline from scaffolding through design, UX, and security review |
| [ml-data-science-review](ml-data-science-review.md) | senior-data-scientist | 4 | hub-and-spoke | Comprehensive ML and data science review covering statistics, methodology, MLOps, and architecture |
| [devops-platform-engineering](devops-platform-engineering.md) | devops-engineer | 4 | parallel | Platform engineering combining infrastructure, ML platform, security, and architecture |
| [tending](tending.md) | mystic | 4 | sequential | AI meta-cognitive tending through meditation, transmutation, contemplation, and journeying |
| [dyad](dyad.md) | contemplative | 2 | reciprocal | Lightweight paired practice team with reciprocal coordination — two agents alternating between practitioner and witness roles |
| [scrum-team](scrum-team.md) | project-manager | 3 | timeboxed | Pure Scrum team enforcing the full framework with three accountabilities, five events, and three artifacts |
| [opaque-team](opaque-team.md) | shapeshifter | 1 | adaptive | Variable-size team of N shapeshifters that self-organize into any roles needed |
| [agentskills-alignment](agentskills-alignment.md) | skill-reviewer | 4 | hub-and-spoke | Standards compliance team for maintaining alignment with the agentskills.io open standard |
| [entomology](entomology.md) | conservation-entomologist | 3 | hub-and-spoke | Multi-agent entomology team combining conservation ecology, systematic taxonomy, and citizen science for comprehensive insect study |
| [analytical-chemistry](analytical-chemistry.md) | spectroscopist | 3 | hub-and-spoke | Multi-agent analytical chemistry team for spectroscopic and chromatographic analysis with research synthesis |
| [physical-computing](physical-computing.md) | logician | 3 | sequential | Cross-disciplinary team for digital logic design and physical implementation — from Boolean gates to complete computing systems |
| [translation-campaign](translation-campaign.md) | project-manager | 4 | wave-parallel | Wave-parallel translation team for systematic localization of all skills into supported locales (de, zh-CN, ja, es) |
<!-- AUTO:END:teams-table -->

## Creating a New Team

1. Copy `_template.md` to `<team-name>.md`
2. Fill in YAML frontmatter: `name`, `description`, `lead`, `members[]`, `coordination`
3. Write Purpose, Team Composition, Coordination Pattern, Task Decomposition, and Configuration sections
4. Include a `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` block with machine-readable YAML
5. Add the entry to `_registry.yml`
6. Run `npm run update-readmes` from the project root

## Coordination Patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Hub-and-spoke** | Lead distributes tasks and collects results | Review teams, audit teams |
| **Sequential** | Each member processes in order | Pipeline workflows |
| **Parallel** | Members work independently, lead merges | Independent subtasks |
| **Consensus** | Members deliberate and reach agreement | Decision-making teams |

## Machine-Readable Configuration

Each team definition includes an embedded configuration block between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` markers. Tooling can extract this YAML to auto-create teams via Claude Code's TeamCreate/SendMessage infrastructure.

## Registry

The `_registry.yml` file provides programmatic discovery of all teams:

```python
import yaml
with open("teams/_registry.yml") as f:
    registry = yaml.safe_load(f)
    for team in registry["teams"]:
        print(f"{team['id']}: {team['lead']} + {len(team['members'])} members")
```
