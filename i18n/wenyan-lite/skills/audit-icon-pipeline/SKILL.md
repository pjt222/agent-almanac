---
name: audit-icon-pipeline
locale: wenyan-lite
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

# Audit Icon Pipeline

以註冊表校之於字形映射文件、圖標目錄、清單，察缺字形、缺圖標、陳舊清單。生結構化之缺口報告，覆 skills、agents、teams。

## 適用時機

- 新增 skills、agents、teams 後，查是否需圖標
- 全管線渲染前，辨所缺
- 註冊表更新後，確清單一致
- 圖標管線之定期健檢

## 輸入

- **選擇性**：實體類型之過濾——`skill`、`agent`、`team` 或 `all`（預設：`all`）
- **選擇性**：所查之調色板（預設：`cyberpunk`——參考調色板）

## 步驟

### 步驟一：讀註冊表

自真源之註冊表採諸實體之識別符。

1. 讀 `skills/_registry.yml`——取所有域中之 skill ID
2. 讀 `agents/_registry.yml`——取所有 agent ID
3. 讀 `teams/_registry.yml`——取所有 team ID
4. 錄其數：skills、agents、teams 之總

**預期：** 三實體識別符之列，其數合於 `total_skills`、`total_agents`、`total_teams`。

**失敗時：** 某註冊表文件缺失時，報其路徑而略此實體類型。

### 步驟二：讀字形映射

自字形映射文件採所有已映射之實體識別符。

1. 讀 `viz/R/glyphs.R`——取 `SKILL_GLYPHS` 列中所有鍵
2. 讀 `viz/R/agent_glyphs.R`——取 `AGENT_GLYPHS` 列中所有鍵
3. 讀 `viz/R/team_glyphs.R`——取 `TEAM_GLYPHS` 列中所有鍵

**預期：** 三已映射識別符之列。

**失敗時：** 某字形文件缺失時，報之並將該類實體全標為未映射。

### 步驟三：算缺之字形

以註冊表之識別符減已映射之識別符。

1. 缺之 skill 字形：`registry_skill_ids - mapped_skill_ids`
2. 缺之 agent 字形：`registry_agent_ids - mapped_agent_ids`
3. 缺之 team 字形：`registry_team_ids - mapped_team_ids`

**預期：** 存於註冊表而無字形函數映射之實體識別符之列。

**失敗時：** 減之算失敗時，驗註冊表與字形文件間之識別符格式是否合（如下劃線 vs 連字號）。

### 步驟四：查已渲之圖標

驗已映射字形有對應之已渲圖標文件。

1. 每映射之 skill ID，查 `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. 每映射之 agent ID，查 `viz/public/icons/<palette>/agents/<agentId>.webp`
3. 每映射之 team ID，查 `viz/public/icons/<palette>/teams/<teamId>.webp`
4. 以同結構查 `viz/public/icons-hd/` 中之 HD 變體

**預期：** 有字形而無已渲圖標之實體列（標準 / HD）。

**失敗時：** 若圖標目錄不存，則管線未曾運行——報全為缺。

### 步驟五：查清單之新鮮度

以清單之數比註冊表之數。

1. 讀 `viz/public/data/icon-manifest.json`——計條目
2. 讀 `viz/public/data/agent-icon-manifest.json`——計條目
3. 讀 `viz/public/data/team-icon-manifest.json`——計條目
4. 比之於註冊表之總

**預期：** 清單之數合於註冊表之數。有差則示清單陳舊。

**失敗時：** 清單文件不存時，先須運行數據管線（`node build-data.js && node build-icon-manifest.js`）。

### 步驟六：察孤兒圖標

走 `viz/public/icons*/`，標 WebP 文件之 `<palette>/<domain>/<skillId>` 三元組不在 `icon-manifest.json` 者。

1. 列所有 WebP 文件：`find viz/public/icons* -name "*.webp"`
2. 每文件，自其路徑取 `<domain>/<id>`
3. 查 `<domain>/<id>` 於 `icon-manifest.json` 有無條目
4. 收無匹之文件為孤兒——存於盤而已不被引

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

**預期：** 孤兒為零。有孤兒示 skills 已遷至他域而未清（每遷 18 孤兒 = 9 調色板 × 2 尺寸）。

**失敗時：** 手刪孤兒——無清單條目，不再被提供。遷域事罕，手清可受。

### 步驟七：生缺口報告

生結構化之總。

1. 格式為明表或列：
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
2. 依所發提下一步之建議

**預期：** 完整之缺口報告，附可行之下一步。

**失敗時：** 若諸查皆過而無缺口，報「管線已完全一致」為正果。

## 驗證

- [ ] 三註冊表皆讀成
- [ ] 三字形映射文件皆查
- [ ] 圖標目錄標準與 HD 皆掃
- [ ] 清單新鮮度已驗
- [ ] 孤兒圖標已查（盤路徑對清單）
- [ ] 缺口報告已生，附數與實體列
- [ ] 已提可行之下一步

## 常見陷阱

- **識別符格式失配**：註冊表用連字號（`create-skill`），字形映射或用下劃線鍵——比較時須標準化
- **調色板假設**：僅查 cyberpunk 調色板漏調色板專之渲染缺口
- **空目錄**：域目錄存而空，globbing 時算作「圖標在」——查文件存，非目錄存
- **HD 未渲**：HD 圖標在分離目錄樹（`icons-hd/`）——勿與標準混
- **遷域後之孤兒**：skill 之域變時，`build.sh` 於新路徑創圖標而不刪舊路徑——遷域後務行步六孤兒之查

## 相關技能

- [create-glyph](../create-glyph/SKILL.md) — 創此審所辨之缺字形
- [enhance-glyph](../enhance-glyph/SKILL.md) — 提升既有字形之質
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 運行全管線以生所缺圖標
