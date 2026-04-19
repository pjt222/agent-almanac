---
name: conduct-retrospective
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Conduct a project or sprint retrospective by gathering data from status
  reports and velocity metrics, structuring what went well and what needs
  improvement, and generating actionable improvement items with owners and
  due dates. Use at the end of a sprint, after a project phase or milestone,
  following a significant incident or success, at a quarterly review of
  ongoing processes, or before starting a similar project to capture lessons
  learned.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
---

# 行回顧

主一結構化之回顧，審近期項目執行、辨何者奏效何者不奏效、生有所有人與到期日之可行改進項。此技能將原始項目數據化為證據支之學習，附具體行動。

## 適用時機

- 衝刺之末（衝刺回顧）
- 項目階段或里程碑之末
- 大事件、敗、成之後
- 進行項目流程之季度審
- 始相似項目前（經驗總結審）

## 輸入

- **必要**：審期（衝刺號、日期範圍、里程碑）
- **選擇性**：審期之狀態報
- **選擇性**：衝刺速率與完成數據
- **選擇性**：前回顧之行動項（查其結案）
- **選擇性**：團隊回饋或調查結果

## 步驟

### 步驟一：集回顧數據

讀審期可用之產物：
- 該期之 STATUS-REPORT-*.md 檔
- SPRINT-PLAN.md 比計畫與實際
- BACKLOG.md 之項流與週期時
- 前 RETRO-*.md 之未結行動項

抽關鍵事實：
- 計畫 vs 完成之項
- 速率趨勢
- 所遇阻與解時
- 入衝刺之計畫外工作
- 前回顧之未結行動項

**預期：** 含量化指標（速率、完成 %、阻數）之數據摘要。

**失敗時：** 若無產物，基於質性觀察行回顧。

### 步驟二：結構化「何者奏效」

附證列 3-5 奏效事：

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

專於可續之實踐，非僅結果。「每日站會令阻可見」較「我們按時交付」更可行。

**預期：** 3-5 附證之正面觀察。

**失敗時：** 若無奏效者，再尋——小勝亦要。至少，團隊完成此期。

### 步驟三：結構化「何者需改進」

附證列 3-5 需改進事：

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

具體且事實。「估算失準」含糊。「5 項中 3 項超估 >50%，增 8 計畫外日」可行。

**預期：** 3-5 附證之改進區，附其影響。

**失敗時：** 若團隊稱一切皆好，比計畫 vs 實際指標——差揭問題。

### 步驟四：生改進行動

每改進區建一可行項：

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

每行動須：
- 具體（非「改進估算」而「於整理會加估算審步」）
- 有所有人（一人負責）
- 有時限（於後 1-2 衝刺內到期）
- 可驗（成功判準已定）

**預期：** 2-4 改進行動附所有人與到期日。

**失敗時：** 若行動過含糊，以「如何驗其已為？」之測試。

### 步驟五：審前行動並寫報

查前回顧行動之結案：

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

標屢現項（同問題出於 3+ 回顧）——此需升呈或換法。

寫完整回顧：

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

存為 `RETRO-[YYYY-MM-DD].md`。

**預期：** 完整回顧文件已存，附行動、證、前行動審。

**失敗時：** 若回顧無改進行動，未驅變——回顧步驟三。

## 驗證

- [ ] 已作附日期戳檔名之回顧檔
- [ ] 期摘要含量化指標
- [ ] 「何者奏效」有 3-5 附證項
- [ ] 「何者需改進」有 3-5 附證項
- [ ] 改進行動有所有人、到期日、成功判準
- [ ] 前回顧行動已審其結案
- [ ] 屢現問題已標

## 常見陷阱

- **咎責遊戲**：回顧審流程與實踐，非人。以系統而非個人框問題
- **行動無後續**：最大之回顧敗。建新行動前總審前行動
- **行動過多**：2-4 專注行動勝 10 含糊。團隊只能吸收一定之變
- **無證**：「我們覺估算不佳」乃意見。「5 項中 3 項超估 50%」乃數據。總附證
- **略正面**：僅論問題令人喪。慶勝強化良實踐

## 相關技能

- `generate-status-report` — 狀態報供回顧之數據
- `manage-backlog` — 改進行動回饋至 backlog
- `plan-sprint` — 回顧之學令衝刺規劃更準
- `draft-project-charter` — 審章程假設與風險之準
- `create-work-breakdown-structure` — 對 WBS 審估算之準
