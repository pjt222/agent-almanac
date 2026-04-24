---
name: generate-status-report
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Generate a project status report by reading existing artifacts (charter,
  backlog, sprint plan, WBS), calculating metrics, identifying blockers,
  and summarizing progress with RAG indicators for schedule, scope, budget,
  and quality. Use at the end of a sprint or reporting period, when stakeholders
  request a health update, before steering committee or governance meetings,
  or when a new blocker or risk materializes mid-project.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
---

# Generate a Project Status Report

Make periodic status report. Analyze project artifacts, compute progress metrics, summarize accomplishments, blockers, upcoming work with RAG (Red/Amber/Green) health indicators.

## When Use

- End of sprint or reporting period (weekly, biweekly, monthly)
- Stakeholder asks for project health update
- Before steering committee or governance meetings
- Project health indicators change (new blocker or risk)
- Periodic checkpoint vs charter milestones

## Inputs

- **Required**: Reporting period (start + end date)
- **Required**: At least one project artifact (BACKLOG.md, SPRINT-PLAN.md, WBS.md, PROJECT-CHARTER.md)
- **Optional**: Previous status reports (trend comparison)
- **Optional**: Budget or resource tracking data
- **Optional**: Risk register updates

## Steps

### Step 1: Read Existing Artifacts

Scan project directory for PM artifacts:
- PROJECT-CHARTER.md — milestones, success criteria
- BACKLOG.md — item counts by status, burn-down data
- SPRINT-PLAN.md — sprint goal, committed items, task completion
- WBS.md — work package completion percentages
- Previous STATUS-REPORT-*.md files — trend data

Read available files. Not all will exist — adapt report to available data.

**Got:** At least one artifact read successful, key metrics extracted.

**If fail:** No artifacts exist? Report can't be generated. Create charter or backlog first with `draft-project-charter` or `manage-backlog`.

### Step 2: Compute Progress Metrics

Compute metrics from available data:

**Agile metrics** (from BACKLOG.md / SPRINT-PLAN.md):
- Velocity: story points done this sprint
- Sprint completion: items done / items committed
- Backlog burn-down: total remaining points vs previous period
- Cycle time: average days from In Progress to Done

**Classic metrics** (from WBS.md):
- % complete: work packages done / total
- Schedule variance: planned milestone dates vs actual
- Effort variance: estimated effort vs actual

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**Got:** 3-5 metrics computed with previous period comparison.

**If fail:** No historical data (first report)? Skip Previous + Trend columns. Data incomplete → note gaps in report footer with actions to establish tracking.

### Step 3: Find Blockers, Risks, Issues

List active blockers + risks:

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

Cross-reference vs charter risk register. Flag new risks not previously identified.

**Got:** All active blockers + top risks documented with owners + actions.

**If fail:** No blockers? State "No active blockers" — no empty section. Blocker without owner? Escalate to project manager.

### Step 4: Summarize Accomplishments + Next Period Plan

Write two sections:

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**Got:** 3-5 accomplishments with concrete evidence, 3-5 planned items for next period.

**If fail:** No accomplishments? Report reason (blocked, re-planning, team unavailable). Next period plan unclear → list "Planning session scheduled for [date]" as primary.

### Step 5: Assign RAG + Write Report

Assess project health across four dimensions:

| Dimension | Green | Amber | Red |
|-----------|-------|-------|-----|
| **Schedule** | On track or ahead | 1-2 weeks behind | >2 weeks behind or milestone missed |
| **Scope** | No uncontrolled changes | Minor scope adjustments | Scope creep affecting deliverables |
| **Budget** | Within 5% of plan | 5-15% over plan | >15% over plan or untracked |
| **Quality** | Tests pass, criteria met | Minor quality issues | Critical defects or acceptance failures |

Write complete report:

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

Save as `STATUS-REPORT-[YYYY-MM-DD].md`.

**Got:** Complete status report saved with RAG indicators, metrics, narrative.

**If fail:** Data insufficient for RAG assessment? Use ⚪ (Grey) = "insufficient data", list what data needs collecting for next report.

## Checks

- [ ] Status report file created with date-stamped filename
- [ ] RAG indicators assigned for all four dimensions with justification
- [ ] At least 3 metrics computed from project artifacts
- [ ] Blockers section present (even if "No active blockers")
- [ ] Accomplishments listed with evidence
- [ ] Next period plan included
- [ ] Executive summary 2-3 sentences, not paragraph
- [ ] Every blocker + risk has owner + action with deadline

## Pitfalls

- **Report without data**: Status reports must be evidence-based. Every claim references artifact or metric.
- **All green always**: Persistent green RAG without evidence = not honest. Challenge green assessments.
- **Blocker without owner**: Every blocker needs owner + action. Unowned blockers don't resolve.
- **Metric without context**: "Velocity = 18" means nothing without comparison. Always include previous period or target.
- **Too long**: Status report scannable in 2 min. Keep to 1-2 pages.
- **Missing decisions section**: Project needs stakeholder decisions? Make explicit with deadlines.
- **Stale data**: Outdated artifacts → misleading reports. Verify artifact dates match reporting period.
- **Missing trend data**: First-time reports can't show trends, but subsequent reports must compare.

## See Also

- `draft-project-charter` — charter provides milestones + success criteria for status tracking
- `manage-backlog` — backlog metrics feed status report
- `plan-sprint` — sprint results provide velocity + completion data
- `create-work-breakdown-structure` — WBS completion drives classic progress metrics
- `conduct-retrospective` — status report data feeds retrospective
