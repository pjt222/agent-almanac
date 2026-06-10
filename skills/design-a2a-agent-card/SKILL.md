---
name: design-a2a-agent-card
description: >
  Design an A2A Agent Card (.well-known/agent.json) manifest describing agent
  capabilities, skills, authentication requirements, and supported content types.
  Use when building an agent that must be discoverable by other A2A-compliant
  agents, exposing capabilities for multi-agent orchestration, migrating an
  existing agent to the A2A protocol, defining the public contract for an agent
  before implementation, or integrating with agent registries that consume Agent
  Cards.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: intermediate
  language: multi
  tags: a2a, agent-card, manifest, capabilities, interoperability
---

# Design A2A Agent Card

Create a standards-compliant A2A Agent Card that advertises an agent's identity, skills, authentication requirements, and capabilities for discovery by other agents.

## When to Use

- Building an agent that must be discoverable by other A2A-compliant agents
- Exposing agent capabilities for multi-agent orchestration
- Migrating an existing agent to the A2A (Agent-to-Agent) protocol
- Defining the public contract for an agent before implementation
- Integrating with agent registries or directories that consume Agent Cards

## Inputs

- **Required**: Agent name and description
- **Required**: List of skills the agent can perform (name, description, input/output schemas)
- **Required**: Base URL where the agent will be hosted
- **Optional**: Authentication method (`none`, `oauth2`, `oidc`, `api-key`)
- **Optional**: Supported content types beyond `text/plain` (e.g., `image/png`, `application/json`)
- **Optional**: Capability flags (streaming, push notifications, state transition history)
- **Optional**: Provider organization name and URL

## Procedure

### Step 1: Define Agent Identity and Description

1.1. Choose the agent identity fields:

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis, data visualization, and report generation on tabular datasets.",
  "url": "https://agent.example.com",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "version": "1.0.0"
}
```

1.2. Write a clear, actionable description that answers:
   - What domains does this agent cover?
   - What kinds of tasks can it handle?
   - What are its limitations?

1.3. Set the canonical URL where the Agent Card will be served at `/.well-known/agent.json`.

**Expected:** A complete identity block with name, description, URL, provider, and version.

**On failure:** If the agent serves multiple domains, consider whether it should be one agent with many skills or multiple agents with focused scopes. A2A favors focused agents with clear boundaries.

### Step 2: Enumerate Skills with Input/Output Schemas

2.1. Define each skill the agent can perform:

```json
{
  "skills": [
    {
      "id": "analyze-dataset",
      "name": "Analyze Dataset",
      "description": "Run descriptive statistics, correlation analysis, or hypothesis tests on a CSV dataset.",
      "tags": ["statistics", "data-analysis", "csv"],
      "examples": [
        "Analyze the correlation between columns A and B in my dataset",
        "Run a t-test comparing group 1 and group 2"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["text/plain", "application/json", "image/png"]
    },
    {
      "id": "generate-chart",
      "name": "Generate Chart",
      "description": "Create bar, line, scatter, or histogram charts from tabular data.",
      "tags": ["visualization", "charts"],
      "examples": [
        "Create a scatter plot of height vs weight",
        "Generate a histogram of the age column"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["image/png", "image/svg+xml"]
    }
  ]
}
```

2.2. For each skill, provide:
   - **id**: Unique identifier (kebab-case)
   - **name**: Human-readable display name
   - **description**: What the skill does, in one to two sentences
   - **tags**: Searchable keywords for discovery
   - **examples**: Natural language task examples that trigger this skill
   - **inputModes**: MIME types the skill accepts
   - **outputModes**: MIME types the skill can produce

2.3. Ensure skill boundaries are clear and non-overlapping. Each task should map to exactly one skill.

**Expected:** A skills array where each entry has id, name, description, tags, examples, and I/O modes.

**On failure:** If skills overlap significantly, merge them into a single broader skill with more examples. If a skill is too broad, split it into focused sub-skills.

### Step 3: Configure Authentication

3.1. Define the authentication scheme based on deployment context:

**No authentication (local/trusted network):**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0 (recommended for production):**

```json
{
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": {
      "oauth2": {
        "authorizationUrl": "https://auth.example.com/authorize",
        "tokenUrl": "https://auth.example.com/token",
        "scopes": {
          "agent:invoke": "Invoke agent skills",
          "agent:read": "Read task status"
        }
      }
    }
  }
}
```

**API Key (simple shared-secret):**

```json
{
  "authentication": {
    "schemes": ["apiKey"],
    "credentials": {
      "apiKey": {
        "headerName": "X-API-Key"
      }
    }
  }
}
```

3.2. Choose the minimum viable authentication for the deployment environment:
   - Local development: `none`
   - Internal services: `apiKey`
   - Public-facing agents: `oauth2` or `oidc`

3.3. Document the token/key provisioning process in the Agent Card's provider section or external documentation.

**Expected:** An authentication block matching the deployment security requirements.

**On failure:** If OAuth 2.0 infrastructure is not available, start with API key authentication and plan migration. Never deploy a public agent with `none` authentication.

### Step 4: Specify Capabilities

4.1. Declare what protocol features the agent supports:

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. Set each capability flag based on implementation readiness:

   - **streaming**: `true` if the agent supports SSE streaming via `tasks/sendSubscribe`. Enables real-time progress updates for long-running tasks.
   - **pushNotifications**: `true` if the agent can send webhook callbacks when task state changes. Requires the agent to store and call back webhook URLs.
   - **stateTransitionHistory**: `true` if the agent maintains a full history of task state transitions (submitted, working, completed, etc.). Useful for audit trails.

4.3. Only set capabilities to `true` if the implementation fully supports them. Advertising unsupported capabilities breaks interoperability.

**Expected:** A capabilities object with boolean flags matching actual implementation.

**On failure:** If unsure whether a capability will be implemented, set it to `false`. Capabilities can be added in future versions. Removing a capability is a breaking change.

### Step 5: Validate and Publish Agent Card

5.1. Assemble the complete Agent Card:

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis and visualization on tabular datasets.",
  "url": "https://agent.example.com",
  "version": "1.0.0",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": { ... }
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [ ... ],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"]
}
```

5.2. Validate the Agent Card:
   - Parse as JSON and verify no syntax errors
   - Verify all required fields are present (name, description, url, skills)
   - Verify each skill has id, name, description, and at least one input/output mode
   - Verify the URL is reachable and serves the card at `/.well-known/agent.json`

5.3. Publish the Agent Card:
   - Serve at `https://<agent-url>/.well-known/agent.json`
   - Set `Content-Type: application/json`
   - Enable CORS headers if cross-origin discovery is needed
   - Register with any relevant agent directories or registries

5.4. Test discovery by fetching the card:

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**Expected:** A valid JSON Agent Card served at the well-known URL, parseable by any A2A client.

**On failure:** If JSON validation fails, use a JSON linter to identify syntax errors. If the URL is not reachable, check DNS, SSL certificates, and web server configuration. If CORS is needed, add `Access-Control-Allow-Origin` headers.

## Validation

- [ ] Agent Card is valid JSON with no syntax errors
- [ ] All required fields are present: name, description, url, skills
- [ ] Each skill has id, name, description, inputModes, and outputModes
- [ ] Authentication scheme matches deployment security requirements
- [ ] Capability flags accurately reflect implementation status
- [ ] Agent Card is served at `/.well-known/agent.json` with correct Content-Type
- [ ] A2A clients can fetch and parse the card successfully
- [ ] Examples in skills are realistic and trigger the correct skill

## Common Pitfalls

- **Overpromising capabilities**: Setting `streaming: true` or `pushNotifications: true` without implementation causes client failures when those features are used. Be conservative.
- **Vague skill descriptions**: Descriptions like "does data stuff" prevent accurate skill matching. Be specific about inputs, outputs, and domains.
- **Missing CORS headers**: Browser-based A2A clients cannot fetch the Agent Card without proper CORS configuration.
- **Skill overlap**: If two skills could handle the same task, client agents cannot determine which to invoke. Ensure clear boundaries.
- **Forgetting default modes**: If `defaultInputModes` and `defaultOutputModes` are omitted, clients may not know what content types to send.
- **Version stagnation**: Update the Agent Card version when skills or capabilities change. Clients may cache old versions.
- **Publishing before implementation**: The Agent Card is a contract. Publishing skills that are not yet implemented leads to runtime failures.

## Related Skills

- `implement-a2a-server` - implement the server behind the Agent Card
- `test-a2a-interop` - validate Agent Card conformance and interoperability
- `build-custom-mcp-server` - MCP server as alternative/complement to A2A
- `configure-mcp-server` - MCP configuration patterns applicable to A2A setup
