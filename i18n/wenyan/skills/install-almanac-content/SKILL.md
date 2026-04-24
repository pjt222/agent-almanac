---
name: install-almanac-content
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Install skills, agents, and teams from agent-almanac into any supported
  agentic framework using the CLI. Covers framework detection, content
  search, installation with dependency resolution, health auditing, and
  manifest-based syncing. Use when setting up a new project with agentic
  capabilities, installing specific skills or entire domains, targeting
  multiple frameworks simultaneously, or maintaining a declarative
  manifest of installed content.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
---

# 裝 Almanac 內容

用 `agent-almanac` CLI 將技能、代理、團隊裝入任何支之代理框架。

## 用時

- 設新項目需裝代理技能、代理、團隊
- 裝特定域之所有技能（如 `r-packages`、`devops`）
- 同時目標多框架（Claude Code、Cursor、Copilot 等）
- 為可重現之設創或同步聲明式 `agent-almanac.yml` manifest
- 察已裝內容之斷鏈或陳舊引

## 入

- **必要**：所裝內容——一或多技能、代理、團隊 ID（如 `create-skill`、`r-developer`、`r-package-review`）
- **可選**：`--domain <domain>`——裝域之所有技能代點 ID
- **可選**：`--framework <id>`——目標特定框架（默：自動偵所有）
- **可選**：`--with-deps`——亦裝代理技能與團隊代理與技能
- **可選**：`--dry-run`——預覽變勿寫盤
- **可選**：`--global`——裝於全域代項目域
- **可選**：`--force`——覆寫現內容
- **可選**：`--source <path>`——agent-almanac 根之顯路徑（默：自偵）

## 法

### 第一步：偵框架

行框架偵以見當前項目中之代理工具：

```bash
agent-almanac detect
```

此掃工作目錄察配置檔與目錄（`.claude/`、`.cursor/`、`.github/copilot-instructions/`、`.agents/` 等）並報何框架活。

**得：** 輸出列一或多偵得之框架與適配器狀態。若無框架偵，備援用通用適配器（`.agents/skills/`）。

**敗則：** 若 CLI 未見，確已裝於 PATH。若偵無果且知框架在，以 `--framework <id>` 顯指。行 `agent-almanac list --domains` 驗 CLI 可達 registries。

### 第二步：搜內容

以關鍵字尋技能、代理、團隊：

```bash
agent-almanac search <keyword>
```

按類瀏：

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**得：** 搜結果或過濾列表顯符之內容附 ID 與述。

**敗則：** 若無結果，試更廣關鍵字。驗 almanac 根可達：`agent-almanac list` 應顯全技能數。若不能找根，傳 `--source /path/to/agent-almanac`。

### 第三步：裝內容

以名裝一或多項：

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

CLI 自 registries 解析內容，為每偵框架擇合適配器，並將檔寫於框架特定路徑（如 `.claude/skills/` 為 Claude Code、`.cursor/rules/` 為 Cursor）。

**得：** 輸出確已裝項數與目標框架。已裝內容現於正框架目錄。

**敗則：** 若未找項，驗 ID 合 registry 之 `name` 欄（`skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`）。若檔已存而裝略，用 `--force` 覆寫。

### 第四步：驗裝

於所有已裝內容行健康察：

```bash
agent-almanac audit
```

察特定框架或域：

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

察當前已裝：

```bash
agent-almanac list --installed
```

**得：** 察報所有已裝項健康無斷引。`--installed` 列顯每項附類與框架。

**敗則：** 若察報斷項，以 `--force` 重裝之。若符號鏈斷，驗 almanac 源路未移。行 `agent-almanac install <broken-id> --force` 修。

### 第五步：以 manifest 管（可選）

為可重現之設，用聲明式 `agent-almanac.yml` manifest：

```bash
# Generate a starter manifest
agent-almanac init
```

此於當前目錄創 `agent-almanac.yml` 附偵框架與占位內容列。改檔以聲明所欲技能、代理、團隊：

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

後裝 manifest 所聲明之一切：

```bash
agent-almanac install
```

將已裝狀態與 manifest 對齊（裝缺、除多）：

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**得：** 無參之 `install` 讀 manifest 並裝所有聲明內容。`sync` 將已裝狀態與 manifest 對齊，加缺項除未聲明者。

**敗則：** 若 `sync` 報「無 agent-almanac.yml」，先行 `agent-almanac init`。若 manifest 解得 0 項，察技能/代理/團隊 ID 合 registry 項。`#` 始之注行被忽。

### 第六步：以篝火管團隊（可選）

篝火命令供 `install --team` 之溫、團隊取向之替：

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

篝火態跟於 `.agent-almanac/state.json`（git 忽，項目本地）。火有熱態：**burning**（七日內用）、**embers**（三十日內）、**cold**（三十日以上）。行 `tend` 溫所有火並報其健康。

共享技能於 scatter 時受護——若他聚火仍需一技能，其仍裝。共享代理於火間行而非複。

所有篝火命令支 `--quiet`（標報輸出）與 `--json`（機可析）為腳本用。

**得：** 團隊以態跟聚管。`campfire --all` 顯火態。`tend` 報健康。

**敗則：** 若篝火態毀，刪 `.agent-almanac/state.json` 並重聚團隊。若 `gather` 敗，察團隊名合 `teams/_registry.yml` 之項。

## 驗

- [ ] `agent-almanac detect` 顯預期框架
- [ ] `agent-almanac list --installed` 顯所有意內容
- [ ] `agent-almanac audit` 報無斷項
- [ ] 已裝技能解於目標框架（如 `/skill-name` 於 Claude Code 作）
- [ ] 若用 manifest，`agent-almanac sync --dry-run` 報無需變

## 陷

- **代理團隊忘 `--with-deps`**：無 `--with-deps` 裝代理只裝代理定義，非其引技能。代理將在然不能循其技能程。代理團隊始終用 `--with-deps` 除非已獨立裝依
- **Manifest 漂移**：手動裝除內容後，manifest 與實裝態失同步。週期行 `agent-almanac sync`，或始終經 manifest 裝以對齊
- **域混（項目對全域）**：`--global` 所裝內容至 `~/.claude/skills/`（或等），項目域至當前目錄之 `.claude/skills/`。若技能未找，察是否裝於錯域
- **陳舊源路**：若 agent-almanac 庫移或改名，manifest 與自偵之 `--source` 路將斷。更 `agent-almanac.yml` 之 `source` 欄或重行 `agent-almanac init`
- **框架未偵**：偵器尋特定檔與目錄。新初化項目或尚無此。顯用 `--framework <id>` 直至項目有預期結構，或賴通用適配器
- **篝火熱態混**：火於三十日未用後冷。行 `agent-almanac tend` 為所有聚火重定時。若火顯為「冷」，其仍全裝——熱態反用之近，非裝健康

## 參

- `create-skill` — 作新技能加 almanac 後裝之
- `configure-mcp-server` — 設代理裝後或需之 MCP 伺服器
- `write-claude-md` — 配 CLAUDE.md 引已裝技能
- `audit-discovery-symlinks` — 診 Claude Code 技能偵之符號鏈問
- `design-cli-output` — CLI 報與篝火儀之終端輸出模
