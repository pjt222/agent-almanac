---
name: create-glyph
locale: wenyan-ultra
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

# 造符

於 `viz/` 視層造 R 基象圖符為技、代、團標。各符為純 ggplot2 函，於 100x100 畫繪可識形、以霓暈效渲為透 WebP。

## 用

- 新技、代、團已加須視標
- 存符須換或重設
- 為新技域批造符
- 試視喻為項概

## 入

- **必**：項型 — `skill`、`agent`、`team`
- **必**：項 ID（如 `create-glyph`、`mystic`、`r-package-review`）與域（技時）
- **必**：視概——符當繪何
- **可**：考符以評複
- **可**：自定 `--glow-sigma` 值（默：4）

## 行

### 一：概——設視喻

識所符項並擇視喻。

1. 讀項源以曉核概：
   - 技：`skills/<id>/SKILL.md`
   - 代：`agents/<id>.md`
   - 團：`teams/<id>.md`
2. 擇喻型：
   - **實物**：實驗用瓶、安用盾
   - **抽符**：併用箭、迭用螺
   - **合**：合 2-3 簡形（如文+筆）
3. 參存符以校複：

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

4. 定函名：`glyph_<descriptive_name>`（snake_case、獨）

**得：** 形之明心圖含 2-6 計層。

**敗：** 概過抽→退至相關實物。參同域存符為靈。

### 二：組——書符函

書生 ggplot2 層之 R 函。

1. 函簽（不變約）：
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
     }
   ```

2. 施比因 `* s` 於諸寸為一致：
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. 以可用原建幾：

   | 幾 | 用 |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | 填形 |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | 開線/曲 |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | 線段、箭 |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | 矩 |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | 圓 |

4. 施色策：

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

5. 返平 `list()` 層（渲器迭而以暈包各）

6. 按項型置函於合原檔：
   - **技**：19 原檔按域組
   - **代**：`viz/R/agent_primitives.R`
   - **團**：`viz/R/team_primitives.R`

**得：** 返 2-6 ggplot2 層之可用 R 函。

**敗：** `ggforce::geom_circle` 誤→保 ggforce 裝。坐偏→記畫 100x100、(0,0) 於左下。交互試：
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### 三：註——映項至符

於合符映檔加項符映。

**技：** 開 `viz/R/glyphs.R`、於域塊內按字母序加 `"skill-id" = "glyph_function_name",`
**代：** 開 `viz/R/agent_glyphs.R`、於 `AGENT_GLYPHS` 加同樣項
**團：** 開 `viz/R/team_glyphs.R`、於 `TEAM_GLYPHS` 加同樣項

驗目列無重 ID。

**得：** 合 `*_GLYPHS` 列含新映。

**敗：** 構報「No glyph mapped」→復察項 ID 合備與庫。

### 四：備——加標項

於合備檔註標。

**技：** `viz/data/icon-manifest.json`
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

**代：** `viz/data/agent-icon-manifest.json`（用 `agentId` 與 `public/icons/cyberpunk/agents/<agent-id>.webp`）

**團：** `viz/data/team-icon-manifest.json`（用 `teamId` 與 `public/icons/cyberpunk/teams/<team-id>.webp`）

**得：** 有效 JSON 含新項置於同型兄弟。

**敗：** 驗 JSON 文法。常誤：末陣元後遺逗、缺引。

### 五：渲——生標

行標流渲新符。恆用 `build.sh` 為入——理平台辨與 R 二擇。見 [render-icon-pipeline](../render-icon-pipeline/SKILL.md) 全旗考與流架。

```bash
# From project root — renders all palettes, standard + HD, skips existing icons
bash viz/build.sh --only <domain> --skip-existing          # skills
bash viz/build.sh --type agent --only <id> --skip-existing # agents
bash viz/build.sh --type team --only <id> --skip-existing  # teams

# Dry run first:
bash viz/build.sh --only <domain> --dry-run
```

`build.sh` 行全流（palette → data → manifest → render → terminal glyphs）。

出位：
   - 技：`viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - 代：`viz/public/icons/<palette>/agents/<agent-id>.webp`
   - 團：`viz/public/icons/<palette>/teams/<team-id>.webp`

**得：** 誌顯 `OK: <entity> (seed=XXXXX, XX.XKB)` 而 WebP 檔存。

**敗：**
- `"No glyph mapped"` — 步三映缺或錯
- `"Unknown domain"` — 域不於 `palettes.R` 之 `get_palette_colors()`
- R 包誤 — 先行 `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))`
- 渲崩→交互試符函

### 六：驗——視察

察渲出合質準。

1. 驗檔存且寸合：
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. 以像視開 WebP 察：
   - 形於全寸（1024x1024）清讀
   - 霓暈存而不蓋
   - 背透（無黑白矩）
   - 畫邊無裁

3. 於小寸察（力圖中標渲於~40-160px）：
   - 形仍可識
   - 細不化噪
   - 暈不蓋形

**得：** 清、可識之象圖含透背之均霓暈。

**敗：**
- 暈強→以 `--glow-sigma 2` 重渲
- 暈弱→以 `--glow-sigma 8` 重渲
- 小寸不讀→簡符、粗筆、增 `.lw(s, base)`
- 邊裁→減形寸或移中

### 七：迭——若需則精

調而重渲。

1. 常調：
   - **粗筆**：增 `.lw(s, base)` — 試 `base = 3.0` 或 `3.5`
   - **更顯填**：alpha 自 0.10 增至 0.15-0.20
   - **形比**：調 `s` 之乘（如 `20 * s` -> `24 * s`）
   - **加/減細層**：總層保於 2-6

2. 改後重渲：刪存標、用合構令重渲

3. 滿時驗備態顯 `"done"`

**得：** 終標通步六諸察。

**敗：** 3+ 迭後符仍不讀→考全異視喻（返步一）。

## 考

### 域與項色盤

58 域色（技）定於 `viz/R/palettes.R`（唯真源）。代與團色亦理於 `palettes.R`。cyberpunk 色盤於 `get_cyberpunk_colors()`。

```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]
get_palette_colors("cyberpunk")$agents[["mystic"]]
get_palette_colors("cyberpunk")$teams[["tending"]]
```

加新域時於 `palettes.R` 三處加：`PALETTE_DOMAIN_ORDER`（字母）、`get_cyberpunk_colors()` 域列、行 `bash viz/build.sh` 重生。

### 符函錄

- **技**：`viz/R/primitives.R` 至 `viz/R/primitives_19.R`（按域組）
- **代**：`viz/R/agent_primitives.R`
- **團**：`viz/R/team_primitives.R`

### 助函

| 函 | 簽 | 目 |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | 比覺線寬 |
| `.aes(...)` | `ggplot2::aes` 別 | 簡美映 |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | 加 alpha 於 hex 色 |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | 亮 hex 色 |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | 暗 hex 色 |

## 驗

- [ ] 符函循 `glyph_<name>(cx, cy, s, col, bright) -> list()` 簽
- [ ] 諸寸用 `* s` 比因
- [ ] 色策填用 `col`、廓用 `bright`、透用 `hex_with_alpha()`
- [ ] 函置於合項型與域之原檔
- [ ] 符映項加於合 `*_glyphs.R`
- [ ] 備項含正項 ID、路、`"status": "pending"`
- [ ] 構令無誤行（先試行）
- [ ] 渲 WebP 存於期路
- [ ] 檔寸於期範（15-80 KB）
- [ ] 標於 1024px 與~40px 顯寸皆清讀
- [ ] 透背（符後無實矩）
- [ ] 成渲後備態更為 `"done"`

## 忌

- **忘 `* s`**：硬碼素值比變時破
- **畫原惑**：(0,0) 於左下、非左上
- **雙暈**：渲器已施 `ggfx::with_outer_glow()`、勿於符函內加暈
- **層過多**：過 8 層渲慢且視噪
- **ID 不合**：符映、備、庫之項 ID 須皆合
- **JSON 末逗**：備為嚴 JSON、末陣元後無逗
- **域色缺**：域不於 `get_cyberpunk_colors()`→渲誤
- **誤原檔**：技於 `primitives*.R`、代於 `agent_primitives.R`、團於 `team_primitives.R`

## 參

- [enhance-glyph](../enhance-glyph/SKILL.md) — 精存符視質
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 察缺符標
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 全端對端行渲流
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 補 AI 基像生
- [ornament-style-color](../ornament-style-color/SKILL.md) — 施於符飾填決之色理
- [create-skill](../create-skill/SKILL.md) — 觸符造之父流
