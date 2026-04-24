---
name: implement-a2a-server
locale: caveman
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

Build fully compliant A2A server. Handles JSON-RPC 2.0 requests, manages task lifecycle states, supports SSE streaming for real-time updates, serves Agent Card for discovery.

## When Use

- Implement agent that participates in multi-agent A2A workflows
- Build backend for Agent Card designed with `design-a2a-agent-card`
- Add A2A protocol support to existing agent or service
- Create reference A2A server implementation for testing
- Deploy agent that must interoperate with other A2A-compliant agents

## Inputs

- **Required**: Agent Card (JSON) defining agent skills + capabilities
- **Required**: Implementation language (TypeScript/Node.js or Python)
- **Required**: Task execution logic for each skill defined in Agent Card
- **Optional**: Push notification webhook support (`true` or `false`)
- **Optional**: Persistent task store (in-memory, Redis, PostgreSQL)
- **Optional**: Authentication middleware matching Agent Card auth scheme
- **Optional**: Maximum concurrent tasks limit

## Steps

### Step 1: Set Up Project with JSON-RPC 2.0 Handler

1.1. Initialize project with HTTP server + JSON-RPC parsing:

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

1.2. Make JSON-RPC 2.0 request handler:

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

1.3. Mount JSON-RPC handler on POST endpoint (typically `/`):

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

**Got:** HTTP server accepts JSON-RPC 2.0 requests + serves Agent Card.

**If fail:** JSON-RPC parsing fails? Validate request body has `jsonrpc`, `method`, `id` fields. Return `-32700` (Parse error) for malformed JSON + `-32600` (Invalid Request) for missing required fields.

### Step 2: Implement Task State Machine

2.1. Define task model with all A2A lifecycle states:

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

2.2. Implement state transition rules:

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. Create task store with CRUD operations:

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

2.4. `stateTransitionHistory` enabled in Agent Card? Append each status change to task's `history` array with timestamps.

**Got:** Task store enforces valid state transitions + maintains history.

**If fail:** Invalid state transition attempted (`completed` to `working`)? Return JSON-RPC error code `-32002` + descriptive message. Never silently ignore invalid transitions.

### Step 3: Add tasks/send + tasks/get Methods

3.1. Implement `tasks/send` — primary method for submitting tasks:

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

3.2. Implement `tasks/get` — retrieve task status + artifacts:

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

3.3. Implement `tasks/cancel`:

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

**Got:** Working `tasks/send`, `tasks/get`, `tasks/cancel` methods correctly manage task lifecycle.

**If fail:** Skill matching fails? Return task in `failed` state with descriptive message. Task store full → return `-32003` (resource exhausted).

### Step 4: Implement SSE Streaming for tasks/sendSubscribe

4.1. Make SSE endpoint for streaming task updates:

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

4.2. Add event emitter or pub/sub to task store:

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

4.3. Emit events from all task state transitions + artifact additions.

**Got:** SSE streaming sends real-time status + artifact events as task progresses.

**If fail:** SSE connection drops? Client should reconnect + use `tasks/get` to retrieve current state. Ensure task store doesn't depend on active SSE connections.

### Step 5: Add Push Notification Webhook Support

5.1. `pushNotifications` enabled in Agent Card? Implement webhook registration via `tasks/pushNotification/set`:
   - Accept `PushNotificationConfig` with `url` (HTTPS required), optional `token`, `events` array (`["status", "artifact"]`)
   - Validate webhook URL uses HTTPS; reject with error code `-32004` otherwise
   - Store config in task store, keyed by task ID

5.2. Send webhook callbacks on task state changes:
   - Each state transition or artifact addition, check for registered push config
   - POST JSON payload with `taskId`, `eventType`, `status`, `timestamp` to webhook URL
   - Include `Authorization: Bearer <token>` header if token provided

5.3. Implement retry logic for failed webhooks (exponential backoff, max 3 retries).

5.4. Add `tasks/pushNotification/get` to retrieve current push config for task.

**Got:** Webhook registration + delivery with retry logic.

**If fail:** Push notification failures must never affect task execution. Log errors + continue. Webhook URL persistently unreachable → remove subscription after max retries.

### Step 6: Integrate with Agent Card for Discovery

6.1. Load + serve Agent Card at startup:
   - Parse `agent-card.json` + validate capabilities match implementation
   - Throw at startup if card advertises `streaming: true` but SSE not enabled
   - Throw at startup if card advertises `pushNotifications: true` but webhooks not enabled

6.2. Add CORS headers for cross-origin Agent Card discovery:
   - Set `Access-Control-Allow-Origin: *` on `/.well-known/agent.json`
   - Allow `GET` + `OPTIONS` methods

6.3. Add authentication middleware matching Agent Card scheme:
   - Skip authentication for `/.well-known/agent.json` (Agent Card always public)
   - All other endpoints → validate `Authorization` header or API key
   - Return HTTP 401 with JSON-RPC error code `-32000` for unauthorized requests

6.4. Start server + verify end-to-end:

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

**Got:** Running A2A server serves Agent Card, accepts tasks, manages full lifecycle.

**If fail:** Agent Card capabilities don't match implementation? Startup validation from 6.1 catches mismatch. Fix implementation or update Agent Card to match.

## Checks

- [ ] Server starts + serves Agent Card at `/.well-known/agent.json`
- [ ] `tasks/send` creates tasks + transitions through lifecycle
- [ ] `tasks/get` retrieves task status + artifacts
- [ ] `tasks/cancel` moves tasks to canceled state
- [ ] SSE streaming sends real-time status + artifact events (if enabled)
- [ ] Push notifications deliver webhooks on state changes (if enabled)
- [ ] Invalid state transitions return appropriate JSON-RPC errors
- [ ] Authentication rejects unauthorized requests (if configured)
- [ ] Agent Card capabilities accurately reflect server implementation
- [ ] All JSON-RPC responses include `jsonrpc: "2.0"` + correct `id`

## Pitfalls

- **Missing JSON-RPC error codes**: A2A protocol defines specific error codes. Use `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found), custom codes for domain errors.
- **Task ID collisions**: Use UUIDs for task IDs. Client provides ID? Validate uniqueness before creating task.
- **SSE connection leaks**: Always clean up SSE subscriptions when client disconnects. Use `req.on("close")` to detect disconnects.
- **Blocking skill execution**: Long-running skills must execute async. Return task in `submitted` or `working` state immediate, then update via events.
- **Agent Card drift**: Server implementation changes but Agent Card not updated → clients have incorrect expectations. Validate at startup.
- **Ignoring terminal states**: Once task reaches `completed`, `failed`, `canceled`, no further state transitions allowed. Guard against this in state machine.

## See Also

- `design-a2a-agent-card` - design Agent Card this server implements
- `test-a2a-interop` - validate server against A2A conformance tests
- `build-custom-mcp-server` - MCP server patterns that inform A2A implementation
- `scaffold-mcp-server` - scaffolding patterns applicable to A2A server setup
- `configure-ingress-networking` - production deployment with TLS + routing
