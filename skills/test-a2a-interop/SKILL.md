---
name: test-a2a-interop
description: >
  Test A2A interoperability between agents by validating Agent Card conformance,
  exercising all task lifecycle states, and verifying streaming and error handling.
  Use when verifying a new A2A server implementation before deployment, validating
  interoperability between two or more A2A agents, running conformance tests in
  CI/CD for A2A services, debugging failures in multi-agent A2A workflows, or
  certifying that an agent meets A2A protocol requirements for a registry.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: advanced
  language: multi
  tags: a2a, testing, interoperability, conformance, integration
---

# Test A2A Interoperability

Validate that an A2A agent implementation conforms to the protocol specification by testing Agent Card discovery, task lifecycle management, SSE streaming, error handling, and multi-agent communication patterns.

## When to Use

- Verifying a new A2A server implementation before deployment
- Validating interoperability between two or more A2A agents
- Running conformance tests as part of CI/CD for A2A services
- Debugging failures in multi-agent A2A workflows
- Certifying that an agent meets A2A protocol requirements for a registry

## Inputs

- **Required**: Base URL of the A2A agent under test
- **Required**: Authentication credentials (if the agent requires them)
- **Optional**: Second agent URL for bidirectional interop testing
- **Optional**: Specific skills to test (default: all skills in the Agent Card)
- **Optional**: Test timeout per task (default: 60 seconds)
- **Optional**: Output format for the conformance report (`json`, `markdown`, `junit`)

## Procedure

### Step 1: Fetch and Validate Agent Cards

1.1. Retrieve the Agent Card from the well-known endpoint:

```bash
curl -s https://agent.example.com/.well-known/agent.json -o agent-card.json
```

1.2. Validate required top-level fields:

```typescript
const requiredFields = ["name", "description", "url", "skills"];
for (const field of requiredFields) {
  assert(agentCard[field] !== undefined, `Missing required field: ${field}`);
}
```

1.3. Validate each skill entry:

```typescript
for (const skill of agentCard.skills) {
  assert(skill.id, "Skill missing id");
  assert(skill.name, "Skill missing name");
  assert(skill.description, "Skill missing description");
  assert(
    Array.isArray(skill.inputModes) && skill.inputModes.length > 0,
    `Skill ${skill.id} missing inputModes`
  );
  assert(
    Array.isArray(skill.outputModes) && skill.outputModes.length > 0,
    `Skill ${skill.id} missing outputModes`
  );
}
```

1.4. Validate authentication configuration:
   - If `authentication.schemes` includes `oauth2`, verify `credentials.oauth2` has `tokenUrl`
   - If `authentication.schemes` includes `apiKey`, verify `credentials.apiKey` has `headerName`

1.5. Validate capability flags are boolean values.

1.6. Record validation results in the conformance report:

```typescript
interface ConformanceResult {
  test: string;
  category: "agent-card" | "lifecycle" | "streaming" | "error-handling" | "interop";
  status: "pass" | "fail" | "skip";
  message?: string;
  duration_ms?: number;
}
```

**Expected:** Agent Card passes all structural validation checks.

**On failure:** Record each validation failure with the specific field and reason. Do not abort; continue testing other aspects. An invalid Agent Card is itself a test result.

### Step 2: Send Test Tasks Covering All Lifecycle States

2.1. **Test: Task submission (submitted -> working -> completed)**

Send a task that the agent should be able to handle based on its declared skills:

```typescript
const submitResult = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 1,
  method: "tasks/send",
  params: {
    id: `test-${uuid()}`,
    sessionId: `session-${uuid()}`,
    message: {
      role: "user",
      parts: [{ type: "text", text: skillExamples[0] }],
    },
  },
});

assert(submitResult.result, "tasks/send should return a result");
assert(submitResult.result.id, "Result should include task ID");
assert(
  ["submitted", "working", "completed"].includes(submitResult.result.status.state),
  `Unexpected initial state: ${submitResult.result.status.state}`
);
```

2.2. **Test: Task polling (tasks/get)**

Poll until the task reaches a terminal state:

```typescript
let task = submitResult.result;
const startTime = Date.now();
while (!["completed", "failed", "canceled"].includes(task.status.state)) {
  if (Date.now() - startTime > TEST_TIMEOUT_MS) {
    fail(`Task ${task.id} did not complete within ${TEST_TIMEOUT_MS}ms`);
    break;
  }
  await sleep(1000);
  const getResult = await sendJsonRpc(agentUrl, {
    jsonrpc: "2.0",
    id: 2,
    method: "tasks/get",
    params: { id: task.id },
  });
  task = getResult.result;
}

assert(task.status.state === "completed", `Task should complete, got: ${task.status.state}`);
```

2.3. **Test: Task cancellation**

Submit a task and immediately cancel it:

```typescript
const cancelTask = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 3,
  method: "tasks/send",
  params: { id: `test-cancel-${uuid()}`, sessionId: `session-${uuid()}`, message: { ... } },
});

const cancelResult = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 4,
  method: "tasks/cancel",
  params: { id: cancelTask.result.id },
});

assert(
  cancelResult.result.status.state === "canceled",
  "Canceled task should be in canceled state"
);
```

2.4. **Test: Input-required state (multi-turn)**

If any skill supports multi-turn interaction, send an ambiguous request that should trigger `input-required`, then provide the follow-up:

```typescript
// Send ambiguous request
const multiTurnTask = await sendJsonRpc(agentUrl, { ... });

// Poll until input-required or completed
// If input-required, send follow-up
if (task.status.state === "input-required") {
  const followUp = await sendJsonRpc(agentUrl, {
    jsonrpc: "2.0",
    id: 6,
    method: "tasks/send",
    params: {
      id: task.id,
      sessionId: task.sessionId,
      message: { role: "user", parts: [{ type: "text", text: "Column A and Column B" }] },
    },
  });
  assert(
    ["working", "completed"].includes(followUp.result.status.state),
    "Follow-up should resume task"
  );
}
```

2.5. **Test: State transition history**

If the Agent Card declares `stateTransitionHistory: true`:

```typescript
const getWithHistory = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 7,
  method: "tasks/get",
  params: { id: completedTaskId, historyLength: 100 },
});

assert(
  Array.isArray(getWithHistory.result.history),
  "Task should include history array"
);
assert(
  getWithHistory.result.history.length >= 2,
  "History should have at least 2 entries (submitted and completed)"
);
```

**Expected:** All lifecycle state transitions work correctly. Tasks complete successfully, cancel cleanly, and multi-turn interaction functions when supported.

**On failure:** Record the specific state transition that failed, the expected state, and the actual state. Include the full JSON-RPC response in the report for debugging.

### Step 3: Validate SSE Streaming Responses

3.1. Skip this step if the Agent Card declares `streaming: false`.

3.2. Send a `tasks/sendSubscribe` request and validate the SSE stream:

```typescript
const response = await fetch(`${agentUrl}/subscribe`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 10,
    method: "tasks/sendSubscribe",
    params: {
      id: `test-stream-${uuid()}`,
      sessionId: `session-${uuid()}`,
      message: { role: "user", parts: [{ type: "text", text: "Stream test task" }] },
    },
  }),
});

assert(
  response.headers.get("content-type")?.includes("text/event-stream"),
  "Response must be text/event-stream"
);
```

3.3. Parse SSE events and validate structure:

```typescript
const events: SSEEvent[] = [];
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  // Parse SSE events from buffer
  const lines = buffer.split("\n");
  for (const line of lines) {
    if (line.startsWith("event: ")) {
      currentEvent.type = line.slice(7);
    } else if (line.startsWith("data: ")) {
      currentEvent.data = JSON.parse(line.slice(6));
      events.push(currentEvent);
    }
  }
}
```

3.4. Validate the event sequence:
   - First event should be a `status` event with state `submitted` or `working`
   - Intermediate events may include `status` updates and `artifact` deliveries
   - Final event should have `final: true` with a terminal state
   - No events should arrive after the final event

3.5. Validate that SSE connection cleanup works:
   - Close the connection mid-stream
   - Verify the task can still be retrieved via `tasks/get`
   - Verify no server errors from the premature disconnect

**Expected:** SSE stream delivers correctly formatted events in the right sequence, ending with a final terminal event.

**On failure:** If SSE is advertised but the endpoint returns a non-SSE response, record as a conformance failure. If events arrive out of order, record the sequence. If the stream never terminates, record a timeout.

### Step 4: Test Error Handling and Edge Cases

4.1. **Test: Unknown method**

```typescript
const unknownMethod = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 20,
  method: "tasks/nonexistent",
  params: {},
});
assert(unknownMethod.error?.code === -32601, "Should return method not found");
```

4.2. **Test: Malformed JSON-RPC request**

```typescript
const malformed = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"not": "valid jsonrpc"}',
});
const response = await malformed.json();
assert(response.error?.code === -32600, "Should return invalid request");
```

4.3. **Test: Get nonexistent task**

```typescript
const notFound = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 22,
  method: "tasks/get",
  params: { id: "nonexistent-task-id" },
});
assert(notFound.error, "Should return error for nonexistent task");
```

4.4. **Test: Cancel already completed task**

```typescript
const cancelCompleted = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 23,
  method: "tasks/cancel",
  params: { id: completedTaskId },
});
assert(cancelCompleted.error, "Should error when canceling completed task");
```

4.5. **Test: Authentication enforcement**

If authentication is configured, send a request without credentials:

```typescript
const unauthResponse = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 24, method: "tasks/get", params: { id: "x" } }),
});
assert(unauthResponse.status === 401, "Should reject unauthenticated requests");
```

4.6. **Test: Agent Card is publicly accessible without auth**

```typescript
const publicCard = await fetch(`${agentUrl}/.well-known/agent.json`);
assert(publicCard.status === 200, "Agent Card should be publicly accessible");
```

**Expected:** All error conditions return appropriate JSON-RPC error codes without crashing the server.

**On failure:** Record each error handling test that fails. Server crashes during error testing are critical failures that must be fixed before deployment.

### Step 5: Generate Interoperability Conformance Report

5.1. Aggregate all test results into a structured report:

```typescript
interface ConformanceReport {
  agentUrl: string;
  agentName: string;
  agentVersion: string;
  testDate: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  categories: {
    agentCard: ConformanceResult[];
    lifecycle: ConformanceResult[];
    streaming: ConformanceResult[];
    errorHandling: ConformanceResult[];
    interop: ConformanceResult[];
  };
  conformanceLevel: "full" | "partial" | "minimal" | "non-conformant";
}
```

5.2. Calculate the conformance level:
   - **full**: All tests pass, including streaming and push notifications
   - **partial**: Core lifecycle tests pass, some optional features fail
   - **minimal**: Agent Card valid and basic task send/get works
   - **non-conformant**: Agent Card invalid or basic lifecycle broken

5.3. Generate the report in the requested format:
   - **json**: Machine-readable for CI/CD integration
   - **markdown**: Human-readable with pass/fail tables
   - **junit**: XML format for test framework integration

5.4. Include recommendations for fixing failures:

```markdown
## Failed Tests

| Test | Category | Message | Recommendation |
|------|----------|---------|----------------|
| cancel-completed-task | error-handling | Server returned 500 | Add guard for terminal state transitions |
| sse-final-event | streaming | No final event received | Ensure SSE sends event with final:true |
```

5.5. If bidirectional testing was requested (two agents), validate:
   - Agent A can discover Agent B's Agent Card
   - Agent A can send a task to Agent B
   - Agent B can send a task to Agent A
   - Both agents handle concurrent tasks without interference

**Expected:** A complete conformance report with pass/fail results, conformance level, and actionable recommendations.

**On failure:** If the report generation itself fails, output raw test results to stdout as a fallback. The test data should never be lost due to a reporting error.

## Validation

- [ ] Agent Card is fetched and structurally validated
- [ ] At least one task completes the full lifecycle (submitted -> working -> completed)
- [ ] Task cancellation works correctly
- [ ] Error responses use correct JSON-RPC error codes
- [ ] SSE streaming is tested if advertised in capabilities
- [ ] Authentication is enforced on task endpoints but not on Agent Card
- [ ] Conformance report is generated in the requested format
- [ ] Failed tests include actionable remediation guidance
- [ ] Test suite can run in CI/CD without manual intervention

## Common Pitfalls

- **Testing against a cold server**: Some agents take time to initialize. Add a health check or warmup request before running tests.
- **Hardcoded test data**: Use dynamic task and session IDs (UUIDs) to avoid collisions when running tests repeatedly. Never assume a specific task ID is available.
- **Ignoring timing**: Task transitions are asynchronous. Always poll with backoff rather than asserting immediate state changes.
- **SSE parsing complexity**: SSE events may span multiple chunks. Buffer incoming data and parse complete events, not raw chunks.
- **Testing only the happy path**: Error handling tests are as important as success tests. Malformed requests, invalid transitions, and auth failures must all be covered.
- **Network dependency**: Tests should be runnable against localhost for development and remote URLs for production. Parameterize the agent URL.
- **Assuming skill behavior**: The test suite validates protocol conformance, not skill correctness. Use example phrases from the Agent Card to trigger skills, but do not assert specific output content.

## Related Skills

- `design-a2a-agent-card` - design the Agent Card being tested
- `implement-a2a-server` - implement the server being tested
- `build-ci-cd-pipeline` - integrate conformance tests into CI/CD
- `troubleshoot-mcp-connection` - debugging patterns applicable to A2A connectivity
- `review-software-architecture` - architecture review for multi-agent systems
