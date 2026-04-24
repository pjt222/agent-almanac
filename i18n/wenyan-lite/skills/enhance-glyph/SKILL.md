---
name: enhance-glyph
locale: wenyan-lite
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

# 改造符號

改 `viz/` 視化層既有之象形符號——審其當下之渲染、診視覺之疵、施針對性之改、重渲、比前後。適用於技能、代理、團隊之符號。

## 適用時機

- 符號小尺渲染不佳（細節盡失、形合）
- 符號之視覺隱喻不明或不配其所代之實體
- 符號比例失調（過大、過小、偏中）
- 霓虹輝光效過壓或不足
- 符號於一色板佳而於他色板劣
- 加新色板或改渲染管線後之批改

## 輸入

- **必要**：實體類型——`skill`、`agent` 或 `team`
- **必要**：欲改符號之實體 ID（如 `commit-changes`、`mystic`、`tending`）
- **必要**：待解之具體疵（可讀性、比例、輝光、色板相容）
- **選擇性**：示所期品質之參考符號
- **選擇性**：待優化之目標色板（預設：所有色板）

## 步驟

### 步驟一：審——察當下之態

察當下之符號並識具體之疵。

1. 依實體類型定符號函數所在：
   - **Skills**：`viz/R/primitives*.R`（19 域分文件），映於 `viz/R/glyphs.R`
   - **Agents**：`viz/R/agent_primitives.R`，映於 `viz/R/agent_glyphs.R`
   - **Teams**：`viz/R/team_primitives.R`，映於 `viz/R/team_glyphs.R`
2. 讀符號函數以解其結構：
   - 用幾層？
   - 呼何原語？
   - 縮放因子與定位若何？
3. 察渲染輸出：
   - Skills：`viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents：`viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams：`viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - 若可得，察 2-3 他色板以驗跨色板渲染
   - 於圖示尺（~48px 於圖中）與面板尺（~160px 於細節面板）皆察之
4. 於**品質維度**評符號：

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

5. 識 1-2 最低分之維度——此為改造之標

**預期：** 對符號之疵與待改維度有明之診。審宜具體：「比例：符號僅用 40% 之畫布」而非「看似不佳」。

**失敗時：** 若符號函數缺或實體未於其 `*_glyphs.R` 映射中，則符號或未建——應改用 `create-glyph`。

### 步驟二：診——根因析

定所識之疵何以存。

1. 於**可讀性**之疵：
   - 細節過多而小尺合？
   - 符號元素間對比不足？
   - 線過細（於 s=1.0 `size` < 1.5）？
   - 元素過近？
2. 於**比例**之疵：
   - 縮放因子 `s` 過小或過大？
   - 中心自 (50, 50) 偏？
   - 元素超出安全區（10-90 範圍）？
3. 於**輝光**之疵：
   - 符號筆畫寬與 `ggfx::with_outer_glow()` 相交：
     - 細線：輝光使其模糊
     - 厚填：輝光加過多之光暈
   - 多重疊元素：複合輝光生熱點
4. 於**色板相容**之疵：
   - 符號用寫死之色而非 `col`/`bright` 參數？
   - 低對比色板（cividis、mako）令符號不可見？
   - 符號倚色之變而某色板不予？
5. 記各疵之具體根因

**預期：** 根因直指代碼改。「符號過小」→「縮放因子為 0.6 宜 0.8」。「輝光過壓」→「三重疊之填充多邊形各生輝光」。

**失敗時：** 若根因不顯於代碼檢，以不同參數孤立渲符號以隔疵。用 `render_glyph()` 以單符號測之。

### 步驟三：改——施針對之修

編符號函數以解所診之疵。

1. 開含符號函數之文件
2. 施針對診之改：
   - **縮放/比例**：調 `s` 乘子或元素偏移
   - **可讀性**：簡複雜元素、增筆畫寬、加間距
   - **輝光平衡**：減重疊之填充區，於填充生光暈處改用輪廓
   - **色板相容**：確所有色源自 `col`/`bright` 參數，加透明度以示深度
3. 遵**符號函數契約**：
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. 保函數簽名——勿改參
5. 改宜少：修所診之疵，勿重設整符號

**預期：** 改後之符號函數解步驟一二所識之具體疵。改乃針對而少——改之，非重設。

**失敗時：** 若改使他維劣（如修比例而壞可讀性），則回並試別法。若符號需全重設，改用 `create-glyph`。

### 步驟四：重渲——生新圖示

渲改後之符號並驗其修。恒以 `build.sh` 為之——其處平台偵測與 R 二進制選擇。見 [render-icon-pipeline](../render-icon-pipeline/SKILL.md) 查全之旗標參考。

1. 依實體類型重渲：

   ```bash
   # From project root — use --no-cache to force re-render of modified glyph
   bash viz/build.sh --only <domain> --no-cache          # skills
   bash viz/build.sh --type agent --only <id> --no-cache # agents
   bash viz/build.sh --type team --only <id> --no-cache  # teams
   ```

2. 驗輸出文件於各色板之預期路徑存
3. 查文件大小——圖示宜 2-15 KB（WebP）：
   - 不足 2 KB：符號或過簡，或渲染已敗
   - 逾 15 KB：符號或過繁（層過多）

**預期：** 為所有色板生新之圖示文件。文件大小於預期範圍。

**失敗時：** 若構建腳本錯，察 R 控制臺輸出以見具體錯。常因：符號函數缺閉括號、引未定之原語、或函數返非 list。若渲成而輸出空，符號之層或已出畫布界。

### 步驟五：比——前後驗

驗改善已改目標維度。

1. 比舊新渲：
   - 於圖示（48px）與面板（160px）尺察 cyberpunk 色板版
   - 至少察二他色板（一亮如 turbo，一暗如 mako）
2. 再評品質維度：
   - 目標維度宜至少升 1 分
   - 非目標維度宜不降
3. 若符號用於力導向圖，於其中測之：
   - 啟 HTTP 服務：`python3 -m http.server 8080` 於 `viz/`
   - 載圖並尋實體節點
   - 驗圖示於預設縮放與放大時皆正渲
4. 記所作之改與所達之改善

**預期：** 目標維度可測之改善，他維無退。符號於二尺與跨色板皆更佳。

**失敗時：** 若改善微或有退，則回改並重思診。有時原符號之限為隱喻本身所致，非實作——此時隱喻本身或需改（升級至 `create-glyph`）。

## 驗證清單

- [ ] 當前符號已審，具體疵已診
- [ ] 各疵之根因已識
- [ ] 改針對所診之疵（非過編）
- [ ] 符號函數契約已保（簽名未改）
- [ ] 圖示已為所有色板重渲
- [ ] 前後比示目標維度之改善
- [ ] 非目標維度無退
- [ ] 文件大小於預期範圍（2-15 KB WebP）
- [ ] 若用，符號於力導向圖中正渲

## 常見陷阱

- **過改造**：修一疵而後調其他。守所診之疵
- **破契約**：改函數簽名壞渲染管線。五參契約不可變
- **色板特定優化**：令符號於 cyberpunk 美而於 viridis 劣。恒察 3+ 色板
- **忽小尺渲染**：美之 160px 圖示於 48px 成一糊乃敗之改造
- **忘重渲**：編函數而未執構建令改不可見
- **錯誤之構建命**：Skills 用 `build-icons.R`，agents 用 `build-agent-icons.R`，teams 用 `build-team-icons.R`

## 相關技能

- [create-glyph](../create-glyph/SKILL.md) — 自新建符號（改造不足時用）
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 偵整管線中需改造之符號
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 改造後行完整渲染管線
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 適於符號組合之視覺設計原則
- [chrysopoeia](../chrysopoeia/SKILL.md) — 價值萃取方法論平行於符號優化（擴金、除渣）
