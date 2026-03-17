---
name: mineral-identification
description: >
  硬度、条痕、光沢、劈開、結晶癖、簡易化学テストを用いた鉱物と鉱石のフィールド
  同定。体系的消去法、モース硬度計の適用、貴金属・宝石・工業用鉱物の一般的な
  鉱石指標を網羅する。未知の岩石や鉱物標本に遭遇した時、探鉱中にサイトが価値ある
  鉱物指標を示すかどうかを評価する時、フィールドで鉱石を含む岩石を不毛の岩石と
  区別する時、または体系的な観察を通じて地質学的リテラシーを構築する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 鉱物同定

物理的性質、体系的消去法、簡易フィールドテストを用いてフィールドで鉱物を同定する。

## 使用タイミング

- 未知の岩石や鉱物標本を見つけて同定したい時
- 探鉱中に、サイトが価値ある鉱物の指標を示すかどうか評価する必要がある時
- フィールドで鉱石を含む岩石を不毛の岩石と区別したい時
- 体系的な観察を通じて地質学的リテラシーを構築する時

## 入力

- **必須**: 調査する鉱物標本または露頭
- **任意**: 条痕板（無釉の磁器タイルまたはバスルームタイルの裏面）
- **任意**: 鉄釘またはナイフの刃（硬度 ~5.5）
- **任意**: ガラス板（硬度 ~5.5）
- **任意**: 銅貨（硬度 ~3.5）
- **任意**: ハンドレンズ（10倍）
- **任意**: 希塩酸（10% HCl）炭酸塩テスト用

## 手順

### ステップ1: 触れずに観察する

取り扱う前に、標本を文脈の中で観察する。

```
Field Context:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Host rock          | What type of rock is it in/on?           |
|                    | (granite, basite, sandstone, schist...)   |
+--------------------+------------------------------------------+
| Geological setting | Vein, disseminated, massive, placer,     |
|                    | weathering surface, cave deposit          |
+--------------------+------------------------------------------+
| Associated         | What other minerals are nearby?           |
| minerals           | (quartz veins often host gold; iron       |
|                    | staining suggests oxidation zone)        |
+--------------------+------------------------------------------+
| Crystal form       | Visible crystals? Habit? Size?           |
| (if visible)       | (cubic, prismatic, tabular, massive)     |
+--------------------+------------------------------------------+
```

**期待結果:** 標本を取り扱う前にフィールドコンテキストが記録されていること。

**失敗時:** 地質学的コンテキストが不明な場合（遊離標本、都市部での発見）、物理的性質のみで進める — コンテキストは候補を絞るのに役立つが、厳密には必須ではない。

### ステップ2: 物理的性質のテスト

診断テストを体系的に適用する。

```
Diagnostic Property Tests:

LUSTER (how it reflects light):
- Metallic: reflects like metal (pyrite, galena, gold)
- Vitreous: glassy (quartz, feldspar)
- Pearly: like a pearl (muscovite, talc surfaces)
- Silky: like silk fibers (asbestos, satin spar gypsum)
- Earthy/dull: no reflection (kaolin, limonite)
- Adamantine: brilliant, diamond-like (diamond, zircon)

HARDNESS (Mohs scale — scratch test):
+------+-----------+----------------------------------+
| Mohs | Reference | Can Be Scratched By              |
+------+-----------+----------------------------------+
| 1    | Talc      | Fingernail                       |
| 2    | Gypsum    | Fingernail (barely)              |
| 3    | Calcite   | Copper coin                      |
| 4    | Fluorite  | Steel nail (easily)              |
| 5    | Apatite   | Steel nail (just)                |
| 6    | Feldspar  | Steel nail cannot scratch        |
| 7    | Quartz    | Scratches glass                  |
| 8    | Topaz     | Scratches quartz                 |
| 9    | Corundum  | Scratches topaz                  |
| 10   | Diamond   | Scratches everything             |
+------+-----------+----------------------------------+

Test: try to scratch the specimen with each reference tool,
starting from soft to hard. The hardness is between the tool
that fails and the tool that succeeds.

STREAK (powder colour on porcelain):
- Drag the specimen firmly across an unglazed porcelain tile
- Record the colour of the powder line
- Streak colour is often different from specimen colour
- Critical: hematite is grey-black but streaks RED
- Critical: pyrite is gold but streaks BLACK
- Minerals harder than the streak plate (~7) will not leave a streak

CLEAVAGE AND FRACTURE:
- Cleavage: breaks along flat planes (mica: 1 direction, feldspar: 2)
- Fracture: breaks irregularly (conchoidal = curved like glass, uneven, fibrous)
- Note number of cleavage directions and angles between them

SPECIFIC GRAVITY (heft test):
- Hold the specimen and assess: does it feel heavier or lighter
  than expected for its size?
- Heavy: possible metallic ore (galena, gold, magnetite)
- Light: possible pumice, sulfur, or organic material
```

**期待結果:** 標本のプロファイル: 光沢、硬度範囲、条痕色、劈開/断口タイプ、相対密度。

**失敗時:** 性質が曖昧な場合（例: 金属光沢とガラス光沢の間 — 「亜金属」）、両方の選択肢を記録する。曖昧さは確信度を下げるが、同定を妨げない。

### ステップ3: 特殊テストの適用

特定の鉱物グループに対する追加テスト。

```
Special Field Tests:

MAGNETISM:
- Hold a magnet near the specimen
- Strong attraction: magnetite (or possibly pyrrhotite)
- Weak attraction: some iron-bearing minerals

ACID TEST (10% HCl):
- Drop acid on the specimen surface
- Vigorous fizzing: calcite (CaCO3)
- Fizzing on powder only: dolomite (scratch surface first, then apply acid)
- No fizzing: not a carbonate

TASTE (only for suspected halite):
- Salty taste: halite (NaCl)
- Do NOT taste unknown minerals generally — some are toxic

SMELL:
- Sulfur: rotten egg smell (sulfides when scratched)
- Clay: earthy "petrichor" smell when breathed on (clay minerals)

TENACITY:
- Brittle: shatters when struck (most silicates)
- Malleable: deforms without breaking (gold, copper, silver)
- Flexible: bends and stays (chlorite, some micas)
- Elastic: bends and springs back (muscovite mica)
```

**期待結果:** 同定をさらに絞り込む追加の診断データ。

**失敗時:** 特殊テストが利用できない場合（磁石がない、酸がない）、基本的な性質で進める — ほとんどの一般的な鉱物にはそれで十分である。

### ステップ4: 消去法による同定

性質プロファイルを既知の鉱物と照合する。

```
Common Mineral Identification Key (simplified):

METALLIC LUSTER:
- Black streak + hard (6+) + cubic crystals = PYRITE
- Black streak + soft (2.5) + heavy + cubic = GALENA
- Red-brown streak + hard (5-6) + heavy = HEMATITE
- Yellow streak + soft (1.5-2.5) + yellow = GOLD (if malleable)
  or CHALCOPYRITE (if brittle, harder, green-black streak)
- Black streak + magnetic = MAGNETITE

NON-METALLIC, LIGHT-COLORED:
- Vitreous + hard (7) + conchoidal fracture = QUARTZ
- Vitreous + hard (6) + 2 cleavage planes = FELDSPAR
- Vitreous + soft (3) + fizzes in acid = CALCITE
- Pearly + very soft (1) + greasy feel = TALC
- Vitreous + soft (2) + 1 perfect cleavage = GYPSUM

NON-METALLIC, DARK-COLORED:
- Vitreous + hard (5-6) + 2 cleavage at ~90 degrees = PYROXENE
- Vitreous + hard (5-6) + 2 cleavage at ~60/120 degrees = AMPHIBOLE
- Vitreous + soft (2.5-3) + 1 perfect cleavage + flexible = BIOTITE (mica)
```

**期待結果:** 鉱物の同定、または2-3の候補のショートリストと、それらを区別するために必要な判別テスト。

**失敗時:** 標本が一般的な鉱物のいずれとも一致しない場合、単一の鉱物ではなく岩石（鉱物の集合体）である可能性があるか、実験室分析（薄片、XRD）が必要な場合がある。

## バリデーション

- [ ] 取り扱い前にフィールドコンテキストが記録された
- [ ] 自然光下で光沢が評価された
- [ ] 少なくとも2つの基準物質に対して硬度がテストされた
- [ ] 条痕色が記録された（標本が条痕板より柔らかい場合）
- [ ] 劈開または断口パターンが記録された
- [ ] 推測ではなく体系的消去法で同定に至った
- [ ] 類似鉱物が明示的に考慮され区別された

## よくある落とし穴

- **黄鉄鉱と金の混同**:「愚者の金」（黄鉄鉱）はより硬く（6 vs 2.5）、脆く（金は可鍛性）、条痕は黒い（金は金色の条痕）。テストは決定的である — 使用すること
- **条痕の無視**: 標本の色は信頼性がない（赤鉄鉱は灰色、赤、または黒になりうる）。条痕色は一貫しており診断的である
- **汚染されたツールでの引っかき**: 錆びた鉄釘は偽の条痕を生む。使用前にテストツールを清掃する
- **結晶癖の仮定**: 多くの鉱物はフィールドで良く形成された結晶をめったに示さない。塊状または粒状の形態がより一般的である — 同定に目に見える結晶を要求しない
- **風化した表面と真の色の混同**: テスト前に標本を割って新鮮な面を露出させる。風化皮殻は下の鉱物を完全に隠すことがある

## 関連スキル

- `gold-washing` — 沖積金の回収は、河川堆積物を読み取り金を含む砂利を評価するために鉱物同定スキルを使用する
