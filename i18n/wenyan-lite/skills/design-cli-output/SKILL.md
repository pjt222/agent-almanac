---
name: design-cli-output
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design terminal output for a CLI tool with chalk colors, Unicode glyphs,
  multiple verbosity levels (human, verbose, quiet, JSON), and consistent
  voice rules. Covers color palette selection, status indicator design,
  reporter function architecture, ceremony/narrative output variants, and
  cross-terminal compatibility. Use when building a new CLI reporter module,
  adding warm narrative output to an existing tool, standardizing output
  across multiple commands, or designing machine-readable JSON alongside
  human-readable text.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: basic
  language: TypeScript
  tags:
    - cli
    - terminal
    - ux
    - chalk
    - unicode
---

# Design CLI Output

為命令列工具設計一致之多層終端輸出。

## 適用時機

- 為 CLI 工具建新 reporter 模組
- 於標準事務性輸出之外加暖或敘事輸出
- 於多指令間統一輸出格式
- 設計與人類可讀輸出並行之 JSON 機器輸出
- 為新終端工具擇色、圖符與冗長度

## 輸入

- **必需**：CLI 工具名與主要受眾（開發者、運維、終端用戶）
- **必需**：需輸出格式化之指令
- **可選**：是否需「儀式」或敘事輸出變體
- **可選**：品牌約束（色盤、語氣）

## 步驟

### 步驟一：定色盤

用 chalk 建命名色盤物件：

**標準色盤**（事務性輸出）：

```javascript
let chalk;
try { chalk = (await import('chalk')).default; }
catch { chalk = new Proxy({}, { get: () => (s) => s }); }

// Status colors
const ok = chalk.green;       // success
const fail = chalk.red;       // errors
const warn = chalk.yellow;    // warnings
const info = chalk.cyan;      // identifiers, names
const dim = chalk.dim;        // secondary info, paths
const bold = chalk.bold;      // headers
```

**暖色盤**（儀式/敘事輸出）：

```javascript
const C = {
  flame: chalk.hex('#FF6B35'),   // active elements, fire
  amber: chalk.hex('#FFB347'),   // arriving items, warm highlights
  spark: chalk.hex('#FFF4E0'),   // individual items (sparks/skills)
  ember: chalk.hex('#8B4513'),   // cold/dormant states
  warm:  chalk.hex('#D4A574'),   // neutral warm text
  dim:   chalk.dim,              // background, secondary
  fail:  chalk.red,              // errors stay red (honest)
};
```

色盤設計規則：
- 恆提供無色回退（如上之 Proxy 模式）
- 自定色盤用 hex 色（`chalk.hex('#FF6B35')`）
- 失敗/錯誤色保持紅色，不論色盤主題
- 以語義角色命色盤項，非視覺外觀

**預期：** 具命名項與無色回退之色盤物件。

**失敗時：** 若 chalk 不可用（piped 輸出、CI），Proxy 回退返字串不變。以 `NO_COLOR=1` 環境變數測之。

### 步驟二：擇狀態指示符

為狀態溝通擇 Unicode 圖符或 ASCII 字元：

**ASCII（最大相容性）：**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode（更豐富，需 UTF-8 終端）：**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

擇選準則：
- 於 CI 或 piped 情境中運行之工具用 ASCII
- 具互動終端用戶之工具用 Unicode
- 透過 `--ascii` 旗標或 `NO_COLOR` 偵測兩者兼供
- 於 macOS Terminal、Windows Terminal、VS Code terminal、SSH 會話中測圖符

**預期：** 一瞥即可溝通狀態而不恃色之圖符集。

**失敗時：** 若圖符於測試中渲染為 `?` 或方框，以 ASCII 等效替之。`+/-/=/!` 集處處可用。

### 步驟三：設計冗長度層級

每指令應支援四輸出層級：

| 層級 | 旗標 | 受眾 | 內容 |
|-------|------|----------|---------|
| **預設** | （無） | 終端前之人 | 格式化、著色、有料 |
| **Verbose** | `--verbose` 或 `--ceremonial` | 欲詳情之人 | 逐項明細，到達序列 |
| **Quiet** | `--quiet` | 腳本、CI | 極簡之行，狀態圖符，無裝飾 |
| **JSON** | `--json` | 機器消費者 | 結構化、可解析、完整 |

實作模式：

```javascript
function output(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (options.quiet) {
    for (const item of data.items) {
      const icon = item.ok ? '+' : '!';
      console.log(`${icon} ${item.id}`);
    }
    return;
  }
  // Default (or verbose) human output
  printFormatted(data, { verbose: options.verbose });
}
```

JSON 輸出規則：
- 恆為有效 JSON（不混人類文字）
- 含人類輸出所示之所有資料，加機器有用之欄位
- 於指令間用一致之鍵命名
- 成功出口碼 0，錯誤出口碼 1（不論輸出模式）

**預期：** 四明層級，於指令間行為一致。

**失敗時：** 若 verbose 模式過噪，設其為自選（`--ceremonial`）而非漸進冗長度層級。

### 步驟四：立聲音規則

定所有輸出函數遵循之語氣與風格。此防指令間不一致。

聲音規則例（自 campfire reporter）：

1. **現在時、主動語態**：「mystic arrives」非「mystic has been installed」
2. **無驚嘆號**：靜之自信。工具不喊。
3. **以隱喻替術語**：「practices」非「dependencies」（僅於儀式模式）
4. **失敗誠實，非災難性**：「A spark was lost」非「ERROR: installation failed with exit code 1」
5. **結語反映狀態**：每操作以狀態摘要結
6. **無 emoji**：Unicode 圖符攜視覺重而不為裝飾
7. **每字攜資訊**：若字不增理解，去之

標準（非儀式）輸出之聲音規則：
- 簡潔、事實之行
- 狀態圖符 + 項 ID + 情境
- 具計數之摘要行
- 錯誤訊息示補救行動

**預期：** 輸出函數須遵之 3-7 聲音規則之書面集。

**失敗時：** 若規則感覺武斷，測之：以有無每規則書同一輸出。若去規則不改輸出品質，該規則不需。

### 步驟五：實作 reporter 函數

以聚焦之函數組輸出為 reporter 模組：

```javascript
// reporter.js — standard output
export function printResults(results) { ... }
export function printItemTable(items) { ... }
export function printDetections(detections) { ... }
export function printAudit(auditResults) { ... }
export function printDryRun() { ... }
export function warn(msg) { ... }
export function error(msg) { ... }
export { chalk };
```

每函數遵同結構：
1. 優雅處理空/null 輸入
2. 算佈局（欄寬、填充）
3. 以色盤色輸出
4. 底部摘要行

為儀式輸出建別模組：

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**預期：** 獨立可用之 reporter 函數——各自處理格式化而不依呼叫者狀態。

**失敗時：** 若函數長於 ~50 行，抽出輔助。reporter 函數應易於孤立地審閱。

### 步驟六：於諸環境測輸出

驗輸出於不同情境中正確渲染：

```bash
# With colors (interactive terminal)
node cli/index.js list --domains

# Without colors (piped)
node cli/index.js list --domains | cat

# With NO_COLOR environment variable
NO_COLOR=1 node cli/index.js list --domains

# JSON mode (parseable)
node cli/index.js campfire --json | jq .

# In CI (typically no TTY)
CI=true node cli/index.js audit
```

檢之於：
- 色於互動模式中正確顯示
- 無 ANSI 轉義碼漏入 piped/重定向輸出
- JSON 有效（pipe 至 `jq .` 以驗）
- Unicode 圖符於目標終端中渲染
- 欄對齊於內容寬度變動時仍持

**預期：** 輸出於所有五情境中皆正確。

**失敗時：** 若 ANSI 碼漏，確 chalk 尊 `NO_COLOR`。若 Unicode 破，提供 ASCII 回退模式。

## 驗證

- [ ] 色盤有無色回退
- [ ] 狀態指示符於色與無色模式皆運作
- [ ] 所有四冗長度層級生有用輸出
- [ ] JSON 輸出有效且 `jq` 可解析
- [ ] 聲音規則載之並一致遵循
- [ ] reporter 函數優雅處理空/null 輸入
- [ ] 輸出於此等測之：terminal、piped、NO_COLOR、CI

## 常見陷阱

- **於 JSON 中混人類文字**：於 `--json` 模式僅輸出有效 JSON。單一漏行（如「DRY RUN」）破 JSON 解析器。若指令須兩者皆示，明離之或於 JSON 模式中抑人類文字。
- **硬編碼欄寬**：內容長度變。用 `Math.max(...items.map(i => i.id.length))` 動態算填充。
- **無義之色**：若色為區成敗之唯一法，則色盲用戶與 piped 輸出失資訊。恆以文字指示符（`+`、`OK`、`ERR`）配色。
- **儀式於錯情境**：暖敘事輸出適於互動終端會話。於 CI、腳本或 `--quiet` 模式中，增噪。以顯式旗標閘儀式輸出。
- **忘摘要行**：用戶先掃末行。每操作應以單行摘要結（成功/失敗/跳過之計數）。

## 相關技能

- `scaffold-cli-command` — 用此輸出之指令
- `test-cli-application` — 測輸出合預期
- `build-cli-plugin` — 插件透過此輸出系統報結果
