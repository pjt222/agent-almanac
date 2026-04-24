---
name: enhance-glyph
locale: wenyan
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

# 增飾字符

改 `viz/` 視化層中既有之字符——察其渲、診視之病、施針對之變、再渲、前後較。適於技、員、團之字符。

## 用時

- 字符於小尺渲差（細失、形融）
- 字符之象不明或不合其所代者
- 字符比例有疵（過大、過小、偏中）
- 霓光壓字符或失勢
- 字符於一色佳而於他色差
- 新色或渲流易後批量改進

## 入

- **必要**：實體之類——`skill`、`agent` 或 `team`
- **必要**：欲改之字符實體 ID（如 `commit-changes`、`mystic`、`tending`）
- **必要**：欲處之具體病（易讀、比例、光、色兼容）
- **可選**：示所求質之參照字符
- **可選**：目標色板（默：所有）

## 法

### 第一步：察——評現狀

觀當前字符，識具體病。

1. 依實體類尋字符函：
   - **Skills**：`viz/R/primitives*.R`（19 域分文件），於 `viz/R/glyphs.R` 映
   - **Agents**：`viz/R/agent_primitives.R`，於 `viz/R/agent_glyphs.R` 映
   - **Teams**：`viz/R/team_primitives.R`，於 `viz/R/team_glyphs.R` 映
2. 讀字符函，明其構：
   - 用幾層？
   - 呼何原件？
   - 尺與位為何？
3. 觀渲之出：
   - Skills：`viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents：`viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams：`viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - 若可，察另 2-3 色板之跨色渲
   - 觀於圖標尺（~48px 於圖）與面板尺（~160px 於詳面）
4. 於**質之維**評字符：

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

5. 識評最低之 1-2 維——此改之的也

**得：** 病之明診，知何維宜改。察宜具體：「比例：字符僅用畫布四成」非「看上去差」。

**敗則：** 若字符函缺或實體未於 `*_glyphs.R` 映，字符或尚未造——當用 `create-glyph`。

### 第二步：診——根因析

定所識病之因。

1. 於**易讀**病：
   - 細節過多，小尺融乎？
   - 字符元素對比不足乎？
   - 線過細（s=1.0 時 `size` < 1.5）乎？
   - 元素相距過近乎？
2. 於**比例**病：
   - 尺因子 `s` 過小或過大乎？
   - 中偏離 (50, 50) 乎？
   - 元素逾安全域（10-90）乎？
3. 於**光**病：
   - 字符描線寬與 `ggfx::with_outer_glow()` 交互：
     - 細線：光使之模糊
     - 厚填：光加過盛
   - 多重疊元素：複合光生熱點
4. 於**色兼容**病：
   - 字符用硬色而非 `col`/`bright` 參乎？
   - 低對比色板（cividis、mako）使字符不可見乎？
   - 字符賴某色板所不供之色變乎？
5. 各病記具體根因

**得：** 根因直指碼改。「字符過小」→「尺因子為 0.6，當 0.8」。「光壓」→「三重疊填多邊形各生光」。

**敗則：** 若根因非顯於碼察，以異參孤渲字符以隔問題。以 `render_glyph()` 單字符試之。

### 第三步：改——施針對之修

編字符函以處所診之病。

1. 開含字符函之文件
2. 依診施改：
   - **尺/比例**：調 `s` 乘因或元素偏移
   - **易讀**：簡繁元素，增描寬，加間距
   - **光衡**：減重疊填區，填生盛處用描
   - **色兼容**：確諸色源於 `col`/`bright` 參，加 alpha 以增深
3. 循**字符函之約**：
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. 保函之簽——勿易參
5. 改宜最少：修所診之病，勿重設字符

**得：** 已改之函處一、二步所識病。改為針對且最少——增飾，非重設。

**敗則：** 若改使他維更差（如修比例壞易讀），復原試他法。若需全重設，當用 `create-glyph`。

### 第四步：再渲——生新圖

渲改後字符，驗修。必用 `build.sh`——其處平台辨識與 R 本選。見 [render-icon-pipeline](../render-icon-pipeline/SKILL.md) 以全旗參。

1. 依實體類再渲：

   ```bash
   # From project root — use --no-cache to force re-render of modified glyph
   bash viz/build.sh --only <domain> --no-cache          # skills
   bash viz/build.sh --type agent --only <id> --no-cache # agents
   bash viz/build.sh --type team --only <id> --no-cache  # teams
   ```

2. 驗出之文件於預期路於各色板
3. 察文件大——圖宜 2-15 KB（WebP）：
   - 不足 2 KB：字符或過簡或渲敗
   - 逾 15 KB：字符或過繁（層過多）

**得：** 諸色板之新圖生。文件大於預期域。

**敗則：** 若 build 本有誤，察 R 控之出以求具體誤。常因：字符函缺閉括、呼未定原件、返非列表。若渲成而出空，字符層或出畫布界。

### 第五步：較——前後驗

驗改進所的之維。

1. 較舊新渲：
   - 觀 cyberpunk 色板於圖（48px）與面（160px）尺
   - 察至少二他色板（一光如 turbo，一暗如 mako）
2. 重評一步之質維：
   - 所的維宜增至少一分
   - 非所的維不宜減
3. 若字符用於力圖，於彼試：
   - 起 HTTP 服：於 `viz/` 運 `python3 -m http.server 8080`
   - 載圖尋實體節
   - 驗圖於默放與放大時渲正
4. 記所改與所進

**得：** 所的維可量之增，他維無退。字符於二尺與諸色板皆更佳。

**敗則：** 若進微或有退，復原改重思診。有時原字符之限乃象之本，非施之病——彼時象本身或須易（升 `create-glyph`）。

## 驗

- [ ] 當前字符已察附具體病診
- [ ] 諸病根因已識
- [ ] 改為針對所診病（非過編）
- [ ] 字符函之約得保（簽不易）
- [ ] 諸色板之圖已再渲
- [ ] 前後較於所的維示進
- [ ] 非所的維無退
- [ ] 文件大於預期域（WebP 2-15 KB）
- [ ] 字符於力圖場景渲正（若適）

## 陷

- **過飾**：修一病而調諸他。宜守所診之病
- **破約**：易函簽破渲流。五參之約不可變
- **色板特優**：令字符於 cyberpunk 完美而於 viridis 差。必察 3+ 色板
- **略小尺渲**：美於 160px 而於 48px 為團者，敗之飾也
- **忘再渲**：編函而不運 build 命，改不可見
- **誤 build 命**：Skills 用 `build-icons.R`，agents 用 `build-agent-icons.R`，teams 用 `build-team-icons.R`

## 參

- [create-glyph](../create-glyph/SKILL.md) — 從零造新字符（飾不足時用）
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 察流中何字符須飾
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 飾後運全渲流
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 視設計原則，適字符構
- [chrysopoeia](../chrysopoeia/SKILL.md) — 取值法，與字符優並行（增金，除渣）
