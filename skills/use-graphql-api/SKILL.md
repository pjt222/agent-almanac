---
name: use-graphql-api
description: >
  Interact with GraphQL APIs from the command line — discover schemas via
  introspection, construct queries and mutations, execute them with gh api
  graphql or curl, parse responses with jq, and chain operations by piping
  IDs between calls. Use when automating GitHub Discussions, Issues, or
  Projects via GraphQL, integrating with any GraphQL endpoint from scripts,
  or building CLI workflows that need structured API data.
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

Discover, construct, execute, and chain GraphQL operations from the command line.

## When to Use

- Querying or mutating data via a GraphQL endpoint (GitHub, Hasura, Apollo, etc.)
- Automating GitHub operations that require GraphQL (Discussions, Projects v2)
- Building shell scripts that fetch structured data from GraphQL APIs
- Chaining multiple GraphQL calls where output of one feeds into the next

## Inputs

- **Required**: GraphQL endpoint URL or service name (e.g., `github`)
- **Required**: Operation intent (what data to read or write)
- **Optional**: Authentication token or method (default: `gh` CLI auth for GitHub)
- **Optional**: Output format preference (raw JSON, jq-filtered, variable assignment)

## Procedure

### Step 1. Discover the Schema

Determine available types, fields, queries, and mutations.

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

**Expected:** JSON output listing available types, fields, or mutations. The schema response confirms the endpoint is reachable and the auth token is valid.

**On failure:**
- `401 Unauthorized` — verify the token; for GitHub, run `gh auth status`
- `Cannot query field` — the endpoint may disable introspection; consult its documentation instead
- Connection refused — verify the endpoint URL and network access

### Step 2. Identify the Operation Type

Determine whether your task requires a query (read), mutation (write), or subscription (stream).

| Intent | Operation | Example |
|--------|-----------|---------|
| Fetch data | `query` | Get repository details, list discussions |
| Create/update/delete | `mutation` | Create a discussion, add a comment |
| Real-time updates | `subscription` | Watch for new issues (rare in CLI) |

For GitHub-specific operations, consult the [GitHub GraphQL API docs](https://docs.github.com/en/graphql).

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**Expected:** Clear identification of whether a query or mutation is needed, plus the exact operation name (e.g., `createDiscussion`, `repository`).

**On failure:**
- Operation not found — search with broader terms or check the API version
- Unclear whether query or mutation — if the action changes state, it is a mutation

### Step 3. Construct the Operation

Build the GraphQL query or mutation with fields, arguments, and variables.

**Query example — fetch a repository's discussion categories:**

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

**Mutation example — create a GitHub Discussion:**

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
2. Request only the fields you need to minimize response size
3. Use `first: N` with `nodes` for paginated connections
4. Add `id` to every object selection — you will need it for chaining

**Expected:** A syntactically valid GraphQL operation with appropriate variables, field selections, and pagination parameters.

**On failure:**
- Syntax errors — check bracket matching and trailing commas (GraphQL has no trailing commas)
- Type mismatch — verify variable types against the schema (e.g., `ID!` vs `String!`)
- Missing required fields — add required input fields per the schema

### Step 4. Execute via CLI

Run the operation and capture the response.

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

**Expected:** A JSON response with a `data` key containing the requested fields, or an `errors` array if the operation failed.

**On failure:**
- `errors` array in response — read the message; common causes are missing permissions, invalid IDs, or rate limits
- Empty `data` — the query matched no records; verify input values
- HTTP 403 — the token lacks the required scope; for GitHub, check `gh auth status` and add scopes with `gh auth refresh -s scope`

### Step 5. Parse the Response

Extract the data you need from the JSON response.

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

**Expected:** Clean, extracted values ready for display or assignment to shell variables.

**On failure:**
- `jq` returns null — the field path is wrong; pipe raw JSON to `jq .` first to inspect structure
- Multiple values when expecting one — add a `select()` filter or `| first`
- Unicode issues — add `-r` to jq for raw string output

### Step 6. Chain Operations

Use output from one operation as input to the next.

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

**Pattern:** Always extract `id` fields in earlier queries so they can be passed as `ID!` variables to subsequent mutations.

**Expected:** A multi-step workflow where each call succeeds and IDs flow correctly between operations.

**On failure:**
- Variable is empty — a previous step failed silently; add `set -e` and check each intermediate value
- ID format wrong — GitHub node IDs are opaque strings (e.g., `R_kgDO...`); never construct them manually
- Rate limited — add `sleep 1` between calls or batch queries using aliases

## Validation

1. Introspection query returns schema data (Step 1 succeeds)
2. Constructed queries are syntactically valid (no GraphQL parser errors)
3. Responses contain `data` keys without `errors`
4. Extracted values match expected types (IDs are non-empty strings, counts are numbers)
5. Chained operations complete end-to-end (mutation uses IDs from prior queries)

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| Forgetting `!` on required variable types | Always check schema for nullability; most input fields are non-null (`!`) |
| Using REST IDs in GraphQL | GraphQL uses opaque node IDs; fetch them via GraphQL, not REST |
| Not paginating large result sets | Use `first`/`after` with `pageInfo { hasNextPage endCursor }` |
| Hardcoding IDs instead of querying them | IDs differ between environments; always query dynamically |
| Ignoring the `errors` array | Check for errors even when `data` is present — partial errors are possible |
| Shell quoting issues with nested JSON | Use `--jq` flag with `gh` or pipe through `jq` separately |

## Related Skills

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — scaffolding web apps that consume GraphQL APIs
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub workflow automation (REST-based counterpart)
- [manage-git-branches](../manage-git-branches/SKILL.md) — Git operations often paired with API automation
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — JSON parsing patterns used in response handling
