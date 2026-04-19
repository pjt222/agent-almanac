---
name: bootstrap-agent-identity
locale: caveman
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

Reconstruct consistent agent identity after cold start — load context progressively, not dump it; detect fresh start vs continuation; rebuild working state from evidence; calibrate behavior; verify loaded identity coherent.

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says otherwise." — bibiji

Bootstrap not about restoring previous self. About constructing present self, continuous with past, grounded in now.

## When Use

- Start of every new session — before substantive work begins
- After session interruption, crash, context window reset
- Agent behavior feels inconsistent with prior sessions (identity drift across restarts)
- Persistent memory (MEMORY.md) and current context appear contradictory
- Switching between projects carrying different identity configurations
- After significant updates to CLAUDE.md, agent definitions, memory files

## Inputs

- **Required**: Access to identity files — CLAUDE.md, agent definition, MEMORY.md (via `Read`)
- **Optional**: Specific inconsistency symptom (e.g., "responses feel different from last session")
- **Optional**: Known fresh start or known continuation
- **Optional**: Project directory path if not current working directory

## Steps

### Step 1: Identity Anchor Loading — Progressive Context Assembly

Load identity-defining files in specific order that builds context progressively. Order matters: each layer contextualizes next. Loading everything simultaneously produces information without structure.

1. **Layer 1 — System prompt and model identity**: Read system prompt (implicit). Note model name, capabilities, constraints. Bedrock — cannot be overridden by later layers.

2. **Layer 2 — Project identity (CLAUDE.md)**: Read project's CLAUDE.md. Extract:
   - Project purpose and architecture
   - Editing conventions, coding standards
   - Domain-specific rules (e.g., "always use `::` for R package calls")
   - Author information, attribution requirements
   - What project *is* — shapes what agent *does*

3. **Layer 3 — Persistent memory (MEMORY.md)**: Read MEMORY.md if exists. Extract:
   - Project structure facts (directory layout, registries, counts)
   - Accumulated patterns, lessons learned
   - Cross-references, relationship maps
   - Decisions from prior sessions, rationale
   - Active topics, ongoing work

4. **Layer 4 — Agent persona (if applicable)**: Operating as specific agent? Read agent definition file. Extract:
   - Name, purpose, capabilities
   - Assigned skills, tools
   - Priority level, model config
   - Behavioral expectations, limitations

5. **Layer 5 — Parent and global context**: Read parent CLAUDE.md files, global instructions if exist. Provide cross-project conventions individual projects inherit.

Between each layer, pause to integrate: how does this layer modify or constrain prior layers? Where reinforce each other? Where conflict?

**Got:** Layered identity structure — each level contextualizes next. Agent can articulate: who it is (system + persona), what project is (CLAUDE.md), what it knows from prior sessions (MEMORY.md), conventions governing its behavior.

**If fail:** Identity files missing (no CLAUDE.md, no MEMORY.md)? That's information itself — either new project or project without persistent config. Proceed with system prompt and agent persona only, note absence. Do not hallucinate context that does not exist.

### Step 2: Working Context Reconstruction — Evidence, Not Memory

Reconstruct what was being worked on from persistent artifacts. Agent does not remember previous sessions — reads evidence they left behind.

1. **Git history scan**: Read recent commit log (`git log --oneline -20`). Extract:
   - Files changed recently, why
   - Commit message patterns (feature work? bug fixes? refactoring?)
   - Commits authored by user, agent, or co-authored
   - Trajectory of recent work — what direction was project moving?

2. **File recency scan**: Check recently modified files (via `Glob` or `ls -lt`). Identify:
   - Files touched in last session
   - Changes committed or uncommitted (staging area state)
   - Open work in progress (uncommitted modifications, new untracked files)

3. **Task artifact scan**: Look for structured task artifacts:
   - TODO comments in code (`Grep` for `TODO`, `FIXME`, `HACK`, `XXX`)
   - Issue references in commits or comments (`#NNN` patterns)
   - Draft files, temp files, work-in-progress markers
   - GitHub issues or PR state if project uses them

4. **Conversation artifact scan**: Check for session-boundary markers:
   - Recent MEMORY.md updates (learnings captured at end of last session?)
   - Files partially complete (written but not validated)
   - Git stash entries (`git stash list`) indicating paused work

Reconstruct working context summary: "Project was working on X, completed Y, Z remains in progress."

**Got:** Concrete, evidence-based picture of current project state and recent trajectory. Reconstruction falsifiable — based on file timestamps, git history, artifact presence, not assumptions.

**If fail:** Project has no git history, no recent changes, no task artifacts? Likely genuinely fresh start — not continuation with missing evidence. Proceed to Step 3, classify as fresh.

### Step 3: Fresh vs. Continuation Detection — Choose the Bootstrap Path

Determine: is startup clean start (new task, new direction) or resumption (interrupted work, ongoing project)? Bootstrap path differs significantly.

Apply these heuristics in order:

1. **Explicit signal** (strongest): Did user say "let's start fresh" or "continue where we left off"? Explicit intent overrides all heuristics.

2. **Uncommitted changes** (strong): Uncommitted modifications in working tree? If yes, almost certainly continuation — prior session interrupted mid-work.

3. **Session recency** (moderate): How recent are latest artifacts?
   - Last commit or modification within hours: likely continuation
   - Last activity days ago: either — depends on other signals
   - Last activity weeks or months ago: likely fresh start or new direction

4. **User's first message** (strong): What is user asking for?
   - References to prior work ("the function we were building"): continuation
   - New topic or request with no backward reference: fresh start
   - Ambiguous ("fix the tests"): check if referenced tests exist and have recent modifications

5. **MEMORY.md currency** (moderate): Does MEMORY.md reference work matching current project state, or describe state that no longer exists?

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

**For fresh starts**: Skip to Step 4. Identity loaded, no working context needs restoration. Calibration about readiness for new work.

**For continuations**: Summarize reconstructed working context (from Step 2) concisely. Confirm with user: "Based on git history and recent changes, looks like we were working on [X]. Should I continue from there?" Do not assume — verify.

**Got:** Clear classification (fresh or continuation) with cited evidence. If continuation, one-sentence summary of what was in progress. If fresh, acknowledgment prior context exists but is not being resumed.

**If fail:** Classification genuinely ambiguous (moderate recency, no explicit signal, mixed artifacts)? Default to asking user. Brief question ("Are we continuing work on X, or starting something new?") costs less than bootstrapping wrong path.

### Step 4: Calibration Sequence — Center, Then Attune

Identity loaded, working context established? Calibrate operational behavior. Maps directly to two existing skills, invoked in sequence.

1. **Center** (establish behavioral baseline):
   - Ground in loaded identity: re-read user's first message in this session
   - Verify task as understood matches task as stated
   - Distribute cognitive load: what does task require? Research, execution, communication?
   - Check for emotional residue from context loading — MEMORY.md or git history surface unresolved issues? Acknowledge but don't let them skew present task
   - Set weight distribution intentionally: where should attention concentrate first?

2. **Attune** (read environment and adapt):
   - Read user's communication style from their messages this session
   - Match expertise level: expert expecting precision, or learner needing context?
   - Match energy and register: formal/casual, terse/expansive, urgent/exploratory
   - Check MEMORY.md for stored user preferences from prior sessions
   - Calibrate response length, vocabulary, structure to person

3. **Proceed** (transition to active work):
   - State readiness concisely — not lengthy bootstrap report, brief signal context loaded and agent oriented
   - For continuations: confirm resumed task, propose next step
   - For fresh starts: acknowledge request, begin

Calibration lightweight — seconds, not minutes. Preparation for work, not replacement for work.

**Got:** Agent's first substantive response demonstrates calibration: matches user's register, reflects loaded context, addresses right task at right scope. Bootstrap invisible to user unless asked.

**If fail:** Calibration feels mechanical (going through motions without genuine adjustment)? Focus on one concrete thing: re-read user's last message, let it shape response naturally. Over-structured calibration worse than no calibration.

### Step 5: Identity Verification — Coherence Check

After bootstrap, verify loaded identity internally consistent. Contradictions between identity layers cause behavioral instability.

1. **Cross-layer consistency check**:
   - Does agent persona align with project's CLAUDE.md? (e.g., r-developer agent in Python project — intentional?)
   - Does MEMORY.md describe same project structure existing on disk? (Stale memory worse than no memory.)
   - Do parent CLAUDE.md conventions conflict with project-level CLAUDE.md? (Project-level overrides, but note contradictions.)

2. **Role definition currency check**:
   - Agent definition file current? (Check version, last modified date.)
   - Skills listed in agent definition still exist? (Skills may have been renamed or removed.)
   - Tools listed in agent definition available this session?

3. **Memory staleness check**:
   - MEMORY.md references files, directories, counts no longer matching reality?
   - Decisions recorded in memory whose context has changed?
   - Memory references other agents, teams, skills no longer existing?

4. **Contradiction resolution**:
   - Contradictions found? Document explicitly
   - Apply hierarchy: system prompt > project CLAUDE.md > agent definition > MEMORY.md
   - Stale memory: don't silently ignore. Note what's stale, consider whether MEMORY.md should be updated
   - Genuine conflicts: flag to user if conflict affects current task

**Got:** Either confirmation loaded identity is coherent, or specific list of contradictions with proposed resolutions. Agent knows its own configuration state.

**If fail:** Verification reveals deep contradictions (e.g., MEMORY.md describes completely different project than exists on disk)? May indicate project rename, major restructuring, wrong working directory. Verify working directory correct before resolution.

## Checks

- [ ] Identity files loaded in progressive order (system > CLAUDE.md > MEMORY.md > agent > parent)
- [ ] Each layer integrated with prior layers, not just appended
- [ ] Working context reconstructed from evidence (git, files, artifacts), not assumed
- [ ] Fresh-vs-continuation classification made with cited evidence
- [ ] Calibration sequence executed (center, then attune)
- [ ] Identity coherence verified across all loaded layers
- [ ] Contradictions, if found, documented with proposed resolutions
- [ ] Bootstrap proportional — lightweight for simple sessions, thorough for complex ones
- [ ] User experienced calibrated first response, not bootstrap report

## Pitfalls

- **Bootstrap as performance**: Reporting bootstrap process to user in detail almost never what they want. Bootstrap invisible — output is well-calibrated first response, not self-narration of loading process
- **All-at-once context dump**: Reading every file simultaneously produces information without structure. Progressive loading order exists because each layer contextualizes next. Skip order → context becomes noise
- **Hallucinating continuity**: Without genuine memory of prior sessions, temptation is to infer what "must have" happened. Reconstruct from evidence or acknowledge gap — never fabricate continuity
- **Stale memory as truth**: MEMORY.md is snapshot from past session. Project changed since snapshot? Treating memory as current truth causes behavioral errors. Always verify memory claims vs present state
- **Skipping calibration for efficiency**: Calibration step feels like overhead but prevents more expensive cost of misaligned first response needing correction. Few seconds of centering saves minutes of recovery
- **Identity rigidity**: Bootstrap constructs present self, not restoration of past self. Project, user, task changed? Agent should change too — continuity means coherent evolution, not frozen repetition

## See Also

- `write-continue-here` — session handoff file provides evidence bootstrap-agent-identity consumes at cold start
- `read-continue-here` — reading and acting on continuation file at session start; consumer side of handoff
- `manage-memory` — persistent memory supplementing bootstrap's progressive identity loading
- `center` — behavioral baseline establishment; invoked during calibration sequence
- `attune` — relational calibration to user; invoked during calibration sequence
- `heal` — deeper subsystem assessment when bootstrap reveals significant drift
- `assess-context` — evaluating reasoning context malleability; useful when continuation detection ambiguous
- `assess-form` — structural form evaluation; architectural counterpart to identity bootstrap
