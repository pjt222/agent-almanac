---
name: file-trademark
locale: wenyan-lite
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

# 註商標

於 EUIPO（歐盟）、USPTO（美國）或 WIPO Madrid 協議（國際）註商標申請。此技涵實註程——自註前驗至註後監與開源商標策。假衝突篩已藉 `screen-trademark` 行之。

## 適用時機

- 衝突篩清後備註商標申請
- 於歐、美或國際註之策間擇
- 註歐盟商標並為後續美國註主張優先權
- 藉 Madrid 協議延既有國家標為國際
- 註後草擬開源商標使用政策
- 於審中回應 office action 或異議程序

## 輸入

- **必要**：待註之標（字、logo 或合）
- **必要**：商品與服務之述
- **必要**：目標管轄區（歐、美、國際或合）
- **必要**：申請人名與址
- **選擇性**：Screen-trademark 結果（衝突搜報告）
- **選擇性**：Logo 檔（若註圖形或合標）
- **選擇性**：優先權主張（6 月內於他管轄區之先前註）
- **選擇性**：商業使用之證（USPTO 1(a) 基需之）
- **選擇性**：開源項目語境（供步驟十之商標政策）

## 註費參考

| Office | 基費 | 每類 | 註 |
|--------|----------|-----------|-------|
| EUIPO | 850 EUR | +50 EUR（第二）、+150 EUR（第三起） | SME Fund：75% 回扣 |
| USPTO (TEAS Plus) | $250 | 每類 | 外國申請人需美國律師 |
| USPTO (TEAS Standard) | $350 | 每類 | 商品述更靈活 |
| Madrid Protocol | 653 CHF | 按國異 | 依基標 5 年 |

## 步驟

### 步驟一：註前檢

於投申請費前驗標可註。

1. 確 `screen-trademark` 已行：
   - 審衝突搜報告查相同或易混之標
   - 驗所有目標管轄區皆在篩中
   - 察篩為新（理想 30 日內）
2. 於官方資料庫行末衝突檢：
   - **EUIPO TMview**：跨所有歐盟成員國註冊搜
   - **WIPO Global Brand Database**：國際註
   - **USPTO TESS**：美國聯邦註（用結構搜：`"mark text"[BI]`）
   - **DPMAregister**：德國國家註（若註歐盟，覆最大歐盟市場）
3. 驗域名與社群媒體 handle 可得或已保：
   - 域名可得若受戰則強顯著性論
   - 相配之 handle 減消費者混淆險
4. 錄搜結果為**註前清查記錄**

**預期：** 確目標管轄區無阻之標。註前清查記錄錄勤審並支任未來異議辯。

**失敗時：** 若尋到衝突標，評其嚴：相同標 + 相同商品 = 勿註。相似標 + 相關商品 = 求律師就混淆可能性之見。若衝突僅限一管轄區，考慮僅於清之管轄區註。

### 步驟二：Nice 分類選

於 Nice 分類系識正之商品與服務類。

1. 用 TMclass 工具（tmclass.tmdn.org）識類：
   - 入商品/服務之述
   - TMclass 建多數 office 所接之協調用語
   - 用 TMclass 資料庫之預核用語減審延
2. 技術與軟體之常類：
   - **Class 9**：可下載之軟體、行動應用、計算機硬體
   - **Class 35**：廣告、企業管理、SaaS 平台管理
   - **Class 42**：SaaS、雲計算、軟體開發服務
   - **Class 38**：電訊、線上平台、訊息服務
3. 草擬商品與服務之述：
   - 具體至足以定實用但寬至容未來擴
   - TEAS Plus（USPTO）需 ID Manual 之用語——用預核用語
   - EUIPO 直接接 TMclass 協調用語
4. 衡成本與覆：
   - 每額外類加費（見上費表）
   - 於當前或欲用之類註
   - 過寬而無用之註或遭戰（尤於美）

**預期：** 確定之 Nice 類清單，各類有具體、預核之商品與服務述。述配實業務用。

**失敗時：** 若 TMclass 未建明匹，參 Nice 分類說明註（WIPO Nice 頁）。模糊之商品有時跨多類——於所有相關類註，勿險排除。

### 步驟三：顯著性評

察標可註或或遭顯著性反對。

1. 於 **Abercrombie 光譜**評標（美標準，廣施）：
   - **Generic**（通用）：商品之通名（如「計算機」之於計算機）——永不可註
   - **Descriptive**（描述）：直述質或特徵（如「QuickBooks」）——唯以次意可註
   - **Suggestive**（暗示）：暗示而不直述（如「Netflix」）——無次意可註
   - **Arbitrary**（任意）：於不相關語境用之實詞（如「Apple」之於電子）——強護
   - **Fanciful**（臆造）：造之詞（如「Xerox」）——最強護
2. 對 EUTMR 絕對理由檢（第 7(1) 條）：
   - Art. 7(1)(b)：缺顯著性
   - Art. 7(1)(c)：描述商品/服務之特徵
   - Art. 7(1)(d)：行業中慣用（於相關領域通用）
3. 若標邊緣描述：
   - 集已得顯著性之證（廣告花費、銷售數、消費者調查）
   - 考加顯著元素（logo、風格化）
   - 改字標以趨暗示或任意
4. 記評與理由

**預期：** 標於 Abercrombie 光譜分為暗示、任意或臆造——皆無次意可註。邊緣情以緩解策略標。

**失敗時：** 若標為描述或通用，勿註——將遭拒。重設計標以升顯著性光譜。若大量用歷史存，於美考 Section 2(f) 宣（已得顯著性），於歐考同之 Art. 7(3) EUTMR 宣。

### 步驟四：標類決

擇最護品牌之註類。

1. **字標**（標準字符）：
   - 護字本身，不論字體、色或樣式
   - 最寬護——覆任何視覺表
   - 不得含設計元素
   - 於品牌值居名非 logo 時最佳
2. **圖形標**（logo 或設計）：
   - 護特定視覺表
   - 較窄護——不覆他樣式之字
   - 於 logo 本身為主品牌識別時需之
   - 須提清之圖檔（JPG/PNG，EUIPO：最大 2 MB，最小 945x945 px）
3. **合標**（字 + logo 合）：
   - 護所註之特定組合
   - 較獨字標窄——限於特定組合
   - 常見但策略上次佳：若 logo 變，註或不覆新版
4. **策略建議**：
   - 先註字標（最寬護、最經濟）
   - 若 logo 有顯獨立品牌值方另註圖形標
   - 避合標，除非預算限阻另註

**預期：** 明之標類決，附策略理由。字標為預設之建議，除非 logo 攜獨立品牌值。

**失敗時：** 若不定名獨是否足顯著，以問測之：「消費者於純文字中，無 logo 可識此名否？」若是，註字標。若 logo 與品牌身分不可分，考慮分別註字與圖形標。

### 步驟五：註基選

定申請之法律基（主於 USPTO 相關）。

1. **商業使用 — Section 1(a)**：
   - 標已於州際商業（美）或真實使用（歐）使用
   - 須提 specimen 示標所用（截圖、包裝、廣告）
   - 至註之最速路
2. **欲用之意 — Section 1(b)**：
   - 標尚未用而申請人有 bona fide 用之意
   - 需 Statement of Use 於註前（附加費、期限）
   - 容於啟前保優先權
   - 有時限延（共至 36 月）
3. **外國優先權 — Section 44(d)**：
   - 自 6 月內之外國註主張優先權
   - **策**：先註 EUIPO（費低、速），後為 USPTO 主張 44(d) 優先權
   - 此予美國註與歐盟註同優先日
   - 需外國申請之證實副本
4. **外國註 — Section 44(e)**：
   - 以外國註（非僅申請）為基
   - 註時無需美國商業中之使用（但終須用）
5. **Madrid 協議延 — Section 66(a)**：
   - 藉 Madrid 系指美國
   - 詳見步驟八

**預期：** 註基已選，時間線與 specimen 需求已錄。若用歐盟-先策（EUIPO 後 44(d) 至 USPTO），6 月優先窗已錄於日曆。

**失敗時：** 若無商業使用且無外國註待中，Section 1(b)（欲用之意）為 USPTO 唯一選。計附加 Statement of Use 之費與期。於 EUIPO，註時無需用——意之宣即足。

### 步驟六：EUIPO 電子申請程

線上註歐盟商標申請。

1. 至 EUIPO 電子申請入口（euipo.europa.eu）：
   - 若未註，建 EUIPO 使用者帳
   - 於預核 TMclass 用語用「Fast Track」申請（審更速）
2. 填申請表：
   - **申請人詳**：名、址、法律形式、國籍
   - **代表**：歐盟申請人選擇性；非歐盟申請人必需
   - **標**：入字標文或上傳圖形標圖
   - **商品與服務**：選 TMclass 用語或入自定述
   - **申請語**：自 EN、FR、DE、ES、IT 擇（需第二語）
   - **優先權主張**：若主張則入外國申請號與日
3. 審費摘要：
   - 1 類：850 EUR
   - 2 類：900 EUR（+50 EUR）
   - 3+ 類：900 EUR + 每額外類 150 EUR
   - **SME Fund（EUIPOIdeaforIP）**：中小企業可求 75% 退費
4. 線上付（信用卡、銀行轉或 EUIPO 當前帳）
5. 保申請收據附申請號與申請日

**預期：** EUIPO 申請已註，附確認收據。申請號與申請日已錄。若用 Fast Track，審通常 1 月內成。

**失敗時：** 若線上入口拒註（技術錯），存截圖並再試。若商品/服務述遭拒，改用預核之 TMclass 用語。若付失敗，申請保為 30 日之草。

### 步驟七：USPTO 申請程

線上註美國聯邦商標申請。

1. 至 USPTO TEAS（Trademark Electronic Application System）：
   - 擇 TEAS Plus（$250/類）或 TEAS Standard（$350/類）
   - TEAS Plus 需預核 ID Manual 用語；TEAS Standard 容自由形式之述
2. **外國申請人之需**：
   - 域於美國外之申請人必任美國合格律師
   - 律師須為美國某州律師公會之會員且信譽良好
   - 此需即令藉 Madrid 協議申請亦適
3. 填申請表：
   - **申請人資訊**：名、址、實體類型、公民身份/組織州
   - **律師資訊**：名、公會會員、通訊電郵
   - **標**：以標準字符入字標或上傳設計標圖
   - **商品與服務**：自 ID Manual 擇（TEAS Plus）或草擬自定（TEAS Standard）
   - **申請基**：擇 Section 1(a)、1(b)、44(d) 或 44(e)（見步驟五）
   - **Specimen**（僅 1(a) 基）：上傳示標於商業中使用之物
   - **聲明**：以偽證罪罰驗正確
4. 付申請費（$250 或 $350 每類）
5. 保申請收據附序號與申請日

**預期：** USPTO 申請已註，序號已指。申請收據已保。審通常首 office action 需 8-12 月。

**失敗時：** 若 TEAS 系統拒註，審錯訊——常問題含誤實體類型、缺 specimen（於 1(a) 註）或商品述不配 ID Manual 用語（TEAS Plus）。若外國申請人無美國律師而註，申請將遭拒。

### 步驟八：Madrid 協議延

藉 WIPO Madrid 系延護為國際。

1. **前置**：
   - 於源辦公室有基標（申請或註）
   - 申請人須為 Madrid 成員國之國民、域於其或於其有真實有效之設立
   - 基標須覆同或更窄之商品/服務
2. 藉源辦公室註（非直接 WIPO）：
   - **EUIPO 為源**：用 EUIPO Madrid 電子申請工具
   - **USPTO 為源**：藉 TEAS International Application 表註
3. 填 Madrid 申請（MM2 表）：
   - **申請人詳**：須確配基標持有者
   - **標表**：須與基標同
   - **商品與服務**：自基標之規格擇（可窄不可寬）
   - **所指之 Contracting Parties**：擇目標國/區
   - **語**：英、法或西
4. 算費：
   - 基費：653 CHF（黑白）或 903 CHF（彩）
   - 補費：首類之外每類 100 CHF
   - 個別費：按所指國變（查 WIPO 費算器）
   - 常個別費：美 ~$400+/類、日 ~$500+/類、中 ~$150+/類
5. **中央攻擊依賴**：
   - 首 5 年，國際註依基標
   - 若基標遭撤（異議、不用），所有指定皆落
   - 5 年後，各指定獨立
   - 策：於依賴期護基標力

**預期：** Madrid 申請已藉源辦公室註。所指定之國已擇，費算已錄。5 年依賴險已識，基標護計已在。

**失敗時：** 若源辦公室拒 Madrid 申請（如與基標不配），修差並再註。若所指之國拒護，於所指辦公室之期限內（通常 12-18 月）藉 Madrid 系回應。

### 步驟九：註後監

於審中追申請並回應動作。

1. **EUIPO 監**：
   - 於歐盟商標公報 Part A 發布
   - **異議期**：自發布 3 月（可延 1 月冷靜期）
   - 若無異議：註自發
   - 異議辯：於通知後 2 月內提意見
2. **USPTO 監**：
   - 定期察 TSDR（Trademark Status and Document Retrieval）
   - **審查律師審**：申請後 8-12 月
   - **Office action**：回應期通常為 3 月（可一次延 $125）
   - **異議發布**：於 Official Gazette 30 日期
   - **Statement of Use**（1(b) 註）：必於 Notice of Allowance 後 6 月內註（可延共至 36 月，每延 $125）
3. **Madrid 監**：
   - WIPO 通知各所指辦公室
   - 各辦公室獨立審（12-18 月窗）
   - 暫時拒絕須藉本地辦公室之程回應
4. **排所有期限於日曆**：
   - 異議回應期限
   - Statement of Use 期限（USPTO 1(b)）
   - 續期限（EUIPO 10 年、USPTO 10 年、Madrid 10 年）
   - USPTO Section 8/71 使用聲明：於第 5-6 年間
5. 監第三方註相似之標：
   - 為爾類中之相似標設 TMview/TESS 監警
   - 於關鍵品牌考慮專業商標監服務

**預期：** 所有期限以提醒排於日曆。申請狀態藉各辦公室之線上系監。異議或 office action 回應策已預備。

**失敗時：** 失期可致命——多數商標辦公室期限不可延。若失期，察是否可復活或恢復（USPTO 容以petition復活為無意之延）。於 EUIPO，失之異議期通常為終。

### 步驟十：開源商標政策

若標覆開源項目則草擬商標使用政策。

1. 察已立模型：
   - **Linux Foundation**：容事實引用中用項目名；限 logo 於被授權者
   - **Mozilla**：詳指南分未改發行版與改建
   - **Rust Foundation**：容社群廣用，於商品具體限
   - **Apache Software Foundation**：容命名政策，限暗示背書
2. 定使用類：
   - **公平使用**（恒容）：於文章、評、比、學術論文中以名引項目
   - **社群/貢獻者使用**（廣容）：使用者群、會議、教材、未改發行版
   - **商業使用**（需授權或限）：含軟體之商品、基於項目之服務、認證/相容宣稱
   - **禁使用**：暗示官方背書、於大幅改版用而無披露、致混淆之域名
3. 草擬商標政策文檔：
   - 明商標擁有權之述
   - 何用無需許可
   - 何用需書面許可
   - 如何求許可（聯繫、程）
   - 誤用之後果
4. 置政策檔於項目倉庫：
   - 常位：`TRADEMARKS.md`、`TRADEMARK-POLICY.md` 或 `CONTRIBUTING.md` 之節
   - 自 `README.md` 與項目網站連之
5. 於發布政策前註標：
   - 多數情況下，無註之商標政策不可執
   - 至少於發布前註申請——"TM" 可立用，"(R)" 僅於註後用

**預期：** 明、公平之商標政策，護品牌而令健康之社群用可行。政策循已立之開源基金會模型並可自項目主文檔及。

**失敗時：** 若項目無商標註或申請，先註（步驟六至八）再草擬政策。未註之標可執性有限。若社群反對政策，察 Rust Foundation 之法——其於社群回饋後修訂，被視為平衡保護與開放之善模。

## 驗證清單

- [ ] 註前衝突檢已成並錄（步驟一）
- [ ] Nice 類已擇，附預核商品與服務述（步驟二）
- [ ] 顯著性於 Abercrombie 光譜已評（步驟三）
- [ ] 標類已決，附策略理由（步驟四）
- [ ] 註基已擇，時間線與 specimen 需求已錄（步驟五）
- [ ] 申請於至少一目標管轄區已註（步驟六至八）
- [ ] 申請收據已保，附申請號與申請日
- [ ] 所有註後期限以提醒排於日曆（步驟九）
- [ ] 為相似之標已配商標監警（步驟九）
- [ ] 若適用則已草擬開源商標政策（步驟十）

## 常見陷阱

- **無篩即註**：略 `screen-trademark` 而直註，若有衝突標則浪費用。恒先篩
- **誤註基**：當標尚未用時宣商業使用（1(a)）致詐註。若未啟則用欲用之意（1(b)）
- **商品述過寬**：宣爾不用或不欲用之商品與服務招不用之撤（尤於歐 5 年後）
- **失優先窗**：Section 44(d) 之外國優先權須於首註之 6 月內主張。失此窗失前優先日
- **忽外國律師之需**：非美國申請人於 USPTO 無美國合格律師而註，申請將遭拒——2019 以來為硬則
- **Madrid 中央攻擊暴露**：獨倚 Madrid 指定而不解 5 年依基標。基標若落，所有指定隨之落
- **無註後監**：註申請而忘之。Office action 與異議期限過，申請遭棄
- **註前之商標政策**：發布商標政策而無至少一申請待中削可執性。先註，再草擬政策

## 相關技能

- `screen-trademark` — 須於此註程之前行之衝突篩
- `assess-ip-landscape` — 含商標景映之更廣 IP 景分析
- `search-prior-art` — 適於商標顯著性研究之先前工作搜方法
