---
name: resolve-git-conflicts
description: >
  使用安全的恢复策略解决合并和变基冲突。涵盖识别冲突来源、读取冲突标记、
  选择解决策略，以及安全地继续或中止操作。适用于 git merge、rebase、
  cherry-pick 或 stash pop 报告冲突、git pull 导致更改冲突，或需要安全
  中止并重新开始失败的合并或变基操作。
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
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
---

# 解决 Git 冲突

识别、解决并从合并和变基冲突中恢复。

## 适用场景

- `git merge` 或 `git rebase` 报告冲突
- `git cherry-pick` 无法干净应用
- `git pull` 导致更改冲突
- `git stash pop` 与当前工作区冲突

## 输入

- **必需**：存在活跃冲突的仓库
- **可选**：首选解决策略（ours、theirs、手动）
- **可选**：关于哪些更改应优先的上下文信息

## 步骤

### 第 1 步：识别冲突来源

确定引起冲突的操作：

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

状态输出会告知哪些文件存在冲突以及当前进行中的操作。

**预期结果：** `git status` 显示列在"Unmerged paths"下的文件，并指示当前活跃的操作。

**失败处理：** 若 `git status` 显示工作区干净但预期存在冲突，则操作可能已完成或已中止。检查 `git log` 查看近期活动。

### 第 2 步：读取冲突标记

打开每个冲突文件，定位冲突标记：

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` 到 `=======`：当前分支的版本（或正在变基到的分支）
- `=======` 到 `>>>>>>>`：传入的更改（被合并的分支或正在应用的提交）

**预期结果：** 每个冲突文件包含一个或多个带有 `<<<<<<<`、`=======` 和 `>>>>>>>` 标记的块。

**失败处理：** 若未找到标记但文件显示为冲突，可能是二进制文件冲突或"已删除 vs 已修改"冲突。使用 `git diff --name-only --diff-filter=U` 查看完整冲突列表。

### 第 3 步：选择解决策略

**手动合并**（最常用）：编辑文件以逻辑方式合并两侧更改，然后删除所有冲突标记。

**采用我方**（保留当前分支版本）：

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**采用对方**（保留传入分支版本）：

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**预期结果：** 解决后，文件包含正确的合并内容，不残留任何冲突标记。

**失败处理：** 若选择了错误的一侧，可从合并基础重新读取冲突版本。在合并过程中，`git checkout -m path/to/file` 会重新创建冲突标记，让你重新尝试。

### 第 4 步：将文件标记为已解决

编辑完每个冲突文件后：

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

对"Unmerged paths"下列出的每个文件重复此操作。

**预期结果：** 所有文件从"Unmerged paths"移动到"Changes to be committed"，任何文件中均不残留冲突标记。

**失败处理：** 若 `git add` 失败或标记仍然存在，请重新打开文件，确保所有 `<<<<<<<`、`=======` 和 `>>>>>>>` 行已被删除。

### 第 5 步：继续操作

所有冲突解决后：

**合并操作**：

```bash
git commit
# Git auto-populates the merge commit message
```

**变基操作**：

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**cherry-pick 操作**：

```bash
git cherry-pick --continue
```

**stash pop 操作**：

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

**预期结果：** 操作完成，`git status` 显示干净的工作区（或在 rebase 过程中移至下一个提交）。

**失败处理：** 若 continue 命令失败，检查 `git status` 查看剩余未解决的文件。所有冲突必须解决后才能继续。

### 第 6 步：必要时中止操作

若解决过于复杂或选择了错误的方法，可安全中止：

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**预期结果：** 仓库恢复到操作开始前的状态，无数据丢失。

**失败处理：** 若中止失败（罕见情况），使用 `git reflog` 找到操作前的提交，并通过 `git reset --hard <commit>` 恢复。谨慎使用——此操作会丢弃未提交的更改。

### 第 7 步：验证解决结果

操作完成后：

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**预期结果：** 工作区干净，合并历史正确，测试通过。

**失败处理：** 若解决后测试失败，合并可能引入了逻辑错误，即使语法冲突已解决。请仔细审查差异并修复。

## 验证清单

- [ ] 所有文件中均不残留冲突标记（`<<<<<<<`、`=======`、`>>>>>>>`）
- [ ] `git status` 显示干净的工作区
- [ ] `git log` 中的合并/变基历史正确
- [ ] 冲突解决后测试通过
- [ ] 未引入意外的更改

## 常见问题

- **盲目采用一侧**：`--ours` 或 `--theirs` 会完全丢弃另一侧。仅在确定某个版本完全正确时使用。
- **代码中残留冲突标记**：编辑后始终搜索整个文件中的残留标记。部分解决会导致代码损坏。
- **变基过程中修改提交**：在交互式变基过程中，除非变基步骤明确要求，否则不要使用 `--amend`。改用 `git rebase --continue`。
- **中止时丢失工作**：`git rebase --abort` 和 `git merge --abort` 会丢弃所有解决工作。仅在想重新开始时才中止。
- **解决后不运行测试**：语法上干净的合并仍可能在逻辑上有误。始终运行测试。
- **变基后强制推送**：变基共享分支后，强制推送前请与协作者沟通，因为这会重写历史。

## 相关技能

- `commit-changes` — 冲突解决后的提交
- `manage-git-branches` — 导致冲突的分支工作流
- `configure-git-repository` — 仓库设置与合并策略
