---
name: create-glyph
locale: wenyan
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

# 建字符

為 `viz/` 視層之技、行者、團之標建 R 之字符圖。每字符為純 ggplot2 之函，於 100x100 畫布繪可識之形，以霓光渲至透底 WebP。

## 用時

- 新技、行者、團已增，需視標
- 現字符需替或重設
- 為新域批建字符
- 為實體概念原型視喻

## 入

- **必要**：實體類——`skill`、`agent` 或 `team`
- **必要**：實體 ID（如 `create-glyph`、`mystic`、`r-package-review`）與域（技者）
- **必要**：視概——字符當示何
- **可選**：參字符以量繁度
- **可選**：自訂 `--glow-sigma` 值（默 4）

## 法

### 第一步：概——設視喻

識欲標之實體而擇視喻。

1. 讀實體源文件以解其核心概念：
   - 技：`skills/<id>/SKILL.md`
   - 行者：`agents/<id>.md`
   - 團：`teams/<id>.md`
2. 擇喻類：
   - **實物**：試驗之瓶、安全之盾
   - **抽象**：合併之箭、迭代之旋
   - **合成**：組 2-3 簡形（如文件+筆）
3. 參現字符以校繁度：

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

4. 定函名：`glyph_<descriptive_name>`（snake_case，唯一）

**得：** 清心圖，有 2-6 劃之層。

**敗則：** 若概過抽，退至相關實物。察同域現字符以取靈感。

### 第二步：構——書字符函

書生 ggplot2 層之 R 函。

1. 函簽（不可變之契）：
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. 施縮因 `* s` 於諸維以一致縮：
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. 以現原建幾何：

   | 幾何 | 用 |
   |----------|-------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | 填形 |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | 開線／曲 |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | 段、箭 |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | 矩形 |
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

5. 返平 `list()` 之層（渲引遍歷而各包以光）

6. 按實體類置函於宜原文件：
   - **技**：按域分於 19 原文件：
     - `primitives.R` — bushcraft、compliance、containerization、data-serialization、defensive
     - `primitives_2.R` — devops、general、git、mcp-integration
     - `primitives_3.R` — mlops、observability、PM、r-packages、reporting、review、web-dev、esoteric、design
     - 新域續 `primitives_4.R` 至 `primitives_19.R`
   - **行者**：`viz/R/agent_primitives.R`
   - **團**：`viz/R/team_primitives.R`

**得：** 可行 R 函返 2-6 ggplot2 層之列。

**敗則：** 若 `ggforce::geom_circle` 致訛，確 ggforce 已裝。若坐標偏，記畫布 100x100，(0,0) 於左下。互動試函：
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### 第三步：入——映實體至字符

於宜字符映文件加實體-字符之映。

**技者：**
1. 開 `viz/R/glyphs.R`
2. 尋目標域之註釋段（如 `# -- design (3)`）
3. 於域塊內按字母序加項：
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. 若用則更域計於註釋

**行者：**
1. 開 `viz/R/agent_glyphs.R`
2. 於 `AGENT_GLYPHS` 尋字母位
3. 加項：
   ```r
   "agent-id" = "glyph_function_name",
   ```

**團：**
1. 開 `viz/R/team_glyphs.R`
2. 於 `TEAM_GLYPHS` 尋字母位
3. 加項：
   ```r
   "team-id" = "glyph_function_name",
   ```

5. 驗目標列無重 ID

**得：** 宜 `*_GLYPHS` 列含新映。

**敗則：** 若後建報「No glyph mapped」，察實體 ID 精合清單與籍。

### 第四步：清單——增標項

於宜清單文件註冊標。

**技者：** `viz/data/icon-manifest.json`
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

**行者：** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**團：** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**得：** 合法 JSON，新項置於同類兄弟間。

**敗則：** 驗 JSON 語法。常誤：末陣元後拖逗號、缺引號。

### 第五步：渲——生標

運標管以渲新字符。宜以 `build.sh` 為入——其處平台察與 R 二進擇。全旗與管構參 [render-icon-pipeline](../render-icon-pipeline/SKILL.md)。

```bash
# From project root — renders all palettes, standard + HD, skips existing icons
bash viz/build.sh --only <domain> --skip-existing          # skills
bash viz/build.sh --type agent --only <id> --skip-existing # agents
bash viz/build.sh --type team --only <id> --skip-existing  # teams

# Dry run first:
bash viz/build.sh --only <domain> --dry-run
```

`build.sh` 運全管（palette → data → manifest → render → terminal glyphs）。非渲步加十秒而確諸數當。

出位：
   - 技：`viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - 行者：`viz/public/icons/<palette>/agents/<agent-id>.webp`
   - 團：`viz/public/icons/<palette>/teams/<team-id>.webp`

**得：** 誌示 `OK: <entity> (seed=XXXXX, XX.XKB)` 而 WebP 文件存。

**敗則：**
- `"No glyph mapped"` — 第三步映缺或有誤
- `"Unknown domain"` — 域不在 `palettes.R` 之 `get_palette_colors()`
- R 包訛——先運 `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))`
- 若渲崩，互動試字符函（參第二步之退）

### 第六步：驗——視察

察渲出合質準。

1. 驗文件存且尺合：
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. 以像觀開 WebP 以察：
   - 全尺（1024x1024）形清
   - 霓光存而不蓋
   - 底透（無黑白矩）
   - 畫布邊無切

3. 察小尺（標於力圖渲於 ~40-160px）：
   - 形仍可識
   - 細不成噪
   - 光不掩形

**得：** 清可識之字符圖，均霓光於透底。

**敗則：**
- 光過強：以 `--glow-sigma 2` 重渲（默 4）
- 光過弱：以 `--glow-sigma 8` 重渲
- 小尺不可讀：簡字符（減層、粗筆、增 `.lw(s, base)` 基值）
- 邊切：減形尺或移中心

### 第七步：迭——若需修

調而重渲。

1. 常調：
   - **粗筆**：增 `.lw(s, base)`——試 `base = 3.0` 或 `3.5`
   - **填更顯**：增 alpha 由 0.10 至 0.15-0.20
   - **形比**：調 `s` 之乘（如 `20 * s` -> `24 * s`）
   - **加／減細層**：總層守 2-6 為最佳

2. 變後重渲：
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. 滿意則驗清單狀為 `"done"`（建本成時自動更）

**得：** 終標過第六步諸驗。

**敗則：** 若三次以上迭仍不可讀，考全改視喻（返第一步）。

## 參考

### 域與實體色譜

諸 58 域色（技用）定於 `viz/R/palettes.R`（單一真源）。行者與團色亦管於 `palettes.R`。賽博朋克譜（手調霓色）於 `get_cyberpunk_colors()`。viridis 族譜以 `viridisLite` 自動生。

查色：
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

增新域時，於 `palettes.R` 三處加之：
1. `PALETTE_DOMAIN_ORDER`（字母）
2. `get_cyberpunk_colors()` 域列
3. 運 `bash viz/build.sh` 重生譜、數、清單

### 字符函錄

全函錄參原源：
- **技**：`viz/R/primitives.R` 至 `viz/R/primitives_19.R`（按域分）
- **行者**：`viz/R/agent_primitives.R`
- **團**：`viz/R/team_primitives.R`

### 助函

| 函 | 簽 | 用 |
|----------|-----------|---------|
| `.lw(s, base)` | `(scale, base=2.5)` | 縮感之線寬 |
| `.aes(...)` | `ggplot2::aes` 別 | 美學映簡 |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | 加 alpha 於十六色 |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | 亮十六色 |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | 暗十六色 |

## 驗

- [ ] 字符函循 `glyph_<name>(cx, cy, s, col, bright) -> list()` 簽
- [ ] 諸維皆用 `* s` 縮
- [ ] 色策：`col` 為填、`bright` 為輪、`hex_with_alpha()` 為透
- [ ] 函置於合實體類與域之原文件
- [ ] 字符映項加於宜 `*_glyphs.R`
- [ ] 清單項加有正實體 ID、路、`"status": "pending"`
- [ ] 建命無訛而運（先 dry-run）
- [ ] 渲 WebP 存於期路
- [ ] 文件尺於期範（15-80 KB）
- [ ] 標於 1024px 與 ~40px 顯皆清
- [ ] 底透（字符後無實矩）
- [ ] 成渲後清單狀更為 `"done"`

## 陷

- **忘 `* s`**：硬碼像素值縮時破。皆乘 `s`。
- **畫布源混**：(0,0) 於左下非左上。`y` 高則上。
- **雙光**：渲引已施 `ggfx::with_outer_glow()` 於每層。字符函內**勿**加光。
- **層過多**：每層獨包光。逾八層則渲慢而視噪。
- **ID 不合**：字符映、清單、籍之實體 ID 須精合。
- **JSON 拖逗**：清單為嚴 JSON。末陣元後勿拖逗。
- **缺域色**：若域不在 `palettes.R` 之 `get_cyberpunk_colors()`，渲誤。先加色再重生。
- **原文件誤**：技於按域分之 `primitives*.R`，行者於 `agent_primitives.R`，團於 `team_primitives.R`。

## 參

- [enhance-glyph](../enhance-glyph/SKILL.md) — 改現字符視質、修渲問、增細層
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 察缺字符與標以知所需建者
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — 端至端運全渲管
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — 補 AI 之像生（Z-Image 對 R 碼字符）
- [ornament-style-color](../ornament-style-color/SKILL.md) — 可施於字符點填決之色論
- [create-skill](../create-skill/SKILL.md) — 加新技時觸字符建之父流
