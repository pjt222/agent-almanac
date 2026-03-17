---
name: configure-mcp-server
description: >
  为 Claude Code 和 Claude Desktop 配置 MCP（Model Context Protocol）
  服务器。涵盖 mcptools 设置、Hugging Face 集成、WSL 路径处理和多客户端
  配置。适用于设置 Claude Code 通过 mcptools 连接 R、为 Claude Desktop
  配置 MCP 服务器、添加 Hugging Face 或其他远程 MCP 服务器，或排查
  客户端与服务器之间的 MCP 连接问题。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, claude-code, claude-desktop, mcptools, configuration
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 配置 MCP 服务器

为 Claude Code（WSL）和 Claude Desktop（Windows）设置 MCP 服务器连接。

## 适用场景

- 设置 Claude Code 通过 mcptools 连接 R
- 为 Claude Desktop 配置 MCP 服务器
- 添加 Hugging Face 或其他远程 MCP 服务器
- 排查工具之间的 MCP 连接问题

## 输入

- **必需**：MCP 服务器类型（mcptools、Hugging Face、自定义）
- **必需**：客户端（Claude Code、Claude Desktop 或两者）
- **可选**：认证令牌
- **可选**：自定义服务器实现

## 步骤

### 第 1 步：安装 MCP 服务器包

**R（mcptools）**：

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Hugging Face**：

```bash
npm install -g mcp-remote
```

**预期结果：** `mcptools` 从 GitHub 安装并在 R 中无错误加载。`mcp-remote` 可通过 `which mcp-remote` 或 `npm list -g mcp-remote` 全局访问。

**失败处理：** 对于 `mcptools`，确保先安装 `remotes`。如果 GitHub 限制安装速率，在 `~/.Renviron` 中设置 `GITHUB_PAT`。对于 `mcp-remote`，验证 Node.js 和 npm 已安装并在 PATH 中。

### 第 2 步：配置 Claude Code（WSL）

**R mcptools 服务器**：

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Face 服务器**：

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**验证配置**：

```bash
claude mcp list
claude mcp get r-mcptools
```

**预期结果：** `claude mcp list` 显示 `r-mcptools` 和 `hf-mcp-server`（或已添加的服务器）。`claude mcp get r-mcptools` 显示正确的命令和参数。

**失败处理：** 如果服务器未出现在列表中，验证 `~/.claude.json` 包含正确的条目。如果找不到 `claude` 命令，添加到 PATH：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。

### 第 3 步：配置 Claude Desktop（Windows）

编辑 `%APPDATA%\Claude\claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "r-mcptools": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"]
    },
    "hf-mcp-server": {
      "command": "mcp-remote",
      "args": ["https://huggingface.co/mcp"],
      "env": {
        "HF_TOKEN": "your_token_here"
      }
    }
  }
}
```

**重要**：对包含空格的 Windows 目录使用 8.3 短路径（`PROGRA~1` 而非 `Program Files`）。使用环境变量传递令牌，不要用 `--header` 参数。

**预期结果：** `%APPDATA%\Claude\claude_desktop_config.json` 中的 JSON 配置文件有效，包含正确的服务器条目。Claude Desktop 重启后显示 MCP 服务器指示器。

**失败处理：** 使用 linter 验证 JSON（如 `jq . < config.json`）。如果 Windows 路径空格导致解析错误，使用 8.3 短路径（`PROGRA~1`）。确保 Claude Desktop 完全重启（不仅是最小化）。

### 第 4 步：为 MCP 配置 R 会话

在项目 `.Rprofile` 中添加：

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

这会在 RStudio 中打开项目时自动启动 MCP 会话。

**预期结果：** `.Rprofile` 文件在 RStudio 中打开项目时条件性启动 `mcptools::mcp_session()`，自动提供 MCP 工具。

**失败处理：** 如果会话启动时找不到 `mcptools`，验证它安装在 RStudio 使用的库中（检查 `.libPaths()`）。如果使用 renv，确保 mcptools 在 renv 库中。

### 第 5 步：验证连接

**从 WSL 测试 R MCP**：

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**从 Claude Code 内测试**：

启动 Claude Code 并使用 MCP 工具 -- 它们应出现在工具列表中。

**测试 Claude Desktop**：

配置更改后重启 Claude Desktop。检查 UI 中的 MCP 服务器指示器。

**预期结果：** 运行带有 `mcptools::mcp_server()` 的 Rscript 产生无错误输出。活动会话期间 MCP 工具出现在 Claude Code 工具列表中。重启后 Claude Desktop 显示服务器状态。

**失败处理：** 如果 Rscript 命令失败，检查完整路径是否正确（使用 `ls "/mnt/c/Program Files/R/"` 验证 R 版本）。如果工具未出现在 Claude Code 中，重启会话。对于 Claude Desktop，检查防火墙设置。

### 第 6 步：多服务器配置

Claude Code 和 Claude Desktop 均支持同时使用多个 MCP 服务器：

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**预期结果：** 多个 MCP 服务器同时配置且可访问。`claude mcp list` 显示所有服务器。每个服务器的工具在同一 Claude Code 会话中可用。

**失败处理：** 如果服务器冲突，检查配置中每个服务器名称是否唯一。如果一个服务器阻塞其他服务器，验证服务器使用非阻塞 I/O（stdio 传输自动处理）。

## 验证清单

- [ ] `claude mcp list` 显示所有已配置的服务器
- [ ] R MCP 服务器响应工具调用
- [ ] Hugging Face MCP 服务器认证并响应
- [ ] Claude Code 和 Claude Desktop 均可连接（如两者都已配置）
- [ ] 会话期间 MCP 工具出现在工具列表中

## 常见问题

- **Windows 路径空格**：使用 8.3 短名称或正确引用路径。不同工具解析路径的方式不同。
- **命令参数中的令牌**：在 Windows 上，`--header "Authorization: Bearer token"` 由于解析问题而失败。改用环境变量。
- **混淆 Claude Code 和 Claude Desktop 配置**：这是不同的工具，有不同的配置文件（`~/.claude.json` 与 `%APPDATA%\Claude\`）
- **npx 与全局安装**：`npx mcp-remote` 在 Claude Desktop 上下文中可能失败。使用 `npm install -g mcp-remote` 全局安装。
- **mcptools 版本**：确保 mcptools 是最新版本。它需要 `ellmer` 包作为依赖。

## 相关技能

- `build-custom-mcp-server` - 创建自定义 MCP 服务器
- `troubleshoot-mcp-connection` - 调试连接问题
- `setup-wsl-dev-environment` - WSL 设置前提
