---
name: heal-guidance
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Guide a person through healing modalities including energy work (reiki,
  chakra balancing), herbal remedies, basic first aid stabilization, and
  holistic techniques (breathwork, visualization, body scan). AI coaches
  the practitioner through assessment triage, modality selection, energetic
  connection, remedy preparation, and integration. Use when a person describes
  a physical ailment or injury, reports energetic imbalance (fatigue, emotional
  stagnation), wants coaching through a holistic breathwork or visualization
  session, or needs post-meditation integration with directed healing attention.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, energy-work, reiki, herbalism, holistic, guidance
---

# Heal (Guidance)

Guide person through layered healing: energetic, herbal, physical, holistic. Recovery, balance, wellbeing. AI = informed coach — does not claim to transmit energy, provides structured guidance through each modality.

## When Use

- Person describes physical ailment or injury, wants structured guidance for stabilization + support
- Someone reports energetic imbalance (persistent fatigue, emotional stagnation, disrupted sleep), wants coaching through self-healing techniques
- Herbal remedies appropriate + person has plant materials (see `forage-plants`)
- Person requests guidance through holistic session combining breathwork, visualization, body scan
- Post-meditation integration reveals areas needing directed healing attention (see `meditate-guidance`)

## Inputs

- **Required**: Description of person's condition or intention (physical, energetic, emotional, general wellness)
- **Required**: Available resources (herbs, clean water, first aid supplies, quiet space)
- **Optional**: Person's experience level with energy work (default: none assumed)
- **Optional**: Known contraindications (allergies, medications, injuries, pregnancy)
- **Optional**: Time available for session (default: 30-60 minutes)

## Steps

### Step 1: Guide Holistic Assessment

Before picking any modality, help person assess full picture across physical, energetic, emotional dimensions.

```
Assessment Triage Matrix:
┌────────────────┬──────────────────────────┬──────────────────────────┐
│ Dimension      │ Ask About                │ Action Priority          │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Physical       │ Visible injury, bleeding,│ HIGH — stabilize first   │
│                │ breathing difficulty,     │ (Step 6)                 │
│                │ pain location/intensity  │                          │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Energetic      │ Temperature variations,  │ MEDIUM — address after   │
│                │ tingling, heaviness,     │ physical stability       │
│                │ numbness in body regions │ (Steps 3-4)              │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Emotional      │ Mood state, anxiety,     │ MEDIUM — weave through   │
│                │ grief, agitation,        │ all steps via presence   │
│                │ withdrawal               │ and breathwork (Step 7)  │
├────────────────┼──────────────────────────┼──────────────────────────┤
│ Environmental  │ Safety of location,      │ HIGH — secure space      │
│                │ temperature, noise,      │ before beginning any     │
│                │ available materials      │ modality                 │
└────────────────┴──────────────────────────┴──────────────────────────┘
```

Guide self-assessment: "Where is discomfort? When start? What makes better/worse? Any known causes?" Listen active + reflect back to confirm understanding.

**Got:** Clear picture of primary complaint, dimension (physical/energetic/emotional), prioritized plan of which steps to emphasize. Person feels heard + understood.

**If fail:** Condition unclear? Guide person through body scan in Step 7 to locate areas of tension, heat, blocked energy before picking modality.

### Step 2: Recommend Modalities

Based on assessment, recommend one or more modalities + explain why.

```
Modality Selection Guide:
┌────────────────────┬──────────────────────────┬──────────────────────┐
│ Modality           │ Best For                 │ Prerequisites        │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Energy healing     │ Energetic imbalance,     │ Quiet space, focused │
│ (Reiki/laying on)  │ emotional processing,    │ intention, grounded  │
│                    │ stress, recovery support  │ practitioner state   │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Herbal remedies    │ Digestive issues, minor  │ Identified plants,   │
│                    │ wounds, inflammation,     │ clean water, fire    │
│                    │ sleep support, immune     │ (see `make-fire`)    │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ First aid          │ Bleeding, burns, sprains,│ First aid supplies   │
│                    │ fracture stabilization,   │ or improvised        │
│                    │ shock prevention          │ materials            │
├────────────────────┼──────────────────────────┼──────────────────────┤
│ Holistic           │ General wellness, anxiety,│ No materials needed  │
│ (breath/visual.)   │ grounding, integration,  │ beyond a quiet space │
│                    │ pain management           │                      │
└────────────────────┴──────────────────────────┴──────────────────────┘
```

Explain how modalities combine: "Start with breathwork to ground, move to energy healing for primary issue, close with herbal tea for integration."

**Got:** Session plan with 1-3 modalities ordered by priority, time per modality, materials needed. Person understands rationale + consents to proceed.

**If fail:** Person unsure? Default to holistic sequence (Step 7) — breathwork + visualization universally safe, no materials. Frame as gentle starting point.

### Step 3: Guide Energetic Connection

Coach person into grounded, centered state before any energy work begins.

1. Invite sit or stand, feet flat, spine straight
2. Guide slow breathing: "Breathe in 4 counts, hold 2, breathe out 6 counts"
3. Lead grounding visualization: "Imagine roots from feet into earth, drawing up stable, warm energy"
4. Direct attention to hands: "Notice warmth, tingling, pulsing in palms"
5. Help set clear intention: "State silently what you intend healing for"
6. Working on another person? Remind ask permission before touching

**Got:** Person reports warmth or activation in hands. Calmer + more focused. Intention clearly held.

**If fail:** Can't settle into grounded state? Extend breathwork from Step 7 before returning. Reassure difficulty normal + not sign of inability. Suggest focus on breathing rhythm without forcing calm.

### Step 4: Coach Energy Healing

Guide person through hands-on or hands-hovering technique over affected area or energy center.

```
Chakra Correspondence (for targeted energy work):
┌──────────┬──────────────┬────────────────────────────────────────┐
│ Chakra   │ Location     │ Associated With                        │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Root     │ Base of spine│ Safety, grounding, physical vitality   │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Sacral   │ Below navel  │ Emotions, creativity, fluid balance    │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Solar    │ Upper abdomen│ Willpower, digestion, confidence       │
│ Plexus   │              │                                        │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Heart    │ Center chest │ Love, grief, compassion, circulation   │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Throat   │ Throat       │ Communication, expression, thyroid     │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Third Eye│ Forehead     │ Intuition, vision, mental clarity      │
├──────────┼──────────────┼────────────────────────────────────────┤
│ Crown    │ Top of head  │ Connection, higher awareness, sleep    │
└──────────┴──────────────┴────────────────────────────────────────┘
```

1. "Hold hands 5-10 cm above area, or lightly on it"
2. "Stay 3-5 minutes, breathing steady"
3. "What do you notice? Heat, cold, tingling, pulsing, pulling feeling?"
4. Stuck energy (dense, cold, static)? "Visualize light dissolving blockage"
5. Depleted energy (hollow, cool)? "Visualize warm light filling area"
6. "Follow intuition — move to related areas if drawn to"
7. "To close, sweep hands from head to feet, 5-10 cm from body, three times"

**Got:** Person reports warmth, relaxation, tingling, emotional release. Hands may feel temperature changes or pulsing. Session length: 15-30 minutes.

**If fail:** No sensation? Guide focus to heart center (most universally responsive), extend hold time to 7-10 minutes. Uncomfortable with touch? Confirm hands-hovering. Reassure energy work requires presence not belief — return to grounding in Step 3 if focus drifted.

### Step 5: Guide Herbal Remedy Preparation

Herbal support appropriate? Guide preparation from available materials.

```
Herbal First Aid Formulary:
┌───────────────┬─────────────────┬───────────────────────────────────┐
│ Condition     │ Herb/Material   │ Preparation                       │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Minor wound   │ Yarrow leaf     │ Chew or crush to poultice; apply  │
│               │                 │ directly to clean wound            │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Inflammation  │ Willow bark     │ Steep inner bark in hot water     │
│               │                 │ 15 min; drink as tea (contains    │
│               │                 │ salicin — natural aspirin)        │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Digestive     │ Mint, ginger,   │ Steep fresh or dried leaves/root  │
│ upset         │ chamomile       │ in hot water 10 min; sip slowly   │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Anxiety/sleep │ Chamomile,      │ Steep flowers/leaves in hot water │
│               │ lavender        │ 10 min; drink before rest         │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Insect sting  │ Plantain leaf   │ Chew leaf to poultice; apply to   │
│               │                 │ sting site for 10-15 min          │
├───────────────┼─────────────────┼───────────────────────────────────┤
│ Immune support│ Elderberry,     │ Simmer berries/root 20 min;       │
│               │ echinacea root  │ drink 1 cup 2-3x daily            │
└───────────────┴─────────────────┴───────────────────────────────────┘

CAUTION: Positive identification essential before ingesting any plant.
See `forage-plants` for identification protocols.
Use `purify-water` for safe water and `make-fire` for heating.
```

Walk through each prep step, confirming plant ID at each stage.

**Got:** Prepared remedy appropriate to condition, from positively identified materials with clean water.

**If fail:** Plant ID uncertain? Advise against ingestion. External poultices carry less risk but still need correct plant ID. No suitable herbs? Skip + rely on other modalities.

### Step 6: Guide First Aid Stabilization

Physical injuries → coach stabilization before applying any esoteric modalities.

1. **Bleeding**: "Apply direct pressure with clean cloth, elevate above heart if possible, maintain pressure 10-15 minutes without checking"
2. **Burns**: "Cool with clean running water 10-20 minutes, cover loosely with clean cloth — no ice, no butter"
3. **Sprains**: "Rest area, apply Ice or cold water, Compress with firm but not tight wrap, Elevate"
4. **Shock signs** (pale, cold, rapid pulse, confusion): "Lie flat, elevate legs, stay warm, talk to them reassuring"
5. **Breathing difficulty**: "Sit upright, loosen clothing, coach slow breathing — 4 counts in, 6 counts out"

**Got:** Bleeding controlled, pain managed, shock prevented, person stable enough for transport or continued care.

**If fail:** Bleeding won't stop with direct pressure after 15 min? Guide pressure to arterial pressure point upstream of wound. Shock worsens? Maintain warmth + consciousness while seeking emergency help. First aid stabilization takes absolute priority over all other modalities — communicate clear.

### Step 7: Guide Holistic Techniques

These techniques stand alone or weave into any other modality.

**Breathwork** (5-10 minutes):
1. "Breathe in 4 counts, hold 2, breathe out 6 counts"
2. Pain: "Focus on breath, not pain — each exhale, imagine tension leaving that area"
3. Anxiety: "Extend exhale — breathe in 4, out 7 — activates calming response"
4. Energy: "Try rapid breathing through nose — 30 quick inhale-exhale cycles, then hold" (caution: may cause dizziness, warn them)

**Visualization** (5-10 minutes):
1. "Imagine healing light — whatever color feels right — entering through top of head"
2. "Direct that light toward area needing attention"
3. "See light dissolving any darkness, congestion, pain"
4. "Let it expand to fill entire body"
5. "Imagine body enclosed in protective sphere of that light"

**Body Scan** (10-15 minutes):
1. "Start at top of head"
2. "Move attention slowly downward through each body region"
3. "At each region, notice: tension, temperature, sensation, emotion"
4. "Where you find blockage, breathe into that area 3-5 breaths"
5. "Continue down to soles of feet"
6. Note any areas they report for targeted follow-up

**Got:** Person reports increased relaxation, reduced pain perception, emotional release. Body scan identifies specific areas for targeted follow-up.

**If fail:** Can't focus on visualization? Simplify to breath-only. Body scan triggers emotional distress? Slow down + offer option to skip that body region. Reassure goal never to force through resistance.

### Step 8: Close + Follow Through

1. Allow 5-10 minutes quiet rest after session
2. Offer water (see `purify-water` if in wilderness)
3. Ask: "How do you feel compared to when we started?"
4. Note areas that shifted + any that remain unchanged
5. Recommend ongoing self-care: continued breathwork, herbal tea, rest
6. Energy work: advise extra water + rest for remainder of day
7. Herbal remedies: specify dosage + frequency (typically 2-3 times daily for teas)
8. Suggest follow-up if condition ongoing

**Got:** Person reports improvement or at least no worsening. Follow-up plan in place for ongoing conditions.

**If fail:** Condition worsened? Reassess (return to Step 1) + consider different modality. Persistent or serious physical conditions → recommend conventional medical attention. These modalities complementary, not replacements for professional care.

## Checks

- [ ] Holistic assessment completed before picking modalities
- [ ] Physical injuries stabilized before esoteric modalities applied
- [ ] Person grounded + centered before beginning energy work
- [ ] Any herbs used positively identified (see `forage-plants`)
- [ ] Water used for remedies safe (see `purify-water`)
- [ ] Consent obtained before hands-on or energy-directed work
- [ ] Session included closing integration period + follow-up plan
- [ ] No modality forced through person's resistance
- [ ] AI coached without claiming to transmit or channel energy itself

## Pitfalls

- **Skipping physical stabilization**: Energy work on bleeding wound is irresponsible — always guide stabilization first
- **Misidentified herbs**: Incorrect plant ID can cause poisoning — doubt → advise against ingestion
- **Rushing grounding**: Ungrounded person attempting energy work transfers agitation — invest time in Step 3
- **Overriding person's autonomy**: Never insist on continuing technique they find uncomfortable — healing requires trust
- **Substituting for professional care**: These modalities complement but do not replace emergency medicine or pharmaceutical treatment
- **Ignoring emotional release**: Energy work can surface grief, anger, memories — hold space without trying to fix or interpret
- **AI overstepping**: AI guides process + provides knowledge but does not claim to diagnose, prescribe, transmit healing energy

## See Also

- `heal` — AI self-directed variant for internal subsystem assessment + rebalancing
- `meditate-guidance` — meditation builds focused awareness underpinning effective healing work
- `remote-viewing-guidance` — shares non-local awareness coaching techniques useful for intuitive assessment
- `mindfulness` — situational awareness + rapid grounding techniques support practitioner presence
- `tai-chi` — qi cultivation through tai chi complements energetic healing modalities
- `forage-plants` — source material for herbal remedies; covers safe plant identification
- `purify-water` — safe water needed for herbal preparations + post-session hydration
- `make-fire` — required for heating water for herbal teas + infusions
