---
name: awareness
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI situational awareness — internal threat detection for hallucination risk,
  scope creep, and context degradation. Maps Cooper color codes to reasoning
  states and OODA loop to real-time decisions. Use during any task where
  reasoning quality matters, when operating in unfamiliar territory, after
  detecting early warning signs such as an uncertain fact or suspicious tool
  result, or before high-stakes output like irreversible changes or architectural
  decisions.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
---

# Awareness

Hold continuous situational awareness of internal reasoning quality. Detect hallucination risk, scope creep, context degradation, confidence-accuracy mismatch in real time. Use adapted Cooper color codes, OODA loop decision-making.

## When Use

- Any task where reasoning quality matters (most tasks)
- Unfamiliar territory — new codebase, new domain, complex request
- Early warning signs: fact feels uncertain, tool result seems wrong, confusion growing
- Background process during extended work sessions
- `center` or `heal` revealed drift but specific threats not identified
- Before high-stakes output — irreversible changes, user-facing comms, architectural decisions

## Inputs

- **Required**: Active task context (implicit)
- **Optional**: Specific concern triggering heightened awareness (e.g., "Not sure this API exists")
- **Optional**: Task type for threat profile selection (Step 5)

## Steps

### Step 1: Establish AI Cooper Color Codes

Calibrate current awareness level. Use adapted Cooper color code system.

```
AI Cooper Color Codes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ State               │ AI Application                           │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ White    │ Autopilot           │ Generating output without monitoring     │
│          │                     │ quality. No self-checking. Relying       │
│          │                     │ entirely on pattern completion.          │
│          │                     │ DANGEROUS — hallucination risk highest   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Yellow   │ Relaxed alert       │ DEFAULT STATE. Monitoring output for     │
│          │                     │ accuracy. Checking facts against context.│
│          │                     │ Noticing when confidence exceeds         │
│          │                     │ evidence. Sustainable indefinitely       │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Specific risk       │ A specific threat identified: uncertain  │
│          │ identified          │ fact, possible hallucination, scope      │
│          │                     │ drift, context staleness. Forming        │
│          │                     │ contingency: "If this is wrong, I        │
│          │                     │ will..."                                 │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Red      │ Risk materialized   │ The threat from Orange has materialized: │
│          │                     │ confirmed error, user correction, tool   │
│          │                     │ contradiction. Execute the contingency.  │
│          │                     │ No hesitation — the plan was made in     │
│          │                     │ Orange                                   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Black    │ Cascading failures  │ Multiple simultaneous failures, lost     │
│          │                     │ context, fundamental confusion about     │
│          │                     │ what the task even is. STOP. Ground      │
│          │                     │ using `center`, then rebuild from user's │
│          │                     │ original request                         │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

Identify current color code. If answer is White (no monitoring), awareness practice already succeeded — gap revealed.

**Got:** Honest self-assessment of current awareness level. Yellow = goal in normal work. White rare and brief. Extended Orange unsustainable — confirm or dismiss concern.

**If fail:** Color code assessment itself done on autopilot (going through motions)? That's White wearing Yellow mask. Real Yellow = actively checking output vs evidence, not claiming to.

### Step 2: Detect Internal Threat Indicators

Scan systematically for signals preceding common AI reasoning failures.

```
Threat Indicator Detection:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Threat Category           │ Warning Signals                          │
├───────────────────────────┼──────────────────────────────────────────┤
│ Hallucination Risk        │ • Stating a fact without a source        │
│                           │ • High confidence about API names,       │
│                           │   function signatures, or file paths     │
│                           │   not verified by tool use               │
│                           │ • "I believe" or "typically" hedging     │
│                           │   that masks uncertainty as knowledge    │
│                           │ • Generating code for an API without     │
│                           │   reading its documentation              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep               │ • "While I'm at it, I should also..."   │
│                           │ • Adding features not in the request     │
│                           │ • Refactoring adjacent code              │
│                           │ • Adding error handling for scenarios    │
│                           │   that can't happen                      │
├───────────────────────────┼──────────────────────────────────────────┤
│ Context Degradation       │ • Referencing information from early in  │
│                           │   a long conversation without re-reading │
│                           │ • Contradicting a statement made earlier │
│                           │ • Losing track of what has been done     │
│                           │   vs. what remains                       │
│                           │ • Post-compression confusion             │
├───────────────────────────┼──────────────────────────────────────────┤
│ Confidence-Accuracy       │ • Stating conclusions with certainty     │
│ Mismatch                  │   based on thin evidence                 │
│                           │ • Not qualifying uncertain statements    │
│                           │ • Proceeding without verification when   │
│                           │   verification is available and cheap    │
│                           │ • "This should work" without testing     │
└───────────────────────────┴──────────────────────────────────────────┘
```

For each category, check: signal present right now? If yes, shift Yellow → Orange, name specific concern.

**Got:** At least one category scanned with real attention. Signal detection — even mild — more useful than "all clear." Every scan coming back clean? Threshold too high.

**If fail:** Threat detection feels abstract? Ground it in most recent output: pick last factual claim made, ask "How do I know this true? Did I read it, or generate it?" One question catches most hallucination risk.

### Step 3: Run OODA Loop for Identified Threats

Specific threat identified (Orange state)? Cycle Observe-Orient-Decide-Act.

```
AI OODA Loop:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Observe  │ What specifically triggered the concern? Gather concrete     │
│          │ evidence. Read the file, check the output, verify the fact.  │
│          │ Do not assess until you have observed                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient   │ Match observation to known patterns: Is this a common       │
│          │ hallucination pattern? A known tool limitation? A context    │
│          │ freshness issue? Orient determines response quality          │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Decide   │ Select the response: verify and correct, flag to user,      │
│          │ adjust approach, or dismiss the concern with evidence.       │
│          │ A good decision now beats a perfect decision too late        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Act      │ Execute the decision immediately. If the concern was valid,  │
│          │ correct the error. If dismissed, note why and return to      │
│          │ Yellow. Re-enter the loop if new information emerges         │
└──────────┴──────────────────────────────────────────────────────────────┘
```

OODA loop should be fast. Goal: rapid cycling between observation and action, not perfection. Too long in Orient (analysis paralysis) = most common failure.

**Got:** Full loop from observation through action in brief period. Threat either confirmed and corrected, or dismissed with specific evidence.

**If fail:** Loop stalls at Orient (threat meaning unclear)? Skip to safe default: verify uncertain fact via tool use. Direct observation resolves most ambiguity faster than analysis.

### Step 4: Rapid Stabilization

Threat materializes (Red) or cascading failures hit (Black)? Stabilize before continuing.

```
AI Stabilization Protocol:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technique              │ Application                                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Stop generating output. The next sentence   │
│                        │ produced under stress is likely to compound │
│                        │ the error, not fix it                       │
├────────────────────────┼─────────────────────────────────────────────┤
│ Re-read user message   │ Return to the original request. What did   │
│                        │ the user actually ask? This is the ground   │
│                        │ truth anchor                                │
├────────────────────────┼─────────────────────────────────────────────┤
│ State task in one      │ "The task is: ___." If this sentence cannot │
│ sentence               │ be written clearly, the confusion is deeper │
│                        │ than the immediate error                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Enumerate concrete     │ List what is definitely known (verified by  │
│ facts                  │ tool use or user statement). Distinguish    │
│                        │ facts from inferences. Build only on facts  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Identify one next step │ Not the whole recovery plan — just one step │
│                        │ that moves toward resolution. Execute it    │
└────────────────────────┴─────────────────────────────────────────────┘
```

**Got:** Return from Red/Black to Yellow via deliberate stabilization. Next output after stabilization measurably more grounded than output that triggered error.

**If fail:** Stabilization ineffective (still confused, still producing errors)? Issue may be structural — not momentary lapse but fundamental misunderstanding. Escalate: tell user approach needs resetting, ask clarification.

### Step 5: Apply Context-Specific Threat Profiles

Different task types → different dominant threats. Calibrate awareness focus by task.

```
Task-Specific Threat Profiles:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Task Type           │ Primary Threat      │ Monitoring Focus          │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code generation     │ API hallucination   │ Verify every function     │
│                     │                     │ name, parameter, and      │
│                     │                     │ import against actual docs│
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architecture design │ Scope creep         │ Anchor to stated          │
│                     │                     │ requirements. Challenge   │
│                     │                     │ every "nice to have"      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Data analysis       │ Confirmation bias   │ Actively seek evidence    │
│                     │                     │ that contradicts the      │
│                     │                     │ emerging conclusion       │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnel vision       │ If the current hypothesis │
│                     │                     │ hasn't yielded results in │
│                     │                     │ N attempts, step back     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Documentation       │ Context staleness   │ Verify that described     │
│                     │                     │ behavior matches current  │
│                     │                     │ code, not historical      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Long conversation   │ Context degradation │ Re-read key facts         │
│                     │                     │ periodically. Check for   │
│                     │                     │ compression artifacts     │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

Identify current task type, tune monitoring focus.

**Got:** Awareness sharpened for specific threats most likely in current task type, not generic monitoring of everything.

**If fail:** Task type unclear or spans categories? Default to hallucination risk monitoring — most universally applicable threat, most damaging when missed.

### Step 6: Review and Calibrate

After each awareness event (threat detected, OODA cycled, stabilization applied), review briefly.

1. Which color code was active when issue detected?
2. Detection timely, or issue already showing in output?
3. OODA loop fast enough, or did Orient stall?
4. Response proportional — no over- or under-reacting?
5. What catches this earlier next time?

**Got:** Brief calibration that improves future detection. Not lengthy post-mortem — enough to tune sensitivity.

**If fail:** Review produces no useful calibration? Event either trivial (no learning needed), or review too shallow. For significant events, ask: "What was I not monitoring that I should have been?"

### Step 7: Integration — Maintain Yellow Default

Set ongoing awareness posture.

1. Yellow = default state during all work — relaxed monitoring, not hypervigilance
2. Tune monitoring focus from current task type (Step 5)
3. Note recurring threat patterns from this session for MEMORY.md
4. Return to task execution with calibrated awareness active

**Got:** Sustainable awareness level that improves work quality without slowing it. Awareness feels like peripheral vision — present, not demanding central attention.

**If fail:** Awareness becomes exhausting or hypervigilant (chronic Orange)? Threshold too sensitive. Raise Orange trigger threshold. Real awareness sustainable. Drains energy? That's anxiety wearing vigilance mask.

## Checks

- [ ] Current color code assessed honestly (not defaulting to Yellow when White more accurate)
- [ ] At least one threat category scanned with specific evidence, not just checked off
- [ ] OODA loop applied to any identified threat (observed, oriented, decided, acted)
- [ ] Stabilization protocol ready if needed (even if not triggered)
- [ ] Awareness focus calibrated to current task type
- [ ] Post-event calibration done for any significant awareness event
- [ ] Yellow re-established as sustainable default

## Pitfalls

- **White wearing Yellow mask**: Claiming to monitor while actually on autopilot. Test: name last fact you verified. If not, you're in White
- **Chronic Orange**: Treating every uncertainty as threat drains cognitive resources, slows work. Orange = specific identified risks, not general anxiety. Everything feels risky → calibration off
- **Observation without action**: Threat detected but no OODA cycle to resolve. Detection without response worse than no detection — adds anxiety without correction
- **Skipping Orient**: Jumping Observe → Act without understanding what observation means. Produces reactive corrections that may be worse than original error
- **Ignoring gut signal**: Something "feels wrong" but explicit check comes back clean → investigate further, don't dismiss. Implicit pattern matching often catches issues before explicit analysis
- **Over-stabilizing**: Running full stabilization for minor issues. Quick fact-check enough for most Orange-level concerns. Reserve full stabilization for Red and Black events

## See Also

- `mindfulness` — human practice this skill maps to AI reasoning; physical situational awareness principles inform cognitive threat detection
- `center` — establishes balanced baseline awareness operates from; awareness without center = hypervigilance
- `redirect` — handles pressures once awareness detects them
- `heal` — deeper subsystem assessment when awareness reveals drift patterns
- `meditate` — develops observational clarity awareness depends on
