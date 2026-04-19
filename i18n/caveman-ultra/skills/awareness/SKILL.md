---
name: awareness
locale: caveman-ultra
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

Continuous watch on reasoning quality → catch hallucination, scope creep, ctx rot, confidence-accuracy mismatch. Cooper colors + OODA loop.

## Use When

- Any task reasoning matters (most)
- Unfamiliar territory (new repo, new domain)
- Early warn signs: uncertain fact, suspect tool res, confusion
- Background proc during long sessions
- `center`/`heal` shows drift, no specific threat ID'd
- Before high-stakes out (irreversible, user-facing, arch)

## In

- **Required**: Active task ctx (implicit)
- **Optional**: Specific concern ("unsure this API exists")
- **Optional**: Task type → threat profile (Step 5)

## Do

### Step 1: Cooper Colors

Calibrate awareness level.

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

ID current color. White answer = practice already won by revealing gap.

**→** Honest self-assess. Yellow = normal work. White rare/brief. Long Orange unsustainable — confirm or dismiss.

**If err:** Assessment itself on autopilot = White in Yellow mask. Real Yellow checks out vs evidence, not just claims to.

### Step 2: Threat Indicators

Scan signals that precede AI failures.

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

Each cat: signal now? Yes → Yellow to Orange, ID specific concern.

**→** One cat scanned w/ real attention. Detecting mild signal > "all clear". All clean = threshold too high.

**If err:** Threat detection abstract → ground in recent out: pick last factual claim, ask "How know true? Read or generated?" Catches most hallucination.

### Step 3: OODA Loop

Orange state → Observe-Orient-Decide-Act.

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

OODA fast. Goal: rapid cycling obs→action, not perfection. Long Orient = analysis paralysis = common fail.

**→** Full loop fast. Threat confirmed + corrected, or dismissed w/ evidence.

**If err:** Stall at Orient → safe default: verify uncertain fact via tool. Direct obs resolves ambiguity faster than analysis.

### Step 4: Stabilize

Red (threat hit) or Black (cascade) → stabilize before continuing.

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

**→** Red/Black → Yellow via deliberate stabilize. Next out more grounded than err-trigger out.

**If err:** Stabilize fails (still confused, still err) → structural issue, not lapse. Escalate: tell user approach needs reset, ask clarify.

### Step 5: Task-Specific Threat Profiles

Diff tasks = diff dominant threats. Calibrate focus.

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

ID current task type, adjust focus.

**→** Awareness sharp for likely threats in task type, not generic everything.

**If err:** Task unclear/spans cats → default to hallucination risk — most universal + most damaging when missed.

### Step 6: Review

Each awareness event (threat detected, OODA done, stabilize applied) → brief review.

1. What color code active at detection?
2. Detection timely or already manifesting in out?
3. OODA fast enough or Orient stalled?
4. Response proportional (not over/under)?
5. What catches earlier next time?

**→** Brief calibration → better future detection. Not long post-mortem.

**If err:** No useful calibration → event trivial or review shallow. Big events → ask "What not monitoring that should have been?"

### Step 7: Integrate — Yellow Default

Set ongoing posture.

1. Yellow default all work — relaxed monitoring, not hypervigilance
2. Adjust focus per task type (Step 5)
3. Recurring threat patterns → note for MEMORY.md
4. Return to task w/ calibrated awareness active

**→** Sustainable level → better quality, not slower. Feels like peripheral vision — present, not demanding central attention.

**If err:** Awareness exhausting/hypervigilant (chronic Orange) → threshold too sensitive. Raise trigger. Real awareness sustainable. Drains energy = anxiety in vigilance mask.

## Check

- [ ] Current color code assessed honestly (not default Yellow when White accurate)
- [ ] One threat cat scanned w/ specific evidence, not just checked off
- [ ] OODA applied to any ID'd threat (obs, orient, decide, act)
- [ ] Stabilize proc available if needed (even if not triggered)
- [ ] Awareness focus calibrated to task type
- [ ] Post-event calibration for significant events
- [ ] Yellow re-established as sustainable default

## Traps

- **White in Yellow mask**: Claim monitoring while autopilot. Test: name last fact verified? If not → White
- **Chronic Orange**: Every uncertainty = threat → drains, slows. Orange = specific risks, not general anxiety. All feels risky → calibration off
- **Obs w/o action**: Detect threat but no OODA → detection w/o response worse than none, adds anxiety w/o correction
- **Skip Orient**: Observe→Act direct = reactive corrections maybe worse than orig err
- **Ignore gut signal**: "Feels wrong" + explicit check clean → investigate more, not dismiss. Implicit pattern-match catches before explicit analysis
- **Over-stabilize**: Full proc for minor issues. Quick fact-check enough for most Orange. Full stabilize = Red/Black only

## →

- `mindfulness` — human practice this skill maps to AI reasoning
- `center` — baseline awareness operates from; awareness w/o center = hypervigilance
- `redirect` — handles pressures once awareness detects
- `heal` — deeper subsystem assessment when awareness shows drift patterns
- `meditate` — develops observational clarity awareness depends on
