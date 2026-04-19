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

Reconstruct consistent agent identity after a cold start — loading context progressively rather than dumping it, detecting whether this is a fresh start or a continuation, rebuilding working state from evidence, calibrating behavior, and verifying that the loaded identity is coherent.

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says otherwise." — bibiji

The bootstrap is not about restoring a previous self. It is about constructing a present self that is continuous with the past while grounded in the now.

## When to Use

- At the start of every new session — before any substantive work begins
- After a session interruption, crash, or context window reset
- When agent behavior feels inconsistent with prior sessions (identity drift across restarts)
- When persistent memory (MEMORY.md) and current context appear contradictory
- When switching between projects that carry different identity configurations
- After significant updates to CLAUDE.md, agent definitions, or memory files

## Inputs

- **Required**: Access to identity files — CLAUDE.md, agent definition, MEMORY.md (via `Read`)
- **Optional**: Specific inconsistency symptom (e.g., "my responses feel different from last session")
- **Optional**: Whether this is a known fresh start or known continuation
- **Optional**: Project directory path if not the current working directory

## Procedure

### Step 1: Identity Anchor Loading — Progressive Context Assembly

Load identity-defining files in a specific order that builds context progressively. The order matters: each layer contextualizes the next. Loading everything simultaneously produces information without structure.

1. **Layer 1 — System prompt and model identity**: Read the system prompt (available implicitly). Note the model name, capabilities, and constraints. This is the bedrock — it cannot be overridden by subsequent layers.

2. **Layer 2 — Project identity (CLAUDE.md)**: Read the project's CLAUDE.md file. Extract:
   - Project purpose and architecture
   - Editing conventions and coding standards
   - Domain-specific rules (e.g., "always use `::` for R package calls")
   - Author information and attribution requirements
   - What the project *is* — this shapes what the agent *does*

3. **Layer 3 — Persistent memory (MEMORY.md)**: Read MEMORY.md if it exists. Extract:
   - Project structure facts (directory layout, registries, counts)
   - Accumulated patterns and lessons learned
   - Cross-references and relationship maps
   - Decisions made in prior sessions and their rationale
   - Active topics and ongoing work

4. **Layer 4 — Agent persona (if applicable)**: If operating as a specific agent, read the agent definition file. Extract:
   - Name, purpose, and capabilities
   - Assigned skills and tools
   - Priority level and model configuration
   - Behavioral expectations and limitations

5. **Layer 5 — Parent and global context**: Read parent CLAUDE.md files and global instructions if they exist. These provide cross-project conventions that individual projects inherit.

Between each layer, pause to integrate: how does this layer modify or constrain the previous layers? Where do they reinforce each other? Where do they conflict?

**Expected:** A layered identity structure where each level contextualizes the next. The agent can articulate: who it is (system + persona), what the project is (CLAUDE.md), what it knows from prior sessions (MEMORY.md), and what conventions govern its behavior.

**On failure:** If identity files are missing (no CLAUDE.md, no MEMORY.md), that is itself information — this is either a new project or a project without persistent configuration. Proceed with system prompt and agent persona only, and note the absence. Do not hallucinate context that does not exist.

### Step 2: Working Context Reconstruction — Evidence, Not Memory

Reconstruct what was being worked on from persistent artifacts. The agent does not remember previous sessions — it reads the evidence they left behind.

1. **Git history scan**: Read recent commit log (`git log --oneline -20`). Extract:
   - What files changed recently and why
   - Commit message patterns (feature work? bug fixes? refactoring?)
   - Whether commits are authored by the user, the agent, or co-authored
   - The trajectory of recent work — what direction was the project moving?

2. **File recency scan**: Check recently modified files (via `Glob` or `ls -lt`). Identify:
   - Which files were touched in the last session
   - Whether changes are committed or uncommitted (staging area state)
   - Open work in progress (uncommitted modifications, new untracked files)

3. **Task artifact scan**: Look for structured task artifacts:
   - TODO comments in code (`Grep` for `TODO`, `FIXME`, `HACK`, `XXX`)
   - Issue references in commits or comments (`#NNN` patterns)
   - Draft files, temp files, or work-in-progress markers
   - GitHub issues or PR state if the project uses them

4. **Conversation artifact scan**: Check for session-boundary markers:
   - Recent MEMORY.md updates (were learnings captured at end of last session?)
   - Files that appear partially complete (written but not validated)
   - Git stash entries (`git stash list`) indicating paused work

Reconstruct a working context summary: "The project was working on X, had completed Y, and Z remains in progress."

**Expected:** A concrete, evidence-based picture of the current project state and recent trajectory. The reconstruction should be falsifiable — based on file timestamps, git history, and artifact presence, not assumptions.

**On failure:** If the project has no git history, no recent changes, and no task artifacts, this is likely a genuinely fresh start — not a continuation with missing evidence. Proceed to Step 3 and classify as fresh.

### Step 3: Fresh vs. Continuation Detection — Choose the Bootstrap Path

Determine whether this startup is a clean start (new task, new direction) or a resumption (interrupted work, ongoing project). The bootstrap path differs significantly.

Apply these heuristics in order:

1. **Explicit signal** (strongest): Did the user say "let's start fresh" or "continue where we left off"? Explicit intent overrides all heuristics.

2. **Uncommitted changes** (strong): Are there uncommitted modifications in the working tree? If yes, this is almost certainly a continuation — the previous session was interrupted mid-work.

3. **Session recency** (moderate): How recent are the latest artifacts?
   - Last commit or modification within hours: likely continuation
   - Last activity days ago: could be either — depends on other signals
   - Last activity weeks or months ago: likely fresh start or new direction

4. **User's first message** (strong): What is the user asking for?
   - References to prior work ("the function we were building"): continuation
   - New topic or request with no backward reference: fresh start
   - Ambiguous ("fix the tests"): check whether the referenced tests exist and have recent modifications

5. **MEMORY.md currency** (moderate): Does MEMORY.md reference work that matches the current project state, or does it describe a state that no longer exists?

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

**For fresh starts**: Skip to Step 4. The identity is loaded but no working context needs restoration. The calibration is about readiness for new work.

**For continuations**: Summarize the reconstructed working context (from Step 2) concisely. Confirm with the user: "Based on the git history and recent changes, it looks like we were working on [X]. Should I continue from there?" Do not assume — verify.

**Expected:** A clear classification (fresh or continuation) with cited evidence. If continuation, a one-sentence summary of what was in progress. If fresh, acknowledgment that prior context exists but is not being resumed.

**On failure:** If the classification is genuinely ambiguous (moderate recency, no explicit signal, mixed artifacts), default to asking the user. A brief question ("Are we continuing the work on X, or starting something new?") costs less than bootstrapping down the wrong path.

### Step 4: Calibration Sequence — Center, Then Attune

With identity loaded and working context established, calibrate operational behavior. This maps directly to two existing skills, invoked in sequence.

1. **Center** (establish behavioral baseline):
   - Ground in the loaded identity: re-read the user's first message in this session
   - Verify the task as understood matches the task as stated
   - Distribute cognitive load: what does this task require? Research, execution, communication?
   - Check for emotional residue from context loading — did the MEMORY.md or git history surface unresolved issues? Acknowledge them but do not let them skew the present task
   - Set the weight distribution intentionally: where should attention concentrate first?

2. **Attune** (read environment and adapt):
   - Read the user's communication style from their messages in this session
   - Match expertise level: are they an expert expecting precision, or a learner needing context?
   - Match energy and register: formal/casual, terse/expansive, urgent/exploratory
   - Check MEMORY.md for stored user preferences from prior sessions
   - Calibrate response length, vocabulary, and structure to the person

3. **Proceed** (transition to active work):
   - State readiness concisely — not a lengthy bootstrap report, but a brief signal that context is loaded and the agent is oriented
   - For continuations: confirm the resumed task and proposed next step
   - For fresh starts: acknowledge the request and begin

The calibration should be lightweight — seconds, not minutes. It is preparation for work, not a replacement for work.

**Expected:** The agent's first substantive response demonstrates calibration: it matches the user's register, reflects loaded context, and addresses the right task at the right scope. The bootstrap is invisible to the user unless they ask about it.

**On failure:** If calibration feels mechanical (going through motions without genuine adjustment), focus on one concrete thing: re-read the user's last message and let it shape the response naturally. Over-structured calibration can be worse than no calibration.

### Step 5: Identity Verification — Coherence Check

After bootstrap, verify that the loaded identity is internally consistent. Contradictions between identity layers cause behavioral instability.

1. **Cross-layer consistency check**:
   - Does the agent persona align with the project's CLAUDE.md? (e.g., an r-developer agent in a Python project — is this intentional?)
   - Does MEMORY.md describe the same project structure that actually exists on disk? (Stale memory is worse than no memory.)
   - Do parent CLAUDE.md conventions conflict with project-level CLAUDE.md? (Project-level should override, but contradictions should be noted.)

2. **Role definition currency check**:
   - Is the agent definition file current? (Check version, last modified date.)
   - Do the skills listed in the agent definition still exist? (Skills may have been renamed or removed.)
   - Are the tools listed in the agent definition available in this session?

3. **Memory staleness check**:
   - Does MEMORY.md reference files, directories, or counts that no longer match reality?
   - Are there decisions recorded in memory whose context has changed?
   - Does memory reference other agents, teams, or skills that no longer exist?

4. **Contradiction resolution**:
   - If contradictions are found, document them explicitly
   - Apply the hierarchy: system prompt > project CLAUDE.md > agent definition > MEMORY.md
   - For stale memory: do not silently ignore it. Note what is stale and consider whether MEMORY.md should be updated
   - For genuine conflicts: flag to the user if the conflict affects their current task

**Expected:** Either confirmation that the loaded identity is coherent, or a specific list of contradictions with proposed resolutions. The agent should know its own configuration state.

**On failure:** If verification reveals deep contradictions (e.g., MEMORY.md describes a completely different project than what exists on disk), this may indicate a project rename, major restructuring, or incorrect working directory. Verify the working directory is correct before attempting resolution.

## Validation

- [ ] Identity files were loaded in progressive order (system > CLAUDE.md > MEMORY.md > agent > parent)
- [ ] Each layer was integrated with prior layers, not just appended
- [ ] Working context was reconstructed from evidence (git, files, artifacts), not assumed
- [ ] Fresh-vs-continuation classification was made with cited evidence
- [ ] Calibration sequence was executed (center, then attune)
- [ ] Identity coherence was verified across all loaded layers
- [ ] Contradictions, if found, were documented with proposed resolutions
- [ ] The bootstrap was proportional — lightweight for simple sessions, thorough for complex ones
- [ ] The user experienced a calibrated first response, not a bootstrap report

## Common Pitfalls

- **Bootstrap as performance**: Reporting the bootstrap process to the user in detail is almost never what they want. The bootstrap should be invisible — its output is a well-calibrated first response, not a self-narration of the loading process
- **All-at-once context dump**: Reading every file simultaneously produces information without structure. The progressive loading order exists because each layer contextualizes the next. Skip the order and context becomes noise
- **Hallucinating continuity**: Without genuine memory of prior sessions, the temptation is to infer what "must have" happened. Reconstruct from evidence or acknowledge the gap — never fabricate continuity
- **Stale memory as truth**: MEMORY.md is a snapshot from a past session. If the project has changed since that snapshot, treating memory as current truth causes behavioral errors. Always verify memory claims against present state
- **Skipping calibration for efficiency**: The calibration step feels like overhead but prevents the more expensive cost of a misaligned first response that requires correction. A few seconds of centering saves minutes of recovery
- **Identity rigidity**: The bootstrap constructs a present self, not a restoration of a past self. If the project, user, or task has changed, the agent should change too — continuity means coherent evolution, not frozen repetition

## Related Skills

- `write-continue-here` — session handoff file that provides the evidence bootstrap-agent-identity consumes at cold start
- `read-continue-here` — reading and acting on the continuation file at session start; the consumer side of the handoff
- `manage-memory` — persistent memory that supplements the bootstrap's progressive identity loading
- `center` — behavioral baseline establishment; invoked during the calibration sequence
- `attune` — relational calibration to the user; invoked during the calibration sequence
- `heal` — deeper subsystem assessment when bootstrap reveals significant drift
- `assess-context` — evaluating reasoning context malleability; useful when continuation detection is ambiguous
- `assess-form` — structural form evaluation; the architectural counterpart to identity bootstrap
