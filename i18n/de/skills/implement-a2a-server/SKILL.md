---
name: implement-a2a-server
description: >
  Implementieren a JSON-RPC 2.0 A2A server with full task lifecycle management
  (submitted/working/completed/failed/canceled/input-required), SSE streaming,
  and push notifications. Verwenden wenn implementing an agent that participates in
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
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# A2A-Server implementieren

Erstellen a fully compliant A2A server that handles JSON-RPC 2.0 requests, manages task lifecycle states, supports SSE streaming for real-time updates, and serves an Agent Card for discovery.

## Wann verwenden

- Implementing an agent that participates in multi-agent A2A workflows
- Building a backend for an Agent Card designed with `design-a2a-agent-card`
- Adding A2A protocol support to an existing agent or service
- Creating a reference A2A server implementation for testing
- Deploying an agent that must interoperate with other A2A-compliant agents

## Eingaben

- **Erforderlich**: Agent Card (JSON) defining the agent's skills and capabilities
- **Erforderlich**: Implementation language (TypeScript/Node.js or Python)
- **Erforderlich**: Task execution logic fuer jede skill defined in the Agent Card
- **Optional**: Push notification webhook support (`true` or `false`)
- **Optional**: Persistent task store (in-memory, Redis, PostgreSQL)
- **Optional**: Authentication middleware matching the Agent Card's auth scheme
- **Optional**: Maximum concurrent tasks limit

## Vorgehensweise

### Schritt 1: Set Up Project with JSON-RPC 2.0 Handler

1.1. Initialize das Projekt with HTTP server and JSON-RPC parsing:

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

1.2. Erstellen the JSON-RPC 2.0 request handler:

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

1.3. Mount the JSON-RPC handler on a POST endpoint (typischerweise `/`):

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

**Erwartet:** An HTTP server that accepts JSON-RPC 2.0 requests and serves the Agent Card.

**Bei Fehler:** If JSON-RPC parsing fails, validate that die Anfrage body has `jsonrpc`, `method`, and `id` fields. Zurueckgeben `-32700` (Parsen error) for malformed JSON and `-32600` (Invalid Request) for missing required fields.

### Schritt 2: Implementieren Task State Machine

2.1. Definieren the task model with all A2A lifecycle states:

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

2.2. Implementieren state transition rules:

```
submitted  -> working | failed | canceled
working    -> completed | failed | canceled | input-required
input-required -> working | failed | canceled
completed  -> (terminal)
failed     -> (terminal)
canceled   -> (terminal)
```

2.3. Erstellen a task store with CRUD operations:

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

**Erwartet:** A task store that enforces valid state transitions and maintains history.

**Bei Fehler:** If an invalid state transition is attempted (e.g., `completed` to `working`), return a JSON-RPC error with code `-32002` and a descriptive message. Never silently ignore invalid transitions.

### Schritt 3: Hinzufuegen tasks/send and tasks/get Methods

3.1. Implementieren `tasks/send` — the primary method for submitting tasks:

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

3.2. Implementieren `tasks/get` — retrieve task status and artifacts:

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

3.3. Implementieren `tasks/cancel`:

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

**Erwartet:** Working `tasks/send`, `tasks/get`, and `tasks/cancel` methods that korrekt manage task lifecycle.

**Bei Fehler:** If skill matching fails, return the task in `failed` state with a descriptive message. If the task store is full, return `-32003` (resource exhausted).

### Schritt 4: Implementieren SSE Streaming for tasks/sendSubscribe

4.1. Erstellen an SSE endpoint for streaming task updates:

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

4.2. Hinzufuegen an event emitter or pub/sub mechanism to the task store:

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

**Erwartet:** SSE streaming that sends real-time status and artifact events as the task progresses.

**Bei Fehler:** If SSE connection drops, der Client sollte able to reconnect and use `tasks/get` to retrieve the current state. Sicherstellen the task store nicht depend on active SSE connections.

### Schritt 5: Hinzufuegen Push Notification Webhook Support

5.1. If `pushNotifications` is enabled in the Agent Card, implement webhook registration via `tasks/pushNotification/set`:
   - Akzeptieren a `PushNotificationConfig` with `url` (HTTPS required), optional `token`, and `events` array (`["status", "artifact"]`)
   - Validieren the webhook URL uses HTTPS; reject with error code `-32004` andernfalls
   - Speichern the config in the task store, keyed by task ID

5.2. Senden webhook callbacks on task state changes:
   - On each state transition or artifact addition, check for a registered push config
   - POST a JSON payload with `taskId`, `eventType`, `status`, and `timestamp` to the webhook URL
   - Einschliessen `Authorization: Bearer <token>` header if a token was provided

5.3. Implementieren retry logic for failed webhooks (exponential backoff, max 3 retries).

5.4. Hinzufuegen `tasks/pushNotification/get` to retrieve the current push config for a task.

**Erwartet:** Webhook registration and delivery with retry logic.

**Bei Fehler:** Push notification failures must never affect task execution. Log errors and continue. If the webhook URL is persistently unreachable, remove the subscription nach max retries.

### Schritt 6: Integrieren with Agent Card for Discovery

6.1. Laden and serve the Agent Card at startup:
   - Parsen `agent-card.json` and validate capabilities match implementation
   - Throw at startup if the card advertises `streaming: true` but SSE ist nicht enabled
   - Throw at startup if the card advertises `pushNotifications: true` but webhooks sind nicht enabled

6.2. Hinzufuegen CORS headers for cross-origin Agent Card discovery:
   - Set `Access-Control-Allow-Origin: *` on `/.well-known/agent.json`
   - Erlauben `GET` and `OPTIONS` methods

6.3. Hinzufuegen Authentifizierung middleware matching the Agent Card's scheme:
   - Ueberspringen Authentifizierung for `/.well-known/agent.json` (Agent Card is always public)
   - For all other endpoints, validate the `Authorization` header or API key
   - Zurueckgeben HTTP 401 with JSON-RPC error code `-32000` for unauthorized requests

6.4. Starten der Server and verify end-to-end:

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

**Erwartet:** A running A2A server that serves its Agent Card, accepts tasks, and manages their full lifecycle.

**Bei Fehler:** If the Agent Card capabilities nicht match the implementation, the startup validation from 6.1 will catch the mismatch. Beheben the implementation or update the Agent Card to match.

## Validierung

- [ ] Server starts and serves Agent Card at `/.well-known/agent.json`
- [ ] `tasks/send` creates tasks and transitions them durch the lifecycle
- [ ] `tasks/get` retrieves task status and artifacts
- [ ] `tasks/cancel` moves tasks to the canceled state
- [ ] SSE streaming sends real-time status and artifact events (if enabled)
- [ ] Push notifications deliver webhooks on state changes (if enabled)
- [ ] Invalid state transitions return appropriate JSON-RPC errors
- [ ] Authentication rejects unauthorized requests (if configured)
- [ ] Agent Card capabilities accurately reflect server implementation
- [ ] All JSON-RPC responses include `jsonrpc: "2.0"` and correct `id`

## Haeufige Stolperfallen

- **Missing JSON-RPC error codes**: The A2A protocol defines specific error codes. Use `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found), and custom codes for domain errors.
- **Task ID collisions**: Use UUIDs for task IDs. If der Client provides an ID, validate uniqueness vor creating the task.
- **SSE connection leaks**: Always clean up SSE subscriptions when der Client disconnects. Use `req.on("close")` to detect disconnects.
- **Blocking skill execution**: Long-running skills must execute asynchronously. Zurueckgeben the task in `submitted` or `working` state sofort, then update via events.
- **Agent Card drift**: If der Server implementation changes but the Agent Card ist nicht updated, clients will have incorrect expectations. Validieren at startup.
- **Ignoring terminal states**: Once a task reaches `completed`, `failed`, or `canceled`, no further state transitions are allowed. Guard gegen this in der Zustand machine.

## Verwandte Skills

- `design-a2a-agent-card` - design the Agent Card this server implements
- `test-a2a-interop` - validate der Server gegen A2A conformance tests
- `build-custom-mcp-server` - MCP server patterns that inform A2A implementation
- `scaffold-mcp-server` - scaffolding patterns applicable to A2A server setup
- `configure-ingress-networking` - production deployment with TLS and routing
