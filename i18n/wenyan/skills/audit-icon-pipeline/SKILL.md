---
name: audit-icon-pipeline
locale: wenyan
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

# 察圖符之脈

察缺符、缺像、陳腐之清單，以諸冊對校符圖之檔、圖目、清單。生結構化之缺報，涵技、人、隊三者。

## 用時

- 新增技、人、隊後，察圖符之須
- 全脈渲染之前，識所缺者
- 冊更之後，驗清單同步
- 圖符之脈定期康察

## 入

- **可選**：實體之類——`skill`、`agent`、`team`、或 `all`（默：`all`）
- **可選**：欲察之調（默：`cyberpunk`——參照之調）

## 法

### 第一步：讀諸冊

自源冊收諸實體之 ID。

1. 讀 `skills/_registry.yml`——取諸域之技 ID
2. 讀 `agents/_registry.yml`——取諸人 ID
3. 讀 `teams/_registry.yml`——取諸隊 ID
4. 記其數：技、人、隊之總

**得：** 三實體 ID 之列，數合 `total_skills`、`total_agents`、`total_teams`。

**敗則：** 若冊檔缺，報其路，略該類。

### 第二步：讀符圖之映

自符映之檔收諸實體之 ID。

1. 讀 `viz/R/glyphs.R`——取 `SKILL_GLYPHS` 之諸鍵
2. 讀 `viz/R/agent_glyphs.R`——取 `AGENT_GLYPHS` 之諸鍵
3. 讀 `viz/R/team_glyphs.R`——取 `TEAM_GLYPHS` 之諸鍵

**得：** 三映 ID 之列。

**敗則：** 若符檔缺，報之，記該類諸實體皆未映。

### 第三步：算缺符者

以冊 ID 較映 ID。

1. 缺技符：`registry_skill_ids - mapped_skill_ids`
2. 缺人符：`registry_agent_ids - mapped_agent_ids`
3. 缺隊符：`registry_team_ids - mapped_team_ids`

**得：** 諸實體 ID——存於冊而符未映者。

**敗則：** 若算失，驗 ID 形式冊符之間相合（如下線與連字之別）。

### 第四步：察已渲之像

驗已映之符有對應之像檔。

1. 諸技 ID，察 `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. 諸人 ID，察 `viz/public/icons/<palette>/agents/<agentId>.webp`
3. 諸隊 ID，察 `viz/public/icons/<palette>/teams/<teamId>.webp`
4. 察 HD 變體於 `viz/public/icons-hd/`，結構同上

**得：** 諸實體之列——有符而缺像者（標準或 HD）。

**敗則：** 若像目不存，脈未嘗行——記諸皆缺。

### 第五步：察清單之新

較清單之數與冊之數。

1. 讀 `viz/public/data/icon-manifest.json`——數其條
2. 讀 `viz/public/data/agent-icon-manifest.json`——數其條
3. 讀 `viz/public/data/team-icon-manifest.json`——數其條
4. 較之於冊總

**得：** 清單之數合冊之數。不合者示清單陳腐。

**敗則：** 若清單檔缺，數據之脈須先行（`node build-data.js && node build-icon-manifest.js`）。

### 第六步：察孤像

行 `viz/public/icons*/`，標 WebP 檔——其 `<palette>/<domain>/<skillId>` 三者於 `icon-manifest.json` 未見者。

1. 列諸 WebP 檔：`find viz/public/icons* -name "*.webp"`
2. 各檔取 `<domain>/<id>` 自其路
3. 察 `<domain>/<id>` 於 `icon-manifest.json` 有條否
4. 收不合者為孤——存於盤而不復引。

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

**得：** 孤者零。有孤者，示技已徙於他域而未清（每徙一次，孤十八＝九調乘二尺）。

**敗則：** 手刪孤者——其無清單之條，不復供。徙事稀，手清可也。

### 第七步：生缺報

作結構化之總。

1. 輸出以清表或列：
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
2. 依所察建下步之行

**得：** 全缺報備，下步可行。

**敗則：** 若諸察皆過無缺，報「脈全同步」為佳果。

## 驗

- [ ] 三冊皆讀成
- [ ] 三符映之檔皆察
- [ ] 像目標準與 HD 皆掃
- [ ] 清單之新已驗
- [ ] 孤像已察（盤路較清單）
- [ ] 缺報已生，含數與實體之列
- [ ] 下步之行已備

## 陷

- **ID 形式不合**：冊用連字（`create-skill`），符映或用下線之鍵——較之時須歸一
- **調之假設**：只察 cyberpunk 調，失調特有之渲缺
- **空目之惑**：某域之目存而空，通配時似「像備」——宜察檔存，非目存
- **HD 未渲**：HD 像別居一樹（`icons-hd/`）——勿與標準相混
- **徙後之孤**：技之域變時，`build.sh` 於新路建像而不刪舊路——凡域徙後，必行第六步察孤

## 參

- [create-glyph](../create-glyph/SKILL.md) — 建此察所識之缺符
- [enhance-glyph](../enhance-glyph/SKILL.md) — 增現有符之質
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 行全脈以生諸缺像
