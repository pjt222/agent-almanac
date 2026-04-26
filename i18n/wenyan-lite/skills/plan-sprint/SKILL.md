---
name: plan-sprint
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a sprint by refining backlog items, defining a sprint goal, calculating
  team capacity, selecting items, and decomposing them into tasks. Produces
  a SPRINT-PLAN.md with goal, selected items, task breakdown, and capacity
  allocation. Use when starting a new sprint in a Scrum or agile project,
  re-planning after significant scope change, transitioning from ad-hoc work
  to structured sprint cadence, or after backlog grooming when items are ready
  for inclusion.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, sprint, agile, scrum, capacity, sprint-planning
---

# 規劃衝刺

為時程箱化之衝刺擇精煉後之待辦項至團隊產能上限，立明確之衝刺目標，並將所擇項分解為可執行任務。本技能產出一份完整之衝刺計畫，於整個衝刺迭代期間引導團隊工作。

## 適用時機

- 於 Scrum 或敏捷專案開始新衝刺
- 範圍重大變動後重新規劃衝刺
- 自臨時式工作過渡至結構化衝刺節奏
- 待辦清單經整理、項目可納入衝刺後
- 專案章程核可後之首次衝刺規劃

## 輸入

- **必要**：產品待辦清單（已排序、附估算）
- **必要**：衝刺時長（通常 1-2 週）
- **必要**：團隊成員及其可用度
- **選擇性**：上次衝刺速度（故事點或完成項數）
- **選擇性**：衝刺編號與日期範圍
- **選擇性**：自上次衝刺結轉之項目

## 步驟

### 步驟一：審視並精煉待辦項

讀當前之 BACKLOG.md。對每一近頂之候選項，驗證其具備：

- 明確之標題與描述
- 可測之驗收準則
- 估算（故事點或 T 恤尺寸）
- 無未解之阻擋

精煉所缺項；將估值大於半個衝刺產能之項拆為較小、可管理之單元。

**預期：** 待辦清單頂端 10-15 項皆「可入衝刺」，附驗收準則與估算。

**失敗時：** 若項缺驗收準則，現補；若項無法估算，安排精煉討論並僅擇就緒之項。

### 步驟二：訂衝刺目標

寫下單一明確之衝刺目標——以一句話陳述本次衝刺將達成何事。目標應：

- 於衝刺時長內可達
- 對利害關係人有價值
- 可測（衝刺末可驗證是否達成）

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

範例：「讓使用者得以透過郵件驗證並結合雙因素驗證重設密碼。」

**預期：** 衝刺目標已表為一句明確、可測之陳述。

**失敗時：** 若無一致之目標浮現，待辦清單之優先序恐失焦；與產品負責人共議，聚焦於單一有價值之成果。

### 步驟三：計算團隊產能

計算每名團隊成員之可用人天：

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

額外開銷涵蓋會議、審查、臨時請求（一般 15-25%）。

若用故事點：以上次衝刺速度為產能；若為首次衝刺，以理論最高之 60-70% 為宜。

**預期：** 已以人天或故事點計算產能，並記錄假設。

**失敗時：** 若無歷史速度，採保守路線：計畫至 60% 產能，衝刺後再調整。寧少承諾而能交付，不多承諾而失信。

### 步驟四：擇項並組成衝刺待辦

自產品待辦頂端擇項，至產能上限。將每一所擇項分解為任務（每項 2-8 小時）：

```markdown
# Sprint Plan: Sprint [N]
## Document ID: SP-[PROJECT]-S[NNN]

### Sprint Details
- **Sprint Goal**: [From Step 2]
- **Duration**: [Start date] to [End date]
- **Capacity**: [From Step 3] person-days / [N] story points
- **Team**: [List team members]

### Sprint Backlog
| ID | Item | Points | Tasks | Assignee | Status |
|----|------|--------|-------|----------|--------|
| B-001 | [Item title] | 5 | 4 | [Name] | To Do |
| B-002 | [Item title] | 3 | 3 | [Name] | To Do |
| B-003 | [Item title] | 8 | 6 | [Name] | To Do |
| **Total** | | **16** | **13** | | |

### Task Breakdown

#### B-001: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (4h, [Assignee])
- [ ] Task 2: [Description] (2h, [Assignee])
- [ ] Task 3: [Description] (4h, [Assignee])
- [ ] Task 4: [Description] (2h, [Assignee])

#### B-002: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])

#### B-003: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])
- [ ] Task 4: [Description] (3h, [Assignee])
- [ ] Task 5: [Description] (4h, [Assignee])
- [ ] Task 6: [Description] (2h, [Assignee])

### Risks and Dependencies
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk 1] | [Impact] | [Mitigation] |
| [Risk 2] | [Impact] | [Mitigation] |

### Carry-Over from Previous Sprint
| ID | Item | Reason | Remaining Effort |
|----|------|--------|-----------------|
| B-XXX | [Item] | [Reason] | [Hours/points] |
```

**預期：** 衝刺待辦至產能上限，每項皆分解為任務並附時間估算。

**失敗時：** 若總點數超過產能，刪除最低優先項。切勿超出產能逾 10%。若相依阻擋順序，重排或延後。

### 步驟五：記錄承諾並儲存

將衝刺計畫寫入 `SPRINT-PLAN.md`（或為存檔用之 `SPRINT-PLAN-S[NNN].md`）。確認：

- 以所擇項可達衝刺目標
- 無成員過度配置（>100% 產能）
- 項間相依排序正確
- 結轉項已納入產能計算
- 所有驗收準則皆自待辦項複製

執行最終驗證：

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

**預期：** SPRINT-PLAN.md 已建立，含完整衝刺待辦與任務分解。總時數應 ≤ 可用人天 × 8 小時 之 80%。

**失敗時：** 若承諾與目標不對齊，回到步驟四重審項目擇定。若任務時數超產能，刪除末項或將任務再細分。

## 驗證

- [ ] 衝刺目標為一句明確、可測之陳述
- [ ] 已計算團隊產能，並記錄假設（額外開銷比例、休假已扣）
- [ ] 所擇項未超產能（點數或人天）
- [ ] 每一所擇項之驗收準則已複製入任務分解
- [ ] 每一所擇項已分解為任務（每項 2-8 小時）
- [ ] 無成員過度配置超過 100% 產能
- [ ] 上次衝刺結轉項已記錄餘下工作量
- [ ] 項間相依排序正確
- [ ] 風險與緩解已記錄
- [ ] SPRINT-PLAN.md 檔案已建立並儲存

## 常見陷阱

- **無衝刺目標**：無目標之衝刺只是任務之袋。目標提供焦點與衝刺中決定範圍之依據。
- **過度承諾**：以 100% 產能規劃忽略干擾、缺陷與額外開銷。規劃至 70-80%，留意外緩衝。
- **任務過大**：超過 8 小時之任務隱藏複雜度，使追蹤進度困難。分解直至每項 2-8 小時。
- **忽略結轉**：上次衝刺未盡之項耗用本次產能。明確納入產能計算。
- **以項目清單為衝刺目標**：「完成 B-001、B-002、B-003」非目標。目標描述成果：「使用者可透過郵件驗證重設密碼。」
- **任務無歸屬**：每項任務於規劃時皆應有承擔人，俾及早浮出產能衝突。
- **省略驗收準則**：無驗收準則之任務無法驗測。將待辦項之驗收準則複製入任務分解節。

## 相關技能

- `manage-backlog` —— 維護與排序餵養衝刺規劃之產品待辦清單
- `draft-project-charter` —— 為首次衝刺提供專案脈絡與初始範圍
- `generate-status-report` —— 向利害關係人回報衝刺進度與速度
- `conduct-retrospective` —— 檢討衝刺執行並改善規劃流程
- `create-work-breakdown-structure` —— WBS 工作包可餵養混合敏捷瀑布之待辦清單
