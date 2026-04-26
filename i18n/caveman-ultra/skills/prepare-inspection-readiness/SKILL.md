---
name: prepare-inspection-readiness
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Prep org for regulatory inspection: assess readiness vs agency-specific focus
  (FDA, EMA, MHRA). Warning letter + 483 themes, mock inspection protocols, doc
  bundles, logistics, response templates. Use → inspection announced/anticipated,
  periodic self-assess due, new systems since last inspection, after major audit
  finding may attract regulatory attention.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, inspection, fda, ema, mhra, readiness, compliance, 483
---

# Prepare Inspection Readiness

Assess + improve org readiness for regulatory inspection: docs, personnel, logistics, response planning.

## Use When

- Inspection announced or anticipated
- Periodic self-assess due
- New systems/processes since last inspection
- Industry trends (warning letters, 483s) → emerging focus
- After major audit finding may attract regulatory attention

## In

- **Required**: Inspecting authority (FDA, EMA, MHRA, other)
- **Required**: Expected scope (data integrity, CSV, GMP, GLP, GCP)
- **Required**: Compliance arch + system inventory
- **Optional**: Prior inspection reports + observations
- **Optional**: Recent industry warning letters + 483 themes
- **Optional**: Open CAPAs + audit findings

## Do

### Step 1: Analyse Agency-Specific Focus

Research authority's current priorities:

```markdown
# Inspection Focus Area Analysis
## Document ID: IFA-[SITE]-[YYYY]-[NNN]

### FDA Current Focus Areas
| Focus Area | Regulatory Basis | Recent 483 Trends | Risk to This Site |
|-----------|-----------------|-------------------|-------------------|
| Data integrity | 21 CFR Part 11, CGMP | #1 cited observation in drug 483s since 2016 | [H/M/L] |
| Audit trail | 21 CFR 11.10(e) | Disabled/incomplete audit trails | [H/M/L] |
| Electronic signatures | 21 CFR 11.50-11.300 | Missing manifestation, shared accounts | [H/M/L] |
| Computer system validation | GAMP 5, FDA guidance | Inadequate validation of Category 4/5 systems | [H/M/L] |
| Change control | ICH Q10 | Undocumented or retrospective changes | [H/M/L] |
| Laboratory controls | 21 CFR 211.160-211.176 | OOS investigation, test repetition | [H/M/L] |

### EMA/MHRA-Specific Considerations
| Area | EU Annex 11 Reference | Focus | Risk to This Site |
|------|----------------------|-------|-------------------|
| Computerized system validation | §4, §5 | Risk-based validation, supplier assessment | [H/M/L] |
| Operational phase | §6-§13 | Security, audit trail, backup, business continuity | [H/M/L] |
| Cloud and outsourced systems | §3.4 | Service level agreements, data sovereignty | [H/M/L] |
| Data governance | MHRA DI guidance | ALCOA+, culture of integrity | [H/M/L] |
```

→ Risk-rated analysis of focus areas specific to authority.

If err: recent 483/warning letter data unavailable → consult FDA warning letter DB, EMA inspection reports, or industry pubs for current trends.

### Step 2: Conduct Readiness Self-Assess

Eval site vs each focus area:

```markdown
# Inspection Readiness Assessment
## Document ID: IRA-[SITE]-[YYYY]-[NNN]

### Readiness Scoring
| Focus Area | Weight | Current State | Score (1-5) | Gap | Remediation Priority |
|-----------|--------|--------------|-------------|-----|---------------------|
| Data integrity controls | High | [Description of current state] | [1-5] | [Gap description] | [Critical/High/Medium/Low] |
| Validation documentation | High | [Description] | [1-5] | [Gap] | [Priority] |
| Audit trail compliance | High | [Description] | [1-5] | [Gap] | [Priority] |
| Electronic signatures | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Change control | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Training records | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| SOPs (current, approved) | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| CAPA management | Medium | [Description] | [1-5] | [Gap] | [Priority] |
| Vendor qualification | Low | [Description] | [1-5] | [Gap] | [Priority] |
| Periodic review | Low | [Description] | [1-5] | [Gap] | [Priority] |

Score: 1 = Critical gaps, 5 = Fully compliant
Overall readiness score: [Sum / Max] = [X]%

### Remediation Plan
| Gap ID | Description | Owner | Action | Deadline | Status |
|--------|------------|-------|--------|----------|--------|
| GAP-001 | [Gap] | [Name] | [Remediation action] | [Date] | [Open/In Progress/Closed] |
```

→ Quantified readiness assess w/ prioritised remediation actions.

If err: overall <70% → consider request inspection delay (if permitted) + emergency remediation.

### Step 3: Prep Document Bundles

Organise docs → inspection-ready packages:

```markdown
# Inspection Document Bundles

### Bundle 1: Validation Pack (per system)
- [ ] Current validation status summary (one-page per system)
- [ ] User Requirements Specification (URS)
- [ ] Risk Assessment
- [ ] Validation Plan
- [ ] IQ Protocol and Report
- [ ] OQ Protocol and Report
- [ ] PQ Protocol and Report (if applicable)
- [ ] Traceability Matrix
- [ ] Validation Summary Report
- [ ] Periodic review records
- [ ] Change control history since last validation

### Bundle 2: Data Integrity Evidence
- [ ] Data integrity policy and programme
- [ ] ALCOA+ assessment results
- [ ] Audit trail review records (last 12 months)
- [ ] Data integrity monitoring metrics and trends
- [ ] Data integrity training records

### Bundle 3: Operational Evidence
- [ ] Current SOPs (master list with effective dates)
- [ ] Training matrix (all GxP personnel)
- [ ] Change control log (last 24 months)
- [ ] Deviation/incident log (last 24 months)
- [ ] CAPA log with closure status
- [ ] Internal audit reports and CAPA follow-up

### Bundle 4: System Configuration Evidence
- [ ] User access list (current active users with roles)
- [ ] System configuration documentation
- [ ] Backup and recovery test records
- [ ] Security patch log
- [ ] Business continuity/disaster recovery plan
```

→ All bundles assembled, indexed, accessible w/in 30 min of inspector req.

If err: docs missing/incomplete → gap list, prioritise remediation, doc plan. Inspectors notice disorganisation.

### Step 4: Design Mock Inspection Protocol

```markdown
# Mock Inspection Protocol
## Document ID: MIP-[SITE]-[YYYY]-[NNN]

### Scope
- **Focus areas:** [Top 3-5 risk areas from readiness assessment]
- **Systems in scope:** [Systems likely to be inspected]
- **Duration:** [1-2 days]

### Participants
| Role | Name | Mock Inspection Role |
|------|------|---------------------|
| Mock inspector | [Experienced QA or external consultant] | Ask questions, request documents |
| System owner(s) | [Names] | Respond to questions, demonstrate systems |
| QA | [Name] | Observe, note findings |
| Back room coordinator | [Name] | Locate and provide documents |

### Mock Inspection Scenarios
| Scenario | Focus | Inspector Might Ask |
|----------|-------|-------------------|
| 1: Show me the audit trail | Data integrity | "Show me the audit trail for batch record BR-2025-1234" |
| 2: Walk me through a change | Change control | "Show me the change control for the last system upgrade" |
| 3: Show training records | Training | "Show me the training records for user [Name] on system [X]" |
| 4: Explain your validation | CSV | "Walk me through how you validated this system" |
| 5: Show a deviation | CAPA | "Show me your last critical deviation and its CAPA" |
| 6: User access review | Access control | "Show me how you manage user access when people leave" |

### Post-Mock Assessment
| Scenario | Outcome | Findings | Actions |
|----------|---------|----------|---------|
| [#] | [Satisfactory/Needs Work] | [Description] | [Remediation if needed] |
```

→ Mock reveals issues before real inspection.

If err: mock reveals critical gaps → treat as critical findings w/ same urgency as real observations.

### Step 5: Plan Inspection Logistics

```markdown
# Inspection Logistics Plan

### Room Setup
| Room | Purpose | Equipment | Assigned To |
|------|---------|-----------|-------------|
| Front room | Inspector workspace | Table, chairs, network access, printer | Facility manager |
| Back room | Document retrieval and strategy | Copier, network access, phone | QA team |
| Demo room | System demonstrations | Workstation with system access | IT support |

### Roles During Inspection
| Role | Person | Responsibilities |
|------|--------|-----------------|
| Inspection coordinator | [Name] | Single point of contact with inspector, schedule management |
| Subject matter experts | [Names] | Answer technical questions in their domain |
| Back room lead | [Name] | Coordinate document retrieval, track requests |
| Scribe | [Name] | Document all questions, requests, and responses |
| Executive sponsor | [Name] | Available for escalation, opening/closing meetings |

### Communication Protocol
- All document requests flow through the back room lead
- No documents provided without QA review
- Questions requiring research get a "we will get back to you" response (track and follow up)
- Daily debrief with inspection team after each day
```

→ Logistics ensures professional, organised response.

If err: key personnel unavailable → ID + brief alternates.

### Step 6: Create Response Templates

```markdown
# Inspection Response Templates

### Template 1: 483 Observation Response
[Date]
[FDA District Office Address]

Re: FDA Form 483 Observations — [Inspection Dates] — [Facility Name]

Dear [Inspector Name],

We appreciate the opportunity to address the observations identified during the inspection of [facility] on [dates].

**Observation [N]:** [Quote the exact observation text]

**Response:**
- **Root Cause:** [Brief root cause description]
- **Immediate Corrective Action:** [What was done immediately]
  - Completed: [Date]
- **Long-term Corrective Action:** [Systemic fix]
  - Target completion: [Date]
- **Preventive Action:** [How recurrence will be prevented]
  - Target completion: [Date]
- **Effectiveness Verification:** [How effectiveness will be measured]
  - Target verification date: [Date]

### Template 2: Immediate Correction During Inspection
When an inspector identifies an issue that can be corrected immediately:
1. Acknowledge the observation
2. Implement the correction (if feasible)
3. Document the correction with before/after evidence
4. Inform the inspector that the correction has been made
5. Include in the formal response as "corrected during inspection"
```

→ Templates enable rapid structured replies.

If err: templates generic, don't address specific observation → customise w/ specific evidence + timelines.

## Check

- [ ] Agency-specific focus areas analysed w/ risk ratings
- [ ] Readiness self-assess complete w/ quantified scores
- [ ] Remediation plan for all gaps w/ owners + deadlines
- [ ] Doc bundles assembled + indexed for all in-scope systems
- [ ] Mock inspection done w/ documented findings + follow-up
- [ ] Logistics plan defines rooms, roles, comm protocol
- [ ] Response templates prepared for common observations
- [ ] All critical remediation closed before inspection date

## Traps

- **Last-minute prep**: Readiness = continuous programme, not cram. Scramble → disorganised, incomplete responses.
- **Hide problems**: Inspectors detect concealment. Transparency w/ remediation > attempted concealment.
- **Over-volunteer info**: Answer asked question. Unsolicited info opens new inquiry lines.
- **Untrained personnel**: SMEs who've never practiced perform poorly. Mock = essential practice.
- **Ignore back room**: Back room (doc retrieval + strategy) = as important as front. Poor retrieval → impression of disorganisation.

## →

- `design-compliance-architecture` — foundation doc inspectors want to see
- `conduct-gxp-audit` — internal audits mimic inspection methodology
- `monitor-data-integrity` — top FDA inspection focus
- `investigate-capa-root-cause` — CAPAs investigated thoroughly before inspection
- `qualify-vendor` — vendor qualifications frequently requested
