---
name: manage-git-branches
description: >
  创建、跟踪、切换、同步并清理 Git 分支。涵盖命名规范、使用暂存区安全切换分支、
  上游同步，以及清理已合并分支。适用于开始开发新功能或修复问题、在不同分支间
  切换任务、将功能分支与 main 保持同步，或在合并 PR 后清理分支。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
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
|--------|---------|---------|
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

PR 合并后，删除陈旧分支：

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

**失败处理：** `git branch -d` 拒绝删除未合并的分支。若分支通过 GitHub 上的 squash merge 合并，Git 可能无法识别为已合并状态，确认工作已保存后可使用 `git branch -D` 强制删除。

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
- **删除未合并的工作**：`git branch -D` 是破坏性操作。强制删除前请用 `git log branch-name` 核实。
- **未清理远程引用**：GitHub 上删除的远程分支在本地仍会显示，直到执行 `git fetch --prune`。

## 相关技能

- `commit-changes` — 在分支上提交工作
- `create-pull-request` — 从功能分支创建 PR
- `resolve-git-conflicts` — 处理同步过程中的冲突
- `configure-git-repository` — 仓库设置与分支策略
