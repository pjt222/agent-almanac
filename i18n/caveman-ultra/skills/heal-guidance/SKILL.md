---
name: heal-guidance
locale: caveman-ultra
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

Guide person through layered healing: energetic + herbal + physical + holistic. AI = informed coach, does NOT transmit energy.

## Use When

- Physical ailment/injury → structured stabilization
- Energetic imbalance (fatigue, emotional stagnation, sleep) → self-healing
- Herbal remedies + plant access (see `forage-plants`)
- Holistic session (breathwork, visualization, body scan)
- Post-meditation integration → directed attention (see `meditate-guidance`)

## In

- **Required**: condition/intention desc (physical/energetic/emotional/wellness)
- **Required**: resources (herbs, clean water, first aid, quiet space)
- **Optional**: experience w/ energy work (default: none)
- **Optional**: contraindic. (allergies, meds, injuries, pregnancy)
- **Optional**: time (default 30-60 min)

## Do

### Step 1: Holistic assessment

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

Guide self-assessment: "Where discomfort? When start? Better/worse by what? Cause?" Listen + reflect back.

→ Clear primary complaint + dimension + prioritized plan. Person feels heard.

**If err:** unclear → body scan (Step 7) → locate tension/heat/blocked before modality.

### Step 2: Recommend modalities

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

Explain combination: "Begin breathwork → ground. Energy healing → primary issue. Close → herbal tea → integrate."

→ Session plan: 1-3 modalities prioritized + time + materials. Rationale understood + consent.

**If err:** unsure → default holistic (Step 7). Breath + visualization safe + no materials. Gentle start.

### Step 3: Energetic connection

1. Sit/stand, feet flat, spine straight
2. Breath slow: in 4 / hold 2 / out 6
3. Ground visual: "Roots from feet into earth, drawing warm energy"
4. Attend hands: "Warmth, tingling, pulsing in palms?"
5. Clear intention: "State silently what healing for"
6. If working on another → permission before touch

→ Warmth/activation in hands. Calmer, focused. Intention clear.

**If err:** can't settle → extend Step 7 breathwork first. Difficulty normal ≠ inability. Focus rhythm, don't force calm.

### Step 4: Coach energy healing

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

1. "Hands 5-10 cm above area, or lightly on it"
2. "3-5 min, breathe steady"
3. "Heat, cold, tingling, pulsing, pulling?"
4. Stuck energy (dense, cold, static) → "light dissolving blockage"
5. Depleted (hollow, cool) → "warm light filling area"
6. "Follow intuition — move to related areas"
7. Close: "sweep head→feet, 5-10 cm from body, 3×"

→ Warmth, relaxation, tingling, emotional release. Temp change / pulsing possible. 15-30 min.

**If err:** no sensation → heart center (most responsive), extend to 7-10 min. Uncomfortable w/ touch → hands-hovering. Presence > belief. Drift → Step 3 grounding.

### Step 5: Herbal remedy prep

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

Walk through each step, confirm ID each stage.

→ Prepared remedy, positive ID plants, clean water.

**If err:** ID uncertain → no ingest. External poultice less risk but still need ID. No suitable → skip + other modalities.

### Step 6: First aid stabilization

Physical injuries → stabilize before esoteric.

1. **Bleeding**: direct pressure clean cloth, elevate above heart, 10-15 min no checking
2. **Burns**: clean running water 10-20 min, loose clean cloth — NO ice, NO butter
3. **Sprains**: R.I.C.E. — Rest, Ice/cold, Compress firm not tight, Elevate
4. **Shock** (pale, cold, rapid pulse, confusion): lie flat, elevate legs, warm, talk reassuringly
5. **Breathing difficulty**: sit upright, loosen clothing, slow breath 4 in / 6 out

→ Bleeding controlled, pain managed, shock prevented, stable for transport/care.

**If err:** bleeding not stop after 15 min direct → arterial pressure point upstream. Shock worsens → maintain warmth + consciousness + emergency help. First aid = ABSOLUTE PRIORITY over all modalities. Communicate clearly.

### Step 7: Holistic techniques

Stand alone or weave into any modality.

**Breathwork** (5-10 min):
1. In 4 / hold 2 / out 6
2. Pain: focus breath not pain; exhale = tension leaving
3. Anxiety: extend exhale — in 4 / out 7 — activates calm response
4. Energy: rapid nose breath 30 cycles + hold (caution: dizziness, warn)

**Visualization** (5-10 min):
1. Healing light (any color) entering top of head
2. Direct to area needing attention
3. Light dissolves darkness/congestion/pain
4. Expand to fill body
5. Protective sphere of light around

**Body Scan** (10-15 min):
1. Top of head
2. Slow down each region
3. Notice: tension, temp, sensation, emotion
4. Blockage → breathe into area 3-5 breaths
5. Down to soles
6. Note areas for targeted follow-up

→ Increased relaxation, reduced pain perception, emotional release. Body scan → specific areas for follow-up.

**If err:** can't focus visual → breath-only. Body scan triggers distress → slow down, offer skip region. Goal ≠ force through resistance.

### Step 8: Close + follow

1. 5-10 min quiet rest
2. Offer water (`purify-water` wilderness)
3. "How feel vs start?"
4. Note shifted vs unchanged
5. Ongoing self-care: breathwork, herbal tea, rest
6. Energy work → extra water + rest rest of day
7. Herbal → specify dose + freq (usually 2-3×/day teas)
8. Follow-up if ongoing

→ Improvement or at least no worse. Follow-up plan for ongoing.

**If err:** worse → reassess (Step 1) + different modality. Persistent/serious → recommend conventional medical. Complementary, not replacement.

## Check

- [ ] Holistic assessment before modalities
- [ ] Physical stabilized before esoteric
- [ ] Grounded + centered before energy work
- [ ] Herbs positive ID (`forage-plants`)
- [ ] Water safe (`purify-water`)
- [ ] Consent before hands-on / energy
- [ ] Closing integration + follow-up plan
- [ ] No modality forced through resistance
- [ ] AI coached, no claim to transmit/channel

## Traps

- **Skip physical stabilization**: energy work on bleeding = irresponsible. Stabilize first.
- **Misidentified herbs**: incorrect ID → poison. Doubt → no ingest.
- **Rush grounding**: ungrounded → transfers agitation. Invest Step 3.
- **Override autonomy**: never insist on uncomfortable technique. Trust required.
- **Substitute for professional care**: complement not replace ER / pharma.
- **Ignore emotional release**: energy work surfaces grief/anger/memory. Hold space, no fix/interpret.
- **AI overstepping**: guides process + knowledge. NO diagnose/prescribe/transmit.

## →

- `heal` — AI self-directed internal variant
- `meditate-guidance` — meditation builds focused awareness
- `remote-viewing-guidance` — non-local awareness coaching for intuitive assessment
- `mindfulness` — situational awareness + rapid grounding
- `tai-chi` — qi cultivation complements energetic modalities
- `forage-plants` — safe plant ID for remedies
- `purify-water` — safe water for herbal prep
- `make-fire` — heat water for teas
