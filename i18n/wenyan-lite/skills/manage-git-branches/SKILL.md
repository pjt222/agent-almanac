---
name: manage-git-branches
locale: wenyan-lite
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

# 管 Git 分支

創、追、換、同步，並清分支，循一致命名慣。

## 適用時機

- 始新功能或錯修之工作
- 於異分支之任間切換
- 保功能分支與 main 同步
- 合並拉取請求後清分支
- 列並察分支

## 輸入

- **必要**：至少有一提交之倉
- **選擇性**：分支命名慣（默認：`type/description`）
- **選擇性**：新分支之基分支（默認：`main`）
- **選擇性**：遠程名（默認：`origin`）

## 步驟

### 步驟一：創功能分支

用一致命名慣：

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New functionality | `feature/add-weighted-mean` |
| `fix/` | Bug fix | `fix/null-pointer-in-parser` |
| `docs/` | Documentation | `docs/update-api-reference` |
| `refactor/` | Code restructuring | `refactor/extract-validation` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `test/` | Test additions | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**預期：** 新分支已創並檢出。`git branch` 示新分支附星號。

**失敗時：** 若基分支於本地不存，先取：`git fetch origin main && git checkout -b feature/name origin/main`。

### 步驟二：追遠程分支

首次推新分支時設追蹤：

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

檢出他人所創之遠程分支：

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**預期：** 本地分支追對應遠程分支。`git branch -vv` 示上游。

**失敗時：** 若自動追蹤敗，手設之：`git branch --set-upstream-to=origin/feature/name feature/name`。

### 步驟三：安全切換分支

換前確工作樹淨：

```bash
# Check for uncommitted changes
git status
```

**若變存**，提或暫之：

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

列並管暫：

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**預期：** 分支切換成。工作樹反映目標分支之態。暫變可復。

**失敗時：** 若切換被未提會遭覆之變阻，先暫或提。`git stash` 不能暫未追文件除非用 `git stash push -u`。

### 步驟四：與上游同步

保功能分支與基分支同步：

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**預期：** 分支今含 main 之最新變。無衝突，或衝突已解（見 `resolve-git-conflicts`）。

**失敗時：** 若 rebase 致衝突，解每一並 `git rebase --continue`。若衝突過複，以 `git rebase --abort` 中止而試 `git merge origin/main`。

### 步驟五：清合並之分支

拉取請求合並後，除陳分支：

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

**預期：** 合並分支於本地與遠程已除。`git branch` 僅示活分支。

**失敗時：** `git branch -d` 拒刪未合分支。若分支經 GitHub 之 squash 合並，Git 或不認其為已合。若確工作已存，用 `git branch -D`。

### 步驟六：列並察分支

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

**預期：** 所有分支、其態與追關係之清視。

**失敗時：** 若遠程分支顯陳，行 `git fetch --prune` 以清已刪遠程分支之引用。

## 驗證

- [ ] 分支名循已議之命名慣
- [ ] 功能分支自正確基分支創
- [ ] 本地分支追其遠程對應
- [ ] 合並分支已清（本地與遠程）
- [ ] 切換分支前工作樹淨
- [ ] 暫變未遺孤

## 常見陷阱

- **於 main 直工作**：恒創功能分支。直提於 main 難開 PR 與協作
- **分支前忘取**：自陳本地 main 創分支謂始即落後。恒先 `git fetch origin`
- **長存分支**：存數周之功能分支累衝突。常同步並保分支短存
- **孤暫**：`git stash` 為臨存。勿依之作長期工作。提或分支代之
- **刪未合工作**：`git branch -D` 為破壞性。強刪前以 `git log branch-name` 重查
- **未修剪**：GitHub 上已刪之遠程分支於本地仍顯直至 `git fetch --prune`

## 相關技能

- `commit-changes` - 提分支上之工作
- `create-pull-request` - 自功能分支開 PR
- `resolve-git-conflicts` - 同步中之衝突處理
- `configure-git-repository` - 倉設與分支策略
