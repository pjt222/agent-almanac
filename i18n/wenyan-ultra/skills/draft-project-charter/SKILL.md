---
name: draft-project-charter
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# 項目章程

立範圍、相關者、成敗、風險。

## 用

- 啟新項→用
- 非正式起→正名→用
- 詳劃前→齊眾→用
- 執行中→定範→用
- 探索畢→實作→用

## 入

- **必**：項名+簡述
- **必**：主要相關者/發起人
- **可**：舊文（提案、簡報、郵件）
- **可**：已知約束（預算、期限、人數）
- **可**：方法（agile/classic/hybrid）

## 法

### 一：聚脈絡，立模

讀舊文。識核心問題。建章程文件。

建 `PROJECT-CHARTER-[PROJECT-NAME].md`：

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

填 ID：PC-[PROJECT]-[YYYY]-[NNN]。問題陳述 2-3 句：現況、缺口、影響。目的 1 段。

**得：** 文件成，ID、問題、目的齊。問題具體可量。

**敗：** 脈絡不明→於頭置 QUESTIONS 段錄問。文件矛盾→記 OPEN ISSUES。

### 二：定範圍

列入範與出範。入範交付物 3-5，各具驗收標準。出範 3-5 防蔓延。填交付表。

**得：** 入出平衡。表 3-5 項，標準可驗。日期合理有序。

**敗：** 模糊→拆子項。標準缺→問「何以證畢？」。日期無→標 TBD。

### 三：識相關者，派 RACI

列受影響、貢獻、決策者。含組織角色。建 RACI 矩陣：
- **R**（Responsible）：做事
- **A**（Accountable）：終決（一交付物僅一 A）
- **C**（Consulted）：決前諮詢
- **I**（Informed）：知情

每交付物：恰一 A，至少一 R。

**得：** 表列 5-10 人。各列一 A。無缺 R、無多 A。發起人為終批之 A。

**敗：** 名單缺→對組織圖+探索期會議。多 A→上報發起人。無 R→標未派，須資源。

### 四：定成敗與里程碑

3-5 SMART 標準：具體、可量、可達、相關、有期。各繫量值+目標。4-6 里程碑，有日期+依賴。

**得：** 表 3-5 項，量具體（如「系統在線」量為「%可用」目標「99.5%」）。里程碑合理有序，依賴明。

**敗：** 模糊（「提升質」）→重寫可量。日期不實→由終期反推+緩衝。循環依賴→重序或拆分。

### 五：建風險登記

5-10 風險。各評可能（低/中/高）+影響（低/中/高）→嚴重度。定具體緩解+派所有者。至少各一：範圍、進度、資源、技術、外部。

**得：** 5-10 項涵五類。各具可能、影響、嚴重度。緩解可行具體。各有主。

**敗：** 缺→察範圍、依賴、相關者、假設尋失敗點。緩解泛（「密切監控」）→問「何→監？幾何時→監？何觸發？」。無人認領→暫派項目主，上報發起人。

## 驗

- [ ] 章程文件建，具 ID
- [ ] 問題具體可量
- [ ] 範圍含入與出
- [ ] RACI 覆所有交付物
- [ ] 成敗可量（SMART）
- [ ] 至少 5 風險+緩解
- [ ] 里程碑有日期
- [ ] 含批准段

## 忌

- **範圍無界**：只列入→蔓延。必定不為者。
- **成敗模糊**：「提升性能」不可量。每標繫數+基線+目標。
- **漏相關者**：晚現→翻局。查組織圖+舊通訊。
- **風險作打勾**：無緩解計→假信心。每險需具體應對。
- **章程過詳**：章程為羅盤非地圖。限 2-4 頁。詳劃後辦。

## 參

- `create-work-breakdown-structure`
- `manage-backlog`
- `plan-sprint`
- `generate-status-report`
- `conduct-retrospective`
