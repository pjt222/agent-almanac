---
name: scaffold-cli-command
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new CLI command using Commander.js with options, action handler,
  three output modes (human-readable, quiet, JSON), and optional ceremony
  variant. Covers command naming, option design, shared context patterns,
  error handling, and integration testing. Use when adding a command to an
  existing Commander.js CLI, designing a new CLI tool from scratch, or
  standardizing command structure across a multi-command CLI.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: cli
  complexity: intermediate
  language: TypeScript
  tags:
    - cli
    - commander
    - nodejs
    - terminal
    - command-pattern
---

# 構建 CLI 命令腳手架

於 Commander.js CLI 應用中新增命令，附一致之選項處理、三種輸出模式與整合測試。

## 適用時機

- 為既有 Commander.js CLI 新增命令
- 從頭設計多命令 CLI 工具
- 標準化命令結構，使所有命令遵循相同模式
- 新增「儀式」變體，以溫暖、敘事之輸出取代機器輸出

## 輸入

- **必要**：命令名與動詞（如 `gather`、`audit`、`sync`）
- **必要**：命令之作用（一句話）
- **必要**：CLI 入口點之路徑（如 `cli/index.js`）
- **選擇性**：命令是否需儀式變體（溫暖敘事輸出）
- **選擇性**：標準集外之自定選項
- **選擇性**：子命令引數（位置引數如 `<name>` 或 `[names...]`）

## 步驟

### 步驟一：選擇命令名與類別

擇一動詞傳達命令動作。將命令分類：

| 類別 | 動詞 | 模式 |
|----------|-------|---------|
| CRUD | `install`、`uninstall`、`list`、`search` | 操作於內容上 |
| 生命週期 | `init`、`sync`、`audit` | 管理項目狀態 |
| 儀式 | `gather`、`scatter`、`tend`、`campfire` | 溫暖敘事輸出 |

命名慣例：
- 用單一動詞（非 `install-skill`——讓選項指定何物）
- 用小寫，命令名本身無連字號
- 位置引數：`<required>` 或 `[optional]` 或 `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**預期：** 命令名、描述與位置引數已定義。

**失敗時：** 若動詞與既有命令重疊，組合之（為既有命令加選項）或於描述中清楚區分。

### 步驟二：定義選項

每命令應支援標準共享選項加命令特定選項。

**標準選項**（依需納入）：

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**命令特定選項**——僅加命令所需者：

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

設計規則：
- 短旗（`-n`）用於常用選項
- 長旗（`--dry-run`）用於清晰
- 適當處以第三引數設預設值
- 布林旗（無引數）用於切換

**預期：** 完整之選項鏈，含標準與自定選項。

**失敗時：** 若選項累積過多（>8），考慮分為子命令或將相關選項分組。

### 步驟三：實作動作處理器

動作處理器遵循一致模式：

```javascript
.action(async (name, options) => {
  // 1. Get shared context (registries, adapters, paths)
  const ctx = getContext(options);

  // 2. Resolve what to operate on
  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  // 3. Preview if dry-run
  if (options.dryRun) reporter.printDryRun();

  // 4. Execute the operation
  const results = await executeOperation(items, ctx, options);

  // 5. Output results (3 modes)
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

`getContext()` 共享輔助函數集中：
- 根目錄偵測
- 註冊表載入
- 框架偵測或明確選擇
- 範圍解析

**預期：** 動作處理器遵循 5 步模式：context → resolve → preview → execute → output。

**失敗時：** 若命令不符合解析-然後執行模式（如純資訊性如 `detect`），簡化為：context → compute → output。

### 步驟四：加入三種輸出模式

每命令應支援三種輸出模式：

**預設（人類可讀）：**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**安靜（`--quiet`）：**
標準回報器輸出——簡潔行附狀態圖示（`+`、`-`、`=`、`!`），無儀式、無裝飾。

**JSON（`--json`）：**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

實作模式：

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
// Default: human-readable output
printHumanReadable(results, options);
```

**預期：** 三模式皆產生有用輸出。JSON 可解析。Quiet 簡潔。預設提供資訊。

**失敗時：** 若命令無有意義之 JSON 表示（如 `detect`），跳過 JSON 模式並記錄理由。

### 步驟五：加入儀式變體（選擇性）

對受益於溫暖敘事輸出（而非交易報告）之命令：

```javascript
if (options.json) {
  ceremonyReporter.printJson(data);
} else if (options.quiet) {
  reporter.printResults(results);
} else {
  ceremonyReporter.printArrival({
    teamId: name,
    agents,
    results: { installed, skipped, failed },
    ceremonial: options.ceremonial || false,
  });
}
```

儀式輸出遵循聲音規則：
1. 現在式、主動語態（「mystic arrives」非「mystic was installed」）
2. 無驚嘆號
3. 隱喻取代術語（「practices」非「dependencies」）
4. 失敗誠實，非災難（「a spark was lost」）
5. 結語反映狀態（「The fire burns.」）
6. 無 emoji——用 Unicode 字符（✦ ◉ ◎ ○ ✗）
7. 每字皆須承載資訊

詳細終端輸出模式見 `design-cli-output` 技能。

**預期：** 儀式輸出遵循所有聲音規則並產生溫暖、提供資訊之敘事。

**失敗時：** 若儀式輸出感覺勉強或未在標準輸出之外增加資訊，跳過之。非每命令皆需儀式變體。

### 步驟六：處理錯誤與邊緣情況

```javascript
// Unknown item
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

// Confirmation for destructive actions
if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

// State validation
if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

錯誤設計原則：
- 錯誤訊息建議修正動作
- 對不可恢復錯誤用 `process.exit(1)`
- 對破壞性操作有確認提示（以 `--yes` 繞過）
- Dry-run 永遠成功（從不因確認而阻塞）

**預期：** 所有錯誤路徑產生有助益之訊息。破壞性操作要求確認。

**失敗時：** 若確認提示干擾腳本化，確保 `--yes` 與 `--quiet` 皆繞過之。

### 步驟七：撰寫整合測試

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { /* cleanup created files/state */ });

  it('dry-run shows preview', () => {
    const out = run('new-command arg --dry-run');
    assert.match(out, /DRY RUN/);
  });

  it('--json outputs valid JSON', () => {
    const out = run('new-command arg --json');
    const start = out.indexOf('{');
    const data = JSON.parse(out.slice(start));
    assert.equal(data.command, 'new-command');
  });

  it('rejects unknown input', () => {
    assert.throws(() => run('new-command nonexistent'), /Unknown/);
  });
});
```

全面 CLI 測試模式詳見 `test-cli-application` 技能。

**預期：** 至少 3 測試：dry-run、JSON 輸出、錯誤案例。複雜命令需更多。

**失敗時：** 若 `execSync` 超時，提高超時或檢查互動式提示是否阻塞命令。

## 驗證

- [ ] 命令於 CLI 入口點已註冊並出現於 `--help`
- [ ] 標準選項（`--dry-run`、`--quiet`、`--json`）正確運作
- [ ] 預設輸出人類可讀且提供資訊
- [ ] JSON 輸出有效且可解析
- [ ] 錯誤訊息建議修正動作
- [ ] 破壞性操作要求確認（以 `--yes` 繞過）
- [ ] 至少 3 個整合測試通過
- [ ] 命令遵循 getContext → resolve → execute → output 模式

## 常見陷阱

- **遺忘 JSON 模式**：機器消費者（腳本、CI）依賴結構化輸出。即便命令看似僅為互動，仍應實作 `--json`。
- **確認提示阻塞腳本**：任何提示輸入之命令於非互動情境將懸停。對破壞性命令始終提供 `--yes`，並確保 `--quiet` 抑制提示。
- **不一致之錯誤退出碼**：所有錯誤皆用 `process.exit(1)`。解析 CLI 輸出之工具先檢查退出碼。
- **無預設之選項**：如 `--scope` 之選項應有合理預設，俾用戶無需每次指定。
- **儀式洩漏入安靜模式**：`--quiet` 旗標意指「給機器之最小輸出」。若儀式文字洩入安靜模式，腳本將因非預期輸出而崩潰。

## 相關技能

- `build-cli-plugin` — 建構命令所操作之適配器/外掛
- `test-cli-application` — 步驟七基礎之外之全面 CLI 測試模式
- `design-cli-output` — 各冗長等級之終端輸出設計
- `install-almanac-content` — 結構良好之 CLI 命令技能範例
