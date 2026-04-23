---
name: create-agent
locale: caveman-lite
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

Define a Claude Code subagent persona with a focused purpose, curated tools, assigned skills, and complete documentation following the agent template and registry conventions.

## When to Use

- Adding a new specialist agent to the library for a domain not yet covered
- Converting a recurring workflow or prompt pattern into a reusable agent persona
- Creating a domain-specific assistant with curated skills and constrained tools
- Splitting an overly broad agent into focused, single-responsibility agents
- Designing a new team member before composing a multi-agent team

## Inputs

- **Required**: Agent name (lowercase kebab-case, e.g., `data-engineer`)
- **Required**: One-line description of the agent's primary purpose
- **Required**: Purpose statement explaining the problem the agent solves
- **Optional**: Model choice (default: `sonnet`; alternatives: `opus`, `haiku`)
- **Optional**: Priority level (default: `normal`; alternatives: `high`, `low`)
- **Optional**: List of skills from `skills/_registry.yml` to assign
- **Optional**: MCP servers the agent requires (e.g., `r-mcptools`, `hf-mcp-server`)

## Procedure

### Step 1: Design the Agent Persona

Choose a clear, focused identity for the agent:

- **Name**: lowercase kebab-case, descriptive of the role. Start with a noun or domain qualifier: `security-analyst`, `r-developer`, `tour-planner`. Avoid generic names like `helper` or `assistant`.
- **Purpose**: one paragraph explaining the specific problem this agent solves. Ask: "What does this agent do that no existing agent covers?"
- **Communication style**: consider the domain. Technical agents should be precise and citation-heavy. Creative agents can be more exploratory. Compliance agents should be formal and audit-oriented.

Before proceeding, check for overlap with the existing 53 agents:

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**Got:** No existing agent covers the same niche. If an existing agent partially overlaps, consider extending it instead of creating a new one.

**If fail:** If an agent with significant overlap exists, either extend that agent's skills list or narrow your new agent's scope to complement rather than duplicate it.

### Step 2: Select Tools

Choose the minimal set of tools the agent needs. Principle of least privilege applies:

| Tool Set | When to Use | Example Agents |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | Read-only analysis, review, auditing | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | Analysis plus external lookups | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | Full development — creating/modifying code | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | Development plus external research | polymath, shapeshifter |

Do not include `Bash` for agents that only analyze code. Do not include `WebFetch` or `WebSearch` unless the agent genuinely needs to look up external resources.

**Got:** Tool list contains only tools the agent will actually use in its primary workflows.

**If fail:** Review the agent's capabilities list — if a capability does not require a tool, remove the tool.

### Step 3: Choose Model

Select the model based on task complexity:

- **`sonnet`** (default): Most agents. Good balance of reasoning and speed. Use for development, review, analysis, and standard workflows.
- **`opus`**: Complex reasoning, multi-step planning, nuanced judgment. Use for senior-level agents, architectural decisions, or tasks requiring deep domain expertise.
- **`haiku`**: Simple, fast responses. Use for agents doing straightforward lookups, formatting, or template-filling.

**Got:** Model matches the cognitive demands of the agent's primary use cases.

**If fail:** When in doubt, use `sonnet`. Upgrade to `opus` only if testing reveals insufficient reasoning quality.

### Step 4: Assign Skills

Browse the skills registry and select skills relevant to the agent's domain:

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

Build the skills list for the frontmatter:

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**Important**: All agents automatically inherit the default skills (`meditate`, `heal`) from the registry-level `default_skills` field. Do NOT list these in the agent's frontmatter unless they are core to the agent's methodology (e.g., the `mystic` agent lists `meditate` because meditation facilitation is its primary purpose).

**Got:** Skills list contains 3-15 skill IDs that exist in `skills/_registry.yml`.

**If fail:** Verify each skill ID exists: `grep "id: skill-name" skills/_registry.yml`. Remove any that do not match.

### Step 5: Write the Agent File

Copy the template and fill in the frontmatter:

```bash
cp agents/_template.md agents/<agent-name>.md
```

Fill in the YAML frontmatter:

```yaml
---
name: agent-name
locale: caveman-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

**Got:** YAML frontmatter parses without errors. All required fields (`name`, `description`, `tools`, `model`, `version`, `author`) are present.

**If fail:** Validate YAML syntax. Common issues: missing quotes around version strings, incorrect indentation, unclosed brackets in tool lists.

### Step 6: Write Purpose and Capabilities

Replace the template placeholder sections:

**Purpose**: One paragraph explaining the specific problem this agent solves and the value it provides. Be concrete — name the domain, the workflow, and the outcome.

**Capabilities**: Bulleted list with bold lead-ins. Group by category if the agent has many capabilities:

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**: List each assigned skill with a brief description. Use bare skill IDs (the slash-command names):

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**Got:** Purpose is specific (not "helps with development"), capabilities are concrete and verifiable, skills list matches frontmatter.

**If fail:** If the purpose feels vague, answer: "What specific task would a user ask this agent to do?" Use that answer as the purpose.

### Step 7: Write Usage Scenarios and Examples

Provide 2-3 usage scenarios showing how to spawn the agent:

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

Add 1-2 concrete examples showing a user request and the expected agent behavior:

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**Got:** Scenarios are realistic, examples show actual value, invocation patterns match Claude Code conventions.

**If fail:** Test the examples mentally — would the agent actually be able to fulfill the request with its assigned tools and skills?

### Step 8: Write Limitations and See Also

**Limitations**: 3-5 honest constraints. What the agent cannot do, should not be used for, or where it might produce poor results:

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**: Cross-reference complementary agents, relevant guides, and related teams:

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**Got:** Limitations are honest and specific. See Also references existing files.

**If fail:** Check that referenced files exist: `ls agents/complementary-agent.md`.

### Step 9: Add to Registry

Edit `agents/_registry.yml` and add the new agent entry in alphabetical position:

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

Increment the `total_agents` count at the top of the file.

**Got:** Registry entry matches the agent file frontmatter. `total_agents` equals the actual number of agent entries.

**If fail:** Count entries with `grep -c "^  - id:" agents/_registry.yml` and verify it matches `total_agents`.

### Step 10: Verify Discovery

Claude Code discovers agents from the `.claude/agents/` directory. In this repository, that directory is a symlink to `agents/`:

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

If the `.claude/agents/` symlink is intact, no additional action is needed — the new agent file is automatically discoverable.

Run the README automation to update the agents README:

```bash
npm run update-readmes
```

**Got:** `.claude/agents/<agent-name>.md` resolves to the new agent file. `agents/README.md` includes the new agent.

**If fail:** If the symlink is broken, recreate it: `ln -sf ../agents .claude/agents`. If `npm run update-readmes` fails, check that `scripts/generate-readmes.js` exists and `js-yaml` is installed.

### Step 11: Scaffold Translations

> **Required for all agents.** This step applies to both human authors and AI agents following this procedure. Do not skip — missing translations accumulate into stale backlog.

Scaffold translation files for all 4 supported locales immediately after committing the new agent:

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

Then translate the scaffolded prose in each file (code blocks and IDs stay in English). Finally regenerate the status files:

```bash
npm run translation:status
```

**Got:** 4 files created at `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`, all with `source_commit` matching current HEAD. `npm run validate:translations` shows 0 stale warnings for the new agent.

**If fail:** If scaffold fails, verify the agent exists in `agents/_registry.yml`. If status files don't update, run `npm run translation:status` explicitly — it is not triggered automatically by CI.

## Validation

- [ ] Agent file exists at `agents/<agent-name>.md`
- [ ] YAML frontmatter parses without errors
- [ ] All required fields present: `name`, `description`, `tools`, `model`, `version`, `author`
- [ ] `name` field matches the filename (without `.md`)
- [ ] All sections present: Purpose, Capabilities, Available Skills, Usage Scenarios, Examples, Limitations, See Also
- [ ] Skills in frontmatter exist in `skills/_registry.yml`
- [ ] Default skills (`meditate`, `heal`) are NOT listed unless core to agent methodology
- [ ] Tools list follows least-privilege principle
- [ ] Agent is listed in `agents/_registry.yml` with correct path and matching metadata
- [ ] `total_agents` count in registry is updated
- [ ] `.claude/agents/` symlink resolves to the new agent file
- [ ] No significant overlap with existing agents

## Pitfalls

- **Tool over-provisioning**: Including `Bash`, `Write`, or `WebFetch` when the agent only needs to read and analyze. This violates least-privilege and can lead to unintended side effects. Start with the minimal set and add tools only when a capability requires them.
- **Missing or wrong skill assignments**: Listing skill IDs that do not exist in the registry, or forgetting to assign skills entirely. Always verify each skill ID with `grep "id: skill-name" skills/_registry.yml` before adding it.
- **Listing default skills unnecessarily**: Adding `meditate` or `heal` to the agent frontmatter when they are already inherited from the registry. Only list them if they are core to the agent's methodology (e.g., `mystic`, `alchemist`, `gardener`, `shaman`).
- **Scope overlap with existing agents**: Creating a new agent that duplicates functionality already covered by one of the 53 existing agents. Always search the registry first and consider extending an existing agent's skills instead.
- **Vague purpose and capabilities**: Writing "helps with development" instead of "scaffolds R packages with complete structure, documentation, and CI/CD configuration." Specificity is what makes an agent useful and discoverable.

## Related Skills

- `create-skill` - the parallel procedure for creating SKILL.md files instead of agent files
- `create-team` - compose multiple agents into a coordinated team (planned)
- `commit-changes` - commit the new agent file and registry update
