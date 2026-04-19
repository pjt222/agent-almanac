---
name: circuit-breaker-pattern
locale: caveman-ultra
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

Graceful degradation when tools fail. Agent w/ 5 tools, 1 broken → don't fail whole → spot broken tool, stop calling, shrink scope to achievable, report honest what skipped. Codifies circuit breaker from distributed systems → agentic tool orchestration.

Core insight from kirapixelads' "Kitchen Fire Problem": expeditor (orch layer) must NOT cook. Separate *what* to attempt from *how* → orchestrator stays out of broken tool's retry loop.

## Use When

- Building agents w/ many tools, varying reliability
- Fault-tolerant workflows → partial > total failure
- Agent stuck in retry loop on broken tool, not moving forward
- Mid-task tool outage → graceful recovery
- Hardening existing agents vs. cascading failures
- Stale/cached tool out being treated as fresh

## In

- **Required**: Tool list (names + purposes)
- **Required**: Task to accomplish
- **Optional**: Known reliability issues / past fail patterns
- **Optional**: Fail threshold (default: 3 consecutive fails → open)
- **Optional**: Fail budget per cycle (default: 5 total fails → pause)
- **Optional**: Half-open probe interval (default: every 3rd attempt post-open)

## Do

### Step 1: Build Capability Map

Declare each tool's capability + alternatives. Map = foundation for scope reduction → w/o it, fail leaves agent guessing.

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

Each tool, doc:
1. Capability (one line)
2. Alternative tools (w/ degradation notes)
3. Manual fallback when no tool alternative

**→** Full map covers every tool agent uses. Each entry has fallback even if no tool alt. Map makes explicit what's implicit: critical tools (no alts) vs. substitutable.

**If err:** Tool list unclear → start w/ `allowed-tools` from skill frontmatter. Alts uncertain → mark `degradation: "unknown — test before relying on this route"` vs. omit.

### Step 2: Initialize Circuit Breaker State

State tracker per tool. All tools start CLOSED (healthy).

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

**State defs:**

- **CLOSED** — Tool healthy. Use normally. Track consecutive fails.
- **OPEN** — Tool known-broken. Don't call. Route to alts or shrink scope.
- **HALF-OPEN** — Tool was broken, maybe recovered. Single probe call. Success → CLOSED. Fail → OPEN.

**Transitions:**

- CLOSED → OPEN: Consecutive fails ≥ threshold (default: 3)
- OPEN → HALF-OPEN: After interval (e.g., every 3rd task step)
- HALF-OPEN → CLOSED: Probe success
- HALF-OPEN → OPEN: Probe fail

**→** State table init'd all tools CLOSED, zero fails. Threshold + budget declared.

**If err:** Can't enumerate tools upfront (dynamic discovery) → init state on first use. Pattern still works → build table incrementally.

### Step 3: Implement Call-and-Track Loop

Agent needs tool call → follow decision seq. This = expeditor logic → decides *whether* to call, not *how* to execute.

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

Expeditor NEVER retries failed call immediately. Record fail, check thresholds, move on. Retries via HALF-OPEN probe at later step only.

**→** Clear decision loop before + after every tool call. Tool health tracked continuous. Expeditor layer never blocks on failing tool.

**If err:** Tracking state across calls impractical (stateless exec) → degrade to simpler: count total fails, pause at budget. Three-state breaker = ideal; fail counter = min viable.

### Step 4: Route to Alternatives on Open Circuit

Tool OPEN → consult capability map (Step 1), route to best alt.

**Routing priority:**

1. **Tool alt, low degradation** — Similar capability tool. Note degradation in out.
2. **Tool alt, high degradation** — Big capability loss. Label what's missing.
3. **Manual fallback** — Report what agent can't do, what user needs to provide.
4. **Scope reduction** — No alt + no fallback → drop dependent sub-task (Step 5).

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

**→** Tool circuit opens → agent transparently routes to alt or degrades scope. Decision + degradation documented in out → user knows what's affected.

**If err:** Map incomplete (no alts listed) → default scope reduction + report. NEVER silently skip → always doc what + why.

### Step 5: Reduce Scope to Achievable Work

Tools OPEN + alts exhausted → shrink task to what working tools can do. Not failure → honest scope mgmt.

**Scope reduction proc:**

1. List remaining sub-tasks
2. Each sub-task → check tools required
3. All required tools CLOSED or viable alts → keep
4. Any required tool OPEN no alt → mark DEFERRED
5. Continue w/ reduced scope
6. Report deferred at end

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

Do NOT attempt deferred. Do NOT retry open-circuited tools hoping they work. Breaker exists to prevent this → trust its state.

**→** Clear partition of task → achievable + deferred. Agent finishes achievable, reports deferred w/ reason + unblock path.

**If err:** Scope reduction removes all sub-tasks (all tools broken) → skip to Step 6 pause-and-report. Agent w/ no working tools must not fake progress.

### Step 6: Handle Staleness + Label Data Quality

Tool returns maybe-stale data (cached, old snapshot, prev fetched) → label explicit, not treat as fresh.

**Staleness indicators:**

- Tool out matches prev call exactly (cache hit?)
- Data timestamps older than current task
- Tool doc mentions caching
- Results contradict other recent observations

**Labeling proc:**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

NEVER silently present stale as current. User / downstream agent must know data quality.

**→** All maybe-stale outs labeled. Fresh not labeled (labels = uncertainty, not confirmation).

**If err:** Can't determine staleness (no timestamps, no baseline) → note: "[FRESHNESS UNKNOWN — no baseline for comparison]". Uncertainty = info.

### Step 7: Enforce Failure Budget

Track total fails across all tools. Budget exhausted → pause + report vs. keep accumulating errs.

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

Pause-and-report = breaker in electrical systems → prevents damage accumulating. Agent that keeps calling broken tools wastes ctx, confuses user w/ repeat errs, inconsistent partial results.

**→** Agent stops clean on budget exhaust. Report covers done work, incomplete work, tool health, actionable next steps.

**If err:** Can't generate clean report (state tracking lost) → out whatever avail. Partial report > silent continuation.

### Step 8: Separation of Concerns — Expeditor vs. Executor

Valid. orchestration logic (Steps 2-7) cleanly separated from tool exec.

**Expeditor (orch) does:**
- Track tool health state
- Decide call, skip, probe
- Route to alts on open
- Enforce fail budget
- Generate status reports

**Expeditor does NOT:**
- Retry failed calls immediately
- Modify call params to work around errs
- Catch + suppress tool errs
- Assume why tool failed
- Exec fallback logic that itself needs tools

Expeditor "cooking" (calling tools to work around other fails) → separation broken. Expeditor routes to alt or shrinks scope, NOT fixes broken tool.

**→** Clean boundary orch decisions vs. tool exec. Expeditor described w/o ref to specific tool APIs or err types.

**If err:** Orch + exec entangled → refactor → extract decision logic to separate step before each tool call. Decision step outs: CALL, SKIP, PROBE, PAUSE. Exec step acts on out.

### Step 9: Detect Cascading Failures

Many tools share infra (network, fs, perms) → single root cause trips many breakers at once. Detect correlated pattern vs. treat each breaker indep.

**Cascade indicators:**

- 3+ tools OPEN in same task step / narrow window
- Fails share common err signature (e.g., "connection refused," "permission denied")
- Tools w/ indep fail history suddenly fail together

**Response proc:**

1. Second breaker opens → check if fail category matches first
2. Correlated → flag **systemic failure** → pause all tool calls, not just broken
3. Report suspected root: "Multiple tools failing with [shared pattern] — likely [network/filesystem/permissions] issue"
4. Don't probe half-open during systemic fail → probes also fail, waste budget
5. Resume probing only after user confirms infra fixed

**Backoff compounding:** Cascade trips → exponential backoff for half-open probes: probe step 3, then 6, then 12. Cap max interval 20 steps → prevent permanent circuit lock. Stops rapid-fire probes overwhelming recovering system.

**→** Correlated fails detected + treated as single systemic event, not N indep trips. Fail budget counts systemic event once, not N times.

**If err:** Correlation detection impractical (diff err sigs, shared cause) → fallback indep per-tool breakers. System still degrades → just consumes budget faster.

### Step 10: Pre-Call Tool Selection Layer

Before circuit breaker loop (Step 3) → optionally valid. tool available + likely succeed. Cuts unnecessary trips from predictable fails.

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

Pre-call = advisory, not authoritative. Tool passing pre-call can still fail during exec. Breaker = primary reliability mechanism.

**→** Predictable fails (missing tools, unreachable servers) caught before budget consumed. Breaker handles only genuine runtime fails.

**If err:** Pre-call checks unavail or too much overhead → skip entirely. Step 3 breaker loop handles all fails → pre-call = opt, not req.

## Check

- [ ] Map covers all tools w/ alts + fallbacks documented
- [ ] Breaker state table init'd all tools
- [ ] Transitions follow CLOSED → OPEN → HALF-OPEN → CLOSED
- [ ] Fail threshold declared explicit (not implicit)
- [ ] Alt routing tried before scope reduction
- [ ] Scope reduction doc'd w/ deferred + reasons
- [ ] Stale data labeled explicit — never fresh
- [ ] Fail budget enforced w/ pause-and-report on exhaust
- [ ] Expeditor logic does NOT exec tool calls or retry fails
- [ ] Status report: done work, incomplete work, tool health
- [ ] No silent fails → every skip, deferral, degradation doc'd
- [ ] Cascade fails detected when 3+ tools open together
- [ ] Systemic fail pauses all probes until infra confirmed recovered
- [ ] Pre-call checks (if used) don't consume budget on predictable fails

## Traps

- **Retry vs. circuit-break**: Calling broken tool repeat wastes budget + ctx. 3 consecutive fails = pattern, not bad luck. OPEN it.
- **Cooking in expeditor**: Orch decides *what*, not *how* to fix broken. Expeditor crafting workaround cmds for Bash fails → crossed the boundary.
- **Silent scope reduction**: Dropping sub-tasks w/o doc → looks complete, isn't. Always report skipped.
- **Treat stale as fresh**: Cached/prev results maybe not current. Label uncertainty, don't ignore.
- **Open circuits too eagerly**: Single transient fail shouldn't open. Threshold (default: 3) filters noise from signal.
- **Never probe post-open**: Permanently open → agent never finds recovery. Half-open probes essential.
- **Ignore fail budget**: W/o budget → agent accumulates dozens of fails across tools while "progressing" on paper. Budget forces honest checkpoint.
- **Cascade backoff multiply**: Many tools in dep chain each apply own exp backoff → compound delay grows multiplicatively. Cap total aggregate backoff across chain, not just per tool.
- **Stale discovery scores**: Step 10 caches tool avail. No invalidation when conditions change → agent skips recovered tool or attempts unavail. Re-check scores after systemic fail event.

## →

- `fail-early-pattern` — complementary: fail-early validates in before work; circuit-breaker manages fails during work
- `escalate-issues` — budget exhausted / scope reduction significant → escalate to specialist or human
- `write-incident-runbook` — doc recurring fail patterns as runbooks
- `assess-context` — eval if current approach can adapt when many tools degraded; pairs w/ scope reduction
- `du-dum` — two-clock arch sep'ng observe from decide; complement for cutting observe cost in agent loops
