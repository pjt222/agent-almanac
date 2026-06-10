---
name: create-pull-request
description: >
  GitHub CLIを使用してプルリクエストを作成・管理する。ブランチの準備、
  PRタイトルと説明文の作成、PRの作成、レビューフィードバックの対応、
  マージとクリーンアップのワークフローをカバーする。フィーチャーまたは修正
  ブランチからの変更をレビューに提出する時、完了した作業をメインブランチに
  マージする時、共同作業者にコードレビューを依頼する時、一連の変更の
  目的と範囲を文書化する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
  locale: ja
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: 2026-03-13
---

# プルリクエストの作成

明確なタイトル、構造化された説明文、適切なブランチ設定でGitHubプルリクエストを作成する。

## 使用タイミング

- フィーチャーまたは修正ブランチからの変更をレビューに提出する時
- 完了した作業をメインブランチにマージする時
- 共同作業者にコードレビューを依頼する時
- 一連の変更の目的と範囲を文書化する時

## 入力

- **必須**: コミット済みの変更を含むフィーチャーブランチ
- **必須**: マージ先のベースブランチ（通常 `main`）
- **任意**: レビュー依頼先
- **任意**: ラベルまたはマイルストーン
- **任意**: ドラフトステータス

## 手順

### ステップ1: ブランチの準備状態を確認する

ブランチがベースブランチと同期しており、すべての変更がコミットされていることを確認する:

```bash
# コミットされていない変更を確認
git status

# リモートから最新を取得
git fetch origin

# 最新のmainにリベース（またはマージ）
git rebase origin/main
```

**期待結果:** ブランチが `origin/main` よりも先にあり、コミットされていない変更やコンフリクトがない。

**失敗時:** リベースでコンフリクトが発生した場合、解決し（`resolve-git-conflicts` スキルを参照）、`git rebase --continue` を実行する。ブランチの乖離が大きい場合は、代わりに `git merge origin/main` を検討する。

### ステップ2: ブランチ上のすべての変更をレビューする

PRに含まれる差分全体とコミット履歴を確認する:

```bash
# このブランチのコミット（mainにないもの）を表示
git log origin/main..HEAD --oneline

# mainとの差分全体を表示
git diff origin/main...HEAD

# ブランチがリモートを追跡しプッシュ済みか確認
git status -sb
```

**期待結果:** すべてのコミットがPRに関連している。差分には意図した変更のみが含まれている。

**失敗時:** 無関係なコミットが含まれている場合、PRを作成する前に対話的リベースで履歴を整理することを検討する。

### ステップ3: ブランチをプッシュする

```bash
# ブランチをリモートにプッシュ（上流トラッキングを設定）
git push -u origin HEAD
```

**期待結果:** ブランチがGitHubリモートに表示される。

**失敗時:** プッシュが拒否された場合、`git pull --rebase origin <branch>` で先にプルし、コンフリクトがあれば解決する。

### ステップ4: PRタイトルと説明文を作成する

タイトルは70文字以内に収める。詳細は本文に記述する:

```bash
gh pr create --title "Add weighted mean calculation" --body "$(cat <<'EOF'
## Summary
- Implement `weighted_mean()` with NA handling and zero-weight filtering
- Add input validation for mismatched vector lengths
- Include unit tests covering edge cases

## Test plan
- [ ] `devtools::test()` passes with no failures
- [ ] Manual verification with example data
- [ ] Edge cases: empty vectors, all-NA weights, zero-length input

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

ドラフトPRの場合:

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**期待結果:** GitHubにPRが作成され、URLが返される。説明文が変更内容とテスト方法を明確に伝えている。

**失敗時:** `gh` が認証されていない場合は `gh auth login` を実行する。ベースブランチが間違っている場合は `--base main` で指定する。

### ステップ5: レビューフィードバックに対応する

レビューコメントに回答し、更新をプッシュする:

```bash
# PRコメントを表示
gh api repos/{owner}/{repo}/pulls/{number}/comments

# PRのレビュー状態を確認
gh pr checks

# 変更を加えた後、コミットしてプッシュ
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**期待結果:** PRに新しいコミットが表示される。レビューコメントに対応済みである。

**失敗時:** プッシュ後にCIチェックが失敗した場合、`gh pr checks` でチェック出力を読み、再レビュー依頼の前に問題を修正する。

### ステップ6: マージとクリーンアップ

承認後:

```bash
# PRをマージ（スカッシュマージで履歴をクリーンに保つ）
gh pr merge --squash --delete-branch

# または全コミットを保持してマージ
gh pr merge --merge --delete-branch

# またはリベースマージ（リニア履歴）
gh pr merge --rebase --delete-branch
```

マージ後、ローカルのmainを更新する:

```bash
git checkout main
git pull origin main
```

**期待結果:** PRがマージされ、リモートブランチが削除され、ローカルのmainが更新される。

**失敗時:** 失敗したチェックや不足している承認によりマージがブロックされている場合は、先にそれらに対処する。ブロッカーを解決せずに強制マージしない。

## バリデーション

- [ ] PRタイトルが簡潔（70文字以内）で説明的である
- [ ] PR本文に変更の要約とテストプランが含まれている
- [ ] ブランチ上のすべてのコミットがPRに関連している
- [ ] CIチェックがパスしている
- [ ] ブランチがベースブランチと同期している
- [ ] レビュアーが割り当てられている（リポジトリ設定で必要な場合）
- [ ] 差分に機密データが含まれていない

## よくある落とし穴

- **PRが大きすぎる**: PRは単一の機能や修正に集中させる。大きなPRはレビューが難しく、マージコンフリクトが発生しやすい。
- **テストプランの欠如**: ドキュメントのPRであっても、変更がどのように検証できるかを常に記述する。
- **古いブランチ**: ベースブランチが大幅に進んでいる場合、マージコンフリクトを最小化するためPR作成前にリベースする。
- **レビュー中のフォースプッシュ**: オープンなレビューコメントがあるブランチへのフォースプッシュは避ける。レビュアーが増分変更を確認できるよう、新しいコミットをプッシュする。
- **CI出力を読まない**: 再レビュー依頼の前に `gh pr checks` を確認する。CIの失敗はレビュアーの時間を無駄にする。
- **ブランチの削除忘れ**: マージ時に `--delete-branch` を使用してリモートをクリーンに保つ。

## 関連スキル

- `commit-changes` - PR用のコミット作成
- `manage-git-branches` - ブランチの作成と命名規約
- `resolve-git-conflicts` - リベース/マージ時のコンフリクト処理
- `create-github-release` - マージ後のリリース作成
