---
name: assess-holistic-health
locale: wenyan-lite
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

# 評整體健康

藉 Hildegard von Bingen 之 *Causae et Curae* 之氣質為基行健康評估。評四氣質（多血、膽汁、抑鬱、黏液）、元素對應（風、火、土、水），並供再平衡之飲食與生活建議。

## 適用時機

- 欲以 Hildegard 之語解己之體質型（氣質）
- 經失衡（疲、躁、消化不良、神霧）而需整體指引
- 須依氣質之飲食建議
- 將 Hildegard 之健康原則整合入養生實踐
- 欲解氣質、元素、健康之關
- 研中世體液醫學

## 輸入

- **必要**：當前症狀或健康關切（身、心、情）
- **必要**：氣質評估問題之回應（體質、習、好）
- **選擇性**：齡、性、一般健康史（為情境）
- **選擇性**：當前季（為季節調整建議）
- **選擇性**：既有飲食限制或偏好
- **選擇性**：自先前評估之已知氣質

## 步驟

### 步驟一：氣質評估

藉觀察與結構化問題判主氣質。

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

**預期：** 主氣質與次氣質已辨，附呈主要體質傾向之分數剖面。

**失敗時：** 若一切分數於 2-3 點之內，受評者有平衡氣質（於 Hildegard 之系中為罕）。以避極之一般建議行（無極熱或極冷之食）。

### 步驟二：元素平衡評估

評當前態反映元素質之過、缺或衡。

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

**預期：** 1-2 元素失衡之識別（如「過水附缺火」= 冷／濕模式附低活力）。

**失敗時：** 若症狀模式不清或矛盾，預設主氣質之相反質。例：膽汁（熱／乾）覺不適或為過火 → 建議涼／潤。

### 步驟三：飲食建議

依 Hildegard 之 *Physica* 與 *Causae et Curae* 處食以再平衡元素之過或缺。

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

**預期：** 為氣質與當前失衡量身定制之特定食物建議，附明確「favor/moderate/avoid」之類別。

**失敗時：** 若飲食限制阻循建議（如素食者不能食羔），於同元素類別內代（warming/cooling/moistening/drying）。諮各類別內之植物選項。

### 步驟四：生活與季節調整

建議非飲食實踐以支再平衡：眠、動、禱、季節節律。

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

**預期：** 3-5 特定生活建議，應對所辨之失衡並合 Hildegard 之整體觀（身、心、靈、自然）。

**失敗時：** 若建議覺壓力大，先優一飲食變與一生活變起。全再平衡費週至月——自小起。

### 步驟五：整合與監測

供時程、監測指引、何時重評。

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

**預期：** 使用者具明確之變動實施時程、監測實踐、重評準則。

**失敗時：** 若使用者於 1-2 週後報覺更糟，重評過度修正。例：對膽汁型加過多溫食或致過火。暫退至中性食。

## 驗證

- [ ] 氣質評估已成，主與次型已辨
- [ ] 元素失衡已辨（風／火／土／水之過或缺）
- [ ] 飲食建議已供，附「favor/moderate/avoid」類別
- [ ] 除非禁忌，含 Spelt 與 galangal（Hildegard 之通用）
- [ ] 生活建議應失衡（接地、涼、激等）
- [ ] 若適用注季節調整
- [ ] 整合時程已供（週 1-2、3-4、5-8）
- [ ] 監測與重評觸發已記
- [ ] 已告使用者：此為整體指引，非醫學診斷

## 常見陷阱

1. **剛性類型化**：多數人為混。勿強單一氣質身份
2. **忽季**：冬之抑鬱者所需之食異於夏之
3. **過修**：加過多相反質可生新失衡。漸進
4. **現代食之混**：Hildegard 之食反映十二世紀歐洲飲食。以同元素質之可用食適配
5. **期速效**：氣質為體質；再平衡費週至月
6. **孤立飲食**：Hildegard 之系為整體。獨飲食而無生活／靈整合不全
7. **疏靈面**：*Causae et Curae* 整合身與魂。禱、冥想、德為健康之部

## 相關技能

- `formulate-herbal-remedy` — 用草以支氣質再平衡（溫／涼之植）
- `practice-viriditas` — 靈實踐支整體健康整合
- `consult-natural-history` — *Physica* 之食有氣質與元素性質
- `meditate`（esoteric 領域）— 為氣質失衡量身之冥想實踐
- `heal`（esoteric 領域）— 評後對特定失衡之愈合法
- `plan-garden-calendar`（gardening 領域）— 合 Hildegard 之曆之季節食生長
