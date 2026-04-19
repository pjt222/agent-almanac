---
name: render-icon-pipeline
locale: zh-CN
source_locale: en
source_commit: 640725b5
translator: claude
translation_date: "2026-03-18"
description: >
  运行 viz 流水线，从现有符号渲染图标。作为 viz 子项目的入口，涵盖调色板生成、
  数据构建、清单创建以及技能、代理和团队的图标渲染。始终使用 build.sh 作为流水线入口 ——
  切勿直接调用 Rscript。
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: visualization
  complexity: basic
  language: multi
  tags: visualization, rendering, pipeline, icons, glyphs, build
---

# 渲染图标流水线

端到端运行 viz 流水线，从现有符号渲染图标。涵盖调色板生成、数据构建、清单创建以及技能、代理和团队的图标渲染。

**标准入口点**：从项目根目录运行 `bash viz/build.sh [flags]`，或从 `viz/` 运行 `bash build.sh [flags]`。该脚本负责平台检测（WSL、Docker、原生）、R 二进制选择以及步骤顺序。切勿直接调用 `Rscript` 运行构建脚本 —— 该路径仅用于 MCP 服务器配置。

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

1. 确认 `viz/build.sh` 存在：
   ```bash
   ls -la viz/build.sh
   ```
2. 验证 Node.js 可用：
   ```bash
   node --version
   ```
3. 检查 `viz/config.yml` 是否存在（平台特定的 R 路径配置）：
   ```bash
   ls viz/config.yml
   ```

`build.sh` 会自动处理 R 二进制解析 —— 无需手动验证 R 路径。在 WSL 上使用 `/usr/local/bin/Rscript`（WSL 原生 R），在 Docker 上使用容器 R，在原生 Linux/macOS 上使用 PATH 中的 `Rscript`。

**预期结果：** `build.sh`、Node.js 和 `config.yml` 均存在。

**失败处理：** 如果 `config.yml` 缺失，流水线将回退到系统默认值。如果 Node.js 缺失，通过 nvm 安装。

### 步骤 2：运行流水线

`build.sh` 按顺序执行 5 个步骤：
1. 生成调色板颜色（R） → `palette-colors.json` + `colors-generated.js`
2. 构建数据（Node） → `skills.json`
3. 构建清单（Node） → `icon-manifest.json`、`agent-icon-manifest.json`、`team-icon-manifest.json`
4. 渲染图标（R） → `icons/` 和 `icons-hd/` WebP 文件
5. 生成终端符号（Node） → `cli/lib/glyph-data.json`

**完整流水线（所有类型、所有调色板、标准 + 高清）：**
```bash
bash viz/build.sh
```

**增量渲染（跳过磁盘上已存在的图标）：**
```bash
bash viz/build.sh --skip-existing
```

**单一领域（仅技能）：**
```bash
bash viz/build.sh --only design
```

**单一实体类型：**
```bash
bash viz/build.sh --type skill
bash viz/build.sh --type agent
bash viz/build.sh --type team
```

**试运行（预览但不渲染）：**
```bash
bash viz/build.sh --dry-run
```

**仅标准尺寸（跳过高清）：**
```bash
bash viz/build.sh --no-hd
```

`build.sh` 之后的所有标志都会透传给 `build-all-icons.R`。

**预期结果：** 图标渲染到 `viz/public/icons/<palette>/` 和 `viz/public/icons-hd/<palette>/`。

**失败处理：**
- **NTFS 上的 renv 卡住**：viz 的 `.Rprofile` 绕过 `renv/activate.R` 并直接设置 `.libPaths()`。确保从 `viz/` 运行（build.sh 通过 `cd "$(dirname "$0")"` 自动完成此操作）
- **缺失 R 包**：从 `build.sh` 选择的 R 环境中运行 `Rscript -e "install.packages(c('ggplot2', 'ggforce', 'ggfx', 'ragg', 'magick', 'future', 'furrr', 'digest'))"`
- **No glyph mapped**：实体需要符号函数 —— 在渲染前使用 `create-glyph` 技能

### 步骤 3：验证输出

确认渲染成功完成。

1. 检查文件数量是否符合预期：
   ```bash
   find viz/public/icons/cyberpunk -name "*.webp" | wc -l
   find viz/public/icons-hd/cyberpunk -name "*.webp" | wc -l
   ```
2. 检查文件大小是否合理（每个图标 2-80 KB）
3. 运行 `audit-icon-pipeline` 技能进行完整检查

**预期结果：** 文件数量与清单条目数匹配。文件大小在预期范围内。

**失败处理：** 如果数量不匹配，某些符号可能在渲染过程中出错。检查构建日志中的 `[ERROR]` 行。

## CLI 标志参考

所有标志都会通过 `build.sh` 透传给 `build-all-icons.R`：

| Flag | Default | 说明 |
|------|---------|------|
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

## build.sh 内部工作原理

仅供参考 —— 切勿手动运行这些步骤：

```
cd viz/
# 1. Platform detection: sets R_CONFIG_ACTIVE (wsl, docker, or unset)
# 2. R binary selection: WSL → /usr/local/bin/Rscript, Docker → same, native → Rscript
# 3. $RSCRIPT generate-palette-colors.R
# 4. node build-data.js
# 5. node build-icon-manifest.js --type all
# 6. $RSCRIPT build-all-icons.R "$@"  (flags passed through)
# 7. node build-terminal-glyphs.js
```

## Docker 替代方案

流水线也可以在 Docker 中运行：

```bash
cd viz
docker compose up --build
```

这将在隔离的 Linux 环境中运行完整的流水线，并在 8080 端口提供结果。

## 验证清单

- [ ] 已运行 `bash viz/build.sh`（而非裸 `Rscript`）
- [ ] 已生成调色板颜色（JSON + JS）
- [ ] 已从注册表构建数据文件
- [ ] 已从数据生成清单
- [ ] 已为目标类型和调色板渲染图标
- [ ] 文件数量符合预期
- [ ] 文件大小在预期范围内（2-80 KB）

## 常见陷阱

- **直接调用 Rscript**：切勿手动运行 `Rscript build-icons.R` 或 `Rscript generate-palette-colors.R`。始终使用 `bash build.sh [flags]`。直接的 Rscript 调用会绕过平台检测，并可能使用错误的 R 二进制（通过 `~/bin/Rscript` 包装器使用 Windows R，而不是 `/usr/local/bin/Rscript` 下的 WSL 原生 R）。注意：CLAUDE.md 和指南中的 Windows R 路径**仅用于 MCP 服务器配置**，不适用于构建脚本。
- **错误的工作目录**：`build.sh` 会自动切换到自己的目录（`cd "$(dirname "$0")"`），因此可以从任何位置调用：从项目根目录运行 `bash viz/build.sh` 也能正确工作。
- **清单过时**：`build.sh` 按顺序运行步骤 1-5，因此清单在渲染前始终会重新生成。如果只需要清单而不渲染，使用 `node viz/build-data.js && node viz/build-icon-manifest.js`（Node 步骤不需要 R）。
- **renv 未激活**：`.Rprofile` 变通方案需要从 `viz/` 运行 —— `build.sh` 会处理这一点。使用 `--vanilla` 标志或从其他目录运行 R 会跳过它。
- **Windows 上的并行处理**：Windows 不支持基于 fork 的并行 —— 流水线通过 `config.yml` 自动选择 `multisession`。

## 相关技能

- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — 在渲染前检测缺失的符号和图标
- [create-glyph](../create-glyph/SKILL.md) — 为缺失图标的实体创建新的符号函数
- [enhance-glyph](../enhance-glyph/SKILL.md) — 在重新渲染前改善现有符号
