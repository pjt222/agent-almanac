---
name: translate-content
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Translate agent-almanac content (skills, agents, teams, guides) → target
  locale, preserve code blocks, IDs, tech structure. Scaffolding, frontmatter
  setup, prose translation, code preservation, freshness tracking. Use →
  localize for new lang, update stale translations after src changes,
  batch-translate domain.
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

EN src → target locale, preserve tech accuracy + structural integrity.

## Use When

- Localize skill, agent, team, guide → supported lang
- Update stale translation after src changes
- Batch-translate multi items in domain | content type
- Initial translations for new locale

## In

- **Required**: Content type — `skills`, `agents`, `teams`, `guides`
- **Required**: Item ID — name/identifier (e.g. `create-r-package`)
- **Required**: Target locale — IETF BCP 47 (e.g. `de`, `zh-CN`, `ja`, `es`)
- **Optional**: Batch list — multiple IDs in sequence

## Do

### Step 1: Read EN Src

1.1. Determine src path:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
   - Guides: `guides/<id>.md`

1.2. Read entire src to understand context, structure, content.

1.3. ID sections that stay in EN:
   - All code blocks (fenced w/ triple backticks)
   - Inline code (backtick-wrapped)
   - YAML frontmatter field names + tech values (`name`, `tools`, `model`, `priority`, `skills` list entries, `allowed-tools`, `tags`, `domain`, `language`)
   - File paths, URLs, cmd examples
   - `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` blocks in teams

**Got:** Full understanding w/ clear mental separation translatable prose vs preserved tech.

**If err:** Src not found → verify ID exists in registry. Check typos in content type | ID.

### Step 2: Scaffold Translation File

2.1. Run scaffolding script:
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. File exists → read to check stale vs current.

2.3. Verify scaffolded has translation frontmatter:
   - `locale` — matches target
   - `source_locale` — `en`
   - `source_commit` — current git short hash
   - `translator` — attribution
   - `translation_date` — today

**Got:** Scaffolded at `i18n/<locale>/<content-type>/<id>/SKILL.md` (or `.md` for others) w/ correct frontmatter.

**If err:** Scaffold script fails → create dir manually w/ `mkdir -p` + copy src. Add frontmatter manually.

### Step 3: Translate Description

3.1. Translate `description` field in YAML frontmatter → target locale.

3.2. Skills: top-level frontmatter. Agents/teams/guides: also top-level.

3.3. Concise — match length + style of original.

**Got:** Description field has idiomatic translation accurate to original meaning.

**If err:** Ambiguous → keep closer to literal vs risk misinterpretation.

### Step 4: Translate Prose Sections

4.1. Translate prose section by section:
   - Headings ("## When to Use" → "## Wann verwenden" in DE)
   - Paragraph text
   - List item text (NOT list item code/paths)
   - Table cell text (NOT table cell code/values)

4.2. Preserve exactly:
   - Code blocks (``` fenced + indented)
   - Inline code (`backtick-wrapped`)
   - File paths + URLs
   - Skill/agent/team IDs in cross-refs
   - YAML/JSON config examples
   - Cmd-line examples
   - `**Expected:**` + `**On failure:**` markers (translate label, keep structure)

4.3. Skills: translate std section names:
   - "When to Use" → locale equiv
   - "Inputs" → locale equiv
   - "Procedure" → locale equiv
   - "Validation" → locale equiv
   - "Common Pitfalls" → locale equiv
   - "Related Skills" → locale equiv

4.4. Agents: translate:
   - Purpose, Capabilities, Available Skills (section name only — skill IDs stay EN), Usage Scenarios, Best Practices, Examples, Limitations, See Also

4.5. Teams: translate:
   - Purpose, Team Composition (prose only — IDs stay EN), Coordination Pattern, Task Decomposition, Usage Scenarios, Limitations

4.6. Guides: translate:
   - All prose, troubleshooting, table descriptions
   - Keep cmd examples, code blocks, config snippets in EN

**Got:** All prose translated idiomatically. Code blocks identical to EN src. Cross-refs use EN IDs.

**If err:** Uncertain tech term → keep EN w/ parenthetical translation. e.g. "Staging-Bereich (Staging Area)" in DE.

### Step 5: Verify Structural Integrity

5.1. Same # sections as src.

5.2. Skills: verify all req sections:
   - YAML frontmatter w/ `name`, `description`, `allowed-tools`, `metadata`
   - When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills

5.3. Verify code blocks identical to EN src (diff fenced blocks).

5.4. Check line count: skills must be ≤ 500.

5.5. Verify `name` field matches EN src exact (= ID, never translated).

**Got:** Structurally valid file passes validation.

**If err:** Cmp section-by-section w/ EN src. Restore missing.

### Step 5.5: Verify Prose is Translated

5.5.1. Sample 3 prose paragraphs from body. Diff sections — not headings, not code blocks, not frontmatter.

5.5.2. Confirm each in target lang, not EN.

5.5.3. Any in EN → translation incomplete. Return Step 4, translate remaining EN before continuing.

**Got:** All 3 sampled in target lang, body text translated — not just headings + frontmatter.

**If err:** ID which sections still EN prose. Translate before Step 6.

### Step 6: Write Translated File

6.1. Write complete translated content to target path via Write | Edit.

6.2. Verify file at expected path:
   - Skills: `i18n/<locale>/skills/<id>/SKILL.md`
   - Agents: `i18n/<locale>/agents/<id>.md`
   - Teams: `i18n/<locale>/teams/<id>.md`
   - Guides: `i18n/<locale>/guides/<id>.md`

**Got:** Translated file written to disk at correct path.

**If err:** Check dir exists. Create w/ `mkdir -p` if needed.

## Check

- [ ] Translated file at `i18n/<locale>/<type>/<id>`
- [ ] `name` field matches EN src exact
- [ ] `locale` field matches target
- [ ] `source_commit` set to valid git short hash
- [ ] All code blocks identical to EN src
- [ ] All cross-ref IDs (skills, agents, teams) in EN
- [ ] File ≤ 500 lines (skills)
- [ ] `npm run validate:translations` reports no issues
- [ ] Prose reads idiomatically in target lang

## Traps

- **Translate code blocks**: Code, cmds, config stay EN. Only surrounding prose.
- **Translate `name` field**: `name` = canonical ID. Never translate.
- **Translate tag values**: Tags in `metadata.tags` stay EN for cross-locale consistency.
- **Inconsistent terminology**: Same translation for tech term throughout file + across files in same locale.
- **Literal translation of idioms**: Meaning, not words. "Common Pitfalls" → locale's natural equiv, not word-for-word.
- **Missing `source_commit`**: Without → freshness tracking breaks. Always include.
- **Batch throughput > quality**: Scaffolding-only (headings translated, body still EN) ≠ valid translation. Fewer complete > many partial.
- **Exceeding 500 lines**: Translations may expand ~10-20% vs EN. Near limit → tighten prose vs remove content.

## →

- [create-skill](../create-skill/SKILL.md) — understand SKILL.md structure being translated
- [review-skill-format](../review-skill-format/SKILL.md) — validate translated skill structure
- [evolve-skill](../evolve-skill/SKILL.md) — update skills that changed since translation
