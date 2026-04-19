---
name: audit-icon-pipeline
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Detect missing glyphs, icons, and HD variants by comparing registries against
  glyph mapping files, icon directories, and manifests. Reports gaps for skills,
  agents, and teams across all palettes.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# 審像管

較冊與符映檔、像目、清單→察缺符、缺像、舊清單。出結構缺報涵技、將、隊。

## 用

- 新增技/將/隊→察像需否
- 全管前→識何缺
- 冊更後→驗清單同步
- 定期察像管健

## 入

- **可**：實類濾—`skill`、`agent`、`team`、`all`（默 `all`）
- **可**：查之色板（默 `cyberpunk`—參色板）

## 行

### 一：讀諸冊

自諸正典冊集諸實 ID。

1. 讀 `skills/_registry.yml`—諸域中取諸技 ID
2. 讀 `agents/_registry.yml`—取諸將 ID
3. 讀 `teams/_registry.yml`—取諸隊 ID
4. 記計：技、將、隊總

**得：** 三實 ID 列與計合 `total_skills`、`total_agents`、`total_teams`。

**敗：** 冊檔缺→報徑而略其類。

### 二：讀符映

自符映檔集諸映實 ID。

1. 讀 `viz/R/glyphs.R`—取 `SKILL_GLYPHS` 之諸鍵
2. 讀 `viz/R/agent_glyphs.R`—取 `AGENT_GLYPHS` 之諸鍵
3. 讀 `viz/R/team_glyphs.R`—取 `TEAM_GLYPHS` 之諸鍵

**得：** 三映 ID 列。

**敗：** 符檔缺→報而標其類諸實為未映。

### 三：算缺符

較冊 ID 與映 ID。

1. 缺技符：`registry_skill_ids - mapped_skill_ids`
2. 缺將符：`registry_agent_ids - mapped_agent_ids`
3. 缺隊符：`registry_team_ids - mapped_team_ids`

**得：** 實 ID 列，存於冊而無符函映。

**敗：** 較算敗→驗冊與符檔之 ID 格式合（如底線對劃）。

### 四：察已渲像

驗諸映符有應之渲像檔。

1. 每映技 ID→察 `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. 每映將 ID→察 `viz/public/icons/<palette>/agents/<agentId>.webp`
3. 每映隊 ID→察 `viz/public/icons/<palette>/teams/<teamId>.webp`
4. 察 HD 變體於 `viz/public/icons-hd/`，同結構

**得：** 實列—有符而缺渲像（標與/或 HD）。

**敗：** 像目不存→管未行→報諸為缺。

### 五：察清單新否

較清單計與冊計。

1. 讀 `viz/public/data/icon-manifest.json`—計條
2. 讀 `viz/public/data/agent-icon-manifest.json`—計條
3. 讀 `viz/public/data/team-icon-manifest.json`—計條
4. 較冊總

**得：** 清單計合冊計。差→清單陳舊。

**敗：** 清單檔不存→資料管先行（`node build-data.js && node build-icon-manifest.js`）。

### 六：察孤像

巡 `viz/public/icons*/` 旗其 `<palette>/<domain>/<skillId>` 三元不現於 `icon-manifest.json` 之 WebP 檔。

1. 列諸 WebP：`find viz/public/icons* -name "*.webp"`
2. 每檔→自徑取 `<domain>/<id>`
3. 察 `<domain>/<id>` 是否有 `icon-manifest.json` 條
4. 集不合檔為孤—存於盤而不再引

```bash
# Quick orphan count per palette
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('viz/public/data/icon-manifest.json'));
const ids = new Set(manifest.map(e => e.domain + '/' + e.id));
const orphans = require('child_process')
  .execSync('find viz/public/icons -name \"*.webp\"').toString().trim().split('\n')
  .filter(p => { const parts = p.split('/'); const id = parts.slice(-2).join('/').replace('.webp',''); return !ids.has(id); });
console.log('Orphans:', orphans.length);
orphans.forEach(p => console.log(' ', p));
"
```

**得：** 零孤。孤存→技移域而未清（每移 18 孤 = 9 色板 × 2 尺寸）。

**敗：** 手刪孤—無清單條且不服。移事罕，手清可。

### 七：生缺報

出結構概。

1. 出為清表或列：
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. 依發現薦下一行

**得：** 全缺報附可行下步。

**敗：** 諸察皆通零缺→報「管全同步」為正果。

## 驗

- [ ] 三冊皆讀
- [ ] 三符映檔皆察
- [ ] 像目巡察標與 HD
- [ ] 清單新否已驗
- [ ] 孤像察（盤徑對清單）
- [ ] 缺報附計與實列
- [ ] 可行下步提供

## 忌

- **ID 格式不合**：冊用 kebab-case（`create-skill`），符映或用 snake_case→確保較時歸一
- **色板假設**：唯察 cyberpunk 板→遺色板專渲之缺
- **空目**：域目存而空→通配算「像有」→察檔存，非目存
- **HD 未渲**：HD 像於別樹（`icons-hd/`）—勿混標像
- **移域後孤**：技之域改→`build.sh` 造新徑像而不刪舊徑—域移後必行步六察孤

## 參

- [create-glyph](../create-glyph/SKILL.md) — 造此審識之缺符
- [enhance-glyph](../enhance-glyph/SKILL.md) — 改現符之質
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 行全管以生缺像
