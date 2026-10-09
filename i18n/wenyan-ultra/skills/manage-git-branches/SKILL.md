---
name: manage-git-branches
locale: wenyan-ultra
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
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
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
---

# 管 Git 支

造、追、換、同、清諸支循一致命約。

## 用

- 啟新功或錯修工
- 於異支間切任
- 保功支與 main 同
- PR 合後清支
- 列並察支

## 入

- **必**：至少一提交之庫
- **可**：支命約（默 `type/description`）
- **可**：新支之基支（默 `main`）
- **可**：遠名（默 `origin`）

## 行

### 一：造功支

用一致命約：

| 前綴 | 目 | 例 |
|---|---|---|
| `feature/` | 新功 | `feature/add-weighted-mean` |
| `fix/` | 錯修 | `fix/null-pointer-in-parser` |
| `docs/` | 文 | `docs/update-api-reference` |
| `refactor/` | 重構 | `refactor/extract-validation` |
| `chore/` | 維護 | `chore/update-dependencies` |
| `test/` | 測 | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

得：新支造並檢出。`git branch` 示新支附星。

敗：基支於本無→先取：`git fetch origin main && git checkout -b feature/name origin/main`。

### 二：追遠支

首推新支時立追：

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

檢出他人造之遠支：

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

得：本支追對應遠支。`git branch -vv` 示上游。

敗：自動追敗→手設：`git branch --set-upstream-to=origin/feature/name feature/name`。

### 三：安換支

換前確工樹淨：

```bash
# Check for uncommitted changes
git status
```

**有變**→或提或藏：

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

列並管藏：

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

得：換成。工樹反目支態。藏可恢。

敗：換受未提變阻（會覆）→先藏或提。`git stash` 不能藏未追文件除非用 `git stash push -u`。

### 四：與上游同

保功支與基支同：

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

得：支含 main 之新變。無衝或衝已解（見 `resolve-git-conflicts`）。

敗：重定基生衝→解各並 `git rebase --continue`。衝過複→以 `git rebase --abort` 棄並試 `git merge origin/main`。

### 五：清已合支

PR 合後除陳支。先證各支之工已入 `main`，因 `git branch -d` 不答此問（見下敗）。二者必並立。一：托管報 PR 已合入 `main`：`gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` 示 `MERGED` 與 `main`。二：本支無 PR 所無者：`git merge-base --is-ancestor <branch> <headRefOid>` 退 0。`headRefOid` 乃托管所合之 PR 頭，故此一測通合提交、擠合、重定基合。僅 PR 態不足→不見 PR 未有之本提交。

退 1→支有此提交（末推後所提，或遠支因強推所失者）：留支。退 128→PR 頭不在本，如支刪前他人推於 PR：以 `git fetch origin refs/pull/<n>/head` 取之（GitHub 刪支後仍存），再測。合提交者，對合提交驗祖（同 `gh` 出之 `mergeCommit.oid`，先 `git fetch origin main`）亦答同問。擠合與改寫提交之重定基合必敗此合提交測：其提交皆新，不含支之提交；然仍過 `headRefOid` 測。唯 `MERGED` 並退 0 方許刪。下碼列刪式備參。測過→`git branch -D` 安；其 `-d` 行見拒→屬敗例。

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

得：已合支本地與遠除。`git branch` 僅示活支。

敗：`git branch -d` 非合驗（#865, #900）。據 `git help branch`，支須全合入其上游，無上游則入 HEAD；實測（git 2.43），上游示 `gone` 視為無→驗 HEAD。故以 `-u` 推（步二）且全推之支，無論曾入 `main` 否皆過：`-d` 刪之、退 0、唯 stderr 一警（`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`）。續依序行上碼→遠支亦刪，無引存其工。無上游之支對命令所運工樹之 HEAD 驗，故 HEAD 為含之之疊支→`-d` 刪之，stderr 全無聲。反之，所驗引缺支端→`-d` 拒*確*已合之支：遠支刪、上游失後之 HEAD（如未更之本 `main`），或落後支端之上游（端自他克隆推而未取）。端因某提交未推而先於上游→非此例：其提交不在任 PR，拒乃正。擠合支僅於所驗引缺端時見拒，如上游失後之 HEAD；其自推上游猶存→`-d` 刪之。答皆同：行本步首之測，過方以 `git branch -D` 刪。

### 六：列並察支

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

得：諸支之明視、其態、追關係。

敗：遠支似陳→運 `git fetch --prune` 清除已刪遠支之引。

## 驗

- [ ] 支名循約
- [ ] 功支由正基支造
- [ ] 本支追其遠對應
- [ ] 已合支清（本與遠）
- [ ] 換支前工樹淨
- [ ] 藏變無孤留

## 忌

- **直工 main**：必造功支。直提 main 難造 PR 與協作
- **分支前忘取**：由陳本 main 造支→始落。必先 `git fetch origin`
- **長命支**：持週之功支積合衝。常同並保短命
- **孤藏**：`git stash` 乃臨存。勿賴之為長期工。改提或分支
- **刪未合工**：二刪旗皆不自安。`git branch -D` 不論合態皆刪；`git branch -d` 刪全推於己上游之未合支，或無上游時，刪當前 HEAD 所含而 `main` 不含者（無警）。用任一前，行步五首之測：PR 已 `MERGED` 入 `main`，且 `git merge-base --is-ancestor <branch> <headRefOid>` 退 0
- **不剪**：GitHub 已刪遠支於本地仍現至運 `git fetch --prune`

## 參

- `commit-changes` - 支上工提交
- `create-pull-request` - 由功支開 PR
- `resolve-git-conflicts` - 同時處衝
- `configure-git-repository` - 庫設與支策
