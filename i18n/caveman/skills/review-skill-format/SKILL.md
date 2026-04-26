---
name: review-skill-format
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review SKILL.md file for compliance with agentskills.io standard.
  Checks YAML frontmatter fields, required sections, line count limits,
  procedure step format, registry synchronization. Use when new skill
  needs format validation before merge, existing skill modified and
  requires re-validation, performing batch audit of all skills in a
  domain, or reviewing contributor skill submission in pull request.
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

Validate SKILL.md file against agentskills.io open standard. This skill checks YAML frontmatter completeness, required section presence, procedure step format (Expected/On failure blocks), line count limits, registry synchronization. Use this before merging any new or modified skill.

## When Use

- New skill authored and needs format validation before merge
- Existing skill modified and needs re-validation
- Performing batch audit of all skills in a domain
- Verifying skill created by `create-skill` meta-skill
- Reviewing contributor skill submission in a pull request

## Inputs

- **Required**: Path to SKILL.md file (e.g., `skills/setup-vault/SKILL.md`)
- **Optional**: Strictness level (`lenient` or `strict`, default: `strict`)
- **Optional**: Whether to check registry sync (default: yes)

## Steps

### Step 1: Verify File Exists and Read Content

Confirm SKILL.md file exists at expected path. Read its full content.

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

**Got:** File exists and content readable. Line count displayed.

**If fail:** File does not exist? Check path for typos. Verify skill directory exists with `ls skills/<skill-name>/`. Directory missing? Skill not created yet — use `create-skill` first.

### Step 2: Check YAML Frontmatter Fields

Parse YAML frontmatter block (between `---` delimiters). Verify all required and recommended fields present.

Required fields:
- `name` — matches directory name (kebab-case)
- `description` — under 1024 characters, starts with verb
- `license` — typically `MIT`
- `allowed-tools` — comma-separated or space-separated tool list

Recommended metadata fields:
- `metadata.author` — author name
- `metadata.version` — semantic version string
- `metadata.domain` — one of domains listed in `skills/_registry.yml`
- `metadata.complexity` — one of: `basic`, `intermediate`, `advanced`
- `metadata.language` — primary language or `multi`
- `metadata.tags` — comma-separated, 3-6 tags, includes domain name

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

**Got:** All four required fields present. All six metadata fields present. `name` matches directory name. `description` under 1024 characters.

**If fail:** Report each missing field as BLOCKING. `name` does not match directory name? Report as BLOCKING with expected value. `description` exceeds 1024 characters? Report as SUGGEST with current length.

### Step 3: Locale-Specific Validation (Translations Only)

Frontmatter contains `locale` field? File is translated SKILL.md. Perform these additional checks. No `locale` field? Skip this step.

1. **Translation frontmatter fields** — Verify these five fields present:
   - `locale` — target locale code (e.g., `de`, `ja`, `zh-CN`, `es`)
   - `source_locale` — origin locale (typically `en`)
   - `source_commit` — commit hash of English source used for translation
   - `translator` — who or what produced translation
   - `translation_date` — ISO 8601 date of translation

2. **Prose language scan** — Sample 3-5 body paragraphs (outside code blocks, frontmatter, headings). Verify prose written in target locale, not English. Ignore: code blocks, inline code, tool names, field names, file paths, English terms that have no standard translation in target language.

3. **Code block identity check** — Compare code blocks in translated file against English source at `skills/<skill-name>/SKILL.md`. Code blocks must be identical (code is never translated). Flag any code block whose content differs from English source.

```bash
# Check translation frontmatter fields
for field in "locale:" "source_locale:" "source_commit:" "translator:" "translation_date:"; do
  grep -q "^${field}\|^  ${field}" i18n/<locale>/skills/<skill-name>/SKILL.md \
    && echo "$field OK" || echo "$field MISSING"
done
```

**Got:** All five translation fields present. Body paragraphs in target locale. Code blocks match English source exactly.

**If fail:** Report missing translation fields as BLOCKING. Body paragraphs in English despite non-English `locale`? Report as BLOCKING — file has untranslated prose. Code blocks differ from English source? Report as BLOCKING — code must not be translated or modified.

### Step 4: Check Required Sections

Verify all six required sections present in skill body (after frontmatter).

Required sections:
1. `## When to Use`
2. `## Inputs`
3. `## Procedure` (with `### Step N:` sub-sections)
4. `## Validation` (may also appear as `## Validation Checklist`)
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

**Got:** All six sections present. Procedure section contains at least one `### Step` sub-heading.

**If fail:** Report each missing section as BLOCKING. Skill without all six sections is non-compliant with agentskills.io standard. Provide section template from `create-skill` meta-skill.

### Step 5: Check Procedure Step Format

Verify each procedure step follows required pattern: numbered step title, context, code block(s), **Expected:**/**On failure:** blocks.

For each `### Step N:` sub-section, check:
1. Step has descriptive title (not just "Step N")
2. At least one code block or concrete instruction exists
3. `**Expected:**` block present
4. `**On failure:**` block present

**Got:** Every procedure step has both **Expected:** and **On failure:** blocks. Steps contain concrete code or instructions, not vague descriptions.

**If fail:** Report each step missing Expected/On failure as BLOCKING. Steps contain only vague instructions ("configure the system appropriately")? Report as SUGGEST with note to add concrete commands.

### Step 6: Verify Line Count

Check that SKILL.md is within 500-line limit.

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

**Got:** Line count is 500 or fewer.

**If fail:** Over 500 lines? Report as BLOCKING. Recommend using `refactor-skill-structure` skill to extract code blocks >15 lines to `references/EXAMPLES.md`. Typical reduction: 20-40% by extracting extended examples.

### Step 7: Check Registry Synchronization

Verify skill is listed in `skills/_registry.yml` under correct domain with matching metadata.

Check:
1. Skill `id` exists under correct domain section
2. `path` matches `<skill-name>/SKILL.md`
3. `complexity` matches frontmatter
4. `description` present (may be abbreviated)
5. `total_skills` count at top of registry matches actual skill count

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

**Got:** Skill listed in registry under correct domain with matching path and metadata. Total count accurate.

**If fail:** Not found in registry? Report as BLOCKING. Provide registry entry template:
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## Checks

- [ ] SKILL.md file exists at expected path
- [ ] YAML frontmatter parses without errors
- [ ] All four required frontmatter fields present (`name`, `description`, `license`, `allowed-tools`)
- [ ] All six metadata fields present (`author`, `version`, `domain`, `complexity`, `language`, `tags`)
- [ ] `name` field matches directory name
- [ ] `description` is under 1024 characters
- [ ] All six required sections present (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills)
- [ ] Every procedure step has **Expected:** and **On failure:** blocks
- [ ] Line count is 500 or fewer
- [ ] Skill listed in `_registry.yml` with correct domain, path, metadata
- [ ] `total_skills` count in registry is accurate
- [ ] (Translations only) All five translation frontmatter fields present (`locale`, `source_locale`, `source_commit`, `translator`, `translation_date`)
- [ ] (Translations only) Body paragraphs in target locale, not English
- [ ] (Translations only) Code blocks identical to English source

## Pitfalls

- **Check frontmatter with regex only**: YAML parsing can be subtle. `description: >` multiline block looks different from `description: "inline"`. Check both patterns when searching for fields.
- **Miss the Validation section variant**: Some skills use `## Validation Checklist` instead of `## Validation`. Both acceptable; check for either heading.
- **Forget registry total count**: After add a skill to registry, `total_skills` number at top must also be incremented. Common miss in PRs.
- **Name vs title confusion**: `name` field must be kebab-case matching directory name. `# Title` heading is human-readable and can differ (e.g., name: `review-skill-format`, title: `# Review Skill Format`).
- **Lenient mode skip blockers**: Even in lenient mode, missing required sections and frontmatter fields should still be flagged. Lenient mode only relaxes style and metadata recommendations.
- **Translated skills with English prose**: File with non-English frontmatter, non-English headings, English body paragraphs passes all structural checks. Always verify body text language for translated skills — `locale` field in frontmatter signals that prose must be in target language, not English.

## See Also

- `create-skill` — Canonical format specification; use as authoritative reference for what valid SKILL.md looks like
- `update-skill-content` — After format validation passes, use this to improve content quality
- `refactor-skill-structure` — When skill fails line count check, use this to extract and reorganize
- `review-pull-request` — When reviewing PR that adds or modifies skills, combine PR review with format validation
