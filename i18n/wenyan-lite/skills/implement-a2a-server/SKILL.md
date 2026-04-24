---
name: implement-a2a-server
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Implement a JSON-RPC 2.0 A2A server with full task lifecycle management
  (submitted/working/completed/failed/canceled/input-required), SSE streaming,
  and push notifications. Use when implementing an agent that participates in
  multi-agent A2A workflows, building a backend for an Agent Card, adding A2A
  protocol support to an existing agent or service, or deploying an agent that
  must interoperate with other A2A-compliant agents.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: advanced
  language: multi
  tags: a2a, server, json-rpc, task-lifecycle, streaming, sse
---

# 建 A2A 伺服器

建全合規之 A2A 伺服器，處理 JSON-RPC 2.0 請求、管任務生命週期狀態、支即時更新之 SSE 串流，並供 Agent Card 以利探索。

## 適用時機

- 建參與多代理 A2A 工作流程之代理
- 為以 `design-a2a-agent-card` 設計之 Agent Card 建後端
- 為現有代理或服務加 A2A 協定支援
- 為測試建參考 A2A 伺服器實作
- 部署須與他 A2A 合規代理互通之代理

## 輸入

- **必要**：定代理技能與能力之 Agent Card（JSON）
- **必要**：實作語言（TypeScript/Node.js 或 Python）
- **必要**：Agent Card 定義之每技能之任務執行邏輯
- **選擇性**：推送通知 webhook 支援（`true` 或 `false`）
- **選擇性**：持久任務儲存（記憶體、Redis、PostgreSQL）
- **選擇性**：配 Agent Card 驗證機制之驗證中介軟體
- **選擇性**：最大並發任務限

## 步驟

### 步驟一：以 JSON-RPC 2.0 處理器設專案

1.1. 以 HTTP 伺服器與 JSON-RPC 解析初始化專案：

**TypeScript：**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
npm init -y
npm install express uuid
npm install -D typescript @types/node @types/express tsx
```

**Python：**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn uuid6
```

1.2. 建 JSON-RPC 2.0 請求處理器：

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

1.3. 將 JSON-RPC 處理器掛於 POST 端點（通常 `/`）：

```typescript
app.post("/", (req, res) => {
  const response = handleJsonRpc(req.body);
  res.json(response);
});
```

1.4. 於 `/.well-known/agent.json` 供 Agent Card：

```typescript
app.get("/.well-known/agent.json", (req, res) => {
  res.json(agentCard);
});
```

**預期：** HTTP 伺服器接受 JSON-RPC 2.0 請求並供 Agent Card。

**失敗時：** 若 JSON-RPC 解析失敗，驗請求體有 `jsonrpc`、`method`、`id` 欄。對畸形 JSON 返 `-32700`（解析錯），對缺必要欄返 `-32600`（無效請求）。

### 步驟二：實任務狀態機

2.1. 定含所有 A2A 生命週期狀態之任務模型：

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

2.2. 實狀態轉換規則：

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. 建含 CRUD 操作之任務儲存：

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

2.4. 若 Agent Card 啟 `stateTransitionHistory`，每狀態變附時間戳附加於任務之 `history` 陣列。

**預期：** 任務儲存強制有效狀態轉換並維歷史。

**失敗時：** 若試無效狀態轉換（如 `completed` 至 `working`），以碼 `-32002` 附描述訊息返 JSON-RPC 錯。永勿默忽無效轉換。

### 步驟三：加 tasks/send 與 tasks/get 方法

3.1. 實 `tasks/send`——提交任務之主方法：

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

3.2. 實 `tasks/get`——取任務狀態與工件：

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

3.3. 實 `tasks/cancel`：

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

**預期：** 可用之 `tasks/send`、`tasks/get`、`tasks/cancel` 方法，正確管任務生命週期。

**失敗時：** 若技能配對失敗，以描述訊息於 `failed` 態返任務。若任務儲存滿，返 `-32003`（資源耗盡）。

### 步驟四：為 tasks/sendSubscribe 實 SSE 串流

4.1. 建 SSE 端點以串流任務更新：

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

4.2. 於任務儲存加事件發射器或 pub/sub 機制：

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

4.3. 自所有任務狀態轉換與工件增加發事件。

**預期：** SSE 串流於任務進展時發即時狀態與工件事件。

**失敗時：** 若 SSE 連線斷，客戶端應可重連並用 `tasks/get` 取當前狀態。確任務儲存不依活動 SSE 連線。

### 步驟五：加推送通知 Webhook 支援

5.1. 若 Agent Card 啟 `pushNotifications`，經 `tasks/pushNotification/set` 實 webhook 註冊：
   - 接 `PushNotificationConfig` 附 `url`（必 HTTPS）、選擇性 `token` 與 `events` 陣列（`["status", "artifact"]`）
   - 驗 webhook URL 用 HTTPS；否則以錯碼 `-32004` 拒之
   - 儲存配置於任務儲存，以任務 ID 為鍵

5.2. 於任務狀態變時發 webhook 回呼：
   - 每狀態轉換或工件增加時核是否有註冊之推送配置
   - POST 含 `taskId`、`eventType`、`status`、`timestamp` 之 JSON 負載至 webhook URL
   - 若供 token 則納 `Authorization: Bearer <token>` 標頭

5.3. 為失敗之 webhook 實重試邏輯（指數退避，最多三次重試）。

5.4. 加 `tasks/pushNotification/get` 以取任務當前推送配置。

**預期：** Webhook 註冊與送達附重試邏輯。

**失敗時：** 推送通知失敗不得影響任務執行。記錯並續。若 webhook URL 持續不可達，最大重試後移訂閱。

### 步驟六：與 Agent Card 整合以利探索

6.1. 啟動時載並供 Agent Card：
   - 解析 `agent-card.json` 並驗能力配實作
   - 若卡宣 `streaming: true` 而 SSE 未啟，啟動時拋錯
   - 若卡宣 `pushNotifications: true` 而 webhook 未啟，啟動時拋錯

6.2. 為跨源 Agent Card 探索加 CORS 標頭：
   - 於 `/.well-known/agent.json` 設 `Access-Control-Allow-Origin: *`
   - 允 `GET` 與 `OPTIONS` 方法

6.3. 加配 Agent Card 機制之驗證中介軟體：
   - 略 `/.well-known/agent.json` 之驗證（Agent Card 永為公開）
   - 所有他端點驗 `Authorization` 標頭或 API 金鑰
   - 未授權請求返 HTTP 401 附 JSON-RPC 錯碼 `-32000`

6.4. 啟動伺服器並端到端驗證：

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

**預期：** 執行中之 A2A 伺服器供其 Agent Card、接任務、管其全生命週期。

**失敗時：** 若 Agent Card 能力不配實作，6.1 之啟動驗證將捕此不配。修實作或更新 Agent Card 以配之。

## 驗證

- [ ] 伺服器啟且於 `/.well-known/agent.json` 供 Agent Card
- [ ] `tasks/send` 建任務並令其經生命週期轉換
- [ ] `tasks/get` 取任務狀態與工件
- [ ] `tasks/cancel` 將任務移至 canceled 態
- [ ] SSE 串流發即時狀態與工件事件（若啟）
- [ ] 推送通知於狀態變時送達 webhook（若啟）
- [ ] 無效狀態轉換返合宜之 JSON-RPC 錯
- [ ] 驗證拒未授權請求（若配置）
- [ ] Agent Card 能力精確反映伺服器實作
- [ ] 所有 JSON-RPC 響應含 `jsonrpc: "2.0"` 與正確 `id`

## 常見陷阱

- **缺 JSON-RPC 錯碼**：A2A 協定定特定錯碼。用 `-32700`（解析錯）、`-32600`（無效請求）、`-32601`（方法未覓）與領域錯之自訂碼
- **任務 ID 衝突**：用 UUID 為任務 ID。若客戶端供 ID，建任務前驗唯一性
- **SSE 連線洩漏**：客戶端斷時永清 SSE 訂閱。用 `req.on("close")` 偵斷
- **阻塞技能執行**：長時技能須異步執行。即刻以 `submitted` 或 `working` 態返任務，再經事件更新
- **Agent Card 漂移**：若伺服器實作變而 Agent Card 未更新，客戶端將有錯期望。啟動時驗
- **忽視終態**：任務至 `completed`、`failed` 或 `canceled` 後不允進一步狀態轉換。於狀態機中守之

## 相關技能

- `design-a2a-agent-card` - 設計此伺服器所實之 Agent Card
- `test-a2a-interop` - 對 A2A 合規測試驗伺服器
- `build-custom-mcp-server` - MCP 伺服器模式引導 A2A 實作
- `scaffold-mcp-server` - 適用於 A2A 伺服器設置之骨架模式
- `configure-ingress-networking` - 附 TLS 與路由之生產部署
