---
name: implement-a2a-server
description: >
  完全なタスクライフサイクル管理（submitted/working/completed/failed/canceled/input-required）、
  SSEストリーミング、プッシュ通知を備えたJSON-RPC 2.0 A2Aサーバーを実装する。
  マルチエージェントA2Aワークフローに参加するエージェントを実装する時、Agent Cardの
  バックエンドを構築する時、既存のエージェントやサービスにA2Aプロトコルサポートを
  追加する時、または他のA2A準拠エージェントと相互運用する必要があるエージェントを
  デプロイする時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: advanced
  language: multi
  tags: a2a, server, json-rpc, task-lifecycle, streaming, sse
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# A2Aサーバーの実装

JSON-RPC 2.0リクエストを処理し、タスクのライフサイクル状態を管理し、リアルタイム更新のためのSSEストリーミングをサポートし、ディスカバリ用のAgent Cardを提供する完全準拠のA2Aサーバーを構築する。

## 使用タイミング

- マルチエージェントA2Aワークフローに参加するエージェントを実装する時
- `design-a2a-agent-card` で設計されたAgent Cardのバックエンドを構築する時
- 既存のエージェントやサービスにA2Aプロトコルサポートを追加する時
- テスト用のリファレンスA2Aサーバー実装を作成する時
- 他のA2A準拠エージェントと相互運用する必要があるエージェントをデプロイする時

## 入力

- **必須**: エージェントのスキルと機能を定義するAgent Card（JSON）
- **必須**: 実装言語（TypeScript/Node.jsまたはPython）
- **必須**: Agent Cardで定義された各スキルのタスク実行ロジック
- **任意**: プッシュ通知Webhookサポート（`true`または`false`）
- **任意**: 永続的タスクストア（インメモリ、Redis、PostgreSQL）
- **任意**: Agent Cardの認証スキームに合致する認証ミドルウェア
- **任意**: 最大同時タスク数制限

## 手順

### ステップ1: JSON-RPC 2.0ハンドラーを備えたプロジェクトのセットアップ

1.1. HTTPサーバーとJSON-RPCパーシングでプロジェクトを初期化する:

**TypeScript:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
npm init -y
npm install express uuid
npm install -D typescript @types/node @types/express tsx
```

**Python:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn uuid6
```

1.2. JSON-RPC 2.0リクエストハンドラーを作成する:

```typescript
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

function handleJsonRpc(request: JsonRpcRequest): JsonRpcResponse {
  switch (request.method) {
    case "tasks/send":
      return handleTaskSend(request);
    case "tasks/get":
      return handleTaskGet(request);
    case "tasks/cancel":
      return handleTaskCancel(request);
    case "tasks/sendSubscribe":
      // Handled separately via SSE
      throw new Error("Use SSE endpoint for sendSubscribe");
    default:
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
      };
  }
}
```

1.3. JSON-RPCハンドラーをPOSTエンドポイント（通常 `/`）にマウントする:

```typescript
app.post("/", (req, res) => {
  const response = handleJsonRpc(req.body);
  res.json(response);
});
```

1.4. Agent Cardを `/.well-known/agent.json` で提供する:

```typescript
app.get("/.well-known/agent.json", (req, res) => {
  res.json(agentCard);
});
```

**期待結果:** JSON-RPC 2.0リクエストを受け付け、Agent Cardを提供するHTTPサーバー。

**失敗時:** JSON-RPCのパースが失敗する場合、リクエストボディに `jsonrpc`、`method`、`id` フィールドがあることを確認する。不正なJSONには `-32700`（Parse error）を、必須フィールドの欠落には `-32600`（Invalid Request）を返す。

### ステップ2: タスクステートマシンの実装

2.1. すべてのA2Aライフサイクル状態を持つタスクモデルを定義する:

```typescript
type TaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "failed"
  | "canceled";

interface Task {
  id: string;
  sessionId: string;
  status: {
    state: TaskState;
    message?: Message;
    timestamp: string;
  };
  history?: TaskStatus[];
  artifacts?: Artifact[];
  metadata?: Record<string, unknown>;
}

interface Message {
  role: "user" | "agent";
  parts: Part[];
}

type Part =
  | { type: "text"; text: string }
  | { type: "file"; file: { name: string; mimeType: string; bytes?: string; uri?: string } }
  | { type: "data"; data: Record<string, unknown> };
```

2.2. 状態遷移ルールを実装する:

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. CRUD操作を持つタスクストアを作成する:

```typescript
class TaskStore {
  private tasks: Map<string, Task> = new Map();

  create(sessionId: string, message: Message): Task { ... }
  get(taskId: string): Task | undefined { ... }
  updateStatus(taskId: string, state: TaskState, message?: Message): Task { ... }
  addArtifact(taskId: string, artifact: Artifact): void { ... }
  cancel(taskId: string): Task { ... }
}
```

2.4. Agent Cardで `stateTransitionHistory` が有効な場合、各状態変更をタイムスタンプ付きでタスクの `history` 配列に追加する。

**期待結果:** 有効な状態遷移を強制し履歴を維持するタスクストア。

**失敗時:** 無効な状態遷移が試みられた場合（例：`completed` から `working`）、コード `-32002` と説明的なメッセージのJSON-RPCエラーを返す。無効な遷移を黙って無視しない。

### ステップ3: tasks/sendとtasks/getメソッドの追加

3.1. `tasks/send` を実装する — タスク送信のためのプライマリメソッド:

```typescript
function handleTaskSend(request: JsonRpcRequest): JsonRpcResponse {
  const { id: taskId, sessionId, message } = request.params as TaskSendParams;

  // Create or resume task
  let task = taskStore.get(taskId);
  if (!task) {
    task = taskStore.create(sessionId, message);
  } else if (task.status.state === "input-required") {
    taskStore.updateStatus(task.id, "working");
  }

  // Route to skill handler based on message content
  const skill = matchSkill(message);
  if (!skill) {
    taskStore.updateStatus(task.id, "failed", {
      role: "agent",
      parts: [{ type: "text", text: "No matching skill for this request." }],
    });
    return { jsonrpc: "2.0", id: request.id, result: taskStore.get(task.id) };
  }

  // Execute skill (async — task will transition to working, then completed/failed)
  executeSkill(skill, task, message).catch((error) => {
    taskStore.updateStatus(task.id, "failed", {
      role: "agent",
      parts: [{ type: "text", text: error.message }],
    });
  });

  return { jsonrpc: "2.0", id: request.id, result: taskStore.get(task.id) };
}
```

3.2. `tasks/get` を実装する — タスクのステータスとアーティファクトの取得:

```typescript
function handleTaskGet(request: JsonRpcRequest): JsonRpcResponse {
  const { id: taskId, historyLength } = request.params as TaskGetParams;
  const task = taskStore.get(taskId);

  if (!task) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32001, message: `Task not found: ${taskId}` },
    };
  }

  // Optionally trim history to requested length
  const result = historyLength !== undefined
    ? { ...task, history: task.history?.slice(-historyLength) }
    : task;

  return { jsonrpc: "2.0", id: request.id, result };
}
```

3.3. `tasks/cancel` を実装する:

```typescript
function handleTaskCancel(request: JsonRpcRequest): JsonRpcResponse {
  const { id: taskId } = request.params as TaskCancelParams;
  try {
    const task = taskStore.cancel(taskId);
    return { jsonrpc: "2.0", id: request.id, result: task };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: { code: -32002, message: (error as Error).message },
    };
  }
}
```

**期待結果:** タスクのライフサイクルを正しく管理する動作する `tasks/send`、`tasks/get`、`tasks/cancel` メソッド。

**失敗時:** スキルマッチングが失敗した場合、説明的なメッセージ付きの `failed` 状態でタスクを返す。タスクストアが満杯の場合、`-32003`（resource exhausted）を返す。

### ステップ4: tasks/sendSubscribe用のSSEストリーミングの実装

4.1. タスク更新のストリーミング用SSEエンドポイントを作成する:

```typescript
app.post("/subscribe", (req, res) => {
  const request = req.body as JsonRpcRequest;
  if (request.method !== "tasks/sendSubscribe") {
    res.status(400).json({ error: "Only tasks/sendSubscribe supported" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { id: taskId, sessionId, message } = request.params as TaskSendParams;
  let task = taskStore.get(taskId) ?? taskStore.create(sessionId, message);

  // Send initial status
  sendSSEEvent(res, "status", {
    id: request.id,
    result: { id: task.id, status: task.status },
  });

  // Subscribe to task updates
  const unsubscribe = taskStore.onUpdate(task.id, (updatedTask) => {
    if (updatedTask.status.state === "working") {
      sendSSEEvent(res, "status", {
        id: request.id,
        result: { id: updatedTask.id, status: updatedTask.status },
      });
    }

    if (updatedTask.artifacts?.length) {
      sendSSEEvent(res, "artifact", {
        id: request.id,
        result: { id: updatedTask.id, artifact: updatedTask.artifacts.at(-1) },
      });
    }

    // Close stream on terminal states
    if (["completed", "failed", "canceled"].includes(updatedTask.status.state)) {
      sendSSEEvent(res, "status", {
        id: request.id,
        result: { id: updatedTask.id, status: updatedTask.status, final: true },
      });
      unsubscribe();
      res.end();
    }
  });

  // Handle client disconnect
  req.on("close", () => {
    unsubscribe();
  });
});

function sendSSEEvent(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}
```

4.2. タスクストアにイベントエミッターまたはpub/subメカニズムを追加する:

```typescript
class TaskStore {
  private listeners: Map<string, Set<(task: Task) => void>> = new Map();

  onUpdate(taskId: string, callback: (task: Task) => void): () => void {
    if (!this.listeners.has(taskId)) {
      this.listeners.set(taskId, new Set());
    }
    this.listeners.get(taskId)!.add(callback);
    return () => this.listeners.get(taskId)?.delete(callback);
  }

  private notifyListeners(taskId: string): void {
    const task = this.get(taskId);
    if (task) {
      this.listeners.get(taskId)?.forEach((cb) => cb(task));
    }
  }
}
```

4.3. すべてのタスク状態遷移とアーティファクト追加からイベントを発行する。

**期待結果:** タスクの進行に伴いリアルタイムのステータスとアーティファクトイベントを送信するSSEストリーミング。

**失敗時:** SSE接続が切断された場合、クライアントは再接続して `tasks/get` を使用して現在の状態を取得できるべき。タスクストアがアクティブなSSE接続に依存しないことを確認する。

### ステップ5: プッシュ通知Webhookサポートの追加

5.1. Agent Cardで `pushNotifications` が有効な場合、`tasks/pushNotification/set` によるWebhook登録を実装する:
   - `url`（HTTPS必須）、任意の `token`、`events` 配列（`["status", "artifact"]`）を含む `PushNotificationConfig` を受け付ける
   - WebhookのURLがHTTPSを使用していることを検証する; そうでなければエラーコード `-32004` で拒否する
   - 設定をタスクIDでキー付けされたタスクストアに格納する

5.2. タスクの状態変更時にWebhookコールバックを送信する:
   - 各状態遷移またはアーティファクト追加時に、登録されたプッシュ設定を確認する
   - `taskId`、`eventType`、`status`、`timestamp` を含むJSONペイロードをWebhook URLにPOSTする
   - トークンが提供されている場合、`Authorization: Bearer <token>` ヘッダーを含める

5.3. 失敗したWebhookのリトライロジックを実装する（指数バックオフ、最大3回リトライ）。

5.4. タスクの現在のプッシュ設定を取得する `tasks/pushNotification/get` を追加する。

**期待結果:** リトライロジックを備えたWebhook登録と配信。

**失敗時:** プッシュ通知の失敗はタスクの実行に影響してはならない。エラーをログに記録して続行する。Webhook URLが永続的に到達不能な場合、最大リトライ後にサブスクリプションを削除する。

### ステップ6: ディスカバリのためのAgent Cardとの統合

6.1. 起動時にAgent Cardを読み込んで提供する:
   - `agent-card.json` をパースし、機能が実装と一致することを検証する
   - カードが `streaming: true` を宣伝しているがSSEが有効でない場合、起動時にスローする
   - カードが `pushNotifications: true` を宣伝しているがWebhookが有効でない場合、起動時にスローする

6.2. クロスオリジンAgent Cardディスカバリ用のCORSヘッダーを追加する:
   - `/.well-known/agent.json` に `Access-Control-Allow-Origin: *` を設定する
   - `GET` と `OPTIONS` メソッドを許可する

6.3. Agent Cardのスキームに合致する認証ミドルウェアを追加する:
   - `/.well-known/agent.json` の認証をスキップする（Agent Cardは常にパブリック）
   - 他のすべてのエンドポイントでは、`Authorization` ヘッダーまたはAPIキーを検証する
   - 未認証のリクエストに対しJSON-RPCエラーコード `-32000` でHTTP 401を返す

6.4. サーバーを起動してエンドツーエンドで検証する:

```bash
# Start server
npm run dev

# Fetch Agent Card
curl -s http://localhost:3000/.well-known/agent.json | python3 -m json.tool

# Send a task
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tasks/send","params":{"id":"task-1","sessionId":"session-1","message":{"role":"user","parts":[{"type":"text","text":"Analyze my dataset"}]}}}'
```

**期待結果:** Agent Cardを提供し、タスクを受け付け、完全なライフサイクルを管理する実行中のA2Aサーバー。

**失敗時:** Agent Cardの機能が実装と一致しない場合、6.1の起動時検証が不一致をキャッチする。実装を修正するかAgent Cardを更新して一致させる。

## バリデーション

- [ ] サーバーが起動し `/.well-known/agent.json` でAgent Cardを提供する
- [ ] `tasks/send` がタスクを作成しライフサイクルを通じて遷移させる
- [ ] `tasks/get` がタスクのステータスとアーティファクトを取得する
- [ ] `tasks/cancel` がタスクをcanceled状態に移行する
- [ ] SSEストリーミングがリアルタイムのステータスとアーティファクトイベントを送信する（有効な場合）
- [ ] プッシュ通知が状態変更時にWebhookを配信する（有効な場合）
- [ ] 無効な状態遷移が適切なJSON-RPCエラーを返す
- [ ] 認証が未認証リクエストを拒否する（設定されている場合）
- [ ] Agent Cardの機能がサーバーの実装を正確に反映する
- [ ] すべてのJSON-RPCレスポンスが `jsonrpc: "2.0"` と正しい `id` を含む

## よくある落とし穴

- **JSON-RPCエラーコードの欠落**: A2Aプロトコルは特定のエラーコードを定義する。`-32700`（parse error）、`-32600`（invalid request）、`-32601`（method not found）、ドメインエラー用のカスタムコードを使用する
- **タスクIDの衝突**: タスクIDにUUIDを使用する。クライアントがIDを提供する場合、タスク作成前に一意性を検証する
- **SSE接続のリーク**: クライアントが切断した時は常にSSEサブスクリプションをクリーンアップする。切断検出には `req.on("close")` を使用する
- **スキル実行のブロッキング**: 長時間実行されるスキルは非同期で実行する必要がある。即座に `submitted` または `working` 状態でタスクを返し、イベント経由で更新する
- **Agent Cardのドリフト**: サーバー実装が変更されたがAgent Cardが更新されない場合、クライアントは不正確な期待を持つ。起動時に検証する
- **終端状態の無視**: タスクが `completed`、`failed`、`canceled` に達したら、それ以上の状態遷移は許可されない。ステートマシンでこれを防御する

## 関連スキル

- `design-a2a-agent-card` — このサーバーが実装するAgent Cardを設計する
- `test-a2a-interop` — A2A適合性テストに対してサーバーを検証する
- `build-custom-mcp-server` — A2A実装に情報を提供するMCPサーバーパターン
- `scaffold-mcp-server` — A2Aサーバーセットアップに適用可能なスキャフォールディングパターン
- `configure-ingress-networking` — TLSとルーティングを備えた本番デプロイ
