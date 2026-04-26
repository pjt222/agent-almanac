---
name: metal
locale: caveman-ultra
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

Extract conceptual DNA of repo → roles + procedures + coordination patterns as generalized agentskills.io defs. Like noble metal from ore, separate IS (essence) from DOES (impl) → reusable skill/agent/team defs capturing organizational genome w/o reproducing codebase.

## Use When

- Onboard new codebase → map conceptual architecture before code
- Bootstrap agentic system from existing project — implicit workflows → explicit defs
- Study project's organizational DNA for cross-pollination
- Build skill/agent/team library inspired by reference, no copy
- Project structure reveals creators' mental models + domain expertise

## In

- **Required**: Path to repo/project root
- **Required**: Purpose statement — why extract? (onboard/bootstrap/study/cross-pollinate)
- **Optional**: Focus domains (default: all)
- **Optional**: Output depth — `survey` (prospect+assay), `extract` (full), `report` (extract+written) (default: `extract`)
- **Optional**: Max extractions cap (default: 15)

## Ore Test

Central quality criterion:

> **Could concept exist in completely different impl?**
>
> YES → **metal** (essence). Extract.
> NO → **gangue** (impl detail). Leave.

Ex: weather app's "integrate external data source" = metal (any third-party fetch). "parse OpenWeatherMap v3 JSON res" = gangue (one API).

Skills = CLASS of task not instance. Agents = ROLE not person. Teams = COORDINATION PATTERN not org chart.

## Do

### Step 1: Prospect — Survey Ore Body

Survey repo structure, no judgment. Map terrain before mining.

1. Glob tree for shape:
   - Source dirs + org pattern (feature/layer/domain)
   - Config: `package.json`, `DESCRIPTION`, `setup.py`, `Cargo.toml`, `go.mod`, `Makefile`
   - Docs: `README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, architecture
   - CI/CD: `.github/workflows/`, `Dockerfile`, deploy configs
   - Tests + structure
2. Read self-description (README, manifest) → declared purpose
3. Count files by type/lang → scope + primary tech
4. Boundary — begins/ends, deps vs. provides
5. **Prospect Report**:

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

→ Factual survey. No classification yet. Reads like geological survey not review.

If err: no README/manifest → infer from dirs, file content, test descs. >1000 files → narrow to most active dirs (git log freq or README refs).

### Step 2: Assay — Composition

Read representative files → conceptual DOES.

1. Sample 5-10 representative files diverse, not exhaustive:
   - Entry points (main, route handlers, CLI cmds)
   - Core logic (most-imported/referenced)
   - Tests (intent > impl)
   - Config (operational + deploy ctx)
2. Per area:
   - **Domains**: subject areas ("auth", "data transformation", "reporting")
   - **Verbs**: actions ("validate", "transform", "deploy", "notify")
   - **Roles**: actors ("data engineer", "end user", "reviewer")
   - **Flows**: sequences ("ingest → validate → transform → store")
3. Classify each:
   - **Essential**: any impl solving this would have
   - **Accidental**: this impl's tech choices
4. **Assay Report**: domains/verbs/roles/flows + tags

→ Conceptual map reads like domain glossary not code walkthrough. Tech-stack-naive reader understands.

If err: opaque codebase (heavy metaprogramming, generated, obfuscated) → tests + docs over source. No tests → commit msgs for intent.

### Step 3: Meditate — Release Impl Bias

Pause + clear cognitive anchoring from reading code.

1. Notice dominating framework/lang/pattern → label
2. Release HOW: "uses React" → "has UI layer." "PostgreSQL" → "persistent structured storage."
3. Apply Ore Test on Assay findings:
   - "integrate external data source" → YES → metal
   - "configure Axios interceptors" → NO → gangue
4. Rewrite failures at higher abstraction
5. Multi-perspective lenses:
   - **Archaeologist**: structure → creators' mental models?
   - **Biologist**: replicable genome vs. specific phenotype?
   - **Music theorist**: form (sonata, rondo) vs. notes?
   - **Cartographer**: which abstraction level → useful topology?

→ Assay free of framework-specific lang. All findings pass Ore Test. Concepts portable to any lang/framework.

If err: bias persists → invert: "If rewritten in completely different stack, which concepts survive?" Only those = metal.

### Step 4: Smelt — Separate Metal from Slag

Core extraction. Classify into skill/agent/team.

1. Per essential concept, type:

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

2. Per extracted:
   - **Generalized name** — not project-specific. "UserAuthService" → `identity-manager` (agent). "deployToAWS()" → `deploy-artifact` (skill).
   - **One-line desc** standalone-readable
   - **Source concept** for traceability not reproduction
   - Apply Ore Test final time

3. Avoid classification errs:
   - Not every fn = skill — look for PROCEDURES not single ops
   - Not every module = agent — look for ROLES needing judgment
   - Not every collab = team — look for COORDINATION w/ distinct specialties
   - Most projects yield 3-8 skills, 2-4 agents, 0-2 teams. 20+ → too fine.

→ Classified inventory: type + generalized name + one-line desc. No source-specific tech/API/data refs.

If err: ambiguous (skill or agent?) → "DOING (skill) vs. BEING someone who does (agent)?" Skill = recipe, agent = chef. Unclear → default skill — easier to compose later.

### Step 5: Heal — Verify Quality

Honest extraction — neither too much nor too little.

1. **Over-extraction**: per def:
   - Reconstruct original proprietary logic? → too much detail
   - Refs specific libs/APIs/schemas/paths? → still gangue
   - Full impl proc or concept sketch? → should be sketch

2. **Under-extraction**: defs only (no source) ask:
   - Understand KIND of project that inspired? → yes
   - Capture essential nature? → yes
   - Major capabilities missing? → no

3. **Generalization**: per def:
   - Name in different stack? → yes
   - Desc framework-agnostic? → yes
   - Useful in completely different domain? → ideally yes

4. **Balance**: ratios:
   - 3-8 skills, 2-4 agents, 0-2 teams = typical focused
   - <3 total → under-extracted
   - >15 → over-extracted or insufficient generalization

→ Confidence right abstraction. Each def = seed for different soil, not cutting only surviving original garden.

If err: over-extracted → raise abstraction, merge specifics, collapse similar agents. Under-extracted → Step 2 + sample more. Generalization fails → strip tech refs, rewrite.

### Step 6: Cast — Pour Metal into Forms

Produce agentskills.io standard outputs.

1. Per **skill** skeletal:

```yaml
# Skill: [generalized-name]
name: [generalized-name]
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: [one-line, framework-agnostic]
domain: [closest domain from the 52 existing domains, or suggest a new one]
complexity: [basic/intermediate/advanced]
# Concept-level procedure (3-5 steps, NOT full implementation):
# Step 1: [high-level action]
# Step 2: [high-level action]
# Step 3: [high-level action]
# Derived from: [source concept in original project]
```

2. Per **agent** skeletal:

```yaml
# Agent: [role-name]
name: [role-name]
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. Per **team** skeletal:

```yaml
# Team: [group-name]
name: [group-name]
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. Compile all → **Assay Report** w/ Skills/Agents/Teams sections + summary table

→ Structured report w/ all defs in agentskills.io format. Each skeletal (concept not impl) → starting point for `create-skill`/`create-agent`/`create-team`.

If err: >15 items → priority by centrality, keep most unique to project's domain. Generic ("manage-configuration") drop unless unusual twist.

### Step 7: Temper — Final Validation

Verify complete extraction + summary.

1. Count: N skills, N agents, N teams
2. Coverage: span major domains?
3. Independence: read each w/o source ctx → stands alone?
4. Final Ore Test on complete set:

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

5. Final summary:
   - Total (skills/agents/teams)
   - Coverage (which domains represented)
   - Confidence (high/med/low) + rationale
   - Next steps: which defs ready to flesh out first

→ Validated Assay Report w/ table + confidence + actionable next steps. Self-contained — naive reader understands extracted concepts.

If err: >20% fail Ore Test → Step 4, re-extract higher abstraction. Coverage <60% → Step 2, sample more.

## Check

- [ ] Prospect: structure, langs, size, declared purpose
- [ ] Assay: domains, verbs, roles, flows + essential/accidental
- [ ] Meditate: bias cleared, no framework-specific lang
- [ ] All elements pass Ore Test (essence not impl)
- [ ] Skills = verbs, agents = nouns, teams = group descriptors
- [ ] All names generalized — no project-specific refs
- [ ] Count in typical range (5-15 total, not 1, not 30)
- [ ] Outputs follow agentskills.io format (frontmatter + sections)
- [ ] Over + under-extraction checks pass
- [ ] Temper: count + coverage + confidence + next steps
- [ ] Complete report understandable w/o source

## Traps

- **Mirror dir structure**: One skill per file → not cross-cutting concepts. Metal = CONCEPTUAL not filesystem. 20-file project ≠ 20 skills.
- **Framework worship**: "configure-nextjs-api-routes" instead of "define-api-endpoints". Strip framework, keep pattern. Ore Test catches: "Without Next.js?" No → gangue.
- **Role inflation**: Agent per module. Most projects = 2-5 genuine roles needing distinct expertise. Look JUDGMENT + COMMUNICATION STYLE differences, not just functional.
- **Skip Ore Test**: Biggest failure mode. Every output must pass: "Could concept exist in different impl?" Refs specific libs/APIs/schemas → slag.
- **Impl guides**: Skills = CONCEPT-LEVEL sketches (3-5 steps), not full procs. Seeds for `create-skill`, not finished. 50-step extraction = reproduction not essence.
- **Under-generalize names**: "UserAuthService" = class. "identity-manager" = role. "manage-user-identity" = skill. Specific → universal.
- **Ignore coordination**: Teams hardest because coordination implicit. Look review workflows, deploy pipelines, data handoffs, approval chains.

## →

- `athanor` — when metal reveals project needs transformation not just essence
- `chrysopoeia` — value extraction at code level; metal = conceptual level above code
- `transmute` — convert extracted concepts between domains/paradigms
- `create-skill` — flesh out extracted skill sketches → full SKILL.md
- `create-agent` — flesh out extracted agent sketches → full agent defs
- `create-team` — flesh out extracted team sketches → full team compositions
- `observe` — deeper observation when prospect reveals unfamiliar domain
- `analyze-codebase-for-mcp` — complementary: metal extracts concepts, that extracts tool surfaces
- `review-codebase` — complementary: metal extracts essence, that evaluates quality
