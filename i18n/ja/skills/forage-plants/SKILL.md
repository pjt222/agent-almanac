---
name: forage-plants
description: >
  食用および有用な野生植物を同定し安全に採取する。安全規則と致死性植物の認識、
  生息地の読解、複数特徴による同定方法、汎用食用テスト、持続可能な収穫実践、
  調理方法、反応モニタリング、初心者向けの汎用種による知識構築を網羅する。
  野生またはサバイバル環境での食料供給の補完時、薬用または実用植物が必要な時、
  キャンプ周辺の植物の安全性確認時、または採取により利用可能な食料を延長する
  長期シナリオ時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: advanced
  language: natural
  tags: bushcraft, foraging, plants, edible, survival, wilderness, botany
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 野生植物の採取

野生環境で食用および有用な野生植物を同定し安全に採取する。

## 使用タイミング

- 野生またはサバイバル環境で食料供給を補完する必要がある時
- 薬用または実用植物（コーデージ、火口、防虫剤）が必要な時
- キャンプ周辺の植物を安全のために同定したい時（有毒種の回避）
- 採取により利用可能な食料を延長する長期野生シナリオ

## 入力

- **必須**: 採取する生息地（森林、草地、湿地、海岸線）
- **必須**: 植物の微細な詳細（葉の形状、配置、花の構造）を観察する能力
- **任意**: その地域のフィールドガイドまたは参考資料
- **任意**: 採取した植物を入れる容器
- **任意**: 収穫用のナイフ
- **任意**: 調理のための火と水（`make-fire`、`purify-water`参照）

## 手順

### ステップ1: まず致死性植物を知る

何を食べるかを学ぶ前に、何があなたを殺すかを学ぶ。あなたの地域のこれらの高リスク科と種を記憶する。

```
Critical "Never Eat" Plants (Northern Hemisphere):
┌─────────────────────┬────────────────────────────────┬─────────────────────┐
│ Plant               │ Key Identification             │ Danger              │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Water hemlock       │ Hollow, chambered stem base;   │ Deadly in minutes.  │
│ (Cicuta)            │ smells like carrot/parsnip;    │ Seizures, death.    │
│                     │ wet habitats; compound leaves  │ No safe dose.       │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Poison hemlock      │ Smooth stem with purple        │ Deadly. Ascending   │
│ (Conium maculatum)  │ blotches; musty smell;         │ paralysis.          │
│                     │ finely divided leaves          │                     │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Destroying angel /  │ White mushroom; white gills;   │ Deadly (liver       │
│ Death cap (Amanita) │ ring on stem; cup (volva)      │ failure in 3-5      │
│                     │ at base; grows near trees      │ days). No antidote. │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Castor bean         │ Large star-shaped leaves;      │ Seeds contain ricin. │
│ (Ricinus communis)  │ spiny seed pods                │ Deadly if chewed.   │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Foxglove            │ Tall spike of tubular flowers; │ Cardiac glycosides. │
│ (Digitalis)         │ fuzzy, wrinkled leaves         │ Heart failure.      │
├─────────────────────┼────────────────────────────────┼─────────────────────┤
│ Nightshade family   │ Some edible (tomato, pepper),  │ Berries and foliage │
│ (Solanum, Atropa)   │ many toxic; 5-petaled flowers; │ of wild species can │
│                     │ alternate leaves               │ be lethal.          │
└─────────────────────┴────────────────────────────────┴─────────────────────┘

Absolute Rules:
1. NEVER eat a plant you cannot positively identify
2. NEVER eat white or red berries unless specifically identified as safe
3. NEVER eat mushrooms in a survival situation unless expert-level confident
4. NEVER eat plants with milky or discolored sap (exceptions exist but require expertise)
5. NEVER eat plants from the carrot/parsley family (Apiaceae) unless certain — this family contains the deadliest plants alongside the most common herbs
```

**期待結果:** 自分の地域で最も危険な植物を一目で認識でき、食用種と混同しない。

**失敗時:** これらの科のいずれかの植物について不確実な場合、食べない。偽陽性（致死性植物を食べる）のコストは死である。偽陰性（安全な植物をスキップする）のコストは食事1回分の損失にすぎない。常に慎重側に判断する。

### ステップ2: 生息地を読む

異なる生息地は異なる資源を産出する。採取前にエリアを調査する。

```
Habitat-to-Resource Mapping:
┌──────────────────┬─────────────────────────────┬──────────────────────────┐
│ Habitat          │ Common Edible Plants        │ Look for                 │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Open meadow /    │ Dandelion, clover, plantain,│ Sunny, disturbed ground  │
│ field edges      │ chicory, wild onion,        │ with diverse low plants  │
│                  │ lamb's quarters             │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Forest floor     │ Wood sorrel, ramps (spring),│ Dappled shade; look near │
│                  │ violets, fiddleheads (spring│ logs and clearings       │
│                  │ only), nuts (fall)          │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Forest edge /    │ Berries (blackberry,        │ Transitional zone with   │
│ hedgerow         │ raspberry, elderberry),     │ maximum species diversity │
│                  │ rose hips, hawthorn         │                          │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Wetland / stream │ Cattail, watercress,        │ Moist soil, standing or  │
│ bank             │ wild rice, arrowhead        │ slow water               │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Shoreline /      │ Seaweed (kelp, dulse, nori),│ Rocky intertidal zones,  │
│ coastal          │ sea lettuce, glasswort      │ salt marshes             │
├──────────────────┼─────────────────────────────┼──────────────────────────┤
│ Disturbed ground │ Lamb's quarters, amaranth,  │ Trailsides, old fields, │
│ (ruderal)        │ purslane, chickweed,        │ roadsides (avoid        │
│                  │ stinging nettle             │ herbicide areas)        │
└──────────────────┴─────────────────────────────┴──────────────────────────┘
```

**期待結果:** 自分がいる生息地タイプを特定し、探すべき食用種のショートリストができている。

**失敗時:** 生息地が馴染みがないか植物多様性が低い場合（密生した針葉樹林、砂漠）、ステップ8の汎用種に集中する。乾燥環境ではサボテンのパッド（ウチワサボテン）、メスキートの莢、またはオークのドングリを探す。深い森林では、緊急カロリー源として松、白樺、またはシナノキの内樹皮（形成層）を探す。

### ステップ3: 複数の特徴を使用して同定する

単一の特徴で植物を同定しない。複数特徴法を使用する。

```
Identification Checklist — Confirm ALL of the following:

1. LEAF SHAPE AND MARGIN
   - Simple or compound?
   - Smooth, toothed, or lobed?
   - Pointed or rounded?

2. LEAF ARRANGEMENT
   - Alternate, opposite, or whorled on the stem?
   - Basal rosette?

3. STEM CHARACTERISTICS
   - Round, square, or ridged?
   - Hollow or solid?
   - Hairy, smooth, or thorny?

4. FLOWER STRUCTURE (if present)
   - Number of petals
   - Color
   - Symmetry (radial or bilateral)
   - Arrangement (spike, cluster, umbel, single)

5. SMELL
   - Crush a leaf: minty, oniony, bitter, no scent?
   - Some families have distinctive smells (mint = square stem + aromatic)

6. HABITAT AND SEASON
   - Where is it growing? (wet, dry, sun, shade)
   - What time of year? (confirms seasonal species)

7. ROOT/RHIZOME (dig one sample)
   - Bulb, taproot, fibrous, or rhizome?
   - Color and smell of the root

Rule: You need a match on ALL features, not just some.
      A single mismatch means you have the wrong plant.
```

**期待結果:** 少なくとも5つの一致する特徴に基づく正の同定。種を名前で挙げ、なぜ危険な類似種ではないかを説明できる。

**失敗時:** いずれかの特徴が参考資料と一致しない場合、その植物を食べない。脇に置いて別の候補に移る。類似種は採取中毒の主な原因である — ワイルドキャロット（食用）vs. ポイズンヘムロック（致死）は茎の模様と匂いが異なるが葉の形状は共通。

### ステップ4: 汎用食用テストの適用（緊急時のみ）

このテストは参考資料がなく完全に未知の植物で、飢餓に直面している場合の最後の手段である。24時間以上かかり、リスクを伴う。

```
Universal Edibility Test Protocol:
(Only use when: no field guide, no known species, genuinely starving)

1. SEPARATE the plant into parts: leaves, stems, roots, flowers, seeds
   (each part must be tested independently)

2. SMELL the plant part — reject if strongly bitter or acrid

3. SKIN CONTACT: rub the plant part on inner wrist
   Wait 15 minutes — reject if burning, rash, or numbness

4. LIP TEST: touch plant part to corner of lip
   Wait 15 minutes — reject if burning, tingling, or numbness

5. TONGUE TEST: place on tongue, do not chew
   Wait 15 minutes — reject if unpleasant reaction

6. CHEW TEST: chew and hold in mouth, do not swallow
   Wait 15 minutes — reject if bitter, soapy, burning

7. SWALLOW TEST: swallow a small amount (teaspoon)
   Wait 8 hours — eat nothing else during this time
   Reject if nausea, cramps, diarrhea, or any ill effect

8. If no reaction after 8 hours: eat a small handful
   Wait another 8 hours
   If still no reaction: the plant part is likely safe

CRITICAL WARNINGS:
- Test ONLY ONE plant part at a time
- Do NOT test mushrooms with this method (toxins can be delayed 24-72 hrs)
- Do NOT test plants with milky sap
- Stay hydrated throughout the test
- This test does NOT detect all toxins (cumulative toxins, carcinogens)
```

**期待結果:** 完全なテストプロトコル後、暫定的な食用植物が得られるが、正の同定よりも確実性は低い。

**失敗時:** いずれかの段階で反応があった場合、吐き出すか、嚥下した場合は嘔吐を誘発する。水を飲む。同じ植物を再テストしない。別の種に移る。嘔吐や下痢が起こった場合、別の植物でテストを再開する前に水分補給と休息に集中する。

### ステップ5: 持続可能に収穫する

必要な分だけ取り、植物個体群を保全する。

```
Sustainable Harvesting Rules:
1. Never take more than 1/3 of any plant stand
2. Never pull entire plants when leaves or fruits will do
3. Cut cleanly with a knife rather than tearing
4. Spread harvesting across a wide area
5. Leave root systems intact for perennials
6. Never harvest rare or protected species
7. Avoid plants near roads (exhaust contamination),
   agricultural fields (pesticides), or industrial areas

Harvest by Plant Part:
┌──────────────┬───────────────────────────────────────────────┐
│ Plant Part   │ Harvest Method                                │
├──────────────┼───────────────────────────────────────────────┤
│ Leaves       │ Pick individual leaves; leave at least 2/3    │
│              │ of the plant's foliage                        │
├──────────────┼───────────────────────────────────────────────┤
│ Roots/tubers │ Dig carefully; replant any root crown or      │
│              │ small tubers to regenerate                    │
├──────────────┼───────────────────────────────────────────────┤
│ Berries/fruit│ Pick ripe fruit only; leave some for wildlife │
│              │ and seed dispersal                            │
├──────────────┼───────────────────────────────────────────────┤
│ Bark/cambium │ Only harvest from downed or already damaged   │
│              │ trees; never ring-bark a living tree          │
├──────────────┼───────────────────────────────────────────────┤
│ Seeds/nuts   │ Collect from the ground when possible;        │
│              │ leave enough for wildlife and regeneration    │
└──────────────┴───────────────────────────────────────────────┘
```

**期待結果:** 正確に同定された植物材料の妥当な量が、供給源の個体群を破壊することなく収穫されている。

**失敗時:** 植物の群生が小さすぎる場合（10個体未満）、少量のサンプルのみ取るか、他のより大きな個体群を見つける。サバイバル状況での過剰収穫は理解できるが、短期的なシナリオでは保全により今後数日間リソースが利用可能であり続ける。

### ステップ6: 食用の準備

多くの食用野生植物は調理から恩恵を受けるか、調理を必要とする。

```
Preparation Methods:
┌──────────────┬──────────────────────────────┬──────────────────────────┐
│ Method       │ When to Use                  │ How                      │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Raw          │ Known-safe species like       │ Wash in purified water;  │
│              │ dandelion, wood sorrel, most  │ eat fresh               │
│              │ berries, watercress           │                          │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Boiled       │ Reduces bitterness, breaks   │ Boil 5-15 min; discard  │
│              │ down mild toxins; required    │ water for bitter plants  │
│              │ for nettle, dock, fiddleheads │ (leaching)              │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Double-boiled│ Plants with significant      │ Boil 10 min, discard    │
│ (leached)    │ oxalates or tannins (acorns, │ water; boil again in    │
│              │ dock)                        │ fresh water              │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Roasted      │ Roots, tubers, seeds, nuts   │ Place in coals or near  │
│              │                              │ fire; cook until soft    │
│              │                              │ or dry                   │
├──────────────┼──────────────────────────────┼──────────────────────────┤
│ Dried        │ Preservation for later use;  │ Air dry in sun/wind or  │
│              │ concentrates calories in      │ near fire (not in       │
│              │ seeds and roots              │ direct flame)            │
└──────────────┴──────────────────────────────┴──────────────────────────┘

Key Preparation Rules:
- Always wash plants in purified water before eating
- Cook any plant from wet or contaminated habitats
- Boil stinging nettle for 2+ minutes to neutralize stinging hairs
- Boil fiddlehead ferns thoroughly (raw fiddleheads are mildly toxic)
- Leach acorns in multiple changes of water until bitterness is gone
```

**期待結果:** 植物材料がきれいで、その種に適切に調理され、食べる準備ができている。

**失敗時:** 調理用の火がない場合（`make-fire`参照）、生で食べても安全な種に採取を限定する。調理後も味が極度に苦い場合、植物に高レベルのタンニンまたはアルカロイドが含まれている可能性がある — 無理に食べない。破棄して別の種を試す。

### ステップ7: 反応のモニタリング

正しく同定された植物でも個人的な反応を引き起こすことがある。

```
Reaction Monitoring Protocol:
1. Eat a small quantity first (a few leaves or one berry)
2. Wait 1-2 hours before eating more
3. Watch for:
   - Nausea or stomach cramps → stop eating, drink water
   - Tingling or numbness in mouth → spit out, rinse mouth
   - Skin rash or hives → possible contact allergy
   - Diarrhea → stop eating, focus on hydration
   - Dizziness or vision changes → possible toxic reaction,
     seek help immediately

If a reaction occurs:
- Stop eating the plant immediately
- Drink large amounts of water
- If severe (difficulty breathing, confusion), this is a medical emergency
- Note which plant and which part caused the reaction
- Do not re-eat that plant
```

**期待結果:** 1-2時間後に副反応なし。その後通常量を食べることができる。

**失敗時:** 軽い反応（胃の不快感、軽い吐き気）が起こった場合、その植物の摂取を中止し、水分補給して休む。反応は数時間以内に治まるはずである。重篤な反応（腫れ、呼吸困難、混乱、頻脈）が起こった場合、これは医療緊急事態である — すぐに助けを求める。嘔吐の誘発は医療指導がありかつ摂取から1時間以内の場合のみ行う。

### ステップ8: 知識を構築する — 汎用5種

温帯北半球のほとんどで見られる5種の植物から始める。レパートリーを広げる前にこれらをマスターする。

```
The Universal Five (Beginner-Friendly Edible Plants):

1. DANDELION (Taraxacum officinale)
   Habitat: Lawns, fields, disturbed ground (nearly everywhere)
   ID: Basal rosette of toothed leaves; hollow stem; yellow
       composite flower; milky sap (exception to the milky sap rule)
   Edible: Entire plant — leaves (raw/cooked), flowers (raw/fried),
           roots (roasted as coffee substitute)
   Season: Year-round; best in spring before flowering

2. BROADLEAF PLANTAIN (Plantago major)
   Habitat: Lawns, paths, disturbed ground
   ID: Basal rosette of oval leaves with parallel veins;
       tall seed spike; leaves are tough and fibrous
   Edible: Young leaves (raw in salads, older leaves boiled);
           seeds (edible raw or ground)
   Medicinal: Crushed leaves used as poultice for insect bites/stings
   Season: Spring through fall

3. WHITE CLOVER (Trifolium repens)
   Habitat: Lawns, meadows, roadsides
   ID: Three round leaflets (sometimes four); white round flower
       heads; creeping ground cover
   Edible: Flowers (raw or dried for tea); young leaves (raw or
           cooked — cook to improve digestibility)
   Season: Flowers in spring/summer; leaves year-round in mild climates

4. CATTAIL (Typha latifolia / T. angustifolia)
   Habitat: Wetlands, pond edges, ditches, marshes
   ID: Tall (1-3 m); long flat sword-like leaves; distinctive brown
       cigar-shaped seed head
   Edible: Shoot base/heart (raw, spring); pollen (flour substitute,
           summer); rhizome (starchy, peeled and boiled/roasted,
           year-round); young flower spike (boiled, early summer)
   Utility: Fluff = tinder and insulation; leaves = weaving material
   Season: Different parts edible year-round

5. WOOD SORREL (Oxalis spp.)
   Habitat: Forest floor, shaded areas, gardens
   ID: Three heart-shaped leaflets (resembles clover but leaflets are
       notched/heart-shaped); small 5-petaled yellow, white, or pink
       flowers; leaves fold at night
   Edible: Leaves and flowers (raw — pleasant lemony/sour taste)
   Caution: Contains oxalic acid; eat in moderation (not as a staple)
   Season: Spring through fall

Progression:
  Master these 5 → Add 5 regional species → Add 5 more → Build to 20+
  (20 positively known species provides meaningful foraging capability)
```

**期待結果:** 5種すべてを複数の特徴で一目で同定でき、どの部位を食べ、どう調理するかを知っている。

**失敗時:** これら5種がすべて自分の地域に存在しない場合（例：砂漠、高緯度北極圏、熱帯）、地域固有の参考資料を参照する。これら5種は温帯地域に特有である。熱帯環境ではココナッツヤシ、バナナ/プランテン、タロイモ（調理必須）、パンノキ、モリンガを探す。乾燥地域ではウチワサボテン（Opuntia）、メスキート、アガベを探す。

## バリデーション

- [ ] その地域の致死性植物が既知で一目で同定できる
- [ ] 生息地が調査され、食用種のショートリストが作成された
- [ ] 各植物が少なくとも5つの特徴で同定された（複数特徴法）
- [ ] 植物が危険な類似種でないことが確認された
- [ ] 収穫が持続可能だった（いかなる群生の1/3を超えない）
- [ ] 調理方法がその種に適切だった
- [ ] 少量のテスト部分が最初に食べられ、1-2時間のモニタリング期間があった
- [ ] 全量を食べる前に副反応が発生しなかった

## よくある落とし穴

- **単一特徴での同定**: 「クローバーのように3枚の葉がある」では不十分。多くの有毒植物が食用種と個々の特徴を共有する。常に完全な複数特徴チェックリストを使用する
- **セリ科の混同**: セリ科（Apiaceae）（ニンジン、パースニップ、パセリ）は一般的な食材と北半球で最も致死的な植物の両方を含む。専門家レベルの確信がない限り避ける
- **サバイバル状況でのキノコ採取**: キノコはカロリー的価値が低く、地球上で最も致命的な生物の一部を含む。サバイバルの文脈ではリスク-リワード比が非常に悪い
- **新しい植物を大量に食べる**: 安全な植物でも大量に摂取すると消化不良を引き起こす可能性があり、特に腸が慣れていない場合。少量から始める
- **調理要件を無視する**: 生のゼンマイ、生のエルダーベリー、あく抜きしていないドングリ — 調理すれば食用だが生では軽度に有毒な植物がある
- **汚染地域付近での採取**: 道路脇（鉛、排気ガス）、農地の縁（農薬）、工業地帯の植物は技術的には食用でも汚染されている可能性がある

## 関連スキル

- `make-fire` — 採取した植物の調理に必要。多くの種は安全または美味に食べるために煮沸または焙焼が必要
- `purify-water` — 採取した植物の洗浄およびあく抜き/煮沸調理方法にきれいな水が必要
