---
name: evolve-agent
locale: caveman-ultra
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

Improve, extend, or create advanced variant of agent originally made w/ `create-agent`. Covers maintenance: assess gaps, apply targeted improvements, bump versions, sync registry + cross-refs.

## Use When

- Skills list outdated after new skills added
- User feedback → capability gaps, unclear purpose, weak examples
- Tool reqs changed (new MCP, tool removed, privilege reduction)
- Scope needs sharpen — overlaps or too broad
- Advanced variant needed alongside original (e.g., `r-developer` + `r-developer-advanced`)
- Related agents/teams added → See Also stale

## In

- **Required**: Path to existing agent file (e.g., `agents/r-developer.md`)
- **Required**: Evolution trigger (feedback, new skills, tool change, overlap, team integration, limitations)
- **Optional**: Version bump magnitude (patch, minor, major)
- **Optional**: Create variant instead of refine in-place (default: refine in-place)

## Do

### Step 1: Assess Current

Read existing + eval each section vs quality checklist `guides/agent-best-practices.md`:

| Section | Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | Required fields (`name`, `description`, `tools`, `model`, `version`, `author`) | Missing `tags`, stale `version`, wrong `priority` |
| Purpose | Specific problem, not "helps with X" | Vague/overlapping |
| Capabilities | Concrete, verifiable, bold lead-ins | Generic ("handles development"), no grouping |
| Available Skills | Matches frontmatter, IDs in registry | Stale IDs, missing new, lists defaults unnecessarily |
| Usage Scenarios | 2-3 realistic + invocation | Placeholder, unrealistic |
| Examples | User req + agent behavior | Missing/trivial |
| Limitations | 3-5 honest constraints | Too few/vague/missing |
| See Also | Valid cross-refs | Stale links |

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

→ List specific gaps by section.

If err: no file or no frontmatter → skill N/A, use `create-agent` from scratch.

### Step 2: Gather Reqs

Identify + categorize trigger:

| Trigger | Example | Scope |
|---------|---------|---------------|
| User feedback | "Missed XSS in review" | Add skill/capability |
| New skills | Library gained `analyze-api-security` | Update skills list |
| Tool change | New MCP available | Add tools/mcp_servers |
| Scope overlap | 2 agents claim "code review" | Sharpen purpose + limitations |
| Team integration | Added to new team | Update See Also, verify capabilities |
| Model upgrade | Deeper reasoning needed | Change model field |
| Privilege reduction | Bash but only reads | Remove unnecessary tools |

Document changes + target sections before edit:

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

→ Concrete list mapped to sections.

If err: unclear → consult user. Vague goals → vague improvements.

### Step 3: Choose Scope

Decision matrix refine in-place vs variant:

| Criteria | Refinement (in-place) | Advanced Variant (new) |
|----------|----------------------|------------------------------|
| Agent ID | Unchanged | New: `<agent>-advanced` or `<agent>-<specialty>` |
| File path | Same `.md` | New file in `agents/` |
| Version bump | Patch/minor | Starts 1.0.0 |
| Model | May change | Often higher (sonnet → opus) |
| Registry | Update existing | New entry |
| Original | Modified directly | Left intact, gains See Also |

**Refinement**: Update skills, fix docs, sharpen scope, adjust tools. Keeps identity.

**Variant**: Evolved version serves diff audience, needs diff model, or capabilities make original too broad. Original stays for simpler uses.

→ Clear decision + rationale.

If err: unsure → default refinement. Extract variant later easier than merge back.

### Step 4: Apply Changes

#### Refinements

Edit existing directly:

- **Frontmatter**: Update `skills`, `tools`, `tags`, `model`, `priority`, `mcp_servers`
- **Purpose/Capabilities**: Revise for new scope/functionality
- **Available Skills**: Add new + descriptions, remove deprecated
- **Usage Scenarios**: Add/revise for new capabilities
- **Limitations**: Remove obsolete, add honest new
- **See Also**: Update cross-refs

Editing rules:
- Preserve all sections — add not remove
- Sync Available Skills w/ frontmatter `skills`
- No default skills (`meditate`, `heal`) in frontmatter unless core methodology
- Verify each ID: `grep "id: skill-name" skills/_registry.yml`

#### Variants

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

→ Agent file (refined/variant) passes Step 1 checklist.

If err: edit breaks structure → `git diff` review, revert via `git checkout -- <file>`.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** Applies to human authors + AI agents. No skip — stale `source_commit` → `npm run validate:translations` false staleness across locales.

Check + update translations:

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### If translations exist

1. Current source commit:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` each translated:

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag files → re-translation in commit msg:

```
evolve(<agent-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. Regenerate status:

```bash
npm run translation:status
```

#### If no translations exist

No action. Proceed Step 5.

#### Variants

Defer translation of new variants until stabilize (1-2 versions). Translations after ≥1 refinement.

→ All translated `source_commit` updated. `npm run translation:status` exits 0.

If err: `sed` fails match frontmatter field → open manually, verify `source_commit` in YAML. Missing → re-scaffold `npm run translate:scaffold -- agents <agent-name> <locale>`.

### Step 5: Version + Metadata

Bump `version` semver:

| Change | Bump | Example |
|-------------|-------------|---------|
| Typo/wording | Patch: 1.0.0 → 1.0.1 | Fixed unclear limitation |
| New skills, capability expanded | Minor: 1.0.0 → 1.1.0 | Added 3 new skills |
| Restructured, model change | Major: 1.0.0 → 2.0.0 | Narrowed scope, opus |

Also update:
- `updated` date = today
- `tags` if domain coverage changed
- `description` if purpose materially diff
- `priority` if importance rel changed

→ `version` + `updated` reflect magnitude + date. New variants start `"1.0.0"`.

If err: forget bump → no way track. Always bump before commit.

### Step 6: Registry + Cross-Refs

#### Refinements

Update existing entry in `agents/_registry.yml` → match revised frontmatter:

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

Update `description`, `tags`, `tools`, `skills` → match file. No count change.

Update cross-refs if capabilities/name changed:

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### Variants

Add new agent to registry alphabetically:

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
1. Increment `total_agents` top of registry
2. Add See Also in original → variant
3. Add See Also in variant → original
4. `.claude/agents/` symlink → auto-discoverable

→ Registry matches frontmatter. Variants: `total_agents` matches actual.

If err: count entries `grep -c "^  - id:" agents/_registry.yml` + verify matches `total_agents`.

### Step 7: Validate

Full checklist:

- [ ] File exists expected path
- [ ] YAML frontmatter parses
- [ ] `version` bumped (refinement) or "1.0.0" (variant)
- [ ] `updated` today
- [ ] All sections: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Frontmatter skills match Available Skills
- [ ] All IDs in `skills/_registry.yml`
- [ ] Defaults (`meditate`, `heal`) not listed unless core methodology
- [ ] Tools least-privilege
- [ ] Registry entry matches frontmatter
- [ ] Variants: `total_agents` matches disk
- [ ] Cross-refs bidirectional (original ↔ variant)
- [ ] `git diff` no accidental deletions

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

→ All pass. Ready to commit.

If err: address each failing item. Common: stale IDs in Available Skills, forgotten `updated` date.

## Check

- [ ] File exists + valid YAML
- [ ] `version` reflects changes
- [ ] `updated` current
- [ ] All sections consistent
- [ ] Frontmatter `skills` matches Available Skills
- [ ] All IDs in registry
- [ ] Defaults not listed unnecessarily
- [ ] Registry matches file
- [ ] Variants: new entry correct path
- [ ] Variants: `total_agents` updated
- [ ] Cross-refs valid (no broken See Also)
- [ ] Refinements w/ translations: `source_commit` updated all locales
- [ ] `git diff` no accidental removal

## Traps

- **Forget version bump**: No way track changes. Always `version` + `updated` before commit.
- **Stale translations post-evolution**: 1,288+ translation files → every agent evolution → up to 4 locale files stale. Check `ls i18n/*/agents/<agent-name>.md` + update `source_commit` or flag re-translation.
- **Skills list drift**: Frontmatter `skills` + `## Available Skills` must sync. Update one not other → confusion humans + tooling.
- **List defaults unnecessarily**: Adding `meditate`/`heal` to frontmatter when inherited. Only list if core methodology (e.g., `mystic`, `alchemist`).
- **Tool over-provisioning**: Add `Bash` or `WebFetch` "just in case" during evolution. Every addition justified by specific new capability.
- **Stale See Also after variant**: Original + variant need reference each other. One-directional → incomplete graph.
- **Registry not updated**: After skills/tools/desc change → registry must match. Stale → discovery + tooling failures.

## →

- `create-agent` — foundation for new agents; evolve-agent assumes this followed
- `evolve-skill` — parallel procedure for SKILL.md
- `commit-changes` — commit evolved agent w/ descriptive msg
