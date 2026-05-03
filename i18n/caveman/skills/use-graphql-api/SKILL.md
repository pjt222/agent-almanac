---
name: use-graphql-api
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Interact with GraphQL APIs from command line — discover schemas via
  introspection, construct queries and mutations, execute with gh api
  graphql or curl, parse responses with jq, chain operations by piping
  IDs between calls. Use when automating GitHub Discussions, Issues, or
  Projects via GraphQL, integrating with any GraphQL endpoint from scripts,
  or building CLI workflows needing structured API data.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: intermediate
  language: multi
  tags: graphql, api, github, query, mutation, introspection
---

# Use GraphQL API

Discover, construct, execute, chain GraphQL operations from command line.

## When Use

- Query or mutate data via GraphQL endpoint (GitHub, Hasura, Apollo, etc.)
- Automate GitHub operations needing GraphQL (Discussions, Projects v2)
- Build shell scripts fetching structured data from GraphQL APIs
- Chain multiple GraphQL calls where output of one feeds next

## Inputs

- **Required**: GraphQL endpoint URL or service name (e.g., `github`)
- **Required**: Operation intent (what data to read or write)
- **Optional**: Auth token or method (default: `gh` CLI auth for GitHub)
- **Optional**: Output format preference (raw JSON, jq-filtered, variable assignment)

## Steps

### Step 1. Discover Schema

Determine available types, fields, queries, mutations.

**For GitHub:**

```bash
# List available query fields
gh api graphql -f query='{ __schema { queryType { fields { name description } } } }' \
  | jq '.data.__schema.queryType.fields[] | {name, description}'

# List available mutation fields
gh api graphql -f query='{ __schema { mutationType { fields { name description } } } }' \
  | jq '.data.__schema.mutationType.fields[] | {name, description}'

# Inspect a specific type
gh api graphql -f query='{
  __type(name: "Repository") {
    fields { name type { name kind ofType { name } } }
  }
}' | jq '.data.__type.fields[] | {name, type: .type.name // .type.ofType.name}'
```

**For generic endpoints:**

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**Got:** JSON output listing available types, fields, mutations. Schema response confirms endpoint reachable, auth token valid.

**If fail:**
- `401 Unauthorized` — verify token. For GitHub, run `gh auth status`
- `Cannot query field` — endpoint may disable introspection. Consult docs instead
- Connection refused — verify endpoint URL, network access

### Step 2. Identify Operation Type

Determine whether task needs query (read), mutation (write), or subscription (stream).

| Intent | Operation | Example |
|--------|-----------|---------|
| Fetch data | `query` | Get repository details, list discussions |
| Create/update/delete | `mutation` | Create discussion, add comment |
| Real-time updates | `subscription` | Watch for new issues (rare in CLI) |

For GitHub-specific operations, consult [GitHub GraphQL API docs](https://docs.github.com/en/graphql).

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**Got:** Clear identification of whether query or mutation needed. Plus exact operation name (e.g., `createDiscussion`, `repository`).

**If fail:**
- Operation not found — search with broader terms or check API version
- Unclear whether query or mutation — action changes state? It's mutation

### Step 3. Construct Operation

Build GraphQL query or mutation with fields, arguments, variables.

**Query example — fetch repository's discussion categories:**

```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 10) {
        nodes { id name }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" | jq '.data.repository.discussionCategories.nodes'
```

**Mutation example — create GitHub Discussion:**

```bash
gh api graphql -f query='
  mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: {
      repositoryId: $repoId,
      categoryId: $categoryId,
      title: $title,
      body: $body
    }) {
      discussion { url number }
    }
  }
' -f repoId="$REPO_ID" -f categoryId="$CAT_ID" \
  -f title="My Discussion" -f body="Discussion body here"
```

**Key construction rules:**

1. Always use variables (`$var: Type!`) instead of inline values for reusability
2. Request only fields needed to minimize response size
3. Use `first: N` with `nodes` for paginated connections
4. Add `id` to every object selection — needed for chaining

**Got:** Syntactically valid GraphQL operation with appropriate variables, field selections, pagination parameters.

**If fail:**
- Syntax errors — check bracket matching, trailing commas (GraphQL has no trailing commas)
- Type mismatch — verify variable types against schema (e.g., `ID!` vs `String!`)
- Missing required fields — add required input fields per schema

### Step 4. Execute via CLI

Run operation. Capture response.

**GitHub — using `gh api graphql`:**

```bash
# Simple query
gh api graphql -f query='{ viewer { login } }'

# With variables
gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id name }
  }' \
  -f owner="octocat" -f repo="Hello-World"

# With jq post-processing
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.id')
```

**Generic endpoint — using curl:**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**Got:** JSON response with `data` key containing requested fields, or `errors` array if operation failed.

**If fail:**
- `errors` array in response — read message. Common causes: missing permissions, invalid IDs, rate limits
- Empty `data` — query matched no records. Verify input values
- HTTP 403 — token lacks required scope. For GitHub, check `gh auth status`. Add scopes with `gh auth refresh -s scope`

### Step 5. Parse Response

Extract data needed from JSON response.

```bash
# Extract a single value
gh api graphql -f query='{ viewer { login } }' --jq '.data.viewer.login'

# Extract from a list
gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      issues(first: 5, states: OPEN) {
        nodes { number title }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.issues.nodes[] | "\(.number): \(.title)"'

# Assign to a variable for later use
CATEGORY_ID=$(gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 20) {
        nodes { id name }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.discussionCategories.nodes[] | select(.name == "Show and Tell") | .id')
```

**Got:** Clean, extracted values ready for display or assignment to shell variables.

**If fail:**
- `jq` returns null — field path wrong. Pipe raw JSON to `jq .` first to inspect structure
- Multiple values when expecting one — add `select()` filter or `| first`
- Unicode issues — add `-r` to jq for raw string output

### Step 6. Chain Operations

Use output from one operation as input to next.

```bash
# Step A: Get the repository ID
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="$OWNER" -f repo="$REPO" \
  --jq '.data.repository.id')

# Step B: Get the discussion category ID
CAT_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 20) {
        nodes { id name }
      }
    }
  }' \
  -f owner="$OWNER" -f repo="$REPO" \
  --jq '.data.repository.discussionCategories.nodes[]
    | select(.name == "Show and Tell") | .id')

# Step C: Create the discussion using both IDs
RESULT=$(gh api graphql \
  -f query='mutation($repoId: ID!, $catId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: {
      repositoryId: $repoId,
      categoryId: $catId,
      title: $title,
      body: $body
    }) {
      discussion { url number }
    }
  }' \
  -f repoId="$REPO_ID" -f catId="$CAT_ID" \
  -f title="$TITLE" -f body="$BODY" \
  --jq '.data.createDiscussion.discussion')

echo "Created: $(echo "$RESULT" | jq -r '.url')"
```

**Pattern:** Always extract `id` fields in earlier queries so they pass as `ID!` variables to subsequent mutations.

**Got:** Multi-step workflow where each call succeeds. IDs flow correct between operations.

**If fail:**
- Variable empty — previous step failed silent. Add `set -e`. Check each intermediate value
- ID format wrong — GitHub node IDs are opaque strings (e.g., `R_kgDO...`). Never construct manually
- Rate limited — add `sleep 1` between calls or batch queries using aliases

## Checks

1. Introspection query returns schema data (Step 1 succeeds)
2. Constructed queries syntactically valid (no GraphQL parser errors)
3. Responses contain `data` keys without `errors`
4. Extracted values match expected types (IDs non-empty strings, counts numbers)
5. Chained operations complete end-to-end (mutation uses IDs from prior queries)

## Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Forget `!` on required variable types | Always check schema for nullability. Most input fields non-null (`!`) |
| Use REST IDs in GraphQL | GraphQL uses opaque node IDs. Fetch via GraphQL, not REST |
| No paginate large result sets | Use `first`/`after` with `pageInfo { hasNextPage endCursor }` |
| Hardcode IDs instead of querying | IDs differ between environments. Always query dynamic |
| Ignore `errors` array | Check for errors even when `data` present — partial errors possible |
| Shell quoting issues with nested JSON | Use `--jq` flag with `gh` or pipe through `jq` separate |

## See Also

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — scaffold web apps consuming GraphQL APIs
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub workflow automation (REST-based counterpart)
- [manage-git-branches](../manage-git-branches/SKILL.md) — Git operations often paired with API automation
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — JSON parsing patterns used in response handling
