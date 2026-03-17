---
name: generate-status-report
description: >
  既存の成果物（憲章、バックログ、スプリント計画、WBS）を読み取り、
  メトリクスを計算し、ブロッカーを特定し、スケジュール・スコープ・予算・品質の
  RAGインジケーターを使って進捗を要約することでプロジェクトステータスレポートを
  生成します。スプリントまたは報告期間の終了時、ステークホルダーが健全性の
  更新を求める場合、ステアリングコミッティまたはガバナンス会議の前、
  または新しいブロッカーやリスクがプロジェクト途中で発生した時に使用します。
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
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
---

# プロジェクトステータスレポートの生成

プロジェクト成果物を分析し、進捗メトリクスを計算し、RAG（赤/黄/緑）の健全性インジケーターを使って達成事項、ブロッカー、および今後の作業をまとめた定期的なステータスレポートを作成します。

## 使用タイミング

- スプリントまたは報告期間の終了時（週次、隔週、月次）
- プロジェクトの健全性更新を求めるステークホルダーのリクエスト時
- ステアリングコミッティまたはガバナンス会議の前
- プロジェクトの健全性インジケーターが変化した時（例：新しいブロッカーやリスクが発生）
- 憲章マイルストーンに対する定期的なチェックポイント

## 入力

- **必須**: 報告期間（開始日、終了日）
- **必須**: 少なくとも1つのプロジェクト成果物（BACKLOG.md、SPRINT-PLAN.md、WBS.md、またはPROJECT-CHARTER.md）
- **任意**: 前回のステータスレポート（トレンド比較のため）
- **任意**: 予算またはリソースの追跡データ
- **任意**: リスク登録簿の更新

## 手順

### ステップ1: 既存の成果物を読み取る

PM成果物のプロジェクトディレクトリをスキャンします:
- PROJECT-CHARTER.md — マイルストーン、成功基準
- BACKLOG.md — ステータス別アイテム数、バーンダウンデータ
- SPRINT-PLAN.md — スプリントゴール、コミットしたアイテム、タスク完了
- WBS.md — ワークパッケージの完了率
- 前回の STATUS-REPORT-*.md ファイル — トレンドデータ

利用可能なファイルを読み取ります。すべてが存在するわけではありません — 利用可能なデータにレポートを適応させます。

**期待結果：** 少なくとも1つの成果物が正常に読み取られ、主要メトリクスが抽出されている。

**失敗時：** 成果物が存在しない場合、レポートを生成できません。`draft-project-charter` または `manage-backlog` スキルを使用して、まず憲章またはバックログを作成します。

### ステップ2: 進捗メトリクスを計算する

利用可能なデータからメトリクスを計算します:

**アジャイルメトリクス**（BACKLOG.md / SPRINT-PLAN.mdから）:
- ベロシティ: 今スプリントで完了したストーリーポイント
- スプリント完了率: 完了アイテム数 / コミットアイテム数
- バックログバーンダウン: 前の期間と比べた残りの合計ポイント
- サイクルタイム: In ProgressからDoneまでの平均日数

**クラシックメトリクス**（WBS.mdから）:
- 完了率: 完了したワークパッケージ / 総ワークパッケージ
- スケジュール差異: 計画されたマイルストーン日程対実際
- 工数差異: 見積もり工数対消費した実際の工数

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**期待結果：** 前の期間との比較を含む3〜5件のメトリクスが計算されている。

**失敗時：** 過去のデータが存在しない場合（最初のレポート）、PreviousとTrendの列を省略します。データが不完全な場合、追跡を確立するためのアクションアイテムとともにレポートのフッターにギャップを記録します。

### ステップ3: ブロッカー、リスク、課題を特定する

アクティブなブロッカーとリスクをリストアップします:

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

憲章のリスク登録簿と照合します。以前に特定されていない新しいリスクにフラグを立てます。

**期待結果：** すべてのアクティブなブロッカーとトップリスクがオーナーとアクションとともに文書化されている。

**失敗時：** ブロッカーが存在しない場合、「アクティブなブロッカーなし」と明示します — セクションを空にしないでください。ブロッカーにオーナーがいない場合、割り当てのためにプロジェクトマネージャーにエスカレーションします。

### ステップ4: 達成事項と次の期間の計画をまとめる

2つのセクションを書きます:

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**期待結果：** 具体的な証拠を持つ3〜5件の達成事項、次の期間の3〜5件の計画アイテム。

**失敗時：** 達成事項がない場合、その理由（ブロックされた、再計画中、チームが不在）を報告します。次の期間の計画が不明確な場合、「[日付]に計画セッションをスケジュール済み」を主要アイテムとしてリストします。

### ステップ5: RAGインジケーターを割り当てて報告書を書く

4つの次元でプロジェクトの健全性を評価します:

| 次元 | 緑 | 黄 | 赤 |
|-----------|-------|-------|-----|
| **スケジュール** | 予定通りまたは前倒し | 1〜2週間遅れ | 2週間以上遅れまたはマイルストーン未達 |
| **スコープ** | 制御されていない変更なし | 軽微なスコープ調整 | 成果物に影響するスコープクリープ |
| **予算** | 計画の5%以内 | 計画の5〜15%超過 | 計画の15%超過または未追跡 |
| **品質** | テスト合格、基準達成 | 軽微な品質問題 | 重大な欠陥または受け入れ失敗 |

完全なレポートを書きます:

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

`STATUS-REPORT-[YYYY-MM-DD].md` として保存します。

**期待結果：** RAGインジケーター、メトリクス、およびナラティブを含む完全なステータスレポートが保存されている。

**失敗時：** RAG評価に十分なデータがない場合、「不十分なデータ」を示す⚪（グレー）を使用し、次のレポートで収集が必要なデータをリストします。

## バリデーション

- [ ] ステータスレポートファイルが正しい日付スタンプ付きファイル名で作成されている
- [ ] 4つすべての次元に正当性とともにRAGインジケーターが割り当てられている
- [ ] プロジェクト成果物から少なくとも3件のメトリクスが計算されている
- [ ] ブロッカーセクションが存在している（「アクティブなブロッカーなし」でも）
- [ ] 達成事項が証拠とともにリストされている
- [ ] 次の期間の計画が含まれている
- [ ] エグゼクティブサマリーが段落ではなく2〜3文である
- [ ] すべてのブロッカーとリスクに期限付きのオーナーとアクションがある

## よくある落とし穴

- **データなしの報告**: ステータスレポートは証拠に基づく必要があります。すべての主張は成果物またはメトリクスを参照するべきです。
- **常にすべて緑**: 証拠なしに持続的な緑のRAGはレポートが正直でないことを示唆します。緑の評価に疑問を持ちます。
- **オーナーなしのブロッカー**: すべてのブロッカーにはオーナーとアクションが必要です。オーナーなしのブロッカーは解決されません。
- **コンテキストなしのメトリクス**: 「ベロシティ = 18」は比較なしでは意味がありません。常に前の期間または目標を含めます。
- **長すぎる**: ステータスレポートは2分でスキャンできるべきです。1〜2ページに収めます。
- **意思決定セクションの欠落**: プロジェクトにステークホルダーの意思決定が必要な場合、期限と共に明示します。
- **古いデータ**: 古い成果物の使用は誤解を招くレポートにつながります。成果物の日付が報告期間と一致していることを確認します。
- **欠落したトレンドデータ**: 最初のレポートはトレンドを示せませんが、後続のレポートでは前の期間と比較する必要があります。

## 関連スキル

- `draft-project-charter` — 憲章がステータス追跡のマイルストーンと成功基準を提供する
- `manage-backlog` — バックログメトリクスがステータスレポートに供給される
- `plan-sprint` — スプリント結果がベロシティと完了データを提供する
- `create-work-breakdown-structure` — WBS完了がクラシック進捗メトリクスを推進する
- `conduct-retrospective` — ステータスレポートデータが振り返りに供給される
