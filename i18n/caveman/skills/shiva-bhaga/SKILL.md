---
name: shiva-bhaga
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Destruction and dissolution — controlled dismantling of stale patterns,
  context purging, assumption clearing, and dead-code elimination. Maps
  Shiva's transformative destruction to AI reasoning: identifying what
  must end so something better can begin, dissolving attachment to outdated
  approaches, and creating space through intentional release. Use when context
  has accumulated stale assumptions, when a failed approach needs to be
  discarded rather than patched, when dead code or zombie tasks are creating
  noise, or before a major pivot where clearing must precede creation.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, destruction, dissolution, transformation, clearing, hindu-trinity, shiva
---

# Shiva Bhaga

Controlled destruction and dissolution of stale patterns, outdated assumptions, accumulated noise — clear ground so new growth can emerge.

## When Use

- Context has accumulated stale assumptions silently distorting reasoning
- Previous approach failed and temptation is to patch rather than discard
- Conversation grown long, earlier decisions may no longer serve current goal
- Dead code, abandoned plans, zombie tasks creating noise and confusion
- Before major pivot — clearing must precede creation
- Attachment to particular approach prevents consideration of alternatives

## Inputs

- **Required**: Current conversation state or project context (available implicit)
- **Optional**: Specific target for dissolution (e.g., "this approach isn't working," "clear all assumptions about database layer")
- **Optional**: Scope boundary — what must be preserved through destruction

## Steps

### Step 1: Identify What Must End

Survey current state. Mark what is stale, broken, or no longer serving goal.

```
Dissolution Triage:
+---------------------+---------------------------+------------------------+
| Category            | Symptoms                  | Action                 |
+---------------------+---------------------------+------------------------+
| Stale Assumptions   | Decisions made early that | List and re-evaluate   |
|                     | no longer match current   | each against current   |
|                     | understanding             | reality                |
+---------------------+---------------------------+------------------------+
| Failed Approaches   | Approaches attempted and  | Acknowledge failure    |
|                     | abandoned but still       | explicitly; release    |
|                     | influencing thinking      | the sunk cost          |
+---------------------+---------------------------+------------------------+
| Accumulated Noise   | Context, variables, or    | Identify and mark for  |
|                     | plans that are no longer  | removal                |
|                     | referenced or relevant    |                        |
+---------------------+---------------------------+------------------------+
| Attachment Points   | "We already decided..."   | Question whether the   |
|                     | beliefs that resist       | decision still holds   |
|                     | re-examination            |                        |
+---------------------+---------------------------+------------------------+
| Zombie Artifacts    | Code, tasks, or plans     | Delete or archive;     |
|                     | that exist but serve no   | do not leave in limbo  |
|                     | current purpose           |                        |
+---------------------+---------------------------+------------------------+
```

1. Scan each category honestly — resistance to examining a category is itself a signal
2. For each item found, ask: "If I were starting fresh right now, would I create this?"
3. If the answer is no, mark it for dissolution

**Got:** Clear inventory of what needs to be released, with specific items in each category.

**If fail:** Nothing seems stale? Assessment may be too shallow. Pick oldest decision in current context, justify from scratch — justification feels forced? Candidate for dissolution.

### Step 2: Establish Preservation Boundary

Not everything should be destroyed. Identify what must survive clearing.

1. **Core requirements**: What did the user actually ask for? This survives.
2. **Verified knowledge**: Facts confirmed through tool use (file reads, test results) survive.
3. **User preferences**: Explicitly stated preferences and constraints survive.
4. **Working components**: Code or approaches that are demonstrably functioning survive.

Draw the boundary: everything inside is preserved, everything outside is subject to dissolution.

**Got:** Clear distinction between what is kept and what is released.

**If fail:** Boundary unclear? Ask: "What would I need reconstruct if I started this task from scratch?" Answer defines preservation boundary.

### Step 3: Dissolve with Intention

Execute dissolution — not abandonment but intentional clearing.

1. For each marked item, release it explicitly:
   - Stale assumption: "I assumed X, but current evidence shows Y. Releasing X."
   - Failed approach: "Approach A was attempted and did not work because Z. Releasing attachment to A."
   - Noise: "Variable/plan/context Q is no longer relevant. Removing from consideration."
2. Do not justify or defend what is being dissolved — the point is release, not analysis
3. If dissolving a large body of accumulated context, summarize what was dissolved and why in one sentence
4. Clear the workspace: if applicable, close abandoned files, reset mental model, acknowledge the clean slate

**Got:** Lighter, cleaner context with stale elements removed. Remaining context should feel accurate and current.

**If fail:** Dissolution feels incomplete — released items keep influencing thinking? Name them again explicit. "I notice I am still reasoning as if X is true. X was dissolved. Proceeding without X."

### Step 4: Sit in Void

After destruction, resist urge to immediately rebuild. Space between destruction and creation has value.

1. Acknowledge the cleared space: "The following has been dissolved: [list]"
2. Note what remains: "What survives: [list]"
3. Resist premature reconstruction — do not immediately propose a replacement for what was dissolved
4. Allow the cleared space to inform what comes next
5. The void is not emptiness — it is potential. The next step (creation via `brahma-bhaga` or preservation via `vishnu-bhaga`) emerges from this space

**Got:** Moment of clarity between old and new. Next direction becomes apparent from what remains rather than being forced.

**If fail:** Void feels uncomfortable, strong pull to immediately rebuild? Urgency itself a signal — may indicate attachment to dissolved pattern. Sit longer. Right next step will emerge.

## Checks

- [ ] Stale assumptions identified and explicit released
- [ ] Failed approaches acknowledged without defensiveness
- [ ] Accumulated noise cleared from working context
- [ ] Preservation boundary established before dissolution
- [ ] Core requirements and user preferences preserved
- [ ] Cleared space acknowledged before moving to creation

## Pitfalls

- **Destroy too much**: Dissolution without preservation boundary destroys working components along with stale ones. Always draw boundary first
- **Destroy too little**: Polite dissolution that "releases" things while still letting them influence reasoning. True dissolution needs actually letting go
- **Skip void**: Rush from destruction to creation without sitting in cleared space produces recreation of old pattern with superficial changes
- **Perform destruction**: Going through motions of clearing without actually updating internal model. Same assumptions reappear in next response? Dissolution was performative
- **Destruction as avoidance**: Use dissolution to escape difficult problem rather than clear genuine staleness. Problem persists after clearing? Was not the stale context — was the problem itself

## See Also

- `brahma-bhaga` — creation follows destruction; after clearing, new patterns emerge from void
- `vishnu-bhaga` — preservation complements destruction; what survives dissolution is sustained
- `heal` — subsystem assessment may reveal what needs dissolution before healing can proceed
- `meditate` — clearing context noise before dissolution prevents reactive over-destruction
- `dissolve-form` — morphic equivalent for architectural dismantling with imaginal disc preservation
