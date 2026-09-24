---
name: install-almanac-content
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
fence_basis_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Install skills, agents, and teams from agent-almanac into any supported
  agentic framework using the CLI. Covers framework detection, content
  search, installation with dependency resolution, health auditing, and
  manifest-based syncing. Use when setting up a new project with agentic
  capabilities, installing specific skills or entire domains, targeting
  multiple frameworks simultaneously, or maintaining a declarative
  manifest of installed content.
license: MIT
allowed-tools:
  - Bash
  - Read
  - Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: basic
  language: multi
  tags:
    - cli
    - installation
    - framework-integration
    - discovery
---

# Install Almanac Content

`agent-almanac` CLI → install skills/agents/teams into agentic frameworks.

## Use When

- New project → agentic skills/agents/teams
- All skills from domain (`r-packages`, `devops`)
- Multi-framework (Claude Code, Cursor, Copilot)
- Declarative `agent-almanac.yml` manifest for reproducible
- Audit installed content for broken symlinks / stale refs

## In

- **Required**: content to install (skill/agent/team IDs, e.g., `create-skill`, `r-developer`, `r-package-review`)
- **Optional**: `--domain <domain>` → install all skills from domain
- **Optional**: `--framework <id>` → target specific (default: auto-detect all)
- **Optional**: `--with-deps` → install agent skills + team agents+skills
- **Optional**: `--dry-run` → preview no write
- **Optional**: `--global` → global scope not project
- **Optional**: `--force` → overwrite existing
- **Optional**: `--source <path>` → explicit almanac root

## Do

### Step 1: Detect frameworks

```bash
agent-almanac detect
```

Scans cwd for config files/dirs (`.claude/`, `.cursor/`, `.github/copilot-instructions/`, `.agents/`) + reports active.

→ Lists detected frameworks w/ adapter status. None → universal adapter (`.agents/skills/`) fallback.

**If err:** CLI not found → install + PATH. Detection nothing but framework present → `--framework <id>` explicit. Run `agent-almanac list --domains` → verify CLI reaches registries.

### Step 2: Search

```bash
agent-almanac search <keyword>
```

Browse by category:

```bash
agent-almanac list --domains          # List all domains with skill counts
agent-almanac list -d r-packages      # List skills in a specific domain
agent-almanac list --agents           # List all agents
agent-almanac list --teams            # List all teams
```

→ Results / filtered lists w/ IDs + descriptions.

**If err:** no results → broader keyword. Verify almanac root: `agent-almanac list` shows full count. No root → `--source /path/to/agent-almanac`.

### Step 3: Install

```bash
# Install specific skills
agent-almanac install create-skill write-testthat-tests

# Install all skills from a domain
agent-almanac install --domain devops

# Install an agent with its skills
agent-almanac install --agent r-developer --with-deps

# Install a team with its agents and their skills
agent-almanac install --team r-package-review --with-deps

# Target a specific framework
agent-almanac install create-skill --framework cursor

# Preview without writing
agent-almanac install --domain esoteric --dry-run

# Install to global scope
agent-almanac install create-skill --global
```

CLI resolves from registries, selects adapter per framework, writes to framework-specific paths (`.claude/skills/` for Claude Code, `.cursor/rules/` for Cursor).

→ Output confirms # items + target framework. Content in correct dir.

**If err:** not found → verify ID matches `name` field in `skills/_registry.yml` / `agents/_registry.yml` / `teams/_registry.yml`. Files exist + skipped → `--force`.

### Step 4: Verify install

```bash
agent-almanac audit
```

Audit specific framework/scope:

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

See installed:

```bash
agent-almanac list --installed
```

→ Audit → all healthy, no broken refs. `--installed` shows each w/ type + framework.

**If err:** broken → reinstall w/ `--force`. Broken symlinks → verify almanac source path not moved. Repair: `agent-almanac install <broken-id> --force`.

### Step 5: Manifest (opt)

```bash
# Generate a starter manifest
agent-almanac init
```

Creates `agent-almanac.yml` w/ detected frameworks + placeholder content. Edit:

```yaml
source: /path/to/agent-almanac
frameworks:
  - claude-code
  - cursor
skills:
  - create-skill
  - domain:r-packages
agents:
  - r-developer
teams:
  - r-package-review
```

Install from manifest:

```bash
agent-almanac install
```

Reconcile installed w/ manifest (install missing, remove extra):

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

→ `install` no args reads manifest + installs all. `sync` aligns state w/ manifest (adds missing, removes undeclared).

**If err:** `sync` "No agent-almanac.yml" → `agent-almanac init` first. 0 items → check IDs match registry exactly. `#` lines ignored.

### Step 6: Teams as campfires (opt)

Warm team-oriented alternative to `install --team`:

```bash
# Browse all available team circles
agent-almanac campfire --all

# Inspect a specific circle (members, practices, pattern)
agent-almanac campfire tending

# See shared agents between teams (hearth-keepers)
agent-almanac campfire --map

# Gather a team (install with arrival ceremony)
agent-almanac gather tending
agent-almanac gather tending --ceremonial    # Show each skill arriving
agent-almanac gather tending --only mystic,gardener  # Partial gathering

# Check fire health (burning / embers / cold)
agent-almanac tend

# Scatter a team (uninstall with farewell)
agent-almanac scatter tending
```

State tracked in `.agent-almanac/state.json` (git-ignored, local). Thermal states: **burning** (used <7 days), **embers** (<30 days), **cold** (30+). `tend` warms all fires + reports health.

Shared skills protected during scatter — needed by another gathered fire → remains. Shared agents walk between fires not duplicated.

All campfire support `--quiet` (standard reporter) + `--json` (machine-parseable) for scripting.

→ Teams gathered + managed w/ state. `campfire --all` shows states. `tend` reports health.

**If err:** state corrupted → delete `.agent-almanac/state.json` + re-gather. `gather` fails → team name must match `teams/_registry.yml`.

## Check

- [ ] `agent-almanac detect` shows expected frameworks
- [ ] `agent-almanac list --installed` shows intended content
- [ ] `agent-almanac audit` no broken
- [ ] Installed skills resolve in framework (e.g., `/skill-name` works)
- [ ] `agent-almanac sync --dry-run` no changes needed (if manifest)

## Traps

- **Forget `--with-deps` for agents + teams**: installs only def, not skills. Agent present but can't follow procedures. Always `--with-deps` unless deps already installed.
- **Manifest drift**: manual install/remove → out of sync. Run `sync` periodically or always install through manifest.
- **Scope confusion (project vs global)**: `--global` → `~/.claude/skills/`. Project → `.claude/skills/` in cwd. Not found → check scope.
- **Stale source path**: repo moved/renamed → `--source` in manifests + auto-detect breaks. Update `source` in `agent-almanac.yml` or re-run `init`.
- **Framework not detected**: detector looks for specific files/dirs. Fresh project may lack → `--framework <id>` explicit or rely on universal.
- **Campfire thermal confusion**: fires cold after 30 days. `tend` resets timer. Cold ≠ broken install — state reflects recency of use, not install health.

## →

- `create-skill` — author new skills before install
- `configure-mcp-server` — MCP servers agents may need post-install
- `write-claude-md` — reference installed skills in CLAUDE.md
- `audit-discovery-symlinks` — diagnose symlink issues for Claude Code discovery
- `design-cli-output` — terminal patterns used by reporter + campfire ceremony
