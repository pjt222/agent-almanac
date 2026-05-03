---
name: setup-wsl-dev-environment
locale: wenyan-lite
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

# 設定 WSL 開發環境

完整配置 WSL2 開發環境，以行跨平台之事。

## 適用時機

- 新置 Windows 機器以供開發
- 首次配置 WSL2
- 為既有 WSL 安裝添加開發工具
- 設立跨平台工作流（WSL 與 Windows 工具並用）

## 輸入

- **必要**：Windows 10/11 且支援 WSL2
- **選擇性**：偏好之 Linux 發行版（預設：Ubuntu）
- **選擇性**：欲設之語言（Node.js、Python、R）
- **選擇性**：附加工具（Docker、tmux、fzf）

## 步驟

### 步驟一：安裝 WSL2

於 PowerShell（管理員）中：

```powershell
wsl --install
wsl --set-default-version 2
```

如有提示則重啟。Ubuntu 為預設安裝。

**預期：** 重啟後，`wsl --list --verbose` 顯示發行版運行於 WSL 第二版。`wsl` 指令開啟 Linux shell。

**失敗時：** 若 WSL2 安裝失敗，透過 `optionalfeatures.exe` 手動啟用「虛擬機平台」與「適用於 Linux 的 Windows 子系統」之 Windows 功能。於較舊之 Windows 10 版本，可能需自微軟取得核心更新。

### 步驟二：配置 WSL 資源限制

於 Windows 家目錄中建立 `~/.wslconfig`：

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**預期：** `.wslconfig` 文件存於 Windows 用戶家目錄（例：`C:\Users\Name\.wslconfig`）。執行 `wsl --shutdown` 並重啟 WSL 後，資源限制即生效。

**失敗時：** 若配置無效，驗證文件位於正確位置（Windows 家目錄，非 WSL 家目錄）。執行 `wsl --shutdown` 並重開 WSL 以使變更生效。

### 步驟三：更新並安裝必備項

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

建立有用之別名：

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**預期：** 所有套件無誤安裝。`git --version`、`jq --version`、`rg --version` 與 `tree` 等指令皆可成功執行。

**失敗時：** 若 `apt install` 失敗，先執行 `sudo apt update` 以更新套件清單。對於找不到之套件，檢查當前 Ubuntu 版本是否支援，或自其他來源安裝（如 snap、cargo 或手動下載）。

### 步驟四：配置 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**預期：** `git config --list` 顯示正確之用戶名、電郵、預設分支（`main`）、autocrlf（`input`）與編輯器設定。

**失敗時：** 若設定未生效，驗證已用 `--global`（非僅作用於當前倉庫之 `--local`）。檢查 `~/.gitconfig` 是否含預期條目。

### 步驟五：設立 SSH 金鑰

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

測試：`ssh -T git@github.com`

**預期：** `ssh -T git@github.com` 回應「Hi username! You've successfully authenticated.」SSH 金鑰對存於 `~/.ssh/id_ed25519` 與 `~/.ssh/id_ed25519.pub`。

**失敗時：** 若驗證失敗，確認公鑰已加至 GitHub（Settings > SSH and GPG keys）。檢查 `ssh-agent` 是否運行，並以 `ssh-add -l` 確認金鑰已載入。若代理未運行，於 `~/.bashrc` 加入 `eval "$(ssh-agent -s)"`。

### 步驟六：安裝 Node.js（透過 nvm）

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**預期：** `node --version` 與 `npm --version` 回傳當前 LTS 版本。`nvm ls` 顯示所裝版本標為預設。

**失敗時：** 若安裝後找不到 `nvm`，執行 `source ~/.bashrc` 或開新終端。若安裝腳本失敗，審視腳本內容後手動下載並執行。

### 步驟七：安裝 Python（透過 pyenv）

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

**預期：** `python --version` 回傳 Python 3.12.x。`pyenv versions` 顯示所裝版本設為全域。

**失敗時：** 若 `pyenv install` 因建置錯誤而失敗，確保 `apt install` 指令中所有建置依賴皆已安裝。缺少程式庫（尤其 `libssl-dev` 或 `zlib1g-dev`）為 Python 建置失敗最常見之因。

### 步驟八：配置 Shell

加入 `~/.bashrc`：

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

**預期：** 執行 `source ~/.bashrc` 後，所有別名（`ll`、`la`、`..`、`dev`）皆可運作，`mkcd` 函式可建立並進入目錄，`$DEV_HOME` 指向開發目錄。

**失敗時：** 若別名不可用，驗證已附加至 `~/.bashrc`（非 `~/.bash_profile` 或 `~/.profile`）。執行 `source ~/.bashrc` 以重載而無需開新終端。

### 步驟九：設立 Claude Code CLI

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

**預期：** `which claude` 回傳 Claude Code CLI 二進位之路徑（例：`~/.claude/local/node_modules/.bin/claude`）。執行 `claude --version` 印出所裝版本。

**失敗時：** 若找不到 `claude`，驗證 PATH 匯出已加入 `~/.bashrc` 並已 source。檢查 Claude Code 是否確實安裝於 `~/.claude/local/`。若未安裝，先依 Claude Code 安裝指引行事。

### 步驟十：跨平台路徑對照

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

自 WSL 開啟 Windows 檔案總管：`explorer.exe .`

**預期：** 已理解並驗證路徑轉換表：自 WSL 存取 Windows 路徑可行（如 `ls /mnt/c/Users/`），且 `explorer.exe .` 可開啟 Windows 檔案總管至當前 WSL 目錄。

**失敗時：** 若無法存取 `/mnt/c/`，驗證 WSL 之 automount 已配置。檢查 `/etc/wsl.conf` 之 `[automount]` 設定。若掛載點陳舊，執行 `wsl --shutdown` 並重啟。

## 驗證

- [ ] WSL2 以正確發行版運行
- [ ] Git 已配置正確身份
- [ ] SSH 金鑰已加至 GitHub 且連線已驗證
- [ ] Node.js 已安裝且可運作
- [ ] Python 已安裝且可運作
- [ ] Shell 別名與函式皆可運作
- [ ] Claude Code CLI 可存取

## 常見陷阱

- **`/mnt/` 上文件存取緩慢**：將頻繁存取之專案置於 WSL 檔案系統（`~/`）以求更佳效能。`/mnt/` 用於與 Windows 工具共享之專案。
- **行尾換行**：`core.autocrlf=input` 可避 CRLF 問題。配置編輯器使用 LF。
- **權限問題**：`/mnt/` 上之文件可能顯示錯誤權限。於 `/etc/wsl.conf` 加入：`[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**：將 WSL 目錄排除於即時掃描之外以求更佳效能。

## 相關技能

- `configure-git-repository` — Git 倉庫詳細設置
- `configure-mcp-server` — MCP 設置需 WSL 環境
- `write-claude-md` — 為專案配置 AI 助手
