---
name: circuit-breaker-pattern
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Implement circuit breaker logic for agentic tool calls — tracking tool health,
  transitioning between closed/open/half-open states, reducing task scope when
  tools fail, routing to alternatives via capability maps, and enforcing failure
  budgets to prevent error accumulation. Separates orchestration (deciding what
  to attempt) from execution (calling tools), following the expeditor pattern.
  Use when building agents that depend on multiple tools with varying reliability,
  designing fault-tolerant agentic workflows, recovering gracefully from tool
  outages mid-task, or hardening existing agents against cascading tool failures.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: resilience, circuit-breaker, error-handling, graceful-degradation, tool-reliability, fault-tolerance
---

# Circuit Breaker Pattern

Graceful degradation when tools fail. An agent that calls five tools and one is broken should not fail entirely — it should recognize the broken tool, stop calling it, reduce scope to what remains achievable, and report honestly about what was skipped. This skill codifies that logic using the circuit breaker pattern from distributed systems, adapted to agentic tool orchestration.

The core insight, from kirapixelads' "Kitchen Fire Problem": the expeditor (orchestration layer) must not cook. Separation of concerns between deciding *what* to attempt and *how* to attempt it prevents the orchestrator from getting trapped in a failing tool's retry loop.

## When to Use

- Building agents that depend on multiple tools with varying reliability
- Designing fault-tolerant agentic workflows where partial results are better than total failure
- An agent is stuck in a retry loop on a broken tool instead of continuing with working tools
- Recovering gracefully from tool outages mid-task
- Hardening existing agents against cascading tool failures
- Stale or cached tool output is being treated as fresh data

## Inputs

- **Required**: List of tools the agent depends on (names and purposes)
- **Required**: The task the agent is trying to accomplish
- **Optional**: Known tool reliability issues or past failure patterns
- **Optional**: Failure threshold (default: 3 consecutive failures before opening circuit)
- **Optional**: Failure budget per cycle (default: 5 total failures before pause-and-report)
- **Optional**: Half-open probe interval (default: every 3rd attempt after opening)

## Procedure

### Step 1: Build the Capability Map

Declare what each tool provides and what alternatives exist. This map is the foundation for scope reduction — without it, a tool failure leaves the agent guessing about what to do next.

```yaml
capability_map:
  - tool: Grep
    provides: content search across files
    alternatives:
      - tool: Bash
        method: "rg or grep command"
        degradation: "loses Grep's built-in output formatting"
      - tool: Read
        method: "read suspected files directly"
        degradation: "requires knowing which files to check; no broad search"
    fallback: "ask the user which files to examine"

  - tool: Bash
    provides: command execution, build tools, git operations
    alternatives: []
    fallback: "report commands that need to be run manually"

  - tool: Read
    provides: file content inspection
    alternatives:
      - tool: Bash
        method: "cat or head command"
        degradation: "loses line numbering and truncation safety"
    fallback: "ask the user to paste file contents"

  - tool: Write
    provides: file creation
    alternatives:
      - tool: Edit
        method: "create via full-file edit"
        degradation: "requires file to already exist for Edit"
      - tool: Bash
        method: "echo/cat heredoc"
        degradation: "loses Write's atomic file creation"
    fallback: "output file contents for the user to save manually"

  - tool: WebSearch
    provides: external information retrieval
    alternatives: []
    fallback: "state what information is needed; ask user to provide it"
```

For each tool, document:
1. What capability it provides (one line)
2. What alternative tools can partially cover it (with degradation notes)
3. What the manual fallback is when no tool alternative exists

**Expected:** A complete capability map covering every tool the agent uses. Each entry has at least a fallback, even if no tool alternative exists. The map makes explicit what is usually implicit: which tools are critical (no alternatives) and which are substitutable.

**On failure:** If the tool list is unclear, start with the `allowed-tools` from the skill's frontmatter. If alternatives are uncertain, mark them as `degradation: "unknown — test before relying on this route"` rather than omitting them.

### Step 2: Initialize Circuit Breaker State

Set up the state tracker for each tool. Every tool starts in CLOSED state (healthy, normal operation).

```
Circuit Breaker State Table:
+------------+--------+-------------------+------------------+-----------------+
| Tool       | State  | Consecutive Fails | Last Failure     | Last Success    |
+------------+--------+-------------------+------------------+-----------------+
| Grep       | CLOSED | 0                 | —                | —               |
| Bash       | CLOSED | 0                 | —                | —               |
| Read       | CLOSED | 0                 | —                | —               |
| Write      | CLOSED | 0                 | —                | —               |
| Edit       | CLOSED | 0                 | —                | —               |
| WebSearch  | CLOSED | 0                 | —                | —               |
+------------+--------+-------------------+------------------+-----------------+

Failure budget: 0 / 5 consumed
```

**State definitions:**

- **CLOSED** — Tool is healthy. Use normally. Track consecutive failures.
- **OPEN** — Tool is known-broken. Do not call it. Route to alternatives or degrade scope.
- **HALF-OPEN** — Tool was broken but may have recovered. Send a single probe call. If it succeeds, transition to CLOSED. If it fails, return to OPEN.

**State transitions:**

- CLOSED -> OPEN: When consecutive failures reach the threshold (default: 3)
- OPEN -> HALF-OPEN: After a configurable interval (e.g., every 3rd task step)
- HALF-OPEN -> CLOSED: On successful probe call
- HALF-OPEN -> OPEN: On failed probe call

**Expected:** A state table initialized for all tools with CLOSED state and zero failure counts. The failure threshold and budget are explicitly declared.

**On failure:** If the tool list cannot be enumerated upfront (dynamic tool discovery), initialize state on first use of each tool. The pattern still applies — you just build the table incrementally.

### Step 3: Implement the Call-and-Track Loop

When the agent needs to call a tool, follow this decision sequence. This is the expeditor logic — it decides *whether* to attempt the call, not *how* to execute it.

```
BEFORE each tool call:
  1. Check tool state in the circuit breaker table
  2. If OPEN:
     a. Check if it is time for a half-open probe
        - Yes → transition to HALF-OPEN, proceed with probe call
        - No  → skip this tool, route to alternative (Step 4)
  3. If HALF-OPEN:
     a. Make one probe call
     b. Success → transition to CLOSED, reset consecutive fails to 0
     c. Failure → transition to OPEN, increment failure budget
  4. If CLOSED:
     a. Make the call normally

AFTER each tool call:
  1. Success:
     - Reset consecutive fails to 0
     - Record last success timestamp
  2. Failure:
     - Increment consecutive fails
     - Record last failure timestamp and error message
     - Increment failure budget consumed
     - If consecutive fails >= threshold:
         transition to OPEN
         log: "Circuit OPENED for [tool]: [failure count] consecutive failures"
     - If failure budget exhausted:
         PAUSE — do not continue the task
         Report to user (Step 6)
```

The expeditor never retries a failed call immediately. It records the failure, checks thresholds, and moves on. Retries happen only through the HALF-OPEN probe mechanism at a later step.

**Expected:** A clear decision loop that the agent follows before and after every tool call. Tool health is tracked continuously. The expeditor layer never blocks on a failing tool.

**On failure:** If tracking state across calls is impractical (e.g., stateless execution), degrade to a simpler model: count total failures and pause at budget. The three-state circuit breaker is ideal; a failure counter is the minimum viable pattern.

### Step 4: Route to Alternatives on Open Circuit

When a tool's circuit is OPEN, consult the capability map (Step 1) and route to the best available alternative.

**Routing priority:**

1. **Tool alternative with low degradation** — Use another tool that provides similar capability. Note the degradation in the task output.
2. **Tool alternative with high degradation** — Use another tool with significant capability loss. Explicitly label what is missing from the result.
3. **Manual fallback** — Report what the agent cannot do and what information or action the user would need to provide.
4. **Scope reduction** — If no alternative exists and no fallback is viable, remove the dependent sub-task from scope entirely (Step 5).

```
Example routing decision:

Tool needed: Grep (circuit OPEN)
Task: find all files containing "API_KEY"

Route 1: Bash with rg command
  → Degradation: loses Grep's built-in formatting
  → Decision: ACCEPTABLE — use this route

If Bash also OPEN:
Route 2: Read suspected config files directly
  → Degradation: requires guessing which files; no broad search
  → Decision: PARTIAL — try known config paths only

If Read also OPEN:
Route 3: Ask user
  → "I need to find files containing 'API_KEY' but my search
     tools are unavailable. Can you run: grep -r 'API_KEY' ."
  → Decision: FALLBACK — user provides the information

If user unavailable:
Route 4: Scope reduction
  → Remove "find API key references" from task scope
  → Document: "SKIPPED: API key search — no tools available"
```

**Expected:** When a tool circuit opens, the agent transparently routes to an alternative or degrades scope. The routing decision and any degradation are documented in the task output so the user knows what was affected.

**On failure:** If the capability map is incomplete (no alternatives listed), default to scope reduction and report. Never silently skip work — always document what was skipped and why.

### Step 5: Reduce Scope to Achievable Work

When tools are open-circuited and alternatives are exhausted, reduce the task to what can still be accomplished with working tools. This is not failure — it is honest scope management.

**Scope reduction protocol:**

1. List remaining sub-tasks
2. For each sub-task, check which tools it requires
3. If all required tools are CLOSED or have viable alternatives: keep the sub-task
4. If any required tool is OPEN with no alternative: mark the sub-task as DEFERRED
5. Continue with the reduced scope
6. Report deferred sub-tasks at the end

```
Scope Reduction Report:

Original scope: 5 sub-tasks
  [x] 1. Read configuration files          (Read: CLOSED)
  [x] 2. Search for deprecated patterns    (Grep: CLOSED)
  [ ] 3. Run test suite                    (Bash: OPEN — no alternative)
  [x] 4. Update documentation             (Edit: CLOSED)
  [ ] 5. Deploy to staging                 (Bash: OPEN — no alternative)

Reduced scope: 3 sub-tasks achievable
Deferred: 2 sub-tasks require Bash (circuit OPEN)

Recommendation: Complete sub-tasks 1, 2, 4 now.
Sub-tasks 3 and 5 require Bash — will probe on next cycle
or user can run commands manually.
```

Do not attempt deferred sub-tasks. Do not retry open-circuited tools hoping they will work. The circuit breaker exists precisely to prevent this — trust its state.

**Expected:** A clear partition of the task into achievable and deferred work. The agent completes all achievable work and reports deferred items with the reason and what would unblock them.

**On failure:** If scope reduction removes all sub-tasks (every tool is broken), skip directly to Step 6 — pause and report. An agent with no working tools should not pretend to make progress.

### Step 6: Handle Staleness and Label Data Quality

When a tool returns data that may be stale (cached results, outdated snapshots, previously fetched content), label it explicitly rather than treating it as fresh.

**Staleness indicators:**

- Tool output matches a previous call exactly (possible cache hit)
- Data references timestamps older than the current task
- Tool documentation mentions caching behavior
- Results contradict other recent observations

**Labeling protocol:**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

Never silently present stale data as current. The user or downstream agent must know the data quality to make sound decisions.

**Expected:** All tool outputs that may be stale carry explicit labels. Fresh data is not labeled (labeling is reserved for uncertainty, not confirmation).

**On failure:** If staleness cannot be determined (no timestamps, no comparison baseline), note the uncertainty: "[FRESHNESS UNKNOWN — no baseline for comparison]". Uncertainty about freshness is itself information.

### Step 7: Enforce the Failure Budget

Track total failures across all tools. When the budget is exhausted, the agent pauses and reports rather than continuing to accumulate errors.

```
Failure Budget Enforcement:

Budget: 5 failures per cycle
Current: 4 / 5 consumed

  Failure 1: Bash — "permission denied" (step 3)
  Failure 2: Bash — "command not found" (step 3)
  Failure 3: Bash — "timeout after 120s" (step 4)
  Failure 4: WebSearch — "connection refused" (step 5)

Status: 1 failure remaining before mandatory pause

→ Next tool call proceeds with heightened caution
→ If it fails: PAUSE and generate status report
```

**On budget exhaustion:**

```
FAILURE BUDGET EXHAUSTED — PAUSING

Completed work:
  - Sub-task 1: Read configuration files (SUCCESS)
  - Sub-task 2: Search for deprecated patterns (SUCCESS)

Incomplete work:
  - Sub-task 3: Run test suite (FAILED — Bash circuit OPEN)
  - Sub-task 4: Update documentation (NOT ATTEMPTED — paused)
  - Sub-task 5: Deploy to staging (NOT ATTEMPTED — paused)

Tool health:
  Grep: CLOSED (healthy)
  Read: CLOSED (healthy)
  Edit: CLOSED (healthy)
  Bash: OPEN (3 consecutive failures — permission/command/timeout)
  WebSearch: OPEN (1 failure — connection refused)

Failures: 5 / 5 budget consumed

Recommendation:
  1. Investigate Bash failures — likely environment issue
  2. Check network connectivity for WebSearch
  3. Resume from sub-task 4 after resolution
```

The pause-and-report serves the same function as a circuit breaker in electrical systems: it prevents damage from accumulating. An agent that keeps calling broken tools wastes context window, confuses the user with repeated errors, and may produce inconsistent partial results.

**Expected:** The agent stops cleanly when the failure budget is exhausted. The report includes completed work, incomplete work, tool health, and actionable next steps.

**On failure:** If the agent cannot generate a clean report (e.g., state tracking was lost), output whatever information is available. A partial report is better than silent continuation.

### Step 8: Separation of Concerns — Expeditor vs. Executor

Verify that the orchestration logic (Steps 2-7) is cleanly separated from tool execution.

**The expeditor (orchestration) does:**
- Track tool health state
- Decide whether to call a tool, skip it, or probe it
- Route to alternatives when a tool is open-circuited
- Enforce the failure budget
- Generate status reports

**The expeditor does NOT:**
- Retry failed tool calls immediately
- Modify tool call parameters to work around errors
- Catch and suppress tool errors
- Make assumptions about why a tool failed
- Execute fallback logic that itself requires tools

If the expeditor is "cooking" (making tool calls to work around other tool failures), the separation is broken. The expeditor should route to an alternative tool or reduce scope — not try to fix the broken tool.

**Expected:** A clean boundary between orchestration decisions and tool execution. The expeditor layer can be described without referencing specific tool APIs or error types.

**On failure:** If orchestration and execution are entangled, refactor by extracting the decision logic into a separate step that runs before each tool call. The decision step produces one of four outputs: CALL, SKIP, PROBE, or PAUSE. The execution step acts on that output.

### Step 9: Detect Cascading Failures

When multiple tools share infrastructure (network, filesystem, permissions), a single root cause can trip several breakers simultaneously. Detect and handle this correlated pattern rather than treating each breaker independently.

**Cascading failure indicators:**

- 3+ tools transition to OPEN within the same task step or a narrow window
- Failures share a common error signature (e.g., "connection refused," "permission denied")
- Tools that previously had independent failure histories suddenly fail together

**Response protocol:**

1. When a second breaker opens, check whether the failure category matches the first
2. If correlated: flag as **systemic failure** — pause all tool calls, not just the broken ones
3. Report the suspected root cause: "Multiple tools failing with [shared pattern] — likely [network/filesystem/permissions] issue"
4. Do not probe half-open tools during a systemic failure — probes will also fail and waste budget
5. Resume probing only after the user confirms the infrastructure issue is resolved

**Backoff compounding:** When cascading failures trigger, use exponential backoff for half-open probes: probe at step 3, then step 6, then step 12. Cap the maximum interval at 20 steps to prevent permanent circuit lock. This prevents rapid-fire probes from overwhelming a recovering system.

**Expected:** Correlated failures are detected and treated as a single systemic event rather than N independent breaker trips. The failure budget counts the systemic event once, not N times.

**On failure:** If correlation detection is impractical (failures have different error signatures despite a shared cause), fall back to independent per-tool breakers. The system still degrades gracefully — it just consumes budget faster.

### Step 10: Pre-Call Tool Selection Layer

Before engaging the circuit breaker loop (Step 3), optionally verify that a tool is available and likely to succeed. This reduces unnecessary breaker trips from predictable failures.

**Pre-call checks:**

| Check | Method | Action on failure |
|-------|--------|-------------------|
| Tool exists | Verify tool is in the allowed-tools list | Skip — do not even attempt |
| MCP server health | Check server process/connection status | Route to alternative immediately |
| Resource availability | Verify target file/URL/endpoint exists | Route or degrade scope |

**Decision table:**

```
Pre-call score:
  AVAILABLE  → proceed to circuit breaker loop (Step 3)
  DEGRADED   → proceed with caution, lower the failure threshold by 1
  UNAVAILABLE → skip tool, route to alternative (Step 4) without consuming budget
```

Pre-call checks are advisory, not authoritative. A tool that passes pre-call checks can still fail during execution. The circuit breaker remains the primary reliability mechanism.

**Expected:** Predictable failures (missing tools, unreachable servers) are caught before they consume the failure budget. The circuit breaker handles only genuine runtime failures.

**On failure:** If pre-call checks are unavailable or add too much overhead, skip this step entirely. The circuit breaker loop in Step 3 handles all failures — pre-call selection is an optimization, not a requirement.

## Validation

- [ ] Capability map covers all tools with alternatives and fallbacks documented
- [ ] Circuit breaker state table is initialized for all tools
- [ ] State transitions follow CLOSED -> OPEN -> HALF-OPEN -> CLOSED cycle
- [ ] Failure threshold is explicitly declared (not implicit)
- [ ] Alternative routing is attempted before scope reduction
- [ ] Scope reduction is documented with deferred sub-tasks and reasons
- [ ] Stale data is labeled explicitly — never presented as fresh
- [ ] Failure budget is enforced with pause-and-report on exhaustion
- [ ] Expeditor logic does not execute tool calls or retry failed calls
- [ ] Status report includes completed work, incomplete work, and tool health
- [ ] No silent failures — every skip, deferral, and degradation is documented
- [ ] Cascading failures are detected when 3+ tools open simultaneously
- [ ] Systemic failure mode pauses all probes until infrastructure is confirmed recovered
- [ ] Pre-call checks (if used) do not consume the failure budget on predictable failures

## Common Pitfalls

- **Retrying instead of circuit-breaking**: Calling a broken tool repeatedly wastes the failure budget and context window. Three consecutive failures is a pattern, not bad luck. Open the circuit.
- **Cooking in the expeditor**: The orchestration layer should decide *what* to attempt, not *how* to fix broken tools. If the expeditor is crafting workaround commands for Bash failures, it has crossed the separation boundary.
- **Silent scope reduction**: Dropping sub-tasks without documenting them produces results that look complete but are not. Always report what was skipped.
- **Treating stale data as fresh**: Cached or previously fetched results may not reflect current state. Label uncertainty rather than ignoring it.
- **Opening circuits too eagerly**: A single transient failure should not open the circuit. Use a threshold (default: 3) to filter noise from signal.
- **Never probing after opening**: A permanently open circuit means the agent never discovers that a tool has recovered. Half-open probes are essential for recovery.
- **Ignoring the failure budget**: Without a budget, an agent can accumulate dozens of failures across different tools while still "making progress" on paper. The budget forces an honest checkpoint.
- **Cascading backoff multiplication**: When multiple tools in a dependency chain each apply their own exponential backoff, the compound delay grows multiplicatively. Cap total aggregate backoff across the chain, not just per tool.
- **Stale discovery scores**: Pre-call selection (Step 10) caches tool availability assessments. If the cache is not invalidated when conditions change, the agent may skip a recovered tool or attempt an unavailable one. Re-check scores after any systemic failure event.

## Related Skills

- `fail-early-pattern` — complementary pattern: fail-early validates inputs before work begins; circuit-breaker manages failures during work
- `escalate-issues` — when the failure budget is exhausted or scope reduction is significant, escalate to a specialist or human
- `write-incident-runbook` — document recurring tool failure patterns as runbooks for faster diagnosis
- `assess-context` — evaluate whether the current approach can adapt when multiple tools are degraded; pairs with scope reduction decisions
- `du-dum` — two-clock architecture separating observation from decision; complementary pattern for reducing observation cost in agent loops
