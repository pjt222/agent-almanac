---
name: plan-sprint
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a sprint by refining backlog items, defining a sprint goal, calculating
  team capacity, selecting items, and decomposing them into tasks. Produces
  a SPRINT-PLAN.md with goal, selected items, task breakdown, and capacity
  allocation. Use when starting a new sprint in a Scrum or agile project,
  re-planning after significant scope change, transitioning from ad-hoc work
  to structured sprint cadence, or after backlog grooming when items are ready
  for inclusion.
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

Plan time-boxed sprint. Select refined backlog items up to team capacity. Define clear sprint goal. Decompose selected items into actionable tasks. Produces complete sprint plan that guides team work for sprint duration.

## When Use

- Starting new sprint in Scrum or agile project
- Re-planning sprint after significant scope change
- Transitioning from ad-hoc work to structured sprint cadence
- After backlog grooming when items ready for sprint inclusion
- Planning first sprint after project charter approval

## Inputs

- **Required**: Product backlog (prioritized, with estimates)
- **Required**: Sprint duration (usually 1-2 weeks)
- **Required**: Team members and availability
- **Optional**: Previous sprint velocity (story points or items completed)
- **Optional**: Sprint number and date range
- **Optional**: Carry-over items from previous sprint

## Steps

### Step 1: Review and Refine Backlog Items

Read current BACKLOG.md. For each candidate item near top, verify it has:

- Clear title and description
- Acceptance criteria (testable conditions)
- Estimate (story points or T-shirt size)
- No unresolved blockers

Refine any items missing these elements. Split items estimated larger than half sprint capacity into smaller, manageable pieces.

**Got:** Top 10-15 backlog items "sprint-ready" with acceptance criteria and estimates.

**If fail:** Items lack acceptance criteria? Write them now. Items can't be estimated? Schedule refinement conversation. Select only ready items.

### Step 2: Define Sprint Goal

Write single clear sprint goal — one sentence stating what sprint will achieve. Goal should be:

- Achievable within sprint duration
- Valuable to stakeholders
- Testable (can verify it was met at sprint end)

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

Example: "Enable users to reset their password through email verification with two-factor authentication."

**Got:** Sprint goal articulated as one clear, testable sentence.

**If fail:** No coherent goal emerges? Backlog priorities may be scattered. Consult product owner — focus on single valuable outcome.

### Step 3: Calculate Team Capacity

Compute available person-days per team member:

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

Overhead accounts for meetings, reviews, ad-hoc requests (usually 15-25%).

Using story points? Use previous sprint velocity as capacity. First sprint? Use 60-70% of theoretical maximum.

**Got:** Capacity computed in person-days or story points. Assumptions documented.

**If fail:** No historical velocity? Be conservative — plan to 60% capacity. Adjust after sprint. Better under-commit and deliver than over-commit and fail.

### Step 4: Select Items and Compose Sprint Backlog

Select items from top of product backlog until capacity reached. Decompose each selected item into tasks (2-8 hours each):

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

**Got:** Sprint backlog with items selected up to capacity. Each decomposed into tasks with time estimates.

**If fail:** Total points exceed capacity? Remove lowest-priority item. NEVER exceed capacity by more than 10%. Dependencies block sequencing? Re-order or defer items.

### Step 5: Document Commitments and Save

Write sprint plan to `SPRINT-PLAN.md` (or `SPRINT-PLAN-S[NNN].md` for archival). Confirm:

- Sprint goal achievable with selected items
- No team member overallocated (>100% capacity)
- Dependencies between items sequenced correctly
- Carry-over items accounted for in capacity
- All acceptance criteria copied from backlog items

Run final validation:

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

**Got:** SPRINT-PLAN.md created with complete sprint backlog and task breakdown. Total hours ≤80% of available person-days × 8 hours.

**If fail:** Commitments don't align with goal? Revisit item selection in Step 4. Task hours exceed capacity? Remove last item or decompose tasks more granularly.

## Checks

- [ ] Sprint goal is one clear, testable sentence
- [ ] Team capacity computed with documented assumptions (overhead %, PTO accounted)
- [ ] Selected items don't exceed capacity (points or person-days)
- [ ] Every selected item has acceptance criteria copied into task breakdown
- [ ] Every selected item decomposed into tasks (2-8 hours each)
- [ ] No team member overallocated beyond 100% capacity
- [ ] Carry-over items from previous sprint documented with remaining effort
- [ ] Dependencies between items sequenced correctly
- [ ] Risks and mitigations documented
- [ ] SPRINT-PLAN.md file created and saved

## Pitfalls

- **No sprint goal**: Without goal, sprint just bag of tasks. Goal provides focus and basis for scope decisions mid-sprint.
- **Over-commitment**: Planning to 100% capacity ignores interruptions, bugs, overhead. Plan to 70-80% to leave buffer for unexpected.
- **Tasks too large**: Tasks over 8 hours hide complexity. Make progress tracking difficult. Decompose until tasks are 2-8 hours.
- **Ignore carry-over**: Unfinished items from last sprint consume this sprint's capacity. Account for them explicitly in capacity calculations.
- **Sprint goal as item list**: "Complete B-001, B-002, B-003" is not a goal. Goal describes outcome: "Users can reset their password through email verification."
- **No task ownership**: Every task should have assignee at planning time. Surfaces capacity conflicts early.
- **Skip acceptance criteria**: Tasks without acceptance criteria can't be tested. Copy acceptance criteria from backlog items into task breakdown section.

## See Also

- `manage-backlog` — maintain and prioritize product backlog that feeds sprint planning
- `draft-project-charter` — provides project context and initial scope for first sprint
- `generate-status-report` — report sprint progress and velocity to stakeholders
- `conduct-retrospective` — review sprint execution and improve planning process
- `create-work-breakdown-structure` — WBS work packages can feed backlog in hybrid agile-waterfall approaches
