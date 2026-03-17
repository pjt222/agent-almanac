---
name: translation-campaign
description: Wave-parallel translation team for systematic localization of all skills into supported locales (de, zh-CN, ja, es)
lead: project-manager
version: "1.1.0"
author: Philipp Thoss
created: 2026-03-16
updated: 2026-03-17
tags: [i18n, translation, localization, wave-parallel, campaign]
coordination: wave-parallel
members:
  - id: project-manager
    role: Coordinator
    responsibilities: Wave planning, domain ordering, progress tracking, quality gate enforcement
  - id: translator
    role: Translator (de)
    responsibilities: Translates skills into German using translate-content skill and glossary
  - id: translator
    role: Translator (zh-CN)
    responsibilities: Translates skills into Simplified Chinese using translate-content skill and glossary
  - id: translator
    role: Translator (ja)
    responsibilities: Translates skills into Japanese using translate-content skill and glossary
  - id: translator
    role: Translator (es)
    responsibilities: Translates skills into Spanish using translate-content skill and glossary
  - id: skill-reviewer
    role: QA Reviewer
    responsibilities: Post-wave structural validation, format compliance, line count checks
  - id: librarian
    role: Registry Auditor
    responsibilities: Registry sync, translation status tracking, cross-reference integrity
---

# Translation Campaign

A wave-parallel team for systematically translating all skills in the agent-almanac into the four supported locales (de, zh-CN, ja, es).

## Purpose

The agent-almanac has 317 skills but only 5 are translated per locale (1.6% coverage). This team coordinates a full translation campaign using wave-parallel coordination: domains form sequential waves for terminology consistency, while four translator agents work in parallel within each wave for throughput. Quality gates between waves catch terminology drift early.

## Team Composition

| Member | Agent | Role | Focus Area |
|--------|-------|------|------------|
| Coordinator | `project-manager` | Lead | Wave planning, progress tracking, quality gates |
| Translator DE | `translator` | Translator | German translations |
| Translator ZH | `translator` | Translator | Simplified Chinese translations |
| Translator JA | `translator` | Translator | Japanese translations |
| Translator ES | `translator` | Translator | Spanish translations |
| QA Reviewer | `skill-reviewer` | Reviewer | Structural validation, format compliance |
| Registry Auditor | `librarian` | Auditor | Status tracking, cross-reference integrity |

## Coordination Pattern

**Wave-parallel**: Domains are grouped into sequential waves based on terminology dependencies. Within each wave, four translator agents work in parallel (one per locale). After all locales complete a wave, a quality gate runs before the next wave begins.

```
        project-manager (Coordinator)
               |
    ┌──────────┼──────────┐
    v          v          v
  Wave 1    Wave 2  ... Wave 7
  ┌──┬──┬──┬──┐
  │de│zh│ja│es│  (parallel within wave)
  └──┴──┴──┴──┘
       │
  skill-reviewer → QA gate
  librarian → status audit
```

### Wave Sequence (7 waves, ~312 skills)

| Wave | Domains | Skills | Rationale |
|------|---------|--------|-----------|
| 1 | git, general, r-packages, review, compliance, project-management | ~51 | Foundation — establishes core terminology |
| 2 | devops, containerization, observability, mlops, mcp-integration | ~53 | Infrastructure — builds on Wave 1 terms |
| 3 | web-dev, shiny, workflow-visualization, reporting, design, visualization, blender, i18n | ~32 | Web & Visualization |
| 4 | spectroscopy, chromatography, digital-logic, electromagnetism, levitation, geometry, number-theory, stochastic-processes, theoretical-science, diffusion, citations | ~41 | Science & Mathematics |
| 5 | esoteric, morphic, alchemy, swarm | ~47 | Esoteric & Meta-Cognitive |
| 6 | defensive, bushcraft, gardening, hildegard, entomology, maintenance, animal-training, mycology, prospecting, crafting, library-science, 3d-printing, lapidary | ~46 | Specialty I |
| 7 | tcg, intellectual-property, travel, relocation, a2a-protocol, versioning, data-serialization, jigsawr, linguistics | ~29 | Specialty II |

The coordinator must refuse to start Wave N+1 until Wave N passes its quality gate. Simultaneous wave execution loses terminology consistency and skips quality gates.

## Task Decomposition

### Pre-Wave Checklist

Before starting any wave, the coordinator verifies:

- [ ] Previous wave quality gate passed (or this is Wave 1)
- [ ] Glossary updated with terms from previous wave
- [ ] Campaign progress file (`i18n/campaign-progress.yml`) updated

### Per-Wave Workflow

1. **Coordinator** verifies the pre-wave checklist, then identifies skill IDs from registry for wave domains and distributes to translators
2. **4 Translators** process domains in parallel (one per locale), each following the `translate-content` skill per file
3. **QA Reviewer** runs `review-skill-format` on every translated file after all locales complete
4. **QA Reviewer** samples 5 random files per locale and verifies body paragraphs are in the target language (not English scaffolding)
5. **Registry Auditor** runs `npm run validate:translations` + `npm run translation:status` to verify freshness and coverage
6. **Coordinator** reviews results, updates `i18n/campaign-progress.yml`, approves wave completion

### Per-File Translation Steps

Each translator follows the `translate-content` skill:
1. Read the English source
2. Scaffold the translation file (`npm run translate:scaffold`)
3. Translate the description field
4. Translate prose sections (preserve code blocks, IDs, paths)
5. Verify structural integrity (section count, line limit, code block preservation)
6. Write the translated file

### Quality Gate (between waves)

- `review-skill-format` on all new files in the wave
- Prose language check: sample 5 random files per locale, verify body paragraphs are in the target language (not English scaffolding)
- `npm run validate:translations` — 0 stale translations
- `npm run translation:status` — coverage % matches expected
- Glossary consistency check: grep section headings across all files in each locale
- Update glossaries with any new terms established during the wave

## Configuration

<!-- CONFIG:START -->
```yaml
team:
  name: translation-campaign
  lead: project-manager
  coordination: wave-parallel
  members:
    - agent: project-manager
      role: Coordinator
      subagent_type: project-manager
    - agent: translator
      role: Translator (de)
      subagent_type: translator
      config:
        locale: de
        glossary: i18n/glossaries/de.yml
    - agent: translator
      role: Translator (zh-CN)
      subagent_type: translator
      config:
        locale: zh-CN
        glossary: i18n/glossaries/zh-CN.yml
    - agent: translator
      role: Translator (ja)
      subagent_type: translator
      config:
        locale: ja
        glossary: i18n/glossaries/ja.yml
    - agent: translator
      role: Translator (es)
      subagent_type: translator
      config:
        locale: es
        glossary: i18n/glossaries/es.yml
    - agent: skill-reviewer
      role: QA Reviewer
      subagent_type: skill-reviewer
    - agent: librarian
      role: Registry Auditor
      subagent_type: librarian
  waves:
    - name: Foundation
      domains: [git, general, r-packages, review, compliance, project-management]
    - name: Infrastructure
      domains: [devops, containerization, observability, mlops, mcp-integration]
    - name: Web & Visualization
      domains: [web-dev, shiny, workflow-visualization, reporting, design, visualization, blender, i18n]
    - name: Science & Mathematics
      domains: [spectroscopy, chromatography, digital-logic, electromagnetism, levitation, geometry, number-theory, stochastic-processes, theoretical-science, diffusion, citations]
    - name: Esoteric & Meta-Cognitive
      domains: [esoteric, morphic, alchemy, swarm]
    - name: Specialty I
      domains: [defensive, bushcraft, gardening, hildegard, entomology, maintenance, animal-training, mycology, prospecting, crafting, library-science, 3d-printing, lapidary]
    - name: Specialty II
      domains: [tcg, intellectual-property, travel, relocation, a2a-protocol, versioning, data-serialization, jigsawr, linguistics]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Full Campaign Execution

```
Activate the translation-campaign team for Wave 1. Domains: git, general,
r-packages, review, compliance, project-management. Translate all skills
in these domains into de, zh-CN, ja, es using the translator agent and
translate-content skill. Use glossaries at i18n/glossaries/ for terminology
consistency. Skip existing translations. After all translations, have
skill-reviewer validate format, then run npm run validate:translations
and npm run translation:status.
```

### Scenario 2: Resume After Interruption

```
Resume the translation-campaign at Wave 3. Waves 1-2 are complete.
Check i18n/campaign-progress.yml for current state. Skip already-translated
skills (scaffold script detects existing files).
```

### Scenario 3: Single-Wave Execution

```
Run Wave 5 (esoteric, morphic, alchemy, swarm) of the translation campaign.
Follow the same per-wave workflow: translate in parallel across 4 locales,
QA review, status update.
```

## Limitations

- Translations are LLM-generated and may not sound fully natural to native speakers — human review recommended for high-visibility content
- Cannot validate domain-specific terminology accuracy (e.g., chromatography terms in Japanese)
- Large domains (>15 skills) may need sub-batching to avoid context overflow
- Source changes during the campaign will cause freshness tracking to flag stale translations — re-translate only changed files
- Wave sequencing is enforced by the coordinator, not by tooling. Simultaneous wave execution loses terminology consistency and skips quality gates
- Does not handle right-to-left languages

## See Also

- [translator agent](../agents/translator.md) — the agent persona used by each translator member
- [translate-content skill](../skills/translate-content/SKILL.md) — the procedure each translator follows
- [skill-reviewer agent](../agents/skill-reviewer.md) — QA review agent
- [librarian agent](../agents/librarian.md) — registry and status tracking agent
- [project-manager agent](../agents/project-manager.md) — coordination and planning agent
- [i18n README](../i18n/README.md) — contributor guide for translators
