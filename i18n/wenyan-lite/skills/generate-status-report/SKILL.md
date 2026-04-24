---
name: generate-status-report
locale: wenyan-lite
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

# 生項目狀態報告

以分析項目工件、算進度指標、摘述成就、阻礙與前路工作，附 RAG（紅/琥珀/綠）健康指示，產定期狀態報告。

## 適用時機

- 衝刺或報告期末（週、雙週、月）
- 利害關係人請項目健康更新
- 指導委員會或治理會議前
- 項目健康指標變時（如新阻礙或風險顯現）
- 對照章程里程碑之定期檢查點

## 輸入

- **必要**：報告期（起止日）
- **必要**：至少一項目工件（BACKLOG.md、SPRINT-PLAN.md、WBS.md 或 PROJECT-CHARTER.md）
- **選擇性**：前次狀態報告（以較趨勢）
- **選擇性**：預算或資源追蹤資料
- **選擇性**：風險登錄之更新

## 步驟

### 步驟一：讀現有工件

掃項目目錄以覓 PM 工件：
- PROJECT-CHARTER.md — 里程碑、成功標準
- BACKLOG.md — 狀態計數、燃盡資料
- SPRINT-PLAN.md — 衝刺目標、承諾項目、任務完成
- WBS.md — 工作包完成百分比
- 前次 STATUS-REPORT-*.md 檔 — 趨勢資料

讀可得檔。非盡存——依可得資料適配報告。

**預期：** 至少一工件成功讀入，關鍵指標提取。

**失敗時：** 若無工件存，報告不可生。先以 `draft-project-charter` 或 `manage-backlog` 技能建章程或待辦清單。

### 步驟二：算進度指標

自可得資料算指標：

**敏捷指標**（自 BACKLOG.md / SPRINT-PLAN.md）：
- 速率：本衝刺完成之故事點
- 衝刺完成：已做 / 已承諾
- 待辦燃盡：總剩餘點 vs 前期
- 週期時間：自 In Progress 至 Done 之平均日數

**傳統指標**（自 WBS.md）：
- % 完成：已做之工作包 / 總工作包數
- 進度差異：計畫里程碑日 vs 實際
- 工時差異：估計工時 vs 實際耗用工時

```markdown
## 指標
| 指標 | 值 | 前期 | 趨勢 |
|--------|-------|----------|-------|
| 速率 | [N] 點 | [N] 點 | ↑/↓/→ |
| 衝刺完成 | [N]% | [N]% | ↑/↓/→ |
| 待辦剩餘 | [N] 點 | [N] 點 | ↓（佳）|
| 進度差異 | [+/-N 日] | [+/-N 日] | |
```

**預期：** 算三至五指標，附前期比較。

**失敗時：** 若無歷史資料（首次報告），略前期與趨勢欄。資料不全時，於報告尾註缺口，附建立追蹤之行動項。

### 步驟三：識阻礙、風險與問題

列活動阻礙與風險：

```markdown
## 阻礙與風險
| ID | 類 | 描述 | 嚴重度 | 負責 | 狀態 | 所需行動 |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | 風險 | [描述] | 高 | [名] | 開放 | [行動] |
| B-001 | 阻礙 | [描述] | 關鍵 | [名] | 活動 | [行動限期] |
| I-001 | 問題 | [描述] | 中 | [名] | 調查中 | [行動] |
```

對照章程之風險登錄。標示任何前未識之新風險。

**預期：** 所有活動阻礙與頂級風險皆記，附負責人與行動。

**失敗時：** 若無阻礙，明言「無活動阻礙」——勿留此節空。若阻礙無負責人，上報項目經理以派任。

### 步驟四：摘述成就與下期計畫

書兩節：

```markdown
## 本期成就
- [完成項目/里程碑附證據]
- [完成項目/里程碑附證據]
- [完成項目/里程碑附證據]

## 下期計畫
- [計畫項目/里程碑附目標]
- [計畫項目/里程碑附目標]
- [計畫項目/里程碑附目標]
```

**預期：** 三至五成就附具體證據，三至五下期計畫項目。

**失敗時：** 若無成就，報其故（受阻、重規劃、團隊不可用）。若下期計畫不明，以「計畫會議定於 [日期]」為主項。

### 步驟五：指派 RAG 指示並書報告

於四維評估項目健康：

| 維度 | 綠 | 琥珀 | 紅 |
|-----------|-------|-------|-----|
| **進度** | 合節或超前 | 落後一至二週 | 落後逾二週或里程碑錯過 |
| **範圍** | 無失控變更 | 微調範圍 | 範圍蔓延影響交付 |
| **預算** | 於計畫五 % 內 | 超計畫五至十五 % | 超計畫逾十五 % 或未追蹤 |
| **品質** | 測試通過、標準達 | 微品質問題 | 關鍵瑕疵或驗收失敗 |

書完整報告：

```markdown
# 狀態報告：[項目名]
## 報告日期：[YYYY-MM-DD]
## 報告期：[起] 至 [止]
## 文件 ID：SR-[PROJECT]-[YYYY-MM-DD]

### 整體健康
| 維度 | 狀態 | 註 |
|-----------|--------|-------|
| 進度 | 🟢/🟡/🔴 | [一行說明] |
| 範圍 | 🟢/🟡/🔴 | [一行說明] |
| 預算 | 🟢/🟡/🔴 | [一行說明] |
| 品質 | 🟢/🟡/🔴 | [一行說明] |

### 執行摘要
[二至三句：整體狀態、關鍵成就、最大風險]

### 指標
[自步驟二]

### 成就
[自步驟四]

### 阻礙與風險
[自步驟三]

### 下期計畫
[自步驟四]

### 所需決策
- [決策一——限期、來自何人]

---
*報告由：[名/代理]*
```

存為 `STATUS-REPORT-[YYYY-MM-DD].md`。

**預期：** 完整狀態報告存，附 RAG 指示、指標與敘述。

**失敗時：** 若資料不足以作 RAG 評估，用 ⚪（灰）示「資料不足」，並列下次報告所需之資料。

## 驗證

- [ ] 狀態報告檔建立，檔名附正確日期戳
- [ ] 四維度皆指派 RAG 指示附理由
- [ ] 自項目工件至少算三指標
- [ ] 阻礙節存（即使「無活動阻礙」）
- [ ] 成就列附證據
- [ ] 下期計畫納入
- [ ] 執行摘要為二至三句，非一段
- [ ] 每阻礙與風險有負責人、行動與限期

## 常見陷阱

- **無資料之報告**：狀態報告須以證據為基。每主張應參考工件或指標。
- **永遠全綠**：無證據之持續綠 RAG 示報告不誠實。質疑綠評估。
- **阻礙無負責**：每阻礙須有負責人與行動。無主之阻礙不得解決。
- **指標無情境**：「速率 = 18」無較不達意。永納入前期或目標。
- **過長**：狀態報告應可二分鐘內掃讀。宜一至二頁。
- **漏決策節**：若項目需利害關係人決策，明列附限期。
- **陳舊資料**：用過時工件致誤報。驗工件日配合報告期。
- **缺趨勢資料**：首次報告不能示趨勢，然後續報告須較前期。

## 相關技能

- `draft-project-charter` — 章程提供里程碑與成功標準以追蹤狀態
- `manage-backlog` — 待辦指標饋狀態報告
- `plan-sprint` — 衝刺結果提供速率與完成資料
- `create-work-breakdown-structure` — WBS 完成驅動傳統進度指標
- `conduct-retrospective` — 狀態報告資料饋回顧
