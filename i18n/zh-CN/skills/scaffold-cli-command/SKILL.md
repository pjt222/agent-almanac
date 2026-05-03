---
name: scaffold-cli-command
description: >
  使用 Commander.js 搭建带选项、action 处理器、三种输出模式（人类可读、
  quiet、JSON）和可选 ceremony 变体的新 CLI 命令的脚手架。涵盖命令命名、
  选项设计、共享上下文模式、错误处理和集成测试。在向现有 Commander.js
  CLI 添加命令、从零设计新 CLI 工具，或在多命令 CLI 中标准化命令结构时使用。
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
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 搭建 CLI 命令脚手架

向 Commander.js CLI 应用添加新命令，附一致的选项处理、三种输出模式和集成测试。

## 适用场景

- 向现有 Commander.js CLI 添加新命令
- 从零设计多命令 CLI 工具
- 标准化命令结构使所有命令遵循相同模式
- 添加用温暖叙事输出替代机器输出的 "ceremony" 变体

## 输入

- **必需**：命令名和动词（如 `gather`、`audit`、`sync`）
- **必需**：命令做什么（一句话）
- **必需**：CLI 入口点路径（如 `cli/index.js`）
- **可选**：命令是否需要 ceremony 变体（温暖叙事输出）
- **可选**：超出标准集的自定义选项
- **可选**：子命令参数（位置参数如 `<name>` 或 `[names...]`）

## 步骤

### 第 1 步：选择命令名和类别

选择传达命令动作的动词。将命令分组为类别：

| 类别 | 动词 | 模式 |
|----------|-------|---------|
| CRUD | `install`、`uninstall`、`list`、`search` | 操作内容 |
| 生命周期 | `init`、`sync`、`audit` | 管理项目状态 |
| Ceremony | `gather`、`scatter`、`tend`、`campfire` | 温暖叙事输出 |

命名约定：
- 使用单一动词（不要 `install-skill` —— 让选项指定什么）
- 使用小写，命令名本身无连字符
- 位置参数：`<required>`、`[optional]` 或 `[variadic...]`

```javascript
program
  .command('gather <name>')
  .description('Gather a team around the campfire')
```

**预期结果：** 已定义命令名、描述和位置参数。

**失败处理：** 若动词与现有命令重叠，要么组合它们（向现有命令添加选项），要么在描述中清晰区分。

### 第 2 步：定义选项

每个命令应支持一组标准共享选项加上命令特定的。

**标准选项**（按需包含）：

```javascript
  .option('-n, --dry-run', 'Preview without making changes')
  .option('-q, --quiet', 'Suppress human-readable output')
  .option('--json', 'Output as JSON')
  .option('-f, --framework <id>', 'Target specific framework')
  .option('-g, --global', 'Use global scope')
  .option('--scope <scope>', 'Scope: project, workspace, global', 'project')
  .option('--source <path>', 'Path to tool root directory')
```

**命令特定选项** —— 仅添加命令需要的：

```javascript
  .option('--ceremonial', 'Show each item arriving individually')
  .option('--only <items>', 'Comma-separated subset to include')
  .option('-y, --yes', 'Skip confirmation prompts')
```

设计规则：
- 频繁使用选项用短标志（`-n`）
- 长标志（`--dry-run`）以求清晰
- 适当时将默认值作为第三参数
- 切换用布尔标志（无参数）

**预期结果：** 包含标准和自定义选项的完整选项链。

**失败处理：** 若积累太多选项（>8），考虑拆分为子命令或分组相关选项。

### 第 3 步：实现 Action 处理器

action 处理器遵循一致模式：

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

`getContext()` 共享辅助器集中：
- 根目录检测
- 注册表加载
- 框架检测或显式选择
- 作用域解析

**预期结果：** 遵循 5 步模式的 action 处理器：context → resolve → preview → execute → output。

**失败处理：** 若命令不适合 resolve-then-execute 模式（如纯信息性如 `detect`），简化为：context → compute → output。

### 第 4 步：添加三种输出模式

每个命令应支持三种输出模式：

**默认（人类可读）：**
```
Installing 3 item(s) to Claude Code...

  + create-skill [claude-code] .claude/skills/create-skill
  + write-tests  [claude-code] .claude/skills/write-tests
  = commit-changes [claude-code] (skipped)

  2 installed, 1 skipped
```

**Quiet (`--quiet`)：**
标准 reporter 输出 —— 带状态图标（`+`、`-`、`=`、`!`）的简洁行，无 ceremony，无装饰。

**JSON (`--json`)：**
```json
{
  "command": "install",
  "items": 3,
  "installed": 2,
  "skipped": 1,
  "failed": 0
}
```

实现模式：

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

**预期结果：** 所有三种模式产出有用输出。JSON 可解析。Quiet 简洁。默认信息丰富。

**失败处理：** 若命令无有意义的 JSON 表达（如 `detect`），跳过 JSON 模式并记录原因。

### 第 5 步：添加 Ceremony 变体（可选）

对受益于温暖叙事输出而非事务性报告的命令：

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

Ceremony 输出遵循语调规则：
1. 现在时、主动语态（"mystic arrives"，非 "mystic was installed"）
2. 不用感叹号
3. 隐喻取代行话（"practices" 而非 "dependencies"）
4. 失败诚实，不灾难化（"a spark was lost"）
5. 结尾行反映状态（"The fire burns."）
6. 不用表情符号 —— 使用 Unicode 图形符号（✦ ◉ ◎ ○ ✗）
7. 每个词必须承载信息

详细终端输出模式见 `design-cli-output` 技能。

**预期结果：** 遵循所有语调规则、产出温暖、信息丰富叙事的 ceremony 输出。

**失败处理：** 若 ceremony 输出感觉勉强或不增加超出标准输出的信息，跳过它。不是每个命令都需要 ceremony 变体。

### 第 6 步：处理错误和边界情况

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

错误设计原则：
- 错误消息建议纠正行动
- 不可恢复错误用 `process.exit(1)`
- 破坏性操作的确认提示（用 `--yes` 绕过）
- Dry-run 始终成功（永不在确认上阻塞）

**预期结果：** 所有错误路径产出有帮助消息。破坏性操作需要确认。

**失败处理：** 若确认提示干扰脚本，确保 `--yes` 和 `--quiet` 都绕过它们。

### 第 7 步：编写集成测试

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

详细 CLI 测试模式见 `test-cli-application` 技能。

**预期结果：** 至少 3 个测试：dry-run、JSON 输出、错误情况。复杂命令更多。

**失败处理：** 若 `execSync` 超时，增加超时或检查阻塞命令的交互提示。

## 验证清单

- [ ] 命令在 CLI 入口点注册并出现在 `--help` 中
- [ ] 标准选项（`--dry-run`、`--quiet`、`--json`）正确工作
- [ ] 默认输出人类可读且信息丰富
- [ ] JSON 输出有效且可解析
- [ ] 错误消息建议纠正行动
- [ ] 破坏性操作需要确认（用 `--yes` 绕过）
- [ ] 至少 3 个集成测试通过
- [ ] 命令遵循 getContext → resolve → execute → output 模式

## 常见问题

- **遗忘 JSON 模式**：机器消费者（脚本、CI）依赖结构化输出。即使命令看起来仅交互式，也始终实现 `--json`。
- **确认提示阻塞脚本**：任何提示输入的命令在非交互上下文中会挂起。始终为破坏性命令提供 `--yes` 并确保 `--quiet` 抑制提示。
- **不一致的错误退出码**：所有错误用 `process.exit(1)`。解析 CLI 输出的工具先检查退出码。
- **无默认值的选项**：像 `--scope` 的选项应有合理默认，使用户不必每次指定。
- **将 ceremony 泄漏到 quiet 模式**：`--quiet` 标志意味着"机器最少输出"。若 ceremony 文本泄漏到 quiet 模式，脚本会在意外输出上损坏。

## 相关技能

- `build-cli-plugin` —— 构建命令操作的适配器/插件
- `test-cli-application` —— 超出第 7 步基础的全面 CLI 测试模式
- `design-cli-output` —— 所有详细级别的终端输出设计
- `install-almanac-content` —— 结构良好 CLI 命令技能的示例
