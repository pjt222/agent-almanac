---
name: use-graphql-api
description: >
  コマンドラインからGraphQL APIを操作します。イントロスペクションによるスキーマの
  発見、クエリとミューテーションの構築、gh api graphqlまたはcurlでの実行、
  jqによるレスポンスの解析、IDをパイプで連鎖させた操作の連結を扱います。
  GraphQL経由でGitHub Discussions、Issues、Projectsを自動化するとき、
  スクリプトから任意のGraphQLエンドポイントと統合するとき、または構造化された
  APIデータを必要とするCLIワークフローを構築するときに使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# GraphQL APIの使用

コマンドラインからGraphQLオペレーションを発見・構築・実行・連鎖させます。

## 使用タイミング

- GraphQLエンドポイント（GitHub、Hasura、Apolloなど）経由でデータを照会・更新するとき
- GraphQLを必要とするGitHubオペレーション（Discussions、Projects v2）を自動化するとき
- GraphQL APIから構造化データを取得するシェルスクリプトを構築するとき
- 1つのオペレーションの出力を次のオペレーションへの入力として使う複数のGraphQL呼び出しを連鎖させるとき

## 入力

- **必須**: GraphQLエンドポイントURLまたはサービス名（例：`github`）
- **必須**: オペレーションの意図（読み取りまたは書き込みするデータ）
- **オプション**: 認証トークンまたは方式（デフォルト：GitHubには`gh` CLI認証）
- **オプション**: 出力フォーマットの選択（生JSON、jqフィルター済み、変数代入）

## 手順

### ステップ1: スキーマの発見

利用可能な型、フィールド、クエリ、ミューテーションを確認します。

**GitHubの場合：**

```bash
# 利用可能なクエリフィールドの一覧表示
gh api graphql -f query='{ __schema { queryType { fields { name description } } } }' \
  | jq '.data.__schema.queryType.fields[] | {name, description}'

# 利用可能なミューテーションフィールドの一覧表示
gh api graphql -f query='{ __schema { mutationType { fields { name description } } } }' \
  | jq '.data.__schema.mutationType.fields[] | {name, description}'

# 特定の型を調べる
gh api graphql -f query='{
  __type(name: "Repository") {
    fields { name type { name kind ofType { name } } }
  }
}' | jq '.data.__type.fields[] | {name, type: .type.name // .type.ofType.name}'
```

**汎用エンドポイントの場合：**

```bash
# curlによる完全なイントロスペクションクエリ
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**期待結果：** 利用可能な型、フィールド、またはミューテーションを一覧表示するJSON出力。スキーマレスポンスがエンドポイントに到達可能で認証トークンが有効であることを確認します。

**失敗時：**
- `401 Unauthorized` — トークンを確認してください。GitHubの場合は`gh auth status`を実行
- `Cannot query field` — エンドポイントがイントロスペクションを無効にしている可能性があります。代わりにドキュメントを参照してください
- 接続拒否 — エンドポイントURLとネットワークアクセスを確認してください

### ステップ2: オペレーションタイプの特定

タスクにクエリ（読み取り）、ミューテーション（書き込み）、またはサブスクリプション（ストリーム）が必要かどうかを判断します。

| 意図 | オペレーション | 例 |
|------|--------------|-----|
| データ取得 | `query` | リポジトリ詳細の取得、ディスカッションの一覧 |
| 作成/更新/削除 | `mutation` | ディスカッションの作成、コメントの追加 |
| リアルタイム更新 | `subscription` | 新しいissueを監視（CLIでは稀） |

GitHub固有のオペレーションについては、[GitHub GraphQL API docs](https://docs.github.com/en/graphql)を参照してください。

```bash
# クイックチェック：ミューテーションは存在するか？
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**期待結果：** クエリとミューテーションのどちらが必要かが明確になり、正確なオペレーション名（例：`createDiscussion`、`repository`）が特定されます。

**失敗時：**
- オペレーションが見つからない — より広い用語で検索するか、APIバージョンを確認してください
- クエリとミューテーションの区別が不明 — アクションが状態を変更する場合はミューテーションです

### ステップ3: オペレーションの構築

フィールド、引数、変数を使ってGraphQLクエリまたはミューテーションを構築します。

**クエリの例 — リポジトリのディスカッションカテゴリを取得：**

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

**ミューテーションの例 — GitHubディスカッションの作成：**

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

**主要な構築ルール：**

1. 再利用性のために、インライン値ではなく常に変数（`$var: Type!`）を使用する
2. レスポンスサイズを最小化するために必要なフィールドのみリクエストする
3. ページネーション付きコネクションには`first: N`と`nodes`を使用する
4. すべてのオブジェクト選択に`id`を追加する — 連鎖に必要になる

**期待結果：** 適切な変数、フィールド選択、ページネーションパラメータを持つ構文的に有効なGraphQLオペレーション。

**失敗時：**
- 構文エラー — ブラケットの対応とトレーリングカンマを確認してください（GraphQLにはトレーリングカンマがない）
- 型の不一致 — スキーマに対して変数の型を確認してください（例：`ID!`対`String!`）
- 必須フィールドの欠落 — スキーマに従って必須入力フィールドを追加してください

### ステップ4: CLIによる実行

オペレーションを実行してレスポンスをキャプチャします。

**GitHub — `gh api graphql`の使用：**

```bash
# 単純なクエリ
gh api graphql -f query='{ viewer { login } }'

# 変数を使用
gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id name }
  }' \
  -f owner="octocat" -f repo="Hello-World"

# jqによる後処理
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.id')
```

**汎用エンドポイント — curlの使用：**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**期待結果：** リクエストされたフィールドを含む`data`キーを持つJSONレスポンス。オペレーションが失敗した場合は`errors`配列。

**失敗時：**
- レスポンスに`errors`配列 — メッセージを読んでください。よくある原因：権限の欠落、無効なID、レート制限
- 空の`data` — クエリがレコードと一致しなかった。入力値を確認してください
- HTTP 403 — トークンに必要なスコープがない。GitHubの場合は`gh auth status`を確認し、`gh auth refresh -s scope`でスコープを追加してください

### ステップ5: レスポンスの解析

JSONレスポンスから必要なデータを抽出します。

```bash
# 単一の値を抽出
gh api graphql -f query='{ viewer { login } }' --jq '.data.viewer.login'

# リストから抽出
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

# 後で使用するために変数に代入
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

**期待結果：** 表示またはシェル変数への代入に対応したクリーンで抽出された値。

**失敗時：**
- `jq`がnullを返す — フィールドパスが間違っています。まず生のJSONを`jq .`にパイプして構造を確認してください
- 1つを期待しているときに複数の値 — `select()`フィルターまたは`| first`を追加してください
- Unicode問題 — 生の文字列出力のために`-r`フラグをjqに追加してください

### ステップ6: オペレーションの連鎖

1つのオペレーションの出力を次のオペレーションへの入力として使用します。

```bash
# ステップA: リポジトリIDの取得
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="$OWNER" -f repo="$REPO" \
  --jq '.data.repository.id')

# ステップB: ディスカッションカテゴリIDの取得
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

# ステップC: 両方のIDを使ってディスカッションを作成
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

**パターン：** IDフィールドを前のクエリで常に抽出し、後続のミューテーションに`ID!`変数として渡せるようにしてください。

**期待結果：** 各呼び出しが成功し、IDがオペレーション間で正しく流れる複数ステップのワークフロー。

**失敗時：**
- 変数が空 — 前のステップがサイレントに失敗した。`set -e`を追加して各中間値を確認してください
- IDフォーマットが間違い — GitHubのノードIDは不透明な文字列（例：`R_kgDO...`）です。手動で構築しないでください
- レート制限 — 呼び出し間に`sleep 1`を追加するか、エイリアスを使ってクエリをバッチ処理してください

## バリデーション

1. イントロスペクションクエリがスキーマデータを返す（ステップ1が成功）
2. 構築されたクエリが構文的に有効（GraphQLパーサーエラーなし）
3. レスポンスに`errors`なしで`data`キーが含まれる
4. 抽出された値が期待される型と一致する（IDは空でない文字列、カウントは数値）
5. 連鎖されたオペレーションがエンドツーエンドで完了する（ミューテーションが前のクエリのIDを使用）

## よくある落とし穴

| 落とし穴 | 防止策 |
|---------|-------|
| 必須変数型に`!`を付け忘れる | nullability についてスキーマを常に確認してください。ほとんどの入力フィールドはnon-null（`!`）です |
| GraphQLでREST IDを使用する | GraphQLは不透明なノードIDを使用します。RESTではなくGraphQL経由で取得してください |
| 大きな結果セットのページネーションを省略する | `first`/`after`と`pageInfo { hasNextPage endCursor }`を使用してください |
| クエリせずにIDをハードコードする | IDは環境によって異なります。常に動的にクエリしてください |
| `errors`配列を無視する | `data`が存在してもエラーを確認してください — 部分的なエラーが起きる可能性があります |
| ネストされたJSONのシェルクォーティング問題 | `gh`の`--jq`フラグを使用するか、`jq`に別途パイプしてください |

## 関連スキル

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — GraphQL APIを使用するWebアプリのスキャフォールド
- [create-pull-request](../create-pull-request/SKILL.md) — GitHubワークフローの自動化（RESTベースの対応物）
- [manage-git-branches](../manage-git-branches/SKILL.md) — API自動化と組み合わせることが多いGitオペレーション
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — レスポンス処理で使用するJSONパースパターン
