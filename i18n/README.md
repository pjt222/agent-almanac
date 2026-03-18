# Translations

This directory contains translations of agent-almanac content into multiple languages. Translations follow a parallel directory tree structure that mirrors the English source.

## Supported Locales

| Code | Language | Skills | Agents | Teams | Guides | Status |
|------|----------|--------|--------|-------|--------|--------|
| de | Deutsch (German) | 317/328 | 3/66 | 1/15 | 1/19 | Active |
| zh-CN | 简体中文 (Simplified Chinese) | 317/328 | 3/66 | 1/15 | 1/19 | Active |
| ja | 日本語 (Japanese) | 317/328 | 3/66 | 1/15 | 1/19 | Active |
| es | Español (Spanish) | 317/328 | 3/66 | 1/15 | 1/19 | Active |

## Directory Structure

```
i18n/
  _config.yml                    # Locale configuration
  README.md                      # This file
  <locale>/
    skills/<skill-name>/SKILL.md # Translated skills
    agents/<agent-name>.md       # Translated agents
    teams/<team-name>.md         # Translated teams
    guides/<guide-name>.md       # Translated guides
    translation_status.yml       # Auto-generated coverage report
```

## What Gets Translated vs Stays English

| Content Type | Translate | Keep English |
|-------------|-----------|-------------|
| **Skills** | description, section headings, prose, pitfalls, validation text | name (=ID), allowed-tools, code blocks, tags, domain, language |
| **Agents** | description, Purpose, Capabilities, Usage Scenarios, Limitations | name (=ID), tools list, model, priority, skills list |
| **Teams** | description, Purpose, Coordination Pattern prose, Usage Scenarios | name (=ID), lead, members[].id, coordination type, CONFIG block |
| **Guides** | title, description, all prose sections, troubleshooting | code blocks, command examples, file paths, YAML config examples |

## Translation Frontmatter

Every translated file includes these fields in its YAML frontmatter:

```yaml
locale: de                              # Content locale (IETF BCP 47)
source_locale: en                       # Translated from
source_commit: abc1234                  # Git short hash of source at translation time
translator: "Claude + human review"     # Attribution
translation_date: "2026-03-15"          # ISO 8601
```

These fields enable freshness tracking: when the English source changes after the `source_commit`, the translation is flagged as stale.

## Contributing a Translation

### Using the translation-campaign team

For large-scale translation work, use the [translation-campaign](../teams/translation-campaign.md) team with wave-parallel coordination. See [Running a Translation Campaign](../guides/running-a-translation-campaign.md) for the end-to-end guide.

### Using the translator agent

For individual translations, use the `translator` agent and `translate-content` skill:

```
"Use the translator agent to translate create-r-package into German"
```

### Manual workflow

1. **Scaffold**: `npm run translate:scaffold -- <content-type> <id> <locale>`
   - Copies the English source to `i18n/<locale>/<type>/<id>/`
   - Pre-fills translation frontmatter fields

2. **Translate**: Edit the scaffolded file
   - Translate all prose sections
   - Keep code blocks, IDs, tags, and tool names in English
   - Use domain-appropriate terminology

3. **Review**: Spot-check for accuracy and idiomatic phrasing

4. **Update status**: `npm run translation:status` regenerates `translation_status.yml`

## Quality Guidelines

- **Terminology consistency**: Use established translations for technical terms within each locale
- **Code blocks**: Never translate code, commands, file paths, or configuration values
- **IDs are stable**: Skill names, agent names, team names, and tag values stay in English
- **Frontmatter fields**: `name` always matches the English source (it is the ID)
- **Line count**: Translated SKILL.md files must stay under 500 lines
- **Cross-references**: Skill/agent/team references use English IDs, not translated names

## Freshness Tracking

Translations are tracked against the English source via `source_commit`. When the source file changes:

```bash
# Check which translations are stale
node scripts/check-translation-freshness.js

# Warn-only mode (used in CI)
node scripts/check-translation-freshness.js --warn
```

## Status Reports

Per-locale status files are auto-generated:

```bash
# Regenerate all translation_status.yml files
npm run translation:status
```

Each `translation_status.yml` shows coverage percentages and stale counts per content type.

## See Also

- [Running a Translation Campaign](../guides/running-a-translation-campaign.md) -- end-to-end guide for large-scale translation
- [translation-campaign](../teams/translation-campaign.md) -- wave-parallel team for systematic localization
- [translator](../agents/translator.md) -- agent for individual translations
- [translate-content](../skills/translate-content/SKILL.md) -- skill for content translation
- [Root README](../README.md) -- project overview
