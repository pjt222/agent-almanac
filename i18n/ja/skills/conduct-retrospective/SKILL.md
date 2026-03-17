---
name: conduct-retrospective
description: >
  ステータスレポートとベロシティメトリクスからデータを収集し、うまくいったこととを
  改善が必要なことを構造化し、オーナーと期限付きの実行可能な改善アイテムを生成する
  ことでプロジェクトまたはスプリントの振り返りを実施します。スプリントの終了時、
  プロジェクトフェーズまたはマイルストーンの後、重大なインシデントや成功の後、
  継続中プロセスの四半期レビュー時、または教訓を記録するために類似プロジェクトの
  開始前に使用します。
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
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
---

# 振り返りの実施

最近のプロジェクト実行をレビューし、うまくいったことといかなかったことを特定し、プロジェクトプロセスにフィードバックされる実行可能な改善アイテムを生成する構造化された振り返りを促進します。このスキルは、特定のアクション、オーナー、期限を持つ証拠に裏付けられた学びに生のプロジェクトデータを変換します。

## 使用タイミング

- スプリントの終了時（スプリントレトロスペクティブ）
- プロジェクトフェーズまたはマイルストーンの終了時
- 重大なインシデント、失敗、または成功の後
- 継続中のプロジェクトプロセスの四半期レビュー
- 類似プロジェクトの開始前（教訓レビュー）

## 入力

- **必須**: レビュー対象期間（スプリント番号、日付範囲、またはマイルストーン）
- **任意**: レビュー期間のステータスレポート
- **任意**: スプリントのベロシティと完了データ
- **任意**: 前回の振り返りアクション（クローズを確認するため）
- **任意**: チームのフィードバックまたはアンケート結果

## 手順

### ステップ1: 振り返りデータを収集する

レビュー期間の利用可能な成果物を読み取ります:
- 期間の STATUS-REPORT-*.md ファイル
- 計画対実際のための SPRINT-PLAN.md
- アイテムフローとサイクルタイムのための BACKLOG.md
- オープンなアクションアイテムのための前回の RETRO-*.md

主要な事実を抽出します:
- 計画対完了アイテム
- ベロシティのトレンド
- 発生したブロッカーと解決時間
- スプリントに入った未計画作業
- 前回の振り返りからのオープンなアクションアイテム

**期待結果：** 定量的メトリクス（ベロシティ、完了率、ブロッカー数）を含むデータサマリー。

**失敗時：** 成果物が存在しない場合、定性的な観察に基づいて振り返りを実施します。

### ステップ2: 「うまくいったこと」を構造化する

証拠とともに、うまくいった3〜5件のことをリストアップします:

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

成果だけでなく、継続すべきプラクティスに焦点を当てます。「デイリースタンドアップがブロッカーを可視化し続けた」は「オンタイムで納品した」より実行可能です。

**期待結果：** 証拠に裏付けられた3〜5件のポジティブな観察。

**失敗時：** うまくいったことが何もない場合、より注意深く探します — 小さな成功も重要です。少なくとも、チームは期間を完了しました。

### ステップ3: 「改善が必要なこと」を構造化する

証拠とともに、改善が必要な3〜5件のことをリストアップします:

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

具体的かつ事実に基づいてください。「見積もりがずれていた」は曖昧です。「5件中3件のアイテムが見積もりを50%超えて、8日の未計画作業を追加した」は実行可能です。

**期待結果：** 影響が記述された証拠に裏付けられた3〜5件の改善領域。

**失敗時：** チームがすべて問題なしと主張する場合、計画対実際のメトリクスを比較します — ギャップが問題を明らかにします。

### ステップ4: 改善アクションを生成する

各改善領域について、実行可能なアイテムを作成します:

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

各アクションは以下である必要があります:
- 具体的（「見積もりを改善する」ではなく「グルーミングに見積もりレビューステップを追加する」）
- 担当者付き（1人が責任を持つ）
- 期限付き（次の1〜2スプリント以内の期日）
- 検証可能（成功基準が定義されている）

**期待結果：** オーナーと期限を持つ2〜4件の改善アクション。

**失敗時：** アクションが曖昧すぎる場合、「これが完了したとどのように検証するか？」テストを適用します。

### ステップ5: 前回のアクションをレビューして報告書を書く

前回の振り返りアクションのクローズを確認します:

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

繰り返されるアイテム（3回以上の振り返りに登場する同じ問題）にフラグを立てます — これらはエスカレーションまたは別のアプローチが必要です。

完全な振り返りを書きます:

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

`RETRO-[YYYY-MM-DD].md` として保存します。

**期待結果：** アクション、証拠、および前回のアクションレビューを含む完全な振り返り文書が保存されている。

**失敗時：** 振り返りに改善アクションがない場合、変化を促していません — ステップ3を再確認します。

## バリデーション

- [ ] 振り返りファイルが日付スタンプ付きファイル名で作成されている
- [ ] 期間サマリーに定量的メトリクスが含まれている
- [ ] 「うまくいったこと」に証拠に裏付けられた3〜5件のアイテムがある
- [ ] 「改善が必要なこと」に証拠に裏付けられた3〜5件のアイテムがある
- [ ] 改善アクションにオーナー、期限、成功基準がある
- [ ] 前回の振り返りアクションがクローズについてレビューされている
- [ ] 繰り返されるアイテムにフラグが立てられている

## よくある落とし穴

- **責任の押し付け**: 振り返りはプロセスとプラクティスをレビューするものであり、人をレビューするものではありません。問題を個人的ではなく、システム的なものとして組み立てます。
- **フォローアップなしのアクション**: 振り返りの最大の失敗。常に新しいアクションを作成する前に前回のアクションをレビューします。
- **アクションが多すぎる**: 10件の曖昧なアクションより2〜4件の集中したアクションの方が良いです。チームが吸収できる変化には限界があります。
- **証拠なし**: 「見積もりが悪いと感じる」は意見です。「5件中3件のアイテムが見積もりを50%超えた」はデータです。常に証拠を添付します。
- **ポジティブなことのスキップ**: 問題だけを議論するのは士気を下げます。成功を祝うことで良いプラクティスが強化されます。

## 関連スキル

- `generate-status-report` — ステータスレポートが振り返りのデータを提供する
- `manage-backlog` — 改善アクションがバックログにフィードバックされる
- `plan-sprint` — 振り返りの学びがスプリント計画の精度を向上させる
- `draft-project-charter` — 憲章の仮定とリスクの精度を見直す
- `create-work-breakdown-structure` — WBSに対する見積もりの精度を見直す
