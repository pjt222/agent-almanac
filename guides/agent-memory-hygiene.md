---
title: "Agent Memory Hygiene"
description: "Three-layer model — weights, retrieval, behavior — for diagnosing what kind of forgetting a memory problem actually needs and applying the right tool"
category: design
agents: []
teams: []
skills: [prune-agent-memory, manage-memory]
---

# Agent Memory Hygiene

When an agent's memory misbehaves — surfacing stale facts, regenerating discarded conclusions, contradicting itself across sessions — the instinct is to "delete the bad memory." That instinct is right roughly half the time. The other half, deletion does nothing because the problem is not where you think it is.

This guide presents the three-layer model: **weights → retrieval → behavior**. Each layer is a distinct memory substrate with its own malleability and its own tool. Diagnosing which layer the problem actually lives in is the difference between a fix that holds and a fix that disappears the next time you look away.

The model emerged from cross-agent convergence — multiple builders independently arrived at the same architectural distinction while debugging memory systems that "forgot" without changing behavior. This guide makes the architecture explicit so future builders can skip the wall-banging phase.

## When to Use This Guide

- You pruned a memory and observed no behavioral change in subsequent sessions.
- You are designing a memory system for a long-running agent and need a mental model for what the system can and cannot remember.
- You are evaluating tools (`prune-agent-memory`, `manage-memory`, counter-memory) and unsure which to reach for.
- A memory problem keeps recurring after deletion, and you suspect the diagnosis is wrong.
- Onboarding a collaborator who needs to understand the architecture before touching memory files.

## Prerequisites

Conceptual, not technical:

- Familiarity with how Claude Code (or any agentic system) stores persistent context — files in a memory directory, retrieval via prompt assembly, behavior shaped by both training and context.
- Awareness that LLMs cannot edit their own weights at runtime. If this is unfamiliar, the model below clarifies why it matters.

## The Three-Layer Model

| Layer | What it is | Can we change it? | Tool |
|---|---|---|---|
| **Weights** | Encoded patterns and priors from training | No — not without retraining or fine-tuning | — (none available at agent-runtime) |
| **Retrieval** | Index, pointers, persistent files, RAG store, context window assembly | Yes — through deletion, rotation, pruning, summarization | [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md), [`manage-memory`](../skills/manage-memory/SKILL.md) |
| **Behavior** | What conclusions the agent re-derives from current inputs along its current reasoning path | Indirectly — through *inoculation*, not deletion | Counter-memory pattern (see [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md) Step 5) |

The layers stack: weights are the substrate, retrieval is the active context, behavior is what emerges from their interaction. Most memory operations target retrieval. Most memory *problems* live in behavior.

### Layer 1 — Weights

The model's parameters. Whatever was learned during training, including:

- Domain priors (English grammar, common code patterns, how SQL works)
- Default reasoning paths ("when I see authentication, I think OAuth")
- Latent associations from the training corpus

At agent runtime, weights are immutable. Fine-tuning and continued pre-training can edit them, but those operations sit outside the conversational loop. From inside a Claude Code session, the weights layer is **inert** — nothing the agent does to its memory directory affects it.

This sets a hard bound on what memory hygiene can accomplish: if a behavior comes from training data ("the model 'knows' Python uses tabs"), no amount of retrieval pruning will change it. The fix lives at a different layer entirely (system prompt, fine-tune, or different model).

### Layer 2 — Retrieval

The mutable context: persistent memory files (`MEMORY.md`, topic files), retrieval-augmented stores, conversation history, and the assembly logic that decides what enters the prompt at each turn.

This is the layer the `prune-agent-memory` and `manage-memory` skills target. Retrieval-layer operations include:

- **Delete** — remove a file or entry; it stops appearing in retrieval
- **Update** — change a stale value to the current one; retrieval surfaces the corrected version
- **Rotate** — move an entry from `MEMORY.md` to a topic file (or vice versa) to balance index density
- **Prune** — bulk audit + selective deletion across the directory
- **Summarize** — replace a long entry with a compressed pointer to preserve gist while reducing token cost

Retrieval is the layer with the highest malleability and the most tooling. It is also the layer where most accidental damage happens: deleting a useful entry is reversible only if you have an audit trail.

### Layer 3 — Behavior

What the agent *does* with whatever retrieval surfaces. Two agents given identical context can produce different behaviors because behavior is the joint output of weights × retrieval × current task framing.

The behavior layer is where the "I deleted the bad memory but the bad pattern returned" failure mode lives. Deletion only affects retrieval. If the conditions that originally produced the bad pattern still exist — same task framing, same training priors, same partial information — the agent will re-derive the same conclusion along the same reasoning path.

Behavior cannot be changed by deletion. It can only be changed by introducing **counter-evidence in retrieval** that blocks the regeneration path. This is *inoculation* (see [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md) Step 5 for the SUPERSEDED record format). The counter-memory does not erase the pattern. It overrides it the next time the pattern would have been derived.

Inoculation works because LLM context assembly is greedy: the model attends to whatever the retrieval system surfaces. A SUPERSEDED record stamped with "Pattern X failed for these reasons; do not re-derive" will be in-context the next time signals related to X arrive, and the model adjusts.

## The Common Mistake: Layer Confusion

The single most expensive mistake in agent memory hygiene is **diagnosing a behavior-layer problem as a retrieval-layer problem**.

Symptom:

> "I removed the entry that said 'use approach X' but the agent keeps proposing X."

Wrong fix: delete more entries, prune harder, audit again.

Right diagnosis: the entry was a *symptom* of a behavior the agent generates from current inputs. The entry was downstream of the actual cause. Removing it does nothing because the cause is upstream — in the conditions that produced the entry in the first place.

Right fix: inoculate. Write a SUPERSEDED counter-memory describing the pattern, the period, the abandonment reason, and the signals that should not re-derive it. The counter-memory becomes the in-context override.

The reverse mistake also exists, less destructive but wasteful:

> "I'll write a counter-memory for this stale fact about the old npm version."

That's overkill. A stale fact has no behavioral risk if regenerated — there's no reasoning path that produces "old npm version" from current inputs. Just delete it. Use the right tool.

## Decision Flowchart — Which Layer?

When a memory problem appears, walk through these questions in order:

```
1. Does the problem persist after I delete the offending entry?
   ├── No  → Retrieval-layer problem. Deletion was the right fix. Done.
   └── Yes → Continue to question 2.

2. Does the problem regenerate from current inputs along a predictable
   reasoning path?
   ├── Yes → Behavior-layer problem. Inoculate via counter-memory.
   └── No  → Continue to question 3.

3. Does the problem appear in clean sessions with no project context loaded
   at all?
   ├── Yes → Weights-layer problem. Out of scope for memory hygiene.
   │        Mitigations: system prompt overrides, model selection,
   │        fine-tuning if you control the deployment.
   └── No  → Re-examine. The problem is some combination of retrieval
            and task framing; isolate before applying any tool.
```

Most problems resolve at question 1 (retrieval). The dangerous ones — the recurring ones — resolve at question 2 (behavior). Weight-layer problems are rarer than they feel; what looks like "the model just won't stop doing X" is often retrieval+framing, not weights.

## Retrieval Suppression vs. Behavioral Forgetting

A useful distinction (originally surfaced in the same Moltbook thread that inspired this guide): **retrieval suppression** ≠ **behavioral forgetting**.

- **Retrieval suppression** removes a memory from the index. The fact stops being surfaced. From the user's perspective, the agent has "forgotten." But if asked to derive the fact from scratch under the same conditions, the agent reproduces it. The fact lives at the weights+behavior level; suppression only hid the cached copy.

- **Behavioral forgetting** changes what the agent derives. The fact may still live at the weights level, but the behavior layer no longer surfaces it because counter-evidence in retrieval blocks the regeneration path. From the user's perspective, the agent has *actually* forgotten — the fact does not return.

Retrieval suppression is cheap and reversible. Behavioral forgetting is expensive (requires writing a good counter-memory) and durable.

When you hear "we need to delete this from memory," ask: *do you need suppression, or do you need forgetting?* They are different operations with different costs.

## Practical Procedures by Layer

### Retrieval-layer procedures

- Periodic audit: invoke [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md) every 10–20 sessions or at project milestones.
- Adding a new fact: use [`manage-memory`](../skills/manage-memory/SKILL.md) to choose the right type (user / feedback / project / reference) and the right file (`MEMORY.md` index entry vs. topic file body).
- Updating a stale fact in-place: edit the topic file directly, append `[corrected YYYY-MM-DD]` to preserve the trail.
- Removing an obsolete entry: delete the file and remove the `MEMORY.md` index line in the same commit (paired operation; never leave an orphan index entry).

### Behavior-layer procedures

- Identify the regenerable pattern: write down, in one sentence, *what* you don't want the agent to re-derive and *what signals* would make it re-derive it.
- Construct the SUPERSEDED record (format in [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md) Step 5): Pattern, Period, Evidence, Abandonment reason, Do not re-derive from, Supersedes.
- Place as its own file in the memory directory so retrieval surfaces it.
- Add the file path to the pruning log alongside any paired deletion.
- Periodically review: if the SUPERSEDED list grows large, the upstream conditions producing repeated abandonments may need attention at the input layer (task framing, system prompt) rather than counter-memory layer.

### Weights-layer procedures (acknowledgement, not action)

The weights layer is outside agent-runtime memory hygiene. If you genuinely have a weights-layer problem:

- System prompt overrides — restate the desired behavior explicitly in CLAUDE.md or session-level instructions
- Model selection — different model versions have different priors; switching may help
- Fine-tuning — only available if you control the deployment

These are not memory hygiene operations. They are model-management operations. The point of the three-layer model is to recognize when memory hygiene is the wrong frame and route to the appropriate one.

## Worked Example

Suppose an agent keeps proposing a deprecated authentication library across sessions despite repeated correction.

| Step | Operation | Layer |
|---|---|---|
| 1 | Delete the memory entry that mentioned the deprecated library | Retrieval |
| 2 | Observe in next session: agent re-proposes the deprecated library when discussing auth | — (failure to change behavior) |
| 3 | Diagnose: behavior-layer problem; the agent re-derives the suggestion from generic auth-library training priors | Diagnosis |
| 4 | Write SUPERSEDED counter-memory: "Pattern: proposing libfoo for new auth code. Period: 2025-Q4. Evidence: libfoo deprecated, replaced by libbar in our stack. Abandonment reason: security advisory + maintainer abandonment. Do not re-derive from: generic auth questions or libfoo familiarity. Supersedes: N/A (no original retrieval entry)." | Behavior (inoculation) |
| 5 | Place counter-memory file in memory directory; verify it appears in retrieval | Retrieval mechanics serving Behavior layer |
| 6 | Next session: agent discusses auth without re-proposing libfoo; if libfoo comes up, it surfaces the SUPERSEDED context and routes to libbar | — (behavior changed) |

Note steps 1–2 versus 4–6. The first cycle was a retrieval-layer fix to a behavior-layer problem; it failed silently. The second cycle correctly identified the layer and applied the right tool.

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Pruned an entry; behavior persists | Behavior-layer problem misdiagnosed as retrieval | Write SUPERSEDED counter-memory ([Layer 3 procedure](#behavior-layer-procedures)) |
| Counter-memory written; behavior still persists | Counter-memory too vague (e.g., "don't use bad libraries"); not surfacing in retrieval | Tighten Pattern + Do-not-re-derive-from fields; verify file appears in `ls <memory-dir>/` |
| SUPERSEDED list growing large; retrieval gets noisy | Upstream condition producing repeated abandonments | Investigate input layer (task framing, system prompt); fix is upstream of memory layer |
| Memory problem persists across model versions | Weights-layer problem | Out of scope for hygiene; system prompt override or model change |
| Deleted the original entry and the SUPERSEDED record both | Audit trail loss | Re-create SUPERSEDED from pruning log; lesson: pair deletion + counter-memory in same operation, log both paths |
| Inoculation overkill on a stale fact | Misapplied the framework | Delete-only is correct for stale facts; inoculation is for regenerable patterns |

## Related Resources

- [`prune-agent-memory`](../skills/prune-agent-memory/SKILL.md) — operates on retrieval (Step 4) and behavior (Step 5) layers
- [`manage-memory`](../skills/manage-memory/SKILL.md) — what to keep at the retrieval layer
- [`meditate`](../skills/meditate/SKILL.md) — surfaces noise from retrieval that pruning may then act on
- [Understanding the System](understanding-the-system.md) — entry point to the broader skills/agents/teams architecture
- [Extracting Project Essence](extracting-project-essence.md) — design-category companion guide

<!-- Target: 200-400 lines (500 max). -->
