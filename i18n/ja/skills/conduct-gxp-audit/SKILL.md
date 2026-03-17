---
name: conduct-gxp-audit
description: >
  コンピューター化システムとプロセスのGxP監査を実施します。監査計画、開始ミーティング、
  証拠収集、指摘事項の分類（重大/重大/軽微）、CAPA生成、終了ミーティング、報告書作成、
  フォローアップ検証を対象とします。定期的な内部監査、サプライヤー適格性評価監査、
  査察前の準備評価、逸脱やデータ整合性懸念によって引き起こされた原因別監査、
  またはバリデートされたシステムの定期的なコンプライアンス態勢レビューに使用します。
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
  tags: gxp, audit, capa, inspection, compliance, quality-assurance
---

# GxP監査の実施

コンピューター化システム、データ整合性の実践、または規制されたプロセスのGxP監査を計画・実行します。

## 使用タイミング

- バリデートされたコンピューター化システムの定期的な内部監査
- GxP関連ソフトウェアのサプライヤー/ベンダー適格性評価監査
- 規制監査前の査察準備評価
- 逸脱、苦情、またはデータ整合性懸念による原因別監査
- バリデートされたシステムのコンプライアンス態勢の定期的なレビュー

## 入力

- **必須**: 監査スコープ（監査するシステム、プロセス、またはサイト）
- **必須**: 適用規制（21 CFR Part 11、EU Annex 11、GMP、GLP、GCP）
- **必須**: 以前の監査報告書とオープンなCAPA項目
- **任意**: システムバリデーション文書（URS、VP、IQ/OQ/PQ、トレーサビリティマトリクス）
- **任意**: SOP、トレーニング記録、変更管理ログ
- **任意**: 監査を引き起こす特定のリスク領域または懸念事項

## 手順

### ステップ1: 監査計画の策定

```markdown
# Audit Plan
## Document ID: AP-[SYS]-[YYYY]-[NNN]

### 1. Objective
[State the purpose: scheduled, for-cause, supplier qualification, pre-inspection]

### 2. Scope
- **System/Process**: [Name and version]
- **Regulations**: [21 CFR Part 11, EU Annex 11, ICH Q7, etc.]
- **Period**: [Date range of records under review]
- **Exclusions**: [Any areas explicitly out of scope]

### 3. Audit Criteria
| Area | Regulatory Reference | Key Requirements |
|------|---------------------|------------------|
| Electronic records | 21 CFR 11.10 | Controls for closed systems |
| Audit trail | 21 CFR 11.10(e) | Secure, computer-generated, time-stamped |
| Electronic signatures | 21 CFR 11.50 | Manifestation, legally binding |
| Access controls | EU Annex 11, §12 | Role-based, documented |
| Data integrity | MHRA guidance | ALCOA+ principles |
| Change control | ICH Q10 | Documented, assessed, approved |

### 4. Schedule
| Date | Time | Activity | Participants |
|------|------|----------|-------------|
| Day 1 AM | 09:00 | Opening meeting | All |
| Day 1 AM | 10:00 | Document review | Auditor + QA |
| Day 1 PM | 13:00 | System walkthrough | Auditor + IT + System Owner |
| Day 2 AM | 09:00 | Interviews + evidence collection | Auditor + Users |
| Day 2 PM | 14:00 | Finding consolidation | Auditor |
| Day 2 PM | 16:00 | Closing meeting | All |

### 5. Audit Team
| Role | Name | Responsibility |
|------|------|---------------|
| Lead Auditor | [Name] | Plan, execute, report |
| Subject Matter Expert | [Name] | Technical assessment |
| Auditee Representative | [Name] | Facilitate access and information |
```

**期待結果：** 監査計画が品質管理部門に承認され、監査の少なくとも2週間前に被監査者に通知されていること。
**失敗時：** 被監査者が必要な文書または人員を提供できない場合はスケジュールを変更します。

### ステップ2: 開始ミーティングの実施

アジェンダ:
1. 監査チームと役割の紹介
2. スコープ、スケジュール、ロジスティクスの確認
3. 指摘事項分類システムの説明（重大/主要/軽微）
4. 機密保持契約の確認
5. 被監査者の案内担当者と文書管理者の特定
6. 質疑応答

**期待結果：** 出席記録付きで開始ミーティングが文書化されていること。
**失敗時：** 主要担当者が不在の場合は、影響を受ける監査活動のスケジュールを変更します。

### ステップ3: 証拠の収集とレビュー

監査基準に照らして文書と記録をレビューします:

#### 3a. バリデーション文書のレビュー
- [ ] URSが存在し、承認されている
- [ ] バリデーション計画がシステムカテゴリーとリスクに一致している
- [ ] IQ/OQ/PQプロトコルが結果とともに実行されている
- [ ] トレーサビリティマトリクスが要件をテスト結果にリンクしている
- [ ] 逸脱が文書化され、解決されている
- [ ] バリデーション概要報告書が承認されている

#### 3b. 運用管理のレビュー
- [ ] SOPが最新で承認されている
- [ ] すべてのユーザーのトレーニング記録がコンピテンシーを実証している
- [ ] 変更管理記録が完全である（要求、評価、承認、検証）
- [ ] インシデント/逸脱報告書がSOPに従って処理されている
- [ ] 定期的なレビューがスケジュールに従って実施されている

#### 3c. データ整合性評価
- [ ] 監査証跡が有効化され、ユーザーが変更できない
- [ ] 電子署名が規制要件を満たしている
- [ ] バックアップと復旧手順が文書化され、テストされている
- [ ] アクセス管理がロールベースの権限を実施している
- [ ] データが帰属可能、判読可能、同時記録、原本、正確（ALCOA+）である

#### 3d. システム設定のレビュー
- [ ] 本番設定がバリデート済み状態と一致している
- [ ] ユーザーアカウントがレビューされ、共有アカウントなし、非アクティブアカウントが無効化されている
- [ ] システムクロックが同期され、正確である
- [ ] セキュリティパッチが承認された変更管理に従って適用されている

**期待結果：** 証拠がタイムスタンプ付きのスクリーンショット、文書のコピー、インタビューノートとして収集されていること。
**失敗時：** 「確認不能」を観察事項として記録し、理由を記録します。

### ステップ4: 指摘事項の分類

各指摘事項を重大度で分類します:

| 分類 | 定義 | 必要な対応 |
|---------------|------------|-------------------|
| **重大** | 製品品質、患者安全、またはデータ整合性に直接影響。主要な管理の系統的な失敗。 | 即時の封じ込め + 15営業日以内のCAPA |
| **主要** | GxP要件からの重大な逸脱。未修正の場合にデータ整合性に影響する可能性。 | 30営業日以内のCAPA |
| **軽微** | 手順からの孤立した逸脱。データ整合性や製品品質への直接的な影響なし。 | 60営業日以内の修正 |
| **観察事項** | 改善の機会。規制要件ではない。 | 任意 — トレンド分析のために追跡 |

各指摘事項を文書化します:

```markdown
## Finding F-[NNN]
**Classification:** [Critical / Major / Minor / Observation]
**Area:** [Audit trail / Access control / Change control / etc.]
**Reference:** [Regulatory clause, e.g., 21 CFR 11.10(e)]

**Observation:**
[Objective description of what was found]

**Evidence:**
[Document ID, screenshot reference, interview notes]

**Regulatory Expectation:**
[What the regulation requires]

**Risk:**
[Impact on data integrity, product quality, or patient safety]
```

**期待結果：** すべての指摘事項に分類、証拠、規制参照があること。
**失敗時：** 分類が争われた場合は、裁定のために監査プログラムマネージャーにエスカレートします。

### ステップ5: 終了ミーティングの実施

アジェンダ:
1. 指摘事項のサマリーを提示する（新しい指摘事項を提起してはならない）
2. 指摘事項の分類をレビューする
3. 暫定的なCAPAの期待値とタイムラインを議論する
4. 次のステップと報告書のタイムラインを確認する
5. 被監査者の協力に謝意を示す

**期待結果：** 出席記録付きで終了ミーティングが文書化されていること。被監査者が指摘事項を認める（承認≠合意）こと。
**失敗時：** 被監査者が指摘事項に異議を唱えた場合は、意見の相違を文書化し、SOPに従ってエスカレートします。

### ステップ6: 監査報告書の作成

```markdown
# Audit Report
## Document ID: AR-[SYS]-[YYYY]-[NNN]

### 1. Executive Summary
An audit of [System/Process] was conducted on [dates] against [regulations].
[N] findings were identified: [n] critical, [n] major, [n] minor, [n] observations.

### 2. Scope and Methodology
[Summarize audit plan scope, criteria, and methods used]

### 3. Findings Summary
| Finding ID | Classification | Area | Brief Description |
|-----------|---------------|------|-------------------|
| F-001 | Major | Audit trail | Audit trail disabled for batch record module |
| F-002 | Minor | Training | Two users missing annual GxP training |
| F-003 | Observation | Documentation | SOP formatting inconsistencies |

### 4. Detailed Findings
[Include full finding details from Step 4 for each finding]

### 5. Positive Observations
[Document areas of good practice observed during the audit]

### 6. Conclusion
The overall compliance status is assessed as [Satisfactory / Needs Improvement / Unsatisfactory].

### 7. Distribution
| Recipient | Role |
|-----------|------|
| [Name] | System Owner |
| [Name] | QA Director |
| [Name] | IT Manager |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Auditor | | | |
| QA Director | | | |
```

**期待結果：** 終了ミーティングから15営業日以内に報告書が発行されること。
**失敗時：** 15日を超えて遅延する場合は、ステークホルダーに通知し、理由を文書化します。

### ステップ7: CAPAの追跡と有効性の検証

指摘事項ごとにCAPAが必要な場合:

```markdown
## CAPA Tracking
| Finding ID | CAPA ID | Root Cause | Corrective Action | Due Date | Status | Effectiveness Check |
|-----------|---------|------------|-------------------|----------|--------|-------------------|
| F-001 | CAPA-2025-042 | Configuration oversight during upgrade | Enable audit trail, verify all modules | 2025-04-15 | Open | Scheduled 2025-07-15 |
| F-002 | CAPA-2025-043 | Training matrix not updated | Complete training, update tracking | 2025-05-01 | Open | Scheduled 2025-08-01 |
```

**期待結果：** CAPAが割り当てられ、追跡され、定義されたタイムラインで有効性が検証されていること。
**失敗時：** 未解決のCAPAはQA管理にエスカレートされ、次の監査サイクルでフラグが立てられます。

## バリデーション

- [ ] 監査計画が監査前に承認・通知されている
- [ ] 開始・終了ミーティングが出席記録とともに文書化されている
- [ ] 証拠がタイムスタンプとソース参照とともに収集されている
- [ ] すべての指摘事項に分類、証拠、規制参照がある
- [ ] 監査報告書が15営業日以内に発行されている
- [ ] すべての重大・主要指摘事項に期限付きのCAPAが割り当てられている
- [ ] 以前の監査CAPAが効果の検証とともに確認されている

## よくある落とし穴

- **スコープの拡大**: 正式な合意なしに実行中に監査スコープを拡大すると、不完全なカバレッジや争いが生じる
- **意見に基づく指摘事項**: 指摘事項は個人の好みではなく特定の規制要件を参照しなければならない
- **敵対的なトーン**: 監査は尋問ではなく協調的な品質改善の実践
- **良い点を無視する**: 指摘事項のみを報告し良い実践を認めないと信頼が損なわれる
- **有効性チェックなし**: 修正が実際に機能するかを確認せずにCAPAを終了することは繰り返しの規制引用になる

## 関連スキル

- `perform-csv-assessment` — URSからバリデーションサマリーまでの完全なCSVライフサイクル評価
- `setup-gxp-r-project` — バリデートされたR環境のプロジェクト構造
- `implement-audit-trail` — 電子記録の監査証跡実装
- `write-validation-documentation` — IQ/OQ/PQプロトコルと報告書の作成
- `security-audit-codebase` — セキュリティ重視のコード監査（補完的な視点）
