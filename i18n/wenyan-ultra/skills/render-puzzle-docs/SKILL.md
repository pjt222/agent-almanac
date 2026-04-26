---
name: render-puzzle-docs
locale: wenyan-ultra
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

# 渲拼文

渲 jigsawR Quarto 文站。

## 用

- 容變後建全站
- 漸編時渲一頁
- 為發或 PR 備文
- 除 Quarto .qmd 渲錯

## 入

- **必**：渲模（`fresh`、`cached`、`single`）
- **可**：特 .qmd 路（單頁模）
- **可**：果開於瀏覽乎

## 行

### 一：擇渲模

| Mode | Command | Duration | Use when |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | Content changed, cache stale |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | Minor edits, cache valid |
| Single | Direct quarto.exe | ~30s | Iterating on one page |

得：渲模按況選：fresh 為容變或舊快取、cached 為微編、single 為迭一頁。

敗：未定快取舊乎→默 fresh。費時而保正出。

### 二：執渲

**Fresh 渲**（清 `_freeze` 與 `_site`、重執諸 R 碼）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Cached 渲**（用現 `_freeze` 檔）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**單頁**（直渲一 .qmd 檔）：

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

得：渲畢無錯。出於 `quarto/_site/`。

敗：
- 察 .qmd 塊 R 碼錯（尋 `#| label:` 標）
- 驗 pandoc 可達經 `RSTUDIO_PANDOC` 環變
- 試清快取：`rm -rf quarto/_freeze quarto/_site`
- 察 .qmd 用之諸 R 包皆裝

### 三：驗出

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

確站構：
- `quarto/_site/index.html` 存
- 導鏈正解
- 圖與 SVG 檔正渲

得：`index.html` 存非空。導鏈解、圖/SVG 於瀏覽正渲。

敗：`index.html` 缺→渲或默敗。再行詳出、察 `.qmd` 塊 R 碼錯。某頁缺→驗其 `.qmd` 檔列於 `_quarto.yml`。

### 四：預（可）

於 Windows 瀏覽開：

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

得：文站於 Windows 默瀏覽開為視察。

敗：自 WSL `cmd.exe /c start` 命敗→試 `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` 代。或於瀏覽手導至檔。

## 驗

- [ ] `quarto/_site/index.html` 存非空
- [ ] 控出無渲錯
- [ ] 諸 R 碼塊成執（察錯訊）
- [ ] 頁間導行
- [ ] 諸 .qmd 檔於碼塊有 `#| label:` 為潔出

## 忌

- **舊 freeze 快取**：R 碼變、用 fresh 渲重生 `_freeze` 檔
- **缺 R 包**：Quarto .qmd 或用 renv 外包；先裝
- **Pandoc 不見**：確 `RSTUDIO_PANDOC` 設於 `.Renviron`
- **長渲時**：Fresh 渲費 5-7 分（14 頁含 R 執）；迭時用 cached 模
- **碼塊標**：諸 R 碼塊應有 `#| label:` 為潔渲

## 參

- `generate-puzzle` — 生文中所引拼出
- `run-puzzle-tests` — 確文中碼例正
- `create-quarto-report` — 通 Quarto 文建
