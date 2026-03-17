---
title: "Running a Translation Campaign"
description: "End-to-end guide for translating all skills, agents, teams, and guides into supported locales using the translation-campaign team"
category: workflow
agents: [translator, project-manager, skill-reviewer, librarian]
teams: [translation-campaign]
skills: [translate-content, review-skill-format]
---

# Running a Translation Campaign

A practical guide for translating the agent-almanac content library into supported locales (de, zh-CN, ja, es). Covers planning, execution, quality assurance, and the lessons learned from the first full campaign (March 2026, 1,268 skill translations).

## When to Use This Guide

- You are launching a translation campaign for all or part of the content library
- You need to translate a new wave of skills after adding content to the English source
- You want to add a new locale to the supported set
- You are resuming a paused or interrupted campaign
- You need to re-translate files that failed quality checks

## Prerequisites

- The i18n infrastructure is set up: `i18n/_config.yml`, glossaries in `i18n/glossaries/`, scaffold script working
- `npm run translate:scaffold`, `npm run validate:translations`, and `npm run translation:status` all work
- Glossary files exist for each target locale at `i18n/glossaries/<locale>.yml`
- The [translation-campaign](../teams/translation-campaign.md) team definition is in place
- Familiarity with the [translate-content](../skills/translate-content/SKILL.md) skill

## Workflow Overview

The campaign uses the [translation-campaign](../teams/translation-campaign.md) team with **wave-parallel** coordination:

```
        project-manager (Coordinator)
               |
    ┌──────────┼──────────┐
    v          v          v
  Wave 1    Wave 2  ... Wave N
  ┌──┬──┬──┬──┐
  │de│zh│ja│es│  (parallel within wave)
  └──┴──┴──┴──┘
       │
  Quality Gate
  ├── skill-reviewer → format check
  ├── prose language check → sample 5 files/locale
  └── librarian → validate:translations + translation:status
```

Domains are grouped into sequential waves based on terminology dependencies. Within each wave, one translator agent per locale works in parallel. Quality gates between waves catch issues early.

## Planning the Campaign

### Step 1: Inventory

Count what needs translating:

```bash
# Total translatable items
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml
grep "total_guides" guides/_registry.yml

# Already translated per locale
for locale in de zh-CN ja es; do
  count=$(find i18n/$locale -name "*.md" | wc -l)
  echo "$locale: $count translated"
done
```

### Step 2: Define waves

Group domains into waves by terminology dependency. Earlier waves establish core terms that later waves build on. The standard wave plan:

| Wave | Name | Domains | Rationale |
|------|------|---------|-----------|
| 1 | Foundation | git, general, r-packages, review, compliance, project-management | Core terminology |
| 2 | Infrastructure | devops, containerization, observability, mlops, mcp-integration | Builds on Wave 1 |
| 3 | Web & Visualization | web-dev, shiny, workflow-visualization, reporting, design, visualization, blender, i18n | Frontend domains |
| 4 | Science & Mathematics | spectroscopy, chromatography, digital-logic, electromagnetism, levitation, geometry, number-theory, stochastic-processes, theoretical-science, diffusion, citations | Technical scientific |
| 5 | Esoteric & Meta-Cognitive | esoteric, morphic, alchemy, swarm | Prose-heavy |
| 6 | Specialty I | defensive, bushcraft, gardening, hildegard, entomology, maintenance, animal-training, mycology, prospecting, crafting, library-science, 3d-printing, lapidary | Unique terminology |
| 7 | Specialty II | tcg, intellectual-property, travel, relocation, a2a-protocol, versioning, data-serialization, jigsawr, linguistics | Remaining domains |

### Step 3: Seed glossaries

Before starting, ensure each locale has a glossary with section heading translations and common terms. Seed from any existing pilot translations:

```bash
# Check glossary exists
cat i18n/glossaries/de.yml
```

Glossaries should include: section headings (When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills), markers (Expected, On failure, Required, Optional), and common technical terms.

### Step 4: Create progress tracker

Create or update `i18n/campaign-progress.yml` with wave definitions, skill counts, and status fields. This file tracks campaign state across sessions.

## Executing a Wave

### The golden rule: sequential waves, parallel locales

**Do not launch all waves simultaneously.** The wave-parallel pattern exists because terminology must be consistent. Wave 1 establishes how you translate "commit", "branch", "pipeline" — Wave 2 builds on those decisions. If you skip quality gates, you get terminology drift and have to fix it later (which is more expensive than doing it right).

### Per-wave procedure

1. **Identify skills** for the wave's domains from the registry
2. **Launch 4 translator agents** in parallel (one per locale), each with:
   - The list of skill IDs to translate
   - The glossary path for their locale
   - Explicit instruction to translate ALL prose, not just headings
3. **Wait for all 4 to complete**
4. **Run quality gate** (see below)
5. **Commit the wave** with a descriptive message
6. **Update** `campaign-progress.yml`

### Prompting the translator agents

The prompt to each agent must be explicit about quality expectations. A prompt that says "translate these skills" may produce scaffolding-only output. Use this template:

```
You are a [language] translator. Translate the following skills fully into [language].

For each skill:
1. Read the English source at skills/<name>/SKILL.md
2. Create the translation at i18n/<locale>/skills/<name>/SKILL.md
3. Add frontmatter: locale, source_locale, source_commit, translator, translation_date
4. Translate ALL prose: title, description, every paragraph, every bullet point,
   every Expected/On failure block, every validation item, every pitfall description
5. Keep in English: name field, code blocks, tool names, tags, domain, file paths
6. Use glossary at i18n/glossaries/<locale>.yml for section headings and terms
7. After writing each file, verify the first 3 body paragraphs are in [language],
   not English. If they are English, the file is incomplete — redo it.

Skills to translate: [list]
```

The key line is #7 — the self-check. Without it, agents may optimize for throughput and produce structurally correct but untranslated files.

### Model selection

Use the most capable model available for translation agents. The motto is **"prefer slow but correct"**. During the first campaign:

- `model: opus` is recommended for all translation work
- Sonnet can produce excellent results (zh-CN was perfect) but is inconsistent across locales
- The cost of re-translating incomplete files exceeds the savings from using a faster model

## Quality Gates

Run after every wave, before starting the next.

### Structural checks

```bash
npm run validate:translations   # 0 stale translations
npm run translation:status      # Coverage matches expected
```

### Prose language check

The most important check — and the one most often skipped. Sample 5 random files per locale and verify body paragraphs are in the target language:

```bash
# Quick prose check: sample 5 files per locale
for locale in de zh-CN ja es; do
  echo "=== $locale ==="
  files=$(find i18n/$locale/skills -name "SKILL.md" | shuf | head -5)
  for f in $files; do
    skill=$(echo "$f" | sed 's|.*/skills/||; s|/SKILL.md||')
    # Show first prose paragraph after frontmatter
    line=$(sed -n '/^---$/,/^---$/d; /^#/d; /^$/d; p' "$f" | head -3)
    echo "  $skill: $line"
  done
done
```

If any body text is in English, the wave fails. Re-translate those files before proceeding.

### Automated prose detection

For larger campaigns, automate the detection of untranslated prose:

```bash
# Count files with likely-English prose in non-English locales
for locale in de zh-CN ja es; do
  count=0
  for f in i18n/$locale/skills/*/SKILL.md; do
    body=$(sed -n '/^---$/,/^---$/d; p' "$f")
    if echo "$body" | grep -qE "^(Learn|Develop|Build|Create|Set up|Deploy|Configure|Implement|Design|Write|Review|Analyze|You want)" ; then
      count=$((count + 1))
    fi
  done
  echo "$locale: $count files with likely English prose"
done
```

A count of 0 is the target. Any nonzero count requires investigation.

### Glossary consistency

After each wave, verify section headings match the glossary:

```bash
# Check German section headings are consistent
grep "^## " i18n/de/skills/*/SKILL.md | sort | uniq -c | sort -rn | head -20
```

All `## ` headings should use glossary terms (e.g., `## Wann verwenden`, not `## Wann zu verwenden` or `## When to Use`).

## Handling Interruptions

### Rate limits

If agents hit rate limits mid-wave:
1. Commit whatever was completed
2. Count remaining files per locale
3. Launch new agents for only the missing files
4. The scaffold script's "skip existing" behavior makes this idempotent

### Context overflow

If a single agent can't handle all files in one session:
1. Split the skill list into batches of 30-50
2. Process batches sequentially within each locale
3. Each batch is independent — no state carries between batches

### Quality failures

If the quality gate reveals incomplete translations:
1. Identify the specific files that failed (use the prose detection script)
2. Launch repair agents with the explicit list of files to re-translate
3. The repair prompt should reference both the existing file AND the English source
4. Re-run the quality gate after repairs

## Post-Campaign

### Update tracking files

```bash
# Update campaign progress
# Edit i18n/campaign-progress.yml: set all waves to completed

# Regenerate status files
npm run translation:status

# Final validation
npm run validate:translations
```

### Commit strategy

Use descriptive commits per wave or per phase:

```
feat(i18n): translate Wave 1 Foundation skills (de, zh-CN, ja, es)
feat(i18n): translate Wave 2 Infrastructure skills (de, zh-CN, ja, es)
fix(i18n): re-translate 57 DE skills with incomplete prose
```

### Ongoing maintenance

After the campaign, source files will change. The freshness tracking system detects this automatically:

```bash
# Check for stale translations
npm run validate:translations
```

When sources change, re-translate only the affected files using the `translate-content` skill directly — no need for a full campaign.

## Lessons Learned (March 2026 Campaign)

The first full campaign translated 317 skills into 4 locales (1,268 files). Key findings:

1. **"Translate these skills" is not enough.** Agents given a list of 160 skills and told to "translate" them may produce structurally valid files with English prose. The prompt must explicitly require full prose translation and include a self-check step.

2. **Quality varies by locale and agent instance.** The zh-CN agent produced perfect output; DE/JA/ES agents produced 36-76% incomplete files. Same model, same prompt structure, different results. Always verify.

3. **Skipping quality gates is expensive.** Launching all 7 waves simultaneously saved time upfront but required a full repair pass afterward. Sequential waves with QA would have caught issues at Wave 1 (57 files to fix) instead of Wave 7 (303 files to fix).

4. **Structural validation is necessary but not sufficient.** `npm run validate:translations` checks frontmatter, section structure, and freshness — but cannot detect English prose in a German file. Prose language checks must be manual or use heuristic detection.

5. **The heal skill caught what validation scripts missed.** Running `heal` after the campaign prompted a spot-check that revealed the prose quality issue. Build quality reflection into the workflow, not just automated checks.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Agent produces headings-only translations | Prompt lacks explicit prose requirement | Add self-check instruction to prompt (see template above) |
| Inconsistent section headings across files | Glossary not referenced or multiple conventions used | Grep headings, standardize to glossary, re-translate outliers |
| `validate:translations` reports stale files | Source changed after translation | Re-translate only the stale files using `translate-content` |
| Agent hits rate limit mid-batch | Too many files in one session | Commit progress, count remaining, launch new agent for the gap |
| Mixed-language prose ("Entwickeln an aikido practice...") | Agent ran out of context or lost the translation instruction | Re-translate the file with explicit full-prose requirement |
| Campaign progress tracker out of sync | Manual tracking not updated | Recount files on disk, update `campaign-progress.yml` |

## Related Resources

### Agents

- [translator](../agents/translator.md) -- the agent that performs translations
- [project-manager](../agents/project-manager.md) -- coordinates campaign waves
- [skill-reviewer](../agents/skill-reviewer.md) -- validates translation structure
- [librarian](../agents/librarian.md) -- tracks status and registry integrity

### Teams

- [translation-campaign](../teams/translation-campaign.md) -- the team definition for campaign execution

### Skills

- [translate-content](../skills/translate-content/SKILL.md) -- per-file translation procedure
- [review-skill-format](../skills/review-skill-format/SKILL.md) -- structural validation

### Infrastructure

- [i18n README](../i18n/README.md) -- contributor guide for translators
- [i18n config](../i18n/_config.yml) -- locale configuration
- [Glossaries](../i18n/glossaries/) -- per-locale terminology files
- [Campaign progress](../i18n/campaign-progress.yml) -- wave-by-wave tracking
