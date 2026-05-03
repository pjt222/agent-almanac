---
name: use-graphql-api
locale: wenyan-ultra
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

# 用 GraphQL API

於命列察、構、執、鏈 GraphQL 行。

## 用

- 經 GraphQL 端詢或變數→用
- 自動 GitHub 須 GraphQL 之行（Discussions、Projects v2）→用
- 殼本取 GraphQL 結構數→用
- 鏈多 GraphQL 召（前出為後入）→用

## 入

- **必**：GraphQL 端 URL 或服名（如 `github`）
- **必**：行意（讀或寫何數）
- **可**：認令或法（默：GitHub 用 `gh` CLI 認）
- **可**：出式（純 JSON、jq 濾、變派）

## 行

### 一：察綱

定可用型、欄、詢、變。

**GitHub**：

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

**泛端**：

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

得：JSON 列可用型、欄、變。綱應確端可達且令有效。

敗：
- `401 Unauthorized` — 驗令；GitHub 行 `gh auth status`
- `Cannot query field` — 端或禁察；參其文
- 接拒 — 驗 URL 與網

### 二：辨行型

定須詢（讀）、變（寫）、訂（流）。

| 意 | 行 | 例 |
|----|-----|-----|
| 取數 | `query` | 取庫詳、列議 |
| 建/更/刪 | `mutation` | 建議、加註 |
| 即時更 | `subscription` | 觀新議（CLI 罕） |

GitHub 特行→[GitHub GraphQL API 文](https://docs.github.com/en/graphql)。

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

得：詢或變辨明、附確行名（如 `createDiscussion`、`repository`）。

敗：
- 行未尋 — 以廣詞搜或察 API 版
- 詢變難辨 — 變態為變


### 三：構行

以欄、參、變建詢或變。

**詢例 — 取庫議類**：

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

**變例 — 建 GitHub Discussion**：

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

**構則**：

1. 必用變（`$var: Type!`）代內值以複用
2. 僅取所需欄以縮應
3. 分頁連用 `first: N` 與 `nodes`
4. 各物選加 `id`——後鏈須用

得：法正 GraphQL 行附宜變、欄選、分頁參。

敗：
- 法誤 — 察括配與末逗（GraphQL 無末逗）
- 型不合 — 對綱驗變型（如 `ID!` vs `String!`）
- 缺必欄 — 按綱加必入欄

### 四：以 CLI 執

行行、捕應。

**GitHub — 用 `gh api graphql`**：

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

**泛端 — 用 curl**：

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

得：JSON 應附 `data` 鍵含請欄，或 `errors` 陣若敗。

敗：
- 應 `errors` — 讀訊；常因為缺權、ID 誤、率限
- 空 `data` — 詢無配記；驗入值
- HTTP 403 — 令缺範；GitHub 察 `gh auth status`、加範以 `gh auth refresh -s scope`

### 五：析應

由 JSON 應取所需數。

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

得：清取值，可示或派殼變。

敗：
- `jq` 返 null — 欄路誤；先管純 JSON 入 `jq .` 察構
- 期一而多值 — 加 `select()` 濾或 `| first`
- Unicode 疾 — jq 加 `-r` 取純串出

### 六：鏈行

前行之出為後行之入。

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

**式**：必於前詢取 `id` 欄以為後變之 `ID!` 變傳。

得：多步流，每召成、ID 正流於行間。

敗：
- 變空 — 前步默敗；加 `set -e` 察各中值
- ID 式誤 — GitHub 節 ID 為不透串（如 `R_kgDO...`）；勿手構
- 率限 — 召間加 `sleep 1` 或以別名批詢

## 驗

1. 察詢返綱數（步一成）
2. 構詢法正（無 GraphQL 析誤）
3. 應含 `data` 鍵而無 `errors`
4. 取值合期型（ID 為非空串、計為數）
5. 鏈行端到端成（變用前詢之 ID）

## 忌

| 忌 | 防 |
|----|-----|
| 忘必變型之 `!` | 察綱可空否；多入欄為非空（`!`） |
| GraphQL 用 REST ID | GraphQL 用不透節 ID；經 GraphQL 取，非 REST |
| 大果不分頁 | 用 `first`/`after` 與 `pageInfo { hasNextPage endCursor }` |
| 硬編 ID 不詢 | ID 隨境異；必動詢 |
| 忽 `errors` 陣 | `data` 在亦察誤——部分誤可能 |
| 嵌 JSON 殼引疾 | 用 `gh` 之 `--jq` 旗或經 `jq` 別管 |

## 參

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — 建消 GraphQL API 之網應
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub 工流自動（REST 對）
- [manage-git-branches](../manage-git-branches/SKILL.md) — Git 行常與 API 自動配
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — 應處中 JSON 析式
