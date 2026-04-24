---
name: draft-project-charter
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Draft a project charter that defines scope, stakeholders, success criteria,
  and initial risk register. Covers problem statement, RACI matrix, milestone
  planning, and scope boundaries for both agile and classic methodologies.
  Use when kicking off a new project or initiative, formalizing scope after
  an informal start, aligning stakeholders before detailed planning begins,
  or transitioning from discovery to active project work.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, charter, scope, stakeholders, raci, risk-register
---

# Draft a Project Charter

Make structured project charter. Sets project boundaries, stakeholder agreements, success criteria before detailed planning starts. Produces full doc: scope, RACI assignments, milestone planning, initial risk register. Fits agile, classic, or hybrid methodologies.

## When Use

- Kick off new project or initiative
- Formalize scope after informal project start
- Align stakeholders before detailed planning
- Create reference doc for scope decisions during execution
- Transition from discovery/ideation to active project work

## Inputs

- **Required**: Project name + brief description
- **Required**: Primary stakeholder or sponsor
- **Optional**: Existing docs (proposals, briefs, emails)
- **Optional**: Known constraints (budget, deadline, team size)
- **Optional**: Methodology preference (agile, classic, hybrid)

## Steps

### Step 1: Gather Context + Create Charter Template

Read existing docs (proposals, emails, briefs) for project background. Identify core problem or opportunity project addresses. Create charter file with structured template, populate in next steps.

Create file `PROJECT-CHARTER-[PROJECT-NAME].md` with this template:

```markdown
# Project Charter: [Project Name]
## Document ID: PC-[PROJECT]-[YYYY]-[NNN]

### 1. Problem Statement
[2-3 sentences describing the problem or opportunity this project addresses]

### 2. Project Purpose
[What the project will achieve and why it matters]

### 3. Scope
#### In Scope
- [Deliverable 1]
- [Deliverable 2]

#### Out of Scope
- [Exclusion 1]
- [Exclusion 2]

### 4. Deliverables
| # | Deliverable | Acceptance Criteria | Target Date |
|---|------------|---------------------|-------------|
| 1 | | | |

### 5. Stakeholders & RACI
| Stakeholder | Role | D1 | D2 | D3 |
|-------------|------|----|----|-----|
| | | | | |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

### 6. Success Criteria
| # | Criterion | Measure | Target |
|---|-----------|---------|--------|
| 1 | | | |

### 7. Milestones
| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| | | |

### 8. Risk Register
| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|------------|--------|----------|------------|-------|
| R1 | | | | | | |

*Likelihood/Impact: Low, Medium, High*
*Severity = Likelihood × Impact*

### 9. Assumptions and Constraints
#### Assumptions
- [Key assumption 1]

#### Constraints
- [Key constraint 1]

### 10. Approval
| Role | Name | Date |
|------|------|------|
| Sponsor | | |
| Project Lead | | |
```

Fill document ID using format PC-[PROJECT]-[YYYY]-[NNN] (e.g., PC-WEBSITE-2026-001). Write problem statement (2-3 sentences): current situation, gap, impact. Write project purpose statement (1 paragraph): what will be achieved.

**Got:** Charter file created with document ID, problem statement, purpose filled in. Problem statement specific + describes measurable gap.

**If fail:** Project context unclear? Document specific questions for sponsor in QUESTIONS section at top of charter. Existing docs conflict? Note contradictions in OPEN ISSUES section, flag for stakeholder resolution.

### Step 2: Define Scope Boundaries

Make explicit lists: what is + is not in project scope. Write 3-5 in-scope deliverables with specific acceptance criteria each. Write 3-5 out-of-scope items to block scope creep. Populate Deliverables table: each deliverable, acceptance criteria, target date.

**Got:** Scope section balanced: in-scope + out-of-scope lists. Deliverables table has 3-5 entries, specific testable acceptance criteria. Target dates realistic, sequenced logically.

**If fail:** Deliverables vague? Break into sub-deliverables with concrete outputs. Acceptance criteria missing? Ask: "How would we demonstrate this deliverable is complete?" Target dates unavailable? Mark TBD, flag for milestone planning session.

### Step 3: Identify Stakeholders + Assign RACI

List all people/groups affected by, contributing to, or with decision authority over project. Include org role. Make RACI matrix mapping each stakeholder to each deliverable:
- **R** (Responsible): Does the work
- **A** (Accountable): Final decision authority (only one A per deliverable)
- **C** (Consulted): Gives input before decisions
- **I** (Informed): Kept updated

Ensure each deliverable has exactly one A + min one R.

**Got:** Stakeholders table lists 5-10 people with roles. RACI matrix: one A per deliverable column. No deliverable missing R or with multiple As. Sponsor = A for final approval.

**If fail:** Stakeholder list incomplete? Cross-reference with org chart + meeting attendees from discovery phase. Multiple As identified? Escalate conflict to sponsor for decision authority clarification. No R? Flag deliverable as unassigned, requiring resource allocation.

### Step 4: Define Success Criteria + Milestones

Write 3-5 measurable success criteria in SMART format (Specific, Measurable, Achievable, Relevant, Time-bound). Each criterion ties to quantifiable measure + target value. Define 4-6 key milestones for major project stages or deliverable completions. Target dates + dependencies on prior milestones.

**Got:** Success Criteria table: 3-5 entries with specific measures (e.g., "System uptime" measured as "% availability" with target "99.5%"). Milestones table shows logical project phases with realistic target dates. Dependencies clearly noted.

**If fail:** Success criteria vague (e.g., "improve quality")? Rewrite as measurable outcomes with baseline + target values. Milestone dates unrealistic? Work backward from final deadline using estimated durations + buffers. Dependencies create circular logic? Restructure milestone sequence or split conflicting milestones.

### Step 5: Create Initial Risk Register

Identify 5-10 risks that could impact project success. For each risk: assess likelihood (Low/Medium/High) + impact (Low/Medium/High), calculate severity. Define specific mitigation strategy per risk, assign risk owner for monitoring + response. Include min 1 risk per category: scope, schedule, resource, technical, external.

**Got:** Risk Register has 5-10 entries covering scope, schedule, resource, technical, external risks. Each risk has likelihood, impact, severity assessed. Mitigation strategies actionable + specific. Each risk has assigned owner.

**If fail:** Risk list incomplete? Review scope boundaries, dependencies, stakeholder list, assumptions for potential failure points. Mitigation strategies generic ("monitor closely")? Specify: What monitored? How often? What triggers action? No one accepts risk ownership? Assign to project lead temporarily, escalate to sponsor.

## Checks

- [ ] Charter file created with document ID
- [ ] Problem statement specific + measurable
- [ ] Scope has both in-scope + out-of-scope items
- [ ] RACI matrix covers all deliverables
- [ ] Success criteria measurable (SMART)
- [ ] Min 5 risks identified with mitigation strategies
- [ ] Milestones have target dates
- [ ] Approval section included

## Pitfalls

- **Scope without boundaries**: Listing in-scope without explicit out-of-scope → scope creep. Always define what you won't do.
- **Vague success criteria**: "Improve performance" = unmeasurable. Tie every criterion to a number with baseline + target.
- **Missing stakeholders**: Overlooked stakeholders surface late, derail project. Cross-reference org charts + prior project comms.
- **Risk register as checkbox**: Listing risks without actionable mitigation = false confidence. Each risk needs specific response strategy.
- **Over-detailed charter**: Charter = compass, not map. Keep 2-4 pages. Detailed planning happens later.

## See Also

- `create-work-breakdown-structure` — decompose charter deliverables into work packages
- `manage-backlog` — translate charter scope into prioritized backlog
- `plan-sprint` — plan first sprint from charter deliverables
- `generate-status-report` — report progress vs charter milestones
- `conduct-retrospective` — review charter assumptions after execution
