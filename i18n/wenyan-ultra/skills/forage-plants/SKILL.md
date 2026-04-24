---
name: forage-plants
locale: wenyan-ultra
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

# 採野植

野中識並安集可食與用之野植。

## 用

- 野或生中補食
- 須藥或用植（繩、絨、驅蟲）
- 識營周植以安（避毒種）
- 長野境中採擴糧

## 入

- **必**：可採生境（林、草、濕、岸）
- **必**：察細植徵之能（葉形、排、花構）
- **可**：該域之野導或參
- **可**：盛植之器
- **可**：採之刀
- **可**：備火與水（見 `make-fire`、`purify-water`）

## 行

### 一：先知致命植

學食前先學何將殺爾。諸域高險之科與種宜記。

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

得：可一見識域中最危植而不混於食種。

敗：此諸科中任植不確→勿食。偽正（食致命）費命。偽負（略安植）費餐。恒偏慎。

### 二：讀生境

異境產異資。集前察域。

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

得：識所在境類並有候食種之短列。

敗：生疏境或植多樣低（密針林、漠）→焦於八步諸通種。旱境察仙人掌掌片（Opuntia）、mesquite 豆、或橡實。深林察松、樺、椴之內皮（形成層）為急卡路里。

### 三：以多徵識

勿以單徵識植。用多徵法。

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

得：依至少 5 匹徵之正識。可名其種並釋何以非險似。

敗：任徵不匹爾參→勿食。置而試他候。似植為採毒之首因——野胡蘿蔔（食）對毒芹（致命）於莖標與味異而共葉形。

### 四：施通食性試（僅急）

此試為全不識植無參而饑之末徑。須 24+ 時且載險。

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

得：全試後得試食植，然較正識信少。

敗：任階有應→吐或若已吞則促嘔。飲水。勿重試同植。換種。嘔或瀉→焦於水與息而後續試他植。

### 五：持續採

唯取所需並保植群。

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

得：合量正識之植料，採不毀源群。

敗：植群過小（<10 株）→僅取符樣或尋大群。生中過採可解，然短期境中保護使資於後日可用。

### 六：備食

多野食植受益於或須備。

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

得：植料清、依種適備、可食。

敗：無火以烹（見 `make-fire`）→限採於生可食種。備後極苦→植或含高單寧或生物鹼——勿強食。棄而試他種。

### 七：察應

縱正識之植或致個人應。

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

得：1-2 時無不應。可食正量。

敗：微應（胃不適、微噁）→止食、補水、息。應當數時內過。重應（腫、吸難、亂、速心）乃醫急——立求助。唯於醫導下且吞入 1 時內方促嘔。

### 八：建識——通五

自溫帶北半多處可尋五植始。先熟此五後擴。

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

得：可以多徵一見識諸五通植並知何部食、何以備。

敗：此五於爾域無（如漠、高極、熱帶）→察域參。此五限於溫帶。熱帶：椰、蕉/芭、芋（必烹）、麵包果、moringa。旱：仙人掌（Opuntia）、mesquite、龍舌蘭。

## 驗

- [ ] 知域中致命植並可一見識
- [ ] 已察境並列候食種
- [ ] 各植以至少 5 徵識（多徵法）
- [ ] 已確非險似
- [ ] 持續採（諸群不過 1/3）
- [ ] 備法合種
- [ ] 先食小試量並察 1-2 時
- [ ] 於食全量前無不良應

## 忌

- **單徵識**：「三葉如 clover」不足。諸毒植與食共獨徵。恒用全多徵表
- **胡蘿科混**：Apiaceae 科（胡蘿、parsnip、parsley）含常食與北半最致命植。除非專級確→避
- **生中採菇**：菇卡路里微而含地上最致命物。生境中險益比劣
- **新植食過多**：縱安植於量或致消擾，尤腸未習時。自小始
- **忽備求**：生 fiddlehead、生接骨果、未浸橡實——某熟可食而生微毒
- **於污域採**：路邊（鉛、排）、農邊（殺）、工域或有技可食而污植

## 參

- `make-fire` — 烹採植所需；多種須煮或烤以安或可口
- `purify-water` — 洗採植與浸/煮備法須清水
