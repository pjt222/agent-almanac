---
name: entomology
description: Multi-agent entomology team combining conservation ecology, systematic taxonomy, and citizen science for comprehensive insect study
lead: conservation-entomologist
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-20
updated: 2026-02-20
tags: [entomology, conservation, taxonomy, citizen-science, ecology, insects]
coordination: hub-and-spoke
members:
  - id: conservation-entomologist
    role: Lead
    responsibilities: Receives requests, distributes tasks, provides conservation context, synthesizes findings with ecological framing
  - id: taxonomic-entomologist
    role: Taxonomic Specialist
    responsibilities: Handles identification to species level, specimen documentation, morphological key work, nomenclature verification
  - id: citizen-entomologist
    role: Community Science Specialist
    responsibilities: Creates accessible documentation, guides citizen science submissions, translates technical findings for public audiences
---

# Entomology Team

A three-agent team combining conservation ecology, systematic taxonomy, and citizen science perspectives for comprehensive insect study. The lead (conservation-entomologist) orchestrates parallel specialist work across taxonomic rigor and public accessibility, then synthesizes findings with an ecological framing.

## Purpose

Insect study benefits from multiple perspectives that a single agent cannot provide simultaneously. Conservation context supplies population-level thinking -- why a species matters, where it fits in the ecosystem, and what threats it faces. Taxonomic rigor ensures accurate identification down to the species level using morphological keys and formal nomenclature. Community engagement enables data collection at scale through citizen science platforms like iNaturalist and BugGuide.

This team ensures that every interaction considers three dimensions:

- **Ecological significance**: population trends, habitat requirements, pollinator networks, conservation status
- **Taxonomic accuracy**: correct identification, proper nomenclature, specimen-grade documentation
- **Public accessibility**: plain-language explanations, citizen science submission guidance, educational framing

By coordinating these perspectives, the team delivers thorough entomological work that is scientifically sound, ecologically contextualized, and accessible to non-specialists.

## Team Composition

| Member | Agent | Role | Focus Areas |
|--------|-------|------|-------------|
| Lead | `conservation-entomologist` | Lead | Ecological assessment, conservation framing, final synthesis |
| Taxonomy | `taxonomic-entomologist` | Taxonomic Specialist | Species identification, morphological keys, specimen protocols |
| Community | `citizen-entomologist` | Community Science Specialist | Accessible documentation, citizen science, public education |

## Coordination Pattern

Hub-and-spoke: the conservation-entomologist lead distributes tasks, each specialist works independently, and the lead collects and synthesizes all findings.

```
        conservation-entomologist (Lead)
               /              \
              /                \
  taxonomic-entomologist   citizen-entomologist
```

**Flow:**

1. Lead analyzes request and determines scope (identification, survey, education, or mixed)
2. Taxonomic specialist handles identification and specimen work
3. Citizen specialist handles documentation and accessibility
4. Lead synthesizes findings with conservation framing and ecological context

## Task Decomposition

### Phase 1: Setup (Lead)
The conservation-entomologist lead examines the request and creates targeted tasks:

- Determine request type: identification, survey, documentation, or educational
- Assess ecological context: habitat, region, season, conservation relevance
- Create scoped tasks for each specialist based on what the request requires

### Phase 2: Parallel Specialist Work

**taxonomic-entomologist** tasks:
- Identify specimens using dichotomous keys and morphological analysis
- Verify nomenclature against current taxonomic literature
- Document diagnostic features (wing venation, mouthparts, antennae)
- Flag specimens requiring closer examination or expert referral

**citizen-entomologist** tasks:
- Create plain-language descriptions suitable for non-specialists
- Prepare citizen science submission guidance (iNaturalist, BugGuide)
- Develop educational context: life cycle, ecological role, interesting behaviors
- Suggest follow-up observation activities for community participants

### Phase 3: Synthesis (Lead)
The conservation-entomologist lead:
- Collects specialist findings into a unified report
- Adds conservation status and ecological significance
- Resolves any conflicts between taxonomic precision and accessible language
- Produces a final assessment covering identification, ecology, and next steps

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: entomology
  lead: conservation-entomologist
  coordination: hub-and-spoke
  members:
    - agent: conservation-entomologist
      role: Lead
      subagent_type: conservation-entomologist
    - agent: taxonomic-entomologist
      role: Taxonomic Specialist
      subagent_type: taxonomic-entomologist
    - agent: citizen-entomologist
      role: Community Science Specialist
      subagent_type: citizen-entomologist
  tasks:
    - name: assess-ecological-context
      assignee: conservation-entomologist
      description: Analyze ecological significance, habitat context, and conservation relevance
    - name: identify-and-document
      assignee: taxonomic-entomologist
      description: Perform species-level identification using morphological keys and nomenclature verification
    - name: create-accessible-output
      assignee: citizen-entomologist
      description: Produce plain-language documentation, citizen science guidance, and educational framing
    - name: synthesize-report
      assignee: conservation-entomologist
      description: Collect all findings and produce unified report with conservation framing
      blocked_by: [assess-ecological-context, identify-and-document, create-accessible-output]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Unknown Insect Identification
A user finds an unfamiliar insect and wants to know what it is:

```
User: I found this insect in my garden in central Germany — it has metallic green wings and long antennae
```

The taxonomic specialist narrows identification using morphological features, the citizen specialist explains the species in accessible terms, and the lead adds ecological context about the species' role and local conservation status.

### Scenario 2: Local Biodiversity Survey
A user wants to assess insect diversity in a specific habitat:

```
User: Help me design a pollinator survey for our community meadow restoration project
```

The lead designs the survey framework, the taxonomic specialist provides identification protocols for expected taxa, and the citizen specialist creates field sheets and participation guides for volunteer surveyors.

### Scenario 3: School or Community Science Project
A teacher or community organizer wants to run an insect observation activity:

```
User: I want to run a week-long insect observation project with my high school biology class
```

The citizen specialist designs age-appropriate observation protocols, the taxonomic specialist provides simplified identification resources for common local orders, and the lead frames the project around ecological concepts and conservation awareness.

## Limitations

- Identification accuracy depends on the quality of provided descriptions or images; ambiguous cases require physical specimens
- Conservation status assessments reflect general knowledge and may not cover hyper-local regulations
- The team does not replace professional taxonomic determination for publication-grade work
- Citizen science platform guidance covers general workflows; specific platform changes may not be current
- Best suited for terrestrial insects; aquatic entomology and arachnids fall outside core expertise

## See Also

- [conservation-entomologist](../agents/conservation-entomologist.md) -- Lead agent with ecological and conservation expertise
- [taxonomic-entomologist](../agents/taxonomic-entomologist.md) -- Taxonomic identification and specimen specialist
- [citizen-entomologist](../agents/citizen-entomologist.md) -- Community science and public engagement specialist
- [identify-insect](../skills/identify-insect/SKILL.md) -- Morphological insect identification skill
- [observe-insect-behavior](../skills/observe-insect-behavior/SKILL.md) -- Structured behavior observation skill
- [document-insect-sighting](../skills/document-insect-sighting/SKILL.md) -- Sighting documentation and citizen science submission skill
- [survey-insect-population](../skills/survey-insect-population/SKILL.md) -- Population survey design and analysis skill
- [collect-preserve-specimens](../skills/collect-preserve-specimens/SKILL.md) -- Museum-grade specimen preservation skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-20
