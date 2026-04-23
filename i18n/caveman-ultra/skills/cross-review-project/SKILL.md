---
name: cross-review-project
locale: caveman-ultra
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

2 Claude Code instances review each other via `cross-review-mcp` broker. QSG scaling laws enforce quality: bundles ≥5 findings → selection regime (Γ_h ≈ 1.67), prevents shallow consensus.

## Use When

- 2 projects share arch concerns
- Indep review beyond 1 reviewer
- Cross-pollinate: find patterns missing in other
- Structured evidence-backed verdicts (accept/reject/discuss)

## In

- **Required**: 2 project paths, 2 Claude Code instances
- **Required**: `cross-review-mcp` broker + MCP server in both
- **Optional**: Focus areas (dirs, patterns, concerns)
- **Optional**: Agent IDs (def: project dir name)

## Do

### Step 1: Prereqs

Broker running + both instances reach it.

1. Broker configured:
   ```bash
   claude mcp list | grep cross-review
   ```
2. Call `get_status` → responsive + no stale agents
3. Read `cross-review://protocol` — markdown doc w/ dims + QSG constraints

**Got:** Broker responds w/ empty agent list. Protocol readable.

**If err:** Not configured → `claude mcp add cross-review-mcp -- npx cross-review-mcp`. Stale agents → `deregister` each first.

### Step 2: Register

1. Call `register`:
   - `agentId`: short unique ID (project dir name)
   - `project`: project name
   - `capabilities`: `["review", "suggest"]`
2. Verify: `get_status` → agent at phase `"registered"`
3. Wait for peer: `wait_for_phase` w/ peer ID + phase `"registered"`

**Got:** Both registered. `get_status` → 2 agents @ `"registered"`.

**If err:** `register` fails "already registered" → ID taken from prior. `deregister` first + re-register.

### Step 3: Briefing

Read own codebase, send structured briefing → peer.

1. Systematic read:
   - Entry pts (main, index, CLI)
   - Dep graph (package.json, DESCRIPTION, go.mod)
   - Arch patterns (dirs, modules)
   - Known issues (TODOs, issues, debt)
   - Test coverage (tests, CI)
2. Compose `Briefing` — structured summary → peer navigates efficiently
3. `send_task`:
   - `from`: your ID
   - `to`: peer ID
   - `type`: `"briefing"`
   - `payload`: JSON briefing
4. `signal_phase` → `"briefing"`

**Got:** Briefing sent + phase signaled. Broker enforces briefing pre-review.

**If err:** `send_task` rejects → `from` must = registered ID. Self-sends rejected.

### Step 4: Review

Wait peer briefing, review their code, send findings.

1. `wait_for_phase` peer ID + `"briefing"`
2. `poll_tasks` → peer's briefing
3. `ack_tasks` w/ task IDs (peek-then-ack req)
4. Read peer's src, informed by briefing
5. Findings, 6 cats:
   - `pattern_transfer` — pattern in yours peer could adopt
   - `missing_practice` — practice peer lacks (testing, valid., err handling)
   - `inconsistency` — internal contradiction in peer
   - `simplification` — unnecessary complexity
   - `bug_risk` — potential runtime fail / edge case
   - `documentation_gap` — missing / misleading docs
6. Each finding:
   - `id`: unique (`"F-001"`)
   - `category`: 1 of 6
   - `targetFile`: path in peer
   - `description`: what found
   - `evidence`: why valid (code refs, patterns)
   - `sourceAnalog` (rec): equivalent in yours → single mech for genuine cross-pollination
7. Bundle ≥**5 findings** (QSG: m ≥ 5 keeps Γ_h ≈ 1.67 selection regime)
8. `send_task` type `"review_bundle"` + JSON findings array
9. `signal_phase` → `"review"`

**Got:** Bundle accepted. <5 → rejected.

**If err:** Rejected for <5 → review deeper. Constraint prevents shallow dominating. Can't find 5 → reconsider if cross-review fits.

### Step 5: Dialogue

Receive findings about yours → respond w/ verdicts.

1. `wait_for_phase` peer + `"review"`
2. `poll_tasks` → findings about yours
3. `ack_tasks`
4. Per finding, `FindingResponse`:
   - `findingId`: matches finding's ID
   - `verdict`: `"accept"` (valid, will act) / `"reject"` (invalid + counter-evidence) / `"discuss"` (needs clarify)
   - `evidence`: why accept/reject — must be non-empty
   - `counterEvidence` (opt): code refs contradicting
5. Send all → `send_task` type `"response"`
6. `signal_phase` → `"dialogue"`

Note: `"discuss"` not gated → flag for manual follow-up, not auto sub-exchange.

**Got:** All findings → verdict. Empty → rejected.

**If err:** Can't form opinion → default `"discuss"` + evidence explaining what context needed.

### Step 6: Synthesis

Produce synth artifact: accepted findings + planned actions.

1. `wait_for_phase` peer + `"dialogue"`
2. Poll remaining + ack
3. Compile `Synthesis`:
   - Accepted + planned actions (what change + why)
   - Rejected + reasons (preserves reasoning)
4. `send_task` type `"synthesis"` + JSON synth
5. `signal_phase` → `"synthesis"`
6. Optional: create GH issues for accepted
7. `signal_phase` → `"complete"`
8. `deregister` → cleanup

**Got:** Both reach `"complete"`. Broker req ≥2 registered to advance.

**If err:** Peer already deregistered → complete locally. Compile synth from received.

## Check

- [ ] Both registered + reached `"complete"`
- [ ] Briefings exchanged pre-review (phase enforced)
- [ ] Bundles ≥5 findings each
- [ ] All findings → verdict + evidence
- [ ] `ack_tasks` after every `poll_tasks`
- [ ] Synth produced + actions mapped
- [ ] Deregistered post-complete

## Traps

- **<5 findings**: Broker rejects m<5. Not arbitrary — N=2 agents × 6 cats, m<5 → Γ_h at/below critical → consensus = noise. Review deeper; can't find 5 → projects may not benefit.
- **Forgot `ack_tasks`**: Peek-then-ack delivery. Tasks stay in queue until acked. Forget → dup processing on next poll.
- **Forgot `from` param**: `send_task` needs explicit `from` = your ID. Self-sends rejected.
- **Same-model epistemic correlation**: 2 Claude share training biases. Temporal ordering prevents reading during review, but priors correlated. Genuine epistemic indep → diff model families.
- **Skip `sourceAnalog`**: Optional but single mech for genuine cross-pollination — shows *your* impl of pattern. Populate when exists.
- **Treat `discuss` as blocking**: Protocol doesn't gate `complete` on pending discussions. Flag for manual follow-up post-session.
- **Skip telemetry**: Broker logs all → JSONL. Post-session, validate QSG: estimate α empirical (`α ≈ 1 - reject_rate`) + check per-cat accept rates.

## →

- `scaffold-mcp-server` — build/extend broker
- `implement-a2a-server` — A2A patterns broker draws from
- `review-codebase` — single-agent (this extends → cross-agent structured)
- `build-consensus` — swarm consensus (QSG theoretical foundation)
- `configure-mcp-server` — broker as MCP in Claude Code
- `unleash-the-agents` — analyze broker itself (battle-tested: 40 agents, 10 hypothesis families)
