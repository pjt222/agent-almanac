---
name: setup-wsl-dev-environment
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
fence_basis_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  WSL2 dev env on Windows: shell config, tools, Git, SSH keys,
  Node.js, Python, cross-platform paths. Use → new Windows machine,
  first WSL2 setup, add tools to existing WSL, or WSL+Windows workflows.
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

# Set Up WSL Dev Env

WSL2 dev env → cross-platform work.

## Use When

- New Windows machine → dev setup
- First WSL2 config
- Add dev tools → existing WSL
- WSL + Windows tool workflows

## In

- **Required**: Windows 10/11 w/ WSL2
- **Optional**: Linux distro (default: Ubuntu)
- **Optional**: Langs (Node, Python, R)
- **Optional**: Extra tools (Docker, tmux, fzf)

## Do

### Step 1: Install WSL2

PowerShell (Admin):

```powershell
wsl --install
wsl --set-default-version 2
```

Reboot if asked. Ubuntu = default.

**Got:** `wsl --list --verbose` → distro under WSL v2. `wsl` → Linux shell.

**If err:** Install fails → enable "Virtual Machine Platform" + "Windows Subsystem for Linux" via `optionalfeatures.exe`. Old Win10 → kernel update from MS.

### Step 2: WSL Resource Limits

`~/.wslconfig` in Windows home:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**Got:** `.wslconfig` in Windows home (e.g. `C:\Users\Name\.wslconfig`). After `wsl --shutdown` + restart → limits applied.

**If err:** No effect → file in wrong dir (Windows home, not WSL home). `wsl --shutdown` + reopen.

### Step 3: Update + Essentials

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

Aliases:

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**Got:** All install. `git --version`, `jq --version`, `rg --version`, `tree` work.

**If err:** `apt install` fails → `sudo apt update` first. Pkg not found → check Ubuntu ver, alt sources (snap, cargo, manual).

### Step 4: Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**Got:** `git config --list` → name, email, branch (`main`), autocrlf (`input`), editor.

**If err:** Not applied → used `--local` not `--global`. Check `~/.gitconfig`.

### Step 5: SSH Keys

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

Test: `ssh -T git@github.com`

**Got:** `ssh -T git@github.com` → "Hi username! You've successfully authenticated." Keys at `~/.ssh/id_ed25519{,.pub}`.

**If err:** Auth fails → pubkey added to GitHub? `ssh-agent` running? `ssh-add -l` → key loaded? Add `eval "$(ssh-agent -s)"` → `~/.bashrc`.

### Step 6: Node.js (nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**Got:** `node --version` + `npm --version` → LTS. `nvm ls` → default marked.

**If err:** `nvm` not found → source `~/.bashrc` or new term. Script fails → review + run manually.

### Step 7: Python (pyenv)

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

**Got:** `python --version` → 3.12.x. `pyenv versions` → set global.

**If err:** Build err → missing deps from `apt install`. `libssl-dev` | `zlib1g-dev` = most common cause.

### Step 8: Shell

`~/.bashrc`:

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

**Got:** After `source ~/.bashrc` → aliases (`ll`, `la`, `..`, `dev`) work, `mkcd` creates+enters, `$DEV_HOME` set.

**If err:** Aliases missing → check appended to `~/.bashrc` (not `~/.bash_profile` | `~/.profile`). `source ~/.bashrc`.

### Step 9: Claude Code CLI

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

**Got:** `which claude` → path (e.g. `~/.claude/local/node_modules/.bin/claude`). `claude --version` → ver.

**If err:** Not found → PATH export in `~/.bashrc` + sourced? Installed at `~/.claude/local/`? Else install first.

### Step 10: Cross-Platform Paths

| Windows | WSL |
|---|---|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

Explorer from WSL: `explorer.exe .`

**Got:** Path table understood + tested (`ls /mnt/c/Users/`, `explorer.exe .` opens current dir).

**If err:** `/mnt/c/` inaccessible → automount config? `/etc/wsl.conf` `[automount]`. `wsl --shutdown` + restart.

## Check

- [ ] WSL2 running w/ correct distro
- [ ] Git config'd w/ identity
- [ ] SSH key on GitHub + verified
- [ ] Node.js works
- [ ] Python works
- [ ] Shell aliases + funcs work
- [ ] Claude Code CLI accessible

## Traps

- **Slow `/mnt/` access**: Hot projects → WSL fs (`~/`). `/mnt/` only for Windows-shared.
- **Line endings**: `core.autocrlf=input` prevents CRLF. Editors → LF.
- **Permissions**: `/mnt/` shows wrong perms → `/etc/wsl.conf` `[automount]\noptions = "metadata,umask=22,fmask=11"`.
- **Windows Defender**: Exclude WSL dirs from real-time scan.

## →

- `configure-git-repository` — Git repo setup
- `configure-mcp-server` — MCP needs WSL env
- `write-claude-md` — configure AI assistant
