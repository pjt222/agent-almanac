---
name: monitor-data-integrity
description: >
  ALCOA+原則に基づいたデータ整合性モニタリングプログラムを設計・運用します。
  探知管理、監査証跡レビュースケジュール、異常検知パターン（時間外活動、連続的な変更、
  一括変更）、メトリクスダッシュボード、調査トリガー、エスカレーションマトリクスの定義を
  対象とします。GxPシステムのデータ整合性モニタリングプログラムの確立、データ整合性が
  焦点となる査察の準備、データ整合性インシデント後の強化モニタリングの実施、または
  MHRA、WHO、PIC/Sガイダンスの実装時に使用します。
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
  complexity: advanced
  language: multi
  tags: gxp, data-integrity, alcoa, monitoring, anomaly-detection, compliance
---

# データ整合性のモニタリング

ALCOA+原則と異常検知を使用して、バリデートされたシステム全体のデータ整合性を継続的にモニタリングするプログラムを設計・運用します。

## 使用タイミング

- GxPシステムのデータ整合性モニタリングプログラムの確立時
- データ整合性が焦点となる規制査察の準備時
- データ整合性インシデント後の強化モニタリングの実施時
- 既存のデータ整合性管理の定期的なレビュー時
- MHRAデータ整合性ガイダンス、WHO TRS 996、またはPIC/S PI 041の実装時

## 入力

- **必須**: スコープ内のシステムとそのALCOA+リスクプロファイル
- **必須**: 適用ガイダンス（MHRA データ整合性、WHO TRS 996、PIC/S PI 041）
- **必須**: 各システムの現在の監査証跡機能
- **任意**: 以前のデータ整合性所見または規制観察事項
- **任意**: 既存のモニタリング手順またはメトリクス
- **任意**: ユーザーアクセスマトリクスと役割定義

## 手順

### ステップ1: 現在のALCOA+態勢の評価

すべてのALCOA+原則に対して各システムを評価します:

```markdown
# Data Integrity Assessment
## Document ID: DIA-[SITE]-[YYYY]-[NNN]

### ALCOA+ Assessment Matrix

| Principle | Definition | Assessment Questions | System 1 | System 2 |
|-----------|-----------|---------------------|----------|----------|
| **Attributable** | Who performed the action and when? | Are all entries linked to unique user IDs? Is the timestamp system-generated? | G/A/R | G/A/R |
| **Legible** | Can data be read and understood? | Are records readable throughout retention period? Are formats controlled? | G/A/R | G/A/R |
| **Contemporaneous** | Was data recorded at the time of the activity? | Are timestamps real-time? Are backdated entries detectable? | G/A/R | G/A/R |
| **Original** | Is this the first-captured data? | Are original records preserved? Is there a clear original vs copy distinction? | G/A/R | G/A/R |
| **Accurate** | Is the data correct and truthful? | Are calculations verified? Are transcription errors detectable? | G/A/R | G/A/R |
| **Complete** | Is all data present? | Are deletions detectable? Are all expected records present? | G/A/R | G/A/R |
| **Consistent** | Are data elements consistent across records? | Do timestamps follow logical sequence? Are versions consistent? | G/A/R | G/A/R |
| **Enduring** | Will data survive for the required retention period? | Is the storage medium reliable? Are backups verified? | G/A/R | G/A/R |
| **Available** | Can data be accessed when needed? | Are retrieval procedures documented? Are access controls appropriate? | G/A/R | G/A/R |

Rating: G = Good (controls adequate), A = Adequate (minor improvements needed), R = Remediation required
```

**期待結果：** すべてのシステムに各原則ごとの特定の所見を含む評価済みのALCOA+アセスメントがあること。
**失敗時：** システムを評価できない場合（例：監査証跡機能なし）は、即時の是正措置が必要な重大なギャップとしてフラグします。

### ステップ2: 探知管理の設計

データ整合性違反を検知するモニタリング活動を定義します:

```markdown
# Detective Controls Design
## Document ID: DCD-[SITE]-[YYYY]-[NNN]

### Audit Trail Review Schedule
| System | Review Type | Frequency | Reviewer | Scope |
|--------|-----------|-----------|----------|-------|
| LIMS | Comprehensive | Monthly | QA | All data modifications, deletions, and access events |
| ERP | Targeted | Weekly | QA | Batch record modifications and approvals |
| R/Shiny | Comprehensive | Per analysis | Statistician | All input/output/parameter changes |

### Review Checklist
For each audit trail review cycle:
- [ ] All data modifications have documented justification
- [ ] No unexplained deletions or void entries
- [ ] Timestamps are sequential and consistent with business operations
- [ ] No off-hours activity without documented justification
- [ ] No shared account usage detected
- [ ] Failed login attempts are within normal thresholds
- [ ] No privilege escalation events outside change control
```

**期待結果：** 探知管理がスケジュールされ、割り当てられ、明確なレビュー基準とともに文書化されていること。
**失敗時：** 監査証跡レビューがスケジュール通りに実行されない場合は、ギャップを文書化し、QA管理にエスカレートします。見逃したレビューはリスクを蓄積します。

### ステップ3: 異常検知パターンの定義

調査をトリガーする特定のパターンを作成します:

```markdown
# Anomaly Detection Patterns

### Pattern 1: Off-Hours Activity
**Trigger:** Data creation, modification, or deletion outside business hours (defined as [06:00-20:00 local time, Monday-Friday])
**Threshold:** Any GxP-critical data modification outside defined hours
**Response:** Verify with user and supervisor within 2 business days
**Exceptions:** Documented shift work, approved overtime, automated processes

### Pattern 2: Sequential Modifications
**Trigger:** Multiple modifications to the same record within a short timeframe
**Threshold:** >3 modifications to the same record within 60 minutes
**Response:** Review modification reasons; verify each change has documented justification
**Exceptions:** Initial data entry corrections within [grace period, e.g., 30 minutes]

### Pattern 3: Bulk Changes
**Trigger:** Unusually high volume of data modifications by a single user
**Threshold:** >50 modifications per user per day (baseline: [calculate from normal usage])
**Response:** Verify business justification for bulk activity
**Exceptions:** Documented batch operations, data migration activities under change control

### Pattern 4: Delete/Void Spikes
**Trigger:** Unusual number of record deletions or voidings
**Threshold:** >5 delete/void events per user per week
**Response:** Immediate QA review of deleted/voided records
**Exceptions:** None — all delete/void events require documented justification

### Pattern 5: Privilege Escalation
**Trigger:** User access changes granting administrative or elevated privileges
**Threshold:** Any privilege change outside the user access management SOP
**Response:** Verify with IT security and system owner within 24 hours
**Exceptions:** Emergency access per documented emergency access procedure

### Pattern 6: Audit Trail Gaps
**Trigger:** Missing or interrupted audit trail entries
**Threshold:** Any gap > 0 entries (audit trail should be continuous)
**Response:** Immediate investigation — potential system malfunction or tampering
**Exceptions:** None — audit trail gaps are always critical
```

**期待結果：** パターンが具体的で測定可能で、定義された閾値と対応手順を持ち実行可能であること。
**失敗時：** 閾値が低すぎる場合（過剰な誤検知）は、ベースラインデータに基づいて調整します。高すぎる場合（本物の問題を見逃す）は、最初のモニタリングサイクル後に厳格化します。

### ステップ4: メトリクスダッシュボードの構築

```markdown
# Data Integrity Metrics Dashboard
## Document ID: DIMD-[SITE]-[YYYY]-[NNN]

### Key Performance Indicators

| KPI | Metric | Target | Yellow Threshold | Red Threshold | Source |
|-----|--------|--------|-----------------|---------------|--------|
| DI-01 | Audit trail review completion rate | 100% | <95% | <90% | Review log |
| DI-02 | Anomalies detected per month | Trending down | >10% increase MoM | >25% increase MoM | Anomaly log |
| DI-03 | Anomaly investigation closure rate | <15 business days | >15 days | >30 days | Investigation log |
| DI-04 | Open data integrity CAPAs | 0 overdue | 1-2 overdue | >2 overdue | CAPA tracker |
| DI-05 | Shared account instances detected | 0 | 1-2 | >2 | Access review |
| DI-06 | Unauthorised access attempts | <5/month | 5-10/month | >10/month | System logs |
| DI-07 | Audit trail gap events | 0 | N/A | >0 (always red) | System monitoring |

### Reporting Cadence
| Report | Frequency | Audience | Owner |
|--------|-----------|----------|-------|
| DI Metrics Summary | Monthly | QA Director, System Owners | QA Analyst |
| DI Trend Report | Quarterly | Quality Council | QA Manager |
| DI Annual Review | Annual | Site Director | QA Director |
```

**期待結果：** ダッシュボードが明確なエスカレーショントリガーを持つ一目で把握できるコンプライアンスステータスを提供すること。
**失敗時：** データソースが自動メトリクスをサポートできない場合は、手動収集を実装し、自動化の計画を文書化します。

### ステップ5: 調査トリガーとエスカレーションの確立

```markdown
# Investigation and Escalation Matrix

### Investigation Triggers
| Trigger | Severity | Response Time | Investigator |
|---------|----------|---------------|-------------|
| Audit trail gap detected | Critical | Immediate (within 4 hours) | IT + QA |
| Confirmed data falsification | Critical | Immediate (within 4 hours) | QA Director |
| Anomaly pattern confirmed after review | Major | Within 5 business days | QA Analyst |
| Repeated anomalies from same user | Major | Within 5 business days | QA + HR |
| Overdue audit trail review | Minor | Within 10 business days | QA Manager |

### Escalation Path
| Level | Escalated To | When |
|-------|-------------|------|
| 1 | System Owner | Any confirmed anomaly |
| 2 | QA Director | Major or critical finding |
| 3 | Site Director | Critical finding or potential regulatory impact |
| 4 | Regulatory Affairs | Confirmed data integrity failure requiring regulatory notification |
```

**期待結果：** すべての調査に定義された重大度、タイムライン、エスカレーションパスがあること。
**失敗時：** 調査が定義されたタイムライン内に完了しない場合は、次のレベルにエスカレートします。

### ステップ6: モニタリング計画の作成

すべてのコンポーネントをマスターデータ整合性モニタリング計画にまとめます:

```markdown
# Data Integrity Monitoring Plan
## Document ID: DI-MONITORING-PLAN-[SITE]-[YYYY]-[NNN]

### 1. Purpose and Scope
[From assessment scope]

### 2. ALCOA+ Assessment Summary
[From Step 1]

### 3. Detective Controls
[From Step 2]

### 4. Anomaly Detection Rules
[From Step 3]

### 5. Metrics and Reporting
[From Step 4]

### 6. Investigation and Escalation
[From Step 5]

### 7. Periodic Review
- Monitoring plan review: Annual
- Anomaly thresholds: Adjust after each quarterly review
- ALCOA+ re-assessment: When systems change or new systems are added

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Director | | | |
| IT Director | | | |
| Site Director | | | |
```

**期待結果：** 完全なデータ整合性モニタリングプログラムを定義する単一の承認された文書。
**失敗時：** 計画が1つの文書には大きすぎる場合は、システム固有のモニタリング手順への参照を含むマスタープランを作成します。

## バリデーション

- [ ] スコープ内のすべてのシステムでALCOA+アセスメントが完了している
- [ ] 監査証跡レビュースケジュールが頻度、スコープ、担当レビュアーとともに定義されている
- [ ] 少なくとも5つの異常検知パターンが特定の閾値とともに定義されている
- [ ] メトリクスダッシュボードに緑/黄/赤の閾値を持つKPIがある
- [ ] 調査トリガーが重大度と対応タイムラインとともに定義されている
- [ ] エスカレーションマトリクスが重大な所見について規制部門まで到達する
- [ ] モニタリング計画がQAとITリーダーシップに承認されている
- [ ] 定期レビュースケジュールが確立されている

## よくある落とし穴

- **アクションなしのモニタリング**: メトリクスを収集しながら異常を調査しないことは偽りの安心感を提供し、モニタリングなしよりも悪い（無視された所見の証拠を生成する）
- **静的な閾値**: 推測に基づいた閾値はベースラインデータに基づいたものではなく過剰な誤検知を生成し、アラート疲れにつながる
- **チェックボックスとしての監査証跡レビュー**: 何を探すかを理解せずに監査証跡をレビューすることは非効果的。異常検知パターンについてレビュアーをトレーニングすること
- **システムの制限を無視する**: 一部のシステムは監査証跡機能が貧弱。制限が存在しないふりをするのではなく、制限を文書化して補完管理を実施すること
- **トレンド分析なし**: 個々の異常は軽微に見えるかもしれないが、時間またはユーザーをまたいだパターンが系統的な問題を明らかにする。データ整合性メトリクスを常にトレンド分析すること

## 関連スキル

- `design-compliance-architecture` — データ整合性モニタリングが必要なシステムを特定する
- `implement-audit-trail` — モニタリングが依拠する技術的基盤
- `investigate-capa-root-cause` — モニタリングが正式な調査を必要とする問題を検出した場合
- `conduct-gxp-audit` — 監査でモニタリングプログラムの有効性を評価する
- `prepare-inspection-readiness` — データ整合性は主要な規制査察の焦点エリア
