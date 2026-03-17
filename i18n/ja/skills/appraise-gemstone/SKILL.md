---
name: appraise-gemstone
description: >
  4C（カラー、クラリティ、カット、カラット）、産地評価、処理検出、市場要因分析を
  使用して宝石の価値を鑑定する。教育的アドバイザリーガイダンスのみ —
  認定鑑定ではない。宝石の価値を決定する要因を理解する時、専門鑑定前の
  事前スクリーニング、販売者の提示価格が妥当か評価する時、宝石グレーディング
  方法論を学ぶ時、処理状態が価値に与える影響を理解する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, appraisal, valuation, gemstones, grading
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 宝石の鑑定

4C（カラー、クラリティ、カット、カラット重量）、処理検出、産地評価、市場要因分析を使用して宝石の価値を鑑定する。これは教育的アドバイザリーガイダンスのみであり、認定宝石鑑定を構成するものではない。

> **免責事項**: この手順は宝石評価方法論に関する教育的ガイダンスを提供する。認定鑑定ではない。保険、遺産、売買、法的目的には、必ず認定宝石鑑定士（GIA Graduate Gemologist、FGA、または同等資格）による正式な鑑定を取得すること。宝石の価値は、実物を専門家が直接評価する必要がある要因に基づいて大きく変動する可能性がある。

## 使用タイミング

- 宝石の価値を決定する要因を理解したい時
- 専門鑑定費用を支払う前に石を事前スクリーニングする時
- 販売者の提示価格が妥当な範囲内か評価する必要がある時
- 教育目的で宝石グレーディング方法論を学んでいる時
- 処理状態が価値にどう影響するか理解したい時

## 入力

- **必須**: 鑑定済みの宝石（種が確認済み — `identify-gemstone`を参照）
- **必須**: 石へのアクセス（ルースが望ましい; マウント石は評価を制限する）
- **任意**: カラットスケール（0.01 ctまでの精度）
- **任意**: 10倍ルーペまたは宝石学顕微鏡
- **任意**: 昼光相当光源（5500-6500K）
- **任意**: カラーグレーディングマスターストーンまたは参考画像（GIAシステム）
- **任意**: 屈折計およびチェルシーフィルター（処理検出用）

## 手順

### ステップ1: カラーグレーディング

石のカラーを3つの要素（色相、彩度、明度）を使用して評価する。

```
Colour Assessment Framework:

HUE: The dominant spectral colour
+------------------+------------------------------------------+
| Primary Hue      | Examples                                 |
+------------------+------------------------------------------+
| Red              | Ruby, red spinel, pyrope garnet          |
| Orange           | Spessartine garnet, fire opal            |
| Yellow           | Yellow sapphire, citrine, chrysoberyl    |
| Green            | Emerald, tsavorite, peridot, tourmaline  |
| Blue             | Sapphire, aquamarine, tanzanite          |
| Violet/Purple    | Amethyst, purple sapphire                |
| Pink             | Pink sapphire, morganite, kunzite        |
+------------------+------------------------------------------+
Secondary modifiers: yellowish-green, purplish-red, orangy-pink, etc.

SATURATION: Intensity of the colour
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Vivid            | Pure, intense colour (most valuable)     |
| Strong           | Rich colour, slight modifier             |
| Moderate         | Noticeable colour, some grey/brown       |
| Weak             | Faint colour, significant grey/brown     |
| Greyish/Brownish | Colour masked by grey or brown modifiers |
+------------------+------------------------------------------+

TONE: Lightness or darkness
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Very light       | Pastel, may lack presence                |
| Light            | Attractive in some species (aquamarine)  |
| Medium-light     | Often ideal for many species             |
| Medium           | Classic "fine" tone for most coloured    |
|                  | gemstones                                |
| Medium-dark      | Rich, but watch for over-darkening       |
| Dark             | Colour may appear black face-up          |
| Very dark        | Loses transparency, appears opaque       |
+------------------+------------------------------------------+

IDEAL COLOUR RANGES (highest value):
- Ruby: medium-dark, vivid red ("pigeon blood")
- Sapphire: medium, vivid blue (not too dark, not violetish)
- Emerald: medium, vivid green (not yellowish, not bluish)
- Tanzanite: medium-dark, vivid violetish-blue
- Aquamarine: medium, strong blue (not greenish)
```

1. 昼光相当照明下でフェイスアップで石を観察する
2. 主要色相と二次的修飾色を特定する
3. 彩度を評価する — ビビッドとストロングが最も高いプレミアムを得る
4. 明度を評価する — ミディアムが一般的に最適; 暗すぎるか明るすぎると価値が下がる
5. 利用可能な場合、参考画像またはマスターストーンと比較する
6. フェイスアップで見えるカラーゾーニングを記録する（価値を下げる）

**期待結果:** 石のカラー品質スペクトラム上の位置を示す3要素カラーグレード（例: 「わずかにバイオレット修飾のある中程度ビビッドブルー」）。

**失敗時:** 照明条件が理想的でない場合（黄色い室内照明）、その制限を記録する。不適切な照明下でのカラーグレーディングは信頼性の低い結果を生む。カラーチェンジが疑われる場合（アレキサンドライト、一部のサファイア、一部のガーネット）、昼光と白熱灯の両方で評価する。

### ステップ2: クラリティグレーディング

10倍拡大下で石の内部特徴を評価する。

```
Coloured Gemstone Clarity Scale (GIA-based):

+-------------------+------------------------------------------+
| Grade             | Description                              |
+-------------------+------------------------------------------+
| VVS               | Very Very Slightly Included: minute      |
| (eye-clean)       | inclusions, difficult to see at 10x      |
+-------------------+------------------------------------------+
| VS                | Very Slightly Included: minor            |
| (eye-clean)       | inclusions, noticeable at 10x            |
+-------------------+------------------------------------------+
| SI1               | Slightly Included: noticeable at 10x,    |
| (usually eye-     | may be visible to the eye                |
| clean)            |                                          |
+-------------------+------------------------------------------+
| SI2               | Slightly Included: easily seen at 10x,   |
| (eye-visible)     | visible to the unaided eye               |
+-------------------+------------------------------------------+
| I1                | Included: obvious inclusions that may    |
|                   | affect transparency or durability        |
+-------------------+------------------------------------------+
| I2-I3             | Heavily Included: prominent inclusions   |
|                   | that affect beauty and/or durability     |
+-------------------+------------------------------------------+

SPECIES-SPECIFIC EXPECTATIONS:
Different species have different "normal" clarity levels:
- Type I (usually eye-clean): aquamarine, topaz, chrysoberyl
  → Inclusions are penalized more heavily
- Type II (usually included): ruby, sapphire, tourmaline
  → Eye-clean examples command significant premiums
- Type III (almost always included): emerald, red tourmaline
  → Eye-clean examples are extremely rare and valuable
```

1. まずフェイスアップで石を観察する — 肉眼でインクルージョンが見えるか？
2. 10倍拡大で観察し、テーブルを通して焦点を合わせる
3. インクルージョンのタイプ（結晶、フェザー、フィンガープリント、シルク、ニードル）、サイズ、位置、数を記録する
4. インクルージョンが透明度、輝き、耐久性に影響するか評価する
5. インクルージョンの視認性と影響に基づいてクラリティグレードを付与する
6. 種固有の期待値を考慮する — SI1のエメラルドは優秀; SI1のアクアマリンは平均的

**期待結果:** 主要なインクルージョン、その位置、美しさと耐久性への影響の説明を伴うクラリティグレード。グレードは種固有の期待値に合わせて調整される。

**失敗時:** 拡大が不十分な場合（ルーペなし）、アイクリーン/非アイクリーンの評価のみ行う。制限を記録する。石がマウントされていてパビリオンのインクルージョンが隠れている場合、評価できなかった領域を記録する。

### ステップ3: カット品質評価

プロポーション、シンメトリー、光パフォーマンスに基づいてカット品質を評価する。

```
Cut Quality Factors:

PROPORTIONS:
+------------------+------------------------------------------+
| Factor           | Ideal                                    |
+------------------+------------------------------------------+
| Table size       | 55-65% of girdle diameter (round)        |
| Crown height     | 12-17% of girdle diameter                |
| Pavilion depth   | 40-45% of girdle diameter                |
| Girdle thickness | Medium (not too thin, not too thick)     |
| Total depth      | 58-65% of girdle diameter                |
+------------------+------------------------------------------+

LIGHT PERFORMANCE:
+------------------+------------------------------------------+
| Factor           | Description                              |
+------------------+------------------------------------------+
| Brilliance       | White light return — pavillion angles     |
|                  | determine total internal reflection      |
+------------------+------------------------------------------+
| Windowing        | "See-through" area (pavilion too shallow)|
|                  | Any visible window reduces value         |
+------------------+------------------------------------------+
| Extinction       | Dark areas that do not return light      |
|                  | (pavilion too steep, or inherent to deep |
|                  | colour stones at steep viewing angles)   |
+------------------+------------------------------------------+
| Scintillation    | Flashes of light as stone moves          |
|                  | (pattern and intensity)                  |
+------------------+------------------------------------------+

SYMMETRY AND FINISH:
- Facet alignment and meet precision
- Outline symmetry (roundness, oval evenness)
- Surface polish quality (scratches, orange peel)
- Girdle consistency (even thickness)
```

1. フェイスアップで石を見て、ゆっくり揺らす — 輝き、ウインドウイング、エクスティンクションを観察する
2. プロポーションを確認する: テーブルサイズ、クラウンハイト、パビリオンデプス
3. シンメトリーを評価する: アウトラインの形状、ファセットの整列、ミートの精度
4. 10倍拡大で表面研磨を評価する: 傷、ポリッシュライン、オレンジピール
5. ガードルを確認する: 均一な厚さ、薄すぎ（チッピングリスク）や厚すぎ（デッドウェイト）でないか
6. カットをExcellentからPoorまで評価する

**期待結果:** プロポーション、光パフォーマンス、シンメトリー、表面仕上げをカバーするカット品質評価。カットグレードは価値に大きく影響する — 中程度の品質の石でも良いカットなら、より高いカラーとクラリティの悪いカットの石を上回ることがある。

**失敗時:** 石がマウントされていてプロポーションを完全に測定できない場合、見える部分（フェイスアップの光パフォーマンス、シンメトリー、研磨）を評価し、プロポーションが確認できなかったことを記録する。マウント石には常に評価の制限がある。

### ステップ4: カラット重量と寸法

石の重量と寸法を記録する。

1. カラットスケールで石を計量する（1カラット = 0.2グラム）
2. 小数点以下2桁まで重量を記録する（例: 2.37 ct）
3. 寸法を測定する: 長さ x 幅 x 深さ（ミリメートル）
4. マウント石の場合、種固有の公式を使用して寸法から重量を推定する:
   - ラウンド: 直径^2 x 深さ x SG係数
   - オーバル: 長さ x 幅 x 深さ x SG係数 x 0.0020
5. カラットあたりの価値は商業的に重要な重量閾値で増加することに注意:
   - 0.50 ct, 1.00 ct, 2.00 ct, 3.00 ct, 5.00 ct, 10.00 ct
   - 1.02 ctの石は同品質の0.98 ctの石よりプレミアムが付く

**期待結果:** 正確なカラット重量（0.01 ctまで）とミリメートル寸法。マウント石の場合、誤差範囲を明示した重量推定値。

**失敗時:** カラットスケールがない場合、寸法を測定し標準公式で重量を推定する。重量は推定値であることを記録する。高価な石の場合、必ず校正済みスケールで重量を検証する。

### ステップ5: 処理検出

石の外観を向上させるための処理が行われたか評価する。

```
Common Gemstone Treatments:
+-------------------+------------------------------------------+
| Treatment         | Detection Indicators                     |
+-------------------+------------------------------------------+
| Heat treatment    | Dissolved silk (rutile needles melted),  |
| (ruby, sapphire)  | stress fractures around inclusions,     |
|                   | altered colour zoning                    |
|                   | NOTE: Heat treatment is standard and     |
|                   | widely accepted for corundum             |
+-------------------+------------------------------------------+
| Fracture filling  | Flash effect under fibre-optic light     |
| (emerald, ruby)   | (blue/orange flash in fractures),       |
|                   | bubbles in filler material               |
|                   | Reduces value significantly              |
+-------------------+------------------------------------------+
| Surface coating   | Colour concentrated at surface,          |
| (topaz "mystic")  | scratches reveal different colour       |
|                   | underneath, uneven colour               |
+-------------------+------------------------------------------+
| Diffusion         | Colour concentrated at surface or along  |
| (sapphire)        | fractures. Immerse in methylene iodide  |
|                   | — colour pattern visible                 |
+-------------------+------------------------------------------+
| Irradiation       | Unstable colours may fade in sunlight    |
| (topaz, diamond)  | Some irradiation is undetectable without |
|                   | lab testing                              |
+-------------------+------------------------------------------+
| Glass filling     | Gas bubbles in glass, flash effect,      |
| (ruby)            | different lustre in filled areas         |
|                   | Severely reduces value and durability    |
+-------------------+------------------------------------------+

TREATMENT IMPACT ON VALUE:
- Untreated (with certification): highest premium
- Standard accepted treatment (heat): moderate reduction
- Enhancement treatment (filling, coating): significant reduction
- Requires disclosure at point of sale in all jurisdictions
```

1. 加熱処理の兆候がないかインクルージョンを調べる（溶解シルク、応力ハロー）
2. ファイバーオプティックライトを使用してフラクチャーフィリングを確認する（フラッシュ効果）
3. 端やスクラッチを調べて表面コーティングを確認する
4. 高価な石の場合、処理状態の権威ある判定にはラボ認定が不可欠であることを記録する
5. 処理評価を記録する: 無処理、加熱、充填、コーティング、拡散、または不明

**期待結果:** 裏付けとなる観察を伴う処理評価。$500以上の石の場合、権威ある処理判定のためにラボ認定（GIA、GRS、SSEF、Gubelin）を推奨する。

**失敗時:** 多くの処理（特に軽度の加熱処理と一部の照射）はラボ機器（FTIRスペクトロスコピー、UV-Vis、ラマン）なしでは検出できない。処理状態が不確かな場合、推測するのではなく「不明 — ラボ検査推奨」と記録する。

### ステップ6: 市場要因分析

4Cを超えて市場価値に影響する外部要因を考慮する。

```
Market Factors:
+-------------------+------------------------------------------+
| Factor            | Impact                                   |
+-------------------+------------------------------------------+
| Origin            | Kashmir sapphire, Burmese ruby, and      |
|                   | Colombian emerald command significant     |
|                   | premiums (2-10x) over identical quality  |
|                   | from other sources                       |
+-------------------+------------------------------------------+
| Rarity            | Paraiba tourmaline, alexandrite,          |
|                   | padparadscha sapphire — scarcity drives  |
|                   | premium pricing                          |
+-------------------+------------------------------------------+
| Certification     | GIA, GRS, SSEF, Gubelin reports add      |
|                   | confidence and liquidity to high-value   |
|                   | stones                                   |
+-------------------+------------------------------------------+
| Fashion/trends    | Tanzanite, morganite, and coloured       |
|                   | diamonds have experienced trend-driven   |
|                   | price increases                          |
+-------------------+------------------------------------------+
| Setting/mounting  | A well-made setting from a recognised    |
|                   | maker can add value. Generic mounts do   |
|                   | not                                      |
+-------------------+------------------------------------------+
| Provenance        | Royal, historical, or celebrity provenance|
|                   | adds auction premium                     |
+-------------------+------------------------------------------+
```

1. 既知または認定可能な場合、石の産地を調査する
2. その種の現在の市場ポジションを考慮する（上昇傾向、安定、下降傾向）
3. ラボ認定が価値を加えるか評価する（一般的に1 ct超かつ$500超の石ではイエス）
4. 来歴や歴史的重要性を記録する
5. 完全な評価を価値範囲（単一の価格ポイントではなく）にまとめる

**期待結果:** 4C、処理状態、産地、市場要因を考慮した文脈化された価値範囲。前提条件を明示した範囲として表現される。

**失敗時:** 宝石価格設定には継続的に進化する市場専門知識が必要。市場データが利用できない場合、価格推定なしで品質評価（4C + 処理）を提供し、ディーラーまたは認定鑑定士への相談を推奨する。

## バリデーション

- [ ] 鑑定開始前に種が確実に特定された
- [ ] 昼光相当照明下で色相、彩度、明度によるカラー評価が行われた
- [ ] 10倍拡大下でインクルージョンインベントリを伴うクラリティグレーディングが行われた
- [ ] プロポーション、光パフォーマンス、シンメトリー、仕上げについてカット品質が評価された
- [ ] カラット重量が測定された（または誤差範囲を明示して推定された）
- [ ] 裏付けとなる観察を伴う処理状態の評価が行われた
- [ ] 市場要因が考慮された（産地、希少性、認定価値）
- [ ] 価値が単一の数値ではなく範囲として表現された
- [ ] 免責事項が含まれている: これは教育的ガイダンスであり、認定鑑定ではない

## よくある落とし穴

- **免責事項の省略**: この手順は教育的ガイダンスのみを提供する。保険、売買、法的目的の正式な鑑定には認定宝石鑑定士が必要。常にこれを明確に述べる
- **不適切な照明下でのカラーグレーディング**: 蛍光灯、白熱灯、LED照明はすべてカラー知覚をシフトさせる。昼光相当（5500-6500K）または自然の北向き昼光を使用する
- **種固有のクラリティ期待値の無視**: SI1のエメラルドは素晴らしい石; SI1のアクアマリンは平均以下。クラリティはその種にとって正常な基準に対して相対的にグレーディングしなければならない
- **カラット重量の過大評価**: 大きくてもカットが悪く、インクルージョンのある石は、小さくてもカットが良く、クリーンな石よりカラットあたりの価値が低い。4Cは相互作用する — 重量だけでは価値は決まらない
- **証拠なく無処理と仮定する**: 市場のルビーとサファイアの大部分は加熱処理されている。ラボ認定が確認しない限り、処理済みと仮定する

## 関連スキル

- `identify-gemstone` — 確実な種の特定が鑑定の前提条件; 誤同定は評価全体を無効にする
- `grade-tcg-card` — 観察優先、バイアス防止の方法論は、宝石鑑定における「希望的グレーディング」を避けるために必要な規律と並行する
