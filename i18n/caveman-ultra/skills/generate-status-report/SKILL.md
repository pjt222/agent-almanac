---
name: generate-status-report
locale: caveman-ultra
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

Periodic status: read artifacts → metrics → summary (accomplishments, blockers, next) → RAG health (sched/scope/budget/quality).

## Use When

- End of sprint/period (wk/bi-wk/mo)
- Stakeholder health req
- Pre steering/governance meeting
- Health change (new blocker/risk)
- Checkpoint vs charter milestones

## In

- **Required**: period (start, end)
- **Required**: ≥1 artifact (BACKLOG.md, SPRINT-PLAN.md, WBS.md, PROJECT-CHARTER.md)
- **Optional**: prior reports (trend)
- **Optional**: budget/resource data
- **Optional**: risk register updates

## Do

### Step 1: Read artifacts

Scan proj dir:
- PROJECT-CHARTER.md — milestones, success criteria
- BACKLOG.md — item counts, burn-down
- SPRINT-PLAN.md — goal, committed, task done
- WBS.md — work pkg %
- Prior STATUS-REPORT-*.md — trend

Adapt to what exists.

→ ≥1 read, key metrics extracted.

**If err:** no artifacts → can't generate. Create charter/backlog first via `draft-project-charter` or `manage-backlog`.

### Step 2: Metrics

**Agile** (BACKLOG.md / SPRINT-PLAN.md):
- Velocity: pts this sprint
- Completion: done/committed
- Burn-down: remaining vs prev
- Cycle time: avg days In Progress → Done

**Classic** (WBS.md):
- % complete: pkgs done / total
- Schedule variance: planned vs actual
- Effort variance: est vs consumed

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

→ 3-5 metrics w/ prev comparison.

**If err:** no historical (first) → omit prev + trend cols. Incomplete → note gaps + track action items.

### Step 3: Blockers, risks, issues

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

Cross-ref charter risk register. Flag new.

→ All blockers + top risks w/ owners + actions.

**If err:** no blockers → explicit "No active blockers", don't leave empty. No owner → escalate to PM.

### Step 4: Accomplishments + next plan

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

→ 3-5 accomplishments w/ evidence, 3-5 planned.

**If err:** no accomplishments → reason (blocked, replanning, unavail). Next unclear → "Planning session scheduled for [date]".

### Step 5: RAG + write

| Dimension | Green | Amber | Red |
|-----------|-------|-------|-----|
| **Schedule** | On track or ahead | 1-2 weeks behind | >2 weeks behind or milestone missed |
| **Scope** | No uncontrolled changes | Minor scope adjustments | Scope creep affecting deliverables |
| **Budget** | Within 5% of plan | 5-15% over plan | >15% over plan or untracked |
| **Quality** | Tests pass, criteria met | Minor quality issues | Critical defects or acceptance failures |

Write:

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

Save `STATUS-REPORT-[YYYY-MM-DD].md`.

→ Complete report w/ RAG + metrics + narrative.

**If err:** insufficient for RAG → ⚪ (Grey) "insufficient data" + list data needed next report.

## Check

- [ ] Report file created, date-stamped
- [ ] RAG all 4 dims w/ justify
- [ ] ≥3 metrics from artifacts
- [ ] Blockers section present (even "No active")
- [ ] Accomplishments w/ evidence
- [ ] Next plan
- [ ] Exec summary 2-3 sentences
- [ ] Every blocker/risk has owner + action + deadline

## Traps

- **No data**: evidence-based. Every claim → artifact/metric.
- **All green always**: no evidence = not honest. Challenge green.
- **Blocker w/o owner**: no owner → not resolved.
- **Metric w/o context**: "Velocity=18" meaningless alone. Always prev/target.
- **Too long**: 2 min scan. 1-2 pages.
- **Missing decisions**: explicit w/ deadlines.
- **Stale data**: verify artifact dates match period.
- **Missing trends**: first-time OK, later must compare.

## →

- `draft-project-charter` — milestones + success criteria
- `manage-backlog` — backlog metrics feed report
- `plan-sprint` — sprint results: velocity + completion
- `create-work-breakdown-structure` — WBS % drives classic metrics
- `conduct-retrospective` — report data feeds retro
