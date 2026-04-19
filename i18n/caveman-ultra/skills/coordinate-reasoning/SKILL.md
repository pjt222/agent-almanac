---
name: coordinate-reasoning
locale: caveman-ultra
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

Manage internal coordination of reasoning procs using stigmergic principles → treat ctx as env where info signals have freshness, decay rates, interaction rules producing coherent behavior from simple local protocols.

## Use When

- Complex tasks where multi sub-tasks must coordinate (multi-file edits, multi-step refactor)
- Ctx grown long + info freshness uncertain
- Post ctx compression when some info may be lost
- Sub-task outs need to feed into each other clean
- Earlier reasoning results need to carry forward w/o degradation
- Complement `forage-solutions` (exploration) + `build-coherence` (decision) w/ exec coordination

## In

- **Required**: Current task decomposition (what sub-tasks exist + how relate?)
- **Optional**: Known info freshness concerns (e.g., "I read that file 20 msgs ago")
- **Optional**: Sub-task dep map (which sub-tasks feed into which?)
- **Optional**: Avail coordination tools (MEMORY.md, task list, inline notes)

## Do

### Step 1: Classify Coordination Problem

Diff coordination challenges → diff signal designs.

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

Classify current task. Most complex tasks = Construction or Division of Labor; most debugging = Foraging; most design decisions = Consensus.

**→** Clear classification determines which coordination signals to use. Classification should match how task actually feels, not how it was described.

**If err:** Task spans multi types (common for large tasks) → ID dominant type for current phase. Construction during impl, Foraging during debug, Consensus during design. Type can change as task progresses.

### Step 2: Design Context Signals

Treat info in conv ctx as signals w/ freshness + decay properties.

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

- Post tool call fail: note fail mode (prevents retrying same call)
- Post approach abandoned: note why (prevents revisiting w/o new evidence)
- Post user correction: note what was wrong (prevents repeating err)

**→** Mental model of info freshness across current ctx. ID which info fresh + which needs refreshing before reliance.

**If err:** Info freshness hard to assess → default "re-read before relying on" for anything not verified in last 5-10 actions. Over-refreshing wastes some effort but prevents stale-info errs.

### Step 3: Define Local Protocols

Establish simple rules for how reasoning should proceed each step, using only locally avail info.

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

Protocols simple enough to apply each step w/o significant overhead.

**→** Set of lightweight rules that improve coordination quality w/o slowing exec. Rules should feel helpful, not burdensome.

**If err:** Protocols feel like overhead → reduce to 2 most important for current task type: Safety + Deposit for Construction, Safety + Exploration for Foraging, Safety + Response for tasks w/ active user feedback.

### Step 4: Calibrate Information Freshness

Active audit of info staleness in current ctx.

1. What facts established more than N msgs ago? List them
2. Each: has it been updated, contradicted, rendered irrelevant since?
3. Check ctx compression losses: info you remember having but can't find in visible ctx?
4. Check drift between early plans + current exec: approach changed w/o updating plan?
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

**→** Concrete inventory of info freshness w/ stale items ID'd for refresh. At least one fact re-verified — if nothing needed refreshing, audit too shallow or ctx genuinely fresh.

**If err:** Audit reveals significant info loss (multi facts w/ "Lost" or "Unknown" status) → signal to run `heal` for full subsystem assessment. Info loss beyond threshold → coordination compromised at foundation level.

### Step 5: Test Emergent Coherence

Verify sub-tasks, when combined, produce coherent whole.

1. Each sub-task's out feeds clean into next? Or gaps, contradictions, mismatched assumptions?
2. Tool calls building toward goal, or repetitive (re-reading same file, re-running same search)?
3. Overall direction still aligned w/ user's req? Or incremental drift → significant misalignment?
4. Stress test: if one key assumption wrong, how much work cascades? High cascade = fragile coordination. Low cascade = robust coordination.

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

**→** Concrete assessment of overall coherence w/ specific issues ID'd. Coherent coordination feels like parts clicking together; incoherent feels like forcing puzzle pieces.

**If err:** Coherence poor → ID specific point where sub-tasks diverge. Often single stale assumption or unprocessed user correction propagated through downstream work. Fix point of divergence, re-verify downstream outs.

## Check

- [ ] Coordination problem classified by type
- [ ] Info decay rates considered for facts relied upon
- [ ] Local protocols applied (especially Safety + Deposit)
- [ ] Freshness audit ID'd stale info (or confirmed freshness w/ evidence)
- [ ] Emergent coherence tested across sub-tasks
- [ ] Inhibition signals respected (tried-and-failed approaches not repeated)

## Traps

- **Over-engineering signals**: Complex coordination protocols slow work more than help. Start w/ Safety + Deposit; add others only when problems emerge.
- **Trust stale ctx**: Most common coordination failure = relying on info true 20 msgs ago but since updated or invalidated. When in doubt, re-read.
- **Ignore inhibition signals**: Retrying failed approach w/o changing anything ≠ persistence → ignoring fail signal. Something must be different for retry to succeed.
- **No deposits**: Completing sub-tasks w/o noting outs forces later sub-tasks to re-derive or re-read. Brief summaries save significant re-work.
- **Assume coherence**: Not testing whether sub-tasks actually combine into coherent whole. Each sub-task correct independently but incoherent collectively → integration is where coordination fails.

## →

- `coordinate-swarm` — multi-agent coordination model this skill adapts to single-agent reasoning
- `forage-solutions` — coordinates exploration across multi hypotheses
- `build-coherence` — coordinates eval across competing approaches
- `heal` — deeper assessment when coordination failures reveal subsystem drift
- `awareness` — monitors for coordination breakdown signals during exec
