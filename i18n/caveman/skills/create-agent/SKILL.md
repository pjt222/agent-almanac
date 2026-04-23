---
name: create-agent
locale: caveman
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

Define Claude Code subagent persona. Focused purpose, curated tools, assigned skills, complete docs. Follow agent template and registry rules.

## When Use

- Adding new specialist agent to library for new domain
- Converting recurring workflow or prompt pattern into reusable agent persona
- Creating domain-specific assistant with curated skills and constrained tools
- Splitting too-broad agent into focused single-responsibility agents
- Designing new team member before composing multi-agent team

## Inputs

- **Required**: Agent name (lowercase kebab-case, e.g., `data-engineer`)
- **Required**: One-line description of agent's primary purpose
- **Required**: Purpose statement explaining problem agent solves
- **Optional**: Model choice (default: `sonnet`; alternatives: `opus`, `haiku`)
- **Optional**: Priority level (default: `normal`; alternatives: `high`, `low`)
- **Optional**: List of skills from `skills/_registry.yml` to assign
- **Optional**: MCP servers agent needs (e.g., `r-mcptools`, `hf-mcp-server`)

## Steps

### Step 1: Design the Agent Persona

Pick clear, focused identity for agent:

- **Name**: lowercase kebab-case, describes role. Start with noun or domain qualifier: `security-analyst`, `r-developer`, `tour-planner`. Dodge generic names like `helper` or `assistant`.
- **Purpose**: one paragraph explaining specific problem this agent solves. Ask: "What does this agent do that no existing agent covers?"
- **Communication style**: think domain. Technical agents precise, citation-heavy. Creative agents can explore more. Compliance agents formal, audit-oriented.

Before moving on, check for overlap with existing 53 agents:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**Got:** No existing agent covers same niche. Existing agent partially overlaps? Consider extending it instead of creating new one.

**If fail:** Agent with big overlap exists? Either extend that agent's skills list or narrow your new agent's scope to complement, not duplicate.

### Step 2: Select Tools

Pick minimal tools agent needs. Principle of least privilege:

| Tool Set | When to Use | Example Agents |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | Read-only analysis, review, auditing | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | Analysis plus external lookups | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | Full development — creating/modifying code | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | Development plus external research | polymath, shapeshifter |

Do not include `Bash` for agents only analyzing code. Do not include `WebFetch` or `WebSearch` unless agent truly needs external lookups.

**Got:** Tool list has only tools agent will actually use in primary workflows.

**If fail:** Check agent's capabilities list — capability does not need tool? Remove tool.

### Step 3: Choose Model

Pick model based on task complexity:

- **`sonnet`** (default): Most agents. Good balance of reasoning and speed. Use for development, review, analysis, standard workflows.
- **`opus`**: Complex reasoning, multi-step planning, nuanced judgment. Use for senior-level agents, architectural decisions, tasks needing deep domain expertise.
- **`haiku`**: Simple, fast responses. Use for agents doing lookups, formatting, template-filling.

**Got:** Model matches cognitive demands of agent's primary use cases.

**If fail:** In doubt? Use `sonnet`. Upgrade to `opus` only if testing shows weak reasoning.

### Step 4: Assign Skills

Browse skills registry. Pick skills fitting agent's domain:

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

Build skills list for frontmatter:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**Important**: All agents auto-inherit default skills (`meditate`, `heal`) from registry-level `default_skills` field. Do NOT list these in agent's frontmatter unless core to agent's methodology (e.g., `mystic` agent lists `meditate` because meditation facilitation is primary purpose).

**Got:** Skills list has 3-15 skill IDs existing in `skills/_registry.yml`.

**If fail:** Verify each skill ID exists: `grep "id: skill-name" skills/_registry.yml`. Drop any that do not match.

### Step 5: Write the Agent File

Copy template. Fill in frontmatter:

```bash
cp agents/_template.md agents/<agent-name>.md
```

Fill in YAML frontmatter:

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

**Got:** YAML frontmatter parses without errors. All required fields (`name`, `description`, `tools`, `model`, `version`, `author`) present.

**If fail:** Validate YAML syntax. Common issues: missing quotes around version strings, wrong indentation, unclosed brackets in tool lists.

### Step 6: Write Purpose and Capabilities

Replace template placeholder sections:

**Purpose**: One paragraph explaining specific problem this agent solves and value it gives. Be concrete — name domain, workflow, outcome.

**Capabilities**: Bulleted list with bold lead-ins. Group by category if agent has many:

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**: List each assigned skill with brief description. Use bare skill IDs (slash-command names):

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**Got:** Purpose is specific (not "helps with development"), capabilities are concrete and verifiable, skills list matches frontmatter.

**If fail:** Purpose feels vague? Answer: "What specific task would user ask this agent to do?" Use that as purpose.

### Step 7: Write Usage Scenarios and Examples

Give 2-3 usage scenarios showing how to spawn agent:

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

Add 1-2 concrete examples showing user request and expected agent behavior:

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**Got:** Scenarios are realistic, examples show real value, invocation patterns match Claude Code conventions.

**If fail:** Test examples in head — would agent actually fulfill request with its assigned tools and skills?

### Step 8: Write Limitations and See Also

**Limitations**: 3-5 honest constraints. What agent cannot do, should not be used for, or where results poor:

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**: Cross-reference complementary agents, relevant guides, related teams:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**Got:** Limitations honest and specific. See Also references existing files.

**If fail:** Check referenced files exist: `ls agents/complementary-agent.md`.

### Step 9: Add to Registry

Edit `agents/_registry.yml`. Add new agent entry in alphabetical position:

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

Bump `total_agents` count at top of file.

**Got:** Registry entry matches agent file frontmatter. `total_agents` equals actual number of agent entries.

**If fail:** Count entries with `grep -c "^  - id:" agents/_registry.yml`. Verify matches `total_agents`.

### Step 10: Verify Discovery

Claude Code discovers agents from `.claude/agents/` directory. In this repo, that dir is symlink to `agents/`:

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

If `.claude/agents/` symlink intact, no extra action needed — new agent file auto-discoverable.

Run README automation to update agents README:

```bash
npm run update-readmes
```

**Got:** `.claude/agents/<agent-name>.md` resolves to new agent file. `agents/README.md` includes new agent.

**If fail:** Symlink broken? Recreate: `ln -sf ../agents .claude/agents`. `npm run update-readmes` fails? Check `scripts/generate-readmes.js` exists and `js-yaml` installed.

### Step 11: Scaffold Translations

> **Required for all agents.** This step applies to both human authors and AI agents following this procedure. Do not skip — missing translations pile into stale backlog.

Scaffold translation files for all 4 supported locales right after committing new agent:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

Then translate scaffolded prose in each file (code blocks and IDs stay English). Finally regenerate status files:

```bash
npm run translation:status
```

**Got:** 4 files created at `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`, all with `source_commit` matching current HEAD. `npm run validate:translations` shows 0 stale warnings for new agent.

**If fail:** Scaffold fails? Verify agent exists in `agents/_registry.yml`. Status files don't update? Run `npm run translation:status` explicitly — CI does not trigger it automatically.

## Checks

- [ ] Agent file exists at `agents/<agent-name>.md`
- [ ] YAML frontmatter parses without errors
- [ ] All required fields present: `name`, `description`, `tools`, `model`, `version`, `author`
- [ ] `name` field matches filename (no `.md`)
- [ ] All sections present: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills in frontmatter exist in `skills/_registry.yml`
- [ ] Default skills (`meditate`, `heal`) NOT listed unless core to agent methodology
- [ ] Tools list follows least-privilege
- [ ] Agent listed in `agents/_registry.yml` with correct path and matching metadata
- [ ] `total_agents` count in registry updated
- [ ] `.claude/agents/` symlink resolves to new agent file
- [ ] No big overlap with existing agents

## Pitfalls

- **Tool over-provisioning**: Giving `Bash`, `Write`, or `WebFetch` when agent only needs to read and analyze. Breaks least-privilege, can cause unintended side effects. Start minimal, add tools only when capability needs them.
- **Missing or wrong skill assignments**: Listing skill IDs not in registry, or forgetting skills entirely. Always verify each skill ID with `grep "id: skill-name" skills/_registry.yml` before adding.
- **Listing default skills unnecessarily**: Adding `meditate` or `heal` to frontmatter when already inherited from registry. Only list if core to agent's methodology (e.g., `mystic`, `alchemist`, `gardener`, `shaman`).
- **Scope overlap with existing agents**: Making new agent duplicating existing 53 agents. Search registry first. Consider extending existing agent's skills instead.
- **Vague purpose and capabilities**: Writing "helps with development" instead of "scaffolds R packages with complete structure, documentation, CI/CD config." Specificity makes agent useful and discoverable.

## See Also

- `create-skill` - parallel procedure for creating SKILL.md files instead of agent files
- `create-team` - compose many agents into coordinated team (planned)
- `commit-changes` - commit new agent file and registry update
