---
name: test-a2a-interop
locale: wenyan-lite
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

# 測試 A2A 互通性

驗證 A2A 代理實作符合協定規範：測試 Agent Card 探索、任務生命週期管理、SSE 串流、錯誤處理與多代理通訊模式。

## 適用時機

- 部署前驗證新 A2A 伺服器實作
- 驗證二或多 A2A 代理間之互通性
- 將符合性測試作為 A2A 服務 CI/CD 之一部分執行
- 除錯多代理 A2A 工作流之失敗
- 為登記處認證代理符合 A2A 協定需求

## 輸入

- **必要**：受測 A2A 代理之基底 URL
- **必要**：認證憑據（若代理需）
- **選擇性**：第二代理 URL 以行雙向互通測試
- **選擇性**：欲測之具體技能（預設：Agent Card 中所有技能）
- **選擇性**：每任務之測試逾時（預設：60 秒）
- **選擇性**：符合性報告之輸出格式（`json`、`markdown`、`junit`）

## 步驟

### 步驟一：取得並驗證 Agent Cards

1.1. 自 well-known 端點取 Agent Card：

```bash
curl -s https://agent.example.com/.well-known/agent.json -o agent-card.json
```

1.2. 驗必要頂層欄位：

```typescript
const requiredFields = ["name", "description", "url", "skills"];
for (const field of requiredFields) {
  assert(agentCard[field] !== undefined, `Missing required field: ${field}`);
}
```

1.3. 驗每技能條目：

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

1.4. 驗認證配置：
   - 若 `authentication.schemes` 含 `oauth2`，驗 `credentials.oauth2` 含 `tokenUrl`
   - 若 `authentication.schemes` 含 `apiKey`，驗 `credentials.apiKey` 含 `headerName`

1.5. 驗能力旗標為布林值。

1.6. 將驗證結果記入符合性報告：

```typescript
interface ConformanceResult {
  test: string;
  category: "agent-card" | "lifecycle" | "streaming" | "error-handling" | "interop";
  status: "pass" | "fail" | "skip";
  message?: string;
  duration_ms?: number;
}
```

**預期：** Agent Card 通過所有結構驗證檢查。

**失敗時：** 將每驗證失敗連同具體欄位與因記之。勿中止；續測其他面向。無效之 Agent Card 自身即測試結果。

### 步驟二：發涵蓋所有生命週期狀態之測試任務

2.1. **測：任務提交（submitted -> working -> completed）**

依代理所聲技能發其應可處理之任務：

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

2.2. **測：任務輪詢（tasks/get）**

輪詢直至任務達終止狀態：

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

2.3. **測：任務取消**

提交任務並立即取消之：

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

2.4. **測：input-required 狀態（多回合）**

若任何技能支援多回合互動，發應觸發 `input-required` 之含混請求，再提後續：

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

2.5. **測：狀態轉換歷史**

若 Agent Card 聲明 `stateTransitionHistory: true`：

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

**預期：** 所有生命週期狀態轉換正確運作。任務成功完成、乾淨取消，多回合互動於支援時運作。

**失敗時：** 記具體失敗之狀態轉換、預期狀態與實際狀態。將完整 JSON-RPC 回應納入報告以供除錯。

### 步驟三：驗證 SSE 串流回應

3.1. 若 Agent Card 聲明 `streaming: false`，跳過此步驟。

3.2. 發 `tasks/sendSubscribe` 請求並驗 SSE 串流：

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

3.3. 解析 SSE 事件並驗結構：

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

3.4. 驗事件序列：
   - 首事件應為狀態 `submitted` 或 `working` 之 `status` 事件
   - 中間事件可含 `status` 更新與 `artifact` 遞送
   - 末事件應含 `final: true` 與終止狀態
   - 末事件之後不應有事件抵

3.5. 驗 SSE 連線清理運作：
   - 串流中關閉連線
   - 驗任務仍可經 `tasks/get` 取
   - 驗無因過早斷線之伺服器錯

**預期：** SSE 串流以正確序列遞送格式正確之事件，以最終終止事件結。

**失敗時：** 若聲明 SSE 而端點回非 SSE 回應，記為符合性失敗。若事件失序抵，記其序。若串流永不終，記逾時。

### 步驟四：測試錯誤處理與邊界情況

4.1. **測：未知方法**

```typescript
const unknownMethod = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 20,
  method: "tasks/nonexistent",
  params: {},
});
assert(unknownMethod.error?.code === -32601, "Should return method not found");
```

4.2. **測：畸形 JSON-RPC 請求**

```typescript
const malformed = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"not": "valid jsonrpc"}',
});
const response = await malformed.json();
assert(response.error?.code === -32600, "Should return invalid request");
```

4.3. **測：取不存在之任務**

```typescript
const notFound = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 22,
  method: "tasks/get",
  params: { id: "nonexistent-task-id" },
});
assert(notFound.error, "Should return error for nonexistent task");
```

4.4. **測：取消已完成任務**

```typescript
const cancelCompleted = await sendJsonRpc(agentUrl, {
  jsonrpc: "2.0",
  id: 23,
  method: "tasks/cancel",
  params: { id: completedTaskId },
});
assert(cancelCompleted.error, "Should error when canceling completed task");
```

4.5. **測：認證強制**

若已配置認證，發無憑據之請求：

```typescript
const unauthResponse = await fetch(agentUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 24, method: "tasks/get", params: { id: "x" } }),
});
assert(unauthResponse.status === 401, "Should reject unauthenticated requests");
```

4.6. **測：Agent Card 無需認證即公開可存取**

```typescript
const publicCard = await fetch(`${agentUrl}/.well-known/agent.json`);
assert(publicCard.status === 200, "Agent Card should be publicly accessible");
```

**預期：** 所有錯誤情況回適當之 JSON-RPC 錯誤碼而不致伺服器崩潰。

**失敗時：** 記每失敗之錯誤處理測試。錯誤測試期間之伺服器崩潰為部署前必修之關鍵失敗。

### 步驟五：產生互通符合性報告

5.1. 將所有測試結果聚為結構化報告：

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

5.2. 計算符合層級：
   - **full**：所有測試通過，含串流與推播通知
   - **partial**：核心生命週期測試通過，部分選擇性功能失敗
   - **minimal**：Agent Card 有效且基本任務 send/get 運作
   - **non-conformant**：Agent Card 無效或基本生命週期損

5.3. 以所請格式產生報告：
   - **json**：機器可讀以供 CI/CD 整合
   - **markdown**：含通過／失敗表之人讀
   - **junit**：XML 格式以供測試框架整合

5.4. 含修復失敗之建議：

```markdown
## Failed Tests

| Test | Category | Message | Recommendation |
|------|----------|---------|----------------|
| cancel-completed-task | error-handling | Server returned 500 | Add guard for terminal state transitions |
| sse-final-event | streaming | No final event received | Ensure SSE sends event with final:true |
```

5.5. 若請求雙向測試（兩代理），驗：
   - 代理 A 可探索代理 B 之 Agent Card
   - 代理 A 可發任務予代理 B
   - 代理 B 可發任務予代理 A
   - 兩代理皆無干擾地處理並行任務

**預期：** 完整之符合性報告，含通過／失敗結果、符合層級與可行建議。

**失敗時：** 若報告生成本身失敗，將原始測試結果輸出至 stdout 為退路。測試資料絕不應因報告錯而失。

## 驗證

- [ ] Agent Card 已取且結構驗證
- [ ] 至少一任務完整完成生命週期（submitted -> working -> completed）
- [ ] 任務取消正確運作
- [ ] 錯誤回應使用正確 JSON-RPC 錯誤碼
- [ ] 若於能力中聲明，已測試 SSE 串流
- [ ] 認證於任務端點上強制但於 Agent Card 上不強制
- [ ] 符合性報告以所請格式產生
- [ ] 失敗測試含可行修復指引
- [ ] 測試套件可於 CI/CD 中無人介入執行

## 常見陷阱

- **對冷伺服器測**：某些代理需時間初始化。執測前加健檢或暖機請求。
- **硬編碼測試資料**：用動態任務與會話 ID（UUID）以避免重複執行時碰撞。勿假設特定任務 ID 可用。
- **忽略時序**：任務轉換為非同步。永遠以退避輪詢，而非斷言即時狀態變化。
- **SSE 解析複雜**：SSE 事件可能跨多塊。緩衝接收資料並解析完整事件，非原始塊。
- **僅測快樂路徑**：錯誤處理測試與成功測試同等重要。畸形請求、無效轉換與認證失敗皆須涵蓋。
- **網路依賴**：測試應可對 localhost 執（開發）與遠端 URL 執（生產）。將代理 URL 參數化。
- **假設技能行為**：測試套件驗協定符合性，非技能正確性。用 Agent Card 之範例片語觸發技能，但勿斷言特定輸出內容。

## 相關技能

- `design-a2a-agent-card` — 設計受測之 Agent Card
- `implement-a2a-server` — 實作受測之伺服器
- `build-ci-cd-pipeline` — 將符合性測試整合入 CI/CD
- `troubleshoot-mcp-connection` — 適用於 A2A 連線之除錯模式
- `review-software-architecture` — 多代理系統之架構審查
