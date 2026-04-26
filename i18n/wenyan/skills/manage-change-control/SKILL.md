---
name: manage-change-control
locale: wenyan
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

評、准、施、驗已驗證計算系統之變，而保其已驗證之態。

## 用時

- 已驗證系統需升、補丁、或配置之變
- 基礎設施之變（伺服器遷、OS 升、網路變）影響已驗證系統
- CAPA 或審計之發現需系統之改
- 業務過程之變需系統重設
- 急變需速准與回溯記錄

## 入

- **必要**：變之述（何變而何故）
- **必要**：所影響之系統及其當前已驗證之態
- **必要**：變之請者與業務理由
- **可選**：供應商之釋出說明或技術文件
- **可選**：相關 CAPA 或審計發現之參
- **可選**：所影響系統既有之驗證文件

## 法

### 第一步：建變請並分類

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

**得：**變請具唯一 ID、清述、有理之分類。
**敗則：**若分類有爭，默為 Standard 並令 CCB 裁之。

### 第二步：行影響評估

於已驗證態諸維評變：

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

**得：**諸維皆有清之是否與理。
**敗則：**若影響不試不可定，標此維為「未知——需察」並於產線變前沙盒驗之。

### 第三步：定重驗證之範

依影響評估，定所需之驗證活動：

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

**得：**重驗證之範與變之影響相稱——不過不及。
**敗則：**若重驗證之範有爭，寧過試勿少試。不足驗證乃法規之險；過驗證唯耗資。

### 第四步：得准

導變歷宜之准流：

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

**得：**施前諸需准者皆已簽（急變除外）。
**敗則：**急變者，取系統主與 QA 之口頭准，施之，於五個工作日內完成正式記錄。

### 第五步：施並驗

行變並行後察驗：

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

**得：**施配所准之計，諸驗活動皆通。
**敗則：**若驗敗，即行回滾並記敗為偏。非 QA 同意，勿進。

## 驗

- [ ] 變請具唯一 ID、述、分類
- [ ] 影響評估覆諸維（軟體、數據、基礎設施、SOP、訓練）
- [ ] 重驗證之範與理已定
- [ ] 施前諸需准皆已得（急變於五日內）
- [ ] 施前備份與回滾規有記
- [ ] 後察驗示變奏效而餘未破
- [ ] 驗證文件已更以反變
- [ ] 變記正式閉

## 陷

- **「小」變略影響評估**：即微變亦或有未期之影響。看似無害之配置切換或失審計軌或改算
- **濫用急變**：若逾一成之變標為「急」，變規已被繞。審並緊急之準則
- **回滾計畫不全**：假回滾「即復備份」略備份與回滾間所造之數據。為每回滾情定數據之處
- **施後准**：追溯之准（記錄之急變除外）為合規之違。CCB 須於工啟前准
- **缺回歸試**：唯驗已變之功不足。回歸試須證既驗證之功不受影響

## 參

- `design-compliance-architecture` — 定含變更控制委員會之治理框
- `write-validation-documentation` — 建變所觸之重驗證文件
- `perform-csv-assessment` — 需全重驗證之大變之全 CSV 重評
- `write-standard-operating-procedure` — 更變所影響之 SOP
- `investigate-capa-root-cause` — 當變由 CAPA 所觸
