---
name: manage-backlog
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create and maintain a product or project backlog with prioritized items,
  acceptance criteria, and estimates. Covers user story writing, MoSCoW
  prioritization, backlog grooming, item splitting, and status tracking.
  Use when starting a new project and converting scope into actionable items,
  during ongoing grooming before sprint planning, re-prioritizing after
  stakeholder feedback or scope changes, or splitting oversized items into
  implementable pieces.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
---

# 管產品待辦

創、排並維待辦，為所需工作之單一真源，適敏捷與古典項目法。

## 適用時機

- 始新項目並化範圍為可行項
- 衝刺規劃前之持續理
- 利害反饋或範圍變後重排
- 分過大項為可行片
- 審並歸檔已成或已取消項

## 輸入

- **必要**：項目範圍（自章程、WBS 或利害輸入）
- **選擇性**：既有待辦文件（BACKLOG.md）供更
- **選擇性**：排序框架偏好（MoSCoW、價值/努力、WSJF）
- **選擇性**：估計尺（故事點、T 恤號、人日）
- **選擇性**：需更新待辦之衝刺或疊代反饋

## 步驟

### 步驟一:創或載待辦結構

若無待辦存，以標準列創 BACKLOG.md。若有，讀並驗結構。

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

**預期：** BACKLOG.md 存附有效結構與總結統計。

**失敗時：** 若文件畸形，保既有項數據而重構。

### 步驟二：寫或精項

對每新項，書為用戶故事或需求：

- **用戶故事式**：「為 [角色]，我欲 [能力] 以 [益]」
- **需求式**：「[系統/組件] 於 [條件] 時當 [行為]」

每項當有：
- 唯一 ID（B-NNN，遞增）
- 明標題（祈使動詞式）
- 類分類
- 至少 2 接受準則（可測、二元過/敗）

例：
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

**預期：** 所有項有標題、類型與接受準則。

**失敗時：** 無接受準則之項標為 Status: New（非 Ready）。其不能入衝刺。

### 步驟三：以 MoSCoW 或價值/努力排序

用所擇排序框架：

**MoSCoW**（默認）：
- **Must**：項目無此則敗。不可議
- **Should**：重要而項目無之亦可成。容量允則納
- **Could**：佳有。僅於不影響 Must/Should 時納
- **Won't**：明排於當前範圍。記供未來思

**價值/努力矩陣**（替）：

| | Low Effort | High Effort |
|---|-----------|-------------|
| **High Value** | Do First (Quick Wins) | Do Second (Big Bets) |
| **Low Value** | Do Third (Fill-ins) | Don't Do (Money Pits) |

排待辦表：Must 項先（Must 內按值），再 Should，再 Could。

**預期：** 每項有優先。待辦按優先排。

**失敗時：** 若利害者於優先上不一致，升 Must vs Should 決於項目發起人。

### 步驟四：理——分、估與精

為衝刺就緒而審項。每項：
1. 若估 > 8 點（或 > 1 週力）**分**：分為 2-4 小項
2. 以項目所擇尺**估**
3. **精**糊之接受準則為可測條件
4. 當項有標題、接受準則、估計，且無阻時**標為就緒**

記分：
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

**預期：** 所有 Must 與 Should 項於 Ready 狀態。

**失敗時：** 不能估之項需加 Spike（時間盒之研究任）於待辦。

### 步驟五：更總結並歸檔

更總結統計。移 Done 與 Cancelled 項至歸檔節：

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

以計各狀態項更總結：
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**預期：** 總結統計匹配實項計數。歸檔節含所有已閉項。

**失敗時：** 若計數不匹，以 grep 狀態值重計並手更總結。

## 驗證

- [ ] BACKLOG.md 存附標準結構
- [ ] 每項有唯一 ID、標題、類、優先與狀態
- [ ] 所有 Must 與 Should 項有接受準則
- [ ] 項按優先排（Must 先，再 Should，再 Could）
- [ ] 無 > 8 點之項未分
- [ ] 總結統計準
- [ ] Done/Cancelled 項已歸檔

## 常見陷阱

- **無接受準則**：無準則之項不能驗為成。每項需至少 2 可測準則
- **一切皆 Must**：若 >50% 項為 Must，優先非真。於 Must 中強排
- **殭屍項**：於待辦中存月而無進者當重評或取消
- **無上下文之估**：故事點為相對——團隊當有參項（如「B-001 乃我三點參」）
- **分致碎**：分時確每子項獨立可交且有值
- **待辦為傾**：待辦非願單。常剪不合項目目標之項
- **缺依賴**：於 Notes 記阻項。阻之項不當標為 Ready

## 相關技能

- `draft-project-charter` — 章範圍飼初待辦創
- `create-work-breakdown-structure` — WBS 工作包可成待辦項
- `plan-sprint` — 衝刺規劃自待辦頂選
- `generate-status-report` — 待辦燃盡飼狀態報
- `conduct-retrospective` — 回顧改進項反饋於待辦
