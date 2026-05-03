---
name: scaffold-cli-command
locale: wenyan-ultra
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

# 架 CLI 命

加新命於 Commander.js 應、一致選、三出模、整測。

## 用

- 加命於既 Commander.js CLI→用
- 自無設多命 CLI→用
- 一規諸命結構→用
- 加禮變（暖敘出代機出）→用

## 入

- **必**：命名與動詞（如 `gather`、`audit`、`sync`）
- **必**：命作（一句）
- **必**：CLI 入口徑（如 `cli/index.js`）
- **可**：需禮變乎
- **可**：標選外之選
- **可**：位參（`<name>` 或 `[names...]`）

## 行

### 一：擇命名與類

選傳動之動詞。組命入類：

| 類 | 動 | 式 |
|----|----|---|
| CRUD | `install`、`uninstall`、`list`、`search` | 操容 |
| 生 | `init`、`sync`、`audit` | 管項態 |
| 禮 | `gather`、`scatter`、`tend`、`campfire` | 暖敘出 |

名規：
- 用單動（非 `install-skill`—讓選定何）
- 小寫、命名內無連字
- 位參：`<必>`、`[可]`、`[多...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

得：命名、述、位參定。

敗：動詞與既存命疊→組之（加選於既命）或於述清辨。

### 二：定選

每命宜支共選與命特。

**標選**（按需）：

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**命特選**—僅加所需：

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

設則：
- 短旗（`-n`）為常用
- 長旗（`--dry-run`）為清
- 默值為第三參
- 布旗為切

得：選鏈含標與特。

敗：選累 > 8→分子命或組相關選。

### 三：作動處理

動處理循一致式：

```javascript
.action(async (name, options) => {
  const ctx = getContext(options);

  const items = resolveItems(ctx, name, options);
  if (!items || items.length === 0) {
    reporter.error('Nothing found.');
    process.exit(1);
  }

  if (options.dryRun) reporter.printDryRun();

  const results = await executeOperation(items, ctx, options);

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else if (options.quiet) {
    reporter.printResults(results);
  } else {
    printHumanOutput(results, options);
  }
})
```

`getContext()` 共助中：
- 根目察
- 譜載
- 框察或顯選
- 範解

得：動處理循 5 步—境→解→預→行→出。

敗：命不合「解-行」式（如純訊如 `detect`）→簡為境→算→出。

### 四：加三出模

每命宜支三模：

**默（人讀）：**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**靜（`--quiet`）：**
標報出—簡行含態符（`+`、`-`、`=`、`!`），無禮、無飾。

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

行式：

```javascript
if (options.json) {
  console.log(JSON.stringify(data, null, 2));
  return;
}
if (options.quiet) {
  reporter.printResults(results);
  return;
}
printHumanReadable(results, options);
```

得：三模皆出有用。JSON 可解。靜簡。默訊。

敗：命無有意 JSON 表（如 `detect`）→略 JSON 模、文錄因。

### 五：加禮變（可）

宜暖敘出代易出之命：

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

禮出循聲則：
1. 現時、主動聲
2. 無歎號
3. 喻代術
4. 敗誠、非災
5. 末行映態
6. 無 emoji—用 Unicode 字符（✦ ◉ ◎ ○ ✗）
7. 每字載訊

詳見 `design-cli-output` 技。

得：禮出循諸聲則、生暖訊敘。

敗：禮覺強或不增訊→略。非每命需禮變。

### 六：理誤與邊例

```javascript
if (!item) {
  reporter.error(`Unknown: ${name}. Use 'tool list' to browse.`);
  process.exit(1);
}

if (!options.yes && !options.quiet && !options.dryRun) {
  const answer = await askYesNo('Proceed?');
  if (!answer) {
    console.log('  Cancelled.');
    return;
  }
}

if (!state.fires[name]) {
  reporter.error(`Not active. Nothing to remove.`);
  process.exit(1);
}
```

誤設則：
- 誤訊建糾正動
- `process.exit(1)` 為不可復誤
- 確認提予破壞動（`--yes` 繞）
- 預演恆成（不阻於確）

得：諸誤路生助訊。破壞動需確認。

敗：確擾本→確 `--yes` 與 `--quiet` 皆繞。

### 七：書整測

```javascript
import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';

const CLI = 'node cli/index.js';
function run(args) {
  return execSync(`${CLI} ${args}`, { encoding: 'utf8', timeout: 10000 });
}

describe('new-command', () => {
  after(() => { });

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

詳見 `test-cli-application` 技。

得：≥ 3 測—預演、JSON、誤例。複命更多。

敗：`execSync` 超時→增時或察互動提阻命。

## 驗

- [ ] 命註於 CLI 入口、見於 `--help`
- [ ] 標選（`--dry-run`、`--quiet`、`--json`）正
- [ ] 默出人讀且訊
- [ ] JSON 出有效可解
- [ ] 誤訊建糾正動
- [ ] 破壞動需確（`--yes` 繞）
- [ ] ≥ 3 整測過
- [ ] 命循 getContext → 解 → 行 → 出 式

## 忌

- **忘 JSON 模**：機消費（本、CI）依結構出。雖命似互動唯亦行 `--json`
- **確阻本**：問入命於非互動境掛。破壞命予 `--yes`、`--quiet` 抑提
- **誤退碼不一**：諸誤用 `process.exit(1)`。析 CLI 出之工先察退碼
- **選無默**：如 `--scope` 宜有合理默以免每次定
- **禮泄入靜模**：`--quiet` 為「機之最小出」。禮泄入靜→本破於非期出

## 參

- `build-cli-plugin`
- `test-cli-application`
- `design-cli-output`
- `install-almanac-content`
