---
name: investigate-capa-root-cause
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Investigate root causes and manage CAPAs (Corrective and Preventive Actions)
  for compliance deviations. Covers investigation method selection (5-Why,
  fishbone, fault tree), structured root cause analysis, corrective vs
  preventive action design, effectiveness verification, and trend analysis.
  Use when an audit finding requires a CAPA, when a deviation or incident
  occurs in a validated system, when a regulatory observation needs a formal
  response, when a data integrity anomaly requires investigation, or when
  recurring issues suggest a systemic root cause.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, capa, root-cause, investigation, fishbone, five-why, compliance
---

# 查 CAPA 根因

為合規偏差行結構化根因調查並發展有效之糾正與預防行動。

## 適用時機

- 審計發現需 CAPA
- 於已驗證系統中發生偏差或事件
- 法規檢查觀察需正式回應
- 數據完整異常需調查
- 屢現問題暗示系統性根因

## 輸入

- **必要**：偏差、發現或事件之描述
- **必要**：嚴重度分類（關鍵、主要、次要）
- **必要**：審計或調查中所收證據
- **選擇性**：先前相關 CAPA 或調查
- **選擇性**：相關 SOP、驗證文件與系統日誌
- **選擇性**：涉人員之訪談記

## 步驟

### 步驟一：啟調查

```markdown
# Root Cause Investigation
## Document ID: RCA-[CAPA-ID]
## CAPA Reference: CAPA-[YYYY]-[NNN]

### 1. Trigger
| Field | Value |
|-------|-------|
| Source | [Audit finding / Deviation / Inspection observation / Monitoring alert] |
| Reference | [Finding ID, deviation ID, or observation number] |
| System | [Affected system name and version] |
| Date discovered | [YYYY-MM-DD] |
| Severity | [Critical / Major / Minor] |
| Investigator | [Name, Title] |
| Investigation deadline | [Date — per severity: Critical 15 days, Major 30 days, Minor 60 days] |

### 2. Problem Statement
[Objective, factual description of what happened, what should have happened, and the gap between the two. No blame, no assumptions.]

### 3. Immediate Containment (if required)
| Action | Owner | Completed |
|--------|-------|-----------|
| [e.g., Restrict system access pending investigation] | [Name] | [Date] |
| [e.g., Quarantine affected batch records] | [Name] | [Date] |
| [e.g., Implement manual workaround] | [Name] | [Date] |
```

**預期：** 調查已啟附明問題陳述，關鍵發現之遏制行動於 24 時內。
**失敗時：** 若遏制不能立行，升至 QA 主任並記延遲遏制之險。

### 步驟二：擇調查法

依問題複雜度擇法：

```markdown
### Investigation Method Selection

| Method | Best For | Complexity | Output |
|--------|----------|-----------|--------|
| **5-Why Analysis** | Single-cause problems, straightforward failures | Low | Linear cause chain |
| **Fishbone (Ishikawa)** | Multi-factor problems, process failures | Medium | Cause-and-effect diagram |
| **Fault Tree Analysis** | System failures, safety-critical events | High | Boolean logic tree |

**Selected method:** [5-Why / Fishbone / Fault Tree / Combination]
**Rationale:** [Why this method is appropriate for this problem]
```

**預期：** 所擇法匹配問題複雜度——勿為簡程式誤用故障樹，亦勿為複系統性敗用 5-Why。
**失敗時：** 若首法未達說服之根因，用第二法。方法間之匯聚強結論。

### 步驟三：行根因分析

#### 選 A：5-Why 分析

```markdown
### 5-Why Analysis

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Why 1 | Why did [the problem] occur? | [Immediate cause] | [Evidence reference] |
| Why 2 | Why did [immediate cause] occur? | [Contributing factor] | [Evidence reference] |
| Why 3 | Why did [contributing factor] occur? | [Deeper cause] | [Evidence reference] |
| Why 4 | Why did [deeper cause] occur? | [Systemic cause] | [Evidence reference] |
| Why 5 | Why did [systemic cause] occur? | [Root cause] | [Evidence reference] |

**Root cause:** [Clear statement of the fundamental cause]
```

#### 選 B：魚骨（石川）圖

```markdown
### Fishbone Analysis

Analyse causes across six standard categories:

| Category | Potential Causes | Confirmed? | Evidence |
|----------|-----------------|------------|----------|
| **People** | Inadequate training, unfamiliarity with SOP, staffing shortage | [Y/N] | [Ref] |
| **Process** | SOP unclear, missing step, wrong sequence | [Y/N] | [Ref] |
| **Technology** | System misconfiguration, software bug, interface failure | [Y/N] | [Ref] |
| **Materials** | Incorrect input data, wrong version of reference document | [Y/N] | [Ref] |
| **Measurement** | Wrong metric, inadequate monitoring, missed threshold | [Y/N] | [Ref] |
| **Environment** | Organisational change, regulatory change, resource constraints | [Y/N] | [Ref] |

**Contributing causes:** [List confirmed causes]
**Root cause(s):** [The fundamental cause(s) — may be more than one]
```

#### 選 C：故障樹分析

```markdown
### Fault Tree Analysis

**Top event:** [The undesired event]

Level 1 (OR gate — any of these could cause the top event):
├── [Cause A]
│   Level 2 (AND gate — both needed):
│   ├── [Sub-cause A1]
│   └── [Sub-cause A2]
├── [Cause B]
│   Level 2 (OR gate):
│   ├── [Sub-cause B1]
│   └── [Sub-cause B2]
└── [Cause C]

**Minimal cut sets:** [Smallest combinations of events that cause the top event]
**Root cause(s):** [Fundamental failures identified in the tree]
```

**預期：** 根因分析達根本因（非僅症狀）附每步之支持證據。
**失敗時：** 若分析僅產症狀（「用戶誤」），深挖。問：「用戶何以能犯此誤？何控當阻之？」

### 步驟四：設計糾正與預防行動

明別於修正、糾正行動與預防行動：

```markdown
### CAPA Plan

| Category | Definition | Action | Owner | Deadline |
|----------|-----------|--------|-------|----------|
| **Correction** | Fix the immediate problem | [e.g., Re-enable audit trail for batch module] | [Name] | [Date] |
| **Corrective Action** | Eliminate the root cause | [e.g., Remove admin ability to disable audit trail; require change control for all audit trail configuration changes] | [Name] | [Date] |
| **Preventive Action** | Prevent recurrence in other areas | [e.g., Audit all systems for audit trail disable capability; add monitoring alert for audit trail configuration changes] | [Name] | [Date] |

### CAPA Details

**CAPA-[YYYY]-[NNN]-CA1: [Corrective Action Title]**
- **Root cause addressed:** [Specific root cause from Step 3]
- **Action description:** [Detailed description of what will be done]
- **Success criteria:** [Measurable outcome that proves the action worked]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [When effectiveness will be verified — typically 3-6 months after implementation]

**CAPA-[YYYY]-[NNN]-PA1: [Preventive Action Title]**
- **Risk addressed:** [What recurrence or spread this prevents]
- **Action description:** [Detailed description]
- **Success criteria:** [Measurable outcome]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [Date]
```

**預期：** 每 CAPA 行動追至特定根因，具可測成功標準，並含有效性驗證計劃。
**失敗時：** 若成功標準糊（「改善合規」），改之為具體可測（「六連續月內無審計軌跡配置變於變更控制之外」）。

### 步驟五：驗有效性

CAPA 實施後，驗行動實有效：

```markdown
### Effectiveness Verification

**CAPA-[YYYY]-[NNN] — Verification Record**

| CAPA Action | Verification Date | Method | Evidence | Result |
|-------------|------------------|--------|----------|--------|
| CA1: [Action] | [Date] | [Method: audit, sampling, metric review] | [Evidence reference] | [Effective / Not Effective] |
| PA1: [Action] | [Date] | [Method] | [Evidence reference] | [Effective / Not Effective] |

### Effectiveness Criteria Check
- [ ] The original problem has not recurred since CAPA implementation
- [ ] The corrective action eliminated the root cause (evidence: [reference])
- [ ] The preventive action has been applied to similar systems/processes
- [ ] No new issues were introduced by the CAPA actions

### CAPA Closure
| Field | Value |
|-------|-------|
| Closure decision | [Closed — Effective / Closed — Not Effective / Extended] |
| Closed by | [Name, Title] |
| Closure date | [YYYY-MM-DD] |
| Next review | [If recurring, when to re-check] |
```

**預期：** 有效性驗證證根因實已除，非僅行動已成。
**失敗時：** 若驗證示 CAPA 無效，重啟調查並發展修訂之行動。勿閉無效 CAPA。

### 步驟六：析 CAPA 趨勢

```markdown
### CAPA Trend Analysis

| Period | Total CAPAs | By Source | Top 3 Root Cause Categories | Recurring? |
|--------|------------|-----------|---------------------------|------------|
| Q1 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |
| Q2 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |

### Systemic Issues
| Issue | Frequency | Systems Affected | Recommended Action |
|-------|-----------|-----------------|-------------------|
| [e.g., Training gaps] | [N occurrences in 12 months] | [Systems] | [Systemic programme improvement] |
```

**預期：** 趨勢分析識個 CAPA 所失之系統性問題。
**失敗時：** 若趨勢露 CAPA 後屢現根因，CAPA 治症。升至管理審以系統性介入。

## 驗證

- [ ] 調查於需時線內啟（關鍵 24 時、主要 72 時）
- [ ] 問題陳述為事實而不歸咎
- [ ] 調查法適問題複雜度
- [ ] 根因分析達根本因（非僅症狀）
- [ ] 每根因步以證據支
- [ ] CAPA 別修正、糾正行動與預防行動
- [ ] 每 CAPA 具可測成功標準與驗證計劃
- [ ] 有效性於 CAPA 閉前以證據驗
- [ ] 趨勢分析至少季審

## 常見陷阱

- **止於症狀**：「用戶誤」非根因。根因乃系統或程式何以容誤
- **CAPA = 再訓**：再訓僅應對一可能根因（知）。若真根因為系統設計缺或 SOP 不清，再訓不阻再發
- **未驗即閉**：成行動與驗其有效異。未驗有效之 CAPA 乃待發之法規引用
- **歸咎導向之調查**：聚於何人誤而非何容誤之調查損品質文化並阻報告
- **無趨勢**：個 CAPA 似不關，然趨勢常露系統問題（如跨多系統之「訓練」根因或示訓練計劃壞）

## 相關技能

- `conduct-gxp-audit` — 審計生需 CAPA 之發現
- `monitor-data-integrity` — 監察異常觸發調查
- `manage-change-control` — CAPA 驅之變過變更控制
- `prepare-inspection-readiness` — 開與逾期之 CAPA 為檢查首要目標
- `design-training-program` — 當根因與訓練相關，改訓練計劃
