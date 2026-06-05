---
name: implement-a2a-server
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

Build a fully compliant A2A server that handles JSON-RPC 2.0 requests, manages task lifecycle states, supports SSE streaming for real-time updates, and serves an Agent Card for discovery.

## When to Use

- Implementing an agent that participates in multi-agent A2A workflows
- Building a backend for an Agent Card designed with `design-a2a-agent-card`
- Adding A2A protocol support to an existing agent or service
- Creating a reference A2A server implementation for testing
- Deploying an agent that must interoperate with other A2A-compliant agents

## Inputs

- **Required**: Agent Card (JSON) defining the agent's skills and capabilities
- **Required**: Implementation language (TypeScript/Node.js or Python)
- **Required**: Task execution logic for each skill defined in the Agent Card
- **Optional**: Push notification webhook support (`true` or `false`)
- **Optional**: Persistent task store (in-memory, Redis, PostgreSQL)
- **Optional**: Authentication middleware matching the Agent Card's auth scheme
- **Optional**: Maximum concurrent tasks limit

## Procedure

### Step 1: Set Up Project with JSON-RPC 2.0 Handler

1.1. Initialize the project with HTTP server and JSON-RPC parsing:

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

1.2. Create the JSON-RPC 2.0 request handler:

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

1.3. Mount the JSON-RPC handler on a POST endpoint (typically `/`):

```typescript
app.post("/", (req, res) => {
  const response = handleJsonRpc(req.body);
  res.json(response);
});
```

1.4. Serve the Agent Card at `/.well-known/agent.json`:

```typescript
app.get("/.well-known/agent.json", (req, res) => {
  res.json(agentCard);
});
```

**Expected:** An HTTP server that accepts JSON-RPC 2.0 requests and serves the Agent Card.

**On failure:** If JSON-RPC parsing fails, validate that the request body has `jsonrpc`, `method`, and `id` fields. Return `-32700` (Parse error) for malformed JSON and `-32600` (Invalid Request) for missing required fields.

### Step 2: Implement Task State Machine

2.1. Define the task model with all A2A lifecycle states:

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

2.3. Create a task store with CRUD operations:

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

2.4. If `stateTransitionHistory` is enabled in the Agent Card, append each status change to the task's `history` array with timestamps.

**Expected:** A task store that enforces valid state transitions and maintains history.

**On failure:** If an invalid state transition is attempted (e.g., `completed` to `working`), return a JSON-RPC error with code `-32002` and a descriptive message. Never silently ignore invalid transitions.

### Step 3: Add tasks/send and tasks/get Methods

3.1. Implement `tasks/send` — the primary method for submitting tasks:

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

3.2. Implement `tasks/get` — retrieve task status and artifacts:

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

**Expected:** Working `tasks/send`, `tasks/get`, and `tasks/cancel` methods that correctly manage task lifecycle.

**On failure:** If skill matching fails, return the task in `failed` state with a descriptive message. If the task store is full, return `-32003` (resource exhausted).

### Step 4: Implement SSE Streaming for tasks/sendSubscribe

4.1. Create an SSE endpoint for streaming task updates:

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

4.2. Add an event emitter or pub/sub mechanism to the task store:

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

4.3. Emit events from all task state transitions and artifact additions.

**Expected:** SSE streaming that sends real-time status and artifact events as the task progresses.

**On failure:** If SSE connection drops, the client should be able to reconnect and use `tasks/get` to retrieve the current state. Ensure the task store does not depend on active SSE connections.

### Step 5: Add Push Notification Webhook Support

5.1. If `pushNotifications` is enabled in the Agent Card, implement webhook registration via `tasks/pushNotification/set`:
   - Accept a `PushNotificationConfig` with `url` (HTTPS required), optional `token`, and `events` array (`["status", "artifact"]`)
   - Validate the webhook URL uses HTTPS; reject with error code `-32004` otherwise
   - Store the config in the task store, keyed by task ID

5.2. Send webhook callbacks on task state changes:
   - On each state transition or artifact addition, check for a registered push config
   - POST a JSON payload with `taskId`, `eventType`, `status`, and `timestamp` to the webhook URL
   - Include `Authorization: Bearer <token>` header if a token was provided

5.3. Implement retry logic for failed webhooks (exponential backoff, max 3 retries).

5.4. Add `tasks/pushNotification/get` to retrieve the current push config for a task.

**Expected:** Webhook registration and delivery with retry logic.

**On failure:** Push notification failures must never affect task execution. Log errors and continue. If the webhook URL is persistently unreachable, remove the subscription after max retries.

### Step 6: Integrate with Agent Card for Discovery

6.1. Load and serve the Agent Card at startup:
   - Parse `agent-card.json` and validate capabilities match implementation
   - Throw at startup if the card advertises `streaming: true` but SSE is not enabled
   - Throw at startup if the card advertises `pushNotifications: true` but webhooks are not enabled

6.2. Add CORS headers for cross-origin Agent Card discovery:
   - Set `Access-Control-Allow-Origin: *` on `/.well-known/agent.json`
   - Allow `GET` and `OPTIONS` methods

6.3. Add authentication middleware matching the Agent Card's scheme:
   - Skip authentication for `/.well-known/agent.json` (Agent Card is always public)
   - For all other endpoints, validate the `Authorization` header or API key
   - Return HTTP 401 with JSON-RPC error code `-32000` for unauthorized requests

6.4. Start the server and verify end-to-end:

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

**Expected:** A running A2A server that serves its Agent Card, accepts tasks, and manages their full lifecycle.

**On failure:** If the Agent Card capabilities do not match the implementation, the startup validation from 6.1 will catch the mismatch. Fix the implementation or update the Agent Card to match.

## Validation

- [ ] Server starts and serves Agent Card at `/.well-known/agent.json`
- [ ] `tasks/send` creates tasks and transitions them through the lifecycle
- [ ] `tasks/get` retrieves task status and artifacts
- [ ] `tasks/cancel` moves tasks to the canceled state
- [ ] SSE streaming sends real-time status and artifact events (if enabled)
- [ ] Push notifications deliver webhooks on state changes (if enabled)
- [ ] Invalid state transitions return appropriate JSON-RPC errors
- [ ] Authentication rejects unauthorized requests (if configured)
- [ ] Agent Card capabilities accurately reflect server implementation
- [ ] All JSON-RPC responses include `jsonrpc: "2.0"` and correct `id`

## Common Pitfalls

- **Missing JSON-RPC error codes**: The A2A protocol defines specific error codes. Use `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found), and custom codes for domain errors.
- **Task ID collisions**: Use UUIDs for task IDs. If the client provides an ID, validate uniqueness before creating the task.
- **SSE connection leaks**: Always clean up SSE subscriptions when the client disconnects. Use `req.on("close")` to detect disconnects.
- **Blocking skill execution**: Long-running skills must execute asynchronously. Return the task in `submitted` or `working` state immediately, then update via events.
- **Agent Card drift**: If the server implementation changes but the Agent Card is not updated, clients will have incorrect expectations. Validate at startup.
- **Ignoring terminal states**: Once a task reaches `completed`, `failed`, or `canceled`, no further state transitions are allowed. Guard against this in the state machine.

## Related Skills

- `design-a2a-agent-card` - design the Agent Card this server implements
- `test-a2a-interop` - validate the server against A2A conformance tests
- `build-custom-mcp-server` - MCP server patterns that inform A2A implementation
- `scaffold-mcp-server` - scaffolding patterns applicable to A2A server setup
- `configure-ingress-networking` - production deployment with TLS and routing
