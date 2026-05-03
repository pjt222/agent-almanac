---
name: write-standard-operating-procedure
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write a GxP-compliant Standard Operating Procedure (SOP). Covers regulatory
  SOP template structure (purpose, scope, definitions, responsibilities,
  procedure, references, revision history), approval workflow design,
  periodic review scheduling, and operational procedures for system use. Use
  when a new validated system requires operational procedures, when existing
  informal procedures need formalisation, when an audit finding cites missing
  procedures, when a change control triggers SOP updates, or when periodic
  review identifies outdated procedural content.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, sop, procedure, documentation, compliance, quality-management
---

# Write Standard Operating Procedure

GxP-compliant SOP → clear, auditable instructions for regulated activities.

## Use When

- New validated system → operational procedures
- Existing procedures → formalisation into SOP
- Audit finding → missing|inadequate procedures
- Change control → SOP updates
- Periodic review → outdated content

## In

- **Required**: Process|system SOP covers
- **Required**: Regulatory ctx (GMP, GLP, GCP, 21 CFR Part 11, EU Annex 11)
- **Required**: Target audience (roles following SOP)
- **Optional**: Existing informal procedures, work instructions, training materials
- **Optional**: Related SOPs interfacing
- **Optional**: Audit findings|regulatory observations driving creation

## Do

### Step 1: Doc Control Metadata

```markdown
# Standard Operating Procedure
## Document ID: SOP-[DEPT]-[NNN]
## Title: [Descriptive Title of the Procedure]

| Field | Value |
|-------|-------|
| Document ID | SOP-[DEPT]-[NNN] |
| Version | 1.0 |
| Effective Date | [YYYY-MM-DD] |
| Review Date | [YYYY-MM-DD + review period] |
| Department | [Department name] |
| Author | [Name, Title] |
| Reviewer | [Name, Title] |
| Approver | [Name, Title] |
| Classification | [GxP-Critical / GxP-Supporting] |
| Supersedes | [Previous SOP ID or "N/A — New"] |
```

**Got:** Every SOP unique ID per org's doc numbering convention.

**If err:** No convention → establish first: [TYPE]-[DEPT]-[3-digit sequential].

### Step 2: Purpose + Scope

```markdown
### 1. Purpose
This SOP defines the procedure for [specific activity] to ensure [regulatory objective].

### 2. Scope
**In scope:**
- [System, process, or activity covered]
- [Applicable departments or roles]
- [Specific regulatory requirements addressed]

**Out of scope:**
- [Related activities covered by other SOPs — reference them]
- [Systems or departments not covered]
```

**Got:** Purpose 1-2 sentences. Scope clear boundaries.

**If err:** Scope overlaps existing SOP → ref existing for overlap or revise both to eliminate.

### Step 3: Terms + Abbreviations

```markdown
### 3. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available |
| CCB | Change Control Board |
| GxP | Good [Manufacturing/Laboratory/Clinical] Practice — umbrella for all regulated quality standards |
| SOP | Standard Operating Procedure |
| [Add terms specific to this SOP] | [Definition] |
```

**Got:** Every abbreviation + tech term defined.

**If err:** Term ambiguous|domain-specific → consult org glossary or relevant regulatory guidance for authoritative def.

### Step 4: Responsibilities

```markdown
### 4. Responsibilities

| Role | Responsibilities |
|------|-----------------|
| System Owner | Ensure SOP compliance, approve changes, conduct periodic review |
| System Administrator | Execute daily operations per this SOP, report deviations |
| Quality Assurance | Review SOP for regulatory compliance, approve new versions |
| End Users | Follow procedures as written, report issues to system administrator |
| Training Coordinator | Ensure all affected personnel are trained before SOP effective date |
```

**Got:** Every action in Procedure traceable to responsible role.

**If err:** Procedural step no assigned role → orphaned. Assign owner before approval.

### Step 5: Procedure Section

Core. Step-by-step instructions:

```markdown
### 5. Procedure

#### 5.1 [First Major Activity]
1. [Action verb] [specific instruction]. Reference: [form, system screen, tool].
2. [Action verb] [specific instruction].
   - If [condition], then [action].
   - If [alternative condition], then [alternative action].
3. [Action verb] [specific instruction].
4. Record the result in [form/system/log].

#### 5.2 [Second Major Activity]
1. [Action verb] [specific instruction].
2. Verify [specific criterion].
3. If verification fails, initiate [deviation procedure — reference SOP-XXX].

#### 5.3 Deviation Handling
1. If any step cannot be performed as written, STOP and document the deviation.
2. Notify [role] within [timeframe].
3. Complete Deviation Form [form reference].
4. Do not proceed until [role] provides disposition.
```

Writing rules for GxP SOPs:
- Each step → action verb (verify, record, enter, approve, notify)
- Specific enough → trained operator no interpretation
- Decision points w/ clear criteria per path
- Reference exact form names, system screens, tool IDs
- Hold points where work must stop pending approval|verify

**Got:** Trained person unfamiliar w/ specific process could follow steps correctly.

**If err:** SMEs say procedure ambiguous → add detail|break into sub-steps. Ambiguity = recurring audit finding.

### Step 6: Refs, Attachments, Revision History

```markdown
### 6. References
| Document ID | Title |
|-------------|-------|
| SOP-QA-001 | Document Control |
| SOP-IT-015 | User Access Management |
| [Regulation reference] | [e.g., 21 CFR Part 11] |

### 7. Attachments
| Attachment | Description |
|-----------|-------------|
| Form-001 | [Form name and purpose] |
| Template-001 | [Template name and purpose] |

### 8. Revision History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | [Date] | [Name] | Initial release |
```

**Got:** All ref'd docs accessible to users, revision history starts from 1.0.

**If err:** Ref'd docs don't exist yet → create them or remove ref + note gap in SOP review.

### Step 7: Review + Approval

```markdown
### Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | [Name] | | |
| Technical Reviewer | [Name] | | |
| QA Reviewer | [Name] | | |
| Approver (Department Head) | [Name] | | |

### Training Requirement
All personnel listed in Section 4 must complete training on this SOP before the effective date. Training must be documented in the training management system.

### Periodic Review
This SOP must be reviewed at least every [2 years / annually] or when triggered by:
- Change control affecting the covered process or system
- Audit finding related to the covered process
- Regulatory guidance update affecting the covered requirements
```

**Got:** SOP reviewed by SME + approved by quality before effective.

**If err:** Approval workflow delayed → effective date pushed back. SOP can't be effective w/o completed approvals.

## Check

- [ ] Doc ID per org numbering convention
- [ ] Purpose specific + concise (1-2 sentences)
- [ ] Scope clear in-scope + out-of-scope boundaries
- [ ] All abbreviations + tech terms defined
- [ ] Every Responsibility role maps to procedure steps
- [ ] Procedure starts w/ action verbs + specific enough no interpretation
- [ ] Decision points clear criteria per path
- [ ] Deviation handling defined
- [ ] All ref'd docs exist + accessible
- [ ] Revision history complete from 1.0
- [ ] Approval signatures: author, reviewer, approver
- [ ] Periodic review schedule defined

## Traps

- **Too vague**: "Ensure data quality" not procedural step. "Verify all 15 fields in Form-001 populated + within range per Appendix A" is.
- **Too detailed**: Troubleshooting every possible err makes SOP unreadable. Ref separate work instruction.
- **No deviation handling**: Every SOP must define what to do when procedure can't be followed. Silence implies no deviations possible.
- **Effective before training**: SOP effective before users trained → immediate compliance gap.
- **Orphaned SOPs**: Never reviewed → outdated + unreliable. Set review dates + track in doc control.

## →

- `design-compliance-architecture` — IDs which systems + processes need SOPs
- `manage-change-control` — triggers SOP updates when processes change
- `design-training-program` — ensures users trained on new + updated SOPs
- `conduct-gxp-audit` — audits assess SOP adequacy + adherence
- `write-validation-documentation` — SOPs + validation docs share approval workflows
