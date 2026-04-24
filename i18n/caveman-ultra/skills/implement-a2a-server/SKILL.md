---
name: implement-a2a-server
locale: caveman-ultra
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

# Implement A2A Server

A2A server: JSON-RPC 2.0 + task lifecycle + SSE + Agent Card discovery.

## Use When

- Agent in multi-agent A2A workflow
- Backend for Agent Card (`design-a2a-agent-card`)
- Add A2A to existing agent/service
- Reference server for testing
- Deploy interoperable A2A agent

## In

- **Required**: Agent Card (JSON) defining skills + capabilities
- **Required**: impl lang (TS/Node.js or Python)
- **Required**: task exec logic per skill
- **Optional**: push notification webhooks (bool)
- **Optional**: persistent task store (memory, Redis, Postgres)
- **Optional**: auth middleware matching Agent Card
- **Optional**: max concurrent tasks

## Do

### Step 1: Setup JSON-RPC 2.0 handler

1.1. Init project w/ HTTP + JSON-RPC parsing:

**TS:**

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

1.2. JSON-RPC 2.0 req handler:

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

1.3. Mount on POST endpoint (usually `/`):

```typescript
app.post("/", (req, res) => {
  const response = handleJsonRpc(req.body);
  res.json(response);
});
```

1.4. Serve Agent Card at `/.well-known/agent.json`:

```typescript
app.get("/.well-known/agent.json", (req, res) => {
  res.json(agentCard);
});
```

→ HTTP server accepts JSON-RPC 2.0 + serves Agent Card.

**If err:** parsing fails → validate req body has `jsonrpc`, `method`, `id`. Return `-32700` (Parse error) for malformed JSON, `-32600` (Invalid Request) for missing fields.

### Step 2: Task state machine

2.1. Task model w/ all A2A lifecycle states:

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

2.2. State transitions:

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. Task store w/ CRUD:

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

2.4. `stateTransitionHistory` enabled → append each status change to `history` w/ timestamps.

→ Task store enforces valid transitions + maintains history.

**If err:** invalid transition (completed → working) → JSON-RPC err code `-32002` + descriptive msg. NEVER silently ignore.

### Step 3: tasks/send + tasks/get

3.1. `tasks/send` (primary):

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

3.2. `tasks/get`:

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

3.3. `tasks/cancel`:

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

→ Working `tasks/send`, `tasks/get`, `tasks/cancel` manage lifecycle.

**If err:** skill match fails → task in `failed` state w/ descriptive msg. Store full → `-32003` (resource exhausted).

### Step 4: SSE for tasks/sendSubscribe

4.1. SSE endpoint:

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

4.2. Event emitter / pub-sub in task store:

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

4.3. Emit events from all state transitions + artifact additions.

→ SSE streams real-time status + artifact events.

**If err:** SSE drops → client can reconnect + use `tasks/get` for current state. Store must not depend on active SSE.

### Step 5: Push webhook support

5.1. If `pushNotifications` in Agent Card → impl webhook registration via `tasks/pushNotification/set`:
   - Accept `PushNotificationConfig` w/ `url` (HTTPS req'd), opt `token`, `events` array (`["status", "artifact"]`)
   - Validate HTTPS → reject w/ `-32004` otherwise
   - Store config in task store, keyed by task ID

5.2. Webhook callbacks on state changes:
   - Each transition / artifact → check registered config
   - POST JSON payload w/ `taskId`, `eventType`, `status`, `timestamp`
   - `Authorization: Bearer <token>` if provided

5.3. Retry logic (exponential backoff, max 3).

5.4. `tasks/pushNotification/get` retrieves config.

→ Webhook registration + delivery w/ retry.

**If err:** push failures MUST NOT affect task exec. Log + continue. Persistent unreachable → remove after max retries.

### Step 6: Agent Card for discovery

6.1. Load + serve at startup:
   - Parse `agent-card.json` + validate capabilities match impl
   - Throw startup if card advertises `streaming: true` but SSE disabled
   - Throw if `pushNotifications: true` but webhooks disabled

6.2. CORS for cross-origin discovery:
   - `Access-Control-Allow-Origin: *` on `/.well-known/agent.json`
   - Allow `GET` + `OPTIONS`

6.3. Auth middleware per card scheme:
   - Skip auth on `/.well-known/agent.json` (always public)
   - Other endpoints → validate `Authorization` / API key
   - HTTP 401 + JSON-RPC `-32000` for unauthorized

6.4. Start + verify E2E:

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

→ Running server serves Agent Card + accepts tasks + manages lifecycle.

**If err:** capabilities mismatch impl → startup validation (6.1) catches. Fix impl or update card.

## Check

- [ ] Server serves Agent Card at `/.well-known/agent.json`
- [ ] `tasks/send` creates + transitions lifecycle
- [ ] `tasks/get` retrieves status + artifacts
- [ ] `tasks/cancel` → canceled
- [ ] SSE sends real-time status + artifact (if enabled)
- [ ] Push webhooks deliver on state changes (if enabled)
- [ ] Invalid transitions → JSON-RPC errors
- [ ] Auth rejects unauthorized
- [ ] Card capabilities match impl
- [ ] All JSON-RPC responses include `jsonrpc: "2.0"` + correct `id`

## Traps

- **Missing JSON-RPC codes**: A2A defines specific. Use `-32700` (parse), `-32600` (invalid req), `-32601` (method not found), custom for domain errors.
- **Task ID collisions**: UUIDs. Client-provided → validate uniqueness.
- **SSE leaks**: clean up subscriptions on disconnect. `req.on("close")` detects.
- **Blocking skill exec**: long-running → async. Return `submitted`/`working` immediately, update via events.
- **Agent Card drift**: impl changes, card not updated → wrong client expectations. Validate at startup.
- **Ignore terminal states**: completed/failed/canceled → no further transitions. Guard in state machine.

## →

- `design-a2a-agent-card` — design the card this server implements
- `test-a2a-interop` — validate against A2A conformance tests
- `build-custom-mcp-server` — MCP patterns inform A2A impl
- `scaffold-mcp-server` — scaffolding applicable
- `configure-ingress-networking` — prod deploy w/ TLS + routing
