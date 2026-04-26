---
name: manage-backlog
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create + maintain product/project backlog w/ prioritized items, acceptance
  criteria, estimates. User story writing, MoSCoW prioritization, grooming,
  item splitting, status tracking. Use starting new project + converting scope
  → actionable items, ongoing grooming before sprint planning, re-prioritizing
  after stakeholder feedback / scope changes, splitting oversized items.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
---

# Manage a Product Backlog

Create, prioritize, maintain backlog of work items = single source of truth for what needs doing. Applicable agile + classic PM.

## Use When

- Start new project → convert scope → actionable items
- Ongoing grooming before sprint planning
- Re-prioritize after stakeholder feedback / scope changes
- Split oversized items
- Review + archive completed / cancelled

## In

- **Req**: Project scope (charter, WBS, stakeholder)
- **Opt**: Existing BACKLOG.md to update
- **Opt**: Framework pref (MoSCoW, value/effort, WSJF)
- **Opt**: Estimation scale (pts, T-shirt, person-days)
- **Opt**: Sprint/iteration feedback requiring updates

## Do

### Step 1: Create / Load Structure

No backlog → create BACKLOG.md w/ std cols. Exists → read + validate.

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

→ BACKLOG.md w/ valid structure + summary stats.

**If err:** Malformed → restructure preserving existing item data.

### Step 2: Write / Refine Items

Each new item as user story / requirement:

- **User story**: "As a [role], I want [capability] so that [benefit]"
- **Requirement**: "[System/Component] shall [behavior] when [condition]"

Each item needs:
- Unique ID (B-NNN, incrementing)
- Clear title (imperative verb form)
- Type classification
- ≥2 acceptance criteria (testable, binary pass/fail)

Example:
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

→ All items have titles, types, acceptance criteria.

**If err:** No acceptance criteria → Status: New (not Ready). Can't enter sprint.

### Step 3: Prioritize (MoSCoW / Value-Effort)

**MoSCoW** (default):
- **Must**: Project fails without. Non-negotiable.
- **Should**: Important but project succeeds without. Include if capacity.
- **Could**: Nice to have. Only if no impact on Must/Should.
- **Won't**: Explicitly excluded. Documented for future.

**Value/Effort Matrix** (alt):

| | Low Effort | High Effort |
|---|-----------|-------------|
| **High Value** | Do First (Quick Wins) | Do Second (Big Bets) |
| **Low Value** | Do Third (Fill-ins) | Don't Do (Money Pits) |

Sort table: Must first (by value within Must), Should, Could.

→ Every item has priority. Backlog sorted by priority.

**If err:** Stakeholders disagree on priorities → escalate Must vs Should to sponsor.

### Step 4: Groom — Split, Estimate, Refine

Review for sprint-readiness. Per item:
1. **Split** if estimate > 8 pts (or > 1 week) → 2-4 smaller
2. **Estimate** using chosen scale
3. **Refine** vague criteria → testable conditions
4. **Mark Ready** when has title, criteria, estimate, no blockers

Document splitting:
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

→ All Must + Should → Ready.

**If err:** Can't estimate → need Spike (time-boxed research task) in backlog.

### Step 5: Update Summary + Archive

Update summary stats. Move Done + Cancelled → archive:

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

Update summary by counting per status:
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

→ Stats match actual counts. Archive has all closed items.

**If err:** Counts don't match → recount by grepping Status + update summary manually.

## Check

- [ ] BACKLOG.md w/ std structure
- [ ] Every item has unique ID, title, type, priority, status
- [ ] All Must + Should have criteria
- [ ] Items sorted by priority (Must, Should, Could)
- [ ] No item > 8 pts w/o split
- [ ] Summary stats accurate
- [ ] Done/Cancelled archived

## Traps

- **No acceptance criteria**: Items w/o criteria can't verify done. Every item ≥2 testable criteria.
- **Everything Must**: >50% Must → priorities not real. Force-rank within Must.
- **Zombie items**: Sitting months w/o progress → re-evaluate / cancel.
- **Estimates w/o ctx**: Story pts relative → team needs ref item (e.g., "B-001 = our 3-pt reference").
- **Splitting creates fragments**: Split → each child indep deliverable + valuable.
- **Backlog as dumping ground**: Not wish list. Prune items no longer aligned.
- **Missing deps**: Note blocking in Notes. Blocked item ≠ Ready.

## →

- `draft-project-charter` — charter scope → initial backlog creation
- `create-work-breakdown-structure` — WBS work pkgs → backlog items
- `plan-sprint` — sprint planning selects from top of backlog
- `generate-status-report` — backlog burn-down → status reports
- `conduct-retrospective` — retro improvement items → backlog
