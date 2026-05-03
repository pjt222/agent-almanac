---
name: use-graphql-api
locale: wenyan
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

於命行下察、構、行、串 GraphQL 之操。

## 用時

- 經 GraphQL 端讀寫數（GitHub、Hasura、Apollo 等）
- 自 GitHub 之操需 GraphQL 者（Discussions、Projects v2）
- 立殼本以 GraphQL 取結構數
- 串諸 GraphQL 呼，前出為後入

## 入

- **必要**：GraphQL 端 URL 或服名（如 `github`）
- **必要**：操之意（讀何寫何）
- **可選**：證之憑或法（默：GitHub 用 `gh` CLI 之證）
- **可選**：出之偏（生 JSON、jq 過、變賦）

## 法

### 第一步：察其綱

定可用之類、域、查、變。

**為 GitHub**：

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

**為通用之端**：

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

得：JSON 出列可用之類、域、變。綱之應確端可達、證憑有效。

敗則：
- `401 Unauthorized` — 驗憑；GitHub 行 `gh auth status`
- `Cannot query field` — 端或閉內察；查其文檔
- 連拒 — 驗端 URL 與網之達

### 第二步：辨操之類

定其任需查（讀）、變（寫）、抑訂（流）。

| 意 | 操 | 例 |
|--------|-----------|---------|
| 取數 | `query` | 取庫之詳，列討 |
| 立/更/刪 | `mutation` | 立討、加評 |
| 即時更 | `subscription` | 守新事（CLI 中罕） |

GitHub 之操，查 [GitHub GraphQL API 文](https://docs.github.com/en/graphql)。

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

得：明辨需查抑變，並其精確操名（如 `createDiscussion`、`repository`）。

敗則：
- 操不見 — 以廣詞搜或察 API 之版
- 不確查抑變 — 動變狀者乃變

### 第三步：構其操

立 GraphQL 之查或變，含域、參、變數。

**查例 — 取庫之討類**：

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

**變例 — 立 GitHub 之 Discussion**：

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

**構之要則**：

1. 常用變數（`$var: Type!`）代內值以重用
2. 唯求所需之域以減應
3. 連通之分頁用 `first: N` 與 `nodes`
4. 每物之選加 `id` — 串之所需

得：語法有效之 GraphQL 操，含合宜變、域選、分頁參。

敗則：
- 語法訛 — 察括之配與末逗（GraphQL 無末逗）
- 類不合 — 對綱驗變數之類（如 `ID!` 對 `String!`）
- 缺必域 — 依綱補必入域

### 第四步：經 CLI 行之

行其操而捕其應。

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

**通用之端 — 用 curl**：

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

得：JSON 應有 `data` 鍵含所求之域，或操敗則有 `errors` 列。

敗則：
- 應中有 `errors` — 讀其辭；常因缺權、ID 訛、或限頻
- 空 `data` — 查無錄；驗入值
- HTTP 403 — 憑缺所需之範；GitHub 察 `gh auth status` 並以 `gh auth refresh -s scope` 加範

### 第五步：解其應

自 JSON 應取所需數。

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

得：清取之值，可顯或賦於殼變。

敗則：
- `jq` 返 null — 域徑誤；先導生 JSON 至 `jq .` 察結構
- 期一而得多 — 加 `select()` 過或 `| first`
- Unicode 之疾 — jq 加 `-r` 為生串

### 第六步：串其操

以前操之出為後操之入。

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

**模**：常於早查取 `id` 域，以為 `ID!` 變數傳於後變。

得：多步流，每呼成而 ID 正流於諸操間。

敗則：
- 變空 — 前步默敗；加 `set -e` 並察各中值
- ID 形誤 — GitHub 之節 ID 為不透明串（如 `R_kgDO...`）；勿手構之
- 限頻 — 呼間加 `sleep 1` 或以別名批查

## 驗

1. 察綱之查返綱數（第一步成）
2. 構之查語法有效（無 GraphQL 析訛）
3. 應含 `data` 鍵而無 `errors`
4. 取之值合所期類（ID 為非空串、計為數）
5. 串之操首尾通（變用前查之 ID）

## 陷

| 陷 | 防 |
|---------|------------|
| 必變類忘 `!` | 常察綱之可空否；多入域為非空（`!`） |
| 用 REST 之 ID 於 GraphQL | GraphQL 用不透明節 ID；以 GraphQL 取，非 REST |
| 大果集不分頁 | 用 `first`/`after` 與 `pageInfo { hasNextPage endCursor }` |
| 硬編 ID 而不查 | ID 於諸境異；常動查之 |
| 忽 `errors` 列 | `data` 在亦察訛 — 部分訛可存 |
| 殼引嵌 JSON 之疾 | 用 `gh` 之 `--jq` 旗或單導 `jq` |

## 參

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — 立用 GraphQL 之 web 應
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub 流自（REST 之對）
- [manage-git-branches](../manage-git-branches/SKILL.md) — Git 操常與 API 自並
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — 應處中之 JSON 析模
