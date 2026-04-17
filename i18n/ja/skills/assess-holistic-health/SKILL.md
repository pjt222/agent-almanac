---
name: assess-holistic-health
description: >
  ヒルデガルト・フォン・ビンゲンの『Causae et Curae』に基づく気質ベースの健康評価を
  実施する。四気質（多血質、胆汁質、憂鬱質、粘液質）、元素対応（風、火、土、水）を
  評価し、再バランスのための食事療法と生活習慣の推奨を提供する。ヒルデガルト的な
  用語で体質タイプを理解する時、不均衡（疲労、消化不良、精神的な霧）を経験して
  ホリスティックなガイダンスが必要な時、気質別の食事推奨を求める時、中世の体液医学を
  研究する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, temperament, humors, causae-et-curae, holistic-health, elements
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# ホリスティック健康の評価

ヒルデガルト・フォン・ビンゲンの*Causae et Curae*に基づく気質システムを通じて健康を評価し、四気質、元素のバランス、食事療法と生活習慣の推奨を提供する。

## 使用タイミング

- ヒルデガルト的な用語で体質タイプ（気質）を理解したい時
- 不均衡（疲労、イライラ、消化不良、精神的な霧）を経験してホリスティックなガイダンスが必要な時
- 気質に基づく食事推奨が必要な時
- ヒルデガルトの健康原則をウェルネスプラクティスに統合する時
- 気質、元素、健康の関係を理解したい時
- 中世の体液医学を研究している時

## 入力

- **必須**: 現在の症状または健康上の懸念（身体的、精神的、感情的）
- **必須**: 気質評価質問への回答（体質、習慣、嗜好）
- **任意**: 年齢、性別、一般的な健康歴（文脈のため）
- **任意**: 現在の季節（季節調整推奨のため）
- **任意**: 既存の食事制限または嗜好
- **任意**: 以前の評価で判明した気質

## 手順

### ステップ1: 気質評価

観察と構造化された質問を通じて優勢な気質を判定する。

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

**期待結果:** 優勢気質と副次気質が特定され、主要な体質傾向を示すスコアプロファイルが得られる。

**失敗時:** すべてのスコアが2-3ポイント以内の場合、その人はバランスのとれた気質である（ヒルデガルトのシステムでは珍しい）。極端を避ける一般的な推奨（非常に熱いまたは非常に冷たい食べ物は避ける）で進める。

### ステップ2: 元素バランスの評価

現在の状態が元素的性質の過剰、不足、またはバランスを反映しているか評価する。

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

**期待結果:** 1-2つの元素不均衡の特定（例: 「水の過剰と火の不足」= 低活力を伴う冷え/湿りパターン）。

**失敗時:** 症状パターンが不明確または矛盾する場合、優勢気質の反対の性質をデフォルトとする。例: 胆汁質（熱/乾）が不調を感じている場合、火の過剰の可能性 → 冷却/加湿を推奨する。

### ステップ3: 食事推奨

ヒルデガルトの*Physica*と*Causae et Curae*に従い、元素の過剰または不足を再バランスするための食品を処方する。

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

**期待結果:** 気質と現在の不均衡に合わせた具体的な食品推奨。「推奨/適量/避ける」の明確なカテゴリー付き。

**失敗時:** 食事制限が推奨に従うことを妨げる場合（例: ベジタリアンでラムが食べられない）、同じ元素カテゴリー（温め/冷却/加湿/乾燥）内で代替する。各カテゴリー内の植物性オプションを参照する。

### ステップ4: 生活習慣と季節調整

再バランスを支援する非食事的プラクティスを推奨する: 睡眠、運動、祈り、季節のリズム。

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

**期待結果:** 特定された不均衡に対処し、ヒルデガルトのホリスティックな見解（身体、心、精神、自然）に沿った3-5つの具体的な生活習慣推奨。

**失敗時:** 推奨が圧倒的に感じられる場合、食事の変更1つと生活習慣の変更1つを優先する。完全な再バランスには数週間から数ヶ月かかる — 小さく始める。

### ステップ5: 統合とモニタリング

タイムライン、モニタリングガイドライン、再評価のタイミングを提供する。

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

**期待結果:** ユーザーが変更実施の明確なタイムライン、モニタリングプラクティス、再評価の基準を持つ。

**失敗時:** ユーザーが1-2週間後に悪化を報告した場合、過矯正を再評価する。例: 胆汁質タイプに温め食品を多く追加しすぎると火の過剰を引き起こす可能性がある。一時的に中立な食品に戻す。

## バリデーション

- [ ] 優勢タイプと副次タイプが特定された気質評価が完了している
- [ ] 元素不均衡が特定されている（風/火/土/水の過剰/不足）
- [ ] 「推奨/適量/避ける」カテゴリー付きの食事推奨が提供されている
- [ ] スペルトとガランガル（ヒルデガルトの万能食材）が禁忌でない限り含まれている
- [ ] 生活習慣推奨が不均衡に対処している（グラウンディング、冷却、刺激など）
- [ ] 該当する場合、季節調整が記録されている
- [ ] 統合タイムラインが提供されている（第1-2週、第3-4週、第5-8週）
- [ ] モニタリングと再評価トリガーが文書化されている
- [ ] これはホリスティックガイダンスであり、医学的診断ではないことがユーザーに伝えられている

## よくある落とし穴

1. **硬直的なタイプ分け**: ほとんどの人はブレンドである。単一の気質アイデンティティを強制しない
2. **季節の無視**: 冬の憂鬱質は夏の憂鬱質とは異なる食品が必要
3. **過矯正**: 反対の性質を過剰に追加すると新たな不均衡を生む可能性がある。段階的に行う
4. **現代食品の混乱**: ヒルデガルトの食品は12世紀ヨーロッパの食事を反映している。同じ元素的性質を持つ入手可能な食品に適応する
5. **速い結果の期待**: 気質は体質的なもの; 再バランスには数週間から数ヶ月かかる
6. **食事の孤立化**: ヒルデガルトのシステムはホリスティック。生活習慣/精神的統合なしの食事だけでは不完全
7. **精神的要素の軽視**: *Causae et Curae*は身体と魂を統合する。祈り、瞑想、徳は健康の一部である

## 関連スキル

- `formulate-herbal-remedy` — 気質の再バランスを支援するハーブの使用（温め/冷却植物）
- `practice-viriditas` — 精神的プラクティスがホリスティックな健康統合を支援する
- `consult-natural-history` — *Physica*の食品には気質的・元素的性質がある
- `meditate`（esotericドメイン） — 気質不均衡に合わせた瞑想プラクティス
- `heal`（esotericドメイン） — 特定の不均衡に対する評価後の癒しのモダリティ
- `plan-garden-calendar`（gardeningドメイン） — ヒルデガルトのカレンダーに沿った季節的な食物栽培
