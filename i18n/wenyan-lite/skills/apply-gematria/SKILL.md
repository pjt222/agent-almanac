---
name: apply-gematria
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Compute and analyze gematria (Hebrew numerical values) using standard,
  ordinal, and reduced methods. Covers word-to-number conversion,
  isopsephy comparisons, and interpretive frameworks. Use when computing
  the numerical value of a Hebrew word or phrase, comparing two words for
  shared gematria values, studying a biblical verse or divine name for
  numerical correspondences, or connecting a numerical result to its
  position on the Tree of Life.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, kabbalah, gematria, hebrew, numerology, isopsephy
---

# 施數秘術

計算並分析 gematria——希伯來字母與字之數值賦予系統。涵蓋標準（Mispar Hechrachi）、序數（Mispar Siduri）、約簡（Mispar Katan）三法，等值字之 isopsephy 比對，與冥想之詮釋框架。

## 適用時機

- 欲計希伯來字或詞之數值
- 比兩字以判其是否共 gematria 值（isopsephy）
- 須解何 gematria 法宜於某分析
- 研聖經經文或神名而欲揭數值對應
- 探字之意與其數值之關
- 欲將數值結果繫於生命樹上之位

## 輸入

- **必要**：欲析之希伯來字、詞或神名（希伯來字或音譯）
- **選擇性**：第二字／詞以資比對（isopsephy）
- **選擇性**：偏好之 gematria 法（標準、序數、約簡或三者）
- **選擇性**：指引分析之情境或問題（如「此二字何以共值？」）

## 步驟

### 步驟一：音譯並識希伯來源

立字或詞之精確希伯來拼。

```
HEBREW LETTER VALUES — Standard Gematria (Mispar Hechrachi):

Units:
  Aleph (A)  = 1     Bet (B)    = 2     Gimel (G)  = 3
  Dalet (D)  = 4     Heh (H)    = 5     Vav (V)    = 6
  Zayin (Z)  = 7     Chet (Ch)  = 8     Tet (T)    = 9

Tens:
  Yod (Y)    = 10    Kaf (K)    = 20    Lamed (L)  = 30
  Mem (M)    = 40    Nun (N)    = 50    Samekh (S) = 60
  Ayin (Ay)  = 70    Peh (P)    = 80    Tzadi (Tz) = 90

Hundreds:
  Qoph (Q)   = 100   Resh (R)   = 200   Shin (Sh)  = 300
  Tav (Th)   = 400

Final Forms (Sofit — used when letter appears at end of word):
  Kaf-final  = 500   Mem-final  = 600   Nun-final  = 700
  Peh-final  = 800   Tzadi-final = 900

Note: Whether final forms carry different values depends on the
gematria system. Standard (Mispar Hechrachi) typically uses the
same values for regular and final forms. The 500-900 values above
follow the extended system (Mispar Gadol).
```

1. 若輸入為英文音譯，轉為希伯來字母序列
2. 驗拼：希伯來語對某些字有多種可能拼法（充足拼 vs. 缺拼）
3. 注字是否含末形字母（Kaf-sofit、Mem-sofit、Nun-sofit、Peh-sofit、Tzadi-sofit）
4. 陳源：此為聖經之字、神名、現代希伯來字或卡巴拉技術術語？
5. 若曖昧，呈兩常拼並為各計 gematria

**預期：** 希伯來字母序列以信心立。使用者明知何字母被加，並可驗拼。

**失敗時：** 若音譯曖昧（如「chai」於某情境可為 Chet-Yod 或 Chet-Yod-Yod），呈兩選項附其 gematria 值並令使用者擇。

### 步驟二：施標準 gematria（Mispar Hechrachi）

以標準希伯來數表加字母值。

1. 列每字母附其標準值
2. 自左至右加值（希伯來自右至左讀，然加法可交換）
3. 明陳總
4. 注總是否合於顯著數：
   - sephira 數（1-10）
   - 路徑數（11-32）
   - 著名 gematria 值（26 = YHVH、18 = chai、72 = Shem ha-Mephorash、137 = Kabbalah）
5. 若總超 400，注其需加多百

**預期：** 清晰之數值結果，附逐步計算。使用者可對表驗每字母之值。

**失敗時：** 若使用者提希伯來拼不確之字，為一切合理拼計值並注範圍。「正確」之拼依源文。

### 步驟三：施序數與約簡法（選擇性）

計揭不同模式之替代 gematria 值。

```
ORDINAL GEMATRIA (Mispar Siduri):
Each letter receives its ordinal position (1-22):
  Aleph=1, Bet=2, Gimel=3, Dalet=4, Heh=5, Vav=6,
  Zayin=7, Chet=8, Tet=9, Yod=10, Kaf=11, Lamed=12,
  Mem=13, Nun=14, Samekh=15, Ayin=16, Peh=17, Tzadi=18,
  Qoph=19, Resh=20, Shin=21, Tav=22

REDUCED GEMATRIA (Mispar Katan):
Reduce each letter's standard value to a single digit:
  Aleph=1, Bet=2, ... Tet=9, Yod=1, Kaf=2, ... Tzadi=9,
  Qoph=1, Resh=2, Shin=3, Tav=4

  Then sum the digits. If the sum exceeds 9, reduce again.
  Example: Shin(3) + Lamed(3) + Vav(6) + Mem(4) = 16 → 1+6 = 7

ATBASH:
A substitution cipher: first letter ↔ last letter.
  Aleph ↔ Tav, Bet ↔ Shin, Gimel ↔ Resh, etc.
  Used in biblical and Kabbalistic cryptography (Jeremiah's
  "Sheshach" = Babel via Atbash).
```

1. 計序數 gematria：加每字母於字母表中之位（1-22）
2. 計約簡 gematria：將每標準值約至一位數，後加並再約
3. 三值並陳以資比
4. 注何法為此特定字揭最有趣之關

**預期：** 三數值（標準、序數、約簡）並陳。約簡值常繫於單位 sephirotic 數，於生命樹對應有用。

**失敗時：** 若使用者僅欲一法，供之並提他法存，供將來探究。若僅請一法，勿以多計算壓之。

### 步驟四：尋 isopsephy 之關

辨他共同數值之希伯來字或詞。

1. 取步驟二之標準 gematria 值
2. 尋同值之著名字、神名或詞
3. 呈 2-5 連結，依先：
   - 聖經字與詞
   - 神名與 sephirotic 銜
   - 經典源所記之傳統卡巴拉連結
   - 出乎意料或具啟發之連結
4. 對每連結，注源傳（Zohar、Talmud、後期卡巴拉註、Hermetic 傳）
5. 若無顯著連結，注之——非每數皆有富 isopsephy

**預期：** 共同 gematria 值之字集，每附簡注其關之意義。使用者得冥想之材。

**失敗時：** 若計算之值無著名連結，承認之。可計值與近顯著數之關（如「君之值為 378，較 shalom [376] 多 2——其示何？」）。

### 步驟五：詮釋連結與對應

由計算移至冥想——數關示何？

1. 明陳：gematria 揭冥想之對應，非證或預測
2. 對每尋得之 isopsephy 連結，提一冥想問：
   - 「字 A 與字 B 共值 N。其義何以相互照亮？」
   - 「約簡值指 sephira X。此字之義何以繫於該 sephira 之質？」
3. 注於生命樹之關：
   - 標準值 1-10 → 直接 sephirotic 對應
   - 約簡值 1-9 → sephirotic 共鳴
   - 值 = 路徑數（11-32）→ 與該路徑之希伯來字母共鳴
4. 若使用者提指引問題（自輸入），用 gematria 結果直接應之
5. 以一整合陳述繫數分析於字之義

**預期：** 數分析已成有意——非僅算術而為解字於卡巴拉象徵網絡中之位之鏡。

**失敗時：** 若詮釋覺強行或臆測，明陳之。某些 gematria 計算較他者更富。對薄連結之誠承勝於造意。

## 驗證

- [ ] 希伯來拼以信心立（或多拼已呈）
- [ ] 標準 gematria 已計，每字母之值已示
- [ ] 至少一額外法（序數或約簡）已施
- [ ] isopsephy 連結已尋並呈，附源注
- [ ] 詮釋以冥想為框，非以證為框
- [ ] 計算可驗——使用者可對值表查每字母

## 常見陷阱

- **拼之曖昧**：希伯來字可附或不附母音字母（matres lectionis）拼。gematria 顯著變——恆確拼
- **末形之混**：Mem-final 為 40 或 600 取決於所用 gematria 系。明陳系
- **得君所期**：以足多之法行 gematria 終可連任二字。優待證先信之連結為證實偏見，非分析
- **忽傳**：經典卡巴拉 gematria 連結（如 YHVH = 26、echad [一] = 13、ahavah [愛] = 13，故愛 + 一 = 神）於權威源中有記。新連結應與傳統者相區
- **將 gematria 視為證**：字間之數相等示一冥想之對應，非等同或因果之關
- **遺情境**：同字於聖經經文、儀式文、卡巴拉冥想中或有不同 gematria 意義。情境塑詮釋

## 相關技能

- `read-tree-of-life` — 將 gematria 值對應於 sephirot 與路徑以求結構情境
- `study-hebrew-letters` — 解個別字母之象徵深 gematria 之詮釋
- `observe` — 對模式之持續中性注意；gematria 為一形之數模式辨識
