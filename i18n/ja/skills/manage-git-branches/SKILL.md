---
name: manage-git-branches
description: >
  Gitブランチの作成、追跡、切り替え、同期、クリーンアップを行います。
  命名規約、stashを使った安全なブランチ切り替え、アップストリームとの
  同期、マージ済みブランチの削除を網羅。新機能やバグ修正の作業開始、
  異なるブランチ間でのタスク切り替え、フィーチャーブランチをmainと
  同期する場合、プルリクエストマージ後のブランチ整理に使用。
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
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
---

# Gitブランチの管理

一貫した命名規約に従ってブランチを作成、切り替え、同期、クリーンアップする。

## 使用タイミング

- 新機能やバグ修正の作業を開始するとき
- 異なるブランチで複数タスクを切り替えるとき
- フィーチャーブランチをmainと同期させるとき
- プルリクエストのマージ後にブランチを整理するとき
- ブランチの一覧表示と内容確認をするとき

## 入力

- **必須**: 少なくとも1件のコミットがあるリポジトリ
- **任意**: ブランチ命名規約（デフォルト: `type/description`）
- **任意**: 新規ブランチのベースブランチ（デフォルト: `main`）
- **任意**: リモート名（デフォルト: `origin`）

## 手順

### ステップ1: フィーチャーブランチの作成

一貫した命名規約を使用する:

| プレフィックス | 用途 | 例 |
|--------|---------|---------|
| `feature/` | 新機能 | `feature/add-weighted-mean` |
| `fix/` | バグ修正 | `fix/null-pointer-in-parser` |
| `docs/` | ドキュメント | `docs/update-api-reference` |
| `refactor/` | コード再構造化 | `refactor/extract-validation` |
| `chore/` | メンテナンス | `chore/update-dependencies` |
| `test/` | テスト追加 | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**期待結果：** 新しいブランチが作成されチェックアウトされる。`git branch` に新しいブランチがアスタリスク付きで表示される。

**失敗時：** ベースブランチがローカルに存在しない場合、先にフェッチする: `git fetch origin main && git checkout -b feature/name origin/main`。

### ステップ2: リモートブランチの追跡設定

新しいブランチを初めてプッシュする際に追跡を設定する:

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

他のメンバーが作成したリモートブランチをチェックアウトするには:

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**期待結果：** ローカルブランチが対応するリモートブランチを追跡する。`git branch -vv` にアップストリームが表示される。

**失敗時：** 自動追跡が失敗する場合、手動で設定する: `git branch --set-upstream-to=origin/feature/name feature/name`。

### ステップ3: 安全なブランチ切り替え

切り替え前に、作業ツリーがクリーンであることを確認する:

```bash
# Check for uncommitted changes
git status
```

**変更が存在する場合**、コミットするかstashに保存する:

```bash
# Option 1: Commit work in progress
git add <files>
git commit -m "wip: save progress on validation logic"

# Option 2: Stash changes temporarily
git stash push -m "validation work in progress"

# Switch branches
git checkout main

# Later, restore stashed changes
git checkout feature/add-weighted-mean
git stash pop
```

stashの一覧と管理:

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**期待結果：** ブランチの切り替えが成功する。作業ツリーが切り替え先ブランチの状態を反映する。stashに保存した変更が復元可能な状態にある。

**失敗時：** 上書きされる恐れのある未コミットの変更によって切り替えがブロックされる場合、先にstashかコミットを行う。`git stash` は未追跡ファイルをstashに保存できないため、その場合は `git stash push -u` を使用する。

### ステップ4: アップストリームとの同期

フィーチャーブランチをベースブランチと同期させる:

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**期待結果：** ブランチにmainの最新変更が取り込まれる。コンフリクトがないか、または解消済みである（`resolve-git-conflicts` を参照）。

**失敗時：** rebaseでコンフリクトが発生した場合、各コンフリクトを解消して `git rebase --continue` を実行する。コンフリクトが複雑すぎる場合は `git rebase --abort` で中止し、代わりに `git merge origin/main` を試みる。

### ステップ5: マージ済みブランチのクリーンアップ

プルリクエストがマージされた後、古くなったブランチを削除する:

```bash
# Delete a local branch that has been merged
git branch -d feature/add-weighted-mean

# Delete a local branch (force, even if not merged)
git branch -D feature/abandoned-experiment

# Delete a remote branch
git push origin --delete feature/add-weighted-mean

# Prune remote-tracking references for deleted remote branches
git fetch --prune
```

**期待結果：** マージ済みブランチがローカルとリモートから削除される。`git branch` にアクティブなブランチだけが表示される。

**失敗時：** `git branch -d` が未マージのブランチの削除を拒否する。GitHubでsquashマージされた場合、Gitがマージ済みと認識しない場合がある。作業が保存されていることが確実であれば `git branch -D` を使用する。

### ステップ6: ブランチの一覧表示と確認

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List branches with last commit info
git branch -v

# List branches merged into main
git branch --merged main

# List branches NOT yet merged
git branch --no-merged main

# See which remote branch each local branch tracks
git branch -vv
```

**期待結果：** すべてのブランチ、そのステータス、追跡関係が明確に確認できる。

**失敗時：** リモートブランチが古く見える場合、`git fetch --prune` を実行して削除済みリモートブランチへの参照をクリーンアップする。

## バリデーション

- [ ] ブランチ名が合意した命名規約に従っている
- [ ] フィーチャーブランチが正しいベースブランチから作成されている
- [ ] ローカルブランチが対応するリモートブランチを追跡している
- [ ] マージ済みブランチがローカルとリモートの両方から削除されている
- [ ] ブランチ切り替え前に作業ツリーがクリーンである
- [ ] stashに保存した変更が放置されていない

## よくある落とし穴

- **mainへの直接コミット**: 常にフィーチャーブランチを作成すること。mainに直接コミットするとPRの作成やコラボレーションが困難になる。
- **ブランチ作成前のフェッチ忘れ**: 古いローカルのmainからブランチを作成すると、最新状態より遅れた状態からスタートする。必ず先に `git fetch origin` を実行する。
- **長期間のブランチ運用**: 何週間も続くフィーチャーブランチはマージコンフリクトを蓄積する。頻繁に同期し、ブランチの存続期間を短く保つ。
- **放置されたstash**: `git stash` は一時的な保存場所である。長期的な作業の保存には使わず、コミットかブランチを使用する。
- **未マージ作業の削除**: `git branch -D` は破壊的操作である。強制削除前に `git log branch-name` で確認する。
- **pruneの未実施**: GitHubで削除されたリモートブランチは、`git fetch --prune` を実行するまでローカルに残り続ける。

## 関連スキル

- `commit-changes` - ブランチ上での作業のコミット
- `create-pull-request` - フィーチャーブランチからのPRオープン
- `resolve-git-conflicts` - 同期中のコンフリクト対応
- `configure-git-repository` - リポジトリセットアップとブランチ戦略
