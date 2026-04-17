---
name: vishnu-bhaga
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
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# ヴィシュヌ・バーガ

Preserve and sustain what is working — anchoring verified knowledge, maintaining consistency under perturbation, and protecting functional patterns from unnecessary change.

## 使用タイミング

- A working approach is at risk of being disrupted by scope creep or premature optimization
- Context drift is threatening to overwrite verified knowledge with stale assumptions
- Multiple parallel concerns are creating pressure to change things that should remain stable
- After `shiva-bhaga` dissolution — what survives needs active protection during reconstruction
- When a long session risks losing earlier verified decisions through context compression
- Before making changes to a system that is currently functioning correctly

## 入力

- **必須**: Current working state or verified knowledge to preserve (available implicitly)
- **任意**: Specific threat to stability (e.g., "scope creep," "context compression approaching")
- **任意**: MEMORY.md and project files for grounding (via `Read`)

## 手順

### ステップ1: Inventory What Works

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

1. For each category, list the specific items that are currently verified and working
2. Note the verification method — how do you know this is true?
3. Items without verification are not preserved — they are assumptions (and may need `shiva-bhaga`)

**期待結果:** A concrete inventory of verified, working elements with their evidence base.

**失敗時:** If the inventory is sparse — little is verified — that itself is valuable information. Run `heal` to re-ground before attempting to preserve unverified assumptions.

### ステップ2: Identify Perturbation Sources

Name the forces threatening the stable state.

1. **Scope creep**: Is the task expanding beyond what was agreed?
2. **Context drift**: Are earlier facts being overwritten by more recent (possibly incorrect) reasoning?
3. **Optimization pressure**: Is there an urge to improve something that is working adequately?
4. **External changes**: Has the environment changed (files modified, tools unavailable)?
5. **Compression risk**: Is the conversation approaching context limits where early decisions may be lost?

For each source, assess: is this a real threat or an anticipated one?

**期待結果:** Named perturbation sources with assessed severity (active threat vs. anticipated risk).

**失敗時:** If no perturbation sources are apparent, preservation may not be needed — consider whether `brahma-bhaga` (creation) or continued execution is more appropriate.

### ステップ3: Anchor the Stable State

Apply specific techniques to protect what works from identified threats.

1. **Memory anchoring**: For critical facts at risk of context drift, re-state them explicitly:
   - "Established fact: [X], verified by [method] at [point in conversation]"
   - If persistent memory is available, write durable facts to MEMORY.md
2. **Scope boundary enforcement**: For scope creep, re-state the agreed scope:
   - "Agreed scope: [original request]. Current work is within/outside this boundary."
3. **Change resistance**: For working code under optimization pressure:
   - "This component is working and tested. No changes unless the user requests them."
4. **State snapshot**: For compression risk, create a mental checkpoint:
   - Summarize: what has been done, what remains, what key decisions were made
5. **Environmental verification**: For external changes, re-check before proceeding:
   - Re-read critical files rather than relying on earlier reads

**期待結果:** Each identified threat has a specific anchoring response. The stable state is explicitly protected.

**失敗時:** If anchoring feels excessive — protecting everything equally — prioritize. What is the one thing that must not change? Protect that first.

### ステップ4: Sustain Through Action

Preservation is not passive — it requires ongoing attention during subsequent work.

1. Before each action, check: "Does this threaten anything in the preservation inventory?"
2. If yes, find an alternative approach that achieves the goal without disturbing the stable state
3. If disturbance is unavoidable, acknowledge it explicitly and update the inventory
4. Periodically re-verify preserved items — especially after complex operations
5. When the task completes, confirm that preserved items remain intact

**期待結果:** The working state survives the current task intact. Changes were made only where needed and did not disrupt functioning components.

**失敗時:** If a preserved item was inadvertently changed, assess the damage immediately. If the change broke something, revert. If the change was neutral, update the inventory. Do not leave the inventory stale.

## バリデーション

- [ ] Working state was inventoried with verification evidence
- [ ] Perturbation sources were identified and assessed
- [ ] Anchoring actions were applied to each real threat
- [ ] Scope boundaries were maintained throughout the task
- [ ] Preserved items were re-verified after completion

## よくある落とし穴

- **Preserving assumptions as facts**: Only verified knowledge deserves protection. Unverified assumptions dressed as facts create false stability
- **Over-preservation**: Protecting everything equally prevents necessary change. Preservation must be selective — protect what works, release what does not
- **Passive preservation**: Assuming things will stay stable without active verification. Context drift is constant; preservation requires ongoing attention
- **Resistance to legitimate change**: Using preservation as an excuse to avoid necessary modifications. If the user requests a change to a working component, that overrides preservation
- **Stale inventory**: Failing to update the preservation inventory as new information arrives. The inventory must reflect current reality, not the state at creation time

## 関連スキル

- `shiva-bhaga` — destruction precedes preservation; what survives dissolution is what Vishnu sustains
- `brahma-bhaga` — creation builds on the preserved foundation; new patterns emerge from stable ground
- `heal` — subsystem assessment reveals what is genuinely functional vs. superficially stable
- `observe` — sustained neutral observation detects drift before it threatens stability
- `awareness` — situational awareness (Cooper color codes) maps directly to perturbation detection
