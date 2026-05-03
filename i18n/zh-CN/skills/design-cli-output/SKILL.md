---
name: design-cli-output
description: >
  使用 chalk 颜色、Unicode 图形符号、多个详细级别（human、verbose、quiet、JSON）
  和一致的语调规则为 CLI 工具设计终端输出。涵盖配色板选择、状态指示器设计、
  reporter 函数架构、ceremony/叙事输出变体，以及跨终端兼容性。当构建新的
  CLI reporter 模块、向现有工具添加温暖叙事输出、跨多个命令标准化输出，
  或设计与人类可读文本并行的机器可读 JSON 时使用。
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
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 设计 CLI 输出

为命令行工具设计一致的、多级别的终端输出。

## 适用场景

- 为 CLI 工具构建新的 reporter 模块
- 在标准事务性输出旁添加温暖或叙事输出
- 跨多个命令标准化输出格式
- 设计与人类可读输出并行的 JSON 机器输出
- 为新的终端工具选择颜色、图形符号和详细级别

## 输入

- **必需**：CLI 工具名称和主要受众（开发者、运维、终端用户）
- **必需**：需要输出格式化的命令
- **可选**：是否需要"ceremony"或叙事输出变体
- **可选**：品牌约束（配色板、语调）

## 步骤

### 第 1 步：定义配色板

使用 chalk 创建命名的配色板对象：

**标准配色板**（事务性输出）：

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

**温暖配色板**（ceremony/叙事输出）：

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

配色板设计规则：
- 始终提供无颜色后备（上面的 Proxy 模式）
- 自定义配色板使用十六进制颜色（`chalk.hex('#FF6B35')`）
- 无论配色板主题如何，fail/error 颜色保持红色
- 按语义角色而非视觉外观命名配色板条目

**预期结果：** 一个带有命名条目和无颜色后备的配色板对象。

**失败处理：** 若 chalk 不可用（管道输出、CI），Proxy 后备会原样返回字符串。使用 `NO_COLOR=1` 环境变量进行测试。

### 第 2 步：选择状态指示器

为状态通信选择 Unicode 图形符号或 ASCII 字符：

**ASCII（最大兼容性）：**

```
+  created/installed (green)
-  removed/deleted (red)
=  skipped/unchanged (dim)
!  error/warning (red)
```

**Unicode（更丰富，需要 UTF-8 终端）：**

```
✦  item/skill/practice (spark)
◉  active/burning state
◎  cooling/embers state
○  cold/dormant state
◌  available/not installed
✗  failed item
✓  success (use sparingly — not all terminals render it well)
```

选择标准：
- ASCII 用于在 CI 或管道上下文中运行的工具
- Unicode 用于面向交互式终端用户的工具
- 通过 `--ascii` 标志或 `NO_COLOR` 检测同时提供两者
- 在以下环境中测试图形符号：macOS Terminal、Windows Terminal、VS Code 终端、SSH 会话

**预期结果：** 一组无需仅依赖颜色就能一目了然传达状态的图形符号。

**失败处理：** 若图形符号在测试中渲染为 `?` 或方框，替换为 ASCII 等价物。`+/-/=/!` 集到处都能用。

### 第 3 步：设计详细级别

每个命令应支持四个输出级别：

| 级别 | 标志 | 受众 | 内容 |
|-------|------|----------|---------|
| **默认** | （无） | 终端前的人 | 格式化、有颜色、信息丰富 |
| **详细** | `--verbose` 或 `--ceremonial` | 想要细节的人 | 逐项分解、到达序列 |
| **安静** | `--quiet` | 脚本、CI | 最少行数、状态图标、无装饰 |
| **JSON** | `--json` | 机器消费者 | 结构化、可解析、完整 |

实现模式：

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

JSON 输出规则：
- 始终是有效的 JSON（不与人类文本混合）
- 包含人类输出显示的所有数据，加上对机器有用的字段
- 跨命令使用一致的键命名
- 退出码 0 表示成功、1 表示错误（无论输出模式如何）

**预期结果：** 四个清晰的输出级别，跨命令行为一致。

**失败处理：** 若 verbose 模式过于嘈杂，使其需主动选择（`--ceremonial`）而非分级的详细级别。

### 第 4 步：建立语调规则

定义所有输出函数遵循的语调和风格。这可以防止跨命令不一致。

示例语调规则（来自 campfire reporter）：

1. **现在时、主动语态**："mystic arrives" 而非 "mystic has been installed"
2. **不用感叹号**：安静的自信。工具不会大喊大叫。
3. **隐喻取代行话**："practices" 而非 "dependencies"（仅用于 ceremony 模式）
4. **失败诚实，不灾难化**："A spark was lost" 而非 "ERROR: installation failed with exit code 1"
5. **结尾行反映状态**：每个操作以状态摘要结束
6. **不用表情符号**：Unicode 图形符号承载视觉重量而不显装饰
7. **每个词都承载信息**：若一个词不增加理解，删除它

标准（非 ceremony）输出的语调规则：
- 简洁、事实性的行
- 状态图标 + 项 ID + 上下文
- 带计数的摘要行
- 错误消息建议纠正行动

**预期结果：** 一组书面的 3-7 条语调规则，输出函数必须遵守。

**失败处理：** 若规则感觉武断，测试它们：在使用与不使用每条规则的情况下编写相同输出。若移除规则不改变输出质量，规则不需要。

### 第 5 步：实现 Reporter 函数

将输出组织到 reporter 模块中，每个函数职责清晰：

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

每个函数遵循相同结构：
1. 优雅地处理空/null 输入
2. 计算布局（列宽、填充）
3. 用配色板颜色输出
4. 底部摘要行

对于 ceremony 输出，创建单独模块：

```javascript
// campfire-reporter.js — warm narrative output
export function printArrival({ teamId, agents, results, ceremonial }) { ... }
export function printScatter({ teamId, agents, results }) { ... }
export function printTend(fires) { ... }
export function printCampfireList({ teams, state, reg }) { ... }
export function printFireSummary({ team, fireData, reg }) { ... }
export function printJson(data) { ... }
```

**预期结果：** 可独立使用的 reporter 函数 —— 每个处理自己的格式化，不依赖调用者状态。

**失败处理：** 若函数超过约 50 行，提取辅助函数。reporter 函数应能独立审查。

### 第 6 步：在不同环境中测试输出

验证输出在不同上下文中正确渲染：

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

检查：
- 颜色在交互模式下正确显示
- ANSI 转义码不泄漏到管道/重定向输出
- JSON 有效（管道到 `jq .` 验证）
- Unicode 图形符号在目标终端中渲染
- 列对齐在不同内容宽度下保持

**预期结果：** 输出在所有五种上下文中都正确。

**失败处理：** 若 ANSI 码泄漏，确保 chalk 尊重 `NO_COLOR`。若 Unicode 损坏，提供 ASCII 后备模式。

## 验证清单

- [ ] 配色板有无颜色后备
- [ ] 状态指示器在颜色和无颜色模式下都工作
- [ ] 所有四个详细级别产出有用输出
- [ ] JSON 输出有效且可被 `jq` 解析
- [ ] 语调规则有文档并被一致遵循
- [ ] reporter 函数优雅地处理空/null 输入
- [ ] 在以下环境测试输出：终端、管道、NO_COLOR、CI

## 常见问题

- **将人类文本与 JSON 混合**：在 `--json` 模式下，仅输出有效 JSON。一行散漫的文本（如 "DRY RUN"）会破坏 JSON 解析器。若命令必须显示两者，清晰分离或在 JSON 模式下抑制人类文本。
- **硬编码列宽**：内容长度不同。使用 `Math.max(...items.map(i => i.id.length))` 动态计算填充。
- **无意义的颜色**：若颜色是区分成功与失败的唯一方式，色盲用户和管道输出会丢失信息。始终将颜色与文本指示器配对（`+`、`OK`、`ERR`）。
- **错误上下文中的 ceremony**：温暖叙事输出适合交互式终端会话。在 CI、脚本或 `--quiet` 模式下，它增加噪声。将 ceremony 输出放在显式标志后。
- **遗忘摘要行**：用户先扫描最后一行。每个操作应以一行摘要结束（成功/失败/跳过的计数）。

## 相关技能

- `scaffold-cli-command` —— 使用此输出的命令
- `test-cli-application` —— 测试输出与预期匹配
- `build-cli-plugin` —— 插件通过此输出系统报告结果
