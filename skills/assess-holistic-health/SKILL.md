---
name: assess-holistic-health
description: >
  Conduct temperament-based health assessment from Hildegard von Bingen's
  Causae et Curae. Evaluates the four temperaments (sanguine, choleric,
  melancholic, phlegmatic), elemental correspondences (air, fire, earth, water),
  and provides dietary and lifestyle recommendations for rebalancing. Use when
  understanding constitutional type in Hildegardian terms, experiencing
  imbalance (fatigue, digestive issues, mental fog) needing holistic guidance,
  seeking dietary recommendations by temperament, or researching medieval
  humoral medicine.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, temperament, humors, causae-et-curae, holistic-health, elements
---

# Assess Holistic Health

Evaluate health through Hildegard von Bingen's temperament system from *Causae et Curae*, assessing the four temperaments, elemental balance, and providing dietary and lifestyle recommendations.

## When to Use

- You want to understand your constitutional type (temperament) in Hildegardian terms
- You are experiencing imbalance (fatigue, irritability, digestive issues, mental fog) and need holistic guidance
- You need dietary recommendations based on temperament
- You are integrating Hildegard's health principles into a wellness practice
- You want to understand the relationship between temperament, elements, and health
- You are researching medieval humoral medicine

## Inputs

- **Required**: Current symptoms or health concerns (physical, mental, emotional)
- **Required**: Responses to temperament assessment questions (constitution, habits, preferences)
- **Optional**: Age, sex, and general health history (for context)
- **Optional**: Current season (for seasonal adjustment recommendations)
- **Optional**: Existing dietary restrictions or preferences
- **Optional**: Known temperament from previous assessment

## Procedure

### Step 1: Temperament Assessment

Determine the dominant temperament through observation and structured questions.

```
The Four Temperaments in Causae et Curae:
┌──────────────┬──────────┬────────────┬─────────────┬──────────────┐
│ Temperament  │ Element  │ Qualities  │ Physiology  │ Psychology   │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ SANGUINE     │ Air      │ Hot, Moist │ Ruddy face, │ Cheerful,    │
│              │          │            │ plump build,│ sociable,    │
│              │          │            │ good sleep  │ optimistic   │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ CHOLERIC     │ Fire     │ Hot, Dry   │ Lean, wiry, │ Ambitious,   │
│              │          │            │ quick pulse,│ irritable,   │
│              │          │            │ warm skin   │ decisive     │
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ MELANCHOLIC  │ Earth    │ Cold, Dry  │ Thin, dark  │ Analytical,  │
│              │          │            │ features,   │ introspective│
│              │          │            │ slow pulse  │ prone to fear│
├──────────────┼──────────┼────────────┼─────────────┼──────────────┤
│ PHLEGMATIC   │ Water    │ Cold, Moist│ Pale, soft  │ Calm, slow,  │
│              │          │            │ skin, heavy │ apathetic,   │
│              │          │            │ build       │ easygoing    │
└──────────────┴──────────┴────────────┴─────────────┴──────────────┘

Assessment Questions (score 0-3 per statement: 0=never, 1=rarely, 2=often, 3=always):

SANGUINE (Air):
[ ] I am naturally optimistic and sociable
[ ] I have a ruddy complexion and rarely feel cold
[ ] I sleep well and wake refreshed
[ ] I enjoy variety and new experiences
[ ] I gain weight easily but can also lose it
TOTAL: ___/15

CHOLERIC (Fire):
[ ] I am driven, goal-oriented, and impatient with delays
[ ] I have a lean build and high metabolism
[ ] I run warm and prefer cool environments
[ ] I make quick decisions and am often irritated by slowness
[ ] I have strong digestion and rarely feel cold
TOTAL: ___/15

MELANCHOLIC (Earth):
[ ] I am introspective, analytical, and prone to worry
[ ] I have a thin frame and struggle to gain weight
[ ] I feel cold easily and prefer warm environments
[ ] I am detail-oriented and perfectionistic
[ ] I have irregular digestion (constipation or sluggishness)
TOTAL: ___/15

PHLEGMATIC (Water):
[ ] I am calm, easygoing, and avoid conflict
[ ] I have a soft, pale complexion and retain water easily
[ ] I sleep long hours and still feel tired
[ ] I move slowly and prefer routine
[ ] I have slow digestion and feel heavy after meals
TOTAL: ___/15

Scoring:
- Dominant: Highest score (usually 9-15)
- Secondary: Second highest (usually 6-9)
- Most people are a blend of 1-2 temperaments
- Scores within 2-3 points indicate balanced type (rare)
```

**Expected:** Dominant and secondary temperament identified, with score profile showing primary constitutional tendencies.

**On failure:** If all scores are within 2-3 points of each other, the person has a balanced temperament (unusual in Hildegard's system). Proceed with general recommendations avoiding extremes (no very hot or very cold foods).

### Step 2: Elemental Balance Assessment

Evaluate whether the current state reflects excess, deficiency, or balance of elemental qualities.

```
Elemental Imbalance Patterns:
┌─────────────────┬────────────────────┬─────────────────────────┐
│ Imbalance       │ Symptoms           │ Causation               │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS AIR      │ Anxiety, gas,      │ Too much raw food,      │
│ (hot/moist)     │ scattered thoughts │ erratic schedule        │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT AIR   │ Depression, rigid  │ Isolation, sedentary,   │
│                 │ thinking, isolation│ routine without joy     │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS FIRE     │ Inflammation, acid │ Overwork, spicy foods,  │
│ (hot/dry)       │ reflux, anger      │ stimulants, summer heat │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT FIRE  │ Cold extremities,  │ Sedentary, raw/cold     │
│                 │ low motivation,    │ foods, winter isolation │
│                 │ weak digestion     │                         │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS EARTH    │ Stiffness, rigidity│ Overwork without rest,  │
│ (cold/dry)      │ constipation, fear │ dry foods, isolation    │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT EARTH │ Ungrounded, flighty│ Lack of routine, travel,│
│                 │ anxious, diarrhea  │ insufficient protein    │
├─────────────────┼────────────────────┼─────────────────────────┤
│ EXCESS WATER    │ Edema, lethargy,   │ Sedentary, cold/damp    │
│ (cold/moist)    │ mucus, depression  │ foods, damp environment │
├─────────────────┼────────────────────┼─────────────────────────┤
│ DEFICIENT WATER │ Dry skin/mucous,   │ Dehydration, hot/dry    │
│                 │ hard stools, thirst│ climate, excess heat    │
└─────────────────┴────────────────────┴─────────────────────────┘

Assessment:
1. Match current symptoms to imbalance patterns
2. Consider season: Winter increases cold/dry (earth), Summer increases hot/dry (fire)
3. Note recent life changes: Travel, stress, diet shifts, illness
4. Determine if imbalance is acute (recent onset) or chronic (longstanding pattern)
```

**Expected:** Identification of 1-2 elemental imbalances (e.g., "Excess water with deficient fire" = cold/damp pattern with low vitality).

**On failure:** If symptom pattern is unclear or contradictory, default to the opposite qualities of the dominant temperament. Example: Choleric (hot/dry) feeling unwell likely has excess fire → recommend cooling/moistening.

### Step 3: Dietary Recommendations

Prescribe foods to rebalance elemental excess or deficiency, following Hildegard's *Physica* and *Causae et Curae*.

```
Hildegard's Dietary Principles:

FOODS BY ELEMENTAL QUALITY:
┌──────────────┬────────────────────────────────────────────┐
│ Quality      │ Foods                                      │
├──────────────┼────────────────────────────────────────────┤
│ WARMING      │ Spelt, fennel, ginger, galangal, cinnamon, │
│              │ nutmeg, lamb, chestnuts, cooked vegetables │
├──────────────┼────────────────────────────────────────────┤
│ COOLING      │ Lettuce, cucumber, pears, plums, barley,   │
│              │ fish, raw salads, diluted wine             │
├──────────────┼────────────────────────────────────────────┤
│ MOISTENING   │ Butter, cream, honey, figs, grapes, wine,  │
│              │ soups, stews, broths                       │
├──────────────┼────────────────────────────────────────────┤
│ DRYING       │ Rye, beans, lentils, roasted meats,        │
│              │ nuts (in moderation), aged cheese          │
└──────────────┴────────────────────────────────────────────┘

TEMPERAMENT-SPECIFIC DIETARY GUIDELINES:

SANGUINE (Air — Hot/Moist) — Generally Balanced:
- Maintain variety, avoid dietary extremes
- Favor: Whole grains (spelt, oats), balanced proteins, vegetables
- Moderate: Rich foods, sweets (tend toward weight gain)
- Avoid: Excessive cold or excessively hot foods

CHOLERIC (Fire — Hot/Dry) — Cooling/Moistening Diet:
- Cool the fire, prevent inflammation and irritability
- Favor: Lettuce, cucumber, pears, fish, barley, diluted wine
- Moderate: Lamb, roasted meats, aged cheese
- Avoid: Spicy foods, garlic (raw), strong wine, overeating meat

MELANCHOLIC (Earth — Cold/Dry) — Warming/Moistening Diet:
- Warm the constitution, ease constipation and fear
- Favor: Spelt, fennel, ginger, cooked vegetables, soups, butter
- Moderate: Raw foods, salads (only in summer)
- Avoid: Rye, beans, cold foods, fasting

PHLEGMATIC (Water — Cold/Moist) — Warming/Drying Diet:
- Dry the dampness, increase vitality and motivation
- Favor: Spelt, chestnuts, roasted meats, ginger, galangal, nutmeg
- Moderate: Dairy, sweet fruits, wine
- Avoid: Cold foods, raw salads, excess liquids, pork

SPELT (Dinkel) — Hildegard's Universal Grain:
"Spelt is the best grain. It is warm, nourishing, and strong.
Whoever eats it has good flesh and blood, a happy mind, and a joyful spirit."
(*Physica*, Book I, Chapter 2)
- Recommended for ALL temperaments as foundation grain
- Superior to wheat, which Hildegard considered inferior

GALANGAL — Universal Digestive Spice:
"Let one who has pain in the heart or who has become weak in the heart
eat galangal, and he will be restored to health."
(*Physica*, Book I, Chapter 157)
- Warming, stimulating, heart-supporting
- Especially for melancholic and phlegmatic types
```

**Expected:** Specific food recommendations tailored to temperament and current imbalance, with clear "favor/moderate/avoid" categories.

**On failure:** If dietary restrictions prevent following recommendations (e.g., vegetarian unable to eat lamb), substitute within the same elemental category (warming/cooling/moistening/drying). Consult the plant-based options within each category.

### Step 4: Lifestyle and Seasonal Adjustments

Recommend non-dietary practices to support rebalancing: sleep, movement, prayer, seasonal rhythms.

```
Lifestyle Recommendations by Imbalance:

EXCESS AIR (scattered, anxious):
- Practice grounding: barefoot walking, gardening, repetitive handwork
- Reduce stimulation: Limit news, social media, multitasking
- Routine: Regular meal and sleep times
- Meditation: Breath-focused (shamatha), body scan

DEFICIENT AIR (depressed, isolated):
- Social engagement: Community, conversation, singing
- Variety: New experiences, travel, learning
- Movement: Dance, walks in nature (not isolated exercise)
- Meditation: Loving-kindness (metta), gratitude practice

EXCESS FIRE (inflammation, anger):
- Cooling practices: Swim, evening walks, avoid midday sun
- Rest: Prioritize sleep, avoid overwork
- Prayer/Meditation: Contemplative, slow-paced, non-goal-oriented
- Avoid: Competitive exercise, heated arguments, stimulants

DEFICIENT FIRE (cold, unmotivated):
- Warming practices: Morning sun exposure, moderate exercise, warming baths
- Challenge: Set achievable goals, take on new projects
- Social: Engage with energetic, positive people
- Movement: Brisk walking, dancing, labor

EXCESS EARTH (rigid, constipated):
- Flexibility: Yoga, stretching, massage
- Creativity: Art, music, play (non-structured)
- Moisture: Warm baths, soups, hydration
- Release: Journaling, confession, letting go of control

DEFICIENT EARTH (ungrounded, anxious):
- Grounding: Gardening, working with hands, routine
- Structure: Daily schedule, meal times, sleep rhythm
- Protein: Adequate protein at each meal
- Meditation: Walking meditation, mindful labor

EXCESS WATER (lethargic, damp):
- Movement: Daily exercise to promote circulation and sweating
- Warmth: Sauna, hot baths, warm clothing, avoid damp environments
- Stimulation: Engage with challenging tasks, avoid excessive rest
- Rhythm: Wake early, avoid napping

DEFICIENT WATER (dry, rigid):
- Hydration: Adequate water, broths, herbal teas
- Rest: Prioritize sleep, reduce activity if overworked
- Moisture: Humidifier in dry climates, oil massage
- Ease: Release pressure, practice self-compassion

SEASONAL ADJUSTMENTS (all temperaments):
- Spring (Air rising): Light diet, cleansing herbs, outdoor activity
- Summer (Fire peak): Cooling foods, swim, rest in heat of day
- Autumn (Earth settling): Harvest foods, prepare for winter, grounding practices
- Winter (Water depth): Warming foods, rest more, contemplation, less activity
```

**Expected:** 3-5 specific lifestyle recommendations that address the identified imbalance and align with Hildegard's holistic view (body, mind, spirit, nature).

**On failure:** If recommendations feel overwhelming, prioritize ONE dietary change and ONE lifestyle change to begin. Full rebalancing takes weeks to months — start small.

### Step 5: Integration and Monitoring

Provide timeline, monitoring guidelines, and when to reassess.

```
Integration Protocol:
Week 1-2: Implement dietary changes gradually
- Replace 1-2 meals per day with temperament-appropriate foods
- Avoid abrupt elimination (can cause stress/imbalance)
- Note energy, digestion, sleep quality, mood daily

Week 3-4: Add lifestyle practices
- Choose 1-2 lifestyle recommendations to integrate
- Consistency matters more than intensity
- Continue dietary changes; they should feel habitual by now

Week 5-8: Assess progress
- Are original symptoms improving?
- Has energy/mood shifted?
- Any new imbalances emerging? (Sometimes correcting one reveals another)

Reassessment Triggers:
- No improvement after 4 weeks → Reassess temperament; may have misidentified
- Partial improvement → Continue current plan, allow more time (8-12 weeks)
- New symptoms → Overcorrection possible; reduce intensity of interventions
- Seasonal change → Adjust foods/practices for new season

Long-Term Practice:
Hildegard's system is preventive and lifelong. The goal is not to "fix" and return
to old habits, but to develop a sustainable, temperament-harmonious way of living.
```

**Expected:** User has clear timeline for change implementation, monitoring practices, and criteria for reassessment.

**On failure:** If user reports feeling worse after 1-2 weeks, reassess for overcorrection. Example: Adding too many warming foods to a choleric type could cause excess fire. Dial back to neutral foods temporarily.

## Validation Checklist

- [ ] Temperament assessment completed with dominant and secondary types identified
- [ ] Elemental imbalance(s) identified (excess/deficiency of air/fire/earth/water)
- [ ] Dietary recommendations provided with "favor/moderate/avoid" categories
- [ ] Spelt and galangal (Hildegard's universals) included unless contraindicated
- [ ] Lifestyle recommendations address imbalance (grounding, cooling, stimulating, etc.)
- [ ] Seasonal adjustments noted if applicable
- [ ] Integration timeline provided (weeks 1-2, 3-4, 5-8)
- [ ] Monitoring and reassessment triggers documented
- [ ] User informed this is holistic guidance, not medical diagnosis

## Common Pitfalls

1. **Rigid Type-Casting**: Most people are blends. Don't force a single temperament identity
2. **Ignoring Season**: Winter melancholic needs different foods than summer melancholic
3. **Overcorrecting**: Adding excessive opposite qualities can create new imbalance. Go gradually
4. **Modern Food Confusion**: Hildegard's foods reflect 12th-century European diet. Adapt to available foods with same elemental qualities
5. **Expecting Fast Results**: Temperament is constitutional; rebalancing takes weeks to months
6. **Isolating Diet**: Hildegard's system is holistic. Diet alone without lifestyle/spiritual integration is incomplete
7. **Neglecting Spiritual Component**: *Causae et Curae* integrates body and soul. Prayer, meditation, and virtue are part of health

## Related Skills

- `formulate-herbal-remedy` — Use herbs to support temperament rebalancing (warming/cooling plants)
- `practice-viriditas` — Spiritual practice supports holistic health integration
- `consult-natural-history` — Foods in *Physica* have temperamental and elemental properties
- `meditate` (esoteric domain) — Meditation practices tailored to temperament imbalance
- `heal` (esoteric domain) — Post-assessment healing modalities for specific imbalances
- `plan-garden-calendar` (gardening domain) — Seasonal food growing aligned with Hildegard's calendar
