---
name: draft-project-charter
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Draft a project charter that defines scope, stakeholders, success criteria,
  and initial risk register. Covers problem statement, RACI matrix, milestone
  planning, and scope boundaries for both agile and classic methodologies.
  Use when kicking off a new project or initiative, formalizing scope after
  an informal start, aligning stakeholders before detailed planning begins,
  or transitioning from discovery to active project work.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, charter, scope, stakeholders, raci, risk-register
---

# 項目章程之草

立結構化項目章程，定項目界限、相關者之約、成功之準於詳謀前。生涵範、RACI 委、里程碑、初始風險冊之全文，合敏捷、傳統或混合之法。

## 用時

- 啟新項目或倡議
- 非正式始後正化範
- 詳謀前對齊相關者
- 為執中範之決立參文
- 由探索／構想轉實際項目工

## 入

- **必要**：項目名與簡述
- **必要**：主要相關者或發起人
- **可選**：既有文檔（提案、簡報、郵件）
- **可選**：已知之限（預算、期限、隊人數）
- **可選**：方法之偏好（敏捷、傳統、混合）

## 法

### 第一步：聚項目上下文並立章程範本

讀諸既有文檔（提案、郵件、簡報）以解項目背景。識項目所解之核心問題或機。立章程文件，以待諸步填之。

立文件名為 `PROJECT-CHARTER-[PROJECT-NAME].md`，用此範本：

```markdown
# Project Charter: [Project Name]
## Document ID: PC-[PROJECT]-[YYYY]-[NNN]

### 1. Problem Statement
[2-3 sentences describing the problem or opportunity this project addresses]

### 2. Project Purpose
[What the project will achieve and why it matters]

### 3. Scope
#### In Scope
- [Deliverable 1]
- [Deliverable 2]

#### Out of Scope
- [Exclusion 1]
- [Exclusion 2]

### 4. Deliverables
| # | Deliverable | Acceptance Criteria | Target Date |
|---|------------|---------------------|-------------|
| 1 | | | |

### 5. Stakeholders & RACI
| Stakeholder | Role | D1 | D2 | D3 |
|-------------|------|----|----|-----|
| | | | | |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

### 6. Success Criteria
| # | Criterion | Measure | Target |
|---|-----------|---------|--------|
| 1 | | | |

### 7. Milestones
| Milestone | Target Date | Dependencies |
|-----------|-------------|--------------|
| | | |

### 8. Risk Register
| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|----|------|------------|--------|----------|------------|-------|
| R1 | | | | | | |

*Likelihood/Impact: Low, Medium, High*
*Severity = Likelihood × Impact*

### 9. Assumptions and Constraints
#### Assumptions
- [Key assumption 1]

#### Constraints
- [Key constraint 1]

### 10. Approval
| Role | Name | Date |
|------|------|------|
| Sponsor | | |
| Project Lead | | |
```

文件 ID 依格式 PC-[PROJECT]-[YYYY]-[NNN]（如 PC-WEBSITE-2026-001）填之。書問題陳述（2-3 句）述當狀、缺口、影響。書項目之意（一段）明將達何事。

**得：** 章程文件已立，文件 ID、問題陳述、意已填。問題陳述具體，述可量之缺口。

**敗則：** 項目上下文不明則書具體問題於章程首之 QUESTIONS 節以問發起人。既有文檔相衝則書矛盾於 OPEN ISSUES 節以標請相關者決。

### 第二步：定範之界

明書範內與範外。書 3-5 範內交付物，各附具體驗收準。書 3-5 範外項以防範蔓。填交付物表，附各驗收準與目標日。

**得：** 範節有衡之範內與範外表。交付物表含 3-5 項，準具體可測。目標日合理且序邏輯。

**敗則：** 交付物模糊則各拆為子交付物附具體出。驗收準缺則問：「如何證此交付物已畢？」目標日不可得則標 TBD 以待里程碑規劃會。

### 第三步：識相關者並分配 RACI

列諸受項目影響、貢獻或有決定權之個人或團體。附其組織之職。立 RACI 矩陣，映諸相關者於諸交付物：
- **R**（Responsible，責）：行工者
- **A**（Accountable，當）：終決權（每交付物唯一 A）
- **C**（Consulted，諮）：決前供意見者
- **I**（Informed，告）：進展告之者

每交付物須恰一 A 且至少一 R。

**得：** 相關者表列 5-10 人及其職。RACI 矩陣每交付物列有一 A。無交付物缺 R 或有多 A。發起人為終批之 A。

**敗則：** 相關者清單不全則交叉察組織圖與探索期會議與會者。多 A 識則升至發起人以明決定權。無 R 則標交付物未分配，須資源配置。

### 第四步：定成功之準與里程碑

以 SMART 格（具體、可量、可達、相關、定時）書 3-5 可量成功之準。每準繫於可量之度與目標值。定 4-6 關鍵里程碑，表主要項目階段或交付完成，附目標日與對前之依賴。

**得：** 成功之準表含 3-5 項具體度（如「系統可用」測為「%可用度」，目標「99.5%」）。里程碑表示邏輯項目階段與合理目標日。依賴已明。

**敗則：** 成功之準模糊（如「改質量」）則重書為帶基準與目標之可量結果。里程碑日不實則由終期逆算估期與緩衝。依賴致循環則重構里程碑序或拆衝突里程碑。

### 第五步：立初始風險冊

識 5-10 可影項目成功之風險。每風險評可能（低／中／高）與影響（低／中／高），算嚴重度。每風險定具體緩解策略並配風險之主以察與應。至少含一風險於每類：範、期、資源、技術、外部。

**得：** 風險冊含 5-10 項，覆範、期、資源、技術、外部。每風險評可能、影響、嚴重度。緩解策略可行且具體。每風險有分配之主。

**敗則：** 風險清單不全則察範界、依賴、相關者清單、假設以尋潛在失敗點。緩解策略泛（「密切察之」）則明：何察？幾頻？何觸動？無人受風險之主則臨時配項目主並升至發起人。

## 驗

- [ ] 章程文件已立且含文件 ID
- [ ] 問題陳述具體且可量
- [ ] 範含範內與範外項
- [ ] RACI 矩陣覆諸交付物
- [ ] 成功之準可量（SMART）
- [ ] 至少 5 風險已識附緩解策略
- [ ] 里程碑有目標日
- [ ] 批准節已含

## 陷

- **範無界**：僅列範內而無範外致範蔓。恆定不為者
- **模糊成功之準**：「改性能」不可量。每準繫於基準與目標之數
- **遺漏相關者**：漏之相關者後現而害項目。交叉察組織圖與前期溝通
- **風險冊為勾**：列風險而無可行緩解計供偽信。每風險須具體應對
- **章程過詳**：章程為指南針非地圖。保於 2-4 頁。詳謀於後

## 參

- `create-work-breakdown-structure` — 將章程交付物拆為工作包
- `manage-backlog` — 將章程範轉為優先積壓
- `plan-sprint` — 由章程交付物謀首衝刺
- `generate-status-report` — 對章程里程碑報進展
- `conduct-retrospective` — 執後回顧章程之假設
