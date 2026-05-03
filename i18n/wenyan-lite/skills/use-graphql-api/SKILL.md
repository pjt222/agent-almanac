---
name: use-graphql-api
locale: wenyan-lite
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

於命令列發現、構造、執行並串聯 GraphQL 操作。

## 適用時機

- 經 GraphQL 端點查或變更資料（GitHub、Hasura、Apollo 等）
- 自動化需 GraphQL 之 GitHub 操作（Discussions、Projects v2）
- 建立從 GraphQL API 取結構化資料之 shell 腳本
- 串接多次 GraphQL 呼叫,前者輸出餵後者

## 輸入

- **必要**：GraphQL 端點 URL 或服務名（如 `github`）
- **必要**：操作意圖（欲讀或寫之資料）
- **選擇性**：認證令牌或方法（預設：GitHub 用 `gh` CLI 認證）
- **選擇性**：輸出格式偏好（原始 JSON、jq 過濾、變數指派）

## 步驟

### 步驟一：發現綱要

判定可用之類型、欄位、查詢與變更。

**對 GitHub：**

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

**對通用端點：**

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**預期：** JSON 輸出列出可用之類型、欄位或變更。綱要回應證實端點可達且認證令牌有效。

**失敗時：**
- `401 Unauthorized` — 驗證令牌；GitHub 用 `gh auth status`
- `Cannot query field` — 端點可能停用內省；改參其文檔
- 連線拒絕 — 驗證端點 URL 與網路存取

### 步驟二：辨識操作類型

判定任務需查（讀）、變更（寫）或訂閱（流）。

| 意圖 | 操作 | 範例 |
|--------|-----------|---------|
| 取資料 | `query` | 取倉庫詳情、列出 discussions |
| 建立/更新/刪除 | `mutation` | 建立 discussion、加評論 |
| 即時更新 | `subscription` | 監看新 issues（CLI 中罕見）|

對 GitHub 特定操作,參 [GitHub GraphQL API 文檔](https://docs.github.com/en/graphql)。

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**預期：** 清楚辨識需查或變更,加上確切操作名（如 `createDiscussion`、`repository`）。

**失敗時：**
- 找不到操作 — 用較廣詞搜或檢查 API 版本
- 不確查或變更 — 若動作改變狀態,則為變更

### 步驟三：構造操作

以欄位、引數與變數建構 GraphQL 查詢或變更。

**查詢範例 — 取倉庫之 discussion 分類：**

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

**變更範例 — 建立 GitHub Discussion：**

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

**關鍵構造規則：**

1. 永遠用變數（`$var: Type!`）取代行內值以求複用
2. 僅請求所需欄位以最小化回應大小
3. 對分頁連線用 `first: N` 配 `nodes`
4. 為每對象選擇加 `id` — 串接時將需

**預期：** 語法有效之 GraphQL 操作,含適當之變數、欄位選擇與分頁參數。

**失敗時：**
- 語法錯誤 — 檢查括號匹配與拖尾逗號（GraphQL 無拖尾逗號）
- 類型不匹配 — 對綱要驗證變數類型（如 `ID!` 對 `String!`）
- 缺必要欄位 — 依綱要加必要輸入欄位

### 步驟四：經 CLI 執行

跑操作並擷取回應。

**GitHub — 用 `gh api graphql`：**

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

**通用端點 — 用 curl：**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**預期：** JSON 回應含 `data` 鍵,內為所請求欄位；操作失敗則含 `errors` 陣列。

**失敗時：**
- 回應中之 `errors` 陣列 — 讀訊息；常見原因為缺權限、無效 ID 或速率限制
- 空 `data` — 查詢無匹配記錄；驗證輸入值
- HTTP 403 — 令牌缺所需範疇；GitHub 查 `gh auth status` 並以 `gh auth refresh -s scope` 加範疇

### 步驟五：解析回應

從 JSON 回應擷取所需資料。

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

**預期：** 清潔擷取之值,可顯示或指派予 shell 變數。

**失敗時：**
- `jq` 返回 null — 欄位路徑錯；先將原始 JSON 管入 `jq .` 以察結構
- 預期一個值卻得多個 — 加 `select()` 過濾或 `| first`
- Unicode 問題 — 為 jq 加 `-r` 以原始字串輸出

### 步驟六：串接操作

將一操作之輸出作為次操作之輸入。

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

**模式：** 永遠於先前查詢中擷取 `id` 欄位,以便傳予後續變更作為 `ID!` 變數。

**預期：** 多步驟工作流,各呼叫成功且 ID 於操作間正確流動。

**失敗時：**
- 變數為空 — 先前步驟靜默失敗；加 `set -e` 並檢查各中間值
- ID 格式錯 — GitHub 節點 ID 為不透明字串（如 `R_kgDO...`）；切勿手動構造
- 速率限制 — 呼叫間加 `sleep 1` 或用別名批次查詢

## 驗證

1. 內省查詢回綱要資料（步驟一成功）
2. 所構造之查詢語法有效（無 GraphQL 解析器錯誤）
3. 回應含 `data` 鍵,無 `errors`
4. 擷取值匹配預期類型（ID 為非空字串、計數為數字）
5. 串接操作端到端完成（變更使用先前查詢之 ID）

## 常見陷阱

| 陷阱 | 預防 |
|---------|------------|
| 必要變數類型忘加 `!` | 永遠對綱要查空值性；多數輸入欄位為非空（`!`）|
| 於 GraphQL 中用 REST ID | GraphQL 用不透明節點 ID；經 GraphQL 取之,非 REST |
| 大結果集未分頁 | 用 `first`/`after` 配 `pageInfo { hasNextPage endCursor }` |
| 硬編碼 ID 而不查詢 | ID 因環境而異；永遠動態查詢 |
| 忽略 `errors` 陣列 | 即便 `data` 存在亦查錯誤——可能有部分錯誤 |
| 嵌套 JSON 之 shell 引號問題 | 用 `gh` 之 `--jq` 旗標或另經 `jq` 管道處理 |

## 相關技能

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — 搭建消費 GraphQL API 之網頁應用
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub 工作流自動化（REST 對應）
- [manage-git-branches](../manage-git-branches/SKILL.md) — 常與 API 自動化配對之 Git 操作
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — 回應處理中之 JSON 解析模式
