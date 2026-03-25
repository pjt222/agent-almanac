---
title: "Agent Configuration Schema"
description: "YAML frontmatter field definitions, validation rules, and JSON Schema for agent files"
category: reference
agents: []
teams: []
skills: [create-agent, evolve-agent]
---

# Configuration Schema

This document defines the configuration schema for Claude Code agents, including YAML frontmatter structure and validation rules.

## YAML Frontmatter Schema

### Required Fields

```yaml
name: string
  # Unique identifier for the agent
  # Must be lowercase, hyphen-separated (kebab-case)
  # Example: "code-reviewer", "r-developer"

description: string
  # Brief description of the agent's purpose (1-2 sentences)
  # Should clearly explain what the agent does
  # Example: "Reviews code changes and provides quality feedback"

tools: array<string>
  # List of Claude Code tools the agent requires
  # Available tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch, Task, etc.
  # Example: ["Read", "Write", "Edit", "Bash"]

model: string
  # Claude model to use for this agent
  # Recommended: "sonnet" for most agents
  # Options: sonnet, opus, haiku

version: string
  # Semantic version of the agent
  # Format: "major.minor.patch"
  # Example: "1.0.0", "2.1.3"

author: string
  # Author name and contact information
  # Format: "Name" or "Name <email>"
  # Example: "Philipp Thoss" or "Philipp Thoss <ph.thoss@gmx.de>"
```

### Optional Fields

```yaml
created: string (ISO 8601 date)
  # Creation date of the agent
  # Format: YYYY-MM-DD
  # Example: "2025-01-25"

updated: string (ISO 8601 date)
  # Last modification date
  # Format: YYYY-MM-DD
  # Example: "2025-01-25"

tags: array<string>
  # Categorical tags for the agent
  # Used for organization and discovery
  # Example: ["development", "security", "R", "analysis"]

priority: string
  # Importance level of the agent
  # Options: low, normal, high, critical
  # Default: "normal"

max_context_tokens: integer
  # Maximum context window for the agent
  # Claude Sonnet: up to 200,000 tokens
  # Default: 200000

mcp_servers: array<string>
  # List of MCP servers this agent integrates with
  # Example: ["r-mcptools", "hf-mcp-server"]

skills: array<string>
  # Core skill IDs loaded into subagent context on spawn — max 5
  # Choose identity skills that define the agent's primary procedures
  # Uses bare skill IDs (slash-command names), not full paths
  # List remaining skills in the "Available Skills" body section
  # Example: ["create-r-package", "write-testthat-tests", "submit-to-cran"]

default_skills: array<object>    # REGISTRY-LEVEL ONLY
  # Skills automatically inherited by ALL agents
  # Defined at registry top-level, not per-agent
  # Each entry: { id: string, domain: string, description: string }
  # Agents need not list these in their own skills array
  # Example: [{ id: "meditate", domain: "esoteric", description: "..." }]

settings: object
  # Agent-specific configuration options
  # Structure varies by agent type
  # Example: { "strictMode": true, "outputFormat": "detailed" }

dependencies: array<string>
  # Other agents or external tools required
  # Example: ["code-reviewer", "git"]

language: string
  # Primary programming language focus
  # Example: "R", "Python", "JavaScript", "multi-language"

domain: string
  # Domain or field of expertise
  # Example: "web-development", "data-science", "security"

license: string
  # License for the agent definition
  # Example: "MIT", "Apache-2.0"

homepage: string
  # URL to agent documentation or homepage
  # Example: "https://github.com/user/agent-name"
```

## Validation Rules

### Name Validation
- Must be unique within the agent collection
- Lowercase letters, numbers, and hyphens only
- Cannot start or end with hyphen
- Maximum 50 characters
- Pattern: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`

### Description Validation
- Minimum 10 characters, maximum 200 characters
- Should be a complete sentence or sentences
- Should not end with a period if it's a single phrase
- Must accurately describe the agent's primary purpose

### Tools Validation
- Must be a non-empty array
- All tools must be valid Claude Code tools
- Common tools: `Read`, `Write`, `Edit`, `Bash`, `Grep`, `Glob`, `WebFetch`, `Task`
- Custom tools can be specified but should be documented

### Model Validation
- Must be a supported Claude model shorthand
- Current recommended models:
  - `sonnet` (default, balanced capability and speed)
  - `opus` (most capable, complex reasoning)
  - `haiku` (fastest, simple tasks)

### Version Validation
- Must follow semantic versioning (semver)
- Pattern: `^(\d+)\.(\d+)\.(\d+)$`
- Should increment appropriately:
  - Major: Breaking changes to agent interface
  - Minor: New features, backward compatible
  - Patch: Bug fixes, documentation updates

### Tags Validation
- Maximum 10 tags per agent
- Each tag: lowercase, hyphen-separated, max 20 characters
- Common tags: `development`, `security`, `analysis`, `documentation`, `testing`
- Language tags: `python`, `javascript`, `r`, `go`, `rust`
- Domain tags: `web-dev`, `data-science`, `devops`, `ml`

### Skills Validation
- Each skill ID must exist in `skills/_registry.yml`
- Use bare skill IDs (e.g., `create-r-package`), not full paths
- Skills should match the agent's domain expertise
- Skills listed in frontmatter must correspond to the `## Available Skills` section in the agent body
- The same skill can appear in multiple agents (e.g., `security-audit-codebase` in both code-reviewer and security-analyst)

## Example Complete Configuration

```yaml
---
name: advanced-r-analyst
description: Performs advanced statistical analysis and modeling in R with comprehensive reporting capabilities
tools: [Read, Write, Edit, Bash, Grep, Glob, WebFetch]
model: sonnet
version: "2.1.0"
author: Philipp Thoss <ph.thoss@gmx.de>
created: 2025-01-25
updated: 2025-01-25
tags: [R, statistics, analysis, modeling, reporting, data-science]
priority: high
max_context_tokens: 200000
mcp_servers: [r-mcptools, r-mcp-server]
skills: [create-r-package, write-roxygen-docs, write-testthat-tests, submit-to-cran]
language: R
domain: data-science
license: MIT
homepage: https://github.com/pjt222/claude-code-agents
settings:
  analysis_depth: comprehensive
  report_format: rmarkdown
  statistical_threshold: 0.05
  visualization_style: ggplot2
  package_preferences: [tidyverse, data.table]
dependencies: [r-developer]
---
```

## Schema Extensions

### Custom Settings Schema
Different agent types may define custom settings:

#### Code Review Agent Settings
```yaml
settings:
  severity_levels: [low, medium, high, critical]
  focus_areas: [security, performance, maintainability]
  max_issues_per_file: 10
  include_suggestions: true
```

#### R Development Agent Settings
```yaml
settings:
  coding_style: tidyverse  # tidyverse, base_r, data_table
  documentation_style: roxygen2
  testing_framework: testthat
  cran_compliance: true
  package_checks: true
```

#### Security Analysis Agent Settings
```yaml
settings:
  compliance_frameworks: [OWASP, NIST, ISO27001]
  vulnerability_sources: [CVE, NVD, GHSA]
  severity_threshold: medium
  scan_depth: comprehensive
```

## Validation Tools

### YAML Linting
Use yamllint to validate YAML syntax:
```bash
yamllint agents/*.md
```

### Schema Validation
Create a JSON Schema validator for agent configurations:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "description", "tools", "model", "version", "author"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$",
      "maxLength": 50
    },
    "description": {
      "type": "string",
      "minLength": 10,
      "maxLength": 200
    },
    "tools": {
      "type": "array",
      "items": {"type": "string"},
      "minItems": 1
    }
  }
}
```

## Best Practices

1. **Consistent Naming**: Use clear, descriptive names that indicate the agent's purpose
2. **Accurate Descriptions**: Write descriptions that help users understand when to use the agent
3. **Minimal Tool Lists**: Only include tools the agent actually needs
4. **Semantic Versioning**: Follow semver principles for version updates
5. **Meaningful Tags**: Use tags that aid in agent discovery and organization
6. **Documentation**: Keep agents well-documented with clear usage examples
7. **Testing**: Validate agent configurations before deployment
8. **Regular Updates**: Keep agents updated with changing requirements

## Migration Guide

### Updating Schema Version
When updating the schema:
1. Update the agent version appropriately
2. Add migration notes in the agent documentation
3. Test compatibility with existing workflows
4. Update examples and templates

### Backward Compatibility
- New optional fields can be added without breaking existing agents
- Required field changes require major version bump
- Deprecated fields should be marked in documentation before removal
