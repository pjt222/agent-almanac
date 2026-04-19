---
name: conduct-retrospective
locale: caveman-ultra
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

Facilitate structured retrospective → review recent project exec, ID what worked + what didn't, produce actionable improvements w/ owners + due dates. Transforms raw project data → evidence-backed learnings w/ specific actions, owners, due dates.

## Use When

- End of sprint (sprint retrospective)
- End of project phase / milestone
- Post significant incident, failure, or success
- Quarterly review of ongoing project procs
- Before starting similar project (lessons learned review)

## In

- **Required**: Period under review (sprint number, date range, or milestone)
- **Optional**: Status reports from review period
- **Optional**: Sprint velocity + completion data
- **Optional**: Prev retrospective actions (check closure)
- **Optional**: Team feedback / survey results

## Do

### Step 1: Gather Retrospective Data

Read available artifacts from review period:
- STATUS-REPORT-*.md files for period
- SPRINT-PLAN.md for planned vs actual
- BACKLOG.md for item flow + cycle times
- Prev RETRO-*.md for open action items

Extract key facts:
- Items planned vs completed
- Velocity trend
- Blockers encountered + resolution time
- Unplanned work entering sprint
- Open action items from prev retros

**→** Data summary w/ quantitative metrics (velocity, completion %, blocker count).

**If err:** No artifacts → base retro on qualitative observations.

### Step 2: Structure "What Went Well"

List 3-5 things that worked, w/ evidence:

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

Focus on practices to continue, not outcomes. "Daily standups kept blockers visible" > "We delivered on time."

**→** 3-5 evidence-backed positive observations.

**If err:** Nothing went well → look harder. Small wins matter. At min, team completed period.

### Step 3: Structure "What Needs Improvement"

List 3-5 things needing improvement, w/ evidence:

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

Specific + factual. "Estimation was off" = vague. "3 of 5 items exceeded estimates by >50%, adding 8 unplanned days" = actionable.

**→** 3-5 evidence-backed improvement areas w/ stated impact.

**If err:** Team claims everything fine → compare planned vs actual metrics → gaps reveal issues.

### Step 4: Generate Improvement Actions

Each improvement area → actionable item:

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
- Time-bound (due date w/in next 1-2 sprints)
- Verifiable (success criteria defined)

**→** 2-4 improvement actions w/ owners + due dates.

**If err:** Actions too vague → apply "how would you verify this was done?" test.

### Step 5: Review Previous Actions + Write Report

Check prev retrospective actions for closure:

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

Flag recurring items (same issue appearing 3+ retros) → escalation or different approach needed.

Write complete retrospective:

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

**→** Complete retrospective doc saved w/ actions, evidence, prev action review.

**If err:** Retro has no improvement actions → not driving change → revisit Step 3.

## Check

- [ ] Retro file created w/ date-stamped filename
- [ ] Period summary includes quantitative metrics
- [ ] "What Went Well" has 3-5 evidence-backed items
- [ ] "What Needs Improvement" has 3-5 evidence-backed items
- [ ] Improvement actions have owners, due dates, success criteria
- [ ] Prev retro actions reviewed for closure
- [ ] Recurring issues flagged

## Traps

- **Blame game**: Retros review procs + practices, not people. Frame issues systemic, not personal.
- **Actions w/o follow-through**: Biggest retro failure. Always review prev actions before creating new.
- **Too many actions**: 2-4 focused > 10 vague. Team can only absorb so many changes.
- **No evidence**: "We feel estimation bad" = opinion. "3 of 5 items exceeded estimates by 50%" = data. Always attach evidence.
- **Skip positives**: Only discussing problems demoralizing. Celebrating wins reinforces good practices.

## →

- `generate-status-report` — status reports provide data for retros
- `manage-backlog` — improvement actions feed back into backlog
- `plan-sprint` — retro learnings improve sprint planning accuracy
- `draft-project-charter` — review charter assumptions + risk accuracy
- `create-work-breakdown-structure` — review estimation accuracy vs. WBS
