---
name: design-cli-output
locale: wenyan
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

# 設 CLI 輸出

為命令行具設一致之多層終端輸出。

## 用時

- 為 CLI 工具建新報告模
- 於標交易輸出旁加溫或敘述輸出
- 為多命令統一輸出式
- 與人可讀輸出並設 JSON 機輸出
- 為新終端工具擇色、字符、冗贅級

## 入

- **必要**：CLI 工具名與主受眾（開發者、運者、終用者）
- **必要**：需格式輸出之諸命令
- **可選**：是否欲「儀式」或敘述輸出
- **可選**：品牌約（色板、語調）

## 法

### 第一步：定色板

以 chalk 建名板物：

**標板**（交易輸出）：

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

**溫板**（儀式/敘述輸出）：

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

板設之則：
- 恒供無色退路（上之 Proxy 模式）
- 自定板用十六進色（`chalk.hex('#FF6B35')`）
- fail/error 色無論板主題恒為紅
- 以語義角命板項，非以視外觀

**得：** 板物附名項及無色退路。

**敗則：** 若 chalk 不可得（管輸出、CI），Proxy 退路返字符串不變。以 `NO_COLOR=1` 環境變量測。

### 第二步：擇狀指

擇 Unicode 字符或 ASCII 字為狀通：

**ASCII（最大兼容）：**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode（豐，需 UTF-8 終端）：**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

擇之則：
- CI 或管境之工具用 ASCII
- 交互終端用者用 Unicode
- 以 `--ascii` 旗或 `NO_COLOR` 察二者皆供
- 於諸境測字符：macOS Terminal、Windows Terminal、VS Code terminal、SSH 會

**得：** 字符集，一目可通狀而不唯賴色。

**敗則：** 若測中字符渲為 `?` 或方塊，替以 ASCII 等。`+/-/=/!` 集處處可。

### 第三步：設冗贅級

各命令宜支四輸出級：

| 級 | 旗 | 受眾 | 內容 |
|-------|------|----------|---------|
| **默** | （無） | 終端之人 | 格式、著色、資訊 |
| **詳** | `--verbose` 或 `--ceremonial` | 欲詳之人 | 逐項細、至序 |
| **靜** | `--quiet` | 腳本、CI | 最少行、狀圖、無飾 |
| **JSON** | `--json` | 機消費者 | 結構、可解、全 |

實模：

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

JSON 輸出之則：
- 恒有效 JSON（勿混人文本）
- 含人輸出諸數，加機有用字段
- 跨命令用一致鑰名
- 成退 0，錯退 1（不論輸出模）

**得：** 四清輸出級，跨命令行為一致。

**敗則：** 若詳模過噪，設為自選（`--ceremonial`）而非漸進級。

### 第四步：立語則

定諸輸出函從之語調式。防跨命令不一致。

語則例（由營火報告）：

1. **現時、主動**：「mystic arrives」非「mystic has been installed」
2. **無歎**：靜信。工具不喊。
3. **隱喻替術語**：「practices」非「dependencies」（唯儀式模）
4. **敗誠實非災**：「A spark was lost」非「ERROR: installation failed with exit code 1」
5. **末行反狀**：各操以狀總結
6. **無 emoji**：Unicode 字符承視重而非裝
7. **每字承資**：若字不加解，除之

標（非儀式）輸出之語則：
- 簡實之行
- 狀圖+項 ID+脈
- 含計之總行
- 錯示糾動

**得：** 書 3-7 語則，諸輸出函宜從。

**敗則：** 若則似妄，驗之：書同輸出有無各則。若除則不變質，則非需。

### 第五步：實報告函

組輸出入報告模，附聚能：

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

各函從同結構：
1. 優理空/空輸
2. 算布局（列寬、墊）
3. 以板色輸
4. 底總行

儀式輸出建獨模：

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**得：** 報告函獨可用——各理自格式無賴呼狀。

**敗則：** 若函長於約 50 行，抽助者。報告函宜易獨察。

### 第六步：跨境測輸出

驗輸出於異脈正渲：

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

察：
- 交互模色正顯
- ANSI 逸碼不漏入管/重定輸
- JSON 有效（管至 `jq .` 驗）
- Unicode 字符於目標終端渲
- 列齊於變寬內容守

**得：** 五境輸出皆正。

**敗則：** 若 ANSI 漏，確 chalk 守 `NO_COLOR`。若 Unicode 壞，供 ASCII 退模。

## 驗

- [ ] 色板有無色退路
- [ ] 狀指於色與無色模皆可
- [ ] 四冗贅級皆生有用輸出
- [ ] JSON 輸出有效且 `jq` 可解
- [ ] 語則已記且一致從
- [ ] 報告函優理空/空輸
- [ ] 輸出於下諸境皆測：terminal、管、NO_COLOR、CI

## 陷

- **混人文本與 JSON**：`--json` 模唯出有效 JSON。一孤行（如「DRY RUN」）破 JSON 解。若命令宜示二者，明分或於 JSON 模抑人文本。
- **硬編列寬**：內容長變。以 `Math.max(...items.map(i => i.id.length))` 動算墊。
- **色無義**：若色為別成敗唯徑，色盲用者與管輸失資。恒色配文指（`+`、`OK`、`ERR`）。
- **儀式於誤境**：溫敘輸出宜交互終端會。於 CI、腳、`--quiet` 模，添噪。儀式輸出置明旗後。
- **忘總行**：用者先掃末行。諸操宜以單行總結（成/敗/跳計）。

## Related Skills

- `scaffold-cli-command` — 用此輸出之命令
- `test-cli-application` — 測輸出合期
- `build-cli-plugin` — 插件經此輸出系報結
