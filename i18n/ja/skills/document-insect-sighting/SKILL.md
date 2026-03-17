---
name: document-insect-sighting
description: >
  昆虫目撃を位置、日付、生息地、写真、行動メモ、予備的同定、市民科学プラットフォームへの
  提出とともに記録する。GPS座標、気象条件、微小生息地の記述、マクロ写真撮影技術、行動
  観察、体制図を用いた目レベルの予備的同定、iNaturalistなどの市民科学プラットフォームへの
  提出を網羅する。記録したい昆虫に遭遇した時、市民科学の生物多様性データベースへの貢献時、
  個人的な観察日誌の作成時、ジオリファレンスされた写真記録による生態調査の支援時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: basic
  language: natural
  tags: entomology, insects, documentation, citizen-science, iNaturalist, photography
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 昆虫目撃の記録

生物多様性研究のために、構造化されたデータ、高品質な写真、市民科学プラットフォームへの提出とともに昆虫目撃を記録する。

## 使用タイミング

- 個人的な記録または研究のために記録したい昆虫に遭遇した時
- iNaturalistやBugGuideなどの市民科学プラットフォームに観察を提供する時
- 生息地や地域の体系的な観察日誌を作成する時
- ジオリファレンスされた写真記録で生態調査を支援したい時
- 昆虫の多様性を観察し記録することを学ぶ初心者の時

## 入力

- **必須**: 昆虫目撃（野外の生きた昆虫または最近遭遇した標本）
- **必須**: 接写撮影が可能なカメラまたはスマートフォン
- **任意**: GPS機器または位置情報サービスが有効なスマートフォン
- **任意**: 文字記録用のノートまたはフィールドジャーナル
- **任意**: 微細な詳細観察用のハンドレンズ（10倍）
- **任意**: 写真のスケール基準用の定規またはコイン
- **任意**: iNaturalistアカウントまたは同等の市民科学プラットフォームアカウント

## 手順

### ステップ1: 位置、日付、気象の記録

昆虫に近づく前にコンテキストを記録する。多くの種は生息地特異的で季節的に活動するため、このメタデータは写真と同等に重要である。

```
Sighting Record — Context:
+--------------------+------------------------------------------+
| Field              | Record                                   |
+--------------------+------------------------------------------+
| Date               | Full date and time (e.g., 2026-06-15,    |
|                    | 14:30 local time)                        |
+--------------------+------------------------------------------+
| Location           | GPS coordinates if available; otherwise   |
|                    | describe precisely (e.g., "south bank of |
|                    | Elm Creek, 200m east of footbridge")     |
+--------------------+------------------------------------------+
| Elevation          | Meters above sea level if available       |
+--------------------+------------------------------------------+
| Weather            | Temperature (estimate is fine), cloud     |
|                    | cover, wind, recent rain                 |
+--------------------+------------------------------------------+
| Season phase       | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
```

**期待結果:** 日付、時刻、正確な位置（理想的にはGPS座標）、観察時の気象条件を含む完全なコンテキスト記録。

**失敗時:** GPSが利用できない場合、ランドマーク（登山道の分岐点、建物、水域の特徴）に対する相対位置で、その場所を再発見できる十分な詳細さで記述する。気象データが不確実な場合、温度範囲を推定し、フィールドを空白にするのではなく「曇り」や「快晴」と記す。

### ステップ2: 生息地と微小生息地の記録

景観内のどこで昆虫が見つかったか、どの直接的な基質または構造を使用していたかを記録する。

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Broad habitat      | Deciduous forest, grassland, wetland,    |
|                    | urban garden, riparian corridor, desert   |
+--------------------+------------------------------------------+
| Microhabitat       | Underside of leaf, bark crevice, flower   |
|                    | head, soil surface, under rock, on water  |
|                    | surface, in flight                       |
+--------------------+------------------------------------------+
| Substrate          | Specific plant species if known, dead     |
|                    | wood, dung, carrion, bare soil, rock     |
+--------------------+------------------------------------------+
| Plant association  | What plant is the insect on or near?     |
|                    | (host plant relationships are diagnostic) |
+--------------------+------------------------------------------+
| Light conditions   | Full sun, partial shade, deep shade       |
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, submerged margin          |
+--------------------+------------------------------------------+
```

**期待結果:** 昆虫が見つかった広い景観と直接的な微小生息地の両方を含む、昆虫を生態学的コンテキストに位置付ける生息地の記述。

**失敗時:** 微小生息地の特定が困難な場合（例：飛行中の昆虫）、何の近くを飛んでいたか、何に止まったかを記す。フィールドを空白にするのではなく「飛行中、草地の草の上1m」と記録する。

### ステップ3: 診断品質での写真撮影

良い写真は目撃記録の最も重要な要素である。市民科学の同定はほぼ完全に画像品質に依存する。

```
Photography Protocol:

Shots to take (in priority order):
1. DORSAL (top-down) — shows wing pattern, body shape, coloration
2. LATERAL (side view) — shows leg structure, body profile, antennae
3. FRONTAL (head-on) — shows eyes, mouthparts, antennae base
4. VENTRAL (underside) — if accessible, shows leg joints, abdominal pattern
5. SCALE REFERENCE — place a coin, ruler, or finger near the insect
   for size comparison (do not touch the insect)

Tips for quality macro photographs:
- Get as close as your camera allows while maintaining focus
- Use natural light; avoid flash if possible (causes glare and flattens detail)
- Shoot against a neutral background when feasible (leaf, paper, hand)
- Hold the camera parallel to the insect's body plane for maximum sharpness
- Take multiple shots at each angle — at least 3 per view
- If the insect is moving, use burst mode or continuous shooting
- Photograph the insect in situ first, then closer shots if it remains
- Include at least one photo showing the insect in its habitat context
- If wings are open, photograph quickly — the pattern may change when
  wings close (especially butterflies and dragonflies)
```

**期待結果:** 少なくとも3枚の使用可能な写真：背面1枚、側面1枚、スケール基準1枚。理想的には複数の角度をカバーする5枚以上の画像。

**失敗時:** 複数の角度を撮影する前に昆虫が動いた場合、背面写真（上から）を優先する — 同定に最も多くの診断情報を持つため。鮮明な背面写真1枚は複数のぼやけた画像より価値がある。写真を撮る前に昆虫が飛び去った場合、すぐに記憶から体形をスケッチし色を記す。

### ステップ4: 行動と相互作用の記録

行動観察は写真だけでは捉えられない生態学的価値を加える。

```
Behavioral Notes:
+--------------------+------------------------------------------+
| Category           | Record what you observe                  |
+--------------------+------------------------------------------+
| Activity           | Feeding, flying, resting, mating,        |
|                    | ovipositing (egg-laying), burrowing,     |
|                    | grooming, basking                        |
+--------------------+------------------------------------------+
| Movement           | Crawling, hovering, darting, undulating   |
|                    | flight, walking on water, jumping        |
+--------------------+------------------------------------------+
| Feeding            | What is it eating? Nectar, pollen, leaf   |
|                    | tissue, other insects, dung, sap?        |
+--------------------+------------------------------------------+
| Interactions       | Other insects nearby? Being predated?     |
|                    | Ants attending? Parasites visible?        |
+--------------------+------------------------------------------+
| Sound              | Buzzing, clicking, stridulation (wing or  |
|                    | leg rubbing)? Silent?                    |
+--------------------+------------------------------------------+
| Abundance          | Solitary individual, a few, many (swarm,  |
|                    | aggregation)?                            |
+--------------------+------------------------------------------+
| Duration           | How long did you observe?                 |
+--------------------+------------------------------------------+
```

**期待結果:** 少なくとも3つの行動観察が記録されている：活動、移動パターン、個体数。

**失敗時:** 昆虫との遭遇が短時間の場合（例：止まってすぐに飛び去る）、観察できたことを記録し観察時間を記す。「葉の表面に静止、単独、近づくと飛翔、観察時間5秒」でも有用なデータである。

### ステップ5: 目レベルの予備的同定

種を同定する必要はない。昆虫をその目に位置付けることで同定が大幅に絞り込まれ、市民科学のレビュアーを助ける。

```
Quick Key to Major Insect Orders:

1. Count the legs.
   - 6 legs → insect (proceed below)
   - 8 legs → arachnid (spider, tick, mite) — not an insect
   - More than 8 legs → myriapod (centipede, millipede) — not an insect
   - Wings but hard to count legs → likely insect; look at wings

2. Examine the wings.
   - Hard front wings (elytra) covering body → Coleoptera (beetles)
   - Scaly wings, often colorful → Lepidoptera (butterflies/moths)
   - Two wings + knob-like halteres → Diptera (flies)
   - Four membranous wings + narrow waist → Hymenoptera (bees/wasps/ants)
   - Half-leathery, half-membranous front wings → Hemiptera (true bugs)
   - Large, transparent wings + long abdomen → Odonata (dragonflies/damselflies)
   - Straight, narrow, leathery front wings → Orthoptera (grasshoppers/crickets)
   - No wings, laterally flattened, jumps → Siphonaptera (fleas)
   - No wings, pale body, in wood or soil → Isoptera (termites)

3. If unsure, note: "Order uncertain — resembles [description]"
```

**期待結果:** 目レベルの予備的同定（例：「Coleoptera — 甲虫」）または正直な「目不明」と物理的説明。

**失敗時:** 昆虫がクイックキーのどの目にも明確に一致しない場合、体形、翅の種類、脚の数を記録する。iNaturalistのようなプラットフォームは出発点の同定として「Insecta」を受け入れ、コミュニティの同定者が改良する。正直な「不明」は間違った属や種よりも常に許容され、好ましい。

### ステップ6: 市民科学プラットフォームへの提出

専門家やコミュニティの同定者が同定を検証・改良できるプラットフォームに目撃情報をアップロードする。

```
Submission Checklist for iNaturalist (or equivalent):

1. Upload photographs — start with the best dorsal shot
2. Set location — use the map pin or enter GPS coordinates
3. Set date and time of observation
4. Add initial identification (order or family if known; "Insecta" if not)
5. Add observation notes:
   - Habitat and microhabitat
   - Behavior observed
   - Approximate size
   - Any sounds produced
6. Mark as "wild" (not captive/cultivated)
7. Set location accuracy — use the uncertainty circle to reflect GPS precision
8. Submit and monitor for community identifications

Data Quality Tips:
- Observations with 3+ photos from different angles get identified faster
- Including habitat context in one photo helps remote identifiers
- Adding a size reference dramatically improves identification accuracy
- Responding to identifier questions speeds up the process
- "Research Grade" status requires 2+ agreeing identifications at species level
```

**期待結果:** 写真、位置、日付、予備的同定を含む完全な観察が市民科学プラットフォームに提出され、コミュニティレビューの準備ができている。

**失敗時:** 野外でインターネット接続がない場合、後でアップロードする意図ですべての写真とメモをローカルに保存する。ほとんどのプラットフォームは日付を遡った提出を許可する。アカウントがない場合、個人日誌に記録を保存する — データは自身の学習にとって価値があり、後でアップロードできる。

## バリデーション

- [ ] 昆虫に近づく前に日付、時刻、正確な位置が記録された
- [ ] 気象と生息地コンテキストが文書化された
- [ ] 少なくとも3枚の異なる角度からの写真が撮影された
- [ ] 少なくとも1枚の写真にスケール基準が含まれている
- [ ] 行動と活動が記録された
- [ ] 目レベルの予備的同定が試みられた（または正直に不明と記された）
- [ ] 観察が市民科学プラットフォームに提出されたか、構造化された日誌に保存された

## よくある落とし穴

- **近づきすぎが早すぎる**: 多くの昆虫は急速に近づくと逃げる。ゆっくり動き、対象の上に影を落とすのを避ける。最初は遠くから撮影し、徐々に距離を縮める
- **生息地コンテキストを無視する**: 白い壁の上の昆虫の写真は生態学的コンテキストを失う。常に昆虫が自然な環境にある少なくとも1枚の原位置写真を含める
- **1枚の写真に頼る**: 1枚の画像では同定に不十分なことが多い。翅のパターン、脚の構造、触角は特定の角度からしか見えない場合がある
- **スケールを忘れる**: サイズ基準がないと、5mmの甲虫と50mmの甲虫は写真では同一に見える。常にコイン、定規、または指をスケールとして含める
- **同定を強制する**: 市民科学プラットフォームに自信のある間違った同定を提出すると研究者にノイズを生む。「Insecta」や「目不明」は常に許容され、間違った属や種よりも好ましい
- **否定データを記録しない**: 「ミルクウィードパッチで昆虫観察なし」は調査にとって価値のある不在データである。見つけたものだけでなく、確認したことを記録する

## 関連スキル

- `identify-insect` — 予備的な目レベルを超えた詳細な形態学的同定手順
- `observe-insect-behavior` — より深い行動研究のための構造化された動物行動学的観察プロトコル
- `collect-preserve-specimens` — 確定的な同定のために物理標本が必要な場合
- `survey-insect-population` — 個別目撃を体系的な集団レベルの調査にスケーリングする
