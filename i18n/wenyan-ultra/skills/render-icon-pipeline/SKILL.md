---
name: render-icon-pipeline
locale: wenyan-ultra
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

# 渲圖管

行 viz 管至端、自存符渲圖。覆色板生、數建、清生、技/代/隊圖渲。

**標入點**：自項根 `bash viz/build.sh [flags]`、或自 `viz/` `bash build.sh [flags]`。此本處平台察（WSL、Docker、原生）、R 二進擇、步序。**永勿直呼 `Rscript`** 為建本——彼路唯 MCP 器設用。

## 用

- 建或改符函後
- 入新技、代、隊於登錄後
- 圖需重渲為新或更色板
- 全管重建（如基設變後）
- 首設 viz 環境

## 入

- **可**：實型——`skill`、`agent`、`team`、或 `all`（默 `all`）
- **可**：色板——特名或 `all`（默 `all`）
- **可**：域濾——技圖特域（如 `git`、`design`）
- **可**：渲模——`full`、`incremental`、`dry-run`（默 `incremental`）

## 行

### 一：驗先決

確環備渲。

1. 確 `viz/build.sh` 存：
   ```bash
   ls -la viz/build.sh
   ```
2. 驗 Node.js 可用：
   ```bash
   node --version
   ```
3. 察 `viz/config.yml` 存（平台 R 路檔）：
   ```bash
   ls viz/config.yml
   ```

`build.sh` 自動處 R 二進解——汝無需手驗 R 路。WSL 用 `/usr/local/bin/Rscript`（WSL 原 R）、Docker 用容 R、原生 Linux/macOS 用 PATH 之 `Rscript`。

得：`build.sh`、Node.js、`config.yml` 皆存。

敗：`config.yml` 缺→管退用系默。Node.js 缺→經 nvm 裝。

### 二：行管

`build.sh` 序行 5 步：
1. 生色板色（R）→ `palette-colors.json` + `colors-generated.js`
2. 建數（Node）→ `skills.json`
3. 建清（Node）→ `icon-manifest.json`、`agent-icon-manifest.json`、`team-icon-manifest.json`
4. 渲圖（R）→ `icons/` 與 `icons-hd/` WebP 檔
5. 生終端符（Node）→ `cli/lib/glyph-data.json`

**全管（諸型、諸色板、標+HD）：**
```bash
bash viz/build.sh
```

**漸（已存碟之圖略）：**
```bash
bash viz/build.sh --skip-existing
```

**單域（唯技）：**
```bash
bash viz/build.sh --only design
```

**單實型：**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**乾行（預示無渲）：**
```bash
bash viz/build.sh --dry-run
```

**唯標大（略 HD）：**
```bash
bash viz/build.sh --no-hd
```

`build.sh` 後諸旗皆傳至 `build-all-icons.R`。

得：圖渲於 `viz/public/icons/<palette>/` 與 `viz/public/icons-hd/<palette>/`。

敗：
- **renv 卡於 NTFS**：viz `.Rprofile` 繞 `renv/activate.R` 直設 `.libPaths()`。確自 `viz/` 行（build.sh 自動經 `cd "$(dirname "$0")"`）
- **R 包缺**：自 `build.sh` 所擇 R 環境行 `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"`
- **無符映**：實需符函——渲前用 `create-glyph` 技

### 三：驗出

確渲成。

1. 察檔數合期：
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 察檔大合理（每圖 2-80 KB）
3. 行 `audit-icon-pipeline` 技為全察

得：檔數合清條數。檔大於期範。

敗：數不合→某符渲時錯。察建誌 `[ERROR]` 行。

## CLI 旗參

諸旗經 `build.sh` 傳至 `build-all-icons.R`：

| Flag | Default | Description |
|------|---------|-------------|
| `--type <types>` | `all` | Comma-separated: skill, agent, team |
| `--palette <name>` | `all` | Single palette or `all` (9 palettes) |
| `--only <filter>` | none | Domain (skills) or entity ID (agents/teams) |
| `--skip-existing` | off | Skip icons with existing WebP files |
| `--dry-run` | off | List what would be generated |
| `--size <n>` | `512` | Output dimension in pixels |
| `--glow-sigma <n>` | `4` | Glow blur radius |
| `--workers <n>` | auto | Parallel workers (detectCores()-1) |
| `--no-cache` | off | Ignore content-hash cache |
| `--hd` | on | Enable HD variants (1024px) |
| `--no-hd` | off | Skip HD variants |
| `--strict` | off | Exit on first sub-script failure |

## build.sh 內所行

唯參——勿手行此諸步：

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

## Docker 替

管亦可於 Docker 行：

```bash
cd viz
docker compose up --build
```

此於隔 Linux 環境行全管、果服於埠 8080。

## 驗

- [ ] 行 `bash viz/build.sh`（非裸 `Rscript`）
- [ ] 色板色已生（JSON + JS）
- [ ] 數檔自登錄建
- [ ] 清自數生
- [ ] 圖為標型與色板渲
- [ ] 檔數合期
- [ ] 檔大於期範（2-80 KB）

## 忌

- **直呼 Rscript**：永勿手行 `Rscript build-icons.R` 或 `Rscript generate-palette-colors.R`。常用 `bash build.sh [flags]`。直 Rscript 呼繞平台察、可用誤 R 二進（Windows R 經 `~/bin/Rscript` 包代 WSL 原 R 於 `/usr/local/bin/Rscript`）。注：CLAUDE.md 與導中 Windows R 路**唯 MCP 器設用**、非建本
- **誤工作錄**：`build.sh` 自動 CD 至己錄（`cd "$(dirname "$0")"`）、故任處可呼：自項根 `bash viz/build.sh` 正
- **舊清**：`build.sh` 序行 1-5 步、故清渲前常重生。唯需清無渲→用 `node viz/build-data.js && node viz/build-icon-manifest.js`（Node 步無需 R）
- **renv 未啟**：`.Rprofile` 變通需自 `viz/` 行——`build.sh` 處之。用 `--vanilla` 旗或自他錄行 R 將略
- **Windows 並**：Windows 不支叉並——管自選 `multisession` 經 `config.yml`

## 參

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 渲前察缺符與圖
- [create-glyph](../create-glyph/SKILL.md) — 為缺圖實建新符函
- [enhance-glyph](../enhance-glyph/SKILL.md) — 重渲前改現符
