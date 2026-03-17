---
name: translate-content
description: >
  Translate agent-almanac content (skills, agents, teams, guides) into a target
  locale while preserving code blocks, IDs, and technical structure. Covers
  scaffolding, frontmatter setup, prose translation, code preservation, and
  freshness tracking. Verwenden wenn localizing content for a new language, updating
  stale translations nach source changes, or batch-translating a domain.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: i18n
  complexity: intermediate
  language: multi
  tags: i18n, translation, localization, multilingual, l10n
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Inhalte uebersetzen

Translate English source content into a target locale, preserving technical accuracy and structural integrity.

## Wann verwenden

- Localizing a skill, agent, team, or guide into a supported language
- Updating a translation that has become stale nach source changes
- Batch-translating multiple items innerhalb a domain or content type
- Creating initial translations for a new locale

## Eingaben

- **Erforderlich**: Content type — `skills`, `agents`, `teams`, or `guides`
- **Erforderlich**: Item ID — the name/identifier of the content (e.g., `create-r-package`)
- **Erforderlich**: Target locale — IETF BCP 47 code (e.g., `de`, `zh-CN`, `ja`, `es`)
- **Optional**: Batch list — multiple IDs to translate in sequence

## Vorgehensweise

### Schritt 1: Lesen the English source

1.1. Bestimmen die Quelle Dateipfad:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
   - Guides: `guides/<id>.md`

1.2. Lesen the entire Quelldatei to understand context, structure, and content.

1.3. Identifizieren sections that must stay in English:
   - All code blocks (fenced with triple backticks)
   - Inline code (backtick-wrapped)
   - YAML frontmatter field names and technical values (`name`, `tools`, `model`, `priority`, `skills` list entries, `allowed-tools`, `tags`, `domain`, `language`)
   - File paths, URLs, command examples
   - `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` blocks in teams

**Erwartet:** Full understanding of source content with clear mental separation of translatable prose vs preserved technical content.

**Bei Fehler:** If Quelldatei ist nicht found, verify the ID exists in the registry. Pruefen auf typos in the content type or ID.

### Schritt 2: Scaffold the translation file

2.1. Ausfuehren the scaffolding script:
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. If die Datei already exists, read it to check whether it needs updating (stale) or is already current.

2.3. Verifizieren the scaffolded file has translation frontmatter fields:
   - `locale` — matches target locale
   - `source_locale` — `en`
   - `source_commit` — current git short hash
   - `translator` — attribution string
   - `translation_date` — today's date

**Erwartet:** Scaffolded file at `i18n/<locale>/<content-type>/<id>/SKILL.md` (or `.md` for other types) with correct frontmatter.

**Bei Fehler:** If the scaffold script fails, create das Verzeichnis manuell with `mkdir -p` and copy die Quelle file. Hinzufuegen frontmatter fields manuell.

### Schritt 3: Translate the description

3.1. Translate the `description` field in the YAML frontmatter into das Ziel locale.

3.2. For skills, the description is inside the top-level frontmatter. For agents/teams/guides, it is also in the top-level frontmatter.

3.3. Keep the translation concise — match the length and style of the original.

**Erwartet:** Description field contains an idiomatic translation that accurately conveys the original meaning.

**Bei Fehler:** If the description is ambiguous, keep it closer to literal translation anstatt risk misinterpretation.

### Schritt 4: Translate prose sections

4.1. Translate all prose content section by section:
   - Section headings (e.g., "## When to Use" → "## Wann verwenden" in German)
   - Paragraph text
   - Auflisten item text (but not list item code/paths)
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

**Erwartet:** All prose sections translated idiomatically. Code blocks identical to English source. Cross-references use English IDs.

**Bei Fehler:** If uncertain about a technical term, keep the English term with a parenthetical translation. Example: "Staging-Bereich (Staging Area)" in German.

### Schritt 5: Verifizieren structural integrity

5.1. Bestaetigen the translated file has the same number of sections as die Quelle.

5.2. For skills, verify all required sections are present:
   - YAML frontmatter with `name`, `description`, `allowed-tools`, `metadata`
   - When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills

5.3. Verifizieren code blocks are identical to the English source (diff the fenced blocks).

5.4. Check line count: skills muss ≤ 500 lines.

5.5. Verifizieren `name` field matches the English source exactly (it is the ID, never translated).

**Erwartet:** Structurally valid translated file that passes validation.

**Bei Fehler:** Vergleichen section-by-section with the English source. Wiederherstellen any missing sections.

### Schritt 6: Schreiben the translated file

6.1. Schreiben the complete translated content to das Ziel path using the Schreiben or Bearbeiten tool.

6.2. Verifizieren die Datei exists at the expected path:
   - Skills: `i18n/<locale>/skills/<id>/SKILL.md`
   - Agents: `i18n/<locale>/agents/<id>.md`
   - Teams: `i18n/<locale>/teams/<id>.md`
   - Guides: `i18n/<locale>/guides/<id>.md`

**Erwartet:** Translated file written to disk at the correct path.

**Bei Fehler:** Check directory exists. Erstellen with `mkdir -p` if needed.

## Validierung

- [ ] Translated file exists at `i18n/<locale>/<type>/<id>`
- [ ] `name` field matches English source exactly
- [ ] `locale` field matches target locale
- [ ] `source_commit` field is set to a valid git short hash
- [ ] All code blocks are identical to English source
- [ ] All cross-referenced IDs (skills, agents, teams) are in English
- [ ] File is under 500 lines (for skills)
- [ ] `npm run validate:translations` reports no issues for this file
- [ ] Prose reads idiomatically in das Ziel language

## Haeufige Stolperfallen

- **Translating code blocks**: Code, commands, and configuration must stay in English. Only translate surrounding prose.
- **Translating the `name` field**: The `name` field is the canonical ID. Never translate it.
- **Translating tag values**: Tags in `metadata.tags` stay in English for cross-locale consistency.
- **Inconsistent terminology**: Use the same translation for a technical term durchout die Datei and across files in the same locale.
- **Literal translation of idioms**: Translate the meaning, not the words. "Common Pitfalls" solltecome the locale's natural equivalent, not a word-for-word translation.
- **Missing `source_commit`**: Without this field, freshness tracking breaks. Always include it.
- **Exceeding 500 lines**: Translations may expand ~10-20% vs English. If near the limit, tighten prose anstatt removing content.

## Verwandte Skills

- [create-skill](../create-skill/SKILL.md) — understand the SKILL.md structure being translated
- [review-skill-format](../review-skill-format/SKILL.md) — validate translated skill structure
- [evolve-skill](../evolve-skill/SKILL.md) — update skills that have changed since translation
