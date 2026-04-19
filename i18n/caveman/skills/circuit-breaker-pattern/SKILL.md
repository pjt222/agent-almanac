---
name: circuit-breaker-pattern
locale: caveman
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

Graceful degradation when tools fail. Agent calls five tools, one broken → should not fail entirely. Recognize broken tool, stop calling it, reduce scope to what remains achievable, report honestly about skipped work. This skill codifies that logic using circuit breaker pattern from distributed systems, adapted to agentic tool orchestration.

Core insight from kirapixelads' "Kitchen Fire Problem": expeditor (orchestration layer) must not cook. Separation between deciding *what* to attempt and *how* to attempt it prevents orchestrator from getting trapped in failing tool's retry loop.

## When Use

- Building agents depending on multiple tools with varying reliability
- Designing fault-tolerant agentic workflows where partial results beat total failure
- Agent stuck in retry loop on broken tool instead of continuing with working tools
- Recovering gracefully from tool outages mid-task
- Hardening existing agents against cascading tool failures
- Stale or cached tool output treated as fresh data

## Inputs

- **Required**: List of tools agent depends on (names + purposes)
- **Required**: Task agent trying to accomplish
- **Optional**: Known tool reliability issues, past failure patterns
- **Optional**: Failure threshold (default: 3 consecutive failures before opening circuit)
- **Optional**: Failure budget per cycle (default: 5 total failures before pause-and-report)
- **Optional**: Half-open probe interval (default: every 3rd attempt after opening)

## Steps

### Step 1: Build the Capability Map

Declare what each tool provides. What alternatives exist. Map = foundation for scope reduction. Without it, tool failure leaves agent guessing what to do next.

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

Each tool, document:
1. Capability provided (one line)
2. Alternative tools that partially cover it (with degradation notes)
3. Manual fallback when no tool alternative exists

**Got:** Complete capability map covering every tool agent uses. Each entry has at least fallback, even if no tool alternative. Map makes explicit what usually implicit: which tools critical (no alternatives), which substitutable.

**If fail:** Tool list unclear? Start with `allowed-tools` from skill frontmatter. Alternatives uncertain? Mark `degradation: "unknown — test before relying on this route"` rather than omitting.

### Step 2: Initialize Circuit Breaker State

State tracker for each tool. Every tool starts CLOSED (healthy, normal operation).

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

- **CLOSED** — Tool healthy. Use normally. Track consecutive failures.
- **OPEN** — Tool known-broken. Do not call. Route to alternatives or degrade scope.
- **HALF-OPEN** — Tool was broken, may have recovered. Send single probe call. Success → CLOSED. Fail → OPEN.

**State transitions:**

- CLOSED -> OPEN: Consecutive failures reach threshold (default: 3)
- OPEN -> HALF-OPEN: After configurable interval (e.g., every 3rd task step)
- HALF-OPEN -> CLOSED: Successful probe call
- HALF-OPEN -> OPEN: Failed probe call

**Got:** State table initialized for all tools with CLOSED state and zero failure counts. Failure threshold and budget explicitly declared.

**If fail:** Tool list cannot be enumerated upfront (dynamic discovery)? Initialize state on first use. Pattern still applies — build table incrementally.

### Step 3: Implement the Call-and-Track Loop

Agent needs tool call → follow decision sequence. Expeditor logic: decides *whether* to attempt, not *how* to execute.

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

Expeditor never retries failed call immediately. Records failure, checks thresholds, moves on. Retries only through HALF-OPEN probe at later step.

**Got:** Clear decision loop agent follows before and after every tool call. Tool health tracked continuously. Expeditor layer never blocks on failing tool.

**If fail:** Tracking state across calls impractical (stateless execution)? Degrade to simpler model — count total failures, pause at budget. Three-state circuit breaker ideal; failure counter minimum viable.

### Step 4: Route to Alternatives on Open Circuit

Tool circuit OPEN → consult capability map (Step 1). Route to best available alternative.

**Routing priority:**

1. **Tool alternative with low degradation** — Another tool providing similar capability. Note degradation in task output.
2. **Tool alternative with high degradation** — Another tool with significant capability loss. Explicitly label what missing from result.
3. **Manual fallback** — Report what agent cannot do. Report what info or action user needs to provide.
4. **Scope reduction** — No alternative, no fallback viable → remove dependent sub-task from scope entirely (Step 5).

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

**Got:** Tool circuit opens → agent transparently routes to alternative or degrades scope. Routing decision + any degradation documented in task output. User knows what was affected.

**If fail:** Capability map incomplete (no alternatives listed)? Default to scope reduction + report. Never silently skip work. Always document what skipped and why.

### Step 5: Reduce Scope to Achievable Work

Tools open-circuited, alternatives exhausted → reduce task to what can still be done with working tools. Not failure. Honest scope management.

**Scope reduction protocol:**

1. List remaining sub-tasks
2. Each sub-task, check required tools
3. All required tools CLOSED or have viable alternatives → keep sub-task
4. Any required tool OPEN with no alternative → mark sub-task DEFERRED
5. Continue with reduced scope
6. Report deferred sub-tasks at end

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

Do not attempt deferred sub-tasks. Do not retry open-circuited tools hoping they'll work. Circuit breaker exists precisely to prevent this. Trust its state.

**Got:** Clear partition of task into achievable and deferred work. Agent completes all achievable work. Reports deferred items with reason and what would unblock them.

**If fail:** Scope reduction removes all sub-tasks (every tool broken)? Skip to Step 6 — pause and report. Agent with no working tools should not pretend to make progress.

### Step 6: Handle Staleness and Label Data Quality

Tool returns data that may be stale (cached results, outdated snapshots, previously fetched content) → label explicitly rather than treating as fresh.

**Staleness indicators:**

- Tool output matches previous call exactly (possible cache hit)
- Data references timestamps older than current task
- Tool docs mention caching behavior
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

Never silently present stale data as current. User or downstream agent must know data quality to make sound decisions.

**Got:** All tool outputs that may be stale carry explicit labels. Fresh data not labeled (labeling reserved for uncertainty, not confirmation).

**If fail:** Staleness cannot be determined (no timestamps, no baseline)? Note uncertainty: "[FRESHNESS UNKNOWN — no baseline for comparison]". Uncertainty about freshness is itself information.

### Step 7: Enforce the Failure Budget

Track total failures across all tools. Budget exhausted → agent pauses and reports rather than continuing to accumulate errors.

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

Pause-and-report serves same function as circuit breaker in electrical systems: prevents damage from accumulating. Agent calling broken tools wastes context window, confuses user with repeated errors, may produce inconsistent partial results.

**Got:** Agent stops cleanly when failure budget exhausted. Report includes completed work, incomplete work, tool health, actionable next steps.

**If fail:** Agent cannot generate clean report (state tracking lost)? Output whatever info available. Partial report beats silent continuation.

### Step 8: Separation of Concerns — Expeditor vs. Executor

Verify orchestration logic (Steps 2-7) cleanly separated from tool execution.

**The expeditor (orchestration) does:**
- Track tool health state
- Decide whether to call tool, skip it, or probe it
- Route to alternatives when tool open-circuited
- Enforce failure budget
- Generate status reports

**The expeditor does NOT:**
- Retry failed tool calls immediately
- Modify tool call parameters to work around errors
- Catch and suppress tool errors
- Make assumptions about why tool failed
- Execute fallback logic that itself requires tools

Expeditor "cooking" (making tool calls to work around other tool failures) → separation broken. Expeditor should route to alternative tool or reduce scope. Not try to fix broken tool.

**Got:** Clean boundary between orchestration decisions and tool execution. Expeditor layer can be described without referencing specific tool APIs or error types.

**If fail:** Orchestration and execution entangled? Refactor. Extract decision logic into separate step running before each tool call. Decision step produces one of four outputs: CALL, SKIP, PROBE, PAUSE. Execution step acts on output.

### Step 9: Detect Cascading Failures

Multiple tools share infrastructure (network, filesystem, permissions) → single root cause can trip several breakers simultaneously. Detect and handle correlated pattern rather than treating each breaker independently.

**Cascading failure indicators:**

- 3+ tools transition to OPEN within same task step or narrow window
- Failures share common error signature ("connection refused," "permission denied")
- Tools with previously independent failure histories suddenly fail together

**Response protocol:**

1. Second breaker opens → check if failure category matches first
2. Correlated → flag as **systemic failure**. Pause all tool calls, not just broken ones.
3. Report suspected root cause: "Multiple tools failing with [shared pattern] — likely [network/filesystem/permissions] issue"
4. Do not probe half-open tools during systemic failure. Probes will also fail, waste budget.
5. Resume probing only after user confirms infrastructure issue resolved

**Backoff compounding:** Cascading failures trigger → exponential backoff for half-open probes. Probe at step 3, then step 6, then step 12. Cap max interval at 20 steps to prevent permanent circuit lock. Prevents rapid-fire probes overwhelming recovering system.

**Got:** Correlated failures detected and treated as single systemic event rather than N independent breaker trips. Failure budget counts systemic event once, not N times.

**If fail:** Correlation detection impractical (failures have different error signatures despite shared cause)? Fall back to independent per-tool breakers. System still degrades gracefully — just consumes budget faster.

### Step 10: Pre-Call Tool Selection Layer

Before engaging circuit breaker loop (Step 3) → optionally verify tool available and likely to succeed. Reduces unnecessary breaker trips from predictable failures.

**Pre-call checks:**

| Check | Method | Action on failure |
|-------|--------|-------------------|
| Tool exists | Verify tool in allowed-tools list | Skip — do not even attempt |
| MCP server health | Check server process/connection status | Route to alternative immediately |
| Resource availability | Verify target file/URL/endpoint exists | Route or degrade scope |

**Decision table:**

```
Pre-call score:
  AVAILABLE  → proceed to circuit breaker loop (Step 3)
  DEGRADED   → proceed with caution, lower the failure threshold by 1
  UNAVAILABLE → skip tool, route to alternative (Step 4) without consuming budget
```

Pre-call checks advisory, not authoritative. Tool that passes pre-call can still fail during execution. Circuit breaker remains primary reliability mechanism.

**Got:** Predictable failures (missing tools, unreachable servers) caught before consuming failure budget. Circuit breaker handles only genuine runtime failures.

**If fail:** Pre-call checks unavailable or add too much overhead? Skip step entirely. Circuit breaker loop in Step 3 handles all failures. Pre-call selection is optimization, not requirement.

## Checks

- [ ] Capability map covers all tools with alternatives and fallbacks documented
- [ ] Circuit breaker state table initialized for all tools
- [ ] State transitions follow CLOSED -> OPEN -> HALF-OPEN -> CLOSED cycle
- [ ] Failure threshold explicitly declared (not implicit)
- [ ] Alternative routing attempted before scope reduction
- [ ] Scope reduction documented with deferred sub-tasks and reasons
- [ ] Stale data labeled explicitly — never presented as fresh
- [ ] Failure budget enforced with pause-and-report on exhaustion
- [ ] Expeditor logic does not execute tool calls or retry failed calls
- [ ] Status report includes completed work, incomplete work, tool health
- [ ] No silent failures — every skip, deferral, degradation documented
- [ ] Cascading failures detected when 3+ tools open simultaneously
- [ ] Systemic failure mode pauses all probes until infrastructure confirmed recovered
- [ ] Pre-call checks (if used) do not consume failure budget on predictable failures

## Pitfalls

- **Retrying instead of circuit-breaking**: Calling broken tool repeatedly wastes failure budget and context window. Three consecutive failures = pattern, not bad luck. Open circuit.
- **Cooking in expeditor**: Orchestration layer decides *what* to attempt, not *how* to fix broken tools. Expeditor crafting workaround commands for Bash failures → crossed separation boundary.
- **Silent scope reduction**: Dropping sub-tasks without documenting produces results that look complete but are not. Always report what skipped.
- **Treating stale data as fresh**: Cached or previously fetched results may not reflect current state. Label uncertainty rather than ignoring.
- **Opening circuits too eagerly**: Single transient failure should not open circuit. Use threshold (default: 3) to filter noise from signal.
- **Never probing after opening**: Permanently open circuit → agent never discovers tool recovered. Half-open probes essential for recovery.
- **Ignoring failure budget**: Without budget, agent accumulates dozens of failures across tools while "making progress" on paper. Budget forces honest checkpoint.
- **Cascading backoff multiplication**: Multiple tools in dependency chain each applying own exponential backoff → compound delay grows multiplicatively. Cap total aggregate backoff across chain, not just per tool.
- **Stale discovery scores**: Pre-call selection (Step 10) caches tool availability assessments. Cache not invalidated when conditions change → agent skips recovered tool or attempts unavailable one. Re-check scores after any systemic failure event.

## See Also

- `fail-early-pattern` — complementary pattern: fail-early validates inputs before work begins; circuit-breaker manages failures during work
- `escalate-issues` — failure budget exhausted or scope reduction significant → escalate to specialist or human
- `write-incident-runbook` — document recurring tool failure patterns as runbooks for faster diagnosis
- `assess-context` — evaluate whether current approach can adapt when multiple tools degraded; pairs with scope reduction decisions
- `du-dum` — two-clock architecture separating observation from decision; complementary pattern for reducing observation cost in agent loops
