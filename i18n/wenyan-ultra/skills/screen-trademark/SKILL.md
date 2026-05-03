---
name: screen-trademark
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Screen a proposed trademark for conflicts and distinctiveness before filing.
  Covers trademark database searches (TMview, WIPO Global Brand Database, USPTO
  TESS), distinctiveness analysis using the Abercrombie spectrum, likelihood of
  confusion assessment using DuPont factors and EUIPO relative grounds, common
  law rights evaluation, and goods/services overlap analysis. Produces a conflict
  report with a risk matrix. Use before adopting a new brand name, logo, or
  slogan — distinct from patent prior art search, which uses different databases,
  legal frameworks, and analysis methods.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: intermediate
  language: natural
  tags: intellectual-property, trademark, screening, distinctiveness, conflict, likelihood-of-confusion
---

# 篩牌

提牌前篩衝與辨。搜牌庫、評於 Abercrombie 譜、析與前牌混可能、生衝報含險陣。

## 用

- 採新牌、品、服標前→用
- 重牌或擴入新類→用
- 提牌申（國、EU、國際）前→用
- 評收標含牌組→用
- 釋於新地市含既牌→用
- 受停止信需評暴→用

## 入

- **必**：擬牌（字、圖、合）
- **必**：所覆貨/服（白話）
- **必**：地範（US、EU、特國、全球）
- **可**：Nice 類（已知）
- **可**：擬首用日（US 先用權）
- **可**：知競牌
- **可**：字、圖或合

## 行

### 一：定牌與貨/服

確篩何於何類。

1. 確錄擬牌：
   - 字牌：文如顯（字大寫於圖元有義）
   - 圖牌：述視元、色、體
   - 合牌：字與圖共

2. 述貨/服於白話

3. 識用 Nice 類：
   - 用 TMclass（https://tmclass.tmdn.org/）查
   - 詞索找正類與合詞
   - 多牌需 1-3 類；識諸關
   - 鄰類可生混（如類 9 軟與類 42 SaaS）

4. 文錄地範：
   - US（USPTO）、EU（EUIPO）、國際（WIPO Madrid）或特國
   - 別法異：US 先用、EU 先申

得：明錄牌、貨/服述、Nice 類、標管。此定後步搜範。

敗：Nice 類含糊→宜寬。寬篩較失鄰類安。

### 二：搜牌庫

於諸庫搜同與似牌。

1. 先搜**同牌**（精配）：
   - **TMview**（https://www.tmdn.org/tmview/）：EU 與成員
   - **WIPO Global Brand Database**（https://branddb.wipo.int/）：國際
   - **USPTO TESS / Trademark Center**（https://tsdr.uspto.gov/）：US
   - **國辦**按需：DPMAregister（德）、UKIPO（英）、CIPO（加）

2. 搜**似牌**—展搜尋：
   - 音同：聲似（"Kool" vs. "Cool"、"Lyft" vs. "Lift"）
   - 視同：形似（"Adidaz" vs. "Adidas"）
   - 譯與音譯
   - 加除前後綴
   - 複、所有格、縮

3. 濾果按：
   - 態：活/註與待申（忽死/銷）
   - 貨/服：同或關 Nice 類
   - 地：標管

4. 各潛衝錄：
   - 牌文與註/申號
   - 主名與管
   - Nice 類與貨/服述
   - 態（註、待、異議）與日
   - 同或似（如何：音、視、念）

得：諸庫得潛衝牌列、含同與似於關類管。各果含足詳予步四析。

敗：庫暫不可達→錄缺、續以可源。擬為常字→果多，先重同或近 Nice 類後展。

### 三：評辨

評擬牌於 Abercrombie 譜何處。

1. 施 **Abercrombie 譜**（弱至強）：
   - **泛**：貨/服常名（"Computer Software" 為軟）。不可註不可保
   - **述**：直述質、特、旨（"Quick Print" 為印）。僅以二級義（獲辨）證可註
   - **示**：示質而需想連（"Netflix" = 網 + 影）。本辨；無二級義可註
   - **任**：實字於無關境（"Apple" 為計）。強本辨
   - **造**：無前義之造字（"Xerox"、"Kodak"）。最強

2. 述牌→評二級義：
   - 商用久與廣
   - 廣費與消費露
   - 消費調或聲
   - 媒覆與自發識

3. 察 **泛化**之牌：
   - 牌曾辨而今為常詞乎？（如 "escalator"、US 之 "aspirin"）

4. 文錄辨評附理

得：明分牌於 Abercrombie 譜含支理。述→評二級義可立否。示、任、造可信進。

敗：牌於泛-述界→大註險。建改牌推向示（加扭、合無關念）或備二級義證策。

### 四：析混可能

評擬牌與步二所得前牌混可能。

1. 各潛衝前牌評 **DuPont 因**（US）或 **EUIPO 相對由**：
   - **牌似**：
     - 視：並列、字組、長、構
     - 音：發音、音節、重、母音
     - 念：義、含、商印
   - **貨/服似**：
     - 同 Nice 類為強示而非定
     - 異類關貨/服仍可衝
     - 考交易渠與典型購者
   - **前牌強**：
     - 名牌得寬保（淡化）
     - 弱/述牌得窄保
     - 市存、廣費、識調
   - **實混證**：
     - 客訴、誤導通
     - 社媒混兩牌
     - 前異議或銷議

2. 整衡因：
   - 無單因定；析為衡測
   - 牌強似可抵貨弱似（反之）
   - 名牌斜衡向易見混

3. 評各潛衝：
   - **阻**：近同牌於同貨、強前牌
   - **高險**：似牌於同/關貨，或同牌於關貨
   - **中險**：似牌於關貨，或同牌於遠貨
   - **低險**：弱似、遠貨、或弱前牌

得：評列潛衝附析支各評。最重衝（阻、高）識附具理。

敗：析邊界（因兩向）→保守評（高險）。標可控潛衝較失阻註或致訴安。

### 五：評普通法權

評未註牌權—庫搜可不見。

1. 搜未註之前用：
   - 商名譜與州/省庫
   - 域名註（WHOIS、域搜）
   - 社媒柄與商檔
   - 業錄與行刊
   - Google 與一般網搜商用

2. 考管則：
   - **US**：先用制—前商用即生權雖無註
   - **EU**：先申制—註優先而前用可生限辯
   - **UK**：傳遞含混保未註含聲譽之牌

3. 評所得普通法權範：
   - 前用市地達
   - 用久與一致
   - 用者建聲譽否

4. 文錄普通法發現與其於整險評之影

得：未註之牌（或似牌）補列—可生庫搜不見之衝。US 申尤要。

敗：普通法搜果壓（牌為常字）→重同業/類用。普通法權常窄—地烘焙「日出」不阻軟「日出」。

### 六：評貨/服疊

詳析貨/服競近。

1. 較擬牌 Nice 與各前牌：
   - 同類：推疊（非自—類可寬）
   - 鄰類：評貨/服互補或競
   - 遠類：常安除前牌名

2. 析交易渠：
   - 同零售或台售乎？
   - 同消費族乎？
   - 消費見兩牌→疑同源乎？

3. 評展可能：
   - 前牌主擴入擬牌貨/服可能乎？
   - 「自然展區」說（US）

4. 文錄疊析附理

得：明評貨/服近於各潛衝、強或弱步四之混評。

敗：貨/服關不明（新品類、匯業）→施合理消費測：典購見兩牌於市→疑同源乎？

### 七：生衝報

匯諸發於結構可行報。

1. 書 **Trademark Conflict Report** 含：
   - **執簡**：擬牌、要發、整險評
   - **牌與範**：牌述、Nice 類、管
   - **辨評**：Abercrombie 分、註含義
   - **衝陣**：諸識衝附險評

```
Conflict Risk Matrix:
+----+-------------------+----------+---------+-------+---------+
| #  | Prior Mark        | Classes  | Juris.  | Type  | Risk    |
+----+-------------------+----------+---------+-------+---------+
| 1  | ACMESOFT          | 9, 42    | US, EU  | Ident | BLOCK   |
| 2  | ACME SOLUTIONS    | 42       | US      | Sim   | HIGH    |
| 3  | ACMEX             | 35       | EU      | Phon  | MOD     |
| 4  | ACM               | 16       | US      | Vis   | LOW     |
+----+-------------------+----------+---------+-------+---------+
```

   - **普通法發現**：相關未註用
   - **貨/服析**：各衝疊評
   - **建**：諸整論之一：
     - **清**：無大衝—進申
     - **低險**：小衝難阻註—進附察
     - **中險**：衝存可控—考共存議、改牌、窄貨/服
     - **高險**：大衝可致異議或拒—考改牌或替牌
     - **阻**：近同前牌於同貨—無顧問勿進

2. 含限與保留：
   - 篩非法見；申前諮牌顧問
   - 普通法權可超庫搜
   - 圖似需視察（超文搜能）

得：完衝報含險評、辨評、明建。報能進/不進決於擬牌。

敗：析未定（管或類訊雜）→按管陳發、令決者衡業考與法險。「謹進」為有效論。

## 驗

- [ ] 牌與貨/服明錄附 Nice 類
- [ ] ≥ 2 牌庫搜（如 TMview + USPTO TESS）
- [ ] 同與似牌皆搜（音、視、念）
- [ ] 辨評於 Abercrombie 譜附理
- [ ] 混可能用 DuPont 因或 EUIPO 相對由析
- [ ] 普通法權查（商名、域、網存）
- [ ] 貨/服疊各潛衝評
- [ ] 衝陣生附各牌險評
- [ ] 整建（清/低/中/高/阻）
- [ ] 限述（篩 vs. 法見、庫覆缺）

## 忌

- **僅同搜**：精配失最險衝—音視似牌觸混。必搜變
- **忽關類**：軟牌（類 9）可衝 SaaS（類 42）或諮（類 35）。Nice 為導非牆
- **略普通法搜**：US 上未註含前用勝後聯註。庫搜獨不足
- **混辨與可用**：高辨牌（造）仍可衝既同註。辨與可用為別問
- **單管偏**：US 清牌或於 EU 阻、反之。必篩實用之管
- **視篩為法見**：此技生結構險評、非法言。阻、高險宜牌顧前終決前審

## 參

- `assess-ip-landscape`
- `search-prior-art`
- `file-trademark`
