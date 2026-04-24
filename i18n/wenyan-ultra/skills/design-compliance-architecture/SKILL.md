---
name: design-compliance-architecture
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

# 設合規之架

立頂層合規之綱：規→系→判危→定治。

## 用

- 新設受管之場、部、程
- 舊構欲正多系之合規
- 規差析顯分類或驗策之缺
- 併、購、重組→諸體合規宜齊
- 備場主檔或質手，涉電算系

## 入

- **必**：在域電算系清單（名、用、商／自製）
- **必**：適用之規範（21 CFR Part 11、EU Annex 11、GMP、GLP、GCP、ICH Q7、ICH Q10）
- **必**：組織脈絡（部、場、品類）
- **可**：舊驗主計或質手
- **可**：昔審所見或監察之觀
- **可**：組織圖（質、IT 層級）

## 行

### 一：建系錄

盡錄諸電算系：

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

得：凡生、改、存、取、傳 GxP 數之系，皆列。

敗：主不能全知→錄缺、約發掘會。缺系為合規大患。

### 二：判系之危

各系判一級：

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

得：各系有級+書其由。

敗：級有爭→上質會。疑則上一級，俟正式危析再議。

### 三：授 GAMP 5 類

凡 GxP-Critical 及 GxP-Supporting 系，授 GAMP 5 類：

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

類參：
- **Category 1**：基礎（OS、韌）→驗裝
- **Category 3**：未設 COTS→驗功如原
- **Category 4**：已設之品→驗諸設
- **Category 5**：自製應用→全程驗

得：類之授合其用法，非僅其為何物。

敗：系跨類（如 COTS 加自製）→自製部為 5，底為 4。

### 四：規求映系

立規求追溯矩陣：

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

得：諸適用條皆映至少一系；諸 GxP-Critical 系皆映相關條。

敗：未映條即合規之缺→作修補計，各有時限。

### 五：各系定驗策

依危、類、規映：

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

略：URS（用者需）、RA（危析）、VP（驗計）、IQ/OQ/PQ（裝／運／效 資格）、TM（追溯矩）、VSR（驗總報）。

得：驗功與危稱→5 類 GxP-Critical 盡全程；1 類基礎簡化 IQ。

敗：眾欲減關鍵系之驗→書危受+QA 籤。

### 六：設治構

定可持合規之組織：

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

得：諸合規事皆有明責，無孤任。

敗：職有疊或空→召 RACI 會以解。含糊之權為常受監察之斥。

### 七：合編合規架文

諸部合於主檔：

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

得：一檔為全受管域合規之藍。

敗：檔過大→作主檔引子檔（各系或各域）。

## 驗

- [ ] 系錄含諸處 GxP 數之系
- [ ] 各系皆有級+書由
- [ ] GAMP 5 類授諸 GxP-Critical 及 GxP-Supporting 系
- [ ] 規求追溯矩覆諸適用條
- [ ] 諸 GxP-Critical 系皆有驗策
- [ ] 治構定職、會、升路
- [ ] 諸檔有獨 ID 及版控
- [ ] 合規架檔經質、IT 首領批

## 忌

- **錄不全**：缺系為合規之盲→網掃、資產具、部訪，勿只問 IT
- **二分思**：系非「GxP」或「非 GxP」→三級（Critical／Supporting／Non-GxP）避過驗與失驗
- **類之惑**：GAMP 5 類述軟為何物，驗功宜依其用→批放之 4 類勝排程之 4 類
- **靜態架**：合規架乃活檔→新系、規變、審現皆宜更
- **治無齒**：紙上會而未聚→無合規之功→定會期、齊員額

## 參

- `perform-csv-assessment`
- `manage-change-control`
- `implement-electronic-signatures`
- `prepare-inspection-readiness`
- `conduct-gxp-audit`
