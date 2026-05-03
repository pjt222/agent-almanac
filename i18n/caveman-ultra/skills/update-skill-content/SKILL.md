---
name: update-skill-content
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Update the content of an existing SKILL.md to improve accuracy,
  completeness, and clarity. Covers version bumping, procedure
  refinement, pitfall expansion, and related skills synchronization. Use
  when a skill's procedures reference outdated tools or APIs, the Common
  Pitfalls section is thin, Related Skills has broken cross-references, or
  after receiving feedback that a skill's procedures are unclear or incomplete.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, content, update, maintenance, quality
---

# Update Skill Content

Improve existing SKILL.md → refine procedure, expand pitfalls w/ real failure modes, sync Related Skills, bump ver. Use after format passes but content has gaps, stale refs, incomplete procedures.

## Use When

- Procedure refs outdated tools|APIs|vers
- Pitfalls thin (< 3) or missing real failure modes
- Related Skills broken refs|missing relevant
- Procedure lacks concrete code|vague instructions
- New skill added → existing should cross-ref
- Feedback → procedures unclear|incomplete

## In

- **Required**: Path to SKILL.md
- **Optional**: Specific section(s) ("procedure", "pitfalls", "related-skills")
- **Optional**: Update source (changelog, issue, feedback)
- **Optional**: Bump ver (default: yes, minor)

## Do

### Step 1: Read + Assess

Read entire SKILL.md, eval each section.

Per-section criteria:
- **When to Use**: Triggers concrete + actionable? (3-5 items)
- **Inputs**: Types, defaults, required|optional clear?
- **Procedure**: Each step has concrete code, Expected, On failure?
- **Validation**: Checklist objectively testable? (5+)
- **Pitfalls**: Specific w/ symptoms + fixes? (3-6)
- **Related Skills**: Refs exist? Obvious related missing?

**Got:** Clear picture of which sections need work, specific gaps ID'd.

**If err:** Can't read (path err) → verify path. Broken YAML frontmatter → fix first via `review-skill-format` before content updates.

### Step 2: Stale Refs

Scan procedure for ver-specific refs, tool names, URLs, API patterns.

Staleness indicators:
- Specific vers (`v1.24`, `R 4.3.0`, `Node 18`)
- URLs maybe moved|expired
- CLI flags|cmd syntax changed
- Pkg names renamed|deprecated
- Config formats evolved

```bash
# Check for version-specific references
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Check for URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**Got:** List of stale refs w/ line nums. Each verified current or flagged.

**If err:** Too many to check manually → prioritize: procedure code blocks first (most likely runtime fail), then Pitfalls (old workarounds), then info text.

### Step 3: Update Procedure

Per step needing improvement:

1. Verify code blocks exec correctly|reflect best practices
2. Add missing ctx → explain *why*
3. Concrete cmds: real paths, real flags, real out
4. Update Expected → match current tool behavior
5. Update On failure → current err msgs + fixes

When updating code, preserve orig structure:
- Step numbering consistent
- `### Step N: Title` format
- No reorder unless orig wrong

**Got:** All procedure steps current + executable code. Expected/On failure reflect actual current behavior.

**If err:** Unsure code still correct → add note `<!-- TODO: Verify this command against current version -->`. No remove working code → untested replace.

### Step 4: Expand Pitfalls

Review Pitfalls, expand if gaps.

Quality:
- Each: **bold name** + specific description
- Description: *symptom* (what wrong) + *fix* (avoid|recover)
- Real failure modes, not hypothetical
- 3-6 target

Sources for new:
- Procedure steps w/ complex On failure (likely pitfalls)
- Related skills warning about same tools|patterns
- Common user-reported issues

**Got:** 3-6 pitfalls, each w/ specific symptom + fix. No generic "be careful"|"test thoroughly".

**If err:** Only 1-2 ID'd → OK for basic. Intermediate|advanced w/ < 3 → author hasn't fully explored failure modes → flag for future.

### Step 5: Sync Related Skills

Verify cross-refs valid + add missing.

1. Per ref'd skill → verify exists:
   ```bash
   # Check if referenced skill exists
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. Skills referencing this (should cross-link):
   ```bash
   # Find skills that reference this skill
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. Check obvious related → domain + tags
4. Format: `- \`skill-id\` — one-line description of relationship`

**Got:** All ref'd skills exist on disk. Bidirectional refs in place. No orphaned links.

**If err:** Ref'd doesn't exist → remove ref or note as planned future. Many skills ref this but missing from Related → add 2-3 most relevant.

### Step 6: Bump Ver

Update `metadata.version` per semver:
- **Patch** (1.0 → 1.1): Typos, minor clarifications, URL updates
- **Minor** (1.0 → 2.0): New procedure steps, significant additions, structural changes
- **Note**: Skills use simplified two-part (major.minor)

Update date fields if present.

**Got:** Ver bumped appropriately. Change magnitude matches scope.

**If err:** Current ver unparseable → set `"1.1"` + comment noting history gap.

## Check

- [ ] All procedure steps current + executable code|concrete instructions
- [ ] No stale ver refs, URLs, deprecated tool names
- [ ] Every step has **Expected:** + **On failure:** blocks
- [ ] Pitfalls 3-6 specific w/ symptoms + fixes
- [ ] All Related Skills refs → existing skills
- [ ] Bidirectional refs for closely related
- [ ] Ver bumped appropriately
- [ ] Line count < 500
- [ ] SKILL.md still passes `review-skill-format` after changes

## Traps

- **Update code w/o testing**: Changing cmd w/o verify works → worse than leaving old. Uncertain → add verify comment, not untested replace.
- **Over-expand pitfalls**: 10+ dilutes section. Keep 3-6 most impactful → edge cases → `references/`.
- **Break refs during updates**: Renaming|domain change → grep entire library. `grep -rl "old-name" skills/` finds all.
- **Forget bump**: Every update, no matter small, bump ver. Lets consumers detect changes.
- **Scope creep → refactor**: Content updates improve *what* skill says. Restructuring|extracting → switch to `refactor-skill-structure`.

## →

- `review-skill-format` — Run format validation before content updates
- `refactor-skill-structure` — Content updates push > 500 lines → refactor structure for room
- `evolve-skill` — Deeper changes beyond content updates (advanced variant)
- `create-skill` — Reference canonical format spec for new sections|steps
- `repair-broken-references` — Bulk cross-ref repair across library
