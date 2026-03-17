---
name: setup-wsl-dev-environment
description: >
  在 Windows 上配置 WSL2 开发环境，包括 Shell 设置、常用工具、Git、SSH 密钥、
  Node.js、Python 以及跨平台路径管理。适用于新 Windows 机器开发配置、
  首次配置 WSL2、在现有 WSL 安装中添加开发工具，或搭建结合 WSL 与 Windows
  工具的跨平台工作流。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: wsl, windows, linux, development, setup
---

# 配置 WSL 开发环境

为跨平台开发配置完整的 WSL2 开发环境。

## 适用场景

- 配置新 Windows 机器的开发环境
- 首次配置 WSL2
- 在现有 WSL 安装中添加开发工具
- 搭建跨平台工作流（WSL + Windows 工具）

## 输入

- **必需**：支持 WSL2 的 Windows 10/11
- **可选**：首选 Linux 发行版（默认：Ubuntu）
- **可选**：需要安装的语言（Node.js、Python、R）
- **可选**：额外工具（Docker、tmux、fzf）

## 步骤

### 第 1 步：安装 WSL2

在 PowerShell（管理员模式）中执行：

```powershell
wsl --install
wsl --set-default-version 2
```

如有提示，重启系统。默认安装 Ubuntu。

**预期结果：** 重启后，`wsl --list --verbose` 显示发行版以 WSL 2 版本运行。执行 `wsl` 命令可打开 Linux Shell。

**失败处理：** 若 WSL2 安装失败，通过 `optionalfeatures.exe` 手动启用"虚拟机平台"和"适用于 Linux 的 Windows 子系统"功能。旧版 Windows 10 可能需要从 Microsoft 下载内核更新。

### 第 2 步：配置 WSL 资源限制

在 Windows 主目录下创建 `~/.wslconfig`：

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**预期结果：** `.wslconfig` 文件存在于 Windows 用户主目录（例如 `C:\Users\Name\.wslconfig`）。执行 `wsl --shutdown` 并重启 WSL 后，资源限制生效。

**失败处理：** 若配置未生效，请确认文件位于正确位置（Windows 主目录，而非 WSL 主目录）。执行 `wsl --shutdown` 后重新打开 WSL 使更改生效。

### 第 3 步：更新并安装基本工具

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  git-lfs \
  vim \
  htop \
  tree \
  jq \
  ripgrep \
  fd-find \
  unzip \
  zip
```

创建常用别名：

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**预期结果：** 所有软件包安装无误。`git --version`、`jq --version`、`rg --version` 和 `tree` 命令均能正常执行。

**失败处理：** 若 `apt install` 失败，先执行 `sudo apt update` 刷新软件包列表。找不到软件包时，检查 Ubuntu 版本是否支持，或通过其他来源安装（如 snap、cargo 或手动下载）。

### 第 4 步：配置 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**预期结果：** `git config --list` 显示正确的用户名、邮箱、默认分支（`main`）、autocrlf（`input`）和编辑器设置。

**失败处理：** 若设置未生效，确认使用了 `--global`（而非仅对当前仓库生效的 `--local`）。检查 `~/.gitconfig` 是否包含预期条目。

### 第 5 步：配置 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# 添加到 GitHub：Settings > SSH and GPG keys
```

测试：`ssh -T git@github.com`

**预期结果：** `ssh -T git@github.com` 返回"Hi username! You've successfully authenticated."。SSH 密钥对位于 `~/.ssh/id_ed25519` 和 `~/.ssh/id_ed25519.pub`。

**失败处理：** 若认证失败，确认公钥已添加到 GitHub（Settings > SSH and GPG keys）。使用 `ssh-add -l` 检查 `ssh-agent` 是否运行且密钥已加载。若代理未运行，在 `~/.bashrc` 中添加 `eval "$(ssh-agent -s)"`。

### 第 6 步：安装 Node.js（通过 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**预期结果：** `node --version` 和 `npm --version` 返回当前 LTS 版本。`nvm ls` 显示已安装的版本并标记为默认。

**失败处理：** 安装后找不到 `nvm` 时，执行 `source ~/.bashrc` 或打开新终端。若安装脚本失败，先查看脚本内容再手动下载运行。

### 第 7 步：安装 Python（通过 pyenv）

```bash
# 安装构建依赖
sudo apt install -y make libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# 添加到 ~/.bashrc
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.12
pyenv global 3.12
```

**预期结果：** `python --version` 返回 Python 3.12.x。`pyenv versions` 显示已安装版本并设为全局默认。

**失败处理：** 若 `pyenv install` 因构建错误失败，确保 `apt install` 命令中的所有构建依赖均已安装。缺少 `libssl-dev` 或 `zlib1g-dev` 等库是 Python 构建失败的最常见原因。

### 第 8 步：配置 Shell

在 `~/.bashrc` 中添加：

```bash
# 历史记录
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# 导航别名
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# 开发路径
export DEV_HOME="/mnt/d/dev/p"
alias dev='cd $DEV_HOME'

# 函数
mkcd() { mkdir -p "$1" && cd "$1"; }

# PATH 追加
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

**预期结果：** 执行 `source ~/.bashrc` 后，所有别名（`ll`、`la`、`..`、`dev`）可用，`mkcd` 函数能创建并进入目录，`$DEV_HOME` 指向开发目录。

**失败处理：** 若别名不可用，确认已追加到 `~/.bashrc`（而非 `~/.bash_profile` 或 `~/.profile`）。执行 `source ~/.bashrc` 无需重开终端即可重新加载。

### 第 9 步：配置 Claude Code CLI

```bash
# 安装后将 Claude CLI 添加到 PATH
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 验证
which claude
```

**预期结果：** `which claude` 返回 Claude Code CLI 二进制文件路径（例如 `~/.claude/local/node_modules/.bin/claude`）。运行 `claude --version` 输出已安装版本。

**失败处理：** 若找不到 `claude`，确认 PATH 导出已添加到 `~/.bashrc` 并已执行 source。检查 Claude Code 是否确实安装于 `~/.claude/local/`。若未安装，请先按照 Claude Code 安装说明操作。

### 第 10 步：跨平台路径参考

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

从 WSL 打开 Windows 资源管理器：`explorer.exe .`

**预期结果：** 理解并测试路径转换：从 WSL 访问 Windows 路径可正常工作（例如 `ls /mnt/c/Users/`），`explorer.exe .` 在 Windows 资源管理器中打开当前 WSL 目录。

**失败处理：** 若 `/mnt/c/` 不可访问，确认 WSL 自动挂载已配置。检查 `/etc/wsl.conf` 中的 `[automount]` 设置。若挂载点过期，执行 `wsl --shutdown` 并重启。

## 验证清单

- [ ] WSL2 以正确的发行版运行
- [ ] Git 已配置正确的身份信息
- [ ] SSH 密钥已添加到 GitHub 并验证连接
- [ ] Node.js 已安装并可正常使用
- [ ] Python 已安装并可正常使用
- [ ] Shell 别名和函数可正常使用
- [ ] Claude Code CLI 可访问

## 常见问题

- **`/mnt/` 上文件访问慢**：将频繁访问的项目存储在 WSL 文件系统（`~/`）中以获得更好性能。`/mnt/` 用于需要与 Windows 工具共享的项目。
- **行尾符问题**：`core.autocrlf=input` 可避免 CRLF 问题。配置编辑器使用 LF 行尾。
- **权限问题**：`/mnt/` 上的文件可能显示错误权限。在 `/etc/wsl.conf` 中添加：`[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**：将 WSL 目录排除在实时扫描范围之外以提高性能。

## 相关技能

- `configure-git-repository` - 详细的 Git 仓库配置
- `configure-mcp-server` - MCP 配置需要 WSL 环境
- `write-claude-md` - 为项目配置 AI 助手
