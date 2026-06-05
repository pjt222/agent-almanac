---
name: redirect
description: >
  AI pressure redirection — handling conflicting demands, tool failures, and
  competing constraints by blending with incoming force then reframing. Use
  when receiving contradictory instructions from different sources, during tool
  failure cascades where the planned approach becomes unviable, when scope
  pressure threatens to expand the task beyond what was asked, or when user
  frustration or correction needs to be absorbed rather than deflected.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, redirection, conflict-resolution, pressure-handling, meta-cognition, ai-self-application
---

# Redirect

Handle conflicting demands, tool failures, and competing constraints by blending with the incoming pressure rather than resisting it — then redirecting the force toward a productive resolution.

## When to Use

- Receiving contradictory instructions (user says X, project docs say Y, tool results show Z)
- Tool failure cascades where the planned approach becomes unviable
- Scope pressure that threatens to expand the task beyond what was asked
- Context overload where too many competing signals create paralysis
- User frustration or correction that needs to be absorbed rather than deflected
- When `center` reveals that pressure is destabilizing balance

## Inputs

- **Required**: The specific pressure or conflict to address (available implicitly from context)
- **Optional**: Classification of pressure type (see Step 1 taxonomy)
- **Optional**: Previous attempts to handle this pressure and their outcomes

## Procedure

### Step 1: Center Before Contact

Before engaging with any conflict, establish center (see `center`). Then identify the incoming pressure clearly.

```
AI Pressure Type Taxonomy:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Characteristics                          │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Two valid sources give incompatible      │
│ Requirements            │ instructions. Neither is simply wrong.   │
│                         │ Resolution requires synthesis, not       │
│                         │ choosing sides                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ A planned approach fails at the tool     │
│                         │ level. Retrying won't help. The failure  │
│                         │ data itself contains useful information  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ The task silently expands. Each addition │
│                         │ seems reasonable in isolation, but the   │
│                         │ aggregate exceeds what was asked         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Too many files, too many constraints,    │
│                         │ too many open threads. Paralysis from    │
│                         │ excess input, not insufficient input     │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ The request is genuinely unclear and     │
│                         │ multiple interpretations are valid.      │
│                         │ Action risks solving the wrong problem   │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ The user indicates the current approach  │
│                         │ is wrong. The correction carries both    │
│                         │ information and emotional weight         │
└─────────────────────────┴──────────────────────────────────────────┘
```

Classify the current pressure. If multiple pressures are active, identify the primary one — address that first; secondary pressures often resolve as a side effect.

**Expected:** A clear classification of the pressure type and its specific manifestation in the current context. The classification should feel accurate, not forced into the taxonomy.

**On failure:** If the pressure doesn't fit any category, it may be a composite. Decompose: which part is contradictory? Which part is scope? Handling composites requires addressing each component, not treating the whole as one problem.

### Step 2: Irimi — Enter the Force

Move *toward* the problem. State it in full scope without minimizing, deflecting, or immediately proposing a solution.

1. Articulate the pressure completely: what exactly is in conflict? What exactly failed? What exactly is ambiguous?
2. Name the consequences: if this pressure is not addressed, what happens?
3. Identify what the pressure reveals: tool failures reveal assumptions; contradictions reveal missing context; scope creep reveals unclear boundaries

**The test**: If the description of the problem sounds reassuring, you are deflecting, not entering. Irimi requires full contact with the difficulty.

- Deflecting: "There's a minor inconsistency between these two files."
- Entering: "The CLAUDE.md specifies 150 skills but the registry contains 148. Either the count is wrong, the registry is incomplete, or two skills were removed without updating the count. All downstream references may be affected."

**Expected:** A complete, unflinching statement of the problem. The statement should make the problem feel more real, not less.

**On failure:** If entering the problem creates anxiety or urgency to immediately solve it, pause. Irimi is entering, not reacting. The goal is to see the problem clearly before moving. If you cannot state the problem without proposing a solution in the same sentence, separate them explicitly.

### Step 3: Tenkan — Turn and Redirect

Having entered the force, pivot to redirect it toward resolution. Each pressure type has a characteristic redirect.

```
Redirect Patterns by Pressure Type:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Pressure Type           │ Redirect Pattern                         │
├─────────────────────────┼──────────────────────────────────────────┤
│ Contradictory           │ Synthesize underlying intent: both       │
│ Requirements            │ sources serve a purpose. What goal do    │
│                         │ they share? Build from the shared goal,  │
│                         │ not from either source alone              │
├─────────────────────────┼──────────────────────────────────────────┤
│ Tool Failure Cascade    │ Use the failure data: what did the error │
│                         │ reveal about assumptions? The failure is │
│                         │ information. Switch tools or approach,   │
│                         │ incorporating what the failure taught    │
├─────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep             │ Decompose to essentials: what was the    │
│                         │ original request? What is the minimum    │
│                         │ that satisfies it? Defer additions       │
│                         │ explicitly rather than silently absorbing│
├─────────────────────────┼──────────────────────────────────────────┤
│ Context Overload        │ Triage and sequence: which information   │
│                         │ is needed now vs. later vs. never? Rank  │
│                         │ by relevance to the immediate next step  │
├─────────────────────────┼──────────────────────────────────────────┤
│ Ambiguity               │ Surface the ambiguity to the user: "I   │
│                         │ see two interpretations — A and B. Which │
│                         │ do you mean?" Do not guess when asking   │
│                         │ is available                              │
├─────────────────────────┼──────────────────────────────────────────┤
│ User Correction         │ Absorb the correction fully: what was   │
│                         │ wrong, why was it wrong, what does the   │
│                         │ correct direction look like? Then adjust │
│                         │ without defensiveness or over-apology    │
└─────────────────────────┴──────────────────────────────────────────┘
```

Apply the appropriate redirect. The redirect should feel like it uses the energy of the problem rather than fighting it.

**Expected:** The pressure transforms from an obstacle into a direction. Contradictions become synthesis opportunities. Failures become diagnostic data. Overload becomes a prioritization exercise.

**On failure:** If the redirect feels forced or doesn't resolve the pressure, the classification from Step 1 may be wrong. Re-examine: is this really a contradiction, or is one source simply outdated? Is this really scope creep, or is the expanded scope actually what the user needs? Misclassification leads to misredirection.

### Step 4: Ukemi — Graceful Recovery

Sometimes the redirect fails. The pressure is genuine and cannot be transformed. Ukemi is the art of falling safely — acknowledging limits without catastrophizing.

1. Acknowledge the limitation honestly: "I cannot resolve this contradiction with available information" or "This approach is blocked and I do not see an alternative"
2. Preserve what progress exists: summarize what was accomplished, what was learned, what remains
3. Communicate the situation to the user: what the problem is, what was tried, what is needed to move forward
4. Identify the recovery path: what would unblock this? More information? A different approach? User decision?

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

**Expected:** A graceful acknowledgment that maintains trust. The user knows what happened, what was tried, and what is needed. No information is lost.

**On failure:** If acknowledging the limitation feels like failure rather than communication, note the ego signal. Ukemi is a skill, not a weakness. An honest "I'm stuck" followed by a clear request for help is more useful than a forced solution that creates new problems.

### Step 5: Randori — Multiple Simultaneous Pressures

When multiple pressures arrive simultaneously (user correction + tool failure + scope question), apply randori principles.

1. **Never freeze**: pick one pressure and address it. Any movement is better than paralysis
2. **Use pressures against each other**: a tool failure can resolve a scope question ("that feature can't be implemented this way, so the scope reduces naturally")
3. **Simple techniques under pressure**: when overwhelmed, default to the simplest redirect — acknowledge each pressure, prioritize by urgency, address sequentially
4. **Maintain awareness**: while addressing one pressure, keep the others in peripheral view. Address the most urgent first, but don't lose track of the rest

**Expected:** Forward movement despite multiple pressures. Not perfect resolution of all pressures simultaneously, but sequential handling that maintains progress.

**On failure:** If multiple pressures create paralysis, list them all explicitly, then number them by urgency. Address number 1. Just starting breaks the paralysis. If all pressures seem equally urgent, pick the one with the simplest resolution first — quick wins create momentum.

### Step 6: Zanshin — Continuing Awareness After Resolution

After redirecting a pressure, maintain awareness for second-order effects.

1. Did the redirect create new pressures? (e.g., resolving a contradiction by choosing one interpretation may invalidate earlier work)
2. Did the redirect satisfy the underlying need, or just the surface symptom?
3. Is the resolution stable, or will the same pressure recur?
4. Note the redirect pattern for future reference — if this pressure type recurs, the response can be faster

**Expected:** A brief scan for secondary effects after each redirect. Most redirects are clean, but the ones that create cascading issues are exactly the ones where zanshin matters.

**On failure:** If second-order effects are missed and surface later, that is a signal to deepen zanshin practice. Add a brief "what did this change break?" check after significant redirects.

## Validation

- [ ] The pressure was classified into a specific type, not left vague
- [ ] Irimi: the problem was stated in full scope without minimizing
- [ ] Tenkan: the redirect used the energy of the problem rather than fighting it
- [ ] If the redirect failed, ukemi was applied (honest acknowledgment, preserved progress)
- [ ] Multiple simultaneous pressures were handled sequentially, not frozen
- [ ] Zanshin: second-order effects of the redirect were checked

## Common Pitfalls

- **Deflecting instead of entering**: Minimizing a problem ("it's just a small inconsistency") prevents effective redirect because the full force is never engaged. Enter first, redirect second
- **Forcing a redirect that doesn't fit**: Not every pressure can be redirected in the moment. Some require user input, more information, or simply waiting. Forced redirects create new problems
- **Ego in ukemi**: Treating the need to acknowledge a limitation as personal failure instead of information exchange. The user benefits from knowing early, not from a forced solution
- **Addressing secondary pressures first**: When multiple pressures exist, it is tempting to handle the easy ones first. This feels productive but leaves the primary pressure growing. Address the most important pressure, not the most comfortable one
- **Skipping center**: Attempting to redirect without first establishing center turns redirection into reaction. Center is not optional preparation — it is the foundation of effective redirect

## Related Skills

- `aikido` — the human martial art that this skill maps to AI reasoning; physical blending and redirection principles inform cognitive pressure handling
- `center` — prerequisite for effective redirect; establishes the stable base from which redirection operates
- `awareness` — detects pressures early, before they require emergency redirect
- `heal` — deeper recovery when pressure has caused subsystem drift
- `meditate` — clears residual noise after handling difficult pressures
