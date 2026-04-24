---
name: draft-project-charter
locale: wenyan-lite
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

# 起草項目章程

建結構化之項目章程，於詳盡籌劃前立項目之界、相關方之約、成功之準。此文件含範圍、RACI、里程碑、初始風險登錄，宜於敏捷、經典、混合方法論皆可用。

## 適用時機

- 啟動新項目或倡議
- 於非正式啟動後正式化範圍
- 於詳盡籌劃前使相關方一致
- 為執行期之範圍決策立參考文件
- 由發現/構思轉至活躍項目工作

## 輸入

- **必要**：項目名與簡述
- **必要**：主要相關方或贊助者
- **選擇**：既有文檔（提案、簡報、郵件）
- **選擇**：已知約束（預算、截止日、團隊規模）
- **選擇**：方法論偏好（敏捷、經典、混合）

## 步驟

### 步驟一：收集項目背景並建章程範本

讀任何既有文檔（提案、郵件、簡報）以解項目背景。辨項目所應之核心問題或機會。建章程檔案，用結構範本，後續步驟填之。

建名為 `PROJECT-CHARTER-[PROJECT-NAME].md` 之檔，用此範本：

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

填文檔 ID，依格 PC-[PROJECT]-[YYYY]-[NNN]（如 PC-WEBSITE-2026-001）。寫問題陳述（2-3 句），述現狀、缺口、影響。寫項目宗旨（1 段），說明所將達者。

**預期：** 章程檔已建，含文檔 ID、問題陳述、宗旨。問題陳述具體，描述可量之缺口。

**失敗時：** 項目背景不清時，於章程頂之 QUESTIONS 節錄具體問題以問贊助者。既有文檔有衝突時，於 OPEN ISSUES 節錄矛盾並標記請相關方解之。

### 步驟二：定範圍界

明列項目範圍內外之事。寫 3-5 項範圍內之交付物，並附具體驗收標準。寫 3-5 項範圍外之事以防範圍蔓延。填交付物表，含每項及其驗收標準與目標日期。

**預期：** 範圍節有均衡之內外範圍列。交付物表含 3-5 條，具具體、可測之驗收標準。目標日期務實且邏輯順序。

**失敗時：** 交付物模糊時，分為子交付物並附具體輸出。驗收標準闕時，問：「如何證此交付物已成？」目標日期闕時，標為 TBD 並留待里程碑規劃會議。

### 步驟三：辨相關方並配 RACI

列所有因項目受影響、貢獻、或有決策權之個人或團體。含其組織角色。建 RACI 矩陣，映每相關方於每交付物：
- **R**（Responsible）：行之工者
- **A**（Accountable）：最終決策權（每交付物唯一 A）
- **C**（Consulted）：決策前供意見者
- **I**（Informed）：進度之知會者

確保每交付物恰有一 A、至少一 R。

**預期：** 相關方表列 5-10 人及其角色。RACI 矩陣每交付物欄有一 A。無交付物缺 R 或有多 A。贊助者為最終核准之 A。

**失敗時：** 相關方列不全時，對照組織圖與發現期會議出席者。見多 A 時，升之於贊助者以澄清決策權。無 R 時，標交付物為待配且須資源分配。

### 步驟四：定成功標準與里程碑

寫 3-5 項可量之成功標準，用 SMART 格式（Specific、Measurable、Achievable、Relevant、Time-bound）。每標準繫於可量之度量與目標值。定 4-6 項關鍵里程碑，表項目大階段或交付物完成，附目標日期與對先前里程碑之依賴。

**預期：** 成功標準表有 3-5 條，度量具體（如「系統可用性」以「可用百分比」測之，目標「99.5%」）。里程碑表示邏輯項目階段與務實目標日期。依賴已明記。

**失敗時：** 成功標準模糊（如「改質量」）時，改寫為具基線與目標值之可量結果。里程碑日期不務實時，由最終截止日倒推，用估時長與緩衝。依賴成循環邏輯時，重結里程碑序或分衝突之里程碑。

### 步驟五：建初始風險登錄

辨 5-10 項可能影響項目成功之風險。每風險評可能性（低/中/高）與影響（低/中/高），後算嚴重度。為每風險定具體緩解策略，配風險負責者以監測與應對。至少每類皆含一項：範圍、進度、資源、技術、外部。

**預期：** 風險登錄含 5-10 條，涵蓋範圍、進度、資源、技術、外部風險。每風險已評可能性、影響、嚴重度。緩解策略具體可行。每風險有所配負責者。

**失敗時：** 風險列不全時，審範圍界、依賴、相關方列、假設以尋潛在之失敗點。緩解策略通用（「密切監測」）時，指定：監測何？多頻？何觸發行動？無人接受風險之責時，暫配予項目主管並升之贊助者。

## 驗證

- [ ] 章程檔已建並有文檔 ID
- [ ] 問題陳述具體且可量
- [ ] 範圍含範圍內外之事
- [ ] RACI 矩陣涵蓋所有交付物
- [ ] 成功標準可量（SMART）
- [ ] 至少 5 項風險已辨並附緩解策略
- [ ] 里程碑有目標日期
- [ ] 含核准節

## 常見陷阱

- **範圍無界**：列範圍內而無明範圍外者致範圍蔓延。恆明不為何。
- **成功標準模糊**：「改性能」不可量。每標準繫於具基線與目標之數。
- **遺漏相關方**：漏之相關方後出致項目脫軌。對照組織圖與先前項目通信。
- **風險登錄為勾選**：列風險而無可行緩解計，徒生假信。每風險需具體應對策略。
- **章程過詳**：章程為羅盤，非地圖。保於 2-4 頁。詳盡籌劃在後。

## 相關技能

- `create-work-breakdown-structure` — 將章程交付物分解為工作包
- `manage-backlog` — 將章程範圍轉為優先化之待辦
- `plan-sprint` — 由章程交付物規劃首個衝刺
- `generate-status-report` — 對章程里程碑報告進度
- `conduct-retrospective` — 執行後審章程假設
