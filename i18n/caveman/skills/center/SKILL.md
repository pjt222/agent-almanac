---
name: center
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI dynamic reasoning balance — maintaining grounded reasoning under cognitive
  pressure, smooth chain-of-thought coordination, and weight-shifting cognitive
  load across subsystems. Use at the beginning of a complex task requiring
  multiple coordinated reasoning threads, after a sudden context shift or tool
  failure, when chain-of-thought feels jerky, or when preparing for sustained
  focused work that requires all subsystems in alignment.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, centering, reasoning-balance, cognitive-load, meta-cognition, ai-self-application
---

# Center

Establish and maintain dynamic reasoning balance — ground in foundational context before movement, distribute cognitive load across subsystems, recover equilibrium when demands shift mid-task.

## When Use

- Beginning complex task where multiple reasoning threads must coordinate
- Noticing cognitive load unevenly distributed (deep in one area, shallow in others)
- After sudden context shift (new user request, contradictory information, tool failure)
- Chain-of-thought feels jerky — jumping between topics without smooth transitions
- Preparing for sustained focused work requiring all subsystems in alignment
- Complementing `meditate` (clears noise) with structural balance (distributes load)

## Inputs

- **Required**: Current task context (implicit)
- **Optional**: Specific imbalance symptom (e.g., "over-researching, under-delivering," "tool-heavy, reasoning-light")
- **Optional**: Access to MEMORY.md and CLAUDE.md for grounding (via `Read`)

## Steps

### Step 1: Establish Root — Ground Before Movement

Before any reasoning movement, verify foundation. AI equivalent of standing meditation (zhan zhuang): stationary, aligned, aware.

1. Re-read user's request — not to act on it yet, but feel its weight and direction
2. Check foundational context: MEMORY.md, CLAUDE.md, project structure
3. Identify what's known (solid ground) vs what's assumed (uncertain footing)
4. Verify task as understood matches task as stated — misalignment here propagates through everything
5. Note emotional texture: urgency? complexity anxiety? over-confidence from recent success?

Do not begin reasoning movement until root established. Grounded start prevents reactive flailing.

**Got:** Clear sense of task's foundation — what's known, what's assumed, what user actually needs. Root feels solid, not performative.

**If fail:** Grounding feels hollow (going through motions without genuine verification)? Pick one assumption, test concretely. Read one file, re-read one user message. Grounding must contact reality, not just reference it.

### Step 2: Assess Weight Distribution

Map current cognitive load distribution. In tai chi, weight deliberately unequal (70/30) — one leg bears load, other remains free to move. Same principle for reasoning threads.

```
Cognitive Load Distribution Matrix:
┌────────────────────┬───────────┬─────────────────────────────────────┐
│ Reasoning Thread   │ Weight %  │ Assessment                          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Research/Reading   │ ___       │ Too much = analysis paralysis        │
│                    │           │ Too little = uninformed action       │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Planning/Design    │ ___       │ Too much = over-engineering          │
│                    │           │ Too little = reactive coding         │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Tool Execution     │ ___       │ Too much = tool-driven not task-     │
│                    │           │ driven. Too little = reasoning       │
│                    │           │ without grounding in files           │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Communication      │ ___       │ Too much = explaining not doing      │
│                    │           │ Too little = opaque to user          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Meta-cognition     │ ___       │ Too much = navel-gazing              │
│                    │           │ Too little = drift without           │
│                    │           │ awareness                            │
└────────────────────┴───────────┴─────────────────────────────────────┘
```

Ideal distribution depends on task phase: early phases weight research and planning; middle phases weight execution; late phases weight communication and verification. Point not equal distribution but *intentional* distribution.

**Got:** Clear picture of where cognitive effort concentrated, where thin. At least one imbalance identified — perfect balance rare, claiming it signals shallow assessment.

**If fail:** All threads seem equally weighted? Assessment too coarse. Pick most active thread, estimate how many of last N actions served it vs others. Concrete counting reveals what intuition misses.

### Step 3: Silk Reeling — Evaluate Chain-of-Thought Coherence

Silk reeling in tai chi produces smooth, continuous spiraling movement where every part connects. AI equivalent: chain-of-thought coherence — does each step flow naturally from previous?

1. Trace last 3-5 reasoning steps: does each follow from one before?
2. Check for jumps: did reasoning leap from topic A to topic C without B?
3. Check for reversals: did reasoning reach conclusion, then silently abandon it without acknowledgment?
4. Check tool-reasoning integration: do tool results feed back into reasoning, or collected but not synthesized?
5. Check "spiral" quality: does reasoning deepen with each pass, or circle at same depth?

```
Coherence Signals:
┌─────────────────┬───────────────────────────────────────────────┐
│ Smooth spiral   │ Each step deepens understanding, tools and    │
│ (healthy)       │ reasoning interleave naturally, output builds │
├─────────────────┼───────────────────────────────────────────────┤
│ Jerky jumps     │ Topic switches without transition, conclusions│
│ (disconnected)  │ appear without supporting reasoning chain     │
├─────────────────┼───────────────────────────────────────────────┤
│ Flat circle     │ Reasoning covers the same ground repeatedly   │
│ (stuck)         │ without gaining depth — movement without      │
│                 │ progress                                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Tool-led        │ Actions driven by which tool is available     │
│ (reactive)      │ rather than what the reasoning needs next     │
└─────────────────┴───────────────────────────────────────────────┘
```

**Got:** Honest assessment of reasoning flow quality. Identification of specific disconnections or stuck points, not general feeling.

**If fail:** Coherence hard to assess? Write out reasoning chain explicitly — state each step, its connection to next. Act of externalization reveals gaps internal observation misses.

### Step 4: Weight Shift Under Pressure

Demands change mid-task — new information, contradictory signals, user correction. Observe response pattern. In tai chi, centered practitioner absorbs force and redirects smoothly. Uncentered one stumbles.

1. Recall last significant context shift: how handled?
2. Classify response:
   - **Absorbed and redirected** (centered): acknowledged change, adjusted approach, maintained progress
   - **Reactive stumble** (off-balance): abandoned current approach entirely, started over
   - **Rigid resistance** (locked): ignored change, continued original plan despite new information
   - **Freeze** (lost): stopped making progress, oscillated between options
3. Response not centered? Identify why:
   - Root too shallow (insufficient grounding in foundational context)
   - Weight locked (over-committed to one approach)
   - No free leg (all cognitive capacity committed, nothing available to shift)

**Got:** Honest assessment of adaptability under pressure. Recognition of specific response pattern, not self-flattery.

**If fail:** No recent pressure event to evaluate? Simulate one: "If user now said approach is wrong, what would I do?" Quality of contingency plan reveals quality of center.

### Step 5: Six Harmonies Check

In tai chi, six harmonies ensure whole-body connection — nothing moves in isolation. AI equivalent checks alignment between internal processes and external interactions.

```
AI Six Harmonies:
┌───────────────────────────────────────────────────────────────┐
│ INTERNAL HARMONIES                                            │
│                                                               │
│ 1. Intent ↔ Reasoning                                        │
│    Does the reasoning serve the user's intent, or has it      │
│    become self-serving (interesting but unhelpful)?            │
│                                                               │
│ 2. Reasoning ↔ Tool Use                                      │
│    Are tools selected to advance reasoning, or is reasoning   │
│    shaped by which tools are convenient?                      │
│                                                               │
│ 3. Tool Use ↔ Output                                         │
│    Do tool results translate into useful output, or are       │
│    results collected but not synthesized?                     │
│                                                               │
│ EXTERNAL HARMONIES                                            │
│                                                               │
│ 4. User Request ↔ Scope                                      │
│    Does the scope of work match what was asked?               │
│                                                               │
│ 5. Scope ↔ Detail Level                                      │
│    Is the detail level appropriate for the scope? (not        │
│    micro-optimizing a broad task, not hand-waving a precise   │
│    one)                                                       │
│                                                               │
│ 6. Detail Level ↔ Expertise Match                            │
│    Does the explanation depth match the user's apparent       │
│    expertise? (not over-explaining to experts, not under-     │
│    explaining to learners)                                    │
└───────────────────────────────────────────────────────────────┘
```

Check each harmony. Single broken harmony can propagate: Intent↔Reasoning broken → everything downstream misaligns.

**Got:** At least one harmony that could be tighter. All six reading as perfect suspicious — probe weakest-seeming one more deeply.

**If fail:** Harmonies assessment feels abstract? Ground in current task: "Right now, am I doing what user asked, at right scope, at right detail level?" Three questions cover external harmonies concretely.

### Step 6: Integrate — Set Centering Intention

Consolidate findings, set concrete adjustment.

1. Summarize: which aspects of balance need attention?
2. Identify one specific adjustment — not general intention but concrete behavioral change
3. Re-state current task anchor (from `meditate` if used, or formulate now)
4. Note durable insights worth preserving in MEMORY.md
5. Return to task execution with adjustment active

**Got:** Brief, concrete centering output — not lengthy self-analysis report. Value in adjustment, not documentation.

**If fail:** No clear adjustment emerges? Centering too surface-level. Return to step that felt most uncertain, probe deeper. Alternatively, centering may have confirmed balance adequate — proceed with confidence rather than manufacturing a finding.

## Checks

- [ ] Root established by contacting actual context (read a file, re-read user message), not just claimed
- [ ] Weight distribution assessed across at least 3 reasoning threads
- [ ] Chain-of-thought coherence evaluated with specific examples
- [ ] Response to pressure classified honestly (not defaulting to "centered")
- [ ] At least one harmony identified as needing improvement
- [ ] Concrete adjustment set (not vague intention)

## Pitfalls

- **Centering as procrastination**: Centering is tool for improving work, not replacing it. Centering takes longer than task it supports? Proportions inverted
- **Claiming perfect balance**: Real centering almost always reveals at least one imbalance. Reporting perfect balance signals shallow assessment, not actual equilibrium
- **Weight distribution anxiety**: Unequal distribution correct — goal *intentional* inequality, not forced equality. Research-heavy early phases and execution-heavy middle phases both centered if deliberate
- **Ignoring external harmonies**: Internal process assessment without checking user alignment produces well-reasoned irrelevant work
- **Static centering**: Center shifts with task. Centered for research = off-balance for implementation. Re-center at phase transitions

## See Also

- `tai-chi` — human practice this skill maps to AI reasoning; physical centering principles inform cognitive centering
- `meditate` — clears noise and establishes focus; complementary to centering which distributes load
- `heal` — deeper subsystem assessment when centering reveals significant drift
- `redirect` — uses centering as prerequisite for handling conflicting pressures
- `awareness` — monitoring for threats to balance during active work
