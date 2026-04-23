---
name: create-work-breakdown-structure
locale: caveman
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

Break project scope into hierarchical set of work packages. Estimable, assignable, trackable. WBS gives foundation for effort estimation, resource planning, schedule development. Breaks complex deliverables into manageable components.

## When Use

- After project charter approved and scope defined
- Planning classic/waterfall project with defined deliverables
- Breaking big initiative into manageable work packages
- Setting basis for effort estimation and resource planning
- Making shared understanding of all required work

## Inputs

- **Required**: Approved project charter (especially scope and deliverables sections)
- **Required**: Project methodology (classic/waterfall, or hybrid with WBS for planning)
- **Optional**: Historical effort data from similar projects
- **Optional**: Team composition and available skills
- **Optional**: Organizational WBS templates or standards

## Steps

### Step 1: Extract Deliverables from Charter
Read project charter. List all deliverables and acceptance criteria. Group into 3-7 top-level categories (these become WBS Level 1 elements).

**Got:** List of Level 1 WBS elements matching charter deliverables.

**If fail:** Charter vague? Return to `draft-project-charter` to refine scope.

### Step 2: Decompose into Work Packages
For each Level 1 element, break into sub-elements (Level 2, Level 3). Apply 100% rule: child elements must represent 100% of parent's scope. Stop decomposing when work packages are:
- Estimable (can assign effort in person-days)
- Assignable (one person or team owns it)
- Measurable (clear done/not-done criteria)

Create WBS outline:
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

Apply WBS codes (1.1.1 format). Keep 3-5 levels deep max. Always include "Project Management" branch.

**Got:** Complete WBS with 15-50 work packages, each with unique WBS code.

**If fail:** Decomposition exceeds 5 levels? Scope too large — consider splitting into sub-projects.

### Step 3: Write WBS Dictionary
For each work package (leaf node), write dictionary entry:

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

**Got:** Dictionary entry for every leaf-node work package.

**If fail:** Missing dictionary entries → incomplete decomposition. Revisit Step 2.

### Step 4: Estimate Effort
For each work package, apply one estimation method:
- **T-shirt sizing** (XS/S/M/L/XL) for early-stage planning
- **Person-days** for detailed planning
- **Three-point estimate** (optimistic/most likely/pessimistic) for high-uncertainty work

Create summary table:
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

Total effort = sum of all work packages.

**Got:** Every work package has effort estimate with stated confidence.

**If fail:** Confidence Low on >30% of packages? Schedule refinement session with SMEs.

### Step 5: Identify Dependencies and Critical Path Candidates
Map dependencies between work packages:
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

Find longest chain of dependent work packages — this is critical path candidate.

**Got:** Dependency table with at least finish-to-start relationships identified.

**If fail:** Dependencies form cycles? Decomposition has errors. Revisit Step 2.

### Step 6: Review and Baseline
Combine WBS and dictionary into final documents. Verify 100% rule at every level. Get stakeholder sign-off.

**Got:** WBS.md and WBS-DICTIONARY.md files created and reviewed.

**If fail:** Stakeholders identify missing scope? Add work packages and re-estimate.

## Checks

- [ ] WBS file created with document ID and WBS codes
- [ ] 100% rule satisfied: children fully represent parent scope at every level
- [ ] Every leaf node has WBS dictionary entry
- [ ] All work packages have effort estimates
- [ ] Dependencies identified with no circular references
- [ ] Project Management branch included
- [ ] Critical path candidates identified
- [ ] WBS depth does not exceed 5 levels

## Pitfalls

- **Confusing deliverables with activities**: WBS elements should be nouns (deliverables), not verbs (activities). "User Authentication Module" not "Implement Authentication".
- **Violating the 100% rule**: Children don't add up to 100% of parent scope → work will be missed.
- **Too shallow or too deep**: 2 levels too vague for planning; 6+ levels is micromanagement. Target 3-5 levels.
- **Skipping Project Management branch**: PM work (planning, meetings, reporting) is real work consuming effort.
- **Estimating before decomposing**: Estimate work packages, not categories. Level 1 estimate unreliable.
- **No dictionary**: WBS without dictionary is tree of labels. Dictionary gives definition of done.

## See Also

- `draft-project-charter` — gives scope and deliverables feeding WBS decomposition
- `manage-backlog` — translate WBS work packages into backlog items for tracking
- `generate-status-report` — report progress against WBS % complete
- `plan-sprint` — if using hybrid approach, sprint-plan from WBS work packages
- `conduct-retrospective` — review estimation accuracy and decomposition quality
