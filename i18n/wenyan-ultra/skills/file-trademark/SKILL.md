---
name: file-trademark
locale: wenyan-ultra
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

# 提標

於 EUIPO（EU）、USPTO（US）、或 WIPO Madrid 議（國際）提商標申。此技覆實提行——自前驗至登後監與開源商標策。設衝篩已經 `screen-trademark` 畢。

## 用

- 衝篩清後備提
- 擇於 EU、US、國際之提策
- 先提 EU 並於後 US 提主張先權
- 經 Madrid 議擴舊國標於國際
- 登後擬開源商標用策
- 審時答局之動或反對

## 入

- **必**：欲提之標（字、徽、或合）
- **必**：商品與服務述
- **必**：標地（EU、US、國際、或合）
- **必**：申者名與址
- **可**：screen-trademark 果（衝尋報）
- **可**：徽文（若提圖或合標）
- **可**：先權主張（6 月內別地先提）
- **可**：商務用證（USPTO 1(a) 基須）
- **可**：開源項目境（十步商標策用）

## 提費參

| Office | Base Fee | Per Class | Notes |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR (2nd), +150 EUR (3rd+) | SME Fund: 75% rebate |
| USPTO (TEAS Plus) | $250 | per class | Foreign applicants need US attorney |
| USPTO (TEAS Standard) | $350 | per class | More flexible goods description |
| Madrid Protocol | 653 CHF | varies by country | Depends on base mark for 5 years |

## 行

### 一：提前察

投費前驗標可提。

1. 確 `screen-trademark` 已行：
   - 閱衝尋報察同或易混標
   - 驗諸標地皆於篩內
   - 察篩新（宜末 30 日）
2. 於官庫行末衝察：
   - **EUIPO TMview**：跨諸 EU 成員國登尋
   - **WIPO Global Brand Database**：國際登
   - **USPTO TESS**：US 聯邦登（用結構尋：`"mark text"[BI]`）
   - **DPMAregister**：德國登（提 EU 時，覆 EU 最大市）
3. 驗域名與社媒柄可用或已得：
   - 域可用加辨性論（受挑時）
   - 匹柄減費認混險
4. 錄尋果為 **Pre-Filing Clearance Record**

得：確標地無阻標。Clearance Record 錄勤並撐未來反對防。

敗：察衝標→估重：同標+同品=勿提。似標+關品=求律師議混之可能。衝限於一地→考僅提清地。

### 二：擇 Nice 類

依 Nice 類系識正商品與服務類。

1. 察 TMclass 工（tmclass.tmdn.org）以識類：
   - 入商品/服務述
   - TMclass 建諸局受之協詞
   - 用 TMclass 已批詞減審延
2. 科技與軟體常類：
   - **Class 9**：可下載軟體、app、電腦硬體
   - **Class 35**：廣、商管、SaaS 台管
   - **Class 42**：SaaS、雲算、軟體發服
   - **Class 38**：通信、在線台、信服
3. 擬商品與服務述：
   - 足特以定實用，足廣以備來擴
   - TEAS Plus（USPTO）需 ID Manual 詞——用已批
   - EUIPO 直受 TMclass 協詞
4. 衡費與覆：
   - 各增類加費（見上表）
   - 於現用或將用標之類提
   - 無用而過廣提或被挑（尤 US）

得：末 Nice 類列，各類有特、已批之商品與服務述。述匹實商用。

敗：TMclass 無明匹→察 Nice 分類釋注（WIPO Nice 頁）。歧商品或跨多類——諸關類皆提勝險排除。

### 三：估述性

察標可登否或將遇述性反對。

1. 於 **Abercrombie 譜** 估標（US 準，廣用）：
   - **Generic**：品之通名（如電腦之「Computer」）——永不可登
   - **Descriptive**：直述質或徵（如「QuickBooks」）——唯有次意可登
   - **Suggestive**：示而不直述（如「Netflix」）——可登而無次意
   - **Arbitrary**：無關境之實詞（如電子之「Apple」）——強護
   - **Fanciful**：創詞（如「Xerox」）——最強護
2. 察 EUTMR 絕對拒因（第 7(1) 條）：
   - 7(1)(b)：乏辨性
   - 7(1)(c)：述商品/服務之徵
   - 7(1)(d)：業通用（關業通名）
3. 若標界描述：
   - 集得辨性證（廣費、銷數、消者調）
   - 考加辨素（徽、式）
   - 改字標使向示或任
4. 錄察並理

得：標於 Abercrammbie 譜分為示、任、或創——皆可登無次意。界案標並記緩策。

敗：若標述或通→勿提；將拒。重設標上譜。若有顯用史→考 2(f) 主張（得辨性）於 US 或 Art. 7(3) EUTMR 於 EU。

### 四：決標類

擇最護牌之登類。

1. **Word 標**（標字）：
   - 護字本身，不論字型、色、式
   - 最廣護——覆任視表
   - 不可含設素
   - 牌值在名非徽時宜
2. **Figurative 標**（徽或設）：
   - 護特視表
   - 窄護——不覆他式之字
   - 徽本身為主牌識時必
   - 須提清像文（JPG/PNG，EUIPO：最 2 MB，最少 945x945 px）
3. **Combined 標**（字+徽同）：
   - 護所提之特合
   - 較單字標窄——限於特合
   - 常而策次優：徽變則登或不覆新
4. **策建**：
   - 先提字標（最廣護，最省）
   - 徽有顯獨牌值時另提 figurative 標
   - 除非預約——避 combined 標

得：明標類決與策理。默建字標，除非徽載獨牌值。

敗：不確名本身辨否→試問：「消者於純文無徽下認此名否？」若是→提字標。若徽與牌識不可分→考分提字與 figurative 標。

### 五：擇提基

定申之法基（主為 USPTO）。

1. **用於商務——Section 1(a)**：
   - 標已於州際商務（US）或真實用（EU）
   - 須提示用樣（截、包、廣）
   - 登最速徑
2. **擬用——Section 1(b)**：
   - 標未用而申有真擬
   - 登前須 Statement of Use（加費、期）
   - 可於發前得先權
   - 時擴可得（至 36 月）
3. **外先權——Section 44(d)**：
   - 自末 6 月外提主張先權
   - **策**：先提 EUIPO（廉、快），後於 USPTO 主 44(d) 先權
   - 此使 US 提與 EU 同先權日
   - 須外申之證副
4. **外登——Section 44(e)**：
   - 基於外登（非僅申）
   - 提時無須 US 商務用（然終須用）
5. **Madrid 議擴——Section 66(a)**：
   - 經 Madrid 系指 US
   - 見八步 Madrid 細

得：提基已擇，時程與樣求已錄。用 EU 先策（EUIPO 後 44(d) 至 USPTO）時，6 月先權窗已排。

敗：無商務用且無外提待→USPTO 唯 Section 1(b) 可。計 Statement of Use 加費與期。EUIPO 提時無用求——擬聲足。

### 六：EUIPO 電提行

在線提 EU 商標申。

1. 航 EUIPO 電提門（euipo.europa.eu）：
   - 未登則建 EUIPO 帳
   - 已批 TMclass 詞用「Fast Track」（審快）
2. 填申表：
   - **申者細**：名、址、法式、籍
   - **代**：EU 申者可，非 EU 須
   - **標**：入字標或傳 figurative 標像
   - **商品與服務**：擇 TMclass 詞或入定述
   - **語**：EN、FR、DE、ES、IT 之選（需二語）
   - **先權主**：主先權時入外申號與日
3. 閱費要：
   - 1 類：850 EUR
   - 2 類：900 EUR（+50 EUR）
   - 3+ 類：900 EUR + 各增 150 EUR
   - **SME Fund（EUIPOIdeaforIP）**：中小企可主 75% 退
4. 在線付（卡、匯、或 EUIPO 戶）
5. 存提據含申號與提日

得：EUIPO 申已提並有確據。申號與提日已錄。用 Fast Track 審常月內畢。

敗：在線門拒提（技誤）→存截再試。商品/服務述拒→換已批 TMclass。付敗→申存草稿 30 日。

### 七：USPTO 提行

在線提 US 聯邦商標申。

1. 航 USPTO TEAS：
   - 擇 TEAS Plus（$250/類）或 TEAS Standard（$350/類）
   - TEAS Plus 需已批 ID Manual 詞；TEAS Standard 可自式述
2. **外申者求**：
   - 籍於 US 外者**必**任 US 律執照師
   - 師須為美州律協良員
   - 縱經 Madrid 議提亦此求
3. 填申表：
   - **申者信**：名、址、實類、籍/組之州
   - **師信**：名、律員、對信郵
   - **標**：入標字於標符或傳設標像
   - **商品與服務**：自 ID Manual 擇（TEAS Plus）或擬定（TEAS Standard）
   - **提基**：擇 Section 1(a)、1(b)、44(d)、44(e)（見五步）
   - **樣**（僅 1(a)）：傳示商務用之標
   - **聲**：以偽證之罰驗正
4. 付提費（$250 或 $350 每類）
5. 存提據含系號與提日

得：USPTO 申已提並得系號。提據已存。審常 8-12 月首局動。

敗：TEAS 拒提→閱誤信——常議：實類誤、缺樣（1(a)）、商品述不匹 ID Manual 詞（TEAS Plus）。外申無 US 師提→將拒。

### 八：Madrid 議擴

經 WIPO Madrid 系國際擴護。

1. **前提**：
   - 於源局之基標（申或登）
   - 申者須為 Madrid 成員國籍、住、或有實設
   - 基標須覆同或較窄商品/服務
2. 經源局提（非直 WIPO）：
   - **EUIPO 為源**：用 EUIPO Madrid 電提工
   - **USPTO 為源**：經 TEAS International Application 表提
3. 填 Madrid 申（MM2 表）：
   - **申者細**：須正匹基標持者
   - **標表**：須同基標
   - **商品與服務**：自基標規擇（可窄非廣）
   - **指契約方**：擇標國/區
   - **語**：英、法、或西
4. 算費：
   - 基費：653 CHF（黑白）或 903 CHF（色）
   - 補費：各類首後加 100 CHF
   - 個費：依指國異（察 WIPO 費計）
   - 常個費：US ~$400+/類、日 ~$500+/類、中 ~$150+/類
5. **中央攻依賴**：
   - 首 5 年國際登依基標
   - 基標撤（反對、不用）→諸指皆落
   - 5 年後各指獨立
   - 策：依賴期內盛護基標

得：Madrid 申已經源局提。指國已擇並錄費計。5 年依險已認並備基標護計。

敗：源局拒 Madrid 申（如與基標不匹）→正差重提。指國拒護→經 Madrid 系於指局期（常 12-18 月）內答。

### 九：提後監

經審追申並答動。

1. **EUIPO 監**：
   - 於 EU Trade Marks Bulletin Part A 布
   - **反對期**：布後 3 月（可加 1 月冷卻）
   - 無反對：登自動
   - 反對防：告後 2 月內提見
2. **USPTO 監**：
   - 常察 TSDR
   - **審師閱**：提後 8-12 月
   - **局動**：答期常 3 月（可加一次 $125）
   - **反對布**：30 日於 Official Gazette
   - **Statement of Use**（1(b)）：Notice of Allowance 後 6 月內提（可加至 36 月，每加 $125）
3. **Madrid 監**：
   - WIPO 告諸指局
   - 各局獨審（12-18 月窗）
   - 暫拒須經地局行答
4. **排諸期**：
   - 反對答期
   - Statement of Use 期（USPTO 1(b)）
   - 續期（EUIPO 10 年、USPTO 10 年、Madrid 10 年）
   - USPTO Section 8/71 Declaration of Use：5-6 年間
5. 監三方提混似標：
   - 設 TMview/TESS 察警於爾類之似標
   - 要牌考專商標察服
6. **擬答策**：若期近→擬反對答草

得：諸期已排並有提。申態經諸局在線系監。反對或局動答策已備。

敗：漏期或致命——多商標局期不可擴。漏期→察復或回是否可（USPTO 許不意之遲之復請）。EUIPO 漏反對期常終。

### 十：開源商標策

若標覆開源項→擬商標用策。

1. 察已立模：
   - **Linux Foundation**：許項名於事引用；徽限於持證者
   - **Mozilla**：細導別未改布與改建
   - **Rust Foundation**：廣許社用，特限商品
   - **Apache Software Foundation**：寬命策，限示官認
2. 定用類：
   - **Fair use**（恒許）：於文、閱、較、學文中以名引項
   - **社群/貢用**（廣許）：用群、會、教材、未改布
   - **Commercial use**（需證或限）：含軟之品、基項之服、認/容言
   - **Prohibited**：示官認、實改版無述之用、致混之域名
3. 擬商標策文：
   - 商標持明述
   - 何用無許可
   - 何用需書許
   - 如何求許（聯、程）
   - 誤用之果
4. 置策文於項庫：
   - 常位：`TRADEMARKS.md`、`TRADEMARK-POLICY.md`、或 `CONTRIBUTING.md` 節
   - 自 `README.md` 與項網鏈
5. 布策前登標：
   - 無登之商標策多不可執
   - 至少提前先登——「TM」立可用，「(R)」登後
6. **閱社反饋**：
   - 策宜於社閱期收意後完
   - 平護與開如 Rust 基會改之法

得：清、公商標策，護牌而啟健社用。策循已立開源基模且自項主文可取。

敗：若項無商標登或申→先提（六-八步）後擬策。未登標執力有限。若社抗策→察 Rust 基會之法——於社反饋後改，為平護與開之善模。

## 驗

- [ ] 提前衝察已畢並錄（一步）
- [ ] Nice 類已擇並有已批商品與服務述（二步）
- [ ] 述性於 Abercrombie 譜已估（三步）
- [ ] 標類已決並有策理（四步）
- [ ] 提基已擇並錄時程與樣求（五步）
- [ ] 至少於一標地已提申（六-八步）
- [ ] 提據已存含申號與提日
- [ ] 諸提後期已排並有提（九步）
- [ ] 商標察警已設於混似標（九步）
- [ ] 若適——開源商標策已擬（十步）

## 忌

- **無篩而提**：略 `screen-trademark` 直提→若有衝費廢。必先篩
- **誤提基**：標未用而主 1(a)→偽提。未發→用 1(b)
- **商品述過廣**：主不用或不擬用之商品→招不用撤銷（尤 EU 5 年後）
- **漏先權窗**：Section 44(d) 外先權須於首提後 6 月內主。漏則失先權日
- **忽外師求**：非 US 申無 US 師於 USPTO 提→將拒——2019 後硬規
- **Madrid 中央攻暴**：僅依 Madrid 指而不解 5 年依基標。基落→諸指皆落
- **無提後監**：提後忘。局動與反對期過，申棄
- **登前商標策**：未有至少待申而布策→損執。先提後擬策

## 參

- `screen-trademark` — 此提前必之衝篩
- `assess-ip-landscape` — 含商標域映之廣 IP 析
- `search-prior-art` — 適商標辨性研之先工尋法
