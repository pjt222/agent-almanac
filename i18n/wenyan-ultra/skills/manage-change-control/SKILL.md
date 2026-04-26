---
name: manage-change-control
locale: wenyan-ultra
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

# 管變控

評、批、施、驗確認計算系統之變而保確認態。

## 用

- 確認系統需軟件升、補、配變
- 基礎設施變（服遷、OS 升、網變）影確認系統
- CAPA 或審計識需系統改
- 業程變需系統重配
- 急變需加速批與回文

## 入

- **必**：變述（何變與何故）
- **必**：所影系統及當確認態
- **必**：變請者與業理
- **可**：供應商發行註或技文
- **可**：相關 CAPA 或審計識
- **可**：所影系統之現確認文

## 行

### 一：造並歸變請

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

得：變請有獨 ID、明述、有理之歸。
敗：歸有爭→默為 Standard 令 CCB 裁。

### 二：行影響評

評變對確認態諸維：

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

得：各維有明是否與理。
敗：影響不能定而需測→歸為「未知——需察」並令生前沙盒評。

### 三：定重確認範

按影響評定所需驗活動：

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

得：重確認範按變影成比——不多不少。
敗：範有爭→向多測偏。不足確認乃規險；過確認僅本。

### 四：獲批

按適批流路變：

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

得：諸所需批者於施前簽（急變除）。
敗：急變→由系統所有者與 QA 得口頭批，施變，並於 5 業日內畢正式記。

### 五：施並驗

執變並後驗：

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

得：施匹批計，諸驗活動過。
敗：驗敗→即執回滾並記敗為偏。無 QA 同意勿進。

## 驗

- [ ] 變請有獨 ID、述、歸
- [ ] 影響評覆諸維（軟、數據、基、SOP、訓）
- [ ] 重確認範定附理
- [ ] 諸所需批於施前得（急 5 日內）
- [ ] 前備份與回滾法記
- [ ] 後驗示變行且他無破
- [ ] 確認文更以反變
- [ ] 變記正式閉

## 忌

- **「小」變略影評**：即微變可有意外影。似無害之配切換可禁審計跡或變算
- **急變濫**：若 > 10% 為「急」→變程被繞。審緊急準
- **回滾計不全**：以回滾為「復備份」忽備至滾間生之數據。各回滾情定數據處
- **施後批**：回批（除記急外）為合規違。CCB 須於工始前批
- **缺回歸測**：僅驗變功不足。回歸測須證現確認功無受影

## 參

- `design-compliance-architecture` — 定變控委之治理框
- `write-validation-documentation` — 造變觸之重確認文
- `perform-csv-assessment` — 為需全重確認之大變行全 CSV 重評
- `write-standard-operating-procedure` — 更變影之 SOP
- `investigate-capa-root-cause` — 變由 CAPA 觸
