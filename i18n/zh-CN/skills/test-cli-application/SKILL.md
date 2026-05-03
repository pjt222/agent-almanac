---
name: test-cli-application
description: >
  使用内置的 node:test 模块为 Node.js CLI 应用编写集成测试。涵盖 exec
  辅助器模式、输出断言、文件系统状态验证、清理 hook、JSON 输出解析、
  错误情况测试，以及破坏性测试后的状态恢复。在向现有 CLI 添加测试、
  测试新命令、跨框架验证适配器行为，或为 CLI 工具设置 CI 时使用。
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
    - testing
    - nodejs
    - node-test
    - integration
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 测试 CLI 应用

使用带 `execSync` 的内置 `node:test` 模块为 Node.js CLI 编写集成测试。

## 适用场景

- 向现有 CLI 应用添加测试
- 测试新创建的命令
- 跨目标框架验证适配器/插件行为
- 设置验证 CLI 正确性的 CI
- 在重构 CLI 内部后捕捉回归

## 输入

- **必需**：CLI 入口点路径（如 `cli/index.js`）
- **必需**：要测试的命令
- **可选**：要测试的框架适配器（dry-run 模式）
- **可选**：清理要求（测试创建的文件/符号链接）

## 步骤

### 第 1 步：设置测试基础设施

```javascript
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const CLI = 'node cli/index.js';
const ROOT = process.cwd();

function run(args) {
  return execSync(`${CLI} ${args}`, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10000,
  });
}
```

关键设计决策：
- `node:test` 是内置的 —— 无需测试运行器依赖
- `execSync` 将 CLI 作为子进程运行 —— 测试实际二进制，非内部函数
- 10 秒超时防止在交互提示上挂起
- `encoding: 'utf8'` 给字符串输出用于正则匹配
- 所有路径相对 `ROOT` 以求可重复性

**预期结果：** 从 `node:test` 导入并有可工作 `run()` 辅助器的测试文件。

**失败处理：** 若 `node:test` 不可用，您的 Node.js 版本低于 18。升级或使用 polyfill。

### 第 2 步：编写冒烟测试

冒烟测试验证 CLI 启动、解析参数并产出预期输出形状：

```javascript
describe('meta', () => {
  it('shows version', () => {
    const out = run('--version');
    assert.match(out, /\d+\.\d+\.\d+/);
  });

  it('shows help with all commands', () => {
    const out = run('--help');
    assert.match(out, /install/);
    assert.match(out, /list/);
    assert.match(out, /detect/);
  });
});

describe('registry', () => {
  it('list shows expected counts', () => {
    const out = run('list --domains');
    assert.match(out, /\d+ domains/);
  });

  it('search finds known items', () => {
    const out = run('search "docker"');
    assert.match(out, /result\(s\) for "docker"/);
  });

  it('search returns 0 for nonsense', () => {
    const out = run('search "xyzzy-nonexistent"');
    assert.match(out, /0 result/);
  });
});
```

冒烟测试模式：
- `--version` 和 `--help` 始终工作
- 注册表加载验证数据完整性
- 用已知和未知术语搜索

**预期结果：** 冒烟测试确认 CLI 功能正常且数据已加载。

**失败处理：** 若注册表计数频繁变化，使用 `\d+` 而非硬编码数字。

### 第 3 步：编写生命周期测试

生命周期测试验证带清理的 create → verify → delete 序列：

```javascript
describe('install', () => {
  const testPath = resolve(ROOT, '.agents/skills/commit-changes');

  after(() => {
    // Always clean up, even if tests fail
    try { rmSync(testPath); } catch {}
    try { rmSync(resolve(ROOT, '.agents/skills'), { recursive: true }); } catch {}
    try { rmSync(resolve(ROOT, '.agents'), { recursive: true }); } catch {}
  });

  it('dry-run does not create files', () => {
    const out = run('install commit-changes --dry-run');
    assert.match(out, /DRY RUN/);
    assert.ok(!existsSync(testPath));
  });

  it('installs creates the target', () => {
    run('install commit-changes');
    assert.ok(existsSync(testPath));
  });

  it('skips already installed', () => {
    const out = run('install commit-changes');
    assert.match(out, /skipped/);
  });

  it('uninstall removes the target', () => {
    run('uninstall commit-changes');
    assert.ok(!existsSync(testPath));
  });
});
```

清理规则：
- 用 `after()` hook，不用 `afterEach()` —— 生命周期测试相互构建
- 用 `try/catch` 包裹清理 —— 清理不能让测试套件失败
- 从叶到根清理（文件 → 父目录 → 祖父目录）
- 若测试修改共享状态（符号链接、配置文件），恢复它

**预期结果：** 测试在 describe 块内顺序运行，即使失败清理也运行。

**失败处理：** 若测试并行运行（node:test 中非默认），用 `{ concurrency: 1 }` 强制顺序。

### 第 4 步：为每个适配器编写 Dry-Run 测试

测试每个适配器的目标路径而不进行变更：

```javascript
describe('adapter: cursor (dry-run)', () => {
  it('targets .cursor/skills/ path', () => {
    const out = run('install commit-changes --framework cursor --dry-run');
    assert.match(out, /\.cursor\/skills/i);
  });
});

describe('adapter: copilot (dry-run)', () => {
  it('targets .github/ path', () => {
    const out = run('install commit-changes --framework copilot --dry-run');
    assert.match(out, /\.github/i);
  });
});
```

此模式可扩展到任意数量适配器。每个测试：
- 用 `--framework` 绕过自动检测
- 用 `--dry-run` 使无文件被创建
- 断言目标路径出现在输出中

**预期结果：** 每个适配器一个 describe 块，每个至少有路径断言。

**失败处理：** 若适配器在项目中不存在，测试将以 "Unknown framework" 失败。这正确 —— 适配器测试应仅对已实现适配器存在。

### 第 5 步：编写错误情况测试

```javascript
describe('errors', () => {
  it('rejects unknown items', () => {
    assert.throws(
      () => run('install nonexistent-skill-xyz'),
      /No matching items|Unknown/,
    );
  });

  it('rejects unknown framework', () => {
    assert.throws(
      () => run('install commit-changes --framework nonexistent'),
      /Unknown framework/,
    );
  });

  it('handles missing state gracefully', () => {
    assert.throws(
      () => run('scatter nonexistent-team'),
      /not burning|Unknown/,
    );
  });
});
```

错误测试模式：
- `assert.throws` 捕捉来自 `execSync` 的非零退出码
- 在错误消息上正则匹配（从 stderr 捕获）
- 测试 "项未找到" 和 "无效选项" 错误
- 验证错误消息建议纠正行动

**预期结果：** 所有错误路径产出非零退出码和有帮助消息。

**失败处理：** `execSync` 在非零退出时抛出。错误的 `stderr` 或 `stdout` 包含消息。若 `assert.throws` 正则不匹配，检查 `error.stdout`。

### 第 6 步：编写 JSON 输出测试

```javascript
describe('json output', () => {
  it('campfire --json outputs valid JSON', () => {
    const out = run('campfire --json');
    const data = JSON.parse(out);
    assert.ok(typeof data.totalTeams === 'number');
    assert.ok(Array.isArray(data.fires));
  });

  it('gather --dry-run --json outputs structured data', () => {
    const out = run('gather tending --dry-run --json');
    // JSON may follow a DRY RUN header — extract from first '{'
    const jsonStart = out.indexOf('{');
    assert.ok(jsonStart >= 0, 'Should contain JSON');
    const data = JSON.parse(out.slice(jsonStart));
    assert.equal(data.team, 'tending');
  });
});
```

JSON 测试陷阱：
- 某些命令以人类可读文本前缀 JSON（如 DRY RUN 头）
- 通过查找第一个 `{` 字符提取 JSON
- 验证结构（键存在、类型），非精确值
- 像计数的值可能随内容添加而变化

**预期结果：** JSON 输出可解析且包含预期键。

**失败处理：** 若 `JSON.parse` 失败，命令可能将人类文本与 JSON 混合。要么修复命令在 `--json` 模式输出纯 JSON，要么提取 JSON 子串。

### 第 7 步：处理清理和状态恢复

```javascript
describe('stateful commands', () => {
  const stateDir = resolve(ROOT, '.agent-almanac');

  after(() => {
    // Remove state file created by tests
    try { rmSync(stateDir, { recursive: true }); } catch {}
  });

  // Tests that create/modify state...
});

// Restore symlinks that destructive tests may remove
describe('destructive tests', () => {
  after(() => {
    // Restore symlinks that scatter/uninstall removed
    const skills = ['heal', 'meditate', 'remote-viewing'];
    for (const skill of skills) {
      const link = resolve(ROOT, `.claude/skills/${skill}`);
      if (!existsSync(link)) {
        try {
          execSync(`ln -s ../../skills/${skill} ${link}`, { cwd: ROOT });
        } catch {}
      }
    }
  });
});
```

状态恢复规则：
- 状态文件（`.agent-almanac/state.json`）必须在测试后清理
- 由 `scatter`/`uninstall` 移除的符号链接必须恢复
- 由 `init` 创建的 manifest 文件（`agent-almanac.yml`）必须移除
- 顺序：`after()` hook 按声明顺序反向运行 —— 最后声明恢复 hook

**预期结果：** 测试套件让项目处于发现时的相同状态。

**失败处理：** 若 CI 在测试运行后报告剩余文件，将清理添加到 `after()`。在测试运行后用 `git status` 检测泄漏状态。

## 验证清单

- [ ] 测试文件用 `node --test cli/test/cli.test.js` 运行
- [ ] 所有测试通过（0 失败）
- [ ] 冒烟测试涵盖 `--version`、`--help` 和注册表加载
- [ ] 生命周期测试验证带清理的 create → verify → delete
- [ ] 每个已实现适配器至少存在一个适配器 dry-run 测试
- [ ] 错误情况用消息匹配测试非零退出码
- [ ] JSON 输出测试解析实际输出（非模拟）
- [ ] After hook 恢复测试修改的所有状态

## 常见问题

- **会损坏的硬编码计数**：注册表总数随内容添加变化。用 `\d+` 正则或动态读取计数，而非断言 `329 skills`。
- **依赖执行顺序的测试**：`node:test` 默认按声明顺序运行套件，但套件内的测试可能不。在单一 `describe` 内使用生命周期套件（create → verify → delete）保证顺序。
- **测试失败时缺失清理**：若测试在生命周期中间失败，`after()` 仍运行。但若您在 `before()` 中抛出，后续测试和 `after()` 可能不运行。保持 `before()` 最少。
- **交互提示挂起测试**：带确认提示的命令将挂起 `execSync`。要么 `echo y |` 管道，要么确保测试中始终传递 `--yes`。
- **CI 中实际安装测试**：在 `.claude/skills/` 或 `.agents/skills/` 中创建文件的测试修改工作树。CI 可能在 "脏工作目录" 检查上失败。始终清理。

## 相关技能

- `scaffold-cli-command` —— 构建这些测试验证的命令
- `build-cli-plugin` —— 构建第 4 步测试的适配器
- `design-cli-output` —— 测试断言对照的输出模式
