---
name: evolve-skill
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing skill by refining its content in-place or creating an
  advanced variant. Covers assessing the current skill, gathering evolution
  requirements, choosing scope (refinement vs. variant), applying changes,
  updating version metadata, and synchronizing the registry and cross-references.
  Use when a skill's procedure steps are outdated, user feedback reveals gaps,
  a skill needs a complexity upgrade, an advanced variant is needed alongside
  the original, or related skills are added and cross-references are stale.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, maintenance, evolution, versioning
---

# 演舊技

改、擴、或造原以 `create-skill` 建之技之進階變。此行屬技生週之維：估缺、施針對改、升版、使登記與交引同步。

## 用

- 工變後技之行步舊或不全
- 用者反饋示忌缺、步不明、驗弱
- 技須自基升中（或中升進）
- 須於原之側有進階變（如 `create-r-package` 與 `create-r-package-advanced`）
- 加或去關技而交引舊

## 入

- **必**：欲演 SKILL.md 之徑
- **必**：演因（反饋、工變、複升、新關技、見忌）
- **可**：若改複級之標（basic、intermediate、advanced）
- **可**：是否造進階變代原地改（默：原地）

## 行

### 一：估現技

讀舊 SKILL.md 並據質察表估各節：

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields present, `description` < 1024 chars | Missing `tags`, stale `version` |
| When to Use | 3-5 concrete trigger conditions | Vague or overlapping triggers |
| Inputs | Required vs optional clearly separated | Missing defaults for optional inputs |
| Procedure | Each step has code + Expected + On failure | Missing On failure blocks, pseudocode instead of real commands |
| Validation | Each item is binary pass/fail | Subjective criteria ("code is clean") |
| Common Pitfalls | 3-6 with cause and avoidance | Too generic ("be careful") |
| Related Skills | 2-5 valid skill references | Stale references to renamed/removed skills |

```bash
# Read the skill
cat skills/<skill-name>/SKILL.md

# Check frontmatter parses
head -20 skills/<skill-name>/SKILL.md

# Verify related skills still exist
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

得：特缺、弱、機會之列。

敗：SKILL.md 不存或無 frontmatter→此技不適；用 `create-skill` 自零造之。

### 二：集演求

識並分觸演之因：

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Step 3 is unclear" | Refinement |
| Tooling change | New API version, deprecated command | Refinement |
| Discovered pitfall | Common failure not documented | Refinement |
| Complexity upgrade | Skill is too shallow for real use | Refinement or variant |
| New related skills | Adjacent skill was added | Refinement (cross-refs) |
| Advanced use case | Power users need deeper coverage | Variant |

編前錄須特改。各改映於特節。

得：具改之列（如「加 On failure 於四步」、「加新六步為邊例 X」、「更 Related Skills 含 `new-skill`」）。

敗：改不明→進前請用者明之。模糊演標產模糊改。

### 三：擇演範

用此決矩定原地改或造變：

| Criteria | Refinement (in-place) | Advanced Variant (new skill) |
|----------|----------------------|------------------------------|
| Skill ID | Unchanged | New ID: `<skill>-advanced` |
| File path | Same SKILL.md | New directory |
| Version bump | Patch or minor | Starts at 1.0 |
| Complexity | May increase | Higher than original |
| Registry | No new entry | New entry added |
| Symlinks | No change | New symlinks needed |
| Original skill | Modified directly | Left intact, gains cross-reference |

**原地改**：改質、修缺、或加微新容時擇。技保同。

**變**：演版將倍長、改標眾、或需大異入時擇。原存以供簡用。

得：明決——改或變——並有理。

敗：不確→默改。後可抽變；合難。

### 四：施容改

#### 原地改

直編舊 SKILL.md：

```bash
# Open for editing
# Add/revise procedure steps
# Strengthen Expected/On failure pairs
# Add tables or examples
# Update When to Use triggers
# Revise Inputs if scope changed
```

循此編則：
- 保諸節——加容，勿去節
- 插入後步序順
- 新或改步各須 Expected 與 On failure
- 新忌置 Common Pitfalls 節末
- 新關技置 Related Skills 節末

#### 變

```bash
# Create the variant directory
mkdir -p skills/<skill-name>-advanced/

# Copy the original as a starting point
cp skills/<skill-name>/SKILL.md skills/<skill-name>-advanced/SKILL.md

# Edit the variant:
# - Change `name` to `<skill-name>-advanced`
# - Update `description` to reflect the advanced scope
# - Raise `complexity` (e.g., intermediate → advanced)
# - Reset `version` to "1.0"
# - Add/expand procedure steps for the advanced use case
# - Reference the original in Related Skills as a prerequisite
```

得：SKILL.md（改或新變）過一步估表。

敗：步編破文構→用 `git diff` 閱改，以 `git checkout -- <file>` 復部分。

### 四半：同譯變

> **譯存時必**。此步適人作者與 AI agent 循此行。勿略——舊 `source_commit` 致 `npm run validate:translations` 於諸地報偽舊警。

察演技譯否存並更以反新源態：

```bash
# Check for existing translations
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### 若譯存

1. 取現源 commit 雜：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於諸譯文 frontmatter 中更 `source_commit`：

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 旗待重譯之地入 commit 信：

```
evolve(<skill-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 重生譯態文：

```bash
npm run translation:status
```

#### 若無譯

無須行。進五步。

#### 變

新變之譯宜於變穩（1-2 版）後行。譯 v1.0 變而 v1.2 大改則費。變至少改一次後加譯。

得：諸譯文 `source_commit` 更至現 commit。commit 信注何地需重譯、何節變。`npm run translation:status` 退 0。

敗：`sed` 匹 frontmatter 欄敗→譯文或非標式。手開驗其 YAML frontmatter 含 `source_commit`。若欄缺→文未正 scaffold，以 `npm run translate:scaffold` 重之。

### 五：更版與元

依 semver 升 frontmatter `version`：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0 → 1.1 | Fixed unclear sentence in Step 3 |
| New step, new pitfall, new table | Minor: 1.0 → 2.0 | Added Step 7 for edge case handling |
| Restructured procedure, changed inputs | Major: 1.0 → 2.0 | Reorganized from 5 to 8 steps |

亦更：
- `complexity` 若範擴（如 basic → intermediate）
- `tags` 若覆域變
- `description` 若範大異

得：frontmatter `version` 反改之度。新變自 `"1.0"` 起。

敗：忘升版→下演無法別現態於舊。commit 前必升。

### 六：更登記與交引

#### 原地改

登無變（徑不變）。僅他技 Related Skills 變時更交引：

```bash
# Check if any skill references the evolved skill
grep -r "<skill-name>" skills/*/SKILL.md
```

#### 變

於 `skills/_registry.yml` 加新技：

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

後：
1. 增登首 `total_skills`
2. 於原技 Related Skills 加指變之交引
3. 於變 Related Skills 加指原之交引
4. 造符鏈以便斜線命察：

```bash
# Project-level
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

得：登 `total_skills` 匹 `find skills -name SKILL.md | wc -l`。交引雙向。

敗：登計誤→行 `find skills -name SKILL.md | wc -l` 取實計而正登。符鏈壞→用 `readlink -f` 調解析。

### 七：驗演技

行全驗表：

- [ ] SKILL.md 於期徑存
- [ ] YAML frontmatter 解而無誤
- [ ] `version` 已升（改）或設 "1.0"（變）
- [ ] 諸節在：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 各行步有 Expected 與 On failure
- [ ] Related Skills 引有效之存技
- [ ] 登條存且徑正（變）
- [ ] `total_skills` 計匹碟實技數
- [ ] 符鏈解析正（變）
- [ ] `git diff` 示無偶去原容
- [ ] 含譯之改：`source_commit` 已更或譯旗重譯

```bash
# Verify frontmatter
head -20 skills/<skill-name>/SKILL.md

# Count skills on disk vs registry
find skills -name SKILL.md | wc -l
grep total_skills skills/_registry.yml

# Check symlinks (for variants)
ls -la .claude/skills/<skill-name>-advanced
readlink -f .claude/skills/<skill-name>-advanced/SKILL.md

# Review all changes
git diff
```

得：諸表項過。演技可 commit。

敗：各敗項獨處。演後最常議：舊之 `total_skills` 計——必末驗。

## 驗

- [ ] SKILL.md 存且有效 YAML frontmatter
- [ ] `version` 欄反改
- [ ] 諸行步有 Expected 與 On failure
- [ ] Related Skills 引有效（無斷交引）
- [ ] 登 `total_skills` 匹碟實計
- [ ] 變：`_registry.yml` 中新條徑正
- [ ] 變：`.claude/skills/` 與 `~/.claude/skills/` 之符鏈已造
- [ ] `git diff` 證無偶去容
- [ ] 含譯之改：`source_commit` 已更或譯旗重譯

## 忌

- **忘升版**：無升則無法追何變何時。commit 前必更 frontmatter `version`
- **偶去容**：重構步時易漏 On failure 或表行。commit 前必閱 `git diff`
- **舊交引**：造變時原與變須互引。單向留圖不全
- **登計漂**：造變後 `total_skills` 計須增。忘致他技察登之驗敗
- **演後譯舊**：庫 1,288 譯文，每技演觸至多 4 地舊。以 `ls i18n/*/skills/<skill-name>/SKILL.md` 察並各更 `source_commit`，或於 commit 信中旗重譯。略則 `npm run validate:translations` 報舊警
- **改時範蔓**：改倍技之長或宜為變。若加過 3 新行步→重考三步之範決
- **WSL NTFS 避 `git mv`**：`/mnt/` 徑中 `git mv` 目錄或生壞權（`d?????????`）。以 `mkdir -p`+複文+`git rm` 舊徑代之。見[環境指南](../../guides/setting-up-your-environment.md)之調故節

## 參

- `create-skill` — 造新技之基；evolve-skill 設先循
- `commit-changes` — 以述信 commit 演技
- `configure-git-repository` — 版控技改
- `security-audit-codebase` — 閱演技避偶入密
