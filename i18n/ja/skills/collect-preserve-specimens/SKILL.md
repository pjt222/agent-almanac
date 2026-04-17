---
name: collect-preserve-specimens
description: >
  博物館グレードの基準に従って昆虫標本を収集・保存する。法的コンプライアンス、
  収集方法、人道的な致死処理、ドライピニング、液浸保存、ラベリング、保管、
  キュレーションを含む。許可要件、保護種規制、スイープネット、ビーティングトレイ、
  ピットフォールトラップ、ライトトラップ、マレーゼトラップ、アスピレーター、
  酢酸エチル殺虫瓶、冷凍、目別のピン位置、展翅、軟体標本のエタノール保存、
  産地・日付付きの標本ラベリング、害虫管理付き保管、データベース入力をカバーする。
  分類学研究用の参考コレクション構築時、生態学研究用のバウチャー標本保存時、
  専門家による同定のための標本準備時、既存コレクションのキュレーション時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: advanced
  language: natural
  tags: entomology, insects, collection, preservation, pinning, taxonomy, museum
  locale: ja
  source_locale: en
  source_commit: f1162126
  translator: claude
  translation_date: "2026-03-17"
---

# 標本の収集と保存

分類学研究、参考コレクション、生態学研究のために、博物館グレードの基準で昆虫標本を収集・保存する。

## 使用タイミング

- 確定的な分類学的同定のために物理的標本が必要な時
- 生息地、地域、または分類群の参考コレクションを構築する時
- 出版される生態学研究用のバウチャー標本を保存する時
- 分類学の専門家に同定のために標本を送付する必要がある時
- 既存の昆虫コレクションをキュレーションまたは修復する時

## 入力

- **必須**: 予定地での収集の法的許可（許可証、土地所有者の同意）
- **必須**: 対象分類群に適した収集器具
- **必須**: 保存材料（ピン、エタノール、または両方）
- **必須**: ラベリング材料（保存用紙、細字ペンまたはプリンター）
- **任意**: 鱗翅目とトンボ目用の展翅板
- **任意**: 乾燥標本を再水和するための軟化室
- **任意**: 選別と準備用の実体顕微鏡
- **任意**: 標本記録用のデータベースまたはカタログシステム
- **任意**: ユニットトレイ、引き出し、保管キャビネット

## 手順

### ステップ1: 法的要件の確認

収集活動の前に、その場所での収集の法的権利があること、対象分類群が保護されていないことを確認する。

```
FUNDAMENTAL RULE:
Never collect without proper authorization. Never collect from
protected areas without explicit permits. Never collect protected
species. The scientific value of a specimen is zero if it was
collected illegally — it cannot be published, deposited in a
museum, or used in formal research.

Legal Checklist:
+--------------------+------------------------------------------+
| Requirement        | Verify                                   |
+--------------------+------------------------------------------+
| Land access        | Written permission from landowner, or    |
|                    | site is publicly accessible for          |
|                    | collecting (many parks prohibit it)      |
+--------------------+------------------------------------------+
| Collection permit  | Required for most public lands, nature   |
|                    | reserves, national parks. Apply through  |
|                    | the managing agency. Specify taxa,       |
|                    | methods, dates, and quantities.          |
+--------------------+------------------------------------------+
| Protected species  | Check national and regional red lists,   |
|                    | CITES appendices, and local endangered   |
|                    | species legislation. Some butterflies,   |
|                    | beetles, and dragonflies are protected.  |
+--------------------+------------------------------------------+
| Export/import      | Moving specimens across international    |
|                    | borders requires phytosanitary           |
|                    | certificates and may require CITES       |
|                    | permits depending on the taxon.          |
+--------------------+------------------------------------------+
| Institutional      | If collecting for an institution, follow |
| protocols          | their collection policy and ethics       |
|                    | review requirements.                     |
+--------------------+------------------------------------------+

Minimizing Collection Impact:
- Collect only the minimum number of specimens needed
- Avoid collecting from small or isolated populations
- Do not collect gravid (egg-bearing) females if population is small
- Record the abundance at the site — if the species appears rare, photograph instead
- Prefer common and abundant species for teaching collections
```

**期待結果:** 必要なすべての許可が取得され、保護種リストが確認され、収集者がその場所で収集できるもの・できないものを明確に理解している。

**失敗時:** 許可が取得できない場合、収集しない。現地で標本を撮影し、市民科学プラットフォームを使用して同定する。収集した標本が保護種であると判明した場合、直ちに関連する野生生物当局に相談する。標本を廃棄しない — 偶発的な収集は隠蔽ではなく報告すべき。

### ステップ2: 収集方法の選択

対象分類群、生息地、研究目的に合った方法を選択する。異なる方法は昆虫群集の異なる部分をサンプリングする。

```
Collection Methods:
+--------------------+------------------------------------------+
| Method             | Best For                                 |
+--------------------+------------------------------------------+
| Sweep net          | Flying and vegetation-dwelling insects    |
|                    | in grasslands, meadows, and low shrubs.  |
|                    | Technique: sweep in a figure-8 pattern   |
|                    | through vegetation; empty net into a     |
|                    | killing jar or collecting bag after      |
|                    | every 10-20 sweeps.                      |
+--------------------+------------------------------------------+
| Beating tray       | Arboreal insects on trees and shrubs.    |
|                    | Hold a white sheet or tray under a       |
|                    | branch; strike the branch sharply 3-5    |
|                    | times; collect dislodged insects with    |
|                    | an aspirator or forceps.                 |
+--------------------+------------------------------------------+
| Pitfall trap       | Ground-dwelling insects (beetles,        |
|                    | ants, crickets). Bury a cup flush with   |
|                    | the soil surface. Add a rain cover.      |
|                    | Check every 24-48 hours. Use propylene   |
|                    | glycol as preservative (non-toxic to     |
|                    | mammals; do not use ethylene glycol).    |
+--------------------+------------------------------------------+
| Light trap         | Nocturnal flying insects (moths, many    |
|                    | beetles, lacewings). Use a white sheet   |
|                    | illuminated by a mercury vapor or UV     |
|                    | light. Operate from dusk to midnight     |
|                    | or dawn. Most effective on warm, humid,  |
|                    | moonless nights.                         |
+--------------------+------------------------------------------+
| Malaise trap       | Flying insects, especially Hymenoptera   |
|                    | and Diptera. A tent-like mesh barrier    |
|                    | that intercepts insects in flight;       |
|                    | they walk upward into a collecting head  |
|                    | containing preservative. Runs            |
|                    | continuously; check weekly.              |
+--------------------+------------------------------------------+
| Aspirator (pooter) | Small, delicate insects that cannot be   |
|                    | handled with forceps. Suck the insect    |
|                    | into a vial through a tube (a mesh      |
|                    | filter prevents inhalation). Use only    |
|                    | mouth-operated aspirators with a filter. |
+--------------------+------------------------------------------+
| Pan trap           | Pollinators and small flying insects.    |
|                    | Colored bowls (yellow, white, blue)      |
|                    | filled with soapy water. Place at        |
|                    | vegetation height. The soap breaks       |
|                    | surface tension; insects fall in and     |
|                    | drown. Check every 24-48 hours.          |
+--------------------+------------------------------------------+
| Hand collection    | Large, slow, or sessile insects.         |
|                    | Pick directly with forceps or fingers.   |
|                    | Useful for bark-dwelling beetles,        |
|                    | caterpillars on host plants, aquatic     |
|                    | larvae under rocks.                      |
+--------------------+------------------------------------------+
```

**期待結果:** 対象分類群と生息地に基づいて1つ以上の収集方法が選択され、フィールドに出る前に器具が準備されている。

**失敗時:** 意図した方法で標本が得られない場合（例：豪雨中のスイープネット）、代替方法に切り替える。ライトトラップは特定の気象条件を必要とする — 暖かく、湿度が高く、風がなく、月のない夜が最適。条件が悪い場合、非効率にトラップを運用するより日程を変更する。

### ステップ3: 人道的な致死処理

収集した昆虫をできるだけ迅速かつ人道的に致死させる。長時間の苦痛は標本を損傷し（脚の破損、鱗粉の脱落）、倫理的にも受け入れられない。

```
Dispatch Methods:
+--------------------+------------------------------------------+
| Method             | Procedure and Notes                      |
+--------------------+------------------------------------------+
| Ethyl acetate      | Place a wad of absorbent material        |
| killing jar        | (plaster of Paris or tissue) in the      |
|                    | bottom of a wide-mouth jar. Saturate     |
|                    | with ethyl acetate. Place insects in     |
|                    | the jar; death occurs within 1-5        |
|                    | minutes for most species.                |
|                    | Caution: ethyl acetate is flammable and  |
|                    | an irritant. Use in well-ventilated     |
|                    | areas. Do not inhale.                    |
+--------------------+------------------------------------------+
| Freezing           | Place live insects in a container in a   |
|                    | freezer at -20C for 24 hours. Suitable   |
|                    | for specimens brought back alive.        |
|                    | Produces well-relaxed specimens ideal    |
|                    | for pinning.                             |
+--------------------+------------------------------------------+
| Ethanol drowning   | Immerse directly in 70-95% ethanol.      |
|                    | Used for soft-bodied insects that will   |
|                    | be wet-preserved (larvae, aphids, small  |
|                    | Diptera). Not suitable for Lepidoptera   |
|                    | (destroys scales) or specimens intended  |
|                    | for dry pinning.                         |
+--------------------+------------------------------------------+

NEVER use:
- Cyanide jars (potassium cyanide) — extremely toxic to humans;
  obsolete in modern entomology
- Crushing or squeezing — destroys morphological features
- Prolonged suffocation — slow and damages specimens from struggling
```

**期待結果:** 形態学的特徴への損傷を最小限に抑えて標本が迅速に（数分以内に）致死処理される。鱗翅目は他の標本との接触による鱗粉の脱落を防ぐため別に保管される。

**失敗時:** 酢酸エチルが入手できない場合、ほとんどの分類群で冷凍が最良の代替手段。フィールドでどちらも利用できない場合、標本を個別のバイアルまたは封筒（鱗翅目にはグラシン封筒に翅を折りたたんで）に入れ、帰宅後に冷凍する。致死剤なしで密閉容器に生きた昆虫を放置しない — 自ら損傷する。

### ステップ4: 標本のピニング（ドライ保存）

各標本を目に応じた正しい位置でピニングする。適切なピン位置は、診断的特徴へのアクセスと長期的な構造的完全性の両方に不可欠。

```
Pin Placement by Order:
+--------------------+------------------------------------------+
| Order              | Pin Position                             |
+--------------------+------------------------------------------+
| Coleoptera         | Through the RIGHT ELYTRON (front wing    |
| (beetles)          | cover), approximately 1/3 from the       |
|                    | anterior edge, so the pin emerges        |
|                    | between the middle and hind legs.        |
+--------------------+------------------------------------------+
| Lepidoptera        | Through the CENTER OF THE THORAX         |
| (butterflies/moths)| (mesothorax), between the wing bases.    |
|                    | Wings must be spread on a spreading      |
|                    | board before the specimen dries.         |
+--------------------+------------------------------------------+
| Hymenoptera        | Through the RIGHT SIDE OF THE THORAX     |
| (bees/wasps/ants)  | (mesothorax), between the wing bases.    |
+--------------------+------------------------------------------+
| Diptera            | Through the RIGHT SIDE OF THE THORAX     |
| (flies)            | (mesothorax), between the wing bases.    |
+--------------------+------------------------------------------+
| Hemiptera          | Through the RIGHT SIDE OF THE            |
| (true bugs)        | SCUTELLUM (triangular plate between      |
|                    | wing bases), slightly to the right of    |
|                    | center.                                  |
+--------------------+------------------------------------------+
| Orthoptera         | Through the RIGHT SIDE OF THE            |
| (grasshoppers)     | PRONOTUM (just behind the head), to      |
|                    | the right of the midline.                |
+--------------------+------------------------------------------+
| Odonata            | Through the CENTER OF THE THORAX.        |
| (dragonflies)      | Wings must be spread. Alternatively,     |
|                    | store in glassine envelopes.             |
+--------------------+------------------------------------------+
| All other orders   | Through the RIGHT SIDE OF THE THORAX     |
|                    | unless order-specific guidance is        |
|                    | available.                               |
+--------------------+------------------------------------------+

Pin Selection:
- Standard entomological pins: stainless steel, sizes 0-7
- Size 3 (0.50mm) is the most commonly used general-purpose size
- Size 1-2 for small beetles and flies; size 4-5 for large beetles
- Specimens under 5mm: mount on a paper point (triangular card
  glued to a standard pin) rather than pinning directly

Pin Height:
- The specimen should sit approximately 2/3 up the pin (leaving
  room below for 2 labels and above for handling)
- Use a pinning block (stepped block with 3 heights) to ensure
  consistent specimen and label heights across the collection

Spreading Wings (Lepidoptera, Odonata):
1. Pin the specimen through the thorax
2. Place on the spreading board with the body in the groove
3. Use paper strips to hold wings in position
4. Adjust wings so the hind margin of the forewing is perpendicular
   to the body axis
5. Leave on the board for 3-7 days until completely dry
6. Remove paper strips carefully
```

**期待結果:** 各標本が目に応じた正しい位置でピニングされ、ピン上の正しい高さに、必要に応じて翅が展翅されている（鱗翅目、トンボ目）。取り扱う前に標本が完全に乾燥するまで放置。

**失敗時:** 標本が乾燥しすぎてピニングできない場合（脚が折れる、翅が割れる）、まず軟化が必要。軟化室（湿った砂またはペーパータオルと防カビ用のフェノール数滴を入れた密閉容器）に24〜48時間入れ、四肢が柔軟になるまで待つ。ピンが間違った位置に刺さった場合、標本がまだ新鮮なうちに慎重に刺し直す方が、間違ったマウントのまま放置するよりも良い。

### ステップ5: エタノール保存（液浸保存）

乾燥させると縮んだり変形したりする軟体標本は液体で保存する必要がある。

```
Wet Preservation Protocol:
+--------------------+------------------------------------------+
| Category           | Procedure                                |
+--------------------+------------------------------------------+
| Preservative       | 70-80% ethanol for morphological study.  |
|                    | 95-100% ethanol for DNA-grade            |
|                    | preservation (change ethanol after 24    |
|                    | hours to remove dilution from body       |
|                    | fluids).                                 |
+--------------------+------------------------------------------+
| Suitable specimens | Larvae (caterpillars, grubs, maggots),   |
|                    | soft-bodied adults (aphids, termites,    |
|                    | some small Diptera), aquatic insects,    |
|                    | immature stages (nymphs, pupae)          |
+--------------------+------------------------------------------+
| Containers         | Glass vials with screw caps or           |
|                    | polyethylene snap-cap vials. Avoid       |
|                    | rubber stoppers (ethanol dissolves       |
|                    | them). Label goes INSIDE the vial.       |
+--------------------+------------------------------------------+
| Fluid ratio        | At least 3 parts preservative to 1 part  |
|                    | specimen volume. Too little fluid        |
|                    | results in poor preservation.            |
+--------------------+------------------------------------------+
| Long-term storage  | Check fluid levels every 6-12 months.    |
|                    | Ethanol evaporates even through sealed   |
|                    | caps. Top up as needed. Store in a cool, |
|                    | dark location.                           |
+--------------------+------------------------------------------+

Do NOT use:
- Formaldehyde/formalin for routine insect preservation (destroys DNA,
  poses health risks, requires special disposal). Some historical
  collections used it; modern practice strongly discourages it.
- Isopropanol as a substitute — it causes excessive hardening and
  color loss compared to ethanol.
```

**期待結果:** 軟体標本が70〜80%エタノール（またはDNA作業用に95%以上）でラベル付きバイアルに十分な液量で保存されている。

**失敗時:** フィールドでエタノールが入手できない場合、高アルコール度の透明な蒸留酒（ウォッカ、エバークリア）を緊急措置として一時的に使用できる。できるだけ早く試薬グレードのエタノールに移し替える。弱い保存液に長期間保管されて分解の兆候がある標本は、同定可能かもしれないが分子解析には不適。

### ステップ6: すべての標本にラベルを付ける

すべての標本に科学的使用に必要な最低限のデータを記載したラベルを付ける。ラベルのない標本には科学的価値がない。

```
Labeling Standards:

LABEL 1 (Locality label — placed closest to the specimen on the pin):
  Line 1: Country, State/Province
  Line 2: Specific locality (e.g., "3 km NE of Oakville, Elm Creek trail")
  Line 3: Latitude/Longitude (decimal degrees preferred)
  Line 4: Elevation (meters above sea level)
  Line 5: Date (e.g., 15.vi.2026 or 15-Jun-2026)
  Line 6: Collector name (e.g., "leg. P. Thoss")

LABEL 2 (Habitat/method label — below the locality label):
  Line 1: Habitat (e.g., "deciduous forest, oak canopy")
  Line 2: Collection method (e.g., "sweep net" or "light trap")
  Line 3: Additional ecological data if relevant

LABEL 3 (Determination label — lowest on the pin, added when identified):
  Line 1: Order Family
  Line 2: Genus species Author, Year
  Line 3: "det. [identifier name], [year]"

Label Format Rules:
- Use archival-quality paper (acid-free, resistant to fumigant chemicals)
- Print labels using a laser printer (inkjet fades; handwriting smudges)
- Labels should be small (approximately 13mm x 8mm) — do not obscure
  the specimen
- For wet specimens, the label goes INSIDE the vial on acid-free paper
  written in pencil or printed with a laser printer (ink dissolves in
  ethanol; pencil graphite does not)
- Pin labels below the specimen using the pinning block for consistent
  heights
```

**期待結果:** すべての標本に最低限、国、産地、座標、日付、採集者を記載した産地ラベルが付いている。液浸標本は鉛筆またはレーザープリンターで印刷された内部ラベルに同じデータが記載されている。

**失敗時:** フィールドでGPS座標が記録されなかった場合、産地の記述から地図を使用して推定する。日付が不確かな場合、最良の推定値を記録し疑問符を付ける。概算データのある標本は、ラベルのない標本よりもはるかに価値がある。ラベルをある標本から別の標本に移動させない。

### ステップ7: コレクションの保管と保護

適切な保管は、物理的損傷、害虫、環境劣化から標本を保護する。

```
Dry Collection Storage:
+--------------------+------------------------------------------+
| Component          | Standard                                 |
+--------------------+------------------------------------------+
| Unit trays         | Cardboard or plastic trays with foam     |
|                    | bottoms (plastazote preferred — pinnable |
|                    | and chemically inert). Specimens pinned  |
|                    | into the foam in organized rows.         |
+--------------------+------------------------------------------+
| Drawers            | Tight-fitting drawers that exclude dust  |
|                    | and pests. Glass-topped drawers allow    |
|                    | viewing without opening.                 |
+--------------------+------------------------------------------+
| Cabinets           | Steel cabinets with tight seals.         |
|                    | Compressed-air gaskets are ideal.        |
+--------------------+------------------------------------------+
| Pest management    | Place pest strips (dichlorvos/DDVP) or   |
|                    | naphthalene/paradichlorobenzene crystals  |
|                    | in each drawer. Check and replace every  |
|                    | 6 months. Museum beetle (Anthrenus) and  |
|                    | book lice (Psocoptera) are the primary   |
|                    | pests — a single infestation can destroy |
|                    | an entire drawer.                        |
+--------------------+------------------------------------------+
| Climate control    | Target: 40-50% relative humidity,        |
|                    | 18-22C temperature. Fluctuations cause   |
|                    | expansion/contraction damage. Avoid      |
|                    | direct sunlight (fades color).           |
+--------------------+------------------------------------------+

Wet Collection Storage:
- Store vials upright in racks or jars
- Check fluid levels every 6-12 months; top up with fresh ethanol
- Store in a cool, dark, well-ventilated area (ethanol fumes)
- Keep away from ignition sources (ethanol is flammable)
- For long-term storage, use screw-cap glass vials; snap-cap
  plastic vials allow more evaporation
```

**期待結果:** 乾燥標本が害虫忌避剤入りの密閉引き出しに保管されている。液浸標本が十分なエタノール量で直立保管されている。保管場所の温度と湿度が安定している。

**失敗時:** 適切な博物館保管設備がない場合、ピニングされた標本をフォームインサートと害虫忌避剤付きの気密プラスチック容器（タックルボックス、タッパーウェア）に保管する。これは個人コレクションと短期保管には十分。科学的に価値のある標本の長期保存には、認定された博物館または大学のコレクションに寄託する。

### ステップ8: キュレーションとデータベース入力

体系的なキュレーションとデータ管理を通じて、コレクションを生きた科学的資源として維持する。

```
Curation Tasks:
+--------------------+------------------------------------------+
| Task               | Frequency                                |
+--------------------+------------------------------------------+
| Pest inspection    | Every 3-6 months. Look for frass (fine   |
|                    | powder under specimens), cast skins,     |
|                    | or live pests in drawers.                |
+--------------------+------------------------------------------+
| Fumigant refresh   | Every 6 months. Replace pest strips or   |
|                    | crystals. Ensure drawers seal tightly.   |
+--------------------+------------------------------------------+
| Ethanol top-up     | Every 6-12 months for wet collections.   |
+--------------------+------------------------------------------+
| Repair             | Re-pin loose specimens. Re-glue detached |
|                    | appendages (use water-soluble PVA glue). |
|                    | Replace damaged labels.                  |
+--------------------+------------------------------------------+
| Identification     | Send unidentified specimens to           |
| updates            | specialists. Update determination labels |
|                    | as IDs are returned — never remove old   |
|                    | determination labels; add new ones below.|
+--------------------+------------------------------------------+

Database Entry (minimum fields):
- Catalog number (unique identifier for each specimen)
- Taxon (order, family, genus, species)
- Locality (country, state, specific location, coordinates)
- Date of collection
- Collector
- Collection method
- Determiner and determination date
- Storage location (cabinet, drawer, row, position)
- Preservation type (pinned, ethanol, slide-mounted, point-mounted)

Database Standards:
- Use Darwin Core format for interoperability with global databases
  (GBIF, iDigBio)
- Record coordinates in decimal degrees (WGS84 datum)
- Use ISO 8601 date format (YYYY-MM-DD) in databases
- Assign a unique catalog number to every specimen, even if unidentified
```

**期待結果:** すべての標本が一意の識別番号、分類情報、産地、日付、採集者、保管場所とともにデータベースに登録されている。コレクションが定期的な検査・メンテナンススケジュールに載っている。

**失敗時:** 完全なデータベースが実現できない場合、最低限、標本に対応するカタログ番号を記載した手書きのカタログまたはスプレッドシートを維持する。カタログ番号は標本とそのデータを結びつける — これがないと、ラベルが失われた場合に標本とデータが切り離される。単純な番号リストでさえ、カタログがないよりもましである。

## バリデーション

- [ ] 収集前に法的要件が確認され許可が取得された
- [ ] 対象分類群と生息地に適した収集方法が使用された
- [ ] 標本が人道的かつ迅速に致死処理された
- [ ] 乾燥標本が目に応じた正しい位置でピニングされた
- [ ] 鱗翅目とトンボ目は乾燥前に適切に展翅された
- [ ] 軟体標本が70〜80%エタノールで保存された
- [ ] すべての標本に日付、産地、座標、採集者を記載した産地ラベルが付いている
- [ ] 液浸標本のラベルが鉛筆またはレーザープリンターで作成されバイアル内に入っている
- [ ] 保管に害虫忌避剤と安定した環境条件が含まれている
- [ ] 標本が一意の識別番号とともにデータベースまたはノートブックに登録されている

## よくある落とし穴
- **無許可での収集**: 違法に収集された標本は、出版された研究に使用できず、博物館に寄託できず、国境を越えて移動できない。常に最初に許可を取得する
- **過剰収集**: 必要以上の標本を採取すると科学的利益なく個体群を減少させる。1サイトあたり1形態種につき同定に必要な最小数（多くの場合5〜10個体）を収集する
- **異なるサイトの標本を1つの容器に混合**: これはバッチ内のすべての標本の産地データを不確かにする。各収集イベントは独自の一時ラベル付きの別の容器に保管する
- **間違ったピン位置の使用**: 甲虫を右翅鞘ではなく胸部中央にピニングすると腹面の診断的特徴が隠される。常に目固有のピン位置を確認する
- **DNA作業にはエタノール濃度が低すぎる**: 分子解析用の標本には、体液希釈を除去するために24時間後に交換した95%以上のエタノールが必要。標準の70%エタノールは形態を保存するが時間とともにDNAを劣化させる
- **液浸標本の内部ラベル忘れ**: バイアルの外側にテープで貼ったラベルは剥がれる可能性がある。バイアル内のラベルが永久記録。常に鉛筆またはレーザープリンターで作成したラベルを標本とともに内部に入れる
- **害虫管理の怠慢**: カツオブシムシ（博物館害虫）は数週間で引き出し全体の標本を破壊できる。数ヶ月以上保管するコレクションでは、定期的な害虫監視と忌避剤の交換は任意ではない
## 関連スキル
- `identify-insect` -- 二分検索表、翅脈、口器、触角を用いた収集標本の形態学的同定
- `document-insect-sighting` -- 物理的収集を補完または代替する可能性のある目撃情報の写真・コンテキスト記録
- `observe-insect-behavior` -- 収集前または収集の代わりに行う生きた昆虫の行動観察プロトコル
- `survey-insect-population` -- 同定とバウチャー目的で通常標本収集を必要とする体系的な個体群調査