---
name: enhance-glyph
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Improve an existing R-based pictogram glyph for the visualization layer.
  Covers visual audit of the current glyph, diagnosis of specific issues
  (proportions, readability, glow balance), targeted modifications to the
  glyph function, re-rendering, and before/after comparison. Works for skill,
  agent, and team glyphs. Use when a glyph renders poorly at small sizes, its
  visual metaphor is unclear, it has proportion issues, the neon glow effect is
  unbalanced, or after adding new palettes or changing the rendering pipeline.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# 精繪符

改 `viz/` 視層之舊象符——審其現繪、診視議、施針對改、重繪、較前後。通於技、agent、team 符。

## 用

- 符於小尺繪劣（細喪、形融）
- 喻不明或與所代不合
- 比例議（過大、過小、偏中）
- 霓暈壓或弱符
- 一盤佳而他盤劣
- 加新盤或改繪管後批改

## 入

- **必**：類——`skill`、`agent`、`team`
- **必**：符之 ID（如 `commit-changes`、`mystic`、`tending`）
- **必**：所對特議（可讀、比例、暈、盤容）
- **可**：示標質之參符
- **可**：欲優之標盤（默：諸盤）

## 行

### 一：審——估現態

察現符並識特議。

1. 依類尋符函：
   - **技**：`viz/R/primitives*.R`（19 域文）, 映於 `viz/R/glyphs.R`
   - **Agent**：`viz/R/agent_primitives.R`, 映於 `viz/R/agent_glyphs.R`
   - **Team**：`viz/R/team_primitives.R`, 映於 `viz/R/team_glyphs.R`
2. 讀符函以知其構：
   - 幾層？
   - 呼何原？
   - 尺與位？
3. 察已繪之出：
   - 技：`viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agent：`viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Team：`viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - 察 2-3 他盤之跨盤繪
   - 察於圖尺（~48px）與詳尺（~160px）
4. 於**質維**計分：

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the entity?   |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. 識最低 1-2 維——此乃改標

得：明診符之誤與何維須改。審宜特：「比例：符僅用 40% 畫布」非「劣」。

敗：符函缺或名不在 `*_glyphs.R` 映→或尚未建；用 `create-glyph` 代之。

### 二：診——根因析

定何以議在。

1. 對**可讀**議：
   - 細過多，於小尺融？
   - 素間對比不足？
   - 線過細（< 1.5 `size` 於 s=1.0）？
   - 素相距過近？
2. 對**比例**議：
   - 尺 `s` 過小或過大？
   - 中偏（50, 50）？
   - 素過安域（10-90）？
3. 對**暈**議：
   - 符筆寬與 `ggfx::with_outer_glow()` 相交：
     - 細線：暈致模
     - 厚填：暈加冗盛
   - 多素疊：合暈致熱點
4. 對**盤容**議：
   - 符用硬碼色非 `col`/`bright` 參？
   - 低對盤（cividis、mako）使符不見？
   - 符依某盤不供之色變？
5. 各議記特根因

得：根因直指碼改。「符過小」→「尺因 0.6 宜 0.8」。「暈壓」→「三疊填各生暈」。

敗：根因於碼察不明→以異參獨繪以隔議。用 `render_glyph()` 單符試。

### 三：改——施針對修

編符函以解診議。

1. 開含符函之文
2. 施針對診之改：
   - **尺/比例**：調 `s` 乘或素偏
   - **可讀**：簡繁素、增筆寬、加距
   - **暈衡**：減疊填、填致盛處用輪代
   - **盤容**：確諸色源於 `col`/`bright` 參，以 alpha 加深
3. 循**符函契**：
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. 保函簽——勿改參
5. 改宜微：修診議，勿重設全符

得：改之符函解一、二步所識之特議。改針對而微——精，非重。

敗：改使他維劣（如修比例破可讀）→復而試他法。若需重設→用 `create-glyph` 代之。

### 四：重繪——生新圖

繪改之符並驗修。必用 `build.sh`——其處平台察與 R 擇。全旗見 [render-icon-pipeline](../render-icon-pipeline/SKILL.md)。

1. 依類重繪：

   ```bash
   # From project root — use --no-cache to force re-render of modified glyph
   bash viz/build.sh --only <domain> --no-cache          # skills
   bash viz/build.sh --type agent --only <id> --no-cache # agents
   bash viz/build.sh --type team --only <id> --no-cache  # teams
   ```

2. 驗各盤之出文存於期徑
3. 察文大——圖宜 2-15 KB（WebP）：
   - < 2 KB：符或過簡或繪敗
   - > 15 KB：符或過繁（層過多）

得：諸盤新圖已生。文大於期圍。

敗：build 本誤→察 R 控出特誤。常因：符函缺閉括、引未定原、函返非列。繪成而出空→符層或出畫布。

### 五：較——前後驗

驗精改善標維。

1. 較新舊繪：
   - 察 cyberpunk 盤於圖（48px）與詳（160px）
   - 至少察 2 他盤（一亮如 turbo、一暗如 mako）
2. 重計一步之質維：
   - 標維宜至少增 1
   - 非標維勿減
3. 若符用於力圖→於其中試：
   - 自 `viz/` 起 HTTP 服：`python3 -m http.server 8080`
   - 載圖尋其點
   - 驗圖於默縮與放大繪正
4. 記所改與所得

得：標維可量之改而他維無退。符於兩尺與諸盤皆佳。

敗：改微或退→復而重診。或原符之限乃喻之本非實現——此時喻本身須改（升至 `create-glyph`）。

## 驗

- [ ] 現符已審並診特議
- [ ] 各議之根因已識
- [ ] 改針對診之議（無過編）
- [ ] 符函契已保（簽未變）
- [ ] 諸盤圖已重繪
- [ ] 前後較示標維改善
- [ ] 非標維無退
- [ ] 文大於期圍（2-15 KB WebP）
- [ ] 符於力圖境繪正（若適）

## 忌

- **過精**：修一議後調諸餘。循診之議
- **破契**：改函簽破繪管。5-參契不可變
- **專盤優**：使符於 cyberpunk 極佳而 viridis 劣。必察 3+ 盤
- **略小尺繪**：160px 美而 48px 成塊乃敗精
- **忘重繪**：編函而未行 build→改不可見
- **錯 build**：技用 `build-icons.R`、agent 用 `build-agent-icons.R`、team 用 `build-team-icons.R`

## 參

- [create-glyph](../create-glyph/SKILL.md) — 自零建新符（精不足時用）
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 察管中何符須精
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 精後行全繪管
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 適符組之視設原則
- [chrysopoeia](../chrysopoeia/SKILL.md) — 值取法與符優相類（揚金、去渣）
