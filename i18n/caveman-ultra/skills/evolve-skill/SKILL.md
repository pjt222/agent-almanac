---
name: evolve-skill
locale: caveman-ultra
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

Improve, extend, or create advanced variant of skill originally made w/ `create-skill`. Covers maintenance: assess gaps, apply improvements, bump versions, sync registry + cross-refs.

## Use When

- Procedure outdated after tooling change
- Feedback → missing pitfalls, unclear steps, weak validation
- Needs grow basic → intermediate (intermediate → advanced)
- Advanced variant needed alongside original (e.g., `create-r-package` + `create-r-package-advanced`)
- Related skills added/removed → cross-refs stale

## In

- **Required**: Path to existing SKILL.md
- **Required**: Evolution trigger (feedback, tooling, complexity, new related, discovered pitfalls)
- **Optional**: Target complexity if change (basic, intermediate, advanced)
- **Optional**: Create variant instead refine (default: refine in-place)

## Do

### Step 1: Assess Current

Read SKILL.md + eval each section vs checklist:

| Section | Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | Required fields, `description` <1024 | Missing `tags`, stale `version` |
| When to Use | 3-5 concrete triggers | Vague/overlapping |
| Inputs | Required vs optional separated | Missing defaults |
| Procedure | Each step code + Expected + On failure | Missing On failure, pseudocode not real |
| Validation | Binary pass/fail | Subjective ("clean") |
| Common Pitfalls | 3-6 w/ cause + avoidance | Too generic ("be careful") |
| Related Skills | 2-5 valid refs | Stale to renamed/removed |

```bash
# Read the skill
cat skills/<skill-name>/SKILL.md

# Check frontmatter parses
head -20 skills/<skill-name>/SKILL.md

# Verify related skills still exist
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

→ List specific gaps.

If err: no SKILL.md or no frontmatter → skill N/A, use `create-skill` from scratch.

### Step 2: Gather Reqs

Identify + categorize trigger:

| Trigger | Example | Scope |
|---------|---------|---------------|
| User feedback | "Step 3 unclear" | Refinement |
| Tooling change | New API, deprecated cmd | Refinement |
| Discovered pitfall | Common failure undocumented | Refinement |
| Complexity upgrade | Too shallow for real use | Refinement or variant |
| New related | Adjacent skill added | Refinement (cross-refs) |
| Advanced use case | Power users deeper | Variant |

Document changes + target sections before edit.

→ Concrete list (e.g., "Add On failure Step 4", "Add Step 6 edge case X", "Update Related → `new-skill`").

If err: unclear → consult user. Vague goals → vague improvements.

### Step 3: Choose Scope

Decision matrix:

| Criteria | Refinement (in-place) | Variant (new skill) |
|----------|----------------------|------------------------------|
| Skill ID | Unchanged | `<skill>-advanced` |
| File path | Same SKILL.md | New dir |
| Version bump | Patch/minor | Starts 1.0 |
| Complexity | May increase | Higher than original |
| Registry | No new entry | New entry |
| Symlinks | No change | New symlinks |
| Original | Modified directly | Left intact, gains cross-ref |

**Refinement**: Improve quality, fix gaps, modest new. Keeps identity.

**Variant**: Doubles length, diff audience, diff inputs. Original stays for simpler uses.

→ Clear decision + rationale.

If err: unsure → default refinement. Extract variant later easier than merge back.

### Step 4: Apply Changes

#### Refinements

Edit existing SKILL.md directly:

```bash
# Open for editing
# Add/revise procedure steps
# Strengthen Expected/On failure pairs
# Add tables or examples
# Update When to Use triggers
# Revise Inputs if scope changed
```

Editing rules:
- Preserve all sections — add not remove
- Step numbering sequential after insertions
- Every new/modified step → Expected + On failure
- New pitfalls at end of Common Pitfalls
- New related at end of Related Skills

#### Variants

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

→ SKILL.md (refined/variant) passes Step 1 checklist.

If err: edit breaks structure → `git diff` review, revert `git checkout -- <file>`.

### Step 4.5: Sync Translated Variants

> **Required when translations exist.** Applies human authors + AI agents. No skip — stale `source_commit` → `npm run validate:translations` false staleness across locales.

Check + update translations:

```bash
# Check for existing translations
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### If translations exist

1. Current source commit:

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. Update `source_commit` each translated:

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. Flag → re-translation in commit msg:

```
evolve(<skill-name>): <description of changes>

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

Defer translation new variants until stabilize (1-2 versions). Translating v1.0 variant that may change by v1.2 wastes effort. Add after refinement.

→ All translated `source_commit` updated. Commit msg notes locales + sections. `npm run translation:status` exits 0.

If err: `sed` fails match field → translated file non-standard. Open manually, verify `source_commit` in YAML. Missing → re-scaffold `npm run translate:scaffold`.

### Step 5: Version + Metadata

Bump `version` semver:

| Change | Bump | Example |
|-------------|-------------|---------|
| Typo/wording | Patch: 1.0 → 1.1 | Fixed unclear sentence |
| New step/pitfall/table | Minor: 1.0 → 2.0 | Added Step 7 edge case |
| Restructured, inputs changed | Major: 1.0 → 2.0 | Reorganized 5 → 8 steps |

Also update:
- `complexity` if scope expanded (basic → intermediate)
- `tags` if coverage changed
- `description` if scope materially diff

→ `version` reflects magnitude. New variants start `"1.0"`.

If err: forget bump → no track. Always bump before commit.

### Step 6: Registry + Cross-Refs

#### Refinements

No registry changes (path unchanged). Update cross-refs only if Related Skills changed in other skills:

```bash
# Check if any skill references the evolved skill
grep -r "<skill-name>" skills/*/SKILL.md
```

#### Variants

Add new skill to `skills/_registry.yml`:

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

Then:
1. Increment `total_skills` top of registry
2. Add Related Skills in original → variant
3. Add Related Skills in variant → original
4. Symlinks for slash command discovery:

```bash
# Project-level
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

→ Registry `total_skills` = `find skills -name SKILL.md | wc -l`. Cross-refs bidirectional.

If err: count wrong → `find skills -name SKILL.md | wc -l` get truth + correct. Broken symlinks → `readlink -f` debug.

### Step 7: Validate

Full checklist:

- [ ] SKILL.md exists expected path
- [ ] YAML frontmatter parses
- [ ] `version` bumped (refinement) or "1.0" (variant)
- [ ] All sections: When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills
- [ ] Every step has Expected + On failure
- [ ] Related Skills ref valid existing
- [ ] Registry entry (variants) correct path
- [ ] `total_skills` matches actual disk
- [ ] Symlinks resolve (variants)
- [ ] `git diff` no accidental deletions
- [ ] Refinements w/ translations: `source_commit` updated or flagged re-sync

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

→ All pass. Ready to commit.

If err: address each. Most common: stale `total_skills` — always verify last.

## Check

- [ ] SKILL.md exists + valid YAML
- [ ] `version` reflects changes
- [ ] Every step has Expected + On failure
- [ ] Related Skills valid (no broken)
- [ ] Registry `total_skills` matches disk
- [ ] Variants: new entry in `_registry.yml` correct path
- [ ] Variants: symlinks at `.claude/skills/` + `~/.claude/skills/`
- [ ] `git diff` no accidental removal
- [ ] Refinements w/ translations: `source_commit` updated or flagged

## Traps

- **Forget version bump**: No track. Always `version` before commit.
- **Accidental deletion**: Restructure → drop On failure or table row. Review `git diff` before commit.
- **Stale cross-refs**: Variant → both original + variant reference each other. One-directional → incomplete graph.
- **Registry count drift**: Variant → increment `total_skills`. Forget → validation failures elsewhere.
- **Stale translations post-evolution**: 1,288 translations → every skill evolution → up to 4 locale files stale. Check `ls i18n/*/skills/<skill-name>/SKILL.md` + update `source_commit` or flag re-translation. Skip → `npm run validate:translations` stale warnings.
- **Scope creep in refinement**: Refinement doubling length → probably variant. >3 new steps → reconsider Step 3 decision.
- **`git mv` on NTFS (WSL)**: `/mnt/` paths, `git mv` for dirs → broken permissions (`d?????????`). Use `mkdir -p` + copy + `git rm` old. See [env guide](../../guides/setting-up-your-environment.md) troubleshooting.

## →

- `create-skill` — foundation new skills; evolve-skill assumes this followed
- `commit-changes` — commit evolved skill w/ descriptive msg
- `configure-git-repository` — version-controlled changes
- `security-audit-codebase` — review for accidentally included secrets
