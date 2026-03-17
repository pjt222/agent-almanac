---
name: commit-changes
description: >
  暂存、提交和修改变更，使用规范化提交消息。涵盖审查变更、选择性暂存、
  使用 HEREDOC 格式编写描述性提交消息，以及验证提交历史。适用于将逻辑工作
  单元保存到版本控制、创建带有规范化消息的提交、修改最近的提交，或在提交
  前审查暂存的变更。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 提交变更

选择性暂存文件，编写清晰的提交消息，并验证提交历史。

## 适用场景

- 将逻辑工作单元保存到版本控制
- 创建带有描述性规范化消息的提交
- 修改最近的提交（消息或内容）
- 在提交之前审查将被提交的内容

## 输入

- **必需**：一个或多个已更改的文件用于提交
- **可选**：提交消息（如未提供将自动起草）
- **可选**：是否修改上一次提交
- **可选**：共同作者归属

## 步骤

### 第 1 步：审查当前变更

检查工作树状态并查看差异：

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

**预期结果：** 清晰了解所有已修改、已暂存和未跟踪的文件。

**失败处理：** 如果 `git status` 失败，验证你是否在 git 仓库内（`git rev-parse --is-inside-work-tree`）。

### 第 2 步：选择性暂存文件

暂存特定文件而非使用 `git add .` 或 `git add -A`，以避免意外包含敏感文件或无关变更：

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

在提交之前审查已暂存的内容：

```bash
git diff --staged
```

**预期结果：** 只有预期的文件和变更被暂存。没有 `.env`、凭证或大型二进制文件。

**失败处理：** 使用 `git reset HEAD <file>` 取消暂存意外添加的文件。如果敏感数据被暂存，在提交之前立即取消暂存。

### 第 3 步：编写提交消息

使用规范化提交格式。始终通过 HEREDOC 传递消息以确保正确格式化：

```bash
git commit -m "$(cat <<'EOF'
feat: add weighted mean calculation

Implements weighted_mean() with support for NA handling and
zero-weight filtering. Includes input validation for mismatched
vector lengths.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

规范化提交类型：

| 类型 | 使用场景 |
|------|---------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 仅文档变更 |
| `test` | 添加或更新测试 |
| `refactor` | 既不修复也不添加的代码变更 |
| `chore` | 构建、CI、依赖更新 |
| `style` | 格式化、空白（无逻辑变更） |

**预期结果：** 提交创建成功，带有描述性消息，解释*为什么*而非仅仅*什么*。

**失败处理：** 如果 pre-commit 钩子失败，修复问题，使用 `git add` 重新暂存，然后创建**新**提交（不要使用 `--amend`，因为失败的提交从未被创建）。

### 第 4 步：修改上次提交（可选）

仅在提交**尚未**推送到共享远程仓库时修改：

```bash
# Amend message only
git commit --amend -m "$(cat <<'EOF'
fix: correct weighted mean edge case for empty vectors

EOF
)"

# Amend with additional staged changes
git add forgotten-file.R
git commit --amend --no-edit
```

**预期结果：** 上一次提交就地更新。`git log -1` 显示修改后的内容。

**失败处理：** 如果提交已被推送，不要修改。改为创建新提交。强制推送修改后的提交到共享分支会导致历史分叉。

### 第 5 步：验证提交

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

**预期结果：** 提交出现在历史中，具有正确的消息、作者和文件变更。

**失败处理：** 如果提交包含错误的文件，使用 `git reset --soft HEAD~1` 撤销提交同时保持变更暂存，然后正确地重新提交。

## 验证清单

- [ ] 只有预期的文件包含在提交中
- [ ] 没有提交敏感数据（令牌、密码、`.env` 文件）
- [ ] 提交消息遵循规范化提交格式
- [ ] 消息正文解释了*为什么*做出变更
- [ ] `git log` 显示具有正确元数据的提交
- [ ] Pre-commit 钩子（如有）已通过

## 常见问题

- **一次提交太多内容**：每次提交应代表一个逻辑变更。将无关变更拆分为单独的提交
- **盲目使用 `git add .`**：始终先审查 `git status`。优先按名称暂存特定文件
- **修改已推送的提交**：绝不修改已推送到共享分支的提交。这会重写历史并给协作者带来问题
- **模糊的提交消息**："fix bug"或"update"什么都没说。描述变更了什么以及为什么
- **内容修改时忘记 `--no-edit`**：向上次提交添加遗忘的文件时，使用 `--no-edit` 保留现有消息
- **钩子失败导致 `--amend`**：当 pre-commit 钩子失败时，提交从未被创建。使用 `--amend` 会修改*上一次*提交。修复钩子问题后始终创建新提交

## 相关技能

- `manage-git-branches` — 提交前的分支工作流
- `create-pull-request` — 提交后的下一步
- `resolve-git-conflicts` — 处理 merge/rebase 期间的冲突
- `configure-git-repository` — 仓库设置和约定
