---
name: design-compliance-architecture
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design a compliance architecture that maps applicable regulations to
  computerized systems. Covers system inventory, criticality classification
  (GxP-critical, GxP-supporting, non-GxP), GAMP 5 category assignment,
  regulatory requirements traceability, and governance structure definition.
  Use when establishing a new regulated facility, formalising compliance
  across multiple systems, addressing a regulatory gap analysis, harmonising
  compliance after mergers or reorganisations, or preparing a site master
  file that references computerized systems.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, compliance, architecture, regulatory, gamp-5, governance
---

# Design Compliance Architecture

Top-level framework → regs to sys, criticality class, governance for regulated env.

## Use When

- New regulated facility/dept/program
- Formalize compliance across multi sys
- Gap analysis reveals missing class/valid strategy
- M&A, reorg → harmonize compliance
- Site master file / quality manual references

## In

- **Required**: Sys list in scope (name, purpose, vendor/custom)
- **Required**: Applicable reg frameworks (21 CFR Part 11, EU Annex 11, GMP, GLP, GCP, ICH Q7, ICH Q10)
- **Required**: Org context (dept, site, product types)
- **Optional**: Existing validation master plan
- **Optional**: Prior audit findings / inspection obs
- **Optional**: Org chart w/ quality + IT reporting

## Do

### Step 1: System inventory

Comprehensive:

```markdown
# System Inventory
## Document ID: SI-[SITE]-[YYYY]-[NNN]

| ID | System Name | Version | Vendor | Purpose | Department | Data Types | Users |
|----|-------------|---------|--------|---------|------------|------------|-------|
| SYS-001 | LabWare LIMS | 8.1 | LabWare Inc. | Sample management and testing | QC | Test results, COA | 45 |
| SYS-002 | SAP ERP | S/4HANA | SAP SE | Batch release and inventory | Production | Batch records, BOM | 120 |
| SYS-003 | Custom R/Shiny | 2.1.0 | Internal | Statistical analysis | Biostatistics | Clinical data | 8 |
| SYS-004 | Windows Server | 2022 | Microsoft | File server | IT | Documents | 200 |
```

→ Every sys creating/modifying/storing/retrieving/transmitting GxP data listed.

If err: Sys owners incomplete → doc gap, discovery workshop. Missing = critical risk.

### Step 2: Classify criticality

Tier per sys:

```markdown
# System Criticality Classification
## Document ID: SCC-[SITE]-[YYYY]-[NNN]

### Classification Criteria

| Tier | Definition | Validation Required | Examples |
|------|-----------|-------------------|----------|
| **GxP-Critical** | Directly impacts product quality, patient safety, or data integrity. Generates or processes GxP records. | Full CSV per GAMP 5 | LIMS, ERP (batch), CDMS, MES |
| **GxP-Supporting** | Supports GxP processes but does not directly generate GxP records. Failure has indirect impact. | Risk-based qualification | Email, document management, scheduling |
| **Non-GxP** | No impact on product quality, safety, or data integrity. | IT standard controls only | HR systems, cafeteria, general web |

### System Classification Matrix

| System ID | System | Tier | Rationale |
|-----------|--------|------|-----------|
| SYS-001 | LabWare LIMS | GxP-Critical | Generates test results used for batch release |
| SYS-002 | SAP ERP | GxP-Critical | Manages batch records and material traceability |
| SYS-003 | R/Shiny App | GxP-Critical | Performs statistical analysis for regulatory submissions |
| SYS-004 | Windows Server | GxP-Supporting | Stores controlled documents but does not generate GxP data |
```

→ Every sys tiered w/ rationale.

If err: Disputed → escalate to quality council. When in doubt → tier up, reassess.

### Step 3: GAMP 5 categories

Each GxP-Critical + GxP-Supporting:

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

Category ref:
- **Cat 1**: Infrastructure (OS, firmware) → verify install
- **Cat 3**: Non-configured COTS → verify as-is
- **Cat 4**: Configured → verify all configs
- **Cat 5**: Custom → full lifecycle

→ Category aligns w/ how used, not just what it is.

If err: Spans categories (COTS + custom add-ons) → custom = Cat 5, base = Cat 4.

### Step 4: Map reg reqs → sys

Traceability matrix:

```markdown
# Regulatory Requirements Traceability Matrix
## Document ID: RRTM-[SITE]-[YYYY]-[NNN]

| Regulation | Clause | Requirement | Applicable Systems | Control Type |
|-----------|--------|-------------|-------------------|--------------|
| 21 CFR 11 | 11.10(a) | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| 21 CFR 11 | 11.10(d) | Access controls | SYS-001, SYS-002, SYS-003, SYS-004 | Technical |
| 21 CFR 11 | 11.10(e) | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| 21 CFR 11 | 11.50 | Signature manifestation | SYS-001, SYS-002 | Technical |
| EU Annex 11 | §4 | Validation | SYS-001, SYS-002, SYS-003 | Procedural + Technical |
| EU Annex 11 | §7 | Data storage and backup | All | Technical |
| EU Annex 11 | §9 | Audit trail | SYS-001, SYS-002, SYS-003 | Technical |
| EU Annex 11 | §12 | Security and access | All | Technical |
| ICH Q10 | §3.2 | Change management | All GxP-Critical | Procedural |
| ICH Q10 | §1.8 | Knowledge management | SYS-001, SYS-003 | Procedural |
```

→ Every clause maps ≥1 sys. Every GxP-Critical maps to clauses.

If err: Unmapped clauses = gaps. Remediation plan w/ timelines.

### Step 5: Validation strategy per sys

By criticality + category + reg mapping:

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

Abbrev: URS (User Reqs), RA (Risk Assess), VP (Valid Plan), IQ/OQ/PQ (Install/Operational/Perf Qual), TM (Trace Matrix), VSR (Valid Summary Report).

→ Effort proportional to risk. Cat 5 GxP-Critical → full lifecycle. Cat 1 → streamlined IQ.

If err: Stakeholders push reduced → doc risk acceptance w/ QA sign-off.

### Step 6: Governance

Org framework → sustain compliance:

```markdown
# Compliance Governance Structure

## Roles and Responsibilities
| Role | Responsibility | Authority |
|------|---------------|-----------|
| Quality Director | Overall compliance accountability | Approve validation strategies, accept risks |
| System Owner | Day-to-day system compliance | Approve changes, ensure validated state |
| Validation Lead | Plan and coordinate validation activities | Define validation scope and approach |
| IT Operations | Technical infrastructure and security | Implement technical controls |
| QA Reviewer | Independent review of validation deliverables | Accept or reject validation evidence |

## Governance Committees
| Committee | Frequency | Purpose | Members |
|-----------|-----------|---------|---------|
| Change Control Board | Weekly | Review and approve system changes | System owners, QA, IT, validation |
| Periodic Review Committee | Quarterly | Review system compliance status | Quality director, system owners, QA |
| Audit Programme Committee | Annual | Plan internal audit schedule | Quality director, lead auditor, QA |

## Escalation Matrix
| Issue | First Escalation | Second Escalation | Timeline |
|-------|-----------------|-------------------|----------|
| Critical audit finding | System Owner → QA Director | QA Director → Site Director | 24 hours |
| Validated state breach | Validation Lead → System Owner | System Owner → Quality Director | 48 hours |
| Data integrity incident | System Owner → QA Director | QA Director → Regulatory Affairs | 24 hours |
```

→ Clear accountability, no orphans.

If err: Overlap/unassigned → RACI workshop. Ambiguous = recurring citation.

### Step 7: Compile master doc

Assemble:

```markdown
# Compliance Architecture
## Document ID: CA-[SITE]-[YYYY]-[NNN]
## Version: 1.0

### 1. Purpose and Scope
[Organisation, site, product scope, regulatory scope]

### 2. System Inventory
[From Step 1]

### 3. Criticality Classification
[From Step 2]

### 4. GAMP 5 Category Assignments
[From Step 3]

### 5. Regulatory Requirements Traceability
[From Step 4]

### 6. Validation Strategy
[From Step 5]

### 7. Governance Structure
[From Step 6]

### 8. Periodic Review Schedule
- System inventory refresh: Annual
- Criticality re-assessment: When new systems added or regulations change
- Regulatory mapping update: When new guidance issued
- Governance review: Annual or after organisational change

### 9. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Director | | | |
| IT Director | | | |
| Regulatory Affairs | | | |
```

→ Single blueprint for regulated env.

If err: Too big → master + subsidiaries per sys/domain.

## Check

- [ ] Inventory includes every sys w/ GxP data
- [ ] Every sys → tier + rationale
- [ ] GAMP 5 cats assigned → all GxP-Critical + Supporting
- [ ] RRTM covers all applicable clauses
- [ ] Every GxP-Critical → validation strategy
- [ ] Governance: roles, committees, escalation
- [ ] Docs have unique IDs + ver ctrl
- [ ] Architecture doc approved by quality + IT

## Traps

- **Incomplete inventory**: Missing = invisible. Use network scans, SAM tools, dept interviews — not just IT.
- **Binary thinking**: Not "GxP" vs "not". 3-tier (Critical, Supporting, Non-GxP) avoids over + under validation.
- **Category confusion**: GAMP 5 = what software IS. Validation effort = how USED. Cat 4 batch release > Cat 4 scheduling.
- **Static architecture**: Living doc. New sys, reg changes, audit findings → update.
- **Governance no teeth**: Paper committees = no value. Define cadence + quorum.

## →

- `perform-csv-assessment` — execute validation per sys
- `manage-change-control` — operationalize change ctrl
- `implement-electronic-signatures` — e-sig ctrls in RRTM
- `prepare-inspection-readiness` — use as foundation
- `conduct-gxp-audit` — audit vs architecture
