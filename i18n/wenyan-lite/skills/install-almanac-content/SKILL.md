---
name: install-almanac-content
locale: wenyan-lite
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

用 `agent-almanac` CLI 將技能、代理與團隊裝入任何支持之代理框架。

## 適用時機

- 設新專案需裝代理技能、代理或團隊
- 裝某領域之所有技能（如 `r-packages`、`devops`）
- 同時針對多框架（Claude Code、Cursor、Copilot 等）
- 為可重現之設置建或同步聲明式 `agent-almanac.yml` 清單
- 稽核已裝內容之壞連結或陳舊參考

## 輸入

- **必要**：欲裝之內容——一或多技能、代理或團隊 ID（如 `create-skill`、`r-developer`、`r-package-review`）
- **選擇性**：`--domain <domain>` —— 裝領域之所有技能而非命名個別 ID
- **選擇性**：`--framework <id>` —— 針對特定框架（預設：自動偵所有）
- **選擇性**：`--with-deps` —— 亦裝代理技能與團隊之代理+技能
- **選擇性**：`--dry-run` —— 預覽變更而不寫磁碟
- **選擇性**：`--global` —— 裝至全域範疇而非專案範疇
- **選擇性**：`--force` —— 覆蓋現有內容
- **選擇性**：`--source <path>` —— agent-almanac 根之明確路徑（預設：自動偵）

## 步驟

### 步驟一：偵框架

執框架偵測以見當前專案中有哪些代理工具：

```bash
agent-almanac detect
```

此掃工作目錄以覓配置檔與目錄（`.claude/`、`.cursor/`、`.github/copilot-instructions/`、`.agents/` 等）並報哪些框架活動。

**預期：** 輸出列一或多偵得框架附其適配器狀態。若無框架偵得，用通用適配器（`.agents/skills/`）為退路。

**失敗時：** 若 CLI 未覓，確其已裝且於 PATH。若偵測返空而知框架存，以 `--framework <id>` 明指之。執 `agent-almanac list --domains` 以驗 CLI 可達註冊表。

### 步驟二：搜內容

以關鍵字覓技能、代理或團隊：

```bash
agent-almanac search <keyword>
```

依類別瀏覽：

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**預期：** 搜尋結果或過濾清單顯配內容附 ID 與描述。

**失敗時：** 若無結果現，試更廣關鍵字。驗 almanac 根可達：`agent-almanac list` 應顯完整技能計數。若不能覓根，傳 `--source /path/to/agent-almanac`。

### 步驟三：裝內容

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

CLI 自註冊表解析內容、為每偵得框架擇合宜適配器、寫檔至框架特定路徑（如 Claude Code 之 `.claude/skills/`、Cursor 之 `.cursor/rules/`）。

**預期：** 輸出確認所裝項數與目標框架。已裝內容現於正確框架目錄。

**失敗時：** 若項目未覓，驗 ID 配於註冊表之 `name` 欄（`skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`）。若檔已存而裝略之，用 `--force` 以覆蓋。

### 步驟四：驗裝

於所有已裝內容執健康檢：

```bash
agent-almanac audit
```

稽核特定框架或範疇：

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

見當前已裝者：

```bash
agent-almanac list --installed
```

**預期：** 稽核報所有已裝項為健康無壞參考。`--installed` 清單顯每項附其類型與框架。

**失敗時：** 若稽核報壞項，以 `--force` 重裝之。若符號連結壞，驗 almanac 源路徑未移。執 `agent-almanac install <broken-id> --force` 以修之。

### 步驟五：以清單管理（選擇性）

為可重現之設置，用聲明式 `agent-almanac.yml` 清單：

```bash
# Generate a starter manifest
agent-almanac init
```

此於當前目錄建 `agent-almanac.yml` 附偵得框架與佔位內容列表。編檔以宣所欲技能、代理與團隊：

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

然後裝清單所宣之一切：

```bash
agent-almanac install
```

以清單對帳已裝狀態（裝缺者、移額外者）：

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**預期：** 執無參數之 `install` 讀清單並裝所宣之所有內容。執 `sync` 將已裝狀態與清單對齊，加缺項並移未宣者。

**失敗時：** 若 `sync` 報「未覓 agent-almanac.yml」，先執 `agent-almanac init`。若清單解析為零項，核技能/代理/團隊 ID 確配註冊表條目。以 `#` 始之註解行被忽略。

### 步驟六：以 campfire 管團隊（選擇性）

Campfire 指令供一溫暖、團隊導向之 `install --team` 替代：

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

Campfire 狀態追於 `.agent-almanac/state.json`（git 忽略、專案本地）。火有熱狀態：**burning**（七日內用）、**embers**（三十日內）、**cold**（三十日以上）。執 `tend` 暖所有火並報其健康。

共享技能於散去時受護——若技能為他已聚火所需，則留裝。共享代理於火間行而非複之。

所有 campfire 指令支 `--quiet`（標準報告器輸出）與 `--json`（可機解析）以利腳本化。

**預期：** 團隊以狀態追蹤聚與管。`campfire --all` 顯火狀態。`tend` 報健康。

**失敗時：** 若 campfire 狀態敗，刪 `.agent-almanac/state.json` 並重聚團隊。若 `gather` 失敗，核團隊名配 `teams/_registry.yml` 之條目。

## 驗證

- [ ] `agent-almanac detect` 顯預期框架
- [ ] `agent-almanac list --installed` 顯所有意內容
- [ ] `agent-almanac audit` 報無壞項
- [ ] 已裝技能於目標框架中解析（如 Claude Code 中 `/skill-name` 可用）
- [ ] 若用清單，`agent-almanac sync --dry-run` 報無變更所需

## 常見陷阱

- **代理與團隊忘 `--with-deps`**：裝代理而無 `--with-deps` 僅裝代理定義，非其參考之技能。代理將存但不能循其技能程序。代理與團隊永用 `--with-deps`，除已另裝依賴。
- **清單漂移**：手動裝或移內容後，清單與實際已裝狀態失同步。定期執 `agent-almanac sync`，或永經清單裝以保對齊。
- **範疇混淆（專案 vs 全域）**：以 `--global` 裝之內容至 `~/.claude/skills/`（或等效），而專案範疇至當前目錄之 `.claude/skills/`。若技能不覓，核是否裝於錯範疇。
- **陳舊源路徑**：若 agent-almanac 倉移或改名，清單中 `--source` 路徑與自動偵將壞。更新 `agent-almanac.yml` 之 `source` 欄或重執 `agent-almanac init`。
- **框架未偵**：偵測器覓特定檔與目錄。剛初始化專案或無此等。以 `--framework <id>` 明示至專案有預期結構，或賴通用適配器。
- **Campfire 熱狀態混淆**：火三十日不用後變冷。執 `agent-almanac tend` 重設所有已聚火之計時器。若火顯「cold」，仍完整裝——熱狀態反映近期用，非裝健康。

## 相關技能

- `create-skill` — 建新技能以加入 almanac 再裝之
- `configure-mcp-server` — 設裝後代理或需之 MCP 伺服器
- `write-claude-md` — 配 CLAUDE.md 以參考已裝技能
- `audit-discovery-symlinks` — 診 Claude Code 技能發現之符號連結問題
- `design-cli-output` — CLI 之報告器與 campfire 儀式用之終端輸出模式
