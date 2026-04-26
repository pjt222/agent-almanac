---
name: manage-change-control
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage change control for validated computerized systems. Covers change
  request triage (emergency, standard, minor), impact assessment on validated
  state, revalidation scope determination, approval workflows, implementation
  tracking, and post-change verification. Use when a validated system requires
  a software upgrade, patch, or configuration change; when infrastructure
  changes affect validated systems; when a CAPA requires system modification;
  or when emergency changes need expedited approval and retrospective
  documentation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, change-control, revalidation, impact-assessment, compliance
---

# 管變更控制

評、核、施、驗已驗證計算系統之變而保其已驗態。

## 適用時機

- 已驗證系統需軟體升級、補丁或配置變
- 基礎設施變（伺服器遷、OS 升、網路變）影響已驗證系統
- CAPA 或審計發現需系統改
- 業務程變需系統重配
- 緊急變需加速核與事後記錄

## 輸入

- **必要**：變描述（何變並何以）
- **必要**：所影響系統及其當前已驗態
- **必要**：變請求者與業務理由
- **選擇性**：廠商發行說明或技術文件
- **選擇性**：相關 CAPA 或審計發現參
- **選擇性**：所影響系統之既有驗證文件

## 步驟

### 步驟一：創並分類變更請求

```markdown
# Change Request
## Document ID: CR-[SYS]-[YYYY]-[NNN]

### 1. Change Description
**Requestor:** [Name, Department]
**Date:** [YYYY-MM-DD]
**System:** [System name and version]
**Current State:** [Current configuration/version]
**Proposed State:** [Target configuration/version]

### 2. Justification
[Business, regulatory, or technical reason for the change]

### 3. Classification
| Type | Definition | Approval Path | Timeline |
|------|-----------|--------------|----------|
| **Emergency** | Urgent fix for safety, data integrity, or regulatory compliance | System owner + QA (retrospective CCB) | Implement immediately, document within 5 days |
| **Standard** | Planned change with potential impact on validated state | CCB approval before implementation | Per CCB schedule |
| **Minor** | Low-risk change with no impact on validated state | System owner approval | Documented before implementation |

**This change is classified as:** [Emergency / Standard / Minor]
**Rationale:** [Why this classification]
```

**預期：** 變更請求有唯一 ID、明描述，與有理之分類。
**失敗時：** 若分類有爭，默為 Standard 而令 CCB 裁決。

### 步驟二：行影響評估

於已驗態之所有維評變：

```markdown
# Impact Assessment
## Change Request: CR-[SYS]-[YYYY]-[NNN]

### Impact Matrix
| Dimension | Affected? | Details | Risk |
|-----------|-----------|---------|------|
| Software configuration | Yes/No | [Specific parameters changing] | [H/M/L] |
| Source code | Yes/No | [Modules, functions, or scripts affected] | [H/M/L] |
| Database schema | Yes/No | [Tables, fields, constraints changing] | [H/M/L] |
| Infrastructure | Yes/No | [Servers, network, storage affected] | [H/M/L] |
| Interfaces | Yes/No | [Upstream/downstream system connections] | [H/M/L] |
| User access/roles | Yes/No | [Role changes, new access requirements] | [H/M/L] |
| SOPs/work instructions | Yes/No | [Procedures requiring update] | [H/M/L] |
| Training | Yes/No | [Users requiring retraining] | [H/M/L] |
| Data migration | Yes/No | [Data transformation or migration needed] | [H/M/L] |
| Audit trail | Yes/No | [Impact on audit trail continuity] | [H/M/L] |

### Regulatory Impact
- [ ] Change affects 21 CFR Part 11 controls
- [ ] Change affects EU Annex 11 controls
- [ ] Change affects data integrity (ALCOA+)
- [ ] Change requires regulatory notification
```

**預期：** 每維已評附明是/否與理由。
**失敗時：** 若影響不能於無測而定，將該維分為「未知——需調查」並令生產變前行沙箱評。

### 步驟三：定重驗範圍

依影響評估定何驗證活動所需：

```markdown
# Revalidation Determination

| Revalidation Level | Criteria | Activities Required |
|--------------------|----------|-------------------|
| **Full revalidation** | Core functionality changed, new GAMP category, or major version upgrade | URS review, RA update, IQ, OQ, PQ, TM update, VSR |
| **Partial revalidation** | Specific functions affected, configuration changes | Targeted OQ for affected functions, TM update |
| **Documentation only** | No functional impact, administrative changes | Update validation documents, change log entry |
| **None** | No impact on validated state (e.g., cosmetic change) | Change log entry only |

### Determination for CR-[SYS]-[YYYY]-[NNN]
**Revalidation level:** [Full / Partial / Documentation only / None]
**Rationale:** [Specific reasoning based on impact assessment]

### Required Activities
| Activity | Owner | Deadline |
|----------|-------|----------|
| [e.g., Execute OQ test cases TC-OQ-015 through TC-OQ-022] | [Name] | [Date] |
| [e.g., Update traceability matrix for URS-007] | [Name] | [Date] |
| [e.g., Update SOP-LIMS-003 section 4.2] | [Name] | [Date] |
```

**預期：** 重驗範圍與變之影響相稱——不過，不及。
**失敗時：** 若重驗範圍有爭，偏向更多測試。驗不足為法規險；驗過度僅資源本。

### 步驟四：獲批

循適核工作流送變：

```markdown
# Change Approval

### Approval for: CR-[SYS]-[YYYY]-[NNN]

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| System Owner | | Approve / Reject / Defer | | |
| QA Representative | | Approve / Reject / Defer | | |
| IT Representative | | Approve / Reject / Defer | | |
| Validation Lead | | Approve / Reject / Defer | | |

### Conditions (if any)
[Any conditions attached to the approval]

### Planned Implementation Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Rollback deadline:** [Point of no return]
```

**預期：** 施始前所有所需核者已簽（除緊急變）。
**失敗時：** 緊急變者，自系統擁有者與 QA 獲口頭核，施變，並於 5 個工作日內成正式記錄。

### 步驟五：施並驗

執變並行變後驗：

```markdown
# Implementation Record

### Pre-Implementation
- [ ] Backup of current system state completed
- [ ] Rollback procedure documented and tested
- [ ] Affected users notified
- [ ] Test environment validated (if applicable)

### Implementation
- **Implemented by:** [Name]
- **Date/Time:** [YYYY-MM-DD HH:MM]
- **Steps performed:** [Detailed implementation steps]
- **Deviations from plan:** [None / Description]

### Post-Change Verification
| Verification | Result | Evidence |
|--------------|--------|----------|
| System accessible and functional | Pass/Fail | [Screenshot/log reference] |
| Changed functionality works as specified | Pass/Fail | [Test case reference] |
| Unchanged functionality unaffected (regression) | Pass/Fail | [Test case reference] |
| Audit trail continuity maintained | Pass/Fail | [Audit trail screenshot] |
| User access controls intact | Pass/Fail | [Access review reference] |

### Closure
- [ ] All verification activities completed successfully
- [ ] Validation documents updated per revalidation determination
- [ ] SOPs updated and effective
- [ ] Training completed for affected users
- [ ] Change record closed in change control system
```

**預期：** 施匹核之計劃，所有驗活動過。
**失敗時：** 若驗敗，立執回滾程序並記敗為偏差。無 QA 同意勿行。

## 驗證

- [ ] 變更請求有唯一 ID、描述與分類
- [ ] 影響評估涵所有維（軟體、數據、基礎設施、SOP、訓練）
- [ ] 重驗範圍已附理由定
- [ ] 所有所需核於施前已獲（或緊急者於 5 日內）
- [ ] 施前備份與回滾程序已記錄
- [ ] 變後驗證變行而他未破
- [ ] 驗證文件已反映變
- [ ] 變更記錄正式閉

## 常見陷阱

- **為「小」變略影響評估**：即小變可有意外影響。似無害之配置切換可禁審計軌跡或變計算
- **緊急變濫**：若 >10% 變分為「緊急」，變程被繞。審並緊緊急標
- **回滾計劃不全**：假回滾乃「僅復備份」忽備份與回滾間所創數據。為每回滾境定數據處置
- **施後核**：追溯核（除已記緊急外）為合規違。CCB 必於工作始前核
- **缺回歸測**：僅驗已變功能不足。回歸測必確既驗功能仍不受影響

## 相關技能

- `design-compliance-architecture` — 定含變更控制委員會之治框
- `write-validation-documentation` — 創由變觸發之重驗證文件
- `perform-csv-assessment` — 為需全重驗之主要變之全 CSV 再評
- `write-standard-operating-procedure` — 更受變影響之 SOP
- `investigate-capa-root-cause` — 當變因 CAPA 觸發
