---
name: decommission-validated-system
locale: wenyan-ultra
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

# 退驗系

謀行驗計系壽終之控退、保數完整、合規留需。

## 用

- 驗系為新系換
- 系至壽終無換（業程去）
- 商止驗品支持
- 合多系於單台
- 規或業變致系過時

## 入

- **必**：退系（名、版、驗態）
- **必**：規留需（21 CFR Part 11、GLP、GCP）
- **必**：換系（若適）與遷範
- **可**：現驗備包
- **可**：數量與式錄
- **可**：業主與相關人列

## 行

### 一：評數留需

定數當留幾久與何式：

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

**得：** 各數類含定留期、式需、計處。
**敗：** 留需不明→諮規事與法。默用最長適留期。

### 二：謀數遷（若適）

數遷至換系時：

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

**得：** 遷謀含映、化規、證數完保之驗察。
**敗：** 遷驗敗→勿進退。修遷問而重驗。

### 三：定檔策

為檔而非遷之數：

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

**得：** 檔數無源系可讀、搜、驗。
**敗：** 數不可獨源系讀→檔不合規。考退前出至開標式（PDF/A、CSV）。

### 四：行退

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

**得：** 退控、備、承——非僅「關之」。
**敗：** 清項不能畢→記例且得 QA 承方進。

## 驗

- [ ] 諸數類留需評
- [ ] 數遷以錄計、採樣、校驗碼驗（若適）
- [ ] 檔建於無源系可讀之式
- [ ] 檔完整以校驗碼驗
- [ ] 諸用訪撤
- [ ] 驗備含定留期檔
- [ ] SOP 更除退系引
- [ ] 退報系主、QA、IT 承

## 忌

- **早退**：遷驗前關系險永數損。驗畢方拔
- **不可讀檔**：數存於需源系讀之專式敗檔目。用開式
- **忘審跡**：檔數而非審跡→數源不可示。恆與父錄一檔審跡
- **孤 SOP**：仍引退系之 SOP 惑用生規隙。更或退諸影 SOP
- **無周檔驗**：檔退化。無周完察→數損或查時方發現

## 參

- `design-compliance-architecture` — 退後更系錄與規架
- `manage-change-control` — 退為大變需變控
- `write-validation-documentation` — 遷驗循同 IQ/OQ 法
- `write-standard-operating-procedure` — 退或更引退系之 SOP
- `prepare-inspection-readiness` — 檔數須仍為規查可訪
