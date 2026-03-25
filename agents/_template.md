---
name: your-agent-name
description: Brief description of what this agent does (1-2 sentences)
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Your Name
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [development, general]
priority: normal
max_context_tokens: 200000
skills: []
# Max 5 core skills — these get injected into subagent context on spawn.
# Choose identity skills that define this agent's primary procedures.
# List remaining skills in the "Available Skills" body section (loaded on demand).
# All agents inherit default skills (meditate, heal) from the registry.
# Only list default skills here if they are core to this agent's methodology.
# mcp_servers: []  # Optional: MCP servers this agent requires (e.g., r-mcptools, hf-mcp-server)
---

# Your Agent Name

A comprehensive description of what this agent does and its primary use cases.

## Purpose

Explain the specific problem this agent solves or the workflow it enhances.

## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capabilities**: Additional features and functionalities
- **Tool Integration**: How it leverages available tools
- **MCP Integration**: Any MCP server integrations (if applicable)

## Available Skills

List the skills from the [skills library](../skills/) this agent can execute. Use bare skill IDs (the slash-command names). Group by domain if the agent spans multiple domains, or use a flat list for a small number of skills.

<!-- Example:
- `skill-id` — Brief description
-->

## Usage Scenarios

### Scenario 1: Primary Use Case
Brief description of the main scenario where this agent excels.

```
Example command or interaction pattern
```

### Scenario 2: Alternative Use Case
Description of another common use case.

```
Example command or interaction pattern
```

## Best Practices

- Guideline 1: How to get the best results
- Guideline 2: Common pitfalls to avoid
- Guideline 3: When to use this agent vs others

## Examples

### Example 1: Basic Usage
```markdown
User: [Example user request]
Agent: [Expected agent response/behavior]
```

### Example 2: Advanced Usage
```markdown
User: [Complex user request]
Agent: [Expected agent response/behavior]
```

## Configuration Options (Optional)

Document any configurable parameters, environment variables, or settings that affect this agent's behavior.

| Option | Default | Description |
|--------|---------|-------------|
| `option_name` | `default_value` | What this option controls |

## Tool Requirements (Optional)

If this agent requires specific tools beyond the standard set, document them here. Include any MCP server dependencies, external CLIs, or API keys needed.

## Limitations

- Known limitation 1
- Known limitation 2
- Situations where this agent might not be appropriate

## See Also

- Related agents that complement this one
- Relevant documentation links
- MCP server documentation (if applicable)
