---
name: r-package-review
description: コード品質、アーキテクチャ、セキュリティをカバーする包括的なRパッケージ品質レビューのためのマルチエージェントチーム
lead: r-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [R, code-review, quality, package-development]
coordination: hub-and-spoke
members:
  - id: r-developer
    role: Lead
    responsibilities: レビュータスクの配分、R固有の規約（roxygen2、NAMESPACE、testthat）のチェック、最終レビューレポートの統合
  - id: code-reviewer
    role: Quality Reviewer
    responsibilities: コードスタイル、テストカバレッジ、プルリクエスト品質、一般的なベストプラクティスのレビュー
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: パッケージ構造、API設計、依存関係管理、SOLID原則、技術的負債の評価
  - id: security-analyst
    role: Security Reviewer
    responsibilities: 露出したシークレット、入力バリデーション、安全なファイル操作、依存関係の脆弱性の監査
locale: ja
source_locale: en
source_commit: 6a868d56
translator: Claude Opus 4.6
translation_date: 2026-03-13
---

# Rパッケージレビューチーム

Rパッケージの包括的な品質レビューを実施する4エージェントチーム。リード（r-developer）がコード品質、アーキテクチャ、セキュリティにわたる並列レビューを調整し、所見を統一レポートに統合する。

## 目的

Rパッケージ開発は、単一のエージェントでは同時に提供できない複数のレビュー観点から恩恵を受ける。このチームはパッケージレビューを4つの補完的な専門分野に分解する:

- **R規約**: roxygen2ドキュメント、NAMESPACEエクスポート、testthatパターン、CRANコンプライアンス
- **コード品質**: スタイルの一貫性、テストカバレッジ、エラーハンドリング、プルリクエストの衛生
- **アーキテクチャ**: パッケージ構造、APIサーフェス、依存関係グラフ、SOLIDの遵守
- **セキュリティ**: シークレットの露出、入力のサニタイゼーション、安全なevalパターン、依存関係のCVE

これらのレビューを並列に実行し結果を統合することで、チームはシーケンシャルな単一エージェントレビューよりも迅速に徹底的なフィードバックを提供する。

## チーム構成

| メンバー | エージェント | 役割 | 注力領域 |
|---|---|---|---|
| リード | `r-developer` | Lead | R規約、CRANコンプライアンス、最終統合 |
| 品質 | `code-reviewer` | Quality Reviewer | スタイル、テスト、エラーハンドリング、PR品質 |
| アーキテクチャ | `senior-software-developer` | Architecture Reviewer | 構造、API設計、依存関係、技術的負債 |
| セキュリティ | `security-analyst` | Security Reviewer | シークレット、入力バリデーション、CVE、安全なパターン |

## 調整パターン

ハブ・アンド・スポーク: r-developerリードがレビュータスクを配分し、各レビュアーが独立して作業し、リードがすべての所見を収集・統合する。

```text
            r-developer (Lead)
           /       |        \
          /        |         \
   code-reviewer   |    security-analyst
                   |
     senior-software-developer
```

**フロー:**

1. リードがパッケージ構造を分析し、レビュータスクを作成する
2. 3人のレビュアーがそれぞれの専門分野で並列に作業する
3. リードがすべての所見を収集し、統一レポートを作成する
4. リードがコンフリクトや重複する所見にフラグを立てる

## タスク分解

### フェーズ1: セットアップ（リード）
r-developerリードがパッケージを検査し、対象を絞ったタスクを作成する:

- 主要ファイルの特定: `DESCRIPTION`、`NAMESPACE`、`R/`、`tests/`、`man/`、`vignettes/`
- 各レビュアーの専門分野に範囲を限定したレビュータスクの作成
- パッケージ固有の懸念事項（Rcpp連携、Shinyコンポーネントなど）のメモ

### フェーズ2: 並列レビュー

**code-reviewer** のタスク:
- tidyverseスタイルガイドに対するコードスタイルのレビュー
- テストカバレッジとtestthatパターンのチェック
- エラーメッセージと `stop()`/`warning()` の使用の評価
- `.Rbuildignore` と開発ファイルの衛生のレビュー

**senior-software-developer** のタスク:
- パッケージAPIサーフェス（`@export` の判断）の評価
- 依存関係の重み（`Imports` vs `Suggests`）のチェック
- 内部コード構成と結合度の評価
- 不必要な複雑さや早すぎる抽象化のレビュー

**security-analyst** のタスク:
- コードとデータ内の露出したシークレットのスキャン
- `system()`、`eval()`、`source()` の使用のチェック
- ファイルI/Oのパストラバーサルリスクのレビュー
- 既知の脆弱性に対する依存関係のチェック

### フェーズ3: 統合（リード）
r-developerリードが:
- すべてのレビュアーの所見を収集する
- R固有の規約（roxygen2、NAMESPACE、CRANノート）をチェックする
- 矛盾する推奨事項を解決する
- 優先度付きレポートを作成する: critical > high > medium > low

## 設定

ツーリングがこのチームを自動作成するための機械可読な設定ブロック。

<!-- CONFIG:START -->
```yaml
team:
  name: r-package-review
  lead: r-developer
  coordination: hub-and-spoke
  members:
    - agent: r-developer
      role: Lead
      subagent_type: r-developer
    - agent: code-reviewer
      role: Quality Reviewer
      subagent_type: code-reviewer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
  tasks:
    - name: review-code-quality
      assignee: code-reviewer
      description: Review code style, test coverage, error handling, and PR hygiene
    - name: review-architecture
      assignee: senior-software-developer
      description: Evaluate package structure, API design, dependencies, and tech debt
    - name: review-security
      assignee: security-analyst
      description: Audit for secrets, input validation, safe patterns, and dependency CVEs
    - name: review-r-conventions
      assignee: r-developer
      description: Check roxygen2 docs, NAMESPACE, testthat patterns, CRAN compliance
    - name: synthesize-report
      assignee: r-developer
      description: Collect all findings and produce unified prioritized report
      blocked_by: [review-code-quality, review-architecture, review-security, review-r-conventions]
```
<!-- CONFIG:END -->

## 使用シナリオ

### シナリオ1: CRAN提出前レビュー
CRANに提出する前に、フルチームレビューを実行してすべての次元の問題を検出する:

```text
ユーザー: CRAN提出前に/path/to/mypackageのRパッケージをレビューしてください
```

チームはCRAN固有の要件（examples、\dontrun、URLの有効性）を一般的な品質、アーキテクチャ、セキュリティの懸念とともにチェックする。

### シナリオ2: プルリクエストレビュー
複数のパッケージコンポーネントに影響する重要なPR向け:

```text
ユーザー: RパッケージのPR #42をレビューしてください -- 新しいAPIエンドポイントとRcpp連携を追加します
```

チームは変更領域全体にレビューを配分し、アーキテクチャレビュアーがAPI設計に注力し、セキュリティアナリストがRcppバインディングをチェックする。

### シナリオ3: パッケージ監査
継承した、または不慣れなパッケージの徹底的な評価が必要な場合:

```text
ユーザー: 引き継いだこのRパッケージを監査してください -- 品質とリスクを把握する必要があります
```

チームはコードの健全性、アーキテクチャの判断、セキュリティ態勢をカバーする包括的な評価を提供する。

## 制限事項

- Rパッケージに最適。汎用的なコードレビュー用には設計されていない
- 4つのエージェントタイプすべてがサブエージェントとして利用可能であることが必要
- 統合レポートは自動分析を反映する; ドメイン固有のロジックには人間の判断が引き続き必要
- `R CMD check` やテストを直接実行しない -- 静的レビューに焦点を当てる
- 大規模パッケージ（100以上のRファイル）は、フルパッケージレビューよりもスコープを絞ったレビューが有効

## 関連項目

- [r-developer](../agents/r-developer.md) -- Rパッケージの専門知識を持つリードエージェント
- [code-reviewer](../agents/code-reviewer.md) -- 品質レビューエージェント
- [senior-software-developer](../agents/senior-software-developer.md) -- アーキテクチャレビューエージェント
- [security-analyst](../agents/security-analyst.md) -- セキュリティ監査エージェント
- [submit-to-cran](../skills/submit-to-cran/SKILL.md) -- CRAN提出スキル
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) -- アーキテクチャレビュースキル

---

**著者**: Philipp Thoss
**バージョン**: 1.0.0
**最終更新**: 2026-02-16
