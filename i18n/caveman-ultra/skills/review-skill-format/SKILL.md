---
name: review-skill-format
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review SKILL.md → compliance w/ agentskills.io std. Checks YAML frontmatter
  fields, required sections, line count limits, proc step format, registry
  sync. Use → new skill needs format validation before merge, existing skill
  modified + needs re-validation, batch audit of all skills in domain, review
  contributor PR submission.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# Review Skill Format

Validate SKILL.md vs agentskills.io open std. Checks YAML frontmatter completeness, required section presence, proc step format (Expected/On failure blocks), line count limits, registry sync. Use before merging any new or modified skill.

## Use When

- New skill authored + needs format validation before merge
- Existing skill modified + needs re-validation
- Batch audit of all skills in domain
- Verify skill created by `create-skill` meta-skill
- Review contributor skill submission in PR

## In

- **Required**: Path to SKILL.md (e.g. `skills/setup-vault/SKILL.md`)
- **Optional**: Strictness level (`lenient` or `strict`, default `strict`)
- **Optional**: Check registry sync (default yes)

## Do

### Step 1: Verify File + Read

Confirm SKILL.md exists at expected path + read full content.

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

→ File exists + content readable. Line count displayed.

If err: file doesn't exist → check path typos. Verify dir exists `ls skills/<skill-name>/`. Dir missing → skill not created → use `create-skill` first.

### Step 2: Check Frontmatter Fields

Parse YAML frontmatter (between `---` delimiters) + verify all required + recommended fields present.

Required:
- `name` — matches dir name (kebab-case)
- `description` — < 1024 chars, starts w/ verb
- `license` — typically `MIT`
- `allowed-tools` — comma or space-separated tool list

Recommended metadata:
- `metadata.author` — author name
- `metadata.version` — semantic ver string
- `metadata.domain` — one of domains in `skills/_registry.yml`
- `metadata.complexity` — `basic`, `intermediate`, `advanced`
- `metadata.language` — primary lang or `multi`
- `metadata.tags` — comma-separated, 3-6 tags, includes domain

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

→ All 4 required fields present. All 6 metadata present. `name` matches dir. `description` < 1024 chars.

If err: report each missing as BLOCKING. `name` doesn't match dir → BLOCKING w/ expected value. `description` > 1024 chars → SUGGEST w/ current length.

### Step 3: Locale-Specific Validation (Translations Only)

Frontmatter has `locale` field → file is translated SKILL.md. Perform additional checks. No `locale` → skip.

1. **Translation frontmatter fields** — Verify these 5 present:
   - `locale` — target locale code (e.g. `de`, `ja`, `zh-CN`, `es`)
   - `source_locale` — origin (typically `en`)
   - `source_commit` — commit hash of English source used
   - `translator` — who/what produced
   - `translation_date` — ISO 8601 date

2. **Prose lang scan** — Sample 3-5 body paragraphs (outside code blocks, frontmatter, headings). Verify prose written in target locale not English. Ignore: code blocks, inline code, tool names, field names, file paths, English terms w/ no std translation.

3. **Code block identity check** — Compare code blocks in translated vs English source at `skills/<skill-name>/SKILL.md`. Code blocks must be identical (code never translated). Flag any code block content differing from English.

```bash
# Check translation frontmatter fields
for field in "locale:" "source_locale:" "source_commit:" "translator:" "translation_date:"; do
  grep -q "^${field}\|^  ${field}" i18n/<locale>/skills/<skill-name>/SKILL.md \
    && echo "$field OK" || echo "$field MISSING"
done
```

→ All 5 translation fields present. Body paragraphs in target locale. Code blocks match English source exactly.

If err: report missing translation fields as BLOCKING. Body paragraphs in English despite non-English `locale` → BLOCKING — file has untranslated prose. Code blocks differ from English source → BLOCKING — code must not be translated/modified.

### Step 4: Check Required Sections

Verify all 6 required sections in skill body (after frontmatter).

Required:
1. `## When to Use`
2. `## Inputs`
3. `## Procedure` (w/ `### Step N:` sub-sections)
4. `## Validation` (may also `## Validation Checklist`)
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# Check each required section
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done

# Validation section may use either heading
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

→ All 6 sections present. Procedure section has ≥1 `### Step` sub-heading.

If err: report each missing as BLOCKING. Skill w/o all 6 = non-compliant w/ agentskills.io. Provide section template from `create-skill`.

### Step 5: Check Procedure Step Format

Verify each proc step follows pattern: numbered title, ctx, code block(s), Expected/On failure blocks.

For each `### Step N:` sub-section, check:
1. Step has descriptive title (not just "Step N")
2. ≥1 code block or concrete instr exists
3. `**Expected:**` block present
4. `**On failure:**` block present

→ Every proc step has both Expected + On failure. Steps have concrete code or instr, not vague descriptions.

If err: report each step missing Expected/On failure as BLOCKING. Steps w/ only vague instrs ("configure system appropriately") → SUGGEST w/ note to add concrete cmds.

### Step 6: Verify Line Count

Check SKILL.md ≤ 500-line limit.

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

→ Line count ≤ 500.

If err: > 500 → BLOCKING. Recommend `refactor-skill-structure` to extract code blocks > 15 lines → `references/EXAMPLES.md`. Typical reduction: 20-40% by extracting extended examples.

### Step 7: Check Registry Sync

Verify skill listed in `skills/_registry.yml` under correct domain w/ matching metadata.

Check:
1. Skill `id` exists under correct domain section
2. `path` matches `<skill-name>/SKILL.md`
3. `complexity` matches frontmatter
4. `description` present (may be abbreviated)
5. `total_skills` count at top matches actual skill count

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

→ Skill listed under correct domain w/ matching path + metadata. Total count accurate.

If err: not found in registry → BLOCKING. Provide entry template:
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## Check

- [ ] SKILL.md file exists at expected path
- [ ] YAML frontmatter parses w/o errors
- [ ] All 4 required frontmatter present (`name`, `description`, `license`, `allowed-tools`)
- [ ] All 6 metadata present (`author`, `version`, `domain`, `complexity`, `language`, `tags`)
- [ ] `name` field matches dir name
- [ ] `description` < 1024 chars
- [ ] All 6 required sections (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- [ ] Every proc step has **Expected:** + **On failure:**
- [ ] Line count ≤ 500
- [ ] Skill listed in `_registry.yml` w/ correct domain, path, metadata
- [ ] `total_skills` count in registry accurate
- [ ] (Translations only) All 5 translation fields present (`locale`, `source_locale`, `source_commit`, `translator`, `translation_date`)
- [ ] (Translations only) Body paragraphs in target locale not English
- [ ] (Translations only) Code blocks identical to English source

## Traps

- **Check frontmatter w/ regex only**: YAML parsing subtle. `description: >` multiline diff from `description: "inline"`. Check both patterns when searching.
- **Miss Validation section variant**: Some skills use `## Validation Checklist` not `## Validation`. Both acceptable; check for either.
- **Forget registry total count**: After adding skill to registry, `total_skills` must increment. Common miss in PRs.
- **Name vs title confusion**: `name` field = kebab-case matching dir. `# Title` heading = human-readable + can differ (e.g. name: `review-skill-format`, title: `# Review Skill Format`).
- **Lenient mode skip blockers**: Even lenient, missing required sections + frontmatter still flagged. Lenient only relaxes style + metadata.
- **Translated skills w/ English prose**: File w/ non-English frontmatter, headings, English body passes all structural checks. Always verify body lang for translated — `locale` field signals prose must be in target lang not English.

## →

- `create-skill` — canonical format spec; authoritative ref for valid SKILL.md
- `update-skill-content` — after format validation passes, improve content quality
- `refactor-skill-structure` — skill fails line count → extract + reorganize
- `review-pull-request` — reviewing PR adding/modifying skills → combine w/ format validation
