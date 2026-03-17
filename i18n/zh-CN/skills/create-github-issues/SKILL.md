---
name: create-github-issues
description: >
  从审查发现或任务拆解中结构化创建 GitHub Issue。将相关发现分组为逻辑性 Issue，
  应用标签，并生成包含标准模板（摘要、发现和验收标准）的 Issue。
  专为使用 review-codebase 或类似审查技能的输出而设计。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
---

# 创建 GitHub Issue

从审查发现或任务拆解中结构化创建 GitHub Issue。将发现列表（来自 `review-codebase`、`security-audit-codebase` 或手动分析）转化为格式规范的 GitHub Issue，包含标签、验收标准和交叉引用。

## 适用场景

- 代码库审查产生了需要跟踪的发现表格后
- 规划会议识别出应成为 Issue 的工作项后
- 将 TODO 列表或待办事项转换为可跟踪的 GitHub Issue 时
- 批量创建需要一致格式和标签的相关 Issue 时

## 输入

- **必需**：`findings`——条目列表，每条至少包含标题和描述。理想情况下还包含：严重程度、受影响文件和建议标签
- **可选**：
  - `group_by`——将发现批量归入 Issue 的方式：`severity`（严重程度）、`file`（文件）、`theme`（主题）（默认：`theme`）
  - `label_prefix`——自动创建标签的前缀（默认：无）
  - `create_labels`——是否创建缺失的标签（默认：`true`）
  - `dry_run`——预览 Issue 而不实际创建（默认：`false`）

## 步骤

### 第 1 步：准备标签

确保所有所需标签在仓库中存在。

1. 列出现有标签：`gh label list --limit 100`
2. 识别发现所需的标签（来自严重程度、阶段或显式标签字段）
3. 将严重程度映射到标签（若未映射）：`critical`、`high-priority`、`medium-priority`、`low-priority`
4. 将阶段/主题映射到标签：`security`、`architecture`、`code-quality`、`accessibility`、`testing`、`performance`
5. 若 `create_labels` 为 true，创建缺失的标签：`gh label create "name" --color "hex" --description "desc"`
6. 使用一致的颜色：红色用于 critical/security，橙色用于 high，黄色用于 medium，蓝色用于 architecture，绿色用于 testing

**预期结果：** 发现引用的所有标签均在仓库中存在，未创建重复标签。

**失败处理：** 若 `gh` CLI 未认证，提示用户运行 `gh auth login`。若标签创建被拒绝（权限不足），在不创建标签的情况下继续，并记录缺失的标签。

### 第 2 步：分组发现

将相关发现批量归入逻辑性 Issue，避免 Issue 泛滥。

1. 若 `group_by` 为 `theme`：按阶段或类别分组（所有安全发现 → 1-2 个 Issue，所有无障碍问题 → 1 个 Issue）
2. 若 `group_by` 为 `severity`：按严重程度分组（所有 CRITICAL → 1 个 Issue，所有 HIGH → 1 个 Issue）
3. 若 `group_by` 为 `file`：按主要受影响文件分组
4. 在每组内按严重程度排序（CRITICAL 优先）
5. 若一组超过 8 条发现，按子主题拆分为子组
6. 每组对应一个 GitHub Issue

**预期结果：** 形成一组 Issue 分组，每组包含 1-8 条相关发现。Issue 总数应可管理（完整代码库审查通常为 5-15 个）。

**失败处理：** 若发现没有分组元数据，退回到每条发现对应一个 Issue。对于小型发现集（< 10 条）这是可接受的，但对于较大的发现集会产生过多 Issue。

### 第 3 步：撰写 Issue

使用标准模板构建每个 Issue。

1. **标题**：`[Severity] Theme: Brief description`——例如：`[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **正文**结构：
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. 应用标签：严重程度标签 + 主题标签 + 任何自定义标签
4. 若发现引用了特定文件，在正文中提及（不作为受理人）

**预期结果：** 每个 Issue 有清晰的标题、带严重程度标记的编号发现、复选框验收标准和适当的标签。

**失败处理：** 若正文超过 GitHub Issue 大小限制（65536 个字符），将 Issue 拆分为多个部分并相互交叉引用。

### 第 4 步：创建 Issue

使用 `gh` CLI 创建 Issue 并报告结果。

1. 若 `dry_run` 为 true，打印每个 Issue 的标题和正文，不实际创建，然后停止
2. 对每个已撰写的 Issue 执行创建：
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. 记录每个已创建 Issue 的 URL
4. 所有 Issue 创建完成后，打印汇总表：`#number | Title | Labels | Findings count`
5. 若 Issue 需要排序，添加交叉引用：编辑第一个 Issue，注明"Blocked by #X"或"See also #Y"

**预期结果：** 所有 Issue 创建成功，打印出包含 Issue 编号和 URL 的汇总表。

**失败处理：** 若单个 Issue 创建失败，记录错误并继续处理剩余 Issue，最后汇总报告失败情况。常见失败原因：认证已过期、未找到标签（若 `create_labels` 为 false）、网络超时。

## 验证清单

- [ ] 所有发现均在至少一个 Issue 中得到体现
- [ ] 每个 Issue 至少有一个标签
- [ ] 每个 Issue 有复选框形式的验收标准
- [ ] 未创建重复 Issue（对照现有开放 Issue 检查标题）
- [ ] Issue 数量与发现数量匹配合理（大型发现集不应 1:1 对应）
- [ ] 已打印包含所有 Issue URL 的汇总表

## 常见问题

- **Issue 泛滥**：每条发现创建一个 Issue 会产生 20+ 个难以管理的 Issue。应积极分组——完整审查产生 5-10 个 Issue 为理想状态
- **缺少验收标准**：没有复选框的 Issue 无法验证是否完成。每条发现至少应映射到一个复选框
- **标签混乱**：创建过多标签会使筛选失去意义。坚持使用严重程度 + 主题，而非每条发现单独建标签
- **引用了陈旧内容**：若从旧审查中创建 Issue，请先验证发现是否仍适用。代码可能已变更
- **忘记试运行**：对于大型发现集，始终先用 `dry_run: true` 预览。编辑计划比关闭 15 个错误 Issue 容易得多

## 相关技能

- `review-codebase` — 生成本技能使用的发现表格
- `review-pull-request` — 生成可转化为 Issue 的 PR 范围发现
- `manage-backlog` — 创建 Issue 后将其组织到冲刺和优先级中
- `create-pull-request` — 创建引用并关闭这些 Issue 的 PR
- `commit-changes` — 提交解决 Issue 的修复
