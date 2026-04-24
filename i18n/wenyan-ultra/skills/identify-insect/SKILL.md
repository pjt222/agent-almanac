---
name: identify-insect
locale: wenyan-ultra
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

# 辨蟲

用系統形察、二分鑰、結構信心評辨蟲。

## 用

- 有未知蟲（活、照、製），需辨
- 欲由目級進至科屬
- 取樣集需一致辨法
- 分相似目或科
- 教或學蟲辨識欲結構法

## 入

- **必**：蟲樣或清察（活、照、製）
- **必**：細形察能（翅、口、觸、足）
- **可**：手鏡 10x 或解剖顯微
- **可**：區域蟲野外指南或二分鑰
- **可**：鑷與針（操製樣）
- **可**：多角照（背、側、腹、正）

## 行

### 一：驗基體制

確乃蟲非他節肢。此步防最基誤辨。

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

得：確為蟲，六足、三區、一對觸、0-4 翅。

敗：有 8 足→蛛綱；勿行蟲鑰。足數曖（製樣失足）→察胸足連，蟲有三對基節於前、中、後胸。體制真不明→記「節肢——綱不明」並記可見徵。

### 二：用二分鑰鑰至目

逐對工作下列簡二分鑰。各對擇合樣之選，隨導號。

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

得：鑰至目，明路（如「1a→2b→3a=Coleoptera」）。

敗：樣不合任對→或為常翅目之無翅形（如工蟻乃無翅 Hymenoptera、雌袋蛾乃無翅 Lepidoptera）。記致難之對與曖徵。諮更詳區鑰或攝樣供專家審。

### 三：察翅脈與型

翅於科屬級載超二分鑰之診斷訊。

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

得：翅型分，主脈特徵記。常目或可確或精目級辨。

敗：翅損、缺、折使脈不可見→記所見（如「elytra 在，後翅未察」）並進次步。脈於科級最有用——目級辨常不需詳脈。

### 四：察口

口型反食生態，於目級診斷。

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

得：口型分（咀、刺吸、虹吸、舔、咀舔），記合或不合二步所辨目。

敗：活或小樣常需放大見口。口不可察→略此步記「未察」。照之正視或揭口型。此步為確認，非目級辨必需。

### 五：察觸角

觸角形為最易見之徵，多目於科級診斷。

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

得：觸角形辨並記。觸角型應合二步所辨目（如 lamellate 確 Scarabaeidae 於 Coleoptera；capitate 確蝶非蛾於 Lepidoptera）。

敗：觸角斷、缺、於照遮→記「觸角未全見——所察為 [filiform/clubbed 等]」。觸角為科級辨識最可靠徵之一，失此徵降信心。進六步。

### 六：察足與跗節構

足特化揭蟲生態，跗式（各跗節數）於諸目於科級診斷。

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

得：足特化型記，跗式計（若樣允）。此諸徵縮目內之辨。

敗：樣過小跗節不可數→記整足形與顯特化（跳足、掘足）。跗式於 Coleoptera 科最有用——他目整足形足。

### 七：定信心級

合諸察成末辨並顯評信心。

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

得：全辨記，含目（至少）、科屬（若可）、顯信心級、所察與所曖之徵。

敗：辨止於目級亦為有效果。記諸察並攝照提交專家壇或民科平台。多蟲需特專知或甚解生殖器方至種級辨——此為常，非法之敗。

## 驗

- [ ] 生物已確為蟲（六足、三區、一對觸）
- [ ] 二分鑰系統行畢，記所取路
- [ ] 翅型分，可見處脈特徵記
- [ ] 口型辨或記未察
- [ ] 觸角形用標準術辨
- [ ] 足特化與跗式可能處記
- [ ] 信心級顯分（Certain/Probable/Possible/Unknown）
- [ ] 相似類已考並書排之由

## 忌

- **略體制察**：以「似蟲」假 8 足蛛為蟲。必先數足。蜱、蟎、盲蛛常誤為蟲
- **倚色**：色於蟲學最不可靠。多種色變，不相關種因擬而色近。必用構徵（翅、口、觸）為主
- **不察二對選**：二分鑰中讀二選再擇。急則誤枝。皆不合→退前對
- **忽二態**：同種雌雄或異大。雄蛾或 bipectinate 而雌 filiform。雄鍬甲顎大而雌不。二性皆考
- **混幼成**：幼蟲常異於成。毛蟲（Lepidoptera 幼）有過六真足。蠐螬（Coleoptera 幼）或全缺可見足。成鑰不施於幼
- **強至種級**：多蟲科含數百相似種，僅以生殖器或 DNA 條碼分。誠之屬級或科級辨勝於誤種名

## 參

- `document-insect-sighting`
- `observe-insect-behavior`
- `collect-preserve-specimens`
- `survey-insect-population`
