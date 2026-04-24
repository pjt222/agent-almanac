---
name: generate-status-report
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Generate a project status report by reading existing artifacts (charter,
  backlog, sprint plan, WBS), calculating metrics, identifying blockers,
  and summarizing progress with RAG indicators for schedule, scope, budget,
  and quality. Use at the end of a sprint or reporting period, when stakeholders
  request a health update, before steering committee or governance meetings,
  or when a new blocker or risk materializes mid-project.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
---

# 項目狀況報告之生

析項目成品、算進度、摘成就阻滯與後續、以 RAG（紅/琥/綠）健康指示生週期狀況報告。

## 用時

- 衝刺或報告期末（週、雙週、月）
- 利益相關者求項目健康更新
- 前指導委員會或治理會議
- 項目健康指標變（如新阻滯或風險現）
- 相對章程里程之週期察

## 入

- **必要**：報告期（始、終日）
- **必要**：至少一項目成品（BACKLOG.md、SPRINT-PLAN.md、WBS.md 或 PROJECT-CHARTER.md）
- **可選**：前狀況報告（為趨勢比較）
- **可選**：預算或資源跟蹤資料
- **可選**：風險登記更新

## 法

### 第一步：讀現有成品

掃項目目錄察 PM 成品：
- PROJECT-CHARTER.md — 里程、成功準則
- BACKLOG.md — 按狀態計項、燃盡資料
- SPRINT-PLAN.md — 衝刺目標、承諾項、任務完成
- WBS.md — 工作包完成百分比
- 前 STATUS-REPORT-*.md 檔 — 趨勢資料

讀可得檔。非必皆存——報告依可得資料適應。

**得：** 至少一成品成功讀取，要指標已抽。

**敗則：** 無成品則無法生報告。先以 `draft-project-charter` 或 `manage-backlog` 技能創章程或待辦。

### 第二步：算進度指標

自可得資料算指標：

**敏捷指標**（BACKLOG.md / SPRINT-PLAN.md）：
- 速度：本衝刺完成之故事點
- 衝刺完成：完成項 / 承諾項
- 待辦燃盡：剩餘點對比前期
- 週期時：平均從進行中至完成之日數

**經典指標**（WBS.md）：
- 完成率：完成工作包 / 總工作包
- 進度差異：計劃里程日 vs 實際
- 工作量差異：估計工作量 vs 實耗

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**得：** 三至五指標已算，與前期比。

**敗則：** 若無歷史資料（首報），略 Previous 與 Trend 列。若資料不全，於報告腳注標間隙，附行動項以立跟蹤。

### 第三步：識阻滯、風險、問題

列活動阻滯與風險：

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

交叉比對章程風險登記。標任何前未識之新風險。

**得：** 所有活動阻滯與頂風險皆記，附擁者與行動。

**敗則：** 若無阻滯，顯陳「無活動阻滯」——勿留空。阻滯無擁者則升至項目經理指派。

### 第四步：摘成就與下期計劃

書二節：

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**得：** 三至五成就附具體證據，下期三至五計劃項。

**敗則：** 若無成就，報原因（受阻、重劃、隊不可得）。若下期計劃不明，列「計劃會排於 [日]」為主項。

### 第五步：賦 RAG 指示並書報告

四維度察項目健康：

| Dimension | Green | Amber | Red |
|-----------|-------|-------|-----|
| **Schedule** | On track or ahead | 1-2 weeks behind | >2 weeks behind or milestone missed |
| **Scope** | No uncontrolled changes | Minor scope adjustments | Scope creep affecting deliverables |
| **Budget** | Within 5% of plan | 5-15% over plan | >15% over plan or untracked |
| **Quality** | Tests pass, criteria met | Minor quality issues | Critical defects or acceptance failures |

書完整報告：

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

存為 `STATUS-REPORT-[YYYY-MM-DD].md`。

**得：** 完整狀況報告存，含 RAG 指示、指標、敘述。

**敗則：** 若資料不足為 RAG 評估，用 ⚪（灰）示「資料不足」，列下期須收集之資料。

## 驗

- [ ] 狀況報告檔創有正日戳檔名
- [ ] 四維度皆賦 RAG 指示有理由
- [ ] 自項目成品算至少三指標
- [ ] 阻滯節存（即使「無活動阻滯」）
- [ ] 成就有證據列出
- [ ] 下期計劃含入
- [ ] 執行摘要二至三句，非段
- [ ] 每阻滯與風險有擁者與行動與期限

## 陷

- **報告無資料**：狀況報告必有據。每聲明皆應參成品或指標
- **恆綠不怠**：持綠 RAG 無據示報告不誠。挑戰綠評
- **阻滯無擁者**：每阻滯需擁者與行動。無擁阻滯不解
- **指標無語境**：「速度 = 18」無比較無義。必含前期或目標
- **過長**：狀況報告應二分鐘可掃。保一至二頁
- **缺決策節**：若項目需利益相關者決策，顯陳附期限
- **資料陳舊**：用舊成品致誤報。驗成品日合報告期
- **缺趨勢資料**：首報不能顯趨勢，然後續報必比前期

## 參

- `draft-project-charter` — 章程供狀況跟蹤之里程與成功準則
- `manage-backlog` — 待辦指標入狀況報告
- `plan-sprint` — 衝刺結果供速度與完成資料
- `create-work-breakdown-structure` — WBS 完成驅動經典進度指標
- `conduct-retrospective` — 狀況報告資料入回顧
