---
name: write-standard-operating-procedure
description: >
  GxP準拠の標準作業手順書（SOP）を作成します。規制SOPテンプレート構造（目的、スコープ、
  定義、責任、手順、参照、改訂履歴）、承認ワークフロー設計、定期レビューのスケジュール管理、
  システム使用の運用手順を対象とします。新しいバリデート済みシステムが運用手順を必要とする場合、
  既存の非公式手順を正式化する必要がある場合、監査所見で手順の欠如が指摘された場合、
  変更管理がSOP更新をトリガーする場合、または定期レビューで時代遅れの手順内容が特定された場合に
  使用します。
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
  tags: gxp, sop, procedure, documentation, compliance, quality-management
---

# 標準作業手順書の作成

規制された活動のための明確で監査可能な指示を提供するGxP準拠の標準作業手順書を作成します。

## 使用タイミング

- 新しいバリデート済みシステムが運用手順を必要とする場合
- 既存の手順をSOPフォーマットに正式化する必要がある場合
- 監査所見で手順の欠如または不十分な手順が指摘された場合
- 変更管理がSOP更新をトリガーする場合
- 定期レビューで時代遅れの手順内容が特定された場合

## 入力

- **必須**: SOPが対象とするプロセスまたはシステム
- **必須**: 規制コンテキスト（GMP、GLP、GCP、21 CFR Part 11、EU Annex 11）
- **必須**: 対象者（このSOPに従う役割）
- **任意**: 既存の非公式手順、作業指示書、またはトレーニング資料
- **任意**: この手順と連携する関連SOP
- **任意**: SOPの作成を促す監査所見または規制観察事項

## 手順

### ステップ1: 文書管理メタデータの割り当て

```markdown
# Standard Operating Procedure
## Document ID: SOP-[DEPT]-[NNN]
## Title: [Descriptive Title of the Procedure]

| Field | Value |
|-------|-------|
| Document ID | SOP-[DEPT]-[NNN] |
| Version | 1.0 |
| Effective Date | [YYYY-MM-DD] |
| Review Date | [YYYY-MM-DD + review period] |
| Department | [Department name] |
| Author | [Name, Title] |
| Reviewer | [Name, Title] |
| Approver | [Name, Title] |
| Classification | [GxP-Critical / GxP-Supporting] |
| Supersedes | [Previous SOP ID or "N/A — New"] |
```

**期待結果：** すべてのSOPが組織の文書番号付け規則に従った一意のIDを持つこと。
**失敗時：** 番号付け規則が存在しない場合は、進める前に確立します: [TYPE]-[DEPT]-[3桁の連番]

### ステップ2: 目的とスコープの記述

```markdown
### 1. Purpose
This SOP defines the procedure for [specific activity] to ensure [regulatory objective].

### 2. Scope
**In scope:**
- [System, process, or activity covered]
- [Applicable departments or roles]
- [Specific regulatory requirements addressed]

**Out of scope:**
- [Related activities covered by other SOPs — reference them]
- [Systems or departments not covered]
```

**期待結果：** 目的が1〜2文であること。スコープが境界を明確に定義していること。
**失敗時：** スコープが既存のSOPと重複する場合は、重複するセクションについて既存のSOPを参照するか、重複を排除するために両方のSOPを改訂します。

### ステップ3: 用語と略語の定義

```markdown
### 3. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available |
| CCB | Change Control Board |
| GxP | Good [Manufacturing/Laboratory/Clinical] Practice — umbrella for all regulated quality standards |
| SOP | Standard Operating Procedure |
| [Add terms specific to this SOP] | [Definition] |
```

**期待結果：** SOPで使用されるすべての略語と技術用語が定義されていること。
**失敗時：** 用語が曖昧または専門的な場合は、権威ある定義のために組織のグロッサリーまたは関連する規制ガイダンスを参照します。

### ステップ4: 責任の割り当て

```markdown
### 4. Responsibilities

| Role | Responsibilities |
|------|-----------------|
| System Owner | Ensure SOP compliance, approve changes, conduct periodic review |
| System Administrator | Execute daily operations per this SOP, report deviations |
| Quality Assurance | Review SOP for regulatory compliance, approve new versions |
| End Users | Follow procedures as written, report issues to system administrator |
| Training Coordinator | Ensure all affected personnel are trained before SOP effective date |
```

**期待結果：** 手順セクションのすべてのアクションが責任を持つ役割にトレースできること。
**失敗時：** 手順のステップに役割が割り当てられていない場合は、孤立した責任です。SOPが承認される前にオーナーを割り当てます。

### ステップ5: 手順セクションの記述

これがSOPの核心部分です。ステップごとの指示を書きます:

```markdown
### 5. Procedure

#### 5.1 [First Major Activity]
1. [Action verb] [specific instruction]. Reference: [form, system screen, tool].
2. [Action verb] [specific instruction].
   - If [condition], then [action].
   - If [alternative condition], then [alternative action].
3. [Action verb] [specific instruction].
4. Record the result in [form/system/log].

#### 5.2 [Second Major Activity]
1. [Action verb] [specific instruction].
2. Verify [specific criterion].
3. If verification fails, initiate [deviation procedure — reference SOP-XXX].

#### 5.3 Deviation Handling
1. If any step cannot be performed as written, STOP and document the deviation.
2. Notify [role] within [timeframe].
3. Complete Deviation Form [form reference].
4. Do not proceed until [role] provides disposition.
```

GxP SOPの記述ルール:
- 各ステップを行動動詞で始める（確認する、記録する、入力する、承認する、通知する）
- 訓練された操作員が解釈なしに従えるほど具体的であること
- 各パスに明確な基準を持つ判断ポイントを含める
- 正確なフォーム名、システム画面、またはツール識別子を参照する
- 承認または検証を待つ必要がある保留ポイントを含める

**期待結果：** 特定のプロセスに不慣れな訓練を受けた人でも、これらのステップを正しく実行できること。
**失敗時：** 担当の専門家が手順が曖昧だと言う場合は、詳細を追加するか、ステップをサブステップに分割します。SOPの曖昧さは繰り返しの監査所見です。

### ステップ6: 参照、添付資料、改訂履歴の追加

```markdown
### 6. References
| Document ID | Title |
|-------------|-------|
| SOP-QA-001 | Document Control |
| SOP-IT-015 | User Access Management |
| [Regulation reference] | [e.g., 21 CFR Part 11] |

### 7. Attachments
| Attachment | Description |
|-----------|-------------|
| Form-001 | [Form name and purpose] |
| Template-001 | [Template name and purpose] |

### 8. Revision History
| Version | Date | Author | Change Description |
|---------|------|--------|--------------------|
| 1.0 | [Date] | [Name] | Initial release |
```

**期待結果：** 参照されたすべての文書がユーザーにアクセス可能であり、改訂履歴がバージョン1.0から始まっていること。
**失敗時：** 参照された文書がまだ存在しない場合は、それらを作成するか参照を削除し、SOPレビューでギャップを記録します。

### ステップ7: レビューと承認のルーティング

```markdown
### Approval Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Author | [Name] | | |
| Technical Reviewer | [Name] | | |
| QA Reviewer | [Name] | | |
| Approver (Department Head) | [Name] | | |

### Training Requirement
All personnel listed in Section 4 must complete training on this SOP before the effective date. Training must be documented in the training management system.

### Periodic Review
This SOP must be reviewed at least every [2 years / annually] or when triggered by:
- Change control affecting the covered process or system
- Audit finding related to the covered process
- Regulatory guidance update affecting the covered requirements
```

**期待結果：** SOPが有効になる前に担当の専門家によってレビューされ、品質によって承認されていること。
**失敗時：** 承認ワークフローが遅延する場合は、発効日を延期しなければなりません。完了した承認なしにSOPは発効できません。

## バリデーション

- [ ] 文書IDが組織の番号付け規則に従っている
- [ ] 目的が具体的で簡潔（1〜2文）である
- [ ] スコープがスコープ内とスコープ外の境界を明確に定義している
- [ ] すべての略語と技術用語が定義されている
- [ ] 責任セクションのすべての役割が手順ステップにマッピングされている
- [ ] 手順ステップが行動動詞で始まり、解釈なしに実行できるほど具体的である
- [ ] 判断ポイントに各パスの明確な基準がある
- [ ] 逸脱処理が定義されている
- [ ] 参照されたすべての文書が存在し、アクセス可能である
- [ ] 改訂履歴がバージョン1.0から完全である
- [ ] 承認署名に著作者、レビュアー、承認者が含まれている
- [ ] 定期レビューのスケジュールが定義されている

## よくある落とし穴

- **曖昧すぎる**: 「データ品質を確保する」は手順ステップではない。「附属書Aの範囲に従ってフォーム-001の15フィールドすべてが入力されていることを確認する」が正しい
- **詳細すぎる**: 考えられるすべてのエラーのトラブルシューティングを含めると、SOPが読めなくなる。複雑なトラブルシューティングは別の作業指示書を参照すること
- **逸脱処理なし**: すべてのSOPは手順を書かれた通りに実行できない場合の対処方法を定義しなければならない。逸脱に関する沈黙は逸脱が起こり得ないことを意味する
- **トレーニング前の発効**: すべてのユーザーがトレーニングを受ける前に発効したSOPは即時のコンプライアンスギャップを生じさせる
- **放置されたSOP**: レビューされないSOPは時代遅れになり信頼性が低下する。文書管理システムでレビュー日を設定して追跡すること

## 関連スキル

- `design-compliance-architecture` — どのシステムとプロセスにSOPが必要かを特定する
- `manage-change-control` — プロセスが変更されたときにSOPの更新をトリガーする
- `design-training-program` — 新しいSOPおよび更新されたSOPをユーザーがトレーニングを受けることを確保する
- `conduct-gxp-audit` — 監査でSOPの適切性と遵守状況を評価する
- `write-validation-documentation` — SOPとバリデーション文書は承認ワークフローを共有する
