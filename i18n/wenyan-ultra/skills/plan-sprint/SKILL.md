---
name: plan-sprint
locale: wenyan-ultra
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

# 計衝刺

擇精積項至團量、立明刺標、解項為任。產 SPRINT-PLAN.md 含標、選項、任分、量配。

## 用

- Scrum 或敏案起新刺→用
- 範變後重計→用
- 自隨工轉構刺節→用
- 積整後項備入→用
- 案章批後計首刺→用

## 入

- **必**：品積（已序、含估）
- **必**：刺時（常 1-2 週）
- **必**：團員與餘
- **可**：前刺速（故事點或畢項）
- **可**：刺號與日範
- **可**：前刺餘項

## 行

### 一：察精積項

讀今 BACKLOG.md。積首之候各項驗有：

- 明題與述
- 受則（可試件）
- 估（故事點或衫尺）
- 無未解阻

缺者精之。估大於刺量半者→分為小可管片。

得：積首 10-15 項皆「刺備」含受則與估。

敗：項無受則→今書之。不可估→排精談、唯選備項。

### 二：定刺標

書一明刺標——一句述刺所成。標當：

- 刺時內可達
- 益於利者
- 可試（刺末可驗達否）

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

例：「使用者可過郵驗與雙因認重置密」。

得：刺標為一明可試句。

敗：無連貫標→積序恐散；詢品主擇單值果。

### 三：算團量

各員算可用人日：

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

過載納會、察、隨求（常 15-25%）。

用故事點：用前刺速為量。首刺則用論最 60-70%。

得：量算為人日或故事點含記假。

敗：無史速→保策、計 60% 量、刺後調。少諾而達優於過諾而敗。

### 四：選項合刺積

自品積首選項至量達。各選項解為任（各 2-8 時）：

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

得：刺積選項至量，各解任含時估。

敗：總點過量→除最末序項。永勿過量逾 10%。依阻序→重序或延項。

### 五：記諾並存

書刺計於 `SPRINT-PLAN.md`（或 `SPRINT-PLAN-S[NNN].md` 為檔）。確：

- 刺標可達於選項
- 無員過配（>100% 量）
- 項依正序
- 餘項已納於量
- 諸受則自積項抄入

末驗：

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

得：SPRINT-PLAN.md 立含完刺積與任分。總時當 ≤80% 可用人日 × 8 時。

敗：諾不合標→重歷步四項擇。任時過量→除末項或更細解任。

## 驗

- [ ] 刺標為一明可試句
- [ ] 團量算含記假（過載 %、PTO 納）
- [ ] 選項不過量（點或人日）
- [ ] 各選項受則抄入任分
- [ ] 各選項解為任（各 2-8 時）
- [ ] 無員過配逾 100%
- [ ] 前刺餘項記含餘工
- [ ] 項依正序
- [ ] 險與緩記
- [ ] SPRINT-PLAN.md 文立而存

## 忌

- **無刺標**：無標則刺只為任袋。標供聚與刺中範決基
- **過諾**：計 100% 量忽擾、錯、過載。計 70-80% 留緩於未期
- **任過大**：任過 8 時掩繁、難追。解至 2-8 時
- **忽餘**：前刺未畢項耗今刺量。明納於量算
- **刺標為項列**：「畢 B-001、B-002、B-003」非標。標述果：「使用者可過郵驗重置密」
- **無任主**：每任當計時派主以早顯量衝
- **略受則**：無受則之任不可試。自積項抄受則於任分

## 參

- `manage-backlog` — 養序品積
- `draft-project-charter` — 供首刺案境與初範
- `generate-status-report` — 報刺進與速於利者
- `conduct-retrospective` — 察刺行、改計程
- `create-work-breakdown-structure` — WBS 工包於混敏-瀑案可入積
