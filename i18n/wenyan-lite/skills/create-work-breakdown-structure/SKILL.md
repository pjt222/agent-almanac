---
name: create-work-breakdown-structure
locale: wenyan-lite
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

# 造工作分解結構

分項目範圍為階層之工作包，可估、可派、可追。WBS 為估工、資源計畫、排程開發之基，將複雜交付物分為可管之組件。

## 適用時機

- 項目章程核准且範圍已定後
- 計畫含既定交付物之古典/瀑布項目
- 將大倡議分為可管之工作包
- 立估工與資源計畫之基
- 造所有所需工作之共識

## 輸入

- **必要**：核准之項目章程（尤範圍與交付物段）
- **必要**：項目方法論（古典/瀑布、或含 WBS 之混合計畫）
- **選擇性**：類似項目之歷史工作資料
- **選擇性**：團隊組成與可用技能
- **選擇性**：組織之 WBS 範本或標準

## 步驟

### 步驟一：自章程萃交付物
讀項目章程。列所有交付物與接受標準。組之為 3-7 頂層類（此為 WBS Level 1 元素）。

**預期：** Level 1 WBS 元素清單合章程交付物。

**失敗時：** 若章程泛，返 `draft-project-charter` 以精修範圍。

### 步驟二：分為工作包
各 Level 1 元素，分為子元素（Level 2、Level 3）。施 100% 規則：子元素須代表父範圍之 100%。分停於工作包為：
- 可估（可以人日派工）
- 可派（一人或一團隊有之）
- 可量（明完/未完標準）

造 WBS 大綱：
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

施 WBS 編碼（1.1.1 格式）。確保最深 3-5 層。恒含「Project Management」分支。

**預期：** 全 WBS，含 15-50 工作包，各有唯一 WBS 編碼。

**失敗時：** 若分超 5 層，範圍過大——考慮分為子項目。

### 步驟三：寫 WBS 字典
各工作包（葉節點），寫字典項：

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

**預期：** 各葉節點工作包皆有字典項。

**失敗時：** 缺之字典項指分解不全——返步驟二。

### 步驟四：估工
各工作包施一估法：
- **T-shirt 尺碼**（XS/S/M/L/XL）供早期計畫
- **人日**供細計畫
- **三點估**（樂觀/最可能/悲觀）供高不確之工

造摘要表：
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

總工 = 所有工作包之和。

**預期：** 各工作包皆有估工含所述信心度。

**失敗時：** 若 >30% 之包信心為 Low，與 SME 排精修會。

### 步驟五：辨依賴與關鍵路徑候選
映工作包間之依賴：
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

辨依賴工作包之最長鏈——此為關鍵路徑候選。

**預期：** 依賴表含至少 finish-to-start 關係。

**失敗時：** 若依賴成環，分解有誤——返步驟二。

### 步驟六：審與基線
合 WBS 與字典為終檔。各層驗 100% 規則。得相關者簽。

**預期：** WBS.md 與 WBS-DICTIONARY.md 檔已造並審。

**失敗時：** 若相關者辨缺範圍，加工作包並重估。

## 驗證

- [ ] WBS 檔已造，含文件 ID 與 WBS 編碼
- [ ] 100% 規則於各層皆滿：子完整代表父範圍
- [ ] 各葉節點有 WBS 字典項
- [ ] 所有工作包皆有估工
- [ ] 依賴已辨，無循環引用
- [ ] 含 Project Management 分支
- [ ] 關鍵路徑候選已辨
- [ ] WBS 深度不超 5 層

## 常見陷阱

- **混交付物與活動**：WBS 元素當為名詞（交付物），非動詞（活動）。「User Authentication Module」非「Implement Authentication」
- **違 100% 規則**：若子不合父範圍之 100%，工作將被漏
- **過淺或過深**：2 層於計畫過泛；6+ 層為微管理。目標 3-5 層
- **跳 Project Management 分支**：PM 工作（計畫、會議、報告）為耗工之實工
- **分解前估**：估工作包，非類。Level 1 之估不可靠
- **無字典**：無字典之 WBS 為標籤之樹——字典提供完成之定義

## 相關技能

- `draft-project-charter` —— 提供餵 WBS 分解之範圍與交付物
- `manage-backlog` —— 將 WBS 工作包轉為追之積壓項
- `generate-status-report` —— 對 WBS 完成率報告進度
- `plan-sprint` —— 若用混合法，自 WBS 工作包計畫衝刺
- `conduct-retrospective` —— 審估之準度與分解之品質
