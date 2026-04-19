---
name: check-relocation-documents
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Verify document completeness for each bureaucratic step of an EU/DACH
  relocation, flagging missing items and translation requirements. Use after
  creating a relocation plan and before beginning bureaucratic procedures, when
  preparing for a specific appointment (Buergeramt, Finanzamt), when unsure
  which documents need certified translation or apostille, after receiving a
  rejection or request for additional documents, or as a periodic check during
  the relocation process to ensure nothing has been overlooked.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: intermediate
  language: natural
  tags: relocation, documents, checklist, verification, translation
---

# 查驗遷居文件

核驗 EU/DACH 遷居每一官僚步驟所需文件齊備、有效、備妥，生成可執行之缺項清單與翻譯需求。

## 適用時機

- 遷居計劃既定，尚未啟動官僚流程
- 為特定預約備料（Buergeramt、Finanzamt、保險局）
- 不明某文件是否需公證翻譯或加簽（Apostille）
- 收到當局駁回或補件要求後
- 家庭成員國籍不同，需分途備件
- 遷居途中定期覆核，以防遺漏

## 輸入

### 必要

- **遷居計劃**：plan-eu-relocation 技能或同等物之產出，列明所有官僚步驟
- **目的國**：德國、奧地利、瑞士或其他歐盟國
- **國籍**：家庭所有成員
- **文件清單**：現持文件（正本與副本）

### 選擇性

- **原籍國**：以判定需加簽或海牙公約認證之文件
- **僱傭合約**：以判定僱主提供之文件（如 Arbeitgeberbescheinigung）
- **現有文件語種**：以識別翻譯需求
- **先前遷居經驗**：既往歐盟登記可簡化程序
- **特殊情形**：受認可難民、EU Blue Card 持有人、派遣工（文件要求各異）

## 步驟

### 步驟一：列出所有官僚步驟

自遷居計劃抽取每一登記、申辦、通報步驟。

1. 解析遷居計劃，列出所有需遞件之行動項目
2. 按主管機關類別分組：
   - 戶政登記處（Buergeramt、Meldeamt、Einwohnerkontrolle）
   - 稅務機關（Finanzamt）
   - 健保提供者（Krankenkasse、OeGK、瑞士保險商）
   - 社會保險局（Rentenversicherung、Sozialversicherung、AHV）
   - 外國人管理局（Auslaenderbehorde，若適用）
   - 銀行與金融機構
   - 學校與幼兒托育
   - 車輛登記（Kfz-Zulassungsstelle）
   - 其他（寵物入境、執業資格認可）
3. 依遷居計劃之依賴鏈排序
4. 標註共用同一文件之步驟（以免重複備件）

**預期：** 以編號列出所有官僚步驟，分類排序，並註明共用文件。

**失敗時：** 遷居計劃不全或缺席時，依目的國官方遷居清單構建步驟表（如德國：make-it-in-germany.com；奧地利：migration.gv.at；瑞士：ch.ch/en/moving-switzerland）。

### 步驟二：逐步驟對應所需文件

對每一官僚步驟，列出當局所需之每份文件。

1. 戶籍登記（Anmeldung/Meldezettel）：
   - 有效護照或國民身分證（全體家庭成員）
   - Wohnungsgeberbestaetigung／租約／房契
   - 結婚證書（若以夫妻身分登記）
   - 出生證書（子女）
   - 前次登記證明（若在國內遷徙）
2. 稅務登記：
   - 戶籍登記證明（Meldebestaetigung/Meldezettel）
   - 僱傭合約或營業登記
   - 原籍國稅號（跨境協調用）
   - 結婚證書（德國稅級判定用）
3. 健保投保：
   - 僱傭合約或自營證明
   - 前次保險證明或 EHIC（歐洲健保卡）
   - S1 表（派遣工或跨境情形）
   - 戶籍登記證明
4. 社會保險協調：
   - A1 可攜式文件（派遣工）
   - E-表或 S-表（給付轉移）
   - 就業歷程資料
   - 原籍國社會保險號
5. 開立銀行帳戶：
   - 有效護照或國民身分證
   - 戶籍登記證明
   - 收入證明（僱傭合約或近期薪資單）
   - 稅號或 Steueridentifikationsnummer（德國）
6. 移民／居留許可（非歐盟國民）：
   - 有效護照，剩餘效期至少六月
   - 生物識別照（格式因國而異）
   - 僱傭合約或聘用信
   - 財力證明
   - 健保證明
   - 大學學位與認可（EU Blue Card 用）
   - 無犯罪紀錄證明（或需加簽）
7. 車輛重新登記：
   - 車輛登記文件（Fahrzeugbrief/Zulassungsbescheinigung Teil II）
   - 保險證明（德國 eVB 號）
   - TUeV／Pickerl／MFK 檢驗證
   - 戶籍登記證明
8. 學校／托育登錄：
   - 出生證書
   - 疫苗紀錄（Impfpass）
   - 前校成績單與翻譯
   - 戶籍登記證明

**預期：** 一張矩陣，對應每一官僚步驟之所需文件，並註明規格（需正本、可副本、需公證翻譯）。

**失敗時：** 某步驟要求不明時，逕查當局官網或致電服務專線。要求屢有更動，勿獨恃逾十二月之第三方指南。

### 步驟三：核對現有文件狀態

比對所需文件與現有清單，識別缺口。

1. 對每份所需文件，分級：
   - **有（正本）**：正本在手，可即取用
   - **有（僅副本）**：僅存副本；或需調閱正本
   - **過期**：文件存在但效期已過
   - **缺**：不存在，須取得
   - **不適用**：本案不需此件
2. 「有（正本）」者，核驗：
   - 文件未損毀、可辨識
   - 各文件姓名一致（留意音譯差、本姓、中間名）
   - 使用時尚在效期內（護照、身分證、保險卡）
3. 過期者，判定：
   - 發證機關之換發處理時間
   - 過期文件是否暫可接受（多半不可）
   - 換發費用
4. 缺件者，判定：
   - 發證機關及其處理時間
   - 取得該件所需之佐證文件（遞迴檢查）
   - 費用與付款方式
   - 可否遠端申辦或須親赴
5. 凡姓名不符者（如護照用本姓、結婚證書用夫姓），標記之——多半需額外說明或改名證明

**預期：** 每份所需文件之狀態表：狀態（有／僅副本／過期／缺／不適用）、效期、問題註記。

**失敗時：** 文件狀態無法確認（如存於倉庫或他人處）時，標為「未確認」，規劃上視為潛在缺件。

### 步驟四：識別翻譯與加簽需求

判定何文件需公證翻譯、加簽或其他認證。

1. 查核目的國語言要求：
   - 德國：文件須以德文出具或附公證翻譯
   - 奧地利：同德國；部分機關接受歐盟文件之英文版
   - 瑞士：因邦而異（德語、法語、義語或羅曼語區）
2. 識別免譯文件：
   - 歐盟多語標準格式表（Regulation 2016/1191），用於歐盟成員國間出生、結婚、死亡等民事文件
   - 護照與國民身分證（普世接受，免譯）
   - EHIC（歐洲健保卡）
3. 需翻譯者：
   - 須由宣誓／公證譯者（beeidigter Uebersetzer）出具
   - 譯者須於目的國認證（非原籍國）
   - 常見周期：三至十個工作日
   - 費用：每頁 30-80 歐元，視語對與繁簡而定
4. 判定加簽或認證要求：
   - 來自海牙公約國之文件：由發證國主管機關加簽
   - 非海牙國文件：全鏈認證（當地公證、外交部、使館）
   - 歐盟內部文件：常依歐盟法規免加簽，但按件別核驗
   - 瑞士為海牙公約成員但非歐盟成員；規則有別
5. 查核目的國是否接受電子加簽
6. 部分文件需加簽兼公證翻譯（加簽本身亦可能需譯）

**預期：** 一張翻譯／認證矩陣，列明每份文件：需譯否、需加簽否、估計費用、估計處理時間。

**失敗時：** 某文件是否需加簽不明時，逕洽目的國當局。備而不用（多辦一份加簽）勝於用時方缺（預約當場被拒）。

### 步驟五：生成行動清單

匯整所有發現為具優先序、含截止日之行動清單。

1. 合併所有缺口（缺件、過期、需譯、需加簽）為單一行動表
2. 每項行動記錄：
   - 文件名
   - 所需行動（取得、換發、翻譯、加簽、替換）
   - 發證機關或服務商
   - 估計處理時間
   - 估計費用
   - 截止日（由遷居時程中首次需用此件推得）
   - 優先級（critical／high／medium／low）
3. 優先級依據：
   - **Critical**：阻擋首步官僚流程（如 Anmeldung 所需護照）或有不可協商之截止日
   - **High**：抵達後兩週內需用；處理時間長
   - **Medium**：首月內需用；處理時間合理
   - **Low**：終將需用；無即刻壓力
4. 排序：
   - 首先：Critical 項按最長處理時間排序（先行啟動）
   - 其次：High 項按截止日排序
   - 末尾：Medium 與 Low
5. 試算所有文件備置之總費用
6. 為每次預約之日加一張「文件夾」檢核表，逐項列明應攜之正本、副本、譯件

**預期：** 一張含截止日、費用、處理時間之優先行動表，並為每次預約附文件攜帶清單。

**失敗時：** 處理時間不確（官僚效率慢之國常見）時，用最壞估值並儘早啟動。標註可加急者及其額外費用。

## 驗證

- 遷居計劃之每一官僚步驟皆對應至少一份文件
- 無文件列為「狀態不明」——皆須確認為有／缺／過期／不適用
- 翻譯要求援引目的國官方語言規定
- 加簽要求已依發證國之海牙公約成員資格查核
- 行動表截止日與 plan-eu-relocation 之時程一致
- 優先級分派一致（無「low」項阻擋「critical」步）
- 總費用已試算並呈列
- 前三個官僚步驟皆已生成專屬文件檢核表

## 常見陷阱

- **誤以為歐盟文件不需備置**：歐盟法規雖簡化跨境文件接受，惟多數機關仍要求翻譯，部分歐盟國間仍需加簽
- **各文件姓名不符**：非拉丁字音譯差異、本姓與夫姓混用、中間名不一致——為預約被拒最常見之因
- **僅恃影本**：DACH 多數當局需驗正本並留存公證副本；即使以為副本足用，仍應攜正本
- **譯件訂得太晚**：宣誓譯者常積案一至二週，遷居高峰（八、九月）更甚
- **遺漏譯本上之加簽**：部分當局要求原件加簽與加簽件之公證譯本二者皆備
- **未查文件效期**：剩二月效期之護照，若當局要求剩餘效期六月，恐遭拒
- **忽略歐盟多語格式表**：歐盟國間民事文件，發證機關提供之多語標準表可全免翻譯——惟須明確索取
- **誤以為可收電子文件**：DACH 多數政府機關仍要求實體文件；僅以 PDF 列印之電子文件未必獲受，或需額外驗證

## 相關技能

- [plan-eu-relocation](../plan-eu-relocation/SKILL.md) —— 建立遷居計劃，供本文件檢核依據
- [navigate-dach-bureaucracy](../navigate-dach-bureaucracy/SKILL.md) —— 針對所需文件對應之程序之詳細指引
