---
name: forage-plants
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Identify and safely gather edible and useful wild plants. Covers safety rules
  and deadly plant recognition, habitat reading, multi-feature identification
  methodology, the universal edibility test, sustainable harvesting practices,
  preparation methods, reaction monitoring, and building knowledge with
  beginner-friendly universal species. Use when supplementing food supply in a
  wilderness or survival setting, needing medicinal or utility plants, identifying
  plants around camp for safety, or in long-term scenarios where foraging extends
  available rations.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: advanced
  language: natural
  tags: bushcraft, foraging, plants, edible, survival, wilderness, botany
---

# 採野菜

於荒野識並安採可食與有用之野生植物。

## 適用時機

- 爾需於荒野或生存情境補食物
- 爾需藥用或實用植物（繩索、火絨、驅蟲）
- 爾欲為安全識營地周之植物（避有毒種）
- 長期荒野情境中採覓延口糧

## 輸入

- **必要**：可採之棲息地（林、草原、濕地、岸）
- **必要**：察植物細節（葉形、排、花結構）之能
- **選擇性**：該區之野外指南或參考物
- **選擇性**：收植物之容器
- **選擇性**：採之刀
- **選擇性**：備之火與水（見 `make-fire`、`purify-water`）

## 步驟

### 步驟一：先知致命之植

學可食前，先學可殺爾者。記爾區之高風險科與種。

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

**預期：** 爾可於視即識爾區最危之植物且不與可食種混。

**失敗時：** 若於此諸科之任一植物不定，勿食之。偽陽（食致命植物）之代價為死。偽陰（略安植物）之代價為失一餐。恒偏於慎。

### 步驟二：讀棲息地

異棲息地生異資源。採前先察區。

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

**預期：** 爾識所處之棲息地類型並有可能可食種之短單。

**失敗時：** 若棲息地不熟或植物多樣性低（密針葉林、荒漠），聚於步驟八之通用種。於乾環境，尋仙人掌掌（Opuntia）、牧豆莢或橡樹之橡實。於深林，尋松、樺、椴樹之內皮（形成層）為急熱量。

### 步驟三：以多特徵識

勿以單一特徵識植物。用多特徵法。

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

**預期：** 於至少 5 配之特徵之正識。爾可名種並解其非危之相似種。

**失敗時：** 若任特徵不配爾之參考，勿食此植物。置之並移至他候選。相似種為採覓中毒之主因——野胡蘿蔔（可食）vs 毒毒芹（致命）異於莖紋與味而共葉形。

### 步驟四：施通用食性測試（僅急）

此測試為無參考物且面餓之全不知植物之末策。需 24+ 小時且有險。

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

**預期：** 於全測試協議後，爾有一暫可食之植物，然較正識為不定。

**失敗時：** 若於任階段發生反應，吐出或若已咽則催吐。飲水。勿再測同植物。移至異種。若嘔或瀉發生，聚於水與休而後以另一植物續測。

### 步驟五：可持續採

僅取所需並保植物群。

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

**預期：** 合理之量已正識之植物，採之不毀源群。

**失敗時：** 若植物群過小（不足 10 個體），僅取少樣或於他處尋更大群。生存中過採可解，但於短期情境，保育確資源於後日可得。

### 步驟六：備食

多可食野生植物於備中受惠或需之。

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

**預期：** 植物材料已淨、按種適備、可食。

**失敗時：** 若無火以烹（見 `make-fire`），限採於可生食之種。若備後味極苦，植物或含高量之鞣或生物鹼——勿強食之。棄之並試他種。

### 步驟七：監反應

即正識之植物亦可致個體反應。

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

**預期：** 1-2 小時後無不良反應。爾可後食正份量。

**失敗時：** 若發輕反應（胃不適、輕嘔），停食該植物，補水並休。反應應於數小時內過。若發重反應（腫、呼吸困難、混亂、心跳速），乃醫急——即求助。唯於醫指令下且食入 1 小時內催吐。

### 步驟八：建爾之知——通用五植

自溫帶北半球多處皆有之五植始。主此五而後擴爾之譜。

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

**預期：** 爾可以多特徵於視即識所有五通用植物，並知何部可食及如何備。

**失敗時：** 若爾區無此五（如荒漠、高北極、熱帶），參區特定參考。此五乃溫帶之特。於熱帶，尋椰樹、芭蕉、芋（須烹）、麵包果、辣木。於乾區，尋仙人掌（Opuntia）、牧豆、龍舌蘭。

## 驗證

- [ ] 區之致命植物已知且可於視識
- [ ] 棲息地已察，可能可食種已列短單
- [ ] 每植物以至少 5 特徵識（多特徵法）
- [ ] 植物已確非危之相似種
- [ ] 採已可持續（不逾任群之 1/3）
- [ ] 備法於種適
- [ ] 先食小測份並行 1-2 小時監
- [ ] 於食全份前無不良反應

## 常見陷阱

- **單特徵識**：「其有三葉如苜蓿」不足。多毒植物與可食者共個別特徵。恒用完整多特徵清單
- **胡蘿蔔科之混**：Apiaceae 科（胡蘿蔔、歐洲防風草、歐芹）含常見食物與北半球最致命之植物。非專家級定則避之
- **生存情境中採蘑**：蘑熱量低而含地球最致命之生物。於生存情境中險-報比極劣
- **食新植物過多**：即安植物於量亦可致消化不適，尤於爾腸未習。始小
- **忽備之需**：生蕨苗、生接骨木莓、未浸之橡實——某些烹時可食而生時輕毒之植物
- **於污染區近採覓**：路側（鉛、廢氣）、農邊（農藥）、工業區或有技術上可食而污染之植物

## 相關技能

- `make-fire` — 烹採之植物所需；多種需煮或烤以安或可口
- `purify-water` — 洗採植物與行浸/煮備法需淨水
