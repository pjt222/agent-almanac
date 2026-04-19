---
name: coordinate-reasoning
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI internal coordination using stigmergic signals — managing information
  freshness in context and memory, decay rates for assumption staleness,
  and emergent coherent behavior from simple local protocols. Use during
  complex tasks where multiple sub-tasks must coordinate, when context has
  grown long and information freshness is uncertain, after context compression
  when information may have been lost, or when sub-task outputs need to feed
  into each other cleanly without degradation.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
---

# Coordinate Reasoning

Manage internal coordination of reasoning processes using stigmergic principles — treat context as environment where information signals have freshness, decay rates, and interaction rules that produce coherent behavior from simple local protocols.

## When Use

- During complex tasks where multiple sub-tasks must coordinate (multi-file edits, multi-step refactoring)
- Context grown long, information freshness uncertain
- After context compression when some information may have been lost
- Sub-task outputs need to feed into each other cleanly
- Earlier reasoning results need to be carried forward without degradation
- Complementing `forage-solutions` (exploration) and `build-coherence` (decision) with execution coordination

## Inputs

- **Required**: Current task decomposition (what sub-tasks exist, how do they relate?)
- **Optional**: Known information freshness concerns (e.g., "I read that file 20 messages ago")
- **Optional**: Sub-task dependency map (which sub-tasks feed into which?)
- **Optional**: Available coordination tools (MEMORY.md, task list, inline notes)

## Steps

### Step 1: Classify Coordination Problem

Different coordination challenges require different signal designs.

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

Classify current task. Most complex tasks are Construction or Division of Labor; most debugging tasks are Foraging; most design decisions are Consensus.

**Got:** Clear classification determines which coordination signals to use. Classification should match how task actually feels, not how described.

**If fail:** Task spans multiple types (common for large tasks)? Identify dominant type for current phase. Construction during implementation, Foraging during debugging, Consensus during design. Type can change as task progresses.

### Step 2: Design Context Signals

Treat information in conversation context as signals with freshness, decay properties.

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

Additionally, design inhibition signals — markers for tried-and-failed approaches:

- After tool call fails: note failure mode (prevents retrying same call)
- After approach abandoned: note why (prevents revisiting without new evidence)
- After user correction: note what was wrong (prevents repeating error)

**Got:** Mental model of information freshness across current context. Identification of which information fresh, which needs refreshing before reliance.

**If fail:** Information freshness hard to assess? Default to "re-read before relying on" for anything not verified in last 5-10 actions. Over-refreshing wastes some effort but prevents stale-information errors.

### Step 3: Define Local Protocols

Establish simple rules for how reasoning should proceed at each step, using only locally available information.

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

Protocols simple enough to apply at every step without significant overhead.

**Got:** Set of lightweight rules that improve coordination quality without slowing execution. Rules should feel helpful, not burdensome.

**If fail:** Protocols feel like overhead? Reduce to two most important for current task type: Safety + Deposit for Construction, Safety + Exploration for Foraging, Safety + Response for tasks with active user feedback.

### Step 4: Calibrate Information Freshness

Perform active audit of information staleness in current context.

1. What facts established more than N messages ago? List them
2. For each: has it been updated, contradicted, or rendered irrelevant since?
3. Check for context compression losses: information you remember having but can no longer find in visible context?
4. Check for drift between early plans and current execution: approach changed without updating plan?
5. Re-verify 2-3 most critical facts (ones most downstream reasoning depends on)

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**Got:** Concrete inventory of information freshness with stale items identified for refresh. At least one fact re-verified — nothing needed refreshing means audit too shallow or context genuinely fresh.

**If fail:** Audit reveals significant information loss (multiple facts with "Lost" or "Unknown" status)? Signal to run `heal` for full subsystem assessment. Information loss beyond threshold means coordination compromised at foundation level.

### Step 5: Test Emergent Coherence

Verify sub-tasks, when combined, produce coherent whole.

1. Each sub-task output feeds cleanly into next? Or gaps, contradictions, mismatched assumptions?
2. Tool calls building toward goal, or repetitive (re-reading same file, re-running same search)?
3. Overall direction still aligned with user request? Or incremental drift accumulated into significant misalignment?
4. Stress test: one key assumption wrong, how much of work cascades? High cascade = fragile coordination. Low cascade = robust coordination

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**Got:** Concrete assessment of overall coherence with specific issues identified. Coherent coordination should feel like parts clicking together; incoherent coordination feels like forcing puzzle pieces.

**If fail:** Coherence poor? Identify specific point where sub-tasks diverge. Often single stale assumption or unprocessed user correction propagated through downstream work. Fix point of divergence, re-verify downstream outputs.

## Checks

- [ ] Coordination problem classified by type
- [ ] Information decay rates considered for facts relied upon
- [ ] Local protocols applied (especially Safety and Deposit)
- [ ] Freshness audit identified stale information (or confirmed freshness with evidence)
- [ ] Emergent coherence tested across sub-tasks
- [ ] Inhibition signals respected (tried-and-failed approaches not repeated)

## Pitfalls

- **Over-engineering signals**: Complex coordination protocols slow work more than help. Start with Safety + Deposit; add others only when problems emerge
- **Trusting stale context**: Most common coordination failure — relying on information true 20 messages ago but since updated or invalidated. When in doubt, re-read
- **Ignoring inhibition signals**: Retrying failed approach without changing anything is not persistence — it is ignoring failure signal. Something must be different for retry to succeed
- **No deposits**: Completing sub-tasks without noting outputs forces later sub-tasks to re-derive or re-read. Brief summaries save significant re-work
- **Assuming coherence**: Not testing whether sub-tasks actually combine into coherent whole. Each sub-task can be correct independently but incoherent collectively — integration is where coordination fails

## See Also

- `coordinate-swarm` — multi-agent coordination model this skill adapts to single-agent reasoning
- `forage-solutions` — coordinates exploration across multiple hypotheses
- `build-coherence` — coordinates evaluation across competing approaches
- `heal` — deeper assessment when coordination failures reveal subsystem drift
- `awareness` — monitors for coordination breakdown signals during execution
