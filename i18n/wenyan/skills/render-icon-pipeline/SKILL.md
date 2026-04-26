---
name: render-icon-pipeline
locale: wenyan
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

# 渲圖標之線

行 viz 之全線以自現符渲圖標。涵色板生、數建、清單立、技/代/團之圖標渲。

**正入點**：自項目根 `bash viz/build.sh [flags]`，或自 `viz/` `bash build.sh [flags]`。此文司平台察（WSL、Docker、原）、R 二進制之擇、步序。永勿於建文直呼 `Rscript`——其路獨為 MCP 服之設。

## 用時

- 立或改符函後乃用
- 增新技、代、團於庫後乃用
- 圖標需為新或更色板再渲乃用
- 行全線之重建（如基設變後）乃用
- 初設 viz 之境乃用

## 入

- **可選**：實類——`skill`、`agent`、`team`、或 `all`（默：`all`）
- **可選**：色板——具體色板名或 `all`（默：`all`）
- **可選**：域濾——技圖標之具體域（如 `git`、`design`）
- **可選**：渲模——`full`、`incremental`、或 `dry-run`（默：`incremental`）

## 法

### 第一步：驗先決

確境備為渲。

1. 確 `viz/build.sh` 存：
   ```bash
   ls -la viz/build.sh
   ```
2. 驗 Node.js 可得：
   ```bash
   node --version
   ```
3. 察 `viz/config.yml` 存（平台特之 R 路圖）：
   ```bash
   ls viz/config.yml
   ```

`build.sh` 自動司 R 二進制之解——無需手驗 R 路。於 WSL 用 `/usr/local/bin/Rscript`（WSL 原 R），於 Docker 用容器之 R，於原 Linux/macOS 用 PATH 中之 `Rscript`。

得：`build.sh`、Node.js、`config.yml` 皆存。

敗則：若 `config.yml` 缺，線退用系默。若 Node.js 缺，由 nvm 裝之。

### 第二步：行其線

`build.sh` 依序行五步：

1. 生色板色（R）→ `palette-colors.json` + `colors-generated.js`
2. 建數（Node）→ `skills.json`
3. 建清單（Node）→ `icon-manifest.json`、`agent-icon-manifest.json`、`team-icon-manifest.json`
4. 渲圖標（R）→ `icons/` 與 `icons-hd/` 之 WebP 文
5. 生終端符（Node）→ `cli/lib/glyph-data.json`

**全線（諸類、諸色板、標 + HD）：**

```bash
bash viz/build.sh
```

**增量（略已存於盤之圖標）：**

```bash
bash viz/build.sh --skip-existing
```

**單域（獨技）：**

```bash
bash viz/build.sh --only design
```

**單實類：**

```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**乾運（預覽而不渲）：**

```bash
bash viz/build.sh --dry-run
```

**獨標尺（略 HD）：**

```bash
bash viz/build.sh --no-hd
```

`build.sh` 後諸旗皆過至 `build-all-icons.R`。

得：圖標渲至 `viz/public/icons/<palette>/` 與 `viz/public/icons-hd/<palette>/`。

敗則：

- **NTFS 上 renv 掛起**：viz `.Rprofile` 繞 `renv/activate.R` 而直設 `.libPaths()`。確自 `viz/` 行（build.sh 由 `cd "$(dirname "$0")"` 自動之）
- **缺 R 包**：自 `build.sh` 所選 R 境行 `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"`
- **無符繫**：實需符函——渲前用 `create-glyph` 技

### 第三步：驗其出

確渲順畢。

1. 察文數合期：
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 察文大宜（每圖 2-80 KB）
3. 行 `audit-icon-pipeline` 技以行詳察

得：文數合清單入數。文大於宜範。

敗則：若數不合，某符渲時或誤。察建日誌之 `[ERROR]` 行。

## CLI 旗參

諸旗皆由 `build.sh` 過至 `build-all-icons.R`：

| 旗 | 默 | 述 |
|------|---------|-------------|
| `--type <types>` | `all` | 逗分：skill、agent、team |
| `--palette <name>` | `all` | 單色板或 `all`（9 色板） |
| `--only <filter>` | 無 | 域（技）或實 ID（代/團） |
| `--skip-existing` | 關 | 略已存 WebP 之圖標 |
| `--dry-run` | 關 | 列將生者 |
| `--size <n>` | `512` | 出維（像素） |
| `--glow-sigma <n>` | `4` | 光糊半徑 |
| `--workers <n>` | 自 | 並工（detectCores()-1） |
| `--no-cache` | 關 | 忽內雜緩 |
| `--hd` | 開 | 啟 HD 變（1024px） |
| `--no-hd` | 關 | 略 HD 變 |
| `--strict` | 關 | 首子文敗時退 |

## build.sh 內所行

獨為參——勿手行此諸步：

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

## Docker 之替

線亦可於 Docker 行：

```bash
cd viz
docker compose up --build
```

此於隔之 Linux 境行全線並於 8080 口供其果。

## 驗

- [ ] 行 `bash viz/build.sh`（非裸 `Rscript`）
- [ ] 色板色已生（JSON + JS）
- [ ] 數文自庫建
- [ ] 清單自數生
- [ ] 圖標已為目類與色板渲
- [ ] 文數合期
- [ ] 文大於宜範（2-80 KB）

## 陷

- **直呼 Rscript**：永勿手行 `Rscript build-icons.R` 或 `Rscript generate-palette-colors.R`。必用 `bash build.sh [flags]`。直 Rscript 呼繞平台察可用誤之 R 二進制（用 `~/bin/Rscript` 之 Windows R 而非 `/usr/local/bin/Rscript` 之 WSL 原 R）。注：CLAUDE.md 與諸指南中 Windows R 之路**獨為 MCP 服之設**，非為建文
- **誤工作所**：`build.sh` 自動 CD 至己所（`cd "$(dirname "$0")"`），故可自任處呼之：自項目根 `bash viz/build.sh` 行正
- **陳清單**：`build.sh` 依序行 1-5 步，故清單渲前必再生。若獨需清單而不渲，用 `node viz/build-data.js && node viz/build-icon-manifest.js`（Node 步無需 R）
- **renv 未啟**：`.Rprofile` 之變通需自 `viz/` 行——`build.sh` 司之。用 `--vanilla` 旗或自他所行 R 必略之
- **Windows 之並**：Windows 不持基於 fork 之並——線經 `config.yml` 自選 `multisession`

## 參

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 渲前察缺符與圖標
- [create-glyph](../create-glyph/SKILL.md) — 為缺圖標之實立新符函
- [enhance-glyph](../enhance-glyph/SKILL.md) — 再渲前改現符
