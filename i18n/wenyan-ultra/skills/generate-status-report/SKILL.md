---
name: generate-status-report
locale: wenyan-ultra
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

# 生項目狀態報

析項目文、算進度、錄成阻次期，以 RAG 標健。

## 用

- 迭代或報期末（週、雙週、月）
- 利益人求項目健更
- 指導會或治理會前
- 健標異變（新阻或險現）
- 對章里程碑之定期檢

## 入

- **必**：報期（始、終日）
- **必**：至少一文檔（BACKLOG.md、SPRINT-PLAN.md、WBS.md 或 PROJECT-CHARTER.md）
- **可**：前狀報（趨勢比）
- **可**：預算或資源跟蹤
- **可**：險登記更新

## 行

### 一：讀既有文檔

掃項目目錄取 PM 文：
- PROJECT-CHARTER.md：里程碑、成功標準
- BACKLOG.md：按狀態計數、燃盡數據
- SPRINT-PLAN.md：迭代目標、承諾項、任務完成
- WBS.md：工作包完成百分比
- 先 STATUS-REPORT-*.md：趨勢數據

讀可讀者。非皆存→依可用數據適應報告。

得：至少一文成讀，關鍵標已提。

敗：無文存→報不可生。先用 `draft-project-charter` 或 `manage-backlog` 造章或積件。

### 二：算進度標

由可用數據算標：

**敏捷標**（BACKLOG.md / SPRINT-PLAN.md）：
- 速度：本迭代完成故事點
- 迭代完成：完/承諾
- 積件燃盡：總餘點對前期
- 週期時：In Progress 至 Done 之均日

**經典標**（WBS.md）：
- 完成%：已完工作包/總工作包
- 日程變異：計劃里程碑日對實際
- 力變異：估力對耗力

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

得：算 3-5 標，具前期比。

敗：無史數據（首報）→略 Previous 與 Trend 欄。數據缺→於報腳標空白並予行動項以建跟蹤。

### 三：辨阻、險、題

列活躍阻險：

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

對章之險登記交叉引。標先前未辨之新險。

得：諸活躍阻與首險皆錄，有主有行動。

敗：無阻→顯陳「無活躍阻」，勿留空。阻無主→升至項目經理分配。

### 四：錄成就與次期計

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

得：3-5 成就具證，3-5 次期計項。

敗：無成就→報因（阻、重劃、隊不在）。次期計不明→列「計劃會議訂於 [日期]」為首項。

### 五：定 RAG 標並書報

評四維健度：

| Dimension | Green | Amber | Red |
|-----------|-------|-------|-----|
| **Schedule** | On track or ahead | 1-2 weeks behind | >2 weeks behind or milestone missed |
| **Scope** | No uncontrolled changes | Minor scope adjustments | Scope creep affecting deliverables |
| **Budget** | Within 5% of plan | 5-15% over plan | >15% over plan or untracked |
| **Quality** | Tests pass, criteria met | Minor quality issues | Critical defects or acceptance failures |

書全報：

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

得：全狀報已存，含 RAG 標、標、敘述。

敗：數據不足以定 RAG→用 ⚪（灰）示「數據不足」並列次報所需收集。

## 驗

- [ ] 狀報檔以正確日期戳檔名造
- [ ] RAG 標分於四維皆予由
- [ ] 至少 3 標由項目文算
- [ ] 阻節存（即「無活躍阻」）
- [ ] 成就列具證
- [ ] 次期計含
- [ ] 執行摘 2-3 句，非段落
- [ ] 諸阻險皆有主與帶期之行動

## 忌

- **無數據報**：狀報必證據為基。諸斷皆引文或標
- **恆綠**：持恆綠而無證→報不誠。挑戰綠評
- **阻無主**：諸阻需主與行動。無主阻不解
- **標無脈絡**：「速度=18」孤立無意。恆含前期或目標
- **過長**：狀報應 2 分可掃。限 1-2 頁
- **缺決定節**：項目需利益人決定→顯以期
- **數據陳**：用舊文致誤報。驗文日合報期
- **缺趨勢**：首報無趨勢，次後必比前期

## 參

- `draft-project-charter`
- `manage-backlog`
- `plan-sprint`
- `create-work-breakdown-structure`
- `conduct-retrospective`
