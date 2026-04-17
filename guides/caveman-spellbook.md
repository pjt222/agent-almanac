---
title: "The Caveman Spellbook"
description: "Six grunt-level compression modes for agent-almanac content — a homage to JuliusBrussee/caveman, from lite filler-stripping to extreme classical Chinese abbreviation"
category: reference
agents: [translator, project-manager, skill-reviewer, librarian]
teams: [caveman-spellbook]
skills: [translate-content]
---

# The Caveman Spellbook

Every agent-almanac skill carries words that perform rather than inform. The caveman-spellbook strips those words — across six increasingly radical compression lenses — until only substance remains. It is a homage to [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman), a vocabulary compression framework that challenged how much of written communication is load-bearing.

This guide explains the six levels, shows side-by-side examples drawn from the canonical `heal` reference translations, and explains how to invoke the [caveman-spellbook team](../teams/caveman-spellbook.md) for bulk translation waves.

## When to Use This Guide

- To understand what the six grunt levels mean and how they differ
- To read agent-almanac skills in your preferred cognitive density
- To activate the caveman-spellbook team for bulk translation of new skills
- To contribute new canonical reference translations and extend the pilot

## The Six Levels

| Locale dir | Level | Style summary |
|------------|-------|---------------|
| `caveman-lite` | Lite | Remove filler/hedging. Keep grammar, articles, full sentences. Professional but tight. |
| `caveman` | Full | Drop articles too. Fragments OK. Classic grunt pattern: `[thing] [action] [reason].` |
| `caveman-ultra` | Ultra | Abbreviations (DB/auth/config/req/res/fn/impl), causality arrows (→), one word when sufficient. |
| `wenyan-lite` | Wenyan Lite | Semi-classical Chinese. Drop modern filler (其實/基本上). Keep grammar structure. |
| `wenyan` | Wenyan Full | Full 文言文. Classical sentence patterns, verb-object order, subjects often omitted. |
| `wenyan-ultra` | Wenyan Ultra | Extreme ancient compression. Single characters where possible. Maximum terseness. |

## Side-by-Side Examples

All examples drawn from `heal` — the canonical reference skill translated in all six levels. Source: `skills/heal/SKILL.md`.

### Section heading: `## Common Pitfalls`

| Level | Rendered heading |
|-------|-----------------|
| English (source) | `## Common Pitfalls` |
| caveman-lite | `## Pitfalls` |
| caveman | `## Pitfalls` |
| caveman-ultra | `## Traps` |
| wenyan-lite | `## 常見陷阱` |
| wenyan | `## 陷` |
| wenyan-ultra | `## 忌` |

### Pitfall text: "Performative self-assessment"

**English source:**
> Performative self-assessment: Going through the motions without honest evaluation produces no value. The point is to find real drift, not to demonstrate the ability to self-reflect

**caveman-lite:**
> Performative self-assessment: Going through the motions without honest evaluation produces no value. The point is to find real drift, not to demonstrate the ability to self-reflect

**caveman:**
> Performative self-assessment: Going through motions without honest evaluation. Point is real drift, not demonstrating ability to self-reflect

**caveman-ultra:**
> Performative assessment: Motions ≠ value. Real drift matters.

**wenyan-lite:**
> 表演性自我評估：走過場而沒有誠實評估不產生任何價值。目標是發現真實偏移，而非展示自我反思能力

**wenyan:**
> 表演性自察：走過場無誠實評估不生任何價值。目的在察真實偏移，非展示自省

**wenyan-ultra:**
> 表演性察：走過場→無價值

### Marker pair: `Expected:` / `On failure:`

| Level | Expected marker | On failure marker |
|-------|-----------------|-------------------|
| English | `**Expected:**` | `**On failure:**` |
| caveman-lite | `**Got:**` | `**If fail:**` |
| caveman | `**Got:**` | `**If fail:**` |
| caveman-ultra | `→` | `If err:` |
| wenyan-lite | `**預期：**` | `**失敗時：**` |
| wenyan | `得：` | `敗則：` |
| wenyan-ultra | `得：` | `敗：` |

### When to Use entry: "Mid-session fatigue"

**English source:**
> Mid-session fatigue: responses feel formulaic, repetitive, or disconnected from the user's actual needs

**caveman-lite:**
> Mid-session fatigue: responses feel formulaic, repetitive, or disconnected from the user's needs

**caveman:**
> Mid-session fatigue: responses formulaic, repetitive, disconnected from user needs

**caveman-ultra:**
> Responses formulaic/repetitive → mid-session fatigue

**wenyan-lite:**
> 會話疲勞：回應公式化、重複，或與用戶需求脫節

**wenyan:**
> 應答陳套，與用者需求脫節乃用

**wenyan-ultra:**
> 應答陳套→用

## Style Rules

### What always survives

At every compression level, these elements are never altered:
- Code blocks (` ``` `, bash, yaml, r, etc.)
- Technical identifiers (function names, file paths, CLI flags)
- Tool names (`Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`)
- YAML frontmatter field names
- Checklist items (`- [ ]`)
- Warnings for destructive or irreversible operations (auto-clarity rule)

### Auto-clarity rule

Both caveman and wenyan levels revert to clear prose for:
- Security warnings
- Destructive action confirmations
- Multi-step sequences where fragment order risks misread

The compressed style resumes immediately after the clear part.

### Glossaries

Style rules are codified in two machine-readable glossaries:
- `i18n/glossaries/caveman.yml` — drop patterns, abbreviation table, section heading mappings per level
- `i18n/glossaries/wenyan.yml` — classical particles, sentence patterns, per-level compression targets

## Reading the Spectrum

To see the full compression spectrum for `heal`:

```bash
# English source
cat skills/heal/SKILL.md

# Six compressed versions
for locale in caveman-lite caveman caveman-ultra wenyan-lite wenyan wenyan-ultra; do
  echo "=== $locale ==="
  cat i18n/$locale/skills/heal/SKILL.md
done
```

Spot-check the wenyan-ultra version for `heal` — it compresses the 232-line English source to under 200 lines while retaining all six procedure steps, all validation items, and all pitfall entries.

## Running the Team

The [caveman-spellbook team](../teams/caveman-spellbook.md) coordinates bulk translation across all six locales in two parallel waves:

```
Activate the caveman-spellbook team for skills: <skill-1>, <skill-2>.
Each translator: read your glossary and heal canonical reference, scaffold
both skills for your locale, translate following your level's compression rules.
Translator frontmatter field: "Julius Brussee homage — caveman".
```

Wave 1 (caveman trio) and Wave 2 (wenyan trio) run in parallel. After both complete, `skill-reviewer` does a cross-level QA pass, then `librarian` runs `npm run translation:status`.

### Scale-up path

The pilot covers 3 skills (heal canonical + commit-changes + make-fire). To add more:

1. Re-activate caveman-spellbook with the new skill list
2. Each translator scaffolds and translates their locale
3. skill-reviewer verifies substance preservation
4. librarian runs `npm run translation:status`

## Troubleshooting

**wenyan-ultra loses technical substance:** Classical compression can drop load-bearing verbs. Have skill-reviewer verify all 6 procedure steps appear, even if they are single characters. The rule: every English step number must have a corresponding step at every level.

**Code blocks translated:** The translator violated the auto-clarity rule. Every code block must be identical to the English source. Fix by copying the source code block verbatim.

**caveman-ultra = caveman (no distinction):** The translator did not apply abbreviations or causality arrows. Check `i18n/glossaries/caveman.yml` ultra abbreviations table and re-translate with explicit contractions.

**wenyan-lite reads like modern Chinese:** The level target is classical register, not just simplified prose. Add classical particles (之/乃/為/其/而/於/以) at sentence boundaries and remove modern filler markers listed in the glossary.

## Related Resources

- [caveman-spellbook team](../teams/caveman-spellbook.md) — full team definition with CONFIG block and task DAG
- [translation-campaign team](../teams/translation-campaign.md) — the natural-language translation team this parallels
- [translate-content skill](../skills/translate-content/SKILL.md) — per-file translation procedure used by each translator
- [i18n glossaries](../i18n/glossaries/) — `caveman.yml` and `wenyan.yml` compression rule files
- [heal canonical references](../i18n/) — the 6 style baselines at `i18n/<locale>/skills/heal/SKILL.md`
- [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) — the vocabulary compression plugin that inspired this project
