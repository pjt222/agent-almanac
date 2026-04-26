---
name: manage-backlog
locale: wenyan
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

建、序、養工項之待辦，為所當為之唯一真源，適於敏捷與經典項目法。

## 用時

- 啟新項目，化範為可行之項
- 衝刺計畫前之續待辦梳理
- 利害相關者反饋或範變後重序
- 分過大項為可施之片
- 審並存已成或已取消之項

## 入

- **必要**：項目範（自章、WBS、或利害相關者）
- **可選**：待更之既有待辦檔（BACKLOG.md）
- **可選**：序之框之好（MoSCoW、值／力、WSJF）
- **可選**：估之尺（故事點、衣尺、人日）
- **可選**：需更待辦之衝刺或迭代反饋

## 法

### 第一步：建或載待辦結構

若無待辦，建 BACKLOG.md 以標欄。若已存，讀並驗結構。

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

**得：**BACKLOG.md 存，結構有效，具總統計。

**敗則：**若檔格式訛，重結其構並保既項之數據。

### 第二步：書或精項

為每新項，以用者故事或需求書之：

- **用者故事格**：「為[角]，吾欲[能]以[益]」
- **需求格**：「[系統／組件]於[條件]時當[行為]」

每項須具：
- 唯一 ID（B-NNN，增號）
- 清題（祈使動詞）
- 類分
- 至少 2 接受準則（可試，二元通／敗）

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

**得：**諸項皆具題、類、接受準則。

**敗則：**無接受準則之項標為 Status: New（非 Ready）。不可入衝刺。

### 第三步：以 MoSCoW 或值／力序之

施所擇序之框：

**MoSCoW**（預設）：
- **Must**：無此項目敗。不可商
- **Should**：要而非此項目可成。容則含之
- **Could**：有則善。於 Must／Should 無影響則含之
- **Won't**：明除於當前範。記以後慮

**值／力矩陣**（替代）：

| | 低力 | 高力 |
|---|-----------|-------------|
| **高值** | 先行（速勝） | 次行（大賭） |
| **低值** | 第三（填空） | 勿行（錢坑） |

序待辦表：Must 先（Must 內以值序），然後 Should，然後 Could。

**得：**每項皆有序。待辦依序排。

**敗則：**若利害相關者於序不同，將 Must 對 Should 之決升至項目之贊助者。

### 第四步：梳——分、估、精

為衝刺之備審項。每項：
1. **分** 若估 > 8 點（或 > 1 週力）：解為 2-4 小項
2. **估** 以項目所擇之尺
3. **精** 糊之接受準則為可試之條件
4. **標 Ready** 當項具題、接受準則、估、無阻

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

**得：**諸 Must 與 Should 項於 Ready 狀。

**敗則：**不可估之項需加 Spike（限時研究任）於待辦。

### 第五步：更總並存

更總計。移 Done 與 Cancelled 項於存節：

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

以計每狀之項更總：
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**得：**總計配實項數。存節含諸閉之項。

**敗則：**若計不合，以 grep 各狀重計並手更總。

## 驗

- [ ] BACKLOG.md 存，具標結構
- [ ] 每項具唯一 ID、題、類、序、狀
- [ ] 諸 Must 與 Should 項具接受準則
- [ ] 項依序排（Must 先，然後 Should，然後 Could）
- [ ] 無估 > 8 點之項未分
- [ ] 總計精
- [ ] Done／Cancelled 項已存

## 陷

- **無接受準則**：無準則之項不可驗其成。每項需至少 2 可試準則
- **諸皆 Must**：若 > 50% 項為 Must，序不實。Must 內強排
- **殭屍項**：數月無進於待辦中之項當重評或取消
- **無脈絡之估**：故事點為相對——隊需有參考項（如「B-001 乃吾輩之 3 點參考」）
- **分成碎片**：分時確每子項可獨交付並具值
- **待辦為棄場**：待辦非願望列。定期剪不合項目標之項
- **缺依賴**：於備註記阻之項。阻之項不當標 Ready

## 參

- `draft-project-charter` — 章之範供待辦初建
- `create-work-breakdown-structure` — WBS 工包可為待辦項
- `plan-sprint` — 衝刺計畫擇待辦頂之項
- `generate-status-report` — 待辦燒圖供狀報
- `conduct-retrospective` — 回顧改進項歸入待辦
