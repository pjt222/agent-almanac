# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

<!-- AUTO:START:overview -->
A documentation-only repository containing 22 guides, a skills library of 341 agentic skills, 70 agent definitions, and 16 team compositions following the [Agent Skills open standard](https://agentskills.io). There is no build system, no tests, and no compiled code — all content is markdown and YAML.

The guides serve as the human entry point to the agentic system: practical workflows explaining when, why, and how to interact with agents, teams, and skills through Claude Code.
<!-- AUTO:END:overview -->

## Architecture

### Four Content Types

1. **Guides** (`guides/` directory): Human-readable documentation organized into four categories (workflow, infrastructure, reference, design). Each guide has YAML frontmatter (`title`, `description`, `category`, `agents`, `teams`, `skills`) and follows a standard template (`guides/_template.md`). Guides serve as the human entry point to the agentic system.

2. **Skills** (`skills/` directory): Machine-consumable structured procedures that agentic systems execute. Each skill lives at `skills/<skill-name>/SKILL.md` with YAML frontmatter (`name`, `description`, `allowed-tools`, `metadata`) and standardized sections (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills). Skills are organized into 55 logical domains via metadata tags, but the directory structure is flat.

3. **Agents** (`agents/` directory): Persona definitions for Claude Code subagents. Each agent is a markdown file with YAML frontmatter (`name`, `description`, `tools`, `model`, `priority`) defining *who* handles a task. Agents span development, compliance, review, project management, DevOps, MLOps, workflow visualization, esoteric, and specialty domains.

4. **Teams** (`teams/` directory): Predefined multi-agent compositions for complex workflows. Each team is a markdown file with YAML frontmatter (`name`, `description`, `lead`, `members[]`, `coordination`) and an embedded machine-readable configuration block. Teams define *who works together* — coordinated groups of agents with assigned roles and a defined coordination pattern.

These four types complement each other: skills define *how* (procedure, validation, recovery), agents define *who* (persona, tools, style), teams define *who works together* (composition, roles, coordination), and guides provide the background knowledge all draw from.

### Registries

<!-- AUTO:START:registries -->
- `skills/_registry.yml` is the machine-readable catalog of all 341 skills across 62 domains: r-packages (10), jigsawr (5), containerization (10), reporting (4), compliance (17), mcp-integration (6), web-dev (4), git (7), general (20), citations (3), data-serialization (2), review (11), bushcraft (4), esoteric (29), design (5), defensive (6), project-management (6), devops (13), observability (13), edge-computing (1), mlops (12), workflow-visualization (6), swarm (9), morphic (7), alchemy (4), tcg (3), intellectual-property (5), gardening (5), shiny (7), animal-training (2), mycology (2), prospecting (2), crafting (1), library-science (3), linguistics (1), travel (6), relocation (3), a2a-protocol (3), geometry (3), number-theory (3), stochastic-processes (3), theoretical-science (3), diffusion (4), hildegard (5), maintenance (5), blender (3), visualization (4), 3d-printing (3), lapidary (4), entomology (5), versioning (4), spectroscopy (6), chromatography (5), gpu-optimization (2), digital-logic (4), electromagnetism (4), levitation (3), i18n (1), synoptic (4), tensegrity (1), cli (4), open-source (1).
- `agents/_registry.yml` is the machine-readable catalog of all 70 agents.
- `teams/_registry.yml` is the machine-readable catalog of all 16 teams.
- `guides/_registry.yml` is the machine-readable catalog of all 22 guides across 4 categories.

When adding or removing skills, agents, teams, or guides, the corresponding registry must be updated to stay in sync.
<!-- AUTO:END:registries -->

### Cross-References

Guides, skills, agents, and teams are cross-referenced. The parent project `CLAUDE.md` at `/mnt/d/dev/p/CLAUDE.md` references several guides via `@agent-almanac/guides/` paths. Skills reference related skills by relative path. Teams reference their member agents. The project `.claude/agents/` symlinks to `agents/` for Claude Code discovery.

## Editing Conventions

- SKILL.md files must retain the YAML frontmatter delimited by `---` and all standardized sections
- Each Procedure step uses the pattern: numbered step with sub-steps, then `**Expected:**` and `**On failure:**` blocks
- The `_registry.yml` must match the actual skills on disk (total count, paths, metadata)
- Guides use GitHub-flavored markdown with code blocks for all commands
- All R examples use `::` for package-qualified calls (e.g., `devtools::check()`) rather than `library()` calls

## Skill Validation

- SKILL.md files must stay under 500 lines; extract extended examples to `references/EXAMPLES.md` using the progressive disclosure pattern
- The `references/` subdirectory pattern follows [agentskills.io progressive disclosure](https://agentskills.io/specification) — large code blocks (>15 lines), full configs, and multi-variant examples go in `references/EXAMPLES.md` with cross-references from the main SKILL.md
- CI enforces validation on all PRs touching `skills/` (`.github/workflows/validate-skills.yml`): frontmatter fields, required sections, line counts, and registry sync
- To validate locally before committing:
  ```bash
  # Check a single skill
  lines=$(wc -l < skills/<skill-name>/SKILL.md)
  [ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL ($lines lines > 500)"

  # Check all skills
  for f in skills/*/SKILL.md; do
    lines=$(wc -l < "$f")
    [ "$lines" -gt 500 ] && echo "OVER: $f ($lines lines)"
  done
  ```

## Adding a New Skill

1. Create `skills/<skill-name>/SKILL.md` following the format of existing skills
2. Add the entry to `skills/_registry.yml` under the appropriate domain
3. Update `total_skills` count in `_registry.yml`
4. Symlink into `.claude/skills/`: `ln -s ../../skills/<skill-name> .claude/skills/<skill-name>`
5. Reference related skills in the new skill's "Related Skills" section
6. Run `npm run update-readmes` (or let CI auto-commit on push to main)
7. The meta-skill at `skills/create-skill/SKILL.md` documents this process in detail

## Adding a New Agent

1. Copy `agents/_template.md` to `agents/<agent-name>.md`
2. Fill in YAML frontmatter (required: `name`, `description`, `tools`, `model`, `version`, `author`)
3. List max 5 core skills in frontmatter `skills:` — identity skills only, no utility skills. List all remaining skills in the `## Available Skills` body section with `[core]` markers on the frontmatter ones
4. Write Purpose, Capabilities, Available Skills, Usage Scenarios, Best Practices, Examples, Limitations, and See Also sections
5. Add the entry to `agents/_registry.yml`
6. Run `npm run update-readmes` (or let CI auto-commit on push to main)
7. See `guides/agent-best-practices.md` for detailed guidance on the 5-skill limit and selection criteria

## Adding a New Team

1. Copy `teams/_template.md` to `teams/<team-name>.md`
2. Fill in YAML frontmatter (required: `name`, `description`, `lead`, `members[]`, `coordination`, `version`, `author`)
3. Write Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, and Limitations sections
4. Include a `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` block with machine-readable YAML for tooling
5. Add the entry to `teams/_registry.yml` and update `total_teams` count
6. Run `npm run update-readmes` (or let CI auto-commit on push to main)

Note: Teams are **not** auto-discovered like agents (from `.claude/agents/`). Do not create a `.claude/teams` symlink -- Claude Code's `TeamCreate` uses `~/.claude/teams/` for runtime state. When a user asks to activate a team: (1) call `ToolSearch("select:TeamCreate")` to load the TeamCreate tool (it is deferred and must be fetched first), (2) read the team definition from `teams/<team-name>.md`, (3) call `TeamCreate` with the team configuration. Do NOT fall back to spawning individual agents via the Agent tool.

## Adding a New Guide

1. Copy `guides/_template.md` to `guides/<guide-name>.md`
2. Fill in YAML frontmatter (required: `title`, `description`, `category`, `agents`, `teams`, `skills`)
3. Write sections following the template: When to Use, Prerequisites, Workflow Overview, core sections, Troubleshooting, Related Resources
4. Add the entry to `guides/_registry.yml` and update `total_guides` count
5. Run `npm run update-readmes` (or let CI auto-commit on push to main)

## README Automation

Dynamic sections in README files are auto-generated from the registries. Sections between `<!-- AUTO:START:name -->` and `<!-- AUTO:END:name -->` markers are replaced by `scripts/generate-readmes.js`. Three files (`guides/README.md`, `viz/README.md`, `teams/README.md`) are fully generated.

```bash
# Update all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (exits 1 if stale)
npm run check-readmes
```

CI auto-commits README updates when registry files change on `main` (`.github/workflows/update-readmes.yml`). Manual table updates in step 5 above are no longer needed — the script handles it.

## Internationalization (i18n)

Translations live in the `i18n/` directory using a parallel tree structure. English sources remain canonical in `skills/`, `agents/`, `teams/`, `guides/`.

### Directory Structure

```
i18n/
  _config.yml                    # Locale configuration (de, zh-CN, ja, es)
  README.md                      # Contributor guide for translators
  <locale>/
    skills/<skill-name>/SKILL.md # Translated skill
    agents/<agent-name>.md       # Translated agent
    teams/<team-name>.md         # Translated team
    guides/<guide-name>.md       # Translated guide
    translation_status.yml       # Auto-generated coverage report
```

### Translation Rules

- Translate prose sections (descriptions, headings, pitfalls, validation text)
- Keep in English: `name` (=ID), code blocks, tool names, tags, domain, file paths, config values
- Every translated file has frontmatter fields: `locale`, `source_locale`, `source_commit`, `translator`, `translation_date`
- Translated SKILL.md files must stay under 500 lines

### Translation Workflow

```bash
# Scaffold a translation (copies source, adds frontmatter)
npm run translate:scaffold -- <content-type> <id> <locale>

# Check translation freshness
npm run validate:translations

# Regenerate per-locale status files
npm run translation:status
```

### Adding a Translation

1. Scaffold: `npm run translate:scaffold -- skills create-r-package de`
2. Translate prose sections in the scaffolded file
3. Verify: `npm run validate:translations` (no stale warnings)
4. Update status: `npm run translation:status`
