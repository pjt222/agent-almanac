---
name: identify-insect
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Identify insects using body plan analysis, dichotomous keys to order, wing
  venation, mouthpart type, antennae form, leg and tarsal structure, and
  confidence levels. Covers the fundamental hexapod body plan verification,
  a simplified dichotomous key to major orders, wing venation and type analysis,
  mouthpart classification, antennae morphology, leg specialization and tarsal
  formula, and a structured confidence assessment framework. Use when you need
  to identify an unknown insect beyond preliminary order placement, are working
  through a specimen for taxonomic study, want to distinguish between similar
  orders or families, or need to assign a confidence level to a field identification.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, identification, taxonomy, dichotomous-key, morphology
---

# 昆蟲之識

以系統形態察、二岐檢索、結構化信察識昆蟲。

## 用時

- 有未知昆蟲（活、攝、藏）而欲識
- 欲超目級至科或屬
- 察標本集而需一致識法
- 欲別視似之目或科
- 欲教或學昆蟲識而求結構法

## 入

- **必要**：昆蟲標本或清察（活、攝、藏）
- **必要**：能察細形態（翅、口器、觸角、足）
- **可選**：手鏡（10x）或解剖顯微
- **可選**：該區之昆蟲野外指南或二岐檢索
- **可選**：鑷與針以動藏標本
- **可選**：多角度攝（背、側、腹、正）

## 法

### 第一步：驗基本體型

確察為昆蟲非他節肢。此步防最基本級之誤識。

```
Arthropod Verification:
+--------------------+------------------------------------------+
| Feature            | Insect (Class Insecta)                   |
+--------------------+------------------------------------------+
| Legs               | Exactly 6 (3 pairs), attached to thorax  |
+--------------------+------------------------------------------+
| Body regions       | 3 distinct: head, thorax, abdomen        |
+--------------------+------------------------------------------+
| Antennae           | 1 pair on the head                       |
+--------------------+------------------------------------------+
| Eyes               | Typically 2 compound eyes + 0-3 ocelli   |
+--------------------+------------------------------------------+
| Wings              | 0, 2, or 4 (attached to thorax)          |
+--------------------+------------------------------------------+

Not an insect if:
- 8 legs → Arachnida (spiders, scorpions, ticks, mites)
- 10+ legs → Crustacea (isopods, amphipods) or Myriapoda
- No distinct head → likely a mite or tick
- 2 pairs antennae → Crustacea
- No antennae → Arachnida
```

**得：** 確為昆蟲：六足、三體區、一對觸角、零至四翅。

**敗則：** 若八足，乃蛛形——勿續以昆蟲檢索。若足數模糊（如藏標本已失足），察胸足附——昆蟲於前、中、後胸各有一對。若體型實不明，記「節肢——綱不確」並記可見特徵。

### 第二步：以二岐檢索定目

逐對偶察，每對偶擇合標本之選並從其引號。

```
Simplified Dichotomous Key to Major Insect Orders:

1a. Wings present and visible ................................. go to 2
1b. Wings absent (apterous) .................................. go to 12

2a. One pair of wings (hind wings reduced to halteres) ....... DIPTERA
    (flies, mosquitoes, midges, crane flies)
2b. Two pairs of wings ........................................ go to 3

3a. Front wings hardened, meeting in a straight line
    down the back (elytra) ................................... COLEOPTERA
    (beetles, weevils, ladybugs, fireflies)
3b. Front wings not fully hardened as elytra ................. go to 4

4a. Wings covered in scales (powdery when rubbed) ............ LEPIDOPTERA
    (butterflies and moths)
4b. Wings membranous or partly membranous, no scales ......... go to 5

5a. Front wings half-leathery at base, membranous at
    tip (hemelytra) .......................................... HEMIPTERA
    (true bugs: stink bugs, assassin bugs, bed bugs)
5b. Front wings uniformly membranous or uniformly
    leathery ................................................. go to 6

6a. Narrow waist between thorax and abdomen; hind wings
    smaller than front wings; wings may hook together ........ HYMENOPTERA
    (bees, wasps, ants, sawflies)
6b. No narrow waist ........................................... go to 7

7a. Long, narrow body; very large eyes covering most of
    head; wings held out to sides or above body at rest ...... ODONATA
    (dragonflies and damselflies)
7b. Body not as above ......................................... go to 8

8a. Hind legs greatly enlarged for jumping ................... ORTHOPTERA
    (grasshoppers, crickets, katydids)
8b. Hind legs not enlarged for jumping ....................... go to 9

9a. Front wings straight, narrow, leathery (tegmina);
    cerci prominent at abdomen tip ........................... DERMAPTERA
    (earwigs) — if cerci are forceps-like
    or BLATTODEA (cockroaches) — if cerci are short
9b. Wings otherwise ........................................... go to 10

10a. Tiny insects (under 5mm); wings fringed with long
     hairs ................................................... THYSANOPTERA
     (thrips)
10b. Wings not fringed ........................................ go to 11

11a. Two pairs of similar-sized membranous wings with
     many veins; soft body; often near water ................. NEUROPTERA
     (lacewings, antlions) or EPHEMEROPTERA (mayflies —
     have 2-3 tail filaments) or PLECOPTERA (stoneflies —
     have 2 tail filaments, wings fold flat)
11b. Does not match above ..................................... record
     features and consult a comprehensive regional key

12a. Laterally flattened body; jumps .......................... SIPHONAPTERA
     (fleas)
12b. Pale, soft body; bead-like antennae; social,
     found in wood or soil ................................... BLATTODEA
     (termites, formerly Isoptera)
12c. Very small (under 2mm); elongate; found on hosts ........ PHTHIRAPTERA
     (lice)
12d. 6 legs, wingless, does not match above .................. record
     features and consult a comprehensive regional key
     (many wingless forms exist within winged orders)
```

**得：** 目級識附清路徑記（如「1a 至 2b 至 3a = Coleoptera」）。

**敗則：** 若標本無顯合任一對偶，或為常有翅目之無翅形（如工蟻為無翅 Hymenoptera，雌袋蛾為無翅 Lepidoptera）。記何對偶生難與何特徵模糊。參更細區域檢索或攝以待專家察。

### 第三步：察翅脈與翅型

翅載科屬級診斷訊，超二岐檢索所捕。

```
Wing Types by Order:
+--------------------+------------------------------------------+
| Wing Type          | Orders                                   |
+--------------------+------------------------------------------+
| Elytra (hardened   | Coleoptera — front wings meet in a       |
| front wings)       | straight line; hind wings membranous,    |
|                    | folded beneath                           |
+--------------------+------------------------------------------+
| Hemelytra (partly  | Hemiptera — basal half leathery, distal  |
| hardened)          | half membranous                          |
+--------------------+------------------------------------------+
| Tegmina (leathery  | Orthoptera, Blattodea — uniformly        |
| front wings)       | leathery; hind wings membranous, folded  |
+--------------------+------------------------------------------+
| Scaled             | Lepidoptera — covered in overlapping     |
|                    | scales; venation visible when descaled   |
+--------------------+------------------------------------------+
| Membranous (both   | Hymenoptera, Odonata, Neuroptera,        |
| pairs)             | Ephemeroptera, Plecoptera                |
+--------------------+------------------------------------------+
| Halteres (reduced  | Diptera — hind wings reduced to knob-    |
| hind wings)        | like balancing organs                    |
+--------------------+------------------------------------------+
| Fringed            | Thysanoptera — narrow wings with long    |
|                    | marginal hairs                           |
+--------------------+------------------------------------------+

Venation Notes:
- Count the major longitudinal veins (costa, subcosta, radius, media,
  cubitus, anal veins) — number and branching pattern are family-diagnostic
- Note cross-veins forming cells — the number and shape of closed cells
  help distinguish families
- Wing coupling mechanisms (hamuli in Hymenoptera, frenulum in
  Lepidoptera) indicate how front and hind wings link during flight
```

**得：** 翅型已分並記要脈。常目者，此或確或精目級識。

**敗則：** 若翅損、缺、或折而脈不見，記所見（如「鞘翅存，後翅未察」）並繼次步。翅脈最利於科級——目級識常不需細脈。

### 第四步：察口器

口器型反食生態，為目級診斷。

```
Mouthpart Types:
+--------------------+------------------------------------------+
| Type               | Description and Associated Orders        |
+--------------------+------------------------------------------+
| Chewing            | Mandibles with toothed or grinding       |
| (mandibulate)      | surfaces. Coleoptera, Orthoptera,        |
|                    | Hymenoptera (partially), Odonata larvae, |
|                    | Neuroptera                               |
+--------------------+------------------------------------------+
| Piercing-sucking   | Elongate stylets within a beak-like      |
|                    | rostrum. Hemiptera, Siphonaptera,        |
|                    | Phthiraptera, some Diptera (mosquitoes)  |
+--------------------+------------------------------------------+
| Siphoning          | Coiled proboscis (haustellum) unrolled   |
|                    | to feed on nectar. Lepidoptera (adults)  |
+--------------------+------------------------------------------+
| Sponging           | Fleshy labellum with pseudotracheal      |
|                    | channels. Many Diptera (house flies)     |
+--------------------+------------------------------------------+
| Chewing-lapping    | Mandibles for manipulating + tongue       |
|                    | (glossa) for lapping liquids.            |
|                    | Hymenoptera (bees)                       |
+--------------------+------------------------------------------+
| Rasping-sucking    | Asymmetric mouthparts that rasp tissue   |
|                    | and suck fluids. Thysanoptera            |
+--------------------+------------------------------------------+
```

**得：** 口器型分（咀、刺吸、虹吸、舐吸、咀舐）並記與第二步目識一致否。

**敗則：** 活或小標本無放大常難察口器。若不可察，略此步記「口器未察」。攝者正面或現口器型。此步為確認非目級識必要。

### 第五步：察觸角

觸角型為目察中最易之，於多目為科級診斷。

```
Antenna Types:
+--------------------+------------------------------------------+
| Form               | Description and Diagnostic Value         |
+--------------------+------------------------------------------+
| Filiform           | Thread-like, segments similar in size.   |
|                    | Many Orthoptera, some Coleoptera         |
+--------------------+------------------------------------------+
| Moniliform         | Bead-like, round segments. Termites,     |
|                    | some Coleoptera                          |
+--------------------+------------------------------------------+
| Clavate            | Gradually thickened toward tip.           |
|                    | Some Coleoptera (darkling beetles)       |
+--------------------+------------------------------------------+
| Capitate           | Abrupt terminal club. Butterflies        |
|                    | (Lepidoptera: Rhopalocera)               |
+--------------------+------------------------------------------+
| Serrate            | Saw-toothed segments. Some Coleoptera    |
|                    | (click beetles, jewel beetles)           |
+--------------------+------------------------------------------+
| Pectinate          | Comb-like branches on one side.          |
|                    | Some moths, some Coleoptera              |
+--------------------+------------------------------------------+
| Bipectinate        | Comb-like branches on both sides.        |
|                    | Many moths (especially males, for        |
|                    | detecting pheromones)                    |
+--------------------+------------------------------------------+
| Plumose            | Feathery, densely branched. Male         |
|                    | mosquitoes and midges (Diptera)          |
+--------------------+------------------------------------------+
| Lamellate          | Terminal segments expanded into flat      |
|                    | plates. Scarab beetles (Scarabaeidae)    |
+--------------------+------------------------------------------+
| Geniculate         | Elbowed — a long first segment (scape)   |
|                    | followed by an angle. Ants, weevils,     |
|                    | many Hymenoptera                         |
+--------------------+------------------------------------------+
| Aristate           | Short, 3-segmented with a bristle        |
|                    | (arista). Many Diptera (house flies,     |
|                    | fruit flies)                             |
+--------------------+------------------------------------------+
| Stylate            | Short, with a terminal style (finger-    |
|                    | like projection). Some Diptera           |
|                    | (horse flies, robber flies)              |
+--------------------+------------------------------------------+
```

**得：** 觸角型已識並記。觸角型應與第二步目識一致（如片狀觸角確 Scarabaeidae；棍棒觸角確蝴蝶非蛾）。

**敗則：** 若觸角斷、缺、或攝中遮，記「觸角未全見——察似 [絲狀/棒狀/等]」。觸角型為科級最可靠之一，失此減信。繼第六步。

### 第六步：察足與跗結構

足特化現生態，跗式（每跗節數）於多目為科級診斷。

```
Leg Specializations:
+--------------------+------------------------------------------+
| Specialization     | Description and Examples                 |
+--------------------+------------------------------------------+
| Cursorial          | Long, slender, built for running.        |
| (running)          | Ground beetles (Carabidae), cockroaches  |
+--------------------+------------------------------------------+
| Saltatorial        | Enlarged hind femora for jumping.         |
| (jumping)          | Grasshoppers, fleas, flea beetles       |
+--------------------+------------------------------------------+
| Raptorial          | Front legs with spined femur and tibia    |
| (grasping)         | for seizing prey. Praying mantises,      |
|                    | some Hemiptera (ambush bugs)             |
+--------------------+------------------------------------------+
| Fossorial          | Front legs broad and flattened for        |
| (digging)          | digging. Mole crickets, scarab larvae    |
+--------------------+------------------------------------------+
| Natatorial         | Hind legs flattened and fringed with      |
| (swimming)         | hairs for rowing. Water beetles,         |
|                    | water boatmen                            |
+--------------------+------------------------------------------+
| Scansorial         | Tarsi with adhesive pads or claws for     |
| (climbing)         | gripping surfaces. Many beetles, flies   |
+--------------------+------------------------------------------+
| Corbiculate        | Hind tibiae with pollen basket (corbicula)|
|                    | Honey bees, bumble bees                  |
+--------------------+------------------------------------------+

Tarsal Formula:
- Count tarsal segments on front, middle, and hind legs
- Express as 3 numbers (e.g., 5-5-5 means 5 segments on all legs)
- Common formulas:
  5-5-5: Most Coleoptera families, Hymenoptera, Neuroptera
  5-5-4: Cerambycidae, Chrysomelidae (apparent — actually cryptic 5th)
  4-4-4: Some smaller beetle families
  3-3-3: Some flies (Diptera)
  Variable: Check all three pairs — asymmetry is diagnostic
```

**得：** 足特化型已記，跗式已計（若標本允）。此於目內縮識。

**敗則：** 若標本太小無顯微不能計跗節，記足總形與顯特化（躍足、掘足）。跗式於 Coleoptera 科最有用——他目則足總形足矣。

### 第七步：賦信等

合所察為末識附顯信評。

```
Confidence Assessment:
+----------+---------------------------+---------------------------+
| Level    | Criteria                  | Action                    |
+----------+---------------------------+---------------------------+
| Certain  | All morphological features| Record as confirmed ID.   |
|          | match; keyed through      | Label specimen or          |
|          | dichotomous key cleanly;  | observation with species   |
|          | no similar species in     | name.                     |
|          | region could be confused  |                           |
+----------+---------------------------+---------------------------+
| Probable | Most features match;      | Record as probable ID.    |
|          | keyed to family or genus; | Note which features are   |
|          | 1-2 features uncertain or | uncertain. Seek additional|
|          | not examined              | references or expert      |
|          |                          | confirmation.              |
+----------+---------------------------+---------------------------+
| Possible | Some features match;      | Record as possible ID.    |
|          | keyed to order but not    | Photograph thoroughly.    |
|          | further; similar taxa not | Submit to expert forum or |
|          | fully eliminated          | citizen science platform  |
|          |                          | for community review.     |
+----------+---------------------------+---------------------------+
| Unknown  | Cannot key beyond class   | Record all visible        |
|          | Insecta; features not     | features. Photograph.     |
|          | matching available keys;  | Seek expert identification|
|          | specimen too damaged for  | or use molecular methods  |
|          | morphological ID          | (DNA barcoding).          |
+----------+---------------------------+---------------------------+

Record your identification in this format:
  Order: [name]
  Family: [name or "uncertain"]
  Genus: [name or "uncertain"]
  Species: [name or "uncertain"]
  Confidence: [Certain / Probable / Possible / Unknown]
  Features examined: [list which steps were completed]
  Features uncertain: [list any ambiguous characters]
  Similar taxa considered: [what else it might be and why rejected]
```

**得：** 完成之識記附目（最低）、科與屬（若可）、顯信等、察何特徵與何模糊之記。

**敗則：** 若止於目級，此亦有效果。記所察並送攝至專家論壇或公民科學台。多昆蟲需專家識或生殖解剖方至種級——此為常非法失。

## 驗

- [ ] 已確為昆蟲（六足、三體區、一對觸角）
- [ ] 二岐檢索已系統察並記路徑
- [ ] 翅型已分，翅脈可見者已記
- [ ] 口器型已識或記為未察
- [ ] 觸角型以標術語識
- [ ] 足特化與跗式可則已記
- [ ] 顯賦信等（確定/或然/可能/不明）
- [ ] 似類已慮並記排除因

## 陷

- **略體型察**：設八足蛛為昆蟲因「似蟲」。始終先計足。壁虱、蟎、收割人常被誤為昆蟲
- **僅憑色**：色為昆蟲學最弱識徵。多種色變，無親種色幾同（擬態）。始終以結構特徵（翅、口器、觸角）為主
- **不察對偶二選**：二岐檢索者，擇前讀二選。急致誤枝。若二選皆不合，返前對偶
- **忽性二態**：同種雌雄可形大異。雄蛾或有雙櫛觸角而雌為絲狀。雄鹿甲有巨大顎而雌無。慮二性
- **混幼與成**：未成昆蟲（幼、若）常不似成。毛毛（鱗翅幼）有六足以上之真足。白蠐（鞘翅幼）或全無足。成之檢索於幼不作
- **強種級識**：多昆蟲科含數百似種唯以生殖形或 DNA 條碼可別。誠屬或科級識貴於誤種名

## 參

- `document-insect-sighting` — 識前或識中以攝與元資記目擊
- `observe-insect-behavior` — 以行察補形態識附生態語境
- `collect-preserve-specimens` — 若需物標本於放大下作確識
- `survey-insect-population` — 施識能於多標本之群級調查
