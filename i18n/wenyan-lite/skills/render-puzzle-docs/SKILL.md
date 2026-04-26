---
name: render-puzzle-docs
locale: wenyan-lite
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

# 渲染拼圖文件

渲染 jigsawR 之 Quarto 文件站。

## 適用時機

- 內容變更後建完整文件站
- 反覆編輯時渲染單一頁面
- 為發布或 PR 備文件
- 除 Quarto .qmd 文件之渲染錯誤

## 輸入

- **必要**：渲染模式（`fresh`、`cached` 或 `single`）
- **選擇性**：特定 .qmd 文件路徑（單頁模式）
- **選擇性**：是否於瀏覽器開啟結果

## 步驟

### 步驟一：擇渲染模式

| 模式 | 命令 | 時長 | 用時 |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | 內容已變、快取陳舊 |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | 小編輯、快取仍有效 |
| Single | 直接 quarto.exe | ~30s | 反覆於一頁 |

**預期：** 依當前情況擇模式：內容變或快取陳舊則 fresh，小編輯則 cached，反覆於一頁則 single。

**失敗時：** 若不確快取是否陳舊，預設 fresh 渲染。較久但保正確輸出。

### 步驟二：執行渲染

**Fresh 渲染**（清 `_freeze` 與 `_site`，重執所有 R 代碼）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Cached 渲染**（用既有 `_freeze` 文件）：

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**單頁**（直接渲染一 .qmd 文件）：

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**預期：** 渲染完成無誤。輸出於 `quarto/_site/`。

**失敗時：**
- 檢 .qmd 區塊中之 R 代碼錯誤（找 `#| label:` 標記）
- 驗 pandoc 透過 `RSTUDIO_PANDOC` 環境變數可達
- 試清快取：`rm -rf quarto/_freeze quarto/_site`
- 檢 .qmd 中所用之所有 R 套件已安裝

### 步驟三：驗輸出

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

確認站結構：
- `quarto/_site/index.html` 存在
- 導航連結正確解析
- 圖像與 SVG 文件正確渲染

**預期：** `index.html` 存在且非空。導航連結解析，圖像／SVG 於瀏覽器中正確渲染。

**失敗時：** 若 `index.html` 缺，渲染恐悄然失敗。以詳細輸出重跑並檢 `.qmd` 區塊中之 R 代碼錯誤。若僅部分頁缺，驗該 `.qmd` 文件已列於 `_quarto.yml` 中。

### 步驟四：預覽（選擇性）

於 Windows 瀏覽器開啟：

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**預期：** 文件站於 Windows 預設瀏覽器開啟以資視覺檢查。

**失敗時：** 若自 WSL 之 `cmd.exe /c start` 命令失敗，改試 `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"`。或於瀏覽器手動導至文件。

## 驗證

- [ ] `quarto/_site/index.html` 存在且非空
- [ ] 控制台輸出無渲染錯誤
- [ ] 所有 R 代碼區塊成功執行（檢錯訊）
- [ ] 頁間導航運作
- [ ] 所有 .qmd 文件之代碼區塊有 `#| label:` 以資潔淨輸出

## 常見陷阱

- **陳舊 freeze 快取**：R 代碼已變則用 fresh 渲染重建 `_freeze` 文件
- **缺 R 套件**：Quarto .qmd 文件恐用 renv 中無之套件；先裝之
- **找不到 pandoc**：確 `RSTUDIO_PANDOC` 已設於 `.Renviron`
- **渲染時長**：Fresh 渲染需 5-7 分鐘（14 頁含 R 執行）；反覆時用 cached 模式
- **代碼區塊標籤**：所有 R 代碼區塊應有 `#| label:` 以資潔淨渲染

## 相關技能

- `generate-puzzle` — 生文件中所引之拼圖輸出
- `run-puzzle-tests` — 確文件中之代碼例正確
- `create-quarto-report` — 通用 Quarto 文件建立
