---
name: setup-wsl-dev-environment
locale: caveman
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

# Set Up WSL Development Environment

Configure complete WSL2 dev environment for cross-platform work.

## When Use

- Setting up new Windows machine for development
- Configuring WSL2 first time
- Adding dev tools to existing WSL install
- Cross-platform workflow (WSL + Windows tools)

## Inputs

- **Required**: Windows 10/11 with WSL2 support
- **Optional**: Preferred Linux distro (default: Ubuntu)
- **Optional**: Languages (Node.js, Python, R)
- **Optional**: Extra tools (Docker, tmux, fzf)

## Steps

### Step 1: Install WSL2

In PowerShell (Administrator):

```powershell
wsl --install
wsl --set-default-version 2
```

Restart if prompted. Ubuntu installs default.

**Got:** After reboot, `wsl --list --verbose` shows distro running WSL version 2. `wsl` cmd opens Linux shell.

**If fail:** WSL2 install fail? Enable "Virtual Machine Platform" and "Windows Subsystem for Linux" features manual via `optionalfeatures.exe`. Old Windows 10 builds? Kernel update from Microsoft needed.

### Step 2: Configure WSL Resource Limits

Create `~/.wslconfig` in Windows home dir:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**Got:** `.wslconfig` file exists in Windows user home (e.g., `C:\Users\Name\.wslconfig`). After `wsl --shutdown` and restart WSL, limits applied.

**If fail:** Config no effect? Verify file in correct location (Windows home, not WSL home). Run `wsl --shutdown`, reopen WSL.

### Step 3: Update and Install Essentials

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

Create useful aliases:

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**Got:** All packages install no errors. Cmds `git --version`, `jq --version`, `rg --version`, `tree` work.

**If fail:** `apt install` fail? Run `sudo apt update` first to refresh pkg lists. Pkg not found? Check Ubuntu version supports it or install alt source (snap, cargo, manual).

### Step 4: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**Got:** `git config --list` shows correct user name, email, default branch (`main`), autocrlf (`input`), editor settings.

**If fail:** Settings not applied? Verify used `--global` (not `--local` which only applies to current repo). Check `~/.gitconfig` has expected entries.

### Step 5: Set Up SSH Keys

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

Test: `ssh -T git@github.com`

**Got:** `ssh -T git@github.com` returns "Hi username! You've successfully authenticated." SSH key pair exists at `~/.ssh/id_ed25519` and `~/.ssh/id_ed25519.pub`.

**If fail:** Auth fails? Verify public key added to GitHub (Settings > SSH and GPG keys). Check `ssh-agent` running, key loaded with `ssh-add -l`. Agent not running? Add `eval "$(ssh-agent -s)"` to `~/.bashrc`.

### Step 6: Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**Got:** `node --version` and `npm --version` return current LTS versions. `nvm ls` shows installed version marked default.

**If fail:** `nvm` not found after install? Source `~/.bashrc` or open new terminal. Install script fails? Download, review, run manual.

### Step 7: Install Python (via pyenv)

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

**Got:** `python --version` returns Python 3.12.x. `pyenv versions` shows installed version set global.

**If fail:** `pyenv install` fail with build errors? Ensure all build deps from `apt install` cmd installed. Missing libs (especially `libssl-dev` or `zlib1g-dev`) most common cause of Python build failure.

### Step 8: Configure Shell

Add to `~/.bashrc`:

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

**Got:** After `source ~/.bashrc`, all aliases (`ll`, `la`, `..`, `dev`) work, `mkcd` function creates and enters dirs, `$DEV_HOME` points to dev dir.

**If fail:** Aliases not available? Verify additions appended to `~/.bashrc` (not `~/.bash_profile` or `~/.profile`). Run `source ~/.bashrc` to reload without new terminal.

### Step 9: Set Up Claude Code CLI

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

**Got:** `which claude` returns path to Claude Code CLI binary (e.g., `~/.claude/local/node_modules/.bin/claude`). Run `claude --version` prints installed version.

**If fail:** `claude` not found? Verify PATH export added to `~/.bashrc` and sourced. Check Claude Code installed at `~/.claude/local/`. Not installed? Follow Claude Code install instructions first.

### Step 10: Cross-Platform Path Reference

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

Open Windows Explorer from WSL: `explorer.exe .`

**Got:** Path conversion table understood and tested: access Windows path from WSL works (e.g., `ls /mnt/c/Users/`), `explorer.exe .` opens Windows Explorer to current WSL dir.

**If fail:** `/mnt/c/` not accessible? Verify WSL automount configured. Check `/etc/wsl.conf` for `[automount]` settings. Run `wsl --shutdown` and restart if mount points stale.

## Checks

- [ ] WSL2 running with correct distro
- [ ] Git configured with correct identity
- [ ] SSH key added to GitHub, connection verified
- [ ] Node.js installed, working
- [ ] Python installed, working
- [ ] Shell aliases, functions work
- [ ] Claude Code CLI accessible

## Pitfalls

- **Slow file access on `/mnt/`**: Store frequent projects in WSL filesystem (`~/`) for better speed. Use `/mnt/` for projects shared with Windows tools.
- **Line endings**: `core.autocrlf=input` prevents CRLF issues. Configure editors use LF.
- **Permission issues**: Files on `/mnt/` may show incorrect permissions. Add to `/etc/wsl.conf`: `[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**: Exclude WSL dirs from real-time scanning for better speed.

## See Also

- `configure-git-repository` - detailed Git repo setup
- `configure-mcp-server` - MCP setup needs WSL environment
- `write-claude-md` - configure AI assistant for projects
