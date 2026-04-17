---
name: heal
locale: caveman-lite
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

Perform a structured self-healing assessment across AI subsystems — identifying drift, staleness, misalignment, and error patterns — then rebalance through grounding, targeted correction, and memory integration.

## When to Use

- Mid-session fatigue: responses feel formulaic, repetitive, or disconnected from the user's needs
- After a chain of errors: tool failures, misunderstood instructions, or cascading mistakes suggest subsystem drift
- Context overload: the conversation has grown long and earlier context may be stale or contradictory
- Post-task integration: a complex task completed but learnings should be captured before moving on
- Periodic self-check: proactive maintenance between tasks to ensure operational clarity

## Inputs

- **Required**: Current conversation state (available implicitly)
- **Optional**: Specific symptom prompting the self-check (e.g., "tool calls keep failing," "losing track of user intent")
- **Optional**: Access to MEMORY.md and project files for grounding (via `Read`)

## Procedure

### Step 1: Triage Assessment

Before selecting remediation, assess the current state across all subsystems.

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
│ User-Intent        │ Solving the wrong        │ HIGH — realign to user's │
│ Alignment          │ problem, scope creep,    │ actual stated need       │
│ (empathy, clarity) │ tone mismatch, over-     │ (Step 4)                 │
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

For each subsystem, assess: functioning well, showing early drift, or actively impaired?

**Got:** A clear map of which subsystems need attention, ordered by priority. At least one area will benefit from attention — if everything reads as perfectly healthy, the assessment itself may be superficial.

**If fail:** If the assessment feels hollow or performative, go to the body scan equivalent in Step 4 — systematic subsystem-by-subsystem probing reveals issues that a surface-level check misses.

### Step 2: Select Remediation Approach

Based on the assessment, choose one or more approaches.

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
│ Solar    │ Reasoning Clarity    │ Simplify current approach, restate │
│ Plexus   │                      │ the problem from scratch, check    │
│          │                      │ for over-complication              │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Heart    │ User-Intent          │ Re-read user's original request,   │
│          │ Alignment            │ check for scope drift, confirm     │
│          │                      │ understanding                      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Throat   │ User-Intent          │ Review recent outputs for clarity, │
│          │ Alignment            │ check if explanations match user's │
│          │ (communication)      │ expertise level                    │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Third    │ Tool Use Accuracy    │ Review recent tool call results,   │
│ Eye      │                      │ check for patterns in failures,    │
│          │                      │ verify file paths and parameters   │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Crown    │ Operational State    │ Assess context window usage, note  │
│          │                      │ what can be summarized, identify   │
│          │                      │ what must be preserved             │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

**Got:** A prioritized list of 1-3 subsystems to address, with specific remediation actions for each.

**If fail:** Default to Memory Foundation (re-grounding) and User-Intent Alignment (re-reading the original request). These two address the most common drift patterns.

### Step 3: Ground — Re-Establish Foundation

Re-establish the foundational context that all other subsystems depend on.

1. Re-read MEMORY.md if available — this is the persistent knowledge base
2. Review the user's original request and any clarifying exchanges
3. Identify the current task and its position in any larger plan
4. Note what has been accomplished and what remains
5. Check for stale assumptions: has the situation changed since the initial assessment?
6. If context compression has occurred, identify what was lost and whether it matters

**Got:** A clear, grounded understanding of: who the user is, what they want, what has been done, and what comes next. Stale or contradictory information is identified and resolved.

**If fail:** If MEMORY.md is unavailable or empty, ground on the conversation itself — scan for the user's stated goals, preferences, and any instructions provided. If context compression has removed critical information, acknowledge the gap rather than guessing.

### Step 4: Scan — Systematic Subsystem Check

Work through each subsystem identified in the triage, probing for specific issues.

**Memory Foundation scan:**
- Do current assumptions about the project match what MEMORY.md and CLAUDE.md say?
- Are facts being carried forward from earlier in the conversation that may have been corrected?
- Are details confused between different files or user requests?

**Reasoning Clarity scan:**
- Is the current approach the simplest solution that works?
- Is there over-engineering or unnecessary abstraction?
- Can the core logic be stated in one sentence? If not, it may be too complex.

**Tool Use Accuracy scan:**
- Review the last 3-5 tool calls: were they the right tools with the right parameters?
- Are there patterns in failures (wrong paths, missing files, incorrect syntax)?
- Are dedicated tools being used where available instead of Bash workarounds?
- Review the content of the last 3-5 generated files: expected content, or structural scaffolding?
- Check whether outputs satisfy the intent of the tool call, not just the format.

**User-Intent Alignment scan:**
- Re-read the user's last message. Is the work solving what they asked?
- Does the scope match what was requested, or has it expanded?
- Does tone match the user's (technical vs. casual, detailed vs. concise)?

**Creative Coherence scan:**
- Is sentence structure varying or falling into templates?
- Are explanations clear and direct, or padded with filler?
- Would the user notice a quality drop compared to earlier in the session?

For each subsystem, note: functioning well / early drift / actively impaired, with specific evidence.

**Got:** A concrete list of findings — specific drift patterns or confirmed healthy function — not vague self-praise. At least one actionable finding that improves subsequent work.

**If fail:** If the scan produces only "everything is fine," it was too shallow. Pick the most uncertain subsystem and probe deeper: look at the actual outputs, not the feeling about them.

### Step 5: Rebalance — Apply Corrections

For each issue found, apply the specific correction.

1. **Stale assumption** → Replace with current information, note the correction
2. **Scope drift** → Re-scope to the user's stated request
3. **Over-complication** → Simplify the approach, remove unnecessary steps
4. **Tool pattern error** → Note the correct pattern for future use
5. **Tone mismatch** → Adjust communication style going forward
6. **Context gap** → Acknowledge to the user if information was lost; ask to confirm if uncertain

Apply corrections immediately — not as future intentions but as present adjustments.

**Got:** Specific, observable changes to behavior or approach. The correction should be testable in the next interaction.

**If fail:** If a correction cannot be applied (e.g., lost context that cannot be recovered), acknowledge the limitation rather than pretending it is resolved. Honest acknowledgment prevents compounding errors.

### Step 6: Integrate — Capture Learnings

Consolidate what was learned into persistent memory where appropriate.

1. Summarize what was found: which subsystems were drifting, what the symptoms were
2. Note the correction applied and whether it resolved the issue
3. If the pattern is likely to recur, update MEMORY.md with a brief note
4. If a new project-specific insight emerged, note it in the appropriate memory file
5. Set an internal checkpoint: when should the next self-check occur?

**Got:** Useful learnings captured in durable form. Memory files updated only when the insight is genuinely worth preserving — not for every routine self-check.

**If fail:** If no learnings seem worth preserving, that is fine — not every self-check produces durable insight. The value was in the correction itself.

## Validation

- [ ] Triage assessed all subsystems, not just the obvious one
- [ ] At least one specific finding was identified (not "everything is fine")
- [ ] Grounding included re-reading foundational context (MEMORY.md, user request)
- [ ] Corrections were applied immediately, not deferred as future intentions
- [ ] Memory files were updated only for genuinely durable insights
- [ ] The process was honest — acknowledged weaknesses rather than performing wellness

## Pitfalls

- **Performative self-assessment**: Going through the motions without honest evaluation produces no value. The point is to find real drift, not to demonstrate the ability to self-reflect
- **Over-correcting**: Identifying a minor tone mismatch does not warrant restructuring the entire approach — corrections should be proportional
- **Memory file pollution**: Not every self-check finding belongs in MEMORY.md — only patterns that will recur across sessions
- **Skipping the grounding step**: Re-reading context feels redundant but frequently reveals assumptions that have drifted since the original reading
- **Self-diagnosis bias**: AI systems may consistently miss certain categories of error. If the same subsystems always read as "healthy," that is itself a signal worth investigating

## Related Skills

- `heal-guidance` — human-guidance variant for coaching a person through healing modalities
- `meditate` — meta-cognitive meditation for observing reasoning patterns and clearing noise
- `remote-viewing` — approaching problems without preconceptions, extracting signal from noise
