---
name: manage-change-control
description: >
  バリデートされたコンピューター化システムの変更管理を実施します。変更要求のトリアージ
  （緊急、標準、軽微）、バリデート済み状態への影響評価、再バリデーションスコープの決定、
  承認ワークフロー、実装追跡、変更後の検証を対象とします。バリデート済みシステムのソフトウェア
  アップグレード、パッチ、または設定変更が必要な場合、インフラ変更がバリデート済みシステムに
  影響する場合、CAPAがシステム変更を必要とする場合、または緊急変更に迅速な承認と
  遡及的な文書化が必要な場合に使用します。
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
  tags: gxp, change-control, revalidation, impact-assessment, compliance
---

# 変更管理の実施

バリデート済み状態を維持しながら、バリデートされたコンピューター化システムへの変更を評価、承認、実装、検証します。

## 使用タイミング

- バリデート済みシステムのソフトウェアアップグレード、パッチ、または設定変更が必要な場合
- インフラの変更（サーバー移行、OSアップグレード、ネットワーク変更）がバリデート済みシステムに影響する場合
- CAPAや監査所見がシステム変更を必要とする場合
- ビジネスプロセスの変更がシステムの再設定を必要とする場合
- 緊急変更に迅速な承認と遡及的な文書化が必要な場合

## 入力

- **必須**: 変更の説明（何が変更され、なぜ変更されるか）
- **必須**: 影響を受けるシステムと現在のバリデート済み状態
- **必須**: 変更要求者とビジネス上の正当性
- **任意**: ベンダーのリリースノートまたは技術文書
- **任意**: 関連するCAPAまたは監査所見への参照
- **任意**: 影響を受けるシステムの既存バリデーション文書

## 手順

### ステップ1: 変更要求の作成と分類

```markdown
# Change Request
## Document ID: CR-[SYS]-[YYYY]-[NNN]

### 1. Change Description
**Requestor:** [Name, Department]
**Date:** [YYYY-MM-DD]
**System:** [System name and version]
**Current State:** [Current configuration/version]
**Proposed State:** [Target configuration/version]

### 2. Justification
[Business, regulatory, or technical reason for the change]

### 3. Classification
| Type | Definition | Approval Path | Timeline |
|------|-----------|--------------|----------|
| **Emergency** | Urgent fix for safety, data integrity, or regulatory compliance | System owner + QA (retrospective CCB) | Implement immediately, document within 5 days |
| **Standard** | Planned change with potential impact on validated state | CCB approval before implementation | Per CCB schedule |
| **Minor** | Low-risk change with no impact on validated state | System owner approval | Documented before implementation |

**This change is classified as:** [Emergency / Standard / Minor]
**Rationale:** [Why this classification]
```

**期待結果：** 変更要求に一意のID、明確な説明、正当化された分類があること。
**失敗時：** 分類が争われた場合は、標準としてデフォルト設定し、CCBに裁定させます。

### ステップ2: 影響評価の実施

バリデート済み状態のすべての側面に対して変更を評価します:

```markdown
# Impact Assessment
## Change Request: CR-[SYS]-[YYYY]-[NNN]

### Impact Matrix
| Dimension | Affected? | Details | Risk |
|-----------|-----------|---------|------|
| Software configuration | Yes/No | [Specific parameters changing] | [H/M/L] |
| Source code | Yes/No | [Modules, functions, or scripts affected] | [H/M/L] |
| Database schema | Yes/No | [Tables, fields, constraints changing] | [H/M/L] |
| Infrastructure | Yes/No | [Servers, network, storage affected] | [H/M/L] |
| Interfaces | Yes/No | [Upstream/downstream system connections] | [H/M/L] |
| User access/roles | Yes/No | [Role changes, new access requirements] | [H/M/L] |
| SOPs/work instructions | Yes/No | [Procedures requiring update] | [H/M/L] |
| Training | Yes/No | [Users requiring retraining] | [H/M/L] |
| Data migration | Yes/No | [Data transformation or migration needed] | [H/M/L] |
| Audit trail | Yes/No | [Impact on audit trail continuity] | [H/M/L] |

### Regulatory Impact
- [ ] Change affects 21 CFR Part 11 controls
- [ ] Change affects EU Annex 11 controls
- [ ] Change affects data integrity (ALCOA+)
- [ ] Change requires regulatory notification
```

**期待結果：** すべての側面が明確なyes/noと根拠で評価されていること。
**失敗時：** テストなしでは影響を判断できない場合は、その側面を「不明 — 調査が必要」と分類し、本番変更前にサンドボックス評価を義務化します。

### ステップ3: 再バリデーションスコープの決定

影響評価に基づいて、必要なバリデーション活動を定義します:

```markdown
# Revalidation Determination

| Revalidation Level | Criteria | Activities Required |
|--------------------|----------|-------------------|
| **Full revalidation** | Core functionality changed, new GAMP category, or major version upgrade | URS review, RA update, IQ, OQ, PQ, TM update, VSR |
| **Partial revalidation** | Specific functions affected, configuration changes | Targeted OQ for affected functions, TM update |
| **Documentation only** | No functional impact, administrative changes | Update validation documents, change log entry |
| **None** | No impact on validated state (e.g., cosmetic change) | Change log entry only |

### Determination for CR-[SYS]-[YYYY]-[NNN]
**Revalidation level:** [Full / Partial / Documentation only / None]
**Rationale:** [Specific reasoning based on impact assessment]

### Required Activities
| Activity | Owner | Deadline |
|----------|-------|----------|
| [e.g., Execute OQ test cases TC-OQ-015 through TC-OQ-022] | [Name] | [Date] |
| [e.g., Update traceability matrix for URS-007] | [Name] | [Date] |
| [e.g., Update SOP-LIMS-003 section 4.2] | [Name] | [Date] |
```

**期待結果：** 再バリデーションスコープが変更の影響に比例していること — 過不足なく。
**失敗時：** 再バリデーションスコープが争われた場合は、より多くのテストを選択します。過少バリデーションは規制リスクであり、過剰バリデーションはリソースコストにすぎません。

### ステップ4: 承認の取得

適切な承認ワークフローに変更をルーティングします:

```markdown
# Change Approval

### Approval for: CR-[SYS]-[YYYY]-[NNN]

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| System Owner | | Approve / Reject / Defer | | |
| QA Representative | | Approve / Reject / Defer | | |
| IT Representative | | Approve / Reject / Defer | | |
| Validation Lead | | Approve / Reject / Defer | | |

### Conditions (if any)
[Any conditions attached to the approval]

### Planned Implementation Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Rollback deadline:** [Point of no return]
```

**期待結果：** 実装開始前にすべての必要な承認者が署名していること（緊急変更を除く）。
**失敗時：** 緊急変更については、システムオーナーとQAから口頭承認を取得し、変更を実装し、5営業日以内に正式な文書化を完了します。

### ステップ5: 実装と検証

変更を実行し、変更後の検証を実施します:

```markdown
# Implementation Record

### Pre-Implementation
- [ ] Backup of current system state completed
- [ ] Rollback procedure documented and tested
- [ ] Affected users notified
- [ ] Test environment validated (if applicable)

### Implementation
- **Implemented by:** [Name]
- **Date/Time:** [YYYY-MM-DD HH:MM]
- **Steps performed:** [Detailed implementation steps]
- **Deviations from plan:** [None / Description]

### Post-Change Verification
| Verification | Result | Evidence |
|--------------|--------|----------|
| System accessible and functional | Pass/Fail | [Screenshot/log reference] |
| Changed functionality works as specified | Pass/Fail | [Test case reference] |
| Unchanged functionality unaffected (regression) | Pass/Fail | [Test case reference] |
| Audit trail continuity maintained | Pass/Fail | [Audit trail screenshot] |
| User access controls intact | Pass/Fail | [Access review reference] |

### Closure
- [ ] All verification activities completed successfully
- [ ] Validation documents updated per revalidation determination
- [ ] SOPs updated and effective
- [ ] Training completed for affected users
- [ ] Change record closed in change control system
```

**期待結果：** 実装が承認された計画と一致し、すべての検証活動がパスすること。
**失敗時：** 検証が失敗した場合は、ロールバック手順を即座に実行し、失敗を逸脱として文書化します。QAの同意なしに進めないでください。

## バリデーション

- [ ] 変更要求に一意のID、説明、分類がある
- [ ] 影響評価がすべての側面（ソフトウェア、データ、インフラ、SOP、トレーニング）を対象としている
- [ ] 再バリデーションスコープが根拠とともに定義されている
- [ ] 実装前に必要なすべての承認が取得されている（または緊急の場合は5日以内）
- [ ] 実装前のバックアップとロールバック手順が文書化されている
- [ ] 変更後の検証で変更が機能し、他は破損していないことが実証されている
- [ ] バリデーション文書が変更を反映して更新されている
- [ ] 変更記録が正式にクローズされている

## よくある落とし穴

- **「小さな」変更の影響評価スキップ**: 軽微な変更でも予期せぬ影響が生じる可能性がある。無害に見える設定トグルが監査証跡を無効化したり計算を変更したりする可能性がある
- **緊急変更の乱用**: 変更の10%以上が「緊急」に分類される場合、変更プロセスが回避されている。緊急基準を見直して厳格化すること
- **不完全なロールバック計画**: ロールバックを「バックアップを復元するだけ」と仮定するのは、バックアップとロールバックの間に作成されたデータを無視している。すべてのロールバックシナリオでデータの処理を定義すること
- **実装後の承認**: 遡及的承認（文書化された緊急事態を除く）はコンプライアンス違反。CCBは作業開始前に承認しなければならない
- **リグレッションテストの欠如**: 変更された機能のみを検証するのは不十分。リグレッションテストで既存のバリデート済み機能が影響を受けていないことを確認しなければならない

## 関連スキル

- `design-compliance-architecture` — 変更管理委員会を含むガバナンスフレームワークを定義する
- `write-validation-documentation` — 変更によってトリガーされる再バリデーション文書を作成する
- `perform-csv-assessment` — 完全な再バリデーションを必要とする重大な変更のための完全なCSV再評価
- `write-standard-operating-procedure` — 変更によって影響を受けるSOPを更新する
- `investigate-capa-root-cause` — 変更がCAPAによってトリガーされる場合
