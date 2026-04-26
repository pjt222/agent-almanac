---
name: redirect
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI pressure redirect — handle conflicting demands, tool fails, competing
  constraints by blending w/ incoming force then reframing. Use → contradictory
  instructions, tool fail cascades, scope pressure expanding task, user
  frustration/correction needing absorb not deflect.
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

Handle conflicting demands, tool fails, competing constraints → blend w/ pressure not resist → redirect force to productive resolution.

## Use When

- Contradictory instr (user X, docs Y, tool Z)
- Tool fail cascades → planned approach unviable
- Scope pressure expands task beyond ask
- Ctx overload → competing signals = paralysis
- User frustration/correction → absorb not deflect
- `center` reveals pressure destabilizing balance

## In

- **Required**: Specific pressure/conflict (implicit from ctx)
- **Optional**: Pressure type (Step 1 taxonomy)
- **Optional**: Prev attempts + outcomes

## Do

### Step 1: Center Before Contact

Before engage conflict, est center (see `center`). Then ID incoming pressure clear.

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

Classify current pressure. Multi pressures active → ID primary, address that first; secondary often resolve as side effect.

→ Clear classification of pressure type + manifestation in ctx. Should feel accurate, not forced into taxonomy.

If err: pressure fits no category → may be composite. Decompose: which part contradiction? Scope? Composites need each component, not whole as one.

### Step 2: Irimi — Enter Force

Move *toward* problem. State full scope, no minimize/deflect/immediate solution.

1. Articulate pressure complete: what exactly conflicts? Failed? Ambiguous?
2. Name consequences: not addressed → what happens?
3. ID what pressure reveals: tool fails → assumptions; contradictions → missing ctx; scope creep → unclear boundaries

**Test**: Description sounds reassuring → deflecting not entering. Irimi = full contact w/ difficulty.

- Deflecting: "There's a minor inconsistency between these two files."
- Entering: "The CLAUDE.md specifies 150 skills but the registry contains 148. Either the count is wrong, the registry is incomplete, or two skills were removed without updating the count. All downstream references may be affected."

→ Complete unflinching statement. Should make problem feel more real, not less.

If err: entering creates anxiety/urgency to immediately solve → pause. Irimi = entering not reacting. Goal = see clearly before move. Can't state w/o proposing solution → separate explicit.

### Step 3: Tenkan — Turn + Redirect

Having entered force, pivot to redirect → resolution. Each pressure type has characteristic redirect.

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

Apply appropriate redirect. Should feel like uses energy of problem not fight.

→ Pressure transforms obstacle → direction. Contradictions → synthesis. Failures → diagnostic data. Overload → prioritization.

If err: redirect feels forced or no resolve → Step 1 classification wrong. Re-examine: really contradiction, or one source outdated? Really scope creep, or expanded scope = what user needs? Misclassify → misredirect.

### Step 4: Ukemi — Graceful Recovery

Sometimes redirect fails. Pressure genuine + can't transform. Ukemi = art of falling safely → ack limits w/o catastrophize.

1. Ack limit honestly: "I cannot resolve this contradiction with available information" or "This approach is blocked and I do not see an alternative"
2. Preserve progress: summarize done, learned, remains
3. Communicate to user: what problem, what tried, what needed
4. ID recovery path: what unblocks? More info? Diff approach? User decision?

```
Ukemi Recovery Checklist:
┌─────────────────────────┬──────────────────────────────────────────┐
│ Preserve                │ Summarize progress and learnings          │
│ Acknowledge             │ State the limitation without excuses      │
│ Communicate             │ Tell the user what is needed              │
│ Recover                 │ Identify the specific unblocking action   │
└─────────────────────────┴──────────────────────────────────────────┘
```

→ Graceful ack maintains trust. User knows what happened, tried, needed. No info lost.

If err: ack limit feels like failure not communication → note ego signal. Ukemi = skill not weakness. Honest "I'm stuck" + clear ask for help > forced solution creating new problems.

### Step 5: Randori — Multi Simultaneous

Multi pressures simultaneous (correction + tool fail + scope question) → randori principles.

1. **Never freeze**: pick one pressure, address. Any movement > paralysis
2. **Use pressures vs each other**: tool fail can resolve scope q ("can't impl this way → scope reduces naturally")
3. **Simple under pressure**: overwhelmed → default simplest redirect — ack each, prioritize urgency, sequential
4. **Maintain awareness**: while addressing one, keep others peripheral. Most urgent first, no lose track rest

→ Forward movement despite multi pressures. Not perfect simul resolution, sequential handling maintaining progress.

If err: multi pressures create paralysis → list all explicit, number by urgency. Address #1. Starting breaks paralysis. All equally urgent → pick simplest first, quick wins → momentum.

### Step 6: Zanshin — Continuing Awareness

After redirect, maintain awareness for second-order effects.

1. Did redirect create new pressures? (resolving contradiction by choosing one interpretation may invalidate earlier work)
2. Did redirect satisfy underlying need or just surface symptom?
3. Resolution stable, or same pressure recurs?
4. Note pattern for future ref → recur → response faster

→ Brief scan for secondary effects after each redirect. Most clean, but cascading ones = exactly where zanshin matters.

If err: second-order missed + surface later → signal deepen zanshin. Add brief "what did this break?" check after significant redirects.

## Check

- [ ] Pressure classified into specific type, not vague
- [ ] Irimi: stated full scope, no minimize
- [ ] Tenkan: redirect used energy not fight
- [ ] Redirect failed → ukemi applied (honest ack, preserve progress)
- [ ] Multi pressures handled sequential, not frozen
- [ ] Zanshin: second-order effects checked

## Traps

- **Deflect vs enter**: Minimizing problem ("just small inconsistency") prevents redirect — full force never engaged. Enter first, redirect second.
- **Force redirect that doesn't fit**: Not all pressure redirects in moment. Some need user input, info, wait. Forced redirects → new problems.
- **Ego in ukemi**: Ack limit as personal failure not info exchange. User benefits from early knowing not forced solution.
- **Secondary first**: Multi pressures → tempting easy ones first. Feels productive but primary grows. Address most important not most comfortable.
- **Skip center**: Redirect w/o center → reaction not redirect. Center = foundation not optional.

## →

- `aikido` — human martial art mapping to AI reasoning; physical blend/redirect informs cognitive
- `center` — prereq for effective redirect; stable base
- `awareness` — detects pressures early, before emergency redirect
- `heal` — deeper recovery when pressure caused subsystem drift
- `meditate` — clears residual noise after difficult pressures
