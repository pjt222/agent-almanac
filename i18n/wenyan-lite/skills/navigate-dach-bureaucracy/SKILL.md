---
name: navigate-dach-bureaucracy
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Step-by-step guidance for DACH-specific governmental procedures including
  Anmeldung, Finanzamt registration, health insurance enrollment, and social
  security coordination. Use after arriving in a DACH country and needing to
  complete mandatory registrations, before a specific appointment to understand
  what to expect, when an initial registration attempt was rejected, when
  transitioning between DACH countries, or when handling registrations for
  dependents alongside your own.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: advanced
  language: natural
  tags: relocation, dach, germany, austria, switzerland, anmeldung, finanzamt
---

# 應對 DACH 政府事務

逐步指引以完成德、奧、瑞三國之政府程序，涵蓋居住登記、稅務設定、健保註冊、社會保險協調，及其他要登記。

## 適用時機

- 抵 DACH 國後須完成強制登記
- 約聘前欲明所期，預作準備
- 初次登記受拒，須明因並修正之
- 於 DACH 國間轉移（如德至瑞），須明其異
- 雇主人資指引不全
- 為家屬（配偶、子女）連同自身辦理登記

## 輸入

### 必要

- **目的國**：德、奧或瑞
- **城市/市鎮**：具體位置（程序因地而異，瑞士尤因州別而不同）
- **國籍**：歐盟/歐洲經濟區公民、瑞士公民或非歐盟人（決定許可需求）
- **就業狀態**：受僱、自僱、自由業、學生、退休或失業
- **居所證明**：簽署之租約、轉租協議或產權證明

### 選擇性

- **遷移計劃**：plan-eu-relocation 之輸出，以對齊時程
- **文件清單**：check-relocation-documents 之輸出，以驗備齊
- **雇主人資聯絡**：用於雇主協助之登記步驟
- **德/法/意語水準**：影響可用通訊管道與表單
- **先前 DACH 居住**：先前登記或可簡化程序
- **州別（限瑞士）**：瑞士所必；決定眾多程序細節
- **約聘日期**：若已預約，量身備之

## 步驟

### 步驟一：辨適用程序

依目的國、國籍與個人狀況，明所適之政府程序。

1. 德國標準程序集：
   - Anmeldung（居住登記）於 Buergeramt/Einwohnermeldeamt——強制
   - Steueridentifikationsnummer（稅號）發放——Anmeldung 後自動
   - Steuerklasse（稅級）擇取——已婚則須，否則自動指派
   - Krankenversicherung（健保）註冊——強制
   - Sozialversicherung（社會保險）註冊——透過雇主或自辦
   - Rundfunkbeitrag（廣播費）登記——每戶強制
   - 銀行開戶——日常生活實際所必
2. 奧地利標準集：
   - Meldezettel（登記表）於 Meldeamt 提交——3 日內強制
   - Anmeldebescheinigung（歐盟公民）或 Aufenthaltstitel（非歐盟）——4 個月內
   - Steuernummer 由 Finanzamt 發——用於受僱或自僱
   - e-card 透過 Sozialversicherung 註冊——透過雇主或自辦
   - GIS（廣播費）登記——每戶強制
   - 銀行開戶
3. 瑞士標準集：
   - Anmeldung 於 Einwohnerkontrolle/Kreisbuero——14 日內強制
   - Aufenthaltsbewilligung（居留許可 B 或 L）——透過雇主或州
   - AHV-Nummer（社會保險號）發放
   - Krankenversicherung（強制基本健保）——3 個月內
   - Quellensteuer 或一般稅務安排——視許可與收入而定
   - Bank/PostFinance 開戶
   - Serafe（廣播費）登記——每戶強制
4. 加條件性程序：
   - 車主：於 Kfz-Zulassungsstelle / Strassenverkehrsamt 重新登記
   - 寵物主：於地方當局登記、獸醫檢查
   - 家庭：Kindergeld/Familienbeihilfe/Kinderzulage 申請
   - 自由業/自僱：Gewerbeanmeldung / 行業登記
   - 非歐盟國民：Aufenthaltstitel/Niederlassungsbewilligung 申請
5. 製所適程序之檢核表，連同法定期限

**預期：** 為特定國家、城市、國籍與就業組合製作個人化之檢核表，附期限。

**失敗時：** 若諸因子組成異常情況（如瑞士某州有特別雙邊協議下之自僱非歐盟人），徑詢州移民局或 Auslaenderbehorde 後再行。

### 步驟二：備 Anmeldung / Meldeamt 登記

完居住登記，此乃解鎖後續諸程序之基礎。

1. **德國（於 Buergeramt 之 Anmeldung）**：
   - 於市府 Buergeramt 網站線上預約（柏林：service.berlin.de；慕尼黑：muenchen.de/rathaus；其他：查市府網站）
   - 若無可用約，查免預約時段（Buergeramt ohne Termin）或試小型衛星辦事處
   - 備文件：
     - 有效護照或身分證（正本）
     - Wohnungsgeberbestaetigung（房東確認表——房東須填並簽）
     - 已填之 Anmeldeformular（登記表，線上或於辦事處可得）
     - 配偶登記之結婚證書（必要時附經認證之德文翻譯）
     - 子女出生證書（必要時附經認證之德文翻譯）
   - 約聘時：
     - 早 10 分鐘到，攜所有正本
     - 職員處理登記並發 Meldebestaetigung（登記確認）
     - 索額外經認證之 Meldebestaetigung 副本（銀行、保險等所必）
     - 詢 Steueridentifikationsnummer——將於 2-4 週內郵至登記地址
   - 期限：搬入（租約之 Einzugsdatum，非抵德日）後 14 日內

2. **奧地利（於 Meldeamt 之 Meldezettel）**：
   - 多數城市無需預約；辦公時間直入
   - 備文件：
     - 有效護照或身分證（正本）
     - 已填之 Meldezettel 表（可自 help.gv.at 下載或於辦事處取）
     - Meldezettel 須由房東/住所提供者（Unterkunftgeber）簽
   - 於辦事處：
     - 提交表；通常即時處理
     - 領蓋章之 Meldebestaetigung
   - 期限：搬入（Bezug der Unterkunft）後 3 日內
   - 歐盟公民：4 個月內於 MA 35（維也納）或 BH（其他地區）申 Anmeldebescheinigung

3. **瑞士（於 Einwohnerkontrolle 之 Anmeldung）**：
   - 查 Gemeinde（市鎮）網站之辦公時間及是否需預約
   - 備文件：
     - 有效護照（正本）
     - 租約或居所證明
     - 僱用合約或財力證明
     - 生物特徵護照照（同步申請居留許可之用）
     - 結婚/出生證書（如適用）
     - 健保確認（若已註冊）
   - 於辦事處：
     - 登記居住，並同時申居留許可（Aufenthaltsbewilligung）
     - 歐盟/EFTA 公民：受僱通常得 B 證（Aufenthaltsbewilligung B）
     - 將領確認及 AHV 號之資訊
   - 期限：14 日內（因州而異；某些州要求開工前登記）

**預期：** 居住登記完成，手持 Meldebestaetigung/Meldezettel，並知後續步驟。稅號流程啟動（德國：自動；奧/瑞：下一步）。

**失敗時：** 常見拒因與修正：
- 缺 Wohnungsgeberbestaetigung：即聯絡房東；某些辦事處現場提供表，由房東後填（罕見）
- 房東拒簽：德國中此違法（BMG 第 19 條）；引法要求遵之；最後手段，告知 Buergeramt
- 無可用約：試鄰區/市鎮、清晨免約排隊或線上取消候補
- 護照與租約姓名不符：攜額外身分或聲明說明差異

### 步驟三：辦稅務登記

設稅務識別，並擇稅級或安排稅款扣繳（如適用）。

1. **德國（Finanzamt / Steuer-ID）**：
   - Anmeldung 後 Steueridentifikationsnummer 自動產生並於 2-4 週內郵寄
   - 若未收到，線上或電話聯絡 Bundeszentralamt fuer Steuern（BZSt）
   - 受僱：將 Steuer-ID 給雇主用於薪資稅扣繳（Lohnsteuer）
   - 已婚：訪 Finanzamt 擇 Steuerklasse 組合（III/V 或 IV/IV）
   - 自僱/自由業：以 Fragebogen zur steuerlichen Erfassung（稅務登記問卷，透過 ELSTER 線上門戶）於地方 Finanzamt 註冊
   - 時程：Steuer-ID 抵前，雇主可用緊急稅務程序（Pauschalbesteuerung）

2. **奧地利（Finanzamt / Steuernummer）**：
   - 受僱者：雇主辦稅務登記；透過雇主薪資流程獲 Steuernummer
   - 自僱：以 Erklaerung zur Vergabe einer Steuernummer 表於主管 Finanzamt 註冊
   - 奧地利稅號與 Sozialversicherungsnummer 不同
   - FinanzOnline 門戶（finanzonline.bmf.gv.at）一旦註冊即可線上存取

3. **瑞士（Quellensteuer 或 ordentliche Besteuerung）**：
   - B 證持有人收入低於 CHF 120,000：適用 Quellensteuer（源頭扣繳稅）
   - B 證持有人收入逾 CHF 120,000 或 C 證持有人：ordentliche Besteuerung（定期稅務評估）
   - 雇主自動扣 Quellensteuer
   - 視州與收入而定，或須報 Steuererklaerung（稅務申報）
   - 自僱：於州 Steueramt 註冊
   - 跨境工作者：依雙邊稅務條約特殊規則（特別是法、德邊境）

4. 各國皆然：通知原國稅務當局離境及新稅務居所，免重複課稅

**預期：** 稅號已得或流程啟動，雇主已通知，並完所需稅務登記。

**失敗時：** 若稅號延遲（德國），或雇主無稅號不能處理薪資，徑聯絡 Finanzamt/BZSt 並請加速。雇主有緊急扣繳程序，然初期扣款較高，後再修正。

### 步驟四：註冊健保

完目的國強制健保註冊。

1. **德國（Krankenversicherung）**：
   - 自就業或居住第一日起健保強制
   - 兩制：gesetzliche Krankenversicherung（GKV，公/法定）或 private Krankenversicherung（PKV）
   - GKV：擇 Krankenkasse（如 TK、AOK、Barmer、DAK）；有僱用合約則註冊直易
   - PKV：唯有收入逾 Versicherungspflichtgrenze（門檻，2025 年約 69,300 EUR/年）或自僱/公務員方可
   - 所需文件：僱用合約、護照、Meldebestaetigung，或歐盟健保表（S1 或 EHIC）
   - Krankenkasse 於 2-4 週內發電子健保卡（eGK）；過渡期保險確認即時
   - 無收入家屬於 GKV 之 Familienversicherung 下免費覆蓋

2. **奧地利（Krankenversicherung / e-card）**：
   - 受僱者於僱用登記後自動透過 Sozialversicherung 投保
   - 雇主將你登記至主管保險方（通常 OeGK——Oesterreichische Gesundheitskasse）
   - 2-3 週內以郵獲 e-card（保險卡）
   - 自僱：於 SVS（Sozialversicherungsanstalt der Selbstaendigen）註冊
   - 非受僱歐盟公民：須示健保覆蓋以辦 Anmeldebescheinigung

3. **瑞士（obligatorische Krankenversicherung）**：
   - 基本健保（Grundversicherung/OKP）對所有居民強制
   - 自登記起 3 個月擇保險方；覆蓋追溯至登記日
   - 於 priminfo.admin.ch（官方保費比較工具）比保費
   - 擇免賠額（Franchise）：CHF 300 至 CHF 2,500；高免賠 = 低保費
   - 基本保險依法各方相同；唯保費與服務不同
   - 選擇性：補充保險（Zusatzversicherung）涵牙、替代醫學、私立病房
   - 文件：居留許可確認，或補充保險之醫療問卷

4. 各國皆然：若有原國 S1 表（如外派工），呈於目的國保險方以協調國間費用

**預期：** 健保註冊已確認，過渡期覆蓋文件在手，健保卡已訂/收。

**失敗時：** 若註冊延遲或被拒：
- 過渡期覆蓋：以原國 EHIC 急救，或購短期國際健保
- PKV（德國）拒：GKV 不可拒；改 GKV 註冊
- 遲延（瑞士）：追溯保費加附加費（Praemienzuschlag）至 50%，最長 3 年；無論遲與否即註冊

### 步驟五：設社會保險協調

確社會保險繳費與權益於原國與目的國之間妥當協調。

1. **辨適用之社會保險制**：
   - 歐盟法規 883/2004 規範歐盟/EEA/瑞士間之社會保險協調
   - 通則：於工作國投保（lex loci laboris）
   - 例外：外派工（保留原國制度，附 A1 表）、跨國工、邊境工
   - 瑞士透過雙邊協議參與歐盟社會保險協調

2. **目的國標準受僱**：
   - 透過雇主薪資系統自動登記
   - 德國：繳 Rentenversicherung（年金）、Arbeitslosenversicherung（失業）、Pflegeversicherung（長照）、Krankenversicherung（健康）
   - 奧地利：繳 Pensionsversicherung、Arbeitslosenversicherung、Krankenversicherung、Unfallversicherung（事故）
   - 瑞士：繳 AHV/IV/EO（一級年金）、BVG（二級職業年金）、ALV（失業）

3. **外派工（續用原國制度）**：
   - 於開工前自原國社會保險機構取 A1 可攜文件
   - 將 A1 呈於目的國雇主與當局
   - A1 至 24 個月有效；特殊情況可延
   - 無 A1，目的國或要求全額繳費

4. **可彙總期間（合多國保險期間）**：
   - 自原國請保險期間聲明（用 P1/E205 表）
   - 此等期間計入目的國年金權益
   - 各國按比例支付年金（pro-rata 計算）

5. **自僱者**：
   - 德國：自願 Rentenversicherung 或某些職業強制；私年金備選
   - 奧地利：強制 SVS 註冊涵年金、健康、事故
   - 瑞士：強制 AHV 繳費；自僱者 BVG 自願

6. **跨境社會保險之諮詢處**：
   - 德國：Deutsche Rentenversicherung（DRV），尤其其國際部
   - 奧地利：Dachverband der Sozialversicherungstraeger
   - 瑞士：日內瓦之 Zentrale Ausgleichsstelle（ZAS）
   - 原國：主管社會保險機構

**預期：** 透過雇主或自註冊確認社會保險登記，A1 表已取（如適用），先前保險期間已記，供未來彙總。

**失敗時：** 若海外開工前未取 A1，可追溯申（可行但複雜）。若多國工作使社會保險義務不明，依法規 883/2004 之第 16 條程序，請主管當局正式裁定。

### 步驟六：辦其他登記

完日常生活所必之強制與實用登記。

1. **銀行開戶**：
   - 德國：多數傳統銀行需 Meldebestaetigung；網路銀行（N26、Vivid 等）或不需
   - 奧地利：類似要求；Erste Bank、Raiffeisen 等需 Meldezettel
   - 瑞士：PostFinance 易得；傳統銀行或需居留許可
   - 各國皆然：攜護照、Meldebestaetigung、僱用合約及稅號（若已得）
   - 若語言為障，考慮有英語支援之銀行

2. **廣播費（Rundfunkbeitrag / GIS / Serafe）**：
   - 德國：於 rundfunkbeitrag.de 登記；每戶 18.36 EUR/月；無關設備所有權
   - 奧地利：於 GIS（gis.at）登記；因邦而異；有可收聽設備則強制
   - 瑞士：於 Serafe（serafe.ch）登記；每戶強制無關設備
   - 居住登記通常自動觸發此登記，然當驗

3. **手機/網路**：
   - 預付 SIM：電子店或超市即得；激活需護照（依歐盟登記要求）
   - 合約：通常需銀行帳戶與 Meldebestaetigung；費率較好但 12-24 個月綁約
   - 網路/寬頻：早訂，安裝可能 2-6 週；查當地供應商

4. **駕照**：
   - 歐盟駕照：德、奧免轉換；瑞士 12 個月內須轉換
   - 非歐盟駕照：德國允用 6 個月，後須轉換或重考；奧、瑞類似然時程不同
   - 轉換：依原國雙邊協議或須理論及/或實務考
   - 於 Fuehrerscheinstelle / Strassenverkehrsamt 申

5. **寵物登記（如適用）**：
   - 德國：於地方 Steueramt 登記犬（Hundesteuer）；費率因市而異；某些品種受限
   - 奧地利：於 Magistrat 登記犬；Hundehaltung 規則因邦而異
   - 瑞士：於州獸醫局登記犬；初次飼主強制犬訓課

6. **教會稅（德國及瑞士部分）**：
   - 德國：若登記為天主教、新教或猶太教徒，Kirchensteuer（所得稅之 8-9%）自動扣
   - 避之：於 Amtsgericht 或 Standesamt 正式退教（Kirchenaustritt）（費 20-35 EUR，視邦而定）
   - 奧地利：教會貢獻由教會獨立收（不經稅務局）

7. **Kindergeld / Familienbeihilfe / Kinderzulage（如適用）**：
   - 德國：於 Familienkasse（Bundesagentur fuer Arbeit 之屬）申；目前每子 250 EUR/月
   - 奧地利：於 Finanzamt 申；Familienbeihilfe 因子女年齡而異
   - 瑞士：透過雇主申；Kinderzulage 因州而異（最低 CHF 200/月）

**預期：** 諸額外登記已完或啟動，確認文件歸檔，未決事項記跟進日期。

**失敗時：** 多數額外登記非緊急（廣播費除外，可能追溯收費）。優先銀行帳戶與手機，日常所必。其他可於前 1-3 個月內完成。

## 驗證

- 居住登記（Anmeldung/Meldezettel）於各國法定期限內完成
- 手持 Meldebestaetigung 或同等確認文件
- 稅務登記已啟動（德國自動；奧地利雇主驅動；瑞士視州而定）
- 健保註冊已確認，至少有過渡期覆蓋文件
- 社會保險身分已釐清（目的國制度或 A1 涵蓋之原國制度）
- 所有強制家庭登記（廣播費）已完或排程
- 每完成步驟皆有日期確認文件，存於專用搬遷資料夾
- 任何被拒或不完整之登記皆有具體後續行動與日期

## 常見陷阱

- **德國免預約即至**：許多德國 Buergeraemter 僅約聘；務先線上查並預訂
- **錯過奧地利 3 日期限**：Meldezettel 期限極緊；可能搬入當日即遞
- **時間壓力下選健保**：德國 Krankenkasse 之選舉足輕重（補充福利不一）；瑞士同等基本覆蓋之保費於各保險方差距大；費時比之
- **忽略瑞士 Quellensteuer/ordentliche Besteuerung 之分**：誤之影響報稅方式，或致少繳或多繳
- **首週不攜文件**：首月攜護照、Meldebestaetigung、僱用合約、保險確認之正本；屢需之
- **以為雇主辦一切**：雇主通常辦薪資登記、社會保險，有時健保，然居住登記、銀行、廣播費及多數其他步驟為己責
- **忘德國教會稅退出**：許多新到者不知 Anmeldung 中宣告宗教即觸發 Kirchensteuer；可達所得稅 8-9%
- **延遲開戶**：無本地帳戶，薪資、租金扣繳、保險繳費皆難；首週開戶
- **不存確認號與參考 ID**：每次辦事生 Aktenzeichen、Geschaeftszahl、Dossiernummer；即記之，後續查詢所必
- **以瑞士健保規則套德國或反之**：DACH 三國健保制度根本不同；勿假其可移轉

## 相關技能

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) -- 製定整體搬遷計劃與時程
- [check-relocation-documents](../check-relocation-documents/SKILL.md) -- 啟動程序前驗所有文件
