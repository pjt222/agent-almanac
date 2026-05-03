---
name: screen-trademark
locale: wenyan
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

# 篩商標

申請之前篩擬商標之衝與其別。搜商標之冊、依 Abercrombie 之譜量其別、析與舊標之惑、出附險之矩陣之衝報。

## 用時

- 採新品牌、產品、服標之前乃用
- 重塑或擴入新類乃用
- 申商標之前（國、歐、國際）乃用
- 量含商標之收購對象乃用
- 於新地市以既有品牌發產之前乃用
- 接停止函而需評暴乃用

## 入

- **必要**：擬之標（字標、形標、或二者）
- **必要**：標所覆之物與服（白話述）
- **必要**：地之範（美、歐、特國、或全球）
- **可選**：已知 Nice 分類之類
- **可選**：欲首用之日（為美普通法之先用）
- **可選**：已知競爭之標或品牌
- **可選**：標為字標、形標、或合標

## 法

### 第一步：定標與物服

明定所篩之物與其類。

1. 確錄擬之標：
   - 字標：所現之文（形標之大小寫亦重）
   - 形標：述其視覺、色、風
   - 合標：字與形俱

2. 以白話述其物服

3. 識所適 Nice 之類：
   - 用 TMclass（https://tmclass.tmdn.org/）查類
   - 依關鍵詞搜以得正類與可受之辭
   - 多標需 1-3 類；識諸關之
   - 鄰類可生惑（如 Class 9 軟體與 Class 42 SaaS）

4. 書地之範：
   - 美（USPTO）、歐（EUIPO）、國際（WIPO Madrid）、或特國
   - 注司法之異：美為先用，歐為先申

得：標、物服之述、Nice 之類、目標司法皆明錄。此定後諸步之搜範。

敗則：Nice 分曖（物服跨多類或不明合一），寧含多類。寬範之篩較失鄰類之衝為安。

### 第二步：搜商標之冊

於諸冊搜同與似之標。

1. 先搜**同標**（精合）：
   - **TMview**（https://www.tmdn.org/tmview/）：歐與參與之國
   - **WIPO Global Brand Database**（https://branddb.wipo.int/）：國際註冊
   - **USPTO TESS / Trademark Center**（https://tsdr.uspto.gov/）：美註冊與申
   - **國辦**依需：DPMAregister（德）、UKIPO（英）、CIPO（加）

2. 搜**似標**——擴搜以得：
   - 音之等：聲似（「Kool」 vs. 「Cool」、「Lyft」 vs. 「Lift」）
   - 視之等：形似（「Adidaz」 vs. 「Adidas」）
   - 標之轉寫與譯
   - 加除常前後綴之標
   - 復數、所有、縮寫

3. 以下濾果：
   - 狀：活/註冊之標與待申（略死/廢）
   - 物服：同或關之 Nice 類（自第一步）
   - 地：目標司法

4. 各潛衝皆錄：
   - 標文與註冊/申號
   - 持人之名與司法
   - Nice 之類與物服之述
   - 狀（註冊、待、異議）與日期
   - 標為同抑似（音、視、概）

得：自至少二冊得潛衝之列，覆同與似之標於相關之類與司法。各果含足之詳以為第四步之惑析。

敗則：冊暫不可得，記其闕而以可得之源行。擬標為常字，料果繁——先理同或近 Nice 類之果而後擴。

### 第三步：量別

依 Abercrombie 之譜量擬標所處。

1. 施 **Abercrombie 譜**（弱至強）：
   - **通**：其物服之常名（「Computer Software」之於軟體）。不可註不可護
   - **述**：直述質、特、用（「Quick Print」之於印）。唯有第二義（後得之別）方可註
   - **隱**：示質而需想方連（「Netflix」 = internet + flicks）。本有之別；可註而不需第二義
   - **任**：實字用於不關之境（「Apple」之於電腦）。強本之別
   - **造**：無前義之新字（「Xerox」、「Kodak」）。最強之別

2. 述標者，量第二義：
   - 商用之久與廣
   - 廣告之費與消費者之曝
   - 消費者之問或聲明
   - 媒之載與不請自至之識

3. 察因**通化**而成通名之標：
   - 標曾別而今為通名乎？（如「escalator」、美之「aspirin」）

4. 書別之量附其由

得：標於 Abercrombie 譜上之分明，附其由。述標者，附其第二義可立否之量。隱、任、造之標，可信而進。

敗則：標處通與述之界，註之險甚大。議改標推之向隱（加轉、合不關之念）或備第二義之證之策。

### 第四步：析惑之可能

量擬標與第二步所得舊標之惑可能。

1. 各潛衝舊標皆量 **DuPont 諸素**（美框）或 **EUIPO 相對之據**：
   - **標之似**：
     - 視：並觀、字之構、長、結構
     - 音：發音、音節之數、重音、母音之聲
     - 概：義、含意、商業之印象
   - **物服之似**：
     - 同 Nice 類為強示而不終
     - 異類之關物服仍可衝
     - 考交易渠道與典型之購者
   - **舊標之強**：
     - 名標得寬之護（淡化之則）
     - 弱/述之標得窄之護
     - 市之存、廣告之費、識之查
   - **實惑之證**：
     - 客之投訴、誤之通信
     - 社交媒體混二品牌之言
     - 前異議或撤銷之訴

2. 諸素衡之全：
   - 無單素為決；析為衡之試
   - 標強似可償物弱似（反之亦然）
   - 名標令惑之衡易傾

3. 各潛衝評之：
   - **阻**：同物服中近同之標，舊標強
   - **高險**：同關物服中似標，或關物服中同標
   - **中險**：關物服中似標，或遠物服中同標
   - **低險**：弱似、遠物、或舊標弱

得：附評之潛衝列，各評皆有析支之。最重之衝（阻與高險）皆識，附其特由。

敗則：析在邊（諸素指相反），保守評之（高險）。寧標可治之衝，不失阻註或致訟之衝。

### 第五步：量普通法之權

量未註之商標權，或不見於冊搜。

1. 搜未註之先用：
   - 商號之冊與州/省之庫
   - 域名之註（WHOIS、域搜器）
   - 社交媒之號與商業之檔
   - 業界之錄與貿之刊
   - Google 與通網之搜以察標之商用

2. 考司法之規：
   - **美**：先用之系——先商用立權，雖未註亦然
   - **歐**：先申之系——註優先，然先用可立有限之辯
   - **英**：仿冒之則護有商譽之未註標

3. 量所得普通法之範：
   - 先用者市之地廣
   - 用之久與一致
   - 用者於標立商譽否

4. 書普通法之得，與其於總險量之影

得：補列以未註之標用（或似標），或致冊搜不見之衝。於美申尤要。

敗則：普通法之搜得果繁（標為常字），專於同業/同物之用。普通法權常窄——本地名「Sunrise」之餅店不阻軟體名「Sunrise」。

### 第六步：量物服之疊

詳析物服競爭之近。

1. 比擬標與各舊標之 Nice 分：
   - 同類：推疊（非自動——類可廣）
   - 鄰類：量物服互補抑競
   - 遠類：常安，除非舊標為名

2. 析交易之渠：
   - 物以同零售或平台售乎？
   - 同消費者之群乎？
   - 消費者見二標皆，疑共源乎？

3. 量擴之可能：
   - 舊標之主或擴入擬標之物服乎？
   - 「自然擴之區」之則（美）

4. 書疊之析附其由

得：各潛衝之物服近之明量，強或弱第四步之惑評。

敗則：物服之關不明（新類、合業），施合理消費者之試：典型之買者於市見二標，疑共源乎？

### 第七步：生衝報

聚諸得為結構可行之報。

1. 書 **Trademark Conflict Report**，含節：
   - **執行摘要**：擬標、要得、總險評
   - **標與範**：標述、Nice 類、司法
   - **別之量**：Abercrombie 之分、註之意
   - **衝矩陣**：所識衝附險評

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
Risk: BLOCK = blocking | HIGH | MOD = moderate | LOW | CLEAR
Type: Ident = identical | Sim = similar | Phon = phonetic | Vis = visual
```

   - **普通法之得**：相關之未註用
   - **物服之析**：每衝之疊量
   - **議**：總一結之：
     - **清**：無大衝——進申
     - **低險**：微衝不阻註——進而監
     - **中險**：衝存而可治——考共存協、改標、或縮物服
     - **高險**：衝大或致異議或拒——考大改標或別標
     - **阻**：同物服中近同之舊標——勿進而不諮律

2. 含限與戒：
   - 篩非法律之意；申前諮商標律師
   - 普通法權或存於冊搜之外
   - 形之似需視察（超文搜之力）

得：完備之衝報附險評、別之量、明議。報能為擬標之進否之決。

敗則：析未決（諸司法或類間信號雜），依司法呈得，令決者衡業之考與法之險。「謹進」為合之結。

## 驗

- [ ] 標與物服明錄附 Nice 類
- [ ] 至少二冊已搜（如 TMview + USPTO TESS）
- [ ] 同與似之標皆搜（音、視、概）
- [ ] 別於 Abercrombie 譜量之，附由
- [ ] 惑之可能依 DuPont 諸素或 EUIPO 相對之據析
- [ ] 普通法權已察（商號、域、網現）
- [ ] 各潛衝之物服疊已量
- [ ] 衝矩陣已生附每標之險評
- [ ] 總議已供（清/低/中/高/阻）
- [ ] 限已述（篩 vs. 法意、冊覆之闕）

## 陷

- **唯搜同**：唯精合搜失最險之衝——音與視之似標致惑可能。常搜諸變
- **忽關類**：軟標（Class 9）可衝 SaaS 標（Class 42）或諮商標（Class 35）。Nice 類為導，非牆
- **略普通法之搜**：於美，先用之未註標勝後之聯邦註。冊搜不足
- **混別與可得**：標可大別（造）而仍衝既同註。別與可得為別之問
- **單司法之偏**：標於美清而於歐阻，反之亦然。常篩標將實用之司法
- **視篩為法意**：此技生結構之險量，非法之諮。阻與高險之得宜由商標律師審於終決前

## 參

- `assess-ip-landscape` -- 寬之 IP 景之繪，置商標篩於全 IP 策略之中
- `search-prior-art` -- 專利之先有技術搜，用異庫與法準（新穎/非顯 vs. 惑可能）
- `file-trademark` -- 篩成後之申程序（尚未提供）
