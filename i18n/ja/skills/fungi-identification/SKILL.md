---
name: fungi-identification
description: >
  形態学的特徴、胞子紋、生息地分析、季節的文脈を使用した安全第一アプローチによる
  菌類のフィールド同定。傘、ひだ、柄、胞子の特徴、類似種の区別、毒性リスク評価、
  消費前の絶対的確実性の重要ルールを網羅する。未知の菌類に遭遇した時、食用キノコを
  採集して消費前に種の確認が必要な時、庭や敷地の菌類が有害かどうかを評価する時、
  または食用種と危険な類似種を区別する時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mycology
  complexity: advanced
  language: natural
  tags: mycology, fungi, mushroom, identification, foraging, safety, spore-print
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 菌類の同定

形態学的特徴、胞子紋、生息地、季節を使用して、絶対的な安全第一アプローチでフィールドにおける菌類を同定する。

## 使用タイミング

- 未知の菌類に遭遇し、同定が必要な時
- 食用キノコを採集しており、消費前に種の確認が必要な時
- 庭や敷地の菌類が有害かどうかを評価したい時
- 構造化された観察練習を通じてフィールド同定スキルを構築している時
- 食用種と危険な類似種を区別する必要がある時

## 入力

- **必須**: 菌類の標本またはその場での明瞭な観察
- **必須**: 微細な形態学的詳細（傘、ひだ、柄、基部）を観察する能力
- **任意**: 地域のフィールドガイドまたは参考資料
- **任意**: 胞子紋用の紙とガラス
- **任意**: 断面観察用のナイフ
- **任意**: 微細な詳細用のハンドレンズ（10倍）

## 手順

### ステップ1: 基本ルール

同定作業の前に、菌類学の絶対的ルールを内面化する。

```
CARDINAL RULE:
If you are not 100% certain of the identification, DO NOT EAT IT.

There is no "universal edibility test" for mushrooms.
Some deadly species taste pleasant.
Some deadly species have delayed symptoms (24-72 hours).
Some deadly species have NO antidote.

The cost of a false positive (eating a misidentified mushroom) is
organ failure and death. The cost of a false negative (skipping an
edible mushroom) is a missed meal.

ALWAYS ERR TOWARD CAUTION.
```

**期待結果:** 同定に進む前に基本ルールが内面化されていること。

**失敗時:** このステップに失敗モードはない。ルールが内面化されていない場合、消費目的のフィールド同定に進まない。

### ステップ2: 生息地の記録

標本に触れる前に文脈を記録して同定の範囲を絞る。

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Substrate          | Soil, wood (dead/living), dung, leaf      |
|                    | litter, moss, other fungi                |
+--------------------+------------------------------------------+
| Tree association   | What trees are within 10m? (Many fungi    |
|                    | are mycorrhizal with specific tree genera)|
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, waterlogged              |
+--------------------+------------------------------------------+
| Light              | Full shade, dappled, open                |
+--------------------+------------------------------------------+
| Season             | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
| Altitude           | Lowland, mid-altitude, montane           |
+--------------------+------------------------------------------+
| Growth pattern     | Solitary, scattered, clustered, ring,    |
|                    | shelf/bracket                            |
+--------------------+------------------------------------------+
```

**期待結果:** 種レベルの同定に文脈を提供する完全な生息地記録。

**失敗時:** 生息地が不明瞭な場合（例：混植の都市庭園）、見えるものを記録する。不完全な生息地データは同定の信頼度を下げる — これを安全性評価に反映させる。

### ステップ3: 形態学的特徴の検査

標本自体の体系的な検査。

```
Morphological Checklist:

CAP (Pileus):
- Shape: convex, flat, concave, conical, umbonate, bell-shaped
- Diameter (measure or estimate)
- Surface: smooth, scaly, fibrous, slimy, dry, cracked
- Colour (note if colour changes with age or moisture)
- Margin: smooth, striate, inrolled, appendiculate (veil remnants)

GILLS / PORES / SPINES (Hymenium):
- Type: gills (lamellae), pores (tubes), spines (teeth), smooth
- Attachment: free, adnexed, adnate, decurrent
- Spacing: crowded, close, distant
- Colour (important — note changes with age)
- Bruising: do gills change colour when damaged?

STEM (Stipe):
- Height and diameter
- Shape: equal, tapered, bulbous, club-shaped
- Surface: smooth, fibrous, scaly, reticulate (netted)
- Interior: solid, hollow, stuffed (pithy center)
- Ring (annulus): present/absent, position, persistent/fragile
- Volva (cup at base): present/absent — ALWAYS check by
  carefully excavating the base (Amanita species have a volva)

FLESH (Context):
- Colour when cut
- Colour change on exposure to air (note time to change)
- Texture: firm, brittle, fibrous, gelatinous
- Smell: mushroomy, anise, radish, flour, chlorine, unpleasant
- Taste: (ONLY if species is confirmed non-deadly by an expert;
  for unknown species, DO NOT taste)

SPORE PRINT:
- Remove the stem; place the cap gill-side down on paper
  (half white, half dark paper to see any colour)
- Cover with a glass or bowl to maintain humidity
- Wait 4-12 hours
- Record spore colour: white, cream, pink, brown, purple-brown,
  black, rust-orange
```

**期待結果:** すべての主要な特徴を網羅する完全な形態学的記述。

**失敗時:** 特徴が観察できない場合（例：リングが見えないが失われた可能性がある）、「不在」ではなく「観察されず」と記録する。この区別は同定に重要である。

### ステップ4: 複数確認による同定

すべてのデータを参考資料と照合する。

```
Identification Protocol:
1. Use habitat + season to narrow to likely genera
2. Use cap shape + gill type + spore colour to narrow to species group
3. Check ALL features against the candidate species description
4. Specifically check against dangerous look-alikes:
   - Does this species have a deadly doppelganger?
   - What feature distinguishes the edible from the deadly?
   - Can I see that distinguishing feature clearly?

Confidence Levels:
+----------+---------------------------+---------------------------+
| Level    | Criteria                  | Action                    |
+----------+---------------------------+---------------------------+
| Certain  | All features match; no    | Safe to collect (for      |
|          | look-alike confusion;     | experienced identifiers)  |
|          | experienced with species  |                           |
+----------+---------------------------+---------------------------+
| Probable | Most features match;      | DO NOT eat. Collect for   |
|          | one or two uncertain;     | further study (spore      |
|          | look-alike eliminated     | print, expert review)     |
+----------+---------------------------+---------------------------+
| Possible | Some features match;      | DO NOT eat. Photograph    |
|          | look-alike not fully      | and seek expert opinion   |
|          | eliminated                |                           |
+----------+---------------------------+---------------------------+
| Unknown  | Cannot narrow to species  | DO NOT eat. DO NOT        |
|          |                          | handle extensively        |
+----------+---------------------------+---------------------------+
```

**期待結果:** 明示的な信頼度レベルと類似種評価を伴う種レベルの同定。

**失敗時:** 同定が属レベルで止まる場合、学習目的としては許容される。消費目的には、種レベルの「確実」な同定のみが許容される。

## バリデーション

- [ ] 同定開始前に基本ルールが確認された
- [ ] 標本の検査前に生息地が記録された
- [ ] すべての形態学的特徴が体系的に検査された
- [ ] つぼ（volva）を確認するために基部が掘り出された
- [ ] 胞子紋が採取された（時間が許す場合）
- [ ] 危険な類似種が明示的に確認され除外された
- [ ] 信頼度レベルが正直に評価された
- [ ] 「確実」な同定のみが消費の対象とされた

## よくある落とし穴

- **単一の特徴への依存**: 色だけで「アンズタケに見える」と判断すること。真のアンズタケは偽ひだ（隆起）を持ち、樹木の近くの土壌から生え、特有のアプリコットの香りがある。ニセアンズタケやツキヨタケは色を共有するが他のすべての特徴で異なる
- **基部検査の省略**: 基部を掘り出さないとつぼ（volva）を見逃す — 致死的なテングタケ属（タマゴテングタケ、シロタマゴテングタケ）を同定するための最も重要な単一の特徴
- **アプリの盲信**: AIベースのキノコ同定アプリは類似種に対して重大なエラー率がある。出発点として使用し、確認手段としては決して使用しない
- **「一般的＝安全」の想定**: 豊富さは食用性を示さない。致死種が局所的に豊富な場合がある
- **未知種の味見**: 一部の菌類学者は味を診断ツールとして使用するが、これはどの種が味見しても安全かについての専門家レベルの知識を必要とする。非専門家は未知の菌類を味見してはならない
- **時間差毒素の無視**: 一部の種（例：テングタケ）は快適な味を持ち症状が遅れて出現する。症状が現れた時には（24-48時間後）、肝臓の損傷が重篤になっている

## 関連スキル

- `mushroom-cultivation` — 既知の種の栽培により同定リスクを完全に排除する
- `forage-plants` — 補完的なフィールド同定スキル；複数特徴確認の方法論を共有する
