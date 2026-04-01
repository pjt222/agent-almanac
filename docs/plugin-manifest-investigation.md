# Claude Code Plugin Manifest Format Investigation

**Date**: April 1, 2026  
**Status**: Complete investigation of plugin manifest structure and discovery mechanism  
**Use Case**: Understanding if agent-almanac can be packaged as a Claude Code plugin

---

## Executive Summary

Claude Code plugins follow a **declarative manifest system** with **automatic component discovery**. The minimal plugin is just `plugin.json` + one component. Skills within plugins use identical `SKILL.md` format as the main codebase (from `agentskills.io` standard), making agent-almanac's 339 skills immediately portable.

**Key Finding**: Agent-almanac could be packaged as a multi-skill plugin with minimal changes—just wrap it in the plugin directory structure.

---

## 1. Plugin Manifest Schema (plugin.json)

**Location**: `.claude-plugin/plugin.json` (REQUIRED directory)

### Minimal Schema
```json
{
  "name": "plugin-name"
}
```

### Full Schema
```json
{
  "name": "plugin-name",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://docs.example.com",
  "repository": "https://github.com/user/plugin-name",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "commands": "./custom-commands",
  "agents": ["./agents", "./specialized-agents"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

### Schema Requirements

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✅ Yes | kebab-case, unique across installed plugins, no spaces |
| `description` | string | ❌ No | Single-line plugin purpose |
| `version` | string | ❌ No | Semantic versioning (MAJOR.MINOR.PATCH) |
| `author` | object | ❌ No | `name` (required), `email`, `url` (optional) |
| `homepage` | string | ❌ No | Documentation URL |
| `repository` | string | ❌ No | Git repository URL |
| `license` | string | ❌ No | SPDX license identifier |
| `keywords` | array | ❌ No | Discovery keywords |
| `commands` | string \| array | ❌ No | Custom path(s) to commands directory |
| `agents` | string \| array | ❌ No | Custom path(s) to agents directory |
| `hooks` | string | ❌ No | Custom path to hooks.json |
| `mcpServers` | string | ❌ No | Custom path to .mcp.json |

**CRITICAL**: Custom paths SUPPLEMENT defaults—they don't replace them. Both default and custom paths load.

---

## 2. Directory Structure & Auto-Discovery

### Standard Plugin Layout
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json              # REQUIRED: Plugin manifest
├── commands/                     # Auto-discovered: *.md files → /slash-commands
├── agents/                       # Auto-discovered: *.md files → subagents
├── skills/                       # Auto-discovered: */SKILL.md → contextual skills
│   └── skill-name/
│       ├── SKILL.md             # REQUIRED for each skill
│       ├── references/          # Optional: extended documentation
│       ├── examples/            # Optional: example code/configs
│       └── scripts/             # Optional: utility scripts
├── hooks/
│   ├── hooks.json               # Hook configuration
│   └── scripts/
│       ├── validate.sh
│       └── check-style.sh
├── .mcp.json                    # MCP server definitions
├── .mcp.json                    # Alternative: inline in plugin.json
├── scripts/                      # Shared utilities
└── README.md                     # Plugin documentation
```

### Auto-Discovery Rules

| Component | Location | Format | Auto-Load | Invocation |
|-----------|----------|--------|-----------|------------|
| **Commands** | `commands/` | `.md` files | ✅ All `.md` files | `/command-name` |
| **Agents** | `agents/` | `.md` files | ✅ All `.md` files | Manual invoke or auto-select |
| **Skills** | `skills/*/` | `SKILL.md` | ✅ Each `SKILL.md` | Based on description trigger |
| **Hooks** | `hooks/hooks.json` | JSON config | ✅ On plugin enable | Event-driven |
| **MCP Servers** | `.mcp.json` | JSON config | ✅ On plugin enable | Contextual tool access |

**Discovery Timing**: Plugin installation → enable → next session, no restart required

---

## 3. MCP Server Configuration (`.mcp.json`)

Separate from plugin.json. Located at plugin root or referenced in manifest.

### Configuration Types

**HTTP Server (OAuth)**:
```json
{
  "slack": {
    "type": "http",
    "url": "https://mcp.slack.com/mcp",
    "oauth": {
      "clientId": "1601185624273.8899143856786",
      "callbackPort": 3118
    }
  }
}
```

**HTTP Server (Bearer Token)**:
```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

**SSE Server**:
```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

**Stdio Server (Local)**:
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

**Environment Variable Expansion**: Supports `${VAR_NAME}` for secrets and paths

---

## 4. Skill Discovery within Plugins

### Skill File Format (Identical to agentskills.io Standard)

**Location**: `skills/<skill-name>/SKILL.md`

**Format**:
```markdown
---
name: skill-name
description: When to use this skill (trigger condition)
version: 1.0.0
---

# Skill Title

Core skill documentation...

## References
- Additional resources
```

### Model-Invoked vs. User-Invoked

**Model-invoked skill** (contextual activation):
- Description is trigger phrase matching
- Example: "image generation", "create API documentation"
- Claude automatically activates based on context

**User-invoked skill** (slash command):
- Has `argument-hint` and `allowed-tools` fields
- Example: `/generate-image <prompt>`
- User explicitly runs via slash command

### Directory Structure within Skill
```
skills/skill-name/
├── SKILL.md                  # REQUIRED: Main skill document
├── references/               # Optional: Extended docs (>500 lines spillover)
│   ├── api-reference.md
│   └── advanced-patterns.md
├── examples/                 # Optional: Code examples
│   ├── example1.py
│   └── template.sql
├── scripts/                  # Optional: Utility scripts
│   ├── validate.sh
│   └── helper.py
└── agents/                   # Optional: Sub-agents (some plugins use)
    ├── analyzer.md
    └── comparator.md
```

**Supporting Files**: Scripts, references, examples, and sub-agents can coexist within a skill directory

---

## 5. Commands (Slash Commands)

### Legacy Format (`commands/*.md`)
```markdown
---
name: command-name
description: Short description
---

Your command implementation and instructions...
```

### Preferred Format (`skills/name/SKILL.md` with argument-hint)
```markdown
---
name: command-name
description: Short description for /help
argument-hint: <arg1> [optional-arg]
allowed-tools: [Read, Glob, Grep]
---

Command implementation...
```

**Note**: Legacy `commands/` directory still works (identical loading to `skills/` format)

---

## 6. Hooks Configuration (`hooks.json`)

### Configuration Format
```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command",
      "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh",
      "timeout": 30
    }]
  }]
}
```

### Available Events
- `PreToolUse` — before any tool execution
- `PostToolUse` — after tool execution
- `Stop` — before session stop
- `SubagentStop` — when subagent finishes
- `SessionStart` — session initialization
- `SessionEnd` — session cleanup
- `UserPromptSubmit` — before prompt processing
- `PreCompact` — before context compaction
- `Notification` — system notifications

### Path References
Always use `${CLAUDE_PLUGIN_ROOT}` for portable paths:
```json
"command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh"
```

---

## 7. Real Plugin Examples

### Example 1: commit-commands (Single Command)
**Purpose**: Git workflow automation  
**Path**: `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/commit-commands/`

```
commit-commands/
├── .claude-plugin/
│   └── plugin.json          # Minimal: just name + description
├── README.md                 # Comprehensive documentation
├── LICENSE
└── commands/                 # 3 slash commands
    ├── commit.md            # /commit
    ├── commit-push-pr.md    # /commit-push-pr
    └── clean_gone.md        # /clean_gone
```

**plugin.json** (9 lines):
```json
{
  "name": "commit-commands",
  "description": "Streamline your git workflow with simple commands...",
  "author": {
    "name": "Anthropic",
    "email": "support@anthropic.com"
  }
}
```

**Commands**: User types `/commit` → Claude analyzes git status/diff → stages & commits

---

### Example 2: plugin-dev (8 Skills + Documentation)
**Purpose**: Plugin development toolkit  
**Path**: `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/`

```
plugin-dev/
├── .claude-plugin/
│   └── plugin.json
├── README.md                 # Comprehensive guide
├── LICENSE
└── skills/                   # 8 specialized skills
    ├── plugin-structure/
    │   ├── SKILL.md
    │   └── (4 references about directory layout)
    ├── hook-development/
    │   ├── SKILL.md
    │   ├── examples/ (3 hook examples)
    │   ├── references/ (3 reference docs)
    │   └── scripts/ (3 utility scripts)
    ├── mcp-integration/
    │   ├── SKILL.md
    │   ├── examples/ (3 MCP configs: stdio, SSE, HTTP)
    │   └── references/ (3 reference docs)
    ├── plugin-settings/
    ├── command-development/
    ├── agent-development/
    └── skill-development/
```

**plugin.json** (8 lines):
```json
{
  "name": "plugin-dev",
  "description": "Plugin development toolkit...",
  "author": {
    "name": "Anthropic",
    "email": "support@anthropic.com"
  }
}
```

**Skills Discovery**: Each skill's `SKILL.md` has description matching trigger phrases like "create a hook", "add MCP server", "plugin structure"

---

### Example 3: skill-creator (1 Skill + Agents + Python Scripts)
**Purpose**: Create and evaluate skills  
**Path**: `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/`

```
skill-creator/
├── .claude-plugin/
│   └── plugin.json
├── README.md
├── LICENSE
└── skills/
    └── skill-creator/        # Single skill with complex internals
        ├── SKILL.md          # Main skill document
        ├── agents/           # 3 sub-agents (analyzer, comparator, grader)
        ├── scripts/          # Python evaluation & reporting
        │   ├── run_eval.py
        │   ├── run_loop.py
        │   ├── improve_description.py
        │   └── aggregate_benchmark.py
        ├── eval-viewer/      # HTML viewer for results
        ├── assets/           # Review templates
        └── references/       # Schemas documentation
```

**Structure**: Single skill with sophisticated internal sub-agents and Python tooling

---

### Example 4: mcp-server-dev (3 Skills + References)
**Purpose**: Build MCP servers  
**Path**: `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/mcp-server-dev/`

```
mcp-server-dev/
├── .claude-plugin/
│   └── plugin.json
├── README.md
└── skills/
    ├── build-mcp-server/
    │   ├── SKILL.md
    │   └── references/     # 6 reference docs (auth, tool-design, etc.)
    ├── build-mcp-app/
    │   ├── SKILL.md
    │   └── references/     # 3 reference docs (widgets, sandbox, etc.)
    └── build-mcpb/
        ├── SKILL.md
        └── references/     # 2 reference docs (security, manifest-schema)
```

**Structure**: 3 tightly-related skills with extensive reference documentation

---

## 8. Actual Plugin.json Examples from Installation

### Minimal (github MCP)
```json
{
  "name": "github",
  "description": "Official GitHub MCP server...",
  "author": {
    "name": "GitHub"
  }
}
```

### With Version & Keywords (fakechat)
```json
{
  "name": "fakechat",
  "description": "Localhost iMessage-style web chat...",
  "version": "0.0.1",
  "keywords": ["fakechat", "web", "localhost", "testing", "channel", "mcp"]
}
```

### Full Metadata (discord)
```json
{
  "name": "discord",
  "description": "Discord channel for Claude Code...",
  "version": "0.0.4",
  "keywords": ["discord", "messaging", "channel", "mcp"]
}
```

---

## 9. External MCP Servers (.mcp.json Examples)

### Slack (OAuth)
```json
{
  "slack": {
    "type": "http",
    "url": "https://mcp.slack.com/mcp",
    "oauth": {
      "clientId": "1601185624273.8899143856786",
      "callbackPort": 3118
    }
  }
}
```

### GitHub (Bearer Token)
```json
{
  "github": {
    "type": "http",
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
    }
  }
}
```

### Asana (SSE)
```json
{
  "asana": {
    "type": "sse",
    "url": "https://mcp.asana.com/sse"
  }
}
```

### Playwright (Local/Stdio)
```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

---

## 10. Portability: ${CLAUDE_PLUGIN_ROOT} Environment Variable

**Purpose**: Ensure plugins work across different installation locations and OSes

**Where it's used**:
- Hooks: `"command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate.sh"`
- MCP servers: `"args": ["${CLAUDE_PLUGIN_ROOT}/servers/server.js"]`
- Skill documentation: "See ${CLAUDE_PLUGIN_ROOT}/references/api.md"
- Executed scripts: Available as env var in bash/Python

**What NOT to do**:
- Hardcoded paths: `/Users/name/plugins/...` ❌
- Working directory relative: `./scripts/...` ❌
- Home directory shortcuts: `~/plugins/...` ❌

---

## 11. Naming Conventions

### Commands
- Format: kebab-case `.md` files
- Example: `code-review.md` → `/code-review`
- 2-3 words ideal

### Agents
- Format: kebab-case `.md` files describing role
- Example: `test-generator.md`, `code-reviewer.md`

### Skills
- Format: kebab-case directory names
- Example: `api-testing/`, `database-migrations/`
- Topic-focused, clear purpose

### Scripts/Supporting Files
- Format: kebab-case with extensions
- Example: `validate-input.sh`, `process-data.js`

---

## 12. Summary: Plugin Packaging Agent-Almanac

### What Would Be Needed

1. **Wrap in plugin structure**:
   ```
   agent-almanac-plugin/
   ├── .claude-plugin/
   │   └── plugin.json          # NEW
   └── skills/                  # SYMLINK from existing skills/
   ```

2. **Create minimal plugin.json**:
   ```json
   {
     "name": "agent-almanac",
     "description": "339 agentic skills across 60+ domains...",
     "version": "1.0.0",
     "author": {
       "name": "Philipp Thoss",
       "email": "ph.thoss@gmx.de"
     },
     "repository": "https://github.com/pjt222/agent-almanac"
   }
   ```

3. **Organize skills**:
   - Current: `skills/skill-name/SKILL.md` ✅ Already matches plugin format
   - No changes needed—skills auto-discover

4. **Optional: Include agents, guides**:
   - Create `agents/` directory with agent definitions
   - Include `guides/` as documentation or skill references

### Compatibility

**✅ Full Compatibility**:
- `SKILL.md` format identical (agentskills.io standard)
- Directory structure matches
- Progressive disclosure pattern (references/examples) works in plugins
- All 339 skills port as-is

**Bonus**: Skills already have proper frontmatter, descriptions, and triggers—ready for plugin auto-discovery

---

## 13. Key Files Located

| File Path | Purpose | Size |
|-----------|---------|------|
| `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/commit-commands/` | Minimal command plugin (reference) | 3 commands |
| `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/` | Full-featured plugin (reference) | 8 skills + docs |
| `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/skill-creator/` | Complex skill with agents & scripts | 1 skill + 3 agents |
| `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/mcp-server-dev/` | Multi-skill plugin with references | 3 skills |
| `/home/phtho/.claude/plugins/marketplaces/claude-plugins-official/plugins/example-plugin/` | Demonstration of all features | Minimal + all types |

---

## 14. Conclusion

**Claude Code plugins are well-suited for agent-almanac because**:

1. **Skill format is identical** — no conversion needed
2. **Auto-discovery mechanism** — just place `SKILL.md` files in `skills/` directory
3. **Minimal manifest** — only need `plugin.json` with name
4. **Portability built-in** — `${CLAUDE_PLUGIN_ROOT}` variable handles paths
5. **No breaking changes** — existing documentation and structure work as-is
6. **MCP integration optional** — can add later if needed for external services
7. **Progressive disclosure pattern** — plugin directory supports `references/`, `examples/`, `scripts/`

**Next steps for packaging agent-almanac as a plugin**:
- Wrap in `.claude-plugin/plugin.json` manifest
- Optionally add `agents/` directory with agent definitions
- Optionally add guides as skill references or documentation
- Consider marketplace submission
