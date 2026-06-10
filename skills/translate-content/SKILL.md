---
name: translate-content
description: >
  Translate agent-almanac content (skills, agents, teams, guides) into a target
  locale while preserving code blocks, IDs, and technical structure. Covers
  scaffolding, frontmatter setup, prose translation, code preservation, and
  freshness tracking. Use when localizing content for a new language, updating
  stale translations after source changes, or batch-translating a domain.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: i18n
  complexity: intermediate
  language: multi
  tags: i18n, translation, localization, multilingual, l10n
---

# Translate Content

Translate English source content into a target locale, preserving technical accuracy and structural integrity.

## When to Use

- Localizing a skill, agent, team, or guide into a supported language
- Updating a translation that has become stale after source changes
- Batch-translating multiple items within a domain or content type
- Creating initial translations for a new locale

## Inputs

- **Required**: Content type — `skills`, `agents`, `teams`, or `guides`
- **Required**: Item ID — the name/identifier of the content (e.g., `create-r-package`)
- **Required**: Target locale — IETF BCP 47 code (e.g., `de`, `zh-CN`, `ja`, `es`)
- **Optional**: Batch list — multiple IDs to translate in sequence

## Procedure

### Step 1: Read the English source

1.1. Determine the source file path:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
   - Guides: `guides/<id>.md`

1.2. Read the entire source file to understand context, structure, and content.

1.3. Identify sections that must stay in English:
   - All code blocks (fenced with triple backticks)
   - Inline code (backtick-wrapped)
   - YAML frontmatter field names and technical values (`name`, `tools`, `model`, `priority`, `skills` list entries, `allowed-tools`, `tags`, `domain`, `language`)
   - File paths, URLs, command examples
   - `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` blocks in teams

**Expected:** Full understanding of source content with clear mental separation of translatable prose vs preserved technical content.

**On failure:** If source file is not found, verify the ID exists in the registry. Check for typos in the content type or ID.

### Step 2: Scaffold the translation file

2.1. Run the scaffolding script:
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. If the file already exists, read it to check whether it needs updating (stale) or is already current.

2.3. Verify the scaffolded file has translation frontmatter fields:
   - `locale` — matches target locale
   - `source_locale` — `en`
   - `source_commit` — current git short hash
   - `translator` — attribution string
   - `translation_date` — today's date

**Expected:** Scaffolded file at `i18n/<locale>/<content-type>/<id>/SKILL.md` (or `.md` for other types) with correct frontmatter.

**On failure:** If the scaffold script fails, create the directory manually with `mkdir -p` and copy the source file. Add frontmatter fields manually.

### Step 3: Translate the description

3.1. Translate the `description` field in the YAML frontmatter into the target locale.

3.2. For skills, the description is inside the top-level frontmatter. For agents/teams/guides, it is also in the top-level frontmatter.

3.3. Keep the translation concise — match the length and style of the original.

**Expected:** Description field contains an idiomatic translation that accurately conveys the original meaning.

**On failure:** If the description is ambiguous, keep it closer to literal translation rather than risk misinterpretation.

### Step 4: Translate prose sections

4.1. Translate all prose content section by section:
   - Section headings (e.g., "## When to Use" → "## Wann verwenden" in German)
   - Paragraph text
   - List item text (but not list item code/paths)
   - Table cell text (but not table cell code/values)

4.2. Preserve these elements exactly as-is:
   - Code blocks (``` fenced and indented)
   - Inline code (`backtick-wrapped`)
   - File paths and URLs
   - Skill/agent/team IDs in cross-references
   - YAML/JSON configuration examples
   - Command-line examples
   - `**Expected:**` and `**On failure:**` markers (translate the label, keep the structure)

4.3. For skills, translate the standardized section names:
   - "When to Use" → locale equivalent
   - "Inputs" → locale equivalent
   - "Procedure" → locale equivalent
   - "Validation" → locale equivalent
   - "Common Pitfalls" → locale equivalent
   - "Related Skills" → locale equivalent

4.4. For agents, translate:
   - Purpose, Capabilities, Available Skills (section name only — skill IDs stay English), Usage Scenarios, Best Practices, Examples, Limitations, See Also

4.5. For teams, translate:
   - Purpose, Team Composition (prose only — IDs stay English), Coordination Pattern, Task Decomposition, Usage Scenarios, Limitations

4.6. For guides, translate:
   - All prose sections, troubleshooting text, table descriptions
   - Keep command examples, code blocks, and configuration snippets in English

**Expected:** All prose sections translated idiomatically. Code blocks identical to English source. Cross-references use English IDs.

**On failure:** If uncertain about a technical term, keep the English term with a parenthetical translation. Example: "Staging-Bereich (Staging Area)" in German.

### Step 5: Verify structural integrity

5.1. Confirm the translated file has the same number of sections as the source.

5.2. For skills, verify all required sections are present:
   - YAML frontmatter with `name`, `description`, `allowed-tools`, `metadata`
   - When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills

5.3. Verify code blocks are identical to the English source (diff the fenced blocks).

5.4. Check line count: skills must be ≤ 500 lines.

5.5. Verify `name` field matches the English source exactly (it is the ID, never translated).

**Expected:** Structurally valid translated file that passes validation.

**On failure:** Compare section-by-section with the English source. Restore any missing sections.

### Step 5.5: Verify prose is translated

5.5.1. Sample 3 prose paragraphs from the body of the translated file. Choose paragraphs from different sections — not headings, not code blocks, not frontmatter.

5.5.2. Confirm each sampled paragraph is written in the target language, not English.

5.5.3. If any sampled paragraph is still in English, the translation is incomplete. Return to Step 4 and translate the remaining English prose before proceeding.

**Expected:** All 3 sampled prose paragraphs are in the target language, confirming the body text has been translated — not just headings and frontmatter.

**On failure:** Identify which sections still contain English prose. Translate them before continuing to Step 6.

### Step 6: Write the translated file

6.1. Write the complete translated content to the target path using the Write or Edit tool.

6.2. Verify the file exists at the expected path:
   - Skills: `i18n/<locale>/skills/<id>/SKILL.md`
   - Agents: `i18n/<locale>/agents/<id>.md`
   - Teams: `i18n/<locale>/teams/<id>.md`
   - Guides: `i18n/<locale>/guides/<id>.md`

**Expected:** Translated file written to disk at the correct path.

**On failure:** Check directory exists. Create with `mkdir -p` if needed.

## Validation

- [ ] Translated file exists at `i18n/<locale>/<type>/<id>`
- [ ] `name` field matches English source exactly
- [ ] `locale` field matches target locale
- [ ] `source_commit` field is set to a valid git short hash
- [ ] All code blocks are identical to English source
- [ ] All cross-referenced IDs (skills, agents, teams) are in English
- [ ] File is under 500 lines (for skills)
- [ ] `npm run validate:translations` reports no issues for this file
- [ ] Prose reads idiomatically in the target language

## Common Pitfalls

- **Translating code blocks**: Code, commands, and configuration must stay in English. Only translate surrounding prose.
- **Translating the `name` field**: The `name` field is the canonical ID. Never translate it.
- **Translating tag values**: Tags in `metadata.tags` stay in English for cross-locale consistency.
- **Inconsistent terminology**: Use the same translation for a technical term throughout the file and across files in the same locale.
- **Literal translation of idioms**: Translate the meaning, not the words. "Common Pitfalls" should become the locale's natural equivalent, not a word-for-word translation.
- **Missing `source_commit`**: Without this field, freshness tracking breaks. Always include it.
- **Batch throughput over quality**: Scaffolding-only output — where headings are translated but body text remains in English — is not a valid translation. Prefer fewer complete translations over many partial ones.
- **Exceeding 500 lines**: Translations may expand ~10-20% vs English. If near the limit, tighten prose rather than removing content.

## Related Skills

- [create-skill](../create-skill/SKILL.md) — understand the SKILL.md structure being translated
- [review-skill-format](../review-skill-format/SKILL.md) — validate translated skill structure
- [evolve-skill](../evolve-skill/SKILL.md) — update skills that have changed since translation
