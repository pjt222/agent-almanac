---
title: "Setting Up Your Environment"
description: "WSL2 setup, shell config, MCP server integration, and Claude Code configuration"
category: infrastructure
agents: [r-developer, mcp-developer]
teams: []
skills: [setup-wsl-dev-environment, configure-mcp-server, troubleshoot-mcp-connection]
---

# Setting Up Your Environment

This guide consolidates everything needed to go from a fresh Windows machine to a fully working WSL2 development environment with shell configuration, Git, language runtimes, MCP server integration, and Claude Code / Claude Desktop connectivity. It covers the hybrid WSL-Windows workflow used for R package development, AI-assisted coding, and general software engineering.

## When to Use This Guide

- You are setting up a new WSL2 instance and need a repeatable checklist for tools, shell, and Git.
- You want to connect Claude Code (WSL) or Claude Desktop (Windows) to an R session via MCP.
- You need to configure the Hugging Face MCP server alongside the R MCP server.
- You are troubleshooting MCP connectivity, R path resolution, or environment variable issues.
- You are onboarding a collaborator who needs the same hybrid WSL-Windows setup.

## Prerequisites

- Windows 10/11 with WSL2 support and administrator access
- R installed on Windows (accessible via `/mnt/c/`), version 4.5.x recommended
- RStudio installed on Windows (optional but recommended for MCP integration)
- Claude Code CLI installed in WSL
- A GitHub account with SSH key access (for package development)

## 1. WSL2 Setup

```powershell
# In Windows PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

After reboot, configure the instance:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git
```

Create `~/.wslconfig` in your Windows home directory to set resource limits:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

## 2. Essential Tools

```bash
# Version control and build tools
sudo apt install -y git git-lfs cmake make gcc g++

# Utilities
sudo apt install -y htop tree jq ripgrep fd-find bat neovim tmux

# Aliases for renamed packages
echo "alias fd='fdfind'" >> ~/.bashrc
echo "alias bat='batcat'" >> ~/.bashrc

# fzf (fuzzy finder)
git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && ~/.fzf/install

# z (directory jumper)
curl -fsSL https://raw.githubusercontent.com/rupa/z/master/z.sh -o ~/.z.sh
echo '. ~/.z.sh' >> ~/.bashrc
```

## 3. Shell Configuration

Add the following to `~/.bashrc`:

```bash
# History
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# Prompt
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'

# Utility function
mkcd() { mkdir -p "$1" && cd "$1"; }

# Path
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"

# Project navigation (adjust path as needed)
export DEV_HOME="/path/to/your/dev"
alias dev="cd $DEV_HOME"

# Load local env if present
[ -f ~/.env ] && source ~/.env
```

Recommended directory structure:

```text
/path/to/your/dev/
├── personal/             # Personal projects
├── work/                 # Work projects
├── learning/             # Tutorials and courses
├── sandbox/              # Experiments
└── tools/                # Development tools
```

## 4. Git and SSH

```bash
# Identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global color.ui auto
git config --global core.editor "vim"
git config --global core.autocrlf input

# Aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
git config --global alias.unstage 'reset HEAD --'
```

### SSH Key

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub   # Add this to GitHub / GitLab
```

## 5. MCP Server Architecture

MCP (Model Context Protocol) operates on a client-server architecture. Understanding this is critical before configuring anything.

```text
Claude Code (WSL) <--MCP--> mcptools::mcp_server() <--> RStudio (Windows)
                     |
                     v
              R.exe (Windows)

Claude Desktop (Windows) <--MCP--> Multiple Servers:
                           |        ├── r-mcptools (R integration)
                           |        └── hf-mcp-server (Hugging Face)
                           v
                    AI/ML Workflows + R Analytics
```

**Key concepts:**

- **MCP Server**: `mcptools::mcp_server()` runs inside an R process, exposing R functionality over stdio or TCP.
- **MCP Clients**: Claude Code and Claude Desktop are independent clients. They do NOT share configurations or depend on each other.
- **Analogy**: The R session is like a web server; Claude Code and Claude Desktop are like two different browsers connecting to it independently.

| Server | Purpose | Authentication |
|---|---|---|
| r-mcptools | R integration, data analysis, package management | None (local stdio) |
| hf-mcp-server | Hugging Face models, datasets, transformers | HF_TOKEN env var |

## 6. R from WSL

### Verify and Create Wrapper Scripts

```bash
# Find your R installation (adjust version as needed)
ls "/mnt/c/Program Files/R/"
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe" --version

# Create wrapper scripts
mkdir -p ~/bin

cat > ~/bin/R << 'EOF'
#!/bin/bash
exec "/mnt/c/Program Files/R/R-4.5.0/bin/R.exe" "$@"
EOF

cat > ~/bin/Rscript << 'EOF'
#!/bin/bash
exec "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" "$@"
EOF

chmod +x ~/bin/R ~/bin/Rscript
```

### Path Conversion Reference

| Context | Windows | WSL |
|---|---|---|
| R installation | `C:\Program Files\R\R-4.5.0` | `/mnt/c/Program Files/R/R-4.5.0` |
| RStudio | `C:\Program Files\RStudio` | `/mnt/c/Program Files/RStudio` |
| User R library | `C:/Users/YourUsername/R/win-library/4.5` | N/A (Windows path in .Renviron) |
| Pandoc | `C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools` | N/A (Windows path in .Renviron) |

### Install and Configure mcptools

```r
# In RStudio on Windows
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

Create or update `.Rprofile` in your project root:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

The conditional loading prevents errors in environments where mcptools is not installed (CI/CD, collaborator machines).

### Configure .Renviron

Create `.Renviron.example` as a version-controlled template, then copy it:

```bash
cat > .Renviron.example << 'EOF'
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
EOF

cp .Renviron.example .Renviron
# Edit .Renviron to add actual API keys and paths
```

Add to `.gitignore`:

```gitignore
.Renviron
.RData
.Rhistory
```

## 7. Claude Code Configuration (WSL)

Claude Code needs its own MCP configuration, separate from Claude Desktop.

### Option 1: Claude CLI

```bash
# Add R MCP server (adjust R version path as needed)
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"

# Add Hugging Face MCP server
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

### Option 2: Manual Configuration

Edit `~/.claude.json`:

```json
{
  "mcpServers": {
    "r-mcptools": {
      "type": "stdio",
      "command": "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"],
      "env": {}
    }
  }
}
```

If the `claude` command is not found in WSL, add it to PATH:

```bash
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Verify with `claude mcp list` and `claude mcp get r-mcptools`.

## 8. Claude Desktop Configuration (Windows)

Claude Desktop is a separate GUI application. Its configuration file lives at:

```text
%APPDATA%\Claude\claude_desktop_config.json
```

Example with both R and Hugging Face servers (remove `hf-mcp-server` if not needed):

```json
{
  "globalShortcut": "Alt+Ctrl+Space",
  "mcpServers": {
    "r-mcptools": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"]
    },
    "hf-mcp-server": {
      "command": "mcp-remote",
      "args": ["https://huggingface.co/mcp"],
      "env": {
        "HF_TOKEN": "YOUR_HF_TOKEN_HERE"
      }
    }
  }
}
```

Prerequisites for the Hugging Face server: `npm install -g mcp-remote`. Authentication uses environment variables (not command-line headers) to avoid Windows argument parsing issues.

To verify: start `mcptools::mcp_session()` in RStudio, restart Claude Desktop, then test the connection.

## 9. Node.js and Python Setup

### Node.js (via nvm)

```bash
# SECURITY: Review script before running
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts
npm install -g yarn pnpm typescript ts-node mcp-remote
```

### Python (via pyenv)

```bash
# Install build dependencies
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
  libffi-dev liblzma-dev

# SECURITY: Review script before running
curl https://pyenv.run | bash

echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.11.0
pyenv global 3.11.0
```

## 10. Troubleshooting

### WSL Issues

**Slow file access on `/mnt/` paths**: Store projects in the WSL filesystem (`~/`) when possible. Cross-filesystem access is significantly slower.

**Line ending problems**: Ensure `git config --global core.autocrlf input` is set. Configure editors to use LF endings.

**Permission errors on `/mnt/` paths**: Add to `/etc/wsl.conf`:

```ini
[automount]
options = "metadata,umask=22,fmask=11"
```

### Git Directory Rename Failures on NTFS

**Symptom**: After `git mv`, new directory shows `d?????????` permissions and is inaccessible.

**Cause**: WSL2's NTFS interop layer (drvfs) does not reliably handle atomic directory renames.

**Workaround**: Use `mkdir -p` + file copy + `git rm` the old path instead of `git mv` for directories on `/mnt/` paths. For cleanup of broken directories: `cmd.exe /c "rmdir /s /q D:\\path\\to\\broken-dir"`.

### R Path Issues

**R command not found**: Use the full path or create wrapper scripts (see section 6):

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "your_command"
```

**Pandoc not found**: Ensure `.Renviron` contains the `RSTUDIO_PANDOC` path. Verify with `Rscript -e "Sys.getenv('RSTUDIO_PANDOC')"`.

**renv not activating**: Do not use `--vanilla` with Rscript -- it skips `.Rprofile`.

**mcptools not loading**:

```r
requireNamespace("mcptools", quietly = TRUE)
remotes::install_github("posit-dev/mcptools")  # Reinstall if FALSE
```

### MCP Connection Issues

**Claude Code not connecting**:

```bash
cat ~/.claude.json | jq '.mcpServers'
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" --version
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**Claude Desktop not connecting**: (1) Verify `mcptools::mcp_session()` is running in R. (2) Check config file at `%APPDATA%\Claude\claude_desktop_config.json`. (3) Validate JSON syntax. (4) Restart Claude Desktop. (5) Check firewall/antivirus.

**Distinguishing the two clients**: Claude Code (CLI) uses `~/.claude.json`. Claude Desktop (GUI) uses `%APPDATA%\Claude\claude_desktop_config.json`. They are independent and can connect to the same MCP server simultaneously.

| Aspect | Claude Desktop (Windows) | Claude Code (WSL) |
|---|---|---|
| Config file | `%APPDATA%\Claude\claude_desktop_config.json` | `~/.claude.json` |
| Argument parsing | Windows-style quoting | Unix-style quoting |
| Node.js path | `C:\Program Files\nodejs\` | Via nvm in WSL |

### Hugging Face MCP "Cannot Attach" Error (Windows)

**Symptom**: Claude Desktop shows "cannot attach the server" for Hugging Face MCP.

**Root causes**: (1) `npx mcp-remote` package resolution fails inside the Claude Desktop process. (2) Windows command parsing mangles `--header` arguments. (3) Execution context differences between command line and Claude Desktop.

**Evidence**: WSL logs `Using custom headers: {"Authorization":" Bearer hf_token"}` (working), while Windows logs `Warning: ignoring invalid header argument: "Authorization:` (failing).

**Recommended fix** -- global install with environment variables:

```cmd
npm install -g mcp-remote
```

```json
"hf-mcp-server": {
  "command": "mcp-remote",
  "args": ["https://huggingface.co/mcp"],
  "env": {"HF_TOKEN": "your_token_here"}
}
```

**Fallback -- SSE transport with header**:

```json
"hf-mcp-server": {
  "command": "npx",
  "args": ["mcp-remote", "https://huggingface.co/mcp", "--transport", "sse",
           "--header", "Authorization=Bearer YOUR_HF_TOKEN_HERE"]
}
```

**Diagnostic commands**:

```cmd
mcp-remote https://huggingface.co/mcp
npm list -g mcp-remote
curl -I "https://huggingface.co/mcp"
```

## Related Resources

### Agents and Skills

- [r-developer](../agents/r-developer.md) -- R package development persona
- [mcp-developer](../agents/mcp-developer.md) -- MCP integration specialist
- [configure-mcp-server](../skills/configure-mcp-server/SKILL.md) -- Step-by-step MCP server setup procedure
- [troubleshoot-mcp-connection](../skills/troubleshoot-mcp-connection/SKILL.md) -- Diagnosing MCP connectivity failures

### Guides

- [R Package Development](r-package-development.md) -- Companion guide for R package workflow, testing, and CRAN submission

### External Documentation

- [mcptools Package](https://github.com/posit-dev/mcptools)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [renv Documentation](https://rstudio.github.io/renv/)
