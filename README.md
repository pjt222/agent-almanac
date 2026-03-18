<p align="center">
  <img src="viz/public/logo-transparent.png" alt="Agent Almanac" width="256">
</p>

# Agent Almanac

[![Validate Skills](https://github.com/pjt222/agent-almanac/actions/workflows/validate-skills.yml/badge.svg)](https://github.com/pjt222/agent-almanac/actions/workflows/validate-skills.yml)
[![Update READMEs](https://github.com/pjt222/agent-almanac/actions/workflows/update-readmes.yml/badge.svg)](https://github.com/pjt222/agent-almanac/actions/workflows/update-readmes.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Sponsor](https://img.shields.io/github/sponsors/pjt222?style=flat&logo=GitHub-Sponsors&logoColor=%23EA4AAA&label=Sponsor)](https://github.com/sponsors/pjt222)

A library of executable skills, specialist agents, and pre-built teams for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and compatible AI tools. Define repeatable engineering procedures once and have AI agents execute them with built-in validation and error recovery. Compose specialists into review teams that catch issues a single reviewer would miss. Built on the [Agent Skills open standard](https://agentskills.io).

## At a Glance

<!-- AUTO:START:stats -->
- **333 skills** across 59 domains — structured, executable procedures
- **67 agents** — specialized Claude Code personas covering development, review, compliance, and more
- **15 teams** — predefined multi-agent compositions for complex workflows
- **19 guides** — human-readable workflow, infrastructure, and reference documentation
- **Interactive visualization** — force-graph explorer with 333 R-generated skill icons and 9 color themes
<!-- AUTO:END:stats -->

## How It Works

| Building Block | Location | Purpose |
|----------------|----------|---------|
| **[Skills](skills/README.md)** | `skills/<skill-name>/SKILL.md` | Executable procedures (*how*) |
| **[Agents](agents/README.md)** | `agents/<name>.md` | Specialized personas (*who*) |
| **[Teams](teams/README.md)** | `teams/<name>.md` | Multi-agent compositions (*who works together*) |
| **[Guides](guides/README.md)** | `guides/<name>.md` | Human-readable reference (*context*) |

Ask Claude Code to review your R package, and the [r-package-review](teams/r-package-review.md) team activates 4 agents — each following specialized skills for code quality, architecture, security, and best practices — then synthesizes their findings into a single report.

### Works with

Skills follow the [Agent Skills open standard](https://agentskills.io) and work with any tool that reads markdown:

| Tool | Integration | Details |
|------|-------------|---------|
| **Claude Code** | Full (skills, agents, teams) | Native discovery via `.claude/` symlinks |
| **Codex (OpenAI)** | Skills | Symlink into `.agents/skills/` |
| **Cursor** | Skills | Map to `.cursor/rules/*.mdc` files |
| **Gemini CLI, Aider, etc.** | Skills | Point context to any `SKILL.md` file |

Agents and teams use Claude Code's subagent architecture. For other tools, skills are the primary integration surface. See [skills/README.md](skills/README.md#consuming-skills-from-different-systems) for setup instructions.

## Quick Start

### 60-second path

No setup needed — reference any skill by path in Claude Code:

```
> "Follow skills/commit-changes/SKILL.md to stage and commit my changes"
```

### Full setup

**Prerequisites:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed, Node.js (for README generation and the visualization).

```bash
git clone https://github.com/pjt222/agent-almanac.git
cd agent-almanac
```

Then in Claude Code:

```
> "Use the code-reviewer agent to review my latest changes"
> "Follow the commit-changes skill to stage and commit"
> "Activate the r-package-review team to review this package"
```

### Make skills available as slash commands

```bash
# From the repository root:
ln -s ../../skills/commit-changes .claude/skills/commit-changes
# Then invoke with /commit-changes in Claude Code
```

See [Symlink Architecture](guides/symlink-architecture.md) for details. All 328 skills are already symlinked in this repository.

### Explore visually

```bash
cd viz && npm install && npm run dev
# Open http://localhost:5173 for the interactive force-graph explorer
```

See [viz/README.md](viz/README.md) for full build instructions.

## Directory Map

```
agent-almanac/
  skills/      328 executable procedures across 58 domains
  agents/       66 specialist personas
  teams/        15 multi-agent compositions with 8 coordination patterns
  guides/       19 human-readable reference docs
  viz/          Interactive force-graph explorer with R-generated icons
  tests/        30 test scenarios for validation
  i18n/         Translations (4 locales: de, zh-CN, ja, es)
  cli/          Universal installer tool (Phase 1)
  scripts/      Build and CI automation
  sessions/     Tending session archives
```

## Guides

New here? Start with [Understanding the System](guides/understanding-the-system.md). See [all guides](guides/README.md) for the full categorized list.

<!-- AUTO:START:guides -->
**Workflow**

- [Understanding the System](guides/understanding-the-system.md) — Entry point: what skills, agents, and teams are, how they compose, and how to invoke them
- [Creating Skills](guides/creating-skills.md) — Authoring, evolving, and reviewing skills following the agentskills.io standard
- [Creating Agents and Teams](guides/creating-agents-and-teams.md) — Designing agent personas, composing teams, and choosing coordination patterns
- [Running a Code Review](guides/running-a-code-review.md) — Multi-agent code review using review teams for R packages and web projects
- [Managing a Scrum Sprint](guides/managing-a-scrum-sprint.md) — Running Scrum sprints with the scrum-team: planning, dailies, review, and retro
- [Visualizing Workflows with putior](guides/visualizing-workflows-with-putior.md) — End-to-end putior workflow visualization from annotation to themed Mermaid diagrams
- [Running Tending](guides/running-tending.md) — AI meta-cognitive tending sessions with the tending team
- [Running a Translation Campaign](guides/running-a-translation-campaign.md) — End-to-end guide for translating all skills, agents, teams, and guides into supported locales using the translation-campaign team
- [Production Coordination Patterns](guides/production-coordination-patterns.md) — Real-world multi-agent orchestration patterns: barrier synchronization, silence budgets, health checks, degraded-wave policies, and cost-aware scheduling
- [AgentSkills Alignment](guides/agentskills-alignment.md) — Standards compliance audits using the agentskills-alignment team for format validation, spec drift detection, and registry integrity

**Infrastructure**

- [Setting Up Your Environment](guides/setting-up-your-environment.md) — WSL2 setup, shell config, MCP server integration, and Claude Code configuration
- [Symlink Architecture](guides/symlink-architecture.md) — How symlinks enable multi-project discovery of skills, agents, and teams through Claude Code
- [R Package Development](guides/r-package-development.md) — Package structure, testing, CRAN submission, pkgdown deployment, and renv management

**Reference**

- [Quick Reference](guides/quick-reference.md) — Command cheat sheet for agents, skills, teams, Git, R, and shell operations
- [Agent Best Practices](guides/agent-best-practices.md) — Design principles, quality assurance, and maintenance guidelines for writing effective agents
- [Agent Configuration Schema](guides/agent-configuration-schema.md) — YAML frontmatter field definitions, validation rules, and JSON Schema for agent files

**Design**

- [Extracting Project Essence](guides/extracting-project-essence.md) — Multi-perspective framework for extracting skills, agents, and teams from any codebase using the metal skill
- [Epigenetics-Inspired Activation Control](guides/epigenetics-activation-control.md) — Runtime activation profiles controlling which agents, skills, and teams are expressed, grounded in molecular epigenetics
- [Understanding the Synoptic Mind](guides/understanding-the-synoptic-mind.md) — The adaptic concept — panoramic synthesis through simultaneous multi-domain awareness, theoretical foundations, and practical use
<!-- AUTO:END:guides -->

## Translations

<!-- AUTO:START:translations -->
| Locale | Language | Skills | Agents | Teams | Guides | Total |
|--------|----------|--------|--------|-------|--------|-------|
| de | Deutsch | 317/333 | 3/67 | 1/15 | 1/19 | 322/434 (74.2%) |
| zh-CN | 简体中文 | 317/333 | 3/67 | 1/15 | 1/19 | 322/434 (74.2%) |
| ja | 日本語 | 317/333 | 3/67 | 1/15 | 1/19 | 322/434 (74.2%) |
| es | Español | 317/333 | 3/67 | 1/15 | 1/19 | 322/434 (74.2%) |
<!-- AUTO:END:translations -->

See [i18n/README.md](i18n/README.md) for the translation contributor guide.

## Contributing

Contributions welcome! Each content type has its own guide:

- **Skills** — [skills/README.md](skills/README.md) for format and consumption
- **Agents** — [agents/README.md](agents/README.md) for template and best practices
- **Teams** — [teams/README.md](teams/README.md) for coordination patterns
- **Guides** — [guides/README.md](guides/README.md) for categories and template

Update the relevant `_registry.yml` when adding content, then run `npm run update-readmes`.

## Support

If Agent Almanac makes your AI tools more capable, consider [sponsoring its development](https://github.com/sponsors/pjt222).

Reliable AI assistance requires structured knowledge — and maintaining that structure is work that the models themselves cannot do.

## License

MIT License. See [LICENSE](LICENSE) for details.
