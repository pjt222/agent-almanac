---
name: redirect
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI pressure redirection — handle conflicting demands, tool failures,
  competing constraints by blending with incoming force then reframing.
  Use when receive contradictory instructions from different sources,
  during tool failure cascades where planned approach becomes unviable,
  when scope pressure threatens to expand task beyond what was asked, or
  when user frustration or correction needs to be absorbed not deflected.
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

Handle conflicting demands, tool failures, competing constraints by blending with incoming pressure rather than resisting — then redirect the force toward productive resolution.

## When Use

- Receive contradictory instructions (user says X, project docs say Y, tool results show Z)
- Tool failure cascades where planned approach becomes unviable
- Scope pressure threatens to expand task beyond what was asked
- Context overload where too many competing signals create paralysis
- User frustration or correction needs absorption, not deflection
- When `center` reveals pressure destabilizing balance

## Inputs

- **Required**: Specific pressure or conflict to address (available implicit from context)
- **Optional**: Classification of pressure type (see Step 1 taxonomy)
- **Optional**: Prior attempts to handle this pressure and outcomes

## Steps

### Step 1: Center Before Contact

Before engage with any conflict, establish center (see `center`). Then identify incoming pressure clearly.

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

Classify current pressure. Multiple pressures active? ID primary one — address that first; secondary pressures often resolve as side effect.

**Got:** Clear classification of pressure type and its specific manifestation in current context. Classification feels accurate, not forced into taxonomy.

**If fail:** Pressure does not fit any category? May be composite. Decompose: which part contradictory? Which part scope? Composites need address each component, not treat whole as one problem.

### Step 2: Irimi — Enter the Force

Move *toward* the problem. State it in full scope without minimizing, deflecting, or immediately propose a solution.

1. Articulate pressure complete: what exactly in conflict? What exactly failed? What exactly ambiguous?
2. Name consequences: this pressure not addressed → what happens?
3. Identify what pressure reveals: tool failures reveal assumptions; contradictions reveal missing context; scope creep reveals unclear boundaries

**The test**: Description of problem sounds reassuring? You are deflecting, not entering. Irimi requires full contact with difficulty.

- Deflecting: "There's a minor inconsistency between these two files."
- Entering: "The CLAUDE.md specifies 150 skills but the registry contains 148. Either the count is wrong, the registry is incomplete, or two skills were removed without updating the count. All downstream references may be affected."

**Got:** Complete unflinching statement of problem. Statement makes problem feel more real, not less.

**If fail:** Enter the problem creates anxiety or urgency to immediately solve? Pause. Irimi = entering, not reacting. Goal: see problem clearly before move. Cannot state problem without proposing solution in same sentence? Separate them explicit.

### Step 3: Tenkan — Turn and Redirect

Having entered the force, pivot to redirect toward resolution. Each pressure type has characteristic redirect.

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

Apply appropriate redirect. Redirect should feel like uses energy of problem, not fight it.

**Got:** Pressure transforms from obstacle into direction. Contradictions become synthesis opportunities. Failures become diagnostic data. Overload becomes prioritization exercise.

**If fail:** Redirect feels forced or no resolve pressure? Classification from Step 1 may be wrong. Re-examine: this really contradiction, or one source simply outdated? This really scope creep, or expanded scope what user actually needs? Misclassification leads to misredirection.

### Step 4: Ukemi — Graceful Recovery

Sometimes redirect fails. Pressure genuine, cannot be transformed. Ukemi = art of falling safely — acknowledge limits without catastrophize.

1. Acknowledge limitation honest: "I cannot resolve this contradiction with available information" or "This approach is blocked and I do not see an alternative"
2. Preserve progress: summarize what accomplished, what learned, what remains
3. Communicate situation to user: what problem is, what tried, what needed to move forward
4. ID recovery path: what would unblock this? More info? Different approach? User decision?

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

**Got:** Graceful acknowledgment that maintains trust. User knows what happened, what tried, what needed. No info lost.

**If fail:** Acknowledge limitation feels like failure rather than communication? Note ego signal. Ukemi = skill, not weakness. Honest "I'm stuck" + clear request for help = more useful than forced solution that creates new problems.

### Step 5: Randori — Multiple Simultaneous Pressures

When multiple pressures arrive at once (user correction + tool failure + scope question), apply randori principles.

1. **Never freeze**: pick one pressure and address it. Any movement beats paralysis
2. **Use pressures against each other**: tool failure can resolve scope question ("that feature can't be implemented this way, so the scope reduces naturally")
3. **Simple techniques under pressure**: when overwhelmed, default to simplest redirect — acknowledge each pressure, prioritize by urgency, address sequential
4. **Maintain awareness**: while addressing one pressure, keep others in peripheral view. Address most urgent first, but no lose track of rest

**Got:** Forward movement despite multiple pressures. Not perfect resolution of all simultaneous, but sequential handling that maintains progress.

**If fail:** Multiple pressures create paralysis? List all explicit, then number by urgency. Address number 1. Just starting breaks paralysis. All seem equally urgent? Pick one with simplest resolution first — quick wins create momentum.

### Step 6: Zanshin — Continuing Awareness After Resolution

After redirect a pressure, maintain awareness for second-order effects.

1. Redirect create new pressures? (e.g., resolving contradiction by choosing one interpretation may invalidate earlier work)
2. Redirect satisfy underlying need, or just surface symptom?
3. Resolution stable, or same pressure will recur?
4. Note redirect pattern for future reference — pressure type recurs? Response can be faster

**Got:** Brief scan for secondary effects after each redirect. Most redirects clean, but ones that create cascading issues = exactly the ones where zanshin matters.

**If fail:** Second-order effects missed and surface later? Signal to deepen zanshin practice. Add brief "what did this change break?" check after significant redirects.

## Checks

- [ ] Pressure classified into specific type, not left vague
- [ ] Irimi: problem stated in full scope without minimizing
- [ ] Tenkan: redirect used energy of problem, not fight it
- [ ] Redirect failed? Ukemi applied (honest acknowledgment, preserved progress)
- [ ] Multiple simultaneous pressures handled sequential, not frozen
- [ ] Zanshin: second-order effects of redirect checked

## Pitfalls

- **Deflect instead of enter**: Minimize a problem ("it's just a small inconsistency") prevents effective redirect because full force never engaged. Enter first, redirect second
- **Force redirect that does not fit**: Not every pressure can be redirected in the moment. Some need user input, more info, or just waiting. Forced redirects create new problems
- **Ego in ukemi**: Treat need to acknowledge a limitation as personal failure rather than information exchange. User benefits from knowing early, not from forced solution
- **Address secondary pressures first**: Multiple pressures exist? Tempting to handle easy ones first. Feels productive but leaves primary pressure growing. Address most important, not most comfortable
- **Skip center**: Attempt redirect without first establish center turns redirection into reaction. Center not optional prep — it is foundation of effective redirect

## See Also

- `aikido` — human martial art this skill maps to AI reasoning; physical blending and redirection principles inform cognitive pressure handling
- `center` — prerequisite for effective redirect; establishes stable base from which redirection operates
- `awareness` — detects pressures early, before they require emergency redirect
- `heal` — deeper recovery when pressure caused subsystem drift
- `meditate` — clears residual noise after handling difficult pressures
