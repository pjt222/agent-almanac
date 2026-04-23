---
name: decommission-validated-system
locale: wenyan-lite
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

# 驗證系統退役

計畫並執一已驗證之電腦化系統於生命末之控制退役，保資料完整性並合法規保留要求。

## 適用時機

- 已驗證系統為新系統所替
- 系統達生命末而無替代（業務程序除）
- 供應商停對已驗證產品之支援
- 多系統併入單一平台
- 法規或業務改令系統過時

## 輸入

- **必要**：待退役之系統（名、版、驗證狀態）
- **必要**：按法規（21 CFR Part 11、GLP、GCP）之資料保留要求
- **必要**：替代系統（若適用）與遷移範圍
- **選擇性**：當前驗證文件包
- **選擇性**：資料量與格式清單
- **選擇性**：業務擁有者與相關者清單

## 步驟

### 步驟一：評資料保留要求

定資料須保留多久及以何形式：

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

**預期：** 各資料類皆有定之保留期、格式要求、計畫處置。
**失敗時：** 若保留要求不清，諮法規事務與法務。預設為最長適用保留期。

### 步驟二：計畫資料遷移（若適用）

若資料遷至替代系統：

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

**預期：** 遷移計畫含映射、轉換規則、證資料完整性已保之驗證檢查。
**失敗時：** 若遷移驗證敗，勿進至退役。修遷移問題並重驗。

### 步驟三：定歸檔策略

將歸檔而非遷移之資料：

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

**預期：** 歸檔資料可讀、可搜、可驗而無需原始系統。
**失敗時：** 若資料不能獨於源系統讀，歸檔不合規。退役前考慮匯出為開放、標準格式（PDF/A、CSV）。

### 步驟四：執退役

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

**預期：** 退役為控制、有錄、已核——非單「關之」。
**失敗時：** 若任何清單項不能完，記例外並得 QA 核方續。

## 驗證

- [ ] 所有資料類皆已評保留要求
- [ ] 資料遷移以記錄計數、取樣、校驗和驗證（若適用）
- [ ] 歸檔造於無需源系統可讀之格式
- [ ] 歸檔完整性以校驗和驗
- [ ] 所有用戶存取已撤
- [ ] 驗證文件已歸檔，含定之保留期
- [ ] SOP 已更以除對退役系統之引
- [ ] 退役報告為系統擁有者、QA、IT 所核

## 常見陷阱

- **早退役**：資料遷移驗證前關系統險永資料失。拔插前完所有驗證
- **不可讀之歸檔**：存於需原系統方讀之專屬格式違歸檔之意。用開放格式
- **忘之審計軌**：歸檔資料而非審計軌令資料溯源不能示。恒與父記錄歸檔審計軌
- **孤立之 SOP**：仍引退役系統之 SOP 令用戶惑並生合規缺。更或退所有受影響之 SOP
- **無週期性歸檔驗證**：歸檔降。無週期性完整性察，資料失或不察直至檢查需資料

## 相關技能

- `design-compliance-architecture` —— 退役後更系統清單與合規架構
- `manage-change-control` —— 退役為需變更控制之大改
- `write-validation-documentation` —— 遷移驗證循同 IQ/OQ 方法論
- `write-standard-operating-procedure` —— 退或更引退役系統之 SOP
- `prepare-inspection-readiness` —— 歸檔資料須續可為法規檢查所用
