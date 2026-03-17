---
name: identify-insect
description: >
  体制分析、目への二分検索表、翅脈、口器タイプ、触角形態、脚・跗節構造、
  信頼度レベルを使用した昆虫の同定。基本的な六脚類体制の確認、主要目への
  簡略化二分検索表、翅脈とタイプの分析、口器の分類、触角の形態、脚の特殊化と
  跗節式、構造化された信頼度評価フレームワークを網羅する。予備的な目の配置を
  超えて未知の昆虫を同定する必要がある時、分類学的研究のために標本を検討している時、
  類似の目や科を区別したい時、またはフィールド同定に信頼度レベルを割り当てる
  必要がある時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, identification, taxonomy, dichotomous-key, morphology
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 昆虫の同定

体系的な形態学的検査、二分検索表、構造化された信頼度評価を使用した昆虫の同定。

## 使用タイミング

- 未知の昆虫（生体、写真、保存標本）を持っており同定が必要な時
- 目レベルの配置を超えて科や属に進みたい時
- 標本コレクションを検討しており一貫した同定方法が必要な時
- 視覚的に類似した目や科を区別する必要がある時
- 昆虫の同定を教えるまたは学んでおり構造化されたアプローチが必要な時

## 入力

- **必須**: 昆虫標本または明瞭な観察（生体、写真、保存標本）
- **必須**: 微細な形態学的詳細（翅、口器、触角、脚）を検査する能力
- **任意**: ハンドレンズ（10倍）または実体顕微鏡（微細な詳細用）
- **任意**: 地域の昆虫学フィールドガイドまたは二分検索表
- **任意**: 保存標本の操作用のピンセットとピン
- **任意**: 複数角度からの写真（背面、側面、腹面、正面）

## 手順

### ステップ1: 基本体制の確認

昆虫であり他の節足動物ではないことを確認する。このステップは最も基本的なレベルでの誤同定を防ぐ。

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

**期待結果:** 生物が6本脚、3体区、1対の触角、0-4枚の翅を持つ昆虫であることの確認。

**失敗時:** 標本が8本脚の場合、クモ類である — 昆虫の検索表で進まない。脚数が不明瞭な場合（例：保存標本で脚が失われている）、胸部の脚の付着部を検査する — 昆虫は前胸、中胸、後胸に3対の基節を持つ。体制が本当に不明瞭な場合、「節足動物門 — 綱不確定」と記録し、見える特徴を記録する。

### ステップ2: 二分検索表を使用した目への同定

以下の簡略化された検索表を1対ずつ作業する。各対で標本に合うオプションを選び、案内番号に従う。

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

**期待結果:** 検索表を通じた明確な経路が文書化された目レベルの同定（例：「1a→2b→3a＝鞘翅目」）。

**失敗時:** 標本がどの対にも明確に一致しない場合、通常は有翅目の無翅型の可能性がある（例：働きアリは無翅の膜翅目、ミノガの雌は無翅の鱗翅目）。どの対で困難が生じたか、どの特徴が曖昧かを記録する。より詳細な地域の検索表を参照するか、標本を撮影して専門家のレビューを受ける。

### ステップ3: 翅脈とタイプの検査

翅は二分検索表が捕捉する以上の科・属レベルの診断情報を持つ。

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

**期待結果:** 翅のタイプが分類され、主要な脈の特徴が記録されること。一般的な目では、これにより目レベルの同定が確認または精緻化される可能性がある。

**失敗時:** 翅が損傷、欠落、または畳まれて脈が見えない場合、見えるものを記録し（例：「鞘翅あり、後翅は未検査」）、次のステップに進む。翅脈は科レベルで最も有用 — 目レベルの同定には通常、詳細な脈の検査は必要ない。

### ステップ4: 口器の検査

口器のタイプは摂食生態を反映し、目レベルでの診断に使用される。

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

**期待結果:** 口器のタイプが分類され（咀嚼型、刺吸型、吸管型、スポンジ型、咀嚼舐め型）、ステップ2の目の同定と一致するか矛盾するかが記録されること。

**失敗時:** 口器は拡大なしでは生体や小さな標本で見えにくいことが多い。口器が検査できない場合、このステップをスキップして「口器未検査」と記録する。写真の場合、正面図で口器のタイプが明らかになる場合がある。このステップは確認的であり、目レベルの同定に必須ではない。

### ステップ5: 触角の検査

触角の形態は最も視覚的にアクセスしやすい特徴の1つであり、多くの目で科レベルでの診断に使用される。

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

**期待結果:** 触角の形態が同定され記録されること。触角のタイプはステップ2で同定された目と一致するべき（例：葉状触角はコガネムシ科を鞘翅目内で確認; 頭状触角は鱗翅目内でチョウをガと区別）。

**失敗時:** 触角が折れている、欠落している、または写真で見えない場合、「触角は完全には見えない — 観察できた限りでは[糸状/棍棒状/等]と思われた」と記録する。触角の形態は科レベルの同定で最も信頼性の高い特徴の1つであるため、この特徴の欠損は信頼度を低下させる。ステップ6に進む。

### ステップ6: 脚と跗節構造の検査

脚の特殊化は昆虫の生態を明らかにし、跗節式（各跗節のセグメント数）はいくつかの目で科レベルの診断に使用される。

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

**期待結果:** 脚の特殊化タイプが記録され、跗節式が数えられること（標本が許す場合）。これらの特徴は目内での同定を絞り込む。

**失敗時:** 標本が小さすぎて顕微鏡なしで跗節のセグメントが数えられない場合、全体的な脚の形状と明らかな特殊化（跳躍脚、掘削脚）を記録する。跗節式は鞘翅目の科で最も有用 — 他の目では一般的な脚の形状で十分。

### ステップ7: 信頼度レベルの割り当て

すべての観察を明示的な信頼度評価を伴う最終同定に統合する。

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

**期待結果:** 目（最低限）、可能であれば科と属、明示的な信頼度レベル、検査された特徴と不確実な特徴の文書化を含む完成した同定記録。

**失敗時:** 同定が目レベルで止まる場合、それは有効な結果である。観察されたすべての特徴を記録し、写真を専門家フォーラムまたは市民科学プラットフォームに提出する。多くの昆虫は種レベルの同定に専門家の知識や交尾器の解剖さえ必要とする — これは方法の失敗ではなく正常なことである。

## バリデーション

- [ ] 生物が昆虫であることが確認された（6本脚、3体区、1対の触角）
- [ ] 二分検索表が体系的に作業され、辿った経路が文書化された
- [ ] 翅のタイプが分類され、脈の特徴が可能な限り記録された
- [ ] 口器のタイプが同定されたか未検査と記録された
- [ ] 触角の形態が標準用語を使用して同定された
- [ ] 脚の特殊化と跗節式が可能な限り記録された
- [ ] 信頼度レベルが明示的に割り当てられた（確実/可能性高/可能性あり/不明）
- [ ] 類似の分類群が検討され除外理由が文書化された

## よくある落とし穴

- **体制チェックの省略**: 8本脚のクモ類を「虫に見える」から昆虫と仮定すること。常に最初に脚を数える。ダニ、マダニ、ザトウムシは一般的に昆虫と間違えられる
- **色のみへの依存**: 色は昆虫学で最も信頼性の低い同定特徴。多くの種は色が変異し、無関係な種が擬態によりほぼ同一の着色を持つことがある。常に構造的特徴（翅、口器、触角）を主要な特徴として使用する
- **対の両側を確認しない**: 二分検索表では選ぶ前に両オプションを読む。急いで進むと誤った分岐に入る。どちらのオプションもうまく合わない場合、前の対に戻る
- **性的二型の無視**: 同種の雄と雌は劇的に異なる場合がある。雄のガは双櫛状触角を持ち雌は糸状。雄のクワガタは巨大な大顎を持ち雌は持たない。両性を考慮する
- **幼虫と成虫の混同**: 未成熟昆虫（幼虫、若虫）は成虫と全く異なる外見の場合が多い。毛虫（鱗翅目幼虫）は6本以上の真脚を持つ。甲虫の幼虫は脚が見えない場合がある。成虫用の検索表は幼虫には使えない
- **種レベルの同定の強制**: 多くの昆虫科は交尾器の形態またはDNAバーコーディングでのみ区別できる数百の類似種を含む。正直な属レベルまたは科レベルの同定は、誤った種名より価値がある

## 関連スキル

- `document-insect-sighting` — 同定の前または途中で写真とメタデータを使って目撃を記録する
- `observe-insect-behavior` — 形態学的同定を生態学的文脈で補足する行動観察
- `collect-preserve-specimens` — 拡大下での決定的な同定に物理標本が必要な場合
- `survey-insect-population` — 個体群レベルの調査で複数標本に同定スキルを適用する
