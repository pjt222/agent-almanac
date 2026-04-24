---
name: evolve-skill
locale: wenyan
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

# 演既有技

改、擴、或造以 `create-skill` 所造技之進變體。此術司技生之維：評缺、施針對改、升版、保 registry 與互引同步。

## 用時

- 工具易後技步陳或缺
- 用戶回示缺陷、不明步、弱驗
- 技須自 basic 升 intermediate（或中升 advanced）
- 原外需進變體（如 `create-r-package` 與 `create-r-package-advanced`）
- 加去相關技而互引陳

## 入

- **必要**：欲演 SKILL.md 之路
- **必要**：演之因（回、工具易、繁升、新相關技、察陷）
- **可選**：易時之目標繁級（basic、intermediate、advanced）
- **可選**：是否造變體而非就地改（默：就地改）

## 法

### 第一步：評當技

讀 SKILL.md 並按質清單評各節：

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

**得：** 具體缺、弱、或改機之列。

**敗則：** 若 SKILL.md 不存或無 frontmatter，此技不適——當用 `create-skill` 從頭造。

### 第二步：集演求

識並類演之因：

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Step 3 is unclear" | Refinement |
| Tooling change | New API version, deprecated command | Refinement |
| Discovered pitfall | Common failure not documented | Refinement |
| Complexity upgrade | Skill is too shallow for real use | Refinement or variant |
| New related skills | Adjacent skill was added | Refinement (cross-refs) |
| Advanced use case | Power users need deeper coverage | Variant |

編前記具體改。各改附目節。

**得：** 具體改之列（如「加 On failure 於第四步」「加新第六步於邊例 X」「更 Related Skills 含 `new-skill`」）。

**敗則：** 若改不明，進前請用戶澄。模糊演目生模糊改。

### 第三步：擇演範

用此決表定就地改或造變體：

| Criteria | Refinement (in-place) | Advanced Variant (new skill) |
|----------|----------------------|------------------------------|
| Skill ID | Unchanged | New ID: `<skill>-advanced` |
| File path | Same SKILL.md | New directory |
| Version bump | Patch or minor | Starts at 1.0 |
| Complexity | May increase | Higher than original |
| Registry | No new entry | New entry added |
| Symlinks | No change | New symlinks needed |
| Original skill | Modified directly | Left intact, gains cross-reference |

**改**：提質、修缺、或加少容時擇。技保其身。

**變體**：演後版倍長、易眾、或需顯異之入時擇。原留供簡用。

**得：** 明決——改或變——附理。

**敗則：** 不確時默改。後可析變體；合回更難。

### 第四步：施容改

#### 於改

直編 SKILL.md：

```bash
# Open for editing
# Add/revise procedure steps
# Strengthen Expected/On failure pairs
# Add tables or examples
# Update When to Use triggers
# Revise Inputs if scope changed
```

循此編則：
- 保諸有節——加容，勿去節
- 插後步號保序
- 新或改步皆須有 Expected 與 On failure
- 新陷置 Common Pitfalls 節末
- 新相關技置 Related Skills 節末

#### 於變體

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

**得：** SKILL.md（改或新變體）過第一步之評清單。

**敗則：** 若編破文構，用 `git diff` 審改並以 `git checkout -- <file>` 回退部分編。

### 第四·五步：同譯變體

> **譯存時必需。** 此步適人與 AI 二者。勿略——陳 `source_commit` 致 `npm run validate:translations` 於諸 locale 生誤陳警。

察演技是否有譯並更譯以映新源態：

```bash
# Check for existing translations
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### 譯存之時

1. 取當源提交哈：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於各譯文 frontmatter 更 `source_commit`：

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於提交訊中標所涉 locale 以供重譯：

```
evolve(<skill-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 重生譯狀文：

```bash
npm run translation:status
```

#### 無譯之時

無須行。進第五步。

#### 於變體

新變體之譯延至變體穩（1-2 版）。譯 v1.0 變體而 v1.2 或大變廢工。變體改至少一次後方加譯。

**得：** 諸譯文 `source_commit` 更至當提交。提交訊記何 locale 須重譯、何節易。`npm run translation:status` 出 0。

**敗則：** 若 `sed` 不配 frontmatter 域，譯文或有非標格式。手開驗其 YAML frontmatter 含 `source_commit`。若缺，文未正造——以 `npm run translate:scaffold` 再造。

### 第五步：更版與元數

於 frontmatter 升 `version`，循 semver：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0 → 1.1 | Fixed unclear sentence in Step 3 |
| New step, new pitfall, new table | Minor: 1.0 → 2.0 | Added Step 7 for edge case handling |
| Restructured procedure, changed inputs | Major: 1.0 → 2.0 | Reorganized from 5 to 8 steps |

亦更：
- `complexity` 若範擴（如 basic → intermediate）
- `tags` 若覆域易
- `description` 若技範實異

**得：** Frontmatter `version` 映改之大。新變體始於 `"1.0"`。

**敗則：** 若忘升版，下演無法辨當態與前。提交前必升。

### 第六步：更 Registry 與互引

#### 於改

無須更 registry（路不易）。唯他技之 Related Skills 改時更互引：

```bash
# Check if any skill references the evolved skill
grep -r "<skill-name>" skills/*/SKILL.md
```

#### 於變體

於 `skills/_registry.yml` 加新技：

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

然後：
1. 增 registry 頂之 `total_skills`
2. 於原技 Related Skills 加指變體之引
3. 於變體 Related Skills 加指原之引
4. 為斜線命發現造 symlink：

```bash
# Project-level
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**得：** Registry `total_skills` 合 `find skills -name SKILL.md | wc -l`。互引雙向。

**敗則：** 若 registry 計誤，運 `find skills -name SKILL.md | wc -l` 取實數正 registry。Symlink 破則以 `readlink -f` 查。

### 第七步：驗演技

行全驗清單：

- [ ] SKILL.md 存於預路
- [ ] YAML frontmatter 解無誤
- [ ] `version` 已升（改）或設「1.0」（變）
- [ ] 諸節存：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 諸步皆有 Expected 與 On failure
- [ ] Related Skills 引有效存
- [ ] Registry 條存附正路（唯變體）
- [ ] `total_skills` 合盤實數
- [ ] Symlink 正解（唯變體）
- [ ] `git diff` 示原容無誤刪
- [ ] 有譯之改：`source_commit` 已更或譯已標供重譯

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

**得：** 清單皆過。演技可提交。

**敗則：** 各敗項各處。最常演後問為陳 `total_skills`——最後必驗。

## 驗

- [ ] SKILL.md 存且 YAML frontmatter 有效
- [ ] `version` 映所改
- [ ] 諸步皆有 Expected 與 On failure
- [ ] Related Skills 引有效（無破互引）
- [ ] Registry `total_skills` 合盤實數
- [ ] 變體時：`_registry.yml` 新條附正路
- [ ] 變體時：`.claude/skills/` 與 `~/.claude/skills/` 造 symlink
- [ ] `git diff` 確無誤刪
- [ ] 有譯之改：`source_commit` 已更或譯已標供重譯

## 陷

- **忘升版**：無升則不能追何變何時。提交前必更 frontmatter `version`
- **誤刪容**：重構步時易落 On failure 或表行。提交前必審 `git diff`
- **陳互引**：造變體時原與變須互引。單向引令圖不全
- **Registry 計漂**：造變體後必增 `total_skills`。忘則他技察 registry 時驗敗
- **演後陳譯**：庫中 1,288 譯文，每技演引至 4 locale 文陳。必以 `ls i18n/*/skills/<skill-name>/SKILL.md` 察並更各譯文 `source_commit`，或於提交訊標供重譯。略則 `npm run validate:translations` 報陳警
- **改中目擴**：改而使技倍長或宜為變體。若加逾三新步，復察第三步決
- **NTFS 掛路（WSL）避 `git mv`**：於 `/mnt/` 路，目錄之 `git mv` 或生壞權（`d?????????`）。用 `mkdir -p` + 複製 + `git rm` 舊路。見[環境指](../../guides/setting-up-your-environment.md)之排疑節

## 參

- `create-skill` — 造新技之基；evolve-skill 假此先循
- `commit-changes` — 以述訊提交演技
- `configure-git-repository` — 版控技之改
- `security-audit-codebase` — 審演技免誤含秘
