---
name: plan-sprint
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  謀衝刺：精待辦項、定衝刺之目、算隊容、擇項、分解為任。生 SPRINT-PLAN.md，
  含目、所擇項、任分解、容分配。始 Scrum 或敏捷項之新衝刺、範圍大變後重謀、
  自隨機作轉結構化衝刺節奏、待辦整理後諸項可入時用之。
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

# 謀衝刺

謀時箱衝刺：擇精煉之待辦項至隊容，定明之衝刺目，將擇項分解為可行之任。此技能生完整衝刺謀，導隊於衝刺迭代之久。

## 用時

- 始 Scrum 或敏捷項之新衝刺
- 範圍大變後重謀衝刺
- 自隨機作轉結構化衝刺節奏
- 待辦整理後諸項可入衝刺
- 項目章批後謀首衝刺

## 入

- **必要**：產品待辦（已分優、含估）
- **必要**：衝刺久（常 1-2 週）
- **必要**：隊員與其可用
- **可選**：往衝刺之速（故事點或所完項）
- **可選**：衝刺號與日範
- **可選**：自上衝刺之承續項

## 法

### 第一步：察精待辦項

讀當前 BACKLOG.md。對各候項近待辦頂者，驗其有：

- 清晰之題與述
- 接受之準（可測之條件）
- 估（故事點或 T 恤大小）
- 無未解之阻

精無此者。將估逾衝刺容半者分為較小可管之片。

得：頂之 10-15 待辦項「衝刺可入」，附接受之準與估。

敗則：若項無接受之準，今書之。若項不能估，排精煉談並唯擇可入者。

### 第二步：定衝刺目

書一明衝刺目——一句述衝刺所成。目當：

- 衝刺久內可達
- 對相關者有值
- 可測（衝刺末可驗其達）

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

例：「使用者得以電郵驗附二要素認證重置其密碼。」

得：衝刺目以一清晰可測之句述之。

敗則：若無連貫之目浮現，待辦優先或散——詢產品主以焦於一有值之果。

### 第三步：算隊容

算各隊員可用人日：

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

額外計會、檢、隨機請（常 15-25%）。

若用故事點：用上衝刺之速為容。若首衝刺，用理論最大之 60-70%。

得：以人日或故事點算容，附記之假。

敗則：若無歷史速，當保守——謀至 60% 容並衝刺後調。少諾而交勝多諾而敗。

### 第四步：擇項並組衝刺待辦

自產品待辦頂擇項至容滿。將各擇項分解為任（各 2-8 時）：

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

得：衝刺待辦含至容之諸擇項，各分為附時估之任。

敗則：若總點逾容，去最低優先項。容絕勿逾 10%。若依賴阻序，重排或延項。

### 第五步：記諾並存

書衝刺謀於 `SPRINT-PLAN.md`（或檔案 `SPRINT-PLAN-S[NNN].md`）。確：

- 衝刺目與所擇項可達
- 無隊員過配（>100% 容）
- 諸項間依賴序正確
- 承續項計入容
- 諸接受之準自待辦項複入

行最終驗：

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

得：SPRINT-PLAN.md 已立，含完整衝刺待辦與任分解。總時當 ≤ 可用人日 × 8 時之 80%。

敗則：若諾與目不合，重察第四步之擇項。若任時逾容，去末項或更細分任。

## 驗

- [ ] 衝刺目為一清晰可測之句
- [ ] 隊容已算附記之假（額外%、PTO 計）
- [ ] 所擇項不逾容（點或人日）
- [ ] 各擇項皆有接受之準入任分解
- [ ] 各擇項皆分為任（各 2-8 時）
- [ ] 無隊員過配逾 100% 容
- [ ] 上衝刺之承續項已記附餘工
- [ ] 諸項間依賴序正確
- [ ] 險與緩解已記
- [ ] SPRINT-PLAN.md 文已立並存

## 陷

- **無衝刺目**：無目，衝刺唯任之袋。目供焦並為衝刺中範圍決之基。
- **過諾**：謀至 100% 容忽擾、缺、額外。謀至 70-80% 留意外之餘。
- **任過大**：逾 8 時之任掩複雜並使追進難。分解至任為 2-8 時。
- **忽承續**：上衝刺未畢項耗本衝刺之容。明計其於容算中。
- **衝刺目為項列**：「完 B-001、B-002、B-003」非目。目述果：「使用者得以電郵驗重置密碼」。
- **無任主**：謀時各任皆當有主，以早顯容衝。
- **略接受之準**：無接受之準之任不可測。自待辦項複接受之準入任分解節。

## 參

- `manage-backlog` — 維與分優產品待辦以餵衝刺謀
- `draft-project-charter` — 供項目脈絡與首衝刺之初範
- `generate-status-report` — 報衝刺進度與速於相關者
- `conduct-retrospective` — 檢衝刺執行並進謀劃程
- `create-work-breakdown-structure` — WBS 工作包可餵待辦於混敏捷-瀑布之法
