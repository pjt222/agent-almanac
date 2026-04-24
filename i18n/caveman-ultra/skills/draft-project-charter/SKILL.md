---
name: draft-project-charter
locale: caveman-ultra
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

Structured charter → project bounds + stakeholder agreement + success criteria before detailed planning. Doc: scope + RACI + milestones + initial risk register. Agile/classic/hybrid.

## Use When

- New project kickoff
- Formalize scope after informal start
- Align stakeholders before detailed planning
- Reference doc for scope decisions during execution
- Transition from discovery/ideation → active work

## In

- **Required**: Project name + brief desc
- **Required**: Primary stakeholder/sponsor
- **Optional**: Existing docs (proposals, briefs, emails)
- **Optional**: Known constraints (budget, deadline, team size)
- **Optional**: Methodology pref (agile, classic, hybrid)

## Do

### Step 1: Gather Context + Template

Read existing docs (proposals, emails, briefs) → understand background. ID core problem/opportunity. Create charter file w/ structured template → populate subsequent steps.

File: `PROJECT-CHARTER-[PROJECT-NAME].md`:

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

Fill doc ID → PC-[PROJECT]-[YYYY]-[NNN] (e.g., PC-WEBSITE-2026-001). Problem statement (2-3 sentences): current situation + gap + impact. Purpose (1 para): what will be achieved.

→ Charter file: doc ID + problem + purpose filled. Problem specific + measurable gap.

If err: context unclear → QUESTIONS section at top for sponsor. Existing docs conflict → OPEN ISSUES + flag for stakeholder resolution.

### Step 2: Scope Boundaries

Explicit in-scope + out-of-scope. Write 3-5 in-scope deliverables + specific acceptance criteria each. Write 3-5 out-of-scope → prevent creep. Populate Deliverables table: deliverable + criteria + target date.

→ Scope balanced. Deliverables 3-5 w/ specific testable criteria. Dates realistic + sequenced.

If err: vague deliverables → break into sub-deliverables w/ concrete outputs. Criteria missing → ask "How would we demonstrate this is complete?". No dates → TBD, flag for milestone session.

### Step 3: Stakeholders + RACI

List all affected/contributing/decision-authority individuals + org role. RACI matrix per stakeholder × deliverable:
- **R** (Responsible): does work
- **A** (Accountable): final decision authority (one A per deliverable)
- **C** (Consulted): input before decisions
- **I** (Informed): updated on progress

Each deliverable → exactly one A + ≥ one R.

→ Stakeholders 5-10 + roles. One A per deliverable column. No missing R / multiple As. Sponsor = A for final approval.

If err: list incomplete → cross-ref org chart + discovery meeting attendees. Multiple As → escalate to sponsor for clarification. No R → flag unassigned + resource allocation.

### Step 4: Success Criteria + Milestones

3-5 measurable criteria SMART (Specific + Measurable + Achievable + Relevant + Time-bound). Each → quantifiable measure + target. 4-6 key milestones = major stages/completions + target dates + deps on prior milestones.

→ Criteria 3-5 w/ specific measures (e.g., "Uptime" = "% availability" target "99.5%"). Milestones logical + realistic. Deps clear.

If err: criteria vague ("improve quality") → rewrite as measurable outcomes + baseline + target. Dates unrealistic → work backward from final deadline w/ durations + buffers. Circular deps → restructure sequence or split conflicting.

### Step 5: Initial Risk Register

5-10 risks. Per risk: likelihood (L/M/H) + impact (L/M/H) → severity. Specific mitigation + assigned owner. ≥1 per category: scope, schedule, resource, technical, external.

→ Register 5-10 across scope + schedule + resource + technical + external. Each w/ L + I + severity. Mitigations actionable + specific. Each has owner.

If err: incomplete → review scope + deps + stakeholders + assumptions for failure points. Generic mitigations ("monitor closely") → specify: what monitored, how often, what triggers action. No owner → assign project lead temp + escalate to sponsor.

## Check

- [ ] Charter file created w/ doc ID
- [ ] Problem specific + measurable
- [ ] Scope has in + out-of-scope
- [ ] RACI covers all deliverables
- [ ] Criteria SMART
- [ ] ≥5 risks w/ mitigations
- [ ] Milestones w/ target dates
- [ ] Approval section included

## Traps

- **Scope w/o bounds**: In-scope w/o out-of-scope → creep. Always define what NOT doing.
- **Vague criteria**: "Improve perf" unmeasurable. Tie each to number + baseline + target.
- **Missing stakeholders**: Overlooked ones surface late + derail. Cross-ref org charts + prior comms.
- **Risk register as checkbox**: Risks w/o actionable mitigations = false confidence. Each needs specific response.
- **Over-detailed charter**: Charter = compass, not map. 2-4 pages. Detailed planning later.

## →

- `create-work-breakdown-structure` — decompose deliverables → work packages
- `manage-backlog` — charter scope → prioritized backlog
- `plan-sprint` — first sprint from deliverables
- `generate-status-report` — report vs milestones
- `conduct-retrospective` — review assumptions after execution
