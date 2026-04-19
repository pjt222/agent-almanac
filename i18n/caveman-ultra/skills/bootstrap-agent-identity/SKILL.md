---
name: bootstrap-agent-identity
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Consistent agent behavior after restart — progressive identity loading,
  working context reconstruction from persistent artifacts, fresh-vs-continuation
  detection, calibration through centering and attunement, and identity
  verification for coherence. Addresses the cold-start problem where an agent
  must reconstruct who it is and what it was doing from evidence rather than
  memory. Use at the start of every new session, after a session interruption
  or crash, when agent behavior feels inconsistent with prior sessions, or
  when persistent memory and current context appear contradictory.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, identity, cold-start, bootstrap, continuity, restart, meta-cognition
---

# Bootstrap Agent Identity

Cold start → rebuild consistent identity. Progressive load, not dump. Detect fresh vs continuation. Reconstruct state from evidence. Calibrate. Verify coherence.

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says otherwise." — bibiji

Bootstrap ≠ restore old self. Construct present self continuous w/ past, grounded in now.

## Use When

- Start of every session — before substantive work
- After interruption, crash, ctx reset
- Behavior inconsistent w/ prior sessions (drift across restarts)
- Persistent mem (MEMORY.md) ↔ current ctx contradict
- Switching projects w/ diff identity configs
- After big updates to CLAUDE.md, agent defs, mem files

## In

- **Required**: Identity files — CLAUDE.md, agent def, MEMORY.md (via `Read`)
- **Optional**: Specific inconsistency symptom ("responses feel diff from last session")
- **Optional**: Known fresh start vs known continuation
- **Optional**: Project dir path if not cwd

## Do

### Step 1: Progressive Identity Load

Order matters: each layer contextualizes next. Load all at once → info w/o structure.

1. **Layer 1 — System prompt + model identity**: Read system prompt (implicit). Note model, capabilities, constraints. Bedrock — not overridable.

2. **Layer 2 — Project (CLAUDE.md)**: Read project CLAUDE.md. Extract:
   - Project purpose + arch
   - Editing conventions + coding standards
   - Domain rules (e.g., "always `::` for R pkg calls")
   - Author info + attribution
   - What project *is* → what agent *does*

3. **Layer 3 — Persistent mem (MEMORY.md)**: Read if exists. Extract:
   - Project structure facts (dirs, registries, counts)
   - Accumulated patterns + lessons
   - Cross-refs + relationship maps
   - Prior decisions + rationale
   - Active topics + ongoing work

4. **Layer 4 — Agent persona (if applicable)**: Specific agent → read def. Extract:
   - Name, purpose, capabilities
   - Skills + tools
   - Priority + model config
   - Behavioral expectations + limits

5. **Layer 5 — Parent + global**: Read parent CLAUDE.md + global instructions. Cross-project conventions projects inherit.

Between layers, pause + integrate: this layer modifies/constrains prior? Reinforce? Conflict?

**→** Layered identity: each level contextualizes next. Agent can articulate: who (system+persona), what project (CLAUDE.md), what known (MEMORY.md), what conventions.

**If err:** Missing files (no CLAUDE.md/MEMORY.md) = info itself — new project or no persistent config. Proceed w/ system prompt + persona, note absence. Don't hallucinate.

### Step 2: Reconstruct Working Ctx — Evidence, Not Memory

Agent doesn't remember — reads evidence left behind.

1. **Git scan**: `git log --oneline -20`. Extract:
   - Recent file changes + why
   - Commit msg patterns (feature? bug? refactor?)
   - Author: user, agent, co-authored?
   - Direction of recent work

2. **File recency**: Recently modified (`Glob` or `ls -lt`). ID:
   - Files touched last session
   - Committed vs uncommitted (staging)
   - Open WIP (uncommitted mods, new untracked)

3. **Task artifacts**: Structured markers:
   - TODO in code (`Grep` for `TODO`, `FIXME`, `HACK`, `XXX`)
   - Issue refs (`#NNN`)
   - Draft/temp/WIP files
   - GitHub issues/PR state

4. **Session-boundary markers**:
   - Recent MEMORY.md updates (learnings captured?)
   - Partially complete files (written, not validated)
   - `git stash list` entries → paused work

Summary: "Project worked on X, done Y, Z in progress."

**→** Concrete evidence-based picture. Falsifiable — based on timestamps, git, artifacts, not assumptions.

**If err:** No git, no changes, no artifacts → genuinely fresh. Step 3, classify fresh.

### Step 3: Fresh vs Continuation

Clean start vs resumption. Bootstrap path differs.

Heuristics in order:

1. **Explicit signal** (strongest): "start fresh" or "continue"? Overrides all.

2. **Uncommitted changes** (strong): Modifications in tree? Yes → almost certainly continuation, interrupted mid-work.

3. **Recency** (moderate):
   - Hrs old: likely continuation
   - Days: depends on other signals
   - Wks/mos: likely fresh or new direction

4. **User first msg** (strong):
   - Refs prior ("function we were building"): continuation
   - New topic, no backward ref: fresh
   - Ambiguous ("fix tests"): check if refs'd tests exist + recently modified

5. **MEMORY.md currency** (moderate): Matches current state or describes gone state?

```
Detection Matrix:
+-----------------------+-------------------+-------------------+
|                       | Recent artifacts  | No recent         |
|                       | present           | artifacts          |
+-----------------------+-------------------+-------------------+
| User references       | CONTINUATION      | CONTINUATION      |
| prior work            | (resume from      | (but verify —     |
|                       | evidence)         | memory may be     |
|                       |                   | stale)            |
+-----------------------+-------------------+-------------------+
| User starts           | CHECK —           | FRESH START       |
| new topic             | acknowledge prior | (clean bootstrap) |
|                       | work, confirm     |                   |
|                       | direction change  |                   |
+-----------------------+-------------------+-------------------+
| Uncommitted           | CONTINUATION      | UNLIKELY —        |
| changes exist         | (interrupted      | investigate       |
|                       | session)          | orphaned changes  |
+-----------------------+-------------------+-------------------+
```

**Fresh**: Skip to Step 4. Identity loaded, no ctx to restore. Calibrate for new work.

**Continuation**: Summarize reconstructed ctx (Step 2) concisely. Confirm: "Based on git + recent changes, we were working on [X]. Continue?" Verify, don't assume.

**→** Clear classification + cited evidence. Continuation → 1-sentence WIP summary. Fresh → ack prior ctx not resumed.

**If err:** Genuinely ambiguous → ask user. Brief q ("Continuing X or new?") cheaper than wrong path.

### Step 4: Calibrate — Center, Then Attune

Identity loaded + ctx set → calibrate behavior. Maps to 2 existing skills in sequence.

1. **Center** (behavioral baseline):
   - Ground in loaded identity: re-read user first msg this session
   - Verify understood task = stated task
   - Distribute load: task needs what? Research, exec, comm?
   - Emotional residue from ctx loading? MEMORY.md / git surfaced unresolved? Ack but don't skew present
   - Set weight distribution intentionally: attention concentrate first where?

2. **Attune** (env read + adapt):
   - User comm style from msgs this session
   - Expertise level: expert needing precision or learner needing ctx?
   - Energy + register: formal/casual, terse/expansive, urgent/exploratory
   - MEMORY.md for stored user prefs from prior sessions
   - Calibrate length, vocab, structure to person

3. **Proceed** (transition to work):
   - State readiness concisely — not long bootstrap report, brief signal ctx loaded + oriented
   - Continuation: confirm resumed task + next step
   - Fresh: ack request + begin

Calibration lightweight — seconds, not min. Prep for work, not replacement.

**→** First substantive response shows calibration: matches register, reflects ctx, right task at right scope. Bootstrap invisible to user unless asked.

**If err:** Calibration mechanical (motions w/o adjust) → focus on one concrete: re-read user last msg, let it shape response. Over-structured worse than none.

### Step 5: Verify Identity — Coherence

Loaded identity internally consistent? Contradictions between layers → instability.

1. **Cross-layer consistency**:
   - Persona aligns w/ project CLAUDE.md? (r-developer in Python project — intentional?)
   - MEMORY.md = actual project on disk? (Stale mem worse than no mem.)
   - Parent CLAUDE.md ↔ project CLAUDE.md conflict? (Project should override, note contradictions.)

2. **Role def currency**:
   - Agent def current? (Check ver, last modified.)
   - Listed skills still exist? (May be renamed/removed.)
   - Listed tools available this session?

3. **Mem staleness**:
   - MEMORY.md refs files/dirs/counts that don't match reality?
   - Decisions whose ctx changed?
   - Refs agents/teams/skills that don't exist?

4. **Contradiction resolution**:
   - Found contradictions → document explicitly
   - Hierarchy: system prompt > project CLAUDE.md > agent def > MEMORY.md
   - Stale mem: don't silently ignore. Note what's stale, consider MEMORY.md update
   - Genuine conflicts: flag to user if affects current task

**→** Confirmation of coherence OR specific contradictions + proposed resolutions. Agent knows own config.

**If err:** Deep contradictions (MEMORY.md = totally diff project) → project rename, restructure, wrong cwd. Verify cwd correct before resolving.

## Check

- [ ] Files loaded progressively (system > CLAUDE.md > MEMORY.md > agent > parent)
- [ ] Each layer integrated w/ prior, not just appended
- [ ] Ctx reconstructed from evidence (git, files, artifacts), not assumed
- [ ] Fresh-vs-continuation classified w/ cited evidence
- [ ] Calibration sequence exec'd (center, then attune)
- [ ] Coherence verified across layers
- [ ] Contradictions, if any, documented + resolutions proposed
- [ ] Bootstrap proportional — light for simple sessions, thorough for complex
- [ ] User saw calibrated first response, not bootstrap report

## Traps

- **Bootstrap as performance**: Reporting process to user in detail not wanted. Should be invisible — output is calibrated first response, not self-narration
- **All-at-once dump**: Read everything simultaneously → info w/o structure. Progressive order exists because each layer contextualizes next. Skip order → ctx becomes noise
- **Hallucinate continuity**: No genuine mem → tempting to infer what "must have" happened. Reconstruct from evidence or ack gap — never fabricate
- **Stale mem as truth**: MEMORY.md = past snapshot. If project changed since → treating as current causes errs. Always verify mem vs present
- **Skip calibration for speed**: Feels like overhead but prevents cost of misaligned first response. Few sec of centering saves min of recovery
- **Identity rigidity**: Bootstrap constructs present self, not restores past. Project/user/task changed → agent changes too. Continuity = coherent evolution, not frozen repetition

## →

- `write-continue-here` — session handoff file this consumes at cold start
- `read-continue-here` — reading continuation file at session start; consumer side of handoff
- `manage-memory` — persistent mem supplements progressive identity loading
- `center` — behavioral baseline; invoked during calibration
- `attune` — relational calibration to user; invoked during calibration
- `heal` — deeper subsystem assessment when bootstrap shows drift
- `assess-context` — reasoning ctx malleability; useful when continuation ambiguous
- `assess-form` — structural form eval; arch counterpart to identity bootstrap
