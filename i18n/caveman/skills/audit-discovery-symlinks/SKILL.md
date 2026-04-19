---
name: audit-discovery-symlinks
locale: caveman
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

## When Use

- After adding new skills, agents, teams to almanac
- After repository rename or move — may break absolute symlinks
- Slash commands or agents not found in Claude Code
- Periodic health check — catch drift between registries and discovery paths
- Onboarding new project — should discover shared almanac content

**Do NOT use** for creating initial symlink hub from scratch. See [symlink-architecture guide](../../guides/symlink-architecture.md) for first-time setup.

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `almanac_path` | string | No | Absolute path to agent-almanac root. Auto-detected from `.claude/` symlink targets or cwd if omitted |
| `scope` | enum | No | `project`, `global`, or `both` (default: `both`) |
| `fix_mode` | enum | No | `report` (default: audit only), `auto` (fix all safe issues), `interactive` (prompt before each fix) |

## Steps

### Step 1: Identify Almanac Path

Locate agent-almanac root directory.

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

**Got:** `ALMANAC_PATH` points to directory containing `skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`.

**If fail:** Auto-detection fails? Ask user for `almanac_path` input. Almanac root = directory with `skills/`, `agents/`, `teams/`, registries.

### Step 2: Inventory Registries

Extract canonical lists of skills, agents, teams from registries.

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

**Got:** Counts match `total_skills`, `total_agents`, `total_teams` values in each registry header.

**If fail:** Counts diverge from header totals? Registry out of sync. Note discrepancy in report, continue with actual `- id:` entries as source of truth.

### Step 3: Audit Project-Level Symlinks

Check `.claude/skills/*`, `.claude/agents`, `.claude/teams` in current project directory.

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

**Got:** Zero missing, zero broken. Extraneous items classified and explained.

**If fail:** `.claude/` doesn't exist? Project has no discovery setup. Note and skip to global audit.

### Step 4: Audit Global Symlinks

Check `~/.claude/skills/*` and `~/.claude/agents`. Also check `~/.claude/teams` NOT a symlink (should be absent or directory for TeamCreate runtime state).

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

**Got:** Zero missing almanac skills, zero broken. External content (peon-ping, etc.) listed but not flagged as errors.

**If fail:** `~/.claude/` doesn't exist? Global hub not set up. See [symlink-architecture guide](../../guides/symlink-architecture.md) for initial setup.

### Step 5: Generate Audit Report

Produce summary table covering both layers.

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

**Got:** Clear, actionable report. Zero issues = clean bill of health.

**If fail:** Report generation itself fails? Output raw counts and lists to console as fallback.

### Step 6: Repair (Optional)

If `fix_mode` is `auto` or `interactive`, fix issues found.

**6a. Create missing project symlinks:**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. Create missing global symlinks:**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. Remove broken symlinks:**
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

**6d. Remove stale almanac entries:**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. Fix missing directory symlinks (agents/teams):**
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

**Important:** Never remove items classified as external. Belong to other projects (peon-ping). Preserve.

**Got:** All missing symlinks created, broken removed, stale almanac entries cleaned. External content untouched.

**If fail:** `ln -s` fails due to existing file/directory at target (e.g., empty directory instead of symlink)? Remove blocker first with `rmdir` (empty dirs) or flag for manual review (non-empty dirs).

### Step 7: Verify

Re-run audit checks from Steps 3-4 to confirm repairs.

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

**Got:** Zero missing, zero broken. Counts match registered totals (almanac content). External content listed separately.

**If fail:** Issues remain after repair? Report specific failures. Common causes: permission errors on `~/.claude/`, NTFS path length limits on `/mnt/` paths, non-empty directory blocking symlink creation.

## Checks

- [ ] Almanac path correctly identified, contains all three registries
- [ ] Registry counts match `total_*` header values (or discrepancy noted)
- [ ] Project-level skills, agents, teams audited
- [ ] Global-level skills, agents, teams audited
- [ ] External content (non-almanac) identified and excluded from issue counts
- [ ] `_template` entries flagged as extraneous (never belongs in discovery paths)
- [ ] Audit report generated with clear counts and actionable lists
- [ ] If `fix_mode` is `auto`: all safe repairs applied, external content untouched
- [ ] Post-repair verification confirms zero missing, zero broken

## Pitfalls

1. **Confusing external content with missing almanac content**: `~/.claude/skills/` may hold skills from other projects (peon-ping). Always check if symlink target under almanac path before classifying stale/extraneous.

2. **Removing external content**: Never delete items not targeting almanac. Belong to other projects. Intentional.

3. **Symlinking `_template` directories**: Templates are scaffolding, not consumable content. `_template` should never appear in `.claude/skills/` or `.claude/agents/`. Bulk sync scripts must skip it.

4. **Stale `.claude/teams` symlink**: `.claude/teams` symlink pointing to team definitions = misconfiguration. Claude Code's `TeamCreate` uses `~/.claude/teams/` for runtime state (config.json, inboxes). Symlink to almanac's `teams/` = runtime artifacts written into git-tracked repo. Remove any `.claude/teams` symlink at project or global level.

5. **Relative vs absolute paths**: Project-level skill symlinks use relative paths (`../../skills/<name>`). Global symlinks use absolute paths (`/path/to/almanac/skills/<name>`). Mixing breaks on moves.

6. **Registry header vs actual count**: `total_skills` field in registry header may be stale if someone added entries without updating count. Trust actual `- id:` entries, not header.

## See Also

- [repair-broken-references](../repair-broken-references/SKILL.md) -- general broken link and reference repair
- [tidy-project-structure](../tidy-project-structure/SKILL.md) -- project directory organization
- [create-skill](../create-skill/SKILL.md) -- includes symlink creation for new skills (Step 13)
- [create-agent](../create-agent/SKILL.md) -- includes discovery verification (Step 10)
- [create-team](../create-team/SKILL.md) -- team creation with registry integration
