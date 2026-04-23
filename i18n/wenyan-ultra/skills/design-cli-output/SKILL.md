---
name: design-cli-output
locale: wenyan-ultra
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

# 設計 CLI 輸出

為命令行工具設一致多級終端輸出。

## 用

- 構 CLI 新報告者模組
- 加暖敘事輸出於標事務輸出
- 標準化多命令輸出格式
- 設並行機可讀 JSON+人可讀輸出
- 擇色、符、冗繁級予新終端工具

## 入

- **必**：CLI 名+主受眾（開發者、運維、終用戶）
- **必**：需格式化輸出之命令
- **可**：是否欲「儀式」或敘事變體
- **可**：品牌限（色板、調）

## 法

### 一：定色板

以 chalk 建名板對象：

**標板**（事務輸出）：

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

**暖板**（儀式/敘事輸出）：

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

色板設規：
- 常供無色退（上 Proxy 模式）
- 自定板用十六進（`chalk.hex('#FF6B35')`）
- 失敗/錯色無論板主題守紅
- 按語義角名非視外觀

**得：** 板對象含名項+無色退。

**敗：** chalk 不可用（管輸、CI）→Proxy 退返字串不變。以 `NO_COLOR=1` 環境變量測。

### 二：擇狀態指示符

擇 Unicode 符或 ASCII 字元傳狀態：

**ASCII**（最大相容）：

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode**（富，需 UTF-8 終端）：

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

擇標：
- CI 或管式運行→ASCII
- 交互終端用戶→Unicode
- 以 `--ascii` 旗或 `NO_COLOR` 檢供兩者
- 於此測：macOS Terminal、Windows Terminal、VS Code 終端、SSH 會話

**得：** 不賴色一目傳狀態之符集。

**敗：** 測中符示為 `?` 或方框→替以 ASCII 等。`+/-/=/!` 集處處可。

### 三：設冗繁級

每命令當支四輸出級：

| Level | Flag | Audience | Content |
|-------|------|----------|---------|
| **Default** | (none) | Human at terminal | Formatted, colored, informative |
| **Verbose** | `--verbose` or `--ceremonial` | Human wanting detail | Per-item breakdown, arrival sequences |
| **Quiet** | `--quiet` | Scripts, CI | Minimal lines, status icons, no decoration |
| **JSON** | `--json` | Machine consumers | Structured, parseable, complete |

實現模式：

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

JSON 輸出規：
- 常有效 JSON（無雜人文）
- 含人輸出所示諸數據+機有用字段
- 跨命令一致鍵命名
- 退出碼 0 成，1 錯（無論輸出模式）

**得：** 四清晰輸出級跨命令行為一致。

**敗：** verbose 過噪→改為選入（`--ceremonial`）而非分級冗繁。

### 四：立調規

定諸輸出函遵之調+風。防跨命令不一致。

調規例（由 campfire 報告者）：

1. **現在時主動語態**：「mystic arrives」非「mystic has been installed」
2. **無驚嘆**：靜信。工具不喊。
3. **喻替術語**：「practices」非「dependencies」（僅儀式模式）
4. **失誠非災**：「A spark was lost」非「ERROR: installation failed with exit code 1」
5. **結句反映狀**：每操作以狀總結
6. **無 emoji**：Unicode 符有視覺重不裝飾
7. **每字載信息**：字不加解→除

標（非儀式）輸出調規：
- 簡事實行
- 狀圖+項 ID+脈絡
- 總結行含計
- 錯訊建議糾正動作

**得：** 書 3-7 調規，輸出函須遵。

**敗：** 規任意→測：同輸出以無此規書。除規不減質→規不需。

### 五：實作報告者函

組輸出入聚焦模組：

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

每函從同結構：
1. 空/null 輸入優雅處
2. 計布局（列寬、填充）
3. 以板色輸出
4. 底總結行

儀式輸出建分離模組：

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**得：** 報告者函獨立可用——各自理格式不賴調用者狀。

**敗：** 函超 ~50 行→提助手。報告者函當易孤立審。

### 六：測諸環境輸出

驗諸上下文正確渲染：

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

查：
- 交互模色正顯
- 管/重定向輸出無 ANSI 轉義漏
- JSON 有效（管至 `jq .` 驗）
- 目標終端渲染 Unicode 符
- 內容寬變時列對齊守

**得：** 五上下文輸出皆正。

**敗：** ANSI 漏→確 chalk 尊 `NO_COLOR`。Unicode 壞→供 ASCII 退模。

## 驗

- [ ] 色板有無色退
- [ ] 狀態指示符於色+無色模式皆工作
- [ ] 四冗繁級生有用輸出
- [ ] JSON 有效可為 `jq` 解
- [ ] 調規錄並一致遵
- [ ] 報告者函優雅處空/null
- [ ] 輸出於此測：終端、管、NO_COLOR、CI

## 忌

- **混人文於 JSON**：`--json` 模式僅輸出有效 JSON。單雜行（如「DRY RUN」）破 JSON 解析。若命令須示兩者→明分或於 JSON 模抑人文。
- **硬編碼列寬**：內容長變。用 `Math.max(...items.map(i => i.id.length))` 動計填充。
- **僅色傳義**：若色為唯一別成敗者→色盲用戶+管輸出失信息。常配色+文指示（`+`、`OK`、`ERR`）。
- **儀式於錯脈絡**：暖敘事輸出宜交互終端。CI、腳本、`--quiet` 模→加噪。儀式輸出門於明旗後。
- **忘總結行**：用戶先掃末行。每操作當以一行總結結（成/敗/略計）。

## 參

- `scaffold-cli-command`
- `test-cli-application`
- `build-cli-plugin`
