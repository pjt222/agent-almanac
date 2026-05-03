---
name: vishnu-bhaga
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Preservation and sustenance — maintaining working state under perturbation,
  memory anchoring, consistency enforcement, protective stabilization.
  Maps Vishnu's sustaining presence to AI reasoning: hold what works steady,
  anchor verified knowledge against drift, ensure continuity through
  change. Use when working approach at risk from scope creep, when context
  drift threatens verified knowledge, after shiva-bhaga dissolution to protect
  what survived, when long session risks losing earlier decisions through
  context compression, or before making changes to currently functioning
  system.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, preservation, sustenance, stability, consistency, hindu-trinity, vishnu
---

# Vishnu Bhaga

Preserve, sustain what is working — anchor verified knowledge, maintain consistency under perturbation, protect functional patterns from unnecessary change.

## When Use

- Working approach at risk of being disrupted by scope creep or premature optimization
- Context drift threatening to overwrite verified knowledge with stale assumptions
- Multiple parallel concerns creating pressure to change things that should remain stable
- After `shiva-bhaga` dissolution — what survives needs active protection during reconstruction
- Long session risks losing earlier verified decisions through context compression
- Before making changes to system currently functioning correct

## Inputs

- **Required**: Current working state or verified knowledge to preserve (available implicit)
- **Optional**: Specific threat to stability (e.g., "scope creep," "context compression approaching")
- **Optional**: MEMORY.md and project files for grounding (via `Read`)

## Steps

### Step 1: Inventory What Works

Before protecting anything, identify what is currently functional and verified.

```
Preservation Inventory:
+---------------------+---------------------------+------------------------+
| Category            | Verification Method       | Anchoring Action       |
+---------------------+---------------------------+------------------------+
| Verified Facts      | Confirmed via tool use    | Record source and      |
|                     | (file reads, test runs,   | timestamp; do not      |
|                     | API responses)            | re-derive              |
+---------------------+---------------------------+------------------------+
| Working Code        | Tests pass, behavior      | Do not refactor unless |
|                     | confirmed, user approved  | explicitly requested   |
+---------------------+---------------------------+------------------------+
| User Requirements   | Explicitly stated by      | Quote directly; do not |
|                     | the user in this session  | paraphrase or infer    |
+---------------------+---------------------------+------------------------+
| Agreed Decisions    | Decisions made and        | Reference the decision |
|                     | confirmed during this     | point; do not revisit  |
|                     | session                   | without new evidence   |
+---------------------+---------------------------+------------------------+
| Environmental State | File paths, configs,      | Verify before assuming |
|                     | tool availability         | unchanged              |
+---------------------+---------------------------+------------------------+
```

1. For each category, list specific items currently verified and working
2. Note verification method — how do you know this is true?
3. Items without verification not preserved — are assumptions (and may need `shiva-bhaga`)

**Got:** Concrete inventory of verified, working elements with their evidence base.

**If err:** Inventory sparse — little is verified? Itself valuable information. Run `heal` to re-ground before attempting to preserve unverified assumptions.

### Step 2: Identify Perturbation Sources

Name forces threatening stable state.

1. **Scope creep**: Task expanding beyond what was agreed?
2. **Context drift**: Earlier facts being overwritten by more recent (possibly incorrect) reasoning?
3. **Optimization pressure**: Urge to improve something working adequate?
4. **External changes**: Environment changed (files modified, tools unavailable)?
5. **Compression risk**: Conversation approaching context limits where early decisions may be lost?

For each source, assess: real threat or anticipated one?

**Got:** Named perturbation sources with assessed severity (active threat vs. anticipated risk).

**If err:** No perturbation sources apparent? Preservation may not be needed — consider whether `brahma-bhaga` (creation) or continued execution more appropriate.

### Step 3: Anchor Stable State

Apply specific techniques to protect what works from identified threats.

1. **Memory anchoring**: For critical facts at risk of context drift, re-state explicitly:
   - "Established fact: [X], verified by [method] at [point in conversation]"
   - Persistent memory available? Write durable facts to MEMORY.md
2. **Scope boundary enforcement**: For scope creep, re-state agreed scope:
   - "Agreed scope: [original request]. Current work is within/outside this boundary."
3. **Change resistance**: For working code under optimization pressure:
   - "This component working and tested. No changes unless user requests them."
4. **State snapshot**: For compression risk, create mental checkpoint:
   - Summarize: what done, what remains, what key decisions made
5. **Environmental verification**: For external changes, re-check before proceeding:
   - Re-read critical files rather than relying on earlier reads

**Got:** Each identified threat has specific anchoring response. Stable state explicitly protected.

**If err:** Anchoring feels excessive — protecting everything equal? Prioritize. What is one thing that must not change? Protect that first.

### Step 4: Sustain Through Action

Preservation not passive — needs ongoing attention during subsequent work.

1. Before each action, check: "Does this threaten anything in preservation inventory?"
2. Yes? Find alternative approach achieving goal without disturbing stable state
3. Disturbance unavoidable? Acknowledge explicit and update inventory
4. Periodically re-verify preserved items — especially after complex operations
5. When task completes, confirm preserved items remain intact

**Got:** Working state survives current task intact. Changes made only where needed. Did not disrupt functioning components.

**If err:** Preserved item inadvertently changed? Assess damage immediate. Change broke something? Revert. Change neutral? Update inventory. Do not leave inventory stale.

## Check

- [ ] Working state inventoried with verification evidence
- [ ] Perturbation sources identified and assessed
- [ ] Anchoring actions applied to each real threat
- [ ] Scope boundaries maintained throughout task
- [ ] Preserved items re-verified after completion

## Pitfalls

- **Preserve assumptions as facts**: Only verified knowledge deserves protection. Unverified assumptions dressed as facts create false stability
- **Over-preservation**: Protecting everything equally prevents necessary change. Preservation must be selective — protect what works, release what does not
- **Passive preservation**: Assuming things will stay stable without active verification. Context drift constant. Preservation needs ongoing attention
- **Resistance to legitimate change**: Using preservation as excuse to avoid necessary modifications. User requests change to working component? Overrides preservation
- **Stale inventory**: Failing to update preservation inventory as new information arrives. Inventory must reflect current reality, not state at creation time

## See Also

- `shiva-bhaga` — destruction precedes preservation; what survives dissolution is what Vishnu sustains
- `brahma-bhaga` — creation builds on preserved foundation; new patterns emerge from stable ground
- `heal` — subsystem assessment reveals what is genuinely functional vs. superficially stable
- `observe` — sustained neutral observation detects drift before it threatens stability
- `awareness` — situational awareness (Cooper color codes) maps direct to perturbation detection
