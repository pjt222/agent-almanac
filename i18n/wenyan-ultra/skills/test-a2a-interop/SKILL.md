---
name: test-a2a-interop
locale: wenyan-ultra
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

# 測 A2A 互操

驗 A2A 行合規——測 Agent Card 發現、任生命管、SSE 流、誤理、多代通模。

## 用

- 驗新 A2A 服行於部署前→用
- 驗二 A2A 代或之互操→用
- A2A 服 CI/CD 行合規測→用
- 調多代 A2A 流敗→用
- 證代合 A2A 協需於登記→用

## 入

- **必**：測代基 URL
- **必**：認憑（若需）
- **可**：次代 URL 為雙向互操測
- **可**：所測技（默：Agent Card 諸技）
- **可**：每任測超時（默：60 秒）
- **可**：合規報出式（`json`、`markdown`、`junit`）

## 行

### 一：取驗 Agent Card

1.1 自周知端取 Agent Card：

```bash
curl -s https://agent.example.com/.well-known/agent.json -o agent-card.json
```

1.2 驗需頂域：

```typescript
const requiredFields = ["name", "description", "url", "skills"];
for (const field of requiredFields) {
  assert(agentCard[field] !== undefined, `Missing required field: ${field}`);
}
```

1.3 驗各技項：

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

1.4 驗認設：
   - `authentication.schemes` 含 `oauth2`→驗 `credentials.oauth2` 有 `tokenUrl`
   - 含 `apiKey`→驗 `credentials.apiKey` 有 `headerName`

1.5 驗能旗為布。

1.6 記驗果於合規報：

```typescript
interface ConformanceResult {
  test: string;
  category: "agent-card" | "lifecycle" | "streaming" | "error-handling" | "interop";
  status: "pass" | "fail" | "skip";
  message?: string;
  duration_ms?: number;
}
```

得：Agent Card 過諸構驗。

敗：各驗敗記具域因。勿止；續測他。無效 Agent Card 自為測果。

### 二：送測任覆諸生命態

2.1 **測：任送（submitted -> working -> completed）**

送代當能理之任依其陳技：

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

2.2 **測：任輪詢（tasks/get）**

輪至任達末態：

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

2.3 **測：任取消**

送任而即取消：

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

2.4 **測：input-required 態（多輪）**

某技支多輪→送歧請當觸 `input-required`、後予補：

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

2.5 **測：態轉史**

Agent Card 陳 `stateTransitionHistory: true`：

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

得：諸生命態轉皆正行。任成、清取消、多輪交於支時行。

敗：記具敗轉、期態、實態。含全 JSON-RPC 應於報為調。

### 三：驗 SSE 流應

3.1 Agent Card 陳 `streaming: false`→略此步。

3.2 送 `tasks/sendSubscribe` 而驗 SSE 流：

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

3.3 析 SSE 事而驗構：

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

3.4 驗事序：
   - 首事當為 `status` 含 `submitted` 或 `working`
   - 中事或含 `status` 更與 `artifact` 交
   - 末事當有 `final: true` 含末態
   - 末事後不當有事至

3.5 驗 SSE 接清行：
   - 流中斷接
   - 驗任仍可由 `tasks/get` 取
   - 驗無服誤自早斷

得：SSE 流正交事序、止於末事。

敗：陳 SSE 而端返非 SSE→記合規敗。事失序→記序。流不止→記超時。

### 四：測誤理與邊例

4.1 **測：未知法**

```typescript
const unknownMethod = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 20,
  method: "tasks/nonexistent",
  params: {},
});
assert(unknownMethod.error?.code === -32601, "Should return method not found");
```

4.2 **測：誤 JSON-RPC 請**

```typescript
const malformed = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"not": "valid jsonrpc"}',
});
const response = await malformed.json();
assert(response.error?.code === -32600, "Should return invalid request");
```

4.3 **測：取不存任**

```typescript
const notFound = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 22,
  method: "tasks/get",
  params: { id: "nonexistent-task-id" },
});
assert(notFound.error, "Should return error for nonexistent task");
```

4.4 **測：取消已成任**

```typescript
const cancelCompleted = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 23,
  method: "tasks/cancel",
  params: { id: completedTaskId },
});
assert(cancelCompleted.error, "Should error when canceling completed task");
```

4.5 **測：認施**

認設→送無憑請：

```typescript
const unauthResponse = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 24, method: "tasks/get", params: { id: "x" } }),
});
assert(unauthResponse.status === 401, "Should reject unauthenticated requests");
```

4.6 **測：Agent Card 公訪無認**

```typescript
const publicCard = await fetch(`${agentUrl}/.well-known/agent.json`);
assert(publicCard.status === 200, "Agent Card should be publicly accessible");
```

得：諸誤況返宜 JSON-RPC 誤碼而不崩服。

敗：記各敗誤理測。誤測中服崩為要敗、必先修乃部。

### 五：生互操合規報

5.1 合諸測果為構報：

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

5.2 算合規級：
   - **full**：諸測過、含流與推通
   - **partial**：核生命過、某選功敗
   - **minimal**：Agent Card 效而基送/取行
   - **non-conformant**：Agent Card 無效或基生命斷

5.3 以所請式生報：
   - **json**：機讀為 CI/CD 整
   - **markdown**：人讀含過敗表
   - **junit**：XML 為測框整

5.4 含修敗薦：

```markdown
## Failed Tests

| Test | Category | Message | Recommendation |
|------|----------|---------|----------------|
| cancel-completed-task | error-handling | Server returned 500 | Add guard for terminal state transitions |
| sse-final-event | streaming | No final event received | Ensure SSE sends event with final:true |
```

5.5 雙向測請（兩代）→驗：
   - 代甲可發代乙之 Agent Card
   - 代甲可送任於代乙
   - 代乙可送任於代甲
   - 兩代理並任無擾

得：全合規報含過敗果、合規級、可施薦。

敗：報生自敗→出原測果至 stdout 為退。測資永不當因報誤失。

## 驗

- [ ] Agent Card 取而構驗
- [ ] 至少一任成全生命（submitted -> working -> completed）
- [ ] 任取消正行
- [ ] 誤應用正 JSON-RPC 誤碼
- [ ] 若陳能→測 SSE 流
- [ ] 認施於任端而非 Agent Card
- [ ] 合規報以所請式生
- [ ] 敗測含可施救導
- [ ] 測組可於 CI/CD 行而無人入

## 忌

- **測冷服**：某代需時初。前測加健察或熱請
- **硬測資**：用動任與會 ID（UUID）以避撞於復行。勿設某 ID 可用
- **忽時**：任轉異步。常輪以退避而勿設即態變
- **SSE 析繁**：SSE 事或跨多塊。緩入而析全事、非原塊
- **唯測順路**：誤理測如成測重。誤請、無效轉、認敗皆當覆
- **網依**：測當可行於本機為開、遠 URL 為產。參代 URL
- **設技為**：測組驗協合規、非技正。用 Agent Card 例詞觸技、勿斷具出容

## 參

- `design-a2a-agent-card` - 設所測之 Agent Card
- `implement-a2a-server` - 行所測服
- `build-ci-cd-pipeline` - 整合規測於 CI/CD
- `troubleshoot-mcp-connection` - 調模適 A2A 連
- `review-software-architecture` - 多代系構覆
