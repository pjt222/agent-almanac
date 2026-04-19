---
name: conduct-retrospective
locale: wenyan-ultra
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

導結構之回顧，察近項行，識成敗，生可為之改項含主與期。此技化原項數據為有證學附具動作、主、期。

## 用

- sprint 末（sprint 回顧）
- 項階或里程末
- 要事、敗、成後
- 行中項程之季察
- 類項啟前（學回）

## 入

- **必**：察期（sprint 號、日範、或里程）
- **可**：期中狀報
- **可**：sprint 速與畢數
- **可**：前回動作（察閉）
- **可**：組反或調果

## 行

### 一：集回顧數據

讀期中可得構件：
- 期之 STATUS-REPORT-*.md 檔
- SPRINT-PLAN.md 計 vs 實
- BACKLOG.md 流與週期
- 前 RETRO-*.md 未閉動作

取要事：
- 計 vs 畢
- 速趨
- 所遇阻與解時
- 入 sprint 之計外工
- 前回未閉動作

**得：** 含定量度（速、畢率、阻數）之數據結。

**敗：** 無構件→以質觀為基。

### 二：結「何行良」

列 3-5 事附證：

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

焦可續之踐，非只果。「日 standup 顯阻」勝於「準時交」。

**得：** 3-5 有證之正觀。

**敗：** 皆無良→細察。至少組畢此期。

### 三：結「何須改」

列 3-5 須改事附證：

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

具體有據。「估誤」泛。「5 項 3 超估 >50%、添 8 日外工」具體。

**得：** 3-5 有證之改域附影響。

**敗：** 組稱皆佳→比計 vs 實度——差現問。

### 四：生改動作

每改域生可為項：

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

每動作須：
- 具體（非「改估」→「加估察步於 grooming」）
- 有主（一人責）
- 有期（次 1-2 sprint 內）
- 可驗（成判已定）

**得：** 2-4 改動作附主與期。

**敗：** 泛→施「如何驗其行」測。

### 五：察前動作且寫報

察前回動作之閉：

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

標復現項（同問現於 3+ 回顧）——須升或換法。

寫全回顧：

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

**得：** 全回顧文存含動作、證、前動作察。

**敗：** 無改動作→未致變——重訪步三。

## 驗

- [ ] 回顧檔已立含日戳名
- [ ] 期結含定量度
- [ ] 「何行良」有 3-5 有證項
- [ ] 「何須改」有 3-5 有證項
- [ ] 改動作有主、期、成判
- [ ] 前回動作已察閉
- [ ] 復現問已標

## 忌

- **責戲**：回顧察程與踐，非人。問為系，非個。
- **動作無隨進**：回顧最大敗。生新前必察前動作。
- **動作過多**：2-4 聚焦勝於 10 泛。組一時變能有限。
- **無證**：「感覺估差」為見。「5 項 3 超估 50%」為數。必附證。
- **略正**：只議問→挫志。慶成強良踐。

## 參

- `generate-status-report` — 狀報供回顧數據
- `manage-backlog` — 改動作回饋入待辦
- `plan-sprint` — 回顧學改 sprint 計之準
- `draft-project-charter` — 察章假設與險準
- `create-work-breakdown-structure` — 察估準對 WBS
