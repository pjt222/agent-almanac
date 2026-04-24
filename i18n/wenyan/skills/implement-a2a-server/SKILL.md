---
name: implement-a2a-server
locale: wenyan
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

# A2A 伺服器之實

建全合 A2A 伺服器，處 JSON-RPC 2.0 請求、管任務生命、支 SSE 流實時更新、以 Agent Card 供探索。

## 用時

- 實參多代理 A2A 工作流之代理
- 建 `design-a2a-agent-card` 所設 Agent Card 之後端
- 加 A2A 協議支於現有代理或服務
- 創測試用參考 A2A 伺服器實現
- 部須與他 A2A 代理互操之代理

## 入

- **必要**：定代理技能與能力之 Agent Card（JSON）
- **必要**：實語（TypeScript/Node.js 或 Python）
- **必要**：Agent Card 所定每技能之任務執行邏輯
- **可選**：推送通知 webhook 支（`true` 或 `false`）
- **可選**：持久任務存（內存、Redis、PostgreSQL）
- **可選**：合 Agent Card 認證方案之中間件
- **可選**：最大並發任務限

## 法

### 第一步：以 JSON-RPC 2.0 處理器設項目

1.1. 以 HTTP 伺服器與 JSON-RPC 解析初項目：

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

1.2. 創 JSON-RPC 2.0 請求處理器：

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

1.3. 將 JSON-RPC 處理器掛於 POST 端點（常為 `/`）：

```typescript
app.post("/", (req, res) => {
  const response = handleJsonRpc(req.body);
  res.json(response);
});
```

1.4. 供 Agent Card 於 `/.well-known/agent.json`：

```typescript
app.get("/.well-known/agent.json", (req, res) => {
  res.json(agentCard);
});
```

**得：** HTTP 伺服器受 JSON-RPC 2.0 請求並供 Agent Card。

**敗則：** 若 JSON-RPC 解析敗，驗請求體有 `jsonrpc`、`method`、`id` 欄。畸形 JSON 返 `-32700`（解析誤），缺必欄返 `-32600`（無效請求）。

### 第二步：實任務狀態機

2.1. 定任務模型含所有 A2A 生命態：

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

2.3. 創附 CRUD 之任務存：

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

2.4. 若 Agent Card 啟 `stateTransitionHistory`，每狀態變附時戳加於任務 `history` 陣。

**得：** 強執有效狀態轉換並持歷史之任務存。

**敗則：** 若試無效狀態轉換（如 `completed` 至 `working`），返 `-32002` JSON-RPC 誤附述。勿默忽無效轉換。

### 第三步：加 tasks/send 與 tasks/get 法

3.1. 實 `tasks/send`——提任務之主法：

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

3.2. 實 `tasks/get`——取任務狀態與成品：

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

**得：** `tasks/send`、`tasks/get`、`tasks/cancel` 皆作且正管任務生命。

**敗則：** 若技能配敗，返任務於 `failed` 態附述。若任務存滿，返 `-32003`（資源耗盡）。

### 第四步：為 tasks/sendSubscribe 實 SSE 流

4.1. 創 SSE 端點流送任務更新：

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

4.2. 加事件發射或發布訂閱機制於任務存：

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

4.3. 自所有任務狀態轉換與成品加發事件。

**得：** SSE 流隨任務進送實時狀態與成品事件。

**敗則：** 若 SSE 連斷，客應可重連並以 `tasks/get` 取當前態。確任務存不依活 SSE 連。

### 第五步：加推送通知 webhook 支

5.1. 若 Agent Card 啟 `pushNotifications`，以 `tasks/pushNotification/set` 實 webhook 註冊：
   - 受 `PushNotificationConfig` 含 `url`（須 HTTPS）、可選 `token`、`events` 陣（`["status", "artifact"]`）
   - 驗 webhook URL 用 HTTPS；否返誤碼 `-32004`
   - 存配置於任務存，以任務 ID 索

5.2. 於任務狀態變送 webhook 回調：
   - 每狀態轉換或成品加察註冊推送配置
   - POST JSON 載荷含 `taskId`、`eventType`、`status`、`timestamp` 至 webhook URL
   - 若有 token 則含 `Authorization: Bearer <token>` 頭

5.3. 為敗 webhook 實重試邏輯（指數退避，最多三試）。

5.4. 加 `tasks/pushNotification/get` 以取任務當前推送配置。

**得：** webhook 註冊與交付附重試邏輯。

**敗則：** 推送通知敗勿影響任務執行。記誤續行。若 webhook URL 持不可達，最多重試後移訂閱。

### 第六步：與 Agent Card 整合為探索

6.1. 啟動時載並供 Agent Card：
   - 解析 `agent-card.json` 並驗能力合實現
   - 若卡稱 `streaming: true` 而 SSE 未啟，啟動拋
   - 若卡稱 `pushNotifications: true` 而 webhook 未啟，啟動拋

6.2. 為跨源 Agent Card 探索加 CORS 頭：
   - `/.well-known/agent.json` 設 `Access-Control-Allow-Origin: *`
   - 允 `GET` 與 `OPTIONS` 法

6.3. 加合 Agent Card 方案之認證中間件：
   - `/.well-known/agent.json` 略認證（Agent Card 始終公開）
   - 餘皆驗 `Authorization` 頭或 API 鍵
   - 未授權者返 HTTP 401 附 JSON-RPC 誤碼 `-32000`

6.4. 啟伺服器並端到端驗：

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

**得：** 運作 A2A 伺服器供 Agent Card、受任務、管全生命。

**敗則：** 若 Agent Card 能力不合實現，6.1 啟動驗將捕差。修實現或更新 Agent Card 以合。

## 驗

- [ ] 伺服器啟並於 `/.well-known/agent.json` 供 Agent Card
- [ ] `tasks/send` 創任務並轉生命
- [ ] `tasks/get` 取任務狀態與成品
- [ ] `tasks/cancel` 將任務移至取消態
- [ ] SSE 流送實時狀態與成品事件（若啟）
- [ ] 推送通知於狀態變送 webhook（若啟）
- [ ] 無效狀態轉換返合 JSON-RPC 誤
- [ ] 認證拒未授權請求（若配）
- [ ] Agent Card 能力準反伺服器實現
- [ ] 所有 JSON-RPC 響含 `jsonrpc: "2.0"` 與正 `id`

## 陷

- **缺 JSON-RPC 誤碼**：A2A 協議定特誤碼。用 `-32700`（解析誤）、`-32600`（無效請求）、`-32601`（法未找），域誤用自碼
- **任務 ID 衝突**：任務 ID 用 UUID。若客供 ID，創任務前驗唯一
- **SSE 連漏**：客斷則必清 SSE 訂閱。用 `req.on("close")` 察斷
- **阻塞技能執行**：長跑技能必異步執。即返任務於 `submitted` 或 `working` 態，後以事件更
- **Agent Card 偏移**：若伺服器實現變而 Agent Card 未更，客將有誤期。啟動驗
- **忽終態**：任務達 `completed`、`failed`、或 `canceled` 後，勿許再轉。狀態機守此

## 參

- `design-a2a-agent-card` — 設此伺服器所實之 Agent Card
- `test-a2a-interop` — 對 A2A 合規測驗伺服器
- `build-custom-mcp-server` — 告 A2A 實之 MCP 伺服器模
- `scaffold-mcp-server` — 適於 A2A 伺服器設之搭模
- `configure-ingress-networking` — 附 TLS 與路由之生產部署
