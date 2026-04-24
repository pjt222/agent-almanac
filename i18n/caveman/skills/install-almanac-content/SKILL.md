---
name: install-almanac-content
locale: caveman
source_locale: en
source_commit: 82c77053
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

Use `agent-almanac` CLI to install skills, agents, teams into any supported agentic framework.

## When Use

- Setting up new project, need to install agentic skills, agents, teams
- Installing all skills from specific domain (`r-packages`, `devops`)
- Targeting multiple frameworks simultaneously (Claude Code, Cursor, Copilot)
- Creating or syncing declarative `agent-almanac.yml` manifest for reproducible setups
- Auditing installed content for broken symlinks or stale references

## Inputs

- **Required**: Content to install -- one or more skill, agent, team IDs (`create-skill`, `r-developer`, `r-package-review`)
- **Optional**: `--domain <domain>` -- install all skills from domain instead of naming individual IDs
- **Optional**: `--framework <id>` -- target specific framework (default: auto-detect all)
- **Optional**: `--with-deps` -- also install agent skills + team agents+skills
- **Optional**: `--dry-run` -- preview changes without writing to disk
- **Optional**: `--global` -- install to global scope instead of project scope
- **Optional**: `--force` -- overwrite existing content
- **Optional**: `--source <path>` -- explicit path to agent-almanac root (default: auto-detect)

## Steps

### Step 1: Detect Frameworks

Run framework detection to see which agentic tools present in current project:

```bash
agent-almanac detect
```

Scans working directory for configuration files + directories (`.claude/`, `.cursor/`, `.github/copilot-instructions/`, `.agents/`) + reports which frameworks active.

**Got:** Output lists one or more detected frameworks with adapter status. No frameworks detected? Universal adapter (`.agents/skills/`) used as fallback.

**If fail:** CLI not found? Ensure installed + on PATH. Detection returns nothing but you know framework is present? Use `--framework <id>` to specify explicit. Run `agent-almanac list --domains` to verify CLI can reach registries.

### Step 2: Search for Content

Find skills, agents, teams by keyword:

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

**Got:** Search results or filtered lists display matching content with IDs + descriptions.

**If fail:** No results appear? Try broader keywords. Verify almanac root reachable: `agent-almanac list` should show full skill count. Can't find root? Pass `--source /path/to/agent-almanac`.

### Step 3: Install Content

Install one or more items by name:

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

CLI resolves content from registries, selects appropriate adapter for each detected framework, writes files to framework-specific paths (`.claude/skills/` for Claude Code, `.cursor/rules/` for Cursor).

**Got:** Output confirms number of items installed + target framework(s). Installed content appears in correct framework directory.

**If fail:** Items not found? Verify ID matches `name` field in registry (`skills/_registry.yml`, `agents/_registry.yml`, `teams/_registry.yml`). Files already exist + installation skipped? Use `--force` to overwrite.

### Step 4: Verify Installation

Run health check on all installed content:

```bash
agent-almanac audit
```

Audit specific framework or scope:

```bash
agent-almanac audit --framework claude-code
agent-almanac audit --global
```

See what currently installed:

```bash
agent-almanac list --installed
```

**Got:** Audit reports all installed items healthy with no broken references. `--installed` listing shows each item with type + framework.

**If fail:** Audit reports broken items? Reinstall with `--force`. Symlinks broken? Verify almanac source path hasn't moved. Run `agent-almanac install <broken-id> --force` to repair.

### Step 5: Manage with Manifest (Optional)

Reproducible setups → use declarative `agent-almanac.yml` manifest:

```bash
# Generate a starter manifest
agent-almanac init
```

Creates `agent-almanac.yml` in current directory with detected frameworks + placeholder content lists. Edit file to declare desired skills, agents, teams:

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

Then install everything declared in manifest:

```bash
agent-almanac install
```

Reconcile installed state with manifest (install missing, remove extra):

```bash
agent-almanac sync
agent-almanac sync --dry-run  # Preview first
```

**Got:** Running `install` with no arguments reads manifest + installs all declared content. Running `sync` brings installed state into alignment with manifest, adding missing items + removing undeclared.

**If fail:** `sync` reports "No agent-almanac.yml found"? Run `agent-almanac init` first. Manifest resolves to 0 items? Check skill/agent/team IDs match registry entries exact. Comment lines starting with `#` ignored.

### Step 6: Manage Teams as Campfires (Optional)

Campfire commands provide warm, team-oriented alternative to `install --team`:

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

Campfire state tracked in `.agent-almanac/state.json` (git-ignored, local to project). Fires have thermal states: **burning** (used within 7 days), **embers** (within 30 days), **cold** (30+ days). Running `tend` warms all fires + reports health.

Shared skills protected during scatter — if skill needed by another gathered fire, stays installed. Shared agents walk between fires rather than being duplicated.

All campfire commands support `--quiet` (standard reporter output) + `--json` (machine-parseable) for scripting.

**Got:** Teams gathered + managed with state tracking. `campfire --all` shows fire states. `tend` reports health.

**If fail:** Campfire state corrupted? Delete `.agent-almanac/state.json` + re-gather teams. `gather` fails? Check team name matches entry in `teams/_registry.yml`.

## Checks

- [ ] `agent-almanac detect` shows expected frameworks
- [ ] `agent-almanac list --installed` shows all intended content
- [ ] `agent-almanac audit` reports no broken items
- [ ] Installed skills resolve in target framework (`/skill-name` works in Claude Code)
- [ ] Using manifest → `agent-almanac sync --dry-run` reports no changes needed

## Pitfalls

- **Forgetting `--with-deps` for agents + teams**: Installing agent without `--with-deps` installs only agent definition, not referenced skills. Agent present but unable to follow skill procedures. Always use `--with-deps` for agents + teams unless already installed dependencies separately.
- **Manifest drift**: After manual install or remove content, manifest falls out of sync with actual installed state. Run `agent-almanac sync` periodically, or always install through manifest to keep aligned.
- **Scope confusion (project vs global)**: Content installed with `--global` goes to `~/.claude/skills/` (or equivalent); project-scope content goes to `.claude/skills/` in current directory. Skill not found? Check whether installed in wrong scope.
- **Stale source path**: agent-almanac repository moved or renamed? `--source` path in manifests + auto-detection breaks. Update `source` field in `agent-almanac.yml` or re-run `agent-almanac init`.
- **Framework not detected**: Detector looks for specific files + directories. Freshly initialized project may not have these yet. Use `--framework <id>` explicit until project has expected structure, or rely on universal adapter.
- **Campfire thermal state confusion**: Fires go cold after 30 days without use. Running `agent-almanac tend` resets timer for all gathered fires. Fire shows as "cold" → still fully installed — thermal state reflects recency of use, not installation health.

## See Also

- `create-skill` -- author new skills to add to almanac before installing
- `configure-mcp-server` -- set up MCP servers that agents may need after installation
- `write-claude-md` -- configure CLAUDE.md to reference installed skills
- `audit-discovery-symlinks` -- diagnose symlink issues for Claude Code skill discovery
- `design-cli-output` -- terminal output patterns used by CLI reporter + campfire ceremony
