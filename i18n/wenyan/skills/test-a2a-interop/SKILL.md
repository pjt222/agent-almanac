---
name: test-a2a-interop
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
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

# 試 A2A 之互操

驗 A2A 代理之實合協規——試 Agent Card 之發現、任務生命週期之治、SSE 流、誤治、多代理之通模。

## 用時

- 驗新 A2A 服之實於部前乃用
- 驗二或多 A2A 代理之互操乃用
- 行合規之試於 A2A 之 CI/CD 乃用
- 調多代理 A2A 流之敗乃用
- 證代理合 A2A 協為註冊乃用

## 入

- **必要**：所試 A2A 代理之基 URL
- **必要**：驗身憑（若代理須之）
- **可選**：第二代理之 URL 為雙向互操試
- **可選**：所試之具技（默：Agent Card 中諸技）
- **可選**：每任務試之超時（默：60 秒）
- **可選**：合規報之出格（`json`、`markdown`、`junit`）

## 法

### 第一步：取而驗 Agent Card

1.1. 自 well-known 端取 Agent Card：

```bash
curl -s https://agent.example.com/.well-known/agent.json -o agent-card.json
```

1.2. 驗頂層必之域：

```typescript
const requiredFields = ["name", "description", "url", "skills"];
for (const field of requiredFields) {
  assert(agentCard[field] !== undefined, `Missing required field: ${field}`);
}
```

1.3. 驗各技條：

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

1.4. 驗驗身之設：
   - 若 `authentication.schemes` 含 `oauth2`，驗 `credentials.oauth2` 有 `tokenUrl`
   - 若 `authentication.schemes` 含 `apiKey`，驗 `credentials.apiKey` 有 `headerName`

1.5. 驗能旗為布爾值。

1.6. 記驗果於合規報：

```typescript
interface ConformanceResult {
  test: string;
  category: "agent-card" | "lifecycle" | "streaming" | "error-handling" | "interop";
  status: "pass" | "fail" | "skip";
  message?: string;
  duration_ms?: number;
}
```

得：Agent Card 過諸構驗察。

敗則：記各驗敗附其域與因。勿止；續他試。無效之 Agent Card 自為一試果。

### 第二步：發試任務以覆諸生命態

2.1. **試：任務之投（submitted -> working -> completed）**

依代理所宣之技發其能治之任務：

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

2.2. **試：任務之輪詢（tasks/get）**

輪詢至任務達終態：

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

2.3. **試：任務之取消**

投任務而即取消：

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

2.4. **試：須輸入態（多輪）**

若某技支多輪交互，發歧之請以致 `input-required`，而獻續：

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

2.5. **試：態轉之史**

若 Agent Card 宣 `stateTransitionHistory: true`：

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

得：諸生命態之轉皆正。任務成完、淨取消、多輪交互於支時行。

敗則：記敗之具態轉，期態，實態。報含全 JSON-RPC 應為調。

### 第三步：驗 SSE 流之應

3.1. 若 Agent Card 宣 `streaming: false`，略此步。

3.2. 發 `tasks/sendSubscribe` 請而驗 SSE 流：

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

3.3. 析 SSE 事件而驗其構：

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

3.4. 驗事序：
   - 首事當為 `status` 事，態為 `submitted` 或 `working`
   - 中事可含 `status` 之新與 `artifact` 之獻
   - 末事當有 `final: true` 與終態
   - 末事後無事至

3.5. 驗 SSE 連之清：
   - 流中關連
   - 驗仍可由 `tasks/get` 取任務
   - 驗無服誤自此早斷

得：SSE 流獻正格之事於正序，終於末終事。

敗則：若宣 SSE 而端返非 SSE，記為合規敗。若事至序亂，記其序。若流不終，記超時。

### 第四步：試誤治與邊例

4.1. **試：未知之法**

```typescript
const unknownMethod = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 20,
  method: "tasks/nonexistent",
  params: {},
});
assert(unknownMethod.error?.code === -32601, "Should return method not found");
```

4.2. **試：壞 JSON-RPC 之請**

```typescript
const malformed = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"not": "valid jsonrpc"}',
});
const response = await malformed.json();
assert(response.error?.code === -32600, "Should return invalid request");
```

4.3. **試：取不存之任務**

```typescript
const notFound = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 22,
  method: "tasks/get",
  params: { id: "nonexistent-task-id" },
});
assert(notFound.error, "Should return error for nonexistent task");
```

4.4. **試：取消已完之任務**

```typescript
const cancelCompleted = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 23,
  method: "tasks/cancel",
  params: { id: completedTaskId },
});
assert(cancelCompleted.error, "Should error when canceling completed task");
```

4.5. **試：驗身之施**

若驗身已設，發無憑之請：

```typescript
const unauthResponse = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 24, method: "tasks/get", params: { id: "x" } }),
});
assert(unauthResponse.status === 401, "Should reject unauthenticated requests");
```

4.6. **試：Agent Card 公可取，無須驗**

```typescript
const publicCard = await fetch(`${agentUrl}/.well-known/agent.json`);
assert(publicCard.status === 200, "Agent Card should be publicly accessible");
```

得：諸誤之境返宜 JSON-RPC 誤碼，不潰服。

敗則：記每敗之誤治試。誤試中之服潰為要敗，部前必修。

### 第五步：生互操合規報

5.1. 合諸試果為構之報：

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

5.2. 算合規之階：
   - **full**：諸試皆過，含流與推通
   - **partial**：核生命試過，某可選敗
   - **minimal**：Agent Card 有效，基任務 send/get 行
   - **non-conformant**：Agent Card 無效或基生命斷

5.3. 生報於所請之格：
   - **json**：機讀為 CI/CD 合
   - **markdown**：人讀，過敗之表
   - **junit**：XML 格為試框合

5.4. 含修敗之薦：

```markdown
## Failed Tests

| Test | Category | Message | Recommendation |
|------|----------|---------|----------------|
| cancel-completed-task | error-handling | Server returned 500 | Add guard for terminal state transitions |
| sse-final-event | streaming | No final event received | Ensure SSE sends event with final:true |
```

5.5. 若請雙向試（二代理），驗：
   - 代理甲可發現代理乙之 Agent Card
   - 代理甲可發任務於乙
   - 代理乙可發任務於甲
   - 二代理治並發任務無互擾

得：完之合規報，含過敗果、合規階、可行薦。

敗則：若報生本身敗，出生試果於 stdout 為退。試資不當因報誤而失。

## 驗

- [ ] Agent Card 已取而構驗
- [ ] 至少一任務完全生命循（submitted -> working -> completed）
- [ ] 任務之取消正行
- [ ] 誤之應用正 JSON-RPC 誤碼
- [ ] 若能宣 SSE，已試流
- [ ] 任務端施驗身而 Agent Card 不施
- [ ] 合規報於所請之格已生
- [ ] 敗試含可行修導
- [ ] 試套可於 CI/CD 行而不須手介

## 陷

- **試於冷服**：某代理須時始。試前加健察或暖請。
- **硬編試資**：用動之任務與會 ID（UUIDs）以避反復行試之撞。勿假特任務 ID 可得。
- **忽時序**：任務之轉異步。常以退而輪詢，勿假即態變。
- **SSE 析之繁**：SSE 事或跨多塊。緩入資而析全事，非生塊。
- **唯試樂路**：誤治試與成試同要。壞請、無效轉、驗身敗皆當覆。
- **網依**：試當可於本機行為開發，於遠 URL 行為產。參數化代理 URL。
- **假技行**：試套驗協合規，非技正。用 Agent Card 之例語觸技，勿斷具出容。

## 參

- `design-a2a-agent-card` — 設所試之 Agent Card
- `implement-a2a-server` — 實所試之服
- `build-ci-cd-pipeline` — 合合規試於 CI/CD
- `troubleshoot-mcp-connection` — 適 A2A 連之調模
- `review-software-architecture` — 多代理系之構審
