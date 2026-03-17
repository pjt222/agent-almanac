---
name: investigate-capa-root-cause
description: >
  コンプライアンス逸脱のための根本原因調査とCAPA（是正措置・予防措置）を管理します。
  調査手法の選択（5-Why、フィッシュボーン、フォールトツリー）、構造化された根本原因分析、
  是正措置と予防措置の設計、有効性の検証、トレンド分析を対象とします。監査所見が
  CAPAを必要とする場合、バリデート済みシステムで逸脱やインシデントが発生した場合、
  規制観察事項が正式な対応を必要とする場合、データ整合性の異常が調査を必要とする場合、
  または繰り返し発生する問題が系統的な根本原因を示唆する場合に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# CAPAの根本原因調査

コンプライアンス逸脱に対して構造化された根本原因調査を実施し、効果的な是正措置および予防措置を策定します。

## 使用タイミング

- 監査所見がCAPAを必要とする場合
- バリデート済みシステムで逸脱またはインシデントが発生した場合
- 規制査察観察事項が正式な対応を必要とする場合
- データ整合性の異常が調査を必要とする場合
- 繰り返し発生する問題が系統的な根本原因を示唆する場合

## 入力

- **必須**: 逸脱、所見、またはインシデントの説明
- **必須**: 重大度分類（重大、主要、軽微）
- **必須**: 監査または調査中に収集された証拠
- **任意**: 以前の関連するCAPAまたは調査
- **任意**: 関連するSOP、バリデーション文書、システムログ
- **任意**: 関係者のインタビューノート

## 手順

### ステップ1: 調査の開始

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

**期待結果：** 調査が重大な所見については24時間以内に明確な問題記述と封じ込め措置で開始されていること。
**失敗時：** 封じ込めをすぐに実施できない場合は、QAディレクターにエスカレートし、封じ込めの遅延リスクを文書化します。

### ステップ2: 調査手法の選択

問題の複雑さに基づいて手法を選択します:

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

**期待結果：** 選択した手法が問題の複雑さに合致していること — 単純な手続き上のエラーにフォールトツリーを使わず、複雑な系統的障害に5-Whyを使わないこと。
**失敗時：** 最初の手法で納得のいく根本原因に到達しない場合は、第2の手法を適用します。手法間の収束が結論を強化します。

### ステップ3: 根本原因分析の実施

#### オプションA: 5-Why分析

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

#### オプションB: フィッシュボーン（石川）図

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

#### オプションC: フォールトツリー分析

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

**期待結果：** 根本原因分析が各ステップに証拠を伴い、根本的な原因（症状だけでなく）に到達していること。
**失敗時：** 分析が症状のみを生成する場合（「ユーザーがエラーを犯した」）は、さらに深く掘り下げます。「なぜユーザーはそのエラーを犯すことができたのか？どの管理策が防止すべきだったのか？」と問います。

### ステップ4: 是正措置・予防措置の設計

修正、是正措置、予防措置を明確に区別します:

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

**期待結果：** すべてのCAPA措置が特定の根本原因にトレースでき、測定可能な成功基準を持ち、有効性検証計画が含まれていること。
**失敗時：** 成功基準が曖昧な場合（「コンプライアンスを改善する」）は、具体的かつ測定可能に書き直します（「6カ月連続で変更管理外での監査証跡設定変更ゼロ」）。

### ステップ5: 有効性の検証

CAPA実施後、措置が実際に機能したことを検証します:

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

**期待結果：** 有効性検証が措置が完了したことだけでなく、根本原因が実際に排除されたことを実証すること。
**失敗時：** 検証でCAPAが有効でないことが判明した場合は、調査を再開し、改訂された措置を策定します。有効でないCAPAを完了扱いにしないでください。

### ステップ6: CAPAトレンドの分析

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

**期待結果：** トレンド分析が個別のCAPAでは見逃される系統的問題を特定すること。
**失敗時：** トレンド分析でCAPAにもかかわらず根本原因が繰り返し発生していることが判明した場合は、CAPAが症状を治療しているにすぎません。系統的な介入のために経営レビューにエスカレートします。

## バリデーション

- [ ] 調査が必要なタイムライン内に開始されている（重大：24時間以内、主要：72時間以内）
- [ ] 問題記述が事実に基づき、責任を帰属させていない
- [ ] 調査手法が問題の複雑さに適切である
- [ ] 根本原因分析が根本的な原因に到達している（症状だけでなく）
- [ ] すべての根本原因ステップが証拠によって裏付けられている
- [ ] CAPAが修正、是正措置、予防措置を区別している
- [ ] 各CAPAに測定可能な成功基準と検証計画がある
- [ ] CAPA完了前に証拠をもって有効性が検証されている
- [ ] トレンド分析が少なくとも四半期ごとにレビューされている

## よくある落とし穴

- **症状で止まる**: 「ユーザーがエラーを犯した」は根本原因ではない。根本原因はシステムまたはプロセスがなぜそのエラーを可能にしたかである
- **CAPA = 再トレーニング**: 再トレーニングは一つの可能な根本原因（知識）にのみ対処する。本当の根本原因がシステム設計の欠陥または不明確なSOPである場合、再トレーニングでは再発を防止できない
- **検証なしのクローズ**: 措置を完了することは有効性を検証することとは異なる。有効性検証なしに完了したCAPAは規制引用の候補になる
- **責任追及型の調査**: 誰がエラーを犯したかではなく、何がエラーを可能にしたかに焦点を当てた調査は、品質文化を損ない報告を妨げる
- **トレンド分析なし**: 個別のCAPAは無関係に見えるかもしれないが、トレンド分析は系統的問題を明らかにすることが多い（例：複数システムにまたがる「トレーニング」根本原因は壊れたトレーニングプログラムを示している可能性がある）

## 関連スキル

- `conduct-gxp-audit` — 監査はCAPAを必要とする所見を生成する
- `monitor-data-integrity` — モニタリングは調査をトリガーする異常を検出する
- `manage-change-control` — CAPA主導の変更は変更管理を経由する
- `prepare-inspection-readiness` — オープンで期限超過のCAPAは最重要の査察対象
- `design-training-program` — 根本原因がトレーニング関連の場合はトレーニングプログラムを改善する
