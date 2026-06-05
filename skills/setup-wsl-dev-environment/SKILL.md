---
name: setup-wsl-dev-environment
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

Configure a complete WSL2 development environment for cross-platform work.

## When to Use

- Setting up a new Windows machine for development
- Configuring WSL2 for the first time
- Adding development tools to an existing WSL installation
- Setting up cross-platform workflows (WSL + Windows tools)

## Inputs

- **Required**: Windows 10/11 with WSL2 support
- **Optional**: Preferred Linux distribution (default: Ubuntu)
- **Optional**: Languages to set up (Node.js, Python, R)
- **Optional**: Additional tools (Docker, tmux, fzf)

## Procedure

### Step 1: Install WSL2

In PowerShell (Administrator):

```powershell
wsl --install
wsl --set-default-version 2
```

Restart if prompted. Ubuntu installs by default.

**Expected:** After reboot, `wsl --list --verbose` shows the distribution running under WSL version 2. The `wsl` command opens a Linux shell.

**On failure:** If WSL2 installation fails, enable the "Virtual Machine Platform" and "Windows Subsystem for Linux" Windows features manually via `optionalfeatures.exe`. On older Windows 10 builds, a kernel update may be required from Microsoft.

### Step 2: Configure WSL Resource Limits

Create `~/.wslconfig` in Windows home directory:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**Expected:** The `.wslconfig` file exists in the Windows user home directory (e.g., `C:\Users\Name\.wslconfig`). After running `wsl --shutdown` and restarting WSL, resource limits are applied.

**On failure:** If the config has no effect, verify the file is in the correct location (Windows home, not WSL home). Run `wsl --shutdown` and reopen WSL for changes to take effect.

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

**Expected:** All packages install without errors. Commands like `git --version`, `jq --version`, `rg --version`, and `tree` execute successfully.

**On failure:** If `apt install` fails, run `sudo apt update` first to refresh package lists. For packages not found, check that the Ubuntu version supports them or install from alternative sources (e.g., snap, cargo, or manual download).

### Step 4: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**Expected:** `git config --list` shows the correct user name, email, default branch (`main`), autocrlf (`input`), and editor settings.

**On failure:** If settings are not applied, verify you used `--global` (not `--local` which only applies to the current repo). Check that `~/.gitconfig` contains the expected entries.

### Step 5: Set Up SSH Keys

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Add to GitHub: Settings > SSH and GPG keys
```

Test: `ssh -T git@github.com`

**Expected:** `ssh -T git@github.com` returns "Hi username! You've successfully authenticated." The SSH key pair exists at `~/.ssh/id_ed25519` and `~/.ssh/id_ed25519.pub`.

**On failure:** If authentication fails, verify the public key was added to GitHub (Settings > SSH and GPG keys). Check that `ssh-agent` is running and the key is loaded with `ssh-add -l`. If the agent is not running, add `eval "$(ssh-agent -s)"` to `~/.bashrc`.

### Step 6: Install Node.js (via nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**Expected:** `node --version` and `npm --version` return current LTS versions. `nvm ls` shows the installed version marked as default.

**On failure:** If `nvm` is not found after installation, source `~/.bashrc` or open a new terminal. If the install script fails, download and run it manually after reviewing the script contents.

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

**Expected:** `python --version` returns Python 3.12.x. `pyenv versions` shows the installed version set as global.

**On failure:** If `pyenv install` fails with build errors, ensure all build dependencies from the `apt install` command were installed. Missing libraries (especially `libssl-dev` or `zlib1g-dev`) are the most common cause of Python build failures.

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

**Expected:** After running `source ~/.bashrc`, all aliases (`ll`, `la`, `..`, `dev`) work, the `mkcd` function creates and enters directories, and `$DEV_HOME` points to the development directory.

**On failure:** If aliases are not available, verify the additions were appended to `~/.bashrc` (not `~/.bash_profile` or `~/.profile`). Run `source ~/.bashrc` to reload without opening a new terminal.

### Step 9: Set Up Claude Code CLI

```bash
# Add Claude CLI to PATH (after installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which claude
```

**Expected:** `which claude` returns the path to the Claude Code CLI binary (e.g., `~/.claude/local/node_modules/.bin/claude`). Running `claude --version` prints the installed version.

**On failure:** If `claude` is not found, verify the PATH export was added to `~/.bashrc` and sourced. Check that Claude Code is actually installed at `~/.claude/local/`. If not installed, follow the Claude Code installation instructions first.

### Step 10: Cross-Platform Path Reference

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

Open Windows Explorer from WSL: `explorer.exe .`

**Expected:** The path conversion table is understood and tested: accessing a Windows path from WSL works (e.g., `ls /mnt/c/Users/`), and `explorer.exe .` opens Windows Explorer to the current WSL directory.

**On failure:** If `/mnt/c/` is not accessible, verify WSL's automount is configured. Check `/etc/wsl.conf` for `[automount]` settings. Run `wsl --shutdown` and restart if mount points are stale.

## Validation

- [ ] WSL2 running with correct distribution
- [ ] Git configured with correct identity
- [ ] SSH key added to GitHub and connection verified
- [ ] Node.js installed and working
- [ ] Python installed and working
- [ ] Shell aliases and functions work
- [ ] Claude Code CLI accessible

## Common Pitfalls

- **Slow file access on `/mnt/`**: Store frequently accessed projects in WSL filesystem (`~/`) for better performance. Use `/mnt/` for projects shared with Windows tools.
- **Line endings**: `core.autocrlf=input` prevents CRLF issues. Configure editors to use LF.
- **Permission issues**: Files on `/mnt/` may show incorrect permissions. Add to `/etc/wsl.conf`: `[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**: Exclude WSL directories from real-time scanning for better performance.

## Related Skills

- `configure-git-repository` - detailed Git repository setup
- `configure-mcp-server` - MCP setup requires WSL environment
- `write-claude-md` - configure AI assistant for projects
