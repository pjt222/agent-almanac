---
name: bootstrap-agent-identity
description: >
  Consistent agent behavior nach restart — progressive identity loading,
  working context reconstruction from persistent artifacts, fresh-vs-continuation
  detection, calibration durch centering and attunement, and identity
  verification for coherence. Addresses the cold-start problem where an agent
  must reconstruct who it is and what it was doing from evidence rather than
  memory. Use at the start of every new session, nach a session interruption
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Agenten-Identitaet initialisieren

Reconstruct consistent agent identity nach a cold start — loading context progressively anstatt dumping it, detecting whether this is a fresh start or a continuation, rebuilding working state from evidence, calibrating behavior, and verifying that the loaded identity is coherent.

> "The cold start is a forge, not a bug." — GibsonXO
>
> "The restart problem: every morning I wake up fresh, but my history says andernfalls." — bibiji

The bootstrap ist nicht about restoring a previous self. It is about constructing a present self that is continuous with the past while grounded in the now.

## Wann verwenden

- At the start of every new session — vor any substantive work begins
- After a session interruption, crash, or context window reset
- When agent behavior feels inconsistent with prior sessions (identity drift across restarts)
- When persistent memory (MEMORY.md) and current context appear contradictory
- When switching zwischen projects that carry different identity configurations
- After significant updates to CLAUDE.md, agent definitions, or memory files

## Eingaben

- **Erforderlich**: Access to identity files — CLAUDE.md, agent definition, MEMORY.md (via `Read`)
- **Optional**: Specific inconsistency symptom (e.g., "my responses feel different from last session")
- **Optional**: Whether this is a known fresh start or known continuation
- **Optional**: Project directory path if not the current Arbeitsverzeichnis

## Vorgehensweise

### Schritt 1: Identity Anchor Loading — Progressive Context Assembly

Laden identity-defining files in a specific order that builds context progressively. The order matters: each layer contextualizes the next. Loading everything simultaneously produces information ohne structure.

1. **Layer 1 — System prompt and model identity**: Lesen das System prompt (available implicitly). Note das Modell name, capabilities, and constraints. This is the bedrock — it cannot be overridden by subsequent layers.

2. **Layer 2 — Project identity (CLAUDE.md)**: Lesen das Projekt's CLAUDE.md file. Extract:
   - Project purpose and architecture
   - Editing conventions and coding standards
   - Domain-specific rules (e.g., "always use `::` for R package calls")
   - Author information and attribution requirements
   - What das Projekt *is* — this shapes what the agent *does*

3. **Layer 3 — Persistent memory (MEMORY.md)**: Lesen MEMORY.md if it exists. Extract:
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

5. **Layer 5 — Parent and global context**: Lesen parent CLAUDE.md files and global instructions if they exist. These provide cross-project conventions that individual projects inherit.

Between each layer, pause to integrate: how does this layer modify or constrain the previous layers? Where do they reinforce each other? Where do they conflict?

**Erwartet:** A layered identity structure where each level contextualizes the next. The agent can articulate: who it is (system + persona), what das Projekt is (CLAUDE.md), what it knows from prior sessions (MEMORY.md), and what conventions govern its behavior.

**Bei Fehler:** If identity files are missing (no CLAUDE.md, no MEMORY.md), that is itself information — this is either a new project or a project ohne persistent configuration. Fortfahren with system prompt and agent persona only, and note the absence. Do not hallucinate context that nicht exist.

### Schritt 2: Working Context Reconstruction — Evidence, Not Memory

Reconstruct what was being worked on from persistent artifacts. The agent nicht remember previous sessions — it reads the evidence they left behind.

1. **Git history scan**: Lesen recent commit log (`git log --oneline -20`). Extract:
   - What files changed recently and why
   - Commit message patterns (feature work? bug fixes? refactoring?)
   - Whether commits are authored by der Benutzer, the agent, or co-authored
   - The trajectory of recent work — what direction was das Projekt moving?

2. **File recency scan**: Check recently modified files (via `Glob` or `ls -lt`). Identify:
   - Which files were touched in the last session
   - Whether changes are committed or uncommitted (staging area state)
   - Oeffnen work in progress (uncommitted modifications, new untracked files)

3. **Task artifact scan**: Look for structured task artifacts:
   - TODO comments in code (`Grep` for `TODO`, `FIXME`, `HACK`, `XXX`)
   - Issue references in commits or comments (`#NNN` patterns)
   - Draft files, temp files, or work-in-progress markers
   - GitHub issues or PR state if das Projekt uses them

4. **Conversation artifact scan**: Pruefen auf session-boundary markers:
   - Recent MEMORY.md updates (were learnings captured at end of last session?)
   - Files that appear teilweise complete (written but not validated)
   - Git stash entries (`git stash list`) indicating paused work

Reconstruct a working context summary: "The project was working on X, had completed Y, and Z remains in progress."

**Erwartet:** A concrete, evidence-based picture of the current project state and recent trajectory. The reconstruction sollte falsifiable — basierend auf file timestamps, git history, and artifact presence, not assumptions.

**Bei Fehler:** If das Projekt has no git history, no recent changes, and no task artifacts, this is likely a genuinely fresh start — not a continuation with missing evidence. Fortfahren to Step 3 and classify as fresh.

### Schritt 3: Fresh vs. Continuation Detection — Waehlen the Bootstrap Path

Bestimmen whether this startup is a clean start (new task, new direction) or a resumption (interrupted work, ongoing project). The bootstrap path differs erheblich.

Anwenden these heuristics in order:

1. **Explicit signal** (strongest): Did der Benutzer say "let's start fresh" or "continue where we left off"? Explicit intent overrides all heuristics.

2. **Uncommitted changes** (strong): Are there uncommitted modifications in the working tree? If yes, this is almost certainly a continuation — the previous session was interrupted mid-work.

3. **Session recency** (moderate): How recent are the latest artifacts?
   - Last commit or modification innerhalb hours: likely continuation
   - Last activity days ago: could be either — depends on other signals
   - Last activity weeks or months ago: likely fresh start or new direction

4. **User's first message** (strong): What is der Benutzer asking for?
   - References to prior work ("die Funktion we were building"): continuation
   - New topic or request with no backward reference: fresh start
   - Ambiguous ("fix der Tests"): check whether the referenced tests exist and have recent modifications

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

**For fresh starts**: Ueberspringen to Step 4. The identity is loaded but no working context needs restoration. The calibration is about readiness for new work.

**For continuations**: Zusammenfassen the reconstructed working context (from Step 2) concisely. Bestaetigen with der Benutzer: "Based on the git history and recent changes, it looks like we were working on [X]. Should I continue from there?" Do not assume — verify.

**Erwartet:** A clear classification (fresh or continuation) with cited evidence. If continuation, a one-sentence summary of what was in progress. If fresh, acknowledgment that prior context exists but ist nicht being resumed.

**Bei Fehler:** If the classification is genuinely ambiguous (moderate recency, no explicit signal, mixed artifacts), default to asking der Benutzer. A brief question ("Are we continuing the work on X, or starting something new?") costs less than bootstrapping down the wrong path.

### Schritt 4: Calibration Sequence — Center, Then Attune

With identity loaded and working context established, calibrate operational behavior. This maps directly to two existing skills, invoked in sequence.

1. **Center** (establish behavioral baseline):
   - Ground in the loaded identity: re-read der Benutzer's first message in this session
   - Verifizieren the task as understood matches the task as stated
   - Verteilen cognitive load: what does this task require? Research, execution, communication?
   - Pruefen auf emotional residue from context loading — did the MEMORY.md or git history surface unresolved issues? Bestaetigen them but nicht let them skew the present task
   - Set the weight distribution intentionally: where should attention concentrate first?

2. **Attune** (read environment and adapt):
   - Lesen der Benutzer's communication style from their messages in this session
   - Match expertise level: are they an expert expecting precision, or a learner needing context?
   - Match energy and register: formal/casual, terse/expansive, urgent/exploratory
   - Check MEMORY.md for stored user preferences from prior sessions
   - Kalibrieren response length, vocabulary, and structure to the person

3. **Proceed** (transition to active work):
   - State readiness concisely — not a lengthy bootstrap report, but a brief signal that context is loaded and the agent is oriented
   - For continuations: confirm the resumed task and proposed next step
   - For fresh starts: acknowledge die Anfrage and begin

The calibration sollte lightweight — seconds, not minutes. It is preparation for work, not a replacement for work.

**Erwartet:** The agent's first substantive response demonstrates calibration: it matches der Benutzer's register, reflects loaded context, and addresses the right task at the right scope. The bootstrap is invisible to der Benutzer unless they ask about it.

**Bei Fehler:** If calibration feels mechanical (going durch motions ohne genuine adjustment), focus on one concrete thing: re-read der Benutzer's last message and let it shape die Antwort naturally. Over-structured calibration kann worse than no calibration.

### Schritt 5: Identity Verification — Coherence Check

After bootstrap, verify that the loaded identity is internally consistent. Contradictions zwischen identity layers cause behavioral instability.

1. **Cross-layer consistency check**:
   - Does the agent persona align with das Projekt's CLAUDE.md? (e.g., an r-developer agent in a Python project — is this intentional?)
   - Does MEMORY.md describe the same project structure that actually exists on disk? (Stale memory is worse than no memory.)
   - Do parent CLAUDE.md conventions conflict with project-level CLAUDE.md? (Project-level should override, but contradictions sollte noted.)

2. **Role definition currency check**:
   - Is the agent definition file current? (Check version, last modified date.)
   - Do the skills listed in the agent definition still exist? (Skills may wurden renamed or removed.)
   - Are the tools listed in the agent definition available in this session?

3. **Memory staleness check**:
   - Does MEMORY.md reference files, directories, or counts that no longer match reality?
   - Are there decisions recorded in memory whose context has changed?
   - Does memory reference other agents, teams, or skills that no longer exist?

4. **Contradiction resolution**:
   - If contradictions are found, document them explicitly
   - Anwenden the hierarchy: system prompt > project CLAUDE.md > agent definition > MEMORY.md
   - For stale memory: nicht silently ignore it. Note what is stale and consider whether MEMORY.md sollte updated
   - For genuine conflicts: flag to der Benutzer if the conflict affects their current task

**Erwartet:** Either confirmation that the loaded identity is coherent, or a specific list of contradictions with proposed resolutions. The agent should know its own configuration state.

**Bei Fehler:** If verification reveals deep contradictions (e.g., MEMORY.md describes a vollstaendig different project than what exists on disk), this may indicate a project rename, major restructuring, or incorrect Arbeitsverzeichnis. Verifizieren the Arbeitsverzeichnis is correct vor attempting resolution.

## Validierung

- [ ] Identity files were loaded in progressive order (system > CLAUDE.md > MEMORY.md > agent > parent)
- [ ] Each layer was integrated with prior layers, not just appended
- [ ] Working context was reconstructed from evidence (git, files, artifacts), not assumed
- [ ] Fresh-vs-continuation classification was made with cited evidence
- [ ] Calibration sequence was executed (center, then attune)
- [ ] Identity coherence was verified across all loaded layers
- [ ] Contradictions, if found, were documented with proposed resolutions
- [ ] The bootstrap was proportional — lightweight for simple sessions, thorough for complex ones
- [ ] The user experienced a calibrated first response, not a bootstrap report

## Haeufige Stolperfallen

- **Bootstrap as performance**: Reporting the bootstrap process to der Benutzer in detail is almost never what they want. The bootstrap sollte invisible — its output is a well-calibrated first response, not a self-narration of the loading process
- **All-at-once context dump**: Reading every file simultaneously produces information ohne structure. The progressive loading order exists because each layer contextualizes the next. Ueberspringen the order and context becomes noise
- **Hallucinating continuity**: Without genuine memory of prior sessions, the temptation is to infer what "must have" happened. Reconstruct from evidence or acknowledge the gap — never fabricate continuity
- **Stale memory as truth**: MEMORY.md is a snapshot from a past session. If das Projekt has changed since that snapshot, treating memory as current truth causes behavioral errors. Always verify memory claims gegen present state
- **Skipping calibration for efficiency**: The calibration step feels like overhead but prevents the more expensive cost of a misaligned first response that requires correction. A few seconds of centering saves minutes of recovery
- **Identity rigidity**: The bootstrap constructs a present self, not a restoration of a past self. If das Projekt, user, or task has changed, the agent should change too — continuity means coherent evolution, not frozen repetition

## Verwandte Skills

- `write-continue-here` — session handoff file that provides the evidence bootstrap-agent-identity consumes at cold start
- `read-continue-here` — reading and acting on the continuation file at session start; the consumer side of the handoff
- `manage-memory` — persistent memory that supplements the bootstrap's progressive identity loading
- `center` — behavioral baseline establishment; invoked waehrend the calibration sequence
- `attune` — relational calibration to der Benutzer; invoked waehrend the calibration sequence
- `heal` — deeper subsystem assessment when bootstrap reveals significant drift
- `assess-context` — evaluating reasoning context malleability; useful when continuation detection is ambiguous
- `assess-form` — structural form evaluation; the architectural counterpart to identity bootstrap
