---
name: polish-claw-project
description: >
  Contribute to OpenClaw ecosystem projects (OpenClaw, NemoClaw, NanoClaw)
  through a structured 9-step workflow: target verification, codebase
  exploration, parallel audit, finding cross-reference, and pull request
  creation. Emphasizes false positive prevention and project convention
  adherence.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Polish Claw Project

OpenClaw エコシステムプロジェクトへの貢献用の構造化されたワークフロー。新規価値はステップ5-7 にある: 並列監査、偽陽性防止、開いた issue と所見をクロス参照して高インパクトの貢献を選ぶ。機械的ステップ（フォーク、PR 作成）は既存スキルに委譲。

## 使用タイミング

- NVIDIA/OpenClaw、NVIDIA/NemoClaw、NVIDIA/NanoClaw、または同様の Claw エコシステムリポジトリへの貢献
- セキュリティに敏感なアーキテクチャを持つ馴染みのないオープンソースプロジェクトへの初貢献
- 場当たり的修正ではなく繰り返し可能で監査可能な貢献ワークフローが欲しいとき
- 外部貢献を受け入れる Claw プロジェクトを特定した後（CONTRIBUTING.md を確認）

## 入力

- **必須**: `repo_url` — ターゲット Claw プロジェクトの GitHub URL（例: `https://github.com/NVIDIA/NemoClaw`）
- **任意**:
  - `contribution_count` — 目指す貢献数（既定: 1-3）
  - `focus` — 望む貢献タイプ: `security`、`tests`、`docs`、`bugs`、`any`（既定: `any`）
  - `fork_org` — フォーク先の GitHub org/user（既定: 認証ユーザー）

## 手順

### ステップ1: ターゲットを特定し検証する

プロジェクトが外部貢献を受け入れ、活発に維持されていることを確認する。

1. リポジトリ URL を開き `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`LICENSE` を読む
2. 最近のコミット活動（過去 30 日）と open PR マージ率を確認
3. プロジェクトが寛容または貢献に親和的なライセンスを使うか検証
4. 存在すれば `SECURITY.md` またはセキュリティポリシーを読む — 責任ある開示ルールを記す
5. 主言語、テストフレームワーク、CI システムを特定

**期待結果：** CONTRIBUTING.md が存在、過去 30 日以内のコミット、明確な貢献ガイドライン。

**失敗時：** CONTRIBUTING.md がないまたは最近活動がないなら、理由を文書化して停止 — 古いプロジェクトは外部 PR を稀にしかマージしない。

### ステップ2: フォークしクローンする

リポジトリの作業コピーを作成する。

1. フォーク: `gh repo fork <repo_url> --clone`
2. upstream リモートを設定: `git remote add upstream <repo_url>`
3. 検証: `git remote -v` が `origin`（フォーク）と `upstream` の両方を示す
4. 同期: `git fetch upstream && git checkout main && git merge upstream/main`

**期待結果：** 両リモートが設定され最新のローカルクローン。

**失敗時：** フォークが失敗したら GitHub 認証を確認（`gh auth status`）。クローンが遅いなら、初期探索には `--depth=1` を試す。

### ステップ3: コードベースを探索する

プロジェクトアーキテクチャのメンタルモデルを構築する。

1. アーキテクチャ概要とプロジェクト目標について `README.md` を読む
2. エントリポイント、コアモジュール、公開 API 面を特定
3. テスト構造をマップ: テストがどこに住むか、どのフレームワーク、カバレッジレベル
4. コードスタイル慣習を記す: linter 設定、命名パターン、import スタイル
5. Docker/コンテナセットアップ、CI 設定、デプロイパターンを確認

**期待結果：** プロジェクト構造、慣習、貢献がどこに合うかの明確な理解。

**失敗時：** アーキテクチャが不明確なら、プロジェクト全体ではなく特定サブシステムに焦点を絞る。

### ステップ4: 開いた issue を読む

プロジェクトのニーズを理解し重複作業を避けるため既存 issue を調査する。

1. 開いた issue を列挙: `gh issue list --state open --limit 50`
2. タイプ別に分類: バグ、機能、ドキュメント、セキュリティ、good-first-issue
3. `help wanted`、`good first issue`、`hacktoberfest` ラベルの issue を記す
4. 古い issue（>90 日開、最近コメントなし）を確認 — 放棄かもしれない
5. 試みられた解決を理解するためリンクされた PR を読む

**期待結果：** タイプラベル付きの未請求 issue の分類リスト。

**失敗時：** 開いた issue がなければ、ステップ5 に進む — 監査がリストされていない改善を発掘するかもしれない。

### ステップ5: 並列監査

並列にセキュリティとコード品質監査を実行する。新規所見が現れる場所。

1. プロジェクトルートに対して `security-audit-codebase` スキルを実行
2. 同時にスコープ `quality` で `review-codebase` スキルを実行
3. **重要: プロジェクトの脅威モデルとアーキテクチャに対して各所見を検証する**
   - サンドボックスブートストラップスクリプトの「ハードコードされたシークレット」は脆弱性ではない
   - 内部のみの関数の入力検証欠落は低重大度
   - 脆弱としてフラグされた依存はプロジェクトのアーキテクチャで既に緩和されているかもしれない
4. 検証された所見を評価: CRITICAL、HIGH、MEDIUM、LOW
5. 偽陽性を理由付きで文書化 — 将来の実行のための Common Pitfalls に情報を与える

**期待結果：** 重大度評価と偽陽性注釈付きの検証された所見リスト。

**失敗時：** 所見が現れなければ、テストカバレッジギャップ、ドキュメント改善、または開発者体験向上に焦点をシフトする。

### ステップ6: 所見をクロス参照する

検証された監査所見を開いた issue にマップ — コア判断ステップ。

1. 各検証所見について、関連議論のため開いた issue を検索
2. 各所見を分類:
   - **開いた issue に一致** — 所見を issue にリンク
   - **新所見** — 既存 issue がこれをカバーしない
   - **PR で既に修正済み** — 進行中修正のため open PR を確認
3. 既存 issue に一致する所見を優先（最高マージ確率）
4. 新所見について、プロジェクト優先順位に基づいてメンテナーが修正を歓迎するかを評価

**期待結果：** 所見-to-issue マッピングとマージ確率評価付きの優先順位リスト。

**失敗時：** すべての所見が既に対処済みなら、ステップ4 に戻りドキュメント、テスト、または開発者体験貢献を探す。

### ステップ7: 貢献を選ぶ

インパクト、努力、専門性に基づいて 1-3 貢献を選ぶ。

1. 各候補を採点:
   - **インパクト**: これがプロジェクトをどれだけ改善するか？（セキュリティ > バグ > テスト > ドキュメント）
   - **努力**: これは焦点的セッションでうまくできるか？（小さく完全な PR を選好）
   - **専門性**: 貢献者はこの修正のドメイン知識を持つか？
   - **マージ確率**: これは述べられたプロジェクト優先順位に一致するか？
2. トップ候補を選ぶ（既定: 1-3）
3. 各々について定義: ブランチ名、スコープ境界、受け入れ基準、テスト計画

**期待結果：** 明確なスコープと受け入れ基準を持つ 1-3 の選ばれた貢献。

**失敗時：** どの貢献も良く採点されなければ、PR の代わりによく書かれた issue を出すことを検討する。

### ステップ8: 実装する

貢献ごとにブランチを作成し修正を実装する。

1. 各貢献について: `git checkout -b fix/<description>`
2. プロジェクト慣習に正確に従う（linter、命名、import スタイル）
3. 変更をカバーするテストを追加または更新
4. プロジェクトのテストスイートを実行: すべてのテストがパスすることを検証
5. プロジェクトの linter を実行: 新しい警告がないことを検証
6. 各 PR を焦点的に保つ — ブランチごとに 1 つの論理変更

**期待結果：** パスするテストと linter 警告なしのクリーンな実装。

**失敗時：** 既存問題でテストが失敗するなら、それを文書化し PR が新しい失敗を導入しないことを保証する。

### ステップ9: プルリクエストを作成する

プロジェクトの CONTRIBUTING.md に従って貢献を提出する。

1. ブランチをプッシュ: `git push origin fix/<description>`
2. `create-pull-request` スキルを使って PR を作成
3. PR 本文で関連 issue を参照（例: 「Fixes #123」）
4. 存在すればプロジェクトの PR テンプレートに従う
5. レビュアーフィードバックに応答的 — 素早く反復

**期待結果：** プロジェクト慣習に従い issue にリンクされて PR が作成される。

**失敗時：** PR 作成が失敗したら、ブランチ保護ルールと貢献者ライセンス契約を確認する。

## バリデーション

1. すべての選ばれた貢献が実装され PR として提出された
2. 各 PR が関連 issue（あれば）を参照する
3. 各 PR ブランチですべてのプロジェクトテストがパスする
4. 偽陽性所見が実問題として提出されていない
5. PR 説明がプロジェクトの CONTRIBUTING.md テンプレートに従う

## よくある落とし穴

- **偽陽性過剰主張**: Claw プロジェクトはサンドボックスアーキテクチャを使う — サンドボックス環境内の「脆弱性」は設計通りかもしれない。報告前に常にプロジェクトの脅威モデルに対して検証する。
- **ダイジェスト/署名チェーン破壊**: Claw プロジェクトはモデル整合性のため検証チェーンをしばしば使う。変更はこれらのチェーンを保たねばならず、さもなくば PR は拒否される。
- **慣習不一致**: Claw プロジェクトは厳格なスタイルを強制する。汎用ではなくプロジェクト独自の linter を実行する。import 順序、docstring 形式、テストパターンを正確に一致させる。
- **スコープクリープ**: 焦点的 3 PR は一つの広範な PR より速くマージする。各貢献を atomic に保つ。
- **古いフォーク**: 作業を始める前に常に upstream と同期（`git fetch upstream && git merge upstream/main`）。

## 関連スキル

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — セキュリティ所見のためステップ5 で使用
- [review-codebase](../review-codebase/SKILL.md) — コード品質レビューのためステップ5 で使用
- [create-pull-request](../create-pull-request/SKILL.md) — PR 作成のためステップ9 で使用
- [create-github-issues](../create-github-issues/SKILL.md) — PR として対処されない所見からの issue 出願
- [manage-git-branches](../manage-git-branches/SKILL.md) — 実装中のブランチ管理
- [commit-changes](../commit-changes/SKILL.md) — コミットワークフロー
