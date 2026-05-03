---
name: setup-wsl-dev-environment
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Set up a WSL2 development environment on Windows including shell
  configuration, essential tools, Git, SSH keys, Node.js, Python,
  and cross-platform path management. Use when setting up a new Windows
  machine for development, configuring WSL2 for the first time, adding
  development tools to an existing WSL installation, or setting up
  cross-platform workflows that combine WSL and Windows tools.
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

# 設 WSL 境

備 WSL2 全境，跨臺以工。

## 用

- 新機初設→用
- WSL2 始配→用
- 既裝增工→用
- 跨臺流（WSL+Windows）→用

## 入

- **必**：Win10/11 支 WSL2
- **可**：所好 Linux（默 Ubuntu）
- **可**：語（Node.js、Python、R）
- **可**：餘工（Docker、tmux、fzf）

## 行

### 一：裝 WSL2

PowerShell（管）：

```powershell
wsl --install
wsl --set-default-version 2
```

如囑→重啟。Ubuntu 默裝。

得：重啟後 `wsl --list --verbose` 示版二行。`wsl` 開 Linux 殼。

敗：裝敗→`optionalfeatures.exe` 手啟「虛擬機平臺」「Windows Subsystem for Linux」。舊版→需 Microsoft 核更。

### 二：設 WSL 限

於 Windows 家建 `~/.wslconfig`：

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

得：`.wslconfig` 存於 Windows 家（如 `C:\Users\Name\.wslconfig`）。`wsl --shutdown` 重啟後限施。

敗：無效→驗位（Windows 家，非 WSL 家）。`wsl --shutdown` 重啟。

### 三：更與裝要

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

建別號：

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

得：諸包無誤而裝。`git --version`、`jq --version`、`rg --version`、`tree` 皆行。

敗：裝敗→先 `sudo apt update`。包不在→驗 Ubuntu 版支否，或他源（snap、cargo、手裝）。

### 四：設 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

得：`git config --list` 示名、郵、默枝（`main`）、autocrlf（`input`）、編。

敗：未施→驗用 `--global`（非 `--local`）。察 `~/.gitconfig` 含期項。

### 五：設 SSH 鑰

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

驗：`ssh -T git@github.com`

得：`ssh -T git@github.com` 返「Hi username! You've successfully authenticated.」鑰於 `~/.ssh/id_ed25519` 與 `.pub`。

敗：認敗→驗公鑰加於 GitHub（Settings > SSH and GPG keys）。察 `ssh-agent` 行、`ssh-add -l` 示鑰。代→加 `eval "$(ssh-agent -s)"` 於 `~/.bashrc`。

### 六：裝 Node.js（用 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

得：`node --version` 與 `npm --version` 返今 LTS。`nvm ls` 示裝版為默。

敗：`nvm` 不在→`source ~/.bashrc` 或開新端。腳本敗→閱後手執。

### 七：裝 Python（用 pyenv）

```bash
# Install build dependencies
sudo apt install -y make libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# Add to ~/.bashrc
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.12
pyenv global 3.12
```

得：`python --version` 返 3.12.x。`pyenv versions` 示裝版為全域。

敗：`pyenv install` 構誤→驗依皆裝。缺 `libssl-dev` 或 `zlib1g-dev` 為最常因。

### 八：設殼

加於 `~/.bashrc`：

```bash
# History
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# Navigation aliases
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# Development paths
export DEV_HOME="/mnt/d/dev/p"
alias dev='cd $DEV_HOME'

# Functions
mkcd() { mkdir -p "$1" && cd "$1"; }

# PATH additions
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

得：`source ~/.bashrc` 後，諸別號（`ll`、`la`、`..`、`dev`）皆行，`mkcd` 建並入。

敗：別號不在→驗加於 `~/.bashrc`（非 `~/.bash_profile`）。`source` 重載。

### 九：設 Claude Code CLI

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

得：`which claude` 返路（如 `~/.claude/local/node_modules/.bin/claude`）。`claude --version` 印版。

敗：`claude` 不在→驗 PATH 加而 `source`。察 `~/.claude/local/` 真有。否→先依文裝。

### 十：跨臺路參

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

由 WSL 開 Windows Explorer：`explorer.exe .`

得：路換明、可由 WSL 訪 Windows 路（如 `ls /mnt/c/Users/`）；`explorer.exe .` 開當下目。

敗：`/mnt/c/` 不可訪→驗 WSL automount 設。察 `/etc/wsl.conf` `[automount]`。`wsl --shutdown` 重啟。

## 驗

- [ ] WSL2 行於正分發
- [ ] Git 設正身
- [ ] SSH 鑰加 GitHub 而連驗
- [ ] Node.js 裝而行
- [ ] Python 裝而行
- [ ] 殼別號與函皆行
- [ ] Claude Code CLI 可訪

## 忌

- **`/mnt/` 訪緩**：常用案存於 WSL（`~/`）為佳。`/mnt/` 留共用 Windows 工
- **行尾**：`core.autocrlf=input` 防 CRLF。編設 LF
- **權誤**：`/mnt/` 檔權或誤。加於 `/etc/wsl.conf`：`[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**：除 WSL 目於即時掃以增效

## 參

- `configure-git-repository` - Git 庫詳設
- `configure-mcp-server` - MCP 需 WSL 境
- `write-claude-md` - 為案設 AI 助
