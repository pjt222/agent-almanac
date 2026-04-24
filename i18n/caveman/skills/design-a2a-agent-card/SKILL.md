---
name: design-a2a-agent-card
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Make A2A Agent Card. Advertises agent identity, skills, auth, capabilities. Other agents find it.

## When Use

- Build agent others must discover via A2A
- Expose agent capabilities for multi-agent orchestration
- Migrate existing agent to A2A (Agent-to-Agent) protocol
- Define public contract before implementation
- Integrate with agent registries that read Agent Cards

## Inputs

- **Required**: Agent name + description
- **Required**: Skill list (name, description, input/output schemas)
- **Required**: Base URL where agent hosted
- **Optional**: Auth method (`none`, `oauth2`, `oidc`, `api-key`)
- **Optional**: Content types beyond `text/plain` (e.g., `image/png`, `application/json`)
- **Optional**: Capability flags (streaming, push notifications, state history)
- **Optional**: Provider org name + URL

## Steps

### Step 1: Set Agent Identity + Description

1.1. Pick identity fields:

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

1.2. Write clear, actionable description. Answer:
   - What domains agent covers?
   - What tasks handles?
   - What limits?

1.3. Set canonical URL where Agent Card served at `/.well-known/agent.json`.

**Got:** Full identity block: name, description, URL, provider, version.

**If fail:** Agent covers many domains? Decide: one agent, many skills? Or many agents, focused scope? A2A prefers focused agents, clear boundaries.

### Step 2: List Skills with I/O Schemas

2.1. Define each skill:

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

2.2. Each skill needs:
   - **id**: Unique ID (kebab-case)
   - **name**: Human-readable name
   - **description**: What skill does, 1-2 sentences
   - **tags**: Keywords for discovery
   - **examples**: Natural-language task examples that trigger skill
   - **inputModes**: MIME types skill takes
   - **outputModes**: MIME types skill produces

2.3. Skill boundaries must be clear, no overlap. Each task → one skill.

**Got:** Skills array. Each entry: id, name, description, tags, examples, I/O modes.

**If fail:** Skills overlap big? Merge into broader skill with more examples. Skill too broad? Split into focused sub-skills.

### Step 3: Config Auth

3.1. Pick auth scheme by deploy context:

**No auth (local/trusted network):**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0 (best for prod):**

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

**API Key (simple shared secret):**

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

3.2. Pick minimum viable auth for env:
   - Local dev: `none`
   - Internal service: `apiKey`
   - Public-facing: `oauth2` or `oidc`

3.3. Document token/key provisioning in provider section or external docs.

**Got:** Auth block matches deploy security needs.

**If fail:** No OAuth 2.0 infra? Start with API key, plan migration. Never deploy public agent with `none` auth.

### Step 4: Declare Capabilities

4.1. Declare protocol features agent supports:

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. Set each flag by impl readiness:

   - **streaming**: `true` if agent supports SSE streaming via `tasks/sendSubscribe`. Real-time progress for long tasks.
   - **pushNotifications**: `true` if agent can send webhook callbacks on state change. Agent stores + calls webhook URLs.
   - **stateTransitionHistory**: `true` if agent keeps full state transition history (submitted, working, completed). Good for audit.

4.3. Only set `true` if impl fully supports. Fake flags break interop.

**Got:** Capabilities object. Flags match real impl.

**If fail:** Unsure if capability coming? Set `false`. Add later. Removing capability = breaking change.

### Step 5: Validate + Publish Agent Card

5.1. Assemble full card:

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

5.2. Validate:
   - Parse as JSON, check no syntax err
   - All required fields present (name, description, url, skills)
   - Each skill has id, name, description, min 1 I/O mode
   - URL reachable, serves card at `/.well-known/agent.json`

5.3. Publish:
   - Serve at `https://<agent-url>/.well-known/agent.json`
   - Set `Content-Type: application/json`
   - Enable CORS if cross-origin discovery needed
   - Register with relevant agent registries

5.4. Test by fetching:

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**Got:** Valid JSON Agent Card at well-known URL. Any A2A client can parse.

**If fail:** JSON invalid? Use linter to find syntax err. URL unreachable? Check DNS, SSL cert, web server config. CORS needed? Add `Access-Control-Allow-Origin` headers.

## Checks

- [ ] Agent Card valid JSON, no syntax err
- [ ] Required fields present: name, description, url, skills
- [ ] Each skill has id, name, description, inputModes, outputModes
- [ ] Auth scheme matches deploy security
- [ ] Capability flags match impl
- [ ] Served at `/.well-known/agent.json`, right Content-Type
- [ ] A2A clients fetch + parse OK
- [ ] Examples realistic, trigger right skill

## Pitfalls

- **Overpromising capabilities**: `streaming: true` or `pushNotifications: true` without impl = client fails when used. Be conservative.
- **Vague skill description**: "does data stuff" blocks accurate matching. Be specific about inputs, outputs, domains.
- **Missing CORS headers**: Browser A2A clients can't fetch Agent Card without CORS.
- **Skill overlap**: Two skills handle same task → client can't pick. Keep boundaries clear.
- **Forgetting default modes**: No `defaultInputModes`/`defaultOutputModes` → clients unsure what content types to send.
- **Version stagnation**: Bump version when skills/capabilities change. Clients cache old versions.
- **Publish before impl**: Agent Card = contract. Publishing unimplemented skills → runtime failure.

## See Also

- `implement-a2a-server` - impl server behind Agent Card
- `test-a2a-interop` - validate Agent Card conformance + interop
- `build-custom-mcp-server` - MCP as alt/complement to A2A
- `configure-mcp-server` - MCP config patterns for A2A setup
