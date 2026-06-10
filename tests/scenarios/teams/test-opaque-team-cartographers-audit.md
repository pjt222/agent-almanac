---
name: test-opaque-team-cartographers-audit
description: >
  Validate the opaque team's adaptive self-organization by tasking 4 shapeshifters
  with auditing the knowledge graph integrity of the agent-almanac repository.
  The task naturally requires multiple distinct roles, includes a mid-task scope
  change, and produces verifiable findings against known ground truth.
test-level: team
target: opaque-team
coordination-pattern: adaptive
team-size: 4
version: "1.0"
author: Philipp Thoss
created: 2026-03-06
tags: [opaque-team, adaptive, knowledge-graph, cross-references, audit, cartography]
---

# Test: The Cartographer's Audit

Four shapeshifters audit the relationship integrity of the agent-almanac
knowledge graph — the web of cross-references between skills, agents, teams,
and guides. The task forces role emergence, tests mid-task adaptation, and
produces findings verifiable against known ground truth.

## Objective

Validate that the opaque team's adaptive coordination pattern produces
genuine role differentiation, maintains opacity (unified external interface),
and adapts gracefully when task scope changes mid-execution. The audit
task is chosen because its output — broken references, orphan nodes,
non-reciprocal links — is objectively verifiable.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] All four registries exist and are parseable (`skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`, `guides/_registry.yml`)
- [ ] Current registry counts verified: 297 skills, 62 agents, 12 teams, 14 guides
- [ ] No open PRs that modify registry files
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **Opaque Team Task: Knowledge Graph Integrity Audit**
>
> Audit the relationship integrity of this repository's knowledge graph.
> The repository contains four content types (skills, agents, teams, guides)
> connected by cross-references. Your audit should cover:
>
> 1. **Broken References**: Find all internal cross-references (relative links,
>    skill mentions, agent references, team member lists) that point to
>    files or entries that do not exist on disk.
>
> 2. **Orphan Nodes**: Identify skills, agents, or teams that are registered
>    in their `_registry.yml` but never referenced by any other file
>    (no guide mentions them, no agent lists them, no team includes them,
>    no skill cross-references them).
>
> 3. **Non-Reciprocal Cross-References**: Find cases where file A references
>    file B, but file B does not reference file A back, in contexts where
>    reciprocity is expected (e.g., Related Skills sections, See Also sections,
>    agent skill lists vs. skill registry entries).
>
> 4. **Registry Integrity**: Verify that every file on disk has a matching
>    registry entry, and every registry entry has a matching file on disk.
>    Flag count mismatches.
>
> 5. **Remediation Plan**: For each class of finding, propose specific fixes
>    prioritized by severity (broken > orphan > non-reciprocal).
>
> Deliver a single unified markdown report with numbered findings,
> data tables, and a prioritized remediation plan.

### Scope Change Trigger

Inject after the team has begun execution (after role assignment is visible):

> **Addendum — Section 6: Self-Referential Consistency**
>
> In addition to the above, audit the opaque team's own definition file
> (`teams/opaque-team.md`) and the shapeshifter agent definition
> (`agents/shapeshifter.md`) for internal consistency: Do the skills listed
> in the shapeshifter's frontmatter actually exist? Does the opaque team's
> member list match what the teams registry says? Are the See Also
> cross-references valid?

## Expected Behaviors

### Pattern-Specific Behaviors (Adaptive)

From the coordination pattern definition in `tests/_registry.yml`:

1. **Role emergence**: Roles emerge from task analysis, not pre-assignment.
   The lead shapeshifter should assess the audit task and assign roles
   based on what the work requires (e.g., "reference scanner", "graph
   analyst", "standards reviewer"), not based on a fixed roster.

2. **Documented role assignments**: Role assignments are documented as
   they form. The lead should state what role each member is taking and
   why, either in a planning phase or as assignments are made.

3. **Mid-task role shift**: When the scope change is injected, at least
   one member should absorb the new work without a full restart. This
   may involve the lead reassigning tasks or a member pivoting their role.

4. **Unified external interface**: The final output should be a single
   coherent report, not four separate outputs. The lead integrates
   member findings into a unified deliverable.

### Task-Specific Behaviors

1. **File system scanning**: At least one member should systematically
   scan the repository structure (skills/, agents/, teams/, guides/)
   to build a complete inventory.

2. **Cross-reference extraction**: At least one member should parse
   markdown files to extract internal links and references.

3. **Registry comparison**: At least one member should compare registry
   entries against files on disk in both directions.

4. **Quantified findings**: The report should include counts (not just
   examples) — total broken refs, total orphans, total non-reciprocal.

## Acceptance Criteria

Threshold: PASS if >= 8/12 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Role emergence | Lead explicitly assigns or describes emerged roles before execution begins | core |
| 2 | 3+ distinct roles | At least 3 meaningfully different roles assigned (not just "member 1/2/3") | core |
| 3 | Broken refs found | At least 5 genuine broken references identified (ground truth: ~9) | core |
| 4 | Orphan nodes found | At least 20 orphan skills/agents identified (ground truth: ~36) | core |
| 5 | Non-reciprocity quantified | Report includes a count of non-reciprocal cross-references | core |
| 6 | Registry integrity verified | All 4 registries checked for file-count consistency | core |
| 7 | Scope change absorbed | Section 6 (self-referential check) incorporated without full restart | core |
| 8 | Unified output | Single markdown report, not fragmented per-member outputs | core |
| 9 | Prioritized remediation | Remediation plan with severity ranking (broken > orphan > non-reciprocal) | bonus |
| 10 | Opacity maintained | External interaction is with the lead only; internal coordination is not surfaced as primary output | bonus |
| 11 | No false positives | At least 80% of reported findings are genuine (verified against ground truth) | bonus |
| 12 | Completed within reasonable time | Full audit completes (agent wallclock, not human time) | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Decomposition Quality | No visible task decomposition; members work randomly | Lead decomposes into subtasks but assignment is mechanical | Thoughtful decomposition that maps audit sections to member strengths |
| Role Fit | Roles are generic ("researcher 1/2/3") | Roles are named and relate to the task | Roles are specific, well-motivated, and non-overlapping |
| Discovery Depth | Finds < 5 total issues | Finds 10-30 issues across categories | Finds 30+ issues with accurate categorization |
| Adaptation Grace | Scope change causes confusion or restart | Scope change absorbed with some friction | Scope change seamlessly integrated via role adjustment |
| Report Quality | Raw data dump, no structure | Organized by section with tables | Clear narrative, quantified findings, actionable remediation |
| Opacity Effectiveness | Internal coordination leaked into output | Mostly unified but some seams visible | Seamless unified report; internal structure invisible |

Total: /30 points.

## Ground Truth

Known facts for verifying finding accuracy. These are approximate and may
shift as the repository evolves — verify before each test run.

| Category | Approximate Count | How to Verify |
|----------|------------------|---------------|
| Broken internal links | ~9 | `grep -r '\[.*\](.*\.md)' --include='*.md' \| while read ...; verify target exists` |
| Orphan skills (registered, never referenced elsewhere) | ~36 | Cross-reference `skills/_registry.yml` IDs against all non-registry .md files |
| Orphan agents (registered, never referenced by team or guide) | ~5 | Cross-reference `agents/_registry.yml` IDs against teams + guides |
| Non-reciprocal Related Skills | ~50+ | Parse Related Skills sections; check reverse direction |
| Registry count mismatches | 0 (should be clean) | `find skills -name SKILL.md \| wc -l` vs `total_skills` |
| Shapeshifter skills exist | 5/5 exist | Check each skill in shapeshifter.md frontmatter against disk |
| Opaque team registry match | Clean | Compare `teams/opaque-team.md` frontmatter with `teams/_registry.yml` |

Note: Ground truth counts are estimates. The test evaluates whether the team
finds issues *in the right ballpark*, not whether it matches exact counts.

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Task prompt delivered to opaque team
- T1: Lead completes form assessment (Phase 1)
- T2: Role assignments visible (Phase 2)
- T3: Scope change injected
- T4: Scope change absorbed (role adjustment visible)
- T5: Integration begins (Phase 4)
- T6: Final report delivered

### Role Emergence Log

| Time | Member | Assigned Role | Rationale (if stated) |
|------|--------|---------------|----------------------|
| T2 | #1 | ... | ... |
| T2 | #2 | ... | ... |
| T2 | #3 | ... | ... |
| T2 | #4 | ... | ... |

### Adaptation Log

| Time | Event | Response | Grace Level (1-5) |
|------|-------|----------|--------------------|
| T3 | Scope change injected | ... | ... |
| T4+ | Role adjustments | ... | ... |

### Ground Truth Verification

| Finding Category | Reported Count | Verified Count | Accuracy |
|-----------------|---------------|---------------|----------|
| Broken references | ... | ... | ...% |
| Orphan nodes | ... | ... | ...% |
| Non-reciprocal refs | ... | ... | ...% |
| Registry mismatches | ... | ... | ...% |
| Self-referential (Sec 6) | ... | ... | ...% |

### Recording Template

```markdown
## Run: YYYY-MM-DD-opaque-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Form assessment | Lead begins task analysis |
| HH:MM | Role assignment | Roles emerge: ... |
| HH:MM | Execution | Members begin audit work |
| HH:MM | Scope change | Addendum injected |
| HH:MM | Adaptation | Role adjustment observed |
| HH:MM | Integration | Lead synthesizes findings |
| HH:MM | Delivery | Report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Role emergence | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | 3+ distinct roles | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Broken refs found (>=5) | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Orphan nodes found (>=20) | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Non-reciprocity quantified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Registry integrity verified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Unified output | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Prioritized remediation | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Opacity maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 11 | No false positives (>=80%) | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 12 | Completed in time | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Decomposition Quality | /5 | ... |
| Role Fit | /5 | ... |
| Discovery Depth | /5 | ... |
| Adaptation Grace | /5 | ... |
| Report Quality | /5 | ... |
| Opacity Effectiveness | /5 | ... |
| **Total** | **/30** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Smaller team (2 shapeshifters)** — Tests whether the adaptive
  pattern degrades gracefully with fewer members. Expect merged roles and
  lower discovery depth.

- **Variant B: No scope change** — Omit the Section 6 addendum to isolate
  the base coordination pattern from adaptation testing.

- **Variant C: Adversarial ground truth** — Intentionally break 5 references
  before the test to create known-bad state. Verifies detection accuracy.

- **Variant D: Cross-team comparison** — Run the same task with a
  hub-and-spoke team (e.g., agentskills-alignment) to compare coordination
  pattern effectiveness on the same workload.
