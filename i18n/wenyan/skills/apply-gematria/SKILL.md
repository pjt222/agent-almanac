---
name: apply-gematria
locale: wenyan
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

# 施數秘

算析 gematria——以數付希伯來字之系。覆標（Mispar Hechrachi）、序（Mispar Siduri）、約（Mispar Katan）、同值（isopsephy）比、諸釋框。

## 用時

- 欲算希伯來字或語之數值乃用
- 比二字是否共數值（同值）乃用
- 需知何法宜乃用
- 研聖經或聖名之數應乃用
- 探字之義與其數之關乃用
- 連數果於其於生命樹之位乃用

## 入

- **必要**：欲析之希伯來字、語、或聖名（希伯來文或轉寫）
- **可選**：比之第二字/語（同值）
- **可選**：所擇法（標、序、約、或三者皆）
- **可選**：引析之境或問（如「此二字何以共值？」）

## 法

### 第一步：轉寫而識其希伯來源

立字或語之精希伯來拼寫。

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

1. 若入為英轉寫，轉為希伯來字序
2. 驗拼：希伯來諸字有多拼（全拼與缺拼）
3. 記字含末形（Kaf-sofit、Mem-sofit、Nun-sofit、Peh-sofit、Tzadi-sofit）乎
4. 述源：聖經字乎、聖名乎、今希伯來字乎、Kabbalah 術語乎
5. 若歧，呈二常拼各算其 gematria

**得：** 希伯來字序信立。用者知諸字為何而可驗拼。

**敗則：** 若轉寫歧（如「chai」可為 Chet-Yod 或 Chet-Yod-Yod），呈二擇附數值，令用者擇之。

### 第二步：施標 gematria（Mispar Hechrachi）

以標希伯來數表和字值。

1. 書每字附標值
2. 左至右和（希伯來右至左讀，然和交換）
3. 明述總
4. 記總合要數乎：
   - 一輝之數（1-10）
   - 徑之數（11-32）
   - 著名 gematria 值（26 = YHVH、18 = chai、72 = Shem ha-Mephorash、137 = Kabbalah）
5. 若總逾 400，注其需和多百

**得：** 清之數果附逐步算。用者可驗每字之值於表。

**敗則：** 若用者給希伯來拼不定之字，算諸合拼之值且注其範。「正」拼依源文。

### 第三步：施序法與約法（可選）

算露異紋之別 gematria。

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

1. 算序 gematria：和每字於字母（1-22）之位
2. 算約 gematria：減每標值為單位數，和而再約
3. 並呈三值以比
4. 注何法於此字露最趣之連

**得：** 三數值（標、序、約）並呈。約值常連至單位數之一輝數，生命樹映佳用。

**敗則：** 若用者僅欲一法，供之且言他法存為後探。勿以多算壓人若單法已請。

### 第四步：搜同值連

識他希伯來字或語共同數值者。

1. 取第二步之標 gematria 值
2. 搜共值之著名字、聖名、或語
3. 呈二至五連，重：
   - 聖經字與語
   - 聖名與輝標
   - 古典 Kabbalah 源之傳連
   - 驚或啟之連
4. 每連注其傳源（Zohar、Talmud、後 Kabbalah 註、Hermetic 傳）
5. 若無要連，認之——非諸數皆有富同值

**得：** 共 gematria 值之字集，各附其何意之簡注。用者有材以思。

**敗則：** 若無著名連於所算值，認之。擬算其值與近要數之關（如「汝值 378，乃 shalom [376] 多 2——此示何？」）。

### 第五步：釋連與應

自算移至思——數關示何？

1. 明述：gematria 示可思之應，非證非預
2. 每同值連呈思問：
   - 「字甲與字乙共值 N。其義何以互照？」
   - 「約值指輝 X。此字之義何以應此輝之性？」
3. 注生命樹連：
   - 標值 1-10 → 直輝應
   - 約值 1-9 → 輝鳴
   - 值 = 徑數（11-32）→ 應其徑之希伯來字
4. 若用者供引問（自入），以 gematria 果直答之
5. 以一整合述連數析於字義為終

**得：** 數析已成有義——非僅算，乃以理解字於 Kabbalah 符網之位之鏡也。

**敗則：** 若釋覺強或臆，直言之。諸 gematria 算豐寡有異。誠承薄連勝於造意。

## 驗

- [ ] 希伯來拼已信立（或呈多拼）
- [ ] 標 gematria 算附每字之值顯
- [ ] 至少一別法（序或約）已施
- [ ] 同值連已搜且呈附源注
- [ ] 釋為思而非證
- [ ] 算可驗——用者可對每字於值表察

## 陷

- **拼歧**：希伯來字可含或不含母音字（matres lectionis）。gematria 大變——恆確拼
- **末形混**：Mem-final = 40 或 600 依何 gematria 系。明述系
- **找所期者**：gematria 以諸法終連任二字。偏確先信之連乃確認偏，非析
- **忽傳**：古典 Kabbalah gematria 連（如 YHVH = 26、echad [一] = 13、ahavah [愛] = 13，故愛+一 = 神）書於權威源。新連當與傳連分
- **以 gematria 為證**：字間數等示可思之應，非同等或因果
- **忘境**：同字於聖經、禮、Kabbalah 冥之 gematria 義或異。境塑釋

## 參

- `read-tree-of-life` — 映 gematria 於輝與徑以得結構境
- `study-hebrew-letters` — 解單字之象以深 gematria 釋
- `observe` — 中立持注於紋；gematria 乃數紋之察之一式
