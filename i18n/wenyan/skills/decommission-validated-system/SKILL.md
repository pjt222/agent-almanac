---
name: decommission-validated-system
locale: wenyan
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

# 退驗之系

劃而執受驗電腦系之控退，守數整與規留。

## 用時

- 受驗系將由新系替
- 系至終無替（業流去）
- 供商停支已驗之品
- 多系合為一台
- 規或業變致系陳

## 入

- **必要**：欲退之系（名、版、驗狀）
- **必要**：規之留需（21 CFR Part 11、GLP、GCP）
- **必要**：替系（若有）與遷範
- **可選**：當驗文集
- **可選**：數量與式清單
- **可選**：業主與相關者列

## 法

### 第一步：察數留需

定數留幾時與式：

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

**得：** 每數類有定留期、式需、劃處。
**敗則：** 若留需不明，諮規與法。默最長施留期。

### 第二步：劃數遷（若用）

若數遷至替系：

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

**得：** 遷劃含映、轉則、驗察，證數整已守。
**敗則：** 若遷驗敗，勿進退。修遷問再驗。

### 第三步：定存策

為將存而非遷之數：

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

**得：** 存數可讀、可搜、可驗無源系。
**敗則：** 若數不能離源系而讀，存不合規。考出為開放標式（PDF/A、CSV）於退前。

### 第四步：執退役

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

**得：** 退控、文、准——非唯「關之」。
**敗則：** 若清單項不能畢，文例外獲 QA 准再進。

## 驗

- [ ] 諸數類留需已察
- [ ] 數遷以記計、抽、校驗已驗（若用）
- [ ] 存以無源系可讀之式建
- [ ] 存以校驗證整
- [ ] 諸用戶訪已撤
- [ ] 驗文以定留期存
- [ ] SOP 已更以去對退系之引
- [ ] 退報已由系主、QA、IT 准

## 陷

- **早退**：遷驗前關系險永失數。畢諸驗前勿拔。
- **不可讀存**：存為專式需源系讀違存之志。用開放式。
- **忘審跡**：存數而不存審跡則源不可證。皆與父記共存審跡。
- **孤 SOP**：仍引已退系之 SOP 惑用者而生合規缺。更或退諸影響 SOP。
- **無周期存驗**：存劣。無周期整察，數失或至需驗時乃知。

## 參

- `design-compliance-architecture` — 退後更系清單與合規構
- `manage-change-control` — 退為大變需變控
- `write-validation-documentation` — 遷驗循同 IQ/OQ 法
- `write-standard-operating-procedure` — 退或更引退系之 SOP
- `prepare-inspection-readiness` — 存數須留可為規查
