---
name: setup-wsl-dev-environment
locale: wenyan
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

# 設 WSL 開發之境

備全 WSL2 開發之境，以通跨臺之務。

## 用時

- 新立 Windows 機以為開發乃用
- 初設 WSL2 乃用
- 增器於既有之 WSL 乃用
- 立跨臺之流（WSL 與 Windows 並用）乃用

## 入

- **必要**：Windows 10/11 而具 WSL2 之能
- **可選**：所好之 Linux 之派（默為 Ubuntu）
- **可選**：所欲設之語（Node.js、Python、R）
- **可選**：他器（Docker、tmux、fzf）

## 法

### 第一步：裝 WSL2

於 PowerShell（管理員）內：

```powershell
wsl --install
wsl --set-default-version 2
```

如令則重啟。Ubuntu 默裝。

得：重啟之後，`wsl --list --verbose` 示其派行於 WSL 二版。`wsl` 之命開 Linux 之殼。

敗則：若 WSL2 之裝敗，由 `optionalfeatures.exe` 手啟「Virtual Machine Platform」與「Windows Subsystem for Linux」二能。於舊版 Windows 10，或須由 Microsoft 取核更新。

### 第二步：設 WSL 之資源限

於 Windows 家中立 `~/.wslconfig`：

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

得：`.wslconfig` 之文件存於 Windows 家（如 `C:\Users\Name\.wslconfig`）。行 `wsl --shutdown` 而重啟之，則限即施。

敗則：若設無效，驗其位於 Windows 家，非 WSL 家。行 `wsl --shutdown` 而重開 WSL 以使變生效。

### 第三步：更新而裝諸要

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

立有用之別名：

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

得：諸包皆裝而無誤。`git --version`、`jq --version`、`rg --version`、`tree` 皆行如儀。

敗則：若 `apt install` 敗，先行 `sudo apt update` 以新其包之列。包不可得者，察 Ubuntu 之版是否支之，或由他源取之（如 snap、cargo、手取）。

### 第四步：設 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

得：`git config --list` 示正確之名、郵、默枝（`main`）、autocrlf（`input`）、編者諸設。

敗則：若設不施，驗其用 `--global`（非 `--local`，後者僅施於當前之庫）。察 `~/.gitconfig` 含預期之條。

### 第五步：立 SSH 鑰

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

試：`ssh -T git@github.com`

得：`ssh -T git@github.com` 返「Hi username! You've successfully authenticated.」SSH 鑰之對存於 `~/.ssh/id_ed25519` 與 `~/.ssh/id_ed25519.pub`。

敗則：若驗敗，驗公鑰已加於 GitHub（Settings > SSH and GPG keys）。察 `ssh-agent` 在行而鑰已載，以 `ssh-add -l` 驗之。若代未行，加 `eval "$(ssh-agent -s)"` 於 `~/.bashrc`。

### 第六步：裝 Node.js（由 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

得：`node --version` 與 `npm --version` 返當前 LTS 之版。`nvm ls` 示已裝之版標為默。

敗則：若裝後不見 `nvm`，源 `~/.bashrc` 或開新終端。若裝書敗，閱其書而手行之。

### 第七步：裝 Python（由 pyenv）

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

得：`python --version` 返 Python 3.12.x。`pyenv versions` 示已裝之版設為全局。

敗則：若 `pyenv install` 因建構誤而敗，驗 `apt install` 之諸建構依賴皆已裝。缺之庫（尤其 `libssl-dev` 或 `zlib1g-dev`），最常致 Python 建構之敗。

### 第八步：設殼

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

得：行 `source ~/.bashrc` 後，諸別名（`ll`、`la`、`..`、`dev`）皆通，`mkcd` 之函立而入之，`$DEV_HOME` 指於開發之地。

敗則：若別名不可得，驗其加於 `~/.bashrc`（非 `~/.bash_profile` 或 `~/.profile`）。行 `source ~/.bashrc` 以重載而不開新終端。

### 第九步：設 Claude Code 之命

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

得：`which claude` 返 Claude Code 命之路（如 `~/.claude/local/node_modules/.bin/claude`）。行 `claude --version` 印已裝之版。

敗則：若 `claude` 不見，驗 PATH 之輸出已加於 `~/.bashrc` 而源之。察 Claude Code 實裝於 `~/.claude/local/`。若未裝，先依 Claude Code 之裝書而行之。

### 第十步：跨臺之路參

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

由 WSL 開 Windows 之檔總管：`explorer.exe .`

得：路之轉換表已明而試：由 WSL 取 Windows 之路皆通（如 `ls /mnt/c/Users/`），而 `explorer.exe .` 開檔總管至當前之 WSL 地。

敗則：若 `/mnt/c/` 不可達，驗 WSL 之自掛已設。察 `/etc/wsl.conf` 之 `[automount]` 諸設。若掛點陳腐，行 `wsl --shutdown` 而重啟。

## 驗

- [ ] WSL2 行於正確之派
- [ ] Git 設正確之身份
- [ ] SSH 鑰加於 GitHub 而連通已驗
- [ ] Node.js 裝而通
- [ ] Python 裝而通
- [ ] 殼之別名與函皆通
- [ ] Claude Code 之命可得

## 陷

- **`/mnt/` 上文件慢**：常用之項目宜置於 WSL 之檔系（`~/`）以速之。`/mnt/` 留與 Windows 共用之項目。
- **行尾**：`core.autocrlf=input` 防 CRLF 之患。編者宜設為 LF。
- **權限之患**：`/mnt/` 上之文件或示誤權。加於 `/etc/wsl.conf`：`[automount]\noptions = "metadata,umask=22,fmask=11"`。
- **Windows Defender**：剔 WSL 之地於即時掃之外以速之。

## 參

- `configure-git-repository` — Git 庫之詳設
- `configure-mcp-server` — MCP 之設賴 WSL 之境
- `write-claude-md` — 為項目設 AI 助手
