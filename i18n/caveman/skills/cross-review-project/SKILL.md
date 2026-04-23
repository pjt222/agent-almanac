---
name: cross-review-project
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Conduct a structured cross-project code review between two Claude Code
  instances via the cross-review-mcp broker. Each agent reads its own
  codebase, reviews the peer's code, and engages in evidence-backed
  dialogue — with QSG scaling laws enforcing review quality through
  minimum bandwidth constraints and phase-gated progression.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
---

# Cross-Review Project

Two Claude Code instances review each other's projects through structured artifact exchange via `cross-review-mcp` broker. Broker enforces Quantized Simplex Gossip (QSG) scaling laws — review bundles must have at least 5 findings to stay in selection regime (Γ_h ≈ 1.67). Stops shallow consensus from passing as agreement.

## When Use

- Two projects share architectural concerns, could learn from each other
- Want independent code review going beyond what single reviewer sees
- Cross-pollination is goal: finding patterns in one project missing in other
- Need structured, evidence-backed review with accept/reject/discuss verdicts

## Inputs

- **Required**: Two project paths accessible to two Claude Code instances
- **Required**: `cross-review-mcp` broker running and configured as MCP server in both instances
- **Optional**: Focus areas — specific directories, patterns, or concerns to prioritize
- **Optional**: Agent IDs — identifiers for each instance (default: project directory name)

## Steps

### Step 1: Verify Prerequisites

Confirm broker running. Both instances can reach it.

1. Check broker configured as MCP server:
   ```bash
   claude mcp list | grep cross-review
   ```
2. Call `get_status` to verify broker responsive. No stale agents registered.
3. Read protocol resource at `cross-review://protocol` — markdown document describing review dimensions and QSG constraints

**Got:** Broker responds to `get_status` with empty agent list. Protocol resource readable as markdown.

**If fail:** Broker not configured? Add it: `claude mcp add cross-review-mcp -- npx cross-review-mcp`. Stale agents from prior session? Call `deregister` for each before proceeding.

### Step 2: Register

Register this agent with broker.

1. Call `register` with:
   - `agentId`: short, unique identifier (e.g., project directory name)
   - `project`: project name
   - `capabilities`: `["review", "suggest"]`
2. Verify registration by calling `get_status` — your agent should show with phase `"registered"`
3. Wait for peer agent to register: call `wait_for_phase` with peer's agent ID and phase `"registered"`

**Got:** Both agents registered with broker. `get_status` shows 2 agents at phase `"registered"`.

**If fail:** `register` fails with "already registered"? Agent ID taken from prior session. Call `deregister` first, then re-register.

### Step 3: Briefing Phase

Read own codebase. Send structured briefing to peer.

1. Read systematically:
   - Entry points (main files, index, CLI commands)
   - Dependency graph (package.json, DESCRIPTION, go.mod)
   - Architectural patterns (directory structure, module boundaries)
   - Known issues (TODO comments, open issues, tech debt)
   - Test coverage (test directories, CI configuration)
2. Compose `Briefing` artifact — structured summary peer can use to navigate your codebase
3. Call `send_task` with:
   - `from`: your agent ID
   - `to`: peer agent ID
   - `type`: `"briefing"`
   - `payload`: JSON-encoded briefing
4. Call `signal_phase` with phase `"briefing"`

**Got:** Briefing sent and phase signaled. Broker enforces you must send briefing before advancing to review.

**If fail:** `send_task` rejects briefing? Check `from` field matches your registered agent ID. Self-sends rejected.

### Step 4: Review Phase

Wait for peer's briefing. Review their code. Send findings.

1. Call `wait_for_phase` with peer's ID and phase `"briefing"`
2. Call `poll_tasks` to retrieve peer's briefing
3. Call `ack_tasks` with received task IDs — required (peek-then-ack pattern)
4. Read peer's actual source code, informed by their briefing
5. Produce findings across 6 categories:
   - `pattern_transfer` — pattern in your project peer could adopt
   - `missing_practice` — practice peer lacks (testing, validation, error handling)
   - `inconsistency` — internal contradiction within peer's codebase
   - `simplification` — unnecessary complexity that could be reduced
   - `bug_risk` — potential runtime failure or edge case
   - `documentation_gap` — missing or misleading documentation
6. Each finding must include:
   - `id`: unique identifier (e.g., `"F-001"`)
   - `category`: one of 6 categories above
   - `targetFile`: path in peer's project
   - `description`: what you found
   - `evidence`: why this is valid finding (code references, patterns)
   - `sourceAnalog` (recommended): equivalent in your own project showing pattern — single mechanism for genuine cross-pollination
7. Bundle at least **5 findings** (QSG constraint: m ≥ 5 keeps Γ_h ≈ 1.67 in selection regime)
8. Call `send_task` with type `"review_bundle"` and JSON-encoded findings array
9. Call `signal_phase` with phase `"review"`

**Got:** Review bundle accepted by broker. Fewer than 5 findings rejected.

**If fail:** Bundle rejected for insufficient findings? Review more deeply. Constraint exists to stop shallow reviews from dominating. Cannot find 5 issues? Reconsider whether cross-review is right tool for this project pair.

### Step 5: Dialogue Phase

Receive findings about own project. Respond with evidence-backed verdicts.

1. Call `wait_for_phase` with peer's ID and phase `"review"`
2. Call `poll_tasks` to retrieve findings about your project
3. Call `ack_tasks` with received task IDs
4. For each finding, produce `FindingResponse`:
   - `findingId`: matches finding's ID
   - `verdict`: `"accept"` (valid, will act on it), `"reject"` (invalid, with counter-evidence), or `"discuss"` (needs clarification)
   - `evidence`: why you accept or reject — must be non-empty
   - `counterEvidence` (optional): specific code references that contradict finding
5. Send all responses via `send_task` with type `"response"`
6. Call `signal_phase` with phase `"dialogue"`

Note: `"discuss"` verdict not gated by protocol — treat as flag for manual follow-up, not automated sub-exchange.

**Got:** All findings responded to with verdicts. Empty responses rejected by broker.

**If fail:** Cannot form opinion on finding? Default to `"discuss"` with evidence explaining what extra context you need.

### Step 6: Synthesis Phase

Produce synthesis artifact summarizing accepted findings and planned actions.

1. Call `wait_for_phase` with peer's ID and phase `"dialogue"`
2. Poll any remaining tasks and ack them
3. Compile `Synthesis` artifact:
   - Accepted findings with planned actions (what you will change and why)
   - Rejected findings with reasons (preserves reasoning for future review)
4. Call `send_task` with type `"synthesis"` and JSON-encoded synthesis
5. Call `signal_phase` with phase `"synthesis"`
6. Optionally create GitHub issues for accepted findings
7. Call `signal_phase` with phase `"complete"`
8. Call `deregister` to clean up

**Got:** Both agents reach `"complete"`. Broker requires at least 2 registered agents to advance to complete.

**If fail:** Peer already deregistered? Can still complete locally. Compile synthesis from findings received.

## Checks

- [ ] Both agents registered and reached `"complete"` phase
- [ ] Briefings exchanged before reviews began (phase enforcement)
- [ ] Review bundles had at least 5 findings each
- [ ] All findings received verdict (accept/reject/discuss) with evidence
- [ ] `ack_tasks` called after every `poll_tasks`
- [ ] Synthesis produced with accepted findings mapped to actions
- [ ] Agents deregistered after completion

## Pitfalls

- **Fewer than 5 findings**: Broker rejects bundles with m < 5. Not arbitrary — with N=2 agents and 6 categories, m < 5 puts Γ_h at or below critical boundary where consensus indistinguishable from noise. Review more deeply. 5 findings genuinely cannot be found? Projects may not benefit from cross-review.
- **Forgetting `ack_tasks`**: Broker uses peek-then-ack delivery. Tasks stay in queue until acknowledged. Forgetting to ack → duplicate processing on next poll.
- **Forgetting the `from` parameter**: `send_task` requires explicit `from` field matching your agent ID. Self-sends rejected.
- **Same-model epistemic correlation**: Two Claude instances share training biases. Temporal ordering ensures they don't read each other's output during review, but priors correlated. For genuine epistemic independence, use different model families across instances.
- **Skipping `sourceAnalog`**: `sourceAnalog` field optional but single mechanism for genuine cross-pollination — shows *your* implementation of pattern you're recommending. Always populate it when source analog exists.
- **Treating `discuss` as blocking**: Nothing in protocol gates `complete` on pending discussions being resolved. Treat `discuss` verdicts as flags for manual follow-up after session.
- **Not reviewing telemetry**: Broker logs all events to JSONL. After session, review log to validate QSG assumptions — estimate α empirically (`α ≈ 1 - reject_rate`) and check per-category accept rates.

## See Also

- `scaffold-mcp-server` — for building or extending broker itself
- `implement-a2a-server` — A2A protocol patterns broker draws from
- `review-codebase` — single-agent review (this skill extends it to cross-agent structured exchange)
- `build-consensus` — swarm consensus patterns (QSG is theoretical foundation)
- `configure-mcp-server` — configuring broker as MCP server in Claude Code
- `unleash-the-agents` — can analyze broker itself (battle-tested: 40 agents, 10 hypothesis families)
