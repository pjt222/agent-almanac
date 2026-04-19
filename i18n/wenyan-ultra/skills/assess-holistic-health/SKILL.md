---
name: assess-holistic-health
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

# 全健評

由 Hildegard von Bingen《Causae et Curae》之氣質系評健。四氣（多血、膽汁、黑膽、痰）、元（氣、火、土、水）、食居薦以復衡。

## 用

- 欲解 Hildegard 體質類→用
- 經失衡（疲、躁、消化症、霧）需全導→用
- 需按氣食薦→用
- 整 Hildegard 健律入養→用
- 解氣、元、健關→用
- 究中世體液醫→用

## 入

- **必**：今症或健憂（身、心、情）
- **必**：氣評問之答（體質、習、好）
- **可**：齡、性、健史（脈）
- **可**：今季（為季調薦）
- **可**：既食限或好
- **可**：前評知氣

## 行

### 一：氣評

由觀與構問定主氣。

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

得：主與次氣識，附分形示主體質傾。

敗：諸分皆 2-3 內→人有衡氣（Hildegard 系罕）。進通薦避極（無極熱或極冷食）。

### 二：元衡評

評今態反元質之過、缺、衡。

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

得：1-2 元失衡識（如「水過火缺」=冷濕紋附低活）。

敗：症紋不清或反→默主氣對之質。例：膽汁（熱乾）不適或過火→薦涼濕。

### 三：食薦

按 Hildegard《Physica》與《Causae et Curae》方食以復元過缺。

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

得：合氣與今失衡之具食薦附明「宜/節/避」類。

敗：食限阻循薦（如素食不食羊）→於同元類（暖/涼/濕/乾）替。察各類之植選。

### 四：居與季調

薦食外實以助復衡：眠、行、禱、季律。

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

得：3-5 具居薦對識失衡且合 Hildegard 全觀（身、心、靈、自然）。

敗：薦壓→先一食變、一居變。全復需週至月——始小。

### 五：整與監

供時、監、何時重評。

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

得：用者有清變施時、監實、重評準。

敗：用者報 1-2 週後感劣→重評為過正。例：膽汁加過多暖食或致過火。回中食暫。

## 驗

- [ ] 氣評完附主與次類識
- [ ] 元失衡識（過/缺氣/火/土/水）
- [ ] 食薦附「宜/節/避」類
- [ ] 斯佩耳特與良姜（Hildegard 普）含除非禁
- [ ] 居薦對失衡（接地、涼、激等）
- [ ] 季調若可註
- [ ] 整時供（週 1-2、3-4、5-8）
- [ ] 監與重評觸文
- [ ] 用者知此為全導非醫診

## 忌

1. **剛類定**：多人為混。勿強單氣身分
2. **忽季**：冬黑膽需異於夏黑膽之食
3. **過正**：加過對質致新失衡。漸進
4. **現食混**：Hildegard 之食反十二世紀歐食。適同元質之可達食
5. **盼速效**：氣為體質；復需週至月
6. **孤食**：Hildegard 系全。獨食而無居/靈整不全
7. **忽靈分**：《Causae et Curae》整身與魂。禱、冥、德為健分

## 參

- `formulate-herbal-remedy` —— 用草助氣復（暖/涼植）
- `practice-viriditas` —— 靈實助全健整
- `consult-natural-history` —— 《Physica》食有氣與元性
- `meditate`（esoteric 域）—— 對氣失衡之冥實
- `heal`（esoteric 域）—— 評後對具失衡之癒法
- `plan-garden-calendar`（gardening 域）—— 對 Hildegard 曆之季食
