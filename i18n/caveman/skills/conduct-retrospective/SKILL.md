---
name: conduct-retrospective
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Conduct a project or sprint retrospective by gathering data from status
  reports and velocity metrics, structuring what went well and what needs
  improvement, and generating actionable improvement items with owners and
  due dates. Use at the end of a sprint, after a project phase or milestone,
  following a significant incident or success, at a quarterly review of
  ongoing processes, or before starting a similar project to capture lessons
  learned.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
---

# Conduct a Retrospective

Facilitate structured retrospective. Review recent project execution, identify what worked, what didn't, produce actionable improvement items that feed back into project processes. Skill transforms raw project data into evidence-backed learnings with specific actions, owners, due dates.

## When Use

- End of sprint (sprint retrospective)
- End of project phase or milestone
- After significant incident, failure, or success
- Quarterly review of ongoing project processes
- Before start similar project (lessons learned review)

## Inputs

- **Required**: Period under review (sprint number, date range, or milestone)
- **Optional**: Status reports from review period
- **Optional**: Sprint velocity and completion data
- **Optional**: Previous retrospective actions (check closure)
- **Optional**: Team feedback or survey results

## Steps

### Step 1: Gather Retrospective Data

Read available artifacts from review period:
- STATUS-REPORT-*.md files for period
- SPRINT-PLAN.md for planned vs actual
- BACKLOG.md for item flow, cycle times
- Previous RETRO-*.md for open action items

Extract key facts:
- Items planned vs completed
- Velocity trend
- Blockers encountered, resolution time
- Unplanned work entered sprint
- Open action items from previous retros

**Got:** Data summary with quantitative metrics (velocity, completion %, blocker count).

**If fail:** No artifacts exist? Base retro on qualitative observations.

### Step 2: Structure "What Went Well"

List 3-5 things that worked well, with evidence:

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

Focus on practices to continue, not outcomes. "Daily standups kept blockers visible" more actionable than "We delivered on time."

**Got:** 3-5 evidence-backed positive observations.

**If fail:** Nothing went well? Look harder — small wins matter. At minimum, team completed period.

### Step 3: Structure "What Needs Improvement"

List 3-5 things that need improvement, with evidence:

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

Be specific, factual. "Estimation was off" vague. "3 of 5 items exceeded estimates by >50%, adding 8 unplanned days" actionable.

**Got:** 3-5 evidence-backed improvement areas with stated impact.

**If fail:** Team claims everything fine? Compare planned vs actual metrics — gaps reveal issues.

### Step 4: Generate Improvement Actions

For each improvement area, create actionable item:

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

Each action must be:
- Specific (not "improve estimation" but "add estimation review step to grooming")
- Owned (one person accountable)
- Time-bound (due date within next 1-2 sprints)
- Verifiable (success criteria defined)

**Got:** 2-4 improvement actions with owners, due dates.

**If fail:** Actions too vague? Apply "how would you verify this was done?" test.

### Step 5: Review Previous Actions and Write Report

Check previous retro actions for closure:

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

Flag recurring items (same issue in 3+ retros) — need escalation or different approach.

Write complete retro:

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

Save as `RETRO-[YYYY-MM-DD].md`.

**Got:** Complete retro doc saved with actions, evidence, previous action review.

**If fail:** Retro has no improvement actions? Not driving change — revisit Step 3.

## Checks

- [ ] Retro file created with date-stamped filename
- [ ] Period summary includes quantitative metrics
- [ ] "What Went Well" has 3-5 evidence-backed items
- [ ] "What Needs Improvement" has 3-5 evidence-backed items
- [ ] Improvement actions have owners, due dates, success criteria
- [ ] Previous retro actions reviewed for closure
- [ ] Recurring issues flagged

## Pitfalls

- **Blame game**: Retros review processes and practices, not people. Frame issues as systemic, not personal.
- **Actions without follow-through**: Biggest retro failure. Always review previous actions before creating new ones.
- **Too many actions**: 2-4 focused actions better than 10 vague ones. Team only absorbs so many changes.
- **No evidence**: "We feel estimation is bad" is opinion. "3 of 5 items exceeded estimates by 50%" is data. Always attach evidence.
- **Skip positives**: Only discussing problems demoralizing. Celebrating wins reinforces good practices.

## See Also

- `generate-status-report` — status reports provide data for retros
- `manage-backlog` — improvement actions feed back into backlog
- `plan-sprint` — retro learnings improve sprint planning accuracy
- `draft-project-charter` — review charter assumptions, risk accuracy
- `create-work-breakdown-structure` — review estimation accuracy vs WBS
