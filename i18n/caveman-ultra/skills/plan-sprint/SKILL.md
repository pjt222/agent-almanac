---
name: plan-sprint
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan sprint: refine backlog, define goal, calc capacity, select items,
  decompose tasks. Output SPRINT-PLAN.md w/ goal, items, breakdown, capacity.
  Use → new sprint, re-plan after scope change, ad-hoc → sprint cadence,
  post-grooming sprint inclusion.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, sprint, agile, scrum, capacity, sprint-planning
---

# Plan a Sprint

Plan time-boxed sprint: pick refined backlog items up to capacity, define clear goal, decompose into actionable tasks. Output: complete plan guiding team for sprint duration.

## Use When

- New sprint in Scrum/agile project
- Re-plan after major scope change
- Ad-hoc → structured sprint cadence
- Post-backlog-grooming when items ready
- First sprint after charter approval

## In

- **Required**: Product backlog (prioritized, w/ estimates)
- **Required**: Sprint duration (typically 1-2 wks)
- **Required**: Team members + availability
- **Optional**: Prior sprint velocity (story points or items completed)
- **Optional**: Sprint number + date range
- **Optional**: Carry-over from prev sprint

## Do

### Step 1: Review + Refine Backlog Items

Read current BACKLOG.md. For each candidate near top, verify:

- Clear title + desc
- Acceptance criteria (testable)
- Estimate (story points or T-shirt)
- No unresolved blockers

Refine missing. Split items > half sprint capacity → smaller pieces.

→ Top 10-15 items "sprint-ready" w/ acceptance criteria + estimates.

If err: items lack acceptance → write now. Can't estimate → schedule refinement, only pick ready.

### Step 2: Define Sprint Goal

One sentence stating sprint outcome. Goal should:

- Achievable in sprint duration
- Valuable to stakeholders
- Testable (verifiable at sprint end)

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

Example: "Enable users to reset their password through email verification with two-factor authentication."

→ Sprint goal = one clear testable sentence.

If err: no coherent goal → backlog priorities scattered, consult product owner → focus on single valuable outcome.

### Step 3: Calc Team Capacity

Available person-days per member:

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

Overhead = meetings, reviews, ad-hoc (typically 15-25%).

Story points → use prior velocity. First sprint → 60-70% theoretical max.

→ Capacity calc'd in person-days or story points w/ doc'd assumptions.

If err: no historical velocity → conservative: 60%, adjust after. Better under-commit + deliver than over-commit + fail.

### Step 4: Select Items + Compose Sprint Backlog

Pick from top of product backlog until capacity. Decompose each → tasks (2-8 hrs):

```markdown
# Sprint Plan: Sprint [N]
## Document ID: SP-[PROJECT]-S[NNN]

### Sprint Details
- **Sprint Goal**: [From Step 2]
- **Duration**: [Start date] to [End date]
- **Capacity**: [From Step 3] person-days / [N] story points
- **Team**: [List team members]

### Sprint Backlog
| ID | Item | Points | Tasks | Assignee | Status |
|----|------|--------|-------|----------|--------|
| B-001 | [Item title] | 5 | 4 | [Name] | To Do |
| B-002 | [Item title] | 3 | 3 | [Name] | To Do |
| B-003 | [Item title] | 8 | 6 | [Name] | To Do |
| **Total** | | **16** | **13** | | |

### Task Breakdown

#### B-001: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (4h, [Assignee])
- [ ] Task 2: [Description] (2h, [Assignee])
- [ ] Task 3: [Description] (4h, [Assignee])
- [ ] Task 4: [Description] (2h, [Assignee])

#### B-002: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])

#### B-003: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])
- [ ] Task 4: [Description] (3h, [Assignee])
- [ ] Task 5: [Description] (4h, [Assignee])
- [ ] Task 6: [Description] (2h, [Assignee])

### Risks and Dependencies
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk 1] | [Impact] | [Mitigation] |
| [Risk 2] | [Impact] | [Mitigation] |

### Carry-Over from Previous Sprint
| ID | Item | Reason | Remaining Effort |
|----|------|--------|-----------------|
| B-XXX | [Item] | [Reason] | [Hours/points] |
```

→ Sprint backlog w/ items up to capacity, each decomposed into tasks w/ time estimates.

If err: total points > capacity → drop lowest-pri item. Never exceed capacity by >10%. Deps block sequencing → reorder or defer.

### Step 5: Document Commitments + Save

Write plan → `SPRINT-PLAN.md` (or `SPRINT-PLAN-S[NNN].md` for archive). Confirm:

- Sprint goal achievable w/ selected items
- No member overallocated (>100% capacity)
- Deps sequenced correctly
- Carry-over in capacity
- All acceptance criteria copied from backlog

Final validation:

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

→ SPRINT-PLAN.md created w/ complete backlog + task breakdown. Total hours ≤80% of available person-days × 8 hrs.

If err: commitments don't align w/ goal → revisit Step 4. Task hours > capacity → drop last item or decompose more granular.

## Check

- [ ] Sprint goal = one clear testable sentence
- [ ] Capacity calc'd w/ doc'd assumptions (overhead %, PTO)
- [ ] Selected items don't exceed capacity (points or person-days)
- [ ] Every item has acceptance criteria in task breakdown
- [ ] Every item decomposed → tasks (2-8 hrs each)
- [ ] No member overallocated >100% capacity
- [ ] Carry-over doc'd w/ remaining effort
- [ ] Deps sequenced correctly
- [ ] Risks + mitigations doc'd
- [ ] SPRINT-PLAN.md created + saved

## Traps

- **No sprint goal**: No goal → just bag of tasks. Goal = focus + basis for mid-sprint scope decisions.
- **Over-commit**: 100% capacity ignores interrupts, bugs, overhead. Plan 70-80% → buffer for unexpected.
- **Tasks too large**: >8 hrs hides complexity, hard tracking. Decompose to 2-8 hrs.
- **Ignore carry-over**: Unfinished items consume current sprint capacity. Account explicitly.
- **Goal as item list**: "Complete B-001, B-002, B-003" ≠ goal. Goal = outcome: "Users can reset password via email verification."
- **No task ownership**: Every task → assignee at planning → surface capacity conflicts early.
- **Skip acceptance criteria**: Tasks w/o criteria = untestable. Copy criteria from backlog into task breakdown.

## →

- `manage-backlog` — maintain + prioritize backlog feeding planning
- `draft-project-charter` — project context + initial scope for first sprint
- `generate-status-report` — report progress + velocity to stakeholders
- `conduct-retrospective` — review sprint, improve planning
- `create-work-breakdown-structure` — WBS work packages feed backlog in hybrid agile-waterfall
