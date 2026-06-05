---
name: metal
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

Extract the conceptual DNA of a repository — its roles, procedures, and coordination patterns — as generalized agentskills.io definitions. Like extracting noble metal from ore, the skill separates what a project IS (its essence) from what it DOES (its implementation), producing reusable skill, agent, and team definitions that capture the project's organizational genome without reproducing its codebase.

## When to Use

- Onboarding to a new codebase and wanting to map its conceptual architecture before diving into code
- Bootstrapping an agentic system from an existing project — turning implicit workflows into explicit skill/agent/team definitions
- Studying a project's organizational DNA for cross-pollination into other projects
- Creating a skill/agent/team library inspired by a reference implementation without copying it
- Understanding what a project's structure reveals about its creators' mental models and domain expertise

## Inputs

- **Required**: Path to the repository or project root directory
- **Required**: Purpose statement — why is essence being extracted? (onboarding, bootstrapping, study, or cross-pollination)
- **Optional**: Focus domains — specific areas of the project to concentrate on (default: all)
- **Optional**: Output depth — `survey` (prospect + assay only), `extract` (full procedure), or `report` (extraction + written report) (default: `extract`)
- **Optional**: Maximum extractions — cap on total skills + agents + teams to produce (default: 15)

## The Ore Test

The central quality criterion for all extraction:

> **Could this concept exist in a completely different implementation?**
>
> If YES — it is **metal** (essence). Extract it.
> If NO — it is **gangue** (implementation detail). Leave it behind.

Example: A weather app's concept "integrate external data source" is metal — it applies to any project fetching third-party data. But "parse OpenWeatherMap v3 JSON response" is gangue — it is specific to one API.

Extracted skills should describe the CLASS of task, not the specific instance. Extracted agents should describe the ROLE, not the person. Extracted teams should describe the COORDINATION PATTERN, not the org chart.

## Procedure

### Step 1: Prospect — Survey the Ore Body

Survey the repository structure without judgment. Map the terrain before mining.

1. Glob the directory tree to understand the project's shape:
   - Source directories and their organization pattern (by feature, by layer, by domain)
   - Configuration files: `package.json`, `DESCRIPTION`, `setup.py`, `Cargo.toml`, `go.mod`, `Makefile`
   - Documentation: `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, architecture docs
   - CI/CD: `.github/workflows/`, `Dockerfile`, deployment configs
   - Test directories and their structure
2. Read the project's self-description (README, package manifest) to understand its declared purpose
3. Count files by type/language to gauge scope and identify the primary technology
4. Identify the project's boundary — where it begins and ends, what it depends on vs what it provides
5. Produce the **Prospect Report**:

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

**Expected:** A factual survey — what is here, how large, what does the project claim to be. No classification or judgment yet. The report reads like a geological survey, not a review.

**On failure:** If the repository has no README or manifest, infer purpose from directory names, file contents, and test descriptions. If the project is too large (>1000 source files), narrow the scope to the most active directories (use git log frequency or README references).

### Step 2: Assay — Analyze the Composition

Read representative files to understand what the project DOES at the conceptual level.

1. Sample 5-10 representative files from different areas of the project — not exhaustive, but diverse:
   - Entry points (main files, route handlers, CLI commands)
   - Core logic (the most-imported or most-referenced modules)
   - Tests (they reveal intended behavior more clearly than implementation)
   - Configuration (reveals operational concerns and deployment context)
2. For each sampled area, identify:
   - **Domains**: What subject areas does the project touch? (e.g., "authentication", "data transformation", "reporting")
   - **Verbs**: What actions does the project perform? (e.g., "validate", "transform", "deploy", "notify")
   - **Roles**: What human or system actors does the code serve? (e.g., "data engineer", "end user", "reviewer")
   - **Flows**: What sequences of actions form workflows? (e.g., "ingest → validate → transform → store")
3. For each finding, classify as:
   - **Essential**: Would exist in any implementation solving this problem
   - **Accidental**: Specific to this implementation's technology choices
4. Produce the **Assay Report**: a table of domains, verbs, roles, and flows with essential/accidental tags

**Expected:** A conceptual map of the project that reads like a domain glossary, not a code walkthrough. Someone unfamiliar with the tech stack should understand what the project does from this report.

**On failure:** If the codebase is opaque (heavy metaprogramming, generated code, or obfuscated), lean on tests and documentation rather than source code. If no tests exist, read commit messages for intent.

### Step 3: Meditate — Release Implementation Bias

Pause to clear the cognitive anchoring from reading code.

1. Notice which framework, language, or architectural pattern is dominating your mental model — label it
2. Release attachment to the HOW: "This project uses React" becomes "This project has a user interface layer." "This uses PostgreSQL" becomes "This has persistent structured storage."
3. For each finding in the Assay Report, apply the Ore Test:
   - "integrate external data source" — could exist anywhere? YES → metal
   - "configure Axios interceptors" — could exist anywhere? NO → gangue
4. Rewrite any findings that failed the Ore Test at a higher abstraction level
5. If multiple perspectives help, consider the project through these lenses:
   - **Archaeologist**: What does the code's structure reveal about its creators' mental models?
   - **Biologist**: What is the replicable genome vs the specific phenotype?
   - **Music theorist**: What is the form (sonata, rondo) vs the specific notes?
   - **Cartographer**: What level of abstraction captures the useful topology?

**Expected:** The Assay Report is now free of framework-specific language. Every finding passes the Ore Test. The concepts feel portable — they could apply to a project in any language or framework.

**On failure:** If bias persists (findings keep referencing specific technologies), try inverting: "If this project were rewritten in a completely different stack, which concepts would survive?" Only those are metal.

### Step 4: Smelt — Separate Metal from Slag

The core extraction step. Classify each essential concept into skills, agents, or teams.

1. For each essential concept from the purified Assay Report, determine its type:

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
   - Assign a **generalized name** — not project-specific. "UserAuthService" becomes `identity-manager` (agent). "deployToAWS()" becomes `deploy-artifact` (skill).
   - Write a **one-line description** that makes sense without knowing the source project
   - Note the **source concept** it derives from (for traceability, not reproduction)
   - Apply the Ore Test one final time

3. Guard against common classification errors:
   - Not every function is a skill — look for PROCEDURES, not individual operations
   - Not every module is an agent — look for ROLES that require judgment
   - Not every collaboration is a team — look for COORDINATION PATTERNS with distinct specialties
   - Most projects yield 3-8 skills, 2-4 agents, and 0-2 teams. If you have 20+, you are extracting too fine.

**Expected:** A classified inventory where each item has a type (skill/agent/team), a generalized name, and a one-line description. No item references the source project's specific technologies, APIs, or data structures.

**On failure:** If classification is ambiguous (is this a skill or an agent?), ask: "Is this about DOING something (skill) or BEING someone who does things (agent)?" A skill is a recipe; an agent is a chef. If still unclear, default to skill — skills are easier to compose later.

### Step 5: Heal — Verify Extraction Quality

Assess whether the extraction is honest — neither too much nor too little.

1. **Over-extraction check**: Read each extracted definition and ask:
   - Could someone reconstruct the original project's proprietary logic from this? → Too much detail
   - Does this reference specific libraries, APIs, database schemas, or file paths? → Still gangue
   - Is this a full implementation procedure or a concept-level sketch? → Should be sketch

2. **Under-extraction check**: Show only the extracted definitions (without the source project) and ask:
   - Could someone understand what KIND of project inspired these? → Should be yes
   - Do the definitions capture the project's essential nature? → Should be yes
   - Are there major project capabilities not represented? → Should be no

3. **Generalization check**: For each definition:
   - Would the name make sense in a different tech stack? → Should be yes
   - Is the description framework-agnostic? → Should be yes
   - Could this definition be useful to a project in a completely different domain? → Ideally yes

4. **Balance check**: Review the extraction ratios:
   - 3-8 skills, 2-4 agents, 0-2 teams is typical for a focused project
   - Fewer than 3 total extractions suggests under-extraction
   - More than 15 total suggests over-extraction or insufficient generalization

**Expected:** Confidence that the extraction is at the right level of abstraction. Each definition is a seed that could grow in different soil, not a cutting that only survives in the original garden.

**On failure:** If over-extracted, raise the abstraction level — merge specific skills into broader ones, collapse similar agents into a single role. If under-extracted, return to Step 2 and sample additional files. If generalization check fails, strip technology references and rewrite descriptions.

### Step 6: Cast — Pour the Metal into Forms

Produce the agentskills.io-standard output documents.

1. For each extracted **skill**, write a skeletal definition:

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

2. For each extracted **agent**, write a skeletal definition:

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. For each extracted **team**, write a skeletal definition:

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. Compile all extractions into the **Assay Report** — a single document with sections for Skills, Agents, and Teams, plus a summary table

**Expected:** A structured report containing all extracted definitions in agentskills.io format. Each definition is skeletal (concept-level, not implementation-level) and could serve as a starting point for the `create-skill`, `create-agent`, or `create-team` skills to flesh out.

**On failure:** If the output exceeds 15 items, prioritize by centrality — keep the concepts that are most unique to this project's domain. Generic concepts (like "manage-configuration") that exist in most projects should be dropped unless they have an unusual twist.

### Step 7: Temper — Final Validation

Verify the complete extraction and produce the summary.

1. Count the extractions: N skills, N agents, N teams
2. Assess coverage: do they span the project's major domains?
3. Verify independence: read each definition WITHOUT the source project context — does it stand alone?
4. Run the Ore Test one final time on the complete set:

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

5. Produce the final summary:
   - Total extractions (skills / agents / teams)
   - Coverage assessment (which project domains are represented)
   - Confidence level (high / medium / low) with rationale
   - Suggested next steps: which extracted definitions are ready to flesh out first

**Expected:** A validated Assay Report with a summary table, confidence assessment, and actionable next steps. The report is self-contained — someone who has never seen the source project can read it and understand the extracted concepts.

**On failure:** If more than 20% of items fail the final Ore Test, return to Step 4 (Smelt) and re-extract at a higher abstraction level. If coverage is below 60% of identified domains, return to Step 2 (Assay) and sample additional files.

## Validation Checklist

- [ ] Prospect report covers project structure, languages, size, and declared purpose
- [ ] Assay identifies domains, verbs, roles, and flows with essential/accidental classification
- [ ] Meditate checkpoint clears implementation bias — no framework-specific language in outputs
- [ ] Every extracted element passes the Ore Test (essence, not implementation detail)
- [ ] Skills are named with verbs, agents with nouns, teams with group descriptors
- [ ] All names are generalized — no project-specific references
- [ ] Extraction count is within typical range (5-15 total, not 1 and not 30)
- [ ] Output definitions follow agentskills.io format (frontmatter + sections)
- [ ] Over-extraction and under-extraction checks both pass
- [ ] Final Temper assessment includes count, coverage, confidence, and next steps
- [ ] The complete Assay Report is understandable without access to the source project

## Common Pitfalls

- **Mirroring the directory structure**: Producing one skill per source file instead of extracting cross-cutting concepts. The metal should reflect the project's CONCEPTUAL structure, not its file system. A 20-file project does not have 20 skills.
- **Framework worship**: Extracting "configure-nextjs-api-routes" instead of "define-api-endpoints". Strip the framework; keep the pattern. The Ore Test catches this: "Could this exist without Next.js?" If no, it's gangue.
- **Role inflation**: Creating an agent for every module. Most projects have 2-5 genuine roles requiring distinct expertise, not 20. Look for JUDGMENT and COMMUNICATION STYLE differences, not just functional differences.
- **Skipping the Ore Test**: The single biggest failure mode. Every output must pass: "Could this concept exist in a completely different implementation?" If it references specific libraries, APIs, or data schemas, it is slag, not metal.
- **Producing implementation guides**: Extracted skills should be CONCEPT-LEVEL sketches (3-5 high-level steps), not full implementation procedures. They are seeds to be fleshed out with `create-skill`, not finished products. A 50-step extraction is a reproduction, not an essence.
- **Under-generalizing names**: "UserAuthService" is a class name, not a concept. "identity-manager" is a role. "manage-user-identity" is a skill. Generalize from the specific to the universal.
- **Ignoring coordination patterns**: Teams are the hardest to extract because coordination is often implicit. Look for code review workflows, deployment pipelines, data handoffs between systems, and approval chains — these reveal team structures.

## Related Skills

- `athanor` — When metal reveals the project needs transformation, not just essence extraction
- `chrysopoeia` — Value extraction at the code level; metal works at the conceptual level above code
- `transmute` — Converting extracted concepts between domains or paradigms
- `create-skill` — Flesh out extracted skill sketches into full SKILL.md implementations
- `create-agent` — Flesh out extracted agent sketches into full agent definitions
- `create-team` — Flesh out extracted team sketches into full team compositions
- `observe` — Deeper observation when the prospect phase reveals an unfamiliar domain
- `analyze-codebase-for-mcp` — Complementary: metal extracts concepts, analyze-codebase-for-mcp extracts tool surfaces
- `review-codebase` — Complementary: metal extracts essence, review-codebase evaluates quality
