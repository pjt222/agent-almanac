---
name: forage-plants
locale: wenyan
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

# 採野草

於荒野識並安取可食與有用之野植。

## 用時

- 於野或生存中補食
- 須藥或用植（繩、火絨、驅蟲）
- 於營周識植以安（避毒種）
- 久野景中，採以延糧

## 入

- **必要**：可採之境（林、草原、濕地、岸）
- **必要**：能觀植細（葉形、排、花構）
- **可選**：地之野外指或參材
- **可選**：盛採器
- **可選**：採刀
- **可選**：備之火水（見 `make-fire`、`purify-water`）

## 法

### 第一步：先知致命之植

學何可食前，先學何將殺汝。熟記汝地之高險科與種。

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

**得：** 汝目識汝地最險之植而不混於可食種。

**敗則：** 若於此諸科植有疑，勿食。誤肯（食致命）之費為死。誤否（略安植）之費為失餐。恆偏慎。

### 第二步：讀境

異境產異資。取前察域。

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

**得：** 汝識汝在何境，有宜尋之可食種短列。

**敗則：** 若境不熟或植多樣低（密針葉林、荒漠），焦於第八步之通植。旱境中尋仙人掌（Opuntia）、牧豆樹莢、或橡樹實。深林中，尋松、樺、椴之內皮（形成層）為急卡。

### 第三步：以多特識

勿以一特識植。用多特法。

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

**得：** 肯識基於至少五合特。汝可名種並釋何以非險之似植。

**敗則：** 若一特不合參，勿食。置而試他候。似植乃採毒之首因——野胡（可食）與毒芹（致命）於莖標與味異而葉形共。

### 第四步：施通可食試（唯急）

此試為無參而面餓之全不知植之末計。耗 24 時以上且帶險。

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

**得：** 全試畢後，汝有暫定可食植，然較肯 ID 較不確。

**敗則：** 若任階生反應，吐或催吐若已咽。飲水。勿重試同植。試異種。若吐或瀉現，焦於水合與休再以他植續試。

### 第五步：可續採

唯取所需，保植群。

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

**得：** 合理量之已識植，採而不毀源群。

**敗則：** 若群過小（少於十），唯取樣或他尋更大群。生存時過採可諒，然於短景中護保今後有資。

### 第六步：備食

諸可食野植多需備或得益於備。

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

**得：** 植材淨、按種宜備、可食。

**敗則：** 若無火可烹（見 `make-fire`），限採於可生食之種。若備後味極苦，植或含高單寧或生物鹼——勿強食。棄而試他種。

### 第七步：察反應

正識之植仍可致個別反應。

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

**得：** 一二時後無不良反應。可食常量。

**敗則：** 若輕反應（腹不適、輕噁），止食，水合，休。反應宜數時內過。若重反應（腫、難息、惑、速搏），乃急醫——即求助。唯於醫導下且食入一時內方可催吐。

### 第八步：建汝知——通五

自諸北溫帶皆有之五植始。熟此再擴汝目。

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

**得：** 汝以多特目識此五通植，知何部可食、如何備之。

**敗則：** 若此五汝地皆無（如荒漠、極圈、熱帶），查地特參。此五乃溫帶。熱帶中尋椰、蕉、芋（須烹）、麵包果、辣木。旱區中尋刺梨仙人掌（Opuntia）、牧豆樹、龍舌蘭。

## 驗

- [ ] 汝地致命植已知可識
- [ ] 境已察附可食短列
- [ ] 諸植用至少五特（多特法）識
- [ ] 植已確非險似
- [ ] 採可續（無逾任群三分一）
- [ ] 備法宜種
- [ ] 先食小量並察一二時
- [ ] 無反應後食常量

## 陷

- **單特識**：「三葉似苜蓿」不足。諸毒植與可食共單特。恆用全多特
- **胡科混**：Apiaceae 科（胡、歐芹、歐防風）含常食與北半球最致命之植。非專勿近
- **生存中採菌**：菌卡低而含地最致之物。生存中險報比極差
- **新植食過多**：安植大量亦可致胃亂，尤腸未習。始小
- **略備求**：生蕨卷、生接骨、未浸橡實——有植烹可食而生微毒
- **近污區採**：路邊（鉛、廢氣）、農邊（農藥）、工區或有技可食而污之植

## 參

- `make-fire` — 烹採植所需；多種需煮或烤方安可口
- `purify-water` — 洗採植及浸/煮備法需清水
