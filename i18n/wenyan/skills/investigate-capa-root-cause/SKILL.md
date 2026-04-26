---
name: investigate-capa-root-cause
locale: wenyan
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

為合規偏差行結構化根因之察，發效糾正與預防之行。

## 用時

- 審計之發現需 CAPA
- 已驗證系統生偏或事件
- 法規察之觀察需正式應
- 數據完整性之異常需察
- 屢發之疑示系統性根因

## 入

- **必要**：偏、發現、或事件之述
- **必要**：嚴重度分類（嚴、重、輕）
- **必要**：審計或察中所集之證
- **可選**：先前相關之 CAPA 或察
- **可選**：相關 SOP、驗證文件、系統日誌
- **可選**：涉員訪談筆記

## 法

### 第一步：啟察

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

**得：**察啟，具清之問題述與含控之行；嚴重發現於 24 小時內。
**敗則：**若含控不可立施，升至 QA 總監，並記延含控之險。

### 第二步：擇察之法

依問題之複擇法：

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

**得：**所擇之法配問題之複——勿為簡程序之訛用故障樹，勿為複雜系統敗用 5-Why。
**敗則：**若首法未至可信之根因，施二法。諸法所得之合固結論。

### 第三步：行根因析

#### 甲：5-Why 析

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

#### 乙：魚骨（Ishikawa）圖

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

**得：**根因析至基本之因（非僅症狀），每步有證為支。
**敗則：**若析僅得症狀（「用者誤」），深推之。問：「彼何以能誤？何控當阻之？」

### 第四步：設糾正與預防之行

明別糾正、糾正行、預防行：

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

**得：**每 CAPA 行溯至具體根因，具可量成功準則，含有效性驗之計。
**敗則：**若成功準則曖（「改合規」），重書之以具體可量（「六連月審計軌配置變動於變更控制外為零」）。

### 第五步：驗有效

CAPA 施後，驗行果真奏效：

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

**得：**有效性驗示根因果真除，非僅行已成。
**敗則：**若驗示 CAPA 無效，重啟察並發修訂之行。勿閉無效之 CAPA。

### 第六步：析 CAPA 之勢

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

**得：**勢之析辨個 CAPA 所遺之系統性問。
**敗則：**若趨勢示屢發之根因雖有 CAPA 而仍在，則 CAPA 治症。升至管理層審以行系統性介入。

## 驗

- [ ] 察於所需時限內啟（嚴 24 小時、重 72 小時）
- [ ] 問題述事實而不歸咎
- [ ] 察之法配問題之複
- [ ] 根因析至基本之因（非僅症狀）
- [ ] 每根因步有證為支
- [ ] CAPA 別糾正、糾正行、預防行
- [ ] 每 CAPA 具可量成功準則與驗計
- [ ] CAPA 閉前以證驗有效
- [ ] 勢之析至少每季審之

## 陷

- **止於症狀**：「用者誤」非根因。根因乃何以系統或流程容此誤
- **CAPA = 重訓**：重訓僅治一可能根因（知識）。若真根因為系統設計之瑕或 SOP 之曖，重訓不阻再發
- **閉而未驗**：行已成不同於驗其效。閉而未驗有效之 CAPA 乃法規引述之患
- **歸咎式察**：究何人誤而非何事容誤之察，毀質之文化，阻報告
- **無趨勢**：個 CAPA 或似無關，然趨勢常揭系統性問（如多系統之「訓練」根因或示訓練計畫之破）

## 參

- `conduct-gxp-audit` — 審計生需 CAPA 之發現
- `monitor-data-integrity` — 監測察觸發察之異常
- `manage-change-control` — CAPA 驅之改歷變更控制
- `prepare-inspection-readiness` — 開而逾期之 CAPA 為察之首要目標
- `design-training-program` — 根因若與訓相關，改訓練計畫
