---
name: audit-discovery-symlinks
description: >
  审计并修复用于技能、代理和团队的 Claude Code 发现符号链接。在项目和全局
  层面将注册表与 .claude/ 目录进行比较，检测缺失、损坏和多余的符号链接，
  区分 almanac 内容与外部项目，可选地修复缺口。在添加新技能或代理之后、
  仓库重命名或移动之后、斜杠命令停止工作时，或作为定期健康检查时使用。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: shell
  tags: maintenance, symlinks, discovery, claude-code, audit
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# audit-discovery-symlinks（审计发现符号链接）

## 适用场景

- 在向 almanac 添加新技能、代理或团队之后
- 在仓库重命名或移动可能破坏绝对符号链接之后
- 当 Claude Code 中找不到斜杠命令或代理时
- 作为定期健康检查，捕捉注册表与发现路径之间的漂移
- 当上线一个应该发现共享 almanac 内容的新项目时

**请勿用于**从零创建初始符号链接中心。请参阅 [symlink-architecture 指南](../../guides/symlink-architecture.md)进行首次设置。

## 输入

| 参数 | 类型 | 必需 | 描述 |
|-----------|------|----------|-------------|
| `almanac_path` | string | 否 | agent-almanac 根的绝对路径。若省略则从 `.claude/` 符号链接目标或 cwd 自动检测 |
| `scope` | enum | 否 | `project`、`global` 或 `both`（默认：`both`） |
| `fix_mode` | enum | 否 | `report`（默认：仅审计）、`auto`（修复所有安全问题）、`interactive`（每次修复前询问） |

## 步骤

### 第 1 步：识别 Almanac 路径

定位 agent-almanac 根目录。

```bash
# Auto-detect from current project's .claude/agents symlink
ALMANAC_PATH=$(readlink -f .claude/agents 2>/dev/null | sed 's|/agents$||')

# Fallback: check if cwd is the almanac
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  if [ -f "skills/_registry.yml" ]; then
    ALMANAC_PATH=$(pwd)
  fi
fi

# Fallback: check global agents symlink
if [ -z "$ALMANAC_PATH" ] || [ ! -f "$ALMANAC_PATH/skills/_registry.yml" ]; then
  ALMANAC_PATH=$(readlink -f ~/.claude/agents 2>/dev/null | sed 's|/agents$||')
fi

echo "Almanac path: $ALMANAC_PATH"
```

**预期结果：** `ALMANAC_PATH` 指向包含 `skills/_registry.yml`、`agents/_registry.yml` 和 `teams/_registry.yml` 的目录。

**失败处理：** 若自动检测失败，请向用户询问 `almanac_path` 输入。almanac 根是包含 `skills/`、`agents/`、`teams/` 及其注册表的目录。

### 第 2 步：清点注册表

从注册表提取技能、代理和团队的规范列表。

```bash
# Count registered skills (entries with "- id:" under domain sections)
REGISTERED_SKILLS=$(grep '^ \{6\}- id:' "$ALMANAC_PATH/skills/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_SKILL_COUNT=$(echo "$REGISTERED_SKILLS" | wc -l)

# Count registered agents
REGISTERED_AGENTS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/agents/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_AGENT_COUNT=$(echo "$REGISTERED_AGENTS" | wc -l)

# Count registered teams
REGISTERED_TEAMS=$(grep '^ \{2\}- id:' "$ALMANAC_PATH/teams/_registry.yml" | awk '{print $3}' | sort)
REGISTERED_TEAM_COUNT=$(echo "$REGISTERED_TEAMS" | wc -l)

echo "Registered: $REGISTERED_SKILL_COUNT skills, $REGISTERED_AGENT_COUNT agents, $REGISTERED_TEAM_COUNT teams"
```

**预期结果：** 计数与每个注册表头部中的 `total_skills`、`total_agents`、`total_teams` 值匹配。

**失败处理：** 若计数与头部总数不一致，注册表本身已不同步。在报告中标注差异，但继续以实际的 `- id:` 条目作为真相来源。

### 第 3 步：审计项目级符号链接

检查当前项目目录中的 `.claude/skills/*`、`.claude/agents`、`.claude/teams`。

```bash
PROJECT_CLAUDE=".claude"

# --- Skills ---
# Items on disk (excluding _template)
PROJECT_SKILLS=$(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | sort)
PROJECT_SKILL_COUNT=$(echo "$PROJECT_SKILLS" | grep -c .)

# Missing: in registry but not in project .claude/skills/
MISSING_PROJECT_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_PROJECT_SKILLS=$(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Extraneous: in project but not in registry (and not external)
EXTRA_PROJECT_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$PROJECT_SKILLS"))

# --- Agents ---
if [ -L "$PROJECT_CLAUDE/agents" ] || [ -d "$PROJECT_CLAUDE/agents" ]; then
  PROJECT_AGENT_STATUS="OK"
  test -d "$PROJECT_CLAUDE/agents" || PROJECT_AGENT_STATUS="BROKEN"
  PROJECT_AGENT_COUNT=$(ls "$PROJECT_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  PROJECT_AGENT_STATUS="MISSING"
  PROJECT_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A .claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$PROJECT_CLAUDE/teams" ]; then
  PROJECT_TEAM_STATUS="MISCONFIGURED"
  PROJECT_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  PROJECT_TEAM_STATUS="OK"
  PROJECT_TEAM_COUNT=0
fi
```

**预期结果：** 缺失为零、损坏为零。多余项已分类并解释。

**失败处理：** 若 `.claude/` 完全不存在，项目没有发现设置。记录此事并跳到全局审计。

### 第 4 步：审计全局符号链接

检查 `~/.claude/skills/*` 和 `~/.claude/agents`。同时检查 `~/.claude/teams` 不是符号链接（应为缺失或为 TeamCreate 运行时状态准备的目录）。

```bash
GLOBAL_CLAUDE="$HOME/.claude"

# --- Skills ---
GLOBAL_SKILLS_ALL=$(ls "$GLOBAL_CLAUDE/skills/" 2>/dev/null | sort)

# Classify each entry: almanac vs external
ALMANAC_GLOBAL_SKILLS=""
EXTERNAL_GLOBAL_SKILLS=""
for item in $GLOBAL_SKILLS_ALL; do
  target=$(readlink -f "$GLOBAL_CLAUDE/skills/$item" 2>/dev/null)
  if [ -z "$target" ]; then
    # Real directory (not a symlink) — external
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  elif echo "$target" | grep -q "^$ALMANAC_PATH"; then
    ALMANAC_GLOBAL_SKILLS="$ALMANAC_GLOBAL_SKILLS $item"
  else
    EXTERNAL_GLOBAL_SKILLS="$EXTERNAL_GLOBAL_SKILLS $item"
  fi
done

# Filter: _template is always extraneous for almanac content
ALMANAC_GLOBAL_SKILLS=$(echo "$ALMANAC_GLOBAL_SKILLS" | tr ' ' '\n' | grep -v '^_template$' | grep -v '^$' | sort)

# Missing: in registry but not in global almanac skills
MISSING_GLOBAL_SKILLS=$(comm -23 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# Broken: symlink exists but target doesn't resolve
BROKEN_GLOBAL_SKILLS=$(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -printf '%f\n' 2>/dev/null | sort)

# Stale almanac entries: in global almanac set but not in registry
STALE_GLOBAL_SKILLS=$(comm -13 <(echo "$REGISTERED_SKILLS") <(echo "$ALMANAC_GLOBAL_SKILLS"))

# --- Agents ---
if [ -L "$GLOBAL_CLAUDE/agents" ] || [ -d "$GLOBAL_CLAUDE/agents" ]; then
  GLOBAL_AGENT_STATUS="OK"
  test -d "$GLOBAL_CLAUDE/agents" || GLOBAL_AGENT_STATUS="BROKEN"
  GLOBAL_AGENT_COUNT=$(ls "$GLOBAL_CLAUDE/agents/"*.md 2>/dev/null | wc -l)
else
  GLOBAL_AGENT_STATUS="MISSING"
  GLOBAL_AGENT_COUNT=0
fi

# --- Teams ---
# Teams are NOT symlinked. TeamCreate uses ~/.claude/teams/ for runtime state.
# A ~/.claude/teams symlink is a misconfiguration — warn if found.
if [ -L "$GLOBAL_CLAUDE/teams" ]; then
  GLOBAL_TEAM_STATUS="MISCONFIGURED"
  GLOBAL_TEAM_COUNT=0
  # Stale symlink — should be removed to avoid collision with TeamCreate
else
  GLOBAL_TEAM_STATUS="OK"
  GLOBAL_TEAM_COUNT=0
fi
```

**预期结果：** 缺失的 almanac 技能为零、损坏为零。外部内容（peon-ping 等）被列出但不标记为错误。

**失败处理：** 若 `~/.claude/` 不存在，全局中心未设置。请参阅 [symlink-architecture 指南](../../guides/symlink-architecture.md)进行初始设置。

### 第 5 步：生成审计报告

产出涵盖两个层级的摘要表。

```markdown
# Discovery Symlink Audit Report

**Date**: YYYY-MM-DD
**Almanac**: <almanac_path>
**Scope**: both | project | global

## Summary

| Content | Registered | Project | Global (almanac) | Global (external) |
|---------|------------|---------|-------------------|-------------------|
| Skills  | N          | N       | N                 | N                 |
| Agents  | N          | STATUS  | STATUS            | —                 |
| Teams   | N          | STATUS  | STATUS            | —                 |

## Issues

### Missing (registered but no symlink)
- Project skills: [list or "none"]
- Global skills: [list or "none"]

### Broken (symlink exists, target gone)
- Project: [list or "none"]
- Global: [list or "none"]

### Extraneous
- Stale almanac (in discovery but not registry): [list or "none"]
- _template in discovery path: [yes/no]
- External content (non-almanac): [list — informational only]
```

**预期结果：** 清晰、可执行的报告。零问题意味着健康状况良好。

**失败处理：** 若报告生成本身失败，将原始计数和列表输出到控制台作为后备。

### 第 6 步：修复（可选）

若 `fix_mode` 为 `auto` 或 `interactive`，修复发现的问题。

**6a. 创建缺失的项目符号链接：**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. 创建缺失的全局符号链接：**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. 移除损坏的符号链接：**
```bash
# Project
for broken in $BROKEN_PROJECT_SKILLS; do
  rm "$PROJECT_CLAUDE/skills/$broken"
done

# Global
for broken in $BROKEN_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$broken"
done
```

**6d. 移除过时的 almanac 条目：**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. 修复缺失的目录符号链接（agents/teams）：**
```bash
# Project agents
if [ "$PROJECT_AGENT_STATUS" = "MISSING" ]; then
  ln -s ../agents "$PROJECT_CLAUDE/agents"
fi

# Project teams
if [ "$PROJECT_TEAM_STATUS" = "MISSING" ]; then
  ln -s ../teams "$PROJECT_CLAUDE/teams"
fi

# Global agents
if [ "$GLOBAL_AGENT_STATUS" = "MISSING" ]; then
  ln -s "$ALMANAC_PATH/agents" "$GLOBAL_CLAUDE/agents"
fi

# Global teams
if [ "$GLOBAL_TEAM_STATUS" = "MISSING" ]; then
  ln -sf "$ALMANAC_PATH/teams" "$GLOBAL_CLAUDE/teams"
fi
```

**重要：** 切勿移除分类为外部的项。它们属于其他项目（如 peon-ping），必须保留。

**预期结果：** 已创建所有缺失的符号链接、移除所有损坏的符号链接、清理所有过时的 almanac 条目。外部内容未被触动。

**失败处理：** 若 `ln -s` 因目标路径存在文件/目录而失败（如空目录而非符号链接），先用 `rmdir`（空目录）移除阻塞物或标记以供手动审查（非空目录）。

### 第 7 步：验证

重新运行第 3-4 步的审计检查以确认修复。

```bash
echo "=== Post-repair verification ==="
echo "Project skills: $(ls "$PROJECT_CLAUDE/skills/" 2>/dev/null | grep -v '^_template$' | wc -l)"
echo "Global skills (almanac): $(echo "$ALMANAC_GLOBAL_SKILLS" | wc -w)"
echo "Broken project: $(find "$PROJECT_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Broken global:  $(find "$GLOBAL_CLAUDE/skills/" -maxdepth 1 -type l ! -exec test -e {} \; -print 2>/dev/null | wc -l)"
echo "Project agents: $PROJECT_AGENT_STATUS ($PROJECT_AGENT_COUNT .md files)"
echo "Global agents:  $GLOBAL_AGENT_STATUS ($GLOBAL_AGENT_COUNT .md files)"
echo "Project teams:  $PROJECT_TEAM_STATUS ($PROJECT_TEAM_COUNT .md files)"
echo "Global teams:   $GLOBAL_TEAM_STATUS ($GLOBAL_TEAM_COUNT .md files)"
```

**预期结果：** 缺失为零、损坏为零。计数与已注册总数匹配（对 almanac 内容）。外部内容单独列出。

**失败处理：** 若修复后仍有问题，报告具体故障。常见原因：`~/.claude/` 上的权限错误、`/mnt/` 路径上的 NTFS 路径长度限制，或非空目录阻塞符号链接创建。

## 验证清单

- [ ] 正确识别 almanac 路径，并包含所有三个注册表
- [ ] 注册表计数匹配 `total_*` 头部值（或已记录差异）
- [ ] 已审计项目级技能、代理和团队
- [ ] 已审计全局级技能、代理和团队
- [ ] 已识别外部内容（非 almanac）并将其排除在问题计数之外
- [ ] `_template` 条目已标记为多余（绝不属于发现路径）
- [ ] 已生成带有清晰计数和可执行列表的审计报告
- [ ] 若 `fix_mode` 为 `auto`：已应用所有安全修复，外部内容未被触动
- [ ] 修复后验证确认缺失为零、损坏为零

## 常见问题

1. **将外部内容与缺失的 almanac 内容混淆**：`~/.claude/skills/` 可能包含其他项目的技能（如 peon-ping）。在将符号链接归类为过时或多余之前，始终检查目标是否在 almanac 路径下。

2. **移除外部内容**：切勿删除不指向 almanac 的项。它们属于其他项目，是有意为之。

3. **符号链接 `_template` 目录**：模板是脚手架，不是可消费内容。`_template` 目录绝不应出现在 `.claude/skills/` 或 `.claude/agents/` 中。批量同步脚本必须显式跳过它。

4. **过时的 `.claude/teams` 符号链接**：指向团队定义的 `.claude/teams` 符号链接是错误配置。Claude Code 的 `TeamCreate` 使用 `~/.claude/teams/` 作为运行时状态（config.json、收件箱）。若此路径是指向 almanac 的 `teams/` 目录的符号链接，运行时工件将被写入 git 跟踪的仓库。移除在项目或全局级别找到的任何 `.claude/teams` 符号链接。

5. **相对 vs 绝对路径**：项目级技能符号链接使用相对路径（`../../skills/<name>`）。全局符号链接使用绝对路径（`/path/to/almanac/skills/<name>`）。混用这些模式会在移动时导致破坏。

6. **注册表头部 vs 实际计数**：注册表头部中的 `total_skills` 字段可能过时（若有人添加条目而未更新计数）。信任实际的 `- id:` 条目，而非头部。

## 相关技能

- [repair-broken-references](../repair-broken-references/SKILL.md) —— 一般性损坏链接和引用修复
- [tidy-project-structure](../tidy-project-structure/SKILL.md) —— 项目目录组织
- [create-skill](../create-skill/SKILL.md) —— 包括为新技能创建符号链接（第 13 步）
- [create-agent](../create-agent/SKILL.md) —— 包括发现验证（第 10 步）
- [create-team](../create-team/SKILL.md) —— 带注册表整合的团队创建
