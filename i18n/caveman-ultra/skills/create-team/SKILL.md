---
name: create-team
locale: caveman-ultra
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

Multi-agent team → coord 2+ agents for multi-perspective tasks. Integrates w/ teams registry, activatable in Claude Code by name.

## Use When

- Task needs multi perspectives (code review + sec audit + arch)
- Recurring collab workflow w/ consistent roles
- Existing ad-hoc composition → formalize
- Complex proc → phases / specialties
- Sprint / pipeline / parallel work

## In

- **Required**: Team name (kebab-case, `data-pipeline-review`)
- **Required**: Purpose (1 paragraph)
- **Required**: Lead agent (in `agents/_registry.yml`)
- **Optional**: Coord pattern (def: hub-and-spoke). One of: `hub-and-spoke`, `sequential`, `parallel`, `timeboxed`, `adaptive`
- **Optional**: Members (def: 3-4; rec: 2-5)
- **Optional**: Src material

## Do

### Step 1: Purpose

Answer:

1. **What outcome** delivered? (report, deploy, sprint)
2. **Why not 1 agent?** ≥2 specialties
3. **When activate?** Triggers

Write 1 paragraph → human/agent reads → decide activation.

**Got:** Clear paragraph + ≥2 specialties.

**If err:** Can't ID 2 specialties → no team needed. Use 1 agent w/ multi skills.

### Step 2: Lead

Orchestrator. Choose from registry:

- Domain expertise → primary output
- Decompose reqs → subtasks
- Synthesize results → deliverable

```bash
# List all available agents
grep "^  - id:" agents/_registry.yml
```

Lead = also member (lead always member).

**Got:** Lead chosen + in registry.

**If err:** No fit → create via `create-agent` first. Don't create team w/ non-existent lead.

### Step 3: Members

2-5 members (incl lead), non-overlap responsibilities. Each:

- **id**: Agent name
- **role**: Short title ("Quality Reviewer", "Security Auditor", "Architecture Reviewer")
- **responsibilities**: 1 sentence, unique

```bash
# Verify each candidate agent exists
grep "id: agent-name-here" agents/_registry.yml
```

Validate no overlap: same primary resp = merge / sharpen.

**Got:** 2-5 members, unique roles, in registry.

**If err:** Agent missing → create first. Overlap → rewrite / remove 1.

### Step 4: Coord Pattern

| Pattern | Use When | Example |
|---------|-------------|---------------|
| **hub-and-spoke** | Lead distrib + collect + synth. Review/audit. | r-package-review, gxp-compliance-validation, ml-data-science-review |
| **sequential** | Each builds on prior. Pipelines/staged. | fullstack-web-dev, tending |
| **parallel** | All sim, independent subtasks. No deps. | devops-platform-engineering |
| **timeboxed** | Fixed iters. Sprint w/ backlog. | scrum-team |
| **adaptive** | Self-org. Unknown/variable. | opaque-team |

**Decision:**
- Lead sees all results pre-output → **hub-and-spoke**
- B needs A's out → **sequential**
- All work w/o seeing others → **parallel**
- Iters w/ planning → **timeboxed**
- Unpredictable struct → **adaptive**

**Got:** Pattern + rationale.

**If err:** Doubt → hub-and-spoke (most common, works for review/analysis).

### Step 5: Task Decomposition

Phases:

1. **Setup**: Lead analyzes req + creates tasks
2. **Execution**: Each member's work (par/seq/sprint)
3. **Synthesis**: Collect + deliverable

Per member: 3-5 concrete tasks (typical req). In "Task Decomposition" prose + CONFIG `tasks` list.

**Got:** Phase-structured decomp + concrete tasks per member, matches coord pattern.

**If err:** Vague ("reviews things") → specific ("reviews code style vs tidyverse guide, checks coverage, evaluates err msg quality").

### Step 6: Team File

```bash
cp teams/_template.md teams/<team-name>.md
```

Fill in order:

1. **YAML frontmatter**: `name`, `description`, `lead`, `version` ("1.0.0"), `author`, `created`, `updated`, `tags`, `coordination`, `members[]` (id, role, responsibilities)
2. **Title**: `# Team Name` (readable, title case)
3. **Intro**: 1 paragraph
4. **Purpose**: Why exist + specialties
5. **Team Composition**: Table (Member, Agent, Role, Focus)
6. **Coordination Pattern**: Prose + ASCII diagram
7. **Task Decomposition**: Phased + tasks per member
8. **Configuration**: CONFIG block (Step 7)
9. **Usage Scenarios**: 2-3 + example prompts
10. **Limitations**: 3-5
11. **See Also**: Links to members + related

**Got:** Complete file, no placeholders.

**If err:** Compare existing (`teams/r-package-review.md`). Search placeholders ("your-team-name", "another-agent") → unfilled.

### Step 7: CONFIG Block

Between `<!-- CONFIG:START -->` + `<!-- CONFIG:END -->` → YAML for tooling:

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

`subagent_type` → Claude Code types. For `.claude/agents/`, use agent id. `blocked_by` = task deps (synth blocked by all reviews).

**Got:** Valid YAML, agents = frontmatter members, deps = valid DAG (no cycles).

**If err:** Validate syntax. Every `assignee` = `agent` in members. `blocked_by` refs earlier task names only.

### Step 8: Registry

Edit `teams/_registry.yml`:

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

Increment `total_teams` (8 → 9 after adding 1).

```bash
# Verify the entry was added
grep "id: <team-name>" teams/_registry.yml
```

**Got:** Entry in registry, count +1.

**If err:** Name exists → diff name / update. Verify YAML indent matches.

### Step 9: README Automation

Regen:

```bash
npm run update-readmes
```

Updates dynamic sections in `teams/README.md` + files w/ `<!-- AUTO:START -->` markers referencing team data.

**Got:** Exit 0, `teams/README.md` has new team.

**If err:** `npm run check-readmes` → out-of-sync files. Script fail → verify `package.json` in root + `js-yaml` installed (`npm install`).

### Step 10: Verify Activation

Test in Claude Code:

```
User: Use the <team-name> team to <typical task description>
```

Claude reads `teams/<team-name>.md`, extracts CONFIG, orchestrates:
1. `TeamCreate` w/ name + desc
2. Spawn teammates via `Agent` tool (`subagent_type` from CONFIG)
3. `TaskCreate` w/ `blocked_by` deps from CONFIG
4. Lead coords per pattern

Note: Teams **not** auto-discovered from `.claude/teams/`. Claude reads def directly from `teams/` on request.

**Got:** Claude reads file, `TeamCreate` works, spawns correct agents, follows pattern.

**If err:** Verify file at `teams/<team-name>.md` (not subdir). All member agents exist in `agents/`. CONFIG YAML valid + `subagent_type` per member. Listed in `teams/_registry.yml`.

### Step 11: Scaffold Translations

> **Required for all teams.** Human + AI authors. Do not skip → backlog.

4 locales post-commit:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

Translate prose (code + IDs EN). Regen:

```bash
npm run translation:status
```

**Got:** 4 files at `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md`, `source_commit` = HEAD. `npm run validate:translations` → 0 stale.

**If err:** Scaffold fail → team in `teams/_registry.yml`. Status stale → run `npm run translation:status` explicit.

## Check

- [ ] File at `teams/<team-name>.md`
- [ ] YAML parses
- [ ] Required: `name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`
- [ ] Each member: `id`, `role`, `responsibilities`
- [ ] Sections: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] CONFIG block between markers
- [ ] CONFIG YAML valid
- [ ] All member ids in `agents/_registry.yml`
- [ ] Lead in members list
- [ ] No 2 members w/ same primary resp
- [ ] In `teams/_registry.yml` w/ correct path/lead/members/coord
- [ ] `total_teams` +1
- [ ] `npm run update-readmes` no err

## Traps

- **Too many members**: >5 → hard coord. Split team / reduce to essentials.
- **Overlap resp**: 2 "review code quality" → findings conflict, lead wastes time dedup. Distinct focus.
- **Wrong coord**: hub-and-spoke when need each other's out (should be seq) / seq when can work indep (should be par). Review Step 4.
- **Missing CONFIG**: Not optional decoration. Machine-readable spec for `TeamCreate` / spawn / tasks. Without → only ad-hoc prose interp (less reliable).
- **Lead not in members**: Lead must appear as member w/ own role + resp. Coord-only lead wastes slot. Give concrete review/synth resp.

## →

- `create-skill` — parallel SKILL.md meta-pattern
- `create-agent` — create members
- `commit-changes` — commit team + registry
