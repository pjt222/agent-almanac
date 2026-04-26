---
name: research-word-etymology
locale: wenyan-lite
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

# 研字源

自一字之現代形追溯，經有證之歷史階段及重建之原語根，識相關語言中之同源詞，以註明日期之證據記錄語義漂移，並標出民間字源。

## 適用時機

- 調查特定字之起源與歷史發展
- 比較相關語言之同源字以尋共祖
- 以證據日期繪一字之意義變遷
- 評熱門起源說屬實抑或民間字源
- 為文件或學術參考建結構化字源條目

## 輸入

- **必要**：目標字（待研之現代形）
- **必要**：目標字之源語言（預設英語）
- **選擇性**：重建深度（預設最早可重建之根；亦可止於特定歷史階段）
- **選擇性**：含同源詞之語言（預設同族主要分支）
- **選擇性**：輸出格式（預設結構化條目；亦可敘述性散文）

## 步驟

### 步驟一：識現代形與首見證

確立目標字之當前用法與最早記錄之出現。

1. 記源語言中之現代拼寫、發音（盡可能用 IPA）與主要意義。

2. 尋該字於源語中最早之有證用法。查字源詞典（英之 OED、法之 TLFi、德之 DWDS）並透過 WebSearch 查歷史語料庫：

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. 記證實日期、源文、首證時之意義。注意現代意義是否異於原意。

4. 若該字藉借入而入源語，識直接借出語與大致借入日期。

**預期：** 已註明日期之首證，源文已識，首用之意義已記，直接借出語（若為借）已立。

**失敗時：** 若於線上源中未見證實日期，明陳之並以最古可得之證據續行。將證實標為「日期不確」並續至步驟二。

### 步驟二：追字源鏈

自現代形回溯，經文獻歷史階段至最早可重建之根。

1. 對每歷史階段，記：
   - 形（拼寫／轉寫）
   - 語言與大致日期範圍
   - 該階之意義
   - 自前階以來之語音變化

2. 先循已證語言之鏈，後入重建之原語。用標準記法：星號（*）表重建形、角括號表字素、斜線表音位。

3. 對印歐語族，典型之鏈如下：
   - 現代形（如現代英語，1500 年後）
   - 中期形（如中古英語，1100-1500）
   - 古期形（如古英語，450-1100）
   - 原語形（如原始日耳曼語，重建）
   - 深原語（如 PIE，重建）

4. 對借字，於達最終起源前先追每借出語。英語之拉丁借字或經：現代英語 < 古法語 < 拉丁語 < PIE。

5. 於每階，註與該階段相關之音律以解語音變化（如 PIE 至日耳曼之輔音變遷之 Grimm 律、中古至現代英語元音變化之大元音推移）。

**預期：** 自現代形至最早可重建之根之完整鏈，每階已註日期、形與意義已記、適用時音變以具名語音規則解之。

**失敗時：** 若鏈於某階斷（無更前祖可識），標該階為終點，附「此前之起源未知」並以可得者續至步驟三。

### 步驟三：跨語族識同源詞

於相關語言中尋自同一原形而出之字。

1. 自步驟二所識之最深重建根，於語族他支中尋反映（後裔形）。

2. 對每同源詞，記：
   - 語言與現代形
   - 意義（注意與目標字之語義差異）
   - 與原形相連之規則音對應

3. 按支歸組同源詞。對 PIE，典型分支含：日耳曼、義大利（羅曼）、凱爾特、希臘、波羅的-斯拉夫、印度-伊朗、亞美尼亞、阿爾巴尼亞、吐火羅、安納托利亞。

4. 驗同源詞應檢音對應之規則性（跨多字組系統性），非僅表面相似。偽同源詞（自無關之根來之相似者）應明標並排除。

5. 將同源詞集格式化為比對表：

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

**預期：** 含至少 3 支（該根有後裔處）之同源詞集，每同源詞以規則音對應驗，偽同源詞已明排並附說明。

**失敗時：** 若該根存活同源詞少（領域特定或文化束之詞彙常如此），記所有並註分布之有限。若該字於其分支外無同源詞，陳之並釋因（如該字恐為基底借入或該分支內之創新）。

### 步驟四：記語義漂移

繪該字之意義自原根至現代形之變化。

1. 於字源鏈每階（自步驟二），記主要意義。多義並存時皆記之。

2. 將每意義變化按標準類別歸：
   - **窄化**（特化）：意義變更具體（如「deer」曾意任何動物）
   - **廣化**（一般化）：意義變更廣（如「dog」曾意特定品種）
   - **改善**：意義變更正面（如「knight」自僕至貴族戰士）
   - **惡化**：意義變更負面（如「villain」自農工至作惡者）
   - **隱喻**：意義經類比而轉（如「mouse」自鼠至電腦裝置）
   - **轉喻**：意義經聯想而轉（如「crown」自頭飾至君主）

3. 為每語義轉折提供大致日期，凡證實證據支持時。

4. 將漂移格式化為時間線：

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

**預期：** 已註日期之語義漂移時間線，至少含原始與現代意義，每轉折按類分，並引證實源。

**失敗時：** 若中間階乏明證實證據，明註間隙（如「自 X 至 Y 之語義轉折發生於 [date range]，但機制無證」）並以可得證據續行。

### 步驟五：標民間字源

識並評對該字之熱門但錯誤之起源說。

1. 尋該字之常見民間字源、回溯首字母縮詞或都市傳說：

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. 對所見之每民間字源，記：
   - 所稱起源故事
   - 為何於語言學上不支持（如時代錯置、語音不可能、無證實證據）
   - 民間字源熱門之可能因（敘事悅人、表面合理、可記之首字母縮詞）

3. 若該字無民間字源，明陳之而非略此段。

4. 用清晰之裁定標記：
   - **已確**：語言學證據支持
   - **可能**：佳支持但未確證
   - **臆**：可能但證據不足
   - **民間字源（不支持）**：熱門但證據相反
   - **回溯首字母縮詞**：字已存在後所造之首字母縮詞

**預期：** 任何所識之民間字源已以語言學證據駁倒，或明陳該字無已知之民間字源。

**失敗時：** 若所稱字源之地位實不確（合法之學術爭議），引文以呈兩面而非強裁。標為「有爭議」並列競爭假說。

### 步驟六：格式化結構化字源條目

將所有發現編入標準輸出格式。

1. 以下列結構編成條目：

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

2. 檢條目之內部一致性：字源鏈是否與同源詞集相符？語義漂移時間線是否與證實日期相合？

3. 為整體字源加信心評估，註鏈之任何弱環。

**預期：** 內部一致之完整字源條目，所有段皆填、源已引、信心級已標。

**失敗時：** 若任何段無法完成（如未見同源詞、無已知民間字源），含該段並附明確之「不適用」或「證據不足」之註，而非略之。

## 驗證

- [ ] 現代形與首證已記，附日期與源
- [ ] 字源鏈追至少二歷史階（或註為何更少）
- [ ] 重建形用標準記法（星號前綴）
- [ ] 同源詞集含至少二語支之字（凡可得處）
- [ ] 所引音對應為規則（非臨時相似）
- [ ] 語義漂移時間線有日期化條目並按類分轉折
- [ ] 民間字源已論（駁倒或標為無）
- [ ] 源已引（詞典名、語料庫名或 URL）
- [ ] 信心級已明陳
- [ ] 條目內部一致（鏈、同源詞、漂移相合）

## 常見陷阱

- **誤表面相似為同源**：跨語相似之字未必相關（如英之「much」與西之「mucho」自不同根來）。應始終以規則音對應驗，非以視覺相似
- **混借入與繼承**：相關二語中皆存之字或為一借另一，而非自共祖繼承。檢語音形與預期音律結果以別之
- **視重建形為已證**：PIE 根與其他原形乃學術假說，非歷史文獻。務以星號標之並註其重建之性
- **不批判受民間字源**：熱門起源故事每每較正字源更易記。始終檢證實證據與語音可能性後方接受所稱起源
- **忽語義漂移**：一字之現代意義或極異於原意。僅追形而不追意產誤導之果
- **止得太早**：許多線上源僅予一二階之字史。應推至最深可得之重建以得完整圖

## 相關技能

- `manage-memory` — 記字源研究發現以資跨會話之持久參考
- `argumentation` — 對有爭議之字源建並評論證
