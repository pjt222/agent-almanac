---
name: install-almanac-content
description: >
  使用 CLI 将 agent-almanac 中的技能、代理和团队安装到任何受支持的代理
  框架中。涵盖框架检测、内容搜索、带依赖解析的安装、健康审计和基于
  manifest 的同步。在设置带代理能力的新项目、安装特定技能或整个领域、
  同时针对多个框架，或维护已安装内容的声明性 manifest 时使用。
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 安装 Almanac 内容

使用 `agent-almanac` CLI 将技能、代理和团队安装到任何受支持的代理框架中。

## 适用场景

- 设置新项目并需要安装代理技能、代理或团队
- 从特定领域安装所有技能（如 `r-packages`、`devops`）
- 同时针对多个框架（Claude Code、Cursor、Copilot 等）
- 为可复现设置创建或同步声明性 `agent-almanac.yml` manifest
- 审计已安装内容是否有损坏的符号链接或过时引用

## 输入

- **必需**：要安装的内容 —— 一个或多个技能、代理或团队 ID（如 `create-skill`、`r-developer`、`r-package-review`）
- **可选**：`--domain <domain>` —— 安装领域中所有技能而非命名个别 ID
- **可选**：`--framework <id>` —— 针对特定框架（默认：自动检测全部）
- **可选**：`--with-deps` —— 同时安装代理技能和团队代理+技能
- **可选**：`--dry-run` —— 预览变更而不写入磁盘
- **可选**：`--global` —— 安装到全局作用域而非项目作用域
- **可选**：`--force` —— 覆盖现有内容
- **可选**：`--source <path>` —— 指向 agent-almanac 根的显式路径（默认：自动检测）

## 步骤

### 第 1 步：检测框架

运行框架检测以查看当前项目中存在哪些代理工具：

```bash
agent-almanac detect
```

这会扫描工作目录中的配置文件和目录（`.claude/`、`.cursor/`、`.github/copilot-instructions/`、`.agents/` 等）并报告哪些框架活跃。

**预期结果：** 输出列出一个或多个检测到的框架及其适配器状态。若未检测到框架，使用通用适配器（`.agents/skills/`）作为后备。

**失败处理：** 若未找到 CLI，确保已安装并在 PATH 上。若检测无结果但您知道存在框架，使用 `--framework <id>` 显式指定。运行 `agent-almanac list --domains` 验证 CLI 能到达注册表。

### 第 2 步：搜索内容

按关键字查找技能、代理或团队：

```bash
agent-almanac search <keyword>
```

按类别浏览：

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

**预期结果：** 搜索结果或过滤列表显示匹配的内容及其 ID 和描述。

**失败处理：** 若无结果出现，尝试更广关键字。验证 almanac 根可达：`agent-almanac list` 应显示完整技能计数。若无法找到根，传递 `--source /path/to/agent-almanac`。

### 第 3 步：安装内容

按名称安装一个或多个项：

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

CLI 从注册表解析内容、为每个检测到的框架选择适当的适配器，并将文件写入框架特定路径（如 Claude Code 的 `.claude/skills/`、Cursor 的 `.cursor/rules/`）。

**预期结果：** 输出确认安装的项数和目标框架。已安装内容出现在正确的框架目录。

**失败处理：** 若未找到项，验证 ID 与注册表中的 `name` 字段匹配（`skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml`）。若文件已存在且安装被跳过，使用 `--force` 覆盖。

### 第 4 步：验证安装

对所有已安装内容运行健康检查：

```bash
agent-almanac audit
```

审计特定框架或作用域：

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

查看当前已安装：

```bash
agent-almanac list --installed
```

**预期结果：** 审计将所有已安装项报告为健康，无损坏引用。`--installed` 列出每项及其类型和框架。

**失败处理：** 若审计报告损坏项，用 `--force` 重新安装。若符号链接损坏，验证 almanac 源路径未移动。运行 `agent-almanac install <broken-id> --force` 修复。

### 第 5 步：用 Manifest 管理（可选）

为可复现设置，使用声明性 `agent-almanac.yml` manifest：

```bash
# Generate a starter manifest
agent-almanac init
```

这在当前目录创建 `agent-almanac.yml`，含检测到的框架和占位内容列表。编辑文件以声明所需技能、代理和团队：

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

然后安装 manifest 中声明的所有内容：

```bash
agent-almanac install
```

将已安装状态与 manifest 协调（安装缺失的、移除多余的）：

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**预期结果：** 无参数运行 `install` 读取 manifest 并安装所有声明的内容。运行 `sync` 使已安装状态与 manifest 对齐，添加缺失项并移除未声明项。

**失败处理：** 若 `sync` 报告 "No agent-almanac.yml found"，先运行 `agent-almanac init`。若 manifest 解析为 0 项，检查技能/代理/团队 ID 与注册表条目完全匹配。以 `#` 开头的注释行被忽略。

### 第 6 步：将团队作为 Campfire 管理（可选）

campfire 命令为 `install --team` 提供温暖、面向团队的替代：

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

Campfire 状态在 `.agent-almanac/state.json` 中跟踪（被 git 忽略，项目本地）。Fire 有热状态：**burning**（7 天内使用）、**embers**（30 天内）、**cold**（30+ 天）。运行 `tend` 温暖所有 fire 并报告其健康。

scatter 期间共享技能受保护 —— 若另一个聚集的 fire 需要技能，它仍保持安装。共享代理在 fire 间走动而非被复制。

所有 campfire 命令支持 `--quiet`（标准 reporter 输出）和 `--json`（机器可解析）用于脚本。

**预期结果：** 团队被聚集和管理，状态被跟踪。`campfire --all` 显示 fire 状态。`tend` 报告健康。

**失败处理：** 若 campfire 状态损坏，删除 `.agent-almanac/state.json` 并重新聚集团队。若 `gather` 失败，检查团队名是否与 `teams/_registry.yml` 中的条目匹配。

## 验证清单

- [ ] `agent-almanac detect` 显示预期框架
- [ ] `agent-almanac list --installed` 显示所有预期内容
- [ ] `agent-almanac audit` 报告无损坏项
- [ ] 已安装技能在目标框架中解析（如 Claude Code 中 `/skill-name` 工作）
- [ ] 若使用 manifest，`agent-almanac sync --dry-run` 报告无需变更

## 常见问题

- **代理和团队遗忘 `--with-deps`**：不带 `--with-deps` 安装代理只安装代理定义，不安装其引用的技能。代理将存在但无法遵循其技能步骤。除非已单独安装依赖，否则始终对代理和团队使用 `--with-deps`。
- **Manifest 漂移**：手动安装或移除内容后，manifest 与实际已安装状态失去同步。定期运行 `agent-almanac sync`，或始终通过 manifest 安装以保持对齐。
- **作用域混淆（项目 vs 全局）**：用 `--global` 安装的内容进入 `~/.claude/skills/`（或等价物），而项目作用域内容进入当前目录的 `.claude/skills/`。若未找到技能，检查是否安装到错误作用域。
- **过时源路径**：若 agent-almanac 仓库被移动或重命名，manifest 中的 `--source` 路径和自动检测会损坏。更新 `agent-almanac.yml` 中的 `source` 字段或重新运行 `agent-almanac init`。
- **未检测到框架**：检测器查找特定文件和目录。新初始化的项目可能尚无这些。在项目有预期结构前显式使用 `--framework <id>`，或依赖通用适配器。
- **Campfire 热状态混淆**：Fire 在 30 天未使用后变冷。运行 `agent-almanac tend` 重置所有聚集 fire 的计时器。若 fire 显示为 "cold"，它仍完全安装 —— 热状态反映使用近期性，而非安装健康。

## 相关技能

- `create-skill` —— 在安装前撰写要添加到 almanac 的新技能
- `configure-mcp-server` —— 设置代理在安装后可能需要的 MCP 服务器
- `write-claude-md` —— 配置 CLAUDE.md 引用已安装技能
- `audit-discovery-symlinks` —— 诊断 Claude Code 技能发现的符号链接问题
- `design-cli-output` —— CLI 的 reporter 和 campfire ceremony 使用的终端输出模式
