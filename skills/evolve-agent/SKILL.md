---
name: evolve-agent
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

Improve, extend, or create an advanced variant of an agent that was originally authored with `create-agent`. This procedure covers the maintenance side of the agent lifecycle: assessing gaps against best practices, applying targeted improvements to the persona definition, bumping versions, and keeping the registry and cross-references in sync.

## When to Use

- An agent's skills list is outdated after new skills were added to the library
- User feedback reveals missing capabilities, unclear purpose, or weak examples
- Tool requirements have changed (new MCP server, tool removed, privilege reduction needed)
- An agent's scope needs sharpening — it overlaps with another agent or is too broad
- An advanced variant is needed alongside the original (e.g., `r-developer` and `r-developer-advanced`)
- Related agents or teams were added and cross-references in See Also are stale

## Inputs

- **Required**: Path to the existing agent file to evolve (e.g., `agents/r-developer.md`)
- **Required**: Evolution trigger (feedback, new skills, tool change, scope overlap, team integration, discovered limitations)
- **Optional**: Target version bump magnitude (patch, minor, major)
- **Optional**: Whether to create an advanced variant instead of refining in-place (default: refine in-place)

## Procedure

### Step 1: Assess the Current Agent

Read the existing agent file and evaluate each section against the quality checklist from `guides/agent-best-practices.md`:

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

**Expected:** A list of specific gaps, weaknesses, or improvement opportunities organized by section.

**On failure:** If the agent file does not exist or has no frontmatter, this skill does not apply — use `create-agent` instead to author it from scratch.

### Step 2: Gather Evolution Requirements

Identify and categorize what triggered the evolution:

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Agent missed XSS in review" | Add skill or capability |
| New skills available | Library gained `analyze-api-security` | Update skills list |
| Tool change | New MCP server available | Add to tools/mcp_servers |
| Scope overlap | Two agents both claim "code review" | Sharpen purpose and limitations |
| Team integration | Agent added to a new team | Update See Also, verify capabilities |
| Model upgrade | Task requires deeper reasoning | Change model field |
| Privilege reduction | Agent has Bash but only reads files | Remove unnecessary tools |

Document the specific changes needed before editing. List each change with its target section:

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

**Expected:** A concrete list of changes, each mapped to a specific section of the agent file.

**On failure:** If the changes are unclear, consult the user for clarification before proceeding. Vague evolution goals produce vague improvements.

### Step 3: Choose Evolution Scope

Use this decision matrix to determine whether to refine in-place or create a variant:

| Criteria | Refinement (in-place) | Advanced Variant (new agent) |
|----------|----------------------|------------------------------|
| Agent ID | Unchanged | New ID: `<agent>-advanced` or `<agent>-<specialty>` |
| File path | Same `.md` file | New file in `agents/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Model | May change | Often higher (e.g., sonnet → opus) |
| Registry | Update existing entry | New entry added |
| Original agent | Modified directly | Left intact, gains See Also cross-reference |

**Refinement**: Choose when updating skills, fixing documentation, sharpening scope, or adjusting tools. The agent keeps its identity.

**Variant**: Choose when the evolved version would serve a substantially different audience, require a different model, or add capabilities that would make the original too broad. The original stays as-is for simpler use cases.

**Expected:** A clear decision — refinement or variant — with rationale.

**On failure:** If unsure, default to refinement. You can always extract a variant later; it is harder to merge one back.

### Step 4: Apply Changes to the Agent File

#### For Refinements

Edit the existing agent file directly:

- **Frontmatter**: Update `skills`, `tools`, `tags`, `model`, `priority`, `mcp_servers` as needed
- **Purpose/Capabilities**: Revise to reflect new scope or added functionality
- **Available Skills**: Add new skills with descriptions, remove deprecated ones
- **Usage Scenarios**: Add or revise scenarios to demonstrate new capabilities
- **Limitations**: Remove constraints that no longer apply, add new honest ones
- **See Also**: Update cross-references to reflect current agent/team/guide landscape

Follow these editing rules:
- Preserve all existing sections — add content, do not remove sections
- Keep the Available Skills section in sync with the frontmatter `skills` list
- Do not add default skills (`meditate`, `heal`) to frontmatter unless they are core to the agent's methodology
- Verify each skill ID exists: `grep "id: skill-name" skills/_registry.yml`

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

**Expected:** The agent file (refined or new variant) passes the assessment checklist from Step 1.

**On failure:** If an edit breaks the document structure, use `git diff` to review changes and revert partial edits with `git checkout -- <file>`.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** This step applies to both human authors and AI agents following this procedure. Do not skip — stale `source_commit` values cause `npm run validate:translations` to report false staleness warnings across all locales.

Check whether translations exist for the evolved agent and update them to reflect the new source state:

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### If translations exist

1. Get the current source commit hash:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` in each translated file's frontmatter:

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag files for re-translation by including affected locales in the commit message:

```
evolve(<agent-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. Regenerate translation status files:

```bash
npm run translation:status
```

#### If no translations exist

No action needed. Proceed to Step 5.

#### For variants

Defer translation of new variants until the variant stabilizes (1-2 versions). Add translations after the variant has been refined at least once.

**Expected:** All translated files have `source_commit` updated to the current commit. `npm run translation:status` exits 0.

**On failure:** If `sed` fails to match the frontmatter field, open the translated file manually and verify it has `source_commit` in its YAML frontmatter. If the field is missing, re-scaffold with `npm run translate:scaffold -- agents <agent-name> <locale>`.

### Step 5: Update Version and Metadata

Bump the `version` field in frontmatter following semantic versioning:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0.0 → 1.0.1 | Fixed unclear limitation |
| New skills added, capability expanded | Minor: 1.0.0 → 1.1.0 | Added 3 new skills from library |
| Restructured purpose, changed model | Major: 1.0.0 → 2.0.0 | Narrowed scope, upgraded to opus |

Also update:
- `updated` date to the current date
- `tags` if the agent's domain coverage changed
- `description` if the purpose is materially different
- `priority` if the agent's importance relative to others changed

**Expected:** Frontmatter `version` and `updated` reflect the magnitude and date of changes. New variants start at `"1.0.0"`.

**On failure:** If you forget to bump the version, the next evolution will have no way to distinguish the current state from the previous one. Always bump before committing.

### Step 6: Update Registry and Cross-References

#### For Refinements

Update the existing entry in `agents/_registry.yml` to match the revised frontmatter:

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

Update `description`, `tags`, `tools`, and `skills` fields to match the agent file. No count change is needed.

Update cross-references in other files if the agent's capabilities or name changed:

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### For Variants

Add the new agent to `agents/_registry.yml` in alphabetical position:

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
1. Increment `total_agents` at the top of the registry
2. Add See Also cross-reference in the original agent pointing to the variant
3. Add See Also cross-reference in the variant pointing to the original
4. The `.claude/agents/` symlink to `agents/` means the variant is automatically discoverable

**Expected:** Registry entry matches the agent file frontmatter. For variants, `total_agents` equals the actual number of agent entries.

**On failure:** Count entries with `grep -c "^  - id:" agents/_registry.yml` and verify it matches `total_agents`.

### Step 7: Validate the Evolved Agent

Run the full validation checklist:

- [ ] Agent file exists at the expected path
- [ ] YAML frontmatter parses without errors
- [ ] `version` was bumped (refinement) or set to "1.0.0" (variant)
- [ ] `updated` date reflects today
- [ ] All required sections present: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills in frontmatter match the Available Skills section
- [ ] All skill IDs exist in `skills/_registry.yml`
- [ ] Default skills (`meditate`, `heal`) are not listed unless core to methodology
- [ ] Tools list follows least-privilege principle
- [ ] Registry entry exists and matches frontmatter
- [ ] For variants: `total_agents` count matches actual count on disk
- [ ] Cross-references are bidirectional (original ↔ variant)
- [ ] `git diff` shows no accidental deletions from the original content

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

**Expected:** All checklist items pass. The evolved agent is ready to commit.

**On failure:** Address each failing item individually. The most common post-evolution issues are stale skill IDs in the Available Skills section and a forgotten `updated` date.

## Validation

- [ ] Agent file exists and has valid YAML frontmatter
- [ ] `version` field reflects the changes made
- [ ] `updated` date is current
- [ ] All sections present and internally consistent
- [ ] Frontmatter `skills` array matches the Available Skills section
- [ ] All skill IDs exist in `skills/_registry.yml`
- [ ] Default skills not listed unnecessarily
- [ ] Registry entry matches the agent file
- [ ] For variants: new entry in `agents/_registry.yml` with correct path
- [ ] For variants: `total_agents` count updated
- [ ] Cross-references are valid (no broken links in See Also)
- [ ] For refinements with translations: `source_commit` updated in all locale files
- [ ] `git diff` confirms no accidental content removal

## Common Pitfalls

- **Forgetting to bump version**: Without version bumps, there is no way to track what changed or when. Always update `version` and `updated` in frontmatter before committing.
- **Stale translations after evolution**: With 1,288+ translation files in the repo, every agent evolution triggers staleness in up to 4 locale files. Always check for existing translations with `ls i18n/*/agents/<agent-name>.md` and update `source_commit` in each, or flag them for re-translation in the commit message.
- **Skills list drift**: The frontmatter `skills` array and the `## Available Skills` section must stay in sync. Updating one without the other creates confusion for both humans and tooling.
- **Listing default skills unnecessarily**: Adding `meditate` or `heal` to the frontmatter when they are already inherited from the registry. Only list them if they are core to the agent's methodology (e.g., `mystic`, `alchemist`).
- **Tool over-provisioning during evolution**: Adding `Bash` or `WebFetch` during an evolution "just in case." Every tool addition should be justified by a specific new capability.
- **Stale See Also after variant creation**: When creating a variant, both the original and the variant need to reference each other. One-directional references leave the graph incomplete.
- **Registry entry not updated**: After changing an agent's skills, tools, or description, the `agents/_registry.yml` entry must be updated to match. Stale registry entries cause discovery and tooling failures.

## Related Skills

- `create-agent` — foundation for authoring new agents; evolve-agent assumes this was followed originally
- `evolve-skill` — the parallel procedure for evolving SKILL.md files
- `commit-changes` — commit the evolved agent with a descriptive message
