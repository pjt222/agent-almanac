---
name: audit-discovery-symlinks
locale: wenyan
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

## 用時

- 新增技能、代理、團隊於 almanac 後
- 庫易名或遷位，絕對符連或已斷
- Claude Code 不見斜杠命令或代理
- 定期察其康，覺察註冊與發現之徑之漂
- 新項目初立，欲發現共用之 almanac 內容

**勿用**於始建符連樞紐之從無至有。見 [symlink-architecture guide](../../guides/symlink-architecture.md) 以初立之。

## 入

| 參 | 類 | 必 | 述 |
|-----------|------|----------|-------------|
| `almanac_path` | string | 否 | agent-almanac 之絕對徑。若略則由 `.claude/` 之符連標的或 cwd 自辨 |
| `scope` | enum | 否 | `project`、`global`、或 `both`（默 `both`） |
| `fix_mode` | enum | 否 | `report`（默：唯察）、`auto`（盡修諸安之疵）、`interactive`（修前逐問） |

## 法

### 第一步：識 almanac 之徑

尋 agent-almanac 之根目錄。

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

**得：** `ALMANAC_PATH` 指一目錄，含 `skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`。

**敗則：** 若自辨失敗，問用者以 `almanac_path`。almanac 根乃含 `skills/`、`agents/`、`teams/` 及其註冊之目錄。

### 第二步：列註冊之目

自註冊抽其正典之技能、代理、團隊之列。

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

**得：** 數與各註冊頭之 `total_skills`、`total_agents`、`total_teams` 相符。

**敗則：** 若數與頭之總不合，註冊自身不齊。記其異於報告而仍以實際之 `- id:` 條為準。

### 第三步：察項目之符連

察當前項目目錄之 `.claude/skills/*`、`.claude/agents`、`.claude/teams`。

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

**得：** 無闕、無斷。冗餘者皆已分類而釋。

**敗則：** 若 `.claude/` 全無，項目無發現之設。記其事而跳至全域之審。

### 第四步：察全域之符連

察 `~/.claude/skills/*` 與 `~/.claude/agents`。亦察 `~/.claude/teams` *非*符連（宜闕，或為 TeamCreate 運行狀態之目錄）。

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

**得：** almanac 之技能無闕、無斷。外來之內容（peon-ping 等）列而不標為錯。

**敗則：** 若 `~/.claude/` 無之，全域之樞紐未立。見 [symlink-architecture guide](../../guides/symlink-architecture.md) 以初設之。

### 第五步：生審報告

生兼兩層之概表。

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

**得：** 報告清而可行。無疵則康矣。

**敗則：** 若報告自身生之失敗，以原始之數與列示於終端以代之。

### 第六步：修（可選）

若 `fix_mode` 為 `auto` 或 `interactive`，修所察之疵。

**6a. 建闕之項目符連：**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. 建闕之全域符連：**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. 除斷之符連：**
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

**6d. 除陳之 almanac 項：**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. 修闕之目錄符連（agents/teams）：**
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

**切記：** 勿除分類為外來者。此屬他項目（如 peon-ping），宜存。

**得：** 諸闕符連已建，諸斷符連已除，諸陳 almanac 項已清。外來之內容未動。

**敗則：** 若 `ln -s` 因標的已存文件/目錄（如空目錄代符連）而敗，先以 `rmdir`（空目錄）除之，或標為人手察（非空目錄）。

### 第七步：驗

重行第三至四步之審以確修之。

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

**得：** 無闕、無斷。數與註冊之總相符（於 almanac 內容）。外來內容另列之。

**敗則：** 若修之後仍有疵，記其敗之具體者。常見之因：`~/.claude/` 之權、`/mnt/` 之 NTFS 徑之長限、非空目錄阻符連之建。

## 驗

- [ ] almanac 之徑已正辨，含三註冊
- [ ] 註冊之數與 `total_*` 頭之值相符（或記其異）
- [ ] 項目層之技能、代理、團隊皆已審
- [ ] 全域層之技能、代理、團隊皆已審
- [ ] 外來內容（非 almanac）已識而出疵計之外
- [ ] `_template` 標為冗餘（永不屬發現之徑）
- [ ] 審報告已生，數明而列可行
- [ ] 若 `fix_mode` 為 `auto`：諸安修皆施，外來內容未動
- [ ] 修後之驗確無闕、無斷

## 陷

1. **混外來與闕之 almanac**：`~/.claude/skills/` 或含他項目之技能（如 peon-ping）。必先察符連之標的是否於 almanac 徑下，再判其陳或冗

2. **除外來內容**：勿刪非指 almanac 者。其屬他項目，有意而為

3. **符連 `_template` 目錄**：模板乃腳手架，非可用之內容。`_template` 永不宜於 `.claude/skills/` 或 `.claude/agents/`。批量同步之腳本必明略之

4. **陳之 `.claude/teams` 符連**：`.claude/teams` 指團隊定義之符連為誤配。Claude Code 之 `TeamCreate` 用 `~/.claude/teams/` 為運行狀態（config.json、inbox）。若此徑為指 almanac 之 `teams/` 之符連，運行物將書入 git 所追之庫。項目或全域之 `.claude/teams` 符連皆宜除

5. **相對與絕對之徑**：項目層之技能符連用相對徑（`../../skills/<name>`）。全域符連用絕對徑（`/path/to/almanac/skills/<name>`）。混用致遷時斷

6. **註冊頭與實數**：註冊頭之 `total_skills` 或陳，若有增條而不更其數。信實際之 `- id:` 條，勿信頭

## 參

- [repair-broken-references](../repair-broken-references/SKILL.md) — 廣之斷鏈與斷引之修
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 項目目錄之整
- [create-skill](../create-skill/SKILL.md) — 新技能之建，含符連之立（第十三步）
- [create-agent](../create-agent/SKILL.md) — 新代理之建，含發現之驗（第十步）
- [create-team](../create-team/SKILL.md) — 團隊之建，與註冊整合
