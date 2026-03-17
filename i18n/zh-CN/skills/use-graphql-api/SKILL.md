---
name: use-graphql-api
description: >
  通过命令行与 GraphQL API 交互——通过内省发现 Schema、构造查询和变更操作、
  使用 gh api graphql 或 curl 执行、用 jq 解析响应，并通过 ID 管道链接操作。
  适用于通过 GraphQL 自动化 GitHub Discussions、Issues 或 Projects、从脚本
  集成任意 GraphQL 端点，或构建需要结构化 API 数据的 CLI 工作流。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: intermediate
  language: multi
  tags: graphql, api, github, query, mutation, introspection
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
---

# 使用 GraphQL API

从命令行发现、构造、执行并链接 GraphQL 操作。

## 适用场景

- 通过 GraphQL 端点（GitHub、Hasura、Apollo 等）查询或修改数据
- 自动化需要 GraphQL 的 GitHub 操作（Discussions、Projects v2）
- 构建从 GraphQL API 获取结构化数据的 Shell 脚本
- 链接多个 GraphQL 调用，将前一个调用的输出传入下一个

## 输入

- **必需**：GraphQL 端点 URL 或服务名称（如 `github`）
- **必需**：操作意图（读取或写入的数据内容）
- **可选**：认证令牌或方式（默认：GitHub 使用 `gh` CLI 认证）
- **可选**：输出格式偏好（原始 JSON、jq 过滤、变量赋值）

## 步骤

### 第 1 步：发现 Schema

确定可用的类型、字段、查询和变更。

**针对 GitHub：**

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

**针对通用端点：**

```bash
# Full introspection query via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**预期结果：** JSON 输出列出可用类型、字段或变更。Schema 响应确认端点可达且认证令牌有效。

**失败处理：**
- `401 Unauthorized` — 验证令牌；GitHub 请运行 `gh auth status`
- `Cannot query field` — 端点可能禁用内省；改查其文档
- 连接被拒绝 — 验证端点 URL 和网络访问

### 第 2 步：确定操作类型

确定任务需要查询（读取）、变更（写入）还是订阅（流）。

| 意图 | 操作 | 示例 |
|------|------|------|
| 获取数据 | `query` | 获取仓库详情、列出 discussions |
| 创建/更新/删除 | `mutation` | 创建 discussion、添加评论 |
| 实时更新 | `subscription` | 监听新 issue（CLI 中少见）|

针对 GitHub 特定操作，查阅 [GitHub GraphQL API 文档](https://docs.github.com/en/graphql)。

```bash
# Quick check: does the mutation exist?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**预期结果：** 明确识别需要查询还是变更，以及确切的操作名称（如 `createDiscussion`、`repository`）。

**失败处理：**
- 找不到操作 — 用更广泛的词语搜索或检查 API 版本
- 不确定是查询还是变更 — 如果操作改变状态，则为变更

### 第 3 步：构造操作

用字段、参数和变量构建 GraphQL 查询或变更。

**查询示例——获取仓库的 discussion 分类：**

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

**变更示例——创建 GitHub Discussion：**

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

**关键构造规则：**

1. 始终使用变量（`$var: Type!`）而非内联值，以提高复用性
2. 只请求所需字段以最小化响应体积
3. 对分页连接使用带 `nodes` 的 `first: N`
4. 在每个对象选择中添加 `id`——链接时需要用到

**预期结果：** 语法正确的 GraphQL 操作，包含适当的变量、字段选择和分页参数。

**失败处理：**
- 语法错误 — 检查括号匹配和尾随逗号（GraphQL 不允许尾随逗号）
- 类型不匹配 — 根据 Schema 验证变量类型（如 `ID!` vs `String!`）
- 缺少必填字段 — 根据 Schema 添加必需的输入字段

### 第 4 步：通过 CLI 执行

运行操作并捕获响应。

**GitHub——使用 `gh api graphql`：**

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

**通用端点——使用 curl：**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**预期结果：** JSON 响应包含带请求字段的 `data` 键，或操作失败时包含 `errors` 数组。

**失败处理：**
- 响应中有 `errors` 数组 — 阅读消息；常见原因是权限不足、ID 无效或触发速率限制
- `data` 为空 — 查询未匹配任何记录；验证输入值
- HTTP 403 — 令牌缺少所需权限范围；GitHub 请检查 `gh auth status` 并用 `gh auth refresh -s scope` 添加权限

### 第 5 步：解析响应

从 JSON 响应中提取所需数据。

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

**预期结果：** 提取出干净的值，可直接显示或赋值给 Shell 变量。

**失败处理：**
- `jq` 返回 null — 字段路径错误；先将原始 JSON 传给 `jq .` 检查结构
- 期望单个值但返回多个 — 添加 `select()` 过滤器或 `| first`
- Unicode 问题 — 为 jq 添加 `-r` 以获取原始字符串输出

### 第 6 步：链接操作

将一个操作的输出用作下一个操作的输入。

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

**模式：** 始终在早期查询中提取 `id` 字段，以便将其作为 `ID!` 变量传递给后续变更。

**预期结果：** 多步骤工作流中每个调用都成功，ID 在操作之间正确传递。

**失败处理：**
- 变量为空 — 前一步静默失败；添加 `set -e` 并检查每个中间值
- ID 格式错误 — GitHub 节点 ID 是不透明字符串（如 `R_kgDO...`）；永远不要手动构造它们
- 触发速率限制 — 在调用之间添加 `sleep 1`，或使用别名批量查询

## 验证清单

1. 内省查询返回 Schema 数据（第 1 步成功）
2. 构造的查询语法正确（无 GraphQL 解析器错误）
3. 响应包含 `data` 键且无 `errors`
4. 提取的值类型正确（ID 为非空字符串，计数为数字）
5. 链接操作端到端完成（变更使用前序查询中的 ID）

## 常见问题

| 问题 | 预防措施 |
|------|----------|
| 忘记在必需变量类型上加 `!` | 始终检查 Schema 中的可为空性；大多数输入字段是非空的（`!`）|
| 在 GraphQL 中使用 REST ID | GraphQL 使用不透明节点 ID；通过 GraphQL 获取，而非 REST |
| 不分页大结果集 | 使用带 `pageInfo { hasNextPage endCursor }` 的 `first`/`after` |
| 硬编码 ID 而不查询 | ID 在不同环境中不同；始终动态查询 |
| 忽略 `errors` 数组 | 即使 `data` 存在也要检查错误——部分错误是可能的 |
| Shell 中嵌套 JSON 的引号问题 | 使用 `gh` 的 `--jq` 标志或单独通过 `jq` 管道处理 |

## 相关技能

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — 构建消费 GraphQL API 的 Web 应用
- [create-pull-request](../create-pull-request/SKILL.md) — GitHub 工作流自动化（REST 对应方案）
- [manage-git-branches](../manage-git-branches/SKILL.md) — 通常与 API 自动化配合使用的 Git 操作
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — 响应处理中使用的 JSON 解析模式
