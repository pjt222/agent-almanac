---
name: create-agent
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new agent definition file following the agent-almanac
  agent template and registry conventions. Covers persona design,
  tool selection, skill assignment, model choice, frontmatter schema,
  required sections, registry integration, and discovery symlink
  verification. Use when adding a new specialized agent to the library,
  defining a persona for a Claude Code subagent, or creating a
  domain-specific assistant with curated skills and tools.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, creation, persona, agentskills
---

# Create a New Agent

Define Claude Code subagent persona: focused purpose + curated tools + skills + docs.

## Use When

- New specialist agent for uncovered domain
- Convert recurring workflow → reusable persona
- Domain-specific assistant w/ curated skills + tools
- Split broad agent → single-responsibility
- Design new team member pre-composition

## In

- **Required**: Name (kebab-case, `data-engineer`)
- **Required**: 1-line desc of primary purpose
- **Required**: Purpose statement
- **Optional**: Model (def: `sonnet`; alt: `opus`, `haiku`)
- **Optional**: Priority (def: `normal`; alt: `high`, `low`)
- **Optional**: Skills from `skills/_registry.yml`
- **Optional**: MCP servers (`r-mcptools`, `hf-mcp-server`)

## Do

### Step 1: Persona

- **Name**: kebab-case, role-descriptive. Noun/domain prefix: `security-analyst`, `r-developer`. Avoid `helper`/`assistant`.
- **Purpose**: 1 paragraph → specific problem. "What does this agent do no existing covers?"
- **Style**: Tech → precise + citations. Creative → exploratory. Compliance → formal + audit.

Check overlap w/ existing 53 agents:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**Got:** No overlap. If partial → extend existing.

**If err:** Significant overlap → extend agent's skills OR narrow scope to complement.

### Step 2: Tools

Min tool set, least-privilege.

| Tool Set | Use When | Example Agents |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | Read-only analysis, review, audit | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | Analysis + external lookup | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | Full dev — create/modify code | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | Dev + external research | polymath, shapeshifter |

No `Bash` for analyze-only. No `WebFetch`/`WebSearch` unless external lookup needed.

**Got:** Tool list only what agent uses in primary workflows.

**If err:** Cap doesn't need tool → remove.

### Step 3: Model

- **`sonnet`** (def): Most agents. Reasoning + speed. Dev, review, analysis.
- **`opus`**: Complex reasoning, multi-step, nuanced. Senior agents, arch, deep domain.
- **`haiku`**: Simple fast. Lookups, formatting, templates.

**Got:** Model matches cognitive demand.

**If err:** Doubt → `sonnet`. Upgrade → `opus` only if insufficient.

### Step 4: Skills

Browse registry, select domain skills:

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

Build skills list:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**Important**: All agents auto-inherit defaults (`meditate`, `heal`) from registry `default_skills`. Do NOT list unless core to methodology (e.g., `mystic` lists `meditate` → its primary purpose).

**Got:** 3-15 skill IDs exist in `skills/_registry.yml`.

**If err:** Verify: `grep "id: skill-name" skills/_registry.yml`. Remove non-matching.

### Step 5: Write File

```bash
cp agents/_template.md agents/<agent-name>.md
```

Fill frontmatter:

```yaml
---
name: agent-name
description: One to two sentences describing primary capability and domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Note: All agents inherit default skills (meditate, heal) from the registry.
# Only list them here if they are core to this agent's methodology.
# mcp_servers: []  # Uncomment and populate if MCP servers are needed
---
```

**Got:** YAML parses. Required fields present.

**If err:** Validate syntax. Common: missing quotes on ver, bad indent, unclosed brackets.

### Step 6: Purpose + Capabilities

**Purpose**: 1 paragraph → specific problem + value. Concrete: domain, workflow, outcome.

**Capabilities**: Bullets w/ bold leads. Group by cat if many:

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**: Bare IDs + brief:

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**Got:** Purpose specific (not "helps w/ dev"), caps concrete + verifiable, skills match frontmatter.

**If err:** Vague → "What specific task user asks?" → use as purpose.

### Step 7: Usage Scenarios + Examples

2-3 scenarios → spawn patterns:

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

1-2 examples → req + expected behavior:

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**Got:** Scenarios realistic, examples show value, spawn patterns match Claude Code.

**If err:** Mental test → could agent fulfill w/ assigned tools + skills?

### Step 8: Limitations + See Also

**Limitations**: 3-5 honest. Cannot / should not / poor result scenarios:

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**: Cross-ref complementary agents, guides, teams:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**Got:** Limits honest + specific. See Also refs exist.

**If err:** `ls agents/complementary-agent.md` → verify.

### Step 9: Registry

Edit `agents/_registry.yml`, add entry alphabetical:

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Same one-line description from frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

Increment `total_agents`.

**Got:** Entry matches frontmatter. `total_agents` = count.

**If err:** `grep -c "^  - id:" agents/_registry.yml` → verify match.

### Step 10: Discovery

Claude Code → `.claude/agents/` → symlink to `agents/`:

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

Symlink intact → auto-discoverable.

Regen README:

```bash
npm run update-readmes
```

**Got:** Symlink resolves. `agents/README.md` has new agent.

**If err:** Broken → `ln -sf ../agents .claude/agents`. Script fail → check `scripts/generate-readmes.js` + `js-yaml`.

### Step 11: Scaffold Translations

> **Required for all agents.** Human + AI authors. Do not skip → backlog.

Scaffold for 4 locales post-commit:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

Translate prose (code + IDs stay EN). Regen status:

```bash
npm run translation:status
```

**Got:** 4 files at `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`, `source_commit` = HEAD. `npm run validate:translations` → 0 stale.

**If err:** Scaffold fail → verify agent in registry. Status stale → run `npm run translation:status` explicitly (no CI auto).

## Check

- [ ] File at `agents/<agent-name>.md`
- [ ] YAML parses
- [ ] Required fields: `name`, `description`, `tools`, `model`, `version`, `author`
- [ ] `name` = filename (no `.md`)
- [ ] Sections: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills in frontmatter exist in registry
- [ ] Default skills (`meditate`, `heal`) NOT listed unless core
- [ ] Tools = least-privilege
- [ ] Registry entry + matching metadata
- [ ] `total_agents` updated
- [ ] `.claude/agents/` symlink resolves
- [ ] No overlap w/ existing

## Traps

- **Tool over-prov**: `Bash`/`Write`/`WebFetch` when only read-analyze. Start min, add as caps require.
- **Bad skill IDs**: Non-existent IDs / forgetting skills. Verify: `grep "id: skill-name" skills/_registry.yml`.
- **Redundant defaults**: `meditate`/`heal` already inherited. List only if core (`mystic`, `alchemist`, `gardener`, `shaman`).
- **Scope overlap**: Duplicating existing agent. Search registry → extend existing.
- **Vague purpose**: "Helps w/ dev" vs "scaffolds R pkgs w/ full struct + docs + CI". Specificity = useful + discoverable.

## →

- `create-skill` — parallel SKILL.md proc
- `create-team` — compose agents → team
- `commit-changes` — commit agent + registry
