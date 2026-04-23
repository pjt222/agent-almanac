---
name: create-glyph
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create R-based pictogram glyphs for skill, agent, or team icons in the
  visualization layer. Covers concept sketching, ggplot2 layer composition using
  the primitives library, color strategy, registration in the appropriate glyph
  mapping file and manifest, rendering via the build pipeline, and visual
  verification of the neon-glow output. Use when a new entity has been added and
  needs a visual icon for the force-graph visualization, an existing glyph needs
  replacement, or when batch-creating glyphs for a new domain.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# 造字符

於 `viz/` 可視化層為技能、代理、團隊之圖示造 R 基礎之象形字符。各字符為純 ggplot2 函式，於 100x100 畫布上繪可辨之形，經霓虹發光效果渲為透明背景之 WebP。

## 適用時機

- 新技能、代理、團隊已加且需視覺圖示
- 既字符需替或重設計
- 為新技能領域批次造字符
- 為實體概念原型化視覺隱喻

## 輸入

- **必要**：實體型——`skill`、`agent`、或 `team`
- **必要**：實體 ID（如 `create-glyph`、`mystic`、`r-package-review`）及領域（技能需）
- **必要**：視覺概念——字符當繪何
- **選擇性**：參考字符以定複雜度
- **選擇性**：自訂之 `--glow-sigma` 值（預設 4）

## 步驟

### 步驟一：概念——設計視覺隱喻

辨待圖示化之實體並擇視覺隱喻。

1. 讀實體之源檔以明其核心概念：
   - 技能：`skills/<id>/SKILL.md`
   - 代理：`agents/<id>.md`
   - 團隊：`teams/<id>.md`
2. 擇隱喻型：
   - **實物**：實驗之瓶、安全之盾
   - **抽象符**：合併之箭、迭代之螺旋
   - **組合**：合 2-3 簡形（如文件 + 筆）
3. 參既字符以校準複雜度：

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. 定函式名：`glyph_<descriptive_name>`（snake_case、唯一）

**預期：** 含 2-6 計畫層之明心中草圖。

**失敗時：** 若概念過抽象，退回相關之具體物。察同領域既字符以得靈感。

### 步驟二：構成——寫字符函式

寫產 ggplot2 層之 R 函式。

1. 函式簽名（不變契約）：
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. 施縮放因子 `* s` 於所有尺寸以便一致縮放：
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. 以可用之原語建幾何：

   | 幾何 | 用法 |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | 填色之形 |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | 開之線/曲 |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | 線段、箭 |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | 矩形 |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | 圓 |

4. 施色策略：

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. 返平之 `list()` 層（渲染器迭之並各包以發光）

6. 按實體型置函式於當之原語檔：
   - **技能**：按領域分於 19 原語檔：
     - `primitives.R` —— bushcraft、compliance、containerization、data-serialization、defensive
     - `primitives_2.R` —— devops、general、git、mcp-integration
     - `primitives_3.R` —— mlops、observability、PM、r-packages、reporting、review、web-dev、esoteric、design
     - `primitives_4.R` 至 `primitives_19.R` 為新領域
   - **代理**：`viz/R/agent_primitives.R`
   - **團隊**：`viz/R/team_primitives.R`

**預期：** 一可行之 R 函式，返 2-6 ggplot2 層之清單。

**失敗時：** 若 `ggforce::geom_circle` 致誤，確保已裝 ggforce。若座標誤，記畫布為 100x100 且 (0,0) 於左下。互動測之：
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### 步驟三：註冊——映實體於字符

於當之字符映射檔加實體-字符映射。

**技能：**
1. 開 `viz/R/glyphs.R`
2. 尋目標領域之註釋段（如 `# -- design (3)`）
3. 於領域塊內按字母序加項：
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. 若適用，更註釋中之領域計數

**代理：**
1. 開 `viz/R/agent_glyphs.R`
2. 尋 `AGENT_GLYPHS` 中之字母位
3. 加項：
   ```r
   "agent-id" = "glyph_function_name",
   ```

**團隊：**
1. 開 `viz/R/team_glyphs.R`
2. 尋 `TEAM_GLYPHS` 中之字母位
3. 加項：
   ```r
   "team-id" = "glyph_function_name",
   ```

5. 驗目標清單中無重 ID

**預期：** 當之 `*_GLYPHS` 清單含新映射。

**失敗時：** 若後建構報「No glyph mapped」，驗實體 ID 合清單與註冊中者。

### 步驟四：清單——加圖示項

於當之清單檔註冊圖示。

**技能：** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**代理：** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**團隊：** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**預期：** 有效 JSON，新項置於其型之同輩間。

**失敗時：** 驗 JSON 語法。常見錯：末陣列元素後之尾逗、缺引號。

### 步驟五：渲染——生圖示

行圖示管線以渲新字符。恒以 `build.sh` 為入口——其處平台偵測與 R 二進制擇。全旗標參考與管線架構見 [render-icon-pipeline](../render-icon-pipeline/SKILL.md)。

```bash
# From project root — renders all palettes, standard + HD, skips existing icons
bash viz/build.sh --only <domain> --skip-existing          # skills
bash viz/build.sh --type agent --only <id> --skip-existing # agents
bash viz/build.sh --type team --only <id> --skip-existing  # teams

# Dry run first:
bash viz/build.sh --only <domain> --dry-run
```

`build.sh` 行全管線（palette → data → manifest → render → terminal glyphs）。非渲染步約加 10 秒，然確保所有資料為新。

輸出位：
   - 技能：`viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - 代理：`viz/public/icons/<palette>/agents/<agent-id>.webp`
   - 團隊：`viz/public/icons/<palette>/teams/<team-id>.webp`

**預期：** 日誌顯 `OK: <entity> (seed=XXXXX, XX.XKB)` 且 WebP 檔存。

**失敗時：**
- `"No glyph mapped"` —— 步驟三之映射缺或有拼錯
- `"Unknown domain"` —— 領域未於 `palettes.R` 中之 `get_palette_colors()`
- R 套件誤 —— 先行 `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))`
- 若渲染崩，互動測字符函式（見步驟二之回退）

### 步驟六：驗——視覺察

察渲染輸出合品質標準。

1. 驗檔存且大小合理：
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. 於圖像檢視器開 WebP 以察：
   - 形於全尺（1024x1024）清晰可讀
   - 霓虹光現而不過
   - 背景透明（無黑/白矩形）
   - 畫布邊無裁切

3. 於小尺下察（圖示於力引圖以 ~40-160px 渲）：
   - 形仍可辨
   - 細節不轉為雜訊
   - 光不壓形

**預期：** 透明背景上有均勻霓虹光之明、可辨象形圖。

**失敗時：**
- 光過強：以 `--glow-sigma 2` 重渲（預設 4）
- 光過弱：以 `--glow-sigma 8` 重渲
- 形於小尺不可讀：簡化字符（少層、粗筆、增 `.lw(s, base)` 之 base 值）
- 邊裁切：縮形尺寸或移中心

### 步驟七：迭代——按需精修

調並重渲。

1. 常調：
   - **粗筆**：增 `.lw(s, base)`——試 `base = 3.0` 或 `3.5`
   - **更顯之填**：alpha 自 0.10 增至 0.15-0.20
   - **形比**：調 `s` 之乘（如 `20 * s` -> `24 * s`）
   - **加/除細節層**：層數守 2-6 為佳

2. 改後重渲：
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. 滿意時驗清單狀態顯 `"done"`（建構腳本於成功時自動更之）

**預期：** 終圖示通過步驟六之所有驗證。

**失敗時：** 若 3+ 迭代後字符仍不清，考慮全異之視覺隱喻（返步驟一）。

## 參考

### 領域與實體色板

所有 58 領域色（技能用）於 `viz/R/palettes.R` 定義（單一真源）。代理與團隊之色亦於 `palettes.R` 管。cyberpunk 色板（手調霓虹色）於 `get_cyberpunk_colors()`。viridis 系色板自 `viridisLite` 生。

查色：
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

加新領域時，於 `palettes.R` 三處加之：
1. `PALETTE_DOMAIN_ORDER`（字母序）
2. `get_cyberpunk_colors()` 之 domains 清單
3. 行 `bash viz/build.sh` 重生色板、資料、清單

### 字符函式目錄

全可用字符函式見原語源檔：
- **技能**：`viz/R/primitives.R` 至 `viz/R/primitives_19.R`（按領域組）
- **代理**：`viz/R/agent_primitives.R`
- **團隊**：`viz/R/team_primitives.R`

### 輔助函式

| 函式 | 簽名 | 目的 |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | 感知縮放之線寬 |
| `.aes(...)` | `ggplot2::aes` 之別名 | 美學映射之簡式 |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | 於十六進制色加 alpha |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | 亮化十六進制色 |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | 暗化十六進制色 |

## 驗證清單

- [ ] 字符函式循 `glyph_<name>(cx, cy, s, col, bright) -> list()` 簽名
- [ ] 所有尺寸用 `* s` 縮放因子
- [ ] 色策略以 `col` 為填、`bright` 為描邊、`hex_with_alpha()` 為透明
- [ ] 函式置於合實體型與領域之正確原語檔
- [ ] 字符映射項加於當之 `*_glyphs.R` 檔
- [ ] 清單項加於正確之實體 ID、路徑、`"status": "pending"`
- [ ] 建構命令無誤（先 dry-run）
- [ ] 渲染之 WebP 存於期望路
- [ ] 檔大小於期望區間（15-80 KB）
- [ ] 圖示於 1024px 與 ~40px 顯示尺下皆清晰可讀
- [ ] 透明背景（字符後無實心矩形）
- [ ] 成功渲染後清單狀態更為 `"done"`

## 常見陷阱

- **忘 `* s`**：硬編像素值於縮放改時崩。恒乘以 `s`
- **畫布原點之惑**：(0,0) 於左下，非左上。較高 `y` 值上移
- **雙重光**：渲染器已對各層施 `ggfx::with_outer_glow()`。**勿**於字符函式內加光
- **層過多**：各層單獨包光。過 8 層令渲染緩而視雜
- **ID 不合**：字符映射、清單、註冊中之實體 ID 須完全相合
- **JSON 尾逗**：清單為嚴 JSON。末陣列元素後無尾逗
- **領域色缺**：若領域不於 `palettes.R` 之 `get_cyberpunk_colors()`，渲染將誤。先加色，再重生
- **原語檔誤**：技能於按領域之 `primitives*.R`，代理於 `agent_primitives.R`，團隊於 `team_primitives.R`

## 相關技能

- [enhance-glyph](../enhance-glyph/SKILL.md) —— 改既字符之視覺品質、修渲染問題、加細節層
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) —— 偵缺之字符與圖示以知待造者
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) —— 行全渲染管線
- [ornament-style-mono](../ornament-style-mono/SKILL.md) —— 互補之 AI 基礎影像生成（Z-Image 對 R 編字符）
- [ornament-style-color](../ornament-style-color/SKILL.md) —— 字符強調填決之色彩理論
- [create-skill](../create-skill/SKILL.md) —— 新技能加時觸字符造之父工作流
