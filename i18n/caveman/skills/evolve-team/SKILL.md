---
name: evolve-team
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing team composition by refining its structure in-place or
  creating a specialized variant. Covers assessing the current team against
  template and coordination patterns, gathering evolution requirements,
  choosing scope (adjust members, change coordination pattern, split/merge
  teams), applying changes to the team file and CONFIG block, updating
  version metadata, and synchronizing the registry and cross-references.
  Use when a team's member roster is outdated, coordination pattern no
  longer fits, user feedback reveals workflow gaps, a specialized variant
  is needed alongside the original, or agents have been added or removed
  from the library affecting team composition.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, evolution, coordination, maintenance
---

# Evolve an Existing Team

Fix, restructure, or make specialized variant of team first made with `create-team`. This proc covers upkeep side of team life: check gaps vs template and coord patterns, apply tight fixes to composition and flow, bump versions, keep registry and cross-refs in sync.

## When Use

- Team member roster stale after agents added, removed, or evolved
- User feedback shows flow bottlenecks, unclear handoffs, or missing views
- Coord pattern no longer fits team real flow (e.g., hub-and-spoke should be parallel)
- Specialized variant needed next to original (e.g., `r-package-review` and `r-package-review-security-focused`)
- Team member roles overlap and need sharper edges
- CONFIG block out of sync with prose desc or members list
- Team needs split into two smaller teams or two teams need merge

## Inputs

- **Required**: Path to existing team file to evolve (e.g., `teams/r-package-review.md`)
- **Required**: Evolve trigger (feedback, new agents, coord mismatch, scope overlap, perf issues, agent evolve)
- **Optional**: Target version bump size (patch, minor, major)
- **Optional**: Make specialized variant vs refine in-place (default: refine in-place)

## Steps

### Step 1: Assess the Current Team

Read existing team file and check each section vs team template (`teams/_template.md`):

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields (`name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`) | Missing `tags`, stale `version`, wrong `coordination` |
| Purpose | Clear multi-agent justification (at least two distinct specialties) | Could be handled by a single agent |
| Team Composition | Table matches frontmatter members, no overlapping responsibilities | Stale table, duplicated focus areas |
| Coordination Pattern | Matches actual workflow, ASCII diagram present | Wrong pattern for the workflow |
| Task Decomposition | Phased breakdown with concrete tasks per member | Vague tasks, missing phases |
| CONFIG Block | Valid YAML between markers, matches frontmatter and prose | Out of sync, missing `blocked_by`, invalid YAML |
| Usage Scenarios | 2-3 realistic activation prompts | Placeholder text |
| Limitations | 3-5 honest constraints | Missing or too generic |
| See Also | Valid links to member agents, related teams, guides | Stale links |

```bash
# Read the team file
cat teams/<team-name>.md

# Verify all member agents still exist
grep "id:" teams/<team-name>.md | while read line; do
  agent=$(echo "$line" | grep -oP '(?<=id: )[\w-]+')
  grep "id: $agent" agents/_registry.yml || echo "MISSING: $agent"
done

# Check if the team is referenced by any guide
grep -r "<team-name>" guides/*.md
```

**Got:** List of specific gaps, weak spots, or fix chances sorted by section.

**If fail:** Team file not exist or no frontmatter? This skill not apply — use `create-team` instead to make from scratch.

### Step 2: Gather Evolution Requirements

Spot and sort what fired evolve:

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Reviews take too long, agents duplicate effort" | Sharpen responsibilities or change pattern |
| New agent available | `api-security-analyst` agent was created | Add member |
| Agent evolved | `code-reviewer` gained new skills | Update member responsibilities |
| Agent removed | `deprecated-agent` was retired | Remove member, reassign tasks |
| Coordination mismatch | Sequential team has independent subtasks | Change to parallel |
| Scope expansion | Team needs to cover deployment, not just review | Add member or create variant |
| Team too large | 6+ members causing coordination overhead | Split into two teams |
| Team too small | Single member does most of the work | Merge with another team or add members |

Log specific changes needed before edit:

```
- Frontmatter: add new member `api-security-analyst` with role "API Security Reviewer"
- Team Composition: add row to composition table
- Task Decomposition: add API security review tasks to execution phase
- CONFIG block: add member and tasks entries
- See Also: add link to new agent file
```

**Got:** Concrete list of changes, each mapped to specific section of team file.

**If fail:** Changes unclear? Ask user for clarity before go on. Vague evolve goals give vague fixes.

### Step 3: Choose Evolution Scope

Use this pick matrix to decide refine in-place or make variant:

| Criteria | Refinement (in-place) | Specialized Variant (new team) |
|----------|----------------------|-------------------------------|
| Team ID | Unchanged | New ID: `<team>-<specialty>` |
| File path | Same `.md` file | New file in `teams/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Coordination | May change | May differ from original |
| Registry | Update existing entry | New entry added |
| Original team | Modified directly | Left intact, gains See Also cross-reference |

**Refinement**: Pick when tune members, sharpen roles, fix CONFIG block, or change coord pattern. Team keeps its identity.

**Variant**: Pick when evolved version would serve different use case, need different coord pattern, or target different audience. Original stays as-is for its existing use case.

Extra scope picks:

| Situation | Action |
|-----------|--------|
| Team has 6+ members and is slow | Split into two focused teams |
| Two teams of 2 cover adjacent domains | Merge into one team of 3-4 |
| Team's coordination pattern is wrong | Refinement — change pattern in-place |
| Team needs entirely different lead | Refinement if lead exists; create agent first if not |

**Got:** Clear pick — refine, variant, split, or merge — with reason.

**If fail:** Unsure? Default to refine. Split or merge teams has bigger blast radius and should be confirmed with user.

### Step 4: Apply Changes to the Team File

#### For Refinements

Edit existing team file direct. Keep consistency across all sections that ref team composition:

1. **Frontmatter `members[]`**: Add, remove, or update member entries (each with `id`, `role`, `responsibilities`)
2. **Team Composition table**: Must match frontmatter members exact
3. **Coordination Pattern**: Update prose and ASCII diagram if pattern shifts
4. **Task Decomposition**: Revise phases and per-member tasks to show new composition
5. **CONFIG block**: Update `members` and `tasks` lists to match (see Step 5)
6. **Usage Scenarios**: Revise if team activation triggers shifted
7. **Limitations**: Update to show new limits or remove resolved ones
8. **See Also**: Update agent links and add refs to new related teams or guides

Follow these edit rules:
- Keep all existing sections — add content, do not remove sections
- When add member, add them to ALL of: frontmatter, composition table, task decomposition, and CONFIG block
- When remove member, remove from ALL of those spots and reassign their tasks
- Check each member agent exists: `grep "id: agent-name" agents/_registry.yml`
- Keep lead in members list — lead is always a member

#### For Variants

```bash
# Copy the original as a starting point
cp teams/<team-name>.md teams/<team-name>-<specialty>.md

# Edit the variant:
# - Change `name` to `<team-name>-<specialty>`
# - Update `description` to reflect the specialized scope
# - Adjust `coordination` pattern if needed
# - Reset `version` to "1.0.0"
# - Modify members, tasks, and CONFIG block for the specialized use case
# - Reference the original in See Also as a general-purpose alternative
```

**Got:** Team file (refined or new variant) passes check list from Step 1, with all sections internally in sync.

**If fail:** Edit breaks internal sync (e.g., CONFIG block lists member not in frontmatter)? Compare frontmatter `members[]` vs Team Composition table, Task Decomposition, and CONFIG block to find mismatch.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** This step applies to both human authors and AI agents following this procedure. Do not skip — stale `source_commit` values cause `npm run validate:translations` to report false staleness warnings across all locales.

Check whether translations exist for evolved team and update to match new source state:

```bash
# Check for existing translations
ls i18n/*/teams/<team-name>.md 2>/dev/null
```

#### If translations exist

1. Get current source commit hash:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` in each translated file frontmatter:

```bash
for locale_file in i18n/*/teams/<team-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag files for re-translation by adding affected locales in commit msg:

```
evolve(<team-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. Regen translation status files:

```bash
npm run translation:status
```

#### If no translations exist

No action needed. Go to Step 5.

#### For variants

Wait translation of new variants until variant stabilizes (1-2 versions). Add translations after variant refined at least once.

**Got:** All translated files have `source_commit` updated to current commit. `npm run translation:status` exits 0.

**If fail:** `sed` fails to match frontmatter field? Open translated file by hand and check it has `source_commit` in its YAML frontmatter. Field missing? Re-scaffold with `npm run translate:scaffold -- teams <team-name> <locale>`.

### Step 5: Update the CONFIG Block

CONFIG block between `<!-- CONFIG:START -->` and `<!-- CONFIG:END -->` must stay in sync with prose sections. After any member or task change:

1. Check every `agent` in CONFIG `members` matches member in frontmatter
2. Check every `assignee` in CONFIG `tasks` matches member agent id
3. Update `blocked_by` deps if task ordering shifted
4. Make sure synthesis/final task refs all prereq tasks

```yaml
team:
  name: <team-name>
  lead: <lead-agent>
  coordination: <pattern>
  members:
    - agent: <agent-id>
      role: <role-title>
      subagent_type: <agent-id>
  tasks:
    - name: <task-name>
      assignee: <agent-id>
      description: <one-line>
    - name: synthesize-results
      assignee: <lead-agent>
      description: Collect and synthesize all member outputs
      blocked_by: [<prior-task-names>]
```

**Got:** CONFIG YAML is valid, all agents and tasks are in sync with rest of file, and `blocked_by` forms valid DAG.

**If fail:** Parse CONFIG block YAML apart to find syntax errors. Cross-check every `assignee` vs `members` list.

### Step 6: Update Version and Metadata

Bump `version` field in frontmatter by semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Wording fix, See Also update | Patch: 1.0.0 → 1.0.1 | Fixed stale agent link |
| New member added, tasks revised | Minor: 1.0.0 → 1.1.0 | Added security-analyst member |
| Coordination pattern changed, team restructured | Major: 1.0.0 → 2.0.0 | Changed from hub-and-spoke to parallel |

Also update:
- `updated` date to current date
- `tags` if team domain coverage shifted
- `description` if team purpose materially different
- `coordination` if pattern shifted

**Got:** Frontmatter `version` and `updated` show size and date of changes. New variants start at `"1.0.0"`.

**If fail:** Forget to bump version? Next evolve will have no way to tell current state from old. Always bump before commit.

### Step 7: Update Registry and Cross-References

#### For Refinements

Update existing entry in `teams/_registry.yml` to match revised frontmatter:

```bash
# Find the team's registry entry
grep -A 10 "id: <team-name>" teams/_registry.yml
```

Update `description`, `lead`, `members`, and `coordination` fields to match team file. No count change needed.

#### For Variants

Add new team to `teams/_registry.yml`:

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

Then:
1. Bump `total_teams` at top of registry
2. Add See Also cross-ref in original team pointing to variant
3. Add See Also cross-ref in variant pointing to original

Run README automation:

```bash
npm run update-readmes
```

**Got:** Registry entry matches team file frontmatter. `npm run update-readmes` exits 0. For variants, `total_teams` equals real count of team entries.

**If fail:** Registry count wrong? Count entries with `grep -c "^  - id:" teams/_registry.yml` and fix count. README automation fails? Check `package.json` exists and `js-yaml` installed.

### Step 8: Validate the Evolved Team

Run full check list:

- [ ] Team file exists at expected path
- [ ] YAML frontmatter parses with no errors
- [ ] `version` was bumped (refinement) or set to "1.0.0" (variant)
- [ ] `updated` date shows today
- [ ] All required sections present: Purpose, Team Composition, Coordination Pattern, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] Frontmatter `members[]` matches Team Composition table
- [ ] CONFIG block members match frontmatter members
- [ ] CONFIG block tasks have valid assignees and `blocked_by` refs
- [ ] All member agent IDs exist in `agents/_registry.yml`
- [ ] Lead agent shows in members list
- [ ] No two members share same primary role
- [ ] Registry entry exists and matches frontmatter
- [ ] For variants: `total_teams` count matches real count on disk
- [ ] Cross-refs two-way (original ↔ variant)
- [ ] `git diff` shows no slip deletes from original content

```bash
# Verify frontmatter
head -25 teams/<team-name>.md

# Verify all member agents exist
for agent in agent-a agent-b agent-c; do
  grep "id: $agent" agents/_registry.yml
done

# Count teams on disk vs registry
ls teams/*.md | grep -v template | wc -l
grep total_teams teams/_registry.yml

# Review all changes
git diff
```

**Got:** All check items pass. Evolved team ready to commit.

**If fail:** Fix each failing item one by one. Most common post-evolve issues are CONFIG block drift (members or tasks not matching prose) and forgot `updated` date.

## Validation

- [ ] Team file exists and has valid YAML frontmatter
- [ ] `version` field shows changes made
- [ ] `updated` date is current
- [ ] All sections present and in sync
- [ ] Frontmatter `members[]`, Team Composition table, and CONFIG block are in sync
- [ ] All member agent IDs exist in `agents/_registry.yml`
- [ ] Lead agent is in members list
- [ ] CONFIG block YAML is valid and parseable
- [ ] Registry entry matches team file
- [ ] For variants: new entry in `teams/_registry.yml` with right path
- [ ] For variants: `total_teams` count updated
- [ ] Cross-refs valid (no broken links in See Also)
- [ ] For refinements with translations: `source_commit` updated in all locale files
- [ ] `git diff` confirms no slip content removal

## Pitfalls

- **CONFIG block drift**: CONFIG block, frontmatter, and prose sections must all agree on members and tasks. Updating one without others is most common team evolve error. After every change, cross-check all three.
- **Forget to bump version**: No version bump, no way to track what changed or when. Always update `version` and `updated` in frontmatter before commit.
- **Stale translations after evolve**: Every team evolve fires staleness in up to 4 locale files. Always check for existing translations with `ls i18n/*/teams/<team-name>.md` and update `source_commit` in each, or flag them for re-translation in commit msg.
- **Orphan member refs**: When remove member, their tasks in Task Decomposition and CONFIG block must be reassigned or removed. Leaving orphan assignees cause activation fails.
- **Wrong coord pattern after evolve**: Adding parallel-capable members to sequential team, or making hub-and-spoke team where agents need each other output. Re-check pattern pick from `create-team` Step 4 after any structural change.
- **Team too big after add members**: Teams with more than 5 members become hard to coord. Evolve push team past 5? Think split into two focused teams instead.
- **Stale See Also after variant make**: When make variant, both original and variant need ref each other. One-way refs leave graph broken.

## See Also

- `create-team` — base for making new teams; evolve-team assumes this was followed first
- `evolve-skill` — parallel proc for evolving SKILL.md files
- `evolve-agent` — parallel proc for evolving agent definitions
- `commit-changes` — commit evolved team with clear msg
