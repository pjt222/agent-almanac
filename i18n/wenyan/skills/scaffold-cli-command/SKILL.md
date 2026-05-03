---
name: scaffold-cli-command
locale: wenyan
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

# 搭 CLI 之命

於 Commander.js 之 CLI 應用增新命，其選項一致、有三出模、有集成試。

## 用時

- 既有 Commander.js CLI 增新命乃用
- 自零設多命 CLI 之器乃用
- 諸命依同模而標準乃用
- 增「儀式」之變，以暖之敘出代機械之出乃用

## 入

- **必要**：命之名與動詞（如 `gather`、`audit`、`sync`）
- **必要**：命所為（一句述之）
- **必要**：CLI 入點之徑（如 `cli/index.js`）
- **可選**：命是否需儀式之變（暖敘之出）
- **可選**：標準集外之自定選項
- **可選**：子命之參（位置參如 `<name>` 或 `[names...]`）

## 法

### 第一步：擇命之名與類

擇動詞以傳命之行。命分諸類：

| 類 | 動詞 | 模 |
|----------|-------|---------|
| CRUD | `install`、`uninstall`、`list`、`search` | 操於內容 |
| 周期 | `init`、`sync`、`audit` | 治項目之態 |
| 儀式 | `gather`、`scatter`、`tend`、`campfire` | 暖敘之出 |

命名之規：

- 用單動詞（非 `install-skill`——令選項定其何）
- 小寫，命名本無連字
- 位置參：`<必>`、`[選]`、或 `[多...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

得：命之名、述、位置參皆定。

敗則：動詞與既有命疊，則合之（增選項於既命）或於述中明分之。

### 第二步：定選項

每命宜支共用之標準選項並命特之選項。

**標準選項**（依需含之）：

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**命特之選項**——唯增命所需：

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

設之規：

- 短旗（`-n`）為頻用之選
- 長旗（`--dry-run`）為明
- 默值為第三參，適則用之
- 布爾旗（無參）為切換

得：選項之鏈備，標準與自定皆有。

敗則：選過繁（>8），考分為子命，或聚相關選項。

### 第三步：施行止之手

行止之手依一致之模：

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

`getContext()` 共助集中：

- 根目之察
- 註冊之載
- 框架之察或明擇
- 範之解

得：行止之手依五步——境 → 解 → 預 → 行 → 出。

敗則：命不合解—行之模（如純信息類 `detect`），簡為：境 → 算 → 出。

### 第四步：增三出模

每命宜支三出模：

**默（人可讀）**：

```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**靜（`--quiet`）**：標準報告者之出——簡之線附狀態之圖（`+`、`-`、`=`、`!`），無儀，無飾。

**JSON（`--json`）**：

```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

施之模：

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

得：三模皆生有用之出。JSON 可解。靜簡。默有信息。

敗則：命無有義 JSON 之表（如 `detect`），略 JSON 模而書其由。

### 第五步：增儀式之變（可選）

某命宜暖敘代事務之報：

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

儀式之出依語之規：

1. 現在時、主動聲（「mystic arrives」，非「mystic was installed」）
2. 無感歎號
3. 隱喻代術語（「practices」非「dependencies」）
4. 敗誠述，非災（「a spark was lost」）
5. 末句反映態（「The fire burns.」）
6. 無 emoji——用 Unicode 之字（✦ ◉ ◎ ○ ✗）
7. 每字皆載信息

詳之終端出模，參 `design-cli-output` 技。

得：儀式之出依諸語規，生暖而有信息之敘。

敗則：儀式之出覺強或不增信息於標準出之外，略之。非每命皆需儀式之變。

### 第六步：處誤與邊例

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

誤之設之則：

- 誤辭示其修法
- 不可復之誤用 `process.exit(1)`
- 破壞之操需確認（以 `--yes` 略之）
- 干跑常成（不阻於確認）

得：誤之諸路皆生助辭。破壞之操需確認。

敗則：確認之問擾本，確 `--yes` 與 `--quiet` 皆略之。

### 第七步：書集成試

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

詳之 CLI 試模，參 `test-cli-application` 技。

得：至少三試：干跑、JSON 出、誤例。繁命宜增之。

敗則：`execSync` 超時，增其超時或察是否有交互之問阻命。

## 驗

- [ ] 命已註於 CLI 入點，現於 `--help`
- [ ] 標準選項（`--dry-run`、`--quiet`、`--json`）皆行正
- [ ] 默之出人可讀且有信息
- [ ] JSON 之出有效可解
- [ ] 誤辭示其修法
- [ ] 破壞之操需確認（以 `--yes` 略之）
- [ ] 至少三集成試皆過
- [ ] 命依 getContext → 解 → 行 → 出之模

## 陷

- **忘 JSON 之模**：機之消費者（本、CI）依結構之出。雖命似交互之命，必施 `--json`
- **確認之問阻本**：問入之命於非交互之境必懸。破壞之命必供 `--yes`，且 `--quiet` 略其問
- **誤之退碼不一**：諸誤皆用 `process.exit(1)`。析 CLI 出之器先察退碼
- **選無默**：如 `--scope` 之選宜有合理之默，免每呼皆指
- **儀洩入靜模**：`--quiet` 旗為「機之最小出」。儀文洩入靜模，本因意外之出而破

## 參

- `build-cli-plugin` — 建命所操之適配/插件
- `test-cli-application` — 全 CLI 試模，超第七步之基
- `design-cli-output` — 諸冗餘級之終端出設
- `install-almanac-content` — 結構良之 CLI 命技之例
