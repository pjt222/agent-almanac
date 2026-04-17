---
name: formulate-herbal-remedy
description: >
  ヒルデガルト・フォン・ビンゲンのPhysicaからハーブ療法を調製する。植物の同定、
  調製方法（チンキ剤、湿布、浸出液、煎じ薬）、用量ガイダンス、禁忌、12世紀の
  中世薬局方に基づく安全性レビューを網羅する。ヒルデガルト薬局方を使用して
  特定の疾患にハーブ療法が必要な時、調製方法と用量のガイダンスを求める時、
  中世のハーブ医学を研究する時、またはヒルデガルトの植物の知恵をホリスティック
  ヘルスの実践に統合する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, herbal, physica, remedy, tincture, poultice, infusion, medieval-medicine
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# ハーブ療法の処方

ヒルデガルト・フォン・ビンゲンの*Physica*に従い、中世の植物知識と調製技術を統合して伝統的なハーブ療法を調製する。

## 使用タイミング

- ヒルデガルト薬局方を使用して特定の疾患にハーブ療法が必要な時
- *Physica*の観点から植物の性質を理解したい時
- 調製方法（チンキ剤、湿布、浸出液、煎じ薬）のガイダンスが必要な時
- 伝統的な療法の用量と安全性情報が必要な時
- 中世のハーブ医学の実践を研究する時
- ヒルデガルトの植物の知恵をホリスティックヘルスの実践に統合したい時

## 入力

- **必須**: 対処する疾患または状態（例：消化不良、呼吸器の鬱血、皮膚の炎症）
- **任意**: 既知の植物の好みまたは禁忌
- **任意**: 調製の好み（長期使用にはチンキ剤、急性にはは浸出液など）
- **任意**: 使用者の気質（多血質、胆汁質、憂鬱質、粘液質）に合わせた選択のため
- **任意**: 季節と生鮮ハーブ vs. 乾燥ハーブの入手可能性

## 手順

### ステップ1: Physicaでの植物の同定

疾患をヒルデガルトの*Physica*（第I-IX巻：植物、元素、樹木、石、魚、鳥、動物、爬虫類、金属）から適切な植物と照合する。

```
Common Ailments → Physica Plants:
┌─────────────────────┬──────────────────────┬────────────────────┐
│ Ailment             │ Primary Plants        │ Physica Reference  │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Digestive upset     │ Fennel, Yarrow,      │ Book I, Ch. 1, 61  │
│ (cold pattern)      │ Ginger, Galangal     │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Respiratory         │ Lungwort, Elecampane,│ Book I, Ch. 95, 164│
│ congestion          │ Hyssop, Anise        │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Skin inflammation   │ Violet, Plantain,    │ Book I, Ch. 34, 28 │
│ (hot pattern)       │ Yarrow, Marigold     │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Nervous agitation   │ Lavender, Lemon balm,│ Book I, Ch. 40, 123│
│                     │ Chamomile, Valerian  │                    │
├─────────────────────┼──────────────────────┼────────────────────┤
│ Joint pain          │ Comfrey, St. John's  │ Book I, Ch. 21, 158│
│ (cold/damp)         │ wort, Nettle, Birch  │                    │
└─────────────────────┴──────────────────────┴────────────────────┘

Hildegard's Selection Principles:
1. Temperature: Match plant temperature to condition pattern
   - Cold conditions → warming plants (fennel, ginger, galangal)
   - Hot conditions → cooling plants (violet, plantain, lettuce)
2. Moisture: Match plant moisture to imbalance
   - Dry conditions → moistening plants (mallow, linseed)
   - Damp conditions → drying plants (yarrow, wormwood)
3. Temperament alignment: Choose plants harmonious with user's constitution
4. Seasonal availability: Fresh plants in growing season, dried in winter
```

**期待結果:** 疾患のパターン（温/冷、乾/湿）に合致し、使用者の体質に適した1～3種の植物が同定されること。

**失敗時:** 状態のパターンが不確かな場合、バランスが取れた穏やかな植物（フェンネル、カモミール、ヤロウ）をデフォルトとする。ヒルデガルトがほとんどの体質に適すると記述している植物である。

### ステップ2: 調製方法の選択

疾患の部位、急性度、植物の性質に基づいて適切な抽出・投与方法を選択する。

```
Preparation Methods from Medieval Tradition:

┌──────────────┬────────────────────┬──────────────────┬──────────────┐
│ Method       │ Best For           │ Duration         │ Shelf Life   │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ INFUSION     │ Aerial parts       │ Acute conditions │ 24 hours     │
│ (hot water)  │ (leaves, flowers)  │ Internal use     │ refrigerated │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ DECOCTION    │ Roots, bark, seeds │ Chronic use      │ 24 hours     │
│ (boiled)     │ Hard plant parts   │ Deep ailments    │ refrigerated │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ TINCTURE     │ Long-term use      │ Chronic support  │ 2-5 years    │
│ (alcohol)    │ Concentrated dose  │ Travel-friendly  │              │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ POULTICE     │ External wounds    │ Acute topical    │ Use fresh    │
│ (crushed)    │ Skin conditions    │ Inflammation     │              │
├──────────────┼────────────────────┼──────────────────┼──────────────┤
│ OIL INFUSION │ Massage, salves    │ Skin/muscle care │ 6-12 months  │
│ (oil carrier)│ External only      │ Long-term        │              │
└──────────────┴────────────────────┴──────────────────┴──────────────┘

Decision Tree:
- Internal + Acute → Infusion or decoction
- Internal + Chronic → Tincture or daily decoction
- External + Acute → Poultice
- External + Chronic → Oil infusion or salve
```

**期待結果:** 植物の部位（地上部 vs. 根）、用途（急性 vs. 慢性）、投与経路（内用 vs. 外用）に合致した調製方法が選択されること。

**失敗時:** 不確かな場合、浸出液をデフォルトとする — 初心者にとって最も安全で寛容な方法である。

### ステップ3: 用量を含む療法の調製

正確な計量と技術で調製を実行する。

```
INFUSION (for aerial parts: leaves, flowers):
1. Measure: 1 tablespoon dried herb (or 2 tablespoons fresh) per 8 oz water
2. Boil water, remove from heat
3. Add herb, cover (to preserve volatile oils), steep 10-15 minutes
4. Strain through fine mesh or cheesecloth
5. Dosage: 1 cup 2-3 times daily, or as specific ailment requires

DECOCTION (for roots, bark, seeds):
1. Measure: 1 tablespoon dried root/bark per 8 oz water
2. Combine in pot, bring to boil
3. Reduce heat, simmer covered 20-30 minutes (up to 45 for hard roots)
4. Strain while hot
5. Dosage: 1/2 cup 2-3 times daily (more concentrated than infusion)

TINCTURE (alcohol extraction, 4-6 week preparation):
1. Ratio: 1 part dried herb to 5 parts menstruum (40-60% alcohol)
2. Combine in amber glass jar, seal tightly
3. Shake daily, store in dark place for 4-6 weeks
4. Strain through cheesecloth, press to extract all liquid
5. Dosage: 15-30 drops (approximately 1/2 to 1 dropper) 2-3 times daily,
   diluted in water or tea

POULTICE (fresh or rehydrated dried herb):
1. Fresh: Crush or chew herb to release juices, apply directly to skin
2. Dried: Rehydrate with hot water to paste consistency
3. Apply to affected area, cover with clean cloth
4. Replace every 2-4 hours or when dry
5. Duration: Acute inflammation (24-48 hours), wounds (until healed)

OIL INFUSION (for external salves):
1. Ratio: Fill jar 3/4 with dried herb, cover completely with oil
   (olive, almond, or sunflower)
2. Method A (solar): Seal jar, place in sunny window 2-4 weeks, shake daily
3. Method B (heat): Place jar in water bath (double boiler), low heat 2-4 hours
4. Strain through cheesecloth, press herb matter to extract all oil
5. Store in dark bottle; use within 6-12 months
```

**期待結果:** 方法に従って療法が調製され、正しいハーブ対溶媒比と適切な浸漬/抽出時間が守られていること。内用または外用の用量ガイドラインが明確であること。

**失敗時:** 調製が強すぎると思われる場合（苦味、灼熱感）、半分に希釈する。弱すぎる場合（適切な用量で3日後も効果が感じられない）、次のバッチでハーブの量を50%増やす。

### ステップ4: 禁忌の文書化

安全上の懸念、薬物相互作用、療法を避けるべき集団を特定する。

```
Common Contraindications by Plant Category:

EMMENAGOGUES (stimulate menstruation):
- Plants: Pennyroyal, Rue, Mugwort, Tansy, Wormwood
- Avoid: Pregnancy (all trimesters), breastfeeding
- Caution: Heavy menstrual flow

PHYTOESTROGENS (estrogen-like activity):
- Plants: Fennel, Anise, Hops, Red clover, Licorice
- Avoid: Hormone-sensitive cancers, pregnancy
- Caution: If taking hormonal medications or birth control

BLOOD THINNERS (anticoagulant properties):
- Plants: Garlic, Ginger (high dose), Feverfew, Ginkgo
- Avoid: Before surgery (stop 2 weeks prior)
- Caution: If taking warfarin, aspirin, or other anticoagulants

HEPATOTOXIC (potential liver stress):
- Plants: Comfrey (internal use), Pennyroyal, Kava
- Avoid: Liver disease, alcohol use disorder
- Caution: Long-term high-dose use

PHOTOSENSITIZERS (increase sun sensitivity):
- Plants: St. John's wort, Angelica, Celery seed
- Avoid: Before sun exposure, with photosensitizing medications
- Caution: Fair skin, history of skin cancer

GENERAL CAUTIONS:
- Pregnancy/Breastfeeding: Most herbs lack safety data; avoid unless
  traditionally used for pregnancy (ginger, red raspberry leaf)
- Children under 2: Avoid all herbal preparations except gentle teas
  (chamomile, fennel)
- Children 2-12: Use 1/4 to 1/2 adult dose, depending on age and weight
- Elderly: Start with 1/2 dose; may be more sensitive to effects
- Chronic illness: Consult healthcare provider before use
- Surgery: Discontinue all herbs 2 weeks before scheduled surgery
```

**期待結果:** 選択した植物に関連するすべての禁忌が特定され、特定の集団（妊娠、小児、薬物相互作用）がフラグ付けされること。

**失敗時:** 禁忌が不確かな場合、使用前に資格のあるハーバリストまたは医療提供者に相談するよう助言する。デフォルトとして「専門家の指導なしに妊娠中、授乳中、または12歳未満の小児には推奨されません」とする。

### ステップ5: 安全性レビューと統合

最終確認と効果のモニタリングおよびヘルスプラクティスへの統合のガイダンス。

```
Safety Review Checklist:
- [ ] Plant correctly identified (botanical name confirmed)
- [ ] Preparation method matches plant part and condition
- [ ] Dosage is within traditional safe range
- [ ] Contraindications reviewed and documented
- [ ] User informed this is historical folk medicine, not medical advice
- [ ] Expected timeline for effect noted (acute: 1-3 days; chronic: 2-4 weeks)

Monitoring Protocol:
Days 1-3:
- Note any immediate reactions (digestive upset, skin rash, headache)
- If adverse reaction occurs, discontinue immediately
- Positive signs: Symptom improvement, increased energy, better sleep

Days 4-14:
- Assess effectiveness: Are symptoms improving?
- If no improvement by day 7 (acute) or day 14 (chronic), reassess plant selection
- If partial improvement, continue; full effect may take 2-4 weeks

Integration Notes:
- Herbal medicine works best in context: adequate sleep, whole foods diet,
  stress management, and connection to nature
- Hildegard's remedies are not isolated pharmaceutical interventions —
  they are part of a holistic health practice
- Record observations in a journal: date, remedy, dose, effects
- Seasonal adjustment: Some remedies are more effective in specific seasons
  (warming herbs in winter, cooling herbs in summer)
```

**期待結果:** 使用者が完全な情報を持つこと：療法の調製、用量、禁忌、モニタリング計画、統合の文脈。安全上の免責事項が明確であること。

**失敗時:** 使用者が自己調製に不安を示す場合、最初の調製には訓練を受けたハーバリストに相談し、自信がついたら自宅で複製することを推奨する。

## バリデーション

- [ ] 適切な温度/湿度特性を持つ植物がPhysicaから同定されている
- [ ] 調製方法が植物の部位に合致している（地上部＝浸出液、根＝煎じ薬など）
- [ ] 頻度と期間を含む用量ガイドラインが提供されている
- [ ] 禁忌が文書化されている（妊娠、薬物相互作用、特定の状態）
- [ ] モニタリングプロトコルを含む安全性レビューが完了している
- [ ] これが歴史的な民間療法であり、医学的な診断や治療ではないことが使用者に通知されている
- [ ] 効果の期待タイムラインが伝えられている（急性 vs. 慢性）

## よくある落とし穴

1. **誤同定**: 一般名の混同による誤った植物の使用。常に植物学的（ラテン語）名称を確認する
2. **過度の抽出**: 繊細な地上部を煮沸すると揮発性オイルが破壊される。煎じ薬（煮沸）ではなく浸出液（浸漬）を使用する
3. **用量不足**: 中世の調製は現代のハーブティーより強いことが多い。伝統的な比率に従う
4. **禁忌の無視**: 妊娠と薬物相互作用は深刻である。疑わしい場合は使用を控えるよう助言する
5. **現代の代替と中世の混同**: ヒルデガルトの植物はヨーロッパの中世植物相を反映している。代替品は彼女の気質体系と一致しない場合がある
6. **薬理学的速度の期待**: ハーブ医学は段階的に作用する。急性状態：1-3日。慢性：最低2-4週間
7. **単独療法への集中**: ヒルデガルトの医学はホリスティックである。療法は食事、祈り、休息、季節のリズムと統合されて最も効果的に機能する

## 関連スキル

- `assess-holistic-health` — 気質評価が植物選択に情報を提供する（冷えた体質 → 温める植物）
- `practice-viriditas` — viriditas（緑の力）との接続が植物療法への受容性を高める
- `consult-natural-history` — Physicaの宇宙論における植物のより広い文脈
- `heal`（esotericドメイン） — 療法後の健康評価と回復モニタリング
- `prepare-soil`（gardeningドメイン） — 薬用ハーブの栽培
- `maintain-hand-tools`（bushcraftドメイン） — ハーブの収穫と加工用
