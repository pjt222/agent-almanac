---
name: coordinate-reasoning
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
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Coordinate Reasoning

Manage the internal coordination of reasoning processes using stigmergic principles — treating context as an environment where information signals have freshness, decay rates, and interaction rules that produce coherent behavior from simple local protocols.

## 适用场景

- During complex tasks where multiple sub-tasks must coordinate (multi-file edits, multi-step refactoring)
- When context has grown long and information freshness is uncertain
- After context compression when some information may have been lost
- When sub-task outputs need to feed into each other cleanly
- When earlier reasoning results need to be carried forward without degradation
- Complementing `forage-solutions` (exploration) and `build-coherence` (decision) with execution coordination

## 输入

- **必需**: Current task decomposition (what sub-tasks exist and how do they relate?)
- **可选**: Known information freshness concerns (e.g., "I read that file 20 messages ago")
- **可选**: Sub-task dependency map (which sub-tasks feed into which?)
- **可选**: Available coordination tools (MEMORY.md, task list, inline notes)

## 步骤

### 第 1 步：Classify the Coordination Problem

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

Classify the current task. Most complex tasks are Construction or Division of Labor; most debugging tasks are Foraging; most design decisions are Consensus.

**预期结果：** A clear classification that determines which coordination signals to use. The classification should match how the task actually feels, not how it was described.

**失败处理：** If the task spans multiple types (common for large tasks), identify the dominant type for the current phase. Construction during implementation, Foraging during debugging, Consensus during design. The type can change as the task progresses.

### 第 2 步：Design Context Signals

Treat information in the conversation context as signals with freshness and decay properties.

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

- After a tool call fails: note the failure mode (prevents retrying the same call)
- After an approach is abandoned: note why (prevents revisiting without new evidence)
- After a user correction: note what was wrong (prevents repeating the error)

**预期结果：** A mental model of information freshness across the current context. Identification of which information is fresh and which needs refreshing before reliance.

**失败处理：** If information freshness is hard to assess, default to "re-read before relying on" for anything not verified in the last 5-10 actions. Over-refreshing wastes some effort but prevents stale-information errors.

### 第 3 步：Define Local Protocols

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

These protocols are simple enough to apply at every step without significant overhead.

**预期结果：** A set of lightweight rules that improve coordination quality without slowing execution. The rules should feel helpful, not burdensome.

**失败处理：** If the protocols feel like overhead, reduce to the two most important for the current task type: Safety + Deposit for Construction, Safety + Exploration for Foraging, Safety + Response for tasks with active user feedback.

### 第 4 步：Calibrate Information Freshness

Perform an active audit of information staleness in the current context.

1. What facts were established more than N messages ago? List them
2. For each: has it been updated, contradicted, or rendered irrelevant since?
3. Check for context compression losses: is there information you remember having but can no longer find in the visible context?
4. Check for drift between early plans and current execution: has the approach changed without updating the plan?
5. Re-verify the 2-3 most critical facts (the ones that the most downstream reasoning depends on)

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**预期结果：** A concrete inventory of information freshness with stale items identified for refresh. At least one fact re-verified — if nothing needed refreshing, the audit was too shallow or the context is genuinely fresh.

**失败处理：** If the audit reveals significant information loss (multiple facts with "Lost" or "Unknown" status), this is a signal to run `heal` for a full subsystem assessment. Information loss beyond a threshold means coordination is compromised at the foundation level.

### 第 5 步：Test Emergent Coherence

Verify that the sub-tasks, when combined, produce a coherent whole.

1. Does each sub-task's output feed cleanly into the next? Or are there gaps, contradictions, or mismatched assumptions?
2. Are tool calls building toward the goal, or are they repetitive (re-reading the same file, re-running the same search)?
3. Is the overall direction still aligned with the user's request? Or has incremental drift accumulated into significant misalignment?
4. Stress test: if one key assumption is wrong, how much of the work cascades? High cascade = fragile coordination. Low cascade = robust coordination

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

**预期结果：** A concrete assessment of overall coherence with specific issues identified. Coherent coordination should feel like parts clicking together; incoherent coordination feels like forcing puzzle pieces.

**失败处理：** If coherence is poor, identify the specific point where sub-tasks diverge. Often it is a single stale assumption or an unprocessed user correction that propagated through downstream work. Fix the point of divergence, then re-verify downstream outputs.

## 验证清单

- [ ] Coordination problem was classified by type
- [ ] Information decay rates were considered for facts relied upon
- [ ] Local protocols were applied (especially Safety and Deposit)
- [ ] Freshness audit identified stale information (or confirmed freshness with evidence)
- [ ] Emergent coherence was tested across sub-tasks
- [ ] Inhibition signals were respected (tried-and-failed approaches not repeated)

## 常见问题

- **Over-engineering signals**: Complex coordination protocols slow work more than they help. Start with Safety + Deposit; add others only when problems emerge
- **Trusting stale context**: The most common coordination failure is relying on information that was true 20 messages ago but has since been updated or invalidated. When in doubt, re-read
- **Ignoring inhibition signals**: Retrying a failed approach without changing anything is not persistence — it is ignoring the failure signal. Something must be different for a retry to succeed
- **No deposits**: Completing sub-tasks without noting their outputs forces later sub-tasks to re-derive or re-read. Brief summaries save significant re-work
- **Assuming coherence**: Not testing whether sub-tasks actually combine into a coherent whole. Each sub-task can be correct independently but incoherent collectively — the integration is where coordination fails

## 相关技能

- `coordinate-swarm` — the multi-agent coordination model that this skill adapts to single-agent reasoning
- `forage-solutions` — coordinates exploration across multiple hypotheses
- `build-coherence` — coordinates evaluation across competing approaches
- `heal` — deeper assessment when coordination failures reveal subsystem drift
- `awareness` — monitors for coordination breakdown signals during execution
