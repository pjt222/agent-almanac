---
name: render-puzzle-docs
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Render the jigsawR Quarto documentation site for GitHub Pages.
  Supports fresh renders (clearing cache), cached renders (faster),
  and single-page renders. Uses the bundled render script or direct
  quarto.exe invocation from WSL. Use when building the full site after
  content changes, rendering a single page during iterative editing,
  preparing documentation for a release or PR, or debugging render
  errors in Quarto .qmd files.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
---

# 渲拼之文檔

渲 jigsawR 之 Quarto 文檔站。

## 用時

- 內變後建全文檔站乃用
- 於迭編時渲單頁乃用
- 為釋或 PR 備文檔乃用
- 於 Quarto .qmd 之文中察渲誤乃用

## 入

- **必要**：渲模（`fresh`、`cached`、或 `single`）
- **可選**：具體 .qmd 文之路（為單頁模）
- **可選**：是否於覽器開其果

## 法

### 第一步：擇渲模

| 模 | 命 | 時 | 用時 |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 分 | 內變、緩陳 |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 分 | 微編、緩有效 |
| Single | 直 quarto.exe | ~30s | 迭一頁 |

得：依當境擇渲模：內變或緩陳用 fresh，微編用 cached，迭一頁用 single。

敗則：若不確緩是否陳，默用 fresh。其雖久而保正出。

### 第二步：行渲

**Fresh 渲**（清 `_freeze` 與 `_site`，再行諸 R 碼）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Cached 渲**（用現 `_freeze` 文）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**單頁**（直渲一 .qmd 文）：

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

得：渲畢無誤。出於 `quarto/_site/`。

敗則：

- 察 .qmd 塊中 R 碼之誤（尋 `#| label:` 之標）
- 驗 pandoc 由 `RSTUDIO_PANDOC` 環變可得
- 試清緩：`rm -rf quarto/_freeze quarto/_site`
- 察 .qmd 文中所用之 R 包皆已裝

### 第三步：驗其出

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

確站之構：

- `quarto/_site/index.html` 存
- 導鏈解正
- 圖與 SVG 文渲正

得：`index.html` 存且非空。導鏈解，圖/SVG 於覽器渲正。

敗則：若 `index.html` 缺，渲或暗敗。重行附詳出察 R 碼之誤於 `.qmd` 塊。若獨某頁缺，驗其 `.qmd` 文於 `_quarto.yml` 中已列。

### 第四步：預覽（可選）

於 Windows 覽器開：

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

得：文檔站於 Windows 默覽器開以視察。

敗則：若自 WSL `cmd.exe /c start` 命敗，試 `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"`。或於覽器手導至文。

## 驗

- [ ] `quarto/_site/index.html` 存且非空
- [ ] 控台之出無渲誤
- [ ] 諸 R 碼塊皆順行（察誤信）
- [ ] 諸頁之導行
- [ ] 諸 .qmd 文之碼塊皆有 `#| label:` 以清渲

## 陷

- **陳之凍緩**：若 R 碼變，用 fresh 渲再生 `_freeze` 文
- **缺 R 包**：Quarto .qmd 文或用 renv 中無之包；先裝之
- **無 Pandoc**：確 `RSTUDIO_PANDOC` 設於 `.Renviron`
- **久之渲**：fresh 渲 5-7 分（14 頁附 R 行）；迭時用 cached 模
- **碼塊之標**：諸 R 碼塊宜有 `#| label:` 以清渲

## 參

- `generate-puzzle` — 生文檔所引之拼出
- `run-puzzle-tests` — 確文中之碼例為正
- `create-quarto-report` — 通用之 Quarto 文檔之立
