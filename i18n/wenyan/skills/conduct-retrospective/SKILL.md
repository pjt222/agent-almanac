---
name: conduct-retrospective
locale: wenyan
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

導結構之回顧，察近項目之行，識善與不善，生可行之改附主與期。此技化原項目之資為附證之學含具體之行、主、期。

## 用時

- 一衝之末（衝之回顧）
- 項段或里程之末
- 顯事、敗、或成之後
- 進行程之季察
- 始似項目前（學之回顧）

## 入

- **必**：察期（衝號、日範、或里程）
- **可選**：期中之狀態報
- **可選**：衝速與成資
- **可選**：前回顧之行（察閉）
- **可選**：團反或問果

## 法

### 第一步：收回顧之資

讀期中可得之品：
- STATUS-REPORT-*.md 檔
- SPRINT-PLAN.md 之謀對實
- BACKLOG.md 之項流與周期
- 前 RETRO-*.md 之開行

取要實：
- 謀對成之項
- 速之趨
- 阻與解之時
- 入衝之不謀作
- 前回顧之開行

**得：** 資摘附量度（速、成 %、阻數）。

**敗則：** 若無品，以質察為基。

### 第二步：構「善者」

列三至五善事附證：

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

專於可續之實，非只果。「日站會使阻可見」勝於「我等按期送」。

**得：** 三至五附證之善察。

**敗則：** 若無善，更察——微勝亦要。至少團已畢此期。

### 第三步：構「需改者」

列三至五需改事附證：

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

宜具體實。「估不準」含糊。「五中三項逾估五成，加八不謀日」可行。

**得：** 三至五附證之改區附影。

**敗則：** 若團言皆善，比謀對實之量——間隙露問。

### 第四步：生改行

每改區立可行之項：

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

每行必：
- 具體（非「改估」而「加估察步於整理」）
- 有主（一人負）
- 有期（下一二衝內）
- 可驗（成之準已定）

**得：** 二至四改行附主與期。

**敗則：** 若行過含糊，施「汝如何驗此已成」之試。

### 第五步：察前行且書報

察前回顧之行為閉：

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

標重現之項（同問於三回顧以上）——此需升或異法。

書全回顧：

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

**得：** 全回顧之書附行、證、前行察。

**敗則：** 若回顧無改行，未驅變——重訪第三步。

## 驗

- [ ] 回顧檔建附日戳之名
- [ ] 期摘含量度
- [ ] 「善者」有三至五附證項
- [ ] 「需改者」有三至五附證項
- [ ] 改行有主、期、成準
- [ ] 前回顧之行已察閉
- [ ] 重現之問已標

## 陷

- **責之戲**：回顧察程與實，非人。構問為系，非私。
- **行而不隨**：回顧最大之敗。建新行前必察前行。
- **行過多**：二至四專行勝於十含糊。團只可受幾變。
- **無證**：「我等覺估不準」乃意。「五中三項逾估五成」乃資。必附證。
- **略善**：只論問則挫。慶勝固善實。

## 參

- `generate-status-report` — 狀報供回顧之資
- `manage-backlog` — 改行歸積壓
- `plan-sprint` — 回顧之學改衝謀之準
- `draft-project-charter` — 察憲假與險之準
- `create-work-breakdown-structure` — 察估準對 WBS
