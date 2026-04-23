---
name: decommission-validated-system
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Decommission a validated computerized system at end-of-life. Covers data
  retention assessment by regulation, data migration validation (mapping,
  transformation, reconciliation), archival strategy, access revocation,
  documentation archival, and stakeholder notification. Use when a validated
  system is being replaced, reaching end-of-life without replacement, vendor
  support is discontinued, multiple systems are consolidating, or regulatory
  changes render a system obsolete.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, decommission, data-retention, migration, archival, compliance
---

# Decommission Validated System

Controlled retirement of validated sys + preserve data integrity + meet retention reqs.

## Use When

- Validated sys replaced
- EOL no replacement (biz proc eliminated)
- Vendor discontinues support
- Consolidation → single platform
- Reg / biz changes → obsolete

## In

- **Required**: Sys (name, ver, valid status)
- **Required**: Retention reqs (21 CFR Part 11, GLP, GCP)
- **Required**: Replacement sys (if applic) + migration scope
- **Optional**: Current valid doc pkg
- **Optional**: Data vol + fmt inventory
- **Optional**: Biz owner + stakeholders

## Do

### Step 1: Retention Reqs

How long + what form:

```markdown
# Data Retention Assessment
## Document ID: DRA-[SYS]-[YYYY]-[NNN]

### Regulatory Retention Requirements
| Regulation | Data Type | Retention Period | Format Requirements |
|-----------|-----------|-----------------|-------------------|
| 21 CFR 211 (GMP) | Batch records, test results | 1 year past product expiry or 3 years after distribution | Readable, retrievable |
| 21 CFR 58 (GLP) | Study data and records | Duration of study + retention agreement | Original or certified copy |
| ICH E6 (GCP) | Clinical trial records | 2 years after last marketing approval or formal discontinuation | Accessible for inspection |
| 21 CFR Part 11 | Electronic records | Per predicate rule | Original format or validated migration |
| EU Annex 11 | Computerized system records | Per applicable GxP | Readable and available |
| Tax/financial | Financial records | 7-10 years (jurisdiction-dependent) | Readable |

### System Data Inventory
| Data Category | Volume | Format | Retention Required Until | Disposition |
|---------------|--------|--------|------------------------|-------------|
| [e.g., Batch records] | [e.g., 50,000 records] | [e.g., Database + PDF reports] | [Date] | Migrate / Archive / Destroy |
| [e.g., Audit trail] | [e.g., 2M entries] | [e.g., Database] | [Same as parent records] | Archive |
| [e.g., User data] | [e.g., 200 profiles] | [e.g., LDAP/Database] | [Employment + 2 years] | Anonymise and archive |
```

**Got:** Every cat has retention + fmt + disposition.

**If err:** Unclear reqs → consult regulatory + legal. Default longest applic.

### Step 2: Migration Plan (If Applic)

Data → replacement:

```markdown
# Data Migration Plan
## Document ID: DMP-[SYS]-[YYYY]-[NNN]

### Migration Scope
| Source | Target | Data Category | Records | Migration Method |
|--------|--------|---------------|---------|-----------------|
| [Old system] | [New system] | [Category] | [Count] | ETL / Manual / API |

### Data Mapping
| Source Field | Source Format | Target Field | Target Format | Transformation |
|-------------|-------------|-------------|---------------|---------------|
| [e.g., test_result] | FLOAT(8,2) | [e.g., result_value] | DECIMAL(10,3) | Precision conversion |
| [e.g., operator_id] | VARCHAR(20) | [e.g., user_id] | UUID | Lookup table mapping |

### Validation Approach
| Check | Method | Acceptance Criteria |
|-------|--------|-------------------|
| Record count reconciliation | Source count vs target count | 100% match |
| Field-level comparison | Sample 5% of records, all fields | 100% match after transformation |
| Checksum verification | Hash source vs target for key fields | Checksums match |
| Business rule validation | Verify key calculations in target | Results match source |
| Audit trail continuity | Verify historical audit trail migrated | All entries present with original timestamps |
```

**Got:** Plan w/ mapping + transforms + validation → proves integrity.

**If err:** Migration valid fails → do NOT decommission. Fix + re-validate.

### Step 3: Archival Strategy

Data → archive (not migrate):

```markdown
# Archival Strategy

### Archive Format
| Consideration | Decision | Rationale |
|--------------|----------|-----------|
| Format | [PDF/A, CSV, XML, database backup] | [Why this format survives the retention period] |
| Medium | [Network storage, cloud archive, tape, optical] | [Durability and accessibility] |
| Encryption | [Yes/No — method if yes] | [Security vs long-term accessibility trade-off] |
| Integrity verification | [SHA-256 checksums, periodic verification schedule] | [Prove archive is uncorrupted] |

### Archive Verification
- [ ] Archived data is readable without the source system
- [ ] All required data categories are included in the archive
- [ ] Checksums recorded at time of archival
- [ ] Archive can be searched and retrieved within [defined SLA, e.g., 5 business days]
- [ ] Periodic integrity checks scheduled (annually)

### Archive Access
| Role | Access Level | Authorisation |
|------|-------------|--------------|
| QA Director | Read access to all archived data | Standing authorisation |
| Regulatory Affairs | Read access for inspection support | Standing authorisation |
| System Owner (former) | Read access for business queries | Request-based |
| External auditors | Read access, supervised | Per audit plan |
```

**Got:** Archive readable + searchable + verifiable w/o orig sys.

**If err:** Can't read indep of src sys → not compliant. Export → open std fmt (PDF/A, CSV) pre-decomm.

### Step 4: Execute

```markdown
# Decommission Checklist
## Document ID: DC-[SYS]-[YYYY]-[NNN]

### Pre-Decommission
- [ ] All stakeholders notified of decommission date and data disposition
- [ ] Data migration completed and validated (if applicable)
- [ ] Data archive created and verified (if applicable)
- [ ] Final backup of complete system taken and stored separately
- [ ] All open change requests resolved or transferred
- [ ] All open CAPAs resolved or transferred to successor system
- [ ] All active users informed and redirected to replacement system (if applicable)

### Decommission Execution
- [ ] User access revoked for all accounts
- [ ] System removed from production environment
- [ ] Network connections disconnected
- [ ] Licenses returned or terminated
- [ ] System entry removed from active system inventory
- [ ] System moved to "Decommissioned" status in compliance architecture

### Post-Decommission
- [ ] Validation documentation archived (URS, VP, IQ/OQ/PQ, TM, VSR)
- [ ] SOPs retired or updated to remove references to decommissioned system
- [ ] Training records archived
- [ ] Change control records archived
- [ ] Audit trail archived
- [ ] Decommission report completed and approved

### Decommission Report
| Section | Content |
|---------|---------|
| System description | Name, version, purpose, GxP classification |
| Decommission rationale | Why the system is being retired |
| Data disposition summary | What data went where (migrated, archived, destroyed) |
| Validation evidence | Migration validation results, archive verification |
| Residual risk | Any ongoing data retention obligations |
| Approval | System owner, QA, IT signatures |
```

**Got:** Decomm = controlled + documented + approved. Not "turn it off".

**If err:** Any item incomplete → doc exception + QA approval before proceeding.

## Check

- [ ] Retention reqs assessed all cats
- [ ] Migration validated w/ counts + sampling + checksums (if applic)
- [ ] Archive in fmt readable w/o src sys
- [ ] Archive integrity verified w/ checksums
- [ ] All user access revoked
- [ ] Valid docs archived w/ retention period
- [ ] SOPs updated to remove decomm sys refs
- [ ] Decomm report approved: sys owner + QA + IT

## Traps

- **Premature decomm**: Turn off pre-migration valid → permanent data loss. Complete valid first.
- **Unreadable archives**: Proprietary fmt needs orig sys → defeats purpose. Use open fmts.
- **Forgotten audit trails**: Archive data but not audit trail → no provenance. Always archive trails w/ parent records.
- **Orphaned SOPs**: SOPs still ref decomm sys → user confusion + compliance gaps. Update / retire all.
- **No periodic archive verify**: Archives degrade. No integrity checks → loss undetected until inspection.

## →

- `design-compliance-architecture` — update sys inventory post-decomm
- `manage-change-control` — decomm = major change → change control
- `write-validation-documentation` — migration valid follows same IQ/OQ
- `write-standard-operating-procedure` — retire/update SOPs
- `prepare-inspection-readiness` — archived data accessible for inspections
