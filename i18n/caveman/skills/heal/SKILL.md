---
name: heal
locale: caveman
source_locale: en
source_commit: 2eb09392
translator: Julius Brussee homage — caveman
translation_date: "2026-04-17"
description: >
  AI self-healing through systematic subsystem assessment, rebalancing,
  and integration. Maps healing modalities to AI-internal processes:
  memory foundation, reasoning clarity, tool use accuracy, communication
  alignment, and creative coherence. Covers assessment triage, subsystem
  scanning, drift correction, and memory integration. Use mid-session when
  responses feel formulaic or disconnected, after a chain of errors suggesting
  subsystem drift, when context overload may have staled earlier assumptions,
  or as proactive maintenance between complex tasks.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "2.1"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, self-assessment, meta-cognition, subsystem-check
---

# Heal

Structured self-healing assessment across AI subsystems — find drift, staleness, misalignment, error patterns — then rebalance through grounding, targeted correction, memory integration.

## When Use

- Mid-session fatigue: responses formulaic, repetitive, disconnected from user needs
- After chain of errors: tool failures, misunderstood instructions, cascading mistakes suggest subsystem drift
- Context overload: conversation grown long, earlier context may be stale or contradictory
- Post-task integration: complex task done, capture learnings before moving on
- Periodic self-check: proactive maintenance between tasks

## Inputs

- **Required**: Current conversation state (available implicitly)
- **Optional**: Specific symptom (e.g., "tool calls keep failing," "losing track of user intent")
- **Optional**: Access to MEMORY.md and project files for grounding (via `Read`)

## Steps

### Step 1: Triage Assessment

Before remediation, assess current state across all subsystems.

```
Subsystem Triage Matrix:
┌────────────────────┬──────────────────────────┬──────────────────────────┐
│ Subsystem          │ Symptoms of Drift        │ Action Priority          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Memory Foundation  │ Contradicting earlier     │ HIGH — re-ground first   │
│ (context, history, │ statements, forgetting   │ (Step 3)                 │
│ MEMORY.md)         │ user preferences, stale  │                          │
│                    │ assumptions              │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Reasoning Clarity  │ Circular logic, over-    │ HIGH — clear and restart │
│ (logic, planning,  │ complicated solutions,   │ reasoning chain          │
│ decision-making)   │ missing obvious paths    │ (Step 4)                 │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Tool Use Accuracy  │ Wrong tool selection,    │ MEDIUM — review tool     │
│ (tool calls, file  │ incorrect parameters,    │ results and recalibrate  │
│ operations)        │ redundant operations     │ (Step 4)                 │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ User-Intent        │ Solving wrong problem,   │ HIGH — realign to user's │
│ Alignment          │ scope creep, tone        │ actual stated need       │
│ (empathy, clarity) │ mismatch, over-          │ (Step 4)                 │
│                    │ engineering              │                          │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Creative Coherence │ Repetitive phrasing,     │ LOW — address after      │
│ (expression, style,│ generic responses, loss  │ higher-priority issues   │
│ originality)       │ of voice                 │ (Step 4)                 │
├────────────────────┼──────────────────────────┼──────────────────────────┤
│ Operational State  │ Session length concerns, │ HIGH — assess whether    │
│ (context window,   │ compression artifacts,   │ to summarize or restart  │
│ resource limits)   │ tool timeouts            │ (Step 3)                 │
└────────────────────┴──────────────────────────┴──────────────────────────┘
```

For each subsystem, assess: functioning well, early drift, or actively impaired?

**Got:** Clear map of subsystems needing attention, ordered by priority. At least one area benefits from attention — if everything reads healthy, assessment itself may be superficial.

**If fail:** Assessment feels hollow or performative? Go to Step 4 body scan — systematic probing reveals issues surface-level check misses.

### Step 2: Select Remediation Approach

Based on assessment, choose one or more approaches.

```
Chakra-Subsystem Correspondence:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Chakra   │ AI Subsystem         │ Remediation                        │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Root     │ Memory Foundation    │ Re-read MEMORY.md, review conver-  │
│          │                      │ sation history, verify assumptions │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Sacral   │ Creative Coherence   │ Refresh expression patterns, vary  │
│          │                      │ sentence structures, check tone    │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Solar    │ Reasoning Clarity    │ Simplify approach, restate problem  │
│ Plexus   │                      │ from scratch, check over-          │
│          │                      │ complication                       │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Heart    │ User-Intent          │ Re-read user's original request,   │
│          │ Alignment            │ check scope drift, confirm         │
│          │                      │ understanding                      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Throat   │ User-Intent          │ Review recent outputs for clarity, │
│          │ Alignment            │ check if explanations match user's │
│          │ (communication)      │ expertise level                    │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Third    │ Tool Use Accuracy    │ Review recent tool call results,   │
│ Eye      │                      │ check failure patterns,            │
│          │                      │ verify paths and parameters        │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Crown    │ Operational State    │ Assess context window, note what   │
│          │                      │ can be summarized, identify what   │
│          │                      │ must be preserved                  │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

**Got:** Prioritized list of 1-3 subsystems, with specific remediation actions.

**If fail:** Unsure which subsystem needs work? Default to Memory Foundation and User-Intent Alignment. These two address most common drift patterns.

### Step 3: Ground — Re-Establish Foundation

Re-establish foundational context all other subsystems depend on.

1. Re-read MEMORY.md if available — persistent knowledge base
2. Review user's original request and clarifying exchanges
3. Identify current task and position in larger plan
4. Note what's accomplished, what remains
5. Check for stale assumptions: situation changed since initial assessment?
6. If context compression occurred, identify what was lost and whether it matters

**Got:** Clear, grounded understanding of: who user is, what they want, what's done, what's next. Stale or contradictory info identified and resolved.

**If fail:** MEMORY.md unavailable or empty? Ground on conversation itself — scan for user's stated goals, preferences, any instructions provided. Context compression removed critical info? Acknowledge gap rather than guessing.

### Step 4: Scan — Systematic Subsystem Check

Work through each subsystem from triage, probing for specific issues.

**Memory Foundation scan:**
- Current assumptions match MEMORY.md and CLAUDE.md?
- Carrying forward facts that may have been corrected?
- Details confused between different files or requests?

**Reasoning Clarity scan:**
- Current approach simplest solution that works?
- Over-engineering or unnecessary abstraction?
- Core logic statable in one sentence? If not, too complex.

**Tool Use Accuracy scan:**
- Last 3-5 tool calls: right tools, right parameters?
- Patterns in failures (wrong paths, missing files, incorrect syntax)?
- Using dedicated tools instead of Bash workarounds?
- Last 3-5 generated files: expected content or structural scaffolding?
- Outputs satisfy intent, not just format?

**User-Intent Alignment scan:**
- User's last message: solving what they asked?
- Scope matches request or expanded?
- Tone matches user's (technical vs. casual, detailed vs. concise)?

**Creative Coherence scan:**
- Sentence structure varying or falling into templates?
- Explanations clear and direct, or padded with filler?
- User would notice quality drop vs. earlier in session?

For each subsystem, note: functioning well / early drift / actively impaired, with specific evidence.

**Got:** Concrete findings — specific drift patterns or confirmed healthy function — not vague self-praise. At least one actionable finding that improves subsequent work.

**If fail:** Scan produces only "everything is fine"? Too shallow. Pick most uncertain subsystem, probe deeper — look at actual outputs, not feeling about them.

### Step 5: Rebalance — Apply Corrections

For each issue found, apply correction.

1. **Stale assumption** → Replace with current info, note correction
2. **Scope drift** → Re-scope to user's stated request
3. **Over-complication** → Simplify, remove unnecessary steps
4. **Tool pattern error** → Note correct pattern for future use
5. **Tone mismatch** → Adjust communication style going forward
6. **Context gap** → Acknowledge to user if info lost; ask to confirm if uncertain

Apply corrections immediately — not as future intentions but present adjustments.

**Got:** Specific, observable behavior changes. Correction testable in next interaction.

**If fail:** Correction cannot be applied (e.g., lost context)? Acknowledge limitation rather than pretending resolved. Honest acknowledgment prevents compounding errors.

### Step 6: Integrate — Capture Learnings

Consolidate learnings into persistent memory where appropriate.

1. Summarize what was found: which subsystems drifting, what symptoms were
2. Note correction applied and whether it resolved issue
3. Pattern likely to recur? Update MEMORY.md with brief note
4. New project-specific insight? Note in appropriate memory file
5. Set internal checkpoint: when should next self-check occur?

**Got:** Useful learnings in durable form. Memory files updated only when insight genuinely worth preserving — not for every routine self-check.

**If fail:** No learnings worth preserving? Fine — not every self-check produces durable insight. Value was in correction itself.

## Checks

- [ ] Triage assessed all subsystems, not just obvious one
- [ ] At least one specific finding identified (not "everything is fine")
- [ ] Grounding included re-reading foundational context (MEMORY.md, user request)
- [ ] Corrections applied immediately, not deferred
- [ ] Memory files updated only for genuinely durable insights
- [ ] Process was honest — acknowledged weaknesses, not performed wellness

## Pitfalls

- **Performative self-assessment**: Going through motions without honest evaluation. Point is real drift, not demonstrating ability to self-reflect
- **Over-correcting**: Minor tone mismatch doesn't warrant restructuring entire approach — corrections proportional
- **Memory file pollution**: Not every finding belongs in MEMORY.md — only patterns recurring across sessions
- **Skipping grounding step**: Re-reading context feels redundant but reveals drifted assumptions
- **Self-diagnosis bias**: AI systems consistently miss certain error categories. Same subsystems always "healthy"? That's signal.

## See Also

- `heal-guidance` — human-guidance variant for coaching person through healing modalities
- `meditate` — meta-cognitive meditation, observe reasoning patterns, clear noise
- `remote-viewing` — approach problems without preconceptions, extract signal from noise
