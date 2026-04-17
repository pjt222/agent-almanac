---
name: ornament-style-color
description: >
  Alexander Speltzの古典的装飾分類に基づく多色装飾パターンのデザイン。モノクロの構造分析
  に時代に忠実な色彩パレット、モチーフへの色彩マッピング、塗装、彩飾、施釉装飾に適した
  レンダリングスタイルを追加する。色彩が伝統に不可欠な装飾デザインを作成する時（イスラム
  タイル、彩飾写本、アールヌーヴォー）、歴史的時代が装飾にどのように色彩を使用したかを
  探求する時、またはデザイン、イラスト、教育資材用のカラー参照画像を制作する時に使用する。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, polychromatic, color, art-history, speltz, generative-ai, z-image
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 装飾スタイル — カラー

美術史的色彩知識とAI支援画像生成を組み合わせて多色装飾パターンをデザインする。`ornament-style-mono`の構造的基盤の上に、時代に忠実な色彩パレット、色彩調和の原則、塗装・彩飾・施釉装飾に適したレンダリングスタイルを追加する。

## 使用タイミング

- 色彩が装飾の伝統に不可欠な装飾デザインを作成する時（例：イスラムタイル、彩飾写本、アールヌーヴォーのポスター）
- 歴史的時代が装飾にどのように色彩を使用したか — パレット、分布、象徴的意味 — を探求する時
- デザイン、イラスト、教育資材用のカラー参照画像を制作する時
- 古典的モチーフの塗装、彩飾、施釉、ステンドグラスレンダリングを生成する時
- 装飾の伝統における色彩と形態の関係を研究する時

## 入力

- **必須**: 希望する歴史的時代またはスタイル（ランダム選択の場合は「おまかせ」）
- **必須**: 適用コンテキスト（ボーダー、メダリオン、フリーズ、パネル、タイル、単体モチーフ）
- **任意**: 色彩パレットの好み（時代に忠実、カスタム、または特定の色）
- **任意**: 特定のモチーフの好み（アカンサス、アラベスク、ロゼットなど）
- **任意**: レンダリングスタイルの好み（塗装、彩飾、施釉タイル、ステンドグラス、水彩）
- **任意**: 色彩のムード（落ち着いた/アンティーク、バランスの取れた/自然、鮮やかな/飽和した）
- **任意**: ターゲット解像度とアスペクト比
- **任意**: 再現可能な生成のためのシード値

## 手順

### ステップ1: 歴史的時代と色彩パレットの選択

時代を選択し、その特徴的な色彩言語を特定する。装飾における色彩は決して恣意的ではない — 各時代には利用可能な顔料、文化的象徴、素材のコンテキストに根ざしたパレットがある。

```
Historical Ornament Periods with Characteristic Palettes:
┌───────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Period            │ Date Range      │ Characteristic Palette                                  │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lapis blue, gold/ochre, terracotta red, black, white   │
│                   │                 │ Mineral pigments: flat, unmodulated, high contrast      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Greek             │ 800–31 BCE      │ Terracotta red, black, ochre, white, blue (rare)       │
│                   │                 │ Pottery palette; architectural color largely lost        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Pompeii red, ochre yellow, black, white, verdigris     │
│                   │                 │ Fresco palette: warm earth tones, strong red dominant    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Gold (dominant), deep blue, crimson, purple, white      │
│                   │                 │ Mosaic tesserae: jewel tones, gold ground, luminous      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Islamic           │ 7th–17th c.     │ Turquoise/cobalt blue, white, gold, emerald green       │
│                   │                 │ Tile glazes: luminous, saturated, geometric precision    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Ochre, rust red, deep green, dark blue, cream           │
│                   │                 │ Manuscript and stone: earthy, muted, mineral-derived     │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Ultramarine blue, ruby red, emerald green, gold, white  │
│                   │                 │ Stained glass + illumination: saturated, luminous        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Rich earth tones, azure blue, gold leaf, warm greens    │
│                   │                 │ Oil and fresco: naturalistic, modulated, subtle          │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ Pastel pink, powder blue, cream, gold, soft green       │
│                   │                 │ (Rococo) vs deep burgundy, gold, forest green (Baroque) │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Sage green, dusty rose, amber/gold, muted purple,      │
│                   │                 │ teal. Organic, muted, nature-derived palette             │
└───────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

1. ユーザーが時代を指定した場合、確認してその特徴的パレットを記録する
2. 「おまかせ」の場合、ランダムに選択する — 豊かな色彩の伝統を持つ時代（イスラム、ビザンティン、ゴシック、アールヌーヴォー）に重み付けする
3. 素材のコンテキスト（フレスコ、モザイク、タイル、ステンドグラス、印刷）を記録する。これは色彩のレンダリング方法に影響する

**期待結果:** 特徴的なパレットと素材のコンテキストが理解された、明確に特定された時代。

**失敗時:** ユーザーが表にない時代をリクエストした場合、WebSearchで「[時代] ornament color palette pigments」を検索してその色彩言語を調査し、同等のエントリを構築する。歴史的な顔料の入手可能性は、時代に忠実な色彩の信頼できるガイドである。

### ステップ2: 色彩パレットの定義

歴史的パレットを、定義された役割を持つ具体的な3-5色のセットに変換する。

**色彩役割フレームワーク:**
```
Color Distribution (60/30/10 Rule):
┌──────────────┬────────────┬──────────────────────────────────────────┐
│ Role         │ Proportion │ Function                                  │
├──────────────┼────────────┼──────────────────────────────────────────┤
│ Dominant     │ ~60%       │ Ground color or primary structural color  │
│ Secondary    │ ~30%       │ Motif fill or supporting structural color │
│ Accent       │ ~10%       │ Highlights, details, focal points         │
│ (Optional)   │ —          │ Additional accent or metallic (gold)      │
│ (Optional)   │ —          │ Background / ground if different from     │
│              │            │ dominant                                   │
└──────────────┴────────────┴──────────────────────────────────────────┘
```

**色彩調和のアプローチ:**
- **時代に忠実**: 歴史的時代の顔料と素材で利用可能だった色のみを使用
- **補色**: 色相環で対向する色（例：青と金/オレンジ） — 高コントラスト
- **類似色**: 隣接する色（例：セージグリーン、ティール、くすんだ青） — 調和的、繊細
- **トライアド**: 等間隔の3色（例：赤、青、金） — 鮮やか、バランスが取れた

1. 3-5色を名前付き役割（ドミナント、セカンダリー、アクセント、オプション）で選択する
2. 調和アプローチを選択する
3. おおよそのhex値または記述的な色名を割り当てる
4. 色彩のムードを記録する：落ち着いた/アンティーク、バランスの取れた/自然、鮮やかな/飽和した

**パレット定義の例:**
- **イスラムタイル**: ターコイズ（ドミナント）、白（セカンダリー）、コバルトブルー（アクセント）、金（ディテール） — 類似色 + メタリック — 鮮やか
- **アールヌーヴォーのポスター**: セージグリーン（ドミナント）、ダスティローズ（セカンダリー）、アンバーゴールド（アクセント） — 類似色 — 落ち着いた
- **ビザンティンモザイク**: 金（ドミナント）、ディープブルー（セカンダリー）、クリムゾン（アクセント）、白（ディテール） — 補色 — 鮮やか

**期待結果:** 役割、比率、調和アプローチ、ムードが定義された3-5の名前付き色のパレット。

**失敗時:** 色の選択が恣意的に感じる場合、時代の素材コンテキストに固定する。「物理的にどの顔料が利用可能だったか？」「地の素材は何だったか？」（ヴェラム上の金箔、セラミック上の釉薬、石膏上の塗装）と問う。素材がパレットを制約し正当性を与える。

### ステップ3: モチーフ構造の分析

選択したモチーフの構造文法を理解し、モノクロ分析に色彩-構造マッピングを追加する。

1. `ornament-style-mono`ステップ2と同じ構造分析を行う：
   - 対称性タイプ（左右対称、放射状、並進、点）
   - 幾何学的スキャフォールド（円、長方形、三角形、帯）
   - フィルパターン（ソリッド、ラインフィル、オープン、ミックス）
   - エッジ処理（クリーン、オーガニック、インターロッキング）

2. **色彩-構造マッピング**を追加する：
   - どの構造要素がどの色を受けるか？
   - 色は形に従うか（各形状が1色）、流れるか（色のグラデーションが構造的境界を横断するか）？
   - アクセントカラーはどこに現れるか？（通常、焦点、交差点、または小さなディテール要素）
   - 地/背景の色は何か？

**マッピングの例:**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**期待結果:** 各構造要素に明示的な色の割り当てがある構造的記述。

**失敗時:** 色彩-構造マッピングが不明確な場合、WebSearchで「[時代] [モチーフ] ornament color」を検索して歴史的な例を研究し、色彩が実際にどのように使用されたかを観察する。歴史的装飾ではほぼ常に、色彩は構造を曖昧にするためではなく明確にするために使用される。

### ステップ4: カラープロンプトの構築

色彩パレットとレンダリングスタイルを組み込んだZ-Image生成用テキストプロンプトを構築する。

**プロンプトテンプレート:**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**色彩に適したレンダリングスタイル:**
- `painted ornament` — 筆跡が見える、不透明な色、フレスコまたは油彩品質
- `illuminated manuscript` — 金箔、豊かな宝石色、ヴェラムの地
- `glazed ceramic tile` — 光沢のある表面、フラットな色、精密なエッジ
- `stained glass` — 半透明の色、形状間の暗い鉛線
- `watercolor illustration` — 透明なウォッシュ、柔らかなエッジ、紙が見える
- `enamel on metal` — 硬い光沢のある色、金属の地
- `mosaic` — 小さなテッセラ、ピース間の可視的な隙間、輝きがある
- `printed poster` — フラットな色面、アールヌーヴォーまたはアーツ&クラフツ品質

**プロンプトでの色彩記述:**
- 具体的な色を名指しする：「turquoise blue and gold on white ground」
- ムードを記述する：「muted antique tones」または「vivid saturated jewel colors」
- 分布を指定する：「blue dominant with gold accents」または「warm earth tones with red details」

**プロンプトの例:**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**期待結果:** レンダリングスタイル、モチーフ、時代、構図、明示的な色彩情報を指定する25-50語のプロンプト。

**失敗時:** プロンプトがパレットに合わない色を生成する場合、プロンプト内で色彩記述を先頭に配置する（モチーフ記述の前に置く）。Z-Imageは先頭のプロンプトトークンにより重みを置く。また、具体的なhex色やよく知られた顔料名（ultramarine、vermillion、ochre）を使用してみる。

### ステップ5: 生成パラメータの設定

解像度と生成パラメータを選択する。カラー装飾は通常、モノクロよりもわずかに多い推論ステップの恩恵を受ける。

```
Resolution by Application (same as ornament-style-mono):
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine color work │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. 適用コンテキストに基づいて解像度を選択する
2. カラー作業には`steps`を10-12に設定する（色のディテールとパレットの精度がより多くのステップの恩恵を受ける）
3. `shift`を3に設定する（デフォルト）
4. 探索には`random_seed: true`を、再現性には`random_seed: false`と特定のシードを選択する
5. ドキュメント用にすべてのパラメータを記録する

**期待結果:** 完全なパラメータセット。カラー装飾は一般的にパレットの忠実度のために10ステップ以上が必要。

**失敗時:** 迷ったら、10ステップで1024x1024を使用する。これはほとんどのカラー装飾コンテキストに対する信頼性の高いデフォルト。

### ステップ6: 画像の生成

装飾を生成するためにZ-Image MCPツールを呼び出す。

1. `mcp__hf-mcp-server__gr1_z_image_turbo_generate`を以下で呼び出す：
   - `prompt`: ステップ4で構築したプロンプト
   - `resolution`: ステップ5から
   - `steps`: ステップ5から（10-12を推奨）
   - `shift`: ステップ5から
   - `random_seed`: ステップ5から
   - `seed`: `random_seed`がfalseの場合の特定のシード
2. 再現性のために返されたシード値を記録する
3. 生成時間を記録する

**期待結果:** 認識可能な装飾的形態と可視的な色彩を持つ生成画像。色は指定されたパレットと完全に一致しない場合がある — これは評価で対処される。

**失敗時:** MCPツールが利用できない場合、hf-mcp-serverが設定されているか確認する（`configure-mcp-server`または`troubleshoot-mcp-connection`を参照）。生成画像が完全に抽象的な場合、プロンプトにより具体的な構造的言語が必要 — ステップ4に戻る。色が完全に間違っている場合、プロンプト内で色名を先頭に配置する。

### ステップ7: 色彩の忠実度を評価する

5つの基準に対して生成画像を評価し、モノクロのルーブリックに色彩固有の評価を追加する。

```
Polychromatic Ornament Evaluation Rubric:
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ Criterion           │ Evaluation Questions                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Palette Match    │ Do the colors in the image approximate the specified  │
│                     │ palette? Are the named colors present? Are there      │
│                     │ unwanted colors that break the palette?               │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Color            │ Does the color distribution roughly follow the        │
│    Distribution     │ 60/30/10 allocation? Is the dominant color actually   │
│                     │ dominant? Does the accent appear sparingly?           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Rendering Style  │ Does the image look like the specified rendering      │
│                     │ style? Does a "glazed tile" look glossy and flat?     │
│                     │ Does "illuminated manuscript" show gold and vellum?   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Period Accuracy  │ Would this design be recognizable as belonging to     │
│                     │ the specified period? Are motifs period-appropriate?   │
│                     │ Does the color usage match period conventions?        │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Form-Color       │ Does color clarify the ornamental structure or        │
│    Balance          │ obscure it? Can you "read" the motifs through the     │
│                     │ color? Does color follow form as intended?            │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

1. 各基準をスコアリングする：**Strong**（明確に満たす）、**Adequate**（部分的に満たす）、**Weak**（満たさない）
2. 各基準について具体的な観察を記録する
3. 4つ以上の基準がStrongの場合、デザインは成功
4. 2つ以上の基準がWeakの場合、プロンプト改良のためにステップ4に戻る

**期待結果:** 具体的な観察を伴うスコア付き評価。カラー装飾はモノクロよりも制御が難しい — パレットマッチと分布については初回生成でAdequateスコアを期待する。

**失敗時:** ほとんどの基準がWeakの場合、プロンプトの根本的な再構築が必要かもしれない。一般的な修正：プロンプトの最初に色名を配置する、使用する色を減らす、地色を明示的に指定する、ステップを12に増やす。

### ステップ8: イテレーションまたは確定

ターゲットを絞ったイテレーションでデザインを改良するか、結果を受け入れる。

**色彩固有のイテレーション戦略:**
1. **パレット修正**: 色が間違っている場合、プロンプトの先頭に具体的な色名を置く：「turquoise blue and gold: [残りのプロンプト]」
2. **分布修正**: 比率を明示的に述べる：「mostly turquoise blue with small gold accents」
3. **レンダリング修正**: レンダリングスタイルの記述を強化する：「in the style of Iznik ceramic tiles, glossy glaze surface」
4. **シード固定の色調整**: シードを維持し、色の記述のみを変更して構図を維持しながらパレットを調整する
5. **ムードシフト**: 全体的な色の強度を調整するために「vivid saturated」を「muted antique」に、またはその逆に変更する

**イテレーション予算:** デザインコンセプトごとに3回のイテレーションに制限する。色のイテレーションはモノクロよりも多くのプロンプト調整を必要とすることが多い。

1. ステップ7の評価が特定の弱点を示す場合、対応する修正戦略を適用する
2. ステップ6を使用して再生成する
3. ステップ7を使用して再評価する
4. 4つ以上の基準がStrongになるか、イテレーション予算が尽きたら受け入れる

**期待結果:** 1-2回のイテレーション後に改善された色彩の忠実度。完全なパレットマッチはありそうにない — 「正しい色族に認識可能」を目指す。

**失敗時:** イテレーションが収束しない場合、色彩パレットがモデルが確実に再現するには具体的すぎるかもしれない。色を減らし（5色の代わりに3色）、より広い色の記述を使用し（具体的なhex値の代わりに「warm earth tones」）、最も近い近似を受け入れる。

### ステップ9: デザインのドキュメント化

再現性と参照のために最終デザインの完全な記録を作成する。

1. 以下を記録する：
   - **時代**: 歴史的時代名と年代範囲
   - **モチーフ**: 使用した主要モチーフ
   - **レンダリングスタイル**: 塗装、彩飾、施釉タイルなど
   - **色彩パレット**: 各色の役割とおおよそのhex値
     - ドミナント: [色名] (~hex) — 60%
     - セカンダリー: [色名] (~hex) — 30%
     - アクセント: [色名] (~hex) — 10%
     - 追加: [色名] (~hex) — ディテール/メタリック
   - **色彩調和**: 使用したアプローチ（時代に忠実、補色、類似色、トライアド）
   - **色彩のムード**: 落ち着いた、バランスの取れた、鮮やかな
   - **最終プロンプト**: 受け入れた画像を生成した正確なプロンプト
   - **シード**: 再現用のシード値
   - **解像度**: 使用した解像度
   - **ステップ/シフト**: 生成パラメータ
   - **評価**: 5つの基準スコアに関する簡単なメモ
   - **イテレーション**: イテレーション回数と行った主要な変更
2. 生成されたパレットが歴史的参照パレットとどのように比較されるかを記録する
3. 色彩固有の観察を記録する（モデルがうまく処理した色またはうまく処理できなかった色）
4. 潜在的な用途と色彩適応メモを提案する（例：「パレットはスクリーン表示によく適応する」や「CMYK印刷には調整が必要」）

**期待結果:** hex近似とパレット分析を含む完全な色彩ドキュメントを持つ再現可能な記録。

**失敗時:** 完全なドキュメントが過剰に感じる場合、最低限、最終プロンプト、シード、意図した色と実際の色のリストを記録する。これらにより再現とパレット調整が可能になる。

## バリデーション

- [ ] 特定の歴史的時代がその特徴的な色彩パレットと共に選択された
- [ ] 役割（ドミナント/セカンダリー/アクセント）と比率を持つ3-5色のパレットが定義された
- [ ] 色彩調和アプローチが意識的に選択された（時代に忠実、補色、類似色、トライアド）
- [ ] 色彩-構造マッピング付きでモチーフ構造が分析された
- [ ] プロンプトに明示的な色名と色彩ムードの記述が含まれている
- [ ] プロンプトに色彩に適したレンダリングスタイルが指定されている（塗装、施釉、彩飾など）
- [ ] 解像度が適用コンテキストに一致している
- [ ] 色彩の忠実度のためにステップが10以上に設定されている
- [ ] 生成画像が5点ルーブリックに対して評価された
- [ ] 再現性のためにシード値が記録された
- [ ] プロンプト、シード、パレット（hex近似付き）、パラメータで最終デザインがドキュメント化された

## よくある落とし穴

- **色名だけに頼る**: 「Blue」は曖昧 — 「turquoise blue」「cobalt blue」「ultramarine blue」と指定する。異なる青はまったく異なる時代とムードを喚起する
- **色が多すぎる**: プロンプト内の5色以上はモデルを混乱させ、濁った結果を生む。歴史的装飾は通常、3-4色と地色を使用する。抑制は正統である
- **地色を無視する**: 背景/地の色はモチーフの色と同じくらい重要。クリームのヴェラム、白いセラミック、金箔、暗い石の地は、他のすべての色の見え方を根本的に変える。明示的に指定する
- **構造的基盤なしの色彩**: 構造の不十分な装飾に色を追加しても改善されない。モノクロバージョンが機能しない場合、色を追加しても助けにならない — まず`ornament-style-mono`を使用して構造を修正する
- **時代錯誤的なパレット**: 明るいマゼンタ、ネオンカラー、キャンディパステルは歴史的装飾に属さない。顔料の入手可能性が時代のパレットを制約する — 正統な結果のためにその制約を尊重する
- **不十分なステップ**: 色のディテールはモノクロよりも多い推論ステップが必要。カラー作業に8ステップを使用すると、洗い流されたまたは不正確なパレットレンダリングが生じることが多い。10-12を使用する

## 関連スキル

- `ornament-style-mono` — モノクロの基盤スキル；色が協力しない時のフォールバックとして常に利用可能で、色を追加する前にモチーフ構造を理解するための最初のステップとして推奨
- `review-web-design` — 色彩理論の原則（コントラスト、調和、リズム）は装飾的色彩構成に直接適用される
- `meditate` — 集中的注意と色彩視覚化のプラクティスはパレット開発に役立つ
