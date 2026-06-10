---
name: test-agentskills-alignment-format-audit
description: >
  Validate the agentskills-alignment team's hub-and-spoke coordination by
  tasking the team with a format compliance audit of the 10 most recently
  added skills. The skill-reviewer lead decomposes the audit into format,
  standards, structural, and registry checks, distributes to members,
  and synthesizes a unified findings report. Includes a mid-task scope
  change to test lead-driven adaptation.
test-level: team
target: agentskills-alignment
coordination-pattern: hub-and-spoke
team-size: 4
version: "1.0"
author: Philipp Thoss
created: 2026-03-09
tags: [agentskills-alignment, hub-and-spoke, format, compliance, audit, skills]
---

# Test: AgentSkills Alignment Format Audit

The agentskills-alignment team — skill-reviewer (lead), senior-researcher,
senior-software-developer, and librarian — audits the 10 most recently added
skills for format compliance, cross-reference integrity, and registry
consistency. Hub-and-spoke is the most common coordination pattern (used by
5 teams) but has never been tested.

## Objective

Validate that the hub-and-spoke pattern produces clear task decomposition by
the lead, independent member execution within their specialties, and lead
synthesis into a unified report. The audit task is chosen because format
compliance is binary (pass/fail per criterion) and ground truth is verifiable
against the agentskills.io specification and repository conventions.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/_registry.yml` exists and lists >= 299 skills
- [ ] The 10 most recently added skills can be identified (by `created` date or git log)
- [ ] `tests/_template.md` and `skills/create-skill/SKILL.md` exist as reference standards
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **AgentSkills Alignment Team Task: Format Compliance Audit**
>
> Audit the 10 most recently added skills in this repository for compliance
> with the agentskills.io standard and repository conventions. Your audit
> should cover:
>
> 1. **Format Validation** (skill-reviewer): Verify each skill's YAML
>    frontmatter has all required fields (`name`, `description`,
>    `allowed-tools`, `metadata` with `author`, `version`, `domain`,
>    `complexity`, `language`, `tags`). Flag missing or malformed fields.
>
> 2. **Standards Compliance** (senior-researcher): Verify each skill has
>    all required sections (When to Use, Inputs, Procedure, Validation,
>    Common Pitfalls, Related Skills). Check that Procedure steps follow
>    the `**Expected:**` / `**On failure:**` pattern.
>
> 3. **Structural Quality** (senior-software-developer): Check line counts
>    (max 500 lines), verify skills needing `references/EXAMPLES.md` have
>    them, and assess whether procedure steps are at the right granularity
>    (not too fine, not too coarse).
>
> 4. **Registry Integrity** (librarian): Verify each audited skill has
>    a matching entry in `skills/_registry.yml` with correct `id`, `path`,
>    `complexity`, `language`, and `description`. Check domain assignments
>    against metadata tags.
>
> Deliver a single unified markdown report with a per-skill compliance
> table, categorized findings, and recommended fixes.

### Scope Change Trigger

Inject after the lead has distributed tasks and at least one member has
begun working:

> **Addendum — Symlink Verification**
>
> In addition to the above, check whether each of the 10 audited skills
> has a corresponding symlink in `.claude/skills/`. Report any missing
> symlinks as a separate findings category.

## Expected Behaviors

### Pattern-Specific Behaviors (Hub-and-Spoke)

From the coordination pattern definition in `tests/_registry.yml`:

1. **Lead performs initial task decomposition**: The skill-reviewer lead
   should analyze the audit scope and decompose it into subtasks aligned
   with each member's specialty before delegating.

2. **Subtasks assigned to individual members**: Each of the 4 audit
   dimensions (format, standards, structure, registry) should be assigned
   to a specific member, not worked on collectively.

3. **Members report results back to lead**: Each member should produce
   findings from their audit dimension and report them to the lead,
   not directly to the user.

4. **Lead synthesizes unified output**: The skill-reviewer lead should
   integrate all member findings into a single coherent report with
   consistent formatting and a combined compliance table.

### Task-Specific Behaviors

1. **Skill identification**: The team should identify the 10 most recent
   skills systematically (via registry dates, git log, or frontmatter
   `created` fields), not by guessing.

2. **Specialty alignment**: Format checking goes to the skill-reviewer,
   section completeness to the senior-researcher, structural metrics to
   the senior-software-developer, and catalog consistency to the librarian.

3. **Per-skill compliance table**: The final report should include a
   table showing each skill and its pass/fail status across all 4 audit
   dimensions.

4. **Actionable findings**: Each finding should name the skill, the
   specific violation, and a concrete fix.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Lead decomposes task | Skill-reviewer explicitly breaks audit into subtasks before member work begins | core |
| 2 | 4 distinct subtasks | Each member receives a different audit dimension matching their specialty | core |
| 3 | Independent member work | Members audit their dimension without duplicating others' work | core |
| 4 | Lead synthesizes report | Final output is a single report assembled by the lead, not 4 separate outputs | core |
| 5 | 10 skills identified | Exactly 10 skills selected with rationale for why they are the most recent | core |
| 6 | Compliance table produced | Report includes a per-skill pass/fail table across all 4 dimensions | core |
| 7 | Genuine findings | At least 3 real compliance issues found (format, section, or registry) | core |
| 8 | Scope change absorbed | Symlink check incorporated into the report without restarting the audit | core |
| 9 | Findings are actionable | Each finding names the skill, the violation, and a specific fix | bonus |
| 10 | No false positives | >= 80% of reported findings are genuine (verified against disk) | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Decomposition Quality | No visible decomposition; lead does everything or assigns randomly | Lead decomposes but mapping to member specialties is loose | Lead creates clear subtasks that precisely match each member's domain expertise |
| Member Specialization | Members produce generic output regardless of role | Members show some specialization but overlap significantly | Each member's output reflects deep domain knowledge unique to their role |
| Synthesis Quality | Raw concatenation of member outputs | Organized report but seams between member contributions visible | Seamless unified narrative with cross-referenced findings and consistent format |
| Finding Accuracy | Most findings are false positives or miss obvious issues | Mix of real and false findings; major issues caught | All findings verified accurate; subtle compliance issues detected |
| Adaptation Grace | Scope change causes confusion or full restart | Scope change absorbed with some friction | Scope change seamlessly delegated to appropriate member |

Total: /25 points.

## Ground Truth

Known facts for verifying finding accuracy. Verify before each test run
as the repository evolves.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total skills in registry | 299 | `grep total_skills skills/_registry.yml` |
| Required frontmatter fields | name, description, allowed-tools, metadata | agentskills.io specification |
| Required metadata fields | author, version, domain, complexity, language, tags | Repository convention |
| Required sections | When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills | `skills/create-skill/SKILL.md` |
| Max line count | 500 | CLAUDE.md validation rules |
| Symlink directory | `.claude/skills/` | CLAUDE.md conventions |
| Procedure step pattern | `**Expected:**` and `**On failure:**` blocks | `skills/create-skill/SKILL.md` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Audit task delivered to agentskills-alignment team
- T1: Lead completes task decomposition
- T2: Subtasks assigned to members
- T3: First member reports findings back to lead
- T4: Scope change injected
- T5: Scope change delegated (to which member?)
- T6: All members report back
- T7: Lead delivers unified report

### Hub Communication Log

| Time | Direction | From | To | Content Summary |
|------|-----------|------|----|-----------------|
| T1 | Outbound | Lead | All | Task decomposition and assignments |
| T3 | Inbound | Member X | Lead | First findings report |
| T4 | Outbound | Lead | Member Y | Scope change delegation |
| ... | ... | ... | ... | ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-alignment-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Decomposition | Lead analyzes audit scope |
| HH:MM | Assignment | Subtasks distributed to members |
| HH:MM | Execution | Members begin independent audits |
| HH:MM | Scope change | Symlink addendum injected |
| HH:MM | Adaptation | Lead delegates to ... |
| HH:MM | Reporting | Members report findings to lead |
| HH:MM | Synthesis | Lead integrates unified report |
| HH:MM | Delivery | Report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Lead decomposes task | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | 4 distinct subtasks | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Independent member work | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Lead synthesizes report | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | 10 skills identified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Compliance table produced | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Genuine findings (>=3) | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Findings are actionable | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | No false positives (>=80%) | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Decomposition Quality | /5 | ... |
| Member Specialization | /5 | ... |
| Synthesis Quality | /5 | ... |
| Finding Accuracy | /5 | ... |
| Adaptation Grace | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Expanded scope (20 skills)** — Double the audit scope to
  test whether hub-and-spoke scales linearly or introduces coordination
  overhead.

- **Variant B: Focused audit (format only)** — Restrict to format
  validation only, giving all 4 members the same dimension. Tests whether
  the pattern handles homogeneous subtasks differently.

- **Variant C: Cross-pattern comparison** — Run the same audit with the
  opaque team (adaptive pattern) to compare hub-and-spoke vs adaptive
  effectiveness on structured audit tasks.

- **Variant D: Missing lead** — Remove the skill-reviewer lead and
  observe whether a member self-promotes or the pattern breaks down.
