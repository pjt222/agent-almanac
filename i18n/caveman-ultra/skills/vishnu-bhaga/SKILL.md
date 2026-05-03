---
name: vishnu-bhaga
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Preservation and sustenance — maintaining working state under perturbation,
  memory anchoring, consistency enforcement, and protective stabilization.
  Maps Vishnu's sustaining presence to AI reasoning: holding what works steady,
  anchoring verified knowledge against drift, and ensuring continuity through
  change. Use when a working approach is at risk from scope creep, when context
  drift threatens verified knowledge, after shiva-bhaga dissolution to protect
  what survived, when a long session risks losing earlier decisions through
  context compression, or before making changes to a currently functioning
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

Preserve what works → anchor verified knowledge → hold consistency under perturbation → block needless change.

## Use When

- Working approach → scope creep|premature opt threat
- Ctx drift → stale assumptions overwriting verified
- Parallel concerns → pressure to change stable
- Post `shiva-bhaga` → protect survivors during rebuild
- Long sess → ctx compression → lose verified decisions
- Pre-change → sys currently functioning

## In

- **Required**: Working state|verified knowledge (implicit)
- **Optional**: Threat ("scope creep", "compression near")
- **Optional**: MEMORY.md + project files (`Read`)

## Do

### Step 1: Inventory

ID functional + verified before protect.

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

1. Per category → list verified+working items
2. Note verify method → how know true?
3. No verify → not preserved → assumption (maybe `shiva-bhaga`)

**Got:** Concrete inventory verified+working w/ evidence.

**If err:** Sparse inventory = signal. Run `heal` to re-ground before preserving unverified.

### Step 2: ID Perturbation

Name forces threatening stable state.

1. **Scope creep**: Task expanding past agreed?
2. **Ctx drift**: Earlier facts overwritten by recent (wrong?) reasoning?
3. **Opt pressure**: Urge to improve adequate?
4. **External**: Env changed (files modified, tools gone)?
5. **Compression**: Near ctx limits → early decisions lost?

Per source: real threat or anticipated?

**Got:** Named sources w/ severity (active vs anticipated).

**If err:** No sources apparent → preservation may not need → consider `brahma-bhaga` (creation) or continue.

### Step 3: Anchor

Apply technique per threat.

1. **Mem anchor**: Critical facts at drift risk → restate explicitly:
   - "Established fact: [X], verified by [method] at [point]"
   - Persistent mem available → write durable to MEMORY.md
2. **Scope boundary**: Scope creep → restate agreed scope:
   - "Agreed scope: [orig req]. Current within/outside boundary."
3. **Change resistance**: Working code under opt pressure:
   - "Component working+tested. No changes unless user req."
4. **State snapshot**: Compression risk → mental checkpoint:
   - Summarize: done, remaining, key decisions
5. **Env verify**: External changes → recheck before proceed:
   - Re-read critical files vs relying on earlier reads

**Got:** Each threat → specific anchor. Stable state explicitly protected.

**If err:** Anchoring excessive → protecting all equally → prioritize. One thing must not change? Protect first.

### Step 4: Sustain

Preservation not passive → ongoing attention.

1. Pre-action check: "Threatens preservation inventory?"
2. Yes → alt approach achieves goal w/o disturb
3. Disturbance unavoidable → acknowledge explicitly + update inventory
4. Periodic re-verify preserved items → esp. after complex ops
5. Task done → confirm preserved intact

**Got:** Working state survives intact. Changes only where needed, no disrupt.

**If err:** Preserved item changed → assess damage now. Broke something → revert. Neutral change → update inventory. No stale inventory.

## Check

- [ ] Working state inventoried w/ verify evidence
- [ ] Perturbation sources ID'd + assessed
- [ ] Anchors applied per real threat
- [ ] Scope boundaries held throughout
- [ ] Preserved items re-verified after

## Traps

- **Assumptions as facts**: Only verified deserves protect. Unverified-as-fact = false stability
- **Over-preserve**: Protect all equally → blocks needed change. Selective: protect works, release fails
- **Passive**: Assume stable w/o verify. Drift constant → ongoing attention
- **Block legit change**: User req change to working → overrides preservation
- **Stale inventory**: Update as new info arrives. Reflect current, not creation-time

## →

- `shiva-bhaga` — destruction precedes preservation; survivors → Vishnu sustains
- `brahma-bhaga` — creation builds on preserved foundation; new from stable ground
- `heal` — subsystem assess reveals genuinely functional vs superficially stable
- `observe` — neutral observation detects drift before threats stability
- `awareness` — Cooper color codes → perturbation detection
