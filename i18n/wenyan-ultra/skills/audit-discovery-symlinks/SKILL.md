---
name: audit-discovery-symlinks
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Audit and repair Claude Code discovery symlinks for skills, agents, and teams.
  Compares registries against .claude/ directories at project and global levels,
  detects missing, broken, and extraneous symlinks, distinguishes almanac content
  from external projects, and optionally repairs gaps. Use after adding new skills
  or agents, after a repository rename or move, when slash commands stop working,
  or as a periodic health check.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: intermediate
  language: shell
  tags: maintenance, symlinks, discovery, claude-code, audit
---

# 審發現符連

## 用

- 新增技/將/隊於 almanac→審
- 庫改名或移→絕符連或破→審
- Claude Code 尋不得斜命或將→審
- 定期察以捕冊與發現徑之漂
- 新專案當共享 almanac 內容→審

**勿用**於初造符連樞。詳 [symlink-architecture guide](../../guides/symlink-architecture.md)。

## 入

| 參 | 類 | 必 | 述 |
|---|---|---|---|
| `almanac_path` | 串 | 否 | agent-almanac 根絕徑。略則自 `.claude/` 符連目標或 cwd 識 |
| `scope` | 列 | 否 | `project`、`global`、`both`（默 `both`） |
| `fix_mode` | 列 | 否 | `report`（默，唯審）、`auto`（修諸安題）、`interactive`（每修前問） |

## 行

### 一：識 almanac 徑

尋 agent-almanac 根目。

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

**得：** `ALMANAC_PATH` 指含 `skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml` 之目。

**敗：** 自識敗→問用者 `almanac_path`。almanac 根乃含 `skills/`、`agents/`、`teams/` 及其冊之目。

### 二：錄諸冊

自諸冊取技、將、隊之正典錄。

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

**得：** 計合冊頭之 `total_skills`、`total_agents`、`total_teams`。

**敗：** 計與頭異→冊自身不同步。記差於報而以實 `- id:` 條為真源續行。

### 三：審專案符連

察當專案目中 `.claude/skills/*`、`.claude/agents`、`.claude/teams`。

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

**得：** 零缺、零破。多餘項已分類且釋。

**敗：** `.claude/` 全不存→專案無發現設。記而跳全域審。

### 四：審全域符連

察 `~/.claude/skills/*` 與 `~/.claude/agents`。且察 `~/.claude/teams` 非符連（當缺或為實目以存 TeamCreate 運行態）。

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

**得：** 零缺 almanac 技、零破。外部內容（peon-ping 等）列而不旗為誤。

**敗：** `~/.claude/` 不存→全域樞未設。詳 [symlink-architecture guide](../../guides/symlink-architecture.md)。

### 五：生審報

出兩層概表。

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

**得：** 清可行之報。零題即健。

**敗：** 報生自身敗→退而出諸計與列至控台。

### 六：修（可選）

若 `fix_mode` 為 `auto` 或 `interactive`，修所發之題。

**6a. 造缺之專案符連：**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. 造缺之全域符連：**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. 除破符連：**
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

**6d. 除舊 almanac 條：**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. 修缺之目符連（將/隊）：**
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

**要：** 勿除分類為外部之項。彼屬他專案（如 peon-ping），必保。

**得：** 諸缺符連造、諸破符連除、諸舊 almanac 條清。外部不動。

**敗：** `ln -s` 因目標徑已有檔/目（如空目代符連）而敗→先除阻：空目以 `rmdir`，非空目旗為手察。

### 七：驗

重行三、四步以證修。

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

**得：** 零缺、零破。計合冊總（於 almanac 內容）。外部內容別列。

**敗：** 修後仍題→報具體敗。常因：`~/.claude/` 權限、`/mnt/` 徑 NTFS 長限、非空目阻符連造。

## 驗

- [ ] almanac 徑正識且含三冊
- [ ] 冊計合 `total_*` 頭值（或差已記）
- [ ] 專案層技、將、隊已審
- [ ] 全域層技、將、隊已審
- [ ] 外部內容識別且排於題計外
- [ ] `_template` 旗為多餘（不當於發現徑）
- [ ] 審報生附清計與可行列
- [ ] 若 `fix_mode` 為 `auto`：諸安修已施，外部不動
- [ ] 修後驗證零缺、零破

## 忌

1. **混外部與缺之 almanac 內容**：`~/.claude/skills/` 或含他專案技（如 peon-ping）。分類為舊或多餘前，先察符連目標是否於 almanac 徑下。

2. **除外部**：勿刪非指 almanac 之項。彼屬他專案，有意為之。

3. **符連 `_template`**：模板乃支架，非用之內容。`_template` 目不當於 `.claude/skills/` 或 `.claude/agents/`。批量同步腳本必明跳之。

4. **舊 `.claude/teams` 符連**：指隊定義之 `.claude/teams` 符連乃錯設。Claude Code 之 `TeamCreate` 用 `~/.claude/teams/` 存運行態（config.json、收件箱）。若此徑為符連指 almanac `teams/`，運行物會寫入 git 追跡庫。除任 `.claude/teams` 符連於專案或全域層。

5. **相對對絕對徑**：專案層技符連用相對徑（`../../skills/<name>`）。全域符連用絕對徑（`/path/to/almanac/skills/<name>`）。混則移時破。

6. **冊頭對實計**：冊頭 `total_skills` 或陳（有人增條而不更頭）。信實 `- id:` 條，非頭。

## 參

- [repair-broken-references](../repair-broken-references/SKILL.md) — 通用破鏈與引修
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 專案目結構整
- [create-skill](../create-skill/SKILL.md) — 含新技符連造（步 13）
- [create-agent](../create-agent/SKILL.md) — 含發現驗（步 10）
- [create-team](../create-team/SKILL.md) — 隊造與冊整
