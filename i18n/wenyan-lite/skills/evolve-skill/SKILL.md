---
name: evolve-skill
locale: wenyan-lite
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

# 演化既有技能

改、擴或建以 `create-skill` 原著之技能之進階變體。此程涵技能生命週期之維護面：差距評估、施針對性改、升版、保持登記冊與交互引用之同步。

## 適用時機

- 工具變後技能之步驟陳舊或不全
- 使用者回饋示缺陷阱、步驟不明或驗證弱
- 技能需自基本升至中等（或中等升至進階）
- 需原之外之進階變體（如 `create-r-package` 與 `create-r-package-advanced`）
- 加或移相關技能而交互引用陳

## 輸入

- **必要**：待演之既有 SKILL.md 之路徑
- **必要**：演化觸發（回饋、工具變、複雜升、新相關技能、所發現之陷阱）
- **選擇性**：若變之目標複雜度等級（basic、intermediate、advanced）
- **選擇性**：是否建進階變體而非就地改（預設：就地改）

## 步驟

### 步驟一：評當前技能

讀既有 SKILL.md 並對品質清單評各節：

| 節 | 所察 | 常見問題 |
|---------|--------------|---------------|
| Frontmatter | 所必欄俱在，`description` < 1024 字 | 缺 `tags`、陳 `version` |
| When to Use | 3-5 具體觸發條件 | 模糊或重疊觸發 |
| Inputs | 必要 vs 選擇性分清 | 選擇性輸入缺預設 |
| Procedure | 各步有 code + Expected + On failure | 缺 On failure、以偽碼代實命 |
| Validation | 各項為二元過/敗 | 主觀標準（「代碼清」） |
| Common Pitfalls | 3-6，帶因與避 | 過泛（「謹之」） |
| Related Skills | 2-5 有效技能引用 | 陳引用指已改或移之技能 |

```bash
# Read the skill
cat skills/<skill-name>/SKILL.md

# Check frontmatter parses
head -20 skills/<skill-name>/SKILL.md

# Verify related skills still exist
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

**預期：** 具體差距、弱處或改善機會之清單。

**失敗時：** 若 SKILL.md 不存或無 frontmatter，此技不適——改用 `create-skill` 自頭著之。

### 步驟二：採演化需求

識並分類演化之觸發：

| 觸發 | 例 | 典型範圍 |
|---------|---------|---------------|
| 使用者回饋 | 「Step 3 不明」 | 改 |
| 工具變 | 新 API 版、棄用之命 | 改 |
| 發現陷阱 | 未文檔之常見敗 | 改 |
| 複雜升 | 技能於實際用過淺 | 改或變體 |
| 新相關技能 | 鄰接技能已加 | 改（交互引用） |
| 進階用例 | 高階使用者需深覆 | 變體 |

編前先記所需之具體改。列各改及其目標節。

**預期：** 具體改之清單（如「於 Step 4 加 On failure」、「加新 Step 6 處理邊緣情 X」、「更 Related Skills 納 `new-skill`」）。

**失敗時：** 若改不明，進前諮詢使用者以釐。演化目標泛則改善亦泛。

### 步驟三：擇演化範圍

以此決策矩陣定是就地改或建變體：

| 標準 | 就地改（in-place） | 進階變體（新技能） |
|----------|----------------------|------------------------------|
| 技能 ID | 不變 | 新 ID：`<skill>-advanced` |
| 檔路徑 | 同 SKILL.md | 新目錄 |
| 版本升 | Patch 或 minor | 起於 1.0 |
| 複雜 | 或增 | 高於原 |
| Registry | 無新項 | 加新項 |
| Symlinks | 無變 | 需新 symlink |
| 原技能 | 直接修 | 保全，得交互引用 |

**改**：於提升品質、補差距或加適度新內容時擇之。技能保其身分。

**變體**：當演後之版會令技能長倍、改目標受眾或需實質異之輸入時擇之。原技能保於較簡之用例。

**預期：** 明決——改或變體——含理由。

**失敗時：** 若不定，預設改。後可抽變體；合回則難。

### 步驟四：施內容改

#### 就地改

直接編既有 SKILL.md：

```bash
# Open for editing
# Add/revise procedure steps
# Strengthen Expected/On failure pairs
# Add tables or examples
# Update When to Use triggers
# Revise Inputs if scope changed
```

遵此編輯規：
- 保所有既有節——加內容，勿移節
- 插入後保步驟編號連續
- 每新或改之步皆須有 Expected 與 On failure
- 新陷阱於 Common Pitfalls 節末
- 新相關技能於 Related Skills 節末

#### 變體

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

**預期：** SKILL.md（改或新變體）過步驟一之評估清單。

**失敗時：** 若步驟編輯破文檔結構，以 `git diff` 審改並以 `git checkout -- <file>` 回部分編輯。

### 步驟 4.5：同步翻譯之變體

> **翻譯存時必行。** 此步適於依此程之人類作者與 AI 代理。勿略——陳 `source_commit` 值致 `npm run validate:translations` 於所有語言報假陳舊警。

察演化之技能是否存譯文並更以反新源狀態：

```bash
# Check for existing translations
ls i18n/*/skills/<skill-name>/SKILL.md 2>/dev/null
```

#### 若譯文存

1. 取當前源 commit hash：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 更各譯文 frontmatter 中之 `source_commit`：

```bash
for locale_file in i18n/*/skills/<skill-name>/SKILL.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於 commit 訊息中納受影響語言以旗標檔供重譯：

```
evolve(<skill-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 再生譯狀態檔：

```bash
npm run translation:status
```

#### 若無譯文

無需行動。進步驟五。

#### 於變體

遞譯新變體至變體穩（1-2 版）。譯 v1.0 之變體若至 v1.2 可能實質變為浪工。於變體至少一改後再加譯。

**預期：** 所有譯文之 `source_commit` 已更至當前 commit。Commit 訊息記哪些語言需重譯及何節改。`npm run translation:status` 以 0 出。

**失敗時：** 若 `sed` 未能配 frontmatter 欄，譯文或有非標準格式。手開之並驗其於 YAML frontmatter 有 `source_commit`。若欄缺，檔未正鷹架——以 `npm run translate:scaffold` 重建。

### 步驟五：更版與元數據

升 frontmatter 之 `version` 欄，循 semver 之規：

| 改類 | 版升 | 例 |
|-------------|-------------|---------|
| 錯字修、措詞釐清 | Patch：1.0 → 1.1 | 修 Step 3 中不明之句 |
| 新步、新陷阱、新表 | Minor：1.0 → 2.0 | 加 Step 7 處邊緣情 |
| 重構程、改輸入 | Major：1.0 → 2.0 | 自 5 步重組為 8 步 |

亦更：
- `complexity` 若範圍擴（如 basic → intermediate）
- `tags` 若覆域變
- `description` 若技能範圍實質異

**預期：** Frontmatter `version` 反改之幅。新變體起於 `"1.0"`。

**失敗時：** 若忘升版，次演化無法辨當前態與前態。恒於 commit 前升之。

### 步驟六：更登記冊與交互引用

#### 就地改

無需改登記冊（路徑不變）。僅於他技能之 Related Skills 變時更交互引用：

```bash
# Check if any skill references the evolved skill
grep -r "<skill-name>" skills/*/SKILL.md
```

#### 變體

加新技能至 `skills/_registry.yml`：

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

然後：
1. 增登記冊頂之 `total_skills`
2. 於原技能之 Related Skills 加指向變體之交互引用
3. 於變體之 Related Skills 加指向原技能之交互引用
4. 建 symlink 以發現 slash command：

```bash
# Project-level
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# Global
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**預期：** 登記冊 `total_skills` 配 `find skills -name SKILL.md | wc -l`。交互引用雙向。

**失敗時：** 若登記計誤，執 `find skills -name SKILL.md | wc -l` 取實計並修登記冊。於破 symlink，以 `readlink -f` 除錯解析。

### 步驟七：驗已演技能

行全驗證清單：

- [ ] SKILL.md 於預期路徑存
- [ ] YAML frontmatter 無誤解析
- [ ] `version` 已升（改）或設為 "1.0"（變體）
- [ ] 所有節俱在：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 每步有 Expected 與 On failure 區
- [ ] Related Skills 引用有效存之技能名
- [ ] 登記冊項存且路徑正確（僅變體）
- [ ] `total_skills` 計配磁碟實際技能數
- [ ] Symlink 正確解析（僅變體）
- [ ] `git diff` 示原內容無誤刪
- [ ] 於帶譯之改：`source_commit` 已更或譯已旗標待重譯

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

**預期：** 所有清單項過。已演技能已備以 commit。

**失敗時：** 逐一處理每敗項。演後最常之問題為陳之 `total_skills` 計——恒末驗之。

## 驗證

- [ ] SKILL.md 存並有有效 YAML frontmatter
- [ ] `version` 欄反所作之改
- [ ] 所有步有 Expected 與 On failure 區
- [ ] Related Skills 引用有效（無破交互引用）
- [ ] 登記冊 `total_skills` 配磁碟實際計
- [ ] 於變體：`_registry.yml` 中有新項含正確路徑
- [ ] 於變體：symlink 已建於 `.claude/skills/` 與 `~/.claude/skills/`
- [ ] `git diff` 確無誤移內容
- [ ] 於帶譯之改：`source_commit` 已更或譯已旗標待重譯

## 常見陷阱

- **忘升版**：無版升則無法追何時何變。恒於 commit 前更 frontmatter 之 `version`。
- **誤刪內容**：重組步時易落 On failure 區或表列。恒於 commit 前審 `git diff`。
- **陳交互引用**：建變體時，原與變體須互引。單向引用使圖不全。
- **登記計漂移**：建變體後，`total_skills` 計須增。忘之致他查登記之技能驗證敗。
- **演後陳譯**：庫中 1,288 譯文，每次技能演化觸發至 4 語言檔之陳舊。恒以 `ls i18n/*/skills/<skill-name>/SKILL.md` 察既存譯文並更各譯文 frontmatter 之 `source_commit`，或於 commit 訊息中旗標以待重譯。略此致 `npm run validate:translations` 報陳舊警。
- **改中範圍蔓延**：改倍技能長應為變體。若爾加逾 3 新步，重思步驟三之範圍決。
- **避於 NTFS 掛載路徑用 `git mv`（WSL）**：於 `/mnt/` 路徑，`git mv` 目錄可致破權限（`d?????????`）。改用 `mkdir -p` + 複製檔 + `git rm` 舊路徑。見 [環境指南](../../guides/setting-up-your-environment.md) 除錯節。

## 相關技能

- `create-skill` — 著新技能之基；evolve-skill 假其原依之
- `commit-changes` — 以描述訊息 commit 已演技能
- `configure-git-repository` — 版本控之技能改
- `security-audit-codebase` — 審已演技能有無誤納密秘
