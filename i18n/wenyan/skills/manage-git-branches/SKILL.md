---
name: manage-git-branches
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create, track, switch, sync, and clean up Git branches. Covers
  naming conventions, safe branch switching with stash, upstream
  synchronization, and pruning merged branches. Use when starting work
  on a new feature or bug fix, switching between tasks on different
  branches, keeping a feature branch up to date with main, or cleaning
  up branches after merging pull requests.
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

# 管 Git 枝

以一致命名建、換、同、清諸枝。

## 用時

- 啟新特性或修疵之工
- 於異枝之任間換
- 保特性枝於 main 為新
- 合併 pull request 後清枝
- 列並察諸枝

## 入

- **必要**：至少一提交之倉
- **可選**：枝之命名慣（預設：`type/description`）
- **可選**：新枝之基（預設：`main`）
- **可選**：遠端之名（預設：`origin`）

## 法

### 第一步：建特性之枝

用一致之命名慣：

| 頭 | 旨 | 例 |
|--------|---------|---------|
| `feature/` | 新功 | `feature/add-weighted-mean` |
| `fix/` | 修疵 | `fix/null-pointer-in-parser` |
| `docs/` | 文件 | `docs/update-api-reference` |
| `refactor/` | 碼重構 | `refactor/extract-validation` |
| `chore/` | 維 | `chore/update-dependencies` |
| `test/` | 試加 | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**得：**新枝已建並換。`git branch` 現新枝於星旁。

**敗則：**若基枝本地無，先取之：`git fetch origin main && git checkout -b feature/name origin/main`。

### 第二步：追遠端之枝

首推新枝時立追：

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

取他人所建之遠端枝：

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**得：**本地枝追對應遠端枝。`git branch -vv` 現上游。

**敗則：**若自動追敗，手設之：`git branch --set-upstream-to=origin/feature/name feature/name`。

### 第三步：安換枝

換前，確工作樹淨：

```bash
# Check for uncommitted changes
git status
```

**若有變**，或提交或暫存：

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

列並管暫存：

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**得：**換枝成。工作樹反目標枝之態。暫存之變可復。

**敗則：**若未提交之變將被蓋而阻換，先暫存或提交。`git stash` 不暫未追之檔，除非用 `git stash push -u`。

### 第四步：與上游同

保特性枝於基枝為新：

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**得：**枝今含 main 之新變。無衝突，或衝突已解（見 `resolve-git-conflicts`）。

**敗則：**若 rebase 致衝突，解之並 `git rebase --continue`。若衝突過複雜，以 `git rebase --abort` 止之並改用 `git merge origin/main`。

### 第五步：清已合之枝

PR 合後，除陳枝：

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

**得：**已合之枝於本地與遠端皆除。`git branch` 僅現活枝。

**敗則：**`git branch -d` 拒刪未合之枝。若於 GitHub 以 squash 合併，Git 或不識之為已合。若確工已存，用 `git branch -D`。

### 第六步：列並察枝

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

**得：**諸枝、其態、與追關係皆明。

**敗則：**若遠端枝似陳，行 `git fetch --prune` 以清已刪遠端枝之參。

## 驗

- [ ] 枝名循所議命名慣
- [ ] 特性枝自正基枝所建
- [ ] 本地枝追其遠端對應
- [ ] 已合之枝已清（本地與遠端）
- [ ] 換枝前工作樹淨
- [ ] 暫存之變不遺孤

## 陷

- **直於 main 上工**：恆建特性枝。直提 main 致難建 PR 與協
- **枝前忘取**：自陳本地 main 建枝意自始已落。恆先 `git fetch origin`
- **長壽枝**：特性枝歷週積合併衝突。常同並保枝短壽
- **孤之暫存**：`git stash` 乃暫存。勿依之為長工。提交或建枝
- **刪未合之工**：`git branch -D` 乃毀。強刪前以 `git log branch-name` 二察
- **不剪**：於 GitHub 刪之遠端枝本地仍現，至 `git fetch --prune` 乃清

## 參

- `commit-changes` — 於枝提交工
- `create-pull-request` — 自特性枝開 PR
- `resolve-git-conflicts` — 同步中處衝突
- `configure-git-repository` — 倉之設與枝之略
