---
name: file-trademark
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Trademark filing procedures covering EUIPO (EU), USPTO (US), and WIPO Madrid
  Protocol (international). Walks through pre-filing conflict checks, Nice
  classification, descriptiveness assessment, mark type decisions, filing basis
  strategy, office-specific e-filing procedures, Madrid Protocol extension, post-
  filing monitoring, and open-source trademark policy drafting. Use after running
  screen-trademark to confirm the mark is clear, when ready to secure trademark
  rights in one or more jurisdictions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: intellectual-property
  complexity: advanced
  language: natural
  tags: intellectual-property, trademark, filing, euipo, uspto, madrid-protocol
---

# 申商標

於 EUIPO（EU）、USPTO（US）、WIPO Madrid 協議（國際）申商標。此技述實申程——自申前驗至登後監與開源商標策。假衝審已以 `screen-trademark` 完。

## 用時

- 衝審清而可申
- 擇歐、美、或國際申策
- 先 EU 後於 US 主先日權
- 以 Madrid 協議將既國標擴國際
- 登後草開源商標用策
- 審中應官通或異議

## 入

- **必要**：欲申之標（字、圖、或合）
- **必要**：貨與服述
- **必要**：目法域（EU、US、國際、或合）
- **必要**：申者名址
- **可選**：screen-trademark 之果（衝搜報）
- **可選**：圖文（若申圖或合標）
- **可選**：先權稱（他域六月內之前申）
- **可選**：商業用證（USPTO 1(a) 基所需）
- **可選**：開源項脈絡（供第十步之商標策）

## 申費參

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## 法

### 第一步：申前察

投申費前驗標可申。

1. 確 `screen-trademark` 已運：
   - 審衝搜報察同或混似之標
   - 驗諸目域皆於審中
   - 察審近（宜三十日內）
2. 於官庫作末衝察：
   - **EUIPO TMview**：搜諸 EU 成員國登
   - **WIPO Global Brand Database**：國際登
   - **USPTO TESS**：US 聯邦登（用結構搜：`"mark text"[BI]`）
   - **DPMAregister**：德國登（若申 EU，涵最大 EU 市）
3. 驗域名與社媒號可得或已得：
   - 域名可得強辨證
   - 同號減用惑險
4. 記搜果為**申前清錄**

**得：** 確目域無阻標。申前清錄記勤以供後異議防。

**敗則：** 若現衝標，評重：同標+同貨 = 不申。似標+關貨 = 求律師評惑可能。若衝限於一域，宜唯於清域申。

### 第二步：Nice 分類擇

於 Nice 分類系識正貨服類。

1. 查 TMclass 工具（tmclass.tmdn.org）以識類：
   - 入貨服述
   - TMclass 薦諸官受之諧詞
   - 用 TMclass 庫之預認詞減審延
2. 技與軟常類：
   - **Class 9**：可下軟、移應、計機硬
   - **Class 35**：告、業管、SaaS 管
   - **Class 42**：SaaS、雲算、軟發服
   - **Class 38**：電訊、線平、訊服
3. 草貨服述：
   - 具體足以定實用而廣足未來擴
   - TEAS Plus（USPTO）須 ID Manual 詞——用預認詞
   - EUIPO 直受 TMclass 諧詞
4. 費與覆衡：
   - 每加一類加費（見上費表）
   - 於汝當用或擬用之類申
   - 過廣無用之申或被挑（尤 US）

**得：** Nice 類之末列附各類具體預認貨服述。述合實業用。

**敗則：** 若 TMclass 無明配，查 Nice 釋注（WIPO Nice 頁）。模貨或跨多類——於諸相類申以防除。

### 第三步：述性評

評標可登或或遇述性異議。

1. 於 **Abercrombie 譜** 評標（US 標，廣施）：
   - **Generic**：品之通名（如「電腦」於電腦）——永不可登
   - **Descriptive**：直述質或特（如「QuickBooks」）——唯有二義時可登
   - **Suggestive**：暗示而不直述（如「Netflix」）——無二義可登
   - **Arbitrary**：用於無關脈之真詞（如「Apple」於電子）——強護
   - **Fanciful**：造詞（如「Xerox」）——最強護
2. 察 EUTMR 絕對拒由（Art. 7(1)）：
   - Art. 7(1)(b)：缺辨之性
   - Art. 7(1)(c)：述貨服特
   - Art. 7(1)(d)：業中慣（相業通）
3. 若標近述：
   - 集獲辨之證（告費、銷、消問卷）
   - 考加辨元（圖、風）
   - 改字標使近暗或任
4. 記評附理

**得：** 標於 Abercrombie 譜類為暗、任、或造——皆無二義可登。近例標附減策。

**敗則：** 若標述或通，勿申——將被拒。重設使近辨譜。若有顯用史，考 Section 2(f) 稱（獲辨）於 US 或 Art. 7(3) EUTMR 同稱於 EU。

### 第四步：標類決

擇最護牌之登類。

1. **字標**（標字）：
   - 護字本，不論體、色、風
   - 最廣護——覆任視示
   - 不含設元
   - 牌值於名非圖時宜擇
2. **圖標**（圖或設）：
   - 護具體視示
   - 較狹護——不覆他風之字
   - 圖本身為主牌識時需
   - 須遞清圖（JPG/PNG，EUIPO：最大 2 MB、最小 945x945 px）
3. **合標**（字+圖）：
   - 護具體申之合
   - 狹於字標——限於具體合
   - 常而策略次：若圖易，登或不覆新版
4. **策略之薦**：
   - 先申字標（最廣護、最經）
   - 唯圖有獨牌值時別申圖標
   - 避合標，除非預限阻別申

**得：** 明標類決附策理。字標為默薦，除非圖持獨牌值。

**敗則：** 若不確名獨足辨，試問：「消者於純字（無圖）可識此名乎？」若可，申字標。若圖不可離牌，考分申字與圖。

### 第五步：申基擇

定申之法基（主 USPTO 用）。

1. **商業用—Section 1(a)**：
   - 標已於州際商（US）或真用（EU）
   - 須遞樣示標實用（截圖、包、告）
   - 至登最速之路
2. **擬用—Section 1(b)**：
   - 標未用而申者有真擬用
   - 登前須遞用聲（加費、期）
   - 允於發前得先權
   - 可申延（總 36 月）
3. **外先權—Section 44(d)**：
   - 自六月內外申稱先權
   - **策**：先 EUIPO（費低、速）再稱 44(d) 先權於 USPTO
   - 予 US 申與 EU 申同先日
   - 須外申之認副
4. **外登—Section 44(e)**：
   - 基於外登（非僅申）
   - 申時無需 US 商用（然終須用）
5. **Madrid 協議擴—Section 66(a)**：
   - 經 Madrid 系指 US
   - 詳見第八步

**得：** 申基擇附程與樣之要記。若用先歐後 44(d) 於 USPTO 策，六月先權窗入曆。

**敗則：** 若無商業用而無待外申，Section 1(b)（擬用）乃 USPTO 唯選。計加用聲之費與期。EUIPO 申無需用——擬聲足。

### 第六步：EUIPO 線申程

線申 EU 商標。

1. 至 EUIPO 線申（euipo.europa.eu）：
   - 若未登創 EUIPO 用戶
   - 於預認 TMclass 詞用「Fast Track」申（速審）
2. 完申表：
   - **申者詳**：名、址、法形、國籍
   - **代表**：EU 內可選；非 EU 需
   - **標**：入字標或上圖
   - **貨服**：選 TMclass 詞或入自述
   - **申語**：EN、FR、DE、ES、IT 擇（需次語）
   - **先權稱**：若稱先權入外申號與日
3. 審費摘：
   - 1 類：850 EUR
   - 2 類：900 EUR（+50 EUR）
   - 3+ 類：900 EUR + 每加類 150 EUR
   - **SME Fund（EUIPOIdeaforIP）**：中小企可稱 75% 補
4. 線付（信卡、轉、或 EUIPO 當賬）
5. 存申收附申號與申日

**得：** EUIPO 申已遞附確收。申號與申日已記。若 Fast Track，審常於一月內畢。

**敗則：** 若線棄申（技誤），存截圖再試。若貨服述拒，轉預認 TMclass 詞。若付敗，申存草三十日。

### 第七步：USPTO 申程

線申 US 聯邦商標。

1. 至 USPTO TEAS（Trademark Electronic Application System）：
   - 擇 TEAS Plus（$250/類）或 TEAS Standard（$350/類）
   - TEAS Plus 須預認 ID Manual 詞；TEAS Standard 允自述
2. **外申求**：
   - US 外居申者*必*聘 US 律師
   - 律師須 US 州律師會有效員
   - 此求亦適 Madrid 協議申
3. 完申表：
   - **申者信**：名、址、實類、國籍/組織州
   - **律師信**：名、會籍、通郵
   - **標**：入字標或上設標
   - **貨服**：自 ID Manual（TEAS Plus）擇或草自（TEAS Standard）
   - **申基**：擇 Section 1(a)、1(b)、44(d)、或 44(e)（見第五步）
   - **樣**（唯 1(a)）：上示標實用於商
   - **聲**：於偽證刑下驗準
4. 付申費（$250 或 $350 每類）
5. 存申收附序號與申日

**得：** USPTO 申遞附序號。申收存。審通 8-12 月至首官通。

**敗則：** 若 TEAS 拒申，察誤訊——常問：實類誤、無樣（1(a)）、貨述不合 ID Manual（TEAS Plus）。若外申無 US 律師，申將被拒。

### 第八步：Madrid 協議擴

經 WIPO Madrid 系擴國際護。

1. **先決**：
   - 原國有基標（申或登）
   - 申者須 Madrid 成員國之國籍、居、或有實效立
   - 基標須覆同或較窄貨服
2. 經原國申（非直 WIPO）：
   - **EUIPO 為原**：用 EUIPO Madrid 線申
   - **USPTO 為原**：經 TEAS International Application 表
3. 完 Madrid 申（MM2 表）：
   - **申者詳**：須確合基標持者
   - **標示**：須同基標
   - **貨服**：自基標之規擇（可窄不可廣）
   - **指定締約方**：擇目國/區
   - **語**：英、法、或西
4. 算費：
   - 基費：653 CHF（黑白）或 903 CHF（彩）
   - 補費：首類外每類 100 CHF
   - 獨費：依指國易（察 WIPO 費算器）
   - 常獨費：US ~$400+/類、日 ~$500+/類、中 ~$150+/類
5. **中央攻擊依**：
   - 前五年國際登依基標
   - 若基標撤（異議、無用），諸指皆落
   - 五年後各指獨
   - 策：依期中力護基標

**得：** Madrid 申已經原國遞。指國已擇附費算記。五年依險已認，基標護計已立。

**敗則：** 若原國拒 Madrid 申（如與基標不合），正差異再申。若某指國拒護，於該官期內（常 12-18 月）經 Madrid 系應。

### 第九步：申後監

循申經審並應官動。

1. **EUIPO 監**：
   - 登於 EU 商標公報 Part A
   - **異議期**：自公佈三月（可延一月冷靜）
   - 若無異：自動登
   - 異防：於通知二月內遞察
2. **USPTO 監**：
   - 常察 TSDR（Trademark Status and Document Retrieval）
   - **審律師審**：申後 8-12 月
   - **官通**：應期常三月（可一延 $125）
   - **異議公佈**：官報三十日期
   - **用聲**（1(b)）：須於准通三十日後六月內遞（總可延 36 月，每延 $125）
3. **Madrid 監**：
   - WIPO 通各指官
   - 各官獨審（12-18 月窗）
   - 暫拒須經當官程應
4. **諸期入曆**：
   - 異議應期
   - 用聲期（USPTO 1(b)）
   - 更期（EUIPO 10 年、USPTO 10 年、Madrid 10 年）
   - USPTO Section 8/71 用聲：於第五與六年間
5. 監第三方申混似之標：
   - 設 TMview/TESS 監警於汝類之似標
   - 重牌考專商標監服

**得：** 諸期入曆附提。申狀經各官線系監。異議或官通應策預備。

**敗則：** 誤期常致命——多商標期不可延。若誤期，察復或再立可否（USPTO 允為非故延請復）。EUIPO 誤異議期通為末。

### 第十步：開源商標策

若標覆開源項，草商標用策。

1. 學立模：
   - **Linux Foundation**：允項名於事實引用；限圖於許可者
   - **Mozilla**：詳則分未改發與改建
   - **Rust Foundation**：寬社群用附具體商品限
   - **Apache Software Foundation**：寬命策附暗示贊限
2. 定用類：
   - **Fair use**（恆允）：於文、評、較、學報以名引項
   - **Community/contributor use**（廣允）：用群、會、教材、未改發
   - **Commercial use**（需許或限）：含軟之品、基項之服、證/兼容稱
   - **Prohibited use**：暗示官贊、用於顯改版無示、致惑域名
3. 草商標策文：
   - 商標權之明述
   - 何用無需許
   - 何用需書許
   - 如何求許（聯繫、程）
   - 誤用之果
4. 置策文於項庫：
   - 常位：`TRADEMARKS.md`、`TRADEMARK-POLICY.md`、或 `CONTRIBUTING.md` 之節
   - 自 `README.md` 與項站連
5. 發策前登標：
   - 無登之商標策多不可行
   - 最少：發前申——「TM」可即用，「(R)」唯登後

**得：** 清公之商標策，護牌而允健社群用。策循立開源基模，可自項主文檔達。

**敗則：** 若項無商標登或申，先申（六至八步）再草策。無登標行窄。若社群反策，學 Rust Foundation 之法——社群回後改，視為衡護與開之佳模。

## 驗

- [ ] 申前衝察畢並記（一步）
- [ ] Nice 類已擇附預認貨服述（二步）
- [ ] 述性於 Abercrombie 譜已評（三步）
- [ ] 標類已決附策理（四步）
- [ ] 申基已擇附程與樣之要記（五步）
- [ ] 已於至少一目域申（六至八步）
- [ ] 申收已存附申號與申日
- [ ] 諸申後期已入曆附提（九步）
- [ ] 商標監警設於混似標（九步）
- [ ] 若適，開源商標策已草（十步）

## 陷

- **無審即申**：略 `screen-trademark` 直申，若有衝標廢費。先審
- **誤申基**：未用而稱 1(a) 致偽申。若未發用擬用（1(b)）
- **過廣貨述**：稱不用或不擬用之貨服引無用撤（尤 EU 五年後）
- **誤先權窗**：Section 44(d) 外先權須於首申六月內稱。誤則失早先日
- **略外律師求**：非 US 申者於 USPTO 無 US 律師將被拒——此 2019 起之硬則
- **Madrid 中央攻擊露**：唯賴 Madrid 指而不解五年依於基標。基落則諸指皆落
- **無申後監**：申而忘之。官通與異議期過，申成棄
- **登前商標策**：無至少待申而發策損行。先申，再草策

## 參

- `screen-trademark` — 先於此申程之衝審
- `assess-ip-landscape` — 廣 IP 景析含商標景映
- `search-prior-art` — 適商標辨研之先藝搜法
