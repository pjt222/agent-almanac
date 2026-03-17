---
name: configure-putior-mcp
description: >
  配置 putior MCP 服务器以向 AI 助手暴露 16 个工作流可视化工具。涵盖 Claude Code
  和 Claude Desktop 设置、依赖安装（mcptools、ellmer）、工具验证和可选的 ACP
  服务器配置用于代理间通信。适用于使 AI 助手能够交互式地注释和可视化工作流、
  设置带有 putior MCP 集成的新开发环境，或配置代理间通信的 ACP 用于自动化流水线。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: R
  tags: putior, mcp, acp, ai-assistant, claude, tools, integration
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 配置 putior MCP 服务器

设置 putior MCP 服务器，使 AI 助手（Claude Code、Claude Desktop）可以直接调用工作流注释和图表生成工具。

## 适用场景

- 使 AI 助手能够交互式地注释和可视化工作流
- 设置带有 putior MCP 集成的新开发环境
- 安装 putior 后希望获得 AI 辅助的工作流文档
- 配置代理间通信的 ACP 用于自动化流水线

## 输入

- **必需**：putior 已安装（参见 `install-putior`）
- **必需**：目标客户端：Claude Code、Claude Desktop 或两者
- **可选**：是否同时配置 ACP 服务器（默认：否）
- **可选**：ACP 服务器的自定义主机/端口（默认：localhost:8080）

## 步骤

### 第 1 步：安装 MCP 依赖

安装 MCP 服务器功能所需的包。

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**预期结果：** 两个包安装和加载无错误。

**失败处理：** `mcptools` 需要 `remotes` 包。先安装它：`install.packages("remotes")`。如果 GitHub 速率限制，在 `~/.Renviron` 中配置 `GITHUB_PAT`（添加行 `GITHUB_PAT=your_token_here` 并重启 R）。**不要**将令牌粘贴到 shell 命令中或提交到版本控制。

### 第 2 步：配置 Claude Code（WSL/Linux/macOS）

将 putior MCP 服务器添加到 Claude Code 的配置中。

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

对于使用 Windows R 的 WSL：
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

验证配置：
```bash
claude mcp list
claude mcp get putior
```

**预期结果：** `putior` 出现在 MCP 服务器列表中，状态为"configured"。

**失败处理：** 如果找不到 Claude Code 命令，将其添加到 PATH：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。如果 Rscript 路径错误，使用 `which Rscript` 或 `ls "/mnt/c/Program Files/R/"` 定位 R。

### 第 3 步：配置 Claude Desktop（Windows）

将 putior 添加到 Claude Desktop 的 MCP 配置文件中。

编辑 `%APPDATA%\Claude\claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

或使用完整路径：
```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\Program Files\\R\\R-4.5.2\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

编辑配置文件后重启 Claude Desktop。

**预期结果：** Claude Desktop 在其 MCP 服务器列表中显示 putior。工具在对话中可用。

**失败处理：** 使用 JSON 检查器验证 JSON 语法。检查 R 路径是否存在。如果路径中的空格导致问题，使用 8.3 短名称（`PROGRA~1`、`R-45~1.0`）。

### 第 4 步：验证所有 16 个工具

测试所有 MCP 工具是否可访问和正常运行。

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

按类别组织的 16 个工具：

**核心工作流（5 个）：**
- `put` — 扫描文件中的 PUT 注释（支持 `exclude` 参数用于基于正则的文件过滤）
- `put_diagram` — 生成 Mermaid 图表
- `put_auto` — 从代码自动检测工作流（支持 `exclude` 参数）
- `put_generate` — 生成注释建议（支持 `exclude` 参数）
- `put_merge` — 合并手动 + 自动注释（支持 `exclude` 参数）

**参考/发现（7 个）：**
- `get_comment_prefix` — 获取扩展名的注释前缀
- `get_supported_extensions` — 列出支持的扩展名
- `list_supported_languages` — 列出支持的语言
- `get_detection_patterns` — 获取自动检测模式
- `get_diagram_themes` — 列出可用主题
- `putior_skills` — AI 助手文档
- `putior_help` — 快速参考帮助

**实用工具（3 个）：**
- `is_valid_put_annotation` — 验证注释语法
- `split_file_list` — 解析文件列表
- `ext_to_language` — 扩展名到语言名称

**配置（1 个）：**
- `set_putior_log_level` — 配置日志详细程度

从 Claude Code 测试核心工具：
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**预期结果：** 所有 16 个工具已列出。核心工具在使用有效输入调用时返回预期结果。

**失败处理：** 如果工具缺失，检查 putior 版本是否为最新：`packageVersion("putior")`。较旧版本可能有较少的工具。使用 `remotes::install_github("pjt222/putior")` 更新。

### 第 5 步：配置 ACP 服务器（可选）

设置 ACP（代理通信协议）服务器用于代理间通信。

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

测试 ACP 端点：
```bash
# Discover agent
curl http://localhost:8080/agents

# Execute a scan
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "scan ./R/"}]}]}'

# Generate diagram
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "generate diagram for ./R/"}]}]}'
```

**预期结果：** ACP 服务器在配置的端口上启动。`/agents` 返回 putior 代理清单。`/runs` 接受自然语言请求并返回工作流结果。

**失败处理：** 如果端口 8080 被占用，指定不同的端口。如果 `plumber2` 未安装，服务器函数将打印建议安装的有用错误消息。

## 验证清单

- [ ] `putior::putior_mcp_tools()` 暴露核心工具（`put`、`put_diagram`、`put_auto`、`put_generate`、`put_merge`）并返回当前版本的约 16 个工具
- [ ] Claude Code：`claude mcp list` 显示 `putior` 已配置
- [ ] Claude Code：`putior_help` 工具在调用时返回帮助文本
- [ ] Claude Desktop：重启后 putior 出现在 MCP 服务器列表中
- [ ] 核心工具（`put`、`put_diagram`、`put_auto`）执行无错误
- [ ] （可选）ACP 服务器响应 `curl http://localhost:8080/agents`

## 常见问题

- **mcptools 未安装**：MCP 服务器需要 `mcptools`（来自 GitHub）和 `ellmer`（来自 CRAN）。两者都必须安装。putior 会检查并提供有用的缺失消息
- **Claude Desktop 中 R 路径错误**：Windows 路径在 JSON 中需要转义（`\\`）。使用 8.3 短名称避免空格：`C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`
- **忘记重启**：编辑配置文件后必须重启 Claude Desktop。Claude Code 在下一次会话启动时获取更改
- **renv 隔离**：如果 putior 安装在 renv 库中但 Claude Code/Desktop 在没有 renv 的情况下启动 R，则找不到包。确保 `mcptools` 和 `ellmer` 安装在全局库中，或在 MCP 服务器命令中配置 renv 激活
- **ACP 端口冲突**：默认 ACP 端口（8080）常被使用。启动前使用 `lsof -i :8080` 或 `netstat -tlnp | grep 8080` 检查
- **仅包含特定工具**：要暴露工具子集，在构建自定义 MCP 服务器包装器时使用 `putior_mcp_tools(include = c("put", "put_diagram"))`
- **通过 MCP 使用自定义调色板**：`put_diagram` 的 `palette` 参数需要 `putior_theme` R 对象（由 `put_theme()` 创建），无法通过 MCP 的 JSON 接口序列化。MCP 调用请使用内置的 `theme` 参数字符串。自定义调色板请直接使用 R

## 相关技能

- `install-putior` — 前提条件：putior 和可选依赖必须已安装
- `configure-mcp-server` — Claude Code/Desktop 的通用 MCP 服务器配置
- `troubleshoot-mcp-connection` — 如果工具未出现则诊断连接问题
- `build-custom-mcp-server` — 构建包装 putior 工具的自定义 MCP 服务器
- `analyze-codebase-workflow` — 交互式使用 MCP 工具进行代码库分析
