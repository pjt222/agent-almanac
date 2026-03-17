---
name: cut-gemstone
description: >
  カボションとファセッティング技法を用いて宝石を研磨する。原石の評価、最適な色と
  歩留まりのためのオリエンテーション、ドッピング、カット角度、標準ブリリアントカットの
  クラウン/パビリオンジオメトリをカバーする。カボションまたはファセット石にカットする
  原石がある時、最適な色や光学現象のためのカットオリエンテーション計画時、キャビング
  またはファセッティングマシンの初回セットアップ時、素材に適したカットアプローチの
  選定時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, cutting, faceting, cabochon, gemstones
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 宝石のカット

カボションとファセッティング技法を使用して原石から宝石をカットする。原石の評価、オリエンテーション計画、ドッピング、研削、ファセッティングジオメトリを含む。

## 使用タイミング

- 原石をカボションまたはファセット石に仕上げたい時
- 最適な色、歩留まり、光学現象のためのカットオリエンテーションを計画する必要がある時
- キャビングマシンまたはファセッティングマシンを初めてセットアップする時
- 標準ブリリアントカットのクラウンとパビリオンの角度を理解したい時
- 素材に適したカットアプローチを選定する必要がある時

## 入力

- **必須**: 原石（鑑別済みの鉱物種 — `identify-gemstone`を参照）
- **必須**: カットアプローチの判断: カボションまたはファセッティング
- **必須**: 目標形状と概算サイズ
- **任意**: ダイヤモンドブレード付きトリムソー
- **任意**: 80/220/600/1200/3000番ホイール付きキャビングマシン（カボション用）
- **任意**: インデックスギア、マスト、ラップセット付きファセッティングマシン（ファセッティング用）
- **任意**: ドップワックスまたはエポキシ、ドップスティック、アルコールランプ
- **任意**: テンプレート（オーバル、ラウンド、マーキス）標準キャリブレーションサイズ

## 手順

### ステップ1: 原石の評価と安全チェック

カットを始める前に原石を評価する。

```
Rough Assessment Checklist:
+--------------------+------------------------------------------+
| Factor             | Assessment                               |
+--------------------+------------------------------------------+
| Species            | Identified? (MANDATORY before cutting)   |
|                    | Toxic dust risk? (check below)           |
+--------------------+------------------------------------------+
| Fractures          | Internal fractures that limit yield?     |
|                    | Will the stone break during cutting?     |
+--------------------+------------------------------------------+
| Colour zones       | Where is the best colour concentrated?   |
|                    | Can the cut centre the colour?           |
+--------------------+------------------------------------------+
| Inclusions         | Large inclusions that should be cut away?|
|                    | Silk for star stones? (orient for star)  |
+--------------------+------------------------------------------+
| Size and shape     | What finished shapes fit this rough?     |
|                    | Calibrated size possible?                |
+--------------------+------------------------------------------+
| Yield estimate     | Approximate finished weight as % of rough|
|                    | Typical: 25-40% for faceting             |
|                    | Typical: 40-60% for cabochons            |
+--------------------+------------------------------------------+

SAFETY — TOXIC DUST MATERIALS:
These minerals produce hazardous dust when cut. Use wet cutting ONLY,
ensure ventilation, and wear an appropriate respirator:
- Chrysotile (asbestos serpentine) — NEVER cut dry
- Malachite — copper carbonate dust is toxic
- Cinnabar — mercury sulfide, extremely toxic
- Orpiment/Realgar — arsenic compounds
- Chrysocolla — copper silicate, moderate risk
- Tiger's eye (fibrous) — fine silica fibers

ALL stone cutting produces silica dust. Always use water cooling
and never grind or cut dry without a dust extraction system.
```

1. 鉱物種の同定を確認する（不明な場合は先に`identify-gemstone`を実行）
2. 有毒粉塵リスクをチェックする — 一部の素材は追加の予防措置が必要
3. 強い透過光下でフラクチャーを検査する
4. カラーゾーンとインクルージョンの位置をマッピングする
5. 原石から得られる仕上がり形状を見積もる

**期待結果:** 鉱物種が確認され、フラクチャーがマッピングされ、カラーゾーンが特定され、カット計画が立てられた原石評価書。

**失敗時:** 原石に広範なフラクチャーがある場合、安定化処理（多孔質素材へのエポキシ含浸）が可能か、歩留まりがカットを正当化するには低すぎるかを検討する。一部の原石は標本素材として販売・交換した方がよい。

### ステップ2: オリエンテーション計画

最適な色と現象のためのカット方向を決定する。

```
Orientation Principles by Stone Type:

PLEOCHROIC STONES (tourmaline, sapphire, tanzanite, iolite):
- Orient the table perpendicular to the crystal axis showing
  the best face-up colour
- Tourmaline: the c-axis often shows dark/opaque colour —
  orient the table to view the a/b axis colour
- Sapphire: slight pleochroism — orient for deepest blue face-up
- Tanzanite: trichroic — blue/violet axis preferred for table

STAR STONES (star ruby, star sapphire):
- Silk (rutile needles) must be parallel to the base
- Cut as cabochon with the dome centred over the silk
- The star appears at 90 degrees to the silk orientation

CAT'S EYE STONES (chrysoberyl cat's eye, tiger's eye):
- Fibrous inclusions must run perpendicular to the length
  of an elongated cabochon
- The eye appears as a bright line across the shortest dimension

COLOUR-ZONED MATERIAL (sapphire, ametrine, watermelon tourmaline):
- Position colour zones so they are not visible face-up
- Or feature them intentionally (ametrine, watermelon tourmaline)
```

1. ダイクロスコープで複数方向から観察し、多色性があるか確認する
2. 現象石（スター、キャッツアイ）の場合、インクルージョンパターンを特定し、それに合わせてオリエンテーションを決める
3. カラーゾーンのある素材の場合、ゾーニングを隠すか見せるかを判断する
4. アルミニウムペンシルで原石にオリエンテーションをマーキングする
5. 選択したオリエンテーションで歩留まりを最大化するようテーブル位置と深さを計画する

**期待結果:** テーブル方向、オリエンテーション、概略の輪郭が示されたマーキング済みの原石。カット計画が色の見え方と歩留まりを最適化している。

**失敗時:** 最良の色のオリエンテーションが最大歩留まりと矛盾する場合、優先度に基づいて判断する: 色の品質はほぼ常に追加のカラット重量より価値を高める。迷った場合は色を優先してオリエンテーションを決める。

### ステップ3: カボションカット

キャビングマシンでドーム型カボションに成形する。

```
Cabochon Cutting Sequence:

EQUIPMENT SETUP:
- Cabbing machine with water drip on all wheels
- Wheel sequence: 80, 220, 600, 1200, 3000 (or 1200 + polish)
- Dop sticks and dop wax (or cyanoacrylate adhesive)
- Safety glasses — MANDATORY
- Avoid loose clothing, tie back long hair

STEP-BY-STEP:
1. SLAB: Cut a slab 5-8mm thick through the best area
2. TEMPLATE: Mark the desired outline (oval, round, etc.)
   using a template and aluminum pencil
3. TRIM: Remove excess material on the trim saw or 80-grit wheel
   Cut close to the line but leave 1-2mm margin
4. DOP: Attach the slab to a dop stick with dop wax
   Heat the wax, press the stone flat-side down, centre it
5. SHAPE (80 grit): Grind to the template outline
   Work all the way around, maintaining symmetry
6. DOME (220 grit): Shape the dome profile
   Standard dome height = ~1/3 of the stone's width
   Keep the dome symmetrical — check from all angles
7. SMOOTH (600 grit): Remove 220-grit scratches
   Work systematically, keeping even pressure
8. PRE-POLISH (1200 grit): Remove 600-grit scratches
   The surface should feel smooth to the fingernail
9. FLAT BOTTOM: Remove the stone from the dop, re-dop
   face-down, and grind the bottom flat on 220 → 600 grit
10. POLISH: See polish-gemstone skill for final finishing
```

1. すべてのホイールに水流を確保してキャビングマシンをセットアップする
2. 保護メガネを着用する — 例外なし
3. スラブをカットし、テンプレートの輪郭をマーキングする
4. 石をしっかりドッピングする — 研削中の石の脱落は危険
5. 80番でシェイプ、220番でドーム、600番と1200番で滑らかに仕上げる
6. 全体を通して一定のドーム曲率を維持する — 不均一なドームは研磨後に「フラットスポット」が見える

**期待結果:** 対称的な輪郭、均一なドーム高さ、1200番段階からの目に見える傷がない、最終研磨の準備ができた滑らかなドーム型カボション。

**失敗時:** ドームにフラットスポットや非対称がある場合、220番に戻って再成形する。不均一なドームを研磨するより少量の素材を失う方がよい。研削中に石がドップから外れた場合、注意深く再ドッピングして続行する — まず石のチッピングを確認する。

### ステップ4: ファセッティング

ファセッティングマシンで精密な幾何学的ファセットをカットする。

```
Standard Round Brilliant Angles (quartz-family, RI ~1.54):
+------------------+-------+--------+
| Facet            | Angle | Index  |
+------------------+-------+--------+
| Crown main       | 42°   | 96-index: 3,9,15,21,27,33,39,45 |
| Crown break      | 25°   | (bisect mains)                   |
| Crown star       | 15°   | (bisect breaks toward table)     |
| Table            | 0°    | flat    |
| Pavilion main    | 43°   | 96-index: 3,9,15,21,27,33,39,45 |
| Pavilion break   | Use GemCad or published diagrams           |
+------------------+-------+--------+

Standard Round Brilliant Angles (corundum, RI ~1.76):
+------------------+-------+
| Facet            | Angle |
+------------------+-------+
| Crown main       | 37°   |
| Pavilion main    | 41°   |
+------------------+-------+

CRITICAL: Pavilion angles determine brilliance.
- Too shallow → light leaks through bottom ("windowing")
- Too steep → dark extinction zones
- Correct angle → total internal reflection (brilliance)
```

1. 目標形状と素材のRI用の公表されたファセッティングダイアグラムを選択する
2. 原石を準備する: パビリオン側（尖った底面が下向き）を平らにする
3. 石をドッピングする — ラウンド石にはコーンドップ、その他にはフラットドップを使用
4. パビリオンファセットを粗いラップ（600メッシュダイヤモンド）で公表角度にカットする
5. すべてのパビリオンファセットを精密な一点（「キュレットミート」）に合わせる
6. コーンドップに移す（またはトランスファージグを使用）してクラウンをカットする
7. クラウンメイン、次にブレイク、次にスターをカットし、テーブルを最後に仕上げる
8. 各段階を事前研磨し研磨する（ラップとコンパウンドの選択は`polish-gemstone`を参照）

**期待結果:** 精密なミート（ファセットの稜が単一の点に収束する）、一定のファセットサイズ、良好な対称性、素材のRIに適した角度を持つファセット石。

**失敗時:** ファセットミートがずれている場合、角度またはインデックス設定がわずかに間違っている。公表されたダイアグラムを再確認する。「ミートを追う」（一つのファセットを直すために別のファセットを調整する）とエラーが複合する — 誤差が大きい場合はその段階を再カットする方がよい。初心者の小さなミートエラーは正常であり、ブリリアンスに大きな影響を与えない。

### ステップ5: カット後の検査

最終研磨に進む前にカットした石を評価する。

1. 石を徹底的に洗浄する
2. 対称性を確認する: 上から（輪郭）、横から（プロポーション）、テーブルを通して（ミートの精度）
3. カボションの場合: ドームの均一性を確認し、フラットスポットをチェックし、一貫した輪郭形状を確保する
4. ファセット石の場合: 10倍ルーペでミートを確認し、カット段階の残留傷を探す
5. 最終寸法と重量を測定する
6. 欠陥が見つかった場合、研磨前に適切なカットステップに戻る

**期待結果:** 対称性、ミート、表面処理の品質基準を満たし、研磨段階の準備ができた完全にカットされた石。

**失敗時:** 重大な欠陥が見つかった場合（不良な対称性、悪いミート、不正確なプロポーション）、欠陥のある石を研磨して後で再カットするより、今再カットする方が時間効率が良い。次の石のために何が問題だったかを記録する。

## バリデーション

- [ ] カット前に鉱物種が同定され、有毒粉塵リスクが評価されている
- [ ] すべての研削・カット作業中に安全装備が着用されている（目の保護、粉塵/飛散制御）
- [ ] すべての研削・カット作業で水冷却が有効になっている
- [ ] 最適な色または現象のためのオリエンテーションが計画されている
- [ ] カボションドームが対称でフラットスポットがない（カボションパス）
- [ ] ファセットミートが著しいオフセットなく点に収束している（ファセッティングパス）
- [ ] 最終寸法が測定・記録されている
- [ ] 石にカット段階の傷がなく研磨の準備ができている

## よくある落とし穴

- **未鑑別の石のカット**: 一部の素材は有毒粉塵を発生する（マラカイト、辰砂、クリソタイル）。カット前に必ず鑑別する。素材に関係なく常に水冷却を使用する
- **オリエンテーション計画の省略**: 多色性のある石をオリエンテーションなしにカットすると、正しいオリエンテーションなら美しかったはずの鈍い色や変色した仕上がりになりうる
- **乾式研削**: 乾式研削はシリカ粉塵（慢性的な健康被害）を発生させ、石を過熱させる（熱衝撃でフラクチャーが生じうる）。すべてのホイールとラップで水を連続的に流す必要がある
- **番手の飛ばし**: 220番から1200番に飛ぶと、研磨後に見える深い傷が残る。各番手段階で前の段階の傷を完全に除去する必要がある
- **ドッピング不良**: 不十分なドップ接着は研削中に石がずれたり飛び出す原因になる。十分なワックスを使い、石が温かい（冷たくない）ことを確認し、研削前にドップを完全に冷却する

## 関連スキル

- `identify-gemstone` -- カット開始前に鉱物種の鑑別が必要
- `polish-gemstone` -- カット後の次のステップ。ラップの選択、コンパウンドの選定、最終仕上げをカバー
