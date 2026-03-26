---
title: "Symlink Architecture"
description: "How symlinks enable multi-project discovery of skills, agents, and teams through Claude Code"
category: infrastructure
agents: []
teams: []
skills:
  - audit-discovery-symlinks
---

# Symlink Architecture

Claude Code discovers agents and skills from `.claude/` directories. When multiple projects share the same agent-almanac library, symlinks create a hub-and-spoke topology that gives every project access without duplicating files. This guide covers the architecture, setup, auditing, and repair of those symlinks.

## When to Use This Guide

- You are setting up a new project and want it to discover shared skills and agents
- You have multiple projects that should share a single agent-almanac library
- A repository was renamed or moved, and agent/skill discovery stopped working
- You need to audit symlinks after adding new skills or agents
- You want to understand why a slash command or agent is not found

## Prerequisites

- An agent-almanac repository cloned locally
- Claude Code CLI installed
- Familiarity with `ln -s`, `readlink`, and `find` commands

## Architecture Overview

Claude Code looks for agents and skills in the `.claude/` directory of the current project, its parent directories, and the user's home directory (`~/.claude/`). Symlinks connect these locations to the agent-almanac source of truth.

### Three discovery layers

```
~/.claude/                              Layer 3: Global (user-wide)
├── agents → <almanac>/agents
└── skills/
    ├── <skill-a> → <almanac>/skills/<skill-a>
    └── <skill-b> → <almanac>/skills/<skill-b>

<workspace>/.claude/                    Layer 2: Workspace (multi-project root)
├── agents → ~/.claude/agents           (chains through global)
└── skills → ~/.claude/skills           (chains through global)

<workspace>/<project>/.claude/          Layer 1: Project-specific
├── agents → ~/.claude/agents           (chains through global)
├── skills → ~/.claude/skills           (chains through global)
└── settings.local.json
```

**Layer 1 (project)** is checked first. A project can override the global setup with its own symlinks or local files.

**Layer 2 (workspace)** covers all projects under a shared parent directory.

**Layer 3 (global)** is the fallback. It is the natural home for the hub.

### The almanac's own setup

The agent-almanac repository uses **relative symlinks** within its own `.claude/` directory because it is both the source and a consumer:

```
<almanac>/.claude/
├── agents -> ../agents                 (relative — portable)
└── skills/
    ├── <skill-a> -> ../../skills/<skill-a>
    ├── <skill-b> -> ../../skills/<skill-b>
    └── ...                             (one symlink per skill)
```

Other projects use **absolute symlinks** that chain through `~/.claude/` to the almanac.

## Recommended: Use the CLI

The `agent-almanac` CLI automates symlink creation and supports 12 frameworks. It is the recommended way to install content:

```bash
# Detect which frameworks are present
agent-almanac detect

# Install a skill (creates symlinks in all detected frameworks)
agent-almanac install commit-changes

# Install all skills in a domain
agent-almanac install --domain r-packages

# Install an agent with all its skills
agent-almanac install --agent r-developer --with-deps

# Install a team (Claude Code only)
agent-almanac install --team r-package-review

# Verify installation health
agent-almanac audit
```

The CLI handles path resolution, multi-framework targeting, and idempotent installs. Use the manual setup below only if you need fine-grained control or are setting up the hub for the first time.

See the [install-almanac-content](../skills/install-almanac-content/SKILL.md) skill for the full procedure.

## Manual Setup: The Hub

### Step 1: Create the global agents symlink

```bash
ln -s <almanac-path>/agents ~/.claude/agents
```

This single symlink makes all agent definitions available globally.

### Note: Teams do NOT use symlinks

Unlike agents and skills, teams are **not** auto-discovered from `.claude/teams/`. Claude Code's `TeamCreate` tool stores ephemeral runtime state at `~/.claude/teams/{team-name}/config.json`. If this path is occupied by a symlink to team definitions, runtime state would be written into the git-tracked `teams/` directory, polluting the repository.

Team definitions in `teams/` are blueprints that Claude reads directly from the project root when asked to activate a team. No symlink is needed or wanted. If a `~/.claude/teams` symlink exists from a previous setup, remove it: `rm ~/.claude/teams`.

### Step 3: Create the global skills directory

Skills use a directory of individual symlinks (not a single directory symlink) so that project-specific skills can coexist alongside shared ones.

```bash
mkdir -p ~/.claude/skills

for skill_dir in <almanac-path>/skills/*/; do
  skill_name=$(basename "$skill_dir")
  [[ "$skill_name" == _template ]] && continue
  ln -s "<almanac-path>/skills/$skill_name" ~/.claude/skills/"$skill_name"
done
```

**Note:** The `_template` directory is excluded — templates are scaffolding for creating new skills, not consumable content for Claude Code discovery.

### Step 4: Link projects to the hub

For each project that should discover shared skills and agents:

```bash
mkdir -p <project>/.claude
ln -s ~/.claude/agents <project>/.claude/agents
ln -s ~/.claude/skills <project>/.claude/skills
```

This creates a two-hop chain: `project/.claude/agents → ~/.claude/agents → <almanac>/agents`. Do not symlink teams -- they are read directly from `teams/` and `~/.claude/teams/` is reserved for TeamCreate runtime state.

### Step 5: Verify

```bash
# Test that the chain resolves
test -d <project>/.claude/agents && echo "agents OK"
ls <project>/.claude/skills/ | wc -l
```

## Adding New Skills to the Hub

When new skills are added to the almanac, they need symlinks in both the almanac's `.claude/skills/` and the global `~/.claude/skills/`:

```bash
# In the almanac repo (relative symlink)
ln -s ../../skills/<new-skill> <almanac>/.claude/skills/<new-skill>

# In the global hub (absolute symlink)
ln -s <almanac-path>/skills/<new-skill> ~/.claude/skills/<new-skill>
```

Projects that chain through `~/.claude/skills` pick up the new skill automatically.

### Bulk sync

To add all missing skills at once:

```bash
for skill_dir in <almanac-path>/skills/*/; do
  skill_name=$(basename "$skill_dir")
  [[ "$skill_name" == _template ]] && continue
  link="$HOME/.claude/skills/$skill_name"
  if [ ! -e "$link" ]; then
    ln -s "<almanac-path>/skills/$skill_name" "$link"
  fi
done
```

## Auditing Symlinks

### Quick health check

Compare registered counts against actual symlinks at a glance:

```bash
# Registered vs actual (almanac skills only)
almanac="<almanac-path>"
echo "Registered: $(grep '^ \{6\}- id:' "$almanac/skills/_registry.yml" | wc -l)"
echo "Project:    $(ls .claude/skills/ 2>/dev/null | grep -v '^_template$' | wc -l)"
echo "Global:     $(ls ~/.claude/skills/ | wc -l) (includes external)"

# Show exact delta between registry and global
comm -23 \
  <(grep '^ \{6\}- id:' "$almanac/skills/_registry.yml" | awk '{print $3}' | sort) \
  <(ls ~/.claude/skills/ | sort)
```

### External content coexistence

The global `~/.claude/skills/` directory may contain skills from other projects alongside almanac symlinks (e.g., peon-ping sound notification skills). When auditing, distinguish almanac content from external content by checking whether each symlink's target is under the almanac path:

```bash
for item in ~/.claude/skills/*/; do
  name=$(basename "$item")
  target=$(readlink -f "$item" 2>/dev/null)
  if echo "$target" | grep -q "^$almanac"; then
    echo "almanac: $name"
  else
    echo "external: $name"
  fi
done
```

External content is not an error — it belongs to other projects and should be left untouched during auditing and repair.

### Check for broken symlinks

```bash
# Global agents
readlink ~/.claude/agents
test -d ~/.claude/agents && echo "OK" || echo "BROKEN"

# Global skills — find broken symlinks
find ~/.claude/skills/ -maxdepth 1 -type l ! -exec test -e {} \; -print

# Count working vs broken
echo "Working: $(find ~/.claude/skills/ -maxdepth 1 -type l -exec test -e {} \; -print | wc -l)"
echo "Broken:  $(find ~/.claude/skills/ -maxdepth 1 -type l ! -exec test -e {} \; -print | wc -l)"
```

### Check for missing skills

Compare the almanac's skills against the global hub:

```bash
# Skills in almanac but not in global
comm -23 \
  <(ls <almanac-path>/skills/ | sort) \
  <(ls ~/.claude/skills/ | sort)
```

### Check project chains

For each project, verify the chain resolves end-to-end:

```bash
for project in <workspace>/*/; do
  if [ -L "$project/.claude/agents" ]; then
    if test -d "$project/.claude/agents"; then
      echo "$(basename "$project"): OK"
    else
      echo "$(basename "$project"): BROKEN"
    fi
  fi
done
```

### Full diagnostic

```bash
echo "=== Global hub ==="
echo "agents: $(readlink ~/.claude/agents)"
echo "skills: $(find ~/.claude/skills/ -maxdepth 1 -type l | wc -l) total"
echo "broken: $(find ~/.claude/skills/ -maxdepth 1 -type l ! -exec test -e {} \; -print | wc -l)"

echo ""
echo "=== Project chains ==="
for project in <workspace>/*/; do
  name=$(basename "$project")
  if [ -L "$project/.claude/agents" ]; then
    status="OK"
    test -d "$project/.claude/agents" || status="BROKEN"
    echo "$name: $status (agents → $(readlink "$project/.claude/agents"))"
  fi
done
```

## Repairing After Common Events

### Repository rename or move

When the almanac repository is renamed or relocated, the global hub symlinks break because they use absolute paths.

**Symptoms:** Slash commands stop working across all projects. `test -d ~/.claude/agents` fails.

**Fix:**

```bash
# Update agents symlink
rm ~/.claude/agents
ln -s <new-almanac-path>/agents ~/.claude/agents

# Remove broken skill symlinks and recreate
find ~/.claude/skills/ -maxdepth 1 -type l ! -exec test -e {} \; -delete

for skill_dir in <new-almanac-path>/skills/*/; do
  skill_name=$(basename "$skill_dir")
  [[ "$skill_name" == _template ]] && continue
  link="$HOME/.claude/skills/$skill_name"
  if [ ! -e "$link" ]; then
    ln -s "<new-almanac-path>/skills/$skill_name" "$link"
  fi
done
```

### Stale runtime data

Claude Code's `TeamCreate` tool creates runtime state directories under `~/.claude/teams/` (with `config.json` and `inboxes/`). These are ephemeral session artifacts, not team definitions. They can be safely removed after a session ends:

```bash
# List runtime team data
ls ~/.claude/teams/

# Remove a specific stale session
rm -rf ~/.claude/teams/<session-name>
```

These are distinct from the agent-almanac's `teams/` directory, which contains team *definitions* (markdown blueprints). The two paths must not be connected by a symlink.

### Orphaned project symlinks

If a project's `.claude/` directory has symlinks to a hub location that no longer exists:

```bash
# Check what the project points to
readlink <project>/.claude/agents
readlink <project>/.claude/skills

# Repoint to the current hub
rm <project>/.claude/agents
ln -s ~/.claude/agents <project>/.claude/agents

rm <project>/.claude/skills
ln -s ~/.claude/skills <project>/.claude/skills
```

## Symlink Strategy Reference

| Strategy | Pattern | Pros | Cons | Use when |
|----------|---------|------|------|----------|
| Relative | `../agents` | Portable, survives moves | Only works within the same repo | Almanac's own `.claude/` |
| Absolute hub | `~/.claude/agents` → almanac | Single point to update | Breaks on almanac rename/move | Multi-project sharing |
| Direct absolute | `project/.claude/` → almanac | No chain, one hop | Every project needs updating on move | Single project, no hub |
| Chained | project → hub → almanac | Projects never change | Two-hop resolution, hub is SPOF | Many projects, stable hub |

**Recommendation:** Use the chained pattern (project → `~/.claude/` → almanac) for multi-project setups. Only the hub needs updating when the almanac moves. Projects never need to change.

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Slash command not found | Skill not symlinked to `.claude/skills/` | Add symlink at global and/or project level |
| Agent not found | `.claude/agents` symlink broken or missing | Check `readlink ~/.claude/agents`, recreate if needed |
| Only some skills work | Partial symlink creation; new skills not added to hub | Run bulk sync (see "Adding New Skills") |
| All projects broken at once | Hub symlink target moved or renamed | Update `~/.claude/agents` and rebuild `~/.claude/skills/` |
| One project broken, others fine | Project-level symlink points to wrong location | Check and repoint the project's `.claude/` symlinks |
| `_template` appears as a skill | Almanac's `skills/_template/` was symlinked | Remove it — templates must never be in discovery paths. Update bulk sync scripts to skip `_template` |
| Counts don't match but nothing is broken | `~/.claude/skills/` contains external content from other projects | Use the `comm` command or the [audit-discovery-symlinks](../skills/audit-discovery-symlinks/SKILL.md) skill to classify almanac vs external entries |

## Related Resources

- [audit-discovery-symlinks](../skills/audit-discovery-symlinks/SKILL.md) -- procedural skill for systematic symlink auditing and repair
- [Understanding the System](understanding-the-system.md) -- how agents, skills, and teams compose
- [Setting Up Your Environment](setting-up-your-environment.md) -- WSL, MCP, and Claude Code setup
- [Quick Reference](quick-reference.md) -- command cheat sheet
- [Epigenetics-Inspired Activation Control](epigenetics-activation-control.md) -- runtime activation profiles
