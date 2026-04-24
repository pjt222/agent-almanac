---
name: evolve-agent
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing agent definition by refining its persona in-place or
  creating an advanced variant. Covers assessing the current agent against
  best practices, gathering evolution requirements, choosing scope
  (refinement vs. variant), applying changes to skills, tools, capabilities,
  and limitations, updating version metadata, and synchronizing the registry
  and cross-references. Use when an agent's skills list is outdated, user
  feedback reveals capability gaps, tool requirements have changed, an
  advanced variant is needed alongside the original, or the agent's scope
  needs sharpening after real-world use.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, evolution, maintenance, versioning
---

# Evolve an Existing Agent

Fix, grow, or make advanced variant of agent first made with `create-agent`. This proc covers upkeep side of agent life: check gaps vs best practices, apply tight fixes to persona def, bump versions, keep registry and cross-refs in sync.

## When Use

- Agent skills list stale after new skills added to library
- User feedback shows missing capabilities, unclear purpose, or weak examples
- Tool rules shifted (new MCP server, tool gone, privilege drop needed)
- Agent scope needs sharpening — overlaps with another agent or too broad
- Advanced variant needed next to original (e.g., `r-developer` and `r-developer-advanced`)
- Related agents or teams added, cross-refs in See Also are stale

## Inputs

- **Required**: Path to existing agent file to evolve (e.g., `agents/r-developer.md`)
- **Required**: Evolve trigger (feedback, new skills, tool change, scope overlap, team integration, spotted limits)
- **Optional**: Target version bump size (patch, minor, major)
- **Optional**: Make advanced variant vs refine in-place (default: refine in-place)

## Steps

### Step 1: Assess the Current Agent

Read existing agent file and check each section vs quality list from `guides/agent-best-practices.md`:

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields present (`name`, `description`, `tools`, `model`, `version`, `author`) | Missing `tags`, stale `version`, wrong `priority` |
| Purpose | Specific problem statement, not generic "helps with X" | Vague or overlapping with another agent |
| Capabilities | Concrete, verifiable capabilities with bold lead-ins | Generic ("handles development"), no grouping |
| Available Skills | Matches frontmatter `skills` list, all IDs exist in registry | Stale IDs, missing new skills, lists default skills unnecessarily |
| Usage Scenarios | 2-3 realistic scenarios with invocation patterns | Placeholder text, unrealistic examples |
| Examples | Shows user request and agent behavior | Missing or trivial examples |
| Limitations | 3-5 honest constraints | Too few, too vague, or missing entirely |
| See Also | Valid cross-references to agents, guides, teams | Stale links to renamed or removed files |

```bash
# Read the agent file
cat agents/<agent-name>.md

# Check frontmatter parses
head -20 agents/<agent-name>.md

# Verify skills in frontmatter exist in registry
grep "skills:" -A 20 agents/<agent-name>.md

# Check if agent is referenced by any team
grep -r "<agent-name>" teams/*.md
```

**Got:** List of specific gaps, weak spots, or fix chances sorted by section.

**If fail:** Agent file not exist or no frontmatter? This skill not apply — use `create-agent` instead to make from scratch.

### Step 2: Gather Evolution Requirements

Spot and sort what fired the evolution:

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Agent missed XSS in review" | Add skill or capability |
| New skills available | Library gained `analyze-api-security` | Update skills list |
| Tool change | New MCP server available | Add to tools/mcp_servers |
| Scope overlap | Two agents both claim "code review" | Sharpen purpose and limitations |
| Team integration | Agent added to a new team | Update See Also, verify capabilities |
| Model upgrade | Task requires deeper reasoning | Change model field |
| Privilege reduction | Agent has Bash but only reads files | Remove unnecessary tools |

Log specific changes needed before edit. List each change with target section:

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

**Got:** Concrete list of changes, each mapped to specific section of agent file.

**If fail:** Changes unclear? Ask user for clarity before go on. Vague evolution goals give vague fixes.

### Step 3: Choose Evolution Scope

Use this pick matrix to decide refine in-place or make variant:

| Criteria | Refinement (in-place) | Advanced Variant (new agent) |
|----------|----------------------|------------------------------|
| Agent ID | Unchanged | New ID: `<agent>-advanced` or `<agent>-<specialty>` |
| File path | Same `.md` file | New file in `agents/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Model | May change | Often higher (e.g., sonnet → opus) |
| Registry | Update existing entry | New entry added |
| Original agent | Modified directly | Left intact, gains See Also cross-reference |

**Refinement**: Pick when update skills, fix docs, sharpen scope, or tune tools. Agent keeps its identity.

**Variant**: Pick when evolved version would serve a different audience, need different model, or add capabilities that would make original too broad. Original stays as-is for simpler use cases.

**Got:** Clear pick — refine or variant — with reason.

**If fail:** Unsure? Default to refine. Can always pull variant later; harder to merge one back.

### Step 4: Apply Changes to the Agent File

#### For Refinements

Edit existing agent file direct:

- **Frontmatter**: Update `skills`, `tools`, `tags`, `model`, `priority`, `mcp_servers` as need
- **Purpose/Capabilities**: Revise to show new scope or added function
- **Available Skills**: Add new skills with desc, remove deprecated ones
- **Usage Scenarios**: Add or revise scenarios to show new capabilities
- **Limitations**: Remove limits no longer apply, add new honest ones
- **See Also**: Update cross-refs to show current agent/team/guide landscape

Follow these edit rules:
- Keep all existing sections — add content, do not remove sections
- Keep Available Skills section in sync with frontmatter `skills` list
- Do not add default skills (`meditate`, `heal`) to frontmatter unless core to agent methodology
- Check each skill ID exists: `grep "id: skill-name" skills/_registry.yml`

#### For Variants

```bash
# Copy the original as a starting point
cp agents/<agent-name>.md agents/<agent-name>-advanced.md

# Edit the variant:
# - Change `name` to `<agent-name>-advanced`
# - Update `description` to reflect the advanced scope
# - Raise `model` if needed (e.g., sonnet → opus)
# - Reset `version` to "1.0.0"
# - Expand skills, capabilities, and examples for the advanced use case
# - Reference the original in See Also as a simpler alternative
```

**Got:** Agent file (refined or new variant) passes check list from Step 1.

**If fail:** Edit breaks doc shape? Use `git diff` to review changes and revert partial edits with `git checkout -- <file>`.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** This step applies to both human authors and AI agents following this procedure. Do not skip — stale `source_commit` values cause `npm run validate:translations` to report false staleness warnings across all locales.

Check whether translations exist for evolved agent and update to match new source state:

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### If translations exist

1. Get current source commit hash:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` in each translated file frontmatter:

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag files for re-translation by adding affected locales in commit msg:

```
evolve(<agent-name>): <description of changes>

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

**If fail:** `sed` fails to match frontmatter field? Open translated file by hand and check it has `source_commit` in its YAML frontmatter. Field missing? Re-scaffold with `npm run translate:scaffold -- agents <agent-name> <locale>`.

### Step 5: Update Version and Metadata

Bump `version` field in frontmatter by semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0.0 → 1.0.1 | Fixed unclear limitation |
| New skills added, capability expanded | Minor: 1.0.0 → 1.1.0 | Added 3 new skills from library |
| Restructured purpose, changed model | Major: 1.0.0 → 2.0.0 | Narrowed scope, upgraded to opus |

Also update:
- `updated` date to current date
- `tags` if agent domain coverage shifted
- `description` if purpose materially different
- `priority` if agent importance vs others shifted

**Got:** Frontmatter `version` and `updated` match size and date of changes. New variants start at `"1.0.0"`.

**If fail:** Forget to bump version? Next evolve will have no way to tell current state from old. Always bump before commit.

### Step 6: Update Registry and Cross-References

#### For Refinements

Update existing entry in `agents/_registry.yml` to match revised frontmatter:

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

Update `description`, `tags`, `tools`, and `skills` fields to match agent file. No count change needed.

Update cross-refs in other files if agent capabilities or name shifted:

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### For Variants

Add new agent to `agents/_registry.yml` in alpha spot:

```yaml
  - id: <agent-name>-advanced
    path: agents/<agent-name>-advanced.md
    description: One-line description of the advanced variant
    tags: [domain, specialty, advanced]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Then:
1. Bump `total_agents` at top of registry
2. Add See Also cross-ref in original agent pointing to variant
3. Add See Also cross-ref in variant pointing to original
4. `.claude/agents/` symlink to `agents/` means variant auto-found

**Got:** Registry entry matches agent file frontmatter. For variants, `total_agents` equals real count of agent entries.

**If fail:** Count entries with `grep -c "^  - id:" agents/_registry.yml` and check it matches `total_agents`.

### Step 7: Validate the Evolved Agent

Run full check list:

- [ ] Agent file exists at expected path
- [ ] YAML frontmatter parses with no errors
- [ ] `version` was bumped (refinement) or set to "1.0.0" (variant)
- [ ] `updated` date shows today
- [ ] All required sections present: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills in frontmatter match Available Skills section
- [ ] All skill IDs exist in `skills/_registry.yml`
- [ ] Default skills (`meditate`, `heal`) not listed unless core to method
- [ ] Tools list follows least-privilege rule
- [ ] Registry entry exists and matches frontmatter
- [ ] For variants: `total_agents` count matches real count on disk
- [ ] Cross-refs two-way (original ↔ variant)
- [ ] `git diff` shows no slip deletions from original content

```bash
# Verify frontmatter
head -20 agents/<agent-name>.md

# Check skills exist
for skill in skill-a skill-b; do
  grep "id: $skill" skills/_registry.yml
done

# Count agents on disk vs registry
ls agents/*.md | grep -v template | wc -l
grep total_agents agents/_registry.yml

# Review all changes
git diff
```

**Got:** All check items pass. Evolved agent ready to commit.

**If fail:** Fix each failing item one by one. Most common post-evolve issues are stale skill IDs in Available Skills section and forgot `updated` date.

## Validation

- [ ] Agent file exists and has valid YAML frontmatter
- [ ] `version` field shows changes made
- [ ] `updated` date is current
- [ ] All sections present and in sync
- [ ] Frontmatter `skills` array matches Available Skills section
- [ ] All skill IDs exist in `skills/_registry.yml`
- [ ] Default skills not listed needlessly
- [ ] Registry entry matches agent file
- [ ] For variants: new entry in `agents/_registry.yml` with right path
- [ ] For variants: `total_agents` count updated
- [ ] Cross-refs valid (no broken links in See Also)
- [ ] For refinements with translations: `source_commit` updated in all locale files
- [ ] `git diff` confirms no slip content removal

## Pitfalls

- **Forget to bump version**: No version bump, no way to track what changed or when. Always update `version` and `updated` in frontmatter before commit.
- **Stale translations after evolve**: With 1,288+ translation files in repo, every agent evolve fires staleness in up to 4 locale files. Always check for existing translations with `ls i18n/*/agents/<agent-name>.md` and update `source_commit` in each, or flag them for re-translation in commit msg.
- **Skills list drift**: Frontmatter `skills` array and `## Available Skills` section must stay in sync. Update one without other gives confusion for both humans and tools.
- **List default skills needlessly**: Adding `meditate` or `heal` to frontmatter when already inherited from registry. Only list if core to agent method (e.g., `mystic`, `alchemist`).
- **Tool over-add during evolve**: Adding `Bash` or `WebFetch` during evolve "just in case." Every tool add must be backed by specific new capability.
- **Stale See Also after variant make**: When making variant, both original and variant need to ref each other. One-way refs leave graph broken.
- **Registry entry not updated**: After changing agent skills, tools, or desc, `agents/_registry.yml` entry must update to match. Stale registry entries cause discovery and tool fails.

## See Also

- `create-agent` — base for making new agents; evolve-agent assumes this was followed first
- `evolve-skill` — parallel proc for evolving SKILL.md files
- `commit-changes` — commit evolved agent with clear msg
