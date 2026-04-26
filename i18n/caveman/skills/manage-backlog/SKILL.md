---
name: manage-backlog
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create and maintain a product or project backlog with prioritized items,
  acceptance criteria, and estimates. Covers user story writing, MoSCoW
  prioritization, backlog grooming, item splitting, and status tracking.
  Use when starting a new project and converting scope into actionable items,
  during ongoing grooming before sprint planning, re-prioritizing after
  stakeholder feedback or scope changes, or splitting oversized items into
  implementable pieces.
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

# Manage Product Backlog

Create, prioritize, maintain backlog of work items serving as single source of truth for what needs to be done. Applies to both agile and classic project methodologies.

## When Use

- Starting new project, converting scope into actionable items
- Ongoing backlog grooming before sprint planning
- Re-prioritizing work after stakeholder feedback or scope changes
- Splitting oversized items into implementable pieces
- Reviewing and archiving completed or cancelled items

## Inputs

- **Required**: Project scope (from charter, WBS, or stakeholder input)
- **Optional**: Existing backlog file (BACKLOG.md) to update
- **Optional**: Prioritization framework preference (MoSCoW, value/effort, WSJF)
- **Optional**: Estimation scale (story points, T-shirt sizes, person-days)
- **Optional**: Sprint or iteration feedback requiring backlog updates

## Steps

### Step 1: Create or Load Backlog Structure

No backlog exists? Create BACKLOG.md with standard columns. Exists? Read and validate structure.

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

**Got:** BACKLOG.md exists with valid structure and summary statistics.

**If fail:** File malformed? Restructure preserving existing item data.

### Step 2: Write or Refine Items

For each new item, write as user story or requirement:

- **User story format**: "As a [role], I want [capability] so that [benefit]"
- **Requirement format**: "[System/Component] shall [behavior] when [condition]"

Each item must have:
- Unique ID (B-NNN, incrementing)
- Clear title (imperative verb form)
- Type classification
- At least 2 acceptance criteria (testable, binary pass/fail)

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

**Got:** All items have titles, types, acceptance criteria.

**If fail:** Items without acceptance criteria marked Status: New (not Ready). Cannot enter sprint.

### Step 3: Prioritize Using MoSCoW or Value/Effort

Apply chosen prioritization framework:

**MoSCoW** (default):
- **Must**: Project fails without this. Non-negotiable.
- **Should**: Important but project can succeed without it. Include if capacity allows.
- **Could**: Nice to have. Include only if no impact on Must/Should items.
- **Won't**: Explicitly excluded from current scope. Documented for future consideration.

**Value/Effort Matrix** (alternative):

| | Low Effort | High Effort |
|---|-----------|-------------|
| **High Value** | Do First (Quick Wins) | Do Second (Big Bets) |
| **Low Value** | Do Third (Fill-ins) | Don't Do (Money Pits) |

Sort backlog table: Must items first (by value within Must), then Should, then Could.

**Got:** Every item has priority. Backlog sorted by priority.

**If fail:** Stakeholders disagree on priorities? Escalate Must vs Should decisions to project sponsor.

### Step 4: Groom — Split, Estimate, Refine

Review items for sprint-readiness. For each item:
1. **Split** if estimate > 8 points (or > 1 week effort): decompose into 2-4 smaller items
2. **Estimate** using project's chosen scale
3. **Refine** vague acceptance criteria into testable conditions
4. **Mark Ready** when item has title, acceptance criteria, estimate, no blockers

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

**Got:** All Must and Should items in Ready status.

**If fail:** Items that can't be estimated need Spike (time-boxed research task) added to backlog.

### Step 5: Update Summary and Archive

Update summary statistics. Move Done and Cancelled items to archive section:

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

Update summary by counting items in each status:
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**Got:** Summary statistics match actual item counts. Archive section contains all closed items.

**If fail:** Counts don't match? Recount by grepping Status values, update summary manually.

## Checks

- [ ] BACKLOG.md exists with standard structure
- [ ] Every item has unique ID, title, type, priority, status
- [ ] All Must and Should items have acceptance criteria
- [ ] Items sorted by priority (Must first, then Should, then Could)
- [ ] No item estimated at > 8 points without being split
- [ ] Summary statistics accurate
- [ ] Done/Cancelled items archived

## Pitfalls

- **No acceptance criteria**: Items without criteria can't be verified as done. Every item needs at least 2 testable criteria.
- **Everything is Must priority**: >50% of items Must? Priorities not real. Force-rank within Must.
- **Zombie items**: Items sitting in backlog for months without progress should be re-evaluated or cancelled.
- **Estimates without context**: Story points relative — team must have reference item (e.g., "B-001 is our 3-point reference").
- **Splitting creates fragments**: When splitting, ensure each child item independently deliverable and valuable.
- **Backlog as dumping ground**: Backlog not wish list. Regularly prune items no longer aligning with project goals.
- **Missing dependencies**: Note blocking items in Notes field. Blocked item should not be marked Ready.

## See Also

- `draft-project-charter` — charter scope feeds initial backlog creation
- `create-work-breakdown-structure` — WBS work packages can become backlog items
- `plan-sprint` — sprint planning selects from top of backlog
- `generate-status-report` — backlog burn-down feeds status reports
- `conduct-retrospective` — retrospective improvement items feed back into backlog
