---
name: manage-git-branches
description: >
  创建、跟踪、切换、同步并清理 Git 分支。涵盖命名规范、使用暂存区安全切换分支、
  上游同步，以及清理已合并分支。适用于开始开发新功能或修复问题、在不同分支间
  切换任务、将功能分支与 main 保持同步，或在合并 PR 后清理分支。
locale: zh-CN
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
translator: claude-sonnet-4-6
translation_date: 2026-03-16
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

# 管理 Git 分支

按照一致的命名规范创建、切换、同步并清理分支。

## 适用场景

- 开始开发新功能或修复问题
- 在不同分支上的任务之间切换
- 将功能分支与 main 保持同步
- 合并 PR 后清理分支
- 列出和检查分支

## 输入

- **必需**：至少有一个提交的仓库
- **可选**：分支命名规范（默认：`type/description`）
- **可选**：新分支的基础分支（默认：`main`）
- **可选**：远程名称（默认：`origin`）

## 步骤

### 第 1 步：创建功能分支

使用一致的命名规范：

| 前缀 | 用途 | 示例 |
|---|---|---|
| `feature/` | 新功能 | `feature/add-weighted-mean` |
| `fix/` | 问题修复 | `fix/null-pointer-in-parser` |
| `docs/` | 文档 | `docs/update-api-reference` |
| `refactor/` | 代码重构 | `refactor/extract-validation` |
| `chore/` | 维护性工作 | `chore/update-dependencies` |
| `test/` | 测试补充 | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**预期结果：** 新分支已创建并切换到该分支，`git branch` 显示带星号的新分支。

**失败处理：** 若基础分支在本地不存在，请先拉取：`git fetch origin main && git checkout -b feature/name origin/main`。

### 第 2 步：跟踪远程分支

首次推送新分支时设置跟踪关系：

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

检出他人创建的远程分支：

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**预期结果：** 本地分支已跟踪对应的远程分支，`git branch -vv` 显示上游关系。

**失败处理：** 若自动跟踪失败，手动设置：`git branch --set-upstream-to=origin/feature/name feature/name`。

### 第 3 步：安全切换分支

切换前确保工作区干净：

```bash
# Check for uncommitted changes
git status
```

**若存在未提交的更改**，需先提交或暂存：

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

列出并管理暂存记录：

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**预期结果：** 分支切换成功，工作区反映目标分支的状态，暂存的更改可恢复。

**失败处理：** 若切换因未提交的更改会被覆盖而被阻止，请先暂存或提交。`git stash` 默认不能暂存未跟踪的文件，需使用 `git stash push -u`。

### 第 4 步：与上游同步

保持功能分支与基础分支的同步：

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**预期结果：** 分支现已包含 main 的最新更改，无冲突或冲突已解决（参见 `resolve-git-conflicts`）。

**失败处理：** 若 rebase 产生冲突，解决每个冲突后执行 `git rebase --continue`。若冲突过于复杂，使用 `git rebase --abort` 中止，改用 `git merge origin/main`。

### 第 5 步：清理已合并分支

PR 合并后，删除陈旧分支。先确认每个分支的工作已进入 `main`，因为 `git branch -d` 回答不了这个问题（参见下文的失败处理）。以下两点必须同时成立。代码托管平台必须报告该 PR 已合并到 `main`：`gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` 显示 `MERGED` 和 `main`。并且本地分支不得包含任何 PR 中没有的内容：`git merge-base --is-ancestor <branch> <headRefOid>` 以退出码 0 退出。`headRefOid` 是代码托管平台所合并的 PR 头部提交，因此这一项测试对合并提交（merge commit）、squash merge 和 rebase merge 同样适用。仅凭 PR 状态并不足够，因为它看不到 PR 从未包含过的本地提交。

退出码 1 表示该分支带有这样的提交（在最后一次推送之后创建的提交，或远程分支因强制推送而丢失的提交）：保留该分支。退出码 128 表示 PR 头部提交在本地不存在，例如在分支被删除之前有其他人向该 PR 推送过：用 `git fetch origin refs/pull/<n>/head` 获取它（GitHub 在分支删除后仍会保留该引用），然后重新运行测试。对于合并提交，以合并提交本身检验祖先关系（即同一 `gh` 输出中的 `mergeCommit.oid`，需先执行 `git fetch origin main`）也能回答同一问题。squash merge 以及重写了提交的 rebase merge 必然通不过这项合并提交测试，因为它们的提交是新生成的，并不包含该分支的提交；但它们仍能通过 `headRefOid` 测试。只有 `MERGED` 与退出码 0 同时满足，才允许删除。下方代码块列出各种删除方式以供参考。检查通过后，使用 `git branch -D` 是安全的；代码块中 `-d` 那一行若被拒绝，即属于失败处理所述的情况。

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

**预期结果：** 已合并的分支在本地和远程均被删除，`git branch` 只显示活跃分支。

**失败处理：** `git branch -d` 不是合并检查（#865、#900）。根据 `git help branch`，分支必须已完全合并到其上游；若未设置上游，则须完全合并到 HEAD。实测（git 2.43）表明，显示为 `gone` 的上游视同不存在，因此检查的是 HEAD。所以，一个用 `-u` 推送（第 2 步）且已完全推送的分支，无论是否曾进入 `main`，都能通过检查：`-d` 会删除它，以退出码 0 退出，并且只在 stderr 上打印一条警告（`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`）。若随后按顺序执行上方代码块，远程分支也会被删除，再没有任何引用包含这些工作。没有上游的分支会与执行该命令的工作树的 HEAD 比较，因此当 HEAD 是包含它的堆叠分支（stacked branch）时，`-d` 会删除它，stderr 上没有任何输出。反过来，只要被检查的引用不包含分支的末端提交（tip），`-d` 就会拒绝删除一个*确实*已合并的分支：一种是远程分支被删除、上游随之消失后的 HEAD（例如尚未更新的本地 `main`），另一种是落后于末端提交的上游，原因是末端提交从另一个克隆推送、尚未获取到本地。末端提交因某个提交从未推送而领先于其上游，则不属于这种情况：该提交不在任何 PR 中，拒绝是正确的。通过 squash merge 合并的分支，只有在被检查的引用不包含其末端提交时才会被拒绝，例如上游消失后的 HEAD；只要它自己推送的上游仍然存在，`-d` 就会删除它。无论哪种情况，答案都一样：执行本步骤开头的检查，并且只有在检查通过时才用 `git branch -D` 删除。

### 第 6 步：列出并检查分支

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

**预期结果：** 清晰查看所有分支、其状态及跟踪关系。

**失败处理：** 若远程分支显示陈旧，运行 `git fetch --prune` 清理对已删除远程分支的引用。

## 验证清单

- [ ] 分支名称遵循已约定的命名规范
- [ ] 功能分支从正确的基础分支创建
- [ ] 本地分支跟踪对应的远程分支
- [ ] 已合并的分支在本地和远程均已清理
- [ ] 切换分支前工作区干净
- [ ] 暂存的更改未遗留孤立

## 常见问题

- **直接在 main 上工作**：应始终创建功能分支。直接提交到 main 会使 PR 创建和协作变得困难。
- **分支前忘记拉取**：从陈旧的本地 main 创建分支意味着起点已落后。请始终先执行 `git fetch origin`。
- **长期存活的分支**：存活数周的功能分支会积累大量合并冲突，应频繁同步并保持分支短期存活。
- **孤立的暂存记录**：`git stash` 是临时存储，不要将其用于长期工作，应改为提交或创建分支。
- **删除未合并的工作**：两个删除标志单独使用都不安全。`git branch -D` 不论合并状态如何都会删除；`git branch -d` 会删除已完全推送到其自身上游的未合并分支，或者在没有上游时，删除当前 HEAD 包含、但 `main` 并不包含的分支（且不发出任何警告）。无论用哪一个，都要先执行第 5 步开头的检查：PR 已 `MERGED` 到 `main`，且 `git merge-base --is-ancestor <branch> <headRefOid>` 以退出码 0 退出。
- **未清理远程引用**：GitHub 上删除的远程分支在本地仍会显示，直到执行 `git fetch --prune`。

## 相关技能

- `commit-changes` — 在分支上提交工作
- `create-pull-request` — 从功能分支创建 PR
- `resolve-git-conflicts` — 处理同步过程中的冲突
- `configure-git-repository` — 仓库设置与分支策略
