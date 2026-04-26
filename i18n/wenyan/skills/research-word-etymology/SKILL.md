---
name: research-word-etymology
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Research the etymology of a word by tracing proto-language roots,
  identifying cognates across language families, documenting semantic
  drift with dated attestations, and flagging folk etymologies. Use
  when investigating word origins, comparing cognate sets across
  related languages, charting historical meaning changes, or debunking
  popular but unsupported origin stories.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: linguistics
  complexity: intermediate
  language: natural-language
  tags: linguistics, etymology, historical-linguistics, proto-language, cognates
---

# 究字源

追字之源：自當形溯至原語之根，識諸語族之同源詞，書義之漂附日證，標民俗之偽源。

## 用時

- 究字之源與其史變乃用
- 較相關諸語之同源詞以尋共祖乃用
- 圖字義數百年之變附證日乃用
- 估俗之源故為真或為民俗之偽乃用
- 為文檔或學參建構源之入乃用

## 入

- **必要**：目字（欲究之當形）
- **必要**：目字之源語（默：英）
- **可選**：重構之深（默：可重構之最早根；替：止於某史階）
- **可選**：欲含之同源語（默：同族之主枝）
- **可選**：出式（默：構之入；替：散文）

## 法

### 第一步：識當形與初證

立目字之當用與初書之現。

1. 錄源語中之當拼、音（IPA 若可）、主義。

2. 尋目字於源語之最早證用。查源典（英之 OED、法之 TLFi、德之 DWDS）與史庫由 WebSearch：

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. 錄證日、源文、初證之義。記當義是否異於原。

4. 若字由借入源語，識直贈語與借之約日。

得：日有之初證附源文已識，初用之義已錄，直贈語（若借）已立。

敗則：若線源中無證日，明記之而以最古之證進。標證為「日不確」而續第二步。

### 第二步：追源之鏈

自當形向後過諸書史階至最早可重構之根。

1. 各史階記：
   - 形（拼/轉）
   - 語與約日範
   - 該階之義
   - 自前階之音變

2. 此鏈先過書之語，後入重構之原語。用標符：星（*）為重構形、角括為字符、斜線為音位。

3. 印歐諸語之常鏈如：
   - 當形（如當英，1500 後）
   - 中期形（如中英，1100-1500）
   - 古期形（如古英，450-1100）
   - 原語形（如原日耳曼，重構）
   - 深原語（如 PIE，重構）

4. 借字者，過各贈語至終源。英之拉借或：當英 < 古法 < 拉 < PIE。

5. 各階記釋音變之相關音律（如 PIE 至日耳曼之子音變之 Grimm 律、中至當英之元音變之大元音變）。

得：自當形至最早可重構之根之全鏈，各階註日，形與義已錄，音變以名音律釋之。

敗則：若鏈於某階斷（無更前祖可識），標其階為終附「源越此不知」而以可得者進第三步。

### 第三步：識諸語族之同源詞

於語族他枝尋自同原形而生之字。

1. 自第二步所識之最深重構根，於語族他枝尋反映（後形）。

2. 各同源詞記：
   - 語與當形
   - 義（記與目字義之差）
   - 繫之原形之規音對

3. 同源詞依枝群之。PIE 之常枝含：日耳曼、義大（羅曼）、凱爾特、希臘、波羅斯拉、印伊、亞美尼亞、阿爾巴尼亞、吐火羅、安那托利亞。

4. 驗同源詞察其音對為規（系於數字組），非淺似。偽同源詞（自無關根之似形）宜明標而除。

5. 同源組式為較表：

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

得：同源組至少 3 枝（若根有存反映），各同源詞以規音對驗，偽同源詞已明除而釋。

敗則：若根少存同源詞（域特或文化所縛之詞常然），書所有並記限分布。若字於其枝外無同源，述之而釋（如其字或為底層借或枝內新）。

### 第四步：書義之漂

圖字義自原根至當形之變。

1. 第二步源鏈各階記主義。多義並存時，皆記之。

2. 各義變依標類分：
   - **狹**（特化）：義更特（如「鹿」昔指任何獸）
   - **廣**（泛化）：義更泛（如「狗」昔指特種）
   - **昇**：義更陽（如「騎士」自僕至貴武）
   - **貶**：義更陰（如「惡棍」自農至惡）
   - **隱喻**：由比之變（如「鼠」自鼠類至腦器）
   - **轉喻**：由連之變（如「冠」自首飾至君主）

3. 證據可佐之處供各義變之約日。

4. 漂式為時線：

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

得：日之義漂時線含至少原與當之義，各變分類，證源已引。

敗則：若中階缺明之證，明記其缺（如「自 X 至 Y 之義變於[日範]間生而其機未證」）而以可得之證進。

### 第五步：標民俗之源

識而估字之俗而誤之源故。

1. 尋字之常民俗源、後造縮寫、城市傳：

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. 各民俗源書：
   - 所稱之源故
   - 何以無語據（如時序錯、音不可、無證據）
   - 何以民俗源得行（敘合心、似可信、易記縮）

3. 若此字無民俗源，明述之，勿略此段。

4. 用明判標：
   - **確**：有語據佐
   - **可能**：佐而未決
   - **臆**：可而證不足
   - **民俗源（無據）**：行而證駁
   - **後造縮**：縮詞於字後造

得：諸民俗源已識並以語據駁，或明述此字無已知民俗源。

敗則：若所稱源之態真不確（合學議），引兩面附引而非強判。標為「議」附競假。

### 第六步：式構源之入

合諸所得為標出式。

1. 入按以下構合：

```markdown
## Etymology: [word]

**Modern form**: [word] ([language], [part of speech])
**Pronunciation**: /[IPA]/
**First attested**: [date], [source text/author]

### Etymological Chain
[Modern form] ([language], [date])
  < [intermediate form] ([language], [date]) "[meaning]"
  < [older form] ([language], [date]) "[meaning]"
  < *[proto-form] ([proto-language]) "[reconstructed meaning]"

### Cognates
[Cognate table from Step 3]

### Semantic Drift
[Timeline from Step 4]

### Folk Etymologies
[Findings from Step 5, or "None known"]

### Sources
[Etymological dictionaries and corpora consulted]

### Confidence
[Overall confidence level: certain / probable / speculative / contested]
[Notes on any gaps or uncertainties in the analysis]
```

2. 審入之內合：源鏈合同源組乎？義漂之時線合證日乎？

3. 加整體源之信評，記鏈中之弱繫。

得：完整、內合之源入附諸段已填，源已引，信等已標。

敗則：若某段不可成（如無同源詞、無已知民俗源），段含明之「不適」或「證不足」之注，勿略之。

## 驗

- [ ] 當形與初證已錄附日與源
- [ ] 源鏈至少追二史階（或記何以少）
- [ ] 重構形用標符（星前綴）
- [ ] 同源組含至少二語枝（若可得）
- [ ] 所引音對為規（非臨時之似）
- [ ] 義漂時線有日入附分類之變
- [ ] 民俗源已處（駁或記為無）
- [ ] 源已引（典名、庫名、或 URL）
- [ ] 信等明述
- [ ] 入內合（鏈、同源、漂相合）

## 陷

- **以表似為同源**：字越語似形非必相關（如英 "much" 與西 "mucho" 自異根）。必以規音對驗，非以視似
- **混借與承**：相關二語中之字或自一借至另一而非自共祖承。察其音形對期音律之果以分二者
- **視重構為已證**：PIE 根與他原形為學假，非史文。必標星而記其為重構
- **不察民俗源**：俗源故常勝正源易記。必察證與音之可行於受所稱源前
- **忽義漂**：字之當義或大異於原義。獨追形而不追義致誤導之果
- **止過早**：多線源獨示一二階。推至最深可得之重構為全像

## 參

- `manage-memory` — 書源究所得以跨會持參
- `argumentation` — 建估議源之論
