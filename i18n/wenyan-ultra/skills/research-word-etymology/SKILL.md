---
name: research-word-etymology
locale: wenyan-ultra
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

# 究詞源

由今形溯詞至證史段、構祖根、識同族語親詞、書義漂於日證、辨俗詞源。

## 用

- 究特詞源與史
- 較親語間親詞以尋共祖
- 圖義變於世以日據
- 辨流行起源故為真乎俗
- 為文或學參建構詞源條

## 入

- **必**：標詞（欲究今形）
- **必**：標詞源語（默英）
- **可**：構深（默最深可構根；替：止於某史段）
- **可**：含親語（默同族主支）
- **可**：出格（默結構條；替：敘文）

## 行

### 一：識今形與首證

立標詞當用與最早書現。

1. 錄今拼、音（IPA 若可）、源語主義。

2. 尋詞於源語最早書用。詢詞源典（英用 OED、法用 TLFi、德用 DWDS）與史庫經 WebSearch：

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. 錄證日、源文、首證義。記今義異原乎。

4. 詞經借入源語→識直贈語與借大致日。

得：日首證、源文識、首用義錄、直贈語（若借）立。

敗：線上無證日→明書、以最古可據續。標證為「日疑」續入二。

### 二：循詞源鏈

由今形向後過書史段至最深可構根。

1. 各史段、錄：
   - 形（拼/轉寫）
   - 語與大致日範
   - 該段義
   - 自前段音變

2. 先循書語、後入構祖語。用標號：星（*）為構形、角括為字符、斜為音位。

3. 為印歐語、典鏈如：
   - 今形（如 Modern English、後 1500）
   - 中段形（如 Middle English、1100-1500）
   - 古段形（如 Old English、450-1100）
   - 祖語形（如 Proto-Germanic、構）
   - 深祖語（如 PIE、構）

4. 借詞、過各贈語至終源。英中拉借或：Modern English < Old French < Latin < PIE。

5. 各段、記應音律以釋音變（如 Grimm 律為 PIE 至 Germanic 子音變、Great Vowel Shift 為 Middle 至 Modern English 母變）。

得：完鏈自今形至最深可構根、各段日、形與義錄、音變以名律釋（適用處）。

敗：鏈於某段斷（無前祖可識）→標該段為終以「源越此不知」、續入三以所有。

### 三：跨語族識親詞

於親語尋自同祖形之詞。

1. 自步二最深構根、於語族他支尋反映（裔形）。

2. 各親詞、錄：
   - 語與今形
   - 義（記與標詞義漂）
   - 連其至祖形之規音對應

3. 按支聚親詞。為 PIE、典支：Germanic、Italic（Romance）、Celtic、Hellenic、Balto-Slavic、Indo-Iranian、Armenian、Albanian、Tocharian、Anatolian。

4. 驗親詞以察音對應規（系於諸詞集）、非僅表似。假親（不關根之似）明標除。

5. 親詞集格如較表：

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

得：親詞集至少三支現（凡根有存裔處）、各親詞以規音對應驗、假親明排含釋。

敗：根少存親詞（域特或文化縛詞常）→錄所存、記限分。詞外支無親→述、釋故（如或為基層借或支內新創）。

### 四：書義漂

圖詞義由祖根至今形之變。

1. 鏈各段（自二）、錄主義。多義並存→皆記。

2. 各義變按標類分：
   - **狹**（特化）：義更特（如「deer」曾指任獸）
   - **廣**（通化）：義更通（如「dog」曾指特種）
   - **升**：義更正（如「knight」自僕至貴武）
   - **降**：義更負（如「villain」自農工至惡）
   - **喻**：義經類比變（如「mouse」自鼠至電具）
   - **轉指**：義經聯變（如「crown」自冠飾至王朝）

3. 各義變大致日、若證據支。

4. 漂格如時序：

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

得：日義漂時序、至少有原與今義、各變類分、證源引。

敗：中段缺證→明記（如「義由 X 至 Y 之變於 [日範] 間發、機未證」）以可據續。

### 五：辨俗詞源

識評詞所附流行而誤之起源故。

1. 尋俗詞源、後造縮寫、市傳：

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. 各俗源、書：
   - 所稱起源故
   - 何以語不支（如時錯、音不能、無證）
   - 俗源流行之或因（敘悅、表似、易記縮）

3. 此詞無俗源→明述、勿略段。

4. 用明判標：
   - **確**：語據支
   - **似**：強支而未決證
   - **臆**：可能而證不足
   - **俗詞源（不支）**：流行而證反
   - **後造縮寫**：詞已存後所造之縮寫

得：諸俗源識且以語據駁、或明述此詞無俗源知。

敗：稱詞源真疑（學爭）→雙方含引示而非強判。標為「爭」含競設。

### 六：格結構詞源條

合諸發見入標出格。

1. 條構如：

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

2. 審條內合：詞源鏈合親詞集乎？義漂時序合證日乎？

3. 加總詞源信估、記鏈中弱環。

得：完、內合詞源條、諸段填、源引、信標。

敗：某段不能完（如無親詞、無俗源知）→含段以明「不適」或「證不足」、勿略。

## 驗

- [ ] 今形與首證錄、含日與源
- [ ] 詞源鏈循至少二史段（或記何故少）
- [ ] 構形用標號（星首）
- [ ] 親詞集至少二語支（凡有處）
- [ ] 引音對應為規（非臨時似）
- [ ] 義漂時序有日條與分變類
- [ ] 俗詞源已對（駁或記缺）
- [ ] 源引（典名、庫名、或 URL）
- [ ] 信級明述
- [ ] 條內合（鏈、親詞、漂合）

## 忌

- **表似誤為親**：跨語似詞未必親（如英「much」與西「mucho」自異根）。常以規音對應驗、非視似
- **混借與承**：詞於二親語並存或自一借他、非自共祖承。察音形對律期果以分
- **視構形為證**：PIE 根與他祖形為學設、非史檔。常以星標、記為構
- **無批受俗源**：流行起源故常較正詞源易記。常察證與音可前受所稱源
- **忽義漂**：詞今義或甚異原。唯循形不追義致誤
- **太早止**：多線源唯供詞史一二段。推至最深可構為全像

## 參

- `manage-memory` — 書詞源究發見以跨會持參
- `argumentation` — 建評爭詞源之論
