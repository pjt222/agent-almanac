---
name: create-team
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new team composition file following the agent-almanac
  team template and registry conventions. Covers team purpose definition,
  member selection, coordination pattern choice, task decomposition
  design, machine-readable configuration block, registry integration,
  and README automation. Use when defining a multi-agent workflow,
  composing agents for a complex review process, or creating a
  coordinated group for recurring collaborative tasks.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, creation, composition, coordination
---

# Create a New Team

Define multi-agent team composition. Coordinate two or more agents for tasks needing multiple perspectives, specialties, or phases. Resulting team file integrates with teams registry. Can be activated in Claude Code by name.

## When Use

- Task needs many perspectives one agent cannot give (e.g., code review plus security audit plus architecture review)
- Need recurring collaborative workflow with consistent role assignments and handoff patterns
- Existing agent composition used often, should be formalized
- Complex process naturally breaks into phases or specialties handled by different agents
- Want to define coordinated group for sprint-based, pipeline-based, or parallel work

## Inputs

- **Required**: Team name (lowercase kebab-case, e.g., `data-pipeline-review`)
- **Required**: Team purpose (one paragraph describing what problem needs many agents)
- **Required**: Lead agent (must exist in `agents/_registry.yml`)
- **Optional**: Coordination pattern (default: hub-and-spoke). One of: `hub-and-spoke`, `sequential`, `parallel`, `timeboxed`, `adaptive`
- **Optional**: Number of members (default: 3-4; recommended range: 2-5)
- **Optional**: Source material (existing workflow, runbook, or ad-hoc team composition to formalize)

## Steps

### Step 1: Define Team Purpose

Spell out what problem needs many agents working together. Valid team purpose must answer:

1. **What outcome** does this team deliver? (e.g., comprehensive review report, deployed application, sprint increment)
2. **Why can't single agent do this?** Identify at least two distinct specialties or perspectives needed.
3. **When should this team activate?** Define trigger conditions.

Write purpose as one paragraph human or agent can read to decide whether to activate this team.

**Got:** Clear paragraph explaining team's value. At least two distinct specialties identified.

**If fail:** Cannot identify two distinct specialties? Task likely does not need team. Use single agent with multiple skills instead.

### Step 2: Select Lead Agent

Lead agent orchestrates team. Pick agent from `agents/_registry.yml` that:

- Has domain expertise relevant to team's primary output
- Can decompose incoming requests into subtasks for other members
- Can synthesize results from many reviewers into coherent deliverable

```bash
# List all available agents
grep "^  - id:" agents/_registry.yml
```

Lead must also show as member in team composition (lead always a member).

**Got:** One agent picked as lead. Confirmed to exist in agents registry.

**If fail:** No existing agent fits lead role? Create one first using `create-agent` skill (or `agents/_template.md` by hand). Do not create team with lead that does not exist as agent definition.

### Step 3: Select Member Agents

Pick 2-5 members (including lead) with clear, non-overlapping responsibilities. For each member, define:

- **id**: Agent name from agents registry
- **role**: Short title (e.g., "Quality Reviewer", "Security Auditor", "Architecture Reviewer")
- **responsibilities**: One sentence describing what this member does that no other member does

```bash
# Verify each candidate agent exists
grep "id: agent-name-here" agents/_registry.yml
```

Validate non-overlap: no two members should have same primary responsibility. Responsibilities overlap? Merge roles or sharpen boundaries.

**Got:** 2-5 members picked, each with unique role and clear responsibilities. All confirmed in agents registry.

**If fail:** Needed agent does not exist? Create first. Responsibilities overlap between two members? Rewrite to clarify boundaries or drop one member.

### Step 4: Choose Coordination Pattern

Pick pattern fitting team's workflow. Five patterns and use cases:

| Pattern | When to Use | Example Teams |
|---------|-------------|---------------|
| **hub-and-spoke** | Lead distributes tasks, collects results, synthesizes. Best for review and audit workflows. | r-package-review, gxp-compliance-validation, ml-data-science-review |
| **sequential** | Each agent builds on prior agent's output. Best for pipelines and staged workflows. | fullstack-web-dev, tending |
| **parallel** | All agents work at once on independent subtasks. Best when subtasks have no dependencies. | devops-platform-engineering |
| **timeboxed** | Work organized into fixed-length iterations. Best for ongoing project work with backlog. | scrum-team |
| **adaptive** | Team self-organizes based on task. Best for unknown or highly variable tasks. | opaque-team |

**Decision guide:**
- Lead must see all results before producing output → **hub-and-spoke**
- Agent B needs agent A's output to start → **sequential**
- All agents can work without seeing each other's output → **parallel**
- Work spans many iterations with planning ceremonies → **timeboxed**
- Cannot predict task structure in advance → **adaptive**

**Got:** One coordination pattern picked with clear rationale.

**If fail:** Unsure? Default to hub-and-spoke. Most common pattern, works for most review and analysis workflows.

### Step 5: Design Task Decomposition

Define how typical incoming request splits across team members. Structure as phases:

1. **Setup phase**: What lead does to analyze request and create tasks
2. **Execution phase**: What each member works on (in parallel, in sequence, or per-sprint depending on coordination pattern)
3. **Synthesis phase**: How results collected and final deliverable produced

For each member, list 3-5 concrete tasks they would do on typical request. These tasks show in both "Task Decomposition" prose section and CONFIG block's `tasks` list.

**Got:** Phase-structured decomposition with concrete tasks per member, matching picked coordination pattern.

**If fail:** Tasks too vague (e.g., "reviews things")? Make specific (e.g., "reviews code style against tidyverse style guide, checks test coverage, evaluates error message quality").

### Step 6: Write the Team File

Copy template. Fill in all sections:

```bash
cp teams/_template.md teams/<team-name>.md
```

Fill in these sections in order:

1. **YAML frontmatter**: `name`, `description`, `lead`, `version` ("1.0.0"), `author`, `created`, `updated`, `tags`, `coordination`, `members[]` (each with id, role, responsibilities)
2. **Title**: `# Team Name` (human-readable, title case)
3. **Introduction**: One paragraph summary
4. **Purpose**: Why this team exists, what specialties it combines
5. **Team Composition**: Table with Member, Agent, Role, Focus Areas columns
6. **Coordination Pattern**: Prose description plus ASCII diagram of flow
7. **Task Decomposition**: Phased breakdown with concrete tasks per member
8. **Configuration**: Machine-readable CONFIG block (see Step 7)
9. **Usage Scenarios**: 2-3 concrete scenarios with example user prompts
10. **Limitations**: 3-5 known constraints
11. **See Also**: Links to member agent files and related skills/teams

**Got:** Complete team file with all sections filled in. No placeholder text left from template.

**If fail:** Compare against existing team file (e.g., `teams/r-package-review.md`) to verify structure. Search for template placeholder strings like "your-team-name" or "another-agent" to find unfilled sections.

### Step 7: Write the CONFIG Block

CONFIG block between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` markers gives machine-readable YAML for tooling. Structure as follows:

    <!-- CONFIG:START -->
    ```yaml
    team:
      name: <team-name>
      lead: <lead-agent-id>
      coordination: <pattern>
      members:
        - agent: <agent-id>
          role: <role-title>
          subagent_type: <agent-id>  # Claude Code subagent type for spawning
        # ... repeat for each member
      tasks:
        - name: <task-name>
          assignee: <agent-id>
          description: <one-line description>
        # ... repeat for each task
        - name: synthesize-report  # final task if hub-and-spoke
          assignee: <lead-agent-id>
          description: <synthesis description>
          blocked_by: [<prior-task-names>]  # for dependency ordering
    ```
    <!-- CONFIG:END -->

`subagent_type` field maps to Claude Code agent types. For agents defined in `.claude/agents/`, use agent id as subagent_type. Use `blocked_by` for task dependencies (e.g., synthesis blocked by all review tasks).

**Got:** CONFIG block is valid YAML. All agents match those in frontmatter members list. Task dependencies form valid DAG (no cycles).

**If fail:** Validate YAML syntax. Verify every `assignee` in tasks list matches `agent` in members list. Check `blocked_by` references only task names defined earlier in list.

### Step 8: Add to Registry

Edit `teams/_registry.yml`. Add new team:

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

Bump `total_teams` count at top of registry (currently 8; becomes 9 after adding one team).

```bash
# Verify the entry was added
grep "id: <team-name>" teams/_registry.yml
```

**Got:** New entry shows in registry. `total_teams` count incremented by one.

**If fail:** Team name already in registry? Pick different name or update existing entry. Verify YAML indentation matches existing entries.

### Step 9: Run README Automation

Regenerate README files from updated registry:

```bash
npm run update-readmes
```

Updates dynamic sections in `teams/README.md` and other files with `<!-- AUTO:START -->` / `<!-- AUTO:END -->` markers referencing team data.

**Got:** Command exits 0. `teams/README.md` now lists new team.

**If fail:** Run `npm run check-readmes` to see which files out of sync. Script fails? Verify `package.json` exists in repo root and `js-yaml` installed (`npm install`).

### Step 10: Verify Team Activation

Test team can be activated in Claude Code:

```
User: Use the <team-name> team to <typical task description>
```

Claude reads `teams/<team-name>.md`, extracts CONFIG block, orchestrates activation:
1. Calls `TeamCreate` with team name and description
2. Spawns teammates via `Agent` tool using each member's `subagent_type` from CONFIG block
3. Creates tasks via `TaskCreate` with `blocked_by` dependencies from CONFIG block
4. Lead agent coordinates work following coordination pattern

Note: Teams **not** auto-discovered from `.claude/teams/`. Claude reads definition directly from `teams/` when asked.

**Got:** Claude reads team file, creates team via `TeamCreate`, spawns right agents, follows coordination pattern.

**If fail:** Verify team file at `teams/<team-name>.md` (not in subdirectory). Check all member agents exist in `agents/`. Confirm CONFIG block has valid YAML with `subagent_type` for each member. Confirm team listed in `teams/_registry.yml`.

### Step 11: Scaffold Translations

> **Required for all teams.** This step applies to both human authors and AI agents following this procedure. Do not skip — missing translations pile into stale backlog.

Scaffold translation files for all 4 supported locales right after committing new team:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

Then translate scaffolded prose in each file (code blocks and IDs stay English). Finally regenerate status files:

```bash
npm run translation:status
```

**Got:** 4 files created at `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md`, all with `source_commit` matching current HEAD. `npm run validate:translations` shows 0 stale warnings for new team.

**If fail:** Scaffold fails? Verify team exists in `teams/_registry.yml`. Status files don't update? Run `npm run translation:status` explicitly.

## Checks

- [ ] Team file exists at `teams/<team-name>.md`
- [ ] YAML frontmatter parses without errors
- [ ] All required frontmatter fields present: `name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`
- [ ] Each member in frontmatter has `id`, `role`, `responsibilities`
- [ ] All sections present: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] CONFIG block exists between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` markers
- [ ] CONFIG block YAML valid and parseable
- [ ] All member agent ids exist in `agents/_registry.yml`
- [ ] Lead agent shows in members list
- [ ] No two members share same primary responsibility
- [ ] Team listed in `teams/_registry.yml` with right path, lead, members, coordination
- [ ] `total_teams` count in registry incremented
- [ ] `npm run update-readmes` finishes without errors

## Pitfalls

- **Too many members**: Teams with more than 5 members → hard to coordinate. Overhead of distributing tasks and synthesizing results outweighs benefit of extra perspectives. Split into two teams or cut to essential specialties.
- **Overlapping responsibilities**: Two members both "review code quality"? Findings will conflict, lead wastes time deduplicating. Each member must have clearly distinct focus area.
- **Wrong coordination pattern**: Using hub-and-spoke when agents need each other's output (should be sequential), or using sequential when agents can work independently (should be parallel). Review decision guide in Step 4.
- **Missing CONFIG block**: CONFIG block not optional prose decoration. Machine-readable spec Claude uses to orchestrate `TeamCreate`, agent spawning, task creation. Without it, team only activatable through ad-hoc prose interpretation, less reliable.
- **Lead agent not in members list**: Lead must also show as member with own role and responsibilities. Lead who only "coordinates" without substantive work wastes slot. Give lead concrete review or synthesis responsibility.

## See Also

- `create-skill` - follows same meta-pattern for creating SKILL.md files
- `create-agent` - create agent definitions serving as team members
- `commit-changes` - commit new team file and registry updates
