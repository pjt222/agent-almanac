---
name: test-a2a-interop
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Test A2A interop between agents: validate Agent Card conformance,
  exercise task lifecycle states, verify streaming + err handling. Use →
  verify new A2A server impl before deploy, validate interop between A2A
  agents, conformance tests in CI/CD, debug fails in multi-agent A2A
  workflows, certify agent meets A2A protocol for registry.
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

# Test A2A Interop

Validate A2A agent conforms to spec: Agent Card discovery, task lifecycle, SSE streaming, err handling, multi-agent comm patterns.

## Use When

- Verify new A2A server impl before deploy
- Validate interop between ≥2 A2A agents
- Conformance tests in CI/CD for A2A services
- Debug fails in multi-agent A2A workflows
- Certify agent meets A2A protocol for registry

## In

- **Required**: Base URL of agent under test
- **Required**: Auth creds (if needed)
- **Optional**: 2nd agent URL for bidirectional interop
- **Optional**: Specific skills to test (default: all in Card)
- **Optional**: Test timeout per task (default 60s)
- **Optional**: Output format (`json`, `markdown`, `junit`)

## Do

### Step 1: Fetch + Validate Agent Cards

1.1. Retrieve Card from well-known endpoint:

```bash
curl -s https://agent.example.com/.well-known/agent.json -o agent-card.json
```

1.2. Validate top-level required:

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

1.4. Validate auth config:
   - `authentication.schemes` includes `oauth2` → verify `credentials.oauth2` has `tokenUrl`
   - includes `apiKey` → verify `credentials.apiKey` has `headerName`

1.5. Validate capability flags = boolean.

1.6. Record validation results in conformance report:

```typescript
interface ConformanceResult {
  test: string;
  category: "agent-card" | "lifecycle" | "streaming" | "error-handling" | "interop";
  status: "pass" | "fail" | "skip";
  message?: string;
  duration_ms?: number;
}
```

**Got:** Card passes all structural validation.

**If err:** Record each fail w/ specific field + reason. Don't abort; continue. Invalid Card = test result.

### Step 2: Test Tasks Covering Lifecycle States

2.1. **Submission (submitted → working → completed)**

Send task agent should handle per declared skills:

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

2.2. **Polling (tasks/get)**

Poll until terminal:

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

2.3. **Cancellation**

Submit + immediately cancel:

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

2.4. **Input-required (multi-turn)**

Skill supports multi-turn → ambiguous req → triggers `input-required`, then follow-up:

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

2.5. **State transition history**

Card declares `stateTransitionHistory: true`:

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

**Got:** All lifecycle transitions work. Tasks complete, cancel cleanly, multi-turn fns when supported.

**If err:** Record specific transition fail, expected vs actual. Include full JSON-RPC res in report.

### Step 3: Validate SSE Streaming

3.1. Skip if `streaming: false`.

3.2. Send `tasks/sendSubscribe` + validate SSE stream:

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

3.3. Parse SSE events + validate structure:

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

3.4. Validate event sequence:
   - 1st = `status` event w/ `submitted` | `working`
   - Intermediate may include `status` updates + `artifact` deliveries
   - Final has `final: true` + terminal state
   - No events after final

3.5. Validate cleanup:
   - Close connection mid-stream
   - Verify task retrievable via `tasks/get`
   - Verify no server errs from premature disconnect

**Got:** SSE delivers correctly formatted events in right sequence, ending w/ final terminal event.

**If err:** SSE advertised but endpoint returns non-SSE → conformance fail. Events out of order → record sequence. Stream never terminates → record timeout.

### Step 4: Test Err Handling + Edge Cases

4.1. **Unknown method**

```typescript
const unknownMethod = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 20,
  method: "tasks/nonexistent",
  params: {},
});
assert(unknownMethod.error?.code === -32601, "Should return method not found");
```

4.2. **Malformed JSON-RPC**

```typescript
const malformed = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"not": "valid jsonrpc"}',
});
const response = await malformed.json();
assert(response.error?.code === -32600, "Should return invalid request");
```

4.3. **Get nonexistent task**

```typescript
const notFound = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 22,
  method: "tasks/get",
  params: { id: "nonexistent-task-id" },
});
assert(notFound.error, "Should return error for nonexistent task");
```

4.4. **Cancel completed task**

```typescript
const cancelCompleted = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 23,
  method: "tasks/cancel",
  params: { id: completedTaskId },
});
assert(cancelCompleted.error, "Should error when canceling completed task");
```

4.5. **Auth enforcement**

Auth configured → req w/o creds:

```typescript
const unauthResponse = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 24, method: "tasks/get", params: { id: "x" } }),
});
assert(unauthResponse.status === 401, "Should reject unauthenticated requests");
```

4.6. **Card publicly accessible w/o auth**

```typescript
const publicCard = await fetch(`${agentUrl}/.well-known/agent.json`);
assert(publicCard.status === 200, "Agent Card should be publicly accessible");
```

**Got:** All err conditions return appropriate JSON-RPC err codes w/o crashing.

**If err:** Record each err handling test fail. Server crashes during err testing = critical, must fix before deploy.

### Step 5: Generate Conformance Report

5.1. Aggregate test results → structured report:

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

5.2. Calculate conformance level:
   - **full**: All pass, including streaming + push notifications
   - **partial**: Core lifecycle pass, some optional fail
   - **minimal**: Card valid + basic send/get works
   - **non-conformant**: Card invalid | basic lifecycle broken

5.3. Generate report in requested format:
   - **json**: Machine-readable for CI/CD
   - **markdown**: Human-readable w/ pass/fail tables
   - **junit**: XML for test framework integration

5.4. Include recommendations:

```markdown
## Failed Tests

| Test | Category | Message | Recommendation |
|------|----------|---------|----------------|
| cancel-completed-task | error-handling | Server returned 500 | Add guard for terminal state transitions |
| sse-final-event | streaming | No final event received | Ensure SSE sends event with final:true |
```

5.5. Bidirectional testing requested (2 agents):
   - A can discover B's Card
   - A can send task to B
   - B can send task to A
   - Both handle concurrent tasks w/o interference

**Got:** Complete conformance report w/ pass/fail, level, actionable recommendations.

**If err:** Report gen fails → output raw test results to stdout fallback. Test data never lost due to reporting err.

## Check

- [ ] Card fetched + structurally validated
- [ ] ≥1 task completes full lifecycle (submitted → working → completed)
- [ ] Cancellation works
- [ ] Err responses use correct JSON-RPC codes
- [ ] SSE tested if advertised
- [ ] Auth enforced on task endpoints, NOT on Card
- [ ] Conformance report generated in requested format
- [ ] Fails include actionable remediation
- [ ] Suite runnable in CI/CD w/o manual

## Traps

- **Cold server**: Some agents take init time. Add health check | warmup before tests.
- **Hardcoded test data**: Use dynamic task + session IDs (UUIDs). Never assume specific task ID avail.
- **Ignore timing**: Transitions async. Always poll w/ backoff vs immediate state assertion.
- **SSE parsing complexity**: Events may span multiple chunks. Buffer incoming + parse complete events.
- **Only happy path**: Err handling tests as important as success. Malformed reqs, invalid transitions, auth fails all covered.
- **Network dependency**: Runnable vs localhost (dev) + remote (prod). Parameterize URL.
- **Assume skill behavior**: Suite validates protocol conformance, not skill correctness. Use example phrases from Card to trigger, don't assert specific output.

## →

- `design-a2a-agent-card` — design Card being tested
- `implement-a2a-server` — implement server being tested
- `build-ci-cd-pipeline` — integrate into CI/CD
- `troubleshoot-mcp-connection` — debugging patterns for A2A connectivity
- `review-software-architecture` — arch review for multi-agent systems
