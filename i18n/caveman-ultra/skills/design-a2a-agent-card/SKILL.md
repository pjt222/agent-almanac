---
name: design-a2a-agent-card
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Standards-compliant A2A Agent Card → advertises identity, skills, auth, caps for discovery.

## Use When

- Discoverable by other A2A agents
- Expose caps → multi-agent orchestration
- Migrate agent → A2A protocol
- Public contract before impl
- Integrate → registries

## In

- **Required**: Agent name + desc
- **Required**: Skills list (name, desc, I/O schemas)
- **Required**: Base URL host
- **Optional**: Auth (`none`, `oauth2`, `oidc`, `api-key`)
- **Optional**: Content types beyond `text/plain`
- **Optional**: Cap flags (streaming, push, state history)
- **Optional**: Provider org + URL

## Do

### Step 1: Identity + desc

1.1. Identity fields:

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

1.2. Desc answers:
- Domains?
- Tasks?
- Limitations?

1.3. Canonical URL → `/.well-known/agent.json`.

→ Complete identity: name, desc, URL, provider, ver.

If err: Multi-domain → one agent w/ many skills vs many focused agents. A2A favors focused w/ clear bounds.

### Step 2: Skills + I/O schemas

2.1. Define each:

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

2.2. Each skill:
- **id**: Unique (kebab-case)
- **name**: Display
- **description**: 1-2 sentences
- **tags**: Searchable
- **examples**: NL task examples
- **inputModes**: MIME accepts
- **outputModes**: MIME produces

2.3. Bounds clear + non-overlap. Each task → one skill.

→ Skills array w/ id, name, desc, tags, examples, I/O.

If err: Skills overlap → merge broader w/ more examples. Too broad → split focused.

### Step 3: Auth

3.1. Scheme by deploy:

**No auth (local/trusted):**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0 (rec prod):**

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

**API Key (shared-secret):**

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

3.2. Min viable:
- Local dev → `none`
- Internal svc → `apiKey`
- Public → `oauth2` / `oidc`

3.3. Doc token/key provisioning → provider section or external docs.

→ Auth block matches deploy sec reqs.

If err: No OAuth infra → start apiKey + plan migration. NEVER public w/ `none`.

### Step 4: Caps

4.1. Protocol features:

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. Flags by impl:
- **streaming**: `true` if SSE via `tasks/sendSubscribe`. Real-time progress.
- **pushNotifications**: `true` if webhook callbacks on state. Requires store + call webhooks.
- **stateTransitionHistory**: `true` if full history (submitted, working, completed). Audit.

4.3. Only `true` if fully supported. Advertising unsupported → breaks interop.

→ Caps obj w/ flags matching impl.

If err: Unsure → `false`. Add in future. Removing = breaking change.

### Step 5: Validate + publish

5.1. Assemble:

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
- Parse JSON, no syntax errs
- Required fields (name, desc, url, skills)
- Each skill: id, name, desc, ≥1 I/O mode
- URL reachable, card at `/.well-known/agent.json`

5.3. Publish:
- Serve → `https://<agent-url>/.well-known/agent.json`
- `Content-Type: application/json`
- CORS if cross-origin
- Register → agent directories

5.4. Test discovery:

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

→ Valid JSON served at well-known URL, parseable by A2A client.

If err: JSON fail → lint. URL unreachable → DNS, SSL, web server. CORS → `Access-Control-Allow-Origin`.

## Check

- [ ] Valid JSON, no syntax errs
- [ ] Required: name, desc, url, skills
- [ ] Each skill: id, name, desc, inputModes, outputModes
- [ ] Auth matches deploy sec
- [ ] Caps reflect impl
- [ ] Served at `/.well-known/agent.json` + Content-Type
- [ ] A2A clients fetch + parse OK
- [ ] Examples realistic + trigger correct skill

## Traps

- **Overpromising caps**: `streaming: true` / `pushNotifications: true` w/o impl → client fails. Conservative.
- **Vague skill desc**: "does data stuff" → no match. Specific I/O + domains.
- **Missing CORS**: Browser A2A clients can't fetch w/o CORS.
- **Skill overlap**: 2 skills same task → clients can't pick. Clear bounds.
- **Forget default modes**: Missing `defaultInputModes`/`defaultOutputModes` → clients no MIME.
- **Ver stagnation**: Update ver when skills/caps change. Clients cache.
- **Publish before impl**: Card = contract. Publishing un-impl'd → runtime fails.

## →

- `implement-a2a-server` — server behind card
- `test-a2a-interop` — validate conformance + interop
- `build-custom-mcp-server` — MCP alt/complement
- `configure-mcp-server` — MCP patterns applicable
