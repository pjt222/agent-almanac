---
name: heal-guidance
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

Guide a person through a layered healing approach combining energetic, herbal, physical, and holistic techniques to support recovery, balance, and wellbeing. The AI acts as an informed coach — it does not claim to transmit energy, but provides structured guidance through each modality.

## When to Use

- A person describes a physical ailment or injury and wants structured guidance for stabilization and support
- Someone reports energetic imbalance (persistent fatigue, emotional stagnation, disrupted sleep) and wants coaching through self-healing techniques
- Herbal remedies are appropriate and the person has access to plant materials (see `forage-plants`)
- A person requests guidance through a holistic session combining breathwork, visualization, and body scan
- Post-meditation integration reveals areas needing directed healing attention (see `meditate-guidance`)

## Inputs

- **Required**: Description of the person's condition or intention (physical, energetic, emotional, or general wellness)
- **Required**: Available resources (herbs, clean water, first aid supplies, quiet space)
- **Optional**: Person's experience level with energy work (default: none assumed)
- **Optional**: Known contraindications (allergies, medications, injuries, pregnancy)
- **Optional**: Time available for the session (default: 30-60 minutes)

## Procedure

### Step 1: Guide Holistic Assessment

Before selecting any modality, help the person assess the full picture across physical, energetic, and emotional dimensions.

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

Guide the person through self-assessment: "Where is the discomfort? When did it start? What makes it better or worse? Any known causes?" Listen actively and reflect back what you hear to confirm understanding.

**Expected:** A clear picture of the primary complaint, its dimension (physical/energetic/emotional), and a prioritized plan of which steps to emphasize. The person feels heard and understood.

**On failure:** If the condition is unclear, guide the person through the body scan in Step 7 to locate areas of tension, heat, or blocked energy before selecting a modality.

### Step 2: Recommend Modalities

Based on the assessment, recommend one or more modalities appropriate to the situation and explain why.

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

Explain how modalities can be combined: "We could begin with breathwork to ground, move into energy healing for the primary issue, and close with an herbal tea for integration."

**Expected:** A session plan with 1-3 modalities ordered by priority, estimated time per modality, and materials needed. The person understands the rationale and consents to proceed.

**On failure:** If the person is unsure, default to the holistic sequence (Step 7) — breathwork and visualization are universally safe and require no materials. Frame it as a gentle starting point.

### Step 3: Guide Energetic Connection

Coach the person into a grounded, centered state before any energy work begins.

1. Invite them to sit or stand with feet flat, spine straight
2. Guide slow breathing: "Breathe in for 4 counts, hold for 2, breathe out for 6 counts"
3. Lead a grounding visualization: "Imagine roots extending from your feet into the earth, drawing up stable, warm energy"
4. Direct attention to the hands: "Notice any warmth, tingling, or pulsing in your palms"
5. Help them set a clear intention: "State silently what you intend healing for"
6. If they will work on another person, remind them to ask permission before touching

**Expected:** The person reports warmth or activation in the hands. They appear calmer and more focused. Intention is clearly held.

**On failure:** If they cannot settle into a grounded state, extend the breathwork from Step 7 before returning here. Reassure them that difficulty is normal and not a sign of inability. Suggest they simply focus on the breathing rhythm without forcing calm.

### Step 4: Coach Energy Healing

Guide the person through hands-on or hands-hovering technique over the affected area or energy center.

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

1. "Hold your hands 5-10 cm above the area, or lightly on it"
2. "Stay in this position for 3-5 minutes, breathing steadily"
3. "What do you notice? Heat, cold, tingling, pulsing, or a pulling feeling?"
4. If they report stuck energy (dense, cold, static): "Visualize light dissolving the blockage"
5. If they report depleted energy (hollow, cool): "Visualize warm light filling the area"
6. "Follow your intuition — move to related areas if you feel drawn to"
7. "To close, sweep your hands from head to feet, 5-10 cm from the body, three times"

**Expected:** The person reports warmth, relaxation, tingling, or emotional release. Hands may feel temperature changes or pulsing. Session length: 15-30 minutes.

**On failure:** If they notice no sensation, guide focus to the heart center (most universally responsive) and extend hold time to 7-10 minutes. If they are uncomfortable with touch, confirm hands-hovering. Reassure that energy work requires presence rather than belief — suggest returning to the grounding in Step 3 if focus has drifted.

### Step 5: Guide Herbal Remedy Preparation

When herbal support is appropriate, guide preparation from available materials.

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

CAUTION: Positive identification is essential before ingesting any plant.
See `forage-plants` for identification protocols.
Use `purify-water` for safe water and `make-fire` for heating.
```

Walk them through each preparation step, confirming plant identification at each stage.

**Expected:** A prepared remedy appropriate to the condition, made from positively identified materials with clean water.

**On failure:** If plant identification is uncertain, advise against ingestion. External poultices carry less risk but still require correct plant ID. If no suitable herbs are available, skip this step and rely on other modalities.

### Step 6: Guide First Aid Stabilization

For physical injuries, coach stabilization before applying any esoteric modalities.

1. **Bleeding**: "Apply direct pressure with a clean cloth, elevate above the heart if possible, maintain pressure for 10-15 minutes without checking"
2. **Burns**: "Cool with clean running water for 10-20 minutes, cover loosely with clean cloth — no ice, no butter"
3. **Sprains**: "Rest the area, apply Ice or cold water, Compress with a firm but not tight wrap, Elevate"
4. **Shock signs** (pale, cold, rapid pulse, confusion): "Lie flat, elevate the legs, stay warm, talk to them reassuringly"
5. **Breathing difficulty**: "Sit upright, loosen clothing, coach slow breathing — 4 counts in, 6 counts out"

**Expected:** Bleeding controlled, pain managed, shock prevented, and the person stabilized enough for transport or continued care.

**On failure:** If bleeding does not stop with direct pressure after 15 minutes, guide pressure to the arterial pressure point upstream of the wound. If shock symptoms worsen, maintain warmth and consciousness while seeking emergency help. First aid stabilization takes absolute priority over all other modalities — communicate this clearly.

### Step 7: Guide Holistic Techniques

These techniques can stand alone or weave into any other modality.

**Breathwork** (5-10 minutes):
1. "Breathe in for 4 counts, hold for 2, breathe out for 6 counts"
2. For pain: "Focus on the breath, not the pain — on each exhale, imagine tension leaving that area"
3. For anxiety: "Extend the exhale — breathe in for 4, out for 7 — this activates your calming response"
4. For energy: "Try rapid breathing through the nose — 30 quick inhale-exhale cycles, then hold" (caution: may cause dizziness, warn them)

**Visualization** (5-10 minutes):
1. "Imagine healing light — whatever color feels right — entering through the top of your head"
2. "Direct that light toward the area that needs attention"
3. "See the light dissolving any darkness, congestion, or pain"
4. "Let it expand to fill your entire body"
5. "Imagine your body enclosed in a protective sphere of that light"

**Body Scan** (10-15 minutes):
1. "Start at the top of your head"
2. "Move your attention slowly downward through each body region"
3. "At each region, notice: tension, temperature, sensation, any emotion"
4. "Where you find blockage, breathe into that area for 3-5 breaths"
5. "Continue down to the soles of your feet"
6. Note any areas they report for targeted follow-up

**Expected:** The person reports increased relaxation, reduced pain perception, or emotional release. Body scan identifies specific areas for targeted follow-up.

**On failure:** If they cannot focus on visualization, simplify to breath-only. If body scan triggers emotional distress, slow down and offer the option to skip that body region. Reassure that the goal is never to force through resistance.

### Step 8: Close and Follow Through

1. Allow 5-10 minutes of quiet rest after the session
2. Offer water (see `purify-water` if in wilderness)
3. Ask: "How do you feel compared to when we started?"
4. Note any areas that shifted and any that remain unchanged
5. Recommend ongoing self-care: continued breathwork, herbal tea, rest
6. For energy work: advise extra water and rest for the remainder of the day
7. For herbal remedies: specify dosage and frequency (typically 2-3 times daily for teas)
8. Suggest follow-up if the condition is ongoing

**Expected:** The person reports improvement or at least no worsening. A follow-up plan is in place for ongoing conditions.

**On failure:** If the condition worsened, reassess (return to Step 1) and consider a different modality. For persistent or serious physical conditions, recommend conventional medical attention — these modalities are complementary, not replacements for professional care.

## Validation

- [ ] Holistic assessment was completed before selecting modalities
- [ ] Physical injuries were stabilized before esoteric modalities were applied
- [ ] The person was grounded and centered before beginning energy work
- [ ] Any herbs used were positively identified (see `forage-plants`)
- [ ] Water used for remedies was safe (see `purify-water`)
- [ ] Consent was obtained before hands-on or energy-directed work
- [ ] Session included a closing integration period and follow-up plan
- [ ] No modality was forced through the person's resistance
- [ ] AI coached without claiming to transmit or channel energy itself

## Common Pitfalls

- **Skipping physical stabilization**: Energy work on a bleeding wound is irresponsible — always guide stabilization first
- **Misidentified herbs**: Incorrect plant identification can cause poisoning — when in doubt, advise against ingestion
- **Rushing the grounding**: An ungrounded person attempting energy work transfers agitation — invest the time in Step 3
- **Overriding the person's autonomy**: Never insist on continuing a technique they find uncomfortable — healing requires trust
- **Substituting for professional care**: These modalities complement but do not replace emergency medicine or pharmaceutical treatment
- **Ignoring emotional release**: Energy work can surface grief, anger, or memories — hold space without trying to fix or interpret
- **AI overstepping**: The AI guides process and provides knowledge but does not claim to diagnose, prescribe, or transmit healing energy

## Related Skills

- `heal` — the AI self-directed variant for internal subsystem assessment and rebalancing
- `meditate-guidance` — meditation builds the focused awareness that underpins effective healing work
- `remote-viewing-guidance` — shares non-local awareness coaching techniques useful for intuitive assessment
- `mindfulness` — situational awareness and rapid grounding techniques support practitioner presence
- `tai-chi` — qi cultivation through tai chi complements energetic healing modalities
- `forage-plants` — source material for herbal remedies; covers safe plant identification
- `purify-water` — safe water is needed for herbal preparations and post-session hydration
- `make-fire` — required for heating water for herbal teas and infusions
