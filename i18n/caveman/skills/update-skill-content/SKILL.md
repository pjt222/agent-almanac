---
name: update-skill-content
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Update content of existing SKILL.md to improve accuracy,
  completeness, clarity. Covers version bumping, procedure
  refinement, pitfall expansion, related skills sync. Use
  when skill procedures reference outdated tools or APIs, Common
  Pitfalls section thin, Related Skills has broken cross-references, or
  after feedback that skill procedures unclear or incomplete.
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

Improve existing SKILL.md by refining procedure steps, expanding Common Pitfalls with real failure modes, syncing Related Skills section, bumping version. Use this after skill passes format validation but has content gaps, stale references, or incomplete procedures.

## When Use

- Skill procedure steps reference outdated tools, APIs, version numbers
- Common Pitfalls section thin (fewer than 3 pitfalls) or missing real failure modes
- Related Skills section has broken cross-references or missing relevant links
- Procedure steps lack concrete code examples or have vague instructions
- New skill added to library that should be cross-referenced from existing skills
- After feedback that skill procedures unclear or incomplete

## Inputs

- **Required**: Path to SKILL.md file to update
- **Optional**: Specific section(s) to focus on (e.g., "procedure", "pitfalls", "related-skills")
- **Optional**: Source of updates (changelog, issue report, user feedback)
- **Optional**: Whether to bump version (default: yes, minor bump)

## Steps

### Step 1: Read Current Skill, Assess Content Quality

Read entire SKILL.md. Evaluate each section for completeness, accuracy.

Assessment criteria per section:
- **When to Use**: Triggers concrete, actionable? (3-5 items expected)
- **Inputs**: Types, defaults, required/optional clearly separated?
- **Procedure**: Each step has concrete code, Expected, On failure?
- **Validation**: Checklist items objectively testable? (5+ items expected)
- **Common Pitfalls**: Pitfalls specific with symptoms, fixes? (3-6 expected)
- **Related Skills**: Referenced skills exist? Obvious related skills missing?

**Got:** Clear picture of which sections need improvement. Specific gaps identified.

**If fail:** Skill cannot be read (path error)? Verify path. SKILL.md has broken YAML frontmatter? Fix frontmatter first using `review-skill-format` before attempting content updates.

### Step 2: Check for Stale References

Scan procedure steps for version-specific references, tool names, URLs, API patterns that may have changed.

Common staleness indicators:
- Specific version numbers (e.g., `v1.24`, `R 4.3.0`, `Node 18`)
- URLs that may have moved or expired
- CLI flags or command syntax changed
- Package names renamed or deprecated
- Configuration file formats evolved

```bash
# Check for version-specific references
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Check for URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**Got:** List of potentially stale references with line numbers. Each reference verified as current or flagged for update.

**If fail:** Too many references to check manual? Prioritize: procedure code blocks first (most likely to cause runtime failures), then Common Pitfalls (may reference old workarounds), then informational text.

### Step 3: Update Procedure Steps for Accuracy

For each procedure step identified as needing improvement:

1. Verify code blocks still execute correct or reflect current best practices
2. Add missing context sentences explaining *why* step needed
3. Ensure concrete commands use real paths, real flags, real output
4. Update Expected blocks to match current tool behavior
5. Update On failure blocks with current error messages, fixes

When updating code blocks, preserve original structure:
- Keep step numbering consistent
- Maintain `### Step N: Title` format
- No reorder steps unless original order was incorrect

**Got:** All procedure steps contain current, executable code. Expected/On failure blocks reflect actual current behavior.

**If fail:** Unsure whether code block still correct? Add note: `<!-- TODO: Verify this command against current version -->`. No remove working code blocks to replace with untested alternatives.

### Step 4: Expand Common Pitfalls

Review Common Pitfalls section. Expand if gaps exist.

Quality criteria for pitfalls:
- Each pitfall has **bold name** followed by specific description
- Description includes *symptom* (what goes wrong) and *fix* (how to avoid or recover)
- Pitfalls drawn from real failure modes, not hypothetical concerns
- 3-6 pitfalls = target range

Sources for new pitfalls:
- Procedure steps with complex On failure blocks (likely pitfalls)
- Related skills that warn about same tools or patterns
- Common issues reported by users of procedure

**Got:** 3-6 pitfalls, each with specific symptom and fix. No generic pitfalls like "be careful" or "test thoroughly".

**If fail:** Only 1-2 pitfalls can be identified? Acceptable for basic-complexity skills. For intermediate, advanced skills, fewer than 3 pitfalls suggests author has not fully explored failure modes — flag for future expansion.

### Step 5: Sync Related Skills Section

Verify all cross-references in Related Skills section are valid. Add any missing links.

1. For each referenced skill, verify exists:
   ```bash
   # Check if referenced skill exists
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. Search for skills that reference this skill (should be cross-linked):
   ```bash
   # Find skills that reference this skill
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. Check obvious related skills based on domain, tags
4. Use format: `- \`skill-id\` — one-line description of relationship`

**Got:** All referenced skills exist on disk. Bidirectional cross-references in place. No orphaned links.

**If fail:** Referenced skill doesn't exist? Either remove reference or note as planned future skill with comment. Many skills reference this one but not listed in Related Skills? Add most relevant 2-3.

### Step 6: Bump Version in Frontmatter

Update `metadata.version` field following semantic versioning:
- **Patch bump** (1.0 to 1.1): Typo fixes, minor clarifications, URL updates
- **Minor bump** (1.0 to 2.0): New procedure steps, significant content additions, structural changes
- **Note**: Skills use simplified two-part versioning (major.minor)

Also update any date fields if present in frontmatter.

**Got:** Version bumped appropriately. Change magnitude matches update scope.

**If fail:** Current version cannot be parsed? Set to `"1.1"`. Add comment noting version history gap.

## Checks

- [ ] All procedure steps contain current, executable code or concrete instructions
- [ ] No stale version references, URLs, or deprecated tool names remain
- [ ] Every procedure step has **Expected:** and **On failure:** blocks
- [ ] Common Pitfalls section has 3-6 specific pitfalls with symptoms, fixes
- [ ] All Related Skills cross-references point to existing skills
- [ ] Bidirectional cross-references in place for closely related skills
- [ ] Version in frontmatter bumped appropriately
- [ ] Line count remains under 500 after updates
- [ ] SKILL.md still passes `review-skill-format` validation after changes

## Pitfalls

- **Update code without testing**: Changing command in procedure step without verifying it works = worse than leaving old command. Uncertain? Add verification comment rather than untested replacement.
- **Over-expand pitfalls**: Adding 10+ pitfalls dilutes section. Keep 3-6 most impactful pitfalls. Move edge cases to `references/` file if needed.
- **Break cross-references during updates**: When renaming skill or changing domain, grep entire skills library for references to old name. Use `grep -rl "old-name" skills/` to find all occurrences.
- **Forget to bump version**: Every content update, no matter how small, should bump version. Allows consumers to detect when skill changed.
- **Scope creep into refactoring**: Content updates improve *what* skill says. Find yourself restructuring sections or extracting to `references/`? Switch to `refactor-skill-structure` skill instead.

## See Also

- `review-skill-format` — Run format validation before content updates. Ensure base structure sound
- `refactor-skill-structure` — When content updates push skill over 500 lines, refactor structure to make room
- `evolve-skill` — For deeper changes beyond content updates (e.g., creating advanced variant)
- `create-skill` — Reference canonical format spec when adding new sections or procedure steps
- `repair-broken-references` — Use for bulk cross-reference repair across entire skills library
