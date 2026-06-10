---
name: decommission-validated-system
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

Plan and execute the controlled retirement of a validated computerized system while preserving data integrity and meeting regulatory retention requirements.

## When to Use

- A validated system is being replaced by a new system
- A system is reaching end-of-life with no replacement (business process eliminated)
- Vendor discontinues support for a validated product
- Consolidation of multiple systems into a single platform
- Regulatory or business changes render a system obsolete

## Inputs

- **Required**: System to be decommissioned (name, version, validation status)
- **Required**: Data retention requirements by regulation (21 CFR Part 11, GLP, GCP)
- **Required**: Replacement system (if applicable) and migration scope
- **Optional**: Current validation documentation package
- **Optional**: Data volume and format inventory
- **Optional**: Business owner and stakeholder list

## Procedure

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

**Expected:** Every data category has a defined retention period, format requirement, and planned disposition.
**On failure:** If retention requirements are unclear, consult regulatory affairs and legal. Default to the longest applicable retention period.

### Step 2: Plan Data Migration (If Applicable)

If data is migrating to a replacement system:

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

**Expected:** Migration plan includes mapping, transformation rules, and validation checks that prove data integrity was maintained.
**On failure:** If migration validation fails, do not proceed to decommission. Fix the migration issues and re-validate.

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

**Expected:** Archived data is readable, searchable, and verifiable without the original system.
**On failure:** If data cannot be read independently of the source system, the archive is not compliant. Consider exporting to an open, standard format (PDF/A, CSV) before decommission.

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

**Expected:** Decommissioning is controlled, documented, and approved — not just "turn it off."
**On failure:** If any checklist item cannot be completed, document the exception and obtain QA approval before proceeding.

## Validation

- [ ] Data retention requirements assessed for all data categories
- [ ] Data migration validated with record counts, sampling, and checksums (if applicable)
- [ ] Archive created in a format readable without the source system
- [ ] Archive integrity verified with checksums
- [ ] All user access revoked
- [ ] Validation documentation archived with defined retention period
- [ ] SOPs updated to remove references to decommissioned system
- [ ] Decommission report approved by system owner, QA, and IT

## Common Pitfalls

- **Premature decommission**: Turning off a system before data migration is validated risks permanent data loss. Complete all validation before pulling the plug.
- **Unreadable archives**: Storing data in a proprietary format that requires the original system to read defeats the purpose of archival. Use open formats.
- **Forgotten audit trails**: Archiving the data but not the audit trail means the data provenance cannot be demonstrated. Always archive audit trails with their parent records.
- **Orphaned SOPs**: SOPs that still reference a decommissioned system confuse users and create compliance gaps. Update or retire all affected SOPs.
- **No periodic archive verification**: Archives degrade. Without periodic integrity checks, data loss may go undetected until the data is needed for an inspection.

## Related Skills

- `design-compliance-architecture` — update the system inventory and compliance architecture after decommission
- `manage-change-control` — decommissioning is a major change requiring change control
- `write-validation-documentation` — migration validation follows the same IQ/OQ methodology
- `write-standard-operating-procedure` — retire or update SOPs referencing the decommissioned system
- `prepare-inspection-readiness` — archived data must remain accessible for regulatory inspections
