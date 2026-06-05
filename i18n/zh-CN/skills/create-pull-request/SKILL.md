---
name: create-pull-request
description: >
  使用 GitHub CLI 创建和管理拉取请求。涵盖分支准备、编写 PR 标题和描述、
  创建 PR、处理评审反馈，以及合并/清理工作流。适用于从功能或修复分支提交
  变更以供评审、将已完成的工作合并到主分支、请求协作者进行代码评审，或
  记录一组变更的目的和范围。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
  locale: zh-CN
  source_locale: en
  source_commit: 6a868d56
  translator: Claude Opus 4.6
  translation_date: "2026-03-13"
---

# 创建拉取请求

使用清晰的标题、结构化的描述和正确的分支设置创建 GitHub 拉取请求。

## 适用场景

- 从功能或修复分支提交变更以供评审
- 将已完成的工作合并到主分支
- 请求协作者进行代码评审
- 记录一组变更的目的和范围

## 输入

- **必需**：包含已提交变更的功能分支
- **必需**：要合并到的基准分支（通常为 `main`）
- **可选**：要请求评审的人员
- **可选**：标签或里程碑
- **可选**：草稿状态

## 步骤

### 第 1 步：确保分支就绪

验证分支已与基准分支同步，且所有变更已提交：

```bash
# 检查未提交的变更
git status

# 从远程获取最新代码
git fetch origin

# 在最新的 main 上变基（或合并）
git rebase origin/main
```

**预期结果：** 分支领先于 `origin/main`，无未提交的变更且无冲突。

**失败处理：** 如果变基产生冲突，解决冲突（参见 `resolve-git-conflicts` 技能），然后执行 `git rebase --continue`。如果分支已严重偏离，考虑改用 `git merge origin/main`。

### 第 2 步：审查分支上的所有变更

检查将包含在 PR 中的完整差异和提交历史：

```bash
# 查看此分支上的所有提交（不在 main 上的）
git log origin/main..HEAD --oneline

# 查看与 main 的完整差异
git diff origin/main...HEAD

# 检查分支是否跟踪远程并已推送
git status -sb
```

**预期结果：** 所有提交都与 PR 相关。差异仅显示预期的变更。

**失败处理：** 如果存在无关的提交，考虑使用交互式变基在创建 PR 前清理历史。

### 第 3 步：推送分支

```bash
# 推送分支到远程（设置上游跟踪）
git push -u origin HEAD
```

**预期结果：** 分支出现在 GitHub 远程仓库。

**失败处理：** 如果推送被拒绝，先使用 `git pull --rebase origin <branch>` 拉取并解决冲突。

### 第 4 步：编写 PR 标题和描述

标题控制在 70 个字符以内。详细内容写在正文中：

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

创建草稿 PR：

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**预期结果：** 在 GitHub 上创建 PR 并返回 URL。描述清楚传达了变更内容和验证方法。

**失败处理：** 如果 `gh` 未认证，运行 `gh auth login`。如果基准分支不正确，使用 `--base main` 指定。

### 第 5 步：处理评审反馈

回应评审意见并推送更新：

```bash
# 查看 PR 评论
gh api repos/{owner}/{repo}/pulls/{number}/comments

# 查看 PR 检查状态
gh pr checks

# 完成修改后，提交并推送
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**预期结果：** 新的提交出现在 PR 上。评审意见已得到处理。

**失败处理：** 如果推送后 CI 检查失败，使用 `gh pr checks` 阅读检查输出并在请求重新评审前修复问题。

### 第 6 步：合并与清理

获得批准后：

```bash
# 合并 PR（压缩合并保持历史整洁）
gh pr merge --squash --delete-branch

# 或保留所有提交的合并
gh pr merge --merge --delete-branch

# 或变基合并（线性历史）
gh pr merge --rebase --delete-branch
```

合并后更新本地 main：

```bash
git checkout main
git pull origin main
```

**预期结果：** PR 已合并，远程分支已删除，本地 main 已更新。

**失败处理：** 如果合并被失败的检查或缺少批准所阻止，先解决这些问题。不要在未解决阻止条件的情况下强制合并。

## 验证清单

- [ ] PR 标题简洁（70 字符以内）且具有描述性
- [ ] PR 正文包含变更摘要和测试计划
- [ ] 分支上的所有提交都与 PR 相关
- [ ] CI 检查通过
- [ ] 分支已与基准分支同步
- [ ] 已指定评审人（如仓库设置要求）
- [ ] 差异中无敏感数据

## 常见问题

- **PR 过大**：保持 PR 专注于单个功能或修复。大型 PR 更难评审且更容易产生合并冲突。
- **缺少测试计划**：始终描述如何验证变更，即使是文档类 PR。
- **分支过时**：如果基准分支已大幅前进，在创建 PR 前先变基以减少合并冲突。
- **评审期间强制推送**：避免对有未处理评审意见的分支强制推送。推送新提交以便评审者看到增量变更。
- **不阅读 CI 输出**：在请求重新评审前检查 `gh pr checks`。CI 失败会浪费评审者的时间。
- **忘记删除分支**：合并时使用 `--delete-branch` 保持远程仓库整洁。

## 相关技能

- `commit-changes` - 为 PR 创建提交
- `manage-git-branches` - 分支创建和命名规范
- `resolve-git-conflicts` - 处理变基/合并时的冲突
- `create-github-release` - 合并后发布版本
