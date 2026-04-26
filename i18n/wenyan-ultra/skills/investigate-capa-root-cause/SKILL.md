---
name: investigate-capa-root-cause
locale: wenyan-ultra
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

# 察 CAPA 根因

為合規偏行結構根因察並設有效糾正與預防動（CAPA）。

## 用

- 審計所識需 CAPA
- 確認系統之偏或事件
- 監管察需正式應
- 數據完整異需察
- 重現問題示系統根因

## 入

- **必**：偏、識或事件之述
- **必**：嚴重歸（臨、主、次）
- **必**：審計或察時集之證
- **可**：前相關 CAPA 或察
- **可**：相關 SOP、確認文件、系統日誌
- **可**：涉員訪談記

## 行

### 一：起察

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

得：察起，明問題述，臨識於 24 時內遏。
敗：遏不能即施→升 QA 總監並記延遏之風險。

### 二：擇察法

按問題複度擇：

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

得：法配問題複度——勿為簡程誤用故障樹，亦勿為複系統失用 5-Why。
敗：首法不達信服根因→用二法。多法收斂強結論。

### 三：行根因析

#### 甲：5-Why

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

#### 乙：魚骨（石川）圖

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

#### 丙：故障樹析

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

得：根因析達根本因（非僅症），各步有證支持。
敗：僅生症（「用者誤」）→推深。問：「用者何能造此誤？何控當阻之？」

### 四：設糾正與預防動

明辨糾、糾正動、預防動：

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

得：各 CAPA 動可追至具體根因，有可量成準，含效驗計。
敗：成準模糊（「改善合規」）→重寫為具體可量（「6 連月內無變更管制外之審計跡配置變」）。

### 五：驗效

CAPA 施後驗動實有效：

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

得：效驗示根因實除，非僅動畢。
敗：驗示 CAPA 無效→重開察並設修訂動。勿閉無效 CAPA。

### 六：析 CAPA 趨勢

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

得：趨勢析識單 CAPA 所失之系統問題。
敗：趨勢示 CAPA 仍有重現根因→CAPA 僅治症。升管理審以系統干預。

## 驗

- [ ] 察於時限內起（臨 24 時，主 72 時）
- [ ] 問題述據實無責
- [ ] 察法適問題複度
- [ ] 根因析達根本因（非僅症）
- [ ] 各根因步有證支持
- [ ] CAPA 辨糾、糾正動、預防動
- [ ] 各 CAPA 有可量成準與驗計
- [ ] 閉前以證驗效
- [ ] 至少季審趨勢

## 忌

- **止於症**：「用者誤」非根因。根因乃系統或程何容此誤
- **CAPA = 重訓**：重訓僅治一可能根因（知）。若真根因為系統設計缺或 SOP 不清→重訓不阻重現
- **未驗閉**：畢動 ≠ 驗效。未驗效之 CAPA 乃待發之監管引用
- **責向察**：聚何人誤非何容誤→損質文化、抑報
- **無趨勢**：單 CAPA 或似無關，趨勢常揭系統問題（如「訓」根因跨多系統→訓程損）

## 參

- `conduct-gxp-audit` — 審生需 CAPA 之識
- `monitor-data-integrity` — 監測異起察
- `manage-change-control` — CAPA 驅變入變更管制
- `prepare-inspection-readiness` — 開及逾期 CAPA 為監管首查
- `design-training-program` — 根因為訓相關時→改訓程
