---
name: audit-discovery-symlinks
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
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# audit-discovery-symlinks

## 使用タイミング

- almanac に新しいスキル、エージェント、チームを追加した後
- 絶対パス symlink を壊しうるリポジトリのリネーム・移動後
- Claude Code でスラッシュコマンドやエージェントが見つからないとき
- レジストリと検出パス間のドリフトを捕まえるための定期的な健全性チェックとして
- 共有 almanac コンテンツを発見すべき新規プロジェクトのオンボーディング時

**使用しない**: ゼロから初期 symlink ハブを作成する場合。初回セットアップは [symlink-architecture guide](../../guides/symlink-architecture.md) を参照。

## 入力

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `almanac_path` | string | No | agent-almanac ルートの絶対パス。省略時は `.claude/` symlink ターゲットまたは cwd から自動検出 |
| `scope` | enum | No | `project`、`global`、`both`（既定: `both`） |
| `fix_mode` | enum | No | `report`（既定: 監査のみ）、`auto`（安全な問題をすべて修正）、`interactive`（各修正前にプロンプト） |

## 手順

### ステップ1: Almanac パスを特定する

agent-almanac ルートディレクトリを見つける。

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

**期待結果：** `ALMANAC_PATH` が `skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml` を含むディレクトリを指している。

**失敗時：** 自動検出が失敗したらユーザーに `almanac_path` 入力を求める。almanac ルートは `skills/`、`agents/`、`teams/` とそれらのレジストリを含むディレクトリ。

### ステップ2: レジストリをインベントリする

スキル、エージェント、チームの正規リストをそれぞれのレジストリから抽出する。

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

**期待結果：** カウントが各レジストリヘッダの `total_skills`、`total_agents`、`total_teams` 値と一致する。

**失敗時：** カウントがヘッダの合計と乖離する場合、レジストリ自体が同期していない。レポートに不一致を記しつつ、実際の `- id:` エントリを真実の源として続行する。

### ステップ3: プロジェクトレベルの symlink を監査する

カレントプロジェクトディレクトリの `.claude/skills/*`、`.claude/agents`、`.claude/teams` を確認する。

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

**期待結果：** 欠落ゼロ、破損ゼロ。余剰項目は分類され説明される。

**失敗時：** `.claude/` がそもそも存在しない場合、プロジェクトには検出セットアップがない。これを記してグローバル監査へスキップする。

### ステップ4: グローバル symlink を監査する

`~/.claude/skills/*` と `~/.claude/agents` を確認する。また、`~/.claude/teams` が symlink で**ない**ことも確認する（TeamCreate のランタイム状態用に欠落しているかディレクトリであるべき）。

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

**期待結果：** almanac スキルの欠落ゼロ、破損ゼロ。外部コンテンツ（peon-ping など）は列挙されるがエラーとはみなされない。

**失敗時：** `~/.claude/` が存在しない場合、グローバルハブはセットアップされていない。初期セットアップは [symlink-architecture guide](../../guides/symlink-architecture.md) を参照。

### ステップ5: 監査レポートを生成する

両層をカバーする概要表を作成する。

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

**期待結果：** 明確で実行可能なレポート。問題ゼロは健全性の証明。

**失敗時：** レポート生成自体が失敗する場合、フォールバックとして生のカウントとリストをコンソールに出力する。

### ステップ6: 修復（任意）

`fix_mode` が `auto` または `interactive` なら、見つかった問題を修正する。

**6a. 欠落しているプロジェクト symlink を作成:**
```bash
for skill in $MISSING_PROJECT_SKILLS; do
  ln -s "../../skills/$skill" "$PROJECT_CLAUDE/skills/$skill"
done
```

**6b. 欠落しているグローバル symlink を作成:**
```bash
for skill in $MISSING_GLOBAL_SKILLS; do
  ln -s "$ALMANAC_PATH/skills/$skill" "$GLOBAL_CLAUDE/skills/$skill"
done
```

**6c. 破損 symlink を削除:**
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

**6d. 古い almanac エントリを削除:**
```bash
# Only remove items that target the almanac path but aren't in the registry
for stale in $STALE_GLOBAL_SKILLS; do
  rm "$GLOBAL_CLAUDE/skills/$stale"
done

# Remove _template if present
rm -f "$GLOBAL_CLAUDE/skills/_template"
rm -f "$PROJECT_CLAUDE/skills/_template"
```

**6e. 欠落ディレクトリ symlink（agents/teams）を修正:**
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

**重要:** 外部に分類された項目は決して削除しない。これらは他プロジェクト（例: peon-ping）に属し、保護されなければならない。

**期待結果：** 欠落 symlink がすべて作成され、破損 symlink がすべて削除され、古い almanac エントリがすべて掃除される。外部コンテンツは触れられない。

**失敗時：** ターゲットパスに既存のファイル/ディレクトリがあり `ln -s` が失敗する場合（例: symlink ではなく空ディレクトリ）、まず `rmdir`（空ディレクトリ用）でブロッカーを除去するか、手動レビュー用にフラグを立てる（非空ディレクトリ用）。

### ステップ7: 検証

ステップ3-4の監査チェックを再実行して修復を確認する。

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

**期待結果：** 欠落ゼロ、破損ゼロ。カウントは登録済み合計と一致する（almanac コンテンツについて）。外部コンテンツは別途列挙される。

**失敗時：** 修復後も問題が残る場合、具体的な失敗をレポートする。よくある原因: `~/.claude/` の権限エラー、`/mnt/` パスの NTFS パス長制限、symlink 作成を阻む非空ディレクトリ。

## バリデーション

- [ ] Almanac パスが正しく特定され、3 つのレジストリすべてを含む
- [ ] レジストリカウントが `total_*` ヘッダ値と一致する（または不一致が記されている）
- [ ] プロジェクトレベルのスキル、エージェント、チームが監査されている
- [ ] グローバルレベルのスキル、エージェント、チームが監査されている
- [ ] 外部コンテンツ（非 almanac）が特定され、問題カウントから除外されている
- [ ] `_template` エントリが余剰としてフラグされている（検出パスには決して属さない）
- [ ] 監査レポートが明確なカウントと実行可能なリストと共に生成されている
- [ ] `fix_mode` が `auto` の場合: すべての安全な修復が適用され、外部コンテンツは触れられていない
- [ ] 修復後の検証で欠落ゼロ、破損ゼロが確認されている

## よくある落とし穴

1. **外部コンテンツを欠落 almanac コンテンツと混同する**: `~/.claude/skills/` には他プロジェクトのスキル（例: peon-ping）が含まれる場合がある。古いまたは余剰と分類する前に、symlink ターゲットが almanac パスの下にあるかを必ず確認する。

2. **外部コンテンツの削除**: almanac を指していない項目は決して削除しない。それらは他プロジェクトに属し意図的にそこにある。

3. **`_template` ディレクトリの symlink 化**: テンプレートはスキャフォールディングであり消費されるコンテンツではない。`_template` ディレクトリは `.claude/skills/` や `.claude/agents/` には決して現れるべきでない。一括同期スクリプトはこれを明示的にスキップしなければならない。

4. **古い `.claude/teams` symlink**: チーム定義を指す `.claude/teams` symlink は誤設定である。Claude Code の `TeamCreate` は `~/.claude/teams/` をランタイム状態（config.json、inboxes）に使用する。このパスが almanac の `teams/` ディレクトリへの symlink なら、ランタイム成果物が git 管理下のリポジトリに書き込まれる。プロジェクトまたはグローバルレベルで見つかった `.claude/teams` symlink は除去する。

5. **相対パスと絶対パス**: プロジェクトレベルのスキル symlink は相対パス（`../../skills/<name>`）を使う。グローバル symlink は絶対パス（`/path/to/almanac/skills/<name>`）を使う。これらのパターンを混在させると移動時に破損する。

6. **レジストリヘッダ vs 実際のカウント**: レジストリヘッダの `total_skills` フィールドは、誰かがカウント更新なしにエントリを追加すると古くなりうる。ヘッダではなく実際の `- id:` エントリを信頼する。

## 関連スキル

- [repair-broken-references](../repair-broken-references/SKILL.md) — 一般的な壊れたリンクと参照の修復
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — プロジェクトディレクトリの整理
- [create-skill](../create-skill/SKILL.md) — 新規スキルの symlink 作成を含む（ステップ13）
- [create-agent](../create-agent/SKILL.md) — 検出検証を含む（ステップ10）
- [create-team](../create-team/SKILL.md) — レジストリ統合付きのチーム作成
