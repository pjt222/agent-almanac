---
name: resolve-git-conflicts
description: >
  安全な回復戦略を用いてマージとrebaseのコンフリクトを解消します。
  コンフリクトの原因特定、コンフリクトマーカーの読み方、解消戦略の選択、
  操作の続行または安全な中止を網羅。git merge・rebase・cherry-pick・
  stash popでコンフリクトが報告された場合、git pullで変更が競合した場合、
  または失敗したマージやrebaseを安全に中止して再開する必要がある場合に使用。
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
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
---

# Gitコンフリクトの解消

マージとrebaseのコンフリクトを特定し、解消し、回復する。

## 使用タイミング

- `git merge` または `git rebase` でコンフリクトが報告されたとき
- `git cherry-pick` がクリーンに適用できないとき
- `git pull` で変更が競合したとき
- `git stash pop` が現在の作業ツリーとコンフリクトするとき

## 入力

- **必須**: アクティブなコンフリクトがあるリポジトリ
- **任意**: 優先する解消戦略（ours、theirs、手動）
- **任意**: どちらの変更を優先すべきかのコンテキスト

## 手順

### ステップ1: コンフリクトの原因特定

どの操作がコンフリクトを引き起こしたかを確認する:

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

ステータス出力にはコンフリクトが発生しているファイルと実行中の操作が示される。

**期待結果：** `git status` に「Unmerged paths」にリストされたファイルとアクティブな操作が表示される。

**失敗時：** `git status` がクリーンな作業ツリーを表示するがコンフリクトを期待していた場合、操作がすでに完了または中止されている可能性がある。`git log` で最近のアクティビティを確認する。

### ステップ2: コンフリクトマーカーの読み方

コンフリクトが発生している各ファイルを開き、コンフリクトマーカーを確認する:

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` から `=======` まで: 現在のブランチの内容（またはrebaseのベースとなるブランチ）
- `=======` から `>>>>>>>` まで: 取り込まれる変更（マージされるブランチまたは適用されるコミット）

**期待結果：** コンフリクトが発生している各ファイルに `<<<<<<<`、`=======`、`>>>>>>>` マーカーを含むブロックが1つ以上存在する。

**失敗時：** マーカーが見つからないがファイルがコンフリクト状態として表示される場合、バイナリファイルまたは削除と変更の競合の可能性がある。`git diff --name-only --diff-filter=U` で完全なリストを確認する。

### ステップ3: 解消戦略の選択

**手動マージ**（最も一般的）: 両方の変更を論理的に組み合わせるようにファイルを編集し、すべてのコンフリクトマーカーを削除する。

**oursを採用**（現在のブランチのバージョンを保持）:

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**theirsを採用**（取り込まれるブランチのバージョンを保持）:

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**期待結果：** 解消後、ファイルにコンフリクトマーカーが残らず、正しくマージされたコンテンツが含まれる。

**失敗時：** 誤った側を選択した場合、マージベースからコンフリクトしているバージョンを再確認する。マージ中であれば `git checkout -m path/to/file` でコンフリクトマーカーを再作成して再試行できる。

### ステップ4: 解消済みとしてのマーク

コンフリクトが発生している各ファイルを編集した後:

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

「Unmerged paths」にリストされているすべてのファイルについて繰り返す。

**期待結果：** すべてのファイルが「Unmerged paths」から「Changes to be committed」に移動する。すべてのファイルにコンフリクトマーカーが残っていない。

**失敗時：** `git add` が失敗するかマーカーが残っている場合、ファイルを再度開き、`<<<<<<<`、`=======`、`>>>>>>>` のすべての行が削除されていることを確認する。

### ステップ5: 操作の続行

すべてのコンフリクトが解消されたら:

**マージの場合**:

```bash
git commit
# Git auto-populates the merge commit message
```

**rebaseの場合**:

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**cherry-pickの場合**:

```bash
git cherry-pick --continue
```

**stash popの場合**:

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

**期待結果：** 操作が完了する。`git status` がクリーンな作業ツリーを表示する（rebaseの場合は次のコミットへ進む）。

**失敗時：** 続行コマンドが失敗する場合、`git status` で未解消のファイルが残っていないか確認する。続行する前にすべてのコンフリクトを解消しなければならない。

### ステップ6: 必要に応じた中止

解消が複雑すぎる場合や誤ったアプローチを選択した場合は、安全に中止する:

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**期待結果：** リポジトリが操作開始前の状態に戻る。データの損失がない。

**失敗時：** 中止が失敗する場合（まれ）、`git reflog` で操作前のコミットを探し、`git reset --hard <commit>` で復元する。この操作は未コミットの変更が失われるため、慎重に使用すること。

### ステップ7: 解消の確認

操作完了後:

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**期待結果：** 作業ツリーがクリーンで、マージ履歴が正確で、テストが通過している。

**失敗時：** 解消後にテストが失敗する場合、構文上のコンフリクトは解消されていても、マージによって論理的なエラーが混入した可能性がある。差分を注意深くレビューして修正する。

## バリデーション

- [ ] すべてのファイルにコンフリクトマーカー（`<<<<<<<`、`=======`、`>>>>>>>`）が残っていない
- [ ] `git status` がクリーンな作業ツリーを表示している
- [ ] `git log` のマージ/rebase履歴が正確である
- [ ] コンフリクト解消後にテストが通過している
- [ ] 意図しない変更が混入していない

## よくある落とし穴

- **一方を盲目的に採用する**: `--ours` または `--theirs` は相手側を完全に破棄する。一方のバージョンが完全に正しいと確信できる場合にのみ使用する。
- **コード内にコンフリクトマーカーを残す**: 編集後、必ずファイル全体を検索してマーカーが残っていないか確認する。不完全な解消はコードを壊す。
- **rebase中のamend**: インタラクティブrebase中は、そのrebaseステップが明示的に要求しない限り `--amend` を使用しない。代わりに `git rebase --continue` を使用する。
- **中止による作業の損失**: `git rebase --abort` と `git merge --abort` はすべての解消作業を破棄する。最初からやり直す場合にのみ中止する。
- **解消後のテスト未実施**: 構文的にクリーンなマージでも論理的に誤っている場合がある。必ずテストを実行する。
- **rebase後の強制プッシュ**: 共有ブランチをrebaseした後、履歴が書き換えられるため、強制プッシュ前にコラボレーターと調整する。

## 関連スキル

- `commit-changes` - コンフリクト解消後のコミット
- `manage-git-branches` - コンフリクトにつながるブランチワークフロー
- `configure-git-repository` - リポジトリセットアップとマージ戦略
