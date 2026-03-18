---
name: render-icon-pipeline
locale: zh-CN
source_locale: en
source_commit: 41c6956b
translator: claude
translation_date: "2026-03-18"
description: >
  运行 viz 流水线，从现有符号渲染图标。作为 viz 子项目的入口，涵盖调色板生成、
  数据构建、清单创建以及技能、代理和团队的图标渲染。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# 渲染图标流水线

端到端运行 viz 流水线，从现有符号渲染图标。涵盖调色板生成、数据构建、清单创建以及技能、代理和团队的图标渲染。

## 适用场景

- 创建或修改符号函数后
- 将新的技能、代理或团队添加到注册表后
- 图标需要为新的或更新的调色板重新渲染时
- 需要完整的流水线重建（例如基础设施变更后）
- 首次搭建 viz 环境时

## 输入

- **可选**：实体类型 — `skill`、`agent`、`team` 或 `all`（默认：`all`）
- **可选**：调色板 — 具体调色板名称或 `all`（默认：`all`）
- **可选**：领域过滤 — 用于技能图标的特定领域（例如 `git`、`design`）
- **可选**：渲染模式 — `full`、`incremental` 或 `dry-run`（默认：`incremental`）

## 流程

### 步骤 1：验证前置条件

确保环境已准备好进行渲染。

1. 确认工作目录为 `viz/`（或导航到该目录）：
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   ```
2. 验证 R 包可用：
   ```bash
   Rscript -e "requireNamespace('ggplot2'); requireNamespace('ggforce'); requireNamespace('ggfx'); requireNamespace('ragg'); requireNamespace('magick')"
   ```
3. 验证 Node.js 可用：
   ```bash
   node --version
   ```
4. 检查 `config.yml` 是否存在（操作系统感知的 R 路径选择）

**预期结果：** 所有前置条件无错误通过。

**失败时：** 使用 `install.packages()` 安装缺失的 R 包。如果 Node.js 缺失，通过 nvm 安装。如果 `config.yml` 缺失，流水线将回退到系统默认值。

### 步骤 2：生成调色板颜色

从 R 调色板定义生成 JSON 和 JS 调色板数据。

```bash
Rscript generate-palette-colors.R
```

**预期结果：** `viz/public/data/palette-colors.json` 和 `viz/js/palette-colors.js` 已更新。

**失败时：** 检查 `viz/R/palettes.R` 是否为有效的 R 代码。常见问题：新领域颜色条目中的语法错误。

### 步骤 3：构建数据

从注册表生成技能/代理/团队数据文件。

```bash
node build-data.js
```

**预期结果：** `viz/public/data/skills.json` 已使用当前注册表数据更新。

**失败时：** 验证 `skills/_registry.yml`、`agents/_registry.yml`、`teams/_registry.yml` 是否为有效的 YAML。

### 步骤 4：构建清单

从数据文件生成图标清单。

```bash
node build-icon-manifest.js
```

**预期结果：** 三个清单文件已更新：
- `viz/public/data/icon-manifest.json`
- `viz/public/data/agent-icon-manifest.json`
- `viz/public/data/team-icon-manifest.json`

**失败时：** 如果清单已过时，删除后重新运行。检查是否已先运行 `build-data.js`。

### 步骤 5：渲染图标

使用适当的标志运行图标渲染器。

**完整流水线（所有类型、所有调色板、标准 + 高清）：**
```bash
Rscript build-all-icons.R
```

**增量渲染（跳过未更改的符号）：**
```bash
Rscript build-all-icons.R --skip-existing
```

**单一实体类型：**
```bash
Rscript build-all-icons.R --type skill
Rscript build-all-icons.R --type agent
Rscript build-all-icons.R --type team
```

**单一领域（仅技能）：**
```bash
Rscript build-icons.R --only design
```

**单一代理或团队：**
```bash
Rscript build-agent-icons.R --only mystic
Rscript build-team-icons.R --only r-package-review
```

**试运行（预览但不渲染）：**
```bash
Rscript build-all-icons.R --dry-run
```

**仅标准尺寸（跳过高清）：**
```bash
Rscript build-all-icons.R --no-hd
```

**命令行参考：**

| 标志 | 默认值 | 说明 |
|------|--------|------|
| `--type <types>` | `all` | 逗号分隔：skill, agent, team |
| `--palette <name>` | `all` | 单个调色板或 `all`（9 个调色板） |
| `--only <filter>` | 无 | 领域（技能）或实体 ID（代理/团队） |
| `--skip-existing` | 关闭 | 跳过已有 WebP 文件的图标 |
| `--dry-run` | 关闭 | 列出将要生成的内容 |
| `--size <n>` | `512` | 输出尺寸（像素） |
| `--glow-sigma <n>` | `4` | 发光模糊半径 |
| `--workers <n>` | 自动 | 并行工作进程数（detectCores()-1） |
| `--no-cache` | 关闭 | 忽略内容哈希缓存 |
| `--hd` | 开启 | 启用高清变体（1024px） |
| `--no-hd` | 关闭 | 跳过高清变体 |
| `--strict` | 关闭 | 遇到首个子脚本失败时退出 |

**预期结果：** 图标渲染到 `viz/public/icons/<palette>/` 和 `viz/public/icons-hd/<palette>/`。

**失败时：**
- **renv 卡住**：从 `viz/` 目录运行，使 `.Rprofile` 激活库路径变通方案
- **缺失包**：`install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick", "future", "furrr", "digest"))`
- **退出码 5**：通常意味着某个符号函数出错 — 检查日志中的具体技能/代理/团队 ID
- **No glyph mapped**：实体需要符号函数 — 使用 `create-glyph` 技能

### 步骤 6：验证输出

确认渲染成功完成。

1. 检查文件数量是否符合预期：
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 检查文件大小是否合理（每个图标 2-80 KB）
3. 验证清单是否为最新（运行 `audit-icon-pipeline` 进行完整检查）

**预期结果：** 文件数量与清单条目数匹配。文件大小在预期范围内。

**失败时：** 如果数量不匹配，某些符号可能在渲染过程中出错。检查构建日志中的 `[ERROR]` 行。

## Docker 替代方案

流水线也可以在 Docker 中运行：

```bash
cd viz
docker compose up --build
```

这将在隔离的 Linux 环境中运行完整的流水线，并在 8080 端口提供结果。

## 验证清单

- [ ] 工作目录为 `viz/`
- [ ] 已生成调色板颜色（JSON + JS）
- [ ] 已从注册表构建数据文件
- [ ] 已从数据生成清单
- [ ] 已为目标类型和调色板渲染图标
- [ ] 文件数量符合预期
- [ ] 文件大小在预期范围内（2-80 KB）

## 常见陷阱

- **工作目录错误**：R 脚本期望从 `viz/` 运行，或需要找到相对于项目根目录的 `viz/R/utils.R`
- **renv 未激活**：`.Rprofile` 变通方案需要从 `viz/` 运行 — 使用 `--vanilla` 标志或从其他目录运行会跳过它
- **清单过时**：在注册表更改后，始终先运行步骤 2-4（调色板 -> 数据 -> 清单），再执行步骤 5（渲染）
- **Windows 上的并行处理**：Windows 不支持基于 fork 的并行 — 流水线通过 `config.yml` 自动选择 `multisession`

## 相关技能

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 在渲染前检测缺失的符号和图标
- [create-glyph](../create-glyph/SKILL.md) — 为缺失图标的实体创建新的符号函数
- [enhance-glyph](../enhance-glyph/SKILL.md) — 在重新渲染前改善现有符号
