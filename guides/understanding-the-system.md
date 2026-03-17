---
title: "Understanding the System"
description: "Entry point: what skills, agents, and teams are, how they compose, and how to invoke them"
category: workflow
agents: []
teams: []
skills: [create-skill]
---

# Understanding the System

This repository provides 278 skills, 59 agents, and 10 teams following the [Agent Skills open standard](https://agentskills.io). Together they form a composable system for AI-assisted development: skills define *how* to do something, agents define *who* does it, teams define *who works together*, and guides supply the background knowledge humans and agents both draw from. This guide explains each component type, how the types relate, and how you interact with them through Claude Code.

## When to Use This Guide

- You are new to this repository and want to understand its structure.
- You want to know how skills, agents, and teams differ from one another.
- You need to invoke a specific capability and do not know where to start.
- You are deciding between using a single agent versus a full team.
- You are about to create a new skill, agent, or team and need to see how everything fits together first.

## Prerequisites

- Claude Code CLI installed in WSL (see [Setting Up Your Environment](setting-up-your-environment.md))
- This repository cloned locally
- Familiarity with running commands in a terminal

## Directory Layout at a Glance

```
agent-almanac/
├── guides/              # Human-readable reference docs (you are here)
│   ├── _registry.yml    # Catalog of all guides
│   └── *.md             # Individual guide files
├── skills/              # Machine-consumable procedures
│   ├── _registry.yml    # Catalog of all 278 skills
│   └── <skill-name>/    # 278 skill directories
│       └── SKILL.md
├── agents/              # Persona definitions for Claude Code subagents
│   ├── _registry.yml    # Catalog of all 59 agents
│   └── *.md             # Individual agent files
├── teams/               # Multi-agent compositions
│   ├── _registry.yml    # Catalog of all 10 teams
│   └── *.md             # Individual team files
├── .claude/
│   ├── agents -> ../agents   # Symlink for Claude Code discovery
│   └── skills/               # Symlinks to individual skills
└── scripts/             # Automation (README generation, CI)
```

## The Four Pillars

The system has four content types. Each lives in its own top-level directory and serves a distinct role.

### 1. Skills -- the *how*

**Location:** `skills/<skill-name>/SKILL.md`

A skill is a machine-consumable procedure. It tells an agent exactly how to accomplish a specific task, step by step. Every SKILL.md file follows a fixed structure:

- **YAML frontmatter** with `name`, `description`, `allowed-tools`, and `metadata` (author, version, domain, complexity, language, tags).
- **When to Use** -- conditions under which the skill should activate.
- **Inputs** -- required and optional parameters.
- **Procedure** -- numbered steps, each with sub-steps, an `**Expected:**` block describing the successful outcome, and an `**On failure:**` block describing recovery actions.
- **Validation** -- how to confirm the procedure succeeded.
- **Common Pitfalls** -- frequent mistakes and how to avoid them.
- **Related Skills** -- cross-references to complementary skills.

The library currently contains 278 skills spanning 50 domains (as tagged in their metadata), ranging from `r-packages` and `containerization` to `esoteric` and `gardening`. Skills are kept under 500 lines; extended examples go into a `references/EXAMPLES.md` subdirectory following the progressive disclosure pattern.

### 2. Agents -- the *who*

**Location:** `agents/<name>.md`

An agent is a persona definition for a Claude Code subagent. It specifies who handles a task: what tools the agent can use, which skills it carries, what model it runs on, and how it should behave. Every agent file has:

- **YAML frontmatter** with `name`, `description`, `tools`, `model`, `version`, `author`, `priority`, and a `skills` list.
- **Purpose** -- what the agent is for.
- **Capabilities** -- what the agent can do.
- **Usage Scenarios** -- when to spawn this agent.
- **Examples** -- sample invocations.
- **Limitations** -- what the agent cannot or should not do.

There are currently 59 agents. Examples include `r-developer` (R package development), `security-analyst` (security auditing), `mystic` (meta-cognitive meditation), and `shapeshifter` (adaptive role assumption). Two default skills -- `meditate` and `heal` -- are inherited by every agent automatically through the agents registry; individual agents do not need to list them.

Claude Code discovers agents from the `.claude/agents/` directory, which in this repository is a symlink to `agents/`.

### 3. Teams -- the *who works together*

**Location:** `teams/<name>.md`

A team is a multi-agent composition. It defines a group of agents with assigned roles, a designated lead, and a coordination pattern that governs how they interact. Every team file has:

- **YAML frontmatter** with `name`, `description`, `lead`, `members[]` (each with id, role, responsibilities), and `coordination`.
- **Purpose** -- why this team exists.
- **Team Composition** -- a table of members, roles, and focus areas.
- **Coordination Pattern** -- how agents hand off work to one another.
- **Task Decomposition** -- how incoming requests are split across members.
- **Configuration** -- a machine-readable YAML block between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` markers.
- **Usage Scenarios** and **Limitations**.

There are currently 12 teams using 7 coordination patterns:

| Pattern | Description | Used by |
|---------|-------------|---------|
| hub-and-spoke | Lead distributes tasks, collects results, synthesizes | r-package-review, gxp-compliance-validation, ml-data-science-review, agentskills-alignment, entomology |
| sequential | Agents work in a defined order, each building on the previous output | fullstack-web-dev, tending |
| parallel | All agents work simultaneously on independent subtasks | devops-platform-engineering |
| timeboxed | Work is organized into fixed-length iterations (sprints) | scrum-team |
| adaptive | Team self-organizes dynamically based on the task | opaque-team |
| wave-parallel | Tasks grouped into dependency waves; agents work in parallel within each wave, waves execute sequentially | *(ad hoc teams)* |
| reciprocal | Two agents alternate focus — one acts, the other holds space | dyad |
| synoptic | All members perceive shared workspace simultaneously; lead integrates into gestalt | synoptic-mind |

### 4. Guides -- the *context*

**Location:** `guides/<name>.md`

A guide is a human-readable reference document. Guides provide the background knowledge that agents and skills draw from: environment setup, development best practices, workflow walkthroughs, and design rationale. Guides use YAML frontmatter with `title`, `description`, `category`, and cross-references to related `agents`, `teams`, and `skills`.

There are currently 14 guides across 4 categories: workflow, infrastructure, reference, and design.

## How They Compose

The four pillars work together in practice. Consider two examples at different scales.

### Example 1: Team-level composition

When you ask Claude Code to review an R package:

1. **Team** -- Claude Code activates the [r-package-review](../teams/r-package-review.md) team (who works together), which defines four agents and a hub-and-spoke coordination pattern.
2. **Agents** -- The team lead [r-developer](../agents/r-developer.md) distributes review tasks to [code-reviewer](../agents/code-reviewer.md), [senior-software-developer](../agents/senior-software-developer.md), and [security-analyst](../agents/security-analyst.md) (who handles each aspect).
3. **Skills** -- Each agent follows its assigned skills: the r-developer uses `write-testthat-tests` to verify test coverage, the code-reviewer uses `review-software-architecture`, and the security-analyst uses `security-audit-codebase` (how each task is done).
4. **Guides** -- The agents draw on the [R Package Development](r-package-development.md) guide and the [Quick Reference](quick-reference.md) for context about conventions and commands.

### Example 2: Single-agent composition

When you ask Claude Code to containerize an MCP server:

1. **Agent** -- Claude Code spawns the [devops-engineer](../agents/devops-engineer.md) agent.
2. **Skill** -- The agent follows the [containerize-mcp-server](../skills/containerize-mcp-server/SKILL.md) skill, executing each step in the procedure.
3. **Guide** -- The agent references the [Setting Up Your Environment](setting-up-your-environment.md) guide for path and environment details.

No team is needed because the task falls within a single domain.

### Mixing levels

This layered composition means you can mix and match freely: use a single skill for a repeatable procedure, a single agent for a task requiring judgment, or a full team for a multi-perspective review. You can even ask an agent to follow a skill from a different domain -- an r-developer can follow a git skill like `commit-changes` because skills are domain-tagged but not domain-locked.

## Invoking Skills

Skills can be invoked in two ways.

### As slash commands

Skills that are symlinked into `.claude/skills/` become available as slash commands in Claude Code. The symlink pattern is:

```bash
# From the repository root
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>
```

For example, the `submit-to-cran` skill is linked as:

```
.claude/skills/submit-to-cran -> ../../skills/submit-to-cran
```

You can then invoke it in Claude Code by typing `/submit-to-cran`. All 278 skills in this repository are already symlinked and ready to use.

### By asking Claude Code directly

You can also ask Claude Code to follow a skill without using a slash command:

> "Follow the write-testthat-tests skill to add tests for the calculate_score function."

Claude Code will locate the SKILL.md, read its procedure, and execute each step.

### What happens during execution

When a skill is invoked, the agent reads the SKILL.md and works through the Procedure section step by step. At each step it checks the `**Expected:**` block to confirm success. If something goes wrong, it follows the `**On failure:**` block to recover. After all steps complete, the agent runs the Validation section to confirm the overall outcome. This structured error handling is what distinguishes a skill from a free-form prompt.

## Spawning Agents

Agents are auto-discovered from the `.claude/agents/` directory (which symlinks to `agents/`). You spawn an agent by asking Claude Code to use it:

> "Use the r-developer agent to create a new R package called tidymetrics."

> "Spawn the security-analyst to audit this repository for exposed secrets."

> "Ask the code-reviewer agent to review the changes in this pull request."

When you reference an agent by name, Claude Code loads its persona definition -- including its tools, model, priority, and skill list -- and operates according to that configuration for the duration of the task.

Agents span a wide range of domains. A partial sample:

| Category | Agents |
|----------|--------|
| Core development | r-developer, code-reviewer, web-developer, shiny-developer, quarto-developer |
| Review | senior-researcher, senior-data-scientist, senior-software-developer |
| Infrastructure | devops-engineer, mlops-engineer, mcp-developer |
| Compliance | gxp-validator, auditor, security-analyst |
| Specialty | survivalist, gardener, mycologist, dog-trainer, hildegard |
| Meta-cognitive | mystic, alchemist, shaman, kabalist |
| Adaptive | shapeshifter, polymath, swarm-strategist |

See the [Agents Library README](../agents/README.md) for the full list.

## Activating Teams

Teams coordinate multiple agents on a shared objective. You activate a team by asking Claude Code to use it:

> "Use the r-package-review team to review the putior package."

> "Activate the scrum-team for this two-week sprint. I will be the Product Owner."

> "Run an tending session."

When a team is activated, Claude Code reads the team definition, identifies the lead and members, and follows the coordination pattern. For the `scrum-team`, the human user takes the Product Owner role, and the `project-manager` agent serves as Scrum Master.

The `opaque-team` is a special case: it consists of N shapeshifter agents that self-organize into whatever roles the task requires, using the adaptive coordination pattern.

## Registries and Discovery

Four YAML registry files serve as the machine-readable catalogs for the system:

| Registry | Location | Purpose |
|----------|----------|---------|
| Skills | `skills/_registry.yml` | Lists all skills with id, path, complexity, language, and description |
| Agents | `agents/_registry.yml` | Lists all agents with id, path, tags, tools, and skill assignments |
| Teams | `teams/_registry.yml` | Lists all teams with id, path, lead, members, and coordination pattern |
| Tests | `tests/_registry.yml` | Lists test scenarios with target, coordination pattern, and acceptance criteria |

Registries must stay in sync with files on disk. When you add or remove a skill, agent, or team, update its registry and the `total_*` count.

README files are auto-generated from these registries. Dynamic sections between `<!-- AUTO:START:name -->` and `<!-- AUTO:END:name -->` markers are replaced by the generation script:

```bash
# Regenerate all READMEs from registry data
npm run update-readmes

# Check if READMEs are up to date (used in CI)
npm run check-readmes
```

A GitHub Actions workflow (`.github/workflows/update-readmes.yml`) auto-commits README updates when registry files change on the `main` branch.

## Choosing the Right Approach

Use this decision matrix to pick the right level of composition for your task:

| Situation | Approach | Example |
|-----------|----------|---------|
| Simple, well-defined task | Single skill | `/submit-to-cran` to submit a package |
| Task requiring domain expertise | Single agent | "Use the r-developer agent to add Rcpp integration" |
| Repeatable procedure you want to codify | Create a new skill | Write a SKILL.md following the create-skill meta-skill |
| Multi-perspective review or complex workflow | Full team | "Activate the r-package-review team" |
| Fixed-iteration project work | Scrum team | "Use the scrum-team for a two-week sprint" |
| Unknown or highly variable task | Opaque team | "Use the opaque-team to figure out the best approach" |

**Rules of thumb:**

- If you can describe the task as a single procedure with clear inputs and outputs, use a skill.
- If the task needs judgment, context, or a specific communication style, use an agent.
- If the task benefits from multiple viewpoints or handoffs between specialists, use a team.
- If you find yourself repeating the same instructions across sessions, codify them as a new skill.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Slash command not recognized | Skill not symlinked to `.claude/skills/` | Create the symlink: `ln -s ../../skills/<name> .claude/skills/<name>` |
| Agent not found | `.claude/agents/` symlink broken or missing | Verify: `ls -la .claude/agents/` should point to `../agents` |
| Team coordination feels wrong | Wrong coordination pattern for the task | Review the 5 patterns in the Teams section above and pick a better fit |
| Registry out of sync | Skill/agent/team added without registry update | Update `_registry.yml` and `total_*` count, then run `npm run update-readmes` |
| Skill too long for agent to follow | SKILL.md exceeds 500 lines | Extract examples to `references/EXAMPLES.md` per the progressive disclosure pattern |

## Related Resources

- [Creating Skills](creating-skills.md) -- how to author, evolve, and review skills
- [Creating Agents and Teams](creating-agents-and-teams.md) -- how to design agent personas and compose teams
- [Quick Reference](quick-reference.md) -- command cheat sheet for daily operations
- [Skill Creation Meta-Skill](../skills/create-skill/SKILL.md) -- the skill that teaches you how to create skills
- [Skills Library README](../skills/README.md) -- browsable catalog of all 278 skills
- [Agents Library README](../agents/README.md) -- browsable catalog of all 59 agents
- [Teams Library README](../teams/README.md) -- browsable catalog of all 10 teams
- [Agent Skills Open Standard](https://agentskills.io) -- the specification this system follows
