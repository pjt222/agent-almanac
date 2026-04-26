---
name: manage-backlog
locale: wenyan-ultra
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

# 管積項

造、排、維工項積作何當行之唯一真源，敏捷與典項法皆用。

## 用

- 啟新項並化範為可行項
- 衝前積梳
- 持分反饋或範變後重排
- 分過大項為可施片
- 審並歸畢或消項

## 入

- **必**：項範（章、WBS、持分輸入）
- **可**：現 BACKLOG.md 更
- **可**：排框偏（MoSCoW、價/力、WSJF）
- **可**：估尺（故事點、衫號、人日）
- **可**：需更積之衝或迭反饋

## 行

### 一：造或載積結

無積存→造 BACKLOG.md 附標列。有存→讀並驗結。

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

得：BACKLOG.md 存附有效結與總統。

敗：文件誤格→保現項數據重構。

### 二：寫或精項

各新項寫為用故事或需求：

- **用故事格**：「作 [角]，吾欲 [能] 以 [益]」
- **需求格**：「[系統/組件] 當 [行為] 當 [條]」

各項須：
- 獨 ID（B-NNN，增）
- 明題（祈使動詞形）
- 類歸
- 至少 2 受納準（可試、二元過/敗）

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

得：諸項有題、類、受納準。

敗：無受納準之項→標 Status: New（非 Ready）→不可入衝。

### 三：以 MoSCoW 或價/力排

用擇排框：

**MoSCoW**（默）：
- **Must**：項無此則敗。不可談
- **Should**：要而無亦可成。容量許則含
- **Could**：好而有。不影 Must/Should 處則含
- **Won't**：明排當前範。記為未來考

**價/力矩**（替）：

| | 低力 | 高力 |
|---|-----------|-------------|
| **高價** | 先行（速勝） | 次行（大賭） |
| **低價** | 三行（填） | 不行（錢坑） |

排積表：Must 先（Must 內按價），後 Should、Could。

得：各項有優先。積按優排。

敗：持分於優分歧→Must vs Should 決升至項贊。

### 四：梳——分、估、精

審項為衝備：
1. **分** 若估 > 8 點（或 > 1 週力）：分為 2-4 小項
2. **估** 用項擇尺
3. **精** 模糊受納準為可試條
4. **標備** 當項有題、受納準、估、無阻

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

得：諸 Must 與 Should 項為 Ready 態。

敗：不可估之項→需 Spike（時限研任）加入積。

### 五：更總並歸

更總統。移 Done 與 Cancelled 至歸節：

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

以計各態項更總：
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

得：總統匹實項計。歸節含諸閉項。

敗：計不匹→按 Status 值 grep 重計並手動更總。

## 驗

- [ ] BACKLOG.md 存附標結
- [ ] 各項有獨 ID、題、類、優、態
- [ ] 諸 Must 與 Should 項有受納準
- [ ] 項按優排（Must 先，後 Should、Could）
- [ ] 無項估 > 8 點而未分
- [ ] 總統精
- [ ] Done/Cancelled 項已歸

## 忌

- **無受納準**：無準項不可驗畢。各項至少 2 可試準
- **皆 Must 優**：> 50% 為 Must →優非真。Must 內強排
- **殭項**：積中月無進之項→重評或消
- **估無脈**：故事點為相對——隊須有參項（如「B-001 為吾 3 點參」）
- **分成碎**：分時確各子項獨可交且有價
- **積為棄場**：積非願單。常修不合項目之項
- **缺依**：Notes 中記阻項。受阻項不當標 Ready

## 參

- `draft-project-charter` — 章範饋初積造
- `create-work-breakdown-structure` — WBS 工包可為積項
- `plan-sprint` — 衝計由積頂擇
- `generate-status-report` — 積消耗饋態報
- `conduct-retrospective` — 回顧改項反饋積
