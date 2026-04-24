---
name: implement-a2a-server
locale: wenyan-ultra
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

# 建 A2A 服務器

建全合之 A2A 服務器，處 JSON-RPC 2.0 請，管任務生命週期態，支 SSE 流即時更新，並供 Agent Card 以發現。

## 用

- 建參與多代理 A2A 工作流之代理
- 建由 `design-a2a-agent-card` 所設 Agent Card 之後端
- 加 A2A 協議支援於既有代理或服務
- 造參考 A2A 服務器施行供試
- 部需與他 A2A 合之代理互操作者

## 入

- **必**：Agent Card（JSON），定代理技能與能
- **必**：施行語言（TypeScript/Node.js 或 Python）
- **必**：Agent Card 所定各技能之任務行邏輯
- **可**：推送通知鉤支援（`true` 或 `false`）
- **可**：持久任務存（內存、Redis、PostgreSQL）
- **可**：合 Agent Card 認證方案之認證中介
- **可**：最大並發任務限

## 行

### 一：立項目並備 JSON-RPC 2.0 處理器

1.1. 以 HTTP 服務器與 JSON-RPC 解初化：

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

1.2. 造 JSON-RPC 2.0 請求處理器：

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

1.3. 掛 JSON-RPC 處理器於 POST 端點（常 `/`）：

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

得：接 JSON-RPC 2.0 請求並供 Agent Card 之 HTTP 服務器。

敗：JSON-RPC 解敗→驗請求體有 `jsonrpc`、`method`、`id`。畸 JSON 返 `-32700`（解誤），缺必欄返 `-32600`（無效請求）。

### 二：實任務態機

2.1. 定任務模型含諸 A2A 生命週期態：

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

2.2. 施態轉則：

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. 造任務存含 CRUD 操作：

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

2.4. Agent Card 啟 `stateTransitionHistory` 則各態變附於任務 `history` 含時戳。

得：強有效態轉並維史之任務存。

敗：試無效態轉（如 `completed` 至 `working`）→返 JSON-RPC 誤碼 `-32002` 並明訊。絕勿默忽無效轉。

### 三：加 tasks/send 與 tasks/get 法

3.1. 施 `tasks/send`——提交任務之主法：

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

3.2. 施 `tasks/get`——取任務態與物件：

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

3.3. 施 `tasks/cancel`：

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

得：正管任務生命週期之 `tasks/send`、`tasks/get`、`tasks/cancel` 諸法。

敗：技能匹配敗→返 `failed` 態任務含明訊。任務存滿→返 `-32003`（資源耗）。

### 四：實 SSE 流供 tasks/sendSubscribe

4.1. 造 SSE 端點流任務更新：

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

4.2. 加事件發或 pub/sub 機制於任務存：

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

4.3. 於諸任務態轉與物件加發事件。

得：隨任務進流即時態與物件事件之 SSE 流。

敗：SSE 連斷→客應可重連並用 `tasks/get` 取當前態。確任務存不倚活 SSE 連。

### 五：加推送通知鉤支援

5.1. Agent Card 啟 `pushNotifications`→經 `tasks/pushNotification/set` 施鉤註：
   - 接 `PushNotificationConfig` 含 `url`（必 HTTPS）、選 `token`、`events` 列（`["status", "artifact"]`）
   - 驗鉤 URL 用 HTTPS；否則返誤碼 `-32004`
   - 存配於任務存，以任務 ID 為鍵

5.2. 於任務態變發鉤回調：
   - 每態轉或加物件時查有註之推送配
   - POST JSON 載體（`taskId`、`eventType`、`status`、`timestamp`）至鉤 URL
   - 若有予 token 則含 `Authorization: Bearer <token>` 頭

5.3. 為鉤敗實重試邏輯（指數退避，最多 3 試）。

5.4. 加 `tasks/pushNotification/get` 供取任務當前推送配。

得：鉤註與遞送含重試邏輯。

敗：推送通知敗絕不得影響任務行。記誤續之。鉤 URL 持不可達→耗試後除訂閱。

### 六：集 Agent Card 以發現

6.1. 啟時載並供 Agent Card：
   - 解 `agent-card.json` 並驗能符施行
   - 啟時若卡聲 `streaming: true` 而 SSE 未啟→擲
   - 啟時若卡聲 `pushNotifications: true` 而鉤未啟→擲

6.2. 為跨源 Agent Card 發現加 CORS 頭：
   - `/.well-known/agent.json` 設 `Access-Control-Allow-Origin: *`
   - 允 `GET` 與 `OPTIONS` 法

6.3. 加合 Agent Card 方案之認證中介：
   - 於 `/.well-known/agent.json` 略認證（Agent Card 恆公）
   - 他諸端點→驗 `Authorization` 頭或 API 鍵
   - 未授返 HTTP 401 含 JSON-RPC 誤碼 `-32000`

6.4. 啟服務器並端對端驗：

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

得：運 A2A 服務器，供其 Agent Card，接任務，管全生命週期。

敗：Agent Card 能不符施行→6.1 之啟驗將捕失配。修施行或更卡以符。

## 驗

- [ ] 服務器啟並於 `/.well-known/agent.json` 供 Agent Card
- [ ] `tasks/send` 造任務並轉之經生命週期
- [ ] `tasks/get` 取任務態與物件
- [ ] `tasks/cancel` 將任務移至 canceled 態
- [ ] SSE 流發即時態與物件事件（若啟）
- [ ] 推送通知於態變遞鉤（若啟）
- [ ] 無效態轉返合適 JSON-RPC 誤
- [ ] 認證拒未授請求（若配）
- [ ] Agent Card 能精反映服務器施行
- [ ] 諸 JSON-RPC 返含 `jsonrpc: "2.0"` 與正確 `id`

## 忌

- **漏 JSON-RPC 誤碼**：A2A 協議定特定誤碼。用 `-32700`（解誤）、`-32600`（無效請求）、`-32601`（法未找）及自定碼供域誤
- **任務 ID 撞**：任務 ID 用 UUID。若客予 ID→造任務前驗唯一
- **SSE 連漏**：客斷時必清 SSE 訂。用 `req.on("close")` 偵斷
- **阻塞技能行**：長行技能必異步行。立返 `submitted` 或 `working` 態任務，後經事件更
- **Agent Card 漂移**：服務器施行變而卡未更→客有誤期。啟時驗
- **忽終態**：任務至 `completed`、`failed`、`canceled` 後，無他態轉可。於態機中防此

## 參

- `design-a2a-agent-card`
- `test-a2a-interop`
- `build-custom-mcp-server`
- `scaffold-mcp-server`
- `configure-ingress-networking`
