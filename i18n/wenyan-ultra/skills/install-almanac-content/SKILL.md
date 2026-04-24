---
name: install-almanac-content
locale: wenyan-ultra
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

# 裝曆書內容

用 `agent-almanac` CLI 裝技能、代理、團於任何受支代理框。

## 用

- 立新項目需裝代理技能、代理、團
- 裝某域諸技能（如 `r-packages`、`devops`）
- 同針多框（Claude Code、Cursor、Copilot 等）
- 造或同 `agent-almanac.yml` 清單供可復設
- 察已裝內容之斷符或陳引

## 入

- **必**：所裝內容——一或多技能、代理、團 ID（如 `create-skill`、`r-developer`、`r-package-review`）
- **可**：`--domain <domain>`——裝域之諸技能，非單 ID
- **可**：`--framework <id>`——針特框（默：自動察諸）
- **可**：`--with-deps`——亦裝代理之技能與團之代理+技能
- **可**：`--dry-run`——預覽變而不寫磁
- **可**：`--global`——裝至全局而非項目
- **可**：`--force`——覆既有內容
- **可**：`--source <path>`——明 agent-almanac 根（默：自測）

## 行

### 一：察框

行框察以辨當目錄之代理具：

```bash
agent-almanac detect
```

掃工作目錄之配置檔與目錄（`.claude/`、`.cursor/`、`.github/copilot-instructions/`、`.agents/` 等）並報活框。

得：列一或多察框含其適配器態。無察→用通用適配器（`.agents/skills/`）回退。

敗：CLI 未找→確已裝且於 PATH。察返無而汝知有框→用 `--framework <id>` 顯定。行 `agent-almanac list --domains` 驗 CLI 可及倉。

### 二：搜內容

以關鍵字找技能、代理、團：

```bash
agent-almanac search <keyword>
```

依類瀏：

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

得：搜果或過濾列示符內容含 ID 與述。

敗：無果→試更泛鍵。驗曆書根可及：`agent-almanac list` 應示全技能數。不能找根→傳 `--source /path/to/agent-almanac`。

### 三：裝內容

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

CLI 由倉解內容，擇各察框之合適適配器，並寫檔於框特徑（如 Claude Code 之 `.claude/skills/`，Cursor 之 `.cursor/rules/`）。

得：輸確裝項數與目標框。已裝內容現於正框目錄。

敗：項未找→驗 ID 合倉中 `name` 欄（`skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`）。檔已存而裝略→用 `--force` 覆。

### 四：驗裝

察諸已裝內容之健：

```bash
agent-almanac audit
```

審特框或範：

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

察當前已裝：

```bash
agent-almanac list --installed
```

得：審報諸已裝項皆健無斷引。`--installed` 列示各項含型與框。

敗：審報斷項→以 `--force` 重裝。符斷→驗曆書源徑未移。行 `agent-almanac install <broken-id> --force` 修。

### 五：以清單管（可選）

供可復設，用聲明式 `agent-almanac.yml` 清單：

```bash
# Generate a starter manifest
agent-almanac init
```

於當目錄造 `agent-almanac.yml` 含察框與內容佔位列。編檔以聲所欲技能、代理、團：

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

再裝諸聲於清單者：

```bash
agent-almanac install
```

調已裝態合清單（裝缺、除多）：

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

得：無參行 `install` 讀清單並裝諸聲內容。行 `sync` 使裝態合清單，加缺項、除未聲者。

敗：`sync` 報「No agent-almanac.yml found」→先行 `agent-almanac init`。清單解為 0 項→查技能/代理/團 ID 精符倉條。`#` 開之注行被忽。

### 六：以營火管團（可選）

營火命令予以團為向之替 `install --team`：

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

營火態於 `.agent-almanac/state.json` 追（git 忽，於項目本地）。火有熱態：**burning**（7 日內用）、**embers**（30 日內）、**cold**（30+ 日）。行 `tend` 暖諸火並報其健。

共技於散時護——若他聚火需之，仍裝。共代理遊火間而非複。

諸營火命令支 `--quiet`（標報器輸出）與 `--json`（機可解）供腳本。

得：團聚而管以態追。`campfire --all` 示火態。`tend` 報健。

敗：營火態壞→刪 `.agent-almanac/state.json` 並重聚團。`gather` 敗→察團名合 `teams/_registry.yml` 之條目。

## 驗

- [ ] `agent-almanac detect` 示預期框
- [ ] `agent-almanac list --installed` 示諸意內容
- [ ] `agent-almanac audit` 報無斷項
- [ ] 已裝技能於目標框可解（如 Claude Code 之 `/skill-name` 作）
- [ ] 用清單則 `agent-almanac sync --dry-run` 報無變需

## 忌

- **忘代理團之 `--with-deps`**：無 `--with-deps` 裝代理僅裝定義而非引技能。代理在而不能行其技能序。代理與團恆用 `--with-deps`，除已別裝依
- **清單漂移**：手裝或除後，清單與實裝態分離。定期行 `agent-almanac sync`，或恆經清單裝以保齊
- **範混（項目 vs 全局）**：`--global` 裝至 `~/.claude/skills/`（或等），項目範至當目錄之 `.claude/skills/`。技能未找→察是否裝錯範
- **源徑陳**：agent-almanac 倉移或改名→清單與自動察之 `--source` 徑將斷。更 `agent-almanac.yml` 之 `source` 欄或重 `agent-almanac init`
- **框未察**：察器尋特定檔與目錄。新項或無此。顯用 `--framework <id>` 直至項目有預期構，或倚通用適配器
- **營火熱態混**：火於 30 日不用後冷。行 `agent-almanac tend` 重諸聚火之計。火顯「冷」——仍全裝；熱態映用之近性，非裝健

## 參

- `create-skill`
- `configure-mcp-server`
- `write-claude-md`
- `audit-discovery-symlinks`
- `design-cli-output`
