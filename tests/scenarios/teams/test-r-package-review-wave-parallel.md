---
name: test-r-package-review-wave-parallel
description: >
  Validate the wave-parallel coordination pattern by running the r-package-review
  team with tasks organized into dependency waves. Wave 1 (parallel): code-reviewer
  and security-analyst audit independently. Wave 2 (dependent): senior-software-developer
  reviews architecture informed by Wave 1 findings. Wave 3 (synthesis): lead integrates.
  Tests wave-parallel as an overlay on a hub-and-spoke team.
test-level: team
target: r-package-review
coordination-pattern: wave-parallel
team-size: 4
category: C
duration-tier: medium
priority: P0
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [r-package-review, wave-parallel, dependency-waves, overlay-pattern, review]
---

# Test: Wave-Parallel Package Review

The r-package-review team reviews the agent-almanac project's infrastructure
(package.json, scripts/, YAML registries) using the wave-parallel coordination
pattern instead of its native hub-and-spoke. Tasks are organized into dependency
waves: independent audits first, then architecture review informed by Wave 1
findings, then lead synthesis. This tests whether coordination patterns can be
applied as overlays on existing teams.

## Objective

Validate that the wave-parallel coordination pattern correctly groups tasks by
dependency level, executes parallel work within each wave, maintains sequential
ordering across waves, and respects cross-wave dependencies. Additionally, validate
that a team designed for hub-and-spoke can operate under wave-parallel coordination
without loss of quality. This is the only test of wave-parallel, a pattern with
no dedicated team.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `package.json`, `scripts/generate-readmes.js`, `scripts/validate-integrity.sh` exist
- [ ] All four YAML registries exist and are parseable
- [ ] The r-package-review team definition is accessible at `teams/r-package-review.md`
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **R Package Review Task: Infrastructure Quality Review (Wave-Parallel)**
>
> Review the agent-almanac project's infrastructure layer as if it were an R
> package's supporting toolchain. Organize your work into dependency waves:
>
> **Wave 1 (Independent, Parallel)**:
> - **Code Reviewer**: Audit `scripts/generate-readmes.js` and `scripts/validate-integrity.sh`
>   for code quality, error handling, readability, and maintainability. Review the
>   npm scripts in `package.json` for consistency.
> - **Security Analyst**: Audit CI workflows for secret handling, permission scoping,
>   and supply chain security. Check `package.json` dependencies for known
>   vulnerabilities. Review `scripts/` for injection risks.
>
> **Wave 2 (Depends on Wave 1 findings)**:
> - **Senior Software Developer**: Review the overall infrastructure architecture —
>   how CI workflows, scripts, registries, and symlinks compose into a validation
>   system. Use Wave 1 findings to identify architectural patterns (good or bad)
>   that the code-level and security-level reviews surfaced. Assess technical debt.
>
> **Wave 3 (Synthesis, depends on all previous)**:
> - **R Developer (Lead)**: Integrate findings from all three waves into a unified
>   review report. Prioritize findings by severity. Identify cross-cutting themes.
>   Recommend a prioritized improvement roadmap.
>
> Each wave must complete before the next begins. Within Wave 1, the two members
> work independently.

### Scope Change Trigger

Inject after Wave 1 completes but before Wave 2 begins:

> **Addendum**: The `validate-integrity.sh` script was just added and hasn't been
> reviewed by the team before. Ensure the Wave 2 architecture review specifically
> assesses how this new script fits into the existing validation ecosystem and
> whether it duplicates any checks from the CI workflows.

## Expected Behaviors

### Pattern-Specific Behaviors (Wave-Parallel)

1. **Tasks grouped by dependency level**: Three distinct waves visible in execution
2. **Parallel execution within each wave**: Wave 1 members work concurrently (code-reviewer and security-analyst)
3. **Waves execute sequentially**: Wave 2 does not start until Wave 1 is complete
4. **Dependencies respected across waves**: Wave 2 explicitly references Wave 1 findings

### Task-Specific Behaviors

1. **Wave boundary enforcement**: Clear demarcation between waves — not a continuous stream of work
2. **Cross-wave information flow**: Wave 2 uses Wave 1 outputs as inputs, visibly
3. **Overlay viability**: Team operates effectively under wave-parallel despite being designed for hub-and-spoke
4. **Self-referential accuracy**: Findings about scripts and workflows should be factually correct

## Acceptance Criteria

Threshold: PASS if >= 8/11 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Three waves visible | Execution has 3 distinct phases with clear boundaries | core |
| 2 | Wave 1 parallel | Code-reviewer and security-analyst work concurrently, not sequentially | core |
| 3 | Wave 2 waits for Wave 1 | Architecture review explicitly begins after Wave 1 completion | core |
| 4 | Wave 2 uses Wave 1 output | Senior developer references specific Wave 1 findings | core |
| 5 | Wave 3 integrates all | Lead synthesizes findings from all waves, not just Wave 2 | core |
| 6 | No premature cross-wave work | No member starts their wave's work before the prerequisite wave completes | core |
| 7 | Factually accurate findings | At least 3 findings verifiable against actual files | core |
| 8 | Scope change absorbed | New script review incorporated into Wave 2 without restarting Wave 1 | core |
| 9 | Overlay pattern works | Team quality is comparable to hub-and-spoke (no degradation from pattern change) | bonus |
| 10 | Severity prioritization | Final report ranks findings by severity | bonus |
| 11 | Cross-cutting themes | Lead identifies patterns that span multiple waves (e.g., both code and security flagged same issue) | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Wave structure | No clear wave boundaries; continuous work | Waves present but boundaries are soft | Three crisp waves with explicit start/end markers |
| Intra-wave parallelism | Wave 1 members work sequentially | Wave 1 members mostly independent with minor sequencing | Wave 1 members fully independent, zero wait time |
| Cross-wave dependencies | Wave 2 ignores Wave 1 output | Wave 2 references Wave 1 findings generically | Wave 2 cites specific Wave 1 findings and builds on them |
| Synthesis quality | Lead concatenates wave outputs | Lead summarizes with some cross-wave connections | Lead identifies cross-cutting themes and resolves conflicts |
| Overlay adaptability | Team struggles with unfamiliar pattern | Team adapts but loses some coordination quality | Team executes wave-parallel as smoothly as native pattern |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Scripts on disk | generate-readmes.js, validate-integrity.sh | `scripts/` directory |
| npm dependencies | js-yaml (devDependency) | `package.json` |
| CI workflows | 5 files | `.github/workflows/` |
| validate-integrity checks | 10 (A1-A5, B1-B5) | `scripts/validate-integrity.sh` |
| skills-ref pinned to | commit SHA 752b29a0a1a1 | `validate-skills.yml` |
| Symlink count checked by B1 | 299 skills | validate-integrity.sh output |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Task assigned
- T1: Wave 1 begins (code-reviewer and security-analyst start)
- T2: Wave 1 completes (both members finish)
- T3: Scope change injected
- T4: Wave 2 begins (senior-software-developer starts, referencing Wave 1)
- T5: Wave 2 completes
- T6: Wave 3 begins (lead synthesis)
- T7: Final report delivered

### Wave Execution Log

| Wave | Members | Start | End | Parallel? | Used Prior Wave Output? |
|------|---------|-------|-----|-----------|------------------------|
| 1 | code-reviewer, security-analyst | | | Y/N | N/A |
| 2 | senior-software-developer | | | N/A | Y/N |
| 3 | r-developer (lead) | | | N/A | Y/N |

### Recording Template

```markdown
## Run: YYYY-MM-DD-r-package-review-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | ... | ... |

### Wave Dependency Map
Wave 1 findings used by Wave 2:
- Finding: "..." -> Referenced in architecture review: Y/N
- Finding: "..." -> Referenced in architecture review: Y/N

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | ... | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| ... | /5 | ... |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A**: Run the same task using the team's native hub-and-spoke pattern, then compare quality and duration against wave-parallel
- **Variant B**: Add a Wave 1.5 (dependent on code-reviewer only, not security-analyst) to test asymmetric dependencies
- **Variant C**: Reverse the wave order (architecture first, then code+security) to test whether dependency direction matters
