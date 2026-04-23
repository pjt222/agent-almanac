---
name: create-work-breakdown-structure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a Work Breakdown Structure (WBS) and WBS Dictionary from project
  charter deliverables. Covers hierarchical decomposition, WBS coding,
  effort estimation, dependency identification, and critical path candidates.
  Use after a project charter is approved, when planning a classic or waterfall
  project with defined deliverables, breaking a large initiative into manageable
  work packages, or establishing a basis for effort estimation and resource
  planning.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, wbs, work-breakdown-structure, classic, waterfall, planning
---

# Create a Work Breakdown Structure

Decompose scope → hierarchical work packages → estimate + assign + track. Foundation for effort + resource + schedule.

## Use When

- Charter approved + scope defined
- Classic/waterfall planning
- Large initiative → manageable pkgs
- Basis for estimation + resource
- Shared understanding of work

## In

- **Required**: Approved charter (scope + deliverables)
- **Required**: Methodology (classic/waterfall / hybrid)
- **Optional**: Historical effort data
- **Optional**: Team composition + skills
- **Optional**: Org WBS templates

## Do

### Step 1: Extract Deliverables

Read charter. List deliverables + acceptance. Group → 3-7 top-level cats → WBS Level 1.

**Got:** L1 elements match charter deliverables.

**If err:** Charter vague → `draft-project-charter` to refine.

### Step 2: Decompose → Work Packages

Each L1 → sub-elements (L2, L3). 100% rule: children = 100% parent scope. Stop when pkgs:
- Estimable (person-days)
- Assignable (1 owner)
- Measurable (done/not-done)

WBS outline:
```markdown
# Work Breakdown Structure: [Project Name]
## Document ID: WBS-[PROJECT]-[YYYY]-[NNN]

### WBS Hierarchy

1. [Level 1: Deliverable Category A]
   1.1 [Level 2: Sub-deliverable]
      1.1.1 [Level 3: Work Package]
      1.1.2 [Level 3: Work Package]
   1.2 [Level 2: Sub-deliverable]
2. [Level 1: Deliverable Category B]
   2.1 [Level 2: Sub-deliverable]
3. [Level 1: Project Management]
   3.1 Planning
   3.2 Monitoring & Control
   3.3 Closure
```

Codes (1.1.1 fmt). Max 3-5 levels. Always include "Project Management" branch.

**Got:** Complete WBS, 15-50 pkgs, unique codes.

**If err:** >5 levels → scope too large → split sub-projects.

### Step 3: WBS Dictionary

Each leaf → entry:

```markdown
# WBS Dictionary: [Project Name]
## Document ID: WBS-DICT-[PROJECT]-[YYYY]-[NNN]

### WBS 1.1.1: [Work Package Name]
- **Description**: What this work package produces
- **Acceptance Criteria**: How to verify it's done
- **Responsible**: Person or role
- **Estimated Effort**: [T-shirt size or person-days]
- **Dependencies**: WBS codes this depends on
- **Assumptions**: Key assumptions for this work package

### WBS 1.1.2: [Work Package Name]
...
```

**Got:** Entry per leaf pkg.

**If err:** Missing entries → incomplete decomp → Step 2.

### Step 4: Estimate

Per pkg, 1 method:
- **T-shirt** (XS/S/M/L/XL) → early planning
- **Person-days** → detailed
- **3-pt** (optimistic/ML/pessimistic) → high-uncertainty

Summary:
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

Total = sum of all pkgs.

**Got:** Every pkg estimated + confidence.

**If err:** Low confidence >30% pkgs → SME refinement session.

### Step 5: Deps + Critical Path

Map deps:
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

Longest chain = critical path candidate.

**Got:** Dep table w/ FS relationships.

**If err:** Cycles → decomp errs → Step 2.

### Step 6: Review + Baseline

Combine WBS + dict → final docs. Verify 100% rule every level. Stakeholder sign-off.

**Got:** WBS.md + WBS-DICTIONARY.md created + reviewed.

**If err:** Missing scope found → add pkgs + re-estimate.

## Check

- [ ] WBS file w/ doc ID + codes
- [ ] 100% rule every level
- [ ] Every leaf in dict
- [ ] All pkgs estimated
- [ ] Deps no cycles
- [ ] PM branch included
- [ ] Critical path ID'd
- [ ] Depth ≤5 levels

## Traps

- **Confuse deliverables vs activities**: Elements = nouns (deliverables), not verbs. "User Auth Module" not "Implement Auth".
- **Violate 100% rule**: Children ≠ 100% parent → missed work.
- **Too shallow / deep**: 2 levels vague; 6+ micromgmt. Target 3-5.
- **Skip PM branch**: PM work (planning, mtgs, reports) = real effort.
- **Estimate pre-decomp**: Estimate pkgs, not cats. L1 estimate unreliable.
- **No dict**: WBS w/o dict = tree of labels. Dict = def of done.

## →

- `draft-project-charter` — scope + deliverables feed decomp
- `manage-backlog` — WBS pkgs → backlog items
- `generate-status-report` — report % complete
- `plan-sprint` — hybrid: sprint-plan from pkgs
- `conduct-retrospective` — review estimation + decomp quality
