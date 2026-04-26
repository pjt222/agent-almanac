---
name: render-icon-pipeline
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Run the viz pipeline to render icons from existing glyphs. Entry point for the
  viz subproject covering palette generation, data building, manifest creation,
  and icon rendering for skills, agents, and teams. Always use build.sh as the
  pipeline entry point — never call Rscript directly.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# 渲染圖示管線

端對端跑 viz 管線，自既有字符渲染圖示。涵蓋調色板生成、資料建構、清單建立及為技能、代理人、團隊渲染圖示。

**標準入口點**：自項目根目錄之 `bash viz/build.sh [flags]`，或自 `viz/` 之 `bash build.sh [flags]`。此腳本處理平台偵測（WSL、Docker、原生）、R 二進位選擇與步驟次序。建構腳本永勿直接呼 `Rscript`——該路徑僅供 MCP 伺服器配置。

## 適用時機

- 建立或修改字符函數之後
- 將新技能、代理人或團隊加入登記簿之後
- 圖示需為新或更新之調色板重新渲染時
- 完整管線重建時（如基礎建置變更後）
- 首次設置 viz 環境時

## 輸入

- **選擇性**：實體類型——`skill`、`agent`、`team` 或 `all`（預設 `all`）
- **選擇性**：調色板——特定調色板名或 `all`（預設 `all`）
- **選擇性**：領域過濾——技能圖示之特定領域（如 `git`、`design`）
- **選擇性**：渲染模式——`full`、`incremental` 或 `dry-run`（預設 `incremental`）

## 步驟

### 步驟一：驗先決

確保環境已備渲染。

1. 確認 `viz/build.sh` 存在：
   ```bash
   ls -la viz/build.sh
   ```
2. 驗 Node.js 可用：
   ```bash
   node --version
   ```
3. 檢 `viz/config.yml` 存在（平台特定 R 路徑配置）：
   ```bash
   ls viz/config.yml
   ```

`build.sh` 自動處理 R 二進位解析——無須手動驗 R 路徑。WSL 用 `/usr/local/bin/Rscript`（WSL 原生 R），Docker 用容器內 R，原生 Linux／macOS 用 PATH 中之 `Rscript`。

**預期：** `build.sh`、Node.js 與 `config.yml` 皆存。

**失敗時：** 若 `config.yml` 缺，管線回退至系統預設。若 Node.js 缺，藉 nvm 安裝。

### 步驟二：跑管線

`build.sh` 按序執五步：
1. 生調色板顏色（R）→ `palette-colors.json` + `colors-generated.js`
2. 建資料（Node）→ `skills.json`
3. 建清單（Node）→ `icon-manifest.json`、`agent-icon-manifest.json`、`team-icon-manifest.json`
4. 渲染圖示（R）→ `icons/` 與 `icons-hd/` WebP 文件
5. 生終端字符（Node）→ `cli/lib/glyph-data.json`

**完整管線（所有類型、所有調色板、標準與 HD）：**
```bash
bash viz/build.sh
```

**增量（略過已存在之圖示）：**
```bash
bash viz/build.sh --skip-existing
```

**單一領域（僅技能）：**
```bash
bash viz/build.sh --only design
```

**單一實體類型：**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**乾跑（預覽不渲）：**
```bash
bash viz/build.sh --dry-run
```

**僅標準大小（略 HD）：**
```bash
bash viz/build.sh --no-hd
```

`build.sh` 之後所有旗標皆透傳至 `build-all-icons.R`。

**預期：** 圖示渲染至 `viz/public/icons/<palette>/` 與 `viz/public/icons-hd/<palette>/`。

**失敗時：**
- **NTFS 上 renv 卡住**：viz `.Rprofile` 繞過 `renv/activate.R` 並直接設 `.libPaths()`。確保自 `viz/` 跑（build.sh 透過 `cd "$(dirname "$0")"` 自動處理）
- **缺 R 套件**：自 `build.sh` 所選之 R 環境跑 `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"`
- **無字符映射**：實體需字符函數——渲染前用 `create-glyph` 技能

### 步驟三：驗輸出

確認渲染成功完成。

1. 檢查文件數合預期：
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 檢查文件大小合理（每圖示 2-80 KB）
3. 跑 `audit-icon-pipeline` 技能作完整檢

**預期：** 文件數合清單條目數。文件大小於預期範圍。

**失敗時：** 若數不符，部分字符渲染時恐錯。檢構建日誌之 `[ERROR]` 行。

## CLI 旗標參考

所有旗標皆透傳 `build.sh` 至 `build-all-icons.R`：

| 旗標 | 預設 | 描述 |
|------|---------|-------------|
| `--type <types>` | `all` | 逗號分隔：skill, agent, team |
| `--palette <name>` | `all` | 單一調色板或 `all`（9 調色板） |
| `--only <filter>` | 無 | 領域（技能）或實體 ID（代理／團隊） |
| `--skip-existing` | 關 | 略過已有 WebP 之圖示 |
| `--dry-run` | 關 | 列將生之物 |
| `--size <n>` | `512` | 像素之輸出尺寸 |
| `--glow-sigma <n>` | `4` | 光暈模糊半徑 |
| `--workers <n>` | 自動 | 平行工作者（detectCores()-1） |
| `--no-cache` | 關 | 忽略內容雜湊快取 |
| `--hd` | 開 | 啟用 HD 變體（1024px） |
| `--no-hd` | 關 | 略 HD 變體 |
| `--strict` | 關 | 子腳本首敗即退 |

## build.sh 內部所為

僅供參考——切勿手動跑此等步驟：

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Docker 替代方案

管線亦可於 Docker 中跑：

```bash
cd viz
docker compose up --build
```

此於孤立 Linux 環境跑完整管線並於 8080 埠提供結果。

## 驗證

- [ ] 已跑 `bash viz/build.sh`（非裸 `Rscript`）
- [ ] 調色板顏色已生（JSON + JS）
- [ ] 資料文件已自登記簿建
- [ ] 清單已自資料生
- [ ] 圖示已為目標類型與調色板渲染
- [ ] 文件數合預期
- [ ] 文件大小於預期範圍（2-80 KB）

## 常見陷阱

- **直接呼 Rscript**：永勿手動跑 `Rscript build-icons.R` 或 `Rscript generate-palette-colors.R`。務必用 `bash build.sh [flags]`。直接 Rscript 呼叫繞過平台偵測，可能用錯之 R 二進位（透過 `~/bin/Rscript` 包裝之 Windows R 而非 `/usr/local/bin/Rscript` 之 WSL 原生 R）。注意：CLAUDE.md 與指南中之 Windows R 路徑**僅為 MCP 伺服器配置**，非建構腳本所用
- **錯之工作目錄**：`build.sh` 自動 cd 至自身目錄（`cd "$(dirname "$0")"`），故可自任處呼叫：自項目根之 `bash viz/build.sh` 正常運作
- **陳舊清單**：`build.sh` 按序跑步驟一至五，故清單於渲染前必重建。若僅需清單不渲，用 `node viz/build-data.js && node viz/build-icon-manifest.js`（Node 步不需 R）
- **renv 未啟用**：`.Rprofile` 之變通需自 `viz/` 跑——`build.sh` 處理之。用 `--vanilla` 旗標或自他目錄跑 R 將略之
- **Windows 平行**：Windows 不支援 fork 式平行——管線藉 `config.yml` 自選 `multisession`

## 相關技能

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 渲染前察缺字符與圖示
- [create-glyph](../create-glyph/SKILL.md) — 為缺圖示之實體建新字符函數
- [enhance-glyph](../enhance-glyph/SKILL.md) — 重渲前改善既有字符
