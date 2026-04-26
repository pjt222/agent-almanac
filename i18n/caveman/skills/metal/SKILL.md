---
name: metal
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Extract the conceptual essence of a repository as skills, agents, and teams —
  the project's roles, procedures, and coordination patterns expressed as
  agentskills.io-standard definitions. Reads an arbitrary codebase and produces
  generalized definitions that capture WHAT the project does and WHO operates it,
  without replicating HOW it does it. Use when onboarding to a new codebase and
  wanting to understand its conceptual architecture, when bootstrapping an
  agentic system from an existing project, when studying a project's organizational
  DNA for cross-pollination, or when creating a skill/agent/team library inspired
  by a reference implementation.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: natural
  tags: alchemy, extraction, essence, meta, skills, agents, teams, conceptual, metallurgy
---

# Metal

Extract conceptual DNA of repository — its roles, procedures, coordination patterns — as generalized agentskills.io definitions. Like extracting noble metal from ore, skill separates what project IS (essence) from what it DOES (implementation), producing reusable skill, agent, team definitions capturing project organizational genome without reproducing codebase.

## When Use

- Onboarding to new codebase, want to map conceptual architecture before diving into code
- Bootstrapping agentic system from existing project — turning implicit workflows into explicit skill/agent/team definitions
- Studying project organizational DNA for cross-pollination into other projects
- Creating skill/agent/team library inspired by reference implementation without copying it
- Understanding what project structure reveals about creators' mental models + domain expertise

## Inputs

- **Required**: Path to repository or project root directory
- **Required**: Purpose statement — why is essence being extracted? (onboarding, bootstrapping, study, cross-pollination)
- **Optional**: Focus domains — specific areas to concentrate on (default: all)
- **Optional**: Output depth — `survey` (prospect + assay only), `extract` (full procedure), or `report` (extraction + written report) (default: `extract`)
- **Optional**: Maximum extractions — cap on total skills + agents + teams to produce (default: 15)

## The Ore Test

Central quality criterion for all extraction:

> **Could this concept exist in a completely different implementation?**
>
> If YES — it is **metal** (essence). Extract it.
> If NO — it is **gangue** (implementation detail). Leave behind.

Example: Weather app concept "integrate external data source" is metal — applies to any project fetching third-party data. But "parse OpenWeatherMap v3 JSON response" is gangue — specific to one API.

Extracted skills should describe CLASS of task, not specific instance. Extracted agents should describe ROLE, not person. Extracted teams should describe COORDINATION PATTERN, not org chart.

## Steps

### Step 1: Prospect — Survey Ore Body

Survey repository structure without judgment. Map terrain before mining.

1. Glob directory tree to understand project shape:
   - Source directories + organization pattern (by feature, layer, domain)
   - Configuration files: `package.json`, `DESCRIPTION`, `setup.py`, `Cargo.toml`, `go.mod`, `Makefile`
   - Documentation: `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, architecture docs
   - CI/CD: `.github/workflows/`, `Dockerfile`, deployment configs
   - Test directories + structure
2. Read project self-description (README, package manifest) to understand declared purpose
3. Count files by type/language to gauge scope + identify primary technology
4. Identify project boundary — where it begins + ends, what it depends on vs what it provides
5. Produce **Prospect Report**:

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

**Got:** Factual survey — what is here, how large, what does project claim to be. No classification or judgment yet. Report reads like geological survey, not review.

**If fail:** Repository has no README or manifest? Infer purpose from directory names, file contents, test descriptions. Project too large (>1000 source files)? Narrow scope to most active directories (use git log frequency or README references).

### Step 2: Assay — Analyze Composition

Read representative files to understand what project DOES at conceptual level.

1. Sample 5-10 representative files from different areas — not exhaustive, but diverse:
   - Entry points (main files, route handlers, CLI commands)
   - Core logic (most-imported or most-referenced modules)
   - Tests (reveal intended behavior more clearly than implementation)
   - Configuration (reveals operational concerns + deployment context)
2. For each sampled area, identify:
   - **Domains**: What subject areas does project touch? (e.g., "authentication", "data transformation", "reporting")
   - **Verbs**: What actions does project perform? (e.g., "validate", "transform", "deploy", "notify")
   - **Roles**: What human or system actors does code serve? (e.g., "data engineer", "end user", "reviewer")
   - **Flows**: What sequences of actions form workflows? (e.g., "ingest → validate → transform → store")
3. For each finding, classify as:
   - **Essential**: Would exist in any implementation solving this problem
   - **Accidental**: Specific to this implementation's technology choices
4. Produce **Assay Report**: table of domains, verbs, roles, flows with essential/accidental tags

**Got:** Conceptual map of project reading like domain glossary, not code walkthrough. Someone unfamiliar with tech stack should understand what project does from this report.

**If fail:** Codebase opaque (heavy metaprogramming, generated code, obfuscated)? Lean on tests + documentation rather than source code. No tests exist? Read commit messages for intent.

### Step 3: Meditate — Release Implementation Bias

Pause to clear cognitive anchoring from reading code.

1. Notice which framework, language, or architectural pattern dominating mental model — label it
2. Release attachment to HOW: "This project uses React" becomes "This project has user interface layer." "This uses PostgreSQL" becomes "This has persistent structured storage."
3. For each finding in Assay Report, apply Ore Test:
   - "integrate external data source" — could exist anywhere? YES → metal
   - "configure Axios interceptors" — could exist anywhere? NO → gangue
4. Rewrite any findings failing Ore Test at higher abstraction level
5. If multiple perspectives help, consider project through these lenses:
   - **Archaeologist**: What does code's structure reveal about creators' mental models?
   - **Biologist**: What is replicable genome vs specific phenotype?
   - **Music theorist**: What is form (sonata, rondo) vs specific notes?
   - **Cartographer**: What level of abstraction captures useful topology?

**Got:** Assay Report now free of framework-specific language. Every finding passes Ore Test. Concepts feel portable — could apply to project in any language or framework.

**If fail:** Bias persists (findings keep referencing specific technologies)? Try inverting: "If this project were rewritten in completely different stack, which concepts would survive?" Only those are metal.

### Step 4: Smelt — Separate Metal from Slag

Core extraction step. Classify each essential concept into skills, agents, or teams.

1. For each essential concept from purified Assay Report, determine its type:

```
Classification Criteria:
+--------+----------------------------+----------------------------+----------------------------+
| Type   | What to Look For           | Naming Convention          | Test Question              |
+--------+----------------------------+----------------------------+----------------------------+
| SKILL  | Repeatable procedures,     | Verb-first kebab-case:     | "Could an agent follow     |
|        | workflows, transformations | validate-input,            | this as a step-by-step     |
|        | with clear inputs/outputs  | deploy-artifact            | procedure?"                |
+--------+----------------------------+----------------------------+----------------------------+
| AGENT  | Persistent roles, domain   | Noun/role kebab-case:      | "Does this require ongoing |
|        | expertise, judgment calls, | data-engineer,             | context, expertise, or a   |
|        | communication styles       | quality-reviewer           | specific communication     |
|        |                            |                            | style?"                    |
+--------+----------------------------+----------------------------+----------------------------+
| TEAM   | Multi-role coordination,   | Group descriptor:          | "Does this need more than  |
|        | handoffs, reviews,         | pipeline-ops,              | one distinct perspective   |
|        | parallel workstreams       | review-board               | to accomplish?"            |
+--------+----------------------------+----------------------------+----------------------------+
```

2. For each extracted element:
   - Assign **generalized name** — not project-specific. "UserAuthService" becomes `identity-manager` (agent). "deployToAWS()" becomes `deploy-artifact` (skill).
   - Write **one-line description** that makes sense without knowing source project
   - Note **source concept** it derives from (for traceability, not reproduction)
   - Apply Ore Test one final time

3. Guard against common classification errors:
   - Not every function is skill — look for PROCEDURES, not individual operations
   - Not every module is agent — look for ROLES requiring judgment
   - Not every collaboration is team — look for COORDINATION PATTERNS with distinct specialties
   - Most projects yield 3-8 skills, 2-4 agents, 0-2 teams. If you have 20+, you extracting too fine.

**Got:** Classified inventory where each item has type (skill/agent/team), generalized name, one-line description. No item references source project's specific technologies, APIs, or data structures.

**If fail:** Classification ambiguous (is this skill or agent?)? Ask: "Is this about DOING something (skill) or BEING someone who does things (agent)?" Skill is recipe; agent is chef. Still unclear? Default to skill — skills easier to compose later.

### Step 5: Heal — Verify Extraction Quality

Assess whether extraction is honest — neither too much nor too little.

1. **Over-extraction check**: Read each extracted definition + ask:
   - Could someone reconstruct original project's proprietary logic from this? → Too much detail
   - Does this reference specific libraries, APIs, database schemas, file paths? → Still gangue
   - Is this full implementation procedure or concept-level sketch? → Should be sketch

2. **Under-extraction check**: Show only extracted definitions (without source project) + ask:
   - Could someone understand what KIND of project inspired these? → Should be yes
   - Do definitions capture project's essential nature? → Should be yes
   - Are there major project capabilities not represented? → Should be no

3. **Generalization check**: For each definition:
   - Would name make sense in different tech stack? → Should be yes
   - Is description framework-agnostic? → Should be yes
   - Could this definition be useful to project in completely different domain? → Ideally yes

4. **Balance check**: Review extraction ratios:
   - 3-8 skills, 2-4 agents, 0-2 teams typical for focused project
   - Fewer than 3 total extractions suggests under-extraction
   - More than 15 total suggests over-extraction or insufficient generalization

**Got:** Confidence extraction at right level of abstraction. Each definition is seed that could grow in different soil, not cutting that only survives in original garden.

**If fail:** Over-extracted? Raise abstraction level — merge specific skills into broader ones, collapse similar agents into single role. Under-extracted? Return to Step 2, sample additional files. Generalization check fails? Strip technology references, rewrite descriptions.

### Step 6: Cast — Pour Metal into Forms

Produce agentskills.io-standard output documents.

1. For each extracted **skill**, write skeletal definition:

```yaml
# Skill: [generalized-name]
name: [generalized-name]
description: [one-line, framework-agnostic]
domain: [closest domain from the 52 existing domains, or suggest a new one]
complexity: [basic/intermediate/advanced]
# Concept-level procedure (3-5 steps, NOT full implementation):
# Step 1: [high-level action]
# Step 2: [high-level action]
# Step 3: [high-level action]
# Derived from: [source concept in original project]
```

2. For each extracted **agent**, write skeletal definition:

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. For each extracted **team**, write skeletal definition:

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. Compile all extractions into **Assay Report** — single document with sections for Skills, Agents, Teams, plus summary table

**Got:** Structured report containing all extracted definitions in agentskills.io format. Each definition is skeletal (concept-level, not implementation-level) + could serve as starting point for `create-skill`, `create-agent`, or `create-team` skills to flesh out.

**If fail:** Output exceeds 15 items? Prioritize by centrality — keep concepts most unique to this project's domain. Generic concepts (like "manage-configuration") existing in most projects should be dropped unless they have unusual twist.

### Step 7: Temper — Final Validation

Verify complete extraction + produce summary.

1. Count extractions: N skills, N agents, N teams
2. Assess coverage: do they span project's major domains?
3. Verify independence: read each definition WITHOUT source project context — does it stand alone?
4. Run Ore Test one final time on complete set:

```
Temper Assessment:
+-----+---------------------------+----------+------------------------------------+
| #   | Name                      | Type     | Ore Test Result                    |
+-----+---------------------------+----------+------------------------------------+
| 1   | [name]                    | skill    | PASS / FAIL (reason)               |
| 2   | [name]                    | agent    | PASS / FAIL (reason)               |
| ... | ...                       | ...      | ...                                |
+-----+---------------------------+----------+------------------------------------+
```

5. Produce final summary:
   - Total extractions (skills / agents / teams)
   - Coverage assessment (which project domains represented)
   - Confidence level (high / medium / low) with rationale
   - Suggested next steps: which extracted definitions ready to flesh out first

**Got:** Validated Assay Report with summary table, confidence assessment, actionable next steps. Report is self-contained — someone never seen source project can read it + understand extracted concepts.

**If fail:** More than 20% of items fail final Ore Test? Return to Step 4 (Smelt), re-extract at higher abstraction level. Coverage below 60% of identified domains? Return to Step 2 (Assay), sample additional files.

## Checks

- [ ] Prospect report covers project structure, languages, size, declared purpose
- [ ] Assay identifies domains, verbs, roles, flows with essential/accidental classification
- [ ] Meditate checkpoint clears implementation bias — no framework-specific language in outputs
- [ ] Every extracted element passes Ore Test (essence, not implementation detail)
- [ ] Skills named with verbs, agents with nouns, teams with group descriptors
- [ ] All names generalized — no project-specific references
- [ ] Extraction count within typical range (5-15 total, not 1 and not 30)
- [ ] Output definitions follow agentskills.io format (frontmatter + sections)
- [ ] Over-extraction + under-extraction checks both pass
- [ ] Final Temper assessment includes count, coverage, confidence, next steps
- [ ] Complete Assay Report understandable without access to source project

## Pitfalls

- **Mirroring directory structure**: Producing one skill per source file instead of extracting cross-cutting concepts. Metal should reflect project's CONCEPTUAL structure, not file system. 20-file project does not have 20 skills.
- **Framework worship**: Extracting "configure-nextjs-api-routes" instead of "define-api-endpoints". Strip framework; keep pattern. Ore Test catches this: "Could this exist without Next.js?" If no, it's gangue.
- **Role inflation**: Creating agent for every module. Most projects have 2-5 genuine roles requiring distinct expertise, not 20. Look for JUDGMENT + COMMUNICATION STYLE differences, not just functional differences.
- **Skipping Ore Test**: Single biggest failure mode. Every output must pass: "Could this concept exist in completely different implementation?" If references specific libraries, APIs, data schemas, it is slag, not metal.
- **Producing implementation guides**: Extracted skills should be CONCEPT-LEVEL sketches (3-5 high-level steps), not full implementation procedures. They are seeds to be fleshed out with `create-skill`, not finished products. 50-step extraction is reproduction, not essence.
- **Under-generalizing names**: "UserAuthService" is class name, not concept. "identity-manager" is role. "manage-user-identity" is skill. Generalize from specific to universal.
- **Ignoring coordination patterns**: Teams hardest to extract because coordination often implicit. Look for code review workflows, deployment pipelines, data handoffs between systems, approval chains — these reveal team structures.

## See Also

- `athanor` — When metal reveals project needs transformation, not just essence extraction
- `chrysopoeia` — Value extraction at code level; metal works at conceptual level above code
- `transmute` — Converting extracted concepts between domains or paradigms
- `create-skill` — Flesh out extracted skill sketches into full SKILL.md implementations
- `create-agent` — Flesh out extracted agent sketches into full agent definitions
- `create-team` — Flesh out extracted team sketches into full team compositions
- `observe` — Deeper observation when prospect phase reveals unfamiliar domain
- `analyze-codebase-for-mcp` — Complementary: metal extracts concepts, analyze-codebase-for-mcp extracts tool surfaces
- `review-codebase` — Complementary: metal extracts essence, review-codebase evaluates quality
