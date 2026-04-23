---
name: decommission-validated-system
locale: caveman
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

Plan and execute controlled retirement of validated computerized system. Preserve data integrity and meet regulatory retention requirements.

## When Use

- Validated system being replaced by new system
- System reaching end-of-life with no replacement (business process eliminated)
- Vendor discontinues support for validated product
- Consolidation of many systems into single platform
- Regulatory or business changes make system obsolete

## Inputs

- **Required**: System to be decommissioned (name, version, validation status)
- **Required**: Data retention requirements by regulation (21 CFR Part 11, GLP, GCP)
- **Required**: Replacement system (if applicable) and migration scope
- **Optional**: Current validation documentation package
- **Optional**: Data volume and format inventory
- **Optional**: Business owner and stakeholder list

## Steps

### Step 1: Assess Data Retention Requirements

Determine how long data must be retained and in what form:

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

**Got:** Every data category has defined retention period, format requirement, planned disposition.
**If fail:** Retention requirements unclear? Consult regulatory affairs and legal. Default to longest applicable retention period.

### Step 2: Plan Data Migration (If Applicable)

If data migrating to replacement system:

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

**Got:** Migration plan has mapping, transformation rules, validation checks proving data integrity maintained.
**If fail:** Migration validation fails? Do not proceed to decommission. Fix migration issues and re-validate.

### Step 3: Define Archival Strategy

For data that will be archived rather than migrated:

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

**Got:** Archived data readable, searchable, verifiable without original system.
**If fail:** Data cannot be read independently of source system? Archive not compliant. Consider exporting to open, standard format (PDF/A, CSV) before decommission.

### Step 4: Execute Decommissioning

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

**Got:** Decommissioning controlled, documented, approved — not just "turn it off."
**If fail:** Any checklist item cannot be completed? Document exception and get QA approval before proceeding.

## Checks

- [ ] Data retention requirements assessed for all data categories
- [ ] Data migration validated with record counts, sampling, checksums (if applicable)
- [ ] Archive created in format readable without source system
- [ ] Archive integrity verified with checksums
- [ ] All user access revoked
- [ ] Validation documentation archived with defined retention period
- [ ] SOPs updated to remove references to decommissioned system
- [ ] Decommission report approved by system owner, QA, IT

## Pitfalls

- **Premature decommission**: Turning off system before data migration validated → permanent data loss risk. Complete all validation before pulling plug.
- **Unreadable archives**: Storing data in proprietary format needing original system to read defeats purpose of archival. Use open formats.
- **Forgotten audit trails**: Archiving data but not audit trail → data provenance cannot be shown. Always archive audit trails with their parent records.
- **Orphaned SOPs**: SOPs still referencing decommissioned system confuse users and make compliance gaps. Update or retire all affected SOPs.
- **No periodic archive verification**: Archives degrade. Without periodic integrity checks, data loss may go undetected until data is needed for inspection.

## See Also

- `design-compliance-architecture` — update system inventory and compliance architecture after decommission
- `manage-change-control` — decommissioning is major change requiring change control
- `write-validation-documentation` — migration validation follows same IQ/OQ methodology
- `write-standard-operating-procedure` — retire or update SOPs referencing decommissioned system
- `prepare-inspection-readiness` — archived data must stay accessible for regulatory inspections
