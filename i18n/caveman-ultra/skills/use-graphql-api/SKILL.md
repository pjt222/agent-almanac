---
name: use-graphql-api
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

Discover, construct, exec, chain GraphQL ops from CLI.

## Use When

- Query|mutate via GraphQL endpoint (GitHub, Hasura, Apollo, etc.)
- Auto GitHub ops requiring GraphQL (Discussions, Projects v2)
- Shell scripts fetching structured data from GraphQL
- Chain multi calls → out → next

## In

- **Required**: GraphQL endpoint URL|service ("github")
- **Required**: Op intent (data to read|write)
- **Optional**: Auth token|method (default: `gh` CLI for GitHub)
- **Optional**: Out format (raw JSON, jq-filtered, var assignment)

## Do

### Step 1. Discover Schema

Determine types, fields, queries, mutations.

**GitHub:**

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

**Generic endpoints:**

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**Got:** JSON listing types, fields, mutations. Schema confirms endpoint reachable + auth valid.

**If err:**
- `401 Unauthorized` → verify token; GitHub: `gh auth status`
- `Cannot query field` → endpoint may disable introspection → consult docs
- Conn refused → verify URL + net

### Step 2. ID Op Type

Query (read), mutation (write), subscription (stream).

| Intent | Operation | Example |
|--------|-----------|---------|
| Fetch data | `query` | Get repository details, list discussions |
| Create/update/delete | `mutation` | Create a discussion, add a comment |
| Real-time updates | `subscription` | Watch for new issues (rare in CLI) |

GitHub-specific → [GitHub GraphQL API docs](https://docs.github.com/en/graphql).

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**Got:** Clear ID query|mutation needed + exact op name (`createDiscussion`, `repository`).

**If err:**
- Op not found → broader terms or check API ver
- Unclear → action changes state = mutation

### Step 3. Construct Op

Build query|mutation w/ fields, args, vars.

**Query example — fetch repo's discussion categories:**

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

**Construction rules:**

1. Always vars (`$var: Type!`) not inline → reusability
2. Request only fields needed → minimize res size
3. `first: N` w/ `nodes` for paginated connections
4. Add `id` to every obj selection → need for chaining

**Got:** Syntactically valid op w/ vars, field selections, pagination.

**If err:**
- Syntax errs → bracket matching + trailing commas (GraphQL no trailing commas)
- Type mismatch → verify var types vs schema (`ID!` vs `String!`)
- Missing required fields → add per schema

### Step 4. Exec via CLI

Run + capture res.

**GitHub — `gh api graphql`:**

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

**Generic endpoint — curl:**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**Got:** JSON res w/ `data` key containing requested fields, or `errors` array if op failed.

**If err:**
- `errors` in res → read msg; common: missing perms, invalid IDs, rate limits
- Empty `data` → query matched no records → verify input
- HTTP 403 → token lacks scope; GitHub: `gh auth status` + `gh auth refresh -s scope`

### Step 5. Parse Res

Extract data from JSON.

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

**Got:** Clean extracted vals → display|shell var.

**If err:**
- `jq` returns null → field path wrong → pipe raw JSON to `jq .` to inspect structure
- Multi vals when expecting one → `select()` filter or `| first`
- Unicode → `-r` to jq for raw string out

### Step 6. Chain Ops

Out from one → input to next.

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

**Pattern:** Always extract `id` in earlier queries → pass as `ID!` vars to subsequent mutations.

**Got:** Multi-step workflow → each call succeeds + IDs flow correctly.

**If err:**
- Var empty → prev step failed silent → `set -e` + check each intermediate
- ID format wrong → GitHub node IDs opaque strings (`R_kgDO...`) → never construct manually
- Rate limited → `sleep 1` between calls or batch w/ aliases

## Check

1. Introspection returns schema (Step 1)
2. Constructed queries syntactically valid (no parser errs)
3. Res contains `data` w/o `errors`
4. Extracted vals match expected types (IDs non-empty strings, counts numbers)
5. Chained ops complete end-to-end (mutation uses IDs from prior queries)

## Traps

| Pitfall | Prevention |
|---------|------------|
| Forgetting `!` on required variable types | Always check schema for nullability; most input fields are non-null (`!`) |
| Using REST IDs in GraphQL | GraphQL uses opaque node IDs; fetch them via GraphQL, not REST |
| Not paginating large result sets | Use `first`/`after` with `pageInfo { hasNextPage endCursor }` |
| Hardcoding IDs instead of querying them | IDs differ between environments; always query dynamically |
| Ignoring the `errors` array | Check for errors even when `data` is present — partial errors are possible |
| Shell quoting issues with nested JSON | Use `--jq` flag with `gh` or pipe through `jq` separately |

## →

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — scaffold web apps consuming GraphQL APIs
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub workflow auto (REST counterpart)
- [manage-git-branches](../manage-git-branches/SKILL.md) — git ops paired w/ API auto
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — JSON parsing for res handling
