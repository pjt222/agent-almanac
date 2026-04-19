---
name: audit-discovery-symlinks
locale: wenyan-lite
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

# audit-discovery-symlinks

## 適用時機

- 為 almanac 新增技能、代理或團隊之後
- 倉庫改名或移動後可能斷絕絕對符號鏈之時
- Claude Code 中無法尋得斜線指令或代理之時
- 作為定期健檢，以察註冊表與探查路徑之偏離
- 新項目接入，期能探查共享之 almanac 內容之時

**勿**以此從零建立初始符號鏈樞紐。首次設置參 [symlink-architecture guide](../../guides/symlink-architecture.md)。

## 輸入

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `almanac_path` | string | No | Absolute path to agent-almanac root. Auto-detected from `.claude/` symlink targets or cwd if omitted |
| `scope` | enum | No | `project`, `global`, or `both` (default: `both`) |
| `fix_mode` | enum | No | `report` (default: audit only), `auto` (fix all safe issues), `interactive` (prompt before each fix) |

## 步驟

### 步驟一：判明 almanac 路徑

尋得 agent-almanac 根目錄。

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

**預期：** `ALMANAC_PATH` 指向一目錄，內含 `skills/_registry.yml`、`agents/_registry.yml` 與 `teams/_registry.yml`。

**失敗時：** 自動偵測失敗時，向用戶索取 `almanac_path` 輸入。almanac 根即含 `skills/`、`agents/`、`teams/` 及其註冊表之目錄。

### 步驟二：盤點註冊表

由註冊表抽取技能、代理、團隊之規範清單。

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

**預期：** 計數與各註冊表首部之 `total_skills`、`total_agents`、`total_teams` 相符。

**失敗時：** 計數與首部總額相異時，註冊表本身已失同步。於報告中記此差，然以實際 `- id:` 條目為真相之源，繼續進行。

### 步驟三：審計項目層級符號鏈

查當前項目目錄下之 `.claude/skills/*`、`.claude/agents`、`.claude/teams`。

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

**預期：** 零缺失、零斷鏈。多餘項目已分類並說明。

**失敗時：** 若 `.claude/` 全無，項目尚無探查設置。記此，直接進入全域審計。

### 步驟四：審計全域符號鏈

查 `~/.claude/skills/*` 與 `~/.claude/agents`。並驗 `~/.claude/teams` 非符號鏈（宜缺，或為 TeamCreate 運行時狀態之目錄）。

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

**預期：** 零缺失之 almanac 技能、零斷鏈。外部內容（peon-ping 等）列出但不視為錯誤。

**失敗時：** 若 `~/.claude/` 不存在，則全域樞紐未設置。初次設置參 [symlink-architecture guide](../../guides/symlink-architecture.md)。

### 步驟五：產出審計報告

產出涵蓋雙層之摘要表。

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

**預期：** 清晰、可行之報告。零問題即意健康無虞。

**失敗時：** 若報告生成本身失敗，退而輸出原始計數與清單至終端。

### 步驟六：修復（選擇性）

若 `fix_mode` 為 `auto` 或 `interactive`，即修發現之問題。

**6a. 建項目層級之缺失符號鏈：**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. 建全域層級之缺失符號鏈：**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. 清除斷鏈：**
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

**6d. 清除陳舊 almanac 條目：**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. 修復缺失之目錄符號鏈（代理／團隊）：**
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

**要訣：** 切勿刪除分類為外部之項目。彼屬他項目（如 peon-ping），須保留。

**預期：** 所有缺失鏈皆已建立，所有斷鏈皆已清除，所有陳舊 almanac 條目皆已淨。外部內容毫髮無損。

**失敗時：** `ln -s` 因目標路徑已存在文件／目錄（如空目錄而非鏈）而失敗時，先以 `rmdir`（空目錄）清障，或標記為人工審查（非空目錄）。

### 步驟七：驗證

重跑第三、四步之審計檢查以確認修復。

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

**預期：** 零缺失、零斷鏈。計數與註冊總額相符（almanac 內容而言）。外部內容另列。

**失敗時：** 修復後仍有問題時，報具體失敗。常見原因：`~/.claude/` 權限錯誤、`/mnt/` 路徑上 NTFS 之路徑長度限制、或非空目錄阻擋符號鏈之建立。

## 驗證

- [ ] almanac 路徑正確識別，含三份註冊表
- [ ] 註冊計數與 `total_*` 首部值相符（或記差）
- [ ] 項目層級之技能、代理、團隊皆已審計
- [ ] 全域層級之技能、代理、團隊皆已審計
- [ ] 外部內容（非 almanac）已識別並排除於問題計數之外
- [ ] `_template` 條目已標為多餘（從不屬於探查路徑）
- [ ] 審計報告已生成，計數清晰、清單可行
- [ ] 若 `fix_mode` 為 `auto`：所有安全修復已應用，外部內容無損
- [ ] 修復後驗證顯示零缺失、零斷鏈

## 常見陷阱

1. **混淆外部內容與 almanac 缺失內容**：`~/.claude/skills/` 或含他項目之技能（如 peon-ping）。分類為陳舊或多餘之前，務必查鏈之目標是否在 almanac 路徑之下。

2. **刪除外部內容**：從不刪除非指向 almanac 之項目。彼屬他項目，本為有意設置。

3. **對 `_template` 目錄建鏈**：模板乃鷹架，非可用內容。`_template` 目錄從不應出現於 `.claude/skills/` 或 `.claude/agents/`。批量同步腳本務必明確略過之。

4. **陳舊之 `.claude/teams` 符號鏈**：指向團隊定義之 `.claude/teams` 符號鏈乃錯配。Claude Code 之 `TeamCreate` 以 `~/.claude/teams/` 為運行時狀態（config.json、收件箱）。若此路徑為指向 almanac `teams/` 之符號鏈，運行時產物將寫入 git 追蹤之倉庫。任何於項目或全域層級發現之 `.claude/teams` 符號鏈，皆宜清除。

5. **相對與絕對路徑**：項目層級之技能符號鏈用相對路徑（`../../skills/<name>`）。全域符號鏈用絕對路徑（`/path/to/almanac/skills/<name>`）。混用此模式會於移動時斷裂。

6. **註冊表首部與實際計數**：註冊表首部之 `total_skills` 欄位可能因有人新增條目未更新計數而陳舊。信實際 `- id:` 條目，勿信首部。

## 相關技能

- [repair-broken-references](../repair-broken-references/SKILL.md) — 通用斷鏈與參照修復
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 項目目錄組織
- [create-skill](../create-skill/SKILL.md) — 為新技能建符號鏈（步驟 13）
- [create-agent](../create-agent/SKILL.md) — 含探查驗證（步驟 10）
- [create-team](../create-team/SKILL.md) — 團隊建立並整合至註冊表
