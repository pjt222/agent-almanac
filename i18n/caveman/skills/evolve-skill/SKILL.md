---
name: evolve-skill
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing skill by refining its content in-place or creating an
  advanced variant. Covers assessing the current skill, gathering evolution
  requirements, choosing scope (refinement vs. variant), applying changes,
  updating version metadata, and synchronizing the registry and cross-references.
  Use when a skill's procedure steps are outdated, user feedback reveals gaps,
  a skill needs a complexity upgrade, an advanced variant is needed alongside
  the original, or related skills are added and cross-references are stale.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, maintenance, evolution, versioning
---

# Evolve an Existing Skill

Fix, grow, or make advanced variant of skill first made with `create-skill`. This proc covers upkeep side of skill life: check gaps, apply tight fixes, bump versions, keep registry and cross-refs in sync.

## When Use

- Skill proc steps stale or thin after tool shifts
- User feedback shows missing pitfalls, unclear steps, or weak check
- Skill need grow from basic to intermediate (or intermediate to advanced)
- Advanced variant needed next to original (e.g., `create-r-package` and `create-r-package-advanced`)
- Related skills added or removed and cross-refs are stale

## Inputs

- **Required**: Path to existing SKILL.md to evolve
- **Required**: Evolve trigger (feedback, tool change, complexity bump, new related skills, spotted pitfalls)
- **Optional**: Target complexity if changing (basic, intermediate, advanced)
- **Optional**: Make advanced variant vs refine in-place (default: refine in-place)

## Steps

### Step 1: Assess the Current Skill

Read existing SKILL.md and check each section vs quality list:

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields present, `description` < 1024 chars | Missing `tags`, stale `version` |
| When to Use | 3-5 concrete trigger conditions | Vague or overlapping triggers |
| Inputs | Required vs optional clearly separated | Missing defaults for optional inputs |
| Procedure | Each step has code + Expected + On failure | Missing On failure blocks, pseudocode instead of real commands |
| Validation | Each item is binary pass/fail | Subjective criteria ("code is clean") |
| Common Pitfalls | 3-6 with cause and avoidance | Too generic ("be careful") |
| Related Skills | 2-5 valid skill references | Stale references to renamed/removed skills |

```bash
# Read the skill
cat skills/<skill-name>/SKILL.md

# Check frontmatter parses
head -20 skills/<skill-name>/SKILL.md

# Verify related skills still exist
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

**Got:** List of specific gaps, weak spots, or fix chances.

**If fail:** SKILL.md not exist or no frontmatter? This skill not apply — use `create-skill` instead to make from scratch.

### Step 2: Gather Evolution Requirements

Spot and sort what fired evolve:

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Step 3 is unclear" | Refinement |
| Tooling change | New API version, deprecated command | Refinement |
| Discovered pitfall | Common failure not documented | Refinement |
| Complexity upgrade | Skill is too shallow for real use | Refinement or variant |
| New related skills | Adjacent skill was added | Refinement (cross-refs) |
| Advanced use case | Power users need deeper coverage | Variant |

Log specific changes needed before edit. List each change with target section.

**Got:** Concrete list of changes (e.g., "Add On failure to Step 4", "Add new Step 6 for edge case X", "Update Related Skills to include `new-skill`").

**If fail:** Changes unclear? Ask user for clarity before go on. Vague evolve goals give vague fixes.

### Step 3: Choose Evolution Scope

Use this pick matrix to decide refine in-place or make variant:

| Criteria | Refinement (in-place) | Advanced Variant (new skill) |
|----------|----------------------|------------------------------|
| Skill ID | Unchanged | New ID: `<skill>-advanced` |
| File path | Same SKILL.md | New directory |
| Version bump | Patch or minor | Starts at 1.0 |
| Complexity | May increase | Higher than original |
| Registry | No new entry | New entry added |
| Symlinks | No change | New symlinks needed |
| Original skill | Modified directly | Left intact, gains cross-reference |

**Refinement**: Pick when fixing quality, patching gaps, or adding modest new content. Skill keeps its identity.

**Variant**: Pick when evolved version would double length, change target audience, or need different inputs. Original stays as-is for simpler use cases.

**Got:** Clear pick — refine or variant — with reason.

**If fail:** Unsure? Default to refine. Can always pull variant later; harder to merge one back.

### Step 4: Apply Content Changes

#### For Refinements

Edit existing SKILL.md direct:

```bash
# Open for editing
# Add/revise procedure steps
# Strengthen Expected/On failure pairs
# Add tables or examples
# Update When to Use triggers
# Revise Inputs if scope changed
```

Follow these edit rules:
- Keep all existing sections — add content, do not remove sections
- Keep step numbering sequential after inserts
- Every new or modified step must have both Expected and On failure
- New pitfalls go at end of Common Pitfalls section
- New related skills go at end of Related Skills section

#### For Variants

```bash
# Create the variant directory
mkdir -p skills/<skill-name>-advanced/

# Copy the original as a starting point
cp skills/<skill-name>/SKILL.md skills/<skill-name>-advanced/SKILL.md

# Edit the variant:
# - Change `name` to `<skill-name>-advanced`
# - Update `description` to reflect the advanced scope
# - Raise `complexity` (e.g., intermediate → advanced)
# - Reset `version` to "1.0"
# - Add/expand procedure steps for the advanced use case
# - Reference the original in Related Skills as a prerequisite
```

**Got:** SKILL.md (refined or new variant) passes check list from Step 1.

**If fail:** Step edit breaks doc shape? Use `git diff` to review changes and revert partial edits with `git checkout -- <file>`.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** This step applies to both human authors and AI agents following this procedure. Do not skip — stale `source_commit` values cause `npm run validate:translations` to report false staleness warnings across all locales.

Check whether translations exist for evolved skill and update to match new source state:

```bash
# Check for existing translations
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### If translations exist

1. Get current source commit hash:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` in each translated file frontmatter:

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag files for re-translation by adding affected locales in commit msg:

```
evolve(<skill-name>): <description of changes>

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

Wait translation of new variants until variant stabilizes (1-2 versions). Translating v1.0 variant that may change much by v1.2 wastes effort. Add translations after variant refined at least once.

**Got:** All translated files have `source_commit` updated to current commit. Commit msg notes which locales need re-translation and which sections changed. `npm run translation:status` exits 0.

**If fail:** `sed` fails to match frontmatter field? Translated file may have odd format. Open by hand and check it has `source_commit` in its YAML frontmatter. Field missing? File not scaffolded right — re-scaffold with `npm run translate:scaffold`.

### Step 5: Update Version and Metadata

Bump `version` field in frontmatter by semver:

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0 → 1.1 | Fixed unclear sentence in Step 3 |
| New step, new pitfall, new table | Minor: 1.0 → 2.0 | Added Step 7 for edge case handling |
| Restructured procedure, changed inputs | Major: 1.0 → 2.0 | Reorganized from 5 to 8 steps |

Also update:
- `complexity` if scope grew (e.g., basic → intermediate)
- `tags` if coverage area shifted
- `description` if skill scope materially different

**Got:** Frontmatter `version` shows size of changes. New variants start at `"1.0"`.

**If fail:** Forget to bump version? Next evolve will have no way to tell current state from old. Always bump before commit.

### Step 6: Update Registry and Cross-References

#### For Refinements

No registry changes needed (path unchanged). Update cross-refs only if Related Skills shifted in other skills:

```bash
# Check if any skill references the evolved skill
grep -r "<skill-name>" skills/*/SKILL.md
```

#### For Variants

Add new skill to `skills/_registry.yml`:

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

Then:
1. Bump `total_skills` at top of registry
2. Add Related Skills cross-ref in original skill pointing to variant
3. Add Related Skills cross-ref in variant pointing to original
4. Make symlinks for slash command discovery:

```bash
# Project-level
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**Got:** Registry `total_skills` matches `find skills -name SKILL.md | wc -l`. Cross-refs two-way.

**If fail:** Registry count wrong? Run `find skills -name SKILL.md | wc -l` to get true count and fix registry. Broken symlinks? Use `readlink -f` to debug.

### Step 7: Validate the Evolved Skill

Run full check list:

- [ ] SKILL.md exists at expected path
- [ ] YAML frontmatter parses with no errors
- [ ] `version` was bumped (refinement) or set to "1.0" (variant)
- [ ] All sections present: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Every procedure step has Expected and On failure blocks
- [ ] Related Skills ref valid, existing skill names
- [ ] Registry entry exists with right path (variants only)
- [ ] `total_skills` count matches real skill count on disk
- [ ] Symlinks resolve right (variants only)
- [ ] `git diff` shows no slip deletes from original content
- [ ] For refinements with translations: `source_commit` updated or translations flagged for re-sync

```bash
# Verify frontmatter
head -20 skills/<skill-name>/SKILL.md

# Count skills on disk vs registry
find skills -name SKILL.md | wc -l
grep total_skills skills/_registry.yml

# Check symlinks (for variants)
ls -la .claude/skills/<skill-name>-advanced
readlink -f .claude/skills/<skill-name>-advanced/SKILL.md

# Review all changes
git diff
```

**Got:** All check items pass. Evolved skill ready to commit.

**If fail:** Fix each failing item one by one. Most common post-evolve issue is stale `total_skills` count — always check it last.

## Validation

- [ ] SKILL.md exists and has valid YAML frontmatter
- [ ] `version` field shows changes made
- [ ] All procedure steps have Expected and On failure blocks
- [ ] Related Skills refs valid (no broken cross-refs)
- [ ] Registry `total_skills` matches real count on disk
- [ ] For variants: new entry in `_registry.yml` with right path
- [ ] For variants: symlinks made at `.claude/skills/` and `~/.claude/skills/`
- [ ] `git diff` confirms no slip content removal
- [ ] For refinements with translations: `source_commit` updated or translations flagged for re-sync

## Pitfalls

- **Forget to bump version**: No version bump, no way to track what changed or when. Always update `version` in frontmatter before commit.
- **Slip content delete**: Restructure steps, easy to drop On failure block or table row. Always review `git diff` before commit.
- **Stale cross-refs**: Make variant, both original and variant need ref each other. One-way refs leave graph broken.
- **Registry count drift**: After make variant, `total_skills` count must bump. Forget this cause check fails in other skills that test registry.
- **Stale translations after evolve**: With 1,288 translation files in repo, every skill evolve fires staleness in up to 4 locale files. Always check for existing translations with `ls i18n/*/skills/<skill-name>/SKILL.md` and update `source_commit` in each translated file frontmatter, or flag them for re-translation in commit msg. Skip this cause `npm run validate:translations` to report stale warnings.
- **Scope creep during refine**: Refine that doubles skill length should probably be variant instead. Adding more than 3 new procedure steps? Rethink scope pick from Step 3.
- **Avoid `git mv` on NTFS-mounted paths (WSL)**: On `/mnt/` paths, `git mv` for directories can make broken perms (`d?????????`). Use `mkdir -p` + copy files + `git rm` old path instead. See [environment guide](../../guides/setting-up-your-environment.md) troubleshoot section.

## See Also

- `create-skill` — base for making new skills; evolve-skill assumes this was followed first
- `commit-changes` — commit evolved skill with clear msg
- `configure-git-repository` — version-tracked skill changes
- `security-audit-codebase` — review evolved skills for slip-added secrets
