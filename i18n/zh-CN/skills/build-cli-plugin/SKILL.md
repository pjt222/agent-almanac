---
name: build-cli-plugin
description: >
  使用抽象基类模式为 CLI 工具构建插件或适配器。涵盖定义契约（静态字段、
  必需方法）、选择安装策略（symlink、copy、append-to-file）、实现检测、
  幂等的 install/uninstall、列出、审计以及注册插件。当向 CLI 安装器添加
  对新框架的支持、为任何多目标工具构建插件系统，或扩展现有适配器架构时使用。
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
    - plugin
    - adapter
    - architecture
    - nodejs
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 构建 CLI 插件

使用抽象基类模式向 CLI 工具的可插拔架构添加新插件或适配器。

## 适用场景

- 向 CLI 安装器添加对新目标框架的支持
- 为多目标命令行工具构建插件系统
- 用新策略变体扩展现有适配器架构
- 将内容交付移植到使用不同文件布局的框架

## 输入

- **必需**：插件支持的框架或目标（名称、配置路径、约定）
- **必需**：基类或插件契约的路径
- **必需**：安装策略：`symlink`、`copy`、`file-per-item` 或 `append-to-file`
- **可选**：插件处理的内容类型（如仅技能、技能 + 代理、完整支持）
- **可选**：作用域支持（项目级、全局、两者）

## 步骤

### 第 1 步：定义契约

基类建立所有插件必须实现的接口：

```javascript
export class FrameworkAdapter {
  static id = 'base';            // Unique identifier
  static displayName = 'Base';   // Human-readable name
  static strategy = 'symlink';   // Installation strategy
  static contentTypes = ['skill']; // What this adapter handles

  async detect(projectDir) { return false; }
  getTargetPath(projectDir, scope) { throw new Error('Not implemented'); }
  async install(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async uninstall(item, projectDir, scope, options) { throw new Error('Not implemented'); }
  async listInstalled(projectDir, scope) { return []; }
  async audit(projectDir, scope) { return { framework: this.constructor.displayName, ok: [], warnings: [], errors: [] }; }
  supports(contentType) { return this.constructor.contentTypes.includes(contentType); }
}
```

**静态字段**定义插件的身份和能力：
- `id`：用于 `--framework <id>` 选项和结果报告
- `displayName`：在人类可读输出中显示
- `strategy`：决定内容如何到达目标
- `contentTypes`：过滤此适配器接收哪些项

如果基类尚不存在，先创建它。该模式可扩展到任意数量的插件。

**预期结果：** 一个具有静态身份字段和抽象方法的基类。

**失败处理：** 若基类有不适用于所有插件的方法（如并非所有框架都支持 `audit`），提供返回合理空操作的默认实现。

### 第 2 步：选择安装策略

| 策略 | 何时使用 | 示例 |
|----------|------------|---------|
| **symlink** | 目标直接读取源文件。最便宜，保持同步。 | Claude Code 读取 `.claude/skills/<name>/` 符号链接 |
| **copy** | 目标需要文件在自己的目录中。修改不传播。 | 某些 IDE 仅索引自己的目录 |
| **file-per-item** | 目标期望每项一个特定格式的文件。 | Cursor `.mdc` 规则文件 |
| **append-to-file** | 目标读取单一指令文件。 | Aider `CONVENTIONS.md`、Codex `AGENTS.md` |

策略决定实现形式：
- **Symlink**：`symlinkSync(source, target)` —— 处理相对 vs 绝对路径
- **Copy**：`cpSync(source, target, { recursive: true })` —— 处理覆盖
- **File-per-item**：`writeFileSync(target, transform(content))` —— 可能需要格式转换
- **Append-to-file**：将内容包裹在标记中以实现幂等的插入/替换/移除

**预期结果：** 选择策略并基于目标框架如何发现内容给出清晰的依据。

**失败处理：** 若不确定，查阅框架文档了解它如何发现配置或指令文件。如果框架读取任意目录，默认使用 symlink。

### 第 3 步：实现检测

检测告诉 CLI 项目中存在哪些框架：

```javascript
// In detector.js — each rule checks for a filesystem marker
const RULES = [
  {
    id: 'my-framework',
    displayName: 'My Framework',
    check: (dir) => existsSync(resolve(dir, '.myframework/')),
    marker: '.myframework/',
    scope: 'project',
  },
];
```

检测策略：
- **目录存在**：`.claude/`、`.cursor/`、`.gemini/`
- **配置文件**：`opencode.json`、`.aider.conf.yml`
- **指令文件**：`AGENTS.md`、`CONVENTIONS.md`
- **全局标记**：`~/.openclaw/`、`~/.hermes/`

始终在检测结果中返回标记，以便用户理解为何检测到该框架。

**预期结果：** 一条可靠识别框架且无误报的检测规则。

**失败处理：** 若框架没有唯一标记（通用目录名），使用标记组合或要求显式 `--framework` 指定。

### 第 4 步：实现幂等的 Install

```javascript
async install(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  // Idempotency: skip if already installed (unless force)
  if (existsSync(targetPath) && !options.force) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'created', path: targetPath, details: 'dry-run' };
  }

  // Ensure parent directory exists
  mkdirSync(targetDir, { recursive: true });

  // Strategy-specific installation
  if (this.constructor.strategy === 'symlink') {
    const relPath = relative(targetDir, item.sourceDir);
    symlinkSync(relPath, targetPath);
  } else if (this.constructor.strategy === 'copy') {
    cpSync(item.sourceDir, targetPath, { recursive: true });
  }

  return { action: 'created', path: targetPath };
}
```

幂等性规则：
- 若目标存在且未设置 `--force`，则**跳过**
- 若设置了 `--force` 则**覆盖**（先移除，再安装）
- **Dry-run** 始终成功，`action: 'created'`
- **返回值**必须始终为 `{ action, path, details? }`

**预期结果：** Install 在目标路径创建内容，若已存在则跳过，遵循 `--force` 和 `--dry-run`。

**失败处理：** 若 Windows/NTFS 上 symlink 创建失败，回退到目录联接或复制。记录回退。

### 第 5 步：实现 Uninstall 与清理

```javascript
async uninstall(item, projectDir, scope, options) {
  const targetDir = this.getTargetPath(projectDir, scope);
  const targetPath = resolve(targetDir, item.id);

  if (!existsSync(targetPath)) {
    return { action: 'skipped', path: targetPath };
  }

  if (options.dryRun) {
    return { action: 'removed', path: targetPath };
  }

  // Remove the installed content
  rmSync(targetPath, { recursive: true });

  return { action: 'removed', path: targetPath };
}
```

清理注意事项：
- 仅移除插件安装的内容 —— 切勿删除用户创建的文件
- 对于 append-to-file：移除标记的部分，而非整个文件
- 保留父目录完好（其他插件可能使用）

**预期结果：** Uninstall 仅移除插件的内容，不影响其他内容。

**失败处理：** 若移除失败（权限、文件锁定），返回错误结果而非抛出异常。

### 第 6 步：实现列出与审计

```javascript
async listInstalled(projectDir, scope) {
  const targetDir = this.getTargetPath(projectDir, scope);
  if (!existsSync(targetDir)) return [];

  const entries = readdirSync(targetDir);
  return entries.map(name => {
    const fullPath = resolve(targetDir, name);
    const broken = lstatSync(fullPath).isSymbolicLink()
      && !existsSync(fullPath);
    return { id: name, type: 'skill', broken };
  });
}

async audit(projectDir, scope) {
  const items = await this.listInstalled(projectDir, scope);
  const ok = items.filter(i => !i.broken);
  const broken = items.filter(i => i.broken);
  return {
    framework: this.constructor.displayName,
    ok: [`${ok.length} skills installed`],
    warnings: [],
    errors: broken.map(i => `Broken: ${i.id}`),
  };
}
```

**预期结果：** 列出返回所有已安装项及损坏链接检测。审计汇总健康状况。

**失败处理：** 若目标目录不存在，返回空结果（不是错误 —— 框架只是没有安装任何内容）。

### 第 7 步：注册插件

```javascript
// In adapters/index.js
import { MyFrameworkAdapter } from './my-framework.js';
register(MyFrameworkAdapter);
```

注册使适配器可用于：
- 自动检测（`detectFrameworks()` → `getAdaptersForDetections()`）
- 显式选择（`--framework my-framework`）
- 列出（`listAdapters()`）

**预期结果：** 适配器出现在 `tool detect` 输出中，可通过 `--framework` 定位。

**失败处理：** 若适配器未出现，验证 `static id` 与检测规则的 `id` 匹配，且已调用 `register()`。

### 第 8 步：编写测试

```javascript
describe('adapter: my-framework (dry-run)', () => {
  it('targets the correct path', () => {
    const out = run('install create-skill --framework my-framework --dry-run');
    assert.match(out, /\.myframework/i);
  });
});
```

至少测试：dry-run 路径、检测存在和内容类型支持。

**预期结果：** 适配器特定测试确认安装路径与行为。

**失败处理：** 若 CI 中未检测到框架（无标记目录），在测试中显式使用 `--framework`。

## 验证清单

- [ ] 插件正确扩展基类
- [ ] 设置静态字段（`id`、`displayName`、`strategy`、`contentTypes`）
- [ ] 检测规则识别框架且无误报
- [ ] `install()` 是幂等的（若存在则跳过，遵循 `--force`）
- [ ] `uninstall()` 仅移除插件创建的内容
- [ ] `listInstalled()` 检测损坏的符号链接
- [ ] `audit()` 准确报告健康状况
- [ ] 插件已注册并出现在 `tool detect` 中
- [ ] Dry-run 测试通过

## 常见问题

- **遗忘相对 vs 绝对符号链接**：项目作用域符号链接应为相对（可移植）。全局作用域符号链接应为绝对（不依赖 cwd）。
- **未处理缺失的父目录**：在创建内容前始终 `mkdirSync(dir, { recursive: true })`。
- **无标记的 append-to-file**：没有幂等标记（`<!-- start:id -->` / `<!-- end:id -->`），重复安装会复制内容。始终包裹追加内容。
- **检测误报**：通用目录名（如 `.config/`）可能匹配多个框架。在目录内使用特定文件标记。
- **遗忘 `supports()` 检查**：安装器在分发前调用 `supports(item.type)`。若 `contentTypes` 错误，适配器会静默跳过项。

## 相关技能

- `scaffold-cli-command` —— 构建使用此插件的 CLI 命令
- `test-cli-application` —— CLI 工具的测试模式，包括适配器测试
- `design-cli-output` —— 安装/卸载结果的终端输出
