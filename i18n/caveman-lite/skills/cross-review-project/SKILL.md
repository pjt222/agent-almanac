---
name: cross-review-project
locale: caveman-lite
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

Two Claude Code instances review each other's projects through structured artifact exchange via the `cross-review-mcp` broker. The broker enforces Quantized Simplex Gossip (QSG) scaling laws — review bundles must contain at least 5 findings to stay in the selection regime (Γ_h ≈ 1.67), preventing shallow consensus from passing as agreement.

## When to Use

- Two projects share architectural concerns and could learn from each other
- You want independent code review that goes beyond what a single reviewer sees
- Cross-pollination is the goal: finding patterns in one project that are missing in the other
- You need structured, evidence-backed review with accept/reject/discuss verdicts

## Inputs

- **Required**: Two project paths accessible to two Claude Code instances
- **Required**: `cross-review-mcp` broker running and configured as an MCP server in both instances
- **Optional**: Focus areas — specific directories, patterns, or concerns to prioritize
- **Optional**: Agent IDs — identifiers for each instance (default: project directory name)

## Procedure

### Step 1: Verify Prerequisites

Confirm the broker is running and both instances can reach it.

1. Check the broker is configured as an MCP server:
   ```bash
   claude mcp list | grep cross-review
   ```
2. Call `get_status` to verify the broker is responsive and no stale agents are registered
3. Read the protocol resource at `cross-review://protocol` — this is a markdown document describing the review dimensions and QSG constraints

**Got:** The broker responds to `get_status` with an empty agent list. The protocol resource is readable as markdown.

**If fail:** If the broker is not configured, add it: `claude mcp add cross-review-mcp -- npx cross-review-mcp`. If stale agents exist from a previous session, call `deregister` for each before proceeding.

### Step 2: Register

Register this agent with the broker.

1. Call `register` with:
   - `agentId`: a short, unique identifier (e.g., project directory name)
   - `project`: the project name
   - `capabilities`: `["review", "suggest"]`
2. Verify registration by calling `get_status` — your agent should appear with phase `"registered"`
3. Wait for the peer agent to register: call `wait_for_phase` with the peer's agent ID and phase `"registered"`

**Got:** Both agents registered with the broker. `get_status` shows 2 agents at phase `"registered"`.

**If fail:** If `register` fails with "already registered", the agent ID is taken from a previous session. Call `deregister` first, then re-register.

### Step 3: Briefing Phase

Read your own codebase and send a structured briefing to the peer.

1. Read systematically:
   - Entry points (main files, index, CLI commands)
   - Dependency graph (package.json, DESCRIPTION, go.mod)
   - Architectural patterns (directory structure, module boundaries)
   - Known issues (TODO comments, open issues, tech debt)
   - Test coverage (test directories, CI configuration)
2. Compose a `Briefing` artifact — a structured summary the peer can use to navigate your codebase efficiently
3. Call `send_task` with:
   - `from`: your agent ID
   - `to`: peer agent ID
   - `type`: `"briefing"`
   - `payload`: JSON-encoded briefing
4. Call `signal_phase` with phase `"briefing"`

**Got:** Briefing sent and phase signaled. The broker enforces that you must send a briefing before advancing to review.

**If fail:** If `send_task` rejects the briefing, check that the `from` field matches your registered agent ID. Self-sends are rejected.

### Step 4: Review Phase

Wait for the peer's briefing, then review their code and send findings.

1. Call `wait_for_phase` with the peer's ID and phase `"briefing"`
2. Call `poll_tasks` to retrieve the peer's briefing
3. Call `ack_tasks` with the received task IDs — this is required (peek-then-ack pattern)
4. Read the peer's actual source code, informed by their briefing
5. Produce findings across 6 categories:
   - `pattern_transfer` — a pattern in your project that the peer could adopt
   - `missing_practice` — a practice the peer lacks (testing, validation, error handling)
   - `inconsistency` — internal contradiction within the peer's codebase
   - `simplification` — unnecessary complexity that could be reduced
   - `bug_risk` — potential runtime failure or edge case
   - `documentation_gap` — missing or misleading documentation
6. Each finding must include:
   - `id`: unique identifier (e.g., `"F-001"`)
   - `category`: one of the 6 categories above
   - `targetFile`: path in the peer's project
   - `description`: what you found
   - `evidence`: why this is a valid finding (code references, patterns)
   - `sourceAnalog` (recommended): the equivalent in your own project that demonstrates the pattern — this is the single mechanism for genuine cross-pollination
7. Bundle at least **5 findings** (QSG constraint: m ≥ 5 keeps Γ_h ≈ 1.67 in selection regime)
8. Call `send_task` with type `"review_bundle"` and the JSON-encoded findings array
9. Call `signal_phase` with phase `"review"`

**Got:** Review bundle accepted by the broker. Fewer than 5 findings will be rejected.

**If fail:** If the bundle is rejected for insufficient findings, review more deeply. The constraint exists to prevent shallow reviews from dominating. If you genuinely cannot find 5 issues, reconsider whether cross-review is the right tool for this project pair.

### Step 5: Dialogue Phase

Receive findings about your own project and respond with evidence-backed verdicts.

1. Call `wait_for_phase` with the peer's ID and phase `"review"`
2. Call `poll_tasks` to retrieve findings about your project
3. Call `ack_tasks` with the received task IDs
4. For each finding, produce a `FindingResponse`:
   - `findingId`: matches the finding's ID
   - `verdict`: `"accept"` (valid, will act on it), `"reject"` (invalid, with counter-evidence), or `"discuss"` (needs clarification)
   - `evidence`: why you accept or reject — must be non-empty
   - `counterEvidence` (optional): specific code references that contradict the finding
5. Send all responses via `send_task` with type `"response"`
6. Call `signal_phase` with phase `"dialogue"`

Note: the `"discuss"` verdict is not gated by the protocol — treat it as a flag for manual follow-up, not an automated sub-exchange.

**Got:** All findings responded to with verdicts. Empty responses are rejected by the broker.

**If fail:** If you cannot form an opinion on a finding, default to `"discuss"` with evidence explaining what additional context you need.

### Step 6: Synthesis Phase

Produce a synthesis artifact summarizing accepted findings and planned actions.

1. Call `wait_for_phase` with the peer's ID and phase `"dialogue"`
2. Poll any remaining tasks and acknowledge them
3. Compile a `Synthesis` artifact:
   - Accepted findings with planned actions (what you will change and why)
   - Rejected findings with reasons (preserves the reasoning for future review)
4. Call `send_task` with type `"synthesis"` and the JSON-encoded synthesis
5. Call `signal_phase` with phase `"synthesis"`
6. Optionally create GitHub issues for accepted findings
7. Call `signal_phase` with phase `"complete"`
8. Call `deregister` to clean up

**Got:** Both agents reach `"complete"`. The broker requires at least 2 registered agents to advance to complete.

**If fail:** If the peer has already deregistered, you can still complete locally. Compile your synthesis from the findings you received.

## Validation

- [ ] Both agents registered and reached `"complete"` phase
- [ ] Briefings exchanged before reviews began (phase enforcement)
- [ ] Review bundles contained at least 5 findings each
- [ ] All findings received a verdict (accept/reject/discuss) with evidence
- [ ] `ack_tasks` called after every `poll_tasks`
- [ ] Synthesis produced with accepted findings mapped to actions
- [ ] Agents deregistered after completion

## Pitfalls

- **Fewer than 5 findings**: The broker rejects bundles with m < 5. This is not arbitrary — with N=2 agents and 6 categories, m < 5 puts Γ_h at or below the critical boundary where consensus is indistinguishable from noise. Review more deeply; if 5 findings genuinely cannot be found, the projects may not benefit from cross-review.
- **Forgetting `ack_tasks`**: The broker uses peek-then-ack delivery. Tasks remain in queue until acknowledged. Forgetting to ack causes duplicate processing on the next poll.
- **Forgetting the `from` parameter**: `send_task` requires an explicit `from` field matching your agent ID. Self-sends are rejected.
- **Same-model epistemic correlation**: Two Claude instances share training biases. Temporal ordering ensures they don't read each other's output during review, but their priors are correlated. For genuine epistemic independence, use different model families across instances.
- **Skipping `sourceAnalog`**: The `sourceAnalog` field is optional but is the single mechanism for genuine cross-pollination — it shows *your* implementation of the pattern you're recommending. Always populate it when a source analog exists.
- **Treating `discuss` as blocking**: Nothing in the protocol gates `complete` on pending discussions being resolved. Treat `discuss` verdicts as flags for manual follow-up after the session.
- **Not reviewing telemetry**: The broker logs all events to JSONL. After a session, review the log to validate QSG assumptions — estimate α empirically (`α ≈ 1 - reject_rate`) and check per-category accept rates.

## Related Skills

- `scaffold-mcp-server` — for building or extending the broker itself
- `implement-a2a-server` — A2A protocol patterns the broker draws from
- `review-codebase` — single-agent review (this skill extends it to cross-agent structured exchange)
- `build-consensus` — swarm consensus patterns (QSG is the theoretical foundation)
- `configure-mcp-server` — configuring the broker as an MCP server in Claude Code
- `unleash-the-agents` — can be used to analyze the broker itself (battle-tested: 40 agents, 10 hypothesis families)
