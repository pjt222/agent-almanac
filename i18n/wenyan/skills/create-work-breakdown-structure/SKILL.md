---
name: create-work-breakdown-structure
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a Work Breakdown Structure (WBS) and WBS Dictionary from project
  charter deliverables. Covers hierarchical decomposition, WBS coding,
  effort estimation, dependency identification, and critical path candidates.
  Use after a project charter is approved, when planning a classic or waterfall
  project with defined deliverables, breaking a large initiative into manageable
  work packages, or establishing a basis for effort estimation and resource
  planning.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, wbs, work-breakdown-structure, classic, waterfall, planning
---

# 建工分結構

分項範為層級工包，可估、派、追。WBS 為估工、計資、定程之基，破繁交為可管之組件。

## 用時

- 項章既准而範已定後
- 劃有明交之古／瀑項
- 破大舉為可管工包
- 立估工與計資之基
- 建諸所需工之共識

## 入

- **必要**：已准項章（尤範與交節）
- **必要**：項法（古／瀑，或劃用 WBS 之混）
- **可選**：似項之歷史工資
- **可選**：團組與可用技
- **可選**：組織之 WBS 樣或準

## 法

### 第一步：由章抽交
讀項章。列諸交與驗收。合為 3-7 頂類（此為 WBS 第一級之元）。

**得：** 合章之交之第一級 WBS 元列。

**敗則：** 若章泛，返 `draft-project-charter` 以精範。

### 第二步：分為工包
每第一級元，分為子元（第二、第三級）。施百分之百則：子必表父之全範。工包當：
- 可估（可以人日派工）
- 可派（一人或一團主之）
- 可量（有清畢之準）

則止分。建 WBS 概：
```markdown
# Work Breakdown Structure: [Project Name]
## Document ID: WBS-[PROJECT]-[YYYY]-[NNN]

### WBS Hierarchy

1. [Level 1: Deliverable Category A]
   1.1 [Level 2: Sub-deliverable]
      1.1.1 [Level 3: Work Package]
      1.1.2 [Level 3: Work Package]
   1.2 [Level 2: Sub-deliverable]
2. [Level 1: Deliverable Category B]
   2.1 [Level 2: Sub-deliverable]
3. [Level 1: Project Management]
   3.1 Planning
   3.2 Monitoring & Control
   3.3 Closure
```

施 WBS 碼（1.1.1 式）。至多 3-5 級深。皆含「Project Management」支。

**得：** 全 WBS 含 15-50 工包，每有唯一 WBS 碼。

**敗則：** 若分逾五級，範過大——考分為子項。

### 第三步：書 WBS 詞典
每工包（葉節）書詞典項：

```markdown
# WBS Dictionary: [Project Name]
## Document ID: WBS-DICT-[PROJECT]-[YYYY]-[NNN]

### WBS 1.1.1: [Work Package Name]
- **Description**: What this work package produces
- **Acceptance Criteria**: How to verify it's done
- **Responsible**: Person or role
- **Estimated Effort**: [T-shirt size or person-days]
- **Dependencies**: WBS codes this depends on
- **Assumptions**: Key assumptions for this work package

### WBS 1.1.2: [Work Package Name]
...
```

**得：** 每葉工包有詞典項。

**敗則：** 缺詞典項示分不全——返第二步。

### 第四步：估工
每工包，施一估法：
- **T 恤尺**（XS/S/M/L/XL）用於早期劃
- **人日** 用於詳劃
- **三點估**（樂觀／最可能／悲觀）用於高不確定工

建概表：
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

總工 = 諸工包之和。

**得：** 每工包有工估含信度。

**敗則：** 若 >30% 包信度低，與專家排精會。

### 第五步：識依與關鍵徑候選
映工包間依：
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

識依包最長之鏈——此為關鍵徑候選。

**得：** 依表有至少識完始依。

**敗則：** 若依成環，分有誤——返第二步。

### 第六步：察而定基線
合 WBS 與詞典為終文。驗諸級百分之百則。獲相關者簽。

**得：** WBS.md 與 WBS-DICTIONARY.md 文件建而察。

**敗則：** 若相關者識缺範，加工包而重估。

## 驗

- [ ] WBS 文件建含文件 ID 與 WBS 碼
- [ ] 諸級皆滿百分之百則
- [ ] 每葉節有 WBS 詞典項
- [ ] 諸工包有工估
- [ ] 依已識而無環
- [ ] 含 Project Management 支
- [ ] 關鍵徑候選已識
- [ ] WBS 深不逾五級

## 陷

- **混交與活**：WBS 元當為名（交），非動（活）。「User Authentication Module」非「Implement Authentication」。
- **違百分之百則**：若子不合為父之全範，工將遺。
- **過淺或過深**：二級泛於劃；六級以上為微管。目標 3-5 級。
- **略 PM 支**：PM 工（劃、會、報）為實工費工。
- **分前估**：估工包非類。第一級之估不可靠。
- **無詞典**：無詞典之 WBS 為標之樹——詞典供畢之定。

## 參

- `draft-project-charter` — 供範與交以饋 WBS 分
- `manage-backlog` — 轉 WBS 工包為積項以追
- `generate-status-report` — 依 WBS % 畢報進
- `plan-sprint` — 若混法，由 WBS 工包劃衝
- `conduct-retrospective` — 察估準與分質
