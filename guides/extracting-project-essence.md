---
title: "Extracting Project Essence"
description: "Multi-perspective framework for extracting skills, agents, and teams from any codebase using the metal skill"
category: design
agents: [alchemist, polymath]
teams: []
skills: [metal, athanor, chrysopoeia, transmute, observe, create-skill, create-agent, create-team]
---

# Extracting Project Essence

A design guide exploring the conceptual foundations of the `metal` skill — how to read an arbitrary codebase and extract its organizational DNA as skills, agents, and teams without reproducing its implementation. Four disciplinary perspectives (archaeology, biology, music theory, cartography) provide complementary lenses for separating essence from detail.

## When to Use This Guide

- Before running `/metal` on a codebase, to understand the underlying philosophy
- When extraction results feel too detailed or too abstract, to recalibrate your approach
- When teaching others to think about projects at the conceptual level rather than the implementation level
- When designing new extraction or analysis skills that need to distinguish essence from detail

## Prerequisites

- Familiarity with the skill/agent/team model (see [Understanding the System](understanding-the-system.md))
- The `metal` skill installed and available as `/metal`

## The Core Problem

Every codebase contains two interleaved layers:

- **Essence**: The roles, procedures, and coordination patterns that would exist in any implementation solving the same problem. This is the project's organizational genome.
- **Detail**: The specific technologies, libraries, variable names, and architectural choices that are particular to this implementation. This is the project's phenotype.

The `metal` skill separates these layers. This guide explores *how to think* about that separation, drawing on four disciplines that have solved analogous problems in their own domains.

## The Ore Test

The central quality criterion for all extraction:

> **Could this concept exist in a completely different implementation?**
>
> If YES — it is metal (essence). Extract it.
> If NO — it is gangue (implementation detail). Leave it behind.

The four perspectives below provide different ways to apply this test, each catching failure modes the others miss.

## Perspective 1: The Archaeologist

An archaeologist studies a civilization by reading its artifacts. They never interview the builders — they infer culture from things. A codebase is exactly this: artifacts left by developers whose intentions must be inferred from structure, naming, and organization.

### What the archaeologist sees

**Stratigraphy** — layers of time. The `git log` is the stratigraphic record:

| Layer | Detection | Implies |
|---|---|---|
| Active (changed in last 3 months) | `git log --since=3.months -- <path>` | Skill candidates — living procedures |
| Dormant (3-12 months since change) | Gap in commit history | Agent responsibilities — maintained but stable |
| Fossilized (12+ months untouched) | No recent commits | Load-bearing structure — potential team norms |

Active code reveals current procedures (skills). Fossilized code reveals structural decisions that nobody questions anymore (team coordination patterns). Dormant code reveals roles — someone is responsible for this area but works on it only when needed.

**Artifact typology** — classifying by function, not content. An archaeologist classifies pottery by shape (storage jar vs drinking cup), not by the clay it is made from. Code files should be classified by role:

- **Entry points** (main files, CLI handlers, route definitions) = the project's public face
- **Core logic** (algorithms, business rules, transformations) = the project's skills
- **Coordination files** (CI/CD, Makefile, docker-compose) = the project's team patterns
- **Configuration** (env files, config objects) = the project's assumptions about context
- **Documentation** (README, CHANGELOG, CONTRIBUTING) = the project's self-knowledge

**Social organization**. A codebase with clear `frontend/`, `backend/`, `data/` directories implies three distinct roles (agents). A `CODEOWNERS` file is a direct map of agent assignments. PR templates encode team coordination rituals.

### Archaeologist's Ore Test

Can you describe the artifact's function without referencing its implementation language, framework, or variable names?

- PASS: "This project has a data ingestion pipeline that validates, transforms, and loads on a schedule"
- FAIL: "This project uses pandas to read CSV files from S3 into PostgreSQL via SQLAlchemy"

### Failure modes

- **Too shallow (postcard archaeology)**: Describing directory structure without interpreting what it means
- **Too deep (burial goods inventory)**: Cataloging every function signature
- **Presentism**: Judging a monolith as "failed microservices" rather than understanding it as a deliberate single-deployment coordination pattern

## Perspective 2: The Biologist

The genome/phenotype distinction is precisely the distinction `metal` must make. The genome is the replicable instruction set (skills, agents, teams). The phenotype is the specific expression (the actual code). Two organisms can share 98% of their genome and look completely different.

### What the biologist sees

**Regulatory regions**. In genetics, regulatory DNA controls *when and where* genes are expressed. In code:

- **Coding regions** = the actual implementation (functions, classes)
- **Regulatory regions** = mechanisms that control execution flow (configuration, feature flags, CI triggers)

A project that uses feature flags has a fundamentally different organizational genome than one that uses long-lived branches — even if both produce the same features. The flag project embeds a *gradual-rollout* coordination pattern; the branching project embeds a *gate-keeping review* pattern.

**Homologous structures**. A whale's flipper and a human's arm are homologous — same genome, different phenotype. In codebases:

- A REST controller and a gRPC handler serving the same domain = same agent role, different interface
- A cron job and an event listener doing the same processing = same skill, different trigger
- A monorepo team and a multi-repo team with the same review process = same team coordination, different repository structure

When extracting, detect homology: merge structures that serve the same organizational function into a single skill/agent/team, even if they look different in the code.

**Heritability test**. For each candidate extraction, ask: "If you started a new project with the same goals, would you replicate this pattern?"

| Pattern | Heritable? | Classification |
|---|---|---|
| "All data access goes through a repository layer" | Yes | Skill |
| "There is a dedicated person who handles infrastructure" | Yes | Agent |
| "PRs require two reviewers from different teams" | Yes | Team norm |
| "We use React 18.2.0" | No | Implementation detail |
| "The auth module uses bcrypt" | Partially | The policy (hash passwords) is heritable; the library is not |

### Biologist's Ore Test

Could this pattern be expressed in a different organism (codebase) and produce an analogous phenotype?

- PASS: "This project has a mutation-testing discipline" (genomic — transferable)
- FAIL: "This project runs `pytest-mutmut` on CI" (phenotypic — specific tooling)

### Failure modes

- **Genome too large**: Extracting so many patterns that the output is a blueprint for the entire system
- **Genome too small**: Extracting only "this project builds software" — no useful information
- **Confusing epigenetics with genetics**: Environment-specific configuration (AWS region, database hostname) modifies expression but is not part of the genome

## Perspective 3: The Music Theorist

A music theorist can describe a Beethoven sonata's form (exposition-development-recapitulation) without specifying a single note. The form is reusable. The notes are the phenotype.

### What the music theorist sees

**Structural form**. Projects have large-scale forms analogous to musical forms:

| Musical Form | Codebase Analogue | Example |
|---|---|---|
| Theme and Variations | Core module with adapters/plugins | Express.js with middleware |
| Fugue | Services implementing the same contract differently | Event-driven microservices |
| Rondo (ABACADA) | Request-response cycle with recurring phases | Standard web API lifecycle |
| Canon | Pipeline stages repeating read-transform-write | ETL jobs |
| Suite | Monorepo with contrasting but related packages | Turborepo workspace |

The form itself is the highest-level team coordination pattern.

**Motifs** — recurring small patterns. Error handling conventions, authentication checks, logging patterns, test setup rituals. These are the atomic skills — small, concrete, repeatable procedures that appear throughout the codebase.

**Dissonance**. The music theorist also hears what is *wrong* — tensions, unresolved conflicts, structural problems. These dissonances should appear in the extracted output as Common Pitfalls in skills or Limitations in agents. A project with undocumented race conditions has a dissonance that the extracted skill should warn about.

When extracting, maintain a **dissonance log** of structural tensions observed (tight coupling, missing tests, inconsistent patterns). Map each dissonance to the appropriate output artifact's pitfalls or limitations section.

### Music Theorist's Ore Test

Can you describe the pattern using the vocabulary of form without specifying any notes?

- PASS: "A core data model (theme) with three service-specific adaptations (variations), each preserving the harmonic structure (shared schema)"
- FAIL: "A User model in the auth service, a UserProfile in the profile service, and a CustomerRecord in billing"

### Failure modes

- **Over-analysis**: Finding deep structural unity where there is none — not every codebase has a coherent form; some are mixtapes, not symphonies
- **Form without content**: Identifying "this is a fugue" but not specifying which voice enters first (which agent leads)
- **Ignoring dissonance**: Describing only harmonious patterns and missing the tensions that define the project's real challenges

## Perspective 4: The Cartographer

A map is useful precisely because it omits detail. A 1:1 scale map is useless. The cartographer's art is choosing the right level of abstraction.

### Scale selection

The single most important decision. For `metal`, scale determines granularity:

| Scale | What You See | What You Miss |
|---|---|---|
| Continental (1:1M) | "This is a web app with an API and SPA" | All internal structure |
| Regional (1:100K) | "There are 5 bounded contexts: auth, billing, inventory, shipping, analytics" | Internal module structure |
| City (1:10K) | "The billing module has: invoice generator, payment processor, subscription manager" | Function-level detail |
| Neighborhood (1:1K) | "The invoice generator validates line items, applies tax rules, generates PDF" | Implementation detail |

`metal` should produce output at the **regional to city range** (1:100K to 1:10K). This is where agents and skills become visible without drowning in implementation.

### Compression ratio

A quantitative Ore Test. After producing all artifacts, calculate:

```
Compression ratio = source lines analyzed / output lines produced
```

| Ratio | Diagnosis | Action |
|---|---|---|
| < 5:1 | Photograph (too detailed) | Merge or eliminate artifacts |
| 5:1 to 50:1 | Map (useful abstraction) | On target |
| > 50:1 | Globe (too abstract) | Explore more of the codebase |

For a 10,000-line codebase, expect roughly 200-2,000 lines of output.

### Projection declaration

Every map introduces distortions. Every extraction omits something. The output should include a brief statement of what was deliberately left out:

- Code areas not explored
- Patterns excluded and why
- Dimensions not assessed (e.g., security posture, accessibility practices)

This prevents the user from assuming the extraction is exhaustive when it is necessarily selective.

### Cartographer's Ore Test

Does the output resemble a map (useful abstraction) or a photograph (raw detail)?

### Failure modes

- **Wrong scale (too zoomed in)**: 50 skills for a CRUD app
- **Wrong scale (too zoomed out)**: One skill ("build-and-deploy") for a microservices platform
- **Missing legend**: Skills/agents/teams without classification rationale
- **Unmarked distortion**: Omitting an entire dimension without declaring it

## Unified Ore Test

For maximum rigor, apply all four tests. An extraction passes if it clears at least three:

1. **Archaeologist**: Can you describe it without implementation-specific terms?
2. **Biologist**: Would you replicate this pattern in a new project with the same goals?
3. **Music Theorist**: Can you express it as form, not notes?
4. **Cartographer**: Is it at the right resolution (5:1 to 50:1 compression)?

If an extraction fails two or more, it needs recalibration — either more abstraction (detail leaking through) or more specificity (too vague to be useful).

## Classification Quick Reference

### What becomes a Skill

A **repeatable procedure** that can be described without specific implementation, is heritable across codebases, appears as a recurring motif, and is visible at city scale.

**Detection signals**: Build scripts, deployment procedures, data pipelines, error handling patterns, testing conventions, documented "how we do X" guides.

### What becomes an Agent

A **distinct responsibility area** that implies specialized expertise, corresponds to a persistent functional niche, operates as a distinct voice, and appears as a bounded region at regional scale.

**Detection signals**: Directory boundaries, CODEOWNERS, distinct conventions per area, different testing strategies, distinct PR author clusters.

### What becomes a Team

A **coordination pattern** encoded in workflow artifacts, governing how multiple roles interact, defining the project's macro-form, and connecting bounded regions.

**Detection signals**: Multi-stage CI/CD, PR review requirements, branch strategy, release process, deployment orchestration.

## Position in the Alchemy Lineage

```
athanor     --> transforms CODE through 4 stages
transmute   --> converts CODE between forms
chrysopoeia --> extracts VALUE from code
metal       --> extracts CONCEPTS from projects
```

The first three work ON code and produce code. `metal` works ABOVE code and produces definitions. It completes the alchemy domain by adding the conceptual extraction that the transmutive, conversive, and optimizing operations lacked.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| Everything extracted as skills, no agents or teams | Looking at procedures only, not roles or coordination | Explicitly scan for CODEOWNERS, CI/CD stages, PR templates, directory boundaries |
| Extraction reproduces the project | Implementation bias survived the meditate checkpoint | Re-run Ore Test from all four perspectives; strip any technology-specific references |
| Too many extractions (20+) | Operating at neighborhood scale instead of city scale | Merge homologous concepts; check compression ratio |
| Too few extractions (< 3) | Operating at continental scale | Sample more files; explore deeper into active code areas |
| Extracted names feel project-specific | Generalization step skipped | Rewrite each name and description using zero terms from the source project |
| Agent definitions have no skills | Agents created before skills | Extract skills first, then assign to agents based on domain fit |

## Related Resources

### Skills
- [metal](../skills/metal/SKILL.md) — the extraction skill this guide documents
- [athanor](../skills/athanor/SKILL.md) — when extraction reveals the project needs transformation
- [chrysopoeia](../skills/chrysopoeia/SKILL.md) — value classification at the code level
- [create-skill](../skills/create-skill/SKILL.md) — fleshing out extracted skill sketches
- [create-agent](../skills/create-agent/SKILL.md) — fleshing out extracted agent sketches
- [create-team](../skills/create-team/SKILL.md) — fleshing out extracted team sketches
- [observe](../skills/observe/SKILL.md) — deeper observation for unfamiliar domains

### Agents
- [alchemist](../agents/alchemist.md) — carries the metal skill alongside athanor, transmute, chrysopoeia
- [polymath](../agents/polymath.md) — cross-disciplinary synthesis agent

### Guides
- [Understanding the System](understanding-the-system.md) — what skills, agents, and teams are
- [Creating Skills](creating-skills.md) — authoring skills from extracted sketches
- [Creating Agents and Teams](creating-agents-and-teams.md) — authoring agents and teams from extracted sketches
- [Running Tending](running-tending.md) — the meditate/heal checkpoints used within metal
