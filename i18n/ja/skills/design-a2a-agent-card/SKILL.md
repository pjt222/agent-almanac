---
name: design-a2a-agent-card
description: >
  エージェントの機能、スキル、認証要件、サポートするコンテンツタイプを記述するA2A
  Agent Card（.well-known/agent.json）マニフェストを設計する。他のA2A準拠エージェント
  から発見可能なエージェントを構築する時、マルチエージェントオーケストレーション用に
  機能を公開する時、既存エージェントをA2Aプロトコルに移行する時、実装前にエージェントの
  パブリック契約を定義する時、Agent Cardを消費するエージェントレジストリと統合する時に
  使用する。
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: intermediate
  language: multi
  tags: a2a, agent-card, manifest, capabilities, interoperability
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# A2A Agent Cardの設計

他のエージェントによる発見のためにエージェントのアイデンティティ、スキル、認証要件、機能を宣伝する標準準拠のA2A Agent Cardを作成する。

## 使用タイミング

- 他のA2A準拠エージェントから発見可能なエージェントを構築する時
- マルチエージェントオーケストレーション用にエージェント機能を公開する時
- 既存エージェントをA2A（Agent-to-Agent）プロトコルに移行する時
- 実装前にエージェントのパブリック契約を定義する時
- Agent Cardを消費するエージェントレジストリやディレクトリと統合する時

## 入力

- **必須**: エージェント名と説明
- **必須**: エージェントが実行できるスキルのリスト（名前、説明、入出力スキーマ）
- **必須**: エージェントがホストされるベースURL
- **任意**: 認証方式（`none`、`oauth2`、`oidc`、`api-key`）
- **任意**: `text/plain`以外のサポートコンテンツタイプ（例: `image/png`、`application/json`）
- **任意**: 機能フラグ（ストリーミング、プッシュ通知、状態遷移履歴）
- **任意**: プロバイダ組織名とURL

## 手順

### ステップ1: エージェントのアイデンティティと説明の定義

1.1. エージェントのアイデンティティフィールドを選択する:

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

1.2. 以下の質問に答える明確で実行可能な説明を書く:
   - このエージェントはどのドメインをカバーするか？
   - どのようなタスクを処理できるか？
   - 制限事項は何か？

1.3. Agent Cardが`/.well-known/agent.json`で配信される正規URLを設定する。

**期待結果:** name、description、URL、provider、versionを含む完全なアイデンティティブロック。

**失敗時:** エージェントが複数のドメインを提供する場合、多くのスキルを持つ1つのエージェントにするか、焦点を絞ったスコープの複数のエージェントにするかを検討する。A2Aは明確な境界を持つ焦点を絞ったエージェントを推奨する。

### ステップ2: 入出力スキーマ付きスキルの列挙

2.1. エージェントが実行できる各スキルを定義する:

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

2.2. 各スキルに以下を提供する:
   - **id**: 一意の識別子（ケバブケース）
   - **name**: 人間が読める表示名
   - **description**: スキルが何をするか、1〜2文で
   - **tags**: 発見のための検索可能なキーワード
   - **examples**: このスキルをトリガーする自然言語タスクの例
   - **inputModes**: スキルが受け入れるMIMEタイプ
   - **outputModes**: スキルが生成できるMIMEタイプ

2.3. スキルの境界が明確で重複しないことを確認する。各タスクは正確に1つのスキルにマッピングされるべき。

**期待結果:** 各エントリにid、name、description、tags、examples、I/Oモードを持つskills配列。

**失敗時:** スキルが大幅に重複する場合、より多くの例を持つ1つの広いスキルにマージする。スキルが広すぎる場合、焦点を絞ったサブスキルに分割する。

### ステップ3: 認証の設定

3.1. デプロイメントコンテキストに基づいて認証スキームを定義する:

**認証なし（ローカル/信頼されたネットワーク）:**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0（本番環境に推奨）:**

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

**APIキー（シンプルな共有シークレット）:**

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

3.2. デプロイメント環境に最小限の認証を選択する:
   - ローカル開発: `none`
   - 内部サービス: `apiKey`
   - パブリックエージェント: `oauth2`または`oidc`

3.3. トークン/キーのプロビジョニングプロセスをAgent Cardのproviderセクションまたは外部ドキュメントに文書化する。

**期待結果:** デプロイメントのセキュリティ要件に一致する認証ブロック。

**失敗時:** OAuth 2.0インフラストラクチャが利用できない場合、APIキー認証で開始し移行を計画する。パブリックエージェントを`none`認証でデプロイしない。

### ステップ4: 機能の指定

4.1. エージェントがサポートするプロトコル機能を宣言する:

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. 実装の準備状況に基づいて各機能フラグを設定する:

   - **streaming**: エージェントが`tasks/sendSubscribe`経由のSSEストリーミングをサポートする場合`true`。長時間実行タスクのリアルタイム進捗更新を有効にする。
   - **pushNotifications**: エージェントがタスク状態変更時にWebhookコールバックを送信できる場合`true`。エージェントがWebhook URLを保存しコールバックする必要がある。
   - **stateTransitionHistory**: エージェントがタスク状態遷移（submitted、working、completedなど）の完全な履歴を維持する場合`true`。監査証跡に有用。

4.3. 実装が完全にサポートしている場合のみ機能を`true`に設定する。サポートされていない機能の宣伝は相互運用性を壊す。

**期待結果:** 実際の実装に一致するブール値フラグを持つcapabilitiesオブジェクト。

**失敗時:** 機能が実装されるか不確かな場合、`false`に設定する。機能は将来のバージョンで追加できる。機能の削除は破壊的変更である。

### ステップ5: Agent Cardの検証と公開

5.1. 完全なAgent Cardを組み立てる:

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

5.2. Agent Cardを検証する:
   - JSONとしてパースし構文エラーがないことを確認
   - すべての必須フィールドが存在することを確認（name、description、url、skills）
   - 各スキルにid、name、description、少なくとも1つの入出力モードがあることを確認
   - URLが到達可能で`/.well-known/agent.json`でカードを配信していることを確認

5.3. Agent Cardを公開する:
   - `https://<agent-url>/.well-known/agent.json`で配信
   - `Content-Type: application/json`を設定
   - クロスオリジン発見が必要な場合はCORSヘッダーを有効にする
   - 関連するエージェントディレクトリやレジストリに登録する

5.4. カードのフェッチにより発見をテストする:

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**期待結果:** well-known URLで配信され、任意のA2Aクライアントがパース可能な有効なJSON Agent Card。

**失敗時:** JSON検証が失敗する場合、JSONリンターを使用して構文エラーを特定する。URLが到達不能な場合、DNS、SSL証明書、Webサーバー設定を確認する。CORSが必要な場合、`Access-Control-Allow-Origin`ヘッダーを追加する。

## バリデーション

- [ ] Agent Cardが構文エラーのない有効なJSONである
- [ ] すべての必須フィールドが存在する: name、description、url、skills
- [ ] 各スキルにid、name、description、inputModes、outputModesがある
- [ ] 認証スキームがデプロイメントのセキュリティ要件に一致する
- [ ] 機能フラグが実際の実装状態を正確に反映する
- [ ] Agent Cardが正しいContent-Typeで`/.well-known/agent.json`に配信されている
- [ ] A2Aクライアントがカードを正常にフェッチ・パースできる
- [ ] スキル内のexamplesが現実的で正しいスキルをトリガーする

## よくある落とし穴

- **機能の過大宣伝**: 実装なしに`streaming: true`や`pushNotifications: true`を設定すると、それらの機能が使用された時にクライアント障害を引き起こす。控えめにする
- **曖昧なスキル説明**: 「データ関連のことをする」のような説明は正確なスキルマッチングを妨げる。入力、出力、ドメインについて具体的にする
- **CORSヘッダーの欠落**: ブラウザベースのA2AクライアントはCORS設定なしにAgent Cardをフェッチできない
- **スキルの重複**: 2つのスキルが同じタスクを処理できる場合、クライアントエージェントはどちらを呼び出すか判断できない。明確な境界を確保する
- **デフォルトモードの省略**: `defaultInputModes`と`defaultOutputModes`が省略されると、クライアントはどのコンテンツタイプを送信すべきか分からない場合がある
- **バージョンの停滞**: スキルや機能が変更された時にAgent Cardのバージョンを更新する。クライアントが古いバージョンをキャッシュしている場合がある
- **実装前の公開**: Agent Cardは契約である。まだ実装されていないスキルを公開するとランタイム障害につながる

## 関連スキル

- `implement-a2a-server` -- Agent Cardの背後にあるサーバーを実装する
- `test-a2a-interop` -- Agent Cardの適合性と相互運用性を検証する
- `build-custom-mcp-server` -- A2Aの代替/補完としてのMCPサーバー
- `configure-mcp-server` -- A2Aセットアップに適用可能なMCP設定パターン
