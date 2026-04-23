---
name: design-compliance-architecture
locale: wenyan-lite
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

立頂層合規框架，以映法規於系統，分關鍵性等級，並為受規環境定治理。

## 適用時機

- 新受規設施、部門或計劃之立
- 既有組織須於多系統間形式化其合規姿態
- 法規缺口分析顯系統分類或驗證策略之缺
- 合併、收購或重組需於實體間和諧合規
- 備參照計算機系統之場所主檔或品質手冊

## 輸入

- **必需**：範圍內計算機系統清單（名、用途、供應商/自定）
- **必需**：適用之法規框架（21 CFR Part 11、EU Annex 11、GMP、GLP、GCP、ICH Q7、ICH Q10）
- **必需**：組織情境（部門、場所、產品類型）
- **可選**：既有驗證主計劃或品質手冊
- **可選**：前稽核發現或法規檢查觀察
- **可選**：具品質與 IT 匯報線之組織圖

## 步驟

### 步驟一：建系統清單

建所有計算機系統之完整清單：

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

**預期：** 每一建、改、存、取或傳 GxP 相關資料之系統皆列之。
**失敗時：** 若系統擁有者無法提供完整資訊，載之缺口並排發現工作坊。缺失系統為關鍵合規風險。

### 步驟二：分系統關鍵性

為每系統分關鍵性等級：

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

**預期：** 每系統皆有等級指派，並載理由。
**失敗時：** 若系統之關鍵性有爭議，上報品質委員會。疑時，高分一級而後經正式風險評估再評之。

### 步驟三：指派 GAMP 5 軟體類別

為每 GxP-Critical 與 GxP-Supporting 系統指派 GAMP 5 類別：

```markdown
# GAMP 5 Category Assignment

| System ID | System | GAMP Category | Rationale | Validation Effort |
|-----------|--------|---------------|-----------|-------------------|
| SYS-001 | LabWare LIMS | 4 — Configured Product | COTS with extensive workflow configuration | Medium-High |
| SYS-002 | SAP ERP | 4 — Configured Product | COTS with custom transactions | Medium-High |
| SYS-003 | R/Shiny App | 5 — Custom Application | Internally developed | High — Full lifecycle |
| SYS-004 | Windows Server | 1 — Infrastructure | Operating system, no custom configuration | Low — Verify installation |
```

類別參考：
- **Category 1**：基礎架構（OS、韌體）——驗安裝
- **Category 3**：未配置之 COTS——驗其功能如是
- **Category 4**：已配置之產品——驗所有配置
- **Category 5**：自定應用——全生命週期驗證

**預期：** 類別指派合系統之使用方式，非僅其為何。
**失敗時：** 若系統跨類別（如 COTS 具自定附件），將自定部分分類為 Category 5，基礎分為 Category 4。

### 步驟四：映法規需求於系統

建法規需求可追溯矩陣：

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

**預期：** 每適用法規條款皆映至少一系統，每 GxP-Critical 系統皆映至相關法規條款。
**失敗時：** 未映之條款為合規缺口。為每缺口建具時程之補救計劃。

### 步驟五：為每系統定驗證策略

依關鍵性、類別與法規映射：

```markdown
# Validation Strategy Summary

| System | Category | Criticality | Validation Approach | Key Deliverables |
|--------|----------|------------|--------------------|--------------------|
| LabWare LIMS | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, PQ, TM, VSR |
| SAP ERP | 4 | Critical | Prospective CSV | URS, RA, VP, IQ, OQ, TM, VSR |
| R/Shiny App | 5 | Critical | Prospective CSV + code review | URS, RA, VP, IQ, OQ, PQ, TM, VSR, code audit |
| Windows Server | 1 | Supporting | Installation qualification | IQ checklist |
```

縮寫：URS（用戶需求）、RA（風險評估）、VP（驗證計劃）、IQ/OQ/PQ（安裝/操作/性能驗證）、TM（可追溯矩陣）、VSR（驗證摘要報告）。

**預期：** 驗證工作量與風險成比例——Category 5 GxP-Critical 系統得全生命週期；Category 1 基礎架構得簡化 IQ。
**失敗時：** 若相關人促縮減關鍵系統之驗證，載之風險接受並得 QA 簽字。

### 步驟六：設計治理結構

為維持合規定組織框架：

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

**預期：** 每一合規活動皆有明確之問責，無孤立之責任。
**失敗時：** 若角色重疊或未指派，召 RACI 工作坊以解之。所有權含糊為反覆現之法規引用。

### 步驟七：編寫合規架構文件

組所有組件入主文件：

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

**預期：** 作整受規環境合規藍圖之單一文件。
**失敗時：** 若文件超實用大小，建主文件並參每系統或領域之子文件。

## 驗證

- [ ] 系統清單含每一處理 GxP 資料之系統
- [ ] 每系統有載理由之關鍵性等級
- [ ] GAMP 5 類別指派於所有 GxP-Critical 與 GxP-Supporting 系統
- [ ] 法規需求可追溯矩陣涵所有適用條款
- [ ] 每 GxP-Critical 系統有明定之驗證策略
- [ ] 治理結構定角色、委員會與升級路徑
- [ ] 所有文件皆有唯一 ID 與版本控制
- [ ] 合規架構文件得品質與 IT 領導之批准

## 常見陷阱

- **清單不全**：缺失系統對合規不可見。用網路掃描、軟體資產管理工具、部門訪談——非僅問 IT。
- **二元思維**：系統非純「GxP」或「非 GxP」。三級模型（Critical、Supporting、Non-GxP）避過度與不足驗證。
- **類別混淆**：GAMP 5 類別述軟體之「為何」，然驗證工作量宜反映其「如何用」。用於批次放行之 Category 4 系統需較用於排程之 Category 4 系統更多之測。
- **架構靜止**：合規架構為活文件。新系統、法規變更與稽核發現皆需更新。
- **治理無牙**：紙上存而從不開會之委員會不供合規價值。定會議節奏與法定人數要求。

## 相關技能

- `perform-csv-assessment` — 對個別系統執行此處定之驗證策略
- `manage-change-control` — 實作治理中定之變更控制流程
- `implement-electronic-signatures` — 實作法規矩陣中映之電子簽名控制
- `prepare-inspection-readiness` — 以此架構為檢查準備之基礎
- `conduct-gxp-audit` — 以合規架構為基線稽核
