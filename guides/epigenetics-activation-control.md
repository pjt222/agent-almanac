---
title: "Epigenetics-Inspired Activation Control"
description: "Runtime activation profiles controlling which agents, skills, and teams are expressed, grounded in molecular epigenetics"
category: design
agents: [senior-researcher, advocatus-diaboli]
teams: []
skills: [review-research, format-citations]
---

# Epigenetics-Inspired Activation Control

A runtime activation profile system that controls which agents, skills, and teams are "expressed" (available) in a given context, without modifying their definition files.

## Table of Contents
1. [Summary](#summary)
2. [Motivation](#motivation)
3. [Scientific Basis](#scientific-basis)
4. [Biological Metaphor](#biological-metaphor)
5. [Schema Specification](#schema-specification)
6. [Inheritance and Merge Rules](#inheritance-and-merge-rules)
7. [Default Activation Behavior](#default-activation-behavior)
8. [Discovery Integration](#discovery-integration)
9. [Example Profiles](#example-profiles)
10. [Performance Considerations](#performance-considerations)
11. [Implementation Plan](#implementation-plan)
12. [Future Extensions](#future-extensions)
13. [References](#references)

## Summary

The activation control system introduces a declarative YAML configuration layer (`activation.yml`) that filters which agents, skills, and teams are available at runtime without altering the underlying registry files or definition documents. In molecular biology, epigenetic mechanisms — DNA methylation, histone modification, chromatin remodeling, and non-coding RNA regulation — control which genes are expressed in a given cell type without altering the DNA sequence (Goldberg et al., 2007). This system applies analogous principles: activation profiles control which components are "expressed" in a given project context without changing the component definitions. Profiles cascade from global to project to team to session, with well-defined merge semantics and conflict resolution rules.

## Motivation

The agent-almanac repository currently contains 66 agents, 328 skills across 58 domains, and 15 teams. This breadth is a strength for a general-purpose library, but in any specific project context, most of these components are irrelevant noise:

- An R package developer has no use for the survivalist, shapeshifter, or tcg-specialist agents.
- A GxP compliance project does not need bushcraft, alchemy, or swarm skills.
- A full-stack web project has no need for the tending team or jigsawr-developer agent.

Today, the only option is "everything active, all the time." This creates several problems:

1. **Selection ambiguity**: When Claude Code must choose an agent, a pool of 66 candidates produces worse matches than a curated pool of 5-10 relevant agents.
2. **Cognitive overhead**: Users and AI alike must mentally filter irrelevant options during tool discovery and skill invocation.
3. **Priority dilution**: Agent priority fields (`high`, `normal`, `critical`) lose meaning when too many agents share the same priority level.
4. **No project customization**: There is no way to say "for this project, only these agents matter" without forking the entire registry.

The activation control system solves these problems by adding a thin filtering layer that sits between the registries and the runtime. Component definitions remain unchanged, centrally maintained, and version-controlled. Only the filter is project-specific.

## Scientific Basis

### What Is Epigenetics?

The term "epigenetics" was coined by Conrad Hal Waddington (1942) to describe how genotypes give rise to phenotypes during development. Waddington's "epigenetic landscape" (1957) — a visual metaphor of a ball rolling down branching valleys — captured how cells progressively commit to fates without changing their DNA. The modern molecular definition has narrowed: epigenetics refers to heritable changes in gene expression that do not involve changes to the underlying DNA sequence (Bird, 2007; Goldberg et al., 2007). These changes are mediated by chemical modifications to DNA and its associated proteins, and by regulatory RNA molecules.

### Core Mechanisms

Four well-characterized molecular mechanisms control epigenetic gene regulation. Each maps to a specific activation control concept in this system.

1. **DNA methylation** — Addition of methyl groups (-CH3) to cytosine bases, primarily at CpG dinucleotides. Methylation of CpG islands in gene promoter regions is strongly associated with transcriptional silencing: methylated promoters recruit methyl-CpG-binding domain (MBD) proteins that in turn recruit histone deacetylase complexes, compacting the local chromatin and blocking transcription factor access (Bird, 2002; Cedar & Bergman, 2009). Critically, methylation does not alter the DNA sequence — it adds a reversible chemical mark that suppresses expression. **System analog**: the `exclude` rule suppresses a component without modifying its definition file.

2. **Histone modifications** — Post-translational modifications to the N-terminal tails of histone proteins (acetylation, methylation, phosphorylation, ubiquitination) alter chromatin accessibility. The "histone code hypothesis" (Strahl & Allis, 2000) proposes that specific combinations of modifications are read by effector proteins to produce distinct transcriptional outcomes. Acetylation of lysine residues (e.g., H3K27ac) neutralizes positive charges on histones, weakening their grip on negatively charged DNA and opening chromatin for transcription (Kouzarides, 2007). Deacetylation reverses this, condensing chromatin. **System analog**: the `include` rule explicitly activates a component, opening it for use.

3. **Chromatin remodeling** — ATP-dependent remodeling complexes (SWI/SNF, ISWI, CHD, INO80 families) physically reposition, eject, or restructure nucleosomes, switching entire genomic regions between accessible euchromatin and condensed heterochromatin states (Clapier & Cairns, 2009). Unlike the targeted nature of methylation or acetylation, chromatin remodeling restructures the landscape wholesale. **System analog**: the `mode` switch between `allowlist` and `blocklist` restructures the entire activation landscape for a component type.

4. **Non-coding RNA (ncRNA)** — Long non-coding RNAs (lncRNAs) and microRNAs (miRNAs) regulate gene expression post-transcriptionally or guide chromatin-modifying complexes to specific genomic loci. The canonical example is Xist, a 17 kb lncRNA that coats one X chromosome in female mammals, recruiting the Polycomb Repressive Complex 2 (PRC2) to silence the entire chromosome — yet individual genes can escape this silencing through local regulatory mechanisms (Heard & Martienssen, 2014; Mattick & Makunin, 2006). **System analog**: individual skill rules that override domain-level rules — fine-grained regulation within a broadly controlled region.

### Key Properties

These mechanisms share four properties that make them particularly apt as a conceptual model for our activation system:

- **Reversibility**: Unlike mutations, epigenetic marks can be added and removed by specific enzymes. DNA methyltransferases (DNMTs) add methyl groups; ten-eleven translocation (TET) enzymes oxidize them for removal. Histone acetyltransferases (HATs) add acetyl groups; histone deacetylases (HDACs) remove them (Jaenisch & Bird, 2003). Activation rules are similarly reversible — they can be added or removed without touching definition files.

- **Heritability**: Epigenetic marks are propagated through cell division via maintenance mechanisms. DNMT1 recognizes hemi-methylated DNA after replication and copies the methylation pattern to the daughter strand (Reik, 2007). In our system, activation profiles cascade from global to project to team to session, each level inheriting from its parent.

- **Context-specificity**: The same human genome (~20,000 protein-coding genes) produces over 200 distinct cell types, each with a unique epigenetic signature determining which genes are expressed (Allis & Jenuwein, 2016). Analogously, the same registry of 66 agents, 328 skills, and 15 teams can produce radically different working environments depending on the activation profile.

- **Combinatorial logic**: Multiple epigenetic marks interact. "Bivalent domains" — regions carrying both activating H3K4me3 and repressive H3K27me3 marks — poise developmental genes for rapid activation or silencing depending on context (Bernstein et al., 2006). The activation system similarly supports combinatorial rules: an agent can be simultaneously included (overriding a higher-level exclusion) and amplified (boosting its priority).

## Biological Metaphor

The design draws on the well-characterized molecular mechanisms described above. Each system concept maps to a specific biological mechanism with cited evidence:

| Biology | System Concept | Scientific Basis |
|---|---|---|
| Genome | Full registry set | The complete set of protein-coding and regulatory sequences; ~20,000 genes in humans (International Human Genome Sequencing Consortium, 2004) |
| Gene | Individual component | A discrete functional unit — a single agent, skill, or team definition file |
| DNA methylation (CpG silencing) | `exclude` rule | Methylation of CpG islands in promoter regions suppresses transcription without altering the sequence (Bird, 2002) |
| Histone acetylation | `include` rule | Acetylation neutralizes positive histone charges, opening chromatin for transcription (Kouzarides, 2007) |
| Enhancer element | `amplify` rule | Distal regulatory elements that increase transcription of target genes, sometimes across hundreds of kilobases (Pennacchio et al., 2013) |
| Constitutive expression | Default activation state | Housekeeping genes expressed in all cell types regardless of epigenetic context (Eisenberg & Levanon, 2013) |
| Chromatin remodeling | Mode switch (`allowlist`/`blocklist`) | ATP-dependent complexes restructure the entire chromatin landscape between euchromatin and heterochromatin (Clapier & Cairns, 2009) |
| Cell differentiation | Profile specialization | Progressive restriction of gene expression during development (Waddington, 1957) |
| Tissue type | Project context | A differentiated cell type with a stable, context-specific expression pattern |
| Gene expression | Runtime availability | Whether a component is active (transcribed) in the current context |
| ncRNA regulation | Skill-level override within domain | lncRNAs and miRNAs fine-tune expression of individual genes within broadly regulated regions (Mattick & Makunin, 2006) |

The metaphor's value is not decorative — it provides a mental model grounded in molecular biology for reasoning about the system's behavior. The key properties that make epigenetics an apt model are detailed in the Scientific Basis section above. In summary:

- **Reversibility**: DNMTs add methyl groups; TET enzymes remove them. HATs add acetyl groups; HDACs remove them (Jaenisch & Bird, 2003). Activation rules are similarly reversible — added or removed without modifying definition files.
- **Context-specificity**: The same ~20,000 genes produce liver hepatocytes and cortical neurons through differential epigenetic regulation (Allis & Jenuwein, 2016). The same registry produces R-development and compliance contexts through different activation profiles.
- **Inheritance**: DNMT1 copies methylation patterns to daughter DNA strands during replication (Reik, 2007). Project profiles inherit from global profiles through a defined cascade.
- **Independence**: Epigenetic marks modify gene expression without altering the DNA sequence — the central principle of epigenetics (Goldberg et al., 2007). Activation rules modify component availability without altering definition files.

## Schema Specification

### 4.1 File Location and Discovery

Activation profiles are discovered in a fixed sequence. Each level can override the previous.

| Level | Location | Scope |
|---|---|---|
| Global | `~/.claude/activation.yml` | All projects for this user |
| Project | `.claude/activation.yml` (project root) | Single project |
| Team | Embedded in team definition or `teams/<name>/activation.yml` | Active team context |
| Session | Runtime override (CLI flag or environment variable) | Current session only |

**Discovery order**: Global -> Project -> Team -> Session. Each level is optional. If no `activation.yml` exists at any level, all components are active (backward compatible).

**File detection**: The resolver checks for file existence at each level. Missing files are treated as empty profiles (no rules). Malformed YAML produces a warning and is skipped, not a hard error.

### 4.2 Full Schema

```yaml
# .claude/activation.yml
# Activation profile controlling which agents, skills, and teams
# are expressed in this context.

version: "1.0"

# --- Context matching (optional) ---
# When present, this profile only applies if the context matches.
# When absent, the profile applies unconditionally.
context:
  projects:
    - path: "/mnt/d/dev/p/my-r-package"       # Exact path match
    - pattern: "*/r-packages/*"                 # Glob pattern match
  env:                                          # Environment variable conditions
    NODE_ENV: "production"
    CI: "true"
  tags:                                         # Match project tags (future)
    - r-package
    - cran-submission

# --- Agent activation rules ---
agents:
  mode: "blocklist"           # "blocklist" (default) or "allowlist"
  include:                    # Agents to activate
    - r-developer
    - code-reviewer
    - security-analyst
  exclude:                    # Agents to suppress
    - mystic
    - survivalist
    - shaman
    - shapeshifter
  amplify:                    # Agents to boost in selection priority
    - r-developer

# --- Skill activation rules ---
skills:
  mode: "blocklist"           # "blocklist" (default) or "allowlist"
  include:
    domains:                  # Activate entire domains
      - r-packages
      - git
      - review
    skills:                   # Activate individual skills by ID
      - meditate
      - heal
  exclude:
    domains:                  # Suppress entire domains
      - esoteric
      - bushcraft
      - morphic
      - swarm
    skills:                   # Suppress individual skills by ID
      - make-fire
      - purify-water
      - forage-plants

# --- Team activation rules ---
teams:
  mode: "blocklist"           # "blocklist" (default) or "allowlist"
  include:
    - r-package-review
  exclude:
    - tending
    - opaque-team

# --- Default skills override ---
default_skills:
  inherit: true               # Inherit from registry default_skills
  additional:                 # Add to the default set
    - commit-changes
    - manage-git-branches
  suppress:                   # Remove from the default set
    - heal                    # e.g., suppress heal in production contexts
```

### 4.3 Field Semantics

#### `version` (required)
Schema version string. Currently `"1.0"`. Parsers must reject files with unrecognized major versions and warn on unrecognized minor versions.

#### `context` (optional)
Conditions under which this profile applies. If omitted, the profile applies unconditionally. If present, **all** specified conditions must match (AND logic). Individual list items within a condition use OR logic (e.g., multiple `projects` entries: match if any path matches).

- `context.projects[].path`: Exact match against the resolved project root path.
- `context.projects[].pattern`: Glob pattern matched against the project root path. Uses standard glob syntax (`*`, `**`, `?`).
- `context.env`: Key-value pairs. Each key is an environment variable name. The profile applies only if every listed variable has the specified value.
- `context.tags`: Reserved for future use. List of string tags matched against project metadata.

#### `agents` (optional)
Controls agent availability.

- `agents.mode`: Either `"blocklist"` (default) or `"allowlist"`.
  - **blocklist**: All agents are active by default. Use `exclude` to suppress specific agents.
  - **allowlist**: No agents are active by default. Use `include` to activate specific agents.
- `agents.include`: List of agent IDs to activate. In blocklist mode, this is a no-op unless overriding a higher-level exclusion. In allowlist mode, this is the set of active agents.
- `agents.exclude`: List of agent IDs to suppress. In blocklist mode, these agents are deactivated. In allowlist mode, this is a no-op (already inactive).
- `agents.amplify`: List of agent IDs that receive a priority boost during agent selection. An amplified agent with `priority: normal` is treated as `priority: high`. An amplified agent with `priority: high` is treated as `priority: critical`. An agent already at `priority: critical` is unchanged.

**Edge case**: If an agent appears in both `include` and `exclude` at the same level, `include` wins (explicit activation overrides explicit suppression).

#### `skills` (optional)
Controls skill availability. Supports both domain-level and individual skill-level rules.

- `skills.mode`: Either `"blocklist"` (default) or `"allowlist"`.
- `skills.include.domains`: List of domain IDs. All skills in listed domains are activated.
- `skills.include.skills`: List of individual skill IDs. These skills are activated regardless of domain rules.
- `skills.exclude.domains`: List of domain IDs. All skills in listed domains are suppressed.
- `skills.exclude.skills`: List of individual skill IDs. These skills are suppressed regardless of domain rules.

**Precedence within skills**: Individual skill rules override domain rules. If domain `esoteric` is excluded but skill `meditate` is individually included, `meditate` is active. This mirrors how non-coding RNAs and enhancer elements can activate individual genes within a broadly silenced chromatin domain (Heard & Martienssen, 2014; Pennacchio et al., 2013).

#### `teams` (optional)
Controls team availability. Identical semantics to `agents` but without `amplify` (teams are selected explicitly, not by priority matching).

- `teams.mode`: Either `"blocklist"` (default) or `"allowlist"`.
- `teams.include`: List of team IDs to activate.
- `teams.exclude`: List of team IDs to suppress.

#### `default_skills` (optional)
Controls the set of skills automatically inherited by all agents (currently `meditate` and `heal` as defined in `agents/_registry.yml`).

- `default_skills.inherit`: Boolean. When `true` (default), the agent inherits `default_skills` from the registry. When `false`, no default skills are inherited.
- `default_skills.additional`: List of skill IDs to add to every agent's default skill set.
- `default_skills.suppress`: List of skill IDs to remove from the default set. Only affects skills that would otherwise be inherited.

**Interaction with skill rules**: If a default skill is suppressed via `default_skills.suppress`, it is removed from agents' implicit skill sets but remains available as a standalone skill (unless also excluded via `skills.exclude`). These are independent mechanisms.

## Inheritance and Merge Rules

### 5.1 Cascade Order

```
Global (~/.claude/activation.yml)
  |
  v  merge
Project (.claude/activation.yml)
  |
  v  merge
Team (team-specific activation)
  |
  v  merge
Session (CLI override)
  |
  v
Resolved activation state
```

Each level is optional. The resolved state starts empty and accumulates rules level by level.

### 5.2 Merge Semantics by Mode

#### Blocklist mode (default)

In blocklist mode, the starting state is "everything active." Each level can only narrow the active set.

| Operation | Merge behavior |
|---|---|
| `exclude` | Union across levels. If global excludes `[A, B]` and project excludes `[C]`, result is `[A, B, C]` excluded. |
| `include` | Override. A project-level `include` for an item excluded at the global level **re-activates** that item. This is the "enhancer" mechanism. |
| `amplify` | Union across levels. Amplifications are additive. |
| `mode` switch | A project can switch from blocklist to allowlist. When this happens, the project's rules replace (not merge with) the global rules for that component type. |

#### Allowlist mode

In allowlist mode, the starting state is "nothing active." Each level can only expand the active set.

| Operation | Merge behavior |
|---|---|
| `include` | Union across levels. If global includes `[A, B]` and project includes `[C]`, result is `[A, B, C]` included. |
| `exclude` | Override. A project-level `exclude` for an item included at the global level **deactivates** that item. |
| `amplify` | Union across levels. |
| `mode` switch | If global is allowlist and project switches to blocklist, the project's rules replace the global rules for that component type. |

### 5.3 Conflict Resolution

1. **Same level, same item in include and exclude**: `include` wins. Rationale: explicit activation is an intentional decision that should override blanket exclusion.
2. **Different levels, same item**: More specific level wins. Project overrides global. Team overrides project. Session overrides team.
3. **Domain vs. individual skill**: Individual skill rules override domain rules at the same level.
4. **Mode mismatch across levels**: When a child level specifies a different `mode` than the parent, the child's rules **replace** (not merge with) the parent's rules for that component type. This is a complete mode switch, equivalent to chromatin remodeling.

### 5.4 Merge Algorithm (Pseudocode)

```
function resolve_activation(levels: [global, project, team, session]):
    state = {agents: ALL, skills: ALL, teams: ALL}  # start with everything

    for level in levels:
        if level is empty: continue

        for component_type in [agents, skills, teams]:
            rules = level[component_type]
            if rules is empty: continue

            if rules.mode != previous_mode[component_type]:
                # Mode switch: reset and apply fresh
                if rules.mode == "allowlist":
                    state[component_type] = NONE
                else:
                    state[component_type] = ALL
                previous_mode[component_type] = rules.mode

            # Apply exclusions
            state[component_type] -= rules.exclude

            # Apply inclusions (override exclusions from higher levels)
            state[component_type] += rules.include

            # Apply amplifications
            amplified[component_type] += rules.amplify

    return state, amplified
```

## Default Activation Behavior

### No activation.yml present

When no `activation.yml` exists at any level, the system behaves exactly as it does today:

- All 66 agents are available for selection.
- All 328 skills across 58 domains are invocable.
- All 15 teams can be spawned.
- Default skills (`meditate`, `heal`) are inherited by all agents.

This ensures full backward compatibility. Existing projects require zero changes.

### Activation.yml present with minimal content

```yaml
version: "1.0"
```

A file with only a version field and no rules is valid. It has no effect (equivalent to no file). This allows users to create the file as a placeholder before adding rules.

### Mode defaults

- If `mode` is omitted for any component type, it defaults to `"blocklist"`.
- If only `exclude` is specified (no `include`), the behavior is pure suppression.
- If only `amplify` is specified (no `include` or `exclude`), no filtering occurs but priority boosting is applied.

### Amplification semantics

Amplification adjusts the effective priority of an agent during selection without modifying the agent's definition file:

| Original priority | After amplify | Effect |
|---|---|---|
| `normal` | `high` | Selected over other `normal` agents |
| `high` | `critical` | Selected over other `high` agents |
| `critical` | `critical` | No change (ceiling) |

Amplification is a soft signal, not a hard requirement. It influences selection heuristics but does not guarantee selection. The resolver may still choose a non-amplified agent if it is a better match for the task.

## Discovery Integration

### 7.1 Interaction with `.claude/agents/` Symlink Discovery

Claude Code discovers agents via the `.claude/agents/` directory (symlinked to `agents/` in this project). The activation system operates **after** discovery:

```
Discovery phase:
  .claude/agents/*.md  -->  Set of all discovered agents

Activation phase:
  Discovered agents  +  activation.yml  -->  Set of active agents
```

The activation system does not interfere with file-system discovery. All agents are discovered as usual; the activation filter then removes suppressed agents from the active set.

### 7.2 Interaction with `_registry.yml` Files

Registry files remain the source of truth for what exists. Activation profiles are the source of truth for what is available. The resolver reads both:

1. Parse `skills/_registry.yml` to get the full skill catalog.
2. Parse `agents/_registry.yml` to get the full agent catalog.
3. Parse `teams/_registry.yml` to get the full team catalog.
4. Resolve the activation profile cascade (global -> project -> team -> session).
5. Apply activation rules to filter the catalogs.
6. Return the filtered catalogs as the active set.

Registry files are never modified by the activation system.

### 7.3 Interaction with `default_skills` in Agent Registry

The `default_skills` field in `agents/_registry.yml` defines skills inherited by all agents. The activation system adds a `default_skills` override section:

```
Registry default_skills: [meditate, heal]
  |
  v  apply activation.yml default_skills
Override: inherit=true, suppress=[heal], additional=[commit-changes]
  |
  v
Effective default_skills: [meditate, commit-changes]
```

The override is applied before agents receive their default skills. An agent's explicitly listed skills (in its frontmatter `skills:` field) are not affected by `default_skills` overrides.

### 7.4 Interaction with Agent Selection Logic

Claude Code's agent selection logic considers task requirements and agent capabilities to choose the best agent. The activation system modifies this process:

1. **Pre-filter**: Remove all agents not in the active set.
2. **Priority adjustment**: Apply `amplify` boosts to remaining agents.
3. **Selection**: Run the existing selection algorithm on the filtered, priority-adjusted set.

This means an excluded agent is never considered, even if it would be the best match. Users who find themselves frequently needing to override exclusions should adjust their activation profile.

## Example Profiles

### Example 1: R Package Development

For a project developing an R package for CRAN submission. Keeps R-focused agents and suppresses everything unrelated.

```yaml
# .claude/activation.yml
version: "1.0"

agents:
  exclude:
    - mystic
    - survivalist
    - shaman
    - alchemist
    - shapeshifter
    - swarm-strategist
    - martial-artist
    - designer
    - tcg-specialist
    - gardener
    - dog-trainer
    - mycologist
    - prospector
    - librarian
    - tour-planner
    - hiking-guide
    - relocation-expert
    - blender-artist
    - fabricator
    - geometrist
    - markovian
    - theoretical-researcher
    - diffusion-specialist
    - hildegard
    - kabalist
    - lapidary
    - number-theorist
  amplify:
    - r-developer

skills:
  exclude:
    domains:
      - esoteric
      - bushcraft
      - morphic
      - swarm
      - tcg
      - alchemy
      - gardening
      - animal-training
      - mycology
      - prospecting
      - crafting
      - travel
      - relocation
      - design
      - defensive
      - blender
      - 3d-printing
      - geometry
      - stochastic-processes
      - theoretical-science
      - diffusion
      - hildegard
      - lapidary
  include:
    skills:
      - meditate      # Keep from esoteric despite domain exclusion

teams:
  include:
    - r-package-review
  exclude:
    - tending
    - opaque-team
    - fullstack-web-dev
```

**Result**: Active agents are r-developer (amplified), code-reviewer, security-analyst, web-developer, quarto-developer, shiny-developer, gxp-validator, auditor, senior-researcher, senior-data-scientist, senior-software-developer, senior-web-designer, senior-ux-ui-specialist, project-manager, devops-engineer, mlops-engineer, putior-integrator, jigsawr-developer, janitor, polymath, ip-analyst, mcp-developer, acp-developer, skill-reviewer, version-manager. Active skill domains are r-packages, git, review, general, compliance, containerization, reporting, mcp-integration, web-dev, data-serialization, jigsawr, shiny, observability, devops, mlops, project-management, workflow-visualization, maintenance, a2a-protocol, number-theory, versioning, plus `meditate` from esoteric.

### Example 2: GxP Compliance Project

For a validated pharmaceutical computing environment. Compliance, security, and documentation agents are amplified. Exploratory and creative agents are suppressed.

```yaml
# .claude/activation.yml
version: "1.0"

agents:
  mode: "allowlist"
  include:
    - gxp-validator
    - auditor
    - security-analyst
    - senior-researcher
    - senior-software-developer
    - code-reviewer
    - r-developer
    - project-manager
  amplify:
    - gxp-validator
    - auditor

skills:
  mode: "allowlist"
  include:
    domains:
      - compliance
      - r-packages
      - review
      - git
      - general
      - reporting
      - project-management
    skills:
      - security-audit-codebase
      - serialize-data-formats
      - design-serialization-schema
      - meditate

teams:
  mode: "allowlist"
  include:
    - gxp-compliance-validation
    - r-package-review

default_skills:
  inherit: true
  additional:
    - commit-changes
    - manage-git-branches
```

**Result**: A tightly scoped environment with 8 agents, compliance-focused skill domains, and 2 approved teams. The allowlist mode ensures nothing unexpected is available in a regulated context.

### Example 3: Full-Stack Web Development

For a Next.js + Tailwind CSS project. Web-focused agents are amplified; R-specific and esoteric agents are suppressed.

```yaml
# .claude/activation.yml
version: "1.0"

agents:
  exclude:
    - r-developer
    - jigsawr-developer
    - gxp-validator
    - auditor
    - mystic
    - survivalist
    - shaman
    - alchemist
    - shapeshifter
    - gardener
    - dog-trainer
    - mycologist
    - prospector
    - tcg-specialist
    - martial-artist
    - hildegard
    - blender-artist
    - fabricator
    - tour-planner
    - hiking-guide
    - relocation-expert
    - geometrist
    - markovian
    - theoretical-researcher
    - diffusion-specialist
    - kabalist
    - lapidary
    - number-theorist
  amplify:
    - web-developer
    - senior-web-designer
    - senior-ux-ui-specialist

skills:
  exclude:
    domains:
      - r-packages
      - jigsawr
      - compliance
      - esoteric
      - bushcraft
      - morphic
      - swarm
      - tcg
      - alchemy
      - gardening
      - animal-training
      - mycology
      - prospecting
      - crafting
      - hildegard
      - blender
      - 3d-printing
      - geometry
      - stochastic-processes
      - theoretical-science
      - diffusion
      - lapidary
  include:
    skills:
      - meditate

teams:
  include:
    - fullstack-web-dev
  exclude:
    - r-package-review
    - gxp-compliance-validation
    - tending
    - opaque-team
```

### Example 4: Research and Exploration

For open-ended research projects where breadth of agents is valuable. Minimal exclusions, polymath amplified.

```yaml
# .claude/activation.yml
version: "1.0"

agents:
  amplify:
    - polymath
    - senior-researcher
    - senior-data-scientist
    - ip-analyst

skills:
  # No exclusions -- keep everything available for cross-domain synthesis
  exclude:
    domains: []

teams:
  # All teams available
  exclude: []
```

**Result**: Nearly identical to no activation.yml, but with priority boosting for research-oriented agents. The polymath can spawn any domain specialist as needed.

### Example 5: Global User Defaults

A global profile that suppresses agents the user never needs, applied to all projects.

```yaml
# ~/.claude/activation.yml
version: "1.0"

agents:
  exclude:
    - survivalist
    - mycologist
    - prospector
    - dog-trainer
    - tcg-specialist

skills:
  exclude:
    domains:
      - bushcraft
      - mycology
      - prospecting
      - animal-training
      - tcg

default_skills:
  inherit: true
```

Individual project profiles then layer on top. An R package project adds further exclusions; a research project overrides with `include` to re-activate agents the global profile excluded.

## Performance Considerations

### Activation resolution cost

The activation resolver runs once at session startup and caches the resolved state for the session's duration. The cost is:

1. **File I/O**: Read up to 4 small YAML files (global, project, team, session). These are typically under 100 lines each.
2. **YAML parsing**: Parse 4 files. Using a standard YAML parser, this completes in under 10ms.
3. **Set operations**: Apply include/exclude/amplify rules. With 66 agents and 328 skills, these are microsecond-level set operations.
4. **Total overhead**: Under 50ms at session start. No per-tool-call cost.

### Caching strategy

```
Session start
  |
  v
Parse activation files (once)
  |
  v
Resolve cascade (once)
  |
  v
Store resolved state in memory
  |
  v
All subsequent agent/skill/team lookups use cached state
```

The cache is invalidated only on session restart. Mid-session changes to `activation.yml` do not take effect until the next session. This is intentional: mid-session profile changes could produce confusing behavior where previously available agents disappear.

### Registry file size

The registry files are small YAML documents:
- `skills/_registry.yml`: ~600 lines
- `agents/_registry.yml`: ~500 lines
- `teams/_registry.yml`: ~75 lines

Parsing overhead is negligible. No optimization is needed for the current scale. If the registry grew to thousands of entries, an indexed lookup structure could replace linear scanning.

## Implementation Plan

### Files to create (user-created, not code changes)

| File | Purpose |
|---|---|
| `~/.claude/activation.yml` | Global user activation profile |
| `.claude/activation.yml` | Project-specific activation profile |

These files are created by users, not generated. Templates could be provided in the guides.

### Files to modify (code changes)

| File / Module | Change | Scope |
|---|---|---|
| Agent discovery logic | Add post-discovery filter step | Medium |
| Skill resolution logic | Add domain/skill filtering | Medium |
| Team spawning logic | Add team availability check | Small |
| Agent selection heuristic | Add amplify priority adjustment | Small |

### New module: Activation Resolver

A new module responsible for:

1. **File discovery**: Locate `activation.yml` at each cascade level.
2. **YAML parsing**: Parse and validate against the schema.
3. **Cascade merge**: Apply the merge algorithm (section 5.4).
4. **State caching**: Store resolved state for session duration.
5. **Query interface**: Expose `is_active(component_type, id) -> bool` and `effective_priority(agent_id) -> priority` functions.

### Estimated scope

| Component | Effort |
|---|---|
| Schema definition and validation | Small |
| YAML parser integration | Small |
| Cascade merge logic | Medium |
| Agent discovery integration | Medium |
| Skill resolution integration | Medium |
| Team availability integration | Small |
| Priority adjustment integration | Small |
| Template profiles and documentation | Small |

### Testing requirements

- **Unit tests**: Merge algorithm with various mode combinations, conflict resolution edge cases, individual-vs-domain skill override, amplification ceiling.
- **Integration tests**: Full cascade from global to session, agent selection with amplified priorities, skill invocation with domain exclusions.
- **Backward compatibility**: Verify no behavior change when no `activation.yml` exists.
- **Error handling**: Malformed YAML, missing version field, unknown fields (forward compatibility).

## Future Extensions

### Dynamic activation

Allow activation profiles to change mid-session in response to context switches. For example, when a polymath agent transitions from an engineering domain to a compliance domain, the active skill set could shift automatically. This requires careful cache invalidation and user notification when the active set changes.

### Activation analytics

Track which profiles are used, which agents are most frequently amplified, and which are most frequently excluded. This data could inform registry curation decisions (e.g., moving consistently-excluded agents to an "extended" tier).

### Profile templates

Provide ready-made activation profiles for common project types:

```
profiles/
  r-package.yml
  web-fullstack.yml
  gxp-compliance.yml
  research-exploration.yml
  data-science.yml
```

Users would copy a template into their project's `.claude/activation.yml` and customize as needed.

### IDE integration

A VS Code extension (or Claude Code CLI command) for editing activation profiles with:

- Autocomplete for agent, skill, and domain IDs sourced from the registries.
- Visual diff showing which components are active vs. suppressed.
- Profile switching UI for rapidly toggling between project contexts.

### Conditional activation

Extend `context` matching with richer conditions:

```yaml
context:
  git_branch: "release/*"      # Activate compliance agents on release branches
  file_exists: "DESCRIPTION"   # Auto-detect R package projects
  time_of_day: "09:00-17:00"   # Business-hours profile
```

### Profile composition

Allow profiles to reference other profiles:

```yaml
extends: "profiles/r-package.yml"
agents:
  amplify:
    - jigsawr-developer    # Project-specific addition
```

This would reduce duplication across projects that share a common base.

### Team-embedded activation

Allow team definitions to include activation rules that apply when the team is active:

```yaml
# In teams/r-package-review.md CONFIG block
activation:
  skills:
    amplify_domains: [r-packages, review, git]
    suppress_domains: [esoteric, bushcraft]
```

When the r-package-review team is spawned, its embedded activation rules would merge into the session's active profile, automatically scoping the skill set to what the team needs.

## References

- Allis, C. D., & Jenuwein, T. (2016). The molecular hallmarks of epigenetic control. *Nature Reviews Genetics*, 17(8), 487-500.
- Bernstein, B. E., Mikkelsen, T. S., Xie, X., Kamal, M., Huebert, D. J., Cuff, J., ... & Lander, E. S. (2006). A bivalent chromatin structure marks key developmental genes in embryonic stem cells. *Cell*, 125(2), 315-326.
- Bird, A. (2002). DNA methylation patterns and epigenetic memory. *Genes & Development*, 16(1), 6-21.
- Bird, A. (2007). Perceptions of epigenetics. *Nature*, 447(7143), 396-398.
- Cedar, H., & Bergman, Y. (2009). Linking DNA methylation and histone modification: patterns and paradigms. *Nature Reviews Genetics*, 10(5), 295-304.
- Clapier, C. R., & Cairns, B. R. (2009). The biology of chromatin remodeling complexes. *Annual Review of Biochemistry*, 78, 273-304.
- Eisenberg, E., & Levanon, E. Y. (2013). Human housekeeping genes, revisited. *Trends in Genetics*, 29(10), 569-574.
- Goldberg, A. D., Allis, C. D., & Bernstein, E. (2007). Epigenetics: A landscape takes shape. *Cell*, 128(4), 635-638.
- Heard, E., & Martienssen, R. A. (2014). Transgenerational epigenetic inheritance: myths and mechanisms. *Cell*, 157(1), 95-109.
- International Human Genome Sequencing Consortium. (2004). Finishing the euchromatic sequence of the human genome. *Nature*, 431(7011), 931-945.
- Jaenisch, R., & Bird, A. (2003). Epigenetic regulation of gene expression: how the genome integrates intrinsic and environmental signals. *Nature Genetics*, 33(Suppl), 245-254.
- Kouzarides, T. (2007). Chromatin modifications and their function. *Cell*, 128(4), 693-705.
- Mattick, J. S., & Makunin, I. V. (2006). Non-coding RNA. *Human Molecular Genetics*, 15(suppl_1), R17-R29.
- Pennacchio, L. A., Bickmore, W., Dean, A., Nobrega, M. A., & Bejerano, G. (2013). Enhancers: five essential questions. *Nature Reviews Genetics*, 14(4), 288-295.
- Reik, W. (2007). Stability and flexibility of epigenetic gene regulation in mammalian development. *Nature*, 447(7143), 425-432.
- Strahl, B. D., & Allis, C. D. (2000). The language of covalent histone modifications. *Nature*, 403(6765), 41-45.
- Waddington, C. H. (1942). The epigenotype. *Endeavour*, 1, 18-20.
- Waddington, C. H. (1957). *The Strategy of the Genes: A Discussion of Some Aspects of Theoretical Biology*. Allen & Unwin.

---

**Author**: Philipp Thoss
**Version**: 1.1.0
**Last Updated**: 2026-03-11
**Status**: Design Document (GitHub Issue #24)
