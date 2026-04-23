---
name: create-work-breakdown-structure
locale: wenyan-ultra
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

# 造工分構

分案範為可估、賦、追之層工包集。WBS 為力估、資謀、程發之基。

## 用

- 案憲承後、範定
- 謀含定交之典/瀑案
- 分大舉為可理工包
- 立力估與資謀之基
- 建諸需工之共識

## 入

- **必**：承案憲（特範與交節）
- **必**：案法（典/瀑、或含 WBS 謀之合）
- **可**：類案歷力
- **可**：團組與可技
- **可**：組 WBS 模或準

## 行

### 一：自憲取交

讀案憲。列諸交與受準。組為 3-7 頂類（此為 WBS Level 1）。

**得：** Level 1 WBS 元列合憲交。

**敗：** 憲泛→返 `draft-project-charter` 精範。

### 二：分為工包

各 Level 1 元分為子元（Level 2、Level 3）。施 100% 規：子元須代父範 100%。止分時工包須：
- 可估（可賦人日力）
- 可賦（一人或團有）
- 可度（明畢/未畢準）

建 WBS 綱：
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

施 WBS 碼（1.1.1 式）。保 3-5 層內。恆含「Project Management」枝。

**得：** 含 15-50 工包之全 WBS、各含獨 WBS 碼。

**敗：** 分過 5 層→範過大、考分子案。

### 三：書 WBS 典

各工包（葉）書典項：

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

**得：** 每葉工包含典項。

**敗：** 缺典項示分不全→返步二。

### 四：估力

各工包施一估法：
- **T-shirt**（XS/S/M/L/XL）早期謀
- **人日**細謀
- **三點估**（樂/常/悲）高不確工

建結表：
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

總力 = 諸工包和。

**得：** 每工包含力估與言信。

**敗：** 低信 >30% 包→排 SMEs 精會。

### 五：識依與關鍵路候

映工包間依：
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

識最長依鏈——此為關鍵路候。

**得：** 依表至少含 finish-to-start 關。

**敗：** 依成環→分誤、返步二。

### 六：評與立基

合 WBS 與典為終檔。驗每層 100% 規。得相關人籤。

**得：** WBS.md 與 WBS-DICTIONARY.md 檔建且評。

**敗：** 相關人識缺範→加工包重估。

## 驗

- [ ] WBS 檔建含檔 ID 與 WBS 碼
- [ ] 100% 規滿：子全代每層父範
- [ ] 每葉含 WBS 典項
- [ ] 諸工包含力估
- [ ] 依已識、無環
- [ ] Project Management 枝含
- [ ] 關鍵路候識
- [ ] WBS 深不過 5 層

## 忌

- **混交與動**：WBS 元當為名（交）、非動。「User Authentication Module」非「Implement Authentication」
- **違 100% 規**：子不和為父範 100%→工漏
- **過淺或深**：2 層泛、6+ 層微理。目 3-5 層
- **略 PM 枝**：PM 工（謀、會、報）為實工耗力
- **分前估**：估工包、非類。Level 1 估不靠
- **無典**：WBS 無典為標樹——典予畢定

## 參

- `draft-project-charter` — 予 WBS 分之範與交
- `manage-backlog` — 化 WBS 工包為備項為追
- `generate-status-report` — 按 WBS % 畢報進
- `plan-sprint` — 合法→自 WBS 工包 sprint 謀
- `conduct-retrospective` — 評估準與分質
