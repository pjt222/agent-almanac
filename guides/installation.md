---
title: "Installation"
description: "OS-aware install runbook covering plugin install, global CLI, prereqs, verification, and updating across Linux, macOS, Windows, WSL2, and Codespaces"
category: infrastructure
agents: []
teams: []
skills: [install-almanac-content]
---

# Installation

Get agent-almanac's 350 skills, 72 agents, and 17 teams discoverable to Claude Code (and 11 other agentic frameworks) on any operating system, validated end-to-end.

## When to Use This Guide

- First-time setup on a fresh machine.
- Adding agent-almanac to an existing Claude Code workflow.
- Cross-framework install (Cursor, Codex, Gemini CLI, Aider, etc.).
- Recovering from a broken install or reconciling drift after an update.

## Choose Your Path

| Path | Best for | Trade-off |
|---|---|---|
| **Plugin** (Phase 1) | Claude Code only, single-user | Atomic enable/disable; native discovery |
| **Global CLI** (Phase 2) | Multi-framework, multi-project | One install reaches Claude Code + Cursor + Codex + Gemini + Aider + 7 more |
| **Both** | Hybrid workflows | Pick a single skill-discovery channel per project to avoid double registration |

Phase 0 (prereqs) and Phase 4 (verify) apply to both.

---

## Phase 0 — Prereqs

### 0.1 — All operating systems

```bash
node --version    # ≥ 18.0.0
git --version
claude --version
```

### 0.2 — Install Claude Code if missing

| OS | Install |
|---|---|
| Linux / WSL2 / macOS | `npm install -g @anthropic-ai/claude-code` (recommended via [nvm](https://github.com/nvm-sh/nvm)) |
| Windows native | Official installer from the [Anthropic docs](https://docs.anthropic.com/en/docs/claude-code); confirm `where.exe claude` resolves |
| macOS first launch | If Gatekeeper blocks: `xattr -d com.apple.quarantine /path/to/claude` or right-click → Open once |

### 0.3 — Windows-only git config (run before any clone)

```powershell
git config --global core.autocrlf input
git config --global core.longpaths true
git config --global core.symlinks true   # requires Developer Mode
```

Without these, Windows clones rewrite line endings (breaking bash shebangs), hit the 260-char path limit on deep `references/` paths, and store symlinks as plain text files.

### 0.4 — Clone destination

| OS | Path | Why |
|---|---|---|
| Native Linux / macOS | `~/dev/agent-almanac` | Native filesystem |
| WSL2 | `~/dev/agent-almanac` (inside ext4) | **Not** `/mnt/c/...` — 9P + NTFS = 10× slower `git status`, broken `git mv` of dirs |
| Native Windows | `%USERPROFILE%\dev\agent-almanac` | NTFS unavoidable; consider Defender exclusion + `core.fsmonitor=true` |
| Codespaces / devcontainer | `/workspaces/agent-almanac` | Default mount point |

```bash
# POSIX (Linux / macOS / WSL2 / Codespaces)
git clone https://github.com/pjt222/agent-almanac.git ~/dev/agent-almanac
cd ~/dev/agent-almanac
```

```powershell
# Windows PowerShell
git clone https://github.com/pjt222/agent-almanac.git $HOME\dev\agent-almanac
cd $HOME\dev\agent-almanac
```

---

## Phase 1 — Plugin install (Claude Code native)

### 1.1 — Marketplace structure (one-time, host-wide)

```bash
# POSIX
mkdir -p ~/.claude-marketplace/.claude-plugin
mkdir -p ~/.claude-marketplace/plugins
```

```powershell
# PowerShell
New-Item -ItemType Directory -Force -Path "$HOME\.claude-marketplace\.claude-plugin"
New-Item -ItemType Directory -Force -Path "$HOME\.claude-marketplace\plugins"
```

### 1.2 — Write `~/.claude-marketplace/.claude-plugin/marketplace.json`

```json
{
  "name": "local",
  "description": "Local marketplace",
  "owner": { "name": "self" },
  "plugins": [{
    "name": "agent-almanac",
    "description": "350 skills, 72 agents, 17 teams",
    "source": "./plugins/agent-almanac",
    "category": "development"
  }]
}
```

### 1.3 — Link the repo into the marketplace

```bash
# POSIX
ln -s ~/dev/agent-almanac ~/.claude-marketplace/plugins/agent-almanac
```

```powershell
# PowerShell — Developer Mode preferred
New-Item -ItemType SymbolicLink -Path "$HOME\.claude-marketplace\plugins\agent-almanac" -Target "$HOME\dev\agent-almanac"
```

```cmd
:: cmd as admin — directory junction (no Dev Mode required)
mklink /J %USERPROFILE%\.claude-marketplace\plugins\agent-almanac %USERPROFILE%\dev\agent-almanac
```

If neither symlink option works on Windows, copy the repo (`xcopy /E /I /Y`). Re-copy after each `git pull`.

### 1.4 — Validate, register, install

```bash
claude plugin validate ~/.claude-marketplace/plugins/agent-almanac
claude plugin validate ~/.claude-marketplace
claude plugin marketplace add ~/.claude-marketplace
claude plugin install agent-almanac@local
```

Same commands work in PowerShell with quoted Windows paths (`"$HOME\.claude-marketplace\..."`).

---

## Phase 2 — Global CLI install (cross-framework)

Use this *instead of or alongside* Phase 1 when targeting Cursor, Codex, Gemini, Aider, OpenCode, Windsurf, Vibe, Hermes, or OpenClaw.

```bash
# POSIX with nvm — no sudo required
npm install -g agent-almanac
```

```bash
# POSIX without nvm — set npm prefix to avoid EACCES
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc && source ~/.bashrc
npm install -g agent-almanac
```

```powershell
# Windows
npm install -g agent-almanac
$env:PATH -split ';' | Select-String 'npm'   # confirm %APPDATA%\npm on PATH
```

```bash
# Quick smoke without global install
npx agent-almanac detect
```

Useful commands:

| Command | Purpose |
|---|---|
| `agent-almanac detect` | Show frameworks present in cwd |
| `agent-almanac list` | List installable skills, agents, teams |
| `agent-almanac install <name>` | Install into detected framework |
| `agent-almanac install --domain r-packages` | Install whole domain |
| `agent-almanac campfire` | Browse teams |
| `agent-almanac gather <team>` | Install team + dependencies |
| `agent-almanac sync` | Reconcile installed state with `agent-almanac.yml` manifest |

See [cli/README.md](../cli/README.md) for the full surface.

---

## Phase 3 — Team activation wiring

Teams are **not** auto-discovered. Add the activation contract once, globally:

```bash
# POSIX — import the repo's CLAUDE.md into your global one
echo "@$HOME/dev/agent-almanac/CLAUDE.md" >> ~/.claude/CLAUDE.md
```

```powershell
Add-Content -Path "$HOME\.claude\CLAUDE.md" -Value "@$HOME\dev\agent-almanac\CLAUDE.md"
```

This makes every Claude Code session understand: "to activate a team, `ToolSearch('select:TeamCreate')` then `TeamCreate` from `<repo>/teams/<name>.md`." Teams remain inert otherwise.

---

## Phase 4 — Verification

Run from `~/dev/agent-almanac`:

```bash
npm install
npm run validate:integrity     # bash-dependent (use Git Bash on Windows native)
npm run check-readmes
npm run validate:translations
npm test                       # composite
```

Native Windows from PowerShell:

```powershell
& "C:\Program Files\Git\bin\bash.exe" -c "npm run validate:integrity"
```

Plugin recognition (Phase 1 path):

```bash
claude plugin list | grep agent-almanac
```

Discovery diagnostic — start a fresh Claude Code session and prompt:

```
List the first 5 skills you can discover from agent-almanac.
```

Empty result → Phase 1 didn't take effect. Switch the marketplace.json `source` field to an absolute path and re-run `claude plugin install`.

CLI smoke (Phase 2 path):

```bash
agent-almanac detect
agent-almanac search "git"
```

**Pass criteria:**

- `claude plugin list` shows `agent-almanac` enabled, **or** `agent-almanac --version` returns.
- The discovery prompt lists ≥5 skills.
- `npm test` exits 0.

---

## Phase 5 — Updating

```bash
cd ~/dev/agent-almanac
git pull --no-rebase
npm install
npm test
claude plugin update agent-almanac    # Phase 1
npm install -g agent-almanac@latest   # Phase 2
```

`--no-rebase` is recommended on NTFS-backed working trees (rebase + binary churn is unreliable).

---

## Optional Extensions

### Visualization pipeline (`viz/`)

Requires R 4.5.x or Docker.

| OS | Rscript path |
|---|---|
| Native Linux | `apt install r-base` → `/usr/bin/Rscript` |
| macOS Apple Silicon | `brew install r` → `/opt/homebrew/bin/Rscript` |
| macOS Intel | `brew install r` → `/usr/local/bin/Rscript` |
| WSL2 | `apt install r-base` → `/usr/local/bin/Rscript` (WSL-native, not the Windows R install) |
| Native Windows | CRAN installer → `C:\Program Files\R\R-4.5.x\bin\Rscript.exe` |
| Any OS | `cd viz && docker compose up --build` (Docker fallback) |

```bash
cd ~/dev/agent-almanac/viz
npm install
bash build.sh         # platform-aware wrapper, do NOT call Rscript directly
npm run dev           # http://localhost:5173
```

Windows native needs Git Bash or MSYS2 for `bash build.sh`.

### MCP servers

R for R-using agents:

```bash
# Linux
claude mcp add r-mcptools stdio "$(which Rscript)" -- -e "mcptools::mcp_server()"
# macOS Apple Silicon
claude mcp add r-mcptools stdio /opt/homebrew/bin/Rscript -- -e "mcptools::mcp_server()"
# WSL2 (calling Windows R is allowed but slow; prefer WSL-native)
claude mcp add r-mcptools stdio "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -- -e "mcptools::mcp_server()"
```

```powershell
# Windows native
claude mcp add r-mcptools stdio "C:\Program Files\R\R-4.5.2\bin\Rscript.exe" -- -e "mcptools::mcp_server()"
```

Hugging Face:

```bash
npm install -g mcp-remote
claude mcp add hf-mcp-server -e HF_TOKEN=$HF_TOKEN -- mcp-remote https://huggingface.co/mcp
```

For deeper WSL2 + R + MCP setup, see [Setting Up Your Environment](setting-up-your-environment.md).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `claude: command not found` | CLI not on PATH | WSL2: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`; Windows: verify installer added `claude` to PATH |
| `git status` is slow (>10 s) | NTFS + viz/ binaries (7000+ webp) | Move clone to ext4/APFS; or `git config core.fsmonitor true` |
| `bad interpreter: /bin/bash^M` | CRLF line endings (Windows clone) | `dos2unix scripts/validate-integrity.sh` or re-clone after `core.autocrlf=input` |
| Plugin "installed" but no skills resolve | Relative path in `marketplace.json` not resolving | Switch `source` field to absolute path; re-run `claude plugin install` |
| `EACCES` on `npm install -g` | System Node owns `/usr/local/lib` | Use nvm, or `npm config set prefix ~/.npm-global` |
| Skills appear twice or behave inconsistently | Plugin + symlink both register the same content | Pick one discovery channel; remove the other |
| `mcp-remote` `--header` fails on Windows | cmd argument parsing | Use `claude mcp add -e HF_TOKEN=...` env-var form |
| `Filename too long` during clone | Windows 260-char limit | `git config --global core.longpaths true` and enable Win32 long paths in group policy |

---

## Related Resources

- [Setting Up Your Environment](setting-up-your-environment.md) — WSL2 + R + MCP deep dive
- [Quick Reference](quick-reference.md) — command cheatsheet
- [Symlink Architecture](symlink-architecture.md) — how multi-project skill discovery works
- [Understanding the System](understanding-the-system.md) — entry point for what skills, agents, and teams are
- [`install-almanac-content` skill](../skills/install-almanac-content/SKILL.md) — in-Claude-Code install meta-procedure
- [`cli/README.md`](../cli/README.md) — global CLI full reference
