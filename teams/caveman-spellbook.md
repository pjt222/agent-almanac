---
name: caveman-spellbook
description: Wave-parallel translation team for grunt-level localization into 6 caveman/wenyan compression levels — a homage to JuliusBrussee/caveman
lead: project-manager
version: "1.0.0"
author: Philipp Thoss
created: 2026-04-17
updated: 2026-04-17
tags: [i18n, translation, caveman, wenyan, wave-parallel, compression]
coordination: wave-parallel
members:
  - id: project-manager
    role: Spellbook Coordinator
    responsibilities: Wave planning, skill distribution, output collection, QA synthesis
  - id: translator
    role: Translator (caveman-lite)
    responsibilities: Applies lite compression — removes filler/hedging, keeps grammar and articles
  - id: translator
    role: Translator (caveman)
    responsibilities: Applies full caveman style — drops articles, fragments OK
  - id: translator
    role: Translator (caveman-ultra)
    responsibilities: Applies ultra compression — abbreviations, causality arrows, max terseness
  - id: translator
    role: Translator (wenyan-lite)
    responsibilities: Applies semi-classical Chinese — drops filler, keeps grammar structure
  - id: translator
    role: Translator (wenyan)
    responsibilities: Applies full 文言文 — classical sentence patterns, subject omission
  - id: translator
    role: Translator (wenyan-ultra)
    responsibilities: Applies extreme ancient compression — single characters where possible
  - id: skill-reviewer
    role: Cross-Level QA
    responsibilities: Reads all 6 versions of each skill, flags inconsistencies and compression violations
  - id: librarian
    role: Registry Auditor
    responsibilities: Runs npm run translation:status, verifies all 18 pilot files exist
---

# Caveman Spellbook

A wave-parallel team that translates agent-almanac content into six grunt compression levels — caveman-lite, caveman, caveman-ultra, wenyan-lite, wenyan, and wenyan-ultra — as a homage to JuliusBrussee/caveman.

## Purpose

Every agent-almanac skill carries more prose than its substance requires. The caveman-spellbook team strips that prose through six increasingly radical compression lenses — from simple filler removal to extreme classical Chinese abbreviation. The result is a spectrum of reading modes for users who prefer different cognitive densities, plus a test bed for whether structured AI procedures survive compression while retaining all technical substance.

This team executes in two parallel waves (caveman trio, wenyan trio), followed by a cross-level QA pass and a registry close-out. It does not require domain expertise beyond compression style fidelity: every translator receives a canonical reference translation of `heal` and a style glossary before touching the pilot skills.

## Team Composition

| Member | Agent | Role | Focus Area |
|--------|-------|------|------------|
| Spellbook Coordinator | `project-manager` | Lead | Wave planning, distribution, synthesis |
| Translator caveman-lite | `translator` | Translator | Lite English compression |
| Translator caveman | `translator` | Translator | Full caveman English |
| Translator caveman-ultra | `translator` | Translator | Ultra compressed English |
| Translator wenyan-lite | `translator` | Translator | Semi-classical Chinese |
| Translator wenyan | `translator` | Translator | Full 文言文 |
| Translator wenyan-ultra | `translator` | Translator | Extreme classical compression |
| Cross-Level QA | `skill-reviewer` | Reviewer | Consistency across all 6 levels |
| Registry Auditor | `librarian` | Auditor | Status files, registry sync |

## Coordination Pattern

**Wave-parallel**: Two waves of three translators each, working in parallel within their wave. Quality gate between waves. Blocked close-out after QA.

```
         project-manager (Spellbook Coordinator)
                 |
     ┌───────────┴────────────┐
     v                        v
  Wave 1 (parallel)        Wave 2 (parallel)
  ┌────────────────┐        ┌────────────────────┐
  │ caveman-lite   │        │ wenyan-lite         │
  │ caveman        │        │ wenyan              │
  │ caveman-ultra  │        │ wenyan-ultra        │
  └────────────────┘        └────────────────────┘
         |                         |
         └──────────┬──────────────┘
                    v
             skill-reviewer (Wave 3 — blocked by 1+2)
                    |
                    v
              librarian (Wave 4 — blocked by 3)
```

### Wave Sequence

| Wave | Members | Skills | Trigger |
|------|---------|--------|---------|
| 1 | caveman-lite, caveman, caveman-ultra | commit-changes, make-fire | On team activation |
| 2 | wenyan-lite, wenyan, wenyan-ultra | commit-changes, make-fire | On team activation (parallel with Wave 1) |
| 3 | skill-reviewer | All 6 versions × 2 skills = 12 files | Blocked by Wave 1+2 complete |
| 4 | librarian | All 6 locale dirs | Blocked by Wave 3 complete |

## Task Decomposition

### Pre-Wave: Coordinator Setup

Before activating waves, the coordinator:
1. Reads the pilot skill sources: `skills/commit-changes/SKILL.md`, `skills/make-fire/SKILL.md`
2. Reads the canonical reference translations in `i18n/<locale>/skills/heal/SKILL.md` for all 6 locales
3. Distributes to each translator: their glossary (`i18n/glossaries/caveman.yml` or `wenyan.yml`) + their canonical reference + both source skills
4. Activates Wave 1 and Wave 2 in parallel

### Wave 1 — Caveman Trio (parallel)

Each of the three caveman translators:
1. Reads `i18n/glossaries/caveman.yml` — compression rules for their level
2. Reads their canonical reference `i18n/<locale>/skills/heal/SKILL.md` — style baseline
3. Scaffolds: `npm run translate:scaffold -- skills commit-changes <locale>` then `npm run translate:scaffold -- skills make-fire <locale>`
4. Translates `commit-changes` applying their level's compression rules
5. Translates `make-fire` applying their level's compression rules
6. Sets `translator: "Julius Brussee homage — caveman"` in frontmatter

### Wave 2 — Wenyan Trio (parallel)

Each of the three wenyan translators:
1. Reads `i18n/glossaries/wenyan.yml` — classical Chinese rules for their level
2. Reads their canonical reference `i18n/<locale>/skills/heal/SKILL.md` — style baseline
3. Scaffolds both skills for their locale
4. Translates `commit-changes` in their classical Chinese level
5. Translates `make-fire` in their classical Chinese level
6. Sets `translator: "Julius Brussee homage — caveman"` in frontmatter

### Wave 3 — Cross-Level QA (blocked by Wave 1+2)

The skill-reviewer reads all 6 locale versions of each pilot skill and verifies:
- Technical substance preserved at every level (no step omitted, no command altered)
- Each level distinct from adjacent levels (caveman-lite ≠ caveman, caveman ≠ caveman-ultra)
- Code blocks unchanged in all locales
- Line count ≤ 500 in all files
- Frontmatter `translator` field set to "Julius Brussee homage — caveman"

### Wave 4 — Registry Close-Out (blocked by Wave 3)

The librarian:
1. Runs `npm run translation:status` — verifies 18 pilot files appear in status output
2. Verifies `i18n/_config.yml` lists all 6 caveman/wenyan locales
3. Reports coverage statistics to coordinator

## Configuration

<!-- CONFIG:START -->
```yaml
team:
  name: caveman-spellbook
  lead: project-manager
  coordination: wave-parallel
  members:
    - agent: project-manager
      role: Spellbook Coordinator
      subagent_type: project-manager
    - agent: translator
      role: Translator (caveman-lite)
      subagent_type: translator
      config:
        locale: caveman-lite
        glossary: i18n/glossaries/caveman.yml
        level: lite
        reference: i18n/caveman-lite/skills/heal/SKILL.md
    - agent: translator
      role: Translator (caveman)
      subagent_type: translator
      config:
        locale: caveman
        glossary: i18n/glossaries/caveman.yml
        level: full
        reference: i18n/caveman/skills/heal/SKILL.md
    - agent: translator
      role: Translator (caveman-ultra)
      subagent_type: translator
      config:
        locale: caveman-ultra
        glossary: i18n/glossaries/caveman.yml
        level: ultra
        reference: i18n/caveman-ultra/skills/heal/SKILL.md
    - agent: translator
      role: Translator (wenyan-lite)
      subagent_type: translator
      config:
        locale: wenyan-lite
        glossary: i18n/glossaries/wenyan.yml
        level: lite
        reference: i18n/wenyan-lite/skills/heal/SKILL.md
    - agent: translator
      role: Translator (wenyan)
      subagent_type: translator
      config:
        locale: wenyan
        glossary: i18n/glossaries/wenyan.yml
        level: full
        reference: i18n/wenyan/skills/heal/SKILL.md
    - agent: translator
      role: Translator (wenyan-ultra)
      subagent_type: translator
      config:
        locale: wenyan-ultra
        glossary: i18n/glossaries/wenyan.yml
        level: ultra
        reference: i18n/wenyan-ultra/skills/heal/SKILL.md
    - agent: skill-reviewer
      role: Cross-Level QA
      subagent_type: skill-reviewer
    - agent: librarian
      role: Registry Auditor
      subagent_type: librarian
  tasks:
    - name: setup-coordinator
      assignee: project-manager
      description: Read sources and canonical refs, distribute to translator waves
    - name: translate-caveman-lite
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in caveman-lite
      blocked_by: [setup-coordinator]
    - name: translate-caveman
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in caveman
      blocked_by: [setup-coordinator]
    - name: translate-caveman-ultra
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in caveman-ultra
      blocked_by: [setup-coordinator]
    - name: translate-wenyan-lite
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in wenyan-lite
      blocked_by: [setup-coordinator]
    - name: translate-wenyan
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in wenyan
      blocked_by: [setup-coordinator]
    - name: translate-wenyan-ultra
      assignee: translator
      description: Scaffold and translate commit-changes + make-fire in wenyan-ultra
      blocked_by: [setup-coordinator]
    - name: qa-cross-level
      assignee: skill-reviewer
      description: Read all 6 versions of each skill, verify substance preserved and levels distinct
      blocked_by: [translate-caveman-lite, translate-caveman, translate-caveman-ultra, translate-wenyan-lite, translate-wenyan, translate-wenyan-ultra]
    - name: registry-closeout
      assignee: librarian
      description: Run npm run translation:status, verify 18 pilot files appear
      blocked_by: [qa-cross-level]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Execute Pilot (3 skills × 6 locales)

```
Activate the caveman-spellbook team. Pilot skills: commit-changes and make-fire
(heal is already the canonical reference). Run Wave 1 (caveman trio) and Wave 2
(wenyan trio) in parallel. Each translator: read their glossary at
i18n/glossaries/caveman.yml or wenyan.yml, read their heal canonical reference,
scaffold both skills, then translate following the compression rules for their level.
Translator frontmatter field: "Julius Brussee homage — caveman".
After all 6 translators complete, run skill-reviewer QA, then librarian close-out.
```

### Scenario 2: Scale to New Skills

```
Activate the caveman-spellbook team for additional skills. Add skills X and Y
to the pilot list. Each translator processes their locale only. skill-reviewer
checks new files. librarian verifies updated status.
```

### Scenario 3: QA Review Only

```
Activate caveman-spellbook team for QA pass only (waves 1+2 already complete).
skill-reviewer reads all 6 locale versions of each pilot skill, reports
compression consistency and technical substance preservation.
```

## Limitations

- 9 members is near the practical maximum for wave-parallel coordination — do not add members without splitting into sub-teams
- Classical Chinese compression (wenyan/wenyan-ultra) requires careful review: automatic compression can lose technical meaning in ways that article-dropping does not
- Translations are LLM-generated; qualitative spot-check of wenyan-ultra output is strongly recommended before treating as canonical
- Pilot scope is 3 skills (heal canonical + commit-changes + make-fire); scale-up requires re-activating the team per domain
- Technical identifiers, file paths, and code blocks must remain in English at all levels — LLM translators occasionally violate this; skill-reviewer must catch it

## See Also

- [translator agent](../agents/translator.md) — agent persona for all 6 locale slots
- [translate-content skill](../skills/translate-content/SKILL.md) — per-file translation procedure
- [skill-reviewer agent](../agents/skill-reviewer.md) — QA reviewer for cross-level consistency
- [librarian agent](../agents/librarian.md) — registry and status tracking
- [project-manager agent](../agents/project-manager.md) — coordination lead
- [translation-campaign team](./translation-campaign.md) — the natural-language translation team this parallels
- [guides/caveman-spellbook.md](../guides/caveman-spellbook.md) — guide explaining the six levels with examples
- [i18n glossaries](../i18n/glossaries/) — caveman.yml and wenyan.yml style rules
