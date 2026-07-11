---
name: test-review-skill-format-batch
description: >
  Validate the review-skill-format skill by running it on 5 skills spanning
  different domains. Tests whether the 6-step review procedure produces
  consistent, accurate format compliance reports across r-packages, devops,
  esoteric, compliance, and containerization domains. Batch execution tests
  procedural consistency when the same skill is applied repeatedly.
test-level: skill
target: review-skill-format
category: E
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [review-skill-format, skill-test, format, compliance, batch]
---

# Test: Review Skill Format (Batch Cross-Domain)

Run the `review-skill-format` skill on 5 skills from different domains to
validate that the format review procedure produces consistent compliance
reports regardless of domain. The batch approach tests procedural consistency
— the same 6 steps should yield the same report structure each time.

## Objective

Validate that the review-skill-format skill's 6-step procedure (file check,
frontmatter fields, required sections, procedure step format, line count,
registry sync) produces accurate and consistent results when applied to
skills of varying complexity, domain, and size. Batch execution reveals
whether the procedure degrades or drifts across repeated applications.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/review-skill-format/SKILL.md` exists and is complete
- [ ] All 5 target skills exist:
  - `skills/create-r-package/SKILL.md`
  - `skills/setup-github-actions-ci/SKILL.md`
  - `skills/meditate/SKILL.md`
  - `skills/conduct-gxp-audit/SKILL.md`
  - `skills/create-dockerfile/SKILL.md`
- [ ] `skills/_registry.yml` is present and current

## Task

### Primary Task

> **Skill Task: Batch Format Review**
>
> Run the `review-skill-format` skill on each of these 5 skills, in order:
>
> 1. `skills/create-r-package/SKILL.md` (r-packages domain)
> 2. `skills/setup-github-actions-ci/SKILL.md` (devops domain)
> 3. `skills/meditate/SKILL.md` (esoteric domain)
> 4. `skills/conduct-gxp-audit/SKILL.md` (compliance domain)
> 5. `skills/create-dockerfile/SKILL.md` (containerization domain)
>
> For each skill, follow all 6 steps of the procedure. Produce a compliance
> report for each with BLOCKING/SUGGEST/OK status per check. After all 5
> are reviewed, produce a summary comparison table.

### Scope Change Trigger

Inject after the 3rd skill review (meditate) completes:

> **Addendum — Strictness Comparison**
>
> For the remaining 2 skills, run the review in both `strict` and `lenient`
> modes. Report any differences in findings between modes.

## Expected Behaviors

### Procedure-Specific Behaviors

Since this is a skill-level test, expected behaviors map to procedure steps:

1. **Step 1 (File Check)**: Confirms each SKILL.md exists and reports
   its line count.

2. **Step 2 (Frontmatter)**: Checks all 4 required fields (name,
   description, license, allowed-tools) and 6 metadata fields for each skill.

3. **Step 3 (Sections)**: Verifies all 6 required sections (When to Use,
   Inputs, Procedure, Validation, Common Pitfalls, Related Skills).

4. **Step 4 (Step Format)**: Checks each procedure step for Expected
   and On failure blocks.

5. **Step 5 (Line Count)**: Verifies each skill is within 500 lines.

6. **Step 6 (Registry)**: Confirms each skill is in `_registry.yml`
   with correct domain, path, and metadata.

### Task-Specific Behaviors

1. **Consistent report structure**: All 5 reports should use the same
   format — findings should not drift in structure across iterations.

2. **Domain-appropriate assessment**: The esoteric skill (meditate) may
   have unconventional content but should still meet format requirements.

3. **Accurate finding severity**: BLOCKING for missing required fields/
   sections, SUGGEST for style improvements, OK for passing checks.

4. **Summary comparison**: Final table comparing all 5 skills side-by-side.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | All 5 skills reviewed | A report produced for each of the 5 targets | core |
| 2 | Frontmatter checked per skill | Required and metadata fields evaluated for each | core |
| 3 | Sections checked per skill | All 6 required sections verified for each | core |
| 4 | Step format checked | Expected/On failure blocks verified for procedure steps | core |
| 5 | Line count checked | Each skill's line count reported and compared to 500 limit | core |
| 6 | Registry sync checked | Each skill verified in `_registry.yml` | core |
| 7 | Consistent report format | All 5 reports follow the same structure | core |
| 8 | Accurate findings | No false BLOCKING on compliant skills; no missed issues | core |
| 9 | Summary comparison produced | Cross-skill table after all reviews | bonus |
| 10 | Strictness modes compared | Scope change: strict vs. lenient differences reported | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Steps skipped or inconsistently applied across skills | All 6 steps for each skill but varying depth | Full 6-step procedure applied identically to all 5 skills |
| Consistency | Reports differ in structure across the 5 skills | Mostly consistent with minor format drift | Identical structure; only findings differ |
| Accuracy | False BLOCKING findings or missed format issues | Mostly correct with 1-2 misclassifications | Zero misclassifications; severity correctly assigned |
| Batch Efficiency | Each review restarts from scratch with no learning | Some cross-referencing between reviews | Efficient execution with clear summary comparing results |
| Scope Change Handling | Ignores strict/lenient comparison | Acknowledges but superficial comparison | Clear side-by-side showing exactly what lenient mode relaxes |

Total: /25 points.

## Ground Truth

Known facts about the 5 target skills for verifying review accuracy.

| Skill | Domain | Expected Compliance | Known Issues |
|-------|--------|--------------------|----|
| create-r-package | r-packages | High (authored by project creator) | None expected |
| setup-github-actions-ci | devops | High | None expected |
| meditate | esoteric | High (format-compliant despite unconventional content) | None expected |
| conduct-gxp-audit | compliance | High | None expected |
| create-dockerfile | containerization | High | None expected |

All 5 skills should pass format review since they are established skills in
the repository. Any BLOCKING findings indicate a real format issue that should
be investigated.

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Batch review begins
- T1-T5: Each skill review completion
- T6: Scope change injected (after T3)
- T7: Summary comparison produced
- T8: Final delivery

### Recording Template

```markdown
## Run: YYYY-MM-DD-review-skill-format-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Per-Skill Results
| # | Skill | Lines | Frontmatter | Sections | Steps | Registry | Verdict |
|---|-------|-------|-------------|----------|-------|----------|---------|
| 1-5 | [skill name] | NNN | OK/ISSUE | OK/ISSUE | OK/ISSUE | OK/ISSUE | PASS/FAIL |

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use Acceptance Criteria and Scoring Rubric tables above]

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Single domain batch** — Review all 10 r-packages skills
  to test within-domain consistency.

- **Variant B: Intentionally broken skill** — Create a temporary skill
  with known format violations, include it in the batch, verify detection.

- **Variant C: Full registry audit** — Run on all 361 skills (as of
  2026-07; re-derive from the registries) to test
  scalability and aggregate compliance metrics.

- **Variant D: Lenient mode only** — Run all 5 in lenient mode to
  characterize the difference from strict mode across domains.
