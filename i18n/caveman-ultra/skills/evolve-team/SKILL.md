---
name: evolve-team
locale: caveman-ultra
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

Improve, restructure, or create specialized variant of team originally made w/ `create-team`. Covers maintenance: assess gaps vs template + coordination patterns, apply targeted improvements to composition + workflow, bump versions, sync registry + cross-refs.

## Use When

- Roster outdated after agents added/removed/evolved
- Feedback → workflow bottlenecks, unclear handoffs, missing perspectives
- Coordination pattern no longer fits workflow (hub-and-spoke should be parallel)
- Specialized variant needed alongside original (e.g., `r-package-review` + `r-package-review-security-focused`)
- Member responsibilities overlap → need sharper boundaries
- CONFIG block out of sync w/ prose or members
- Team needs split into 2 smaller or 2 teams need merge

## In

- **Required**: Path to existing team file (e.g., `teams/r-package-review.md`)
- **Required**: Evolution trigger (feedback, new agents, coordination mismatch, scope overlap, perf issues, agent evolution)
- **Optional**: Version bump magnitude (patch, minor, major)
- **Optional**: Create specialized variant instead refine (default: refine in-place)

## Do

### Step 1: Assess Current

Read existing + eval each section vs template (`teams/_template.md`):

| Section | Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | Required fields (`name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`) | Missing `tags`, stale `version`, wrong `coordination` |
| Purpose | Clear multi-agent justification (≥2 specialties) | Could be 1 agent |
| Team Composition | Table matches frontmatter, no overlap | Stale table, duplicated focus |
| Coordination Pattern | Matches workflow, ASCII diagram present | Wrong pattern |
| Task Decomposition | Phased breakdown + concrete per-member | Vague, missing phases |
| CONFIG Block | Valid YAML between markers, matches frontmatter + prose | Out of sync, missing `blocked_by`, invalid YAML |
| Usage Scenarios | 2-3 realistic activation prompts | Placeholder |
| Limitations | 3-5 honest | Missing/generic |
| See Also | Valid links to agents, teams, guides | Stale |

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

→ List specific gaps by section.

If err: no file or no frontmatter → skill N/A, use `create-team`.

### Step 2: Gather Reqs

Identify + categorize trigger:

| Trigger | Example | Scope |
|---------|---------|---------------|
| User feedback | "Reviews too long, agents duplicate" | Sharpen responsibilities or pattern |
| New agent | `api-security-analyst` created | Add member |
| Agent evolved | `code-reviewer` new skills | Update member responsibilities |
| Agent removed | `deprecated-agent` retired | Remove + reassign tasks |
| Coordination mismatch | Sequential team has indep subtasks | Change to parallel |
| Scope expansion | Cover deployment not just review | Add member or variant |
| Team too large | 6+ members coordination overhead | Split into 2 |
| Team too small | Single member does most | Merge w/ another or add |

Document changes + sections:

```
- Frontmatter: add new member `api-security-analyst` with role "API Security Reviewer"
- Team Composition: add row to composition table
- Task Decomposition: add API security review tasks to execution phase
- CONFIG block: add member and tasks entries
- See Also: add link to new agent file
```

→ Concrete list mapped to sections.

If err: unclear → consult user. Vague → vague.

### Step 3: Choose Scope

Decision matrix:

| Criteria | Refinement (in-place) | Specialized Variant (new) |
|----------|----------------------|-------------------------------|
| Team ID | Unchanged | `<team>-<specialty>` |
| File path | Same `.md` | New file `teams/` |
| Version bump | Patch/minor | Starts 1.0.0 |
| Coordination | May change | May differ |
| Registry | Update existing | New entry |
| Original | Modified directly | Left intact, gains See Also |

**Refinement**: Adjust members, sharpen responsibilities, fix CONFIG, change coordination. Keeps identity.

**Variant**: Diff use case, diff coordination, diff audience. Original stays for existing use.

Additional:

| Situation | Action |
|-----------|--------|
| 6+ members, slow | Split into 2 focused |
| 2 teams of 2 adjacent domains | Merge into 1 of 3-4 |
| Wrong coordination | Refinement — change in-place |
| Different lead | Refinement if lead exists; create agent first if not |

→ Clear decision — refine, variant, split, merge — rationale.

If err: unsure → default refinement. Split/merge higher blast radius → confirm w/ user.

### Step 4: Apply Changes

#### Refinements

Edit directly. Consistency across all sections referencing composition:

1. **Frontmatter `members[]`**: Add/remove/update (each `id`, `role`, `responsibilities`)
2. **Team Composition table**: Match frontmatter exactly
3. **Coordination Pattern**: Update prose + ASCII if changes
4. **Task Decomposition**: Revise phases + per-member
5. **CONFIG block**: Update `members` + `tasks` (Step 5)
6. **Usage Scenarios**: Revise if triggers changed
7. **Limitations**: Update new constraints, remove resolved
8. **See Also**: Update agent links, new refs

Rules:
- Preserve all sections — add not remove
- Adding member → add ALL: frontmatter, composition table, task decomposition, CONFIG
- Removing → remove ALL + reassign tasks
- Verify each: `grep "id: agent-name" agents/_registry.yml`
- Lead stays in members — lead always a member

#### Variants

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

→ File (refined/variant) passes Step 1, all sections internally consistent.

If err: edit breaks consistency (CONFIG lists member not in frontmatter) → compare frontmatter `members[]` vs Composition + Decomposition + CONFIG → find mismatch.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** Human authors + AI agents. No skip — stale `source_commit` → `npm run validate:translations` false staleness.

Check + update:

```bash
# Check for existing translations
ls i18n/*/teams/<team-name>.md 2>/dev/null
```

#### If translations exist

1. Current commit:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update each:

```bash
for locale_file in i18n/*/teams/<team-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag → commit msg:

```
evolve(<team-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. Regenerate:

```bash
npm run translation:status
```

#### If no translations exist

No action. Step 5.

#### Variants

Defer until stabilize (1-2 versions). Add after ≥1 refinement.

→ All translated `source_commit` updated. `npm run translation:status` exits 0.

If err: `sed` fails → open manually, verify `source_commit` in YAML. Missing → re-scaffold `npm run translate:scaffold -- teams <team-name> <locale>`.

### Step 5: CONFIG Block

CONFIG between `<!-- CONFIG:START -->` + `<!-- CONFIG:END -->` must sync w/ prose. After member/task change:

1. Every `agent` in CONFIG `members` matches frontmatter member
2. Every `assignee` in CONFIG `tasks` matches member id
3. Update `blocked_by` if ordering changed
4. Synthesis/final task references all prereq

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

→ CONFIG valid YAML, agents + tasks consistent, `blocked_by` valid DAG.

If err: parse CONFIG YAML separately → syntax errs. Cross-check every `assignee` vs `members`.

### Step 6: Version + Metadata

Bump `version` semver:

| Change | Bump | Example |
|-------------|-------------|---------|
| Wording fix, See Also update | Patch: 1.0.0 → 1.0.1 | Fixed stale agent link |
| New member, tasks revised | Minor: 1.0.0 → 1.1.0 | Added security-analyst |
| Coordination changed, restructured | Major: 1.0.0 → 2.0.0 | hub-and-spoke → parallel |

Also update:
- `updated` date = today
- `tags` if coverage changed
- `description` if purpose materially diff
- `coordination` if pattern changed

→ `version` + `updated` reflect magnitude + date. Variants start `"1.0.0"`.

If err: forget bump → no track. Always before commit.

### Step 7: Registry + Cross-Refs

#### Refinements

Update existing in `teams/_registry.yml` → match frontmatter:

```bash
# Find the team's registry entry
grep -A 10 "id: <team-name>" teams/_registry.yml
```

Update `description`, `lead`, `members`, `coordination` → match file. No count change.

#### Variants

Add new to registry:

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

Then:
1. Increment `total_teams` top
2. Add See Also in original → variant
3. Add See Also in variant → original

README automation:

```bash
npm run update-readmes
```

→ Registry matches frontmatter. `npm run update-readmes` exits 0. Variants: `total_teams` matches actual.

If err: count wrong → `grep -c "^  - id:" teams/_registry.yml` + correct. README automation fails → verify `package.json` + `js-yaml` installed.

### Step 8: Validate

Full checklist:

- [ ] File exists expected path
- [ ] YAML frontmatter parses
- [ ] `version` bumped (refinement) or "1.0.0" (variant)
- [ ] `updated` today
- [ ] All sections: Purpose, Team Composition, Coordination, Task Decomposition, Configuration, Usage Scenarios, Limitations, See Also
- [ ] Frontmatter `members[]` matches Composition table
- [ ] CONFIG members match frontmatter
- [ ] CONFIG tasks valid assignees + `blocked_by` refs
- [ ] All member IDs in `agents/_registry.yml`
- [ ] Lead in members list
- [ ] No 2 members share same primary responsibility
- [ ] Registry matches frontmatter
- [ ] Variants: `total_teams` matches disk
- [ ] Cross-refs bidirectional (original ↔ variant)
- [ ] `git diff` no accidental deletions

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

→ All pass. Ready commit.

If err: address each. Most common: CONFIG block drift (members or tasks not matching prose) + forgotten `updated`.

## Check

- [ ] File exists + valid YAML
- [ ] `version` reflects changes
- [ ] `updated` current
- [ ] All sections consistent
- [ ] Frontmatter `members[]`, Composition, CONFIG in sync
- [ ] All member IDs in registry
- [ ] Lead in members
- [ ] CONFIG YAML valid + parseable
- [ ] Registry matches file
- [ ] Variants: new entry correct path
- [ ] Variants: `total_teams` updated
- [ ] Cross-refs valid (no broken See Also)
- [ ] Refinements w/ translations: `source_commit` updated all locales
- [ ] `git diff` no accidental removal

## Traps

- **CONFIG block drift**: CONFIG + frontmatter + prose must agree on members + tasks. Update 1 w/o others = most common team evolution err. After every change → cross-check all 3.
- **Forget version bump**: No track. Always `version` + `updated` before commit.
- **Stale translations**: Every evolution → up to 4 locale stale. Check `ls i18n/*/teams/<team-name>.md` + update `source_commit` or flag.
- **Orphaned member refs**: Remove member → tasks in Decomposition + CONFIG must reassign/remove. Orphan assignees → activation failures.
- **Wrong coordination post-evolution**: Adding parallel-capable to sequential, or hub-and-spoke where agents need each other's output. Re-evaluate pattern decision `create-team` Step 4 after structural change.
- **Team too large after add**: >5 members hard coordinate. Past 5 → split into 2 focused.
- **Stale See Also after variant**: Original + variant reference each other. One-directional → incomplete.

## →

- `create-team` — foundation new teams; evolve-team assumes this followed
- `evolve-skill` — parallel for SKILL.md
- `evolve-agent` — parallel for agents
- `commit-changes` — commit evolved team w/ descriptive msg
