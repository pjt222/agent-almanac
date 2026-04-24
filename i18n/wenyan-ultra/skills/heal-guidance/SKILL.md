---
name: heal-guidance
locale: wenyan-ultra
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

# 癒（引導）

導人經分層癒法，合能、草、體、整全之術以支復、衡、康。AI 為知悉之教——非稱傳能，乃予各法之結構導引。

## 用

- 人述病或傷，欲結構引支穩與援
- 人報能失衡（久疲、情滯、眠亂），欲自癒教
- 草藥宜，人有植材（參 `forage-plants`）
- 人求合息、觀想、身掃之整全會
- 冥後整合揭需向癒注之域（參 `meditate-guidance`）

## 入

- **必**：人之況或意之描（體、能、情、通康）
- **必**：可用資（草、清水、急救品、靜空）
- **可**：人之能工經（默：無）
- **可**：知忌（敏、藥、傷、孕）
- **可**：會時（默 30-60 分）

## 行

### 一：導整全評

擇法前助人評體、能、情之全。

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

導人自評：「不適何處？始於何時？何使之輕或重？知因否？」善聽並反述以確。

得：主訴、其維（體/能/情）、與擇重點步之分級計劃皆明。人覺被聽被解。

敗：況不明→導人經七步身掃，辨緊、熱或阻能之域，再擇法。

### 二：薦法

依評薦合一法或多法並釋因。

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

釋諸法如何合：「吾等可始息以接地，續能癒治主題，終以草茶整合。」

得：1-3 法之會計，按先後、每法時估、所需材。人解由並同意進。

敗：人未定→默用整全序（七步）——息與觀想普安且無需材。陳為柔起點。

### 三：導能連

能工前教人入接地、中心態。

1. 邀坐或立，足平、脊直
2. 導慢息：「入 4 拍、持 2、出 6 拍」
3. 導接地觀：「想像根自足入地，汲穩溫能」
4. 注意手：「察掌之熱、麻、搏」
5. 助立明意：「默陳所欲癒」
6. 若將於他人工→提醒觸前先求許

得：人報手熱或活。顯靜且專。意明持。

敗：不能入接地態→由七步擴息再返。陳難乃常，非不能之徵。薦僅注息律無強靜。

### 四：教能癒

導人於患處或能中心施以觸或懸手之法。

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

1. 「持手於域上 5-10 cm，或輕觸之」
2. 「留此 3-5 分，息穩」
3. 「察何？熱、冷、麻、搏或引感？」
4. 報滯能（密、冷、靜）→「想像光解阻」
5. 報虛能（空、涼）→「想像溫光填域」
6. 「隨直覺——若覺引則移至相關域」
7. 「收式：手由頭至足，去身 5-10 cm，三次」

得：人報溫、鬆、麻或情釋。手或覺溫變或搏。會時：15-30 分。

敗：無感→導焦於心中心（最普應），延持至 7-10 分。不適觸→確懸手。陳能工需在場非信——若專散→返三步接地。

### 五：導草藥製

草援宜時，由可用材導製。

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

各製步導之，各階確植物辨識。

得：合症之已製劑，材確辨並以清水造。

敗：植辨不確→勸勿內服。外敷險小然仍需確辨。無宜草→略此步倚他法。

### 六：導急救穩

體傷者，教穩再施諸玄法。

1. **出血**：「以淨布直壓，可能則抬高於心，壓 10-15 分不察」
2. **燒傷**：「以淨流水冷 10-20 分，淨布鬆覆——無冰，無油」
3. **扭傷**：「息域、冰或冷水敷、緊不勒之包、抬」
4. **休克徵**（蒼、冷、急脈、惑）：「平臥，抬足，保溫，撫慰之」
5. **呼吸難**：「坐直，鬆衣，教慢息——入 4、出 6」

得：止血、管疼、防休克、穩人以運送或續護。

敗：直壓 15 分後血不止→導壓至傷上游動脈點。休克加重→保暖保意識並求急助。急救穩絕對先於諸他法——清通之。

### 七：導整全術

此諸術可獨立或織入他法。

**息工**（5-10 分）：
1. 「入 4 拍、持 2、出 6 拍」
2. 疼：「焦息非焦疼——各出時想像緊自域離」
3. 焦慮：「延出——入 4、出 7——此激靜反應」
4. 能：「鼻急息——30 快入出週期，後持」（注意：或致眩，警之）

**觀想**（5-10 分）：
1. 「想像癒光——何色合——自頭頂入」
2. 「引光至需注之域」
3. 「見光解諸暗、壅、疼」
4. 「令之擴填滿全身」
5. 「想像身裹於該光之護球」

**身掃**（10-15 分）：
1. 「始於頂」
2. 「注意慢下移各身區」
3. 「各區察：緊、溫、感、情」
4. 「阻處→息入該域 3-5 息」
5. 「續下至足底」
6. 記所報之域供向隨訪

得：人報鬆增、疼減、情釋。身掃辨特域供向隨訪。

敗：不能專觀→簡至僅息。身掃致情緒困→緩，予略該區之選。陳目非強破抗拒。

### 八：收式與隨訪

1. 會後予 5-10 分靜息
2. 予水（荒野則參 `purify-water`）
3. 問：「相較始時覺何異？」
4. 記所變與所不變之域
5. 薦續自護：續息、草茶、息
6. 能工：勸日餘額水與息
7. 草藥：明量與頻（茶常日 2-3 次）
8. 症續→薦隨訪

得：人報改善或至少無惡化。續症有隨計。

敗：症惡化→重評（返一步）考異法。體症嚴重或續→薦常規醫——此諸法互補，非替專業護。

## 驗

- [ ] 擇法前已畢整全評
- [ ] 體傷先穩，後施玄法
- [ ] 能工前人已接地中心
- [ ] 所用草已確辨（參 `forage-plants`）
- [ ] 製劑水安全（參 `purify-water`）
- [ ] 觸或能向工前已得許
- [ ] 會含收整合期與隨計
- [ ] 無法強破人之抗拒
- [ ] AI 僅教導而不稱自傳能

## 忌

- **略體穩**：於流血傷施能工乃不責——必先導穩
- **誤辨草**：誤植致毒——疑則勸勿服
- **急接地**：未接地者施能工傳躁——投時於三步
- **覆人自主**：勿堅持其不適之術——癒需信
- **代專業護**：此諸法輔但不替急救或藥治
- **忽情釋**：能工或現悲怒憶——持空無修無釋
- **AI 越位**：AI 導程予知，不稱診、處方、傳癒能

## 參

- `heal`
- `meditate-guidance`
- `remote-viewing-guidance`
- `mindfulness`
- `tai-chi`
- `forage-plants`
- `purify-water`
- `make-fire`
