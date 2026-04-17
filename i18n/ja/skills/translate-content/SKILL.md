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
  locale: ja
  source_locale: en
  source_commit: c7ff09ca
  translator: claude
  translation_date: "2026-03-17"
---

# コンテンツの翻訳

Translate English source content into a target locale, preserving technical accuracy and structural integrity.

## 使用タイミング

- Localizing a skill, agent, team, or guide into a supported language
- Updating a translation that has become stale after source changes
- Batch-translating multiple items within a domain or content type
- Creating initial translations for a new locale

## 入力

- **必須**: Content type — `skills`, `agents`, `teams`, or `guides`
- **必須**: Item ID — the name/identifier of the content (e.g., `create-r-package`)
- **必須**: Target locale — IETF BCP 47 code (e.g., `de`, `zh-CN`, `ja`, `es`)
- **任意**: Batch list — multiple IDs to translate in sequence

## 手順

### ステップ1: Read the English source

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

**期待結果:** Full understanding of source content with clear mental separation of translatable prose vs preserved technical content.

**失敗時:** If source file is not found, verify the ID exists in the registry. Check for typos in the content type or ID.

### ステップ2: Scaffold the translation file

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

**期待結果:** Scaffolded file at `i18n/<locale>/<content-type>/<id>/SKILL.md` (or `.md` for other types) with correct frontmatter.

**失敗時:** If the scaffold script fails, create the directory manually with `mkdir -p` and copy the source file. Add frontmatter fields manually.

### ステップ3: Translate the description

3.1. Translate the `description` field in the YAML frontmatter into the target locale.

3.2. For skills, the description is inside the top-level frontmatter. For agents/teams/guides, it is also in the top-level frontmatter.

3.3. Keep the translation concise — match the length and style of the original.

**期待結果:** Description field contains an idiomatic translation that accurately conveys the original meaning.

**失敗時:** If the description is ambiguous, keep it closer to literal translation rather than risk misinterpretation.

### ステップ4: Translate prose sections

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

**期待結果:** All prose sections translated idiomatically. Code blocks identical to English source. Cross-references use English IDs.

**失敗時:** If uncertain about a technical term, keep the English term with a parenthetical translation. Example: "Staging-Bereich (Staging Area)" in German.

### ステップ5: Verify structural integrity

5.1. Confirm the translated file has the same number of sections as the source.

5.2. For skills, verify all required sections are present:
   - YAML frontmatter with `name`, `description`, `allowed-tools`, `metadata`
   - When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills

5.3. Verify code blocks are identical to the English source (diff the fenced blocks).

5.4. Check line count: skills must be ≤ 500 lines.

5.5. Verify `name` field matches the English source exactly (it is the ID, never translated).

**期待結果:** Structurally valid translated file that passes validation.

**失敗時:** Compare section-by-section with the English source. Restore any missing sections.

### ステップ5.5: 散文が翻訳されているか確認する

5.5.1. 翻訳ファイルの本文から 3 つの散文段落をサンプリングする。異なるセクションから段落を選ぶ — 見出し、コードブロック、フロントマターを除く。

5.5.2. サンプリングした各段落が、英語ではなく対象言語で書かれていることを確認する。

5.5.3. サンプリングした段落がまだ英語の場合、翻訳は不完全である。ステップ 4 に戻り、続行する前に残りの英語散文を翻訳する。

**期待される結果:** サンプリングした 3 つの散文段落がすべて対象言語で書かれており、本文が翻訳されていることが確認される — 見出しとフロントマターだけでなく。

**失敗時:** 英語散文が残っているセクションを特定する。ステップ 6 に進む前にそれらを翻訳する。

### ステップ6: Write the translated file

6.1. Write the complete translated content to the target path using the Write or Edit tool.

6.2. Verify the file exists at the expected path:
   - Skills: `i18n/<locale>/skills/<id>/SKILL.md`
   - Agents: `i18n/<locale>/agents/<id>.md`
   - Teams: `i18n/<locale>/teams/<id>.md`
   - Guides: `i18n/<locale>/guides/<id>.md`

**期待結果:** Translated file written to disk at the correct path.

**失敗時:** Check directory exists. Create with `mkdir -p` if needed.

## バリデーション

- [ ] Translated file exists at `i18n/<locale>/<type>/<id>`
- [ ] `name` field matches English source exactly
- [ ] `locale` field matches target locale
- [ ] `source_commit` field is set to a valid git short hash
- [ ] All code blocks are identical to English source
- [ ] All cross-referenced IDs (skills, agents, teams) are in English
- [ ] File is under 500 lines (for skills)
- [ ] `npm run validate:translations` reports no issues for this file
- [ ] Prose reads idiomatically in the target language

## よくある落とし穴

- **Translating code blocks**: Code, commands, and configuration must stay in English. Only translate surrounding prose.
- **Translating the `name` field**: The `name` field is the canonical ID. Never translate it.
- **Translating tag values**: Tags in `metadata.tags` stay in English for cross-locale consistency.
- **Inconsistent terminology**: Use the same translation for a technical term throughout the file and across files in the same locale.
- **Literal translation of idioms**: Translate the meaning, not the words. "Common Pitfalls" should become the locale's natural equivalent, not a word-for-word translation.
- **Missing `source_commit`**: Without this field, freshness tracking breaks. Always include it.
- **Exceeding 500 lines**: Translations may expand ~10-20% vs English. If near the limit, tighten prose rather than removing content.

## 関連スキル

- [create-skill](../create-skill/SKILL.md) — understand the SKILL.md structure being translated
- [review-skill-format](../review-skill-format/SKILL.md) — validate translated skill structure
- [evolve-skill](../evolve-skill/SKILL.md) — update skills that have changed since translation
- **品質よりバッチスループット**: 見出しは翻訳されているが本文が英語のままのスキャフォールドのみの出力は有効な翻訳ではない。多くの部分的な翻訳より少ない完全な翻訳を優先する。
